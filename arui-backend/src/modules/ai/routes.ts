import { Router } from 'express';
import { query } from '../../db/index.js';
import { authenticate, requireInstitutionAccess } from '../../middleware/auth.js';
import { requireAssessmentEngineAccess } from '../../middleware/entitlement.js';
import { extractEvidence, analyzeEvidence, reconcileClaim } from './index.js';

const router = Router();

// Route: Get all reconciliation records for an assessment
router.get('/assessments/:id/reconciliations', authenticate, requireInstitutionAccess, requireAssessmentEngineAccess(), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      `SELECT * FROM reconciliation_records WHERE assessment_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    const records = result.rows.map((row) => ({
      id: row.id,
      assessmentId: row.assessment_id,
      metricCode: row.metric_code,
      questionId: row.question_id,
      institutionClaim: row.institution_claim,
      evidenceId: row.evidence_id,
      evidenceFileName: row.evidence_file_name,
      extractedFacts: row.extracted_facts || [],
      extractedValues: row.extracted_values || {},
      extractionConfidence: Number(row.extraction_confidence) || 1.0,
      reconciliationStatus: row.reconciliation_status,
      detectedVariance: row.detected_variance,
      reconciliationExplanation: row.reconciliation_explanation,
      institutionClarification: row.institution_clarification,
      closedByInstitution: row.closed_by_institution,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.json({ reconciliations: records });
  } catch (err: any) {
    console.error('Error fetching reconciliation records:', err);
    return res.status(500).json({ error: 'Failed to fetch reconciliation records' });
  }
});

// Route: Reconcile a Claim against Evidence
router.post('/assessments/:id/ai/reconcile-claim', authenticate, requireInstitutionAccess, requireAssessmentEngineAccess(), async (req, res) => {
  const { id } = req.params;
  const { metricCode, questionId, institutionClaim, evidenceId, clarificationText } = req.body;

  if (!metricCode || institutionClaim === undefined) {
    return res.status(400).json({ error: 'metricCode and institutionClaim are required' });
  }

  try {
    let evidenceText = '';
    let evidenceFileName = '';

    if (evidenceId) {
      const evRes = await query(`SELECT * FROM evidence_items WHERE id = $1 AND assessment_id = $2`, [evidenceId, id]);
      if (evRes.rows.length > 0) {
        const ev = evRes.rows[0];
        evidenceFileName = ev.file_name;
        evidenceText = ev.description || `Evidence document ${ev.file_name}`;
      }
    }

    const finding = await reconcileClaim({
      assessmentId: String(id),
      metricCode,
      questionId,
      institutionClaim,
      evidenceId,
      evidenceFileName,
      evidenceText,
    });

    const detectedVariance = finding.status === 'POTENTIAL_MISMATCH' && finding.evidenceSupportedValue !== undefined
      ? `Reported: ${institutionClaim} vs Identifiable in Evidence: ${finding.evidenceSupportedValue}`
      : null;

    const explanation = finding.basis.join('; ') + (finding.limitations.length ? ` Limitations: ${finding.limitations.join('; ')}` : '');

    // Insert or update persistent reconciliation record
    const insertRes = await query(
      `INSERT INTO reconciliation_records 
        (assessment_id, metric_code, question_id, institution_claim, evidence_id, evidence_file_name, extracted_facts, extracted_values, extraction_confidence, reconciliation_status, detected_variance, reconciliation_explanation, institution_clarification, closed_by_institution)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, false)
       RETURNING *`,
      [
        id,
        metricCode,
        questionId || null,
        String(institutionClaim),
        evidenceId || null,
        evidenceFileName || null,
        JSON.stringify(finding.basis || []),
        JSON.stringify({ supportedValue: finding.evidenceSupportedValue }),
        finding.confidence,
        finding.status,
        detectedVariance,
        explanation,
        clarificationText || null,
      ]
    );

    return res.json({
      success: true,
      finding,
      reconciliationRecord: insertRes.rows[0],
    });
  } catch (err: any) {
    console.error('Error during claim-evidence reconciliation:', err);
    return res.status(500).json({ error: 'Failed to complete claim-evidence reconciliation' });
  }
});

// Route: Handle Institution Action on Mismatch / Reconciliation Record
router.post('/assessments/:id/reconciliations/:recId/action', authenticate, requireInstitutionAccess, requireAssessmentEngineAccess(), async (req, res) => {
  const { id, recId } = req.params;
  const { action, clarificationText, newEvidenceId } = req.body;
  // action: 'continue_with_current' | 'clarify' | 'replace_evidence' | 'upload_another'

  try {
    const existingRes = await query(
      `SELECT * FROM reconciliation_records WHERE id = $1 AND assessment_id = $2`,
      [recId, id]
    );

    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Reconciliation record not found' });
    }

    if (action === 'continue_with_current') {
      // Non-destructive: Preserve institution claim and record status = CLOSED_BY_INSTITUTION
      await query(
        `UPDATE reconciliation_records SET 
          closed_by_institution = true,
          institution_clarification = COALESCE($1, institution_clarification),
          updated_at = NOW()
         WHERE id = $2`,
        [clarificationText || 'Institution acknowledged mismatch and chose to continue with current submitted evidence.', recId]
      );

      return res.json({
        success: true,
        message: 'Institution decision recorded. Original claim preserved alongside evidence-supported value.',
        status: 'POTENTIAL_MISMATCH',
        evidenceSetStatus: 'CLOSED_BY_INSTITUTION',
      });
    }

    if (action === 'clarify') {
      await query(
        `UPDATE reconciliation_records SET 
          institution_clarification = $1,
          updated_at = NOW()
         WHERE id = $2`,
        [clarificationText, recId]
      );
      return res.json({ success: true, message: 'Clarification recorded successfully.' });
    }

    if (action === 'replace_evidence' && newEvidenceId) {
      await query(
        `UPDATE reconciliation_records SET 
          evidence_id = $1,
          reconciliation_status = 'AI_ANALYSIS_PENDING',
          updated_at = NOW()
         WHERE id = $2`,
        [newEvidenceId, recId]
      );
      return res.json({ success: true, message: 'Evidence replaced. Re-analysis queued.' });
    }

    return res.json({ success: true, message: `Action '${action}' processed.` });
  } catch (err: any) {
    console.error('Error recording reconciliation action:', err);
    return res.status(500).json({ error: 'Failed to record reconciliation action' });
  }
});

// Route: Retry / Resume AI Analysis
router.post('/assessments/:id/ai/retry-analysis', authenticate, requireInstitutionAccess, requireAssessmentEngineAccess(), async (req, res) => {
  const { id } = req.params;
  try {
    const pendingRes = await query(
      `SELECT * FROM reconciliation_records WHERE assessment_id = $1 AND reconciliation_status = 'AI_ANALYSIS_PENDING'`,
      [id]
    );

    let reprocessed = 0;
    for (const row of pendingRes.rows) {
      const finding = await reconcileClaim({
        assessmentId: String(id),
        metricCode: row.metric_code,
        questionId: row.question_id,
        institutionClaim: row.institution_claim,
        evidenceId: row.evidence_id,
        evidenceFileName: row.evidence_file_name,
        evidenceText: `Evidence artifact for ${row.metric_code}`,
      });

      await query(
        `UPDATE reconciliation_records SET
          reconciliation_status = $1,
          extraction_confidence = $2,
          extracted_facts = $3,
          reconciliation_explanation = $4,
          updated_at = NOW()
         WHERE id = $5`,
        [finding.status, finding.confidence, JSON.stringify(finding.basis), finding.basis.join('; '), row.id]
      );
      reprocessed++;
    }

    return res.json({
      success: true,
      reprocessedCount: reprocessed,
      message: `Successfully re-analyzed ${reprocessed} pending records.`,
    });
  } catch (err: any) {
    console.error('Error retrying AI analysis:', err);
    return res.status(500).json({ error: 'Failed to retry AI analysis' });
  }
});

export default router;
