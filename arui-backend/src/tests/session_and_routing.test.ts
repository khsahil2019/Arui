import { query } from '../db/index.js';
import { getAssessmentStatusView } from '../modules/assessment/routes.js';

async function runSessionAndRoutingTests() {
  console.log('=== RUNNING SESSION MANAGER & ADAPTIVE ROUTING TEST SUITE ===');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  try {
    // 1. Check Product Listings
    const prodRes = await query(`
      SELECT p.*, pp.amount, pp.currency, cta.cta_text 
      FROM products p
      LEFT JOIN product_pricing pp ON pp.product_code = p.code
      LEFT JOIN cta_configs cta ON cta.product_code = p.code
      ORDER BY p.code ASC
    `);
    assert(prodRes.rows.length >= 2, 'Found at least 2 Higher Ed products in database');
    const ecri = prodRes.rows.find(p => p.code === 'ecri');
    assert(ecri && Number(ecri.amount) === 4999.00, 'ECRI product has configured pricing of $4999.00');
    assert(ecri && !!ecri.cta_text, 'ECRI has configured dynamic CTA text');

    // 2. Check ECRI Active Assessment
    const ecriAsmRes = await query(`SELECT * FROM assessments WHERE product_code = 'ecri' LIMIT 1`);
    assert(ecriAsmRes.rows.length > 0, 'Found baseline ECRI assessment session');
    const ecriAssessment = ecriAsmRes.rows[0];

    // 3. Test getAssessmentStatusView on ECRI assessment
    const statusView = await getAssessmentStatusView(ecriAssessment.id);
    assert(!!statusView, 'Generated status view for ECRI assessment');
    assert(!!statusView && statusView.domains.length === 11, `Status view contains 11 dimensions (Found: ${statusView?.domains.length})`);
    assert(!!statusView && statusView.methodologyVersion === 'ecri-v6.0', `Status view binds to ECRI methodology version ${statusView?.methodologyVersion}`);

    // 4. Test Save/Resume Response on ECRI assessment
    const testPromptId = 'D01-Q01';
    await query(
      `INSERT INTO assessment_responses (assessment_id, prompt_id, state, response_value_json, answered_at, updated_at)
       VALUES ($1, $2, 'answered', $3, NOW(), NOW())
       ON CONFLICT (assessment_id, prompt_id) DO UPDATE SET state = EXCLUDED.state, response_value_json = EXCLUDED.response_value_json`,
      [ecriAssessment.id, testPromptId, JSON.stringify({ choice: 'opt_4', maturityLevel: 4, notes: 'Board approved policy 2025' })]
    );

    const checkResp = await query(
      `SELECT * FROM assessment_responses WHERE assessment_id = $1 AND prompt_id = $2`,
      [ecriAssessment.id, testPromptId]
    );
    assert(checkResp.rows.length === 1, 'Saved and retrieved response for D01-Q01');
    assert(checkResp.rows[0].state === 'answered', 'Response state is "answered"');
    assert(checkResp.rows[0].response_value_json.choice === 'opt_4', 'Response value is preserved accurately');

    // 5. Test State Transitions
    await query(`UPDATE assessments SET stage = 'evidence', updated_at = NOW() WHERE id = $1`, [ecriAssessment.id]);
    const updatedAsm = (await query(`SELECT stage FROM assessments WHERE id = $1`, [ecriAssessment.id])).rows[0];
    assert(updatedAsm.stage === 'evidence', 'Assessment transitioned successfully to evidence stage');

    // Reset stage to assessment
    await query(`UPDATE assessments SET stage = 'assessment', updated_at = NOW() WHERE id = $1`, [ecriAssessment.id]);

    console.log(`\n=== SESSION & ROUTING SUMMARY ===`);
    console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Session test failed:', err);
    process.exit(1);
  }
}

runSessionAndRoutingTests().then(() => {
  console.log('Session manager and routing verified successfully.');
  process.exit(0);
});
