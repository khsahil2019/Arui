import crypto from 'crypto';
import { query } from '../../db/index.js';
import type {
  BenchmarkDatasetSnapshot,
  BenchmarkSummaryResponse,
  DimensionBenchmark,
  DistributionStats,
  HistoricalBaselineEvolution,
  PeerGroup,
} from './types.js';

function computeDistribution(values: number[]): DistributionStats {
  if (values.length === 0) {
    return { mean: 0, median: 0, p25: 0, p75: 0, iqr: 0, stdDev: 0, min: 0, max: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((sum, v) => sum + v, 0) / n;
  
  const getPercentile = (p: number) => {
    const idx = (p / 100) * (n - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    if (lower === upper) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const median = getPercentile(50);
  const p25 = getPercentile(25);
  const p75 = getPercentile(75);
  const iqr = p75 - p25;
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    p25: Number(p25.toFixed(2)),
    p75: Number(p75.toFixed(2)),
    iqr: Number(iqr.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    min: Number(sorted[0].toFixed(2)),
    max: Number(sorted[n - 1].toFixed(2)),
  };
}

export class BenchmarkingService {
  /**
   * Captures and preserves structured, anonymized data from a completed assessment.
   * (Instruction #40, #42)
   */
  static async recordAssessmentSnapshot(assessmentId: string): Promise<BenchmarkDatasetSnapshot | null> {
    const aRes = await query(
      `SELECT a.id, a.product_code, a.institution_id, a.methodology_version_id, a.status,
              mv.version AS methodology_version, i.name AS institution_name
       FROM assessments a
       JOIN methodology_versions mv ON a.methodology_version_id = mv.id
       JOIN institutions i ON a.institution_id = i.id
       WHERE a.id = $1`,
      [assessmentId]
    );
    if (aRes.rows.length === 0) return null;
    const aRow = aRes.rows[0];

    // Check institutional participation consent
    const consentRes = await query(
      `SELECT participation_level, is_consented FROM benchmark_consents 
       WHERE institution_id = $1 AND product_code = $2`,
      [aRow.institution_id, aRow.product_code]
    );
    const consent = consentRes.rows[0];
    if (consent && (!consent.is_consented || consent.participation_level === 'OPT_OUT')) {
      return null;
    }

    // Get context profile
    const pRes = await query(
      `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [assessmentId]
    );
    const contextProfile: Record<string, any> = pRes.rows[0]?.values_json || {};

    // Get latest score run
    const sRes = await query(
      `SELECT overall_score, domain_results_json, metric_results_json 
       FROM score_runs 
       WHERE assessment_id = $1 
       ORDER BY run_number DESC LIMIT 1`,
      [assessmentId]
    );
    if (sRes.rows.length === 0 || sRes.rows[0].overall_score === null) return null;
    const sRow = sRes.rows[0];

    const overallScore = Number(sRow.overall_score);
    const maturityBand = overallScore >= 80 ? 5 : overallScore >= 65 ? 4 : overallScore >= 50 ? 3 : overallScore >= 35 ? 2 : 1;

    const dimensionScores: Record<string, number> = {};
    if (Array.isArray(sRow.domain_results_json)) {
      for (const d of sRow.domain_results_json) {
        dimensionScores[d.domainCode || d.domain_code] = Number(d.calibratedScore || d.domain_score || 0);
      }
    }

    const metricScores: Record<string, number> = {};
    if (Array.isArray(sRow.metric_results_json)) {
      for (const m of sRow.metric_results_json) {
        metricScores[m.metricCode || m.metric_code] = Number(m.effectiveScore || m.score || 0);
      }
    }

    // Generate irreversible anonymized id
    const anonymizedId = crypto
      .createHash('sha256')
      .update(`${aRow.institution_id}:arui_benchmarking_salt_2026:${aRow.product_code}`)
      .digest('hex')
      .substring(0, 32);

    const insertRes = await query(
      `INSERT INTO benchmark_dataset_snapshots (
         product_code, assessment_id, institution_id, methodology_version, assessment_date,
         anonymized_id, context_profile_json, overall_score, maturity_band,
         dimension_scores_json, metric_scores_json, is_verified_audit
       )
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9, $10, true)
       ON CONFLICT (assessment_id) DO UPDATE SET
         overall_score = EXCLUDED.overall_score,
         maturity_band = EXCLUDED.maturity_band,
         dimension_scores_json = EXCLUDED.dimension_scores_json,
         metric_scores_json = EXCLUDED.metric_scores_json,
         context_profile_json = EXCLUDED.context_profile_json,
         assessment_date = NOW()
       RETURNING *`,
      [
        aRow.product_code,
        assessmentId,
        aRow.institution_id,
        aRow.methodology_version,
        anonymizedId,
        JSON.stringify(contextProfile),
        overallScore,
        maturityBand,
        JSON.stringify(dimensionScores),
        JSON.stringify(metricScores),
      ]
    );

    const r = insertRes.rows[0];
    return {
      id: r.id,
      productCode: r.product_code,
      assessmentId: r.assessment_id,
      institutionId: r.institution_id,
      methodologyVersion: r.methodology_version,
      assessmentDate: r.assessment_date,
      anonymizedId: r.anonymized_id,
      contextProfile: typeof r.context_profile_json === 'string' ? JSON.parse(r.context_profile_json) : (r.context_profile_json || {}),
      overallScore: Number(r.overall_score),
      maturityBand: Number(r.maturity_band),
      dimensionScores: typeof r.dimension_scores_json === 'string' ? JSON.parse(r.dimension_scores_json) : (r.dimension_scores_json || {}),
      metricScores: typeof r.metric_scores_json === 'string' ? JSON.parse(r.metric_scores_json) : (r.metric_scores_json || {}),
      isVerifiedAudit: r.is_verified_audit,
      createdAt: r.created_at,
    };
  }

  /**
   * Matches configured Peer Groups based on institutional context variables.
   * (Instruction #43)
   */
  static async matchPeerGroup(productCode: string, contextProfile: Record<string, any>): Promise<PeerGroup | null> {
    const pgRes = await query(
      `SELECT pg.*, 
              json_agg(pgr.*) FILTER (WHERE pgr.id IS NOT NULL) AS rules
       FROM peer_groups pg
       LEFT JOIN peer_group_rules pgr ON pg.id = pgr.peer_group_id
       WHERE pg.product_code = $1 AND pg.is_active = true
       GROUP BY pg.id
       ORDER BY pg.created_at ASC`,
      [productCode]
    );

    for (const pg of pgRes.rows) {
      const rules = pg.rules || [];
      if (rules.length === 0) return pg; // General peer group

      let matchesAll = true;
      for (const rule of rules) {
        const val = contextProfile[rule.dimension_name] 
          ?? contextProfile[rule.dimension_name.toLowerCase()]
          ?? (rule.dimension_name === 'institution_type' ? (contextProfile['IP02'] ?? contextProfile['IP02_INST_TYPE']) : undefined)
          ?? (rule.dimension_name === 'discipline_profile' ? (contextProfile['IP14'] ?? contextProfile['IP14_DISCIPLINE_PROFILE']) : undefined)
          ?? (rule.dimension_name === 'ownership' ? (contextProfile['IP03'] ?? contextProfile['IP03_MANDATE']) : undefined);

        if (val === undefined || val === null) {
          matchesAll = false;
          break;
        }

        const ruleVal = rule.rule_value_json;
        if (rule.operator === 'EQ') {
          if (String(val).toLowerCase() !== String(ruleVal).toLowerCase()) matchesAll = false;
        } else if (rule.operator === 'IN') {
          const arr = Array.isArray(ruleVal) ? ruleVal : [ruleVal];
          const matched = arr.some((item) => String(item).toLowerCase() === String(val).toLowerCase());
          if (!matched) matchesAll = false;
        }
      }

      if (matchesAll) return pg;
    }

    return null;
  }

  /**
   * Calculates comparative benchmark intelligence across Level 1 to Level 5.
   * Guaranteed: ZERO FAKE RANKINGS. If N < N_min, returns DATASET_GROWING.
   * (Instruction #41, #44, #46)
   */
  static async getBenchmarkSummary(assessmentId: string): Promise<BenchmarkSummaryResponse> {
    const aRes = await query(
      `SELECT a.id, a.product_code, a.institution_id, i.name AS institution_name
       FROM assessments a
       JOIN institutions i ON a.institution_id = i.id
       WHERE a.id = $1`,
      [assessmentId]
    );
    if (aRes.rows.length === 0) {
      throw new Error('Assessment not found');
    }
    const assessment = aRes.rows[0];
    const productCode = assessment.product_code;

    // 1. Get current score run & historical score runs (Level 1 Baseline Evolution)
    const runsRes = await query(
      `SELECT run_number, overall_score, domain_results_json, created_at
       FROM score_runs
       WHERE assessment_id = $1
       ORDER BY run_number ASC`,
      [assessmentId]
    );

    const history: HistoricalBaselineEvolution[] = runsRes.rows.map((r, idx, arr) => {
      const dimScores: Record<string, number> = {};
      if (Array.isArray(r.domain_results_json)) {
        for (const d of r.domain_results_json) {
          dimScores[d.domainCode || d.domain_code] = Number(d.calibratedScore || d.domain_score || 0);
        }
      }
      const prevScore = idx > 0 ? Number(arr[idx - 1].overall_score) : Number(r.overall_score);
      return {
        versionNumber: r.run_number,
        assessmentDate: r.created_at,
        overallScore: Number(r.overall_score || 0),
        dimensionScores: dimScores,
        deltaPoints: Number((Number(r.overall_score || 0) - prevScore).toFixed(1)),
      };
    });

    const latestRun = history[history.length - 1];
    const overallScore = latestRun ? latestRun.overallScore : 0;
    const maturityBand = overallScore >= 80 ? 5 : overallScore >= 65 ? 4 : overallScore >= 50 ? 3 : overallScore >= 35 ? 2 : 1;
    const longitudinalDelta = history.length > 1 ? Number((overallScore - history[0].overallScore).toFixed(1)) : 0;

    // 2. Get Context Profile
    const pRes = await query(
      `SELECT values_json FROM institution_profiles WHERE assessment_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [assessmentId]
    );
    const contextProfile: Record<string, any> = pRes.rows[0]?.values_json || {};

    // 3. Match Peer Group
    const peerGroup = await this.matchPeerGroup(productCode, contextProfile);
    const minRequiredSample = peerGroup?.minSampleThreshold || 10;

    // 4. Query dataset snapshots for peer group & overall sector
    const sectorSnapshotsRes = await query(
      `SELECT overall_score, dimension_scores_json, context_profile_json, institution_id
       FROM benchmark_dataset_snapshots
       WHERE product_code = $1`,
      [productCode]
    );

    const totalSectorInstitutions = sectorSnapshotsRes.rows.length;
    const isSectorValid = totalSectorInstitutions >= minRequiredSample;
    const sectorScores = sectorSnapshotsRes.rows.map((r) => Number(r.overall_score));
    const sectorDist = computeDistribution(sectorScores);

    // Peer group sample calculations. Never substitute the full sector for a configured
    // peer group: if the configured criteria cannot be evaluated, the peer result remains unavailable.
    const peerRows = peerGroup
      ? sectorSnapshotsRes.rows.filter((row: any) => {
          const profile = typeof row.context_profile_json === 'string' ? JSON.parse(row.context_profile_json) : (row.context_profile_json || {});
          const rules = peerGroup.rules || [];
          return rules.every((rule: any) => {
            const val = profile[rule.dimension_name]
              ?? profile[rule.dimension_name.toLowerCase()]
              ?? (rule.dimension_name === 'institution_type' ? (profile['IP02'] ?? profile['IP02_INST_TYPE']) : undefined)
              ?? (rule.dimension_name === 'discipline_profile' ? (profile['IP14'] ?? profile['IP14_DISCIPLINE_PROFILE']) : undefined)
              ?? (rule.dimension_name === 'ownership' ? (profile['IP03'] ?? profile['IP03_MANDATE']) : undefined);

            if (val === undefined || val === null) return false;
            const ruleVal = rule.rule_value_json;
            if (rule.operator === 'EQ') return String(val).toLowerCase() === String(ruleVal).toLowerCase();
            if (rule.operator === 'IN') {
              const arr = Array.isArray(ruleVal) ? ruleVal : [ruleVal];
              return arr.some((item: any) => String(item).toLowerCase() === String(val).toLowerCase());
            }
            return false;
          });
        })
      : [];
    const peerSampleScores = peerRows.map((r: any) => Number(r.overall_score));
    const peerSampleSize = peerRows.length;
    const isPeerValid = peerSampleSize >= minRequiredSample;

    const peerDist = computeDistribution(peerSampleScores);

    // Dimension level comparison
    const dimRes = await query(
      `SELECT code, name FROM domains 
       WHERE methodology_version_id = (SELECT methodology_version_id FROM assessments WHERE id = $1)
       ORDER BY sort_order ASC`,
      [assessmentId]
    );

    const dimensionBenchmarks: DimensionBenchmark[] = dimRes.rows.map((d) => {
      const code = d.code;
      const instScore = latestRun?.dimensionScores[code] ?? 0;
      if (!isPeerValid) {
        return {
          dimensionCode: code,
          dimensionName: d.name,
          institutionScore: instScore,
          peerMedian: null,
          peerP25: null,
          peerP75: null,
          deltaToMedian: null,
          comparativeStanding: 'BASELINE_ONLY',
        };
      }

      const dimScoresForPeers: number[] = [];
      for (const s of peerRows) {
        const dJson = s.dimension_scores_json || {};
        if (dJson[code] !== undefined) dimScoresForPeers.push(Number(dJson[code]));
      }
      const dDist = computeDistribution(dimScoresForPeers);
      const delta = Number((instScore - dDist.median).toFixed(1));
      const standing: 'ABOVE_PEER_MEDIAN' | 'AT_PEER_MEDIAN' | 'BELOW_PEER_MEDIAN' =
        delta > 2 ? 'ABOVE_PEER_MEDIAN' : delta < -2 ? 'BELOW_PEER_MEDIAN' : 'AT_PEER_MEDIAN';

      return {
        dimensionCode: code,
        dimensionName: d.name,
        institutionScore: instScore,
        peerMedian: dDist.median,
        peerP25: dDist.p25,
        peerP75: dDist.p75,
        deltaToMedian: delta,
        comparativeStanding: standing,
      };
    });

    return {
      productCode,
      assessmentId,
      institutionId: assessment.institution_id,
      institutionName: assessment.institution_name,
      overallScore,
      maturityBand,
      level1Baseline: {
        currentVersion: history.length,
        history,
        longitudinalDelta,
      },
      level2PeerBenchmark: {
        peerGroupId: peerGroup?.id || null,
        peerGroupCode: peerGroup?.code || 'PEER-GENERAL',
        peerGroupName: peerGroup?.name || 'Higher Education Benchmark Peer Group',
        sampleSize: peerSampleSize,
        minRequiredSample,
        isStatisticallyValid: isPeerValid,
        status: isPeerValid ? 'STATISTICALLY_VALID' : 'DATASET_GROWING',
        peerMedianOverall: isPeerValid ? peerDist.median : null,
        deltaToPeerMedian: isPeerValid ? Number((overallScore - peerDist.median).toFixed(1)) : null,
        dimensionBenchmarks,
      },
      level4SectorBenchmark: {
        totalSectorInstitutions,
        minRequiredSample,
        isStatisticallyValid: isSectorValid,
        status: isSectorValid ? 'STATISTICALLY_VALID' : 'DATASET_GROWING',
        sectorMedianOverall: isSectorValid ? sectorDist.median : null,
      },
      governanceNote:
        'Zero Fake Rankings Guarantee: Benchmark reference points are strictly activated when peer samples satisfy statistical validity thresholds (N >= 10). Assessment scores represent absolute institutional maturity baselines and are never altered by comparative layers.',
    };
  }
}
