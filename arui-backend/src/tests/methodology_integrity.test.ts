import { query } from '../db/index.js';

async function runMethodologyIntegrityTests() {
  console.log('=== RUNNING METHODOLOGY & MULTI-PRODUCT INTEGRITY TEST SUITE ===');
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
    // 1. Check Products Master
    const productsRes = await query(`SELECT code, name, category, is_active FROM products ORDER BY code ASC`);
    assert(productsRes.rows.length >= 2, 'Products master contains ARUI and ECRI products');
    const aruiProd = productsRes.rows.find(p => p.code === 'arui');
    const ecriProd = productsRes.rows.find(p => p.code === 'ecri');
    assert(!!aruiProd && aruiProd.is_active === true, 'ARUI product is registered and active');
    assert(!!ecriProd && ecriProd.is_active === true, 'ECRI product is registered and active');

    // 2. Check Methodology Versions
    const mvRes = await query(`SELECT id, product_code, version, name, is_active FROM methodology_versions WHERE is_active = true`);
    const aruiMv = mvRes.rows.find(m => m.product_code === 'arui' || m.version === 'v4.0');
    const ecriMv = mvRes.rows.find(m => m.product_code === 'ecri' || m.version === 'ecri-v6.0');
    assert(!!aruiMv, 'Active ARUI methodology version exists in database');
    assert(!!ecriMv, 'Active ECRI methodology version exists in database');

    if (aruiMv) {
      // 3. Check ARUI Domains & Metrics (11 Domains, 143 Metrics)
      const aruiDomains = await query(`SELECT code, name FROM domains WHERE methodology_version_id = $1`, [aruiMv.id]);
      assert(aruiDomains.rows.length === 11, `ARUI has exactly 11 domains (Found: ${aruiDomains.rows.length})`);

      const aruiMetrics = await query(`SELECT full_code FROM metrics WHERE methodology_version_id = $1`, [aruiMv.id]);
      assert(aruiMetrics.rows.length === 143, `ARUI has exactly 143 canonical metrics (Found: ${aruiMetrics.rows.length})`);
    }

    if (ecriMv) {
      // 4. Check ECRI Dimensions (D01..D11)
      const ecriDimensions = await query(`SELECT code, name, provisional_weight FROM domains WHERE methodology_version_id = $1 ORDER BY code ASC`, [ecriMv.id]);
      assert(ecriDimensions.rows.length === 11, `ECRI has exactly 11 dimensions D01-D11 (Found: ${ecriDimensions.rows.length})`);

      const expectedDims = ['D01','D02','D03','D04','D05','D06','D07','D08','D09','D10','D11'];
      const actualDims = ecriDimensions.rows.map(d => d.code);
      assert(JSON.stringify(expectedDims) === JSON.stringify(actualDims), `ECRI dimension codes match D01 through D11 precisely`);

      // 5. Check ECRI Metrics (132 Canonical Metrics, 12 per Dimension)
      const ecriMetrics = await query(`SELECT domain_code, full_code, name, exposure, weight FROM metrics WHERE methodology_version_id = $1 ORDER BY full_code ASC`, [ecriMv.id]);
      assert(ecriMetrics.rows.length === 132, `ECRI has exactly 132 canonical metrics (Found: ${ecriMetrics.rows.length})`);

      // Verify each dimension has exactly 12 metrics
      let allDimsHave12 = true;
      for (const dCode of expectedDims) {
        const count = ecriMetrics.rows.filter(m => m.domain_code === dCode).length;
        if (count !== 12) {
          allDimsHave12 = false;
          console.error(`Dimension ${dCode} has ${count} metrics instead of 12!`);
        }
      }
      assert(allDimsHave12, 'Every ECRI dimension has exactly 12 canonical metrics');

      // 6. Check ECRI Maturity Anchors (Levels 0 to 5)
      const ecriAnchors = await query(`SELECT level, label FROM metric_anchors WHERE methodology_version_id = $1 ORDER BY level ASC`, [ecriMv.id]);
      assert(ecriAnchors.rows.length === 6, `ECRI has 6 maturity levels (Found: ${ecriAnchors.rows.length})`);

      // 7. Check ECRI Question Bank & Cards
      const ecriCards = await query(`SELECT code FROM assessment_cards WHERE methodology_version_id = $1`, [ecriMv.id]);
      assert(ecriCards.rows.length === 33, `ECRI has 33 assessment cards (3 per dimension)`);

      const ecriQuestions = await query(`SELECT code FROM questions WHERE methodology_version_id = $1`, [ecriMv.id]);
      assert(ecriQuestions.rows.length === 66, `ECRI has 66 question items in question bank (Found: ${ecriQuestions.rows.length})`);

      // 8. Check Anti-Gaming, Calibration & Badges
      const ecriAntiGaming = await query(`SELECT code FROM anti_gaming_rules WHERE methodology_version_id = $1`, [ecriMv.id]);
      assert(ecriAntiGaming.rows.length >= 5, `ECRI has registered anti-gaming protection rules`);

      const ecriCalibration = await query(`SELECT rule_code FROM calibration_rules WHERE methodology_version_id = $1`, [ecriMv.id]);
      assert(ecriCalibration.rows.length >= 3, `ECRI has registered assessor calibration & adjudication rules`);

      const ecriBadges = await query(`SELECT code FROM badge_definitions WHERE product_code = 'ecri'`);
      assert(ecriBadges.rows.length >= 3, `ECRI generic badge definitions are registered`);
    }

    // Summary
    console.log(`\n=== METHODOLOGY INTEGRITY SUMMARY ===`);
    console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runMethodologyIntegrityTests().then(() => {
  console.log('Methodology integrity verified successfully.');
  process.exit(0);
});
