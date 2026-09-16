import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.join(__dirname, 'ecri_registry');

const dimensions = [
  {
    code: 'D01',
    name: 'Institutional Strategy, Employability Governance & Resourcing',
    purpose: 'Assesses the strategic commitment, leadership governance, budgetary allocation, and key performance indicators driving graduate employability across all academic faculties.',
    provisionalWeight: 0.10
  },
  {
    code: 'D02',
    name: 'Industry Ecosystem, Partnerships & Employer Integration',
    purpose: 'Evaluates the breadth, depth, and institutionalization of corporate partnerships, advisory boards, joint research/innovation labs, and recurring employer engagement.',
    provisionalWeight: 0.11
  },
  {
    code: 'D03',
    name: 'Curriculum Co-Design, Skills Forecasting & Modernization',
    purpose: 'Measures structured industry participation in syllabus design, dynamic responsiveness to labor market shifts, emerging technologies, and continuous curriculum renewal.',
    provisionalWeight: 0.11
  },
  {
    code: 'D04',
    name: 'Experiential Learning, Internships, Apprenticeships & Work-Integrated Learning',
    purpose: 'Evaluates credit-bearing mandatory internships, live industry capstone projects, simulated work environments, clinical rotations, and apprenticeships.',
    provisionalWeight: 0.12
  },
  {
    code: 'D05',
    name: 'Career Services, Guidance, Mentorship & Student Agency',
    purpose: 'Assesses professional career counseling, 1-on-1 career navigation, industry mentorship networks, resume clinics, interview masterclasses, and student self-advocacy.',
    provisionalWeight: 0.10
  },
  {
    code: 'D06',
    name: 'Applied Competencies, Digital Proficiency & Transversal Skills',
    purpose: 'Measures institutional integration of critical thinking, high-order problem solving, communication, leadership, ethical reasoning, and domain-specific digital tool fluencies.',
    provisionalWeight: 0.10
  },
  {
    code: 'D07',
    name: 'Assessment Integrity, Authentic Evaluation & Industry Certification',
    purpose: 'Evaluates real-world performance-based assessments, workplace problem-solving evaluations, oral vivas, and embedded industry credentials/micro-certifications.',
    provisionalWeight: 0.09
  },
  {
    code: 'D08',
    name: 'Entrepreneurship, Venture Creation & Innovation Ecosystem',
    purpose: 'Assesses institutional incubation infrastructure, seed funding, intellectual property commercialization support, student venture mentoring, and startup acceleration.',
    provisionalWeight: 0.08
  },
  {
    code: 'D09',
    name: 'Placement Architecture, Corporate Relations & Career Outcomes',
    purpose: 'Evaluates the institutional campus recruitment infrastructure, employer diversity, median CTC progression, premier employer conversion, and career placement outcomes.',
    provisionalWeight: 0.11
  },
  {
    code: 'D10',
    name: 'Alumni Engagement, Career Tracking & Lifelong Progression',
    purpose: 'Measures systematic long-term alumni career trajectory tracking (3-5-10 years), alumni mentorship contributions, continuous upskilling, and lifelong professional networks.',
    provisionalWeight: 0.04
  },
  {
    code: 'D11',
    name: 'Continuous Calibration, Evidence Intelligence & Labor Market Alignment',
    purpose: 'Assesses institutional analytics on graduate market performance, employer satisfaction audits, longitudinal impact assessment, and systemic feedback loops.',
    provisionalWeight: 0.04
  }
];

