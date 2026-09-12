import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "/Users/sahilkhan/.gemini/antigravity-ide/brain/ff96f239-e009-415d-ac97-f52d10fe3688/screenshots/profile_and_questions";
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:8080";

async function main() {
  console.log("🚀 Starting Granular Profile Steps & Question-by-Question Capture...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  async function snap(filename, delay = 1000) {
    await page.waitForTimeout(delay);
    const targetPath = path.join(OUTPUT_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: true });
    console.log(`📸 Saved (Full Page): ${filename}`);
  }

  // 1. Log in
  console.log("1. Authenticating Admin...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill("sahilkh3014@gmail.com");
  await passInput.fill("123456");
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(2000);

  // 2. Capture Every Single Step in Institutional Profile (Steps 1 to 5)
  console.log("2. Capturing Institutional Profile Steps...");
  await page.goto(`${BASE_URL}/profile`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  const stepButtons = page.locator('ol button, aside [role="button"], aside button');
  const stepCount = await stepButtons.count();
  console.log(`Found ${stepCount} steps in Profile sidebar`);

  const stepNames = [
    "01_identity_and_structure",
    "02_scale_and_student_profile",
    "03_governance_and_research",
    "04_digital_infrastructure",
    "05_ai_posture_and_readiness"
  ];

  for (let i = 0; i < Math.min(stepCount, 5); i++) {
    console.log(`Navigating to Profile Step ${i + 1}...`);
    await stepButtons.nth(i).click();
    await page.waitForTimeout(1000);
    const fname = `profile_step_${stepNames[i] || (i + 1)}.png`;
    await snap(fname, 800);
  }

  // 3. Capture Domain Assessment Questions (One by One)
  console.log("3. Capturing Domain Questions...");
  
  // Domain 1: Strategy & Foresight
  await page.goto(`${BASE_URL}/assessment/D01`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await snap("domain_d01_strategy_questions.png", 1000);

  // Domain 2: Governance & Institutional Risk
  await page.goto(`${BASE_URL}/assessment/D02`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await snap("domain_d02_governance_questions.png", 1000);

  // Domain 3: Human Capability & Cognitive Readiness
  await page.goto(`${BASE_URL}/assessment/D03`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await snap("domain_d03_human_capability_questions.png", 1000);

  // Evidence Vault Matrix
  await page.goto(`${BASE_URL}/evidence`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await snap("evidence_document_and_metrics_mapping.png", 1000);

  console.log("🎉 All granular steps and question screens captured!");
  await browser.close();
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
