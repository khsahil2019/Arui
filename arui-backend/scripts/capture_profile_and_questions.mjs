import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_ARTIFACT_DIR = "/Users/sahilkhan/.gemini/antigravity-ide/brain/ff96f239-e009-415d-ac97-f52d10fe3688/screenshots/detailed_steps";
if (!fs.existsSync(BASE_ARTIFACT_DIR)) {
  fs.mkdirSync(BASE_ARTIFACT_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:8080";

async function main() {
  console.log("🚀 Starting Granular Step-by-Step & Question-by-Question Capture...");
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
    const targetPath = path.join(BASE_ARTIFACT_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: false });
    console.log(`📸 Saved: ${filename}`);
  }

  async function snapFull(filename, delay = 1000) {
    await page.waitForTimeout(delay);
    const targetPath = path.join(BASE_ARTIFACT_DIR, filename);
    await page.screenshot({ path: targetPath, fullPage: true });
    console.log(`📸 Saved (Full Page): ${filename}`);
  }

  // 1. Sign in
  console.log("Signing in as Institutional Admin...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill("sahilkh3014@gmail.com");
  await passInput.fill("123456");
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(2000);

  // 2. Navigating to Institutional Profile
  console.log("Navigating to /profile...");
  await page.goto(`${BASE_URL}/profile`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Profile Steps capture:
  // Step 1: Institutional Identity
  console.log("Capturing Profile Step 1 (Identity)...");
  await snapFull("profile_step_01_identity.png", 1000);

  // Click Step 2: Mandate & Scale
  const stepButtons = page.locator('aside button, aside [role="button"], aside nav button');
  const count = await stepButtons.count();
  console.log(`Found ${count} step buttons in sidebar`);

  // Let's use Next button or click steps
  const nextBtn = page.locator('button:has-text("Next"), button:has-text("Save & Continue")').last();

  if (await nextBtn.count() > 0) {
    // Step 2
    await nextBtn.click();
    await page.waitForTimeout(1000);
    console.log("Capturing Profile Step 2...");
    await snapFull("profile_step_02_scale_students.png", 1000);

    // Step 3
    await nextBtn.click();
    await page.waitForTimeout(1000);
    console.log("Capturing Profile Step 3...");
    await snapFull("profile_step_03_governance_research.png", 1000);

    // Step 4
    await nextBtn.click();
    await page.waitForTimeout(1000);
    console.log("Capturing Profile Step 4...");
    await snapFull("profile_step_04_digital_infra.png", 1000);

    // Step 5
    await nextBtn.click();
    await page.waitForTimeout(1000);
    console.log("Capturing Profile Step 5...");
    await snapFull("profile_step_05_ai_posture.png", 1000);
  }

  // 3. Questions Deep-Dive in Domain Assessment
  console.log("Navigating to Domain D01 Assessment Questions...");
  await page.goto(`${BASE_URL}/assessment/D01`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await snapFull("domain_d01_all_questions.png", 1500);

  // Capture individual questions on D01 if there are cards / pagination
  const questionCards = page.locator('[data-testid="question-card"], .space-y-10 > div, article');
  const cardCount = await questionCards.count();
  console.log(`Found ${cardCount} question cards/sections on D01`);

  // Let's capture Domain D02 questions
  console.log("Navigating to Domain D02 Governance Questions...");
  await page.goto(`${BASE_URL}/assessment/D02`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await snapFull("domain_d02_governance_questions.png", 1500);

  // Let's capture Domain D03 Capability Questions
  console.log("Navigating to Domain D03 Questions...");
  await page.goto(`${BASE_URL}/assessment/D03`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await snapFull("domain_d03_capability_questions.png", 1500);

  console.log("✅ All detailed steps and question pages captured successfully!");
  await browser.close();
}

main().catch((err) => {
  console.error("Error executing detailed capture:", err);
  process.exit(1);
});
