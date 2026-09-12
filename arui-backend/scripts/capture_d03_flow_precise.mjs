import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = "/Users/sahilkhan/.gemini/antigravity-ide/brain/ff96f239-e009-415d-ac97-f52d10fe3688/screenshots/d03_human_capability";
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const BASE_URL = "http://localhost:8080";

async function main() {
  console.log("🚀 Capturing D03: Human Capability Question-by-Question with Real Filled Selections...");
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

  // 2. Questions on D03: Q01 to Q09
  const prompts = ["Q01", "Q02", "Q03", "Q04", "Q05", "Q06", "Q07", "Q08", "Q09"];
  const promptDescriptions = [
    "01_q01_graduate_capabilities_architecture",
    "02_q02_faculty_cognitive_readiness",
    "03_q03_authentic_capability_demonstration",
    "04_q04_assessment_security_and_rubrics",
    "05_q05_ai_verification_and_critical_thinking",
    "06_q06_non_technical_disciplinary_integration",
    "07_q07_metacognitive_student_agency",
    "08_q08_ai_literacy_curriculum_pathways",
    "09_q09_continuous_capability_governance"
  ];

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    const label = promptDescriptions[i];
    console.log(`Navigating to D03 Prompt ${p} (${label})...`);
    await page.goto(`${BASE_URL}/assessment/D03?p=${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // Click interactive answer options to show active selection states
    const clickableOptions = page.locator('button[role="radio"], button[role="checkbox"], label:has(input), [data-state], button:has-text("Institutional"), button:has-text("Structured"), button:has-text("Disciplinary")');
    const optCount = await clickableOptions.count();
    if (optCount > 0) {
      try {
        await clickableOptions.first().click({ timeout: 1000 });
        if (optCount > 1) await clickableOptions.nth(1).click({ timeout: 1000 });
      } catch (e) {}
    }

    // If textarea exists, add notes
    const textareas = page.locator('textarea, input[type="text"]:not([type="password"])');
    if (await textareas.count() > 0) {
      try {
        await textareas.first().fill("Demonstrated across School of Computing & Engineering and Faculty of Arts & Sciences with verified rubric criteria.");
      } catch (e) {}
    }

    await snap(`d03_${label}.png`, 800);
  }

  // 3. Domain D03 Completion & Readiness Summary
  console.log("Capturing D03 Summary View...");
  await page.goto(`${BASE_URL}/assessment/D03`, { waitUntil: "networkidle" });
  await snap("d03_10_domain_summary_and_all_questions_list.png", 1000);

  console.log("🎉 Complete D03: Human Capability & Cognitive Readiness captured!");
  await browser.close();
}

main().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
