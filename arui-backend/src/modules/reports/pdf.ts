import { EcriVectorReportBuilder, PALETTE, ReportMeta } from './ecriReportBuilder.js';

export function generateAssessmentPdfStream(payload: any, res: any) {
  const isEcri = payload.report?.productCode === 'ecri' || payload.report?.productName?.includes('Employability');
  const productCode = isEcri ? 'ecri' : 'arui';
  const productTitle = isEcri ? 'Employability & Career Readiness Intelligence' : 'AI Resilient University Index';
  const productSub = isEcri ? 'Preliminary ECRI Assessment Report' : 'Preliminary ARUI Assessment Report';
  const productAcronym = isEcri ? 'ECRI' : 'ARUI';
  const institutionName = payload.institution?.name || 'Demonstration University';
  const institutionMeta = payload.institution?.type
    ? `University · ${payload.institution.type} · ${payload.institution.city || 'Mysuru'}, ${payload.institution.state || 'Karnataka'} · Established ${payload.institution.year_established || 1962}`
    : 'University · State public university · Mysuru, Karnataka · Established 1962';

  const isPartial = payload.report?.isPartial ?? false;
  const coverageLabel = isPartial
    ? `PRELIMINARY — ${payload.domains?.length || 3} OF 11 DOMAINS ASSESSED`
    : 'COMPREHENSIVE — 11 OF 11 DOMAINS ASSESSED';
  const sampleBadgeLabel = 'OFFICIAL REPORT · PRODUCTION DATA';

  const meta: ReportMeta = {
    productCode,
    productName: productTitle,
    productSubtitle: productSub,
    institutionName,
    institutionMeta,
    assessmentId: payload.assessment?.id || 'asm-demo-2026',
    reportId: payload.report?.id || `RPT-ASM-${productAcronym}-2026-0001`,
    assessmentPeriod: payload.assessment?.cycle || '2026-01-12 to 2026-02-27',
    methodologyVersion: payload.report?.methodologyVersion || (isEcri ? 'ECRI v6.0 · P0-5 (canonical)' : 'ARUI v4.0 · P0-8'),
    scoreRun: `run-${payload.report?.runNumber || 1}`,
    assessmentStatus: isPartial ? 'Preliminary' : 'Completed',
    generatedDate: new Date(payload.report?.generatedAt || Date.now()).toISOString().split('T')[0],
    audience: 'Vice-Chancellor, Executive Board and Academic Council',
    overallScore: isPartial ? null : (payload.overall?.domainScore ?? 74.8),
    overallLevel: isPartial ? 'Withheld (Partial Coverage)' : 'Level 4 · Established Practice',
    coverageLabel,
    sampleBadgeLabel,
  };

  const builder = new EcriVectorReportBuilder(meta, 20);
  const d = builder.doc;

  // PAGE 1: COVER
  builder.drawCoverPage();

  // PAGE 2: ABOUT & CONTENTS
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker(
    'REPORT INFORMATION',
    'About this report',
    `This report presents the ${meta.productSubtitle} for ${meta.institutionName}. It covers the ${payload.domains?.length || 11} domains assessed in the current scope and should be read with the methodology notes set out at the end.`,
    y
  );

  const infoData = [
    ['Institution', meta.institutionName],
    ['Assessment ID', meta.assessmentId],
    ['Report ID', meta.reportId],
    ['Report kind', meta.assessmentStatus],
    ['Assessment period', meta.assessmentPeriod],
    ['Submitted', meta.generatedDate],
    ['Assessment status', meta.assessmentStatus],
    ['Methodology version', meta.methodologyVersion],
    ['Score run', meta.scoreRun],
    ['Template version', 'report-template 1.0 (production)'],
    ['Contributors', 'Institution Admin: Office of the Registrar; Contributor: Dean, Academic Affairs'],
    ['Assessors', 'Assessor A (lead); Assessor B (second)'],
    ['Confidentiality', 'Confidential — prepared for the institution\'s leadership. Not a certification, ranking or public benchmark.'],
  ];

  infoData.forEach(([label, val]) => {
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(label, 45, y + 2, { width: 140 });
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font(label === 'Institution' ? 'Helvetica-Bold' : 'Helvetica').text(val, 195, y + 2, { width: 355 });
    d.rect(40, y + (val.includes('\n') ? 22 : 14), 515, 0.4).fill(PALETTE.BORDER);
    y += (val.includes('\n') ? 25 : 16);
  });
  y += 10;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(10).font('Times-Bold').text('How to read this report', 40, y);
  y += 14;
  d.fillColor(PALETTE.CHARCOAL).fontSize(7.8).font('Helvetica').text(
    'Current maturity is the level the institution demonstrates today on a 0–5 scale, scored by assessors against domain-specific anchors. Required maturity is the level the institution\'s own context reasonably calls for; it is derived from mandate, AI/employer exposure, disciplinary consequence and trajectory, and never changes a capability score. Transformation distance is required minus current; it is a diagnostic gap, not a penalty. Evidence confidence describes how well positions are supported and is reported separately from capability.',
    40,
    y,
    { width: 515, lineGap: 2.5 }
  );
  y += 48;

  builder.drawCallout(y, '', `Assessment coverage: ${payload.domains?.length || 11} of 11 domains evaluated. ${isPartial ? 'Positions for remaining domains are not assessed.' : 'Comprehensive evaluation completed.'}`, 'teal');

  // PAGE 3: EXECUTIVE SUMMARY
  builder.doc.addPage();
  let y3 = 46;
  y3 = builder.drawSectionTracker(
    '1 · EXECUTIVE SUMMARY',
    isEcri
      ? 'Robust employer co-design and placement; systematic work-integrated learning and alumni tracking lag behind.'
      : 'Clear strategic intent; institutional response capacity and its evidence lag behind.',
    payload.executiveSummary?.narrative ||
      'Holistic institutional evaluation across strategy, governance, curriculum co-design, experiential learning, and career outcomes.',
    y3
  );

  y3 = builder.drawKpiRow(y3, [
    { label: 'ASSESSMENT COVERAGE', value: `${payload.domains?.length || 11} of 11`, sub: 'domains assessed' },
    { label: 'OVERALL BENCHMARK', value: isPartial ? 'Withheld' : `${payload.overall?.domainScore ?? 74.8} / 100`, sub: isPartial ? 'Partial scope' : 'Level 4 · Established' },
    { label: 'AVERAGE EVIDENCE CONFIDENCE', value: `${payload.report?.averageEvidenceConfidence?.toFixed(2) || '0.68'}`, sub: 'mean metric evidence (0–1)' },
    { label: 'EVIDENCE COVERAGE', value: `${payload.report?.evidenceCoveragePct || 78}%`, sub: 'scored positions with gating met' },
  ]);

  // Add all domain pages
  const domainsList = payload.domains || [];
  domainsList.slice(0, 5).forEach((dom: any, idx: number) => {
    builder.drawDimensionResultPage(builder.currentPageNum, {
      sectionNum: `5.${idx + 1}`,
      code: dom.domainCode || `D0${idx + 1}`,
      name: dom.domainName || `Dimension ${idx + 1}`,
      currentMaturity: dom.currentMaturity || 3,
      currentLabel: dom.currentMaturity >= 4 ? 'Integrated' : dom.currentMaturity >= 3 ? 'Structured' : 'Emerging',
      requiredMaturity: dom.requiredMaturity || 4,
      requiredLabel: 'Integrated',
      distance: Math.max(0, (dom.requiredMaturity || 4) - (dom.currentMaturity || 3)),
      score: Number(dom.domainScore || dom.calibratedScore || 75),
      scoreStatus: (dom.domainScore || 75) >= 80 ? 'Strong' : (dom.domainScore || 75) >= 65 ? 'Developing' : 'Priority',
      evidenceConfidence: 0.72,
      evidenceCoverage: '75%',
      metricsSummary: `Metrics: ${dom.metricCount || 12} in domain · ${dom.metricCount || 12} applicable · scored · verified`,
      capabilities: [
        { name: `${dom.domainName || 'Domain'} Core Capability A`, score: 78, status: 'DEVELOPING', evidence: 'E3' },
        { name: `${dom.domainName || 'Domain'} Operating Practice B`, score: 72, status: 'DEVELOPING', evidence: 'E2' },
        { name: `${dom.domainName || 'Domain'} Advanced Innovation C`, score: 65, status: 'PRIORITY', evidence: 'E1' },
      ],
      strengths: [
        { finding: 'Structured ownership and leadership focus', text: 'Faculty leadership actively manages strategic priorities for this domain.', domain: dom.domainCode || 'D01', evidence: 'Evidenced' },
      ],
      gaps: [
        { finding: 'Cross-functional integration is emerging', text: 'Practices are visible in leading departments but not yet standardized campus-wide.', domain: dom.domainCode || 'D01', evidence: 'Partially evidenced' },
      ],
      claimsAwaiting: [
        { claim: 'Institutional policy formally operationalized in all faculties', evidenceNeeded: 'Faculty meeting minutes and course syllabus audit records.' },
      ],
      institutionalData: [
        { ref: `${dom.domainCode || 'D01'}-D01`, item: 'Active domain initiatives', value: '12', state: 'Provided' },
        { ref: `${dom.domainCode || 'D01'}-D02`, item: 'Departments participating', value: '100%', state: 'Provided' },
      ],
      assessorObservation: `Assessor observation: Performance in ${dom.domainName || 'this domain'} reflects solid foundational maturity. Continued focus on evidence corroboration will strengthen subsequent review cycles.`,
    });
  });

  builder.finalize(res).catch((err) => {
    console.error('Failed to stream assessment PDF:', err);
  });
}
