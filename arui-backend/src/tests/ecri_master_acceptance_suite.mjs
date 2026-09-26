import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../../..');
const REGISTRY_DIR = path.join(ROOT, 'arui-backend/src/methodology/ecri_registry');
const SAMPLES_DIR = path.join(ROOT, 'university-insights-main/public/samples');

console.log('================================================================');
console.log('ECRI MASTER ACCEPTANCE SUITE — VERIFICATION & QA');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

// 1. Methodology & Metric Count Verification
runTest('Exactly 11 Dimensions in Canonical Registry', () => {
  const dims = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'dimensions.json'), 'utf8'));
  assert.strictEqual(dims.length, 11, 'Expected 11 dimensions');
  const expectedCodes = ['D01','D02','D03','D04','D05','D06','D07','D08','D09','D10','D11'];
  assert.deepStrictEqual(dims.map(d => d.code), expectedCodes);
});

runTest('Dimension Weights Sum to Exactly 100%', () => {
  const dims = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'dimensions.json'), 'utf8'));
  const sum = dims.reduce((acc, d) => acc + d.provisionalWeight, 0);
  assert(Math.abs(sum - 1.0) < 0.0001, `Expected weights sum to 1.0, got ${sum}`);
});

runTest('Exactly 132 Canonical Metrics (12 per Dimension)', () => {
  const metrics = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'metrics.json'), 'utf8'));
  assert.strictEqual(metrics.length, 132, 'Expected 132 canonical metrics');
  for (let i = 1; i <= 11; i++) {
    const dCode = `D${String(i).padStart(2, '0')}`;
    const dimMetrics = metrics.filter(m => m.domainCode === dCode);
    assert.strictEqual(dimMetrics.length, 12, `Expected 12 metrics for ${dCode}, got ${dimMetrics.length}`);
  }
});

runTest('Zero Placeholder Metric Names ("Anchor 01" or generic templates)', () => {
  const metrics = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'metrics.json'), 'utf8'));
  const rawStr = JSON.stringify(metrics);
  assert(!rawStr.includes('Anchor 01'), 'Found placeholder "Anchor 01" in metrics registry');
  assert(!rawStr.includes('Capability Anchor'), 'Found placeholder "Capability Anchor" in metrics registry');
});

runTest('Question Bank Contains 132 Plain-Language + 21 Screening Questions', () => {
  const qb = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'question_bank.json'), 'utf8'));
  assert.strictEqual(qb.length, 153, `Expected 153 total questions, got ${qb.length}`);
  const screening = qb.filter(q => q.isScreening);
  assert.strictEqual(screening.length, 21, `Expected 21 screening questions, got ${screening.length}`);
});

runTest('Authoritative Question Metadata Populated', () => {
  const qb = JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, 'question_bank.json'), 'utf8'));
  const q1 = qb.find(q => q.metricCode === 'D01-I01');
  assert(q1.whatWeAreAsking, 'Missing whatWeAreAsking');
  assert(q1.whatShouldIProvide, 'Missing whatShouldIProvide');
  assert(q1.evidenceExamples && q1.evidenceExamples.length > 0, 'Missing evidenceExamples');
  assert(q1.whyThisMatters, 'Missing whyThisMatters');
});

// 2. AI Intelligence & Provider Abstraction
runTest('AI Provider Abstraction & Mock Provider Operable Without API Key', async () => {
  const { getAIProvider, MockAIProvider } = await import('../modules/ai/index.js');
  const provider = getAIProvider();
  assert(provider, 'Expected an active AI provider');
  assert(provider instanceof MockAIProvider || provider.name === 'MockAIProvider', 'Default provider should be MockAIProvider');
});

runTest('Claim-Evidence Reconciliation Detects Potential Mismatches Non-Destructively', async () => {
  const { reconcileClaim } = await import('../modules/ai/index.js');
  const finding = await reconcileClaim({
    assessmentId: 'test-asm',
    metricCode: 'D09-I01',
    institutionClaim: 85,
    evidenceFileName: 'partnerships_register_2026.pdf',
    evidenceText: 'Identified active corporate records: 27 partner firms dated 2025-2026.',
  });

  assert.strictEqual(finding.claim, 85, 'Institutional claim must be preserved as 85');
  assert.strictEqual(finding.evidenceSupportedValue, 27, 'Evidence supported value must be 27');
  assert.strictEqual(finding.status, 'POTENTIAL_MISMATCH', 'Status must be POTENTIAL_MISMATCH');
  assert(finding.basis.length > 0, 'Must provide basis');
  assert(finding.limitations.length > 0, 'Must provide limitations');
});

// 3. Demo Assessment & Mathematical Engine
runTest('Canonical Sample Assessment Overall Score is Exactly 74.8 / 100', async () => {
  const { ECRI_DEMO_ASSESSMENT } = await import('../modules/methodology/ecriDemoAssessment.js');
  assert.strictEqual(ECRI_DEMO_ASSESSMENT.institution.name, 'Metropolitan Apex University');
  assert.strictEqual(ECRI_DEMO_ASSESSMENT.overallScore, 74.8, 'Expected overall score 74.8');
  assert.strictEqual(ECRI_DEMO_ASSESSMENT.dimensionsList.length, 11, 'Expected 11 dimensions in demo');
  assert.strictEqual(ECRI_DEMO_ASSESSMENT.metricsList.length, 132, 'Expected 132 metrics in demo');
});

// 4. Reports & Manifest
runTest('All 5 Distinct ECRI PDF Reports Exist with Dynamic Manifest', () => {
  const manifestPath = path.join(SAMPLES_DIR, 'report-manifest.json');
  assert(fs.existsSync(manifestPath), 'report-manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.strictEqual(manifest.product, 'ECRI');
  assert.strictEqual(manifest.overallScore, 74.8);
  assert.strictEqual(manifest.reports.length, 5);

  const reportNames = [
    'ECRI_Sample_Executive_Report.pdf',
    'ECRI_Sample_Detailed_132_Metric_Report.pdf',
    'ECRI_Sample_Board_Scorecard.pdf',
    'ECRI_Sample_Evidence_Integrity_Dossier.pdf',
    'ECRI_Sample_Transformation_Roadmap.pdf',
  ];

  for (const rName of reportNames) {
    const p = path.join(SAMPLES_DIR, rName);
    assert(fs.existsSync(p), `Missing report file ${rName}`);
    assert(fs.statSync(p).size > 5000, `Report file ${rName} is too small / malformed`);
  }
});

// 5. Public HTML Profile & Website Package
runTest('Public ECRI Institutional Profile HTML & Website Bundle Generated', () => {
  const profileHtml = path.join(SAMPLES_DIR, 'ECRI_Institutional_Profile.html');
  assert(fs.existsSync(profileHtml), 'ECRI_Institutional_Profile.html must exist');
  const content = fs.readFileSync(profileHtml, 'utf8');
  assert(content.includes('Metropolitan Apex University'), 'Missing institution name in profile HTML');
  assert(content.includes('74.8'), 'Missing score 74.8 in profile HTML');
  assert(content.includes('Employer Demand Intelligence'), 'Missing D01 in profile HTML');
  assert(content.includes('Career Adaptability, Lifelong Readiness & Employability Intelligence'), 'Missing D11 in profile HTML');
});

console.log(`\n================================================================`);
console.log(`ACCEPTANCE RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log(`================================================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
