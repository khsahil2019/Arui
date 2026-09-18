import { Router } from 'express';
import { query } from '../../db/index.js';
import { authenticate, requireInstitutionAccess } from '../../middleware/auth.js';
import { requireAssessmentEngineAccess } from '../../middleware/entitlement.js';

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

// Map database question to frontend Prompt contract (strictly registry-driven; respondent never sees internal weights or formulas)
function mapQuestionToPrompt(q: any, origin: 'screening' | 'core' | 'targeted' = 'core', targetedReason?: string) {
  let presentation: any = {
    kind: q.presentation_kind || 'single_choice',
    provisionalOptions: true,
    options: [
      { value: 'opt_0', label: 'Level 0: Absent / Non-Existent' },
      { value: 'opt_1', label: 'Level 1: Reactive / Ad-hoc initiatives' },
      { value: 'opt_2', label: 'Level 2: Emerging in selected departments' },
      { value: 'opt_3', label: 'Level 3: Structured institutional framework' },
      { value: 'opt_4', label: 'Level 4: Integrated with industry & verified outcomes' },
      { value: 'opt_5', label: 'Level 5: Adaptive / Sector-defining benchmark' },
    ],
    allowOther: true,
  };

  // If custom options_json is present in database
  if (Array.isArray(q.options_json) && q.options_json.length > 0) {
    presentation = {
      kind: q.presentation_kind || 'single_choice',
      provisionalOptions: true,
      options: q.options_json.map((opt: any) => ({
        value: opt.id || opt.value,
        label: opt.label,
        scoreWeight: opt.scoreWeight,
      })),
      allowOther: true,
    };
  } else if (q.presentation_kind === 'multi_choice' || (q.input_type && q.input_type.toLowerCase().includes('multi'))) {
    presentation = {
      kind: 'multi_choice',
      provisionalOptions: true,
      options: [
        { value: 'governance_framework', label: 'Institutional Governance & Mandate' },
        { value: 'faculty_development', label: 'Faculty & Workforce Capability Pathways' },
        { value: 'curriculum_integration', label: 'Curriculum & Programmatic Integration' },
        { value: 'assessment_security', label: 'Authentic Assessment & Evaluation Systems' },
        { value: 'data_infrastructure', label: 'Data, Analytics & Outcome Tracking Infrastructure' },
      ],
      allowOther: true,
    };
  }

  const cardCode = q.card_code || '';
  const domainDisplayName = q.domain_name || (q.domain_code ? (DOMAIN_NAMES[q.domain_code] || `Dimension ${q.domain_code}`) : 'Institutional Screening');
  const theme = cardCode ? `Strategic Area ${cardCode}` : `${domainDisplayName} Focus`;
  
  // Format globally unique prompt ID
  let promptId = q.code || q.id;
  if (q.domain_code && q.code) {
    if (!q.code.startsWith(q.domain_code)) {
      promptId = `${q.domain_code}-${q.code}`;
    }
  }

  return {
    id: promptId,
    domainCode: q.domain_code || null,
    domainName: domainDisplayName,
    theme,
    prompt: q.prompt,
    help: q.role ? `Methodology probe: Evaluates institutional ${q.role.toLowerCase()} evidence and maturity.` : undefined,
    presentation,
    evidenceHints: [
      'Official committee minutes, council mandate, or institutional strategy document',
      'Operational guidelines, employer co-design feedback, or approved assessment framework',
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
router.get('/assessments/:id/screening', authenticate, requireInstitutionAccess, requireAssessmentEngineAccess(), async (req, res) => {
  const { id } = req.params;
  try {
    const qRes = await query(
      `SELECT q.* FROM questions q
       JOIN assessments a ON a.id = $1
       WHERE (q.methodology_version_id = a.methodology_version_id OR q.methodology_version_id IS NULL)
         AND q.role = 'Screening'
       ORDER BY q.domain_code, q.sort_order LIMIT 30`,
      [id]
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

    const productRes = await query(`SELECT product_code FROM assessments WHERE id = $1`, [id]);
    const isEcri = String(productRes.rows[0]?.product_code || '').toLowerCase() === 'ecri';
    return res.json({
      title: isEcri ? 'Institutional Employability Pulse' : 'Institutional Pulse',
      intro: isEcri
        ? 'A short set of high-information signals about employer demand sensing, curriculum relevance, work-integrated learning and career outcomes.'
        : 'A short set of strategic signals that give the assessment an early read of how AI is positioned, governed and practised across the institution.',
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
router.get('/assessments/:id/domains/:code/next', authenticate, requireInstitutionAccess, requireAssessmentEngineAccess(), async (req, res) => {
  const { id, code } = req.params;
  const after = req.query.after as string | undefined;

  try {
    const domainQuestionsRes = await query(
      `SELECT q.* FROM questions q
       JOIN assessments a ON a.id = $1
       WHERE (q.methodology_version_id = a.methodology_version_id OR q.methodology_version_id IS NULL)
         AND q.domain_code = $2
       ORDER BY q.sort_order ASC, q.code ASC`,
      [id, code]
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

    // Fetch responses for this assessment
    const screeningRes = await query(
      `SELECT prompt_id, response_value_json, state FROM assessment_responses WHERE assessment_id = $1`,
      [id]
    );
    const screeningSignals = new Set<string>();
    for (const r of screeningRes.rows) {
      const value = r.response_value_json;
      const raw = typeof value === 'string' ? value : JSON.stringify(value || '');
      // Screening is intentionally high-information: only non-affirmative / uncertain
      // signals trigger a targeted deep dive.
      if (r.state === 'answered' && !/opt_yes|yes|fully established|maturityLevel\":4/i.test(raw)) {
        const match = String(r.prompt_id).match(/^(D\d{2})-/);
        if (match) screeningSignals.add(match[1]);
      }
    }
    const allMappedPrompts = questions.map((q) => mapQuestionToPrompt(q, 'core'));
    const targeted = allMappedPrompts.filter((p) => screeningSignals.has(p.domainCode || ''));
    const mappedPrompts = targeted.length > 0 ? targeted : allMappedPrompts;

    // Fetch responses for this assessment
    const rRes = await query(
      `SELECT prompt_id, state, response_value_json, notes, updated_at FROM assessment_responses WHERE assessment_id = $1`,
      [id]
    );
    const responseMap: Record<string, any> = {};
    for (const r of rRes.rows) {
      responseMap[r.prompt_id] = {
        promptId: r.prompt_id,
        state: r.state,
        value: r.response_value_json,
        note: r.notes || undefined,
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

// Route: Get Prompt By ID for a Domain (handles direct navigation)
router.get('/assessments/:id/domains/:code/prompts/:promptId', authenticate, requireInstitutionAccess, requireAssessmentEngineAccess(), async (req, res) => {
  const { id, code, promptId } = req.params;

  try {
    const domainQuestionsRes = await query(
      `SELECT q.* FROM questions q
       JOIN assessments a ON a.id = $1
       WHERE (q.methodology_version_id = a.methodology_version_id OR q.methodology_version_id IS NULL)
         AND q.domain_code = $2
       ORDER BY q.sort_order ASC, q.code ASC`,
      [id, code]
    );

    const questions = domainQuestionsRes.rows;
    const mappedPrompts = questions.map((q) => mapQuestionToPrompt(q, 'core'));

    const targetPrompt = mappedPrompts.find((p) => p.id === promptId) || null;

    const rRes = await query(
      `SELECT prompt_id, state, response_value_json, notes, updated_at FROM assessment_responses WHERE assessment_id = $1`,
      [id]
    );
    const responseMap: Record<string, any> = {};
    for (const r of rRes.rows) {
      responseMap[r.prompt_id] = {
        promptId: r.prompt_id,
        state: r.state,
        value: r.response_value_json,
        note: r.notes || undefined,
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

// Route: Save Response for a Prompt (Preserving all four distinct response states)
router.put('/assessments/:id/responses/:promptId', authenticate, requireInstitutionAccess, requireAssessmentEngineAccess(), async (req, res) => {
  const { id, promptId } = req.params;
  const { state, value, note, notApplicableRationale } = req.body;

  // Valid states: 'not_answered' | 'not_sure' | 'na' | 'answered'
  const validStates = ['not_answered', 'not_sure', 'na', 'answered'];
  if (!state || !validStates.includes(state)) {
    return res.status(400).json({ error: `Valid response state is required: ${validStates.join(', ')}` });
  }

  try {
    const combinedNotes = note || notApplicableRationale || null;
    const upsertRes = await query(
      `INSERT INTO assessment_responses (assessment_id, prompt_id, state, response_value_json, notes, answered_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (assessment_id, prompt_id) DO UPDATE SET
         state = EXCLUDED.state,
         response_value_json = EXCLUDED.response_value_json,
         notes = EXCLUDED.notes,
         answered_at = NOW(),
         updated_at = NOW()
       RETURNING *`,
      [id, promptId, state, JSON.stringify(value !== undefined ? value : null), combinedNotes]
    );

    const row = upsertRes.rows[0];
    return res.json({
      promptId: row.prompt_id,
      state: row.state,
      value: row.response_value_json,
      note: row.notes || undefined,
      notApplicableRationale: state === 'na' ? row.notes || undefined : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error saving prompt response:', err);
    return res.status(500).json({ error: 'Failed to save response' });
  }
});

export default router;
