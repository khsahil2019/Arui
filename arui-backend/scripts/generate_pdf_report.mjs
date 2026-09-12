import { chromium } from "playwright";
import path from "path";

async function main() {
  console.log("📄 Generating High-Resolution Master Assessment Walkthrough PDF...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 1080 },
    deviceScaleFactor: 2,
  });

  const url = "http://localhost:4000/walkthrough";
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const outputPath = "/Users/sahilkhan/FlutterDev/Arui/ARUI_Institutional_Assessment_Master_Guide.pdf";
  const artifactPath = "/Users/sahilkhan/.gemini/antigravity-ide/brain/ff96f239-e009-415d-ac97-f52d10fe3688/ARUI_Institutional_Assessment_Master_Guide.pdf";

  console.log("Rendering PDF with print layout...");
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "12mm",
      bottom: "12mm",
      left: "12mm",
      right: "12mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 8px; color: #64748b; width: 100%; text-align: right; padding: 0 12mm; font-family: 'Helvetica Neue', sans-serif;">ARUI Institutional AI Resilience Assessment — Master Guide</div>`,
    footerTemplate: `<div style="font-size: 8px; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding: 0 12mm; font-family: 'Helvetica Neue', sans-serif;"><span>Apex National University · 2026 Baseline</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  });

  // Also copy to brain artifact directory
  await page.pdf({
    path: artifactPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "12mm",
      bottom: "12mm",
      left: "12mm",
      right: "12mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 8px; color: #64748b; width: 100%; text-align: right; padding: 0 12mm; font-family: 'Helvetica Neue', sans-serif;">ARUI Institutional AI Resilience Assessment — Master Guide</div>`,
    footerTemplate: `<div style="font-size: 8px; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding: 0 12mm; font-family: 'Helvetica Neue', sans-serif;"><span>Apex National University · 2026 Baseline</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  });

  console.log(`✅ Master PDF generated successfully at: ${outputPath}`);
  await browser.close();
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
