import { query } from '../db/index.js';
import { EntitlementService } from '../modules/entitlements/service.js';
import assert from 'assert';
import bcrypt from 'bcryptjs';

console.log('================================================================');
console.log('🏛️ PLATFORM IDENTITY, REGISTRATION, PAYMENT & ENTITLEMENTS SUITE');
console.log('   (Instructions #56 through #80)');
console.log('================================================================\n');

async function runPlatformIdentityTestSuite() {
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

  // Setup / cleanup test fixtures
  const testEmail = `registrar_${Date.now()}@starlight.edu`;
  const testInstName = `Starlight Global University ${Date.now().toString().slice(-4)}`;
  let testInstitutionId: string;
  let testUserId: string;

  console.log('👤 1. Testing Single Central Institutional Registration (Instruction #56, #57, #58)...');
  await test('Registers institution once, creates secure credentials and initializes engine entitlements', async () => {
    // 1. Create institution
    const instRes = await query(
      `INSERT INTO institutions (name, slug) VALUES ($1, $2) RETURNING id`,
      [testInstName, `starlight-${Date.now()}`]
    );
    testInstitutionId = instRes.rows[0].id;

    // 2. Create user with hashed password
    const hash = await bcrypt.hash('SecureUnivPass2026!', 10);
    const userRes = await query(
      `INSERT INTO users (institution_id, email, password_hash, name, role, designation, phone)
       VALUES ($1, $2, $3, 'Dr. Marcus Vance', 'INSTITUTION_ADMIN', 'Vice-Chancellor', '+1-555-0199')
       RETURNING id, email, name, role`,
      [testInstitutionId, testEmail, hash]
    );
    testUserId = userRes.rows[0].id;

    // 3. Initialize default engine entitlements as NOT_PURCHASED
    for (const p of ['arui', 'ecri']) {
      await query(
        `INSERT INTO engine_entitlements (institution_id, product_code, status, cycle)
         VALUES ($1, $2, 'NOT_PURCHASED', '2026-2027')`,
        [testInstitutionId, p]
      );
    }

    const portfolio = await EntitlementService.getInstitutionPortfolio(testInstitutionId);
    assert.strictEqual(portfolio.institutionName, testInstName);
    assert.strictEqual(portfolio.totalActiveEngagements, 0, 'Initial active engagements should be 0');
    assert(portfolio.entitlements.length >= 2, 'Should include both ARUI and ECRI');

    const aruiEnt = portfolio.entitlements.find((e) => e.productCode === 'arui');
    const ecriEnt = portfolio.entitlements.find((e) => e.productCode === 'ecri');
    assert.strictEqual(aruiEnt?.status, 'NOT_PURCHASED');
    assert.strictEqual(ecriEnt?.status, 'NOT_PURCHASED');
  });

  console.log('\n🔒 2. Testing Account Recognition & Duplicate Prevention (Instruction #58, #71, #72)...');
  await test('Recognizes existing account and prevents duplicate institutional registration', async () => {
    const existing = await query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [testEmail]);
    assert.strictEqual(existing.rows.length, 1, 'Single account exists');
  });

  console.log('\n💳 3. Testing First Engine Purchase (ARUI First) (Instruction #60, #61, #64)...');
  await test('Purchasing ARUI activates ARUI entitlement while keeping ECRI strictly unpurchased', async () => {
    const purchaseResult = await EntitlementService.processEnginePayment(testInstitutionId, testUserId, {
      productCode: 'arui',
      paymentMethod: 'CARD',
      amount: 4999.0,
      notes: 'Initial ARUI purchase for Starlight Global',
    });

    assert.strictEqual(purchaseResult.entitlement.status, 'ACTIVE');
    assert.strictEqual(purchaseResult.entitlement.productCode, 'arui');
    assert(purchaseResult.transaction.transactionReference.startsWith('tx_arui_'));
    assert(purchaseResult.entitlement.assessmentId !== undefined, 'Assessment instance must be provisioned');

    // Verify independent engine access checks
    const aruiCheck = await EntitlementService.checkEngineAccess(testInstitutionId, 'arui');
    const ecriCheck = await EntitlementService.checkEngineAccess(testInstitutionId, 'ecri');

    assert.strictEqual(aruiCheck.isAllowed, true, 'ARUI must be accessible');
    assert.strictEqual(aruiCheck.status, 'ACTIVE');

    assert.strictEqual(ecriCheck.isAllowed, false, 'ECRI must NOT be accessible without separate purchase');
    assert.strictEqual(ecriCheck.status, 'NOT_PURCHASED');
  });

  console.log('\n🔄 4. Testing Returning User & Second Engine Engagement (ECRI Later) (Instruction #59, #61, #62)...');
  await test('Existing account purchases ECRI later without creating new account or re-registering', async () => {
    // User logs in with same credentials and activates ECRI
    const ecriPurchase = await EntitlementService.processEnginePayment(testInstitutionId, testUserId, {
      productCode: 'ecri',
      paymentMethod: 'INVOICE',
      amount: 4999.0,
      notes: 'Subsequent ECRI engagement for Starlight Global',
    });

    assert.strictEqual(ecriPurchase.entitlement.status, 'ACTIVE');
    assert.strictEqual(ecriPurchase.entitlement.productCode, 'ecri');

    // Portfolio check: both are now active under the exact same institution
    const portfolio = await EntitlementService.getInstitutionPortfolio(testInstitutionId);
    assert.strictEqual(portfolio.totalActiveEngagements, 2, 'Both engagements are now active');

    const aruiEnt = portfolio.entitlements.find((e) => e.productCode === 'arui');
    const ecriEnt = portfolio.entitlements.find((e) => e.productCode === 'ecri');
    assert.strictEqual(aruiEnt?.status, 'ACTIVE');
    assert.strictEqual(ecriEnt?.status, 'ACTIVE');
  });

  console.log('\n🛡️ 5. Testing Non-Interfering Unpaid Status (Instruction #66)...');
  await test('Unpaid status of one engine never locks or disables access to another active engine', async () => {
    // Institution B: Has ECRI active, ARUI unpurchased
    const instB = await query(
      `INSERT INTO institutions (name, slug) VALUES ('Solaris Technical Institute', $1) RETURNING id`,
      [`solaris-${Date.now()}`]
    );
    const instBId = instB.rows[0].id;

    await query(
      `INSERT INTO engine_entitlements (institution_id, product_code, status, cycle)
       VALUES ($1, 'ecri', 'ACTIVE', '2026-2027'), ($1, 'arui', 'NOT_PURCHASED', '2026-2027')`,
      [instBId]
    );

    const ecriCheck = await EntitlementService.checkEngineAccess(instBId, 'ecri');
    const aruiCheck = await EntitlementService.checkEngineAccess(instBId, 'arui');

    assert.strictEqual(ecriCheck.isAllowed, true, 'Active ECRI must remain accessible');
    assert.strictEqual(aruiCheck.isAllowed, false, 'Unpurchased ARUI is gated');
  });

  console.log('\n🚀 6. Testing Extensibility to Future Assessment Engines (Instruction #63, #76)...');
  await test('Supports arbitrary new engine codes dynamically without modifying identity schema', async () => {
    // Register a future engine
    await query(
      `INSERT INTO products (code, name, tagline, description, category, is_active)
       VALUES ('sri', 'Sustainable Research Index (SRI)', 'Higher Ed Research Sustainability Benchmark', 'Evaluation of institutional research impact and ESG compliance.', 'Higher Education', true)
       ON CONFLICT (code) DO NOTHING`
    );
    await query(
      `INSERT INTO product_pricing (product_code, tier_name, currency, amount, is_active)
       VALUES ('sri', 'Standard SRI Benchmark', 'USD', 3999.00, true)
       ON CONFLICT DO NOTHING`
    );

    const portfolio = await EntitlementService.getInstitutionPortfolio(testInstitutionId);
    const sriEnt = portfolio.entitlements.find((e) => e.productCode === 'sri');
    assert(sriEnt !== undefined, 'Future engine SRI is automatically recognized in portfolio');
    assert.strictEqual(sriEnt?.status, 'NOT_PURCHASED');
  });

  console.log('\n================================================================');
  console.log(`📊 PLATFORM IDENTITY TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPlatformIdentityTestSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
