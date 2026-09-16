import PDFDocument from 'pdfkit';

export function generateAssessmentPdfStream(payload: any, res: any) {
  const isEcri = payload.report?.productCode === 'ecri' || payload.report?.productName?.includes('Employability');
  const productCode = isEcri ? 'ecri' : 'arui';
  const productTitle = isEcri ? 'EMPLOYABILITY & CAREER READINESS INDEX (ECRI)' : 'AI RESILIENT UNIVERSITY INDEX (ARUI)';
  const productSub = isEcri ? 'Institutional Employability & Career Readiness Assessment Report' : 'Institutional AI Resilience Assessment Report';
  const productAcronym = isEcri ? 'ECRI' : 'ARUI';
  const branding = payload.branding || {};

  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    bufferPages: true,
    info: {
      Title: `${productAcronym} Assessment Report — ${payload.institution?.name || 'Institution'}`,
      Author: `${productTitle} / Rafts & Rivers Higher Education Advisory`,
      Subject: productSub,
    },
  });

  doc.pipe(res);

  // Styling Palette
  const NAVY = '#1b2a47';
  const BLUE = '#2563eb';
  const TEAL = '#0e7090';
  const CHARCOAL = '#1e293b';
  const MUTED = '#64748b';
  const LIGHT_BG = '#f8fafc';
  const BORDER = '#cbd5e1';
  const AMBER = '#b45309';
  const GREEN = '#15803d';

  const isPartial = payload.report?.isPartial ?? false;
  const institutionName = payload.institution?.name || 'Institution';
  const methodologyVersion = payload.report?.methodologyVersion || (isEcri ? 'ECRI v6.0' : 'ARUI v4.0');
  const cycle = payload.assessment?.cycle || '2026 Baseline';
  const reportId = payload.report?.id || `${productAcronym}-REP`;

  // Helper function for section headings
  function addSectionHeader(title: string, yPos?: number) {
    if (yPos) doc.y = yPos;
    doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text(title, 40, doc.y);
    doc.moveDown(0.3);
    doc.rect(40, doc.y, 515, 1.5).fill(TEAL);
    doc.moveDown(0.6);
  }

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE POSITION
  // ==========================================
  // Top Banner with Admin Header Text
  doc.rect(0, 0, doc.page.width, 130).fill(NAVY);
  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text(productTitle, 40, 28);
  doc.fontSize(11).font('Helvetica').fillColor('#93c5fd').text(productSub, 40, 56);
  doc.fontSize(8.5).font('Helvetica').fillColor('#cbd5e1').text(
    `${branding.header_text || productTitle} · Methodology: ${methodologyVersion} · Status: ${payload.report?.kind?.toUpperCase() || 'OFFICIAL'}`,
    40,
    78
  );
  doc.fontSize(8).font('Helvetica').fillColor('#cbd5e1').text(
    `Contact: ${branding.contact_email || 'evaluations@he-advisory.org'} · Phone: ${branding.contact_phone || '+1 (800) 555-ECRI'}`,
    40,
    94
  );

  // Institution & Cycle Info
  doc.y = 145;
  doc.fillColor(CHARCOAL).fontSize(17).font('Helvetica-Bold').text(institutionName, 40, doc.y);
  doc.fontSize(9.5).font('Helvetica').fillColor(MUTED).text(
    `Assessment Cycle: ${cycle} · Published: ${new Date(payload.report?.generatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Report ID: ${reportId}`,
    40,
    doc.y + 4
  );

  // Executive Score Card Box
  doc.y = 195;
  doc.rect(40, doc.y, 515, isPartial ? 90 : 100).fillAndStroke(LIGHT_BG, BORDER);
  
  const boxTop = doc.y + 10;
  doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text(`Executive ${productAcronym} Performance Position`, 55, boxTop);

  if (isPartial) {
    doc.fillColor(AMBER).fontSize(10).font('Helvetica-Bold').text(
      `Overall Institutional ${productAcronym} Index: Withheld`,
      55,
      boxTop + 22
    );
    doc.fillColor(CHARCOAL).fontSize(8.5).font('Helvetica').text(
      `Assessment coverage is partial (${payload.report?.assessedDomainsCount || 3} of 11 dimensions evaluated). Aggregate score is withheld until full 11-dimension coverage is achieved.`,
      55,
      boxTop + 38,
      { width: 485 }
    );
  } else {
    doc.fillColor(CHARCOAL).fontSize(9.5).font('Helvetica').text(`Overall ${productAcronym} Index:`, 55, boxTop + 22);
    doc.fillColor(BLUE).fontSize(16).font('Helvetica-Bold').text(`${payload.overall?.domainScore ?? '—'} / 100`, 220, boxTop + 18);

    doc.fillColor(CHARCOAL).fontSize(9.5).font('Helvetica').text('Observed Maturity:', 55, boxTop + 44);
    doc.fillColor(NAVY).fontSize(10).font('Helvetica-Bold').text(`Level ${payload.overall?.currentMaturity ?? '—'} of 5`, 220, boxTop + 44);

    doc.fillColor(CHARCOAL).fontSize(9.5).font('Helvetica').text('Required Context (Rd):', 55, boxTop + 64);
    doc.fillColor(TEAL).fontSize(10).font('Helvetica-Bold').text(`Level ${payload.overall?.requiredMaturity ?? '—'} of 5`, 220, boxTop + 64);

    doc.fillColor(CHARCOAL).fontSize(9.5).font('Helvetica').text('Transformation Gap:', 350, boxTop + 64);
    doc.fillColor(AMBER).fontSize(10).font('Helvetica-Bold').text(
      `${(payload.overall?.transformationDistance || 0) > 0 ? '+' : ''}${payload.overall?.transformationDistance ?? 0} Levels`,
      470,
      boxTop + 64
    );
  }

  // Executive Summary Narrative
  doc.y = isPartial ? 300 : 310;
  addSectionHeader('1. Executive Diagnostic Interpretation');
  doc.fillColor(CHARCOAL).fontSize(9).font('Helvetica').lineGap(2.5).text(
    payload.executiveSummary?.narrative ||
      'Holistic institutional evaluation across strategy, governance, curriculum co-design, experiential learning, and career outcomes.',
    40,
    doc.y,
    { width: 515 }
  );

  // Key Strategic Priorities
  doc.moveDown(0.8);
  addSectionHeader('2. Priority Transformation Imperatives');
  const immediate = payload.priorities?.immediateActions || [];
  let priY = doc.y;
  for (const pri of immediate.slice(0, 3)) {
    doc.fillColor(BLUE).fontSize(10).text('▪', 45, priY);
    doc.fillColor(CHARCOAL).fontSize(8.5).font('Helvetica').text(pri, 58, priY, { width: 490 });
    priY = doc.y + 4;
  }

  // Cover Confidentiality Box at bottom
  doc.rect(40, doc.page.height - 70, 515, 34).fill('#f1f5f9');
  doc.fillColor(MUTED).fontSize(7.5).font('Helvetica').text(
    `CONFIDENTIALITY NOTICE: This diagnostic report is prepared strictly for university leadership. ${branding.footer_text || 'Confidential & Proprietary © Higher Education Advisory Benchmark'}`,
    50,
    doc.page.height - 60,
    { width: 495, align: 'center' }
  );

  // ==========================================
  // PAGE 2: 11-DIMENSION SCOREBOARD & BREAKDOWN
  // ==========================================
  doc.addPage();
  addSectionHeader(`3. 11-Dimension ${productAcronym} Performance Scoreboard`);
  doc.fillColor(MUTED).fontSize(8).font('Helvetica').text(
    `Granular dimension-level performance comparing Observed Maturity with Context-Calibrated Target Maturity (Rd).`,
    40,
    doc.y
  );
  doc.moveDown(0.5);

  let domTableY = doc.y;
  doc.rect(40, domTableY, 515, 18).fill(NAVY);
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
    .text('Code', 45, domTableY + 5)
    .text('Dimension Pillar', 80, domTableY + 5)
    .text('Observed', 290, domTableY + 5)
    .text('Required', 345, domTableY + 5)
    .text('Distance', 405, domTableY + 5)
    .text('Score', 460, domTableY + 5)
    .text('Status', 505, domTableY + 5);

  let dRowY = domTableY + 18;
  const domains = payload.domains || [];
  for (let i = 0; i < domains.length; i++) {
    const d = domains[i];
    const isEven = i % 2 === 0;
    doc.rect(40, dRowY, 515, 18).fill(isEven ? LIGHT_BG : '#ffffff');
    doc.rect(40, dRowY, 515, 18).stroke(BORDER);

    doc.fillColor(BLUE).fontSize(7.5).font('Helvetica-Bold').text(d.code, 45, dRowY + 5);
    doc.fillColor(CHARCOAL).fontSize(7).font('Helvetica').text(d.name, 80, dRowY + 5, { width: 205, ellipsis: true });
    doc.fillColor(CHARCOAL).fontSize(7.5).font('Helvetica-Bold').text(d.assessed ? `L${d.currentMaturity}` : '—', 300, dRowY + 5);
    doc.fillColor(TEAL).text(`L${d.requiredMaturity}`, 355, dRowY + 5);
    doc.fillColor(d.transformationDistance > 0 ? AMBER : GREEN).text(
      d.assessed ? `${d.transformationDistance > 0 ? '+' : ''}${d.transformationDistance}` : '—',
      415,
      dRowY + 5
    );
    doc.fillColor(NAVY).text(d.assessed && d.domainScore !== null ? `${d.domainScore}%` : '—', 460, dRowY + 5);
    doc.fillColor(d.assessed ? GREEN : MUTED).fontSize(7).font('Helvetica').text(d.assessed ? 'Assessed' : 'Pending', 505, dRowY + 5);

    dRowY += 18;
  }

  doc.y = dRowY + 12;
  addSectionHeader('4. Cross-Domain Diagnostic Signals & Contradiction Alerts');
  const findings = payload.crossDomain?.findings || [];
  if (findings.length === 0) {
    doc.fillColor(CHARCOAL).fontSize(8).font('Helvetica').text('No cross-domain contradictions or capability imbalances detected.', 45, doc.y);
  } else {
    for (const f of findings.slice(0, 3)) {
      doc.rect(40, doc.y, 515, 28).fillAndStroke('#fffbeb', '#fde68a');
      doc.fillColor(AMBER).fontSize(7.5).font('Helvetica-Bold').text(`Diagnostic Signal [${f.ruleId || 'CD'}]: ${f.severity || 'OBSERVATION'}`, 48, doc.y + 4);
      doc.fillColor(CHARCOAL).fontSize(7).font('Helvetica').text(f.message, 48, doc.y + 14, { width: 495 });
      doc.y += 32;
    }
  }

  // ==========================================
  // PAGE 3: GAP ANALYSIS & TRANSFORMATION ROADMAP
  // ==========================================
  doc.addPage();
  addSectionHeader('5. Detailed Gap Analysis (Observed vs Required Context Rd)');
  
  let gapTableY = doc.y;
  doc.rect(40, gapTableY, 515, 18).fill(NAVY);
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
    .text('Dimension', 45, gapTableY + 5)
    .text('Observed', 220, gapTableY + 5)
    .text('Required', 275, gapTableY + 5)
    .text('Gap', 330, gapTableY + 5)
    .text('Priority', 370, gapTableY + 5)
    .text('Recommended Focus', 430, gapTableY + 5);

  let gRowY = gapTableY + 18;
  const gapList = payload.gapAnalysis || [];
  for (let i = 0; i < gapList.length; i++) {
    const g = gapList[i];
    const isEven = i % 2 === 0;
    doc.rect(40, gRowY, 515, 17).fill(isEven ? LIGHT_BG : '#ffffff');
    doc.rect(40, gRowY, 515, 17).stroke(BORDER);

    doc.fillColor(CHARCOAL).fontSize(7).font('Helvetica').text(`${g.domainCode}: ${g.domainName}`, 45, gRowY + 4, { width: 170, ellipsis: true });
    doc.fillColor(NAVY).fontSize(7.5).font('Helvetica-Bold').text(`L${g.observedMaturity}`, 225, gRowY + 4);
    doc.fillColor(TEAL).text(`L${g.requiredMaturity}`, 280, gRowY + 4);
    doc.fillColor(g.gap > 0 ? AMBER : GREEN).text(`${g.gap > 0 ? '+' : ''}${g.gap}`, 335, gRowY + 4);
    doc.fillColor(g.priority === 'Critical' ? AMBER : (g.priority === 'High' ? BLUE : GREEN)).text(g.priority, 370, gRowY + 4);
    doc.fillColor(CHARCOAL).fontSize(6.5).font('Helvetica').text(g.recommendedAction, 430, gRowY + 4, { width: 120, ellipsis: true });

    gRowY += 17;
  }

  doc.y = gRowY + 12;
  addSectionHeader('6. 3-Horizon Transformation Action Roadmap');
  const roadmap = payload.transformationRoadmap || [];
  for (const rm of roadmap) {
    doc.fillColor(BLUE).fontSize(8.5).font('Helvetica-Bold').text(`${rm.horizon} — ${rm.title}`, 40, doc.y);
    doc.moveDown(0.2);
    for (const it of rm.interventions) {
      doc.fillColor(TEAL).fontSize(9).text('•', 45, doc.y);
      doc.fillColor(CHARCOAL).fontSize(7.5).font('Helvetica').text(it, 56, doc.y - 1, { width: 495 });
      doc.moveDown(0.3);
    }
    doc.moveDown(0.3);
  }

  // ==========================================
  // PAGE 4+: FULL CANONICAL METRIC TRACEABILITY APPENDIX
  // ==========================================
  doc.addPage();
  const metricCount = payload.metricAuditAppendix?.length || (isEcri ? 132 : 143);
  addSectionHeader(`7. Appendix: Full ${metricCount}-Metric Traceability Dataset`);
  doc.fillColor(MUTED).fontSize(7.5).font('Helvetica').text(
    `Auditable ledger of all canonical metrics across 11 dimensions with M/I/O breakdown, evidence references, and assessor verification.`,
    40,
    doc.y
  );
  doc.moveDown(0.5);

  const metrics = payload.metricAuditAppendix || [];
  const renderTraceabilityTableHeader = (y: number) => {
    doc.rect(40, y, 515, 17).fill(NAVY);
    doc.fillColor('#ffffff').fontSize(7).font('Helvetica-Bold')
      .text('Metric Code', 45, y + 5)
      .text('Capability & Metric Name', 105, y + 5)
      .text('M', 320, y + 5)
      .text('I', 335, y + 5)
      .text('O', 350, y + 5)
      .text('Score', 370, y + 5)
      .text('Status', 415, y + 5)
      .text('Assessor Review', 465, y + 5);
  };

  let rowAppendixY = doc.y;
  renderTraceabilityTableHeader(rowAppendixY);
  rowAppendixY += 17;

  for (let idx = 0; idx < metrics.length; idx++) {
    const m = metrics[idx];

    if (rowAppendixY > doc.page.height - 55) {
      doc.addPage();
      rowAppendixY = 40;
      renderTraceabilityTableHeader(rowAppendixY);
      rowAppendixY += 17;
    }

    const isEven = idx % 2 === 0;
    doc.rect(40, rowAppendixY, 515, 15).fill(isEven ? LIGHT_BG : '#ffffff');
    doc.rect(40, rowAppendixY, 515, 15).stroke(BORDER);

    doc.fillColor(BLUE).fontSize(6.5).font('Helvetica-Bold').text(m.metricCode, 45, rowAppendixY + 4);
    doc.fillColor(CHARCOAL).fontSize(6.5).font('Helvetica').text(m.metricName, 105, rowAppendixY + 4, { width: 205, ellipsis: true });
    doc.fillColor(CHARCOAL).fontSize(6.5).font('Helvetica').text(String(m.maturity), 320, rowAppendixY + 4);
    doc.text(String(m.implementation), 335, rowAppendixY + 4);
    doc.text(String(m.outcomes), 350, rowAppendixY + 4);
    doc.fillColor(NAVY).font('Helvetica-Bold').text(m.score, 370, rowAppendixY + 4);
    doc.fillColor(m.status === 'Assessed' ? GREEN : MUTED).font('Helvetica').text(m.status, 415, rowAppendixY + 4);
    doc.fillColor(CHARCOAL).fontSize(6).text(m.assessorStatus, 465, rowAppendixY + 4, { width: 85, ellipsis: true });

    rowAppendixY += 15;
  }

  // ==========================================
  // FOOTER ON ALL PAGES WITH DYNAMIC BRANDING
  // ==========================================
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.rect(40, doc.page.height - 28, 515, 0.75).fill(BORDER);
    doc.fillColor(MUTED).fontSize(7).font('Helvetica').text(
      `${branding.footer_text || `${productAcronym} Assessment Report`} · ${institutionName} · Report ID: ${reportId} · Page ${i + 1} of ${range.count}`,
      40,
      doc.page.height - 20,
      { align: 'center', width: 515 }
    );
  }

  doc.end();
}
