import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import PDFDocument from 'pdfkit';
import { EcriVectorReportBuilder, PALETTE, ReportMeta } from './ecriReportBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../../..');
const samplesDir = path.join(rootDir, 'university-insights-main/public/samples');
const uploadsDir = path.resolve(__dirname, '../../../uploads');

if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const ecriDemoMeta: ReportMeta = {
  productCode: 'ecri',
  productName: 'Employability & Career Readiness Intelligence',
  productSubtitle: 'Preliminary ECRI Assessment Report',
  institutionName: 'Demonstration University',
  institutionMeta: 'University · State public university · Mysuru, Karnataka · Established 1962',
  assessmentId: 'asm-demo-2026',
  reportId: 'RPT-ASM-DEMO-2026-0001',
  assessmentPeriod: '2026-01-12 to 2026-02-27',
  methodologyVersion: 'ECRI v6.0 · P0-5 (pre-pilot)',
  scoreRun: 'run-1',
  assessmentStatus: 'Preliminary',
  generatedDate: '2026-03-04',
  audience: 'Vice-Chancellor, Executive Board and Academic Council',
  overallScore: 74.8,
  overallLevel: 'Level 4 · Established Practice',
  coverageLabel: 'COMPREHENSIVE — D01–D11 ASSESSED',
  sampleBadgeLabel: 'SAMPLE REPORT · MOCK DATA',
};

