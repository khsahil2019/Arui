import { Router } from 'express';
import { query } from '../../db/index.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Canonical domain names lookup
const DOMAIN_NAMES: Record<string, string> = {
  D01: 'Institutional Strategy, Foresight & AI Direction',
  D02: 'Governance, Responsible AI & Institutional Risk',
  D03: 'Human Capability, Cognitive Readiness & AI-Ready Education',
  D04: 'Curriculum & Programme Future Resilience',
  D05: 'Faculty Capability & Academic Workforce Transformation',
  D06: 'Student Capability, Agency & Future Readiness',
  D07: 'Learning, Assessment & Evidence of Capability',
  D08: 'Digital, Data & Institutional Intelligence',
  D09: 'Employability, Industry & Economic Relevance',
  D10: 'Research, Innovation & Knowledge Creation',
  D11: 'Institutional Adaptability & AI Resilience',
};

// Map database question to frontend Prompt contract
function mapQuestionToPrompt(q: any, origin: 'screening' | 'core' | 'targeted' = 'core', targetedReason?: string) {
  let presentation: any = {
    kind: 'single_choice',
    provisionalOptions: true,
    options: [
      { value: 'formal-institutional-priority', label: 'Formally established and active across departments' },
      { value: 'emerging-school-faculty', label: 'Emerging initiative in selected faculties/schools' },
      { value: 'under-active-committee-review', label: 'Under active committee review or formulation' },
      { value: 'informally-addressed', label: 'Informally addressed / ad-hoc academic practice' },
      { value: 'not-currently-initiated', label: 'Not currently initiated or planned' },
    ],
    allowOther: true,
  };

  // If custom options_json is present in database
  if (Array.isArray(q.options_json) && q.options_json.length > 0) {
    presentation = {
      kind: q.presentation_kind || 'single_choice',
      provisionalOptions: true,
      options: q.options_json,
      allowOther: true,
    };
  } else if (q.presentation_kind === 'multi_choice' || (q.input_type && q.input_type.toLowerCase().includes('multi'))) {
    presentation = {
      kind: 'multi_choice',
      provisionalOptions: true,
      options: [
        { value: 'governance_framework', label: 'Institutional AI Governance and Ethics Charter' },
        { value: 'faculty_development', label: 'Structured faculty capability development pathways' },
        { value: 'curriculum_integration', label: 'Disciplinary AI literacy and cognitive integration' },
        { value: 'assessment_security', label: 'Redesigned authentic capability assessment models' },
        { value: 'data_infrastructure', label: 'Enterprise data and learning analytics platform' },
      ],
      allowOther: true,
    };
  } else if (q.presentation_kind === 'numbers' || (q.input_type && q.input_type.toLowerCase().includes('number'))) {
    presentation = {
      kind: 'numbers',
      fields: [
        { id: 'total_count', label: 'Total units / activities involved' },
        { id: 'active_proportion', label: 'Active or validated proportion' },
      ],
      precision: true,
    };
  } else if (q.presentation_kind === 'records' || (q.input_type && q.input_type.toLowerCase().includes('record'))) {
    presentation = {
      kind: 'records',
      recordLabel: 'Institutional Initiative Record',
      fields: [
        { id: 'name', label: 'Initiative or Decision Name', type: 'short_text', maxLength: 100 },
        { id: 'impact', label: 'Primary Academic/Operational Area', type: 'select', options: [
          { value: 'curriculum', label: 'Curriculum & Teaching' },
          { value: 'assessment', label: 'Student Assessment' },
          { value: 'research', label: 'Research & Innovation' },
          { value: 'operations', label: 'Operations & Policy' },
        ]},
        { id: 'status', label: 'Implementation Status', type: 'select', options: [
          { value: 'active', label: 'Active / Implemented' },
          { value: 'pilot', label: 'Pilot Stage' },
          { value: 'planned', label: 'Planned' },
        ]},
      ],
      min: 1,
      max: 5,
    };
  }

  const cardCode = q.card_code || '';
  const theme = cardCode ? `Strategic Area ${cardCode}` : 'Strategic Direction & Capability';

  return {
    id: q.code || q.id,
    domainCode: q.domain_code || null,
    domainName: q.domain_code ? (DOMAIN_NAMES[q.domain_code] || `Domain ${q.domain_code}`) : 'Institutional Pulse',
    theme,
    prompt: q.prompt,
    help: q.role ? `Methodology probe: Evaluates institutional ${q.role.toLowerCase()} evidence.` : undefined,
    presentation,
    evidenceHints: [
      'Official committee minutes, council mandate, or institutional strategy document',
      'Operational guidelines or faculty approved assessment framework',
    ],
    origin,
    targetedReason,
    allowNotSure: true,
    allowNotApplicable: true,
  };
}

