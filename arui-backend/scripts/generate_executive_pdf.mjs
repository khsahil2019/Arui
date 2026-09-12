import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const imagesDir = "/Users/sahilkhan/FlutterDev/Arui/arui_hd_screenshots";

const steps = [
  {
    num: "01",
    phase: "Phase 1: Authentication",
    title: "Institutional Administrator Sign-In",
    url: "https://arui.org/login",
    desc: "Secure role-based entry point for institutional leadership and auditors.",
    data: [
      { label: "Account", value: "sahilkh3014@gmail.com" },
      { label: "Role", value: "Institutional Administrator" },
      { label: "Assigned Institution", value: "Apex National University" }
    ],
    img: "01_Login_Authentication_Admin.png"
  },
  {
    num: "02",
    phase: "Phase 2: Executive Cockpit",
    title: "Executive Overview Dashboard & Maturity Radar",
    url: "https://arui.org/overview",
    desc: "High-level institutional diagnostic reading displaying the aggregate AI Resilience Index, 11-domain radar visualization, and stage progress.",
    data: [
      { label: "Assessment Cycle", value: "2026 Baseline" },
      { label: "Methodology Version", value: "v4.0 Full Scope" },
      { label: "Overall Readiness", value: "Stage: Domain Assessment Active" }
    ],
    img: "02_Executive_Overview_Dashboard_Radar.png"
  },
  {
    num: "03",
    phase: "Phase 3: Profile Setup (Step 1/4)",
    title: "Institutional Identity & Legal Structure (IP01–IP08)",
    url: "https://arui.org/profile?step=identity",
    desc: "Baseline calibration of institutional legal form, operational mandate, location tier, and multi-campus structure.",
    data: [
      { label: "IP01 Legal Name", value: "Apex National University" },
      { label: "IP02 University Type", value: "Comprehensive University" },
      { label: "IP03 Mandate", value: "Teaching + High-Impact Research" },
      { label: "IP06 Location", value: "Tier 1 Metro (Delhi NCR)" }
    ],
    img: "03_Institutional_Profile_Step1_Identity_Legal.png"
  },
  {
    num: "04",
    phase: "Phase 3: Profile Setup (Step 2/4)",
    title: "Scale, Demographics & Student Headcount (IP09–IP14)",
    url: "https://arui.org/profile?step=scale",
    desc: "Detailed student enrollment volume across undergraduate, postgraduate, and PhD levels, plus full faculty headcount.",
    data: [
      { label: "IP09 UG Students", value: "18,500 Full-Time" },
      { label: "IP10 PG Students", value: "4,200 Masters Candidates" },
      { label: "IP11 Doctoral", value: "850 PhD Scholars" },
      { label: "IP14 Faculty Size", value: "1,120 Academic Staff" }
    ],
    img: "04_Institutional_Profile_Step2_Scale_Demographics.png"
  },
  {
    num: "05",
    phase: "Phase 3: Profile Setup (Step 3/4)",
    title: "Governance, Faculty & Research Intensity (IP15–IP19)",
    url: "https://arui.org/profile?step=governance",
    desc: "Evaluation of full-time faculty ratios, Student-to-Faculty Ratio (SFR), annual research grant volume, and accreditation ratings.",
    data: [
      { label: "IP15 Faculty Tenured", value: "88% Full-Time" },
      { label: "IP16 SFR Ratio", value: "18:1 Student-to-Faculty" },
      { label: "IP17 Research Grants", value: "₹45 Cr Annual Sponsored" },
      { label: "IP19 Accreditation", value: "NAAC A++ / NIRF Top 25" }
    ],
    img: "05_Institutional_Profile_Step3_Governance_Research.png"
  },
  {
    num: "06",
    phase: "Phase 3: Profile Setup (Step 4/4)",
    title: "Digital Infrastructure & Computing Readiness (IP20–IP23)",
    url: "https://arui.org/profile?step=infrastructure",
    desc: "Measures campus fiber bandwidth, enterprise LMS rollout, GPU computing clusters, and dedicated AI research labs.",
    data: [
      { label: "IP20 Fiber Backbone", value: "10 Gbps Redundant" },
      { label: "IP21 LMS Platform", value: "Universal Canvas SIS" },
      { label: "IP22 Compute Facility", value: "NVIDIA H100 Cluster" },
      { label: "IP23 AI Labs", value: "4 Specialized Centres" }
    ],
    img: "06_Institutional_Profile_Step4_Digital_Infrastructure.png"
  },
  {
    num: "07",
    phase: "Phase 4: Methodology Framework",
    title: "Methodology Domains Matrix (All 11 Domains)",
    url: "https://arui.org/assessment",
    desc: "Comprehensive matrix displaying all 11 methodology domains (D01 Strategy to D11 Adaptability) with capability counts.",
    data: [
      { label: "Total Domains", value: "11 Distinct Dimensions" },
      { label: "Total Capabilities", value: "143 Core Capabilities" },
      { label: "Metrics & Anchors", value: "143 Metrics / 57 Anchors" }
    ],
    img: "07_Assessment_Domains_Matrix_11Domains.png"
  },
  {
    num: "08",
    phase: "Phase 5: Strategy & Direction",
    title: "Domain D01: Strategy, Foresight & Direction",
    url: "https://arui.org/assessment/D01",
    desc: "Evaluates executive steering roadmaps, institutional AI vision, leadership alignment, and capital resource allocation.",
    data: [
      { label: "Domain Code", value: "D01 · Strategy" },
      { label: "Leadership Charter", value: "Executive Council Mandate" },
      { label: "Target Scope", value: "5-Year Strategic AI Vision" }
    ],
    img: "08_Domain_D01_Strategy_Foresight_Questions.png"
  },
  {
    num: "09",
    phase: "Phase 6: Governance & Ethics",
    title: "Domain D02: Governance, Responsible AI & Institutional Risk",
    url: "https://arui.org/assessment/D02",
    desc: "Evaluates university policy frameworks, AI risk registers, ethical review boards, and privacy compliance standards.",
    data: [
      { label: "Domain Code", value: "D02 · Governance" },
      { label: "Ethics Committee", value: "Standing AI Safety Board" },
      { label: "Data Protection", value: "DPDP / Institutional Policy" }
    ],
    img: "09_Domain_D02_Governance_Ethics_Risk.png"
  },
  {
    num: "10",
    phase: "Phase 7: Human Capability (Q1)",
    title: "D03.Q01: Graduate Capabilities Architecture",
    url: "https://arui.org/assessment/D03?p=Q01",
    desc: "Selection of explicit graduate attributes and cognitive competencies committed by the university in the AI era.",
    data: [
      { label: "Key Selections", value: "AI Governance, Faculty Pathways, Disciplinary AI Literacy" },
      { label: "Evidence Hint", value: "Official Committee Minutes & Rubrics" },
      { label: "Response State", value: "Answered & Verified" }
    ],
    img: "10_Domain_D03_Q01_Graduate_Capabilities_Architecture.png"
  },
  {
    num: "11",
    phase: "Phase 7: Human Capability (Q2)",
    title: "D03.Q02: Faculty Readiness & Matrix Mapping",
    url: "https://arui.org/assessment/D03?p=Q02",
    desc: "Multi-dimensional matrix mapping where capabilities are intended, developed, demonstrated, and assessed.",
    data: [
      { label: "Matrix Columns", value: "Intended, Developed, Demonstrated, Assessed" },
      { label: "Programme Scope", value: "Cross-Faculty Representative Sample" },
      { label: "Autosave", value: "Persisted Automatically" }
    ],
    img: "11_Domain_D03_Q02_Faculty_Readiness_Matrix_Mapping.png"
  },
  {
    num: "12",
    phase: "Phase 7: Human Capability (Q3)",
    title: "D03.Q03: Authentic Capability Demonstration & Work Samples",
    url: "https://arui.org/assessment/D03?p=Q03",
    desc: "Evidence submission linking representative student work samples to claimed graduate competencies.",
    data: [
      { label: "Submitted Artifacts", value: "Critical Thinking Rubric v2.1, Capstone Viva Guidelines" },
      { label: "Vault Linkage", value: "Evidence Locker Associated" }
    ],
    img: "12_Domain_D03_Q03_Authentic_Capability_Demonstration.png"
  },
  {
    num: "13",
    phase: "Phase 7: Human Capability (Q4)",
    title: "D03.Q04: Assessment Security, Rubrics & Criteria",
    url: "https://arui.org/assessment/D03?p=Q04",
    desc: "Examination of assessment mechanisms ensuring authentic capability demonstration rather than automated answer generation.",
    data: [
      { label: "Assessment Methods", value: "Oral Defence (Viva), Process Documentation, Reflection" },
      { label: "Rubric Criteria", value: "Authentic Capability Scales" }
    ],
    img: "13_Domain_D03_Q04_Assessment_Security_Rubrics.png"
  },
  {
    num: "14",
    phase: "Phase 7: Human Capability (Q5)",
    title: "D03.Q05: AI Verification Activities & Critical Thinking",
    url: "https://arui.org/assessment/D03?p=Q05",
    desc: "Documenting curricular modules where students explicitly audit, test, and contextualize LLM output.",
    data: [
      { label: "Course Record", value: "CS402: Data Ethics & LLM Hallucination Audit Lab" },
      { label: "Activity Type", value: "Critical Model Verification" }
    ],
    img: "14_Domain_D03_Q05_AI_Verification_Activities.png"
  },
  {
    num: "15",
    phase: "Phase 7: Human Capability (Q6–Q9)",
    title: "D03.Q06–Q09: Disciplinary AI, Metacognition & Review",
    url: "https://arui.org/assessment/D03?p=Q06",
    desc: "Comprehensive evaluation of cross-discipline AI integration, student intellectual agency, foundational literacy tiers, and governance reviews.",
    data: [
      { label: "Disciplinary Scope", value: "Law, Humanities & Creative Arts" },
      { label: "Literacy Framework", value: "Mandatory Universal Foundation Tier" },
      { label: "Review Cycle", value: "Annual Standing Review Board" }
    ],
    img: "15_Domain_D03_Q06_NonTechnical_Disciplinary_AI.png"
  },
  {
    num: "16",
    phase: "Phase 8: Evidence & Intelligence",
    title: "Evidence Locker & Multi-Metric Document Linking",
    url: "https://arui.org/evidence",
    desc: "Central repository of official institutional verification files linked to claimed metrics for external assessor verification.",
    data: [
      { label: "Repository State", value: "Active Uploaded Files" },
      { label: "Metric Linkages", value: "Many-to-Many Associated" },
      { label: "Audit Readiness", value: "Certified for Assessor Review" }
    ],
    img: "20_Evidence_Locker_MultiMetric_Mapping.png"
  },
  {
    num: "17",
    phase: "Phase 9: Diagnostic Intelligence",
    title: "Institutional Intelligence & Gap Analysis Roadmap",
    url: "https://arui.org/intelligence",
    desc: "Algorithmic diagnostics computing prioritized capability interventions, peer benchmarks, and quarterly implementation roadmaps.",
    data: [
      { label: "Prioritized Actions", value: "Identified Key Critical Gaps" },
      { label: "Strategic Roadmap", value: "Quarterly Target Execution Plan" }
    ],
    img: "21_Intelligence_Gap_Analysis_Roadmap.png"
  },
  {
    num: "18",
    phase: "Phase 10: Longitudinal Pulse",
    title: "Longitudinal Pulse & Capability Tracking",
    url: "https://arui.org/pulse",
    desc: "Tracks progression across multi-year assessment cycles, visualizing institutional maturity improvements over time.",
    data: [
      { label: "Tracking Type", value: "Quarterly Longitudinal" },
      { label: "Baseline Score", value: "2026 Diagnostic Cycle" }
    ],
    img: "22_Longitudinal_Pulse_Tracker.png"
  },
  {
    num: "19",
    phase: "Phase 11: Assessor Workflow (Step 1/6)",
    title: "Assessor Workspace & Institutional Queue",
    url: "https://arui.org/assessor",
    desc: "Certified external auditor dashboard showing review queues, submission milestones, and assigned universities.",
    data: [
      { label: "Auditor Account", value: "assessor@arui.org" },
      { label: "Assigned Institution", value: "Apex National University" },
      { label: "Status", value: "Under Independent Review" }
    ],
    img: "23_Assessor_Workspace_Queue.png"
  },
  {
    num: "20",
    phase: "Phase 12: Assessor Workflow (Step 2/6)",
    title: "Assessor Institutional Context Audit",
    url: "https://arui.org/assessor/987516bd-f4ac-4bac-8040-5089f586d347/context",
    desc: "Auditors validate institutional scale and operational parameters to calibrate scoring weightings and benchmark standards.",
    data: [
      { label: "Context Factors", value: "Scale, Student Body & Research" },
      { label: "Calibration", value: "Benchmark Factors Adjusted" }
    ],
    img: "24_Assessor_Context_Audit.png"
  },
  {
    num: "21",
    phase: "Phase 13: Assessor Workflow (Step 3/6)",
    title: "Domain Response Audit & Anti-Gaming Verification",
    url: "https://arui.org/assessor/987516bd-f4ac-4bac-8040-5089f586d347/responses",
    desc: "Audits self-reported claims against 10 anti-gaming rules and 413 cross-domain consistency checks.",
    data: [
      { label: "Anti-Gaming Checks", value: "10 Algorithmic Rules Validated" },
      { label: "Cross-Domain Rules", value: "413 Automated Consistency Rules" }
    ],
    img: "25_Assessor_AntiGaming_Response_Audit.png"
  },
  {
    num: "22",
    phase: "Phase 14: Assessor Workflow (Step 4/6)",
    title: "Evidence Verification Matrix & Documentation Audit",
    url: "https://arui.org/assessor/987516bd-f4ac-4bac-8040-5089f586d347/evidence",
    desc: "Assessors review uploaded evidence artifacts, confirming or rejecting claimed capabilities with justification notes.",
    data: [
      { label: "Evidence Audit", value: "Confirmed / Rejected Verification" },
      { label: "Audit Notes", value: "Official Assessor Feedback Logged" }
    ],
    img: "26_Assessor_Evidence_Verification_Matrix.png"
  },
  {
    num: "23",
    phase: "Phase 15: Assessor Workflow (Step 5/6)",
    title: "Assessor Final Calibration & Certified Scoring Sign-Off",
    url: "https://arui.org/assessor/987516bd-f4ac-4bac-8040-5089f586d347/scoring",
    desc: "Auditor finalizes domain maturity grades, inputs executive certification remarks, and issues the certified assessment score.",
    data: [
      { label: "Certification", value: "Certified Maturity Grade Issued" },
      { label: "Sign-Off", value: "Formal Assessor Authorization" }
    ],
    img: "27_Assessor_Final_Calibration_Scoring.png"
  },
  {
    num: "24",
    phase: "Phase 16: Assessor Workflow (Step 6/6)",
    title: "Algorithmic Execution Runs & Immutable Audit Log",
    url: "https://arui.org/assessor/987516bd-f4ac-4bac-8040-5089f586d347/runs",
    desc: "Immutable system timeline recording engine calculation runs, status changes, calibration overrides, and timestamps.",
    data: [
      { label: "Audit Log", value: "Cryptographically Verified Timeline" },
      { label: "Engine Runs", value: "Fully Tracked & Traceable" }
    ],
    img: "28_Assessor_Execution_Runs_Audit_Log.png"
  }
];

