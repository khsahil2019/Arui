import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '../..');
const SOURCE_JSON = path.join(ROOT, 'docs/doc1/ECRI_Plain_Language_Question_Evidence_Library_v1.json');
const TARGET_REGISTRY_DIR = path.join(ROOT, 'arui-backend/src/methodology/ecri_registry');

if (!fs.existsSync(TARGET_REGISTRY_DIR)) {
  fs.mkdirSync(TARGET_REGISTRY_DIR, { recursive: true });
}

const rawMetrics = JSON.parse(fs.readFileSync(SOURCE_JSON, 'utf8'));

if (rawMetrics.length !== 132) {
  throw new Error(`Expected exactly 132 canonical ECRI metrics, found ${rawMetrics.length}`);
}

const CANONICAL_DIMENSIONS = [
  {
    code: 'D01',
    name: 'Employer Demand Intelligence',
    shortName: 'Demand Intelligence',
    provisionalWeight: 0.08,
    purpose: 'Labour market forecasting, employer demand sensing, and strategic industry intelligence.',
    description: 'Labour market forecasting, employer demand sensing, and strategic industry intelligence.',
    focusArea: 'Institutional alignment with market demands, skill forecasting and occupational intelligence.',
  },
  {
    code: 'D02',
    name: 'Employability Capability Framework',
    shortName: 'Capability Framework',
    provisionalWeight: 0.08,
    purpose: 'Institutional capability taxonomy, learning outcomes, and graduate attribute articulation.',
    description: 'Institutional capability taxonomy, learning outcomes, and graduate attribute articulation.',
    focusArea: 'Institutional taxonomy of employability skills, capability definitions and progression tracking.',
  },
  {
    code: 'D03',
    name: 'Industry-Aligned Curriculum',
    shortName: 'Industry Curriculum',
    provisionalWeight: 0.09,
    purpose: 'Industry advisory boards, syllabus co-creation, emerging industry skills, and modular course design.',
    description: 'Industry advisory boards, syllabus co-creation, emerging industry skills, and modular course design.',
    focusArea: 'Industry co-design of curricula, modern skill integration, and flexible learning architecture.',
  },
  {
    code: 'D04',
    name: 'Experiential & Practice-Based Learning',
    shortName: 'Experiential Learning',
    provisionalWeight: 0.10,
    purpose: 'Work-Integrated Learning (WIL), structured credit-bearing internships, live industry capstones, and workplace labs.',
    description: 'Work-Integrated Learning (WIL), structured credit-bearing internships, live industry capstones, and workplace labs.',
    focusArea: 'Authentic project exposure, supervised clinical/workplace practice, and experiential problem-solving.',
  },
  {
    code: 'D05',
    name: 'Career Development Infrastructure',
    shortName: 'Career Infrastructure',
    provisionalWeight: 0.08,
    purpose: 'Institutional career services, multi-year pathways, personalized navigation, and mentoring systems.',
    description: 'Institutional career services, multi-year pathways, personalized navigation, and mentoring systems.',
    focusArea: 'Career counseling, job-search readiness, navigation systems, and alumni mentorship infrastructure.',
  },
  {
    code: 'D06',
    name: 'Professional & Human Capabilities',
    shortName: 'Professional Capabilities',
    provisionalWeight: 0.09,
    purpose: 'Leadership, critical enquiry, teamwork, ethical reasoning, cross-cultural communication, and adaptability.',
    description: 'Leadership, critical enquiry, teamwork, ethical reasoning, cross-cultural communication, and adaptability.',
    focusArea: 'Inquiry, critical thinking, evidence judgement, ethical reasoning, and transversal workplace competencies.',
  },
  {
    code: 'D07',
    name: 'Digital & AI-Era Work Readiness',
    shortName: 'Digital Work Readiness',
    provisionalWeight: 0.08,
    purpose: 'Digital fluency, workflow automation, modern tech toolkits, AI tools for domain problems, and data literacy.',
    description: 'Digital fluency, workflow automation, modern tech toolkits, AI tools for domain problems, and data literacy.',
    focusArea: 'Digital toolkits, applied AI productivity, data literacy, and technological adaptability.',
  },
  {
    code: 'D08',
    name: 'Portfolio & Capability Signalling',
    shortName: 'Capability Signalling',
    provisionalWeight: 0.08,
    purpose: 'Evidence-backed portfolios, verified digital credentials, authentic project artifacts, and capability profiles.',
    description: 'Evidence-backed portfolios, verified digital credentials, authentic project artifacts, and capability profiles.',
    focusArea: 'Artifact-backed portfolios, micro-credential signals, verified work samples, and employer-facing profiles.',
  },
  {
    code: 'D09',
    name: 'Employer Engagement & Recruitment Ecosystem',
    shortName: 'Employer Ecosystem',
    provisionalWeight: 0.10,
    purpose: 'Corporate recruitment networks, talent days, high-trust employer partnerships, and hiring conversion.',
    description: 'Corporate recruitment networks, talent days, high-trust employer partnerships, and hiring conversion.',
    focusArea: 'Recruitment partnerships, advisory board engagement, industry co-creation, and hiring networks.',
  },
  {
    code: 'D10',
    name: 'Employment Outcome Quality',
    shortName: 'Outcome Quality',
    provisionalWeight: 0.12,
    purpose: 'Verified graduate employment rates, compensation quality, role relevance, and employer retention.',
    description: 'Verified graduate employment rates, compensation quality, role relevance, and employer retention.',
    focusArea: 'Graduate employment telemetry, compensation benchmark, time-to-employment, and career trajectory quality.',
  },
  {
    code: 'D11',
    name: 'Career Adaptability, Lifelong Readiness & Employability Intelligence',
    shortName: 'Career Adaptability',
    provisionalWeight: 0.10,
    purpose: 'Longitudinal alumni career trajectories, lifelong reskilling, and continuous institutional employability intelligence.',
    description: 'Longitudinal alumni career trajectories, lifelong reskilling, and continuous institutional employability intelligence.',
    focusArea: 'Lifelong adaptability, alumni destination intelligence, feedback loops, and continuous institutional transformation.',
  },
];

