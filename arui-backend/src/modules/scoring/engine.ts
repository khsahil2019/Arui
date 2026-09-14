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

  // 2. Fetch Profile for Context Engine (P0-4 Context Calibration)
  const profRes = await query(
    `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [assessmentId]
  );
  const profileValues = profRes.rows[0]?.values_json || {};

  // Context calibration factors
  const aiExposure = profileValues.IP10_AI_EXPOSURE || 'medium';
  const consequence = profileValues.IP11_DISCIPLINARY_CONSEQUENCE || 'medium';
  const researchInt = Number(profileValues.IP15_RESEARCH_INTENSITY) || 3;

  let exposureDelta = 0;
  if (aiExposure === 'very_high') exposureDelta = 0.6;
  else if (aiExposure === 'high') exposureDelta = 0.3;
  else if (aiExposure === 'low') exposureDelta = -0.3;

  let consequenceDelta = 0;
  if (consequence === 'critical') consequenceDelta = 0.6;
  else if (consequence === 'high') consequenceDelta = 0.3;
  else if (consequence === 'low') consequenceDelta = -0.3;

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

  // 4. Compute Domain Results & Required Maturity (P0-4)
  const domainResults: Record<string, any> = {};
  const contextResults: Record<string, any> = {};
  let weightedSum = 0;
  let totalWeightAssessed = 0;
  let assessedDomainsCount = 0;

  for (const d of domainsRes.rows) {
    const scores = domainMetricScores[d.code] || [];
    const assessed = scores.length > 0;
    if (assessed) assessedDomainsCount++;

    const domainScore = assessed ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null;
    const currentMaturity = assessed && domainScore !== null ? Math.min(5, Math.max(0, Math.round(domainScore / 20))) : null;

    // Required Maturity Rd = clamp(round(3 + sum(factor * sensitivity)), 1, 5)
    let rawRd = 3.0 + exposureDelta + consequenceDelta;
    if (d.code === 'D10' && researchInt >= 4) rawRd += 0.5;
    if (d.code === 'D02' && consequence === 'critical') rawRd += 0.5;
    const requiredMaturity = Math.min(5, Math.max(1, Math.round(rawRd)));
    const transformationDistance = currentMaturity !== null ? requiredMaturity - currentMaturity : null;

    domainResults[d.code] = {
      code: d.code,
      name: d.name,
      assessed,
      domainScore,
      currentMaturity,
      requiredMaturity,
      transformationDistance,
      evidenceConfidence: assessed ? ((domainScore || 0) >= 60 ? 'high' : 'medium') : 'low',
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

  // 5. Cross-Domain Diagnostic Engine (Diagnostic only; zero score effect)
  const crossDomainFindings: any[] = [];
  let cdRulesQuery = `SELECT * FROM cross_domain_rules`;
  const cdParams: any[] = [];
  if (methodologyVersionId) {
    cdRulesQuery += ` WHERE methodology_version_id = $1`;
    cdParams.push(methodologyVersionId);
  }
  const cdRulesRes = await query(cdRulesQuery, cdParams);

  for (const rule of cdRulesRes.rows) {
    const fromM = metricResults[rule.from_metric];
    const toM = metricResults[rule.to_metric];

    if (fromM && toM && fromM.score !== null && toM.score !== null) {
      if (fromM.score >= 70 && toM.score <= 30) {
        crossDomainFindings.push({
          ruleId: rule.rule_id,
          severity: 'CONTRADICTION',
          fromMetric: rule.from_metric,
          toMetric: rule.to_metric,
          message: `Cross-domain contradiction (${rule.rule_id}): High maturity scored in ${rule.from_metric} (${fromM.score}%) while foundational capability in ${rule.to_metric} is low (${toM.score}%).`,
        });
      }
    }
  }

  // 6. Anti-Gaming Flags
  const antiGamingFlagsRes = await query(`SELECT * FROM anti_gaming_flags WHERE assessment_id = $1`, [assessmentId]);
  const antiGamingFlags = antiGamingFlagsRes.rows;

  // 7. Overall Score Calculation (Partial Assessment Rule)
  const isPartial = assessedDomainsCount < domainsRes.rows.length;
  const overallScore = !isPartial && totalWeightAssessed > 0
    ? Math.round((weightedSum / totalWeightAssessed) * 100) / 100
    : (totalWeightAssessed > 0 ? Math.round((weightedSum / totalWeightAssessed) * 100) / 100 : null);

  const overallCurrentMaturity = overallScore !== null ? Math.min(5, Math.max(0, Math.round(overallScore / 20))) : null;
  const overallRequiredMaturity = 4;
  const overallTransformationDistance = overallCurrentMaturity !== null ? overallRequiredMaturity - overallCurrentMaturity : null;

  // 8. Dynamic Strengths and Vulnerabilities Generation from actual scores
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
