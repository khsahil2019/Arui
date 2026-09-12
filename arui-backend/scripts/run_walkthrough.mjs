import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "/Users/sahilkhan/.gemini/antigravity-ide/brain/ff96f239-e009-415d-ac97-f52d10fe3688/screenshots";
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:8080";

async function main() {
  console.log("🚀 Starting Institutional & Assessor Full Assessment Capture...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  async function snap(filename, delay = 1200) {
    await page.waitForTimeout(delay);
    const targetPath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log(`📸 Saved: ${filename}`);
  }

  // STEP 1: Institutional Admin Sign In
  console.log("1. Admin Sign In...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await snap("01_login_empty.png", 800);

  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill("sahilkh3014@gmail.com");
  await passInput.fill("123456");
  await snap("02_login_filled.png", 500);

  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(1500);

  // STEP 2: Executive Overview Dashboard
  console.log("2. Overview Dashboard...");
  await page.goto(`${BASE_URL}/overview`, { waitUntil: "networkidle" });
  await snap("03_overview_dashboard.png", 1500);

  // STEP 3: Institutional Profile (IP01–IP25)
  console.log("3. Institutional Profile...");
  await page.goto(`${BASE_URL}/profile`, { waitUntil: "networkidle" });
  await snap("04_institutional_profile.png", 1500);

  // STEP 4: Assessment Domains Grid (11 Domains)
  console.log("4. Assessment Domains Grid...");
  await page.goto(`${BASE_URL}/assessment`, { waitUntil: "networkidle" });
  await snap("05_assessment_domains_grid.png", 1500);

  // STEP 5: Domain D01 Assessment & Questionnaire
  console.log("5. Domain D01 Assessment...");
  await page.goto(`${BASE_URL}/assessment/D01`, { waitUntil: "networkidle" });
  await snap("06_domain_d01_assessment.png", 1500);

  // STEP 6: Domain D02 Governance & Risk
  console.log("6. Domain D02 Assessment...");
  await page.goto(`${BASE_URL}/assessment/D02`, { waitUntil: "networkidle" });
  await snap("07_domain_d02_governance.png", 1500);

  // STEP 7: Evidence Locker & Multi-Metric Linking
  console.log("7. Evidence Vault...");
  await page.goto(`${BASE_URL}/evidence`, { waitUntil: "networkidle" });
  await snap("08_evidence_vault.png", 1500);

  // STEP 8: Intelligence & Gap Analysis
  console.log("8. Intelligence & Gap Analysis...");
  await page.goto(`${BASE_URL}/intelligence`, { waitUntil: "networkidle" });
  await snap("09_intelligence_gap_analysis.png", 1500);

  // STEP 9: Longitudinal Pulse Tracker
  console.log("9. Pulse Tracker...");
  await page.goto(`${BASE_URL}/pulse`, { waitUntil: "networkidle" });
  await snap("10_pulse_tracking.png", 1500);

  // STEP 10: Clear Session & Login as Assessor
  console.log("10. Assessor Panel Login & Switch...");
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  const emailInput2 = page.locator('input[type="email"]').first();
  const passInput2 = page.locator('input[type="password"]').first();
  await emailInput2.fill("assessor@arui.org");
  await passInput2.fill("arui@2026");
  const submitBtn2 = page.locator('button[type="submit"]').first();
  await submitBtn2.click();
  await page.waitForTimeout(1500);

  // STEP 11: Assessor Workspace
  console.log("11. Assessor Workspace...");
  await page.goto(`${BASE_URL}/assessor`, { waitUntil: "networkidle" });
  await snap("11_assessor_workspace.png", 1500);

  // STEP 12: Assessor Institutional Context Audit
  console.log("12. Assessor Context Audit...");
  await page.goto(`${BASE_URL}/assessor/987516bd-f4ac-4bac-8040-5089f586d347/context`, { waitUntil: "networkidle" });
  await snap("12_assessor_context_audit.png", 1500);

  // STEP 13: Assessor Response Review & Anti-Gaming Checks
  console.log("13. Assessor Response Audit...");
  await page.goto(`${BASE_URL}/assessor/987516bd-f4ac-4bac-8040-5089f586d347/responses`, { waitUntil: "networkidle" });
  await snap("13_assessor_responses_audit.png", 1500);

  // STEP 14: Assessor Evidence Verification Matrix
  console.log("14. Assessor Evidence Matrix...");
  await page.goto(`${BASE_URL}/assessor/987516bd-f4ac-4bac-8040-5089f586d347/evidence`, { waitUntil: "networkidle" });
  await snap("14_assessor_evidence_matrix.png", 1500);

  // STEP 15: Assessor Final Calibration & Scoring
  console.log("15. Assessor Scoring...");
  await page.goto(`${BASE_URL}/assessor/987516bd-f4ac-4bac-8040-5089f586d347/scoring`, { waitUntil: "networkidle" });
  await snap("15_assessor_scoring_signoff.png", 1500);

  // STEP 16: Assessor Runs & Audit Log
  console.log("16. Assessor Execution Log...");
  await page.goto(`${BASE_URL}/assessor/987516bd-f4ac-4bac-8040-5089f586d347/runs`, { waitUntil: "networkidle" });
  await snap("16_assessor_execution_runs.png", 1500);

  console.log("🎉 Complete institutional & assessor lifecycle captured successfully!");
  await browser.close();
}

main().catch((err) => {
  console.error("Error executing full walkthrough:", err);
  process.exit(1);
});