// Compute position object for a prompt within a list of prompts
function computePosition(list: any[], prompt: any, responseMap: Record<string, any>) {
  const themes = [...new Set(list.map((p) => p.theme))] as string[];
  const themeIndex = themes.indexOf(prompt.theme);
  const inTheme = list.filter((p) => p.theme === prompt.theme);
  const withinCurrent = inTheme.findIndex((p) => p.id === prompt.id) + 1;

  return {
    theme: prompt.theme,
    themeIndex: themeIndex >= 0 ? themeIndex : 0,
    themeTotal: themes.length || 1,
    withinTheme: { current: withinCurrent > 0 ? withinCurrent : 1, total: inTheme.length || 1 },
    themes: themes.map((label) => ({
      label,
      state: (label === prompt.theme
        ? 'current'
        : list.filter((p) => p.theme === label).every((p) => responseMap[p.id]?.state === 'answered')
        ? 'complete'
        : 'upcoming') as 'current' | 'complete' | 'upcoming',
    })),
  };
}

// Route: Get Pulse / Screening Prompts (≤30 prompts)
router.get('/assessments/:id/screening', async (req, res) => {
  const { id } = req.params;
  try {
    const qRes = await query(
      `SELECT * FROM questions WHERE role = 'Diagnostic' OR code IN ('Q01', 'Q02', 'Q03', 'Q04', 'Q05') ORDER BY domain_code, sort_order LIMIT 30`
    );

    // Fetch existing responses
    const rRes = await query(`SELECT * FROM assessment_responses WHERE assessment_id = $1`, [id]);
    const responses = rRes.rows.map((r) => ({
      promptId: r.prompt_id,
      state: r.state,
      value: r.response_value_json,
      note: r.notes || undefined,
      notApplicableRationale: undefined,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    }));

    const prompts = qRes.rows.map((q) => mapQuestionToPrompt(q, 'screening'));
    const respondedIds = new Set(responses.map((r) => r.promptId));
    const complete = prompts.length > 0 && prompts.every((p) => respondedIds.has(p.id));

    return res.json({
      title: 'Institutional Pulse',
      intro: 'A short set of strategic signals that give the assessment an early read of how AI is positioned, governed and practised across the institution.',
      prompts,
      responses,
      earlySignal: {
        title: 'Initial Strategic Baseline Signal',
        body: 'Initial institutional signals indicate emerging awareness and strategic priority alignment across executive leadership and academic faculties.',
      },
      complete,
    });
  } catch (err) {
    console.error('Error fetching screening prompts:', err);
    return res.status(500).json({ error: 'Failed to fetch screening prompts' });
  }
});

