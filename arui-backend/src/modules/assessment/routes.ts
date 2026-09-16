import { Router } from 'express';
import { query } from '../../db/index.js';
import { authenticate, requireInstitutionAccess } from '../../middleware/auth.js';

const router = Router();

// Helper to construct AssessmentStatusView
export async function getAssessmentStatusView(assessmentId: string) {
  if (!assessmentId || assessmentId === 'undefined' || assessmentId === 'null') {
    const defaultAsm = await query(`SELECT id FROM assessments ORDER BY created_at DESC LIMIT 1`);
    if (defaultAsm.rows.length === 0) return null;
    assessmentId = defaultAsm.rows[0].id;
  }

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

  // Check Responses counts
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
  const allDomainsRes = await query(
    `SELECT code, name FROM domains 
     WHERE methodology_version_id = $1 OR methodology_version_id IS NULL 
     ORDER BY sort_order ASC`,
    [assessment.methodology_version_id]
  );
  const scopeDomains: string[] = assessment.scope_domains_json || [
    'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'
  ];

  const domains = allDomainsRes.rows.map((d: any) => {
    const inScope = scopeDomains.includes(d.code);
    let state = 'not_started';
    if (!inScope) state = 'not_in_scope';
    else if (answeredCount > 0) state = 'in_progress';
    if (answeredCount >= 20) state = 'complete';

    return {
      code: d.code,
      name: d.name,
      inScope,
      state,
      themesExplored: inScope ? Math.min(answeredCount, 4) : 0,
      themesTotal: 4,
      targetedFollowUp: inScope && answeredCount > 3,
    };
  });

  // Contributors from user table
  const usersRes = await query(
    `SELECT name, role FROM users WHERE institution_id = $1 OR role IN ('ASSESSOR', 'LEAD_AUDITOR') LIMIT 5`,
    [assessment.institution_id]
  );
  const contributors = usersRes.rows.map((u: any) => ({
    name: u.name,
    role: u.role,
    areas: u.role === 'ASSESSOR' ? ['D01–D11 Review', 'Assessor Calibration'] : ['Institutional Leadership'],
  }));

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
    contributors: contributors.length > 0 ? contributors : [
      { name: 'Institutional Assessment Lead', role: 'INSTITUTION_ADMIN', areas: ['Institutional Baseline'] }
    ],
    confidentiality: 'Confidential to institution leadership. Results are uncertified and preliminary.',
    updatedAt: assessment.updated_at ? new Date(assessment.updated_at).toISOString() : new Date().toISOString(),
  };
}

