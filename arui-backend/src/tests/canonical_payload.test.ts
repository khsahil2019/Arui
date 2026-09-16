import { query } from '../db/index.js';
import { buildAssessmentReportPayload } from '../modules/reports/payload.js';

async function runCanonicalPayloadTests() {
  console.log('=== RUNNING CANONICAL REPORT PAYLOAD TEST SUITE ===');
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
    // 1. Fetch ECRI Assessment
    const ecriAsm = (await query(`SELECT id FROM assessments WHERE product_code = 'ecri' LIMIT 1`)).rows[0];
    assert(!!ecriAsm, 'ECRI assessment exists for canonical payload test');

    const ecriPayload = await buildAssessmentReportPayload(ecriAsm.id);
    assert(ecriPayload.report.productCode === 'ecri', 'Payload identifies ECRI product code');
    assert(ecriPayload.report.productName.includes('Employability & Career Readiness Index'), 'Payload includes ECRI product title');
    assert(ecriPayload.domains.length === 11, `Payload contains all 11 dimensions (Found: ${ecriPayload.domains.length})`);
    assert(ecriPayload.metricAuditAppendix.length === 132, `Payload contains exactly 132 canonical metrics (Found: ${ecriPayload.metricAuditAppendix.length})`);
    assert(Array.isArray(ecriPayload.gapAnalysis) && ecriPayload.gapAnalysis.length === 11, 'Payload contains 11-dimension Gap Analysis matrix');
    assert(Array.isArray(ecriPayload.transformationRoadmap) && ecriPayload.transformationRoadmap.length === 3, 'Payload contains 3-Horizon Transformation Roadmap');
    assert(!!ecriPayload.publicProfile && ecriPayload.publicProfile.productCode === 'ecri', 'Payload contains Public Profile slice');
    assert(!!ecriPayload.branding && !!ecriPayload.branding.header_text, 'Payload incorporates dynamic Brand Configuration');

    // 2. Fetch ARUI Assessment
    const aruiAsm = (await query(`SELECT id FROM assessments WHERE product_code = 'arui' OR product_code IS NULL LIMIT 1`)).rows[0];
    assert(!!aruiAsm, 'ARUI assessment exists for canonical payload test');

    const aruiPayload = await buildAssessmentReportPayload(aruiAsm.id);
    assert(aruiPayload.report.productCode === 'arui', 'Payload identifies ARUI product code');
    assert(aruiPayload.domains.length === 11, `ARUI payload contains 11 domains (Found: ${aruiPayload.domains.length})`);
    assert(aruiPayload.metricAuditAppendix.length === 143, `ARUI payload contains 143 canonical metrics (Found: ${aruiPayload.metricAuditAppendix.length})`);

    console.log(`\n=== CANONICAL PAYLOAD SUMMARY ===`);
    console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Canonical payload test failed:', err);
    process.exit(1);
  }
}

runCanonicalPayloadTests().then(() => {
  console.log('Canonical payload verification finished successfully.');
  process.exit(0);
});