// Route: Next Adaptive Prompt for a Domain
router.get('/assessments/:id/domains/:code/next', async (req, res) => {
  const { id, code } = req.params;
  const after = req.query.after as string | undefined;

  try {
    const domainQuestionsRes = await query(
      `SELECT * FROM questions WHERE domain_code = $1 ORDER BY sort_order ASC, code ASC`,
      [code]
    );

    const questions = domainQuestionsRes.rows;
    if (questions.length === 0) {
      return res.json({
        prompt: null,
        position: null,
        existingResponse: null,
        domainComplete: true,
        history: [],
      });
    }

    const mappedPrompts = questions.map((q) => mapQuestionToPrompt(q, 'core'));

    // Fetch responses for this assessment
    const rRes = await query(
      `SELECT prompt_id, state, response_value_json, updated_at FROM assessment_responses WHERE assessment_id = $1`,
      [id]
    );
    const responseMap: Record<string, any> = {};
    for (const r of rRes.rows) {
      responseMap[r.prompt_id] = {
        promptId: r.prompt_id,
        state: r.state,
        value: r.response_value_json,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    }

    const history = mappedPrompts.map((p) => ({
      promptId: p.id,
      theme: p.theme,
      state: responseMap[p.id]?.state || 'not_answered',
    }));

    let targetPrompt = null;

    if (after) {
      const foundIdx = mappedPrompts.findIndex((p) => p.id === after);
      if (foundIdx >= 0 && foundIdx + 1 < mappedPrompts.length) {
        targetPrompt = mappedPrompts[foundIdx + 1];
      }
    } else {
      // Find first unanswered prompt
      targetPrompt = mappedPrompts.find((p) => !responseMap[p.id] || responseMap[p.id].state === 'not_answered') || null;
      // If all answered, targetPrompt is null
    }

    const domainComplete = mappedPrompts.every((p) => responseMap[p.id] && responseMap[p.id].state !== 'not_answered');

    const pos = targetPrompt ? computePosition(mappedPrompts, targetPrompt, responseMap) : null;
    const existingResponse = targetPrompt && responseMap[targetPrompt.id] ? responseMap[targetPrompt.id] : null;

    return res.json({
      prompt: targetPrompt,
      position: pos,
      existingResponse,
      domainComplete,
      history,
    });
  } catch (err) {
    console.error('Error in next domain prompt:', err);
    return res.status(500).json({ error: 'Failed to fetch next prompt' });
  }
});

// Route: Get Prompt By ID for a Domain (handles ?p=Q01 or direct navigation)
router.get('/assessments/:id/domains/:code/prompts/:promptId', async (req, res) => {
  const { id, code, promptId } = req.params;

  try {
    const domainQuestionsRes = await query(
      `SELECT * FROM questions WHERE domain_code = $1 ORDER BY sort_order ASC, code ASC`,
      [code]
    );

    const questions = domainQuestionsRes.rows;
    const mappedPrompts = questions.map((q) => mapQuestionToPrompt(q, 'core'));

    const targetPrompt = mappedPrompts.find((p) => p.id === promptId) || null;

    const rRes = await query(
      `SELECT prompt_id, state, response_value_json, updated_at FROM assessment_responses WHERE assessment_id = $1`,
      [id]
    );
    const responseMap: Record<string, any> = {};
    for (const r of rRes.rows) {
      responseMap[r.prompt_id] = {
        promptId: r.prompt_id,
        state: r.state,
        value: r.response_value_json,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    }

    const history = mappedPrompts.map((p) => ({
      promptId: p.id,
      theme: p.theme,
      state: responseMap[p.id]?.state || 'not_answered',
    }));

    const domainComplete = mappedPrompts.length > 0 && mappedPrompts.every((p) => responseMap[p.id] && responseMap[p.id].state !== 'not_answered');

    const pos = targetPrompt ? computePosition(mappedPrompts, targetPrompt, responseMap) : null;
    const existingResponse = targetPrompt && responseMap[targetPrompt.id] ? responseMap[targetPrompt.id] : null;

    return res.json({
      prompt: targetPrompt,
      position: pos,
      existingResponse,
      domainComplete,
      history,
    });
  } catch (err) {
    console.error('Error in get prompt by id:', err);
    return res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// Route: Save Response for a Prompt
router.put('/assessments/:id/responses/:promptId', async (req, res) => {
  const { id, promptId } = req.params;
  const { state, value, note, notApplicableRationale } = req.body;

  if (!state) {
    return res.status(400).json({ error: 'Response state is required' });
  }

  try {
    const upsertRes = await query(
      `INSERT INTO assessment_responses (assessment_id, prompt_id, state, response_value_json, answered_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (assessment_id, prompt_id) DO UPDATE SET
         state = EXCLUDED.state,
         response_value_json = EXCLUDED.response_value_json,
         answered_at = NOW(),
         updated_at = NOW()
       RETURNING *`,
      [id, promptId, state, JSON.stringify(value !== undefined ? value : null)]
    );

    const row = upsertRes.rows[0];
    return res.json({
      promptId: row.prompt_id,
      state: row.state,
      value: row.response_value_json,
      note,
      notApplicableRationale,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving prompt response:', err);
    return res.status(500).json({ error: 'Failed to save response' });
  }
});

export default router;
