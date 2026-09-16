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
  // 1. Fetch all domains and metrics
  const domainsRes = await query(`SELECT * FROM domains ORDER BY sort_order ASC`);
  const metricsRes = await query(`SELECT * FROM metrics ORDER BY domain_code, sort_order ASC`);
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

  // Canonical P0-4 25-Field Factor Resolution:
  // IP01: Institution name
  // IP02: Institution type (Comprehensive, Technical, Health, Business, Liberal Arts, Specialist)
  const instType = profileValues.IP02 || profileValues.IP02_INST_TYPE || 'comprehensive';

  // IP03: Governance type (Public, Private, Autonomous)
  const governanceType = profileValues.IP03 || profileValues.IP03_GOVERNANCE_TYPE || 'public';

  // IP04 & IP05: State & District
  const state = profileValues.IP04 || profileValues.IP04_STATE || '';
  const district = profileValues.IP05 || profileValues.IP05_DISTRICT || '';

  // IP06: Location (Metro 0.25, Urban 0.20, Semi-Urban 0.10, Rural 0.0)
  const location = profileValues.IP06 || profileValues.IP06_LOCATION || 'metro';
  let locationDelta = 0.20;
  if (location === 'metro') locationDelta = 0.25;
  else if (location === 'semi_urban') locationDelta = 0.10;
  else if (location === 'rural') locationDelta = 0.0;

  // IP07: Year established
  const yearEst = Number(profileValues.IP07 || profileValues.IP07_YEAR_ESTABLISHED) || 2000;

  // IP08: Student Enrolment Headcount Scale (<2.5k: 0.0, 2.5k-10k: 0.10, 10k-25k: 0.20, 25k-50k: 0.30, >50k: 0.40)
  const studentVal = profileValues.IP08 || profileValues.IP08_STUDENT_ENROLLMENT;
  let scaleDelta = 0.20;
  if (typeof studentVal === 'number') {
    if (studentVal > 50000) scaleDelta = 0.40;
    else if (studentVal >= 25000) scaleDelta = 0.30;
    else if (studentVal >= 10000) scaleDelta = 0.20;
    else if (studentVal >= 2500) scaleDelta = 0.10;
    else scaleDelta = 0.0;
  } else if (typeof studentVal === 'string') {
    if (studentVal === 'over_50000' || studentVal === '>50k' || studentVal === '>60k') scaleDelta = 0.40;
    else if (studentVal === '25000_50000' || studentVal === '30k_60k') scaleDelta = 0.30;
    else if (studentVal === 'under_2500' || studentVal === '<2k') scaleDelta = 0.0;
    else if (studentVal === '2500_10000' || studentVal === '2k_10k') scaleDelta = 0.10;
  }

  // IP09: Faculty Headcount Scale
  const facultyVal = profileValues.IP09 || profileValues.IP09_FACULTY_COUNT;
  let facultyDelta = 0.10;
  if (typeof facultyVal === 'number') {
    if (facultyVal > 1500) facultyDelta = 0.20;
    else if (facultyVal < 150) facultyDelta = 0.0;
  } else if (typeof facultyVal === 'string') {
    if (facultyVal === 'over_1500') facultyDelta = 0.20;
    else if (facultyVal === 'under_150') facultyDelta = 0.0;
  }

  // IP10, IP11, IP12, IP13: Academic Programmes Breadth (Active, UG, PG, Doctoral)
  const activeProg = Number(profileValues.IP10 || profileValues.IP10_ACTIVE_PROGRAMMES) || 30;
  const docProg = Number(profileValues.IP13 || profileValues.IP13_DOCTORAL_PROGRAMMES) || 0;
  let progComplexityDelta = 0.10;
  if (activeProg > 50 || docProg > 10) progComplexityDelta = 0.20;
  else if (activeProg < 10) progComplexityDelta = 0.0;

  // IP14: Major Disciplines Clusters
  const disciplines = Array.isArray(profileValues.IP14 || profileValues.IP14_MAJOR_DISCIPLINES)
    ? (profileValues.IP14 || profileValues.IP14_MAJOR_DISCIPLINES)
    : [];
  let discExposureDelta = 0.20;
  const hasHighExposureDisc = disciplines.some((d: string) =>
    ['engineering_cs', 'engineering', 'cs', 'health_medicine', 'medicine', 'stem'].some(k => d.toLowerCase().includes(k))
  );
  if (hasHighExposureDisc) discExposureDelta = 0.35;

  // IP15: Research Intensity (Teaching-only 0.0, Low 0.10, Moderate 0.25, High/Research-intensive 0.50)
  const researchIntVal = profileValues.IP15 || profileValues.IP15_RESEARCH_INTENSITY;
  let researchDelta = 0.10;
  if (typeof researchIntVal === 'number') {
    if (researchIntVal >= 5) researchDelta = 0.50;
    else if (researchIntVal >= 4) researchDelta = 0.25;
    else if (researchIntVal <= 2) researchDelta = 0.0;
  } else if (typeof researchIntVal === 'string') {
    const lower = researchIntVal.toLowerCase();
    if (lower.includes('high') || lower.includes('intensive')) researchDelta = 0.50;
    else if (lower.includes('mod') || lower.includes('balanced')) researchDelta = 0.25;
    else if (lower.includes('teach') || lower.includes('low')) researchDelta = 0.0;
  }

  // IP16, IP17, IP18: Resource Envelope & Expenditure Bands
  // P0-4 Rule: Resource envelope affects evidence burden only, NOT maturity standards / capability score
  const resourceVal = profileValues.IP16 || profileValues.IP16_RESOURCE_ENVELOPE;

  // IP19 & IP20: Industry Engagement & Innovation Ecosystem
  const industryEng = profileValues.IP19 || 'moderate';
  const innovationEco = profileValues.IP20 || 'emerging';
  let ecosystemDelta = 0.10;
  if (String(industryEng).toLowerCase().includes('extensive') || String(innovationEco).toLowerCase().includes('advanced')) {
    ecosystemDelta = 0.25;
  }

  // IP23: Institutional Mandate (Teaching 0.0, Broad T+R 0.25, Research-intensive 0.50, Professional/regulated 0.50, Specialist 0.25)
  const mandateVal = Array.isArray(profileValues.IP23 || profileValues.IP03_MANDATE)
    ? (profileValues.IP23 || profileValues.IP03_MANDATE)[0]
    : (profileValues.IP23 || profileValues.IP03_MANDATE);
  let mandateDelta = 0.25;
  if (mandateVal === 'research_intensive' || mandateVal === 'professional') mandateDelta = 0.50;
  else if (mandateVal === 'teaching') mandateDelta = 0.0;
  else if (mandateVal === 'specialist') mandateDelta = 0.25;

  // IP25: International Exposure
  const intlExpo = profileValues.IP25 || 'moderate';
  let intlDelta = 0.05;
  if (String(intlExpo).toLowerCase().includes('high')) intlDelta = 0.15;

  // Composite Baseline Context Shift: sum of calibrated factors normalized over baseline factor count
  const factorSum = mandateDelta + discExposureDelta + researchDelta + scaleDelta + locationDelta + facultyDelta + progComplexityDelta + ecosystemDelta + intlDelta;
  const baseContextShift = factorSum / 3.0;

  const metricResults: Record<string, any> = {};
  const domainMetricScores: Record<string, number[]> = {};

  // Initialize domain buckets
  for (const d of domainsRes.rows) {
    domainMetricScores[d.code] = [];
  }

  // 3. Compute Metric Scores (P0-3 Standard Formula)
  for (const m of metricsRes.rows) {
    const saved = scoreMap[m.full_code];
    let score: number | null = null;
    let isNa = false;

    if (saved) {
      isNa = saved.is_na || false;
      if (!isNa && saved.maturity !== null && saved.maturity !== undefined) {
        const M = Number(saved.maturity);
        const I = Number(saved.implementation ?? M);
        const hasOutcome = saved.outcomes !== null && saved.outcomes !== undefined;

        if (hasOutcome) {
          const O = Number(saved.outcomes);
          // Standard P0-3 formula with Outcome: 100 * (0.45M + 0.30I + 0.25O) / 5
          score = (100 * (0.45 * M + 0.30 * I + 0.25 * O)) / 5;
        } else {
          // Outcome N/A formula: 100 * (0.60M + 0.40I) / 5
          score = (100 * (0.60 * M + 0.40 * I)) / 5;
        }
        score = Math.round(score * 100) / 100;
        domainMetricScores[m.domain_code]?.push(score);
      }
    }

    metricResults[m.full_code] = {
      metricId: m.full_code,
      metricName: m.name,
      domainCode: m.domain_code,
      score,
      maturity: saved?.maturity ?? null,
      implementation: saved?.implementation ?? null,
      outcomes: saved?.outcomes ?? null,
      isNa,
    };
  }

  // 4. Fetch Evidence Items and Metric Links for P0-6 Evidence Confidence Engine
  const evRes = await query(
    `SELECT e.*, er.level as reviewed_level, er.temporal_validity_status
     FROM evidence_items e
     LEFT JOIN evidence_reviews er ON er.evidence_id = e.id
     WHERE e.assessment_id = $1`,
    [assessmentId]
  );
  const evidenceItems = evRes.rows;

  const linksRes = await query(
    `SELECT eml.metric_full_code, eml.evidence_id, e.status, e.source_origin, er.level as reviewed_level, er.temporal_validity_status
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
      (e) => (e.status === 'REVIEWED' || e.status === 'CORROBORATED') && e.temporal_validity_status !== 'invalid'
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
  if (methodologyVersionId) {
    cdRulesQuery += ` WHERE methodology_version_id = $1`;
    cdParams.push(methodologyVersionId);
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

  // 7. Anti-Gaming Flags
  const antiGamingFlagsRes = await query(`SELECT * FROM anti_gaming_flags WHERE assessment_id = $1`, [assessmentId]);
  const antiGamingFlags = antiGamingFlagsRes.rows;

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

  const contradictions = crossDomainFindings
    .filter((f) => f.severity === 'CONTRADICTION')
    .map((f) => ({
      title: `Cross-Domain Signal ${f.ruleId}`,
      body: f.message,
      between: [f.fromMetric?.split('-')[0] || 'D01', f.toMetric?.split('-')[0] || 'D02'],
    }));

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
    contradictions,
  };
}

