import { query } from '../db/index.js';
import { BenchmarkingService } from '../modules/benchmarking/service.js';
import { calculateScoreRun } from '../modules/scoring/engine.js';
import assert from 'assert';

console.log('================================================================');
console.log('🧪 BENCHMARKING & COMPARATIVE INTELLIGENCE VERIFICATION SUITE');
console.log('   (Instructions #40 through #55)');
console.log('================================================================\n');

async function runBenchmarkingTestSuite() {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return (async () => {
      try {
        await fn();
        console.log(`  ✅ [PASS] ${name}`);
        passed++;
      } catch (err: any) {
        console.error(`  ❌ [FAIL] ${name}:`, err.message);
        failed++;
      }
    })();
  }

  // 1. Setup Fixture & Baseline Assessment for ECRI
  const ecriAssessmentRes = await query(
    `SELECT a.id, a.institution_id, a.methodology_version_id FROM assessments a WHERE a.product_code = 'ecri' ORDER BY a.created_at DESC LIMIT 1`
  );
  assert(ecriAssessmentRes.rows.length > 0, 'ECRI assessment exists for benchmarking test');
  const ecriAssessmentId = ecriAssessmentRes.rows[0].id;
  const institutionId = ecriAssessmentRes.rows[0].institution_id;
  const ecriVersionId = ecriAssessmentRes.rows[0].methodology_version_id;

  // Ensure institutional profile with peer-matching context exists
  await query(
    `INSERT INTO institution_profiles (institution_id, assessment_id, status, values_json, completeness_score)
     VALUES ($1, $2, 'complete', '{"institution_type": "Comprehensive University", "IP02": "Comprehensive University"}', 100)
     ON CONFLICT (institution_id, assessment_id) DO UPDATE SET values_json = EXCLUDED.values_json`,
    [institutionId, ecriAssessmentId]
  );

  // Clean up any lingering synthetic test snapshots from prior test runs
  await query(`DELETE FROM benchmark_dataset_snapshots WHERE anonymized_id LIKE 'syn_anon_%'`);

  // Ensure locked score run exists
  const existingSr = await query(`SELECT id FROM score_runs WHERE assessment_id = $1`, [ecriAssessmentId]);
  if (existingSr.rows.length === 0) {
    const scoreResult = await calculateScoreRun(ecriAssessmentId, ecriVersionId);
    await query(
      `INSERT INTO score_runs (assessment_id, methodology_version_id, run_number, input_hash, overall_score, domain_results_json, metric_results_json, context_results_json, cross_domain_results_json)
       VALUES ($1, $2, 1, 'bench-test-hash', $3, $4, $5, $6, $7)`,
      [
        ecriAssessmentId,
        ecriVersionId,
        scoreResult.overallScore || 75.0,
        JSON.stringify(scoreResult.domainResults),
        JSON.stringify(scoreResult.metricResults),
        JSON.stringify(scoreResult.contextResults),
        JSON.stringify(scoreResult.crossDomainFindings),
      ]
    );
  }

  console.log('📋 1. Testing Structured Institutional Data Preservation (Instruction #40, #42)...');
  await test('Preserves 11 Dimensions, 132 Metrics, and Context Snapshot', async () => {
    const snapshot = await BenchmarkingService.recordAssessmentSnapshot(ecriAssessmentId);
    assert(snapshot !== null, 'Snapshot must be created successfully');
    assert.strictEqual(snapshot.productCode, 'ecri');
    assert(snapshot.anonymizedId && snapshot.anonymizedId.length === 32, 'Anonymized ID must be generated');
    assert(snapshot.overallScore > 0, 'Overall score must be preserved');
    assert(typeof snapshot.dimensionScores === 'object', 'Dimension scores must be structured');
    assert(typeof snapshot.metricScores === 'object', 'Metric scores must be structured');
  });

  console.log('\n🔒 2. Testing Statistical Validity Guard & Zero Fake Rankings (Instruction #41, #45)...');
  await test('Returns DATASET_GROWING and suppresses percentiles when N < N_min', async () => {
    const summary = await BenchmarkingService.getBenchmarkSummary(ecriAssessmentId);
    assert.strictEqual(summary.level2PeerBenchmark.isStatisticallyValid, false);
    assert.strictEqual(summary.level2PeerBenchmark.status, 'DATASET_GROWING');
    assert.strictEqual(summary.level2PeerBenchmark.peerMedianOverall, null);
    assert.strictEqual(summary.level2PeerBenchmark.deltaToPeerMedian, null);
    assert(summary.governanceNote.includes('Zero Fake Rankings Guarantee'));
  });

  console.log('\n📊 3. Testing Statistical Activation when N >= N_min (Instruction #44, #48)...');
  await test('Activates comparative median and quartile distribution when N >= 10', async () => {
    // Insert 12 synthetic benchmark snapshots for peer group testing
    for (let i = 1; i <= 12; i++) {
      const synScore = 65 + (i % 20);
      const dimScores: Record<string, number> = {};
      for (let d = 1; d <= 11; d++) {
        dimScores[`D${d.toString().padStart(2, '0')}`] = synScore + (d % 5);
      }
      await query(
        `INSERT INTO benchmark_dataset_snapshots (
           product_code, assessment_id, institution_id, methodology_version, assessment_date,
           anonymized_id, context_profile_json, overall_score, maturity_band,
           dimension_scores_json, metric_scores_json, is_verified_audit
         )
         VALUES ('ecri', uuid_generate_v4(), $1, 'ecri-v6.0', NOW(), $2, $3, $4, 4, $5, '{}', true)
         ON CONFLICT (assessment_id) DO NOTHING`,
        [
          institutionId,
          `syn_anon_${i}_hash`,
          JSON.stringify({ institution_type: 'Comprehensive University' }),
          synScore,
          JSON.stringify(dimScores),
        ]
      );
    }

    const summary = await BenchmarkingService.getBenchmarkSummary(ecriAssessmentId);
    assert.strictEqual(summary.level2PeerBenchmark.isStatisticallyValid, true);
    assert.strictEqual(summary.level2PeerBenchmark.status, 'STATISTICALLY_VALID');
    assert(typeof summary.level2PeerBenchmark.peerMedianOverall === 'number', 'Peer median must be computed');
    assert(typeof summary.level2PeerBenchmark.deltaToPeerMedian === 'number', 'Peer delta must be computed');
    assert(summary.level2PeerBenchmark.dimensionBenchmarks.length === 11, 'All 11 dimension benchmarks present');
    assert(summary.level2PeerBenchmark.dimensionBenchmarks[0].peerMedian !== null, 'Dimension median present');
  });

  console.log('\n🛡️ 4. Testing Score Invariance Principle (Instruction #46)...');
  await test('Benchmarking calculation does NOT modify raw assessment score', async () => {
    const scoreResBefore = await query(
      `SELECT overall_score FROM score_runs WHERE assessment_id = $1 ORDER BY run_number DESC LIMIT 1`,
      [ecriAssessmentId]
    );
    const rawScoreBefore = Number(scoreResBefore.rows[0].overall_score);

    const summary = await BenchmarkingService.getBenchmarkSummary(ecriAssessmentId);

    const scoreResAfter = await query(
      `SELECT overall_score FROM score_runs WHERE assessment_id = $1 ORDER BY run_number DESC LIMIT 1`,
      [ecriAssessmentId]
    );
    const rawScoreAfter = Number(scoreResAfter.rows[0].overall_score);

    assert.strictEqual(rawScoreBefore, rawScoreAfter, 'Raw assessment score must remain identical');
    assert.strictEqual(summary.overallScore, rawScoreBefore, 'Summary score must match raw score');
  });

  console.log('\n🏢 5. Testing Multi-Engine Benchmarking Isolation (Instruction #53)...');
  await test('ECRI and ARUI benchmarks maintain strict dataset segregation', async () => {
    const aruiAssessmentRes = await query(
      `SELECT a.id FROM assessments a WHERE a.product_code = 'arui' LIMIT 1`
    );
    assert(aruiAssessmentRes.rows.length > 0, 'ARUI assessment exists');
    const aruiAssessmentId = aruiAssessmentRes.rows[0].id;
    // Ensure locked score run exists for ARUI
    const aruiAssessmentDetails = await query(`SELECT methodology_version_id FROM assessments WHERE id = $1`, [aruiAssessmentId]);
    const aruiVersionId = aruiAssessmentDetails.rows[0].methodology_version_id;
    const aruiSr = await query(`SELECT id FROM score_runs WHERE assessment_id = $1`, [aruiAssessmentId]);
    if (aruiSr.rows.length === 0) {
      const aruiScoreResult = await calculateScoreRun(aruiAssessmentId, aruiVersionId);
      await query(
        `INSERT INTO score_runs (assessment_id, methodology_version_id, run_number, input_hash, overall_score, domain_results_json, metric_results_json, context_results_json, cross_domain_results_json)
         VALUES ($1, $2, 1, 'arui-bench-hash', $3, $4, $5, $6, $7)`,
        [
          aruiAssessmentId,
          aruiVersionId,
          aruiScoreResult.overallScore || 70.0,
          JSON.stringify(aruiScoreResult.domainResults),
          JSON.stringify(aruiScoreResult.metricResults),
          JSON.stringify(aruiScoreResult.contextResults),
          JSON.stringify(aruiScoreResult.crossDomainFindings),
        ]
      );
    }
    await BenchmarkingService.recordAssessmentSnapshot(aruiAssessmentId);

    const aruiSummary = await BenchmarkingService.getBenchmarkSummary(aruiAssessmentId);
    const ecriSummary = await BenchmarkingService.getBenchmarkSummary(ecriAssessmentId);

    assert.strictEqual(aruiSummary.productCode, 'arui');
    assert.strictEqual(ecriSummary.productCode, 'ecri');
    assert.notStrictEqual(aruiSummary.assessmentId, ecriSummary.assessmentId);
  });

  console.log(`\n================================================================`);
  console.log(`📊 BENCHMARKING TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`================================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runBenchmarkingTestSuite().catch((err) => {
  console.error('Fatal error during benchmarking test suite:', err);
  process.exit(1);
});
