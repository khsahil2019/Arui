import PDFDocument from 'pdfkit';

export function generateAssessmentPdfStream(payload: any, res: any) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    bufferPages: true,
    info: {
      Title: `ARUI Assessment Report — ${payload.institution?.name || 'Institution'}`,
      Author: 'AI Resilient University Index (ARUI) / Rafts & Rivers',
      Subject: 'Institutional AI Resilience Assessment Report',
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

  const isPartial = payload.report?.isPartial ?? true;
  const institutionName = payload.institution?.name || 'Institution';
  const methodologyVersion = payload.report?.methodologyVersion || 'ARUI v4.0';
  const cycle = payload.assessment?.cycle || '2026 Baseline';
  const reportId = payload.report?.id || 'ARUI-REP';

  // Helper function for section headings
  function addSectionHeader(title: string, yPos?: number) {
    if (yPos) doc.y = yPos;
    doc.fillColor(NAVY).fontSize(13).font('Helvetica-Bold').text(title, 40, doc.y);
    doc.moveDown(0.4);
    doc.rect(40, doc.y, 515, 1.5).fill(TEAL);
    doc.moveDown(0.8);
  }

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE POSITION
  // ==========================================
  // Top Banner
  doc.rect(0, 0, doc.page.width, 130).fill(NAVY);
  doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('AI RESILIENT UNIVERSITY INDEX', 40, 32);
  doc.fontSize(12).font('Helvetica').fillColor('#93c5fd').text('Institutional AI Resilience Assessment Report', 40, 62);
  doc.fontSize(9.5).font('Helvetica').fillColor('#cbd5e1').text(
    `Methodology: ${methodologyVersion} · Assessed by Rafts & Rivers · Status: ${payload.report?.kind?.toUpperCase() || 'PRELIMINARY'}`,
    40,
    82
  );

  // Institution & Cycle Info
  doc.y = 145;
  doc.fillColor(CHARCOAL).fontSize(18).font('Helvetica-Bold').text(institutionName, 40, doc.y);
  doc.fontSize(10).font('Helvetica').fillColor(MUTED).text(
    `Cycle: ${cycle} · Published: ${new Date(payload.report?.generatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Report ID: ${reportId}`,
    40,
    doc.y + 4
  );

  // Executive Score Card Box
  doc.y = 200;
  doc.rect(40, doc.y, 515, isPartial ? 90 : 105).fillAndStroke(LIGHT_BG, BORDER);
  
  const boxTop = doc.y + 12;
  doc.fillColor(NAVY).fontSize(12).font('Helvetica-Bold').text('Executive AI Resilience Position', 55, boxTop);

  if (isPartial) {
    doc.fillColor(AMBER).fontSize(10).font('Helvetica-Bold').text(
      'Overall Institutional ARUI Index: Withheld',
      55,
      boxTop + 24
    );
    doc.fillColor(CHARCOAL).fontSize(9).font('Helvetica').text(
      `Assessment coverage is partial (${payload.report?.assessedDomainsCount || 3} of 11 core domains evaluated). Institution-wide aggregate score is withheld until full 11-domain coverage is achieved. Individual assessed domain baselines are reported below.`,
      55,
      boxTop + 42,
      { width: 485 }
    );
  } else {
    doc.fillColor(CHARCOAL).fontSize(10).font('Helvetica').text('Overall Institutional ARUI Index:', 55, boxTop + 24);
    doc.fillColor(BLUE).fontSize(16).font('Helvetica-Bold').text(`${payload.overall?.domainScore ?? '—'}%`, 240, boxTop + 20);

    doc.fillColor(CHARCOAL).fontSize(10).font('Helvetica').text('Observed Maturity:', 55, boxTop + 48);
    doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text(`Level ${payload.overall?.currentMaturity ?? '—'} of 5`, 240, boxTop + 48);

    doc.fillColor(CHARCOAL).fontSize(10).font('Helvetica').text('Required Maturity (Context Rd):', 55, boxTop + 68);
    doc.fillColor(TEAL).fontSize(11).font('Helvetica-Bold').text(`Level ${payload.overall?.requiredMaturity ?? '4'} of 5`, 240, boxTop + 68);

    doc.fillColor(CHARCOAL).fontSize(10).font('Helvetica').text('Transformation Distance:', 360, boxTop + 68);
    doc.fillColor(AMBER).fontSize(11).font('Helvetica-Bold').text(
      `${(payload.overall?.transformationDistance || 0) > 0 ? '+' : ''}${payload.overall?.transformationDistance ?? 0} Levels`,
      480,
      boxTop + 68
    );
  }

  // Executive Summary Narrative
  doc.y = isPartial ? 305 : 325;
  addSectionHeader('1. Executive Diagnostic Interpretation');
  doc.fillColor(CHARCOAL).fontSize(9.5).font('Helvetica').lineGap(3).text(
    payload.executiveSummary?.narrative ||
      'Holistic institutional assessment across strategy, governance, curriculum, faculty and learning systems.',
    40,
    doc.y,
    { width: 515 }
  );

  // Key Strategic Priorities
  doc.moveDown(1.2);
  addSectionHeader('2. Priority Transformation Imperatives');
  const immediate = payload.priorities?.immediateActions || [];
  let priY = doc.y;
  for (const pri of immediate.slice(0, 3)) {
    doc.fillColor(BLUE).fontSize(11).text('▪', 45, priY);
    doc.fillColor(CHARCOAL).fontSize(9).font('Helvetica').text(pri, 60, priY, { width: 490 });
    priY = doc.y + 6;
  }

  // Cover Confidentiality Box at bottom
  doc.rect(40, doc.page.height - 75, 515, 38).fill('#f1f5f9');
  doc.fillColor(MUTED).fontSize(7.5).font('Helvetica').text(
    'CONFIDENTIALITY NOTICE: This diagnostic report is prepared strictly for university leadership. ARUI provides developmental institutional capability diagnostics and is not an accredited ranking, certification, or statutory compliance audit.',
    50,
    doc.page.height - 65,
    { width: 495, align: 'center' }
  );

  // ==========================================
  // PAGE 2: 25-FIELD INSTITUTIONAL PROFILE
  // ==========================================
  doc.addPage();
  addSectionHeader('3. ARUI Institutional Profile & Context Calibration (25 Fields)');
  doc.fillColor(MUTED).fontSize(8.5).font('Helvetica').text(
    'Baseline organizational scale, demographic structure, and context factors used to calibrate Required Maturity (P0-4).',
    40,
    doc.y
  );
  doc.moveDown(0.8);

  const profileGroups = payload.institution?.profile || [];
  for (const grp of profileGroups) {
    doc.fillColor(NAVY).fontSize(9.5).font('Helvetica-Bold').text(grp.group, 40, doc.y);
    doc.moveDown(0.3);

    // Render Field Table
    let tableY = doc.y;
    doc.rect(40, tableY, 515, 18).fill(NAVY);
    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('ID', 45, tableY + 5);
    doc.text('Profile Parameter', 90, tableY + 5);
    doc.text('Institutional Value', 310, tableY + 5);

    let rowY = tableY + 18;
    for (let idx = 0; idx < grp.fields.length; idx++) {
      const f = grp.fields[idx];
      const isEven = idx % 2 === 0;
      doc.rect(40, rowY, 515, 18).fill(isEven ? LIGHT_BG : '#ffffff');
      doc.rect(40, rowY, 515, 18).stroke(BORDER);

      doc.fillColor(BLUE).fontSize(8).font('Helvetica-Bold').text(f.id, 45, rowY + 5);
      doc.fillColor(CHARCOAL).fontSize(8).font('Helvetica').text(f.label, 90, rowY + 5, { width: 210, ellipsis: true });
      doc.fillColor(NAVY).fontSize(8).font('Helvetica-Bold').text(String(f.value), 310, rowY + 5, { width: 235, ellipsis: true });
      rowY += 18;
    }
    doc.y = rowY + 10;
  }

  // Methodology Architecture Card
  doc.moveDown(0.5);
  addSectionHeader('4. Methodology Architecture & Scoring Formula');
  doc.fillColor(CHARCOAL).fontSize(8.5).font('Helvetica').lineGap(2.5).text(
    'The ARUI framework evaluates institutional resilience across 11 core domains, 143 capabilities, and 143 metrics. Metric scores are computed strictly server-side using standard rubric anchors:\n' +
    '• Standard Metric Score (with Outcome): 100 × (0.45M + 0.30I + 0.25O) / 5\n' +
    '• Standard Metric Score (Outcome N/A): 100 × (0.60M + 0.40I) / 5\n' +
    '• Domain Score: Mean of applicable assessed metric scores.\n' +
    '• Cross-Domain Diagnostics (CD01–CD25) and Context Calibration (Rd) are diagnostic controls that do not alter capability scores.',
    40,
    doc.y,
    { width: 515 }
  );

  // ==========================================
  // PAGE 3: 11-DOMAIN PROFILE & DIAGNOSTICS
  // ==========================================
  doc.addPage();
  addSectionHeader('5. 11-Domain Institutional Resilience Breakdown');
  doc.fillColor(MUTED).fontSize(8.5).font('Helvetica').text(
    'Evaluation across all 11 ARUI domains comparing Observed Maturity with Context-Calibrated Required Maturity (Rd).',
    40,
    doc.y
  );
  doc.moveDown(0.6);

  // Domain Table Header
  let domTableY = doc.y;
  doc.rect(40, domTableY, 515, 20).fill(NAVY);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
    .text('Code', 45, domTableY + 6)
    .text('Domain Pillar', 80, domTableY + 6)
    .text('Observed', 290, domTableY + 6)
    .text('Required', 345, domTableY + 6)
    .text('Distance', 405, domTableY + 6)
    .text('Score', 460, domTableY + 6)
    .text('Status', 505, domTableY + 6);

  let dRowY = domTableY + 20;
  const domains = payload.domains || [];
  for (let i = 0; i < domains.length; i++) {
    const d = domains[i];
    const isEven = i % 2 === 0;
    doc.rect(40, dRowY, 515, 20).fill(isEven ? LIGHT_BG : '#ffffff');
    doc.rect(40, dRowY, 515, 20).stroke(BORDER);

    doc.fillColor(BLUE).fontSize(8).font('Helvetica-Bold').text(d.code, 45, dRowY + 6);
    doc.fillColor(CHARCOAL).fontSize(7.5).font('Helvetica').text(d.name, 80, dRowY + 6, { width: 205, ellipsis: true });
    doc.fillColor(CHARCOAL).fontSize(8).font('Helvetica-Bold').text(d.assessed ? `L${d.currentMaturity}` : '—', 300, dRowY + 6);
    doc.fillColor(TEAL).text(`L${d.requiredMaturity}`, 355, dRowY + 6);
    doc.fillColor(d.transformationDistance > 0 ? AMBER : GREEN).text(
      d.assessed ? `${d.transformationDistance > 0 ? '+' : ''}${d.transformationDistance}` : '—',
      415,
      dRowY + 6
    );
    doc.fillColor(NAVY).text(d.assessed && d.domainScore !== null ? `${d.domainScore}%` : '—', 460, dRowY + 6);
    doc.fillColor(d.assessed ? GREEN : MUTED).fontSize(7.5).font('Helvetica').text(d.assessed ? 'Assessed' : 'Pending', 505, dRowY + 6);

    dRowY += 20;
  }

  doc.y = dRowY + 15;
  addSectionHeader('6. Cross-Domain Diagnostics & Contradiction Alerts (CD01–CD25)');
  const findings = payload.crossDomain?.findings || [];
  if (findings.length === 0) {
    doc.fillColor(CHARCOAL).fontSize(8.5).font('Helvetica').text('No cross-domain contradictions or capability imbalances detected.', 45, doc.y);
  } else {
    for (const f of findings.slice(0, 3)) {
      doc.rect(40, doc.y, 515, 34).fillAndStroke('#fffbeb', '#fde68a');
      doc.fillColor(AMBER).fontSize(8).font('Helvetica-Bold').text(`Diagnostic Signal [${f.ruleId || 'CD'}]: ${f.severity || 'OBSERVATION'}`, 50, doc.y + 5);
      doc.fillColor(CHARCOAL).fontSize(7.5).font('Helvetica').text(f.message, 50, doc.y + 16, { width: 495 });
      doc.y += 40;
    }
  }

  // ==========================================
  // PAGE 4: EVIDENCE & TRANSFORMATION ROADMAP
  // ==========================================
  doc.addPage();
  addSectionHeader('7. Evidence Integrity & Verification Summary');
  doc.fillColor(MUTED).fontSize(8.5).font('Helvetica').text(
    'Assessor verification coverage across submitted institutional policies, curriculum rubrics, and data exports.',
    40,
    doc.y
  );
  doc.moveDown(0.6);

  // Evidence Stats Box
  doc.rect(40, doc.y, 515, 45).fillAndStroke(LIGHT_BG, BORDER);
  const evBoxY = doc.y + 8;
  doc.fillColor(CHARCOAL).fontSize(8.5).font('Helvetica').text('Total Items Submitted:', 55, evBoxY);
  doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text(`${payload.evidence?.submittedCount || 0} Artifacts`, 165, evBoxY - 2);

  doc.fillColor(CHARCOAL).fontSize(8.5).font('Helvetica').text('Assessor Verified:', 270, evBoxY);
  doc.fillColor(GREEN).fontSize(11).font('Helvetica-Bold').text(`${payload.evidence?.verifiedCount || 0} Verified`, 365, evBoxY - 2);

  doc.fillColor(CHARCOAL).fontSize(8.5).font('Helvetica').text('Compliance Level:', 55, evBoxY + 20);
  doc.fillColor(TEAL).fontSize(9.5).font('Helvetica-Bold').text(payload.evidence?.guidelineCompliance || 'High', 165, evBoxY + 20);

  doc.y = evBoxY + 45;
  addSectionHeader('8. Intelligence & Transformation Action Roadmap');

  const roadmapSections = [
    { title: 'Priority 1 — Immediate Actions (0–3 Months)', items: payload.priorities?.immediateActions || [], color: AMBER },
    { title: 'Priority 2 — Near-Term Operationalization (3–9 Months)', items: payload.priorities?.mediumTermActions || [], color: BLUE },
    { title: 'Priority 3 — Strategic Institutional Capability (9–18 Months)', items: payload.priorities?.strategicActions || [], color: TEAL },
  ];

  for (const sec of roadmapSections) {
    doc.fillColor(sec.color).fontSize(9).font('Helvetica-Bold').text(sec.title, 40, doc.y);
    doc.moveDown(0.3);
    for (const it of sec.items) {
      doc.fillColor(sec.color).fontSize(10).text('•', 45, doc.y);
      doc.fillColor(CHARCOAL).fontSize(8).font('Helvetica').text(it, 58, doc.y - 1, { width: 495 });
      doc.moveDown(0.4);
    }
    doc.moveDown(0.4);
  }

  // ==========================================
  // PAGE 5+: 143-METRIC TRACEABILITY APPENDIX
  // ==========================================
  doc.addPage();
  addSectionHeader('9. Appendix: Full 143-Metric Auditable Traceability Dataset');
  doc.fillColor(MUTED).fontSize(8).font('Helvetica').text(
    'Traceable rubric record of all 143 metrics across 11 domains with M/I/O scoring, applicability, and assessor verification status.',
    40,
    doc.y
  );
  doc.moveDown(0.6);

  const metrics = payload.metricAuditAppendix || [];
  const renderTraceabilityTableHeader = (y: number) => {
    doc.rect(40, y, 515, 18).fill(NAVY);
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold')
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
  rowAppendixY += 18;

  for (let idx = 0; idx < metrics.length; idx++) {
    const m = metrics[idx];

    // Check for page boundary
    if (rowAppendixY > doc.page.height - 60) {
      doc.addPage();
      rowAppendixY = 40;
      renderTraceabilityTableHeader(rowAppendixY);
      rowAppendixY += 18;
    }

    const isEven = idx % 2 === 0;
    doc.rect(40, rowAppendixY, 515, 16).fill(isEven ? LIGHT_BG : '#ffffff');
    doc.rect(40, rowAppendixY, 515, 16).stroke(BORDER);

    doc.fillColor(BLUE).fontSize(7).font('Helvetica-Bold').text(m.metricCode, 45, rowAppendixY + 4);
    doc.fillColor(CHARCOAL).fontSize(6.5).font('Helvetica').text(m.metricName, 105, rowAppendixY + 4, { width: 205, ellipsis: true });
    doc.fillColor(CHARCOAL).fontSize(7).font('Helvetica').text(String(m.maturity), 320, rowAppendixY + 4);
    doc.text(String(m.implementation), 335, rowAppendixY + 4);
    doc.text(String(m.outcomes), 350, rowAppendixY + 4);
    doc.fillColor(NAVY).font('Helvetica-Bold').text(m.score, 370, rowAppendixY + 4);
    doc.fillColor(m.status === 'Assessed' ? GREEN : MUTED).font('Helvetica').text(m.status, 415, rowAppendixY + 4);
    doc.fillColor(CHARCOAL).fontSize(6.5).text(m.assessorStatus, 465, rowAppendixY + 4, { width: 85, ellipsis: true });

    rowAppendixY += 16;
  }

  // ==========================================
  // FOOTER ON ALL PAGES
  // ==========================================
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.rect(40, doc.page.height - 30, 515, 0.75).fill(BORDER);
    doc.fillColor(MUTED).fontSize(7.5).font('Helvetica').text(
      `ARUI Assessment Report: ${institutionName} · Report ID: ${reportId} · Confidential · Page ${i + 1} of ${range.count}`,
      40,
      doc.page.height - 22,
      { align: 'center', width: 515 }
    );
  }

  doc.end();
}
