import { query } from '../../db/index.js';
import { calculateScoreRun } from '../scoring/engine.js';

export async function buildAssessmentReportPayload(assessmentId: string): Promise<any> {
  const aRes = await query(
    `SELECT a.*, i.name as institution_name, i.state as institution_state, i.district as institution_district, m.version as methodology_version
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

  // 1. Fetch 25-Field Institutional Profile
  const profRes = await query(
    `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [assessmentId]
  );
  const pValues = profRes.rows[0]?.values_json || {};

  // 2. Calculate Server-Side Scoring & Diagnostics
  const calculation = await calculateScoreRun(assessmentId, assessment.methodology_version_id);

  // 3. Fetch Metrics, Capabilities & Evidence Links for 143-Metric Traceability pinned to methodology version
  const metricsRes = await query(
    `SELECT m.*, d.name as domain_name, c.name as capability_name
     FROM metrics m
     JOIN domains d ON d.code = m.domain_code AND (d.methodology_version_id = $1 OR d.methodology_version_id IS NULL)
     LEFT JOIN capabilities c ON c.full_code = CONCAT(m.domain_code, '-', m.code) AND (c.methodology_version_id = $1 OR c.methodology_version_id IS NULL)
     WHERE m.methodology_version_id = $1 OR m.methodology_version_id IS NULL
     ORDER BY m.domain_code, m.sort_order ASC`,
    [assessment.methodology_version_id]
  );

  const evidenceRes = await query(`SELECT * FROM evidence_items WHERE assessment_id = $1`, [assessmentId]);
  const evidenceItems = evidenceRes.rows;

  const evLinksRes = await query(
    `SELECT el.metric_full_code, e.title, e.file_name, e.evidence_level, e.status
     FROM evidence_metric_links el
     JOIN evidence_items e ON e.id = el.evidence_id
     WHERE e.assessment_id = $1`,
    [assessmentId]
  );
  const metricEvidenceMap: Record<string, any[]> = {};
  for (const el of evLinksRes.rows) {
    if (!metricEvidenceMap[el.metric_full_code]) metricEvidenceMap[el.metric_full_code] = [];
    metricEvidenceMap[el.metric_full_code].push(el);
  }

  // Build Full 143-Metric Traceability Appendix
  const metricAuditAppendix = metricsRes.rows.map((m: any) => {
    const calc = calculation.metricResults[m.full_code];
    const evLinks = metricEvidenceMap[m.full_code] || [];
    const evSummary = evLinks.length > 0 ? evLinks.map((e) => `${e.file_name} (${e.evidence_level || 'E2'})`).join(', ') : 'None submitted';

    let assessorStatus = 'Unscored';
    if (calc?.isNa) assessorStatus = 'N/A Accepted';
    else if (calc?.score !== null && calc?.score !== undefined) assessorStatus = 'Scored & Verified';

    return {
      domainCode: m.domain_code,
      domainName: m.domain_name,
      capabilityCode: m.code,
      capabilityName: m.capability_name || `Capability ${m.code}`,
      metricCode: m.full_code,
      metricName: m.name,
      applicable: !calc?.isNa,
      maturity: calc?.maturity ?? '—',
      implementation: calc?.implementation ?? '—',
      outcomes: calc?.outcomes ?? '—',
      score: calc?.score !== null && calc?.score !== undefined ? `${calc.score}%` : 'Pending',
      status: calc?.isNa ? 'N/A' : calc?.score !== null ? 'Assessed' : 'Not Assessed',
      evidenceReference: evSummary,
      assessorStatus,
    };
  });

  // Build 11-Domain Breakdown
  const domainsList = Object.values(calculation.domainResults).map((d: any) => {
    const domainMetrics = metricAuditAppendix.filter((m) => m.domainCode === d.code);
    const assessedDomainMetrics = domainMetrics.filter((m) => m.status === 'Assessed');

    // Dynamic strengths & vulnerabilities for this specific domain
    const domainStrengths: string[] = [];
    const domainGaps: string[] = [];

    if (d.assessed && d.domainScore !== null) {
      if (d.domainScore >= 60) {
        domainStrengths.push(`Domain demonstrates established capability (Score: ${d.domainScore}%, Level ${d.currentMaturity}).`);
      } else {
        domainGaps.push(`Domain capability requires acceleration (Score: ${d.domainScore}%, Level ${d.currentMaturity} vs Required Level ${d.requiredMaturity}).`);
      }
    } else {
      domainGaps.push('Domain assessment pending full evidence submission and evaluation.');
    }

    return {
      code: d.code,
      name: d.name,
      assessed: d.assessed,
      domainScore: d.domainScore,
      currentMaturity: d.currentMaturity,
      requiredMaturity: d.requiredMaturity,
      transformationDistance: d.transformationDistance,
      evidenceConfidence: d.evidenceConfidence,
      assessedMetricsCount: assessedDomainMetrics.length,
      totalMetricsCount: domainMetrics.length,
      strengths: domainStrengths,
      gaps: domainGaps,
    };
  });

  const assessedCount = calculation.assessedDomainsCount;
  const isPartial = calculation.isPartial;

  // 4. Construct Structured Priorities & Transformation Roadmap with clear separation of findings vs recommendations
  const observedFindings: string[] = [];
  const diagnostics: string[] = [];
  const genericRecommendations: string[] = [
    'Establish an institutional AI observatory to monitor evolving technology and regulatory standards.',
    'Integrate multi-source authentic capability verification across core graduating cohorts.',
    'Maintain versioned audit trails and documentation for high-stakes institutional AI deployments.',
  ];
  const institutionSpecificRecommendations: string[] = [];

  const underperformingDomains = domainsList.filter((d) => d.assessed && d.transformationDistance !== null && d.transformationDistance > 0);
  underperformingDomains.sort((a, b) => (b.transformationDistance || 0) - (a.transformationDistance || 0));

  if (underperformingDomains.length > 0) {
    const highestLag = underperformingDomains[0];
    observedFindings.push(
      `Observed capability lag in ${highestLag.name} (${highestLag.code}) where evaluated maturity (Level ${highestLag.currentMaturity}) lags context-calibrated target (Level ${highestLag.requiredMaturity}) by +${highestLag.transformationDistance} levels.`
    );
    institutionSpecificRecommendations.push(
      `Prioritize transformation roadmap in ${highestLag.name} (${highestLag.code}) to close the +${highestLag.transformationDistance}-level maturity gap.`
    );

    if (underperformingDomains.length > 1) {
      const secondLag = underperformingDomains[1];
      observedFindings.push(
        `Secondary transformation requirement identified in ${secondLag.name} (${secondLag.code}) with a target maturity gap of +${secondLag.transformationDistance} levels.`
      );
      institutionSpecificRecommendations.push(
        `Implement operational capability milestones and faculty enablement for ${secondLag.name} (${secondLag.code}).`
      );
    }
  } else if (assessedCount > 0) {
    observedFindings.push('Evaluated domains currently satisfy baseline context-calibrated maturity targets.');
  }

  // Cross-domain diagnostics
  for (const c of calculation.contradictions) {
    diagnostics.push(`Cross-domain signal (${c.title}): ${c.body}`);
  }

  // 5. Build Canonical 25-Field Profile Object (Strict 1:1 Mapping to Registry IP01–IP25)
  const fullProfileGroups = [
    {
      group: 'Institutional Identity & Demographics',
      fields: [
        { id: 'IP01', label: 'Institution name', value: pValues.IP01 || pValues.IP01_INST_NAME || assessment.institution_name || 'Not provided' },
        { id: 'IP02', label: 'Institution type', value: pValues.IP02 || pValues.IP02_INST_TYPE || 'Not provided' },
        { id: 'IP03', label: 'Governance type', value: pValues.IP03 || pValues.IP03_GOVERNANCE_TYPE || 'Not provided' },
        { id: 'IP04', label: 'State', value: pValues.IP04 || pValues.IP04_STATE || assessment.institution_state || 'Not provided' },
        { id: 'IP05', label: 'District', value: pValues.IP05 || pValues.IP05_DISTRICT || assessment.institution_district || 'Not provided' },
        { id: 'IP06', label: 'Location', value: pValues.IP06 || pValues.IP06_LOCATION || 'Not provided' },
        { id: 'IP07', label: 'Year established', value: pValues.IP07 || pValues.IP07_YEAR_ESTABLISHED || 'Not provided' },
      ],
    },
    {
      group: 'Academic Scale & Programmes',
      fields: [
        { id: 'IP08', label: 'Students', value: pValues.IP08 || pValues.IP08_STUDENT_ENROLLMENT || 'Not provided' },
        { id: 'IP09', label: 'Faculty', value: pValues.IP09 || pValues.IP09_FACULTY_COUNT || 'Not provided' },
        { id: 'IP10', label: 'Active programmes', value: pValues.IP10 || pValues.IP10_ACTIVE_PROGRAMMES || 'Not provided' },
        { id: 'IP11', label: 'UG programmes', value: pValues.IP11 || pValues.IP11_UG_PROGRAMMES || 'Not provided' },
        { id: 'IP12', label: 'PG programmes', value: pValues.IP12 || pValues.IP12_PG_PROGRAMMES || 'Not provided' },
        { id: 'IP13', label: 'Doctoral programmes', value: pValues.IP13 || pValues.IP13_DOCTORAL_PROGRAMMES || 'Not provided' },
        { id: 'IP14', label: 'Major disciplines', value: Array.isArray(pValues.IP14 || pValues.IP14_MAJOR_DISCIPLINES) ? (pValues.IP14 || pValues.IP14_MAJOR_DISCIPLINES).join(', ') : (pValues.IP14 || pValues.IP14_MAJOR_DISCIPLINES || 'Not provided') },
      ],
    },
    {
      group: 'Context Calibration & Financial Bands',
      fields: [
        { id: 'IP15', label: 'Research intensity', value: pValues.IP15 || (pValues.IP15_RESEARCH_INTENSITY ? `${pValues.IP15_RESEARCH_INTENSITY} / 5` : 'Not provided') },
        { id: 'IP16', label: 'Annual expenditure band', value: pValues.IP16 || pValues.IP16_RESOURCE_ENVELOPE || 'Not provided' },
        { id: 'IP17', label: 'Technology/IT expenditure band', value: pValues.IP17 || 'Not provided' },
        { id: 'IP18', label: 'Research funding band', value: pValues.IP18 || 'Not provided' },
      ],
    },
    {
      group: 'Ecosystem, Catchment & Mandate',
      fields: [
        { id: 'IP19', label: 'Industry engagement', value: pValues.IP19 || 'Not provided' },
        { id: 'IP20', label: 'Innovation/incubation ecosystem', value: pValues.IP20 || 'Not provided' },
        { id: 'IP21', label: 'Student catchment', value: Array.isArray(pValues.IP21) ? pValues.IP21.join(', ') : (pValues.IP21 || 'Not provided') },
        { id: 'IP22', label: 'Student mobility pattern', value: Array.isArray(pValues.IP22) ? pValues.IP22.join(', ') : (pValues.IP22 || 'Not provided') },
        { id: 'IP23', label: 'Institutional mandate', value: Array.isArray(pValues.IP23 || pValues.IP03_MANDATE) ? (pValues.IP23 || pValues.IP03_MANDATE).join(', ') : (pValues.IP23 || pValues.IP03_MANDATE || 'Not provided') },
        { id: 'IP24', label: 'Residential model', value: pValues.IP24 || 'Not provided' },
        { id: 'IP25', label: 'International exposure', value: pValues.IP25 || 'Not provided' },
      ],
    },
  ];

  // Derive evidence confidence strictly from evidence items and review records
  const verifiedCount = evidenceItems.filter((e) => e.status === 'REVIEWED' || e.status === 'CORROBORATED').length;
  const submittedCount = evidenceItems.length;
  const e2PlusCount = evidenceItems.filter((e) => ['E2', 'E3', 'E4'].includes(e.evidence_level)).length;

  let computedConfidence: 'unverified' | 'preliminary' | 'corroborated' = 'unverified';
  if (e2PlusCount >= 4 || verifiedCount >= 6) {
    computedConfidence = 'corroborated';
  } else if (submittedCount >= 2 || verifiedCount >= 1) {
    computedConfidence = 'preliminary';
  } else {
    computedConfidence = 'unverified';
  }

  const payload = {
    report: {
      id: `ARUI-REP-${assessmentId.substring(0, 8).toUpperCase()}`,
      kind: isPartial ? 'preliminary' : 'final',
      isPartial,
      assessedDomainsCount: assessedCount,
      totalDomainsCount: 11,
      generatedAt: new Date().toISOString(),
      methodologyVersion: assessment.methodology_version || 'ARUI v4.0 P0-8',
      scoreRunId: `SR-${assessmentId.substring(0, 8)}`,
      templateVersion: '4.2.0',
      statusBanner: isPartial
        ? `Preliminary Assessment Report (${assessedCount} of 11 Domains Evaluated)`
        : 'Final Institutional AI Resilience Assessment Report (11-Domain Comprehensive)',
      confidentiality: 'Confidential to institutional leadership. Strictly developmental diagnostic benchmark. Non-ranking / uncertified.',
      audience: 'Vice-Chancellor, Provost, Registrar, Deans, IQAC Leadership, Academic Council',
    },
    institution: {
      id: assessment.institution_id,
      name: assessment.institution_name,
      state: pValues.IP04 || pValues.IP04_STATE || assessment.institution_state || 'Not provided',
      district: pValues.IP05 || pValues.IP05_DISTRICT || assessment.institution_district || 'Not provided',
      profile: fullProfileGroups,
      profileCompleteness: pValues && Object.keys(pValues).length >= 10 ? 'complete' : 'partial',
    },
    assessment: {
      id: assessment.id,
      cycle: '2026 Baseline',
      scope: isPartial ? `Partial Scope (${assessedCount} Domains)` : 'Comprehensive 11-Domain Scope',
      status: assessment.status,
    },
    executiveSummary: {
      headline: isPartial
        ? `Institutional AI Resilience Assessment — Preliminary Diagnostic Brief (${assessedCount}/11 Domains)`
        : 'Institutional AI Resilience Assessment — Executive Diagnostic Report',
      narrative: isPartial
        ? `This preliminary assessment evaluates ${assessedCount} of the 11 ARUI domains for ${assessment.institution_name}. An institution-wide overall ARUI score is withheld until full 11-domain assessment coverage is achieved. Individual assessed domains provide baseline operational guidance.`
        : `${assessment.institution_name} has completed evaluation across all 11 core institutional resilience domains. The evaluation combines institutional profile parameters, adaptive diagnostic probes, verifiable evidence review, and independent rubric calibration.`,
      overallIndex: calculation.overallScore,
      isPartial,
      currentMaturityLevel: calculation.overallCurrentMaturity,
      requiredMaturityLevel: calculation.overallRequiredMaturity,
      transformationDistance: calculation.overallTransformationDistance,
      evidenceConfidence: computedConfidence,
    },
    overall: {
      currentMaturity: calculation.overallCurrentMaturity,
      requiredMaturity: calculation.overallRequiredMaturity,
      transformationDistance: calculation.overallTransformationDistance,
      domainScore: calculation.overallScore,
      isPartial,
      evidenceConfidence: computedConfidence,
    },
    domains: domainsList,
    crossDomain: {
      ruleCount: 25,
      findings: calculation.crossDomainFindings,
    },
    evidence: {
      submittedCount,
      verifiedCount,
      guidelineCompliance: verifiedCount >= 6 ? 'High' : (submittedCount >= 3 ? 'Moderate' : 'Emerging'),
    },
    strengths: calculation.strengths,
    vulnerabilities: calculation.vulnerabilities,
    priorities: {
      observedFindings,
      diagnostics,
      genericRecommendations,
      institutionSpecificRecommendations,
      immediateActions: institutionSpecificRecommendations.length > 0 ? institutionSpecificRecommendations : ['Maintain ongoing evidence verification and audit trails for high-stakes capability areas.'],
      mediumTermActions: diagnostics.length > 0 ? diagnostics : ['Resolve emergent cross-domain dependencies during next assessment cycle.'],
      strategicActions: genericRecommendations,
    },
    metricAuditAppendix,
    methodologyNote: {
      title: 'ARUI Measurement & Scoring Architecture (v4 P0-2 → P0-8)',
      description:
        'ARUI measures holistic institutional capability across 11 domains, 143 capabilities, and 143 metrics using structured rubric anchors (M/I/O formula), context sensitivity, and cross-domain diagnostic controls.',
    },
    limitations: [
      'Preliminary diagnostic assessment based on verified institutional evidence and self-assessment submissions.',
      'ARUI is a developmental capability and resilience framework, not an accredited ranking or statutory accreditation.',
    ],
    reassessment: {
      recommendedCycle: '12 Months (2027 Reassessment)',
      focusAreas: underperformingDomains.slice(0, 3).map((d) => `${d.code} ${d.name}`),
    },
  };

  return payload;
}

