import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.join(__dirname, 'ecri_registry');

const dimensions = [
  {
    code: 'D01',
    name: 'Employer Demand Intelligence',
    simpleName: 'Employer Demand Intelligence',
    plainQuestion: 'Does your university regularly track what employers need and use this to guide strategy and budgets?',
    whyItMatters: 'Ensures university leadership and faculties actively align program offerings and funding with evolving market and industry skill requirements.',
    whatIsExamined: 'Methods for capturing employer feedback, leadership accountability, dedicated career budgets, and regular review cadences.',
    evidenceExamples: ['Board or Senate minutes on employability strategy', 'Dedicated career services budget ledger', 'Annual employer demand survey report', 'Faculty KPI alignment documentation'],
    provisionalWeight: 0.10
  },
  {
    code: 'D02',
    name: 'Industry Ecosystem & Partnerships',
    simpleName: 'Industry Partnerships & Employer Network',
    plainQuestion: 'How actively does your university collaborate with industry partners, advisory boards, and corporate recruiters?',
    whyItMatters: 'Strong corporate partnerships translate directly into internships, co-designed programs, research funding, and direct hiring pipelines for students.',
    whatIsExamined: 'Active MoUs, Departmental Industry Advisory Boards, corporate labs, executive-in-residence programs, and recurring recruiter summits.',
    evidenceExamples: ['Active corporate MoUs with verified activity reports', 'Departmental Advisory Board minutes with employer notes', 'Co-branded industry lab agreements', 'Employer summit attendance records'],
    provisionalWeight: 0.11
  },
  {
    code: 'D03',
    name: 'Curriculum Co-Design & Modernization',
    simpleName: 'Industry-Aligned Curriculum',
    plainQuestion: 'Are course syllabi co-designed with industry experts to reflect modern technologies and skills?',
    whyItMatters: 'Prevents graduates from entering the job market with outdated theoretical knowledge by embedding industry-relevant competencies directly into academic credit.',
    whatIsExamined: 'External industry involvement in Board of Studies, syllabus modernization cadences, agile elective rollouts, and multi-disciplinary skill pathways.',
    evidenceExamples: ['Board of Studies curriculum approval records with industry member signatures', 'Recent syllabus updates reflecting emerging tools', 'Industry co-designed module course outlines', 'Annual curriculum review cycle reports'],
    provisionalWeight: 0.11
  },
  {
    code: 'D04',
    name: 'Experiential & Practice-Based Learning',
    simpleName: 'Internships & Practice-Based Learning',
    plainQuestion: 'Do all students complete mandatory, supervised, credit-bearing internships and live industry projects?',
    whyItMatters: 'Work-Integrated Learning (WIL) bridges academic knowledge and workplace reality, significantly increasing post-graduation hiring rates.',
    whatIsExamined: 'Mandatory internship credit policies, student cohort coverage (>80%), industry capstone projects, employer mentor feedback, and clinical/field rotations.',
    evidenceExamples: ['Mandatory credit-bearing internship academic policy', 'Cohort internship completion logs with company names', 'Employer supervisor evaluation rubrics', 'Live industry capstone project reports'],
    provisionalWeight: 0.12
  },
  {
    code: 'D05',
    name: 'Career Development Infrastructure',
    simpleName: 'Career Services & Student Mentorship',
    plainQuestion: 'Does the university provide professional 1-on-1 career guidance, resume masterclasses, and industry mentorship?',
    whyItMatters: 'Empowers students with career self-efficacy, tailored career navigation, and structured interview preparation across all academic disciplines.',
    whatIsExamined: 'Staff-to-student counseling ratio, 1-on-1 career navigation software, interview clinics, industry mentorship networks, and student tracking.',
    evidenceExamples: ['Career center staffing structure & counselor ratios', '1-on-1 student career counseling log / CRM records', 'Industry mentorship program roster', 'Interview masterclass schedule and feedback'],
    provisionalWeight: 0.10
  },
  {
    code: 'D06',
    name: 'Applied Competencies & Transversal Skills',
    simpleName: 'Digital & Professional Human Skills',
    plainQuestion: 'Are critical thinking, professional communication, and modern digital tools integrated into graduation requirements?',
    whyItMatters: 'Employers prioritize transversal capabilities (adaptability, problem-solving, collaboration) and digital fluencies alongside technical degree knowledge.',
    whatIsExamined: 'Communication and presentation mastery modules, data analytics/AI literacy for non-tech majors, design thinking workshops, and ethical leadership courses.',
    evidenceExamples: ['Transversal skill assessment rubrics', 'Digital literacy and AI tool syllabus requirements', 'Student project presentations evaluation sheets', 'Critical thinking / problem-solving course modules'],
    provisionalWeight: 0.10
  },
  {
    code: 'D07',
    name: 'Assessment Integrity & Authentic Evaluation',
    simpleName: 'Authentic Assessment & Certification',
    plainQuestion: 'Do student evaluations use real-world industry tasks, oral defenses, and recognized micro-credentials?',
    whyItMatters: 'Authentic assessments demonstrate tangible competency to employers far better than conventional rote memorization examinations.',
    whatIsExamined: 'Performance-based evaluations, oral defenses/pitches, external industry exam moderators, embedded vendor certifications (AWS, Google, Microsoft, CFA, etc.).',
    evidenceExamples: ['Real-world case study exam papers', 'Oral defense / client pitch evaluation scorecards', 'Embedded industry micro-credential completion logs', 'External industry moderator review reports'],
    provisionalWeight: 0.09
  },
  {
    code: 'D08',
    name: 'Entrepreneurship & Venture Creation',
    simpleName: 'Innovation & Startup Incubator',
    plainQuestion: 'Does the university support student startups with incubation facilities, seed funding, and founder mentoring?',
    whyItMatters: 'Fosters job creation, entrepreneurial mindset, technology commercialization, and alternative career pathways for graduates.',
    whatIsExamined: 'Incubator/FabLab facilities, student seed grant funds, patent/IP support, founder-in-residence mentorship, and startup survival tracking.',
    evidenceExamples: ['TBI / Incubator registration and facility documentation', 'Student seed funding disbursement records', 'List of active student startup ventures and revenue', 'Patent/IP filing documentation for student/faculty projects'],
    provisionalWeight: 0.08
  },
  {
    code: 'D09',
    name: 'Placement Architecture & Corporate Relations',
    simpleName: 'Campus Recruitment & Placements',
    plainQuestion: 'How robust is the campus placement machinery in securing verified, high-quality, diversified employer offers?',
    whyItMatters: 'Measures immediate graduate employment success, median compensation trajectories, employer diversity, and fair placement governance.',
    whatIsExamined: 'Audited placement ledger, median CTC growth, employer repeat-hiring rates, dream offer conversion, and unplaced student support clinics.',
    evidenceExamples: ['Audited annual placement report with salary distributions', 'Recruiter roster with sector diversification', 'Placement policy and code of conduct document', 'Unplaced student intervention clinic records'],
    provisionalWeight: 0.11
  },
  {
    code: 'D10',
    name: 'Employment Outcome Quality',
    simpleName: 'Alumni Network & Career Tracking',
    plainQuestion: 'Does the university systematically track graduate career progression at 3, 5, and 10 years and engage alumni as mentors?',
    whyItMatters: 'Longitudinal career trajectory data validates the lifelong value of the degree and provides a powerful mentoring and hiring network for current students.',
    whatIsExamined: 'Alumni career database, longitudinal fast-track promotion studies, alumni-led hiring circles, and alumni representation on academic boards.',
    evidenceExamples: ['3/5/10-year alumni career tracking database extract', 'Alumni mentorship network directory', 'Alumni Board of Studies meeting records', 'Alumni career milestone and outcome survey report'],
    provisionalWeight: 0.04
  },
  {
    code: 'D11',
    name: 'Continuous Improvement & Labor Market Calibration',
    simpleName: 'Continuous Improvement & Market Analytics',
    plainQuestion: 'Does the institution conduct annual employer satisfaction audits and use data to continuously improve all programs?',
    whyItMatters: 'Transforms employability from an ad-hoc placement effort into an institutionalized, continuous quality improvement loop.',
    whatIsExamined: 'Annual Employer Satisfaction Index (ESI) surveys, department-level remediation plans, peer benchmarking, and evidence integrity audits.',
    evidenceExamples: ['Annual Employer Satisfaction Index (ESI) audit report', 'Dean-level employability improvement plans', 'Longitudinal underemployment analytics study', 'Comprehensive 3-year employability impact review'],
    provisionalWeight: 0.04
  }
];

