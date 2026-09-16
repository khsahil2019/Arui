import { query } from '../../db/index.js';
import { calculateScoreRun } from '../scoring/engine.js';

export async function buildAssessmentReportPayload(assessmentId: string): Promise<any> {
  const aRes = await query(
    `SELECT a.*, i.name as institution_name, i.state as institution_state, i.district as institution_district, 
            m.version as methodology_version, m.product_code as mv_product_code, p.name as product_name, p.tagline as product_tagline
     FROM assessments a
     JOIN institutions i ON i.id = a.institution_id
     JOIN methodology_versions m ON m.id = a.methodology_version_id
     LEFT JOIN products p ON p.code = a.product_code
     WHERE a.id = $1`,
    [assessmentId]
  );

  if (aRes.rows.length === 0) {
    throw new Error('Assessment not found');
  }

  const assessment = aRes.rows[0];
  const isEcri = assessment.product_code === 'ecri' || assessment.mv_product_code === 'ecri';
  const productCode = isEcri ? 'ecri' : 'arui';
  const productName = isEcri ? 'Employability & Career Readiness Index (ECRI)' : 'AI-Resilient University Index (ARUI)';
  const productAcronym = isEcri ? 'ECRI' : 'ARUI';

  // 1. Fetch Dynamic Brand Configuration (Admin Controlled)
  const brandRes = await query(
    `SELECT * FROM brand_configs 
     WHERE product_code = $1 AND (institution_id = $2 OR institution_id IS NULL)
     ORDER BY institution_id DESC NULLS LAST LIMIT 1`,
    [productCode, assessment.institution_id]
  );
  const brandConfig = brandRes.rows[0] || {
    logo_url: null,
    header_text: isEcri ? 'ECRI — Employability & Career Readiness Index' : 'ARUI — AI-Resilient University Index',
    footer_text: isEcri ? 'Confidential & Proprietary © ECRI Global Higher Education Benchmark' : 'Confidential & Proprietary © ARUI Global Higher Education Advisory',
    contact_email: isEcri ? 'evaluations@ecri.org' : 'evaluations@arui.org',
    contact_phone: '+1 (800) 555-ARUI',
  };

  // 2. Fetch 25-Field Institutional Profile
  const profRes = await query(
    `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [assessmentId]
  );
  const pValues = profRes.rows[0]?.values_json || {};

  // 3. Calculate Server-Side Scoring & Diagnostics
  const calculation = await calculateScoreRun(assessmentId, assessment.methodology_version_id);

  // 4. Fetch Metrics, Capabilities & Evidence Links for Metric Traceability pinned to methodology version
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

  // Build Full Canonical Metric Traceability Appendix
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

  // 5. Construct Structured Priorities & Transformation Roadmap
  const observedFindings: string[] = [];
  const diagnostics: string[] = [];
  const genericRecommendations: string[] = isEcri ? [
    'Institutionalize senior corporate advisory councils across every major academic faculty.',
    'Mandate 12-week credit-bearing internships with formal industry supervisor performance rubrics.',
    'Align degree curricula with forward-looking industry skill forecasts on an annual Board of Studies cadence.'
  ] : [
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

  for (const c of calculation.contradictions) {
    diagnostics.push(`Cross-domain signal (${c.title || c.ruleId}): ${c.message || c.body}`);
  }

  // 6. Build Detailed Gap Analysis Matrix
  const gapAnalysis = domainsList.map((d) => {
    const gap = d.transformationDistance || 0;
    let priority = 'Low';
    if (gap >= 2) priority = 'Critical';
    else if (gap === 1) priority = 'High';
    else if (gap === 0) priority = 'Satisfied';

    return {
      domainCode: d.code,
      domainName: d.name,
      observedMaturity: d.currentMaturity ?? 0,
      requiredMaturity: d.requiredMaturity ?? 3,
      gap,
      priority,
      recommendedAction: gap > 0 
        ? `Accelerate ${d.name} through dedicated resourcing, faculty development, and verifiable evidence.`
        : 'Maintain capability benchmarks and annual calibration reviews.'
    };
  });

  // 7. Build Sequenced 3-Horizon Transformation Roadmap
  const transformationRoadmap = [
    {
      horizon: 'Horizon 1 (0–6 Months)',
      title: 'Foundation, Governance & Compliance Mandates',
      interventions: [
        `Formally establish ${productAcronym} Executive Oversight Council under Governing Board.`,
        'Publish institutional guidelines and baseline quality audit rubrics across all academic faculties.',
        'Address immediate high-vulnerability capability bottlenecks in ' + (underperformingDomains[0]?.name || 'core areas')
      ]
    },
    {
      horizon: 'Horizon 2 (6–18 Months)',
      title: 'Operational Depth & Systematic Implementation',
      interventions: [
        'Roll out mandatory faculty upskilling and industry immersion programs.',
        'Integrate authentic project-based and capstone evaluations into undergraduate degree requirements.',
        'Establish automated outcome tracking and longitudinal graduate intelligence systems.'
      ]
    },
    {
      horizon: 'Horizon 3 (18–36 Months)',
      title: 'Institutional Integration & Sector Leadership Benchmark',
      interventions: [
        'Achieve cross-domain integration with continuous labor market calibration.',
        'Expand global corporate co-design partnerships and specialized research incubation hubs.',
        'Benchmark institutional performance against national and international sector leaders.'
      ]
    }
  ];

  // 8. Evaluate Badges from Generic Badge Engine
  const badgeRes = await query(`SELECT * FROM badge_definitions WHERE product_code = $1 AND is_active = true`, [productCode]);
  const earnedBadges: any[] = [];
  const overallScoreVal = calculation.overallScore || 0;

  for (const b of badgeRes.rows) {
    const crit = b.criteria_json || {};
    let earned = false;
    if (crit.minOverallScore && overallScoreVal >= crit.minOverallScore) {
      earned = true;
    } else if (crit.requiredDimensions && Array.isArray(crit.requiredDimensions)) {
      const matchScores = domainsList.filter(d => crit.requiredDimensions.includes(d.code) && (d.domainScore || 0) >= (crit.minAverageScore || 70));
      if (matchScores.length === crit.requiredDimensions.length) earned = true;
    }
    if (earned) {
      earnedBadges.push({
        code: b.code,
        name: b.name,
        meaning: b.meaning,
        difficulty: b.difficulty,
        icon: b.icon,
        validityMonths: b.validity_months,
        awardedDate: new Date().toISOString()
      });
    }
  }

  // 9. Build Canonical 25-Field Profile Object
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

  // Derive evidence confidence
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

  // 10. Public Profile Slice
  const publicProfile = {
    institutionName: assessment.institution_name,
    productCode,
    productName,
    assessmentYear: 2026,
    overallScore: calculation.overallScore,
    maturityTier: calculation.overallCurrentMaturity === 5 ? 'Sector-Leading' : (calculation.overallCurrentMaturity === 4 ? 'Integrated' : 'Structured'),
    evaluatedDimensionsCount: assessedCount,
    totalDimensionsCount: 11,
    dimensionHighlights: domainsList.filter(d => (d.domainScore || 0) >= 75).map(d => ({ code: d.code, name: d.name, score: d.domainScore })),
    badges: earnedBadges,
    verificationStatus: computedConfidence === 'corroborated' ? 'Assessor Verified' : 'Preliminary Self-Assessment',
    publishedDate: new Date().toISOString()
  };

  const payload = {
    branding: brandConfig,
    report: {
      id: `${productAcronym}-REP-${assessmentId.substring(0, 8).toUpperCase()}`,
      productCode,
      productName,
      kind: isPartial ? 'preliminary' : 'final',
      isPartial,
      assessedDomainsCount: assessedCount,
      totalDomainsCount: 11,
      generatedAt: new Date().toISOString(),
      methodologyVersion: assessment.methodology_version || (isEcri ? 'ECRI v6.0' : 'ARUI v4.0'),
      scoreRunId: `SR-${assessmentId.substring(0, 8)}`,
      templateVersion: '4.2.0',
      statusBanner: isPartial
        ? `Preliminary Assessment Report (${assessedCount} of 11 Dimensions Evaluated)`
        : `Final Institutional ${productAcronym} Assessment Report (11-Dimension Comprehensive)`,
      confidentiality: `Confidential to institutional leadership. Strictly developmental diagnostic benchmark. Non-ranking / uncertified.`,
      audience: 'Vice-Chancellor, Provost, Registrar, Deans, IQAC Leadership, Academic Council, Corporate Advisory Board',
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
      productCode,
      cycle: '2026 Baseline',
      scope: isPartial ? `Partial Scope (${assessedCount} Dimensions)` : 'Comprehensive 11-Dimension Scope',
      status: assessment.status,
    },
    executiveSummary: {
      headline: isPartial
        ? `Institutional ${productAcronym} Assessment — Preliminary Diagnostic Brief (${assessedCount}/11 Dimensions)`
        : `Institutional ${productAcronym} Assessment — Executive Diagnostic Report`,
      narrative: isPartial
        ? `This preliminary assessment evaluates ${assessedCount} of the 11 ${productAcronym} dimensions for ${assessment.institution_name}. An institution-wide overall score is withheld until full 11-dimension assessment coverage is achieved. Individual assessed dimensions provide baseline operational guidance.`
        : `${assessment.institution_name} has completed evaluation across all 11 core institutional dimensions. The evaluation combines institutional profile parameters, adaptive diagnostic probes, verifiable evidence review, and independent rubric calibration.`,
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
      ruleCount: calculation.crossDomainFindings.length,
      findings: calculation.crossDomainFindings,
    },
    evidence: {
      submittedCount,
      verifiedCount,
      guidelineCompliance: verifiedCount >= 6 ? 'High' : (submittedCount >= 3 ? 'Moderate' : 'Emerging'),
    },
    strengths: calculation.strengths,
    vulnerabilities: calculation.vulnerabilities,
    gapAnalysis,
    transformationRoadmap,
    badges: earnedBadges,
    publicProfile,
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
      title: `${productAcronym} Measurement & Scoring Architecture`,
      description:
        `${productName} measures holistic institutional capability across 11 dimensions and canonical metrics using structured rubric anchors (M/I/O formula), context sensitivity, and cross-domain diagnostic controls.`,
    },
    limitations: [
      `Preliminary diagnostic assessment based on verified institutional evidence and self-assessment submissions.`,
      `${productAcronym} is a developmental capability and resilience benchmark, not an accredited statutory ranking.`,
    ],
    reassessment: {
      recommendedCycle: '12 Months (2027 Reassessment)',
      focusAreas: underperformingDomains.slice(0, 3).map((d) => `${d.code} ${d.name}`),
    },
  };

  return payload;
}

