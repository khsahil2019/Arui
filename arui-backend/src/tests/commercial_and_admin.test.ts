import { query } from '../db/index.js';

async function runCommercialAndAdminTests() {
  console.log('=== RUNNING COMMERCIAL, BRANDING & ADMIN TEST SUITE ===');
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
    // 1. Test Enquiry Creation
    const testEnquiry = {
      productCode: 'ecri',
      name: 'Vice-Chancellor Dr. K. Sharma',
      institutionName: 'Apex Institute of Technology',
      designation: 'Vice-Chancellor',
      email: 'vc@apex-tech.edu',
      phone: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      message: 'Interested in institutional ECRI assessment for our 2026 graduating batch.'
    };

    const enqRes = await query(
      `INSERT INTO enquiries (product_code, name, institution_name, designation, email, phone, whatsapp, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [testEnquiry.productCode, testEnquiry.name, testEnquiry.institutionName, testEnquiry.designation, testEnquiry.email, testEnquiry.phone, testEnquiry.whatsapp, testEnquiry.message]
    );
    assert(enqRes.rows.length === 1, 'Enquiry successfully submitted and recorded');
    assert(enqRes.rows[0].status === 'NEW', 'Enquiry initial status is NEW');

    // 2. Test Dynamic Branding Update
    const updatedHeader = 'Employability & Career Readiness Index — Accredited Benchmark';
    const updatedFooter = 'Confidential © 2026 ECRI Global Advisory Board';
    await query(
      `UPDATE brand_configs 
       SET header_text = $1, footer_text = $2, updated_at = NOW() 
       WHERE product_code = 'ecri'`,
      [updatedHeader, updatedFooter]
    );

    const checkBrand = (await query(`SELECT * FROM brand_configs WHERE product_code = 'ecri' LIMIT 1`)).rows[0];
    assert(checkBrand.header_text === updatedHeader, 'Brand header text updated dynamically');
    assert(checkBrand.footer_text === updatedFooter, 'Brand footer text updated dynamically');

    // 3. Test Dynamic Pricing
    await query(
      `UPDATE product_pricing SET amount = 5499.00, updated_at = NOW() WHERE product_code = 'ecri'`
    );
    const checkPrice = (await query(`SELECT amount FROM product_pricing WHERE product_code = 'ecri'`)).rows[0];
    assert(Number(checkPrice.amount) === 5499.00, 'Dynamic pricing successfully updated to 5499.00');

    // Reset price back to 4999.00
    await query(`UPDATE product_pricing SET amount = 4999.00 WHERE product_code = 'ecri'`);

    // 4. Test Dynamic CTA Configuration
    await query(
      `UPDATE cta_configs SET cta_text = 'Begin Institutional ECRI Assessment' WHERE product_code = 'ecri'`
    );
    const checkCta = (await query(`SELECT cta_text FROM cta_configs WHERE product_code = 'ecri'`)).rows[0];
    assert(checkCta.cta_text === 'Begin Institutional ECRI Assessment', 'Dynamic CTA configuration active');

    console.log(`\n=== COMMERCIAL & ADMIN SUMMARY ===`);
    console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Commercial & Admin test failed:', err);
    process.exit(1);
  }
}

runCommercialAndAdminTests().then(() => {
  console.log('Commercial and Admin verification finished successfully.');
  process.exit(0);
});