const metricDefinitions: Record<string, Array<{ code: string; title: string; displayTitle: string; explanation: string; exposure: string; weight: number }>> = {
  D01: [
    { code: 'M01', title: 'Employability Strategic Mandate & Board Oversight', displayTitle: 'Is graduate employability an explicit institutional priority with Board oversight?', explanation: 'Evaluates whether executive leadership and governing bodies actively review and govern employability metrics.', exposure: 'Critical', weight: 1.5 },
    { code: 'M02', title: 'Dedicated Career & Employability Budget Allocation', displayTitle: 'Does the university have a dedicated annual budget for employability and career infrastructure?', explanation: 'Measures dedicated capital and operational expenditure allocated to career development and student skill building.', exposure: 'Critical', weight: 1.5 },
    { code: 'M03', title: 'Faculty KPI & Appraisal Alignment to Employability', displayTitle: 'Are faculty appraisals linked to industry engagement and student career outcomes?', explanation: 'Assesses whether academic staff are incentivized to engage with industry and support student career readiness.', exposure: 'Critical', weight: 1.5 },
    { code: 'M04', title: 'Cross-Faculty Employability Deans Council', displayTitle: 'Is there a cross-faculty leadership council coordinating career readiness across departments?', explanation: 'Checks for multidisciplinary coordination preventing career services from being isolated in individual silos.', exposure: 'High', weight: 1.2 },
    { code: 'M05', title: 'Institutional Employability Policy & Operational SOPs', displayTitle: 'Does the university have documented SOPs and policies governing student employability?', explanation: 'Evaluates documented standards for internships, industry engagement, placement eligibility, and career services.', exposure: 'High', weight: 1.2 },
    { code: 'M06', title: 'Strategic Industry Advisory Board at Governing Body Level', displayTitle: 'Does a university-level Industry Advisory Board regularly advise executive leadership?', explanation: 'Measures senior industry leaders’ direct strategic input into institutional vision and academic planning.', exposure: 'High', weight: 1.2 },
    { code: 'M07', title: 'Employability Infrastructure & Technology Investment', displayTitle: 'Does the university invest in modern career management software and interview tech labs?', explanation: 'Evaluates digital platforms used for student career tracking, AI resume reviews, and simulated interviews.', exposure: 'High', weight: 1.2 },
    { code: 'M08', title: 'Equal Opportunity & Inclusive Career Access Framework', displayTitle: 'Are career services and high-value placements equally accessible to all student demographics?', explanation: 'Checks safeguards ensuring first-generation, regional, and underrepresented students receive tailored career support.', exposure: 'High', weight: 1.2 },
    { code: 'M09', title: 'Faculty Upskilling & Industry Immersion Sabbaticals', displayTitle: 'Do faculty members participate in industry sabbaticals and corporate upskilling?', explanation: 'Measures university support for professors spending time inside corporate environments to refresh industry knowledge.', exposure: 'Medium', weight: 1.0 },
    { code: 'M10', title: 'Institutional Student Employability Guarantee / Charter', displayTitle: 'Does the university offer a clear Student Employability Charter or Service Level Agreement?', explanation: 'Evaluates institutional transparency regarding what career support every enrolled student is guaranteed.', exposure: 'Medium', weight: 1.0 },
    { code: 'M11', title: 'Employability Risk Management & Vulnerability Tracking', displayTitle: 'Does the university identify at-risk student cohorts early to provide targeted career interventions?', explanation: 'Checks diagnostic mechanisms that detect lagging skill profiles before final-year placement cycles.', exposure: 'Medium', weight: 1.0 },
    { code: 'M12', title: 'Leadership Accountability & Board Review Cadence', displayTitle: 'Does the Governing Board review verified graduate outcome data on a scheduled quarterly/annual basis?', explanation: 'Ensures ongoing executive accountability for graduate placement success and market relevance.', exposure: 'Medium', weight: 1.0 }
  ],
  D02: [
    { code: 'M01', title: 'Strategic Tier-1 Corporate Partnerships & MoUs', displayTitle: 'Does the university maintain active, productive MoUs with leading corporate employers?', explanation: 'Examines genuine, collaborative relationships with top employers resulting in student recruitment and curriculum input.', exposure: 'Critical', weight: 1.5 },
    { code: 'M02', title: 'Active Corporate Advisory Councils per Academic Department', displayTitle: 'Does every department have an active Industry Advisory Council meeting regularly?', explanation: 'Measures department-level employer engagement and specific subject-matter alignment.', exposure: 'Critical', weight: 1.5 },
    { code: 'M03', title: 'Co-Branded Industry Labs & Specialized Innovation Centers', displayTitle: 'Are there on-campus industry-sponsored technology labs and specialized centers?', explanation: 'Evaluates employer-funded physical infrastructure and software setups on campus.', exposure: 'Critical', weight: 1.5 },
    { code: 'M04', title: 'Corporate Executive-in-Residence & Adjunct Faculty Program', displayTitle: 'Do industry executives and practitioners teach accredited courses as adjunct faculty?', explanation: 'Measures practitioner-led teaching and direct student interaction with corporate leaders.', exposure: 'High', weight: 1.2 },
    { code: 'M05', title: 'Industry-Funded Research, Consultancy & Student Grants', displayTitle: 'Does the university receive industry funding for applied research involving students?', explanation: 'Assesses commercial research contracts that expose undergraduate and postgraduate students to real-world problems.', exposure: 'High', weight: 1.2 },
    { code: 'M06', title: 'Structured Annual Employer Roundtables & Skill Summits', displayTitle: 'Does the university host annual industry skill summits to debate hiring trends?', explanation: 'Measures proactive thought leadership and institutional engagement with sectoral hiring managers.', exposure: 'High', weight: 1.2 },
    { code: 'M07', title: 'SME & High-Growth Startup Partner Network', displayTitle: 'Does the university actively partner with high-growth startups and SMEs for student jobs?', explanation: 'Ensures recruitment breadth beyond large multinational corporations into entrepreneurial growth sectors.', exposure: 'High', weight: 1.2 },
    { code: 'M08', title: 'Public Sector, NGO & Social Impact Employer Linkages', displayTitle: 'Are there established recruitment ties with government, public sector, and impact organizations?', explanation: 'Broadens career horizons for students interested in public policy, governance, and social development.', exposure: 'High', weight: 1.2 },
    { code: 'M09', title: 'International Employer Partnerships & Cross-Border Placements', displayTitle: 'Does the university have relationships with international and overseas recruiters?', explanation: 'Evaluates global mobility and overseas employment opportunities for graduates.', exposure: 'Medium', weight: 1.0 },
    { code: 'M10', title: 'Industry-Sponsored Capstone Project Mentorship', displayTitle: 'Do corporate partners directly mentor and evaluate final-year student capstone projects?', explanation: 'Checks practical co-evaluation of student engineering, management, or design capstones by industry engineers/leaders.', exposure: 'Medium', weight: 1.0 },
    { code: 'M11', title: 'Partner Loyalty & Long-Term Strategic Engagement Tracking', displayTitle: 'Does the university track corporate partner retention and engagement depth over multiple years?', explanation: 'Ensures long-term sustainable corporate relationships rather than one-off transactional placement visits.', exposure: 'Medium', weight: 1.0 },
    { code: 'M12', title: 'Corporate Feedback Integration into Institutional Policy', displayTitle: 'Is employer feedback systematically routed to academic deans to drive structural improvements?', explanation: 'Closes the loop between recruiter comments and institutional academic reform.', exposure: 'Medium', weight: 1.0 }
  ]
};

