import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EcriVectorReportBuilder, PALETTE, ReportMeta } from './ecriReportBuilder.js';
import { ECRI_DEMO_ASSESSMENT } from '../methodology/ecriDemoAssessment.js';
import { buildReportManifest } from './manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../../..');
const samplesDir = path.join(rootDir, 'university-insights-main/public/samples');
const uploadsDir = path.resolve(__dirname, '../../../uploads');

if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const canonicalMeta: ReportMeta = {
  productCode: 'ecri',
  productName: 'Employability & Career Readiness Intelligence',
  productSubtitle: 'Institutional Assessment Report',
  institutionName: ECRI_DEMO_ASSESSMENT.institution.name,
  institutionMeta: `${ECRI_DEMO_ASSESSMENT.institution.subtitle} · ${ECRI_DEMO_ASSESSMENT.institution.type} · ${ECRI_DEMO_ASSESSMENT.institution.location}`,
  assessmentId: ECRI_DEMO_ASSESSMENT.assessmentId,
  reportId: 'RPT-ECRI-2026-0001',
  assessmentPeriod: ECRI_DEMO_ASSESSMENT.assessmentPeriod,
  methodologyVersion: ECRI_DEMO_ASSESSMENT.methodologyVersion,
  scoreRun: 'run-1 (certified)',
  assessmentStatus: 'Certified Baseline',
  generatedDate: '2026-09-18',
  audience: 'Vice-Chancellor, Executive Board and Academic Council',
  overallScore: ECRI_DEMO_ASSESSMENT.overallScore,
  overallLevel: ECRI_DEMO_ASSESSMENT.overallMaturityLabel,
  coverageLabel: 'COMPREHENSIVE — D01–D11 ASSESSED (132 METRICS)',
  sampleBadgeLabel: ECRI_DEMO_ASSESSMENT.institution.sampleBadge,
};