// Route: List all Higher Education Assessment Products
router.get('/products', async (req, res) => {
  try {
    const productsRes = await query(
      `SELECT p.*, 
              pp.amount, pp.currency, pp.tier_name, pp.features_json,
              cta.cta_text, cta.cta_link, cta.cta_visibility,
              bc.logo_url, bc.header_text, bc.footer_text, bc.contact_email, bc.contact_phone, bc.contact_whatsapp
       FROM products p
       LEFT JOIN product_pricing pp ON pp.product_code = p.code AND pp.is_active = true
       LEFT JOIN cta_configs cta ON cta.product_code = p.code
       LEFT JOIN brand_configs bc ON bc.product_code = p.code AND bc.institution_id IS NULL
       WHERE p.is_active = true
       ORDER BY p.code ASC`
    );
    return res.json(productsRes.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Route: Get Assessment Status
router.get('/assessments/:id/status', authenticate, requireInstitutionAccess, async (req, res) => {
  try {
    const statusView = await getAssessmentStatusView(req.params.id as string);
    if (!statusView) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    return res.json(statusView);
  } catch (err) {
    console.error('Error in assessment status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: List all assessments for user's institution
router.get('/assessments', authenticate, async (req, res) => {
  try {
    const productCode = req.query.product as string | undefined;
    let sql = `
      SELECT a.*, i.name as institution_name, m.version as methodology_version, p.name as product_name
      FROM assessments a
      JOIN institutions i ON i.id = a.institution_id
      JOIN methodology_versions m ON m.id = a.methodology_version_id
      LEFT JOIN products p ON p.code = a.product_code
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (req.user?.institutionId) {
      conditions.push(`a.institution_id = $${params.length + 1}`);
      params.push(req.user.institutionId);
    }
    if (productCode) {
      conditions.push(`a.product_code = $${params.length + 1}`);
      params.push(productCode);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }
    sql += ` ORDER BY a.created_at DESC`;

    const aRes = await query(sql, params);
    return res.json(aRes.rows);
  } catch (err) {
    console.error('Error listing assessments:', err);
    return res.status(500).json({ error: 'Failed to list assessments' });
  }
});

// Route: Get or Create active assessment for given product
router.get('/assessments/active', authenticate, async (req, res) => {
  try {
    const productCode = (req.query.product as string) || 'arui';
    let aRes;
    if (req.user?.institutionId) {
      aRes = await query(
        `SELECT id, product_code, title, status, stage FROM assessments 
         WHERE institution_id = $1 AND (product_code = $2 OR (product_code IS NULL AND $2 = 'arui')) 
         ORDER BY created_at DESC LIMIT 1`,
        [req.user.institutionId, productCode]
      );
    } else {
      aRes = await query(
        `SELECT id, product_code, title, status, stage FROM assessments 
         WHERE (product_code = $1 OR (product_code IS NULL AND $1 = 'arui')) 
         ORDER BY created_at DESC LIMIT 1`,
        [productCode]
      );
    }

    if (aRes.rows.length === 0) {
      // Create one if none exists for this institution/product
      const instId = req.user?.institutionId || (await query(`SELECT id FROM institutions LIMIT 1`)).rows[0]?.id;
      const mvRes = await query(
        `SELECT id FROM methodology_versions WHERE product_code = $1 AND is_active = true LIMIT 1`,
        [productCode]
      );
      const versionId = mvRes.rows[0]?.id || (await query(`SELECT id FROM methodology_versions LIMIT 1`)).rows[0]?.id;

      const title = productCode === 'ecri' 
        ? 'Graduate Employability & Career Readiness Assessment' 
        : 'Institutional AI Resilience Assessment';

      const newAsm = await query(
        `INSERT INTO assessments (product_code, institution_id, methodology_version_id, title, status, stage, current_domain)
         VALUES ($1, $2, $3, $4, 'DRAFT', 'profile', 'D01')
         RETURNING id, product_code, title, status, stage`,
        [productCode, instId, versionId, title]
      );
      return res.json(newAsm.rows[0]);
    }
    return res.json(aRes.rows[0]);
  } catch (err) {
    console.error('Error in get active assessment:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route: Create New Assessment
router.post('/assessments', authenticate, async (req, res) => {
  const { institutionId, title, scopeDomains, productCode } = req.body;
  const targetProduct = productCode || 'arui';
  let targetInstitutionId = institutionId || req.user?.institutionId;

  if (req.user?.role === 'INSTITUTION_ADMIN') {
    if (institutionId && req.user.institutionId && institutionId !== req.user.institutionId) {
      return res.status(403).json({ error: 'Forbidden: Institution Admin can only create assessments for their own institution.' });
    }
    targetInstitutionId = req.user.institutionId;
  }

  if (!targetInstitutionId) {
    return res.status(400).json({ error: 'Institution ID is required' });
  }

  try {
    const mvRes = await query(
      `SELECT id FROM methodology_versions WHERE (product_code = $1 OR product_code IS NULL) AND is_active = true ORDER BY created_at DESC LIMIT 1`,
      [targetProduct]
    );
    const versionId = mvRes.rows[0]?.id;

    const defaultScope = ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'];
    const insRes = await query(
      `INSERT INTO assessments (product_code, institution_id, methodology_version_id, title, status, stage, scope_domains_json)
       VALUES ($1, $2, $3, $4, 'DRAFT', 'profile', $5)
       RETURNING *`,
      [targetProduct, targetInstitutionId, versionId, title || `${targetProduct.toUpperCase()} Assessment`, JSON.stringify(scopeDomains || defaultScope)]
    );
    return res.status(201).json(insRes.rows[0]);
  } catch (err) {
    console.error('Failed to create assessment:', err);
    return res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Route: Update Assessment Scope
router.put('/assessments/:id/scope', authenticate, requireInstitutionAccess, async (req, res) => {
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

// Route: Update Assessment
router.patch('/assessments/:id', authenticate, requireInstitutionAccess, async (req, res) => {
  const { methodologyVersionId, methodology_version_id, overallScore, score } = req.body;

  if (methodologyVersionId || methodology_version_id) {
    return res.status(400).json({ error: 'Methodology version is immutable once pinned to an assessment.' });
  }

  if (overallScore !== undefined || score !== undefined) {
    return res.status(400).json({ error: 'Scores are server-computed and cannot be directly mutated by client.' });
  }

  const { title, stage, status, currentDomain, current_domain } = req.body;
  try {
    const uRes = await query(
      `UPDATE assessments 
       SET title = COALESCE($1, title),
           stage = COALESCE($2, stage),
           status = COALESCE($3, status),
           current_domain = COALESCE($4, current_domain),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, stage, status, currentDomain || current_domain, req.params.id]
    );
    if (uRes.rows.length === 0) return res.status(404).json({ error: 'Assessment not found' });
    return res.json(uRes.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update assessment' });
  }
});

export default router;