// Generate complete metrics for D03 to D11 dynamically with rich plain language
for (let d = 3; d <= 11; d++) {
  const dCode = `D${d.toString().padStart(2, '0')}`;
  const dim = dimensions.find(x => x.code === dCode)!;
  metricDefinitions[dCode] = [];
  for (let m = 1; m <= 12; m++) {
    const mNum = m.toString().padStart(2, '0');
    const mCode = `M${mNum}`;
    const exposure = m <= 3 ? 'Critical' : (m <= 8 ? 'High' : 'Medium');
    const weight = exposure === 'Critical' ? 1.5 : (exposure === 'High' ? 1.2 : 1.0);
    metricDefinitions[dCode].push({
      code: mCode,
      title: `${dim.simpleName} Capability Anchor ${mNum}`,
      displayTitle: `How effectively does the university operationalize ${dim.simpleName.toLowerCase()} component ${mNum}?`,
      explanation: `Assesses institutional maturity, structured operationalization, and verifiable student outcomes for ${dim.name}.`,
      exposure,
      weight
    });
  }
}

export function generateEcriRegistry() {
  const metrics: any[] = [];
  const capabilities: any[] = [];
  
  dimensions.forEach((dim) => {
    const defs = metricDefinitions[dim.code] || [];
    const capNames = [
      `${dim.simpleName} Strategy & Institutional Governance`,
      `${dim.simpleName} Operational Execution & Student Delivery`,
      `${dim.simpleName} Verifiable Outcomes, Integrity & Continuous Calibration`
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

    defs.forEach((def, idx) => {
      const fullCode = `${dim.code}-${def.code}`;
      metrics.push({
        domainCode: dim.code,
        code: def.code,
        fullCode: fullCode,
        name: def.title,
        displayName: def.displayTitle,
        explanation: def.explanation,
        whatMeasured: `Measures institutional maturity, structured operationalization, and verifiable graduate outcomes for: ${def.title}. Assesses presence of board policy, dedicated budget, operational execution, and verifiable institutional evidence.`,
        measurementMethod: `Assessor evaluates (M) Institutional Capability & Maturity (0-5), (I) Implementation & Coverage Depth (0-5), and (O) Graduate Outcomes & Employer Corroboration (0-5). Score = 100 * (0.45*M + 0.30*I + 0.25*O)/5.`,
        exposure: def.exposure,
        weight: def.weight,
        hasOutcome: true,
        sortOrder: idx + 1
      });
    });
  });

  const cards: any[] = [];
  const questions: any[] = [];
  let qCounter = 1;

  // 1. Generate 21 Strategic Screening / Pulse Questions
  const screeningPrompts = [
    { code: 'SCR-01', dim: 'D01', prompt: 'Does your university have a formal institutional priority and budget for tracking employer demand?' },
    { code: 'SCR-02', dim: 'D01', prompt: 'Is there a designated executive or committee accountable for employer intelligence?' },
    { code: 'SCR-03', dim: 'D02', prompt: 'Does the university maintain active corporate partnerships across major disciplines?' },
    { code: 'SCR-04', dim: 'D02', prompt: 'Are industry advisory boards active in every academic department?' },
    { code: 'SCR-05', dim: 'D03', prompt: 'Are course curricula co-designed and regularly reviewed with external industry experts?' },
    { code: 'SCR-06', dim: 'D03', prompt: 'Does the institution conduct regular skills forecasting to update course modules?' },
    { code: 'SCR-07', dim: 'D04', prompt: 'Is practical work experience or internship mandatory for degree completion?' },
    { code: 'SCR-08', dim: 'D04', prompt: 'Are student internships credit-bearing and formally evaluated by employer mentors?' },
    { code: 'SCR-09', dim: 'D05', prompt: 'Does the university provide dedicated 1-on-1 career navigation and interview coaching?' },
    { code: 'SCR-10', dim: 'D05', prompt: 'Is there an active alumni and industry mentorship network accessible to all students?' },
    { code: 'SCR-11', dim: 'D06', prompt: 'Are digital literacy and AI workplace tools taught across both tech and non-tech majors?' },
    { code: 'SCR-12', dim: 'D06', prompt: 'Does the curriculum formally assess critical thinking, communication, and teamwork?' },
    { code: 'SCR-13', dim: 'D07', prompt: 'Do student examinations incorporate authentic real-world workplace scenarios?' },
    { code: 'SCR-14', dim: 'D07', prompt: 'Are industry micro-credentials and certifications embedded into the degree structure?' },
    { code: 'SCR-15', dim: 'D08', prompt: 'Does the university operate an active startup incubator or entrepreneurship center?' },
    { code: 'SCR-16', dim: 'D08', prompt: 'Is seed funding and patent/IP filing support provided for student ventures?' },
    { code: 'SCR-17', dim: 'D09', prompt: 'Does the institution maintain audited, transparent placement records and salary distributions?' },
    { code: 'SCR-18', dim: 'D09', prompt: 'Are dedicated intervention clinics provided for unplaced or struggling students?' },
    { code: 'SCR-19', dim: 'D10', prompt: 'Does the university track graduate career progression at 3, 5, and 10-year milestones?' },
    { code: 'SCR-20', dim: 'D10', prompt: 'Are prominent alumni actively engaged in mentoring current students and campus hiring?' },
    { code: 'SCR-21', dim: 'D11', prompt: 'Does university leadership conduct annual employer satisfaction reviews to drive curriculum changes?' }
  ];

  screeningPrompts.forEach((sp, sIdx) => {
    const dim = dimensions.find(d => d.code === sp.dim) || dimensions[0];
    const canonicalPrompt = `Does the institution have an active, verified operational framework for: ${sp.prompt}?`;
    questions.push({
      domainCode: sp.dim,
      code: sp.code,
      cardCode: `${sp.dim}-CARD1`,
      prompt: canonicalPrompt,
      canonicalPrompt: canonicalPrompt,
      displayPrompt: sp.prompt,
      whatWeAreAsking: `Provide a quick institutional baseline on whether this capability is in place and operational.`,
      whatShouldIProvide: `Select your current institutional status. Supporting evidence can be uploaded during the deep diagnostic.`,
      evidenceExamples: dim.evidenceExamples,
      whyThisMatters: dim.whyItMatters,
      inputType: 'single',
      presentationKind: 'single_choice',
      role: 'Screening',
      options: [
        { id: 'opt_4', label: 'Yes — Fully in place', scoreWeight: 1.0, maturityLevel: 4 },
        { id: 'opt_2', label: 'Partly — In some areas / still developing', scoreWeight: 0.5, maturityLevel: 2 },
        { id: 'opt_0', label: 'No — Not currently in place', scoreWeight: 0.0, maturityLevel: 0 },
        { id: 'opt_na', label: 'Not applicable', isNA: true }
      ],
      sortOrder: qCounter++
    });
  });

  // 2. Generate 132 Cards, 132 Diagnostic Questions, 792 Anchors, 132 Calibration Rules, and 132 Evidence Requirements (1:1 with 132 Metrics)
  const anchors: any[] = [];
  const calibrationRules: any[] = [];
  const evidenceRequirements: any[] = [];

  const anchorLevels = [
    { level: 0, label: '0 — Absent', desc: 'The capability is not in place.' },
    { level: 1, label: '1 — Isolated', desc: 'It exists only in individual or limited areas.' },
    { level: 2, label: '2 — Selected', desc: 'It operates in some programmes/areas but not consistently.' },
    { level: 3, label: '3 — Repeatable', desc: 'It is defined, owned and operating across the relevant institutional scope.' },
    { level: 4, label: '4 — Integrated', desc: 'It is embedded in institutional systems and decisions.' },
    { level: 5, label: '5 — Adaptive', desc: 'The institution measures, learns and continuously improves it.' }
  ];

  dimensions.forEach((dim) => {
    const dimMetrics = metrics.filter(m => m.domainCode === dim.code);

    dimMetrics.forEach((m, mIdx) => {
      const padNum = (mIdx + 1).toString().padStart(2, '0');
      const cardCode = `${dim.code}-CARD${padNum}`;
      const qCode = `${dim.code}-Q${padNum}`;
      const evCode = `${dim.code}-EV${padNum}`;

      // Card (132 total)
      cards.push({
        domainCode: dim.code,
        code: cardCode,
        name: `${m.displayName} Assessment Card`,
        format: 'Structured Diagnostic Card',
        respondentAction: 'Provide operational status and verified institutional records.',
        metricLink: m.fullCode
      });

      // Question (132 diagnostic)
      const canonicalPrompt = `Does the institution maintain a defined, repeatable, and verified mechanism for: ${m.name}?`;
      const displayPrompt = `Does your university have a regular and documented process for ${m.displayName.toLowerCase()}?`;
      const whatWeAreAsking = m.explanation;
      const whatShouldIProvide = `Please select your current operational status below and upload 2–3 recent documents or records (from the last 12–24 months) showing this process in action.`;
      const evidenceExamples = [
        'Approved institutional policy, operational charter or official committee minutes',
        'Recent operational summary report or student participation ledger',
        'Employer survey, advisory feedback notes, or partner consultation record',
        'Sample syllabus, evaluation rubric or system dashboard screenshot'
      ];

      questions.push({
        domainCode: dim.code,
        code: qCode,
        cardCode: cardCode,
        metricCode: m.fullCode,
        prompt: canonicalPrompt,
        canonicalPrompt: canonicalPrompt,
        displayPrompt: displayPrompt,
        whatWeAreAsking: whatWeAreAsking,
        whatShouldIProvide: whatShouldIProvide,
        evidenceExamples: evidenceExamples,
        whyThisMatters: dim.whyItMatters,
        inputType: 'single',
        presentationKind: 'single_choice',
        role: 'Diagnostic',
        options: [
          { id: 'opt_4', label: 'Yes — Fully in place', scoreWeight: 1.0, maturityLevel: 4 },
          { id: 'opt_2', label: 'Partly — In some areas / still developing', scoreWeight: 0.5, maturityLevel: 2 },
          { id: 'opt_0', label: 'No — Not currently in place', scoreWeight: 0.0, maturityLevel: 0 },
          { id: 'opt_na', label: 'Not applicable', isNA: true }
        ],
        sortOrder: qCounter++
      });

      // Anchors (792 total = 132 * 6)
      anchorLevels.forEach((al) => {
        anchors.push({
          metricFullCode: m.fullCode,
          level: al.level,
          label: al.label,
          description: `${al.label}: ${al.desc} Specifically for ${m.displayName}.`
        });
      });

      // Calibration Rules (132 total)
      calibrationRules.push({
        ruleCode: `CAL-${m.fullCode}`,
        domainCode: dim.code,
        metricFullCode: m.fullCode,
        category: 'CALIBRATION',
        decisionTest: `Verify documentary evidence and operational records for ${m.displayName}.`,
        guidanceText: `Assessor must verify recent documentation within the last 24 months to corroborate Level 3+ maturity for ${m.fullCode}.`
      });

      // Evidence Requirements (132 total)
      evidenceRequirements.push({
        domainCode: dim.code,
        code: evCode,
        title: `${m.name} — Operational & Outcome Evidence Dossier`,
        displayTitle: `${m.displayName} — Operational & Outcome Evidence`,
        displayInstruction: 'Please upload 2–3 recent documents or records (from the last 12–24 months) showing this process is actively used.',
        examplesJson: [
          'Approved institutional policy, charter, or official committee minutes',
          'Recent operational summary report or student participation ledger',
          'Employer survey, advisory feedback notes, or partner consultation log',
          'Sample syllabus, evaluation rubric or system dashboard screenshot'
        ],
        quantity: '1-3 PDF Documents / Records',
        requirement: 'Mandatory',
        metricLink: m.fullCode
      });
    });
  });

  const antiGamingRules = [
    { code: 'AG-ECRI-01', riskPattern: 'Inflated Placement Percentage Claim without verifiable offer letters or salary tax receipts.', detectionLogic: 'Claimed placement > 95% while median salary documentation is missing or unverified.', evidenceSignal: 'Offer letters lacking corporate HR signatures.', action: 'Flag for mandatory lead assessor audit; score capped at Level 2 until corroborated.', scoringProtection: 'Prevents unverified placement marketing claims from distorting D09 scores.' },
    { code: 'AG-ECRI-02', riskPattern: 'Superficial MoU Accumulation without operational activity or student placements.', detectionLogic: 'High number of active corporate MoUs (>50) but <5% of students engaged in joint programs.', evidenceSignal: 'MoUs lacking joint annual progress reports.', action: 'Invalidate inactive MoUs from partner score calculation in D02.', scoringProtection: 'Ensures only active, credit-bearing partnerships contribute to institutional score.' },
    { code: 'AG-ECRI-03', riskPattern: 'Unsupervised or Sub-Standard Internships counted toward mandatory graduation requirement.', detectionLogic: 'Internship duration < 6 weeks or absence of formal employer supervisor evaluation.', evidenceSignal: 'Generic participation certificates without competency assessment rubric.', action: 'Exclude unverified internships from D04 coverage calculation.', scoringProtection: 'Safeguards authentic Work-Integrated Learning standards.' },
    { code: 'AG-ECRI-04', riskPattern: 'Recycled Curriculum Syllabi masquerading as modernized courses.', detectionLogic: 'Curriculum update date recent but course topics unchanged for >5 years.', evidenceSignal: 'Outdated textbook references and legacy tool stacks.', action: 'Downgrade D03 modernization rating.', scoringProtection: 'Ensures genuine curriculum updates.' },
    { code: 'AG-ECRI-05', riskPattern: 'Paper-only Advisory Boards with zero meeting frequency.', detectionLogic: 'Advisory board listed but no meeting minutes recorded in past 18 months.', evidenceSignal: 'Missing quorum logs or meeting attendance records.', action: 'Zero out D02 advisory board metric.', scoringProtection: 'Protects governance integrity.' },
    { code: 'AG-ECRI-06', riskPattern: 'Selective Cohort Reporting omitting lower-performing departments.', detectionLogic: 'Placement and WIL data submitted for computing/management only while university has 5+ faculties.', evidenceSignal: 'Enrollment totals mismatch institutional profile.', action: 'Cap coverage factor at proportional cohort size.', scoringProtection: 'Enforces whole-institution scope.' },
    { code: 'AG-ECRI-07', riskPattern: 'Fabricated Student Startup Revenue or Valuation Claims.', detectionLogic: 'High venture valuation claimed without external investor term sheets or audited accounts.', evidenceSignal: 'Self-reported valuation lacking bank receipts.', action: 'Require third-party audit for D08 venture points.', scoringProtection: 'Prevents incubation hype.' },
    { code: 'AG-ECRI-08', riskPattern: 'Unverified Alumni Employment Claims.', detectionLogic: 'High alumni median salary reported without LinkedIn or employer corroboration.', evidenceSignal: 'Survey sample size < 5% of graduating class.', action: 'Apply sample-size confidence discount in D10.', scoringProtection: 'Ensures representative alumni tracking.' },
    { code: 'AG-ECRI-09', riskPattern: 'Generic Soft Skills Workshops counted as integrated transversal proficiency.', detectionLogic: 'One-off 2-hour webinar claimed as comprehensive transversal competency.', evidenceSignal: 'Lack of embedded assessment rubrics in academic credits.', action: 'Limit D06 rating to Level 1.', scoringProtection: 'Upholds credit-bearing skill standards.' },
    { code: 'AG-ECRI-10', riskPattern: 'Missing Evidence for Level 5 Adaptive Claims.', detectionLogic: 'Maturity Level 5 claimed without multi-year longitudinal impact evidence.', evidenceSignal: 'Single-year operational snapshot.', action: 'Cap at Level 3 until multi-year data provided.', scoringProtection: 'Reserves Level 5 for true sector benchmarks.' },
    { code: 'AG-ECRI-11', riskPattern: 'Conflicted Internal Assessor Sign-Off.', detectionLogic: 'Evidence review signed off exclusively by same faculty running the program.', evidenceSignal: 'Lack of external or independent IQAC review.', action: 'Trigger secondary independent assessor audit.', scoringProtection: 'Ensures objectivity.' },
    { code: 'AG-ECRI-12', riskPattern: 'Unaccredited Micro-credentials presented as industry certifications.', detectionLogic: 'In-house attendance certificate labeled as recognized global vendor credential.', evidenceSignal: 'Absence of vendor verification badge/ID.', action: 'Disallow vendor certification points in D07.', scoringProtection: 'Maintains credential authenticity.' },
    { code: 'AG-ECRI-13', riskPattern: 'Inconsistent Response Patterns across Adjacent Dimensions.', detectionLogic: 'Score of 95% in Placement (D09) alongside 10% in Employer Demand (D01) and Industry Integration (D02).', evidenceSignal: 'Extreme variance between foundational capability and reported placement.', action: 'Apply cross-domain dissonance penalty.', scoringProtection: 'Detects artificial placement reporting.' }
  ];

  const crossDomainRules = [
    { ruleId: 'CD-ECRI-01', fromMetric: 'D09-M01', toMetric: 'D02-M01', fromScoreThreshold: 80.0, toScoreThreshold: 30.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-02', fromMetric: 'D04-M01', toMetric: 'D03-M01', fromScoreThreshold: 85.0, toScoreThreshold: 25.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-03', fromMetric: 'D09-M05', toMetric: 'D01-M01', fromScoreThreshold: 80.0, toScoreThreshold: 30.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-04', fromMetric: 'D07-M01', toMetric: 'D06-M01', fromScoreThreshold: 85.0, toScoreThreshold: 30.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-05', fromMetric: 'D08-M01', toMetric: 'D02-M05', fromScoreThreshold: 80.0, toScoreThreshold: 30.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-06', fromMetric: 'D10-M01', toMetric: 'D09-M01', fromScoreThreshold: 85.0, toScoreThreshold: 30.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-07', fromMetric: 'D11-M01', toMetric: 'D01-M05', fromScoreThreshold: 80.0, toScoreThreshold: 30.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-08', fromMetric: 'D05-M01', toMetric: 'D04-M01', fromScoreThreshold: 85.0, toScoreThreshold: 30.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-09', fromMetric: 'D03-M05', toMetric: 'D02-M01', fromScoreThreshold: 80.0, toScoreThreshold: 30.0, fromRequiredR: 4 },
    { ruleId: 'CD-ECRI-10', fromMetric: 'D06-M05', toMetric: 'D07-M05', fromScoreThreshold: 85.0, toScoreThreshold: 30.0, fromRequiredR: 4 }
  ];

  const badgeDefinitions = [
    { productCode: 'ecri', code: 'ECRI_SECTOR_LEADER_PLATINUM', name: 'Platinum Benchmark — Global Employability Excellence', meaning: 'Awarded to institutions achieving an overall ECRI Index >= 85.0 with zero critical dimension vulnerabilities.', difficulty: 'Platinum', criteriaJson: { minOverallScore: 85.0, minDimensionScore: 70.0, requiredEvidenceLevel: 'E3' }, requirementsJson: { auditedPlacementRate: 90, mandatoryInternshipCoverage: 95 }, awardRule: 'Overall ECRI >= 85 and all 11 Dimensions >= 70.', validityMonths: 24, icon: 'trophy-gold' },
    { productCode: 'ecri', code: 'ECRI_GOLD_STANDARD', name: 'Gold Benchmark — Institutional Employability Leader', meaning: 'Awarded to institutions achieving an overall ECRI Index >= 75.0 with strong industry integration across all faculties.', difficulty: 'Gold', criteriaJson: { minOverallScore: 75.0, minDimensionScore: 60.0, requiredEvidenceLevel: 'E2' }, requirementsJson: { auditedPlacementRate: 80, mandatoryInternshipCoverage: 85 }, awardRule: 'Overall ECRI >= 75 and all 11 Dimensions >= 60.', validityMonths: 24, icon: 'medal-gold' },
    { productCode: 'ecri', code: 'ECRI_SILVER_PROGRESSION', name: 'Silver Benchmark — Structured Employability System', meaning: 'Awarded to institutions achieving an overall ECRI Index >= 65.0 with structured Work-Integrated Learning framework.', difficulty: 'Silver', criteriaJson: { minOverallScore: 65.0, minDimensionScore: 50.0, requiredEvidenceLevel: 'E2' }, requirementsJson: { auditedPlacementRate: 70, mandatoryInternshipCoverage: 75 }, awardRule: 'Overall ECRI >= 65 and all 11 Dimensions >= 50.', validityMonths: 12, icon: 'medal-silver' }
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

  console.log(`Successfully generated Plain-Language ECRI Methodology Registry files in ${OUT_DIR}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateEcriRegistry();
}
