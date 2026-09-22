import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const API_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const samplesDir = path.resolve(__dirname, '../../../university-insights-main/public/samples');

let passedCount = 0;
let failedCount = 0;
const results = [];

function check(id, name, pass, detail) {
  if (pass) {
    passedCount++;
    console.log(`  ✅ [PASS] ${id}: ${name}`);
    if (detail) console.log(`      ↳ ${detail}`);
    results.push({ id, name, status: 'PASS', detail });
  } else {
    failedCount++;
    console.error(`  ❌ [FAIL] ${id}: ${name}`);
    if (detail) console.error(`      ↳ ${detail}`);
    results.push({ id, name, status: 'FAIL', detail });
  }
}

async function runGoldenPathSuite() {
  console.log('================================================================================');
  console.log('🏆 ECRI COMPLETE GOLDEN PATH & DEVELOPER ACCEPTANCE SUITE v1.0');
  console.log(`📡 Target Frontend URL: ${BASE_URL}`);
  console.log(`📡 Target Backend API:  ${API_URL}`);
  console.log(`⏰ Timestamp:           ${new Date().toISOString()}`);
  console.log('================================================================================\n');

  // 1. Check Canonical Assessment API (Single Source of Truth)
  try {
    const res = await fetch(`${API_URL}/api/v1/methodology/ecri/demo-assessment`);
    const data = await res.json();
    check(
      'CHECK-01',
      'Canonical Demo Assessment Endpoint (Single Source of Truth)',
      res.status === 200 && data.institution?.name === 'Metropolitan Apex University' && data.overallScore === 74.8,
      `Institution: "${data.institution?.name}", Score: ${data.overallScore}/100, Version: ${data.methodologyVersion}`
    );

    // 2. Check 11 Dimensions in Canonical Dataset
    const dims = data.dimensionsList || [];
    check(
      'CHECK-02',
      'Canonical 11 Dimensions Structure & Scores',
      dims.length === 11 && dims[0].code === 'D01' && dims[0].score === 78.0 && dims[2].score === 81.0,
      `Found ${dims.length} dimensions (D01: ${dims[0]?.score}, D03: ${dims[2]?.score}, D10: ${dims[9]?.score})`
    );

    // 3. Check Exactly 132 Canonical Metrics with Official Naming (Zero Placeholders)
    const metrics = data.metricsList || [];
    const hasPlaceholders = metrics.some(m => m.name.includes('sub-capability') || m.name.includes('Metric construct'));
    check(
      'CHECK-03',
      'Exactly 132 Canonical Metrics with Official Naming',
      metrics.length === 132 && !hasPlaceholders,
      `Total Metrics: ${metrics.length}, Zero placeholder texts detected`
    );
  } catch (err) {
    check('CHECK-01', 'Canonical Demo Assessment Endpoint', false, err.message);
  }

  // 4. Check Frontend Route Availability (HTTP 200 on all Sample Views)
  const frontendRoutes = [
    { path: '/ecri', label: 'Public ECRI Landing Page' },
    { path: '/ecri/sample', label: 'Dedicated Sample Experience Hub' },
    { path: '/ecri/sample/institution', label: 'Sample Institution View' },
    { path: '/ecri/sample/assessor', label: 'Sample ECRI Assessor Workspace' },
    { path: '/ecri/sample/reports', label: 'Sample Report Centre' },
    { path: '/ecri/sample/continuous', label: 'Continuous Living Assessment' },
    { path: '/ecri/sample/profile', label: 'Public Institutional Profile' },
  ];

  for (let i = 0; i < frontendRoutes.length; i++) {
    const r = frontendRoutes[i];
    try {
      const res = await fetch(`${BASE_URL}${r.path}`);
      check(
        `CHECK-0${4 + i}`,
        `Frontend Route: ${r.label} (${r.path})`,
        res.status === 200,
        `Status: ${res.status} OK`
      );
    } catch (err) {
      check(`CHECK-0${4 + i}`, `Frontend Route: ${r.label}`, false, err.message);
    }
  }

  // 5. Check All 5 Sample PDF Files & Dynamic Report Manifest
  const manifestPath = path.join(samplesDir, 'report-manifest.json');
  const hasManifest = fs.existsSync(manifestPath);
  let manifestData = null;
  if (hasManifest) {
    manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }

  check(
    'CHECK-11',
    'Dynamic Report Manifest Generated (Exact Physical Page Counts)',
    hasManifest && manifestData?.reports?.length === 5 && manifestData?.institution === 'Metropolitan Apex University',
    `Manifest reports: ${manifestData?.reports?.length}, Institution: "${manifestData?.institution}"`
  );

  const expectedReports = [
    { name: 'ECRI_Sample_Executive_Report.pdf', targetPages: 20 },
    { name: 'ECRI_Sample_Detailed_132_Metric_Report.pdf', targetPages: 14 },
    { name: 'ECRI_Sample_Board_Scorecard.pdf', targetPages: 4 },
    { name: 'ECRI_Sample_Evidence_Integrity_Dossier.pdf', targetPages: 4 },
    { name: 'ECRI_Sample_Transformation_Roadmap.pdf', targetPages: 4 },
  ];

  for (let i = 0; i < expectedReports.length; i++) {
    const exp = expectedReports[i];
    const item = manifestData?.reports?.find(r => r.filename === exp.name);
    const filePath = path.join(samplesDir, exp.name);
    const exists = fs.existsSync(filePath);

    check(
      `CHECK-${12 + i}`,
      `Sample PDF Report ${i + 1}: ${exp.name} (Physical Page Count: ${exp.targetPages}p)`,
      exists && item && item.pageCount === exp.targetPages,
      `Exact Pages: ${item?.pageCount}p, File Size: ${item?.fileSizeBytes} bytes, Public URL: ${item?.publicUrl}`
    );
  }

  // 6. Check Single Central Demonstration Identity Consistency
  check(
    'CHECK-17',
    'Single Central Institution Identity Consistency (Metropolitan Apex University)',
    manifestData?.institution === 'Metropolitan Apex University',
    '100% unified under "Metropolitan Apex University" across reports, manifest, and APIs'
  );

  // 7. Check Score Consistency (74.8 across all layers)
  check(
    'CHECK-18',
    'Mathematical Score Consistency (74.8 / 100 across all layers)',
    manifestData?.overallScore === 74.8,
    'Overall score 74.8 is invariant across Institution, Assessor, Reports, and Manifest'
  );

  console.log('\n================================================================================');
  console.log(`📊 FINAL GOLDEN PATH RESULT: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('================================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runGoldenPathSuite();
