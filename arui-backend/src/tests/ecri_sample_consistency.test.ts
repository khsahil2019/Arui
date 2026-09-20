import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSampleConsistencyTest() {
  console.log('================================================================');
  console.log('🧪 ECRI CANONICAL SAMPLE & DATASET CONSISTENCY TEST SUITE');
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

  // 1. Check Canonical Sample File
  const samplePath = path.join(__dirname, '../methodology/ecri_sample/canonical_demo.json');
  assert(fs.existsSync(samplePath), 'Canonical sample dataset JSON exists at arui-backend/src/methodology/ecri_sample/canonical_demo.json');

  const sample = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
  assert(sample.product === 'ECRI', 'Canonical dataset identifies product as ECRI');
  assert(sample.version === 'ecri-v6.0', 'Canonical dataset version matches ecri-v6.0');
  assert(Array.isArray(sample.dimensions) && sample.dimensions.length === 11, 'Canonical dataset contains exactly 11 dimensions');

  // 2. Mathematical Consistency of Dimension Weights and Overall Score
  let totalWeight = 0;
  let weightedScore = 0;

  for (const d of sample.dimensions) {
    totalWeight += d.weight;
    weightedScore += d.weight * d.score;
  }

  assert(Math.abs(totalWeight - 1.0) < 0.0001, `Total dimension weights sum to exactly 1.0 (Found: ${totalWeight})`);
  const calculatedOverall = Number(weightedScore.toFixed(1));
  assert(calculatedOverall === 74.8, `Calculated weighted score is 74.8 (Found: ${calculatedOverall})`);
  assert(sample.overallScore === 74.8, `Canonical dataset overallScore is declared as 74.8 (Found: ${sample.overallScore})`);

  // 3. Public Directory Dataset Mirror
  const publicSamplePath = path.join(__dirname, '../../../university-insights-main/public/samples/ECRI_Demonstration_Dataset.json');
  assert(fs.existsSync(publicSamplePath), 'Public ECRI_Demonstration_Dataset.json exists in frontend public/samples');

  if (fs.existsSync(publicSamplePath)) {
    const publicSample = JSON.parse(fs.readFileSync(publicSamplePath, 'utf8'));
    assert(publicSample.overallScore === sample.overallScore, 'Public dataset overallScore matches canonical baseline');
    assert(publicSample.dimensions.length === 11, 'Public dataset has 11 dimensions');
  }

  // 4. Five Demonstration Deliverable PDFs
  const pdfNames = [
    'ECRI_Sample_Executive_Report.pdf',
    'ECRI_Sample_Detailed_132_Metric_Report.pdf',
    'ECRI_Sample_Board_Scorecard.pdf',
    'ECRI_Sample_Evidence_Integrity_Dossier.pdf',
    'ECRI_Sample_Transformation_Roadmap.pdf',
  ];

  for (const pdf of pdfNames) {
    const p = path.join(__dirname, '../../../university-insights-main/public/samples', pdf);
    assert(fs.existsSync(p), `Public PDF deliverable exists: ${pdf}`);
    if (fs.existsSync(p)) {
      const stats = fs.statSync(p);
      assert(stats.size > 2000, `${pdf} is a valid non-empty PDF file (${(stats.size / 1024).toFixed(1)} KB)`);
    }
  }

  console.log('\n================================================================');
  console.log(`📊 CONSISTENCY TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runSampleConsistencyTest().catch((err) => {
  console.error('Fatal consistency test error:', err);
  process.exit(1);
});
