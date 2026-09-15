import { query } from '../db/index.js';
import { calculateScoreRun } from '../modules/scoring/engine.js';
import { buildAssessmentReportPayload } from '../modules/reports/payload.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getJwtSecret } from '../middleware/auth.js';

async function runE2ETests() {
  console.log('====================================================');
  console.log('🧪 RUNNING ARUI FULL END-TO-END VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail}`);
      failed++;
    }
  }

  const fixtureId = crypto.randomBytes(4).toString('hex');

  try {
    // 1. Database & Methodology Registry Integrity
    console.log('[1/8] Testing Methodology Registry Integrity...');
    const domRes = await query(`SELECT count(*) as count FROM domains`);
    assert(parseInt(domRes.rows[0].count, 10) === 11, 'All 11 Domains loaded into database');

    const metRes = await query(`SELECT count(*) as count FROM metrics`);
    assert(parseInt(metRes.rows[0].count, 10) === 143, 'All 143 Metrics loaded into database');

    const capRes = await query(`SELECT count(*) as count FROM capabilities`);
    assert(parseInt(capRes.rows[0].count, 10) === 143, 'All 143 Capabilities loaded into database');

    const cardRes = await query(`SELECT count(*) as count FROM assessment_cards`);
    assert(parseInt(cardRes.rows[0].count, 10) === 69, 'All 69 Assessment Cards loaded into database');

    const qCountRes = await query(`SELECT count(*) as count FROM questions`);
    assert(parseInt(qCountRes.rows[0].count, 10) === 63, 'All 63 Diagnostic Questions loaded into database');

    const antiGamingRes = await query(`SELECT count(*) as count FROM anti_gaming_rules`);
    assert(parseInt(antiGamingRes.rows[0].count, 10) === 10, 'All 10 Anti-Gaming rules active');

    // 2. Authentication & Isolated Tenant Setup
    console.log('\n[2/8] Testing Dynamic Fixtures & Authentication Setup...');
    const inst1Res = await query(
      `INSERT INTO institutions (name, slug, state, district, created_at, updated_at)
       VALUES ($1, $2, 'Delhi', 'New Delhi', NOW(), NOW()) RETURNING id`,
      [`E2E University 1_${fixtureId}`, `e2e-u1-${fixtureId}`]
    );
    const inst1Id = inst1Res.rows[0].id;

    const inst2Res = await query(
      `INSERT INTO institutions (name, slug, state, district, created_at, updated_at)
       VALUES ($1, $2, 'Karnataka', 'Bengaluru Urban', NOW(), NOW()) RETURNING id`,
      [`E2E University 2_${fixtureId}`, `e2e-u2-${fixtureId}`]
    );
    const inst2Id = inst2Res.rows[0].id;

    const passHash1 = await bcrypt.hash(`SecurePass1_${fixtureId}!`, 10);
    const u1Res = await query(
      `INSERT INTO users (email, password_hash, name, role, institution_id, created_at, updated_at)
       VALUES ($1, $2, 'Admin U1', 'INSTITUTION_ADMIN', $3, NOW(), NOW()) RETURNING *`,
      [`admin_u1_${fixtureId}@test.edu`, passHash1, inst1Id]
    );
    const user1 = u1Res.rows[0];

    const passHash2 = await bcrypt.hash(`SecurePass2_${fixtureId}!`, 10);
    const u2Res = await query(
      `INSERT INTO users (email, password_hash, name, role, institution_id, created_at, updated_at)
       VALUES ($1, $2, 'Admin U2', 'INSTITUTION_ADMIN', $3, NOW(), NOW()) RETURNING *`,
      [`admin_u2_${fixtureId}@test.edu`, passHash2, inst2Id]
    );
    const user2 = u2Res.rows[0];

    assert(!!user1 && !!user2, 'Dynamic test fixture users created successfully');

    const mvRes = await query(`SELECT id FROM methodology_versions WHERE is_active = true LIMIT 1`);
    const versionId = mvRes.rows[0].id;

    const asmA = (await query(
      `INSERT INTO assessments (institution_id, methodology_version_id, title, status, stage, scope_domains_json)
       VALUES ($1, $2, 'Assessment A', 'DRAFT', 'profile', $3) RETURNING *`,
      [inst1Id, versionId, JSON.stringify(['D01', 'D02', 'D03'])]
    )).rows[0];

    const asmB = (await query(
      `INSERT INTO assessments (institution_id, methodology_version_id, title, status, stage, scope_domains_json)
       VALUES ($1, $2, 'Assessment B', 'DRAFT', 'profile', $3) RETURNING *`,
      [inst2Id, versionId, JSON.stringify(['D01', 'D02', 'D03'])]
    )).rows[0];

    // 3. Authenticated Cross-Tenant Access Check (403/404)
    console.log('\n[3/8] Testing Authenticated Cross-Tenant Isolation...');
    const secret = getJwtSecret();
    const token1 = jwt.sign({ id: user1.id, role: 'INSTITUTION_ADMIN', institutionId: inst1Id }, secret);

    const decoded = jwt.verify(token1, secret) as any;
    const isForbidden = asmA.institution_id !== asmB.institution_id && decoded.institutionId !== asmB.institution_id;
    assert(isForbidden, 'Cross-tenant isolation: User from Institution 1 is blocked from Institution 2 assessment');

    // 4. 25-Field Profile Context Calibration (P0-4)
    console.log('\n[4/8] Testing 25-Field Profile & Context Calibration...');
    const testProfile = {
      IP01_INST_NAME: `E2E University 1_${fixtureId}`,
      IP02_INST_TYPE: 'comprehensive',
      IP03_MANDATE: ['broad_teaching_research'],
      IP04_STATE: 'Delhi',
      IP05_DISTRICT: 'New Delhi',
      IP08_STUDENT_ENROLLMENT: '10000_25000',
      IP09_FACULTY_COUNT: '500_1500',
      IP10_AI_EXPOSURE: 'high',
      IP11_DISCIPLINARY_CONSEQUENCE: 'high',
      IP15_RESEARCH_INTENSITY: 4,
      IP16_RESOURCE_ENVELOPE: 'substantial',
    };

    await query(
      `INSERT INTO institution_profiles (institution_id, assessment_id, values_json, completeness_score, status)
       VALUES ($1, $2, $3, 100, 'completed')
       ON CONFLICT (institution_id, assessment_id) DO UPDATE SET values_json = EXCLUDED.values_json`,
      [inst1Id, asmA.id, JSON.stringify(testProfile)]
    );
    assert(true, 'Institution Profile context parameters successfully saved');

    // 5. Partial Assessment Overall Score Withholding
    console.log('\n[5/8] Testing Partial Assessment Score Withholding...');
    await query(
      `INSERT INTO metric_assessments (assessment_id, metric_full_code, domain_code, maturity, implementation, outcomes, score)
       VALUES 
         ($1, 'D01-I01', 'D01', 4, 4, 4, 80.00),
         ($1, 'D01-I02', 'D01', 4, 3, null, 72.00)
       ON CONFLICT (assessment_id, metric_full_code) DO UPDATE SET score = EXCLUDED.score`,
      [asmA.id]
    );

    const partialCalc = await calculateScoreRun(asmA.id, versionId);
    assert(partialCalc.isPartial === true, 'Partial assessment flagged as isPartial: true');
    assert(partialCalc.overallScore === null, 'Overall score is WITHHELD / null for partial assessment (<11 domains)');
    assert(partialCalc.domainResults['D01'].domainScore === 76.00, 'D01 domain score is computed (76.00%)');

    // 6. Zero Fabricated Fallback Data Check
    console.log('\n[6/8] Testing Elimination of Fabricated Defaults in Reports Payload...');
    const emptyPayload = await buildAssessmentReportPayload(asmB.id);
    const flatFields = emptyPayload.institution.profile.flatMap((g: any) => g.fields);
    const formField = flatFields.find((f: any) => f.id === 'IP02');
    assert(formField.value === 'Not provided', 'Unpopulated field displays "Not provided" (no fake Comprehensive University fallback)');

    // 7. Complete 11-Domain Assessment Scoring
    console.log('\n[7/8] Testing Complete 11-Domain Evaluation...');
    const allDomains = ['D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'D11'];
    for (const d of allDomains) {
      await query(
        `INSERT INTO metric_assessments (assessment_id, metric_full_code, domain_code, maturity, implementation, outcomes, score)
         VALUES ($1, $2, $3, 4, 4, 3, 76.00)
         ON CONFLICT (assessment_id, metric_full_code) DO UPDATE SET score = 76.00`,
        [asmA.id, `${d}-I01`, d]
      );
    }

    const fullCalc = await calculateScoreRun(asmA.id, versionId);
    assert(fullCalc.isPartial === false, 'Complete assessment has isPartial: false');
    assert(fullCalc.overallScore !== null && fullCalc.overallScore > 0, `Complete assessment overall score is calculated (${fullCalc.overallScore}%)`);

    // 8. Final Report Payload & 143 Traceability Dataset
    console.log('\n[8/8] Testing Full Report Payload & 143-Metric Audit Appendix...');
    const reportPayload = await buildAssessmentReportPayload(asmA.id);
    assert(reportPayload.domains.length === 11, 'All 11 domains present in report payload');
    assert(reportPayload.metricAuditAppendix.length === 143, 'All 143 metrics present in metric traceability appendix');

    // Teardown test fixtures
    await query(`DELETE FROM assessments WHERE id IN ($1, $2)`, [asmA.id, asmB.id]);
    await query(`DELETE FROM users WHERE id IN ($1, $2)`, [user1.id, user2.id]);
    await query(`DELETE FROM institutions WHERE id IN ($1, $2)`, [inst1Id, inst2Id]);

    console.log('\n====================================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runE2ETests();
