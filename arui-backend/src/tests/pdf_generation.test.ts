import fs from 'fs';
import path from 'path';
import { query } from '../db/index.js';
import { buildAssessmentReportPayload } from '../modules/reports/payload.js';
import { generateAssessmentPdfStream } from '../modules/reports/pdf.js';

async function runPdfGenerationTests() {
  console.log('=== RUNNING PRODUCTION PDF GENERATION TEST SUITE ===');
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
    const outDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // 1. Generate ECRI Assessment PDF
    const ecriAsm = (await query(`SELECT id FROM assessments WHERE product_code = 'ecri' LIMIT 1`)).rows[0];
    assert(!!ecriAsm, 'Found ECRI assessment for PDF generation test');

    const ecriPayload = await buildAssessmentReportPayload(ecriAsm.id);
    const ecriPdfPath = path.join(outDir, 'ECRI_Comprehensive_Assessment_Report.pdf');
    const ecriWriteStream = fs.createWriteStream(ecriPdfPath);

    await new Promise<void>((resolve, reject) => {
      ecriWriteStream.on('finish', () => resolve());
      ecriWriteStream.on('error', (err) => reject(err));
      generateAssessmentPdfStream(ecriPayload, ecriWriteStream);
    });

    const ecriStat = fs.statSync(ecriPdfPath);
    assert(ecriStat.size > 10000, `ECRI PDF generated successfully (File size: ${ecriStat.size} bytes)`);

    // 2. Generate ARUI Assessment PDF
    const aruiAsm = (await query(`SELECT id FROM assessments WHERE product_code = 'arui' OR product_code IS NULL LIMIT 1`)).rows[0];
    assert(!!aruiAsm, 'Found ARUI assessment for PDF generation test');

    const aruiPayload = await buildAssessmentReportPayload(aruiAsm.id);
    const aruiPdfPath = path.join(outDir, 'ARUI_Comprehensive_Assessment_Report.pdf');
    const aruiWriteStream = fs.createWriteStream(aruiPdfPath);

    await new Promise<void>((resolve, reject) => {
      aruiWriteStream.on('finish', () => resolve());
      aruiWriteStream.on('error', (err) => reject(err));
      generateAssessmentPdfStream(aruiPayload, aruiWriteStream);
    });

    const aruiStat = fs.statSync(aruiPdfPath);
    assert(aruiStat.size > 10000, `ARUI PDF generated successfully (File size: ${aruiStat.size} bytes)`);

    console.log(`\n=== PDF GENERATION SUMMARY ===`);
    console.log(`Total tests: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('PDF generation test failed:', err);
    process.exit(1);
  }
}

runPdfGenerationTests().then(() => {
  console.log('PDF generation verification completed.');
  process.exit(0);
});