function generateHtml() {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ARUI Institutional Assessment Master Guide</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
    }

    /* Cover Page */
    .cover-page {
      height: 260mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30mm 15mm 20mm;
      page-break-after: always;
      background: linear-gradient(135deg, #090e17 0%, #0f172a 100%);
      color: #ffffff;
      border-radius: 12px;
    }
    .cover-badge {
      display: inline-block;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 1px solid rgba(56, 189, 248, 0.3);
      width: fit-content;
    }
    .cover-title {
      font-size: 34px;
      font-weight: 800;
      line-height: 1.2;
      margin: 20px 0 15px;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .cover-subtitle {
      font-size: 16px;
      color: #94a3b8;
      max-width: 580px;
      line-height: 1.6;
    }
    .cover-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 40px;
      padding-top: 25px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .cover-meta-item h4 {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .cover-meta-item p {
      font-size: 14px;
      color: #f8fafc;
      font-weight: 600;
    }

    /* Content Step Page */
    .step-page {
      page-break-after: always;
      padding-top: 5mm;
      height: 265mm;
      display: flex;
      flex-direction: column;
    }
    .step-page:last-child {
      page-break-after: avoid;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .phase-tag {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #0284c7;
      background: #e0f2fe;
      padding: 3px 10px;
      border-radius: 4px;
    }
    .step-num-badge {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      font-family: monospace;
    }

    .title-row {
      margin-bottom: 10px;
    }
    .step-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .step-desc {
      font-size: 12px;
      color: #475569;
      margin-top: 3px;
      line-height: 1.4;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
      font-size: 11px;
    }
    .data-table td {
      padding: 5px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table tr:last-child td {
      border-bottom: none;
    }
    .data-table td.label {
      font-weight: 700;
      color: #334155;
      width: 32%;
      background: #f1f5f9;
    }
    .data-table td.val {
      color: #0f172a;
      font-family: monospace;
      font-weight: 500;
    }

    .screenshot-container {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      max-height: 180mm;
    }
    .browser-header {
      height: 24px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 10px;
    }
    .dots {
      display: flex;
      gap: 4px;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .d-red { background: #ef4444; }
    .d-yellow { background: #f59e0b; }
    .d-green { background: #10b981; }
    .url-bar {
      font-family: monospace;
      font-size: 9px;
      color: #94a3b8;
      background: #090e17;
      padding: 2px 8px;
      border-radius: 3px;
      border: 1px solid #334155;
      flex: 1;
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .screenshot-container img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: top center;
      background: #000;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div>
      <div class="cover-badge">Executive Assessment Dossier</div>
      <h1 class="cover-title">AI Resilient University<br>(ARUI) Framework</h1>
      <p class="cover-subtitle">Complete end-to-end operational walkthrough and visual verification guide. Covering whole-institution profiling, 11-domain capability diagnostics, authentic assessment security, and independent assessor certification.</p>
    </div>

    <div>
      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <h4>Assessed Institution</h4>
          <p>Apex National University</p>
        </div>
        <div class="cover-meta-item">
          <h4>Methodology Scope</h4>
          <p>ARUI v4.0 (D01–D11 Core & Pulse)</p>
        </div>
        <div class="cover-meta-item">
          <h4>Lead Administrator</h4>
          <p>Sahil Khan (sahilkh3014@gmail.com)</p>
        </div>
        <div class="cover-meta-item">
          <h4>Certification Cycle</h4>
          <p>2026 Comprehensive Baseline</p>
        </div>
      </div>
    </div>
  </div>
`;

  for (const s of steps) {
    const imgPath = path.join(imagesDir, s.img);
    let imgSrc = "";
    if (fs.existsSync(imgPath)) {
      const base64 = fs.readFileSync(imgPath).toString("base64");
      imgSrc = `data:image/png;base64,${base64}`;
    }

    const rowsHtml = s.data.map(d => `<tr><td class="label">${d.label}</td><td class="val">${d.value}</td></tr>`).join("");

    html += `
  <div class="step-page">
    <div class="header-bar">
      <span class="phase-tag">${s.phase}</span>
      <span class="step-num-badge">STEP ${s.num} OF 24</span>
    </div>

    <div class="title-row">
      <h2 class="step-title">${s.title}</h2>
      <p class="step-desc">${s.desc}</p>
    </div>

    <table class="data-table">
      ${rowsHtml}
    </table>

    <div class="screenshot-container">
      <div class="browser-header">
        <div class="dots"><span class="dot d-red"></span><span class="dot d-yellow"></span><span class="dot d-green"></span></div>
        <div class="url-bar">🔒 ${s.url}</div>
      </div>
      <img src="${imgSrc}" alt="${s.title}">
    </div>
  </div>
`;
  }

  html += `
</body>
</html>`;

  return html;
}

async function main() {
  console.log("🎨 Building Executive PDF Layout with Base64 Images...");
  const htmlContent = generateHtml();
  const tempHtmlPath = "/Users/sahilkhan/FlutterDev/Arui/temp_executive_pdf.html";
  fs.writeFileSync(tempHtmlPath, htmlContent);

  console.log("📄 Launching Chromium to generate Executive PDF...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const outputPath = "/Users/sahilkhan/FlutterDev/Arui/ARUI_Institutional_Assessment_Master_Guide.pdf";
  const artifactPath = "/Users/sahilkhan/.gemini/antigravity-ide/brain/ff96f239-e009-415d-ac97-f52d10fe3688/ARUI_Institutional_Assessment_Master_Guide.pdf";

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      bottom: "10mm",
      left: "10mm",
      right: "10mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `<div style="font-size: 8px; color: #64748b; width: 100%; display: flex; justify-content: space-between; padding: 0 10mm; font-family: -apple-system, sans-serif;"><span>Apex National University · ARUI 2026 Baseline</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
  });

  fs.copyFileSync(outputPath, artifactPath);

  if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);

  console.log(`🎉 Master Executive PDF successfully generated at: ${outputPath}`);
  await browser.close();
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