// Generate metrics.json
const metrics = rawMetrics.map((item, index) => {
  const [dimCode, metricSeq] = item.metricId.split('-');
  const dim = CANONICAL_DIMENSIONS.find(d => d.code === dimCode);
  const hasOutcome = item.outcomeCheck && !item.outcomeCheck.toLowerCase().includes('outcome=n/a');

  return {
    id: `m-${item.metricId.toLowerCase()}`,
    code: metricSeq,
    fullCode: item.metricId,
    domainCode: dimCode,
    domainName: dim ? dim.name : item.dimension,
    name: item.metric,
    whatMeasured: item.canonicalAssessmentPurpose || `Measures institutional maturity, structured implementation, and verified outcomes for ${item.metric}.`,
    constructOwner: `${dim ? dim.shortName : item.dimension} Working Group / Academic Affairs`,
    capabilityArea: item.dimension,
    hasOutcome: Boolean(hasOutcome),
    weight: Number((1 / 12).toFixed(4)),
    naPermitted: true,
    naGate: item.naGate || "Only if the metric is genuinely inapplicable to the institution's mandate/context and approved.",
    antiGamingCheck: item.antiGamingCheck || 'Do not award uplift for policy language, attendance, or unsupported self-reported claims.',
    sourceEvidenceRule: item.sourceEvidenceRule || item.whatShouldIProvide,
    screeningQuestion: item.canonicalScreeningQuestion,
    displayQuestion: item.displayQuestion,
    whatAreWeAsking: item.whatAreWeAsking,
    whatShouldIProvide: item.whatShouldIProvide,
    evidenceExamples: item.evidenceExamples || [],
    whyThisMatters: item.whyThisMatters,
    outcomeCheck: item.outcomeCheck,
    technicalDeepDive: item.technicalDeepDive || [],
  };
});

// Generate question_bank.json (132 plain language questions + 21 screening questions)
const questionBank = rawMetrics.map((item, index) => {
  const [dimCode] = item.metricId.split('-');
  return {
    id: `q-${item.metricId.toLowerCase()}`,
    questionCode: `Q-${item.metricId}`,
    domainCode: dimCode,
    metricCode: item.metricId,
    metricLink: item.metricId,
    title: item.metric,
    prompt: item.canonicalScreeningQuestion || item.displayQuestion,
    canonicalPrompt: item.canonicalScreeningQuestion || item.displayQuestion,
    displayPrompt: item.displayQuestion,
    whatWeAreAsking: item.whatAreWeAsking,
    whatShouldIProvide: item.whatShouldIProvide,
    evidencePrompt: item.whatShouldIProvide,
    evidenceExamples: item.evidenceExamples || [],
    whyThisMatters: item.whyThisMatters,
    technicalMetricName: item.metric,
    displayMetricName: item.metric,
    metricExplanation: item.canonicalAssessmentPurpose,
    technicalDeepDive: item.technicalDeepDive || [],
    outcomeCheck: item.outcomeCheck,
    antiGamingCheck: item.antiGamingCheck,
    options: [
      { code: 'R01', label: 'Yes — Fully in place', value: 5, description: 'Defined, documented, systematic across all relevant departments with verified operational evidence.' },
      { code: 'R02', label: 'Partly — In some areas / still developing', value: 3, description: 'Operational in selected programmes or departments; formalization or scaling in progress.' },
      { code: 'R03', label: 'No — Not currently in place', value: 0, description: 'No formal institutional mechanism or systemic operational process established.' },
      { code: 'R04', label: 'Unclear / I am not sure', value: 1, description: 'Requires cross-departmental inquiry or institutional discovery.' },
      { code: 'R05', label: 'Not applicable', value: null, description: 'Genuinely inapplicable to institutional mandate/context.' },
      { code: 'R06', label: 'Contradictory information', value: 2, description: 'Existing policies or data present conflicting evidence.' },
    ],
    questionType: 'SINGLE_CHOICE',
    order: index + 1,
    weight: 1.0,
  };
});

