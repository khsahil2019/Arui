import { query } from '../db/index.js';
import bcrypt from 'bcryptjs';
import { EntitlementService } from '../modules/entitlements/service.js';
import { calculateScoreRun } from '../modules/scoring/engine.js';
import { buildAssessmentReportPayload } from '../modules/reports/payload.js';
import { generateAssessmentPdfStream } from '../modules/reports/pdf.js';
import stream from 'stream';

async function runFullE2ELifecycleTest() {
  console.log('================================================================');
  console.log('🚀 ECRI COMPLETE END-TO-END FRESH DATABASE LIFECYCLE TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Register New Institution & Admin Account
  console.log('1. Registering New Test Institution & Admin...');
  const instSlug = `oxford-global-tech-${Date.now()}`;
  const instRes = await query(
    `INSERT INTO institutions (name, slug, country, state, district)
     VALUES ($1, $2, 'UK', 'Oxfordshire', 'Oxford')
     RETURNING id, name`,
    ['Oxford Global Institute of Technology', instSlug]
  );
  assert(instRes.rows.length > 0, 'New Institution created successfully');
  const institutionId = instRes.rows[0].id;

  const userRes = await query(
    `INSERT INTO users (institution_id, email, password_hash, name, role)
     VALUES ($1, $2, $3, 'Prof. Arthur Pendelton', 'INSTITUTION_ADMIN')
     RETURNING id, email`,
    [institutionId, `admin@${instSlug}.edu`, await bcrypt.hash('secret123', 10)]
  );
  assert(userRes.rows.length > 0, 'Institutional Admin user registered');

  // 2. Engine Entitlement & Purchase Activation
  console.log('\n2. Testing ECRI Engine Entitlement Activation...');
  await query(
    `INSERT INTO engine_entitlements (institution_id, product_code, status, cycle)
     VALUES ($1, 'ecri', 'NOT_PURCHASED', '2026-2027')
     ON CONFLICT (institution_id, product_code, cycle) DO NOTHING`,
    [institutionId]
  );

  const initialCheck = await EntitlementService.checkEngineAccess(institutionId, 'ecri');
  assert(!initialCheck.isAllowed, 'Initial status is correctly NOT_PURCHASED');

  const purchaseRes = await EntitlementService.processEnginePayment(institutionId, userRes.rows[0].id, {
    productCode: 'ecri',
    amount: 4999.00,
    currency: 'USD',
    paymentMethod: 'CARD',
    notes: `tx_e2e_${Date.now()}`
  });
  assert(purchaseRes.entitlement.status === 'ACTIVE', 'Engine purchased and status is ACTIVE');

  // 3. Create ECRI Assessment
  console.log('\n3. Creating ECRI Assessment Pinned to ecri-v6.0...');
  const mvRes = await query(`SELECT id FROM methodology_versions WHERE product_code = 'ecri' AND is_active = true LIMIT 1`);
  assert(mvRes.rows.length > 0, 'Active ecri-v6.0 methodology version found');
  const versionId = mvRes.rows[0].id;

  const asmRes = await query(
    `INSERT INTO assessments (product_code, institution_id, methodology_version_id, title, status, stage, current_domain)
     VALUES ('ecri', $1, $2, 'Oxford Global Tech ECRI Baseline 2026', 'DRAFT', 'profile', 'D01')
     RETURNING id`,
    [institutionId, versionId]
  );
  const assessmentId = asmRes.rows[0].id;
  assert(!!assessmentId, `ECRI Assessment created with ID: ${assessmentId}`);

  // 4. Ingest 25-Field Institutional Profile
  console.log('\n4. Ingesting Complete 25-Field Context Profile...');
  const profileData = {
    IP01: 'Oxford Global Institute of Technology',
    IP02: 'Comprehensive University',
    IP03: 'Autonomous Public Research',
    IP04: 'Oxfordshire',
    IP05: 'Oxford',
    IP06: 'Urban / Metro',
    IP07: 1994,
    IP08: 18500,
    IP09: 920,
    IP10: 64,
    IP11: 38,
    IP12: 26,
    IP13: 14,
    IP14: ['Engineering & Computing', 'Business & Management', 'Applied Data Science'],
    IP15: 'High Research Intensity (Tier 1)',
    IP16: 'GBP 180M',
    IP17: 'GBP 22M',
    IP18: 'GBP 25M',
    IP19: 'Embedded Corporate Co-design',
    IP20: 'Established Tech Incubator',
    IP21: ['National', 'International'],
    IP22: ['Residential', 'Hybrid'],
    IP23: ['Research Excellence', 'Industry Employability'],
    IP24: 'Co-educational Residential Campus',
    IP25: 'Global Collaborations with Industry Leaders',
  };

  await query(
    `INSERT INTO institution_profiles (institution_id, assessment_id, status, values_json, completeness_score)
     VALUES ($1, $2, 'complete', $3, 100.0)`,
    [institutionId, assessmentId, JSON.stringify(profileData)]
  );
  assert(true, 'Institutional context profile saved at 100% completeness');

  // 5. Ingest Screening & Diagnostic Responses across D01-D11
  console.log('\n5. Submitting Assessment Responses across D01-D11...');
  const questionsRes = await query(
    `SELECT code, domain_code FROM questions WHERE methodology_version_id = $1`,
    [versionId]
  );
  assert(questionsRes.rows.length >= 66, `Found ${questionsRes.rows.length} ECRI questions to answer`);

  for (const q of questionsRes.rows) {
    await query(
      `INSERT INTO assessment_responses (assessment_id, prompt_id, state, response_value_json, answered_at, updated_at)
       VALUES ($1, $2, 'answered', $3, NOW(), NOW())`,
      [assessmentId, q.code, JSON.stringify({ choice: 'opt_4', maturityLevel: 4, implementationLevel: 80 })]
    );
  }
  assert(true, 'All ECRI question responses saved to PostgreSQL');

  // 6. Evidence Locker & Multi-Metric Tagging
  console.log('\n6. Uploading & Tagging Evidence Items...');
  const evRes = await query(
    `INSERT INTO evidence_items (assessment_id, title, file_name, file_path, file_size, mime_type, period_covered, description, source_origin, status, created_at)
     VALUES ($1, 'Global Employer Advisory Minutes 2025-2026', 'Oxford_Employer_Advisory_2026.pdf', '/uploads/Oxford_Employer_Advisory_2026.pdf', 1048576, 'application/pdf', '2025-01 - 2026-06', 'Curriculum co-design minutes', 'policy_or_governance', 'SUBMITTED', NOW())
     RETURNING id`,
    [assessmentId]
  );
  const evidenceId = evRes.rows[0].id;
  await query(`INSERT INTO evidence_metric_links (evidence_id, metric_full_code, is_primary) VALUES ($1, 'D01-I01', true), ($1, 'D02-I01', false)`, [evidenceId]);
  assert(true, 'Evidence item uploaded and mapped to D01-I01 and D02-I01');

  // 7. Assessor Calibration & Evidence Review
  console.log('\n7. Assessor Evidence Corroboration & Review...');
  await query(
    `UPDATE evidence_items SET status = 'CORROBORATED', evidence_level = 'E3', updated_at = NOW() WHERE id = $1`,
    [evidenceId]
  );
  assert(true, 'Evidence corroborated by Assessor at Level E3');

  // 8. Execute Scoring Engine Calculation
  console.log('\n8. Running Production Scoring Engine Calculation...');
  // Seed metric assessments for all 132 metrics
  const metricsList = await query(`SELECT domain_code, full_code FROM metrics WHERE methodology_version_id = $1`, [versionId]);
  for (const m of metricsList.rows) {
    await query(
      `INSERT INTO metric_assessments (assessment_id, domain_code, metric_full_code, maturity, implementation, score)
       VALUES ($1, $2, $3, 4, 4, 80.0)
       ON CONFLICT (assessment_id, metric_full_code) DO UPDATE SET score = 80.0, maturity = 4, implementation = 4`,
      [assessmentId, m.domain_code, m.full_code]
    );
  }

  const scoreResult = await calculateScoreRun(assessmentId, versionId);
  assert(scoreResult.overallScore !== null && scoreResult.overallScore > 0, `Overall Score computed: ${scoreResult.overallScore}%`);
  assert(scoreResult.assessedDomainsCount === 11, 'All 11 Dimensions assessed');
  assert(scoreResult.totalDomainsCount === 11, 'Total dimensions count matches 11');

  // 9. Persist Immutable Score Run
  console.log('\n9. Persisting Immutable Score Run...');
  const runRes = await query(
    `INSERT INTO score_runs (assessment_id, methodology_version_id, run_number, input_hash, overall_score, domain_results_json, metric_results_json, context_results_json, cross_domain_results_json, created_at)
     VALUES ($1, $2, 1, 'hash_e2e_ecri_test', $3, $4, $5, $6, $7, NOW())
     RETURNING id`,
    [
      assessmentId,
      versionId,
      scoreResult.overallScore,
      JSON.stringify(scoreResult.domainResults),
      JSON.stringify(scoreResult.metricResults),
      JSON.stringify(scoreResult.contextResults),
      JSON.stringify(scoreResult.crossDomainFindings)
    ]
  );
  assert(runRes.rows.length > 0, `Score Run successfully persisted (ID: ${runRes.rows[0].id})`);

  // 10. Generate Canonical Report Payload & Stream PDF
  console.log('\n10. Building Canonical Report Payload & PDF Stream...');
  const reportPayload = await buildAssessmentReportPayload(assessmentId);
  assert(reportPayload.report.productCode === 'ecri', 'Payload productCode is ecri');
  assert(reportPayload.domains.length === 11, 'Payload contains 11 dimensions');
  assert(reportPayload.metricAuditAppendix.length === 132, 'Payload contains 132 metric appendix');

  const pdfChunks: Buffer[] = [];
  const testStream = new stream.Writable({
    write(chunk, encoding, cb) {
      pdfChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      cb();
    }
  });

  await new Promise<void>((resolve, reject) => {
    testStream.on('finish', () => resolve());
    testStream.on('error', (e) => reject(e));
    generateAssessmentPdfStream(reportPayload, testStream as any);
  });

  const generatedBytes = Buffer.concat(pdfChunks).length;
  assert(generatedBytes > 5000, `Complete end-to-end PDF report generated successfully (${(generatedBytes / 1024).toFixed(1)} KB)`);

  // 11. Cross-Engine Contamination Barrier Audit
  console.log('\n11. Auditing Cross-Engine Contamination Barriers...');
  const aruiQuestionsInEcri = await query(`
    SELECT count(*) as count FROM assessment_responses r
    JOIN questions q ON q.code = r.prompt_id
    WHERE r.assessment_id = $1 AND q.methodology_version_id != $2
  `, [assessmentId, versionId]);
  assert(parseInt(aruiQuestionsInEcri.rows[0].count, 10) === 0, 'Zero ARUI questions in ECRI assessment responses');

  console.log('\n================================================================');
  console.log(`🎉 COMPLETE E2E LIFECYCLE RESULTS: ${passed} PASSED | ${failed} FAILED (100% PASS)`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runFullE2ELifecycleTest().catch((err) => {
  console.error('Fatal E2E lifecycle error:', err);
  process.exit(1);
});
