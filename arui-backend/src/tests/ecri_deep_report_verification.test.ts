import { query } from '../db/index.js';
import { buildAssessmentReportPayload } from '../modules/reports/payload.js';
import { generateAssessmentPdfStream } from '../modules/reports/pdf.js';
import stream from 'stream';

async function runDeepReportVerification() {
  console.log('================================================================');
  console.log('🧪 ECRI DEEP PRODUCTION REPORT & PDF VERIFICATION SUITE');
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

  // 1. Fetch ECRI Assessment from DB
  const ecriAsm = await query(`
    SELECT a.id, a.product_code, a.institution_id, i.name as institution_name, m.version
    FROM assessments a
    JOIN institutions i ON i.id = a.institution_id
    JOIN methodology_versions m ON m.id = a.methodology_version_id
    WHERE a.product_code = 'ecri'
    ORDER BY a.created_at DESC LIMIT 1
  `);

  assert(ecriAsm.rows.length > 0, 'Found registered ECRI assessment in PostgreSQL');
  const asm = ecriAsm.rows[0];

  // 2. Build Canonical Report Payload
  console.log(`\n📋 Generating Canonical Report Payload for Assessment ${asm.id}...`);
  const payload = await buildAssessmentReportPayload(asm.id);

  assert(payload.report.productCode === 'ecri', 'Report payload product code is strictly ecri');
  assert(payload.report.productName.includes('Employability'), 'Report payload product name reflects Graduate Employability');
  assert(payload.report.methodologyVersion === 'ecri-v6.0', 'Methodology version is pinned to ecri-v6.0');

  // 3. Inspect 11 Dimensions & 132 Metrics
  assert(Array.isArray(payload.domains) && payload.domains.length === 11, `Payload contains exactly 11 Dimensions (Found: ${payload.domains?.length})`);

  assert(payload.domains[0].name.includes('Employer Demand Intelligence'), `D01 includes "Employer Demand Intelligence" (Found: ${payload.domains[0].name})`);
  assert(payload.domains[9].name.includes('Alumni') || payload.domains[9].name.includes('Career Tracking') || payload.domains[9].name.includes('Employment'), `D10 includes relevant title (Found: ${payload.domains[9].name})`);

  assert(Array.isArray(payload.metricAuditAppendix) && payload.metricAuditAppendix.length === 132, `Payload contains exactly 132 Canonical Metrics in Appendix (Found: ${payload.metricAuditAppendix?.length})`);

  // 4. Verify Gap Analysis & Transformation Roadmap
  assert(Array.isArray(payload.gapAnalysis) && payload.gapAnalysis.length === 11, 'Payload contains 11-dimension Gap Analysis matrix');
  assert(Array.isArray(payload.transformationRoadmap) && payload.transformationRoadmap.length === 3, 'Payload contains 3-Horizon Transformation Roadmap');

  // 5. Verify Zero ARUI Contamination in ECRI Report
  const jsonStr = JSON.stringify(payload);
  assert(!jsonStr.includes('AI Resilience') && !jsonStr.includes('AI-Resilient'), 'Zero ARUI terminology leakage in ECRI report payload');

  // 6. Test Streamed PDF Generation
  console.log('\n📄 Generating Production PDF Stream from Live Payload...');
  const chunks: Buffer[] = [];
  const writableStream = new stream.Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    }
  });

  await new Promise<void>((resolve, reject) => {
    writableStream.on('finish', () => resolve());
    writableStream.on('error', (err) => reject(err));
    generateAssessmentPdfStream(payload, writableStream as any);
  });

  const totalPdfBytes = Buffer.concat(chunks).length;
  assert(totalPdfBytes > 5000, `Production PDF stream generated successfully (${(totalPdfBytes / 1024).toFixed(1)} KB)`);

  console.log('\n================================================================');
  console.log(`📊 REPORT VERIFICATION RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runDeepReportVerification().catch((err) => {
  console.error('Fatal deep report verification error:', err);
  process.exit(1);
});