// Add 21 Screening Routing Questions (R01-R07 routing bank across D01-D11)
const screeningQuestions = [
  { id: 'q-scr-01', questionCode: 'Q-SCR-01', domainCode: 'D01', metricCode: 'D01-I01', title: 'Employer Demand Intelligence Mechanism', prompt: 'Does the institution possess an active system for sensing and recording employer demand and skill shifts?', displayPrompt: 'Does your institution systematically capture real-time employer demand and skill requirement signals?', whatWeAreAsking: 'We want to understand whether there is a structured, regular process for gathering industry and employer skill requirements.', whatShouldIProvide: 'Upload recent employer survey summaries, industry intelligence reports, or advisory minutes from the last 12-24 months.', evidenceExamples: ['Annual employer survey', 'Labour market analytics report', 'Industry advisory meeting minutes'], whyThisMatters: 'Guarantees academic planning aligns with real employment demand.' },
  { id: 'q-scr-02', questionCode: 'Q-SCR-02', domainCode: 'D01', metricCode: 'D01-I08', title: 'Curriculum Translation from Demand Data', prompt: 'Is employer demand data systematically translated into programme and curriculum changes?', displayPrompt: 'How frequently does employer demand intelligence lead to actual updates in course offerings?', whatWeAreAsking: 'We examine whether market intelligence directly leads to new courses, syllabi revisions, or credit updates.', whatShouldIProvide: 'Programme modification approvals, Academic Council minutes showing demand justification.', evidenceExamples: ['Curriculum review committee records', 'Board of Studies approval notes'], whyThisMatters: 'Data collection is only valuable if it drives instructional change.' },
  { id: 'q-scr-03', questionCode: 'Q-SCR-03', domainCode: 'D02', metricCode: 'D02-I01', title: 'Institutional Employability Taxonomy', prompt: 'Does the institution have a formal employability capability taxonomy mapped across all programmes?', displayPrompt: 'Is there an institutional capability framework defining graduate employability skills?', whatWeAreAsking: 'We check for a documented taxonomy of graduate capabilities that guides curriculum and assessment.', whatShouldIProvide: 'Institutional graduate attribute framework, competency matrices across faculties.', evidenceExamples: ['Graduate attribute framework handbook', 'Programme outcome mapping register'], whyThisMatters: 'Provides a common institutional language for career readiness.' },
  { id: 'q-scr-04', questionCode: 'Q-SCR-04', domainCode: 'D02', metricCode: 'D02-I05', title: 'Capability Assessment Coverage', prompt: 'Are core employability capabilities systematically assessed across all major cohorts?', displayPrompt: 'Are students evaluated on employability capabilities as part of their academic progression?', whatWeAreAsking: 'We verify that graduate attributes are evaluated, not just listed as aspirational targets.', whatShouldIProvide: 'Rubrics, sample cohort assessment sheets, grading guidelines.', evidenceExamples: ['Assessment rubrics', 'Progression audit reports'], whyThisMatters: 'Ensures accountability for capability development.' },
  { id: 'q-scr-05', questionCode: 'Q-SCR-05', domainCode: 'D03', metricCode: 'D03-I01', title: 'Industry-Informed Learning Outcomes', prompt: 'Are program learning outcomes co-designed with industry practitioners and employers?', displayPrompt: 'Do external industry advisors participate directly in formulating course learning outcomes?', whatWeAreAsking: 'We examine whether learning outcomes reflect direct input from industry professionals.', whatShouldIProvide: 'Board of studies minutes, advisory board attendance logs, external syllabus reviews.', evidenceExamples: ['Board of Studies records', 'Industry reviewer sign-offs'], whyThisMatters: 'Aligns classroom instruction with contemporary workplace expectations.' },
  { id: 'q-scr-06', questionCode: 'Q-SCR-06', domainCode: 'D03', metricCode: 'D03-I03', title: 'Curriculum Currency & Revision Velocity', prompt: 'How frequently are syllabi formally updated to incorporate emerging industry technologies and workflows?', displayPrompt: 'Does the institution enforce a defined review cadence for syllabi currency?', whatWeAreAsking: 'We check whether syllabi revisions occur at least biennially with demonstrable technology updates.', whatShouldIProvide: 'Syllabus version histories, annual curriculum audit reports.', evidenceExamples: ['Course revision logs', 'Academic committee approvals'], whyThisMatters: 'Prevents instructional obsolescence.' },
  { id: 'q-scr-07', questionCode: 'Q-SCR-07', domainCode: 'D04', metricCode: 'D04-I01', title: 'Authentic Project Coverage', prompt: 'Do students complete authentic, industry-contextualized projects as part of standard coursework?', displayPrompt: 'Are real-world briefs and workplace scenarios embedded into student projects?', whatWeAreAsking: 'We check for authentic client briefs and workplace challenges within academic credit modules.', whatShouldIProvide: 'Sample project briefs, client sign-offs, student deliverable samples.', evidenceExamples: ['Capstone project charters', 'Client evaluation sheets'], whyThisMatters: 'Bridges theoretical concepts with workplace problem-solving.' },
  { id: 'q-scr-08', questionCode: 'Q-SCR-08', domainCode: 'D04', metricCode: 'D04-I02', title: 'Work-Integrated Learning (WIL) & Internship Coverage', prompt: 'What proportion of students complete mandatory, supervised, credit-bearing internships?', displayPrompt: 'Is formal internship or work-integrated learning mandatory for all graduating students?', whatWeAreAsking: 'We examine cohort coverage and credit structure for internships and work-integrated learning.', whatShouldIProvide: 'Internship completion ledgers, academic credit regulations, employer supervisor evaluations.', evidenceExamples: ['Internship registry', 'Employer appraisal rubrics'], whyThisMatters: 'Direct practice in real workplace environments dramatically improves employability.' },
  { id: 'q-scr-09', questionCode: 'Q-SCR-09', domainCode: 'D05', metricCode: 'D05-I01', title: 'Career Service Staffing & Ratio', prompt: 'Does the institution maintain a dedicated career development centre with adequate professional staff?', displayPrompt: 'What is the ratio of qualified career advisors to enrolled undergraduate and postgraduate students?', whatWeAreAsking: 'We evaluate institutional investment in professional career counseling capacity.', whatShouldIProvide: 'Staffing organogram, advisor-to-student ratios, counselor appointment schedules.', evidenceExamples: ['Career center staffing roster', 'Advising session logs'], whyThisMatters: 'Adequate counseling bandwidth ensures individual student navigation support.' },
  { id: 'q-scr-10', questionCode: 'Q-SCR-10', domainCode: 'D05', metricCode: 'D05-I06', title: 'Selection & Interview Readiness Infrastructure', prompt: 'Are mock interviews, technical coding clinics, and assessment centre simulations offered systematically?', displayPrompt: 'Does every graduating student have access to structured interview preparation and simulation?', whatWeAreAsking: 'We review whether students receive tailored practice before interacting with employers.', whatShouldIProvide: 'Interview workshop calendars, mock interview logs, feedback forms.', evidenceExamples: ['Interview clinic registers', 'AI interview simulation logs'], whyThisMatters: 'Reduces interview friction and elevates conversion rates.' },
  { id: 'q-scr-11', questionCode: 'Q-SCR-11', domainCode: 'D06', metricCode: 'D06-I01', title: 'Professional Communication Integration', prompt: 'Is executive and professional communication assessed across all degree disciplines?', displayPrompt: 'Are students evaluated on workplace communication, pitches, and professional writing?', whatWeAreAsking: 'We check if communication mastery is treated as an assessed academic standard across all faculties.', whatShouldIProvide: 'Presentation rubrics, pitch evaluation scorecards, writing portfolio requirements.', evidenceExamples: ['Oral defense rubrics', 'Professional presentation recordings'], whyThisMatters: 'Communication is cited as the single most critical baseline attribute by employers.' },
  { id: 'q-scr-12', questionCode: 'Q-SCR-12', domainCode: 'D06', metricCode: 'D06-I04', title: 'Critical Thinking & Evidence Judgement', prompt: 'Are students assessed on critical reasoning, information judgement, and problem decomposition?', displayPrompt: 'How does the institution evaluate students on critical reasoning and evidence evaluation?', whatWeAreAsking: 'We look for rubric-based evaluation of inquiry, logical analysis, and counter-factual reasoning.', whatShouldIProvide: 'Work samples, critical essay rubrics, analytical case exams.', evidenceExamples: ['Student analytical work samples', 'Marked assessment rubrics'], whyThisMatters: 'Essential for cognitive adaptability in complex, automated workplaces.' },
  { id: 'q-scr-13', questionCode: 'Q-SCR-13', domainCode: 'D07', metricCode: 'D07-I02', title: 'AI Literacy & Productivity Embedding', prompt: 'Are students trained and evaluated in ethical, domain-specific AI workflows and productivity tools?', displayPrompt: 'Does the institution embed practical AI productivity tools into domain teaching?', whatWeAreAsking: 'We verify whether students learn to collaborate with and critically evaluate AI systems in their discipline.', whatShouldIProvide: 'Course modules covering AI toolchains, student AI project artifacts, integrity policies.', evidenceExamples: ['AI curriculum modules', 'Domain tool assignments'], whyThisMatters: 'Future workplaces demand seamless human-AI collaboration and verification capability.' },
  { id: 'q-scr-14', questionCode: 'Q-SCR-14', domainCode: 'D07', metricCode: 'D07-I06', title: 'Workplace Data Literacy', prompt: 'Do non-technical graduates develop working competence in data analysis and interpretation?', displayPrompt: 'Are data interpretation and analytical reasoning taught across non-STEM majors?', whatWeAreAsking: 'We examine whether all graduates can interpret data dashboards, spreadsheets, and statistical reports.', whatShouldIProvide: 'Cross-faculty data courses, student analytical assignments.', evidenceExamples: ['Data literacy syllabi', 'Case analysis submissions'], whyThisMatters: 'Data literacy is now a baseline expectation in almost every managerial role.' },
  { id: 'q-scr-15', questionCode: 'Q-SCR-15', domainCode: 'D08', metricCode: 'D08-I01', title: 'Verified Digital Portfolios', prompt: 'Do students graduate with an evidence-backed digital portfolio showcasing authentic work samples?', displayPrompt: 'Does the institution provide a portfolio platform for students to display verified projects?', whatWeAreAsking: 'We check whether graduates have tangible, artifact-backed evidence of their capabilities.', whatShouldIProvide: 'Sample student portfolio links, platform adoption statistics, credential registries.', evidenceExamples: ['Digital portfolio platform reports', 'Sample student project artifacts'], whyThisMatters: 'Portfolios provide authentic capability signalling to prospective employers.' },
  { id: 'q-scr-16', questionCode: 'Q-SCR-16', domainCode: 'D08', metricCode: 'D08-I08', title: 'Digital Credential Signal Strength', prompt: 'Are verifiable digital credentials and skill badges issued for validated competencies?', displayPrompt: 'Does the institution issue tamper-evident micro-credentials for specific industry skills?', whatWeAreAsking: 'We verify whether credentials adhere to verifiable standards and reflect assessed capability.', whatShouldIProvide: 'Digital badge registry, issuing criteria, verification metadata.', evidenceExamples: ['Badge issuance registers', 'Verification platform audit'], whyThisMatters: 'Enables instant recruiter verification of specific competencies.' },
  { id: 'q-scr-17', questionCode: 'Q-SCR-17', domainCode: 'D09', metricCode: 'D09-I01', title: 'Employer Partnership Breadth & Diversity', prompt: 'How many active, verified employer partners actively engage in hiring and campus programs?', displayPrompt: 'Does the institution maintain an active register of verified employer partnerships across diverse sectors?', whatWeAreAsking: 'We assess the breadth, sector diversity, and recency of corporate recruiting relationships.', whatShouldIProvide: 'Employer register, recruiter attendance rosters, MoUs with recorded hiring activity.', evidenceExamples: ['Active corporate partner register', 'Recruiter directory'], whyThisMatters: 'Diversified employer ecosystems buffer graduates against sector-specific hiring downturns.' },
  { id: 'q-scr-18', questionCode: 'Q-SCR-18', domainCode: 'D09', metricCode: 'D09-I04', title: 'Industry Co-Creation & Joint Facilities', prompt: 'Are joint laboratories, innovation incubators, or co-branded centres operating with employers?', displayPrompt: 'Does the institution host co-branded industry facilities or collaborative learning spaces?', whatWeAreAsking: 'We look for deep structural partnerships where employers invest in campus facilities.', whatShouldIProvide: 'Facility agreements, joint lab utilization logs, equipment investment records.', evidenceExamples: ['Joint lab MoUs', 'Facility utilization reports'], whyThisMatters: 'Signals high institutional credibility and deep industry commitment.' },
  { id: 'q-scr-19', questionCode: 'Q-SCR-19', domainCode: 'D10', metricCode: 'D10-I01', title: '6-Month Employment Outcome Telemetry', prompt: 'Does the institution track verified graduate employment destinations at the 6-month milestone?', displayPrompt: 'What methodology is used to verify employment outcomes, roles, and compensation within 6 months?', whatWeAreAsking: 'We examine the rigour, response rate, and verification standards of graduate destination surveys.', whatShouldIProvide: 'Audited destination survey report, methodology notes, response rate documentation.', evidenceExamples: ['Audited placement report', 'Graduate destination survey dataset'], whyThisMatters: 'Employment outcome is the ultimate market test of institutional capability.' },
  { id: 'q-scr-20', questionCode: 'Q-SCR-20', domainCode: 'D10', metricCode: 'D10-I04', title: 'Starting Salary & Compensation Benchmarking', prompt: 'How does median graduate starting compensation compare to regional and sector benchmarks?', displayPrompt: 'Is graduate compensation tracked and benchmarked against peer institutions and industry averages?', whatWeAreAsking: 'We look for compensation distributions, median CTC trends, and sector comparisons.', whatShouldIProvide: 'Compensation distributions, audited salary ledgers, benchmark comparison reports.', evidenceExamples: ['Salary distribution tables', 'Sector compensation analysis'], whyThisMatters: 'Compensation reflects the market valuation of institutional graduate capability.' },
  { id: 'q-scr-21', questionCode: 'Q-SCR-21', domainCode: 'D11', metricCode: 'D11-I06', title: 'Longitudinal Alumni Career Tracking & Feedback', prompt: 'Does the institution track alumni career trajectories at 3 and 5-year milestones to inform curriculum?', displayPrompt: 'Is there a systematic mechanism for tracking alumni career progression and gathering feedback?', whatWeAreAsking: 'We check whether long-term career success and mobility data feed back into academic continuous improvement.', whatShouldIProvide: 'Alumni destination reports, longitudinal survey datasets, academic feedback loop minutes.', evidenceExamples: ['Alumni destination report (3/5-year cohort)', 'Curriculum committee feedback notes'], whyThisMatters: 'Closes the loop between long-term career durability and institutional learning design.' },
].map((item, idx) => ({
  ...item,
  options: [
    { code: 'R01', label: 'Yes — evidenced', value: 5 },
    { code: 'R02', label: 'Partly', value: 3 },
    { code: 'R03', label: 'No', value: 0 },
    { code: 'R04', label: 'Unclear', value: 1 },
    { code: 'R05', label: 'N/A requested', value: null },
    { code: 'R06', label: 'Contradictory', value: 2 },
    { code: 'R07', label: 'High-stakes claim', value: 5 },
  ],
  isScreening: true,
  order: idx + 1,
  weight: 1.0,
}));

