import { Router } from 'express';
import { buildAssessmentReportPayload } from './payload.js';
import { generateAssessmentPdfStream } from './pdf.js';

const router = Router();

// Route: Get Assessment Report Payload (JSON)
router.get('/assessments/:id/report/preliminary', async (req, res) => {
  const { id } = req.params;
  try {
    const payload = await buildAssessmentReportPayload(id);
    return res.json(payload);
  } catch (err: any) {
    console.error('Error building report payload:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate report payload' });
  }
});

// Route: Stream Server-Generated Assessment Report PDF
router.get('/assessments/:id/report/preliminary.pdf', async (req, res) => {
  const { id } = req.params;
  try {
    const payload = await buildAssessmentReportPayload(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="ARUI_Assessment_Report_${payload.institution?.name?.replace(/\s+/g, '_') || 'Report'}.pdf"`
    );

    generateAssessmentPdfStream(payload, res);
  } catch (err: any) {
    console.error('Error generating PDF report:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate PDF' });
  }
});

export default router;
