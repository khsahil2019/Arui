import { Router } from 'express';
import { query } from '../../db/index.js';

const router = Router();

// Helper to construct AssessmentStatusView
export async function getAssessmentStatusView(assessmentId: string) {
  const aRes = await query(
    `SELECT a.*, i.name as institution_name, m.version as methodology_version
     FROM assessments a
     JOIN institutions i ON i.id = a.institution_id
     JOIN methodology_versions m ON m.id = a.methodology_version_id
     WHERE a.id = $1`,
    [assessmentId]
  );

  if (aRes.rows.length === 0) {
    return null;
  }

  const assessment = aRes.rows[0];

  // Check Profile completeness
  const pRes = await query(
    `SELECT * FROM institution_profiles WHERE assessment_id = $1 OR institution_id = $2 ORDER BY updated_at DESC LIMIT 1`,
    [assessmentId, assessment.institution_id]
  );
  const profileComplete = pRes.rows.length > 0 && Number(pRes.rows[0].completeness_score) >= 80;

  // Check Pulse/Screening responses
  const respRes = await query(
    `SELECT count(*) as count FROM assessment_responses WHERE assessment_id = $1 AND state = 'answered'`,
    [assessmentId]
  );
  const answeredCount = parseInt(respRes.rows[0].count, 10) || 0;

  // Check Evidence counts
  const evRes = await query(
    `SELECT
       count(*) filter (where status in ('SUBMITTED', 'REVIEWED', 'CORROBORATED')) as submitted,
       count(*) filter (where status = 'DRAFT') as drafts
     FROM evidence_items WHERE assessment_id = $1`,
    [assessmentId]
  );
  const submittedEv = parseInt(evRes.rows[0].submitted, 10) || 0;
  const draftEv = parseInt(evRes.rows[0].drafts, 10) || 0;

  // Stages
  const currentStage = assessment.stage || 'profile';
  const stages = [
    {
      id: 'profile',
      label: 'Institution Profile',
      caption: profileComplete ? 'Profile complete' : '25-field baseline context',
      state: profileComplete ? 'complete' : currentStage === 'profile' ? 'current' : 'complete',
    },
    {
      id: 'orientation',
      label: 'Orientation & Rubric',
      caption: 'Methodology and domain briefing',
      state: profileComplete ? (currentStage === 'orientation' ? 'current' : 'complete') : 'upcoming',
    },
    {
      id: 'pulse',
      label: 'Institutional Pulse',
      caption: answeredCount > 0 ? `${answeredCount} screening signals captured` : 'Initial rapid pulse',
      state: answeredCount >= 5 ? 'complete' : currentStage === 'pulse' ? 'current' : 'upcoming',
    },
    {
      id: 'assessment',
      label: 'Domain Assessment',
      caption: 'D01–D11 adaptive questioning',
      state: ['assessment', 'evidence', 'results'].includes(currentStage) ? (currentStage === 'assessment' ? 'current' : 'complete') : 'upcoming',
    },
    {
      id: 'evidence',
      label: 'Evidence Repository',
      caption: `${submittedEv} items submitted`,
      state: ['evidence', 'results'].includes(currentStage) ? (currentStage === 'evidence' ? 'current' : 'complete') : 'upcoming',
    },
    {
      id: 'results',
      label: 'Preliminary Findings',
      caption: 'Executive summary & diagnostics',
      state: currentStage === 'results' ? 'current' : 'upcoming',
    },
  ];

  // Domains (D01 to D11)
  const allDomainsRes = await query(`SELECT code, name FROM domains ORDER BY sort_order ASC`);
  const scopeDomains: string[] = assessment.scope_domains_json || [
    'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'
  ];

  const domains = allDomainsRes.rows.map((d: any) => {
    const inScope = scopeDomains.includes(d.code);
    let state = 'not_started';
    if (!inScope) state = 'not_in_scope';
    else if (d.code === 'D01' && answeredCount > 0) state = 'in_progress';
    else if (d.code === 'D01' && answeredCount > 10) state = 'complete';

    return {
      code: d.code,
      name: d.name,
      inScope,
      state,
      themesExplored: inScope ? (d.code === 'D01' ? Math.min(answeredCount, 4) : 0) : 0,
      themesTotal: 4,
      targetedFollowUp: d.code === 'D01' && answeredCount > 3,
    };
  });

  return {
    assessmentId: assessment.id,
    institutionName: assessment.institution_name,
    cycle: '2026 Baseline',
    status: assessment.status || 'DRAFT',
    methodologyVersion: assessment.methodology_version || 'v4.0',
    stages,
    domains,
    evidence: {
      submitted: submittedEv,
      drafts: draftEv,
      coreTarget: { min: 8, max: 12 },
    },
    contributors: [
      { name: 'Dr. Aris Thorne', role: 'INSTITUTION_ADMIN', areas: ['Strategy', 'Executive Leadership'] },
      { name: 'Prof. Elizabeth Vance', role: 'ASSESSOR', areas: ['D01–D11 Review', 'Assessor Calibration'] },
    ],
    confidentiality: 'Confidential to institution leadership. Results are uncertified and preliminary.',
    updatedAt: assessment.updated_at ? new Date(assessment.updated_at).toISOString() : new Date().toISOString(),
  };
}

// Route: Get Assessment Status
router.get('/assessments/:id/status', async (req, res) => {
  try {
    const statusView = await getAssessmentStatusView(req.params.id);
    if (!statusView) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    return res.json(statusView);
  } catch (err) {
    console.error('Error in assessment status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Get or Create default assessment
router.get('/assessments/active', async (req, res) => {
  try {
    const aRes = await query(`SELECT id FROM assessments ORDER BY created_at DESC LIMIT 1`);
    if (aRes.rows.length === 0) {
      return res.status(404).json({ error: 'No active assessment found' });
    }
    return res.json({ id: aRes.rows[0].id });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Create New Assessment
router.post('/assessments', async (req, res) => {
  const { institutionId, title, scopeDomains } = req.body;
  try {
    const mvRes = await query(`SELECT id FROM methodology_versions WHERE is_active = true LIMIT 1`);
    const versionId = mvRes.rows[0]?.id;

    const insRes = await query(
      `INSERT INTO assessments (institution_id, methodology_version_id, title, status, stage, scope_domains_json)
       VALUES ($1, $2, $3, 'DRAFT', 'profile', $4)
       RETURNING *`,
      [institutionId, versionId, title || 'Institutional Assessment', JSON.stringify(scopeDomains || ['D01', 'D02', 'D03'])]
    );
    return res.status(201).json(insRes.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Route: Update Assessment Scope
router.put('/assessments/:id/scope', async (req, res) => {
  const { scopeDomains } = req.body;
  try {
    const uRes = await query(
      `UPDATE assessments SET scope_domains_json = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(scopeDomains), req.params.id]
    );
    return res.json(uRes.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update scope' });
  }
});

export default router;
