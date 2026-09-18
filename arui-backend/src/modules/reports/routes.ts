import { Router } from 'express';
import { buildAssessmentReportPayload } from './payload.js';
import { generateAssessmentPdfStream } from './pdf.js';
import { authenticate, requireInstitutionAccess } from '../../middleware/auth.js';
import { requireAssessmentEngineAccess } from '../../middleware/entitlement.js';

const router = Router();

// Route: Get Assessment Report Payload (JSON)
router.get(
  ['/assessments/:id/report/preliminary', '/assessments/:id/report', '/reports/:id/json', '/reports/:id'],
  authenticate,
  requireInstitutionAccess,
  requireAssessmentEngineAccess(),
  async (req, res) => {
    const id = req.params.id as string;
    try {
      const payload = await buildAssessmentReportPayload(id);
      return res.json(payload);
    } catch (err: any) {
      console.error('Error building report payload:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate report payload' });
    }
  }
);

// Route: Stream Server-Generated Assessment Report PDF
router.get(
  ['/reports/:id/pdf', '/assessments/:id/report/preliminary.pdf', '/assessments/:id/report/pdf', '/assessments/:id/pdf'],
  authenticate,
  requireInstitutionAccess,
  requireAssessmentEngineAccess(),
  async (req, res) => {
    const id = req.params.id as string;
    try {
      const payload = await buildAssessmentReportPayload(id);

      const sanitizedName = (payload.institution?.name || 'Institution').replace(/[^a-zA-Z0-9_-]/g, '_');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${payload.report?.productCode === 'ecri' ? 'ECRI' : 'ARUI'}_Assessment_Report_${sanitizedName}.pdf"`
      );

      generateAssessmentPdfStream(payload, res);
    } catch (err: any) {
      console.error('Error generating PDF report:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate PDF' });
    }
  }
);

export default router;
