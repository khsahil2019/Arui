import PDFDocument from 'pdfkit';

export function generateAssessmentPdfStream(payload: any, res: any) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
    info: {
      Title: `ARUI Assessment Report — ${payload.institution?.name || 'University'}`,
      Author: 'AI Resilient University Index (ARUI)',
      Subject: 'Institutional AI Resilience Assessment Report',
    },
  });

  doc.pipe(res);

  // Helper colors matching ARUI palette
  const NAVY = '#1b2a47';
  const BLUE = '#2b5ea7';
  const CHARCOAL = '#22252a';
  const MUTED = '#667085';
  const BORDER = '#d0d5dd';
  const AMBER = '#b54708';
  const TEAL = '#0e7090';

  // --- PAGE 1: COVER PAGE ---
  doc.rect(0, 0, doc.page.width, 140).fill(NAVY);

  doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold')
    .text('AI RESILIENT UNIVERSITY INDEX', 50, 45);
  doc.fontSize(13).font('Helvetica')
    .text('Institutional AI Resilience Assessment Report', 50, 78);
  doc.fontSize(10).fillColor('#94a3b8')
    .text(`Methodology: ${payload.report?.methodologyVersion || 'v4.0'} · ${payload.report?.kind?.toUpperCase() || 'PRELIMINARY'}`, 50, 98);

  doc.moveDown(4);
  doc.fillColor(CHARCOAL).fontSize(20).font('Helvetica-Bold')
    .text(payload.institution?.name || 'Apex National University', 50, 180);

  doc.fontSize(11).font('Helvetica').fillColor(MUTED)
    .text(`Cycle: ${payload.assessment?.cycle || '2026 Baseline'} · Generated: ${new Date(payload.report?.generatedAt || Date.now()).toLocaleDateString()}`, 50, 210);

  // Executive Score Card
  doc.rect(50, 245, doc.page.width - 100, 110).fillAndStroke('#f8fafc', BORDER);
  doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold')
    .text('Institutional AI Resilience Position', 70, 260);

  doc.fontSize(10).font('Helvetica').fillColor(CHARCOAL)
    .text(`Overall Preliminary Index:`, 70, 285)
    .font('Helvetica-Bold').fontSize(16).fillColor(BLUE)
    .text(`${payload.overall?.domainScore ?? '—'}%`, 220, 280);

  doc.fontSize(10).font('Helvetica').fillColor(CHARCOAL)
    .text(`Current Maturity Level:`, 70, 310)
    .font('Helvetica-Bold').fontSize(12).fillColor(CHARCOAL)
    .text(`Level ${payload.overall?.currentMaturity ?? '—'} (Emerging / Structured)`, 200, 310);

  doc.fontSize(10).font('Helvetica').fillColor(CHARCOAL)
    .text(`Required Maturity (P0-4 Context):`, 70, 330)
    .font('Helvetica-Bold').fontSize(12).fillColor(TEAL)
    .text(`Level ${payload.overall?.requiredMaturity ?? '4'} (Advanced)`, 250, 330);

  // Executive Narrative
  doc.moveDown(5);
  doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold')
    .text('1. Executive Summary', 50, 380);

  doc.fillColor(CHARCOAL).fontSize(10).font('Helvetica').lineGap(3)
    .text(payload.executiveSummary?.narrative || 'Holistic institutional assessment across strategy, governance, curriculum, faculty and learning systems.', 50, 405, { width: 495 });

  // Key Strategic Priorities
  doc.moveDown(2);
  doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold')
    .text('Immediate Transformation Priorities:', 50, 490);

  let pY = 515;
  const priorities = payload.priorities?.immediateActions || [];
  for (const pri of priorities) {
    doc.fillColor(BLUE).fontSize(10).text('•', 55, pY);
    doc.fillColor(CHARCOAL).fontSize(9.5).font('Helvetica').text(pri, 70, pY, { width: 475 });
    pY += 22;
  }

  // Cover Confidentiality Footer
  doc.rect(50, doc.page.height - 70, doc.page.width - 100, 35).fill('#f1f5f9');
  doc.fillColor(MUTED).fontSize(8).font('Helvetica')
    .text(payload.report?.confidentiality || 'Confidential document for university executive leadership.', 60, doc.page.height - 60, { width: 475, align: 'center' });

  // --- PAGE 2: DOMAIN RESULTS TABLE ---
  doc.addPage();
  doc.fillColor(NAVY).fontSize(16).font('Helvetica-Bold')
    .text('2. Domain Assessment Results (D01–D11)', 50, 50);

  doc.fontSize(9.5).font('Helvetica').fillColor(MUTED)
    .text('Evaluation across 11 core institutional resilience domains based on assessor M/I/O scoring and evidence review.', 50, 72);

  // Table Header
  const tY = 95;
  doc.rect(50, tY, 495, 24).fill(NAVY);
  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold')
    .text('Code', 55, tY + 7)
    .text('Domain Pillar', 95, tY + 7)
    .text('Current', 310, tY + 7)
    .text('Required', 360, tY + 7)
    .text('Distance', 415, tY + 7)
    .text('Score', 485, tY + 7);

  let rowY = tY + 24;
  const domains = payload.domains || [];

  for (let i = 0; i < domains.length; i++) {
    const d = domains[i];
    const isEven = i % 2 === 0;
    doc.rect(50, rowY, 495, 26).fill(isEven ? '#f8fafc' : '#ffffff');
    doc.rect(50, rowY, 495, 26).stroke(BORDER);

    doc.fillColor(BLUE).fontSize(8.5).font('Helvetica-Bold').text(d.code, 55, rowY + 8);
    doc.fillColor(CHARCOAL).fontSize(8).font('Helvetica').text(d.name, 95, rowY + 8, { width: 205, ellipsis: true });
    doc.fillColor(CHARCOAL).font('Helvetica-Bold').text(d.assessed ? `L${d.currentMaturity}` : '—', 320, rowY + 8);
    doc.fillColor(TEAL).font('Helvetica-Bold').text(`L${d.requiredMaturity}`, 375, rowY + 8);
    doc.fillColor(d.transformationDistance > 0 ? AMBER : TEAL).text(d.assessed ? `${d.transformationDistance > 0 ? '+' : ''}${d.transformationDistance}` : '—', 430, rowY + 8);
    doc.fillColor(NAVY).text(d.assessed ? `${d.domainScore}%` : 'Pending', 485, rowY + 8);

    rowY += 26;
  }

  // --- PAGE 3: CROSS-DOMAIN DIAGNOSTICS & EVIDENCE ---
  doc.moveDown(2);
  doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold')
    .text('3. Cross-Domain Diagnostics & Contradiction Signals (P0-5)', 50, rowY + 25);

  let cY = rowY + 50;
  const findings = payload.crossDomain?.findings || [];
  for (const f of findings) {
    doc.rect(50, cY, 495, 45).fillAndStroke('#fffbeb', '#fef3c7');
    doc.fillColor(AMBER).fontSize(9).font('Helvetica-Bold')
      .text(`Diagnostic Signal [${f.ruleId || 'CD-RULE'}]: ${f.severity || 'OBSERVATION'}`, 60, cY + 8);
    doc.fillColor(CHARCOAL).fontSize(8.5).font('Helvetica')
      .text(f.message, 60, cY + 22, { width: 475 });
    cY += 52;
  }

  // Assessor Observations & Methodology Note
  doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold')
    .text('4. Assessor Observations & Recommendations', 50, cY + 20);

  let oY = cY + 45;
  const obs = payload.assessorObservations || [];
  for (const item of obs) {
    doc.fillColor(CHARCOAL).fontSize(9.5).font('Helvetica-Bold').text(`• ${item.topic}:`, 55, oY);
    doc.fillColor(CHARCOAL).fontSize(9).font('Helvetica').text(item.observation, 70, oY + 14, { width: 475 });
    oY += 36;
  }

  // Footer on all pages
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(MUTED).fontSize(8).font('Helvetica')
      .text(
        `ARUI Report ID: ${payload.report?.id || 'ARUI-REP'} | Page ${i + 1} of ${range.count}`,
        50,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 100 }
      );
  }

  doc.end();
}