const fullQuestionBank = [...questionBank, ...screeningQuestions];

// Generate evidence_requirements.json
const evidenceRequirements = rawMetrics.map((item) => {
  return {
    metricCode: item.metricId,
    metricName: item.metric,
    title: `${item.metric} — Operational & Outcome Evidence Dossier`,
    description: item.whatShouldIProvide,
    requiredTypes: ['DOCUMENT', 'RECORD', 'DATASET', 'REPORT'],
    minEvidenceItems: 2,
    recencyMonths: 24,
    examples: item.evidenceExamples || [],
    antiGamingRules: [
      'Do not accept uncorroborated marketing claims or standalone policy drafts without operational logs.',
      'Numerical assertions must be backed by underlying registers, datasets or audited reports.',
    ],
  };
});

// Generate capabilities.json
const capabilities = [];
CANONICAL_DIMENSIONS.forEach((dim) => {
  capabilities.push(
    { domainCode: dim.code, code: 'C01', fullCode: `${dim.code}-C01`, name: `${dim.name} Strategy, Governance & Capability Architecture` },
    { domainCode: dim.code, code: 'C02', fullCode: `${dim.code}-C02`, name: `${dim.name} Operational Execution, Curriculum & Student Delivery` },
    { domainCode: dim.code, code: 'C03', fullCode: `${dim.code}-C03`, name: `${dim.name} Verifiable Outcomes, Integrity & Continuous Calibration` },
  );
});