// ============================================================================
// 1. REBUILD 20-PAGE ECRI EXECUTIVE INSTITUTIONAL ASSESSMENT REPORT
// ============================================================================
export async function generateEcriExecutiveReport(outputPath: string): Promise<void> {
  const builder = new EcriVectorReportBuilder(ecriDemoMeta, 20);
  const d = builder.doc;

  // PAGE 1: COVER PAGE
  builder.drawCoverPage();

  // PAGE 2: REPORT INFORMATION & CONTENTS
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('REPORT INFORMATION', 'About this report', 'This report presents the Preliminary ECRI Assessment for the institution named below. It covers the eleven dimensions assessed in the comprehensive scope and should be read with the limitations set out at the end.', y);

  // Key-value grid table
  const infoData = [
    ['Institution', ecriDemoMeta.institutionName],
    ['Assessment ID', ecriDemoMeta.assessmentId],
    ['Report ID', ecriDemoMeta.reportId],
    ['Report kind', 'Preliminary'],
    ['Assessment period', ecriDemoMeta.assessmentPeriod],
    ['Submitted', '2026-02-27'],
    ['Assessment status', 'Preliminary'],
    ['Methodology version', ecriDemoMeta.methodologyVersion],
    ['Score run', ecriDemoMeta.scoreRun],
    ['Template version', 'report-template 0.1 (sample)'],
    ['Contributors', 'Institution Admin: Office of the Registrar; Contributor: Dean, Academic Affairs;\nContributor: Director, Career Services & Industry Relations'],
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

  // Callout: How to read this report
  d.fillColor(PALETTE.NAVY_TEXT).fontSize(10).font('Times-Bold').text('How to read this report', 40, y);
  y += 14;
  d.fillColor(PALETTE.CHARCOAL).fontSize(7.8).font('Helvetica').text(
    'Current maturity is the level the institution demonstrates today on a 0–5 scale, scored by assessors against domain-specific anchors. Required maturity is the level the institution\'s own context reasonably calls for; it is derived from mandate, employer exposure, disciplinary consequence and trajectory, and never changes a capability score. Transformation distance is required minus current; it is a diagnostic gap, not a penalty. Evidence confidence describes how well positions are supported and is reported separately from capability. Cross-domain findings are diagnostic signals only.',
    40,
    y,
    { width: 515, lineGap: 2.5 }
  );
  y += 48;

  builder.drawCallout(y, '', 'Assessment coverage: 11 of 11 dimensions. Comprehensive institutional evaluation across all 132 canonical metrics. Preliminary results are not a certification.', 'teal');
  y += 48;

  // Table of contents
  d.fillColor(PALETTE.NAVY_TEXT).fontSize(10).font('Times-Bold').text('Contents', 40, y);
  y += 14;
  const tocItems = [
    '1. Executive summary',
    '2. Institutional context and profile',
    '3. Assessment scope and coverage',
    '4. Overall ECRI position',
    '5. Dimension results — D01 through D11',
    '6. Cross-domain dependencies and contradictions',
    '7. Validation, evidence and verification status',
    '8. Assessor observations and priority areas',
    '9. Recommended actions — 90 days, 12 months, longer term',
    '10. Methodology note, limitations and reassessment',
  ];
  tocItems.forEach((item) => {
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(item, 45, y);
    y += 12;
  });

  // PAGE 3: 1 · EXECUTIVE SUMMARY
  builder.doc.addPage();
  let y3 = 46;
  y3 = builder.drawSectionTracker(
    '1 · EXECUTIVE SUMMARY',
    'Robust employer co-design and placement; systematic work-integrated learning and alumni tracking lag behind.',
    'Across the eleven assessed dimensions, Demonstration University articulates graduate employability as a central institutional priority with senior leadership ownership. Employer advisory councils and curriculum alignment are strong in professional disciplines. The largest distance between current and required maturity lies in Work-Integrated Learning (WIL) standardization across non-STEM programs and longitudinal career mobility tracking.',
    y3
  );

  d.fillColor(PALETTE.MUTED).fontSize(6.8).font('Helvetica-Oblique').text(
    'Narrative sections of this report are assessor-authored. The engine supplies positions, flags and diagnostics; it does not write prose.',
    40,
    y3,
    { width: 515 }
  );
  y3 += 16;

  // 4 KPI Stat Boxes
  y3 = builder.drawKpiRow(y3, [
    { label: 'ASSESSMENT COVERAGE', value: '11 of 11', sub: 'dimensions assessed (D01–D11)' },
    { label: 'OVERALL BENCHMARK', value: '74.8 / 100', sub: 'Level 4 · Established Practice' },
    { label: 'AVERAGE EVIDENCE CONFIDENCE', value: '0.68', sub: 'mean metric evidence (0–1)' },
    { label: 'EVIDENCE COVERAGE', value: '78%', sub: 'scored positions with gating met' },
  ]);

  // Dimension positions at a glance table
  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Dimension positions at a glance', 40, y3);
  y3 += 12;
  d.rect(40, y3, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('DOMAIN / DIMENSION', 45, y3 + 4);
  d.text('CURRENT', 230, y3 + 4);
  d.text('REQUIRED', 290, y3 + 4);
  d.text('DISTANCE', 350, y3 + 4);
  d.text('SCORE', 410, y3 + 4);
  d.text('STATUS', 475, y3 + 4);
  y3 += 16;

  const summaryDims = [
    { code: 'D01', name: 'Employer Demand Intelligence', cur: '3 · Structured', req: '4 · Integrated', dist: '+1', score: '78 / 100', status: 'DEVELOPING', stColor: PALETTE.TEAL },
    { code: 'D02', name: 'Employability Capability Framework', cur: '3 · Structured', req: '4 · Integrated', dist: '+1', score: '72 / 100', status: 'DEVELOPING', stColor: PALETTE.TEAL },
    { code: 'D03', name: 'Industry-Aligned Curriculum', cur: '4 · Integrated', req: '4 · Integrated', dist: '0', score: '81 / 100', status: 'STRONG', stColor: PALETTE.EMERALD },
    { code: 'D04', name: 'Experiential & Practice Learning (WIL)', cur: '2 · Emerging', req: '4 · Integrated', dist: '+2', score: '67 / 100', status: 'PRIORITY', stColor: PALETTE.ROSE },
    { code: 'D05', name: 'Career Development Infrastructure', cur: '3 · Structured', req: '4 · Integrated', dist: '+1', score: '76 / 100', status: 'DEVELOPING', stColor: PALETTE.TEAL },
  ];

  summaryDims.forEach((dim) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.2).font('Helvetica').text(`${dim.code} · ${dim.name}`, 45, y3 + 2, { width: 180 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(dim.cur, 230, y3 + 2);
    d.text(dim.req, 290, y3 + 2);
    d.fillColor(dim.dist === '0' ? PALETTE.MUTED : PALETTE.ROSE).font('Helvetica-Bold').text(dim.dist, 355, y3 + 2);
    d.fillColor(PALETTE.CHARCOAL).font('Helvetica').text(dim.score, 410, y3 + 2);
    d.fillColor(dim.stColor).font('Helvetica-Bold').text(dim.status, 475, y3 + 2);
    d.rect(40, y3 + 13, 515, 0.4).fill(PALETTE.BORDER);
    y3 += 15;
  });
  y3 += 8;

  // Key strengths table
  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Key strengths', 40, y3);
  y3 += 12;
  d.rect(40, y3, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('FINDING', 45, y3 + 4);
  d.text('DOMAINS', 380, y3 + 4);
  d.text('EVIDENCE', 450, y3 + 4);
  y3 += 16;

  const keyStrengths = [
    { title: 'Articulated strategic employer partnerships', desc: 'Over 350+ active corporate hiring partners with embedded syllabus co-teaching in engineering and business faculties.', dom: 'D01, D03', ev: 'Evidenced' },
    { title: 'Mandatory AI and digital foundation courses', desc: 'Universal Python and AI productivity toolkits mandated across first-year undergraduate curricula.', dom: 'D07', ev: 'Evidenced' },
    { title: 'Dedicated career services infrastructure', desc: 'Centralized Career Development Center operates regular campus recruitment drives and alumni career panels.', dom: 'D05, D09', ev: 'Evidenced' },
  ];

  keyStrengths.forEach((s) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(s.title, 45, y3 + 2, { width: 320 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(s.desc, 45, y3 + 11, { width: 320 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(s.dom, 380, y3 + 4);
    d.fillColor(PALETTE.EMERALD).fontSize(7.5).font('Helvetica-Bold').text(s.ev, 450, y3 + 4);
    d.rect(40, y3 + 26, 515, 0.4).fill(PALETTE.BORDER);
    y3 += 28;
  });

  // PAGE 4: CONTINUED EXECUTIVE SUMMARY & PRIORITY GAPS
  builder.doc.addPage();
  let y4 = 46;
  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Priority gaps', 40, y4);
  y4 += 12;
  d.rect(40, y4, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('FINDING', 45, y4 + 4);
  d.text('DOMAINS', 380, y4 + 4);
  d.text('EVIDENCE', 450, y4 + 4);
  y4 += 16;

  const priorityGaps = [
    { title: 'Work-integrated learning is uneven and uncredited outside STEM', desc: 'Internships and field practicums in humanities and pure sciences carry no academic credits.', dom: 'D04', ev: 'Evidenced' },
    { title: 'Absence of verified graduate capability portfolios', desc: 'No universal digital capstone repository exists to signal validated student capabilities directly to recruiters.', dom: 'D08', ev: 'Partially evidenced' },
    { title: 'Longitudinal graduate career tracking is informal', desc: 'Institutional tracking ceases after 6 months; 3-to-5 year alumni career trajectory data is not systematically captured.', dom: 'D10, D11', ev: 'Unvalidated' },
  ];

  priorityGaps.forEach((g) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(g.title, 45, y4 + 2, { width: 320 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(g.desc, 45, y4 + 11, { width: 320 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(g.dom, 380, y4 + 4);
    const evColor = g.ev === 'Evidenced' ? PALETTE.EMERALD : g.ev === 'Partially evidenced' ? PALETTE.AMBER : PALETTE.MUTED;
    d.fillColor(evColor).fontSize(7.5).font('Helvetica-Bold').text(g.ev, 450, y4 + 4);
    d.rect(40, y4 + 26, 515, 0.4).fill(PALETTE.BORDER);
    y4 += 28;
  });

  // PAGE 5: 2 · INSTITUTIONAL CONTEXT AND PROFILE
  builder.doc.addPage();
  let y5 = 46;
  y5 = builder.drawSectionTracker(
    '2 · INSTITUTIONAL CONTEXT AND PROFILE',
    'The institution as it described itself',
    'Context shapes what the assessment explores, how deeply, what evidence is proportionate and what maturity is reasonable to expect. It never gives an institution a score advantage or disadvantage.',
    y5
  );

  const leftColX = 45;
  const leftValX = 160;
  const rightColX = 300;
  const rightValX = 415;

  // Identity & Location
  d.fillColor(PALETTE.NAVY_TEXT).fontSize(8.5).font('Helvetica-Bold').text('Identity', leftColX, y5);
  d.text('Resources and engagement', rightColX, y5);
  y5 += 14;

  const profileRows = [
    [['Institution name', 'Demonstration University'], ['Annual expenditure band', 'Band C (sample)']],
    [['Institution type', 'Comprehensive University'], ['Industry engagement', 'Structured partnerships in 4 faculties']],
    [['Governance type', 'State public university'], ['Career services model', 'Centralized + faculty embedded']],
    [['Year established', '1962'], ['Incubation ecosystem', 'Active technology incubator (24 startups)']],
    [['Location', 'Urban (Mysuru, Karnataka)'], ['Student catchment', 'State / National (72% domestic)']],
    [['Total Students', '18,400'], ['Internship placement rate', '68% (6-month metric)']],
    [['Faculty Count', '1,120'], ['Employer advisory boards', 'Active across 8 faculties']],
    [['Active programmes', '142 (61 UG, 68 PG, 13 PhD)'], ['Disciplinary consequence', 'High']],
  ];

  profileRows.forEach(([l, r]) => {
    d.fillColor(PALETTE.MUTED).fontSize(7).font('Helvetica').text(l[0], leftColX, y5);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.2).font('Helvetica-Bold').text(l[1], leftValX, y5, { width: 130 });

    d.fillColor(PALETTE.MUTED).fontSize(7).font('Helvetica').text(r[0], rightColX, y5);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.2).font('Helvetica-Bold').text(r[1], rightValX, y5, { width: 135 });

    d.rect(40, y5 + 12, 515, 0.4).fill(PALETTE.BORDER);
    y5 += 16;
  });
  y5 += 20;

  builder.drawCallout(y5, '', 'Profile completeness: complete. A complete profile precedes scoring. Expenditure and funding band boundaries are calibrated to institutional peer groups.', 'neutral');

  // PAGE 6: 3 · ASSESSMENT SCOPE AND COVERAGE
  builder.doc.addPage();
  let y6 = 46;
  y6 = builder.drawSectionTracker(
    '3 · ASSESSMENT SCOPE AND COVERAGE',
    'Assessment coverage: 11 of 11 dimensions',
    'The Employability & Career Readiness Intelligence (ECRI) instrument assesses institutional readiness across eleven dimensions and 132 canonical metrics. All 11 dimensions are in active scope in this report.',
    y6
  );

  d.rect(40, y6, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('CODE', 45, y6 + 4);
  d.text('DIMENSION', 90, y6 + 4);
  d.text('METRICS', 380, y6 + 4);
  d.text('STATUS IN THIS REPORT', 440, y6 + 4);
  y6 += 16;

  const all11Dims = [
    ['D01', 'Employer Demand Intelligence', '12', 'Assessed'],
    ['D02', 'Employability Capability Framework', '12', 'Assessed'],
    ['D03', 'Industry-Aligned Curriculum', '12', 'Assessed'],
    ['D04', 'Experiential & Practice-Based Learning', '12', 'Assessed'],
    ['D05', 'Career Development Infrastructure', '12', 'Assessed'],
    ['D06', 'Professional & Human Capabilities', '12', 'Assessed'],
    ['D07', 'Digital & AI-Era Work Readiness', '12', 'Assessed'],
    ['D08', 'Portfolio & Capability Signalling', '12', 'Assessed'],
    ['D09', 'Employer Engagement & Recruitment Ecosystem', '12', 'Assessed'],
    ['D10', 'Employment Outcome Quality', '12', 'Assessed'],
    ['D11', 'Career Adaptability & Lifelong Readiness', '12', 'Assessed'],
  ];

  all11Dims.forEach(([code, name, count, status]) => {
    d.fillColor(PALETTE.MUTED).fontSize(7).font('Helvetica-Bold').text(code, 45, y6 + 2);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica').text(name, 90, y6 + 2, { width: 280 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(count, 385, y6 + 2);
    d.fillColor(PALETTE.EMERALD).fontSize(7.2).font('Helvetica-Bold').text(status, 440, y6 + 2);
    d.rect(40, y6 + 12, 515, 0.4).fill(PALETTE.BORDER);
    y6 += 14;
  });
  y6 += 12;

  // 3 Summary Boxes
  y6 = builder.drawKpiRow(y6, [
    { label: 'DOMAINS ASSESSED', value: '11 of 11', sub: 'D01 through D11 evaluated' },
    { label: 'METRICS IN SCOPE', value: '132 of 132', sub: '12 canonical metrics per dimension' },
    { label: 'WEIGHTED DOMAIN COVERAGE', value: '1.00', sub: '100% of index weight evaluated' },
  ]);

  // PAGE 7: 4 · OVERALL ECRI POSITION
  builder.doc.addPage();
  let y7 = 46;
  y7 = builder.drawSectionTracker(
    '4 · OVERALL ECRI POSITION',
    'Where the institution stands, dimension by dimension',
    'Domain positions are shown individually. Transformation distance is the gap between the maturity the institution\'s context requires and the maturity currently demonstrated; it is diagnostic and is not a penalty.',
    y7
  );

  // Horizontal Maturity Chart (0 to 5)
  d.rect(40, y7, 515, 20).fill(PALETTE.LIGHT_BG);
  const levels = ['0 Absent', '1 Reactive', '2 Emerging', '3 Structured', '4 Integrated', '5 Adaptive'];
  levels.forEach((lvl, i) => {
    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica').text(lvl, 160 + i * 58, y7 + 6, { width: 55, align: 'center' });
  });
  y7 += 24;

  const fullDimsChart = [
    { code: 'D01', name: 'Employer Demand Intelligence', cur: 3, req: 4, dist: '+1' },
    { code: 'D02', name: 'Capability Framework', cur: 3, req: 4, dist: '+1' },
    { code: 'D03', name: 'Industry-Aligned Curriculum', cur: 4, req: 4, dist: '0' },
    { code: 'D04', name: 'Experiential Learning (WIL)', cur: 2, req: 4, dist: '+2' },
    { code: 'D05', name: 'Career Infrastructure', cur: 3, req: 4, dist: '+1' },
    { code: 'D06', name: 'Professional Capabilities', cur: 3, req: 3, dist: '0' },
    { code: 'D07', name: 'Digital & AI Work Readiness', cur: 4, req: 4, dist: '0' },
    { code: 'D08', name: 'Capability Signalling', cur: 2, req: 4, dist: '+2' },
    { code: 'D09', name: 'Employer Ecosystem', cur: 4, req: 4, dist: '0' },
    { code: 'D10', name: 'Employment Outcome Quality', cur: 3, req: 4, dist: '+1' },
    { code: 'D11', name: 'Lifelong Employability', cur: 2, req: 4, dist: '+2' },
  ];

  fullDimsChart.forEach((row) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7).font('Helvetica-Bold').text(row.code, 45, y7 + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(6.8).font('Helvetica').text(row.name, 70, y7 + 2, { width: 85 });

    // Chart Track
    const trackX = 160;
    const trackW = 290;
    d.rect(trackX, y7 + 3, trackW, 6).fill(PALETTE.BORDER);

    // Current fill
    const curW = (row.cur / 5) * trackW;
    d.rect(trackX, y7 + 3, curW, 6).fill(PALETTE.NAVY_HEADER);

    // Required tick marker
    const reqX = trackX + (row.req / 5) * trackW;
    d.rect(reqX - 1, y7 + 1, 2.5, 10).fill(PALETTE.TEAL);

    d.fillColor(row.dist === '0' ? PALETTE.MUTED : PALETTE.ROSE)
      .fontSize(6.5)
      .font('Helvetica-Bold')
      .text(row.dist === '0' ? 'Target Met' : `Distance ${row.dist}`, 460, y7 + 2);

    d.rect(40, y7 + 14, 515, 0.4).fill(PALETTE.BORDER);
    y7 += 16;
  });
  y7 += 10;

  y7 = builder.drawKpiRow(y7, [
    { label: 'OVERALL ECRI / 100', value: '74.8', sub: 'Level 4 · Established' },
    { label: 'WEIGHTED COVERAGE', value: '1.00', sub: 'of 1.00 index weight' },
    { label: 'EVIDENCE CONFIDENCE', value: '0.68', sub: '0–1 · separate from capability' },
    { label: 'CONFIDENCE BAND', value: 'High Confidence', sub: 'comprehensive data validated' },
  ]);

  builder.drawCallout(y7, 'Reading transformation distance', 'A distance of +2 means the institution\'s context calls for a maturity two levels above the level it currently demonstrates. Distance directs attention and sequencing; it does not lower any score.', 'teal');

  // ==========================================================================
  // PAGES 8–13: GRANULAR 11-DIMENSION RESULTS (Exact Page 8/10/12 Reference Layout!)
  // ==========================================================================
  const dimensionDetailRecords = [
    {
      sectionNum: '5.1',
      code: 'D01',
      name: 'Employer Demand Intelligence',
      currentMaturity: 3,
      currentLabel: 'Structured',
      requiredMaturity: 4,
      requiredLabel: 'Integrated',
      distance: 1,
      score: 78,
      scoreStatus: 'Developing',
      evidenceConfidence: 0.72,
      evidenceCoverage: '75%',
      metricsSummary: 'Metrics: 12 in domain · 12 applicable · 12 scored · 0 not applicable · 0 incomplete · 1 review flag(s). Evidence levels: E0 1 · E1 2 · E2 5 · E3 4 · E4 0',
      capabilities: [
        { name: 'Labor Market Trend Telemetry', score: 82, status: 'STRONG', evidence: 'E3' },
        { name: 'Employer Advisory Council Cadence', score: 76, status: 'DEVELOPING', evidence: 'E3' },
        { name: 'Curricular Demand Forecasting', score: 68, status: 'PRIORITY', evidence: 'E2' },
        { name: 'Regional Recruitment Tracking', score: 84, status: 'STRONG', evidence: 'E3' },
        { name: 'Emerging Skill Synthesis Rate', score: 74, status: 'DEVELOPING', evidence: 'E2' },
      ],
      strengths: [
        { finding: 'Quarterly employer advisory councils in active operation', text: 'Engineering and management faculties run structured quarterly industry reviews.', domain: 'D01', evidence: 'Evidenced' },
        { finding: 'Labor market telemetry integration', text: 'Real-time corporate job vacancy data is reviewed annually in academic council.', domain: 'D01', evidence: 'Evidenced' },
      ],
      gaps: [
        { finding: 'Humanities programmes lack structured demand forecasting', text: 'Liberal arts syllabi are updated without direct employer demand telemetry.', domain: 'D01', evidence: 'Evidenced' },
        { finding: 'Unsynchronized multi-campus placement data', text: 'Branch campuses do not feed placement trends into central planning.', domain: 'D01', evidence: 'Partially evidenced' },
      ],
      claimsAwaiting: [
        { claim: 'Advisory council recommendations directly modified syllabi', evidenceNeeded: 'Board of Studies minutes showing approved changes from advisory reviews.' },
        { claim: 'Systematic skill forecasting operates annually for all departments', evidenceNeeded: 'Annual foresight report or curriculum revision memo.' },
      ],
      institutionalData: [
        { ref: 'D01-D01', item: 'Active employer advisory councils', value: '8', state: 'Provided' },
        { ref: 'D01-D02', item: 'Programmes reviewed against market demand', value: '48', state: 'Provided' },
        { ref: 'D01-D03', item: 'Programmes modified based on employer telemetry', value: '14', state: 'Provided' },
        { ref: 'D01-D04', item: 'Active industry partner network', value: '350+', state: 'Provided' },
      ],
      assessorObservation: 'Employer engagement language is mature and visible in professional schools. The institution should extend structured industry sensing to humanities and foundational sciences.',
    },
    {
      sectionNum: '5.2',
      code: 'D04',
      name: 'Experiential & Practice-Based Learning (WIL)',
      currentMaturity: 2,
      currentLabel: 'Emerging',
      requiredMaturity: 4,
      requiredLabel: 'Integrated',
      distance: 2,
      score: 67,
      scoreStatus: 'Priority',
      evidenceConfidence: 0.54,
      evidenceCoverage: '50%',
      metricsSummary: 'Metrics: 12 in domain · 12 applicable · 12 scored · 0 not applicable · 0 incomplete · 2 review flag(s). Evidence levels: E0 3 · E1 3 · E2 4 · E3 2 · E4 0',
      capabilities: [
        { name: 'Credit-Bearing Internship Structure', score: 58, status: 'PRIORITY', evidence: 'E1' },
        { name: 'Workplace Mentor Rubric Alignment', score: 62, status: 'PRIORITY', evidence: 'E2' },
        { name: 'Clinical / Industry Practicum Reach', score: 74, status: 'DEVELOPING', evidence: 'E3' },
        { name: 'Cross-Faculty WIL Standardization', score: 52, status: 'PRIORITY', evidence: 'E1' },
        { name: 'WIL Assessment & Evidence Portfolios', score: 66, status: 'PRIORITY', evidence: 'E2' },
      ],
      strengths: [
        { finding: 'Engineering mandatory 12-week industrial training', text: '100% of engineering undergraduates complete accredited industrial internships.', domain: 'D04', evidence: 'Evidenced' },
        { finding: 'Hospital and clinical practice in health sciences', text: 'High-density structured clinical rotations operate in nursing and allied health.', domain: 'D04', evidence: 'Evidenced' },
      ],
      gaps: [
        { finding: 'Zero academic credits for non-STEM internships', text: 'Arts, humanities, and social science students receive no credits for verified work experience.', domain: 'D04', evidence: 'Evidenced' },
        { finding: 'Absence of standardized workplace evaluation rubrics', text: 'Supervisors submit variable qualitative letters rather than calibrated competency evaluations.', domain: 'D04', evidence: 'Partially evidenced' },
      ],
      claimsAwaiting: [
        { claim: 'Standardized WIL framework exists for all 142 programmes', evidenceNeeded: 'Academic senate policy document establishing credit weighting for all faculties.' },
        { claim: '100% of student internship supervisors are formally trained', evidenceNeeded: 'Workplace supervisor orientation handbook and attendance logs.' },
      ],
      institutionalData: [
        { ref: 'D04-D01', item: 'Students enrolled in accredited internships', value: '4,200', state: 'Provided' },
        { ref: 'D04-D02', item: 'Programmes with mandatory credit-bearing WIL', value: '42', state: 'Provided' },
        { ref: 'D04-D03', item: 'Active corporate internship host agreements', value: '180', state: 'Provided' },
        { ref: 'D04-D04', item: 'Non-STEM programmes with structured WIL', value: '4', state: 'Provided' },
      ],
      assessorObservation: 'Work-integrated learning is the single largest transformation gap in the institution. Standardizing credit-bearing internships across all faculties will deliver significant employability uplift.',
    },
    {
      sectionNum: '5.3',
      code: 'D07',
      name: 'Digital & AI-Era Work Readiness',
      currentMaturity: 4,
      currentLabel: 'Integrated',
      requiredMaturity: 4,
      requiredLabel: 'Integrated',
      distance: 0,
      score: 79,
      scoreStatus: 'Strong',
      evidenceConfidence: 0.81,
      evidenceCoverage: '85%',
      metricsSummary: 'Metrics: 12 in domain · 12 applicable · 12 scored · 0 not applicable · 0 incomplete · 0 review flag(s). Evidence levels: E0 0 · E1 1 · E2 5 · E3 6 · E4 0',
      capabilities: [
        { name: 'Core AI & Digital Literacy Foundation', score: 86, status: 'STRONG', evidence: 'E3' },
        { name: 'Discipline-Specific Digital Toolkits', score: 80, status: 'STRONG', evidence: 'E3' },
        { name: 'Human-AI Collaboration Pedagogy', score: 76, status: 'DEVELOPING', evidence: 'E2' },
        { name: 'Data Analytics & Synthesis in Degree Programs', score: 82, status: 'STRONG', evidence: 'E3' },
        { name: 'Digital Work Environment Fluency', score: 72, status: 'DEVELOPING', evidence: 'E2' },
      ],
      strengths: [
        { finding: 'Campus-wide Python and AI foundation mandated', text: '100% of first-year undergraduate students complete computational foundations.', domain: 'D07', evidence: 'Evidenced' },
        { finding: 'Industry software tooling embedded in core curricula', text: 'CAD, Bloomberg Terminal, and Tableau suites integrated into course assignments.', domain: 'D07', evidence: 'Evidenced' },
      ],
      gaps: [
        { finding: 'Ethical and generative AI verification pedagogy is emerging', text: 'Guidelines exist but student coursework verification rubrics are not universally enforced.', domain: 'D07', evidence: 'Partially evidenced' },
      ],
      claimsAwaiting: [
        { claim: 'All faculty members completed AI pedagogical training', evidenceNeeded: 'HR training attendance records for the 2025-2026 academic year.' },
      ],
      institutionalData: [
        { ref: 'D07-D01', item: 'Undergraduates completing AI foundation', value: '100%', state: 'Provided' },
        { ref: 'D07-D02', item: 'Industry digital tool licenses active', value: '18', state: 'Provided' },
        { ref: 'D07-D03', item: 'Faculty participating in AI pedagogy workshops', value: '620', state: 'Provided' },
      ],
      assessorObservation: 'Digital work-readiness is an institutional highlight. The campus-wide computing foundation provides a strong platform for advanced multidisciplinary capabilities.',
    },
  ];

  dimensionDetailRecords.forEach((rec) => {
    builder.drawDimensionResultPage(builder.currentPageNum, rec);
  });

  // PAGE 14: 6 · CROSS-DOMAIN DEPENDENCIES AND CONTRADICTIONS
  builder.doc.addPage();
  let y14 = 46;
  y14 = builder.drawSectionTracker(
    '6 · CROSS-DOMAIN DEPENDENCIES AND CONTRADICTIONS',
    'How the assessed domains relate to one another',
    'Cross-domain intelligence tests whether linked capabilities support or contradict each other. These findings prioritise verification and leadership attention. They have no direct score effect.',
    y14
  );

  d.fillColor(PALETTE.MUTED).fontSize(7).font('Helvetica').text(
    'Rules computed within the assessed scope: CD01 (D01 → D04), CD02 (D03 → D08), CD03 (D07 → D10).',
    40,
    y14
  );
  y14 += 14;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Contradictions', 40, y14);
  y14 += 12;
  d.rect(40, y14, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('RULE', 45, y14 + 4);
  d.text('LINK', 85, y14 + 4);
  d.text('INTERPRETATION', 220, y14 + 4);
  d.text('RECOMMENDED VERIFICATION', 380, y14 + 4);
  y14 += 16;

  const contradictions = [
    { rule: 'CD01\nHIGH', link: 'D01 Employer Demand →\nD04 Experiential Learning', interp: 'The institution reports strong employer advisory engagement, yet students in non-STEM faculties have no structured internship pathway.', verif: 'Sample employer meeting records and check internship credit allocations.' },
    { rule: 'CD02\nMEDIUM', link: 'D07 Digital Readiness →\nD08 Portfolio Signalling', interp: 'High digital capabilities reported, but students do not maintain verified digital capstone repositories.', verif: 'Inspect capstone submission systems across engineering and arts faculties.' },
  ];

  contradictions.forEach((c) => {
    d.fillColor(PALETTE.ROSE).fontSize(7).font('Helvetica-Bold').text(c.rule, 45, y14 + 2);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.2).font('Helvetica').text(c.link, 85, y14 + 2, { width: 125 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(c.interp, 220, y14 + 2, { width: 150 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(c.verif, 380, y14 + 2, { width: 170 });
    d.rect(40, y14 + 26, 515, 0.4).fill(PALETTE.BORDER);
    y14 += 28;
  });
  y14 += 8;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Institutional coherence diagnostics', 40, y14);
  y14 += 12;
  d.rect(40, y14, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('DIAGNOSTIC', 45, y14 + 4);
  d.text('STATE', 240, y14 + 4);
  d.text('NOTE', 330, y14 + 4);
  y14 += 16;

  const diagRows = [
    ['Strategy-to-Curriculum Coherence', 'Verified', 'Employer sensing directly influences 48 programme syllabi.'],
    ['Curriculum-to-Practice Coherence', 'Attention Required', 'Significant lag in non-STEM experiential learning.'],
    ['Practice-to-Signalling Coherence', 'Attention Required', 'Capstone verification not systematically recorded.'],
  ];

  diagRows.forEach(([diag, state, note]) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica').text(diag, 45, y14 + 2);
    const stColor = state === 'Verified' ? PALETTE.EMERALD : PALETTE.AMBER;
    d.fillColor(stColor).fontSize(7.5).font('Helvetica-Bold').text(state, 240, y14 + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(note, 330, y14 + 2, { width: 220 });
    d.rect(40, y14 + 14, 515, 0.4).fill(PALETTE.BORDER);
    y14 += 16;
  });
  y14 += 14;

  builder.drawCallout(y14, 'Score effect: none', 'A contradiction or dependency gap never adjusts a metric, domain or overall position. It tells assessors where to look and leadership where coherence is at risk.', 'neutral');

  // PAGE 15: 7 · VALIDATION, EVIDENCE AND VERIFICATION STATUS
  builder.doc.addPage();
  let y15 = 46;
  y15 = builder.drawSectionTracker(
    '7 · VALIDATION, EVIDENCE AND VERIFICATION STATUS',
    'How well the positions are supported',
    'Evidence strengthens confidence in your position. Missing evidence does not automatically reduce capability. Where the methodology requires evidence for a particular claim, that claim may remain unvalidated until sufficient evidence is available.',
    y15
  );

  y15 = builder.drawKpiRow(y15, [
    { label: 'EVIDENCE ITEMS SUBMITTED', value: '14', sub: 'core target 10–15' },
    { label: 'ACCEPTED', value: '10', sub: '2 under review · 2 returned' },
    { label: 'CLAIMS AWAITING EVIDENCE', value: '8', sub: 'across D01–D11' },
    { label: 'VERIFICATION', value: 'In progress', sub: 'independent audit cycle' },
  ]);

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Evidence register', 40, y15);
  y15 += 12;
  d.rect(40, y15, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('EVIDENCE ITEM', 45, y15 + 4);
  d.text('TYPE', 190, y15 + 4);
  d.text('PERIOD', 270, y15 + 4);
  d.text('DOMAINS', 350, y15 + 4);
  d.text('STATUS', 415, y15 + 4);
  d.text('LEVEL', 485, y15 + 4);
  y15 += 16;

  const evItems = [
    { name: 'Strategic Plan 2024–2029 (Employability chapter)', type: 'Strategy Doc', period: '2024–2029', dom: 'D01', st: 'Accepted', lvl: 'E3' },
    { name: 'Employer Advisory Board Minutes (Engineering & Business)', type: 'Governance', period: '2025-02', dom: 'D01, D03', st: 'Accepted', lvl: 'E2' },
    { name: 'Mandatory Python Curriculum Syllabi & Course Outlines', type: 'Curriculum', period: '2025-08', dom: 'D07', st: 'Accepted', lvl: 'E3' },
    { name: 'Corporate Internship Agreements & MoUs (180 partners)', type: 'Legal / MoU', period: '2025-11', dom: 'D04, D09', st: 'Accepted', lvl: 'E3' },
    { name: 'Alumni Longitudinal Employment Survey Draft', type: 'Survey', period: '2026-01', dom: 'D10', st: 'Under review', lvl: '—' },
    { name: 'Department Placement Brochure (2022)', type: 'Marketing', period: '2022-05', dom: 'D09', st: 'Returned', lvl: 'E1' },
  ];

  evItems.forEach((ev) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.2).font('Helvetica').text(ev.name, 45, y15 + 2, { width: 140 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(ev.type, 190, y15 + 2);
    d.text(ev.period, 270, y15 + 2);
    d.text(ev.dom, 350, y15 + 2);
    const stColor = ev.st === 'Accepted' ? PALETTE.EMERALD : ev.st === 'Under review' ? PALETTE.AMBER : PALETTE.MUTED;
    d.fillColor(stColor).fontSize(7.2).font('Helvetica-Bold').text(ev.st, 415, y15 + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica-Bold').text(ev.lvl, 485, y15 + 2);
    d.rect(40, y15 + 16, 515, 0.4).fill(PALETTE.BORDER);
    y15 += 18;
  });

  // PAGE 16: CONTINUED EVIDENCE & NOT-APPLICABLE DECISIONS
  builder.doc.addPage();
  let y16 = 46;
  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Validation flags & calibration', 40, y16);
  y16 += 12;
  d.rect(40, y16, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('DOMAIN', 45, y16 + 4);
  d.text('FLAG', 100, y16 + 4);
  d.text('COUNT', 220, y16 + 4);
  d.text('NOTE', 280, y16 + 4);
  y16 += 16;

  const valFlags = [
    ['D04', 'WIL SCOPE REVIEW', '2', 'High self-declaration score on uncredited non-STEM internships.'],
    ['D08', 'PORTFOLIO AUDIT', '1', 'Digital capstone repository requires live sample inspection.'],
    ['D10', 'LONGITUDINAL CORROBORATION', '1', 'Salary and progression statistics sourced from single alumni portal.'],
  ];

  valFlags.forEach(([dom, flag, count, note]) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(dom, 45, y16 + 2);
    d.fillColor(PALETTE.AMBER).fontSize(7.2).font('Helvetica-Bold').text(flag, 100, y16 + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(count, 220, y16 + 2);
    d.text(note, 280, y16 + 2, { width: 270 });
    d.rect(40, y16 + 14, 515, 0.4).fill(PALETTE.BORDER);
    y16 += 16;
  });
  y16 += 20;

  builder.drawCallout(y16, 'Assessor Calibration', '8 metrics were double-scored blind; 7 agreed within one level and 1 went to lead assessor adjudication. Assessor overrides recorded: 0.', 'neutral');

  // PAGE 17: 8 · ASSESSOR OBSERVATIONS AND PRIORITY AREAS
  builder.doc.addPage();
  let y17 = 46;
  y17 = builder.drawSectionTracker(
    '8 · ASSESSOR OBSERVATIONS AND PRIORITY AREAS',
    'What the assessors want leadership to notice',
    'Priorities and actions are assessor-authored professional recommendations informed by the assessed positions. They are not generated by the scoring engine and carry no score effect.',
    y17
  );

  const observations = [
    { author: 'Assessor A · Lead Evaluator · 2026-03-03', text: 'Whole assessment — The institution engaged openly with deep administrative support. The integration between corporate recruiters and engineering/business faculties is genuinely commendable and exemplary.' },
    { author: 'Assessor A · 2026-03-03', text: 'D04 — The absence of accredited, credit-bearing work-integrated learning in humanities and basic sciences is the single most urgent structural vulnerability in the institution\'s employability profile.' },
    { author: 'Assessor B · Second Assessor · 2026-03-04', text: 'D10 & D11 — Establishing 3-to-5 year longitudinal graduate career tracking will unlock higher confidence bands and enable verified ROI reporting to prospective students and parents.' },
  ];

  observations.forEach((obs) => {
    d.roundedRect(40, y17, 515, 42, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y17, 3, 42).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(obs.text, 50, y17 + 6, { width: 495, lineGap: 2 });
    d.fillColor(PALETTE.MUTED).fontSize(6.8).font('Helvetica').text(obs.author, 50, y17 + 28);
    y17 += 50;
  });
  y17 += 10;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Priority areas for executive intervention', 40, y17);
  y17 += 12;
  d.rect(40, y17, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('#', 45, y17 + 4);
  d.text('AREA', 65, y17 + 4);
  d.text('DOMAIN', 230, y17 + 4);
  d.text('WHY IT IS A PRIORITY', 310, y17 + 4);
  y17 += 16;

  const priAreas = [
    ['1', 'Non-STEM Work-Integrated Learning', 'D04', 'Largest transformation distance (+2 levels); affects 55% of undergraduates.'],
    ['2', 'Verified Capstone Portfolio System', 'D08', 'Essential to translate demonstrated coursework skills into recruiter signalling.'],
    ['3', 'Longitudinal Alumni Career Tracking', 'D10, D11', 'Needed to substantiate long-term career resilience and institutional ROI.'],
  ];

  priAreas.forEach(([num, area, dom, why]) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(num, 45, y17 + 2);
    d.text(area, 65, y17 + 2, { width: 160 });
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(dom, 230, y17 + 2);
    d.text(why, 310, y17 + 2, { width: 240 });
    d.rect(40, y17 + 14, 515, 0.4).fill(PALETTE.BORDER);
    y17 += 16;
  });

  // PAGE 18: 9 · RECOMMENDED ACTIONS (TRANSFORMATION ROADMAP)
  builder.doc.addPage();
  let y18 = 46;
  y18 = builder.drawSectionTracker(
    '9 · RECOMMENDED ACTIONS',
    'A sequenced direction of travel',
    'Actions are grouped by horizon. Each is linked to the gap it addresses so that progress can be read back against the assessment at reassessment.',
    y18
  );

  const actionHorizons = [
    {
      title: 'NEXT 90 DAYS',
      rows: [
        ['Enact credit-bearing internship framework in Academic Council', 'D04', 'No credits for non-STEM internships', 'Dean, Academic Affairs'],
        ['Deploy digital capstone repository guidelines for all faculties', 'D08', 'Lack of capability signalling', 'Director, IT / Deans'],
        ['Standardize employer advisory council terms of reference', 'D01', 'Unsynchronized advisory inputs', 'Registrar / Academic Council'],
      ],
    },
    {
      title: 'WITHIN 12 MONTHS',
      rows: [
        ['Mandate 12-week verified internships across all undergraduate programs', 'D04', 'Uneven practice reach', 'Faculty Deans'],
        ['Launch unified employer feedback rubric for workplace supervisors', 'D04, D09', 'Variable qualitative reviews', 'Career Center Director'],
        ['Institute 1-year and 3-year alumni career outcome tracking', 'D10, D11', 'Informal graduate tracking', 'Alumni Relations Cell'],
      ],
    },
    {
      title: 'LONGER-TERM DIRECTION',
      rows: [
        ['Establish Cross-Faculty Employability & Lifelong Mobility Academy', 'D11', 'Discontinuous career support', 'Executive Board'],
        ['Complete annual ECRI re-assessment to audit longitudinal progression', 'D01–D11', 'Longitudinal baseline', 'Vice-Chancellor'],
      ],
    },
  ];

  actionHorizons.forEach((h) => {
    d.fillColor(PALETTE.TEAL).fontSize(8).font('Helvetica-Bold').text(h.title, 40, y18);
    y18 += 10;
    d.rect(40, y18, 515, 14).fill(PALETTE.LIGHT_BG);
    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('ACTION', 45, y18 + 4);
    d.text('DOMAINS', 240, y18 + 4);
    d.text('LINKED GAP', 310, y18 + 4);
    d.text('SUGGESTED OWNER', 430, y18 + 4);
    y18 += 16;

    h.rows.forEach(([act, dom, gap, owner]) => {
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.2).font('Helvetica-Bold').text(act, 45, y18 + 2, { width: 190 });
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(dom, 240, y18 + 2);
      d.text(gap, 310, y18 + 2, { width: 115 });
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7).font('Helvetica').text(owner, 430, y18 + 2, { width: 120 });
      d.rect(40, y18 + 18, 515, 0.4).fill(PALETTE.BORDER);
      y18 += 20;
    });
    y18 += 8;
  });

  // PAGE 19: 10 · METHODOLOGY NOTE & LIMITATIONS
  builder.doc.addPage();
  let y19 = 46;
  y19 = builder.drawSectionTracker(
    '10 · METHODOLOGY NOTE',
    'About the ECRI methodology · ECRI v6.0 (pre-pilot)',
    'The Employability & Career Readiness Intelligence (ECRI) framework assesses institutional work-readiness across eleven dimensions and 132 canonical metrics. Each metric is scored by trained assessors against domain-specific maturity anchors on three constructs: maturity (how developed the capability is), implementation depth (how far it operates in practice) and outcome (what it has produced), together with an evidence level.',
    y19
  );

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Maturity scale', 40, y19);
  y19 += 12;
  d.rect(40, y19, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('LEVEL', 45, y19 + 4);
  d.text('LABEL', 90, y19 + 4);
  d.text('MEANING', 180, y19 + 4);
  y19 += 16;

  const matScale = [
    ['0', 'Absent', 'No recognisable capability.'],
    ['1', 'Reactive', 'Capability appears only in response to events.'],
    ['2', 'Emerging', 'Capability is forming in parts of the institution.'],
    ['3', 'Structured', 'Capability is defined, owned and repeatable.'],
    ['4', 'Integrated', 'Capability operates across the institution and connects to other capabilities.'],
    ['5', 'Adaptive', 'Capability learns and changes ahead of events.'],
  ];

  matScale.forEach(([lvl, label, meaning]) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(lvl, 45, y19 + 2);
    d.fillColor(PALETTE.TEAL).fontSize(7.5).font('Helvetica-Bold').text(label, 90, y19 + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.2).font('Helvetica').text(meaning, 180, y19 + 2, { width: 370 });
    d.rect(40, y19 + 12, 515, 0.4).fill(PALETTE.BORDER);
    y19 += 14;
  });
  y19 += 14;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Helvetica-Bold').text('Limitations and provisional status', 40, y19);
  y19 += 10;
  const limits = [
    'This is a Preliminary ECRI Assessment Report based on the canonical demonstration dataset. Full institutional certification requires independent on-site audit corroboration.',
    'Evidence levels E0–E4 express strength of support; claims at Level 3 or above require verified documentary corroboration.',
    'Assessment fees never influence score, ranking, verification status, or institutional recognition.',
  ];
  limits.forEach((lim) => {
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(`• ${lim}`, 45, y19, { width: 510, lineGap: 2 });
    y19 += 18;
  });

  // PAGE 20: REASSESSMENT & NEXT STEPS
  builder.doc.addPage();
  let y20 = 46;
  d.fillColor(PALETTE.NAVY_TEXT).fontSize(12).font('Times-Bold').text('Reassessment window & triggers', 40, y20);
  y20 += 16;
  d.fillColor(PALETTE.CHARCOAL).fontSize(8).font('Helvetica').text(
    'Recommended window: Full annual reassessment across all 11 dimensions in 12–18 months, or immediately upon adoption of a campus-wide credit-bearing internship framework.',
    40,
    y20,
    { width: 515, lineGap: 3 }
  );
  y20 += 32;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(12).font('Times-Bold').text('Next steps for institutional leadership', 40, y20);
  y20 += 16;
  const nextSteps = [
    '1. Academic Council review of the D04 Work-Integrated Learning transformation gap and internship credit policy.',
    '2. Registrar establishes standardized terms of reference for faculty employer advisory councils.',
    '3. Career Development Center initiates 3-to-5 year longitudinal alumni career telemetry tracking.',
    '4. Schedule formal verification score run following submission of outstanding evidence packets.',
  ];
  nextSteps.forEach((st) => {
    d.fillColor(PALETTE.CHARCOAL).fontSize(8).font('Helvetica').text(st, 45, y20, { width: 510, lineGap: 2.5 });
    y20 += 20;
  });
  y20 += 24;

  builder.drawCallout(y20, '', 'This document is an Executive ECRI Assessment Report generated under methodology version ECRI v6.0. It is confidential and prepared solely for institutional leadership.', 'neutral');

  // Finalize PDF file stream
  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

// ============================================================================
// 2. REBUILD THE 4 SPECIALIZED SAMPLE REPORTS
// ============================================================================
export async function generateDetailedMetricReport(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...ecriDemoMeta,
    productSubtitle: 'Detailed 132-Metric Diagnostic Report',
    reportId: 'RPT-ASM-DEMO-2026-0002',
  };
  const builder = new EcriVectorReportBuilder(meta, 12);
  const d = builder.doc;

  // Cover
  builder.drawCoverPage();

  // Metric audit pages
  for (let p = 1; p <= 11; p++) {
    builder.doc.addPage();
    let y = 46;
    const dCode = `D${String(p).padStart(2, '0')}`;
    const dName = [
      'Employer Demand Intelligence',
      'Employability Capability Framework',
      'Industry-Aligned Curriculum',
      'Experiential & Practice-Based Learning',
      'Career Development Infrastructure',
      'Professional & Human Capabilities',
      'Digital & AI-Era Work Readiness',
      'Portfolio & Capability Signalling',
      'Employer Engagement & Recruitment Ecosystem',
      'Employment Outcome Quality',
      'Career Adaptability & Lifelong Readiness',
    ][p - 1];

    y = builder.drawSectionTracker(
      `CANONICAL METRIC AUDIT · ${dCode}`,
      `${dCode} — ${dName}`,
      `Detailed metric-by-metric evaluation across all 12 canonical metrics for this dimension. Showing performance scores, observed maturity levels, anchor evaluations, and corroborating evidence levels.`,
      y
    );

    // Table of 12 metrics
    d.rect(40, y, 515, 14).fill(PALETTE.LIGHT_BG);
    d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('METRIC CODE', 45, y + 4);
    d.text('METRIC NAME & FOCUS', 115, y + 4);
    d.text('SCORE', 340, y + 4);
    d.text('MATURITY', 390, y + 4);
    d.text('STATUS', 440, y + 4);
    d.text('EVID', 495, y + 4);
    y += 16;

    for (let m = 1; m <= 12; m++) {
      const mCode = `${dCode}-I${String(m).padStart(2, '0')}`;
      const mScore = Math.min(95, Math.max(45, 70 + ((m * 7) % 25) - 10));
      const mMaturity = mScore >= 80 ? 4 : mScore >= 65 ? 3 : 2;
      const mStatus = mScore >= 75 ? 'DEVELOPING' : mScore >= 85 ? 'STRONG' : 'PRIORITY';
      const mEv = m % 3 === 0 ? 'E3' : 'E2';

      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7).font('Helvetica-Bold').text(mCode, 45, y + 2);
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(`Metric construct evaluating specific dimension sub-capability ${m}`, 115, y + 2, { width: 220 });
      d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica-Bold').text(`${mScore}%`, 340, y + 2);
      d.text(`Level ${mMaturity}`, 390, y + 2);
      d.fillColor(mStatus === 'PRIORITY' ? PALETTE.ROSE : PALETTE.TEAL).fontSize(6.5).font('Helvetica-Bold').text(mStatus, 440, y + 2);
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica-Bold').text(mEv, 495, y + 2);

      d.rect(40, y + 14, 515, 0.4).fill(PALETTE.BORDER);
      y += 16;
    }
  }

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

export async function generateBoardScorecardReport(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...ecriDemoMeta,
    productSubtitle: 'Board of Governors Executive Scorecard',
    reportId: 'RPT-ASM-DEMO-2026-0003',
  };
  const builder = new EcriVectorReportBuilder(meta, 4);
  const d = builder.doc;

  // Cover
  builder.drawCoverPage();

  // Page 2: Board Overview Deck
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('BOARD SCORECARD', 'Executive Governance Summary', 'Prepared for Board of Governors, Chancellor, and Executive Committee.', y);

  y = builder.drawKpiRow(y, [
    { label: 'OVERALL INDEX', value: '74.8 / 100', sub: 'Level 4 · Established' },
    { label: 'TARGET MATURITY', value: 'Level 4.0', sub: 'Institution Target' },
    { label: 'PRIORITY ACTIONS', value: '3 Major', sub: 'Approved by Council' },
    { label: 'ESTIMATED INVESTMENT', value: 'High ROI', sub: 'Curriculum & WIL focus' },
  ]);

  // Page 3: Maturity Quadrant Matrix
  builder.doc.addPage();
  let y3 = 46;
  y3 = builder.drawSectionTracker('MATURITY QUADRANT', 'Strategic Dimension Allocation', 'Quadrant positioning across Institutional Impact vs Transformation Distance.', y3);

  builder.drawCallout(y3, 'High Impact / High Maturity (Institutional Champions)', 'D03 Industry-Aligned Curriculum (81%), D07 Digital Readiness (79%), D09 Employer Recruitment (77%)', 'teal');
  y3 += 52;
  builder.drawCallout(y3, 'High Impact / Transformation Distance (Executive Priorities)', 'D04 Experiential Learning & Internships (67%, Gap +2), D08 Capstone Signalling (69%, Gap +2)', 'amber');

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

export async function generateEvidenceDossierReport(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...ecriDemoMeta,
    productSubtitle: 'Evidence & Integrity Dossier',
    reportId: 'RPT-ASM-DEMO-2026-0004',
  };
  const builder = new EcriVectorReportBuilder(meta, 4);
  const d = builder.doc;

  // Cover
  builder.drawCoverPage();

  // Page 2: Evidence Audit Register
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('EVIDENCE DOSSIER', 'Full Documentary Audit Trail', 'Traceable evidence register linking institutional documents to 132 metrics.', y);

  y = builder.drawKpiRow(y, [
    { label: 'SUBMITTED EVIDENCE', value: '14 Packets', sub: 'Target 10–15 met' },
    { label: 'ACCEPTED / VERIFIED', value: '10 Packets', sub: 'Independent audit' },
    { label: 'UNDER REVIEW', value: '2 Packets', sub: 'Clarification requested' },
    { label: 'TEMPORAL VALIDITY', value: '100% Window', sub: '2024–2026 records' },
  ]);

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

export async function generateTransformationRoadmapReport(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...ecriDemoMeta,
    productSubtitle: '3-Horizon Transformation Roadmap',
    reportId: 'RPT-ASM-DEMO-2026-0005',
  };
  const builder = new EcriVectorReportBuilder(meta, 4);
  const d = builder.doc;

  // Cover
  builder.drawCoverPage();

  // Page 2: Roadmap Action Matrix
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('STRATEGIC ROADMAP', '3-Horizon Institutional Execution Matrix', 'A sequenced management plan linking diagnostic gaps to accountable executive owners and measurable milestones.', y);

  y = builder.drawKpiRow(y, [
    { label: 'HORIZON 1 (90 DAYS)', value: '3 Initiatives', sub: 'Immediate policy actions' },
    { label: 'HORIZON 2 (12 MONTHS)', value: '4 Initiatives', sub: 'Curriculum & WIL rollout' },
    { label: 'HORIZON 3 (LONGER TERM)', value: '2 Initiatives', sub: 'Ecosystem & alumni mobility' },
    { label: 'ACCOUNTABLE OWNERS', value: 'Deans & Council', sub: 'Named leadership roles' },
  ]);

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

// Run full batch generation
export async function generateAllSamplePdfs(): Promise<void> {
  console.log('================================================================================');
  console.log('🏛️  REBUILDING ALL 5 ECRI SAMPLE REPORTS TO ARUI 20-PAGE BENCHMARK STANDARD');
  console.log('================================================================================\n');

  const sampleTargets = [
    { name: 'ECRI_Sample_Executive_Report.pdf', fn: generateEcriExecutiveReport, desc: '1. Executive Institutional Assessment Report (20 Pages)' },
    { name: 'ECRI_Sample_Detailed_132_Metric_Report.pdf', fn: generateDetailedMetricReport, desc: '2. Detailed 132-Metric Diagnostic Report (12 Pages)' },
    { name: 'ECRI_Sample_Board_Scorecard.pdf', fn: generateBoardScorecardReport, desc: '3. Board of Governors Executive Scorecard (4 Pages)' },
    { name: 'ECRI_Sample_Evidence_Integrity_Dossier.pdf', fn: generateEvidenceDossierReport, desc: '4. Evidence & Integrity Dossier (4 Pages)' },
    { name: 'ECRI_Sample_Transformation_Roadmap.pdf', fn: generateTransformationRoadmapReport, desc: '5. 3-Horizon Transformation Roadmap (4 Pages)' },
  ];

  for (const t of sampleTargets) {
    const dest1 = path.join(samplesDir, t.name);
    const dest2 = path.join(uploadsDir, t.name);
    console.log(`⏳ Generating ${t.desc}...`);
    await t.fn(dest1);
    fs.copyFileSync(dest1, dest2);
    const sz = fs.statSync(dest1).size;
    console.log(`   ✅ Created ${t.name} (${sz.toLocaleString()} bytes) -> public/samples/ & uploads/`);
  }

  console.log('\n🎉 ALL 5 ECRI SAMPLE REPORTS SUCCESSFULLY GENERATED TO ARUI STANDARD!\n');
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateAllSamplePdfs().catch((err) => {
    console.error('Batch report generation failed:', err);
    process.exit(1);
  });
}
