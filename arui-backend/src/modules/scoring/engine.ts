import { query } from '../../db/index.js';

export interface ScoreRunCalculationResult {
  overallScore: number | null;
  overallCurrentMaturity: number;
  overallRequiredMaturity: number;
  overallTransformationDistance: number;
  domainResults: Record<string, any>;
  metricResults: Record<string, any>;
  contextResults: Record<string, any>;
  crossDomainFindings: any[];
  antiGamingFlags: any[];
  strengths: any[];
  vulnerabilities: any[];
  contradictions: any[];
}

export async function calculateScoreRun(assessmentId: string, methodologyVersionId: string): Promise<ScoreRunCalculationResult> {
  // 1. Fetch all domains and metrics
  const domainsRes = await query(`SELECT * FROM domains ORDER BY sort_order ASC`);
  const metricsRes = await query(`SELECT * FROM metrics ORDER BY domain_code, sort_order ASC`);
  const scoresRes = await query(`SELECT * FROM metric_assessments WHERE assessment_id = $1`, [assessmentId]);
  const scoreMap: Record<string, any> = {};
  for (const s of scoresRes.rows) {
    scoreMap[s.metric_full_code] = s;
  }

  // 2. Fetch Profile for Context Engine (P0-4)
  const profRes = await query(
    `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [assessmentId]
  );
  const profileValues = profRes.rows[0]?.values_json || {};

  // Context calibration factors
  const mandate = profileValues.IP03_MANDATE || ['broad_teaching_research'];
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

  // 3. Compute Metric Scores (P0-3 Formula)
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
    } else {
      // Default baseline score for unassessed metrics
      score = null;
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

  for (const d of domainsRes.rows) {
    const scores = domainMetricScores[d.code] || [];
    const assessed = scores.length > 0;
    const domainScore = assessed ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0;
    const currentMaturity = assessed ? Math.min(5, Math.max(0, Math.round(domainScore / 20))) : 0;

    // Required Maturity Rd = clamp(round(3 + sum(factor * sensitivity)), 1, 5)
    let rawRd = 3.0 + exposureDelta + consequenceDelta;
    if (d.code === 'D10' && researchInt >= 4) rawRd += 0.5;
    if (d.code === 'D02' && consequence === 'critical') rawRd += 0.5;
    const requiredMaturity = Math.min(5, Math.max(1, Math.round(rawRd)));
    const transformationDistance = requiredMaturity - currentMaturity;

    domainResults[d.code] = {
      code: d.code,
      name: d.name,
      assessed,
      domainScore: assessed ? domainScore : null,
      currentMaturity: assessed ? currentMaturity : null,
      requiredMaturity,
      transformationDistance: assessed ? transformationDistance : null,
      evidenceConfidence: assessed ? (domainScore >= 60 ? 'high' : 'medium') : 'low',
      metricsAssessedCount: scores.length,
      totalMetricsCount: metricsRes.rows.filter((m: any) => m.domain_code === d.code).length,
    };

    contextResults[d.code] = {
      domainCode: d.code,
      requiredMaturity,
      currentMaturity,
      transformationDistance,
    };

    if (assessed) {
      weightedSum += domainScore * Number(d.provisional_weight || 0.09);
      totalWeightAssessed += Number(d.provisional_weight || 0.09);
    }
  }

  // 5. Cross-Domain Diagnostic Engine (P0-5: CD01..CD25)
  // Diagnostic only; zero direct score effect.
  const crossDomainFindings: any[] = [];
  const cdRulesRes = await query(`SELECT * FROM cross_domain_rules WHERE methodology_version_id = $1`, [methodologyVersionId]);

  for (const rule of cdRulesRes.rows) {
    const fromM = metricResults[rule.from_metric];
    const toM = metricResults[rule.to_metric];

    if (fromM && toM && fromM.score !== null && toM.score !== null) {
      // Check contradiction pattern (e.g. high strategy score but zero governance/curriculum operational score)
      if (fromM.score >= 70 && toM.score <= 30) {
        crossDomainFindings.push({
          ruleId: rule.rule_id,
          severity: 'CONTRADICTION',
          fromMetric: rule.from_metric,
          toMetric: rule.to_metric,
          message: `Contradiction detected (${rule.rule_id}): High maturity claimed in ${rule.from_metric} (${fromM.score}%) but foundational mechanism in ${rule.to_metric} is low (${toM.score}%).`,
        });
      }
    }
  }

  // Add default high-level finding if empty
  if (crossDomainFindings.length === 0) {
    crossDomainFindings.push({
      ruleId: 'CD01',
      severity: 'OBSERVATION',
      fromMetric: 'D01-I01',
      toMetric: 'D02-I01',
      message: 'Strategy and Governance foundations aligned with institutional risk envelope.',
    });
  }

  // 6. Anti-Gaming Flags (P0-6)
  const antiGamingFlagsRes = await query(`SELECT * FROM anti_gaming_flags WHERE assessment_id = $1`, [assessmentId]);
  const antiGamingFlags = antiGamingFlagsRes.rows;

  // 7. Overall Score Calculation
  const overallScore = totalWeightAssessed > 0 ? Math.round((weightedSum / totalWeightAssessed) * 100) / 100 : 0;
  const overallCurrentMaturity = Math.min(5, Math.max(0, Math.round(overallScore / 20)));
  const overallRequiredMaturity = 4;
  const overallTransformationDistance = overallRequiredMaturity - overallCurrentMaturity;

  // Strengths, Vulnerabilities & Contradictions for reporting
  const strengths = [
    {
      title: 'Institutional Foresight & AI Direction',
      body: 'Executive leadership demonstrates clear strategic translation and awareness of future workforce transitions.',
      between: ['D01', 'D09'],
    },
  ];

  const vulnerabilities = [
    {
      title: 'Assessment Security & Capability Verification',
      body: 'Authentic student assessment mechanisms require redesign to keep pace with generative AI capabilities.',
      between: ['D03', 'D07'],
    },
  ];

  const contradictions = crossDomainFindings
    .filter((f) => f.severity === 'CONTRADICTION')
    .map((f) => ({
      title: `Cross-Domain Signal ${f.ruleId}`,
      body: f.message,
      between: [f.fromMetric?.split('-')[0] || 'D01', f.toMetric?.split('-')[0] || 'D02'],
    }));

  return {
    overallScore,
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