// ============================================================================
// 1. REBUILD 20-PAGE ECRI EXECUTIVE INSTITUTIONAL ASSESSMENT REPORT
// ============================================================================
export async function generateEcriExecutiveReport(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...canonicalMeta,
    productSubtitle: 'Executive Institutional Assessment Report',
    reportId: 'RPT-ECRI-EXEC-001',
  };
  const builder = new EcriVectorReportBuilder(meta, 20);
  const d = builder.doc;

  // PAGE 1: COVER PAGE
  builder.drawCoverPage();

  // PAGE 2: REPORT INFORMATION & CONTENTS
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('REPORT INFORMATION', 'About this report', 'This report presents the ECRI Institutional Assessment for Metropolitan Apex University across all eleven dimensions in the comprehensive scope.', y);

  const infoData = [
    ['Institution', meta.institutionName],
    ['Subtitle', ECRI_DEMO_ASSESSMENT.institution.subtitle],
    ['Assessment ID', meta.assessmentId],
    ['Report ID', meta.reportId],
    ['Report kind', 'Executive Benchmark Dossier'],
    ['Assessment period', meta.assessmentPeriod],
    ['Methodology version', meta.methodologyVersion],
    ['Score run', meta.scoreRun],
    ['Scope', '11 Dimensions · 132 Canonical Metrics · Comprehensive Scope'],
    ['Contributors', 'Institution Admin: Office of the Vice-Chancellor; Contributor: Dean of Career & WIL;\nContributor: Director of Corporate Partnerships & Work-Integrated Learning'],
    ['Assessors', 'Lead Assessor: Dr. Robert Sterling (Lead ECRI Adjudicator); Second Assessor: Prof. Elizabeth Vance'],
    ['Confidentiality', 'Confidential — prepared for institutional leadership. Illustrative demonstration sample.'],
  ];

  infoData.forEach(([label, val]) => {
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(label, 45, y + 2, { width: 140 });
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font(label === 'Institution' ? 'Helvetica-Bold' : 'Helvetica').text(val, 195, y + 2, { width: 355 });
    d.rect(40, y + (val.includes('\n') ? 22 : 14), 515, 0.4).fill(PALETTE.BORDER);
    y += (val.includes('\n') ? 25 : 16);
  });
  y += 8;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('How to read this report', 40, y);
  y += 13;
  d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(
    'Current maturity is the level the institution demonstrates today on a 0–5 scale, scored by assessors against domain-specific anchors. Required maturity is derived from mandate, employer exposure, and disciplinary consequence. Transformation distance is required minus current (diagnostic gap). Evidence confidence describes corroboration quality.',
    40, y, { width: 515, lineGap: 2 }
  );
  y += 36;

  builder.drawCallout(y, '', 'Assessment coverage: 11 of 11 dimensions. Comprehensive institutional evaluation across all 132 canonical metrics. Synthetic illustrative demonstration data.', 'teal');
  y += 42;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('Contents', 40, y);
  y += 12;
  const tocItems = [
    '1. Executive summary', '2. Institutional context and profile', '3. Assessment scope and coverage',
    '4. Overall ECRI position', '5. Dimension results — D01 through D11', '6. Cross-domain dependencies & pathways',
    '7. Evidence integrity & confidence', '8. Assessor observations & strengths', '9. Priority transformation actions',
    '10. 3-Horizon implementation roadmap', '11. Methodology & limitations', '12. Continuous assessment & closing'
  ];
  tocItems.forEach((item) => {
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(item, 45, y + 1);
    d.rect(40, y + 11, 515, 0.4).fill(PALETTE.BORDER);
    y += 12;
  });

  // PAGE 3: EXECUTIVE SUMMARY
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('EXECUTIVE SUMMARY', 'Executive summary', 'High-level synthesis of institutional employability capability, strengths, gaps and transformation priorities.', y);

  builder.drawScoreCard(y, ECRI_DEMO_ASSESSMENT.overallScore, ECRI_DEMO_ASSESSMENT.overallMaturityLabel, 'Comprehensive 11-dimension evaluation across 132 canonical metrics (84th Percentile).');
  y += 75;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('Summary Assessment', 40, y);
  y += 13;
  d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(
    'Metropolitan Apex University demonstrates an established and scaling employability profile (Overall Score: 74.8 / 100, Level 4). The institution exhibits exceptional performance in Industry-Aligned Curriculum (D03: 81.0), Digital & AI-Era Work Readiness (D07: 79.0), Employer Demand Intelligence (D01: 78.0), and Employer Engagement (D09: 77.0).\n\n' +
    'The primary strategic opportunities lie in Experiential & Practice-Based Learning (D04: 67.0, Distance +1) and Portfolio & Capability Signalling (D08: 69.0), where scaling structured WIL placement equity and W3C digital badging represent immediate high-yield levers.',
    40, y, { width: 515, lineGap: 2.5 }
  );
  y += 62;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('Key Institutional Strengths & Focus Areas', 40, y);
  y += 12;
  const strengthCards = [
    { title: 'Industry-Aligned Curriculum (D03: 81.0)', text: '84% of degree programmes feature mandatory biennial industry co-design reviews with live employer problem briefs.' },
    { title: 'Digital & AI-Era Readiness (D07: 79.0)', text: 'Campus-wide AI literacy credential embedded with 92% student completion rate and ethical AI usage guidelines.' },
    { title: 'Employment Outcome Quality (D10: 73.0)', text: '89.2% full-time employment at 6 months with +14.8% starting salary premium in STEM and Business clusters.' },
  ];
  strengthCards.forEach((c) => {
    d.roundedRect(40, y, 515, 30, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 30).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(c.title, 48, y + 4);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(c.text, 48, y + 15, { width: 495 });
    y += 34;
  });

  // PAGE 4: INSTITUTIONAL CONTEXT & OVERALL ECRI POSITION
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('INSTITUTIONAL POSITION', 'Overall ECRI Position & Benchmark', 'Detailed profile of institutional capability balance, transformation distance and benchmark cohort.', y);

  builder.drawScoreCard(y, ECRI_DEMO_ASSESSMENT.overallScore, 'Level 4 · Transformative & Scaling', 'Positioned in the Top Decile (Tier 1 Benchmark Cohort) among 48 evaluated institutions.');
  y += 75;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('11-Dimension Capability & Maturity Profile', 40, y);
  y += 12;

  // Table header
  d.rect(40, y, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('CODE', 45, y + 4);
  d.text('DIMENSION', 80, y + 4);
  d.text('SCORE', 260, y + 4);
  d.text('CURRENT', 320, y + 4);
  d.text('REQUIRED', 380, y + 4);
  d.text('DISTANCE', 440, y + 4);
  d.text('STATUS', 490, y + 4);
  y += 16;

  ECRI_DEMO_ASSESSMENT.dimensionsList.forEach((dim) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(dim.code, 45, y + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(dim.name, 80, y + 2, { width: 175, lineBreak: false });
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(`${dim.score.toFixed(1)} / 100`, 260, y + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(`Level ${dim.currentMaturity}`, 320, y + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(`Level ${dim.requiredMaturity}`, 380, y + 2);
    d.fillColor(dim.transformationDistance.startsWith('+') ? PALETTE.AMBER : PALETTE.TEAL).fontSize(7.5).font('Helvetica-Bold').text(dim.transformationDistance, 440, y + 2);
    d.fillColor(dim.status === 'INTEGRATED' ? PALETTE.TEAL : PALETTE.CHARCOAL).fontSize(7).font('Helvetica-Bold').text(dim.status, 490, y + 2);
    d.rect(40, y + 14, 515, 0.4).fill(PALETTE.BORDER);
    y += 15;
  });

  // PAGES 5–15: 11 DIMENSION DEEP DIVES (D01 through D11)
  ECRI_DEMO_ASSESSMENT.dimensionsList.forEach((dim, idx) => {
    const dNum = idx + 1;
    const padDNum = dNum < 10 ? `0${dNum}` : `${dNum}`;

    builder.drawDimensionResultPage(idx + 5, {
      sectionNum: `5.${padDNum}`,
      code: dim.code,
      name: dim.name,
      currentMaturity: dim.currentMaturity,
      currentLabel: `Level ${dim.currentMaturity} · Established`,
      requiredMaturity: dim.requiredMaturity,
      requiredLabel: `Level ${dim.requiredMaturity} · Integrated`,
      distance: dim.requiredMaturity - dim.currentMaturity,
      score: dim.score,
      scoreStatus: dim.status,
      evidenceConfidence: dim.evidenceConfidence,
      evidenceCoverage: '100%',
      metricsSummary: '12 of 12 metrics evaluated and corroborated',
      capabilities: dim.metrics.slice(0, 4).map((m) => ({
        name: m.name,
        score: m.score,
        status: 'ASSESSED',
        evidence: m.evidenceLevel,
      })),
      strengths: dim.strengths.map((s) => ({
        finding: s,
        text: 'Established operational capability verified through institutional documentation.',
        domain: dim.code,
        evidence: 'E3',
      })),
      gaps: dim.gaps.map((g) => ({
        finding: g,
        text: 'Opportunity for enhanced institutional integration and automated monitoring.',
        domain: dim.code,
        evidence: 'E2',
      })),
      claimsAwaiting: [],
      institutionalData: [
        { ref: `${dim.code}-POL`, item: 'Formally Approved Institutional Governance Policy', value: 'Yes (Active)', state: 'VERIFIED' },
        { ref: `${dim.code}-AUD`, item: 'Annual Curriculum & Stakeholder Audit Cycle', value: '14 Faculties', state: 'VERIFIED' },
        { ref: `${dim.code}-MET`, item: '12 Canonical Metrics Scored & Corroborated', value: '12 of 12 (100%)', state: 'CORROBORATED' },
      ],
      assessorObservation: dim.assessorObservation,
    });
  });

  // PAGE 16: CROSS-DOMAIN INTELLIGENCE & PATHWAY COHERENCE
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('CROSS-DOMAIN INTELLIGENCE', 'Cross-Domain Diagnostic & Coherence', 'Analysis of systemic alignment across the complete graduate employability lifecycle.', y);

  builder.drawCallout(y, 'Primary Pathway Analysis', ECRI_DEMO_ASSESSMENT.crossDomainIntelligence.pathway, 'teal');
  y += 50;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('Systemic Coherence Findings', 40, y);
  y += 12;
  ECRI_DEMO_ASSESSMENT.crossDomainIntelligence.observations.forEach((obs) => {
    d.roundedRect(40, y, 515, 32, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 32).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(obs, 50, y + 6, { width: 495, lineGap: 2 });
    y += 36;
  });
  y += 8;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('Diagnostic Breaking Points & Friction Levers', 40, y);
  y += 12;
  ECRI_DEMO_ASSESSMENT.crossDomainIntelligence.breakingPoints.forEach((bp) => {
    d.roundedRect(40, y, 515, 32, 3).fillAndStroke(PALETTE.ROSE_LIGHT, PALETTE.BORDER);
    d.rect(40, y, 3, 32).fill(PALETTE.ROSE);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(bp, 50, y + 6, { width: 495, lineGap: 2 });
    y += 36;
  });

  // PAGE 17: EVIDENCE INTEGRITY & CONFIDENCE
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('EVIDENCE INTEGRITY', 'Evidence Dossier & Corroboration Audit', 'Audit trails, artifact verification hashes, and evidence confidence scoring across all 11 dimensions.', y);

  builder.drawScoreCard(y, 88.0, 'Evidence Confidence: High (E3+)', '36 corroborating institutional artifacts audited with zero uncorroborated high-maturity claims.');
  y += 75;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('Key Corroborated Institutional Evidence Artifacts', 40, y);
  y += 12;
  ECRI_DEMO_ASSESSMENT.evidenceDossier.forEach((ev) => {
    d.roundedRect(40, y, 515, 36, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 36).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(`${ev.id} · ${ev.title} [Level: ${ev.level}]`, 50, y + 5);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(`${ev.description}\nTraceability: ${ev.traceability}`, 50, y + 16, { width: 495 });
    y += 40;
  });

  // PAGE 18: TRANSFORMATION ACTIONS & 3-HORIZON ROADMAP
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('TRANSFORMATION ROADMAP', 'Strategic 3-Horizon Action Matrix', 'Prescribed institutional interventions phased across immediate (90-day), medium-term (12-month) and longitudinal horizons.', y);

  ECRI_DEMO_ASSESSMENT.roadmap.forEach((act) => {
    d.roundedRect(40, y, 515, 46, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 46).fill(act.priority === 'CRITICAL' ? PALETTE.ROSE : act.priority === 'HIGH' ? PALETTE.AMBER : PALETTE.TEAL);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(`${act.id} · ${act.horizonLabel} — ${act.dimensionName} (Priority: ${act.priority})`, 50, y + 5);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(`Action: ${act.action}\nOwner: ${act.owner} | Success Measure: ${act.successMeasure}`, 50, y + 17, { width: 495, lineGap: 1.5 });
    y += 50;
  });

  // PAGE 19: METHODOLOGY & LIMITATIONS
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('METHODOLOGY & GOVERNANCE', 'Methodology, Calibration & Limitations', 'Technical notes on the ECRI v6.0 mathematical engine, scoring isolation, and institutional governance principles.', y);

  const methodNotes = [
    { title: 'Methodology Framework', text: 'ECRI evaluates graduate employability across 11 canonical dimensions and 132 standardized metrics. Scoring combines Maturity Anchors (M0–M5), Implementation Depth (I0–I5), and Outcome Quality (O0–O5).' },
    { title: 'Transformation Distance vs Capability', text: 'Required maturity is context-derived based on institutional mandate, student population, and disciplinary exposure. Transformation distance is a gap analysis tool and never reduces raw capability scores.' },
    { title: 'Evidence Standard (E0–E4)', text: 'Maturity claims at Level 3 and above require multi-source artifact corroboration (E3/E4). Uncorroborated claims are capped to prevent gaming.' },
    { title: 'Living Benchmark & Snapshot Cycle', text: 'Institutions maintain living continuous assessment records. Formal score snapshots are locked during certified annual review cycles.' },
  ];
  methodNotes.forEach((mn) => {
    d.roundedRect(40, y, 515, 34, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 34).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(mn.title, 50, y + 5);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(mn.text, 50, y + 16, { width: 495 });
    y += 38;
  });

  // PAGE 20: SAMPLE CLOSING PAGE (Section 27 of spec)
  builder.drawSampleClosingPage(ECRI_DEMO_ASSESSMENT.methodologyVersion);

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

// ============================================================================
// 2. REBUILD DETAILED 132-METRIC DIAGNOSTIC REPORT (All 132 Canonical Metrics)
// ============================================================================
export async function generateEcriDetailed132MetricReport(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...canonicalMeta,
    productSubtitle: 'Detailed 132-Metric Diagnostic Report',
    reportId: 'RPT-ECRI-DET-002',
  };
  const totalPages = 14; // Cover + Overview + 11 Dimension Pages + Sample Closing Page
  const builder = new EcriVectorReportBuilder(meta, totalPages);
  const d = builder.doc;

  // PAGE 1: COVER PAGE
  builder.drawCoverPage();

  // PAGE 2: TAXONOMY OVERVIEW
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('TAXONOMY OVERVIEW', '132-Metric Canonical Diagnostic Structure', 'Exhaustive rubric breakdown of all 11 Dimensions and 132 canonical metrics.', y);

  builder.drawScoreCard(y, ECRI_DEMO_ASSESSMENT.overallScore, '132 of 132 Metrics Scored', 'Complete diagnostic dataset populated across 11 dimensions (12 metrics per dimension).');
  y += 75;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('Metric Distribution & Scoring Standard', 40, y);
  y += 12;
  d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(
    'Every metric is scored on a 0–100 standardized scale derived from rubric maturity level (1–5), implementation depth, and outcome achievement. Evidence level (E0–E4) validates the provenance of each capability claim.',
    40, y, { width: 515, lineGap: 2 }
  );
  y += 32;

  // 11 Dimension Deep Dives (Pages 3 to 13)
  ECRI_DEMO_ASSESSMENT.dimensionsList.forEach((dim) => {
    builder.doc.addPage();
    let dy = 46;
    dy = builder.drawSectionTracker(
      `DIMENSION METRIC AUDIT · ${dim.code}`,
      `${dim.name} (12 Canonical Metrics)`,
      `Score: ${dim.score.toFixed(1)} / 100 | Maturity: Level ${dim.currentMaturity} | Required: Level ${dim.requiredMaturity} | Distance: ${dim.transformationDistance}`,
      dy
    );

    // Table Header
    d.rect(40, dy, 515, 13).fill(PALETTE.LIGHT_BG);
    d.fillColor(PALETTE.MUTED).fontSize(6).font('Helvetica-Bold').text('CODE', 44, dy + 3.5);
    d.text('METRIC NAME', 80, dy + 3.5);
    d.text('SCORE', 260, dy + 3.5);
    d.text('MATURITY', 305, dy + 3.5);
    d.text('IMPL', 355, dy + 3.5);
    d.text('EVID', 395, dy + 3.5);
    d.text('STATUS', 430, dy + 3.5);
    d.text('GAP / INTERVENTION', 475, dy + 3.5);
    dy += 15;

    dim.metrics.forEach((m) => {
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7).font('Helvetica-Bold').text(m.fullCode, 44, dy + 1);
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(m.name, 80, dy + 1, { width: 175, lineBreak: false });
      d.fillColor(PALETTE.NAVY_TEXT).fontSize(7).font('Helvetica-Bold').text(`${m.score}/100`, 260, dy + 1);
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(`L${m.maturityLevel}`, 305, dy + 1);
      d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(`${m.implementationScore}%`, 355, dy + 1);
      d.fillColor(PALETTE.TEAL).fontSize(7).font('Helvetica-Bold').text(m.evidenceLevel, 395, dy + 1);
      d.fillColor(PALETTE.CHARCOAL).fontSize(6.5).font('Helvetica-Bold').text(m.evidenceStatus, 430, dy + 1);
      d.fillColor(PALETTE.MUTED).fontSize(6).font('Helvetica').text(m.gap.slice(0, 32) + '…', 475, dy + 1, { width: 80, lineBreak: false });
      d.rect(40, dy + 11, 515, 0.4).fill(PALETTE.BORDER);
      dy += 12.5;
    });

    dy += 8;
    d.roundedRect(40, dy, 515, 24, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, dy, 3, 24).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.CHARCOAL).fontSize(6.8).font('Helvetica').text(`Dimension Finding: ${dim.assessorObservation}`, 48, dy + 4, { width: 495, lineGap: 1.5 });
  });

  // PAGE 14: SAMPLE CLOSING PAGE
  builder.drawSampleClosingPage(ECRI_DEMO_ASSESSMENT.methodologyVersion);

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

// ============================================================================
// 3. REBUILD BOARD SCORECARD (4 Pages)
// ============================================================================
export async function generateEcriBoardScorecard(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...canonicalMeta,
    productSubtitle: 'Boardroom Governance & Risk Scorecard',
    reportId: 'RPT-ECRI-BRD-003',
  };
  const builder = new EcriVectorReportBuilder(meta, 4);
  const d = builder.doc;

  // PAGE 1: COVER & OVERALL POSITION
  builder.drawCoverPage();

  // PAGE 2: 11-DIMENSION EXECUTIVE PROFILE & DISTANCE
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('GOVERNANCE PROFILE', '11-Dimension Capability & Maturity Matrix', 'Board-level executive overview of institutional employability positioning and required transformation.', y);

  builder.drawScoreCard(y, ECRI_DEMO_ASSESSMENT.overallScore, ECRI_DEMO_ASSESSMENT.overallMaturityLabel, 'Top Quartile Positioning in 2026 Academic Baseline (84th Percentile).');
  y += 75;

  // 11 Dimensions Table
  d.rect(40, y, 515, 14).fill(PALETTE.LIGHT_BG);
  d.fillColor(PALETTE.MUTED).fontSize(6.5).font('Helvetica-Bold').text('CODE', 45, y + 4);
  d.text('DIMENSION', 80, y + 4);
  d.text('SCORE', 260, y + 4);
  d.text('CURRENT', 320, y + 4);
  d.text('REQUIRED', 380, y + 4);
  d.text('DISTANCE', 440, y + 4);
  d.text('STATUS', 490, y + 4);
  y += 16;

  ECRI_DEMO_ASSESSMENT.dimensionsList.forEach((dim) => {
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(dim.code, 45, y + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(dim.name, 80, y + 2, { width: 175, lineBreak: false });
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(`${dim.score.toFixed(1)} / 100`, 260, y + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(`Level ${dim.currentMaturity}`, 320, y + 2);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(`Level ${dim.requiredMaturity}`, 380, y + 2);
    d.fillColor(dim.transformationDistance.startsWith('+') ? PALETTE.AMBER : PALETTE.TEAL).fontSize(7.5).font('Helvetica-Bold').text(dim.transformationDistance, 440, y + 2);
    d.fillColor(dim.status === 'INTEGRATED' ? PALETTE.TEAL : PALETTE.CHARCOAL).fontSize(7).font('Helvetica-Bold').text(dim.status, 490, y + 2);
    d.rect(40, y + 14, 515, 0.4).fill(PALETTE.BORDER);
    y += 15;
  });

  // PAGE 3: STRATEGIC PRIORITIES & BOARD DECISIONS
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('BOARD ACTION', 'Strategic Priorities & Governance Decisions', 'Critical transformation actions and risk mitigation requirements recommended for Board endorsement.', y);

  ECRI_DEMO_ASSESSMENT.roadmap.slice(0, 4).forEach((act) => {
    d.roundedRect(40, y, 515, 42, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 42).fill(act.priority === 'CRITICAL' ? PALETTE.ROSE : PALETTE.AMBER);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(8).font('Helvetica-Bold').text(`${act.id} · ${act.dimensionName} [Priority: ${act.priority}]`, 50, y + 5);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(`Recommended Decision: ${act.action}\nOwner: ${act.owner} | Target: ${act.reviewDate}`, 50, y + 17, { width: 495, lineGap: 1.5 });
    y += 48;
  });

  // PAGE 4: SAMPLE CLOSING PAGE
  builder.drawSampleClosingPage(ECRI_DEMO_ASSESSMENT.methodologyVersion);

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

// ============================================================================
// 4. REBUILD EVIDENCE & INTEGRITY DOSSIER (4 Pages)
// ============================================================================
export async function generateEcriEvidenceDossier(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...canonicalMeta,
    productSubtitle: 'Evidence Integrity & Verification Dossier',
    reportId: 'RPT-ECRI-EVI-004',
  };
  const builder = new EcriVectorReportBuilder(meta, 4);
  const d = builder.doc;

  // PAGE 1: COVER
  builder.drawCoverPage();

  // PAGE 2: EVIDENCE CONFIDENCE & COVERAGE AUDIT
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('EVIDENCE AUDIT', 'Evidence Confidence & Audit Trails', 'Verification protocols, anti-gaming safeguards, and artifact corroboration levels across all 11 dimensions.', y);

  builder.drawScoreCard(y, 88.0, 'Evidence Confidence: High (E3+)', '36 audited institutional artifacts with verifiable cryptographic audit hashes.');
  y += 75;

  d.fillColor(PALETTE.NAVY_TEXT).fontSize(9.5).font('Times-Bold').text('Dimension Evidence Corroboration Summary', 40, y);
  y += 12;

  ECRI_DEMO_ASSESSMENT.dimensionsList.slice(0, 6).forEach((dim) => {
    d.roundedRect(40, y, 515, 26, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 26).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(`${dim.code} · ${dim.name}`, 48, y + 4);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(`Confidence: ${dim.evidenceConfidence}% | 12 Metrics Corroborated | Audit Status: VERIFIED`, 48, y + 14);
    y += 30;
  });

  // PAGE 3: TRACEABILITY MATRIX & VERIFIED ARTIFACTS
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('TRACEABILITY MATRIX', 'Traceability & Verification Registry', 'End-to-end provenance mapping from institutional evidence to scored capability positions.', y);

  ECRI_DEMO_ASSESSMENT.evidenceDossier.forEach((ev) => {
    d.roundedRect(40, y, 515, 42, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 42).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(7.5).font('Helvetica-Bold').text(`${ev.id} · ${ev.title} [Level: ${ev.level}]`, 50, y + 5);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7).font('Helvetica').text(`Source: ${ev.sourceType}\nTraceability: ${ev.traceability}\nHash: ${ev.verificationHash}`, 50, y + 15, { width: 495 });
    y += 48;
  });

  // PAGE 4: SAMPLE CLOSING PAGE
  builder.drawSampleClosingPage(ECRI_DEMO_ASSESSMENT.methodologyVersion);

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

// ============================================================================
// 5. REBUILD TRANSFORMATION ROADMAP (4 Pages)
// ============================================================================
export async function generateEcriTransformationRoadmap(outputPath: string): Promise<void> {
  const meta: ReportMeta = {
    ...canonicalMeta,
    productSubtitle: 'Strategic 3-Horizon Transformation Roadmap',
    reportId: 'RPT-ECRI-RDM-005',
  };
  const builder = new EcriVectorReportBuilder(meta, 4);
  const d = builder.doc;

  // PAGE 1: COVER
  builder.drawCoverPage();

  // PAGE 2: 3-HORIZON ARCHITECTURE & NOW (90 DAYS)
  builder.doc.addPage();
  let y = 46;
  y = builder.drawSectionTracker('HORIZON 1: NOW', 'Immediate Interventions (0–90 Days)', 'Critical capability upgrades and quick-win policy actions required in the first operating quarter.', y);

  const nowActs = ECRI_DEMO_ASSESSMENT.roadmap.filter((r) => r.horizon === 'NOW_90_DAYS');
  nowActs.forEach((act) => {
    d.roundedRect(40, y, 515, 54, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 54).fill(act.priority === 'CRITICAL' ? PALETTE.ROSE : PALETTE.AMBER);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(8).font('Helvetica-Bold').text(`${act.id} · ${act.dimensionName} [Priority: ${act.priority}]`, 50, y + 6);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(`Gap: ${act.gap}\nAction: ${act.action}\nOwner: ${act.owner} | Target: ${act.reviewDate}`, 50, y + 18, { width: 495, lineGap: 1.5 });
    y += 60;
  });

  // PAGE 3: HORIZON 2 & 3 (3–24 MONTHS)
  builder.doc.addPage();
  y = 46;
  y = builder.drawSectionTracker('HORIZON 2 & 3', 'Integration & Longitudinal Transformation', 'Medium and long-term systemic transformations across curriculum co-design and lifelong alumni intelligence.', y);

  const laterActs = ECRI_DEMO_ASSESSMENT.roadmap.filter((r) => r.horizon !== 'NOW_90_DAYS');
  laterActs.forEach((act) => {
    d.roundedRect(40, y, 515, 54, 3).fillAndStroke(PALETTE.LIGHT_BG, PALETTE.BORDER);
    d.rect(40, y, 3, 54).fill(PALETTE.TEAL);
    d.fillColor(PALETTE.NAVY_TEXT).fontSize(8).font('Helvetica-Bold').text(`${act.id} · ${act.horizonLabel} — ${act.dimensionName}`, 50, y + 6);
    d.fillColor(PALETTE.CHARCOAL).fontSize(7.5).font('Helvetica').text(`Action: ${act.action}\nOwner: ${act.owner} | Success Measure: ${act.successMeasure}`, 50, y + 18, { width: 495, lineGap: 1.5 });
    y += 60;
  });

  // PAGE 4: SAMPLE CLOSING PAGE
  builder.drawSampleClosingPage(ECRI_DEMO_ASSESSMENT.methodologyVersion);

  const outStream = fs.createWriteStream(outputPath);
  await builder.finalize(outStream);
}

// ============================================================================
// MAIN GENERATOR EXECUTION
// ============================================================================
export async function generateAllEcriReports(): Promise<void> {
  console.log('Generating all 5 canonical ECRI sample PDF reports for Metropolitan Apex University...');

  const reports = [
    { name: 'ECRI_Sample_Executive_Report.pdf', fn: generateEcriExecutiveReport },
    { name: 'ECRI_Sample_Detailed_132_Metric_Report.pdf', fn: generateEcriDetailed132MetricReport },
    { name: 'ECRI_Sample_Board_Scorecard.pdf', fn: generateEcriBoardScorecard },
    { name: 'ECRI_Sample_Evidence_Integrity_Dossier.pdf', fn: generateEcriEvidenceDossier },
    { name: 'ECRI_Sample_Transformation_Roadmap.pdf', fn: generateEcriTransformationRoadmap },
  ];

  for (const r of reports) {
    const samplePath = path.join(samplesDir, r.name);
    const uploadPath = path.join(uploadsDir, r.name);

    await r.fn(samplePath);
    fs.copyFileSync(samplePath, uploadPath);
    console.log(`Generated: ${r.name} (${fs.statSync(samplePath).size} bytes)`);
  }

  // Generate dynamic manifest
  const manifest = buildReportManifest(samplesDir, ECRI_DEMO_ASSESSMENT.institution.name);
  const manifestPath = path.join(samplesDir, 'report-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Generated report-manifest.json:', JSON.stringify(manifest, null, 2));
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('generateAllEcriReports.ts')) {
  generateAllEcriReports()
    .then(() => {
      console.log('All 5 ECRI sample PDF reports and manifest successfully generated.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to generate ECRI sample reports:', err);
      process.exit(1);
    });
}