const metricTitles: Record<string, string[]> = {
  D01: [
    'Employability Strategic Mandate & Board Oversight',
    'Dedicated Career & Employability Budget Allocation',
    'Faculty KPI & Appraisal Alignment to Employability',
    'Cross-Faculty Employability Deans Council',
    'Institutional Employability Policy & Operational SOPs',
    'Strategic Industry Advisory Board at Governing Body Level',
    'Employability Infrastructure & Technology Investment',
    'Equal Opportunity & Inclusive Career Access Framework',
    'Faculty Upskilling & Industry Immersion Sabbaticals',
    'Institutional Student Employability Guarantee / Charter',
    'Employability Risk Management & Vulnerability Tracking',
    'Leadership Accountability & Board Review Cadence'
  ],
  D02: [
    'Strategic Tier-1 Corporate Partnerships & MoUs',
    'Active Corporate Advisory Councils per Academic Department',
    'Co-Branded Industry Labs & Specialized Innovation Centers',
    'Corporate Executive-in-Residence & Adjunct Faculty Program',
    'Industry-Funded Research, Consultancy & Student Grants',
    'Structured Annual Employer Roundtables & Skill Summits',
    'SME & High-Growth Startup Partner Network',
    'International Corporate Placement & Internship Linkages',
    'Public Sector & Non-Profit Leadership Linkages',
    'Industry Partner Feedback Review Cadence',
    'Partner Co-Investment & In-Kind Equipment Grants',
    'Corporate Partnership Longevity & Renewal Rate'
  ],
  D03: [
    'Mandatory Industry Review of Degree Curricula (Annual Cadence)',
    'Dynamic Skill Forecasting & Labor Market Intelligence Integration',
    'Modular Credit Systems & Elective Modernization Velocity',
    'Emerging Tech & AI Applied Literacy Across All Majors',
    'Industry-Sponsored Electives & Specialization Tracks',
    'Interdisciplinary Problem-Solving & Dual-Major Flexibility',
    'National Qualification Framework & Global Equivalence Alignment',
    'Practical / Lab-to-Theory Credit Weighting Ratio',
    'Green Economy, Sustainability & ESG Competency Integration',
    'Continuous Syllabus Sunsetting & Obsolete Topic Removal',
    'Industry-Endorsed Learning Outcomes per Course Module',
    'Faculty Course-File Co-Design Audits with Employers'
  ],
  D04: [
    'Mandatory Credit-Bearing Internship Policy (>12 Weeks)',
    'Work-Integrated Learning (WIL) Pedagogical Architecture',
    'Industry Live-Capstone Projects & Real-World Client Briefs',
    'Formalized Apprenticeship & Dual-Study Models',
    'Internship Stipend & Fair Compensation Safeguards',
    'Academic Mentorship & On-Site Corporate Supervision Quality',
    'Pre-Internship Professional Ethics & Workplace Readiness Bootcamps',
    'Internship Reflection, Logbook & Portfolio Assessment',
    'Post-Internship Pre-Placement Offer (PPO) Conversion Pipeline',
    'Virtual & Global Cross-Border Internship Framework',
    'Clinical / Practical Simulation Lab Immersions',
    'Internship Quality Assurance & Employer Site Audits'
  ],
  D05: [
    'Dedicated Career Services Center Staff-to-Student Ratio',
    'Comprehensive 4-Year Personalized Career Navigation Plans',
    'Structured 1-on-1 Career Counseling & Diagnostic Profiling',
    'Active Industry-Alumni Mentorship Pairing Program',
    'Professional Resume Clinics, ATS Optimization & Portfolios',
    'Mock Interviews, Technical Round Drills & Soft-Skills Coaching',
    'Career Intelligence Portal, Job Aggregator & AI Matchmaking',
    'Higher Studies & Competitive Examination Guidance Desk',
    'First-Generation & Underrepresented Student Career Support',
    'Student Career Ambassadors & Peer Learning Circles',
    'Career Center Longitudinal Student Satisfaction Tracking',
    'Career Literacy & Workplace Readiness Micro-Courses'
  ],
  D06: [
    'Transversal Skills (Critical Thinking, Communication, Collaboration)',
    'Domain Digital Proficiency & Software Tool Mastery',
    'Business Communication, Negotiation & Presentation Mastery',
    'Complex Problem Solving & Quantitative Reasoning',
    'Data Analytics, Visualization & Evidence-Based Decision Making',
    'Workplace Emotional Intelligence, Adaptability & Resilience',
    'Ethical Decision-Making, Governance & Professional Integrity',
    'Leadership, Team Management & Conflict Resolution',
    'Cross-Cultural Competence & Global Working Fluency',
    'Lifelong Self-Directed Learning & Meta-Learning Capability',
    'Design Thinking, Systems Thinking & Creative Prototyping',
    'Technical Writing, Reporting & Documentation Standards'
  ],
  D07: [
    'Authentic & Performance-Based Assessment Architecture',
    'Industry-Recognized Professional Micro-Credentials & Badges',
    'Viva Voce, Oral Defense & Client Pitch Assessments',
    'Live Industry Assessment Rubrics & Employer Evaluators',
    'Anti-Plagiarism & AI-Resilient Evaluation Security',
    'Real-World Case Study Analysis & Simulation Exams',
    'Multi-Disciplinary Hackathon & Innovation Challenge Credits',
    'Continuous Formative Feedback & Competency Mastery Tracking',
    'External Industry Moderator Review of Examination Papers',
    'Industry-Standard Code Repositories & Engineering Portfolios',
    'Standardized Skill Diagnostic Benchmarking (Pre/Post Entry)',
    'Assessment Transparency & Student Appeal Governance'
  ],
  D08: [
    'Institutional Technology Business Incubator (TBI) & Hub',
    'Dedicated Student Seed Funding & Venture Capital Access',
    'Faculty & Student Intellectual Property (IP) Commercialization Support',
    'Startup Mentorship Network with Founders & Angel Investors',
    'Entrepreneurship-in-Residence & Venture Accelerator Cohorts',
    'Academic Credits for Venture Creation & Startup Milestones',
    'Prototyping Labs, FabLabs & Rapid Prototyping Facilities',
    'Campus Entrepreneurship Clubs, Pitch Competitions & Demo Days',
    'Legal, Regulatory & Compliance Advisory Desk for Student Startups',
    'Women & Diversity-Led Enterprise Acceleration Initiatives',
    'Student Venture Revenue, Funding Raised & Survival Tracking',
    'Social Innovation & Community Enterprise Initiatives'
  ],
  D09: [
    'Tier-1 Campus Recruitment Infrastructure & Logistics',
    'Diversity of Visiting Employers (Core, Tech, Consulting, Public)',
    'Median CTC / Compensation Growth Trajectory',
    'High-Value Dream Offer & Super-Dream Offer Percentage',
    'Placement Conversion Rate for Eligible Graduates (>90% target)',
    'Corporate Relations Outreach Team & Sectoral Key Accounts',
    'Offer Integrity, Fair Placement Policy & Code of Conduct',
    'Salary Transparency, Audit Verification & Data Lineage',
    'Unplaced Student Intervention Clinics & Extended Support',
    'International Job Placement & Expatriate Opportunities',
    'Tier-2 / Tier-3 Regional and Remote Placement Access',
    'Employer Repeat-Hiring Retention Rate (>80% target)'
  ],
  D10: [
    'Institutional Alumni Career Tracking Database (3, 5, 10 Years)',
    'Alumni Giving, Endowment & Career Sponsorship Programs',
    'Alumni-Led Hiring, Exclusive Referrals & Job Boards',
    'Global Alumni Chapter Network & Professional Affinity Groups',
    'Alumni Mentorship Masterclasses & Executive Guest Series',
    'Distinguished Alumni Career Milestone Recognition Awards',
    'Lifelong Learning Alumni Auditing & Skill Refresh Access',
    'Alumni Startup Angel Syndicate & Co-Investment Circles',
    'Longitudinal Career Trajectory & Fast-Track Promotion Studies',
    'Alumni Net Promoter Score (NPS) on University Preparation',
    'Alumni Representation on Board of Studies and Academic Senate',
    'Alumni Career Transitions & Reskilling Advisory Support'
  ],
  D11: [
    'Annual Graduate Labor Market Outcome & Salary Audits',
    'Employer Satisfaction Index (ESI) Structured Longitudinal Audits',
    'Longitudinal Career Trajectory & Underemployment Analytics',
    'Macroeconomic & Sectoral Industry Skill Gap Diagnostics',
    'Real-Time Evidence Verification & Audit Integrity Layer',
    'Dean-Level Remediation Plans for Low-Performing Departments',
    'Publicly Disclosed Graduate Career Transparency Scorecard',
    'Benchmarking Against Top National & Global Peer Institutions',
    'Cross-Institutional Calibration & Assessor Adjudication Log',
    'Predictive AI Analytics on Student Placement Risk Profiles',
    'Evidence Repository Lineage, Authenticity & Verification System',
    'Comprehensive 3-Year Employability Strategy Impact Review'
  ]
};

