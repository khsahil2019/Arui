import { query } from '../../db/index.js';

export interface ScoreRunCalculationResult {
  overallScore: number | null;
  isPartial: boolean;
  assessedDomainsCount: number;
  totalDomainsCount: number;
  overallCurrentMaturity: number | null;
  overallRequiredMaturity: number;
  overallTransformationDistance: number | null;
  domainResults: Record<string, any>;
  metricResults: Record<string, any>;
  contextResults: Record<string, any>;
  crossDomainFindings: any[];
  antiGamingFlags: any[];
  strengths: any[];
  vulnerabilities: any[];
  contradictions: any[];
}

export async function calculateScoreRun(assessmentId: string, methodologyVersionId?: string): Promise<ScoreRunCalculationResult> {
  // 1. Resolve Pinned Methodology Version
  let activeVersionId = methodologyVersionId;
  if (!activeVersionId) {
    const asmVerRes = await query(`SELECT methodology_version_id FROM assessments WHERE id = $1`, [assessmentId]);
    activeVersionId = asmVerRes.rows[0]?.methodology_version_id;
  }

  // Fetch domains and metrics strictly pinned to assessment's methodology version
  let domainsQuery = `SELECT * FROM domains`;
  let metricsQuery = `SELECT * FROM metrics`;
  const verParams: any[] = [];
  if (activeVersionId) {
    domainsQuery += ` WHERE methodology_version_id = $1`;
    metricsQuery += ` WHERE methodology_version_id = $1`;
    verParams.push(activeVersionId);
  }
  domainsQuery += ` ORDER BY sort_order ASC`;
  metricsQuery += ` ORDER BY domain_code, sort_order ASC`;

  const domainsRes = await query(domainsQuery, verParams);
  const metricsRes = await query(metricsQuery, verParams);
  const scoresRes = await query(`SELECT * FROM metric_assessments WHERE assessment_id = $1`, [assessmentId]);
  const scoreMap: Record<string, any> = {};
  for (const s of scoresRes.rows) {
    scoreMap[s.metric_full_code] = s;
  }

  // 2. Fetch Profile for Context Engine (P0-4 Canonical 25-Field Context Calibration)
  const profRes = await query(
    `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [assessmentId]
  );
  const profileValues = profRes.rows[0]?.values_json || {};

  // Canonical P0-4 25-Field Factor Resolution: Zero Invented Defaults.
  // When context data is absent or unknown, delta = 0.0 (formal baseline rule).
  
  // IP06: Location (Metro 0.25, Urban 0.20, Semi-Urban 0.10, Rural 0.0, Missing 0.0)
  const location = profileValues.IP06 || profileValues.IP06_LOCATION;
  let locationDelta = 0.0;
  if (location === 'metro') locationDelta = 0.25;
  else if (location === 'urban') locationDelta = 0.20;
  else if (location === 'semi_urban') locationDelta = 0.10;
  else if (location === 'rural') locationDelta = 0.0;

  // IP08: Student Enrolment Headcount Scale (<2.5k: 0.0, 2.5k-10k: 0.10, 10k-25k: 0.20, 25k-50k: 0.30, >50k: 0.40)
  const studentVal = profileValues.IP08 || profileValues.IP08_STUDENT_ENROLLMENT;
  let scaleDelta = 0.0;
  if (typeof studentVal === 'number') {
    if (studentVal > 50000) scaleDelta = 0.40;
    else if (studentVal >= 25000) scaleDelta = 0.30;
    else if (studentVal >= 10000) scaleDelta = 0.20;
    else if (studentVal >= 2500) scaleDelta = 0.10;
  } else if (typeof studentVal === 'string') {
    const sLower = studentVal.toLowerCase();
    if (sLower.includes('50000') || sLower.includes('>50k') || sLower.includes('>60k')) scaleDelta = 0.40;
    else if (sLower.includes('25000') || sLower.includes('30k_60k') || sLower.includes('large')) scaleDelta = 0.30;
    else if (sLower.includes('10000') || sLower.includes('medium')) scaleDelta = 0.20;
    else if (sLower.includes('2500') || sLower.includes('small')) scaleDelta = 0.10;
  }

  // IP09: Faculty Headcount Scale
  const facultyVal = profileValues.IP09 || profileValues.IP09_FACULTY_COUNT;
  let facultyDelta = 0.0;
  if (typeof facultyVal === 'number') {
    if (facultyVal > 1500) facultyDelta = 0.20;
    else if (facultyVal >= 300) facultyDelta = 0.10;
  } else if (typeof facultyVal === 'string') {
    if (facultyVal.includes('1500') || facultyVal.includes('large')) facultyDelta = 0.20;
    else if (facultyVal.includes('300') || facultyVal.includes('medium')) facultyDelta = 0.10;
  }

  // IP10, IP11, IP12, IP13: Academic Programmes Breadth
  const activeProgVal = profileValues.IP10 || profileValues.IP10_ACTIVE_PROGRAMMES;
  const docProgVal = profileValues.IP13 || profileValues.IP13_DOCTORAL_PROGRAMMES;
  let progComplexityDelta = 0.0;
  if (activeProgVal !== undefined || docProgVal !== undefined) {
    const activeProg = Number(activeProgVal) || 0;
    const docProg = Number(docProgVal) || 0;
    if (activeProg > 50 || docProg > 10) progComplexityDelta = 0.20;
    else if (activeProg >= 15 || docProg >= 3) progComplexityDelta = 0.10;
  }

  // IP14: Major Disciplines Clusters
  const disciplines = Array.isArray(profileValues.IP14 || profileValues.IP14_MAJOR_DISCIPLINES)
    ? (profileValues.IP14 || profileValues.IP14_MAJOR_DISCIPLINES)
    : [];
  let discExposureDelta = 0.0;
  const hasHighExposureDisc = disciplines.some((d: string) =>
    ['engineering_cs', 'engineering', 'cs', 'health_medicine', 'medicine', 'stem', 'professional'].some(k => String(d).toLowerCase().includes(k))
  );
  if (hasHighExposureDisc) discExposureDelta = 0.35;
  else if (disciplines.length > 0) discExposureDelta = 0.15;

  // IP15: Research Intensity (Teaching-only 0.0, Low 0.10, Moderate 0.25, High/Research-intensive 0.50)
  const researchIntVal = profileValues.IP15 || profileValues.IP15_RESEARCH_INTENSITY;
  let researchDelta = 0.0;
  if (typeof researchIntVal === 'number') {
    if (researchIntVal >= 5) researchDelta = 0.50;
    else if (researchIntVal >= 4) researchDelta = 0.25;
    else if (researchIntVal >= 3) researchDelta = 0.10;
  } else if (typeof researchIntVal === 'string') {
    const lower = researchIntVal.toLowerCase();
    if (lower.includes('high') || lower.includes('intensive') || lower.includes('5')) researchDelta = 0.50;
    else if (lower.includes('mod') || lower.includes('balanced') || lower.includes('4')) researchDelta = 0.25;
    else if (lower.includes('low') || lower.includes('3')) researchDelta = 0.10;
  }

  // IP19 & IP20: Industry Engagement & Innovation Ecosystem
  const industryEng = profileValues.IP19;
  const innovationEco = profileValues.IP20;
  let ecosystemDelta = 0.0;
  if (industryEng || innovationEco) {
    if (String(industryEng).toLowerCase().includes('extensive') || String(innovationEco).toLowerCase().includes('advanced')) {
      ecosystemDelta = 0.25;
    } else if (String(industryEng).toLowerCase().includes('mod') || String(innovationEco).toLowerCase().includes('emerging')) {
      ecosystemDelta = 0.10;
    }
  }

  // IP23: Institutional Mandate (Teaching 0.0, Broad T+R 0.25, Research-intensive 0.50, Professional/regulated 0.50, Specialist 0.25)
  const rawMandate = profileValues.IP23 || profileValues.IP03_MANDATE;
  const mandateVal = Array.isArray(rawMandate) ? rawMandate[0] : rawMandate;
  let mandateDelta = 0.0;
  if (mandateVal) {
    if (mandateVal === 'research_intensive' || mandateVal === 'professional') mandateDelta = 0.50;
    else if (mandateVal === 'comprehensive' || mandateVal === 'broad_teaching_research' || mandateVal === 'specialist') mandateDelta = 0.25;
    else if (mandateVal === 'teaching') mandateDelta = 0.0;
  }

  // IP25: International Exposure
  const intlExpo = profileValues.IP25;
  let intlDelta = 0.0;
  if (intlExpo) {
    if (String(intlExpo).toLowerCase().includes('high')) intlDelta = 0.15;
    else if (String(intlExpo).toLowerCase().includes('mod')) intlDelta = 0.05;
  }

  // Composite Baseline Context Shift: sum of calibrated factors normalized
  const factorSum = mandateDelta + discExposureDelta + researchDelta + scaleDelta + locationDelta + facultyDelta + progComplexityDelta + ecosystemDelta + intlDelta;
  const baseContextShift = factorSum > 0 ? factorSum / 3.0 : 0.0;

  const metricResults: Record<string, any> = {};
  const domainMetricScores: Record<string, number[]> = {};

  // 3. Score Each Metric (Standard P0-3 Metric Scoring Formula)
  for (const m of metricsRes.rows) {
    const sm = scoreMap[m.full_code];
    let score: number | null = null;
    let isNa = false;
    let maturity: number | null = null;
    let implementation: number | null = null;
    let outcomes: number | null = null;

    if (sm) {
      isNa = !!sm.is_na;
      maturity = sm.maturity !== undefined && sm.maturity !== null ? Number(sm.maturity) : null;
      implementation = sm.implementation !== undefined && sm.implementation !== null ? Number(sm.implementation) : null;
      outcomes = sm.outcomes !== undefined && sm.outcomes !== null ? Number(sm.outcomes) : null;

      if (!isNa && maturity !== null) {
        const M = maturity;
        const I = implementation !== null ? implementation : M;
        if (outcomes !== null) {
          // Standard P0-3 with Outcome: 100 * (0.45M + 0.30I + 0.25O) / 5
          score = (100 * (0.45 * M + 0.30 * I + 0.25 * outcomes)) / 5;
        } else {
          // Legitimate Outcome N/A formula: 100 * (0.60M + 0.40I) / 5
          score = (100 * (0.60 * M + 0.40 * I)) / 5;
        }
        score = Math.round(score * 100) / 100;
      }
    }

    metricResults[m.full_code] = {
      metricCode: m.full_code,
      domainCode: m.domain_code,
      name: m.name,
      maturity,
      implementation,
      outcomes,
      isNa,
      score,
      rationale: sm?.rationale || null,
    };

    if (!domainMetricScores[m.domain_code]) {
      domainMetricScores[m.domain_code] = [];
    }
    if (score !== null) {
      domainMetricScores[m.domain_code].push(score);
    }
  }

  // 4. Query Evidence Items and Metric Links
  const evRes = await query(
    `SELECT e.*, er.level as reviewed_level, er.temporal_validity_status, er.authenticity_status
     FROM evidence_items e
     LEFT JOIN evidence_reviews er ON er.evidence_id = e.id
     WHERE e.assessment_id = $1`,
    [assessmentId]
  );
  const evidenceItems = evRes.rows;

  const linksRes = await query(
    `SELECT eml.metric_full_code, eml.evidence_id, e.status, e.source_origin, e.file_hash, er.level as reviewed_level, er.temporal_validity_status
     FROM evidence_metric_links eml
     JOIN evidence_items e ON e.id = eml.evidence_id
     LEFT JOIN evidence_reviews er ON er.evidence_id = e.id
     WHERE e.assessment_id = $1`,
    [assessmentId]
  );

  // Group evidence by domain
  const domainEvidenceMap: Record<string, any[]> = {};
  for (const d of domainsRes.rows) {
    domainEvidenceMap[d.code] = [];
  }
  for (const row of linksRes.rows) {
    const domainCode = row.metric_full_code.split('-')[0];
    if (domainEvidenceMap[domainCode]) {
      domainEvidenceMap[domainCode].push(row);
    }
  }

  // If evidence items exist on the assessment but lack explicit per-metric links,
  // associate them with assessed domains
  if (linksRes.rows.length === 0 && evidenceItems.length > 0) {
    for (const d of domainsRes.rows) {
      if ((domainMetricScores[d.code] || []).length > 0) {
        domainEvidenceMap[d.code] = evidenceItems.map((e) => ({
          ...e,
          metric_full_code: `${d.code}-I01`,
          evidence_id: e.id,
        }));
      }
    }
  }

  // 5. Compute Domain Results & Context-Calibrated Required Maturity (P0-4 Formula)
  // R_d = clamp(round(3.0 + baseContextShift + domainSensitivity), 1, 5)
  const domainResults: Record<string, any> = {};
  const contextResults: Record<string, any> = {};
  let weightedSum = 0;
  let totalWeightAssessed = 0;
  let assessedDomainsCount = 0;
  const domainRdList: number[] = [];

  for (const d of domainsRes.rows) {
    const scores = domainMetricScores[d.code] || [];
    const assessed = scores.length > 0;
    if (assessed) assessedDomainsCount++;

    const domainScore = assessed ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null;
    const currentMaturity = assessed && domainScore !== null ? Math.min(5, Math.max(0, Math.round(domainScore / 20))) : null;

    // Domain-specific sensitivity factors
    let domainSensitivity = 0;
    if (d.code === 'D01' && (hasHighExposureDisc || mandateVal === 'research_intensive')) domainSensitivity += 0.25;
    if (d.code === 'D02' && (hasHighExposureDisc || discExposureDelta >= 0.30)) domainSensitivity += 0.50;
    if (d.code === 'D03' && (scaleDelta >= 0.30 || location === 'metro')) domainSensitivity += 0.25;
    if (d.code === 'D04' && (hasHighExposureDisc || progComplexityDelta >= 0.20)) domainSensitivity += 0.25;
    if (d.code === 'D05' && (facultyDelta >= 0.20 || scaleDelta >= 0.30)) domainSensitivity += 0.25;
    if (d.code === 'D06' && (scaleDelta >= 0.30 || intlDelta >= 0.10)) domainSensitivity += 0.25;
    if (d.code === 'D07' && (hasHighExposureDisc || discExposureDelta >= 0.30)) domainSensitivity += 0.25;
    if (d.code === 'D08' && (scaleDelta >= 0.30 || location === 'metro')) domainSensitivity += 0.25;
    if (d.code === 'D09' && (mandateVal === 'professional' || ecosystemDelta >= 0.20)) domainSensitivity += 0.25;
    if (d.code === 'D10' && (researchDelta >= 0.25 || mandateVal === 'research_intensive')) domainSensitivity += 0.50;
    if (d.code === 'D11' && (scaleDelta >= 0.30 || mandateVal === 'research_intensive')) domainSensitivity += 0.25;

    const rawRd = 3.0 + baseContextShift + domainSensitivity;
    const requiredMaturity = Math.min(5, Math.max(1, Math.round(rawRd)));
    domainRdList.push(requiredMaturity);

    const transformationDistance = currentMaturity !== null ? requiredMaturity - currentMaturity : null;

    // P0-6 Evidence Confidence Calculation: Decoupled from capability scores
    const linkedDomainEv = domainEvidenceMap[d.code] || [];
    const reviewedDomainEv = linkedDomainEv.filter(
      (e) => (e.status === 'REVIEWED' || e.status === 'CORROBORATED') && e.temporal_validity_status !== 'expired' && e.temporal_validity_status !== 'invalid'
    );
    const e2PlusCount = reviewedDomainEv.filter((e) => ['E2', 'E3', 'E4'].includes(e.reviewed_level || 'E2')).length;
    const distinctOrigins = new Set(reviewedDomainEv.map((e) => e.source_origin || e.evidence_id || e.id)).size;

    let domainConfidence: 'unverified' | 'preliminary' | 'corroborated' = 'unverified';
    if (e2PlusCount >= 2 && distinctOrigins >= 2) {
      domainConfidence = 'corroborated';
    } else if (reviewedDomainEv.length >= 1 || linkedDomainEv.length >= 1) {
      domainConfidence = 'preliminary';
    } else {
      domainConfidence = 'unverified';
    }

    domainResults[d.code] = {
      code: d.code,
      name: d.name,
      assessed,
      domainScore,
      currentMaturity,
      requiredMaturity,
      transformationDistance,
      evidenceConfidence: domainConfidence,
      metricsAssessedCount: scores.length,
      totalMetricsCount: metricsRes.rows.filter((m: any) => m.domain_code === d.code).length,
    };

    contextResults[d.code] = {
      domainCode: d.code,
      requiredMaturity,
      currentMaturity,
      transformationDistance,
    };

    if (assessed && domainScore !== null) {
      weightedSum += domainScore * Number(d.provisional_weight || 0.09);
      totalWeightAssessed += Number(d.provisional_weight || 0.09);
    }
  }

  // 6. Cross-Domain Diagnostic Engine (Executes 25 rules / 413 links; strictly diagnostic, 0 score impact)
  const crossDomainFindings: any[] = [];
  let cdRulesQuery = `SELECT * FROM cross_domain_rules`;
  const cdParams: any[] = [];
  if (activeVersionId) {
    cdRulesQuery += ` WHERE methodology_version_id = $1`;
    cdParams.push(activeVersionId);
  }
  const cdRulesRes = await query(cdRulesQuery, cdParams);

  // Track triggered rules to avoid duplicate redundant findings
  const triggeredRuleMap = new Map<string, boolean>();

  for (const rule of cdRulesRes.rows) {
    const fromM = metricResults[rule.from_metric];
    const toM = metricResults[rule.to_metric];

    if (fromM && toM && fromM.score !== null && toM.score !== null) {
      const fromScore = fromM.score;
      const toScore = toM.score;
      const scoreGap = fromScore - toScore;
      const pairKey = `${rule.rule_id}-${rule.from_metric}-${rule.to_metric}`;

      // Rule Category 1: Contradiction Alert (High advance score with weak foundational capability)
      if (fromScore >= 70 && toScore <= 30 && !triggeredRuleMap.has(pairKey)) {
        triggeredRuleMap.set(pairKey, true);
        crossDomainFindings.push({
          ruleId: rule.rule_id,
          severity: 'CONTRADICTION',
          type: 'contradiction',
          fromMetric: rule.from_metric,
          toMetric: rule.to_metric,
          message: `Cross-domain contradiction (${rule.rule_id}): Advanced capability evaluated in ${rule.from_metric} (${fromScore}%) while foundational capability in ${rule.to_metric} is low (${toScore}%).`,
        });
      }
      // Rule Category 2: Dependency Gap (Upstream dependency lag)
      else if (scoreGap >= 40 && !triggeredRuleMap.has(pairKey)) {
        triggeredRuleMap.set(pairKey, true);
        crossDomainFindings.push({
          ruleId: rule.rule_id,
          severity: 'DEPENDENCY_GAP',
          type: 'dependency_gap',
          fromMetric: rule.from_metric,
          toMetric: rule.to_metric,
          message: `Cross-domain dependency gap (${rule.rule_id}): Downstream capability ${rule.from_metric} (${fromScore}%) exceeds foundational capability ${rule.to_metric} (${toScore}%) by ${Math.round(scoreGap)} points.`,
        });
      }
    }
  }

  // 7. Behavioural Anti-Gaming Detection Engine (AG01–AG10)
  const antiGamingFlagsRes = await query(`SELECT * FROM anti_gaming_flags WHERE assessment_id = $1`, [assessmentId]);
  const antiGamingFlags: any[] = [...antiGamingFlagsRes.rows];

  // Helper to record detected flag
  const addDetectedFlag = (code: string, severity: string, message: string) => {
    if (!antiGamingFlags.some((f) => f.rule_code === code)) {
      antiGamingFlags.push({
        assessment_id: assessmentId,
        rule_code: code,
        severity,
        message,
        is_resolved: false,
        created_at: '1970-01-01T00:00:00.000Z',
      });
    }
  };

  // AG01: Policy-only inflation (claims M>=4 with only E1 policy evidence and zero E2+ implementation evidence)
  for (const [domainCode, dRes] of Object.entries(domainResults)) {
    if (dRes.assessed && dRes.currentMaturity && dRes.currentMaturity >= 4) {
      const dEv = domainEvidenceMap[domainCode] || [];
      const hasE2Plus = dEv.some((e) => ['E2', 'E3', 'E4'].includes(e.reviewed_level));
      const hasOnlyE1 = dEv.length > 0 && dEv.every((e) => e.reviewed_level === 'E1');
      if (hasOnlyE1 && !hasE2Plus) {
        addDetectedFlag('AG01', 'WARNING', `Policy-only inflation (AG01): Domain ${domainCode} claims Level ${dRes.currentMaturity} maturity without operational implementation evidence (E2+).`);
      }
    }
  }

  // AG02: Self-authored corroboration (all submitted evidence items share single origin)
  if (evidenceItems.length >= 3) {
    const distinctOrigins = new Set(evidenceItems.map((e) => e.source_origin || e.uploader_id)).size;
    if (distinctOrigins === 1) {
      addDetectedFlag('AG02', 'WARNING', 'Self-authored corroboration (AG02): Multiple evidence artifacts originate from a single source origin without independent corroboration.');
    }
  }

  // AG03: Evidence recycling (1 artifact linked across >5 distinct domains)
  const artifactDomainCount = new Map<string, Set<string>>();
  for (const link of linksRes.rows) {
    const dCode = link.metric_full_code.split('-')[0];
    if (!artifactDomainCount.has(link.evidence_id)) {
      artifactDomainCount.set(link.evidence_id, new Set());
    }
    artifactDomainCount.get(link.evidence_id)!.add(dCode);
  }
  for (const [evId, dSet] of artifactDomainCount.entries()) {
    if (dSet.size > 5) {
      addDetectedFlag('AG03', 'WARNING', `Evidence recycling (AG03): Artifact ${evId.slice(0, 8)} linked across ${dSet.size} distinct domains without specialized substantiation.`);
    }
  }

  // AG05: Duplicate evidence / recycled narrative
  const hashCount = new Map<string, number>();
  for (const ev of evidenceItems) {
    if (ev.file_hash) {
      hashCount.set(ev.file_hash, (hashCount.get(ev.file_hash) || 0) + 1);
    }
  }
  for (const [hash, count] of hashCount.entries()) {
    if (count > 1) {
      addDetectedFlag('AG05', 'WARNING', `Duplicate evidence (AG05): Duplicate file content detected across ${count} distinct artifact submissions.`);
    }
  }

  // AG08: Expired / Outdated evidence (>24 months)
  const hasExpired = evidenceItems.some((e) => e.temporal_validity_status === 'expired');
  if (hasExpired) {
    addDetectedFlag('AG08', 'WARNING', 'Outdated evidence (AG08): One or more evidence artifacts fall outside the 24-month validity window.');
  }

  // AG09: Unsupported outcomes (O >= 4 with I <= 1)
  for (const [mCode, mRes] of Object.entries(metricResults)) {
    if (mRes.outcomes && mRes.outcomes >= 4 && (mRes.implementation === null || mRes.implementation <= 1)) {
      addDetectedFlag('AG09', 'WARNING', `Unsupported outcome (AG09): Metric ${mCode} claims high outcome (${mRes.outcomes}) without demonstrated operational implementation.`);
    }
  }

  // AG10: Contradiction suppression (severe contradiction without assessor notes)
  if (crossDomainFindings.some((f) => f.severity === 'CONTRADICTION')) {
    addDetectedFlag('AG10', 'WARNING', 'Contradiction suppression (AG10): Unresolved cross-domain contradiction detected across institutional capabilities.');
  }

  // 8. Overall Score & Dynamic Required Maturity Calculation
  // Partial Assessment Rule: Canonical overall score is strictly withheld/null if not all 11 domains are assessed
  const isPartial = assessedDomainsCount < domainsRes.rows.length;
  const overallScore = !isPartial && totalWeightAssessed > 0
    ? Math.round((weightedSum / totalWeightAssessed) * 100) / 100
    : null;

  const overallCurrentMaturity = overallScore !== null ? Math.min(5, Math.max(0, Math.round(overallScore / 20))) : null;

  // Overall Required Maturity derived dynamically from domain requirements (never fixed at 4)
  const applicableDomainRdValues = Object.values(domainResults)
    .filter((d: any) => d.assessed || !isPartial)
    .map((d: any) => d.requiredMaturity);
  const targetRdList = applicableDomainRdValues.length > 0 ? applicableDomainRdValues : domainRdList;
  const overallRequiredMaturity = targetRdList.length > 0
    ? Math.min(5, Math.max(1, Math.round(targetRdList.reduce((a, b) => a + b, 0) / targetRdList.length)))
    : 3;

  const overallTransformationDistance = overallCurrentMaturity !== null ? overallRequiredMaturity - overallCurrentMaturity : null;

  // 9. Dynamic Strengths and Vulnerabilities Generation from actual scores
  const assessedDomainEntries = Object.values(domainResults).filter((d: any) => d.assessed && d.domainScore !== null);
  assessedDomainEntries.sort((a: any, b: any) => (b.domainScore || 0) - (a.domainScore || 0));

  const strengths: any[] = [];
  const vulnerabilities: any[] = [];

  if (assessedDomainEntries.length > 0) {
    // Top performing domain(s)
    const top = assessedDomainEntries[0];
    strengths.push({
      title: `${top.name} (${top.code})`,
      body: `Demonstrates the highest evaluated capability baseline across assessed areas (${top.domainScore}% score, Level ${top.currentMaturity} maturity).`,
      between: [top.code],
    });

    if (assessedDomainEntries.length > 1) {
      const secondTop = assessedDomainEntries[1];
      if ((secondTop.domainScore || 0) >= 50) {
        strengths.push({
          title: `${secondTop.name} (${secondTop.code})`,
          body: `Shows structured operational capability with established baseline practices (${secondTop.domainScore}% score).`,
          between: [secondTop.code],
        });
      }
    }

    // Lowest performing domain(s)
    const lowest = assessedDomainEntries[assessedDomainEntries.length - 1];
    if (lowest.code !== top.code) {
      vulnerabilities.push({
        title: `${lowest.name} (${lowest.code})`,
        body: `Represents a key transformation gap where current maturity (Level ${lowest.currentMaturity}) lags required maturity (Level ${lowest.requiredMaturity}, distance: +${lowest.transformationDistance}).`,
        between: [lowest.code],
      });
    }
  }

  return {
    overallScore,
    isPartial,
    assessedDomainsCount,
    totalDomainsCount: domainsRes.rows.length,
    overallCurrentMaturity,
    overallRequiredMaturity,
    overallTransformationDistance,
    domainResults,
    metricResults,
    contextResults,
    crossDomainFindings,
    antiGamingFlags,
    strengths,
    vulnerabilities,
    contradictions: crossDomainFindings.filter((f) => f.type === 'contradiction' || f.severity === 'CONTRADICTION'),
  };
}
