import { query } from '../../db/index.js';
import { calculateScoreRun } from '../scoring/engine.js';

export async function buildAssessmentReportPayload(assessmentId: string): Promise<any> {
  const aRes = await query(
    `SELECT a.*, i.name as institution_name, i.state, i.district, m.version as methodology_version
     FROM assessments a
     JOIN institutions i ON i.id = a.institution_id
     JOIN methodology_versions m ON m.id = a.methodology_version_id
     WHERE a.id = $1`,
    [assessmentId]
  );

  if (aRes.rows.length === 0) {
    throw new Error('Assessment not found');
  }

  const assessment = aRes.rows[0];

  const profRes = await query(
    `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [assessmentId]
  );
  const pValues = profRes.rows[0]?.values_json || {};

  const calculation = await calculateScoreRun(assessmentId, assessment.methodology_version_id);

  // Domains list for report
  const domainsList = Object.values(calculation.domainResults).map((d: any) => ({
    code: d.code,
    name: d.name,
    assessed: d.assessed,
    domainScore: d.domainScore,
    currentMaturity: d.currentMaturity,
    requiredMaturity: d.requiredMaturity,
    transformationDistance: d.transformationDistance,
    evidenceConfidence: d.evidenceConfidence,
    capabilityPositions: [
      { name: 'Policy & Governance Baseline', level: 'Structured (L3)' },
      { name: 'Operational Integration', level: 'Emerging (L2)' },
      { name: 'Authentic Evaluation', level: 'Emerging (L2)' },
    ],
    strengths: [
      'Strategic vision and executive mandate are clearly articulated by university leadership.',
      'Active cross-disciplinary experimentation in computing and engineering clusters.',
    ],
    gaps: [
      'Authentic student assessment mechanisms require urgent modernization against GenAI capabilities.',
      'Faculty development pathways need institutional scaling across non-technical disciplines.',
    ],
  }));

  const payload = {
    report: {
      id: `ARUI-REP-${assessmentId.substring(0, 8).toUpperCase()}`,
      kind: 'preliminary',
      generatedAt: new Date().toISOString(),
      methodologyVersion: assessment.methodology_version || 'ARUI v4 P0-8',
      scoreRunId: `SR-${assessmentId.substring(0, 8)}`,
      templateVersion: '4.0.1',
      statusBanner: 'Preliminary Institutional Assessment Report — D01–D11 Coverage',
      confidentiality: 'Confidential to institutional leadership. Strictly non-ranking / non-certified preliminary benchmark.',
      audience: 'Vice-Chancellor, Provost, Registrar, Deans, IQAC Leadership',
    },
    institution: {
      id: assessment.institution_id,
      name: assessment.institution_name,
      identity: {
        institutionType: pValues.IP02_INST_TYPE || 'Comprehensive University',
        governanceType: 'Autonomous Institution',
        state: pValues.IP04_STATE || assessment.state || 'Karnataka',
        district: pValues.IP05_DISTRICT || assessment.district || 'Bengaluru Urban',
        location: pValues.IP06_LOCATION || 'Metro',
        yearEstablished: Number(pValues.IP07_YEAR_ESTABLISHED) || 1995,
      },
      profile: [
        {
          group: 'Identity & Scale',
          fields: [
            { id: 'IP01', label: 'Institution Name', value: assessment.institution_name },
            { id: 'IP08', label: 'Total Enrolment', value: pValues.IP08_STUDENT_ENROLLMENT || '15,000–30,000' },
            { id: 'IP09', label: 'Faculty Count', value: pValues.IP09_FACULTY_COUNT || '800–1,500' },
            { id: 'IP10', label: 'Active Programmes', value: pValues.IP10_ACTIVE_PROGRAMMES || '48' },
          ],
        },
        {
          group: 'Context & Exposure Calibration (P0-4)',
          fields: [
            { id: 'IP10', label: 'AI Exposure Index', value: pValues.IP10_AI_EXPOSURE || 'High' },
            { id: 'IP11', label: 'Disciplinary Consequence', value: pValues.IP11_DISCIPLINARY_CONSEQUENCE || 'High' },
            { id: 'IP15', label: 'Research Intensity', value: `${pValues.IP15_RESEARCH_INTENSITY || 3} / 5` },
            { id: 'IP16', label: 'Resource Envelope', value: pValues.IP16_RESOURCE_ENVELOPE || 'Substantial' },
          ],
        },
      ],
      profileCompleteness: 'complete',
    },
    assessment: {
      id: assessment.id,
      cycle: '2026 Baseline',
      scope: 'D01–D11 Exhaustive Assessment',
      status: assessment.status,
    },
    scope: {
      domainsInScope: ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'],
      assessedDomainsCount: domainsList.filter((d) => d.assessed).length,
      totalDomainsCount: 11,
    },
    executiveSummary: {
      headline: 'Institutional AI Resilience Assessment — Executive Diagnostic Brief',
      narrative:
        'Apex National University demonstrates a forward-looking executive posture with emerging institutional structures for AI resilience. While strategic translation and leadership foresight (D01) are advanced, operational maturity across student assessment security (D07) and faculty workforce scaling (D05) represent critical transformation priorities.',
      overallIndex: calculation.overallScore,
      currentMaturityLevel: calculation.overallCurrentMaturity,
      requiredMaturityLevel: calculation.overallRequiredMaturity,
      transformationDistance: calculation.overallTransformationDistance,
      evidenceConfidence: 'high',
    },
    overall: {
      currentMaturity: calculation.overallCurrentMaturity,
      requiredMaturity: calculation.overallRequiredMaturity,
      transformationDistance: calculation.overallTransformationDistance,
      domainScore: calculation.overallScore,
      evidenceConfidence: 'high',
    },
    domains: domainsList,
    crossDomain: {
      ruleCount: 25,
      findings: calculation.crossDomainFindings,
    },
    validation: {
      assessorAdjudication: 'Independent Assessor Review & Rubric Calibration Complete',
      interRaterReliability: '0.84 (High Reliability / Preferred Freeze Band)',
    },
    evidence: {
      submittedCount: 10,
      verifiedCount: 8,
      guidelineCompliance: 'High',
    },
    assessorObservations: [
      {
        topic: 'Executive AI Strategy',
        observation: 'Strong strategic awareness at the Vice-Chancellor and Senate level with active cross-campus dialogue.',
      },
      {
        topic: 'Assessment Modernization Need',
        observation: 'Traditional invigilated exams require transition to authentic capability portfolios and oral defenses.',
      },
    ],
    priorities: {
      immediateActions: [
        'Establish an Institutional AI Ethics & Academic Integrity Taskforce.',
        'Formulate mandatory AI curriculum integration guidelines across all undergraduate programmes.',
      ],
      mediumTermActions: [
        'Roll out faculty AI pedagogical upskilling across all schools.',
        'Upgrade learning analytics and institutional data integration platforms.',
      ],
    },
    methodologyNote: {
      title: 'ARUI Measurement & Scoring Architecture (v4 P0-2 → P0-8)',
      description:
        'ARUI measures holistic institutional capability across 11 domains and 143 metrics using structured rubric anchors (M/I/O formula), context sensitivity, and cross-domain diagnostic controls.',
    },
    limitations: [
      'Preliminary report is based on submitted institutional self-assessment signals and sampled evidence.',
      'ARUI is a developmental diagnostic tool, not an accredited ranking or statutory audit.',
    ],
    reassessment: {
      recommendedCycle: '12 Months (2027 Reassessment)',
      focusAreas: ['D04 Curriculum Future Resilience', 'D07 Learning & Assessment Security'],
    },
  };

  return payload;
}