// Generate anchors.json (Global and per-dimension anchors for seed.ts compatibility)
const anchors = [
  { scope: 'All', level: 0, label: 'Absent', description: 'No meaningful institutional capability, policy, or operational mechanism in place.' },
  { scope: 'All', level: 1, label: 'Isolated / Reactive', description: 'Ad-hoc, isolated initiatives without central institutional coordination or documentation.' },
  { scope: 'All', level: 2, label: 'Selected / Emerging', description: 'Structured departmental practices or emerging pilots in selected faculties/programmes.' },
  { scope: 'All', level: 3, label: 'Repeatable / Structured', description: 'Standardized institutional policy and documented processes operating consistently across departments.' },
  { scope: 'All', level: 4, label: 'Integrated', description: 'Institution-wide integration with robust data feedback loops, cross-faculty coordination, and verified evidence.' },
  { scope: 'All', level: 5, label: 'Adaptive', description: 'Continuous self-optimizing intelligence, sector-defining benchmark, predictive adaptability, and verified high-impact outcomes.' },
];

CANONICAL_DIMENSIONS.forEach((dim) => {
  anchors.push(
    { scope: dim.code, level: 0, label: 'Absent', description: `No formal mechanism for ${dim.name.toLowerCase()} exists.` },
    { scope: dim.code, level: 1, label: 'Isolated / Reactive', description: `Ad hoc or localized ${dim.name.toLowerCase()} efforts without institutional policy.` },
    { scope: dim.code, level: 2, label: 'Selected / Emerging', description: `Structured pilot or departmental practice active in selected faculties for ${dim.name.toLowerCase()}.` },
    { scope: dim.code, level: 3, label: 'Repeatable / Structured', description: `Formally documented, standardized process operating consistently for ${dim.name.toLowerCase()}.` },
    { scope: dim.code, level: 4, label: 'Integrated', description: `Institution-wide integration with verified evidence and feedback loops for ${dim.name.toLowerCase()}.` },
    { scope: dim.code, level: 5, label: 'Adaptive', description: `Sector-leading adaptive capability and continuous predictive transformation in ${dim.name.toLowerCase()}.` },
  );
});