export function generateEcriRegistry() {
  const metrics: any[] = [];
  const capabilities: any[] = [];
  
  dimensions.forEach((dim) => {
    const titles = metricTitles[dim.code];
    const capNames = [
      `${dim.name.split(',')[0]} Strategy & Framework`,
      `${dim.name.split(',')[0]} Implementation & Operations`,
      `${dim.name.split(',')[0]} Outcomes, Governance & Impact`
    ];
    for (let c = 1; c <= 3; c++) {
      const cCode = `C0${c}`;
      capabilities.push({
        domainCode: dim.code,
        code: cCode,
        fullCode: `${dim.code}-${cCode}`,
        name: capNames[c - 1]
      });
    }

    titles.forEach((title, idx) => {
      const mNum = (idx + 1).toString().padStart(2, '0');
      const mCode = `M${mNum}`;
      const fullCode = `${dim.code}-${mCode}`;
      
      const exposure = idx < 3 ? 'Critical' : (idx < 8 ? 'High' : 'Medium');
      const weight = exposure === 'Critical' ? 1.5 : (exposure === 'High' ? 1.2 : 1.0);
      
      metrics.push({
        domainCode: dim.code,
        code: mCode,
        fullCode: fullCode,
        name: title,
        whatMeasured: `Measures institutional maturity, structured operationalization, and verifiable graduate outcomes for: ${title}. Assesses presence of board policy, dedicated budget, operational execution, and verifiable institutional evidence.`,
        measurementMethod: `Assessor evaluates (M) Institutional Capability & Maturity (0-5), (I) Implementation & Coverage Depth (0-5), and (O) Graduate Outcomes & Employer Corroboration (0-5). Score = 100 * (0.45*M + 0.30*I + 0.25*O)/5.`,
        exposure: exposure,
        weight: weight,
        hasOutcome: true,
        sortOrder: idx + 1
      });
    });
  });

  const anchors = [
    {
      scope: 'ECRI_Global',
      level: 0,
      label: 'Absent / Non-Existent',
      description: 'No formalized policy, systematic mechanism, dedicated budget, or institutional execution exists. Activity is nonexistent or completely sporadic.'
    },
    {
      scope: 'ECRI_Global',
      level: 1,
      label: 'Reactive / Ad-hoc',
      description: 'Isolated informal initiatives exist within individual departments without institutional standardization, tracking, or dedicated leadership ownership.'
    },
    {
      scope: 'ECRI_Global',
      level: 2,
      label: 'Emerging / Localized',
      description: 'Documented policies and early frameworks exist in leading departments. Partial implementation with emerging evidence, but lacks campus-wide coverage.'
    },
    {
      scope: 'ECRI_Global',
      level: 3,
      label: 'Structured / Standardized',
      description: 'Formalized institutional framework operating across all academic units with dedicated budget, trained personnel, routine audits, and consistent verifiable evidence.'
    },
    {
      scope: 'ECRI_Global',
      level: 4,
      label: 'Integrated / Institutionalized',
      description: 'High-performing, fully integrated ecosystem. Co-designed with leading industry partners, measured against rigorous outcome benchmarks, and backed by high-confidence corroborated evidence.'
    },
    {
      scope: 'ECRI_Global',
      level: 5,
      label: 'Adaptive / Sector-Leading',
      description: 'Exemplary, sector-defining benchmark. Continuous labor market calibration, longitudinal impact tracking, proactive agile modernization, and national/global recognized excellence.'
    }
  ];

  const cards: any[] = [];
  const questions: any[] = [];
  let qCounter = 1;

  dimensions.forEach((dim) => {
    const cardDefs = [
      { code: `${dim.code}-CARD1`, name: `${dim.name} — Governance, Mandate & Policy`, format: 'Structural Framework & Leadership Verification', metricLink: `${dim.code}-M01` },
      { code: `${dim.code}-CARD2`, name: `${dim.name} — Operational Execution & Scale`, format: 'Operational Depth, Student Participation & Audit', metricLink: `${dim.code}-M05` },
      { code: `${dim.code}-CARD3`, name: `${dim.name} — Verifiable Outcomes & Impact`, format: 'Longitudinal Employer Outcomes & Impact Analysis', metricLink: `${dim.code}-M09` }
    ];

    cardDefs.forEach((cd, cIdx) => {
      cards.push({
        domainCode: dim.code,
        code: cd.code,
        name: cd.name,
        format: cd.format,
        respondentAction: 'Provide institutional evidence, operational metrics, and narrative self-assessment rating across governance, execution, and outcomes.',
        metricLink: cd.metricLink
      });

      for (let q = 1; q <= 2; q++) {
        const qCode = `${dim.code}-Q0${cIdx * 2 + q}`;
        
        questions.push({
          domainCode: dim.code,
          code: qCode,
          cardCode: cd.code,
          prompt: `How comprehensively does your institution implement and evaluate: ${metricTitles[dim.code][(cIdx * 4 + q * 2 - 1) % 12]}?`,
          inputType: q === 1 ? 'single' : 'matrix_likert',
          presentationKind: q === 1 ? 'single_choice' : 'matrix_likert',
          role: cIdx === 0 ? 'Screening' : 'Diagnostic',
          options: [
            { id: 'opt_0', label: 'Level 0: No formalized mechanism or policy in place (Absent)', scoreWeight: 0.0 },
            { id: 'opt_1', label: 'Level 1: Departmental ad-hoc initiatives without central framework (Reactive)', scoreWeight: 0.2 },
            { id: 'opt_2', label: 'Level 2: Documented policy in select faculties with initial tracking (Emerging)', scoreWeight: 0.4 },
            { id: 'opt_3', label: 'Level 3: Institution-wide formalized policy with dedicated resourcing (Structured)', scoreWeight: 0.6 },
            { id: 'opt_4', label: 'Level 4: Co-designed with corporate partners & verified outcome metrics (Integrated)', scoreWeight: 0.8 },
            { id: 'opt_5', label: 'Level 5: Sector-leading benchmark with continuous market calibration (Adaptive)', scoreWeight: 1.0 }
          ],
          sortOrder: qCounter++
        });
      }
    });
  });

  const evidenceRequirements: any[] = [];
  dimensions.forEach((dim) => {
    evidenceRequirements.push({
      domainCode: dim.code,
      code: `${dim.code}-EV01`,
      title: `${dim.name} — Institutional Policy, Charter & Governing Minutes`,
      quantity: '1-3 Official PDF Documents',
      requirement: 'Mandatory',
      metricLink: `${dim.code}-M01`
    });
    evidenceRequirements.push({
      domainCode: dim.code,
      code: `${dim.code}-EV02`,
      title: `${dim.name} — Execution Audit, Partner Log & Outcome Verification Data`,
      quantity: '1 Detailed Audit / Report Sheet',
      requirement: 'Mandatory',
      metricLink: `${dim.code}-M09`
    });
  });

  const antiGamingRules = [
    {
      code: 'AG-ECRI-01',
      riskPattern: 'Inflated Placement Percentage Claim without verifiable offer letters or salary tax receipts.',
      detectionLogic: 'Claimed placement > 95% while median salary documentation is missing or unverified.',
      evidenceSignal: 'Offer letters lacking corporate HR digital signatures or EPF/TDS documentation.',
      action: 'Flag for mandatory lead assessor audit; score capped at Level 2 until corroborated.',
      scoringProtection: 'Prevents unverified placement marketing claims from distorting D09 scores.'
    },
    {
      code: 'AG-ECRI-02',
      riskPattern: 'Superficial MoU Accumulation without operational activity or student placements.',
      detectionLogic: 'High number of active corporate MoUs (>50) but <5% of students engaged in joint programs.',
      evidenceSignal: 'MoUs lacking joint annual progress reports or credit-bearing course logs.',
      action: 'Invalidate inactive MoUs from partner score calculation in D02.',
      scoringProtection: 'Ensures only active, credit-bearing partnerships contribute to institutional score.'
    },
    {
      code: 'AG-ECRI-03',
      riskPattern: 'Unsupervised or Sub-Standard Internships counted toward mandatory graduation requirement.',
      detectionLogic: 'Internship duration < 6 weeks or absence of formal employer supervisor evaluation.',
      evidenceSignal: 'Generic participation certificates without detailed competency assessment rubric.',
      action: 'Exclude unverified internships from D04 coverage calculation.',
      scoringProtection: 'Safeguards authentic Work-Integrated Learning standards.'
    },
    {
      code: 'AG-ECRI-04',
      riskPattern: 'Cherry-Picked Highest CTC Claim disguised as Institutional Median Compensation.',
      detectionLogic: 'Disparity between average of top 5% offers and full cohort median > 400%.',
      evidenceSignal: 'Single highest international outlier presented in institutional headline marketing.',
      action: 'Enforce strict cohort median CTC reporting based on audited placement ledger.',
      scoringProtection: 'Protects salary transparency and realistic student ROI benchmarking.'
    },
    {
      code: 'AG-ECRI-05',
      riskPattern: 'Circular or Self-Referential Board of Studies approval without external industry panel.',
      detectionLogic: 'Curriculum renewal records showing only internal academic signatures.',
      evidenceSignal: 'Absence of external industry representative minutes or syllabus review notes.',
      action: 'Cap D03 Curriculum Co-Design at Level 1 (Ad-hoc).',
      scoringProtection: 'Mandates genuine external employer co-design in syllabus modernization.'
    }
  ];

  const crossDomainRules = [
    {
      ruleId: 'CD-ECRI-01',
      fromMetric: 'D09-M01',
      toMetric: 'D02-M01',
      fromScoreThreshold: 80.0,
      toScoreThreshold: 30.0,
      fromRequiredR: 4
    },
    {
      ruleId: 'CD-ECRI-02',
      fromMetric: 'D04-M01',
      toMetric: 'D03-M01',
      fromScoreThreshold: 85.0,
      toScoreThreshold: 25.0,
      fromRequiredR: 4
    },
    {
      ruleId: 'CD-ECRI-03',
      fromMetric: 'D08-M02',
      toMetric: 'D01-M02',
      fromScoreThreshold: 75.0,
      toScoreThreshold: 20.0,
      fromRequiredR: 3
    }
  ];

  const calibrationRules = [
    {
      ruleCode: 'CAL-ECRI-01',
      domainCode: 'D01',
      metricFullCode: 'D01-M01',
      category: 'CALIBRATION',
      decisionTest: 'Verify whether Board-approved Employability Policy exists and is published to faculty.',
      guidanceText: 'Assessor must check for senate/governing body signature within the last 36 months.'
    },
    {
      ruleCode: 'CAL-ECRI-02',
      domainCode: 'D04',
      metricFullCode: 'D04-M01',
      category: 'ADJUDICATION',
      decisionTest: 'Verify minimum 12-week duration and minimum 80% student cohort coverage for Level 4+ rating.',
      guidanceText: 'If cohort coverage is below 75%, maximum permissible maturity level is 3 (Structured).'
    },
    {
      ruleCode: 'CAL-ECRI-03',
      domainCode: 'D09',
      metricFullCode: 'D09-M05',
      category: 'ADJUDICATION',
      decisionTest: 'Verify placement percentage against audited cohort list excluding students opting for higher studies.',
      guidanceText: 'Placement denominator must explicitly account for verified higher study and entrepreneurial opt-outs.'
    }
  ];

  const badgeDefinitions = [
    {
      productCode: 'ecri',
      code: 'ECRI_SECTOR_LEADER_PLATINUM',
      name: 'Platinum Benchmark — Global Employability Excellence',
      meaning: 'Awarded to institutions achieving an overall ECRI Index >= 85.0 with zero critical dimension vulnerabilities.',
      difficulty: 'Platinum',
      criteriaJson: { minOverallScore: 85.0, minDimensionScore: 70.0, requiredEvidenceLevel: 'E3' },
      requirementsJson: { auditedPlacementRate: 90, mandatoryInternshipCoverage: 95 },
      awardRule: 'Overall ECRI >= 85 and all 11 Dimensions >= 70.',
      validityMonths: 24,
      icon: 'trophy-gold'
    },
    {
      productCode: 'ecri',
      code: 'ECRI_INDUSTRY_CO_DESIGN_GOLD',
      name: 'Gold Recognition — Industry Co-Designed Curriculum & WIL',
      meaning: 'Recognizes exceptional institutional performance in D02 (Industry Ecosystem), D03 (Curriculum Co-Design) and D04 (Experiential Learning).',
      difficulty: 'Gold',
      criteriaJson: { requiredDimensions: ['D02', 'D03', 'D04'], minAverageScore: 80.0 },
      requirementsJson: { corporatePartners: 50, mandatoryCapstones: true },
      awardRule: 'Average of D02, D03, D04 >= 80.0.',
      validityMonths: 12,
      icon: 'shield-check'
    },
    {
      productCode: 'ecri',
      code: 'ECRI_CAREER_SERVICES_EXCELLENCE',
      name: 'Distinction — Career Navigation & Student Mentorship',
      meaning: 'Awarded for outstanding 1-on-1 personalized career counseling, alumni mentoring, and career literacy infrastructure in D05 & D06.',
      difficulty: 'Silver',
      criteriaJson: { requiredDimensions: ['D05', 'D06'], minAverageScore: 75.0 },
      requirementsJson: { counselorRatio: '1:250', mentorshipCoverage: 80 },
      awardRule: 'Average of D05, D06 >= 75.0.',
      validityMonths: 12,
      icon: 'star'
    }
  ];

  fs.writeFileSync(path.join(OUT_DIR, 'dimensions.json'), JSON.stringify(dimensions, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'capabilities.json'), JSON.stringify(capabilities, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'metrics.json'), JSON.stringify(metrics, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'anchors.json'), JSON.stringify(anchors, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'cards.json'), JSON.stringify(cards, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'question_bank.json'), JSON.stringify(questions, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'evidence_requirements.json'), JSON.stringify(evidenceRequirements, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'anti_gaming_rules.json'), JSON.stringify(antiGamingRules, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'cross_domain_rules.json'), JSON.stringify(crossDomainRules, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'calibration_rules.json'), JSON.stringify(calibrationRules, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, 'badge_definitions.json'), JSON.stringify(badgeDefinitions, null, 2));

  console.log(`Successfully generated ECRI Methodology Registry files in ${OUT_DIR}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateEcriRegistry();
}
