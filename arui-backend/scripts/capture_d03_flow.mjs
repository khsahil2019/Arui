import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "/Users/sahilkhan/.gemini/antigravity-ide/brain/ff96f239-e009-415d-ac97-f52d10fe3688/screenshots/d03_human_capability";
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:8080";

async function main() {
  console.log("🚀 Starting D03: Human Capability Deep-Dive Capture with Real Filled Data...");
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

  // 1. Authenticate
  console.log("1. Authenticating Admin...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill("sahilkh3014@gmail.com");
  await passInput.fill("123456");
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(2000);

  // 2. Navigate to D03 Assessment
  console.log("2. Loading D03: Human Capability & Cognitive Readiness...");
  await page.goto(`${BASE_URL}/assessment/D03`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Screen 1: Initial Prompt / Question List on D03
  await snap("01_d03_overview_and_first_prompt.png", 1000);

  // Question 1: d03-01 (Capability Architecture Selection)
  console.log("Filling Question 1 (d03-01: Graduate Capabilities Selection)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-01`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  // Select key capability options
  const choiceCards = page.locator('button[role="checkbox"], input[type="checkbox"], label:has(input[type="checkbox"]), button:has(.size-4), [data-choice]');
  const choiceCount = await choiceCards.count();
  console.log(`Found ${choiceCount} choice items for d03-01`);
  for (let i = 0; i < Math.min(choiceCount, 6); i++) {
    try {
      await choiceCards.nth(i).click({ timeout: 1000 });
      await page.waitForTimeout(150);
    } catch (e) {}
  }
  await snap("02_d03_q1_capabilities_selected.png", 1000);

  // Question 2: d03-02 (Matrix Mapping)
  console.log("Filling Question 2 (d03-02: Matrix Mapping)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-02`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  // Click matrix checkboxes
  const matrixChecks = page.locator('table input[type="checkbox"], table button[role="checkbox"], td button, td [type="checkbox"]');
  const matrixCount = await matrixChecks.count();
  console.log(`Found ${matrixCount} matrix cells in d03-02`);
  for (let i = 0; i < Math.min(matrixCount, 12); i++) {
    try {
      await matrixChecks.nth(i).click({ timeout: 1000 });
      await page.waitForTimeout(100);
    } catch (e) {}
  }
  await snap("03_d03_q2_matrix_mapping_filled.png", 1000);

  // Question 3: d03-03 (Demonstration & Evidence)
  console.log("Filling Question 3 (d03-03: Evidence & Demonstration)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-03`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const noteInputs = page.locator('textarea, input[type="text"]').first();
  if (await noteInputs.count() > 0) {
    await noteInputs.fill("Critical Thinking Rubric v2.1, Capstone Viva Project Guidelines, AI Output Verification Protocols");
  }
  await snap("04_d03_q3_evidence_demonstration.png", 1000);

  // Question 4: d03-04 (Demonstration Requirements Matrix)
  console.log("Filling Question 4 (d03-04: Demonstration Requirements)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-04`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("05_d03_q4_demonstration_matrix.png", 1000);

  // Question 5: d03-05 (Verification & Problem Formulation)
  console.log("Filling Question 5 (d03-05: AI Verification Activities)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-05`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const textareas = page.locator('textarea, input[type="text"]');
  if (await textareas.count() > 0) {
    await textareas.first().fill("Computer Science & Data Ethics (CS402) — Students audit LLM hallucination in automated grading models");
  }
  await snap("06_d03_q5_verification_activities.png", 1000);

  // Question 6: d03-06 (Non-Technical Disciplines)
  console.log("Capturing Question 6 (d03-06: Non-Technical Disciplines)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-06`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("07_d03_q6_non_technical_disciplines.png", 1000);

  // Question 7: d03-07 (Metacognition & Student Agency)
  console.log("Capturing Question 7 (d03-07: Metacognition & Agency)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-07`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("08_d03_q7_metacognition_and_agency.png", 1000);

  // Question 8: d03-08 (AI Literacy & Curriculum Framework)
  console.log("Capturing Question 8 (d03-08: AI Literacy Framework)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-08`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("09_d03_q8_ai_literacy_curriculum.png", 1000);

  // Question 9: d03-09 (Continuous Capability Review)
  console.log("Capturing Question 9 (d03-09: Capability Review Cycle)...");
  await page.goto(`${BASE_URL}/assessment/D03?p=d03-09`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await snap("10_d03_q9_continuous_review.png", 1000);

  console.log("🎉 Domain D03: Human Capability full workflow captured with filled interactive controls!");
  await browser.close();
}

main().catch((err) => {
  console.error("D03 capture failed:", err);
  process.exit(1);
});