// Generate badge_definitions.json
const badges = [
  { code: 'LEVEL_5_LEADER', label: 'Level 5 · Sector Leader', description: 'Top decile benchmark score with comprehensive E3/E4 evidence across all 11 dimensions.', minScore: 90 },
  { code: 'LEVEL_4_TRANSFORMATIVE', label: 'Level 4 · Transformative & Scaling', description: 'High-performing institutional capability with verified integration across core faculties.', minScore: 75 },
  { code: 'LEVEL_3_ESTABLISHED', label: 'Level 3 · Established & Repeatable', description: 'Structured institutional policies and repeatable operating mechanisms in place.', minScore: 60 },
  { code: 'LEVEL_2_EMERGING', label: 'Level 2 · Emerging & Developing', description: 'Emerging initiatives active in selected departments with baseline capability.', minScore: 40 },
  { code: 'LEVEL_1_REACTIVE', label: 'Level 1 · Reactive Baseline', description: 'Initial awareness with isolated practices and early-stage formalization.', minScore: 20 },
];

// Generate anti_gaming_rules.json
const antiGamingRules = [
  { ruleId: 'AG-01', name: 'No High Maturity Without Corroborated Evidence', condition: 'maturity >= 3 AND evidenceLevel IN ("E0", "E1")', action: 'CAP_MATURITY_AT_2', reason: 'Maturity levels 3, 4, and 5 require structured, verifiable operational evidence (E2–E4).' },
  { ruleId: 'AG-02', name: 'Strict NA Gating', condition: 'response = "NOT_APPLICABLE" AND metric.naPermitted = false', action: 'REJECT_NA', reason: 'Core canonical employability metrics cannot be marked N/A without explicit contextual exemption.' },
  { ruleId: 'AG-03', name: 'Numerical Register Verification', condition: 'hasNumericClaim = true AND evidenceContainsUnderlyingData = false', action: 'FLAG_POTENTIAL_MISMATCH', reason: 'Numerical claims must be substantiated by underlying datasets, registers or audit logs, not only summary assertions.' },
];

