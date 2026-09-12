import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "/Users/sahilkhan/.gemini/antigravity-ide/brain/ff96f239-e009-415d-ac97-f52d10fe3688/screenshots";
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:8080";

async function main() {
  console.log("Starting Automated Workflow Capture...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Crisp retina screenshots
  });

  const page = await context.newPage();

  // Helper function to capture screenshot
  async function snap(filename, delay = 1000) {
    await page.waitForTimeout(delay);
    const targetPath = path.join(ARTIFACT_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log(`📸 Saved screenshot: ${filename}`);
  }

  // 1. Landing / Login Page
  console.log("1. Navigating to Login...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await snap("01_login_screen.png", 1500);

  // 2. Filling Login Credentials
  console.log("2. Performing Admin Login (sahilkh3014@gmail.com)...");
  const emailInput = page.locator('input[type="email"], input[name="email"], input#email').first();
  const passInput = page.locator('input[type="password"], input[name="password"], input#password').first();
  if (await emailInput.count() > 0) {
    await emailInput.fill("sahilkh3014@gmail.com");
    await passInput.fill("123456");
    await snap("02_login_filled.png", 500);
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  // 3. Overview Dashboard
  console.log("3. Capturing Overview Dashboard...");
  await page.goto(`${BASE_URL}/overview`, { waitUntil: "networkidle" });
  await snap("03_overview_dashboard.png", 2000);

  // 4. Institutional Profile
  console.log("4. Navigating to Institutional Profile...");
  await page.goto(`${BASE_URL}/profile`, { waitUntil: "networkidle" });
  await snap("04_institutional_profile.png", 1500);

  // 5. Domains / Assessment Overview
  console.log("5. Navigating to Assessment Domains...");
  await page.goto(`${BASE_URL}/assessment`, { waitUntil: "networkidle" });
  await snap("05_assessment_domains.png", 1500);

  // 6. Specific Domain Assessment & Capability Scoring
  console.log("6. Navigating to Domain Deep-Dive...");
  await page.goto(`${BASE_URL}/assessment/leadership-governance`, { waitUntil: "networkidle" });
  await snap("06_domain_leadership_assessment.png", 2000);

  // 7. Evidence Management & Vault
  console.log("7. Navigating to Evidence Vault...");
  await page.goto(`${BASE_URL}/evidence`, { waitUntil: "networkidle" });
  await snap("07_evidence_vault.png", 1500);

  // 8. Intelligence & Gap Analysis
  console.log("8. Navigating to Intelligence & Gap Analysis...");
  await page.goto(`${BASE_URL}/intelligence`, { waitUntil: "networkidle" });
  await snap("08_intelligence_gap_analysis.png", 2000);

  // 9. Longitudinal Pulse Tracker
  console.log("9. Navigating to Pulse Tracker...");
  await page.goto(`${BASE_URL}/pulse`, { waitUntil: "networkidle" });
  await snap("09_pulse_tracking.png", 1500);

  // 10. Assessor Dashboard
  console.log("10. Logging into Assessor Workspace...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  const emailInput2 = page.locator('input[type="email"], input[name="email"], input#email').first();
  const passInput2 = page.locator('input[type="password"], input[name="password"], input#password').first();
  if (await emailInput2.count() > 0) {
    await emailInput2.fill("assessor@arui.org");
    await passInput2.fill("arui@2026");
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  await page.goto(`${BASE_URL}/assessor`, { waitUntil: "networkidle" });
  await snap("10_assessor_workspace.png", 1500);

  // 11. Assessor Evidence Audit Matrix
  console.log("11. Assessor Evidence Audit...");
  await page.goto(`${BASE_URL}/assessor/987516bd-f4ac-4bac-8040-5089f586d347/evidence`, { waitUntil: "networkidle" });
  await snap("11_assessor_evidence_matrix.png", 2000);

  // 12. Assessor Scoring & Sign-off
  console.log("12. Assessor Final Scoring & Calibration...");
  await page.goto(`${BASE_URL}/assessor/987516bd-f4ac-4bac-8040-5089f586d347/scoring`, { waitUntil: "networkidle" });
  await snap("12_assessor_scoring_signoff.png", 2000);

  console.log("✅ All screenshots captured successfully!");
  await browser.close();
}

main().catch((err) => {
  console.error("Error executing walkthrough capture:", err);
  process.exit(1);
});
