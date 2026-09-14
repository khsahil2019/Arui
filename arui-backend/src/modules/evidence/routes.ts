import { Router } from 'express';
import { query } from '../../db/index.js';
import { authenticate, requireInstitutionAccess, requireRole } from '../../middleware/auth.js';

const router = Router();

// Route: Get Evidence View
router.get('/assessments/:id/evidence', authenticate, requireInstitutionAccess, async (req, res) => {
  const { id } = req.params;

  try {
    const evItemsRes = await query(
      `SELECT * FROM evidence_items WHERE assessment_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    // Get links for each item
    const items: any[] = [];
    for (const row of evItemsRes.rows) {
      const linksRes = await query(
        `SELECT metric_full_code FROM evidence_metric_links WHERE evidence_id = $1`,
        [row.id]
      );
      const links = linksRes.rows.map((l: any) => l.metric_full_code);

      items.push({
        id: row.id,
        title: row.title,
        kind: 'document',
        evidenceType: row.source_origin || 'institutional_policy',
        fileName: row.file_name,
        fileSize: Number(row.file_size) || 120000,
        description: row.description || '',
        scope: 'Institution-wide',
        proposedSupports: links,
        confirmedSupports: row.status === 'REVIEWED' ? links : [],
        fulfilsRequestIds: ['req-01'],
        status: row.status ? row.status.toLowerCase() : 'draft',
        addedAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      });
    }

    // Evidence Requests from methodology
    const reqsRes = await query(
      `SELECT e.*, d.name as domain_name FROM evidence_requirements e
       JOIN domains d ON d.code = e.domain_code
       ORDER BY e.domain_code, e.code`
    );

    const requests = reqsRes.rows.map((r: any) => ({
      id: r.code || r.id,
      domainCode: r.domain_code,
      domainName: r.domain_name || `Domain ${r.domain_code}`,
      label: r.title,
      quantity: r.quantity || '1-2 items',
      requirement: r.requirement || 'Required for verified assessment',
      fulfilledByIds: items.filter((it) => it.proposedSupports.includes(r.domain_code)).map((it) => it.id),
    }));

    return res.json({
      items,
      requests,
      coreTarget: { min: 8, max: 12 },
      evidenceTypes: [
        { value: 'policy', label: 'Institutional Policy / Charter / Senate Resolution' },
        { value: 'curriculum', label: 'Curriculum Document / Syllabus / Assessment Rubric' },
        { value: 'analytics', label: 'LMS / AI Tool Analytics / Data Export' },
        { value: 'committee_minutes', label: 'Executive / IQAC Committee Minutes' },
        { value: 'student_work', label: 'Sample Authentic Student Artifacts' },
        { value: 'audit_report', label: 'Third-party Audit / External Review Report' },
      ],
      scopes: [
        { value: 'institution_wide', label: 'Institution-wide (All Schools/Faculties)' },
        { value: 'faculty_specific', label: 'Specific Faculty or Cluster' },
        { value: 'pilot_project', label: 'Sample / Pilot Project' },
      ],
      guidance: [
        'One piece of evidence can support multiple metrics under the primary-owner rule.',
        'Policy alone (E1) without operational implementation evidence does not unlock advanced maturity scores.',
        'Evidence older than 24 months is flagged for temporal review.',
      ],
    });
  } catch (err) {
    console.error('Error fetching evidence:', err);
    return res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

// Route: Create Evidence Item
router.post('/assessments/:id/evidence', authenticate, requireInstitutionAccess, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    fileName,
    fileSize,
    evidenceType,
    periodStart,
    periodEnd,
    scope,
    proposedSupports,
    fulfilsRequestIds,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const cleanFileName = fileName || 'evidence_document.pdf';
    const insRes = await query(
      `INSERT INTO evidence_items (assessment_id, title, description, file_name, file_path, file_size, source_origin, period_covered, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT')
       RETURNING *`,
      [
        id,
        title,
        description || '',
        cleanFileName,
        `uploads/evidence/${cleanFileName}`,
        fileSize || 150000,
        evidenceType || 'policy',
        periodStart ? `${periodStart} to ${periodEnd || 'Present'}` : 'Current',
      ]
    );

    const evItem = insRes.rows[0];

    // Link metrics/domains
    if (Array.isArray(proposedSupports)) {
      for (const link of proposedSupports) {
        await query(
          `INSERT INTO evidence_metric_links (evidence_id, metric_full_code, is_primary)
           VALUES ($1, $2, true)
           ON CONFLICT DO NOTHING`,
          [evItem.id, link]
        );
      }
    }

    return res.status(201).json({
      id: evItem.id,
      title: evItem.title,
      status: 'draft',
      fileName: evItem.file_name,
      fileSize: Number(evItem.file_size),
      description: evItem.description,
      proposedSupports: proposedSupports || [],
      addedAt: evItem.created_at,
    });
  } catch (err) {
    console.error('Error creating evidence item:', err);
    return res.status(500).json({ error: 'Failed to create evidence' });
  }
});

// Route: Submit Evidence Item
router.post('/assessments/:id/evidence/:evidenceId/submit', authenticate, requireInstitutionAccess, async (req, res) => {
  const { id, evidenceId } = req.params;

  try {
    const uRes = await query(
      `UPDATE evidence_items SET status = 'SUBMITTED', updated_at = NOW() WHERE id = $1 AND assessment_id = $2 RETURNING *`,
      [evidenceId, id]
    );
    if (uRes.rows.length === 0) {
      return res.status(404).json({ error: 'Evidence item not found' });
    }
    return res.json({ success: true, item: uRes.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit evidence' });
  }
});

// Route: Assessor Review Evidence (P0-6 Anti-Gaming & Temporal Validity)
router.post('/evidence/:id/review', authenticate, requireRole(['ASSESSOR', 'LEAD_AUDITOR', 'SUPER_ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { level, authenticityStatus, temporalValidityStatus, comments, assessorId } = req.body;

  try {
    const activeAssessorId = assessorId || req.user?.id;
    await query(
      `INSERT INTO evidence_reviews (evidence_id, assessor_id, level, authenticity_status, temporal_validity_status, comments)
       VALUES ($1, COALESCE($2, (SELECT id FROM users WHERE role = 'ASSESSOR' LIMIT 1)), $3, $4, $5, $6)`,
      [id, activeAssessorId, level || 'E2', authenticityStatus || 'verified', temporalValidityStatus || 'valid', comments || '']
    );

    await query(
      `UPDATE evidence_items SET status = 'REVIEWED', evidence_level = $1, updated_at = NOW() WHERE id = $2`,
      [level || 'E2', id]
    );

    // Anti-Gaming check: If level is E1 (Policy only), flag AG01 if assessor indicates no operational evidence
    if (level === 'E1') {
      const ev = (await query(`SELECT assessment_id FROM evidence_items WHERE id = $1`, [id])).rows[0];
      if (ev) {
        await query(
          `INSERT INTO anti_gaming_flags (assessment_id, rule_code, severity, message, evidence_id)
           VALUES ($1, 'AG01', 'WARNING', 'Policy-only evidence (E1) submitted without operational corroboration.', $2)
           ON CONFLICT DO NOTHING`,
          [ev.assessment_id, id]
        );
      }
    }

    return res.json({ success: true, message: 'Evidence review saved' });
  } catch (err) {
    console.error('Error reviewing evidence:', err);
    return res.status(500).json({ error: 'Failed to save review' });
  }
});

export default router;