// Generate calibration_rules.json
const calibrationRules = [
  { id: 'CAL-01', name: 'Metric Normalization', formula: 'M_norm = (M / 5) * 100; I_norm = (I / 5) * 100' },
  { id: 'CAL-02', name: 'Performance Composition', formula: 'P = wM * M_norm + wI * I_norm + wO * O' },
  { id: 'CAL-03', name: 'Dimension Score', formula: 'DimensionScore = WeightedMean(Applicable Metric Performances)' },
  { id: 'CAL-04', name: 'Overall ECRI Score', formula: 'OverallECRI = Sum(DimensionScore_d * Weight_d) across D01-D11' },
];

// Generate cards.json (Grouping of 12 metrics per dimension into 3 thematic capability cards)
const cards = CANONICAL_DIMENSIONS.map((dim) => {
  const dimMetrics = rawMetrics.filter(m => m.metricId.startsWith(dim.code));
  return {
    domainCode: dim.code,
    domainName: dim.name,
    cards: [
      {
        id: `${dim.code}-C1`,
        title: `${dim.shortName} Foundations & Governance`,
        metricCodes: dimMetrics.slice(0, 4).map(m => m.metricId),
        description: `Core policies, governance structures, and baseline processes for ${dim.name.toLowerCase()}.`,
      },
      {
        id: `${dim.code}-C2`,
        title: `${dim.shortName} Operational Execution`,
        metricCodes: dimMetrics.slice(4, 8).map(m => m.metricId),
        description: `Implementation consistency, institutional coverage, and stakeholder engagement.`,
      },
      {
        id: `${dim.code}-C3`,
        title: `${dim.shortName} Outcomes & Transformation`,
        metricCodes: dimMetrics.slice(8, 12).map(m => m.metricId),
        description: `Measurable student capability outcomes, continuous feedback loops, and sector excellence.`,
      },
    ],
  };
});

// Generate cross_domain_rules.json (ECRI Value Chain)
const crossDomainRules = [
  {
    fromMetric: 'D03-I01',
    toMetric: 'D04-I01',
    relation: 'PREREQUISITE',
    narrative: 'Industry-informed curriculum outcomes directly feed authentic project design in experiential learning.',
  },
  {
    fromMetric: 'D04-I02',
    toMetric: 'D06-I03',
    relation: 'CORROBORATING',
    narrative: 'Work-integrated learning coverage corroborates observed workplace problem-solving capability.',
  },
  {
    fromMetric: 'D06-I04',
    toMetric: 'D07-I04',
    relation: 'SYNERGISTIC',
    narrative: 'Critical thinking capability underpins rigorous AI verification and judgement.',
  },
  {
    fromMetric: 'D07-I03',
    toMetric: 'D08-I02',
    relation: 'DEMONSTRATIVE',
    narrative: 'AI productivity capability is demonstrated through verified digital work-sample quality.',
  },
  {
    fromMetric: 'D08-I01',
    toMetric: 'D09-I06',
    relation: 'ENABLING',
    narrative: 'Verified student portfolio signalling accelerates recruitment ecosystem conversion and employer placement.',
  },
  {
    fromMetric: 'D09-I01',
    toMetric: 'D10-I02',
    relation: 'DIRECT_OUTCOME',
    narrative: 'Broad employer partner networks directly drive relevant employment rate and quality offers.',
  },
  {
    fromMetric: 'D10-I01',
    toMetric: 'D11-I06',
    relation: 'FEEDBACK_LOOP',
    narrative: 'Verified graduate employment telemetry feeds longitudinal alumni career intelligence and curriculum review.',
  },
];

// Write all JSON files
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'dimensions.json'), JSON.stringify(CANONICAL_DIMENSIONS, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'domains.json'), JSON.stringify(CANONICAL_DIMENSIONS, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'metrics.json'), JSON.stringify(metrics, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'question_bank.json'), JSON.stringify(fullQuestionBank, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'evidence_requirements.json'), JSON.stringify(evidenceRequirements, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'capabilities.json'), JSON.stringify(capabilities, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'anchors.json'), JSON.stringify(anchors, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'cards.json'), JSON.stringify(cards, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'cross_domain_rules.json'), JSON.stringify(crossDomainRules, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'badge_definitions.json'), JSON.stringify(badges, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'anti_gaming_rules.json'), JSON.stringify(antiGamingRules, null, 2));
fs.writeFileSync(path.join(TARGET_REGISTRY_DIR, 'calibration_rules.json'), JSON.stringify(calibrationRules, null, 2));

// Write to dist if it exists
const DIST_REGISTRY_DIR = path.join(ROOT, 'arui-backend/dist/methodology/ecri_registry');
if (fs.existsSync(path.dirname(DIST_REGISTRY_DIR))) {
  if (!fs.existsSync(DIST_REGISTRY_DIR)) fs.mkdirSync(DIST_REGISTRY_DIR, { recursive: true });
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'dimensions.json'), JSON.stringify(CANONICAL_DIMENSIONS, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'domains.json'), JSON.stringify(CANONICAL_DIMENSIONS, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'metrics.json'), JSON.stringify(metrics, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'question_bank.json'), JSON.stringify(fullQuestionBank, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'evidence_requirements.json'), JSON.stringify(evidenceRequirements, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'capabilities.json'), JSON.stringify(capabilities, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'anchors.json'), JSON.stringify(anchors, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'cards.json'), JSON.stringify(cards, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'cross_domain_rules.json'), JSON.stringify(crossDomainRules, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'badge_definitions.json'), JSON.stringify(badges, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'anti_gaming_rules.json'), JSON.stringify(antiGamingRules, null, 2));
  fs.writeFileSync(path.join(DIST_REGISTRY_DIR, 'calibration_rules.json'), JSON.stringify(calibrationRules, null, 2));
}

console.log('✅ Canonical ECRI Registry successfully generated:');
console.log(`  - 11 Dimensions (D01-D11)`);
console.log(`  - ${metrics.length} Canonical Metrics (12 per dimension)`);
console.log(`  - ${fullQuestionBank.length} Questions (${questionBank.length} Plain-Language + ${screeningQuestions.length} Screening)`);
console.log(`  - ${evidenceRequirements.length} Evidence Requirement Dossiers`);
console.log(`  - Output directory: ${TARGET_REGISTRY_DIR}`);
