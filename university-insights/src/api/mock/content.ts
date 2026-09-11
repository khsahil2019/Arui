/**
 * MOCK BACKEND CONTENT
 *
 * Respondent-facing prompt wording is taken verbatim from the methodology
 * workbooks (D01/D02/D03 Question Bank and remediation probe sheets).
 *
 * STRUCTURED INPUT FIRST. The workbooks define WHAT is measured but do not
 * define answer-choice catalogues. Every selectable catalogue below is
 * therefore marked `provisionalOptions: true` and awaits confirmation by the
 * methodology team (METHODOLOGY DECISION REQUIRED #1). Free text is limited to
 * bounded `short_text` for institution-specific names and one-line nuance.
 * See docs/respondent-input-audit.md for the per-question audit.
 *
 * Nothing here scores, weights or routes. The mock serves prompts in a fixed
 * order to stand in for the backend router.
 */

import { domainNames, type ChoiceOption, type DomainCode } from "@/lib/catalogue";
import type { EvidenceRequest, ProfileFormDefinition, Prompt } from "../types";

/* ---------------- Profile form (P0-8 profile fields) ---------------- */

const scaleHint = "Use the full range. This calibrates what is reasonable to expect of an institution in your situation; it does not add to or subtract from any result.";

export const profileForm: ProfileFormDefinition = {
  steps: [
    {
      id: "identity",
      label: "Institution",
      description: "Name, type and mandate",
      fields: [
        { id: "name", label: "Institution name", type: "text", required: true },
        {
          id: "institutionType",
          label: "Which best describes the institution?",
          type: "single",
          required: true,
          options: [
            { value: "comprehensive", label: "Comprehensive university", description: "Broad disciplinary coverage across faculties" },
            { value: "technical", label: "Technical / engineering institution", description: "STEM-led with applied research focus" },
            { value: "specialist", label: "Specialist institution", description: "Single or closely related discipline set" },
            { value: "college", label: "Affiliated / constituent college", description: "Operates within a wider university system" },
            { value: "open", label: "Open / distance university", description: "Predominantly flexible or remote delivery" },
            { value: "other", label: "Other institutional form" },
          ],
        },
        {
          id: "mandate",
          label: "Institutional mandate",
          type: "multi",
          required: true,
          hint: "Select every mandate that genuinely applies.",
          options: [
            { value: "teaching", label: "Teaching" },
            { value: "broad", label: "Broad teaching + research" },
            { value: "research-intensive", label: "Research-intensive" },
            { value: "professional", label: "Professional" },
            { value: "specialist", label: "Specialist" },
          ],
        },
      ],
    },
    {
      id: "scale",
      label: "Scale & context",
      description: "Size, geography and resources",
      fields: [
        {
          id: "scale",
          label: "Approximate student headcount",
          type: "band",
          required: true,
          hint: "Scale shapes what proportionate institutional mechanisms and evidence samples look like; it is not a measure of maturity.",
          options: [
            { value: "xs", label: "Under 2,000" },
            { value: "s", label: "2,000 – 10,000" },
            { value: "m", label: "10,000 – 30,000" },
            { value: "l", label: "30,000 – 60,000" },
            { value: "xl", label: "Over 60,000" },
          ],
        },
        {
          id: "geography",
          label: "Operating context",
          type: "multi",
          required: true,
          options: [
            { value: "south-asia", label: "South Asia" },
            { value: "east-asia", label: "East & South-East Asia" },
            { value: "mena", label: "Middle East & North Africa" },
            { value: "africa", label: "Sub-Saharan Africa" },
            { value: "europe", label: "Europe" },
            { value: "north-america", label: "North America" },
            { value: "latam", label: "Latin America" },
            { value: "oceania", label: "Oceania" },
          ],
        },
        {
          id: "resourceEnvelope",
          label: "Resource envelope",
          type: "band",
          required: true,
          hint: "Used only to proportion how much evidence the assessment asks for. It never changes what maturity is expected.",
          options: [
            { value: "constrained", label: "Constrained" },
            { value: "low-medium", label: "Low–medium" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "very-high", label: "Very high" },
          ],
        },
      ],
    },
    {
      id: "character",
      label: "Academic character",
      description: "Research and student profile",
      fields: [
        { id: "researchIntensity", label: "Research intensity", type: "scale5", required: true, hint: scaleHint, scaleEnds: { low: "Teaching-led", high: "Research-led" } },
        { id: "studentProfileComplexity", label: "Student profile complexity", type: "scale5", required: true, hint: "Learner diversity, access and support needs across the student body.", scaleEnds: { low: "Homogeneous", high: "Highly diverse" } },
      ],
    },
    {
      id: "ai",
      label: "AI exposure & trajectory",
      description: "How much AI already touches the institution",
      fields: [
        { id: "aiExposure", label: "Degree of AI exposure", type: "scale5", required: true, hint: "How far AI already affects the institution's programmes, operations and decisions.", scaleEnds: { low: "Limited", high: "Pervasive" } },
        { id: "disciplinaryConsequence", label: "Disciplinary consequence", type: "scale5", required: true, hint: "The potential consequence of AI-driven change or AI error in the disciplines the institution teaches.", scaleEnds: { low: "Low", high: "Critical" } },
        { id: "trajectory", label: "Institutional trajectory", type: "scale5", required: true, hint: "The current rate of institutional change.", scaleEnds: { low: "Stable", high: "Rapid transformation" } },
      ],
    },
  ],
};

/* ---------------- Screening prompts ("Institutional Pulse") ---------------- */

const scale = (labels: string[]): ChoiceOption[] => labels.map((l) => ({ value: l.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), label: l }));

export const screeningPrompts: Prompt[] = [
  {
    id: "s-01",
    domainCode: null,
    domainName: "Institutional Pulse",
    theme: "Strategic positioning",
    prompt: "How is AI currently positioned in institutional decision-making?",
    help: "This helps the assessment understand whether AI is treated as a matter for the institution as a whole, or primarily as a local or technical concern. It shapes which strategic questions are explored in depth later.",
    presentation: { kind: "single_choice", provisionalOptions: true, options: scale(["Strategic priority", "Emerging institutional priority", "Local / departmental activity", "Mostly experimental", "Not yet addressed"]) },
    origin: "screening",
    allowNotSure: true,
    allowNotApplicable: false,
  },
  {
    id: "s-02",
    domainCode: null,
    domainName: "Institutional Pulse",
    theme: "Institutional response",
    prompt: "When AI raises a new institutional question, how does the institution typically respond?",
    help: "The form of institutional response is a strong early indicator of adaptability. It tells the assessment whether to focus on formal mechanisms or on informal practice.",
    presentation: { kind: "single_choice", provisionalOptions: true, options: scale(["Through an established institutional mechanism", "Through a designated committee or group", "Case by case, led by senior individuals", "Informally, where individuals take initiative", "Rarely addressed at institutional level"]) },
    origin: "screening",
    allowNotSure: true,
    allowNotApplicable: false,
  },
  {
    id: "s-03",
    domainCode: null,
    domainName: "Institutional Pulse",
    theme: "Academic practice",
    prompt: "How consistently is AI addressed in teaching, assessment and academic integrity practice?",
    help: "Consistency across faculties indicates whether institutional direction is reaching academic practice. Uneven practice is common and is not treated as a failure; it shapes where the assessment looks next.",
    presentation: { kind: "single_choice", provisionalOptions: true, options: scale(["Consistently, through institution-wide guidance", "Broadly, with some variation by faculty", "Unevenly, led by individual departments", "Mostly by individual academics", "Not yet addressed"]) },
    origin: "screening",
    allowNotSure: true,
    allowNotApplicable: false,
  },
  {
    id: "s-04",
    domainCode: null,
    domainName: "Institutional Pulse",
    theme: "Capability",
    prompt: "How would you describe staff readiness to work with AI in their roles?",
    help: "Staff capability underpins nearly every other area. Knowing where the institution stands helps proportion the depth of later questions on development and support.",
    presentation: { kind: "single_choice", provisionalOptions: true, options: scale(["Broad, structured capability building", "Targeted programmes for key groups", "Optional or ad hoc development", "Largely self-directed", "Not yet a focus"]) },
    origin: "screening",
    allowNotSure: true,
    allowNotApplicable: false,
  },
  {
    id: "s-05",
    domainCode: null,
    domainName: "Institutional Pulse",
    theme: "Evidence culture",
    prompt: "How readily could the institution evidence its current AI-related activity to an external reviewer?",
    help: "This is not about the volume of documents. It indicates how much of the institution's activity is formalised, which determines how evidence requests are framed later.",
    presentation: { kind: "single_choice", provisionalOptions: true, options: scale(["Readily, from existing institutional records", "Mostly, with some assembly required", "Partially, across scattered sources", "With difficulty"]) },
    origin: "screening",
    allowNotSure: true,
    allowNotApplicable: false,
  },
];

/* ---------------- D01–D03 core prompts (workbook question banks) ---------------- */

const yesNoUnsure: ChoiceOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

/** D03 capability areas — the graduate capabilities named in the methodology. */
export const d03Capabilities: ChoiceOption[] = [
  { value: "foundational-knowledge", label: "Foundational knowledge" },
  { value: "critical-thinking", label: "Critical thinking" },
  { value: "question-formulation", label: "Question formulation" },
  { value: "analytical-reasoning", label: "Analytical reasoning" },
  { value: "problem-formulation", label: "Problem formulation" },
  { value: "creativity-originality", label: "Creativity & originality" },
  { value: "judgement", label: "Judgement & decision-making" },
  { value: "verification", label: "Verification & epistemic discipline" },
  { value: "metacognition", label: "Metacognition" },
  { value: "human-ai-collaboration", label: "Human–AI collaboration" },
  { value: "communication-defence", label: "Communication & defence of reasoning" },
  { value: "collaboration", label: "Collaboration" },
  { value: "practical", label: "Practical & applied capability" },
  { value: "ethical-social", label: "Ethical & social judgement" },
  { value: "intellectual-agency", label: "Intellectual agency" },
  { value: "transfer", label: "Transfer to unfamiliar contexts" },
  { value: "non-technical-ai", label: "Discipline-relevant AI capability (non-technical disciplines)" },
];

/* ---- Provisional catalogues (NOT workbook-defined — METHODOLOGY DECISION REQUIRED #1) ---- */

/** Institutional actors, roles and bodies. */
const actors = scale([
  "Vice-Chancellor / President / Rector",
  "Deputy VC / Provost / Vice-President",
  "Executive or senior management team",
  "Council / Board of Governors",
  "Senate / Academic Council",
  "Deans / Heads of faculty",
  "Heads of department / programme leads",
  "AI, digital or futures steering group",
  "IT / digital services",
  "Registrar / academic administration",
  "Quality & academic standards office",
  "Research office",
  "Data protection, legal or compliance",
  "Ethics committee",
  "Procurement / finance",
  "Individual academics",
  "Student representatives",
  "External advisors or partners",
]);

const timeBands = scale(["Within days", "1–4 weeks", "1–3 months", "3–6 months", "6–12 months", "Over a year", "Varies — no typical time"]);

const consistency = scale(["Always", "Usually", "Sometimes", "Rarely"]);

const consequentialDecisions = scale([
  "Admissions screening or selection",
  "Plagiarism or AI-use flagging",
  "Progression or at-risk alerts",
  "Automated marking or feedback",
  "Scholarship or financial support",
  "Student support triage",
  "Timetabling or resource allocation",
  "Staff recruitment or HR",
  "Research assessment",
]);

const externalSystemTypes = scale([
  "Learning platform AI features",
  "Generative AI assistant or licence",
  "Plagiarism / AI detection",
  "Admissions or CRM analytics",
  "Student support chatbot",
  "Learning analytics / early warning",
  "Research tools",
  "Administrative automation",
]);

const D = (code: DomainCode, theme: string, id: string, prompt: string, presentation: Prompt["presentation"], extra: Partial<Prompt> = {}): Prompt => ({
  id,
  domainCode: code,
  domainName: domainNames[code],
  theme,
  prompt,
  presentation,
  origin: "core",
  allowNotSure: true,
  allowNotApplicable: false,
  ...extra,
});

export const domainPrompts: Record<"D01" | "D02" | "D03", Prompt[]> = {
  D01: [
    D("D01", "Strategic direction", "d01-01", "How is AI currently positioned in institutional decision-making?", {
      kind: "single_choice",
      provisionalOptions: true,
      options: scale(["A stated strategic priority with senior ownership", "An emerging institutional priority", "Addressed within particular faculties or services", "Largely experimental", "Not yet positioned"]),
    }, {
      help: "The assessment is interested in where AI actually sits in decision-making today, not where the institution intends it to sit.",
      evidenceHints: ["Current strategic plan or AI strategy", "Council, Board or Senate papers where AI was considered"],
    }),
    D("D01", "Strategic direction", "d01-02", "Which institutional decisions have actually changed in the last 18 months because of AI or anticipated AI-driven changes?", {
      kind: "records",
      recordLabel: "Decision",
      min: 1,
      max: 3,
      provisionalOptions: true,
      noneOption: "No institutional decision has changed yet because of AI",
      fields: [
        { id: "area", label: "Area of decision", type: "select", allowOther: true, options: scale(["Programme portfolio (launch, suspend, redesign)", "Assessment policy or regulations", "Investment or budget allocation", "Staffing, roles or workload", "Technology or infrastructure", "Admissions or recruitment", "Partnerships or external relationships", "Research direction or priorities", "Governance structures"]) },
        { id: "change", label: "Nature of the change", type: "select", options: scale(["A new decision was taken", "An existing decision was reversed or stopped", "Priorities were re-ordered", "A planned decision was accelerated", "A planned decision was delayed"]) },
        { id: "driver", label: "What drove it", type: "multi_select", options: scale(["Observed AI capability", "Anticipated AI-driven change", "Shift in student demand", "Employer, regulator or accreditor expectation", "Integrity or risk concern", "Cost or efficiency"]) },
        { id: "body", label: "Decided by", type: "select", allowOther: true, options: actors },
        { id: "when", label: "When", type: "period" },
        { id: "detail", label: "Decision in one line", type: "short_text", maxLength: 120, optional: true, placeholder: "e.g. Suspended 2026 intake to BA Translation" },
      ],
    }, {
      help: "Up to three concrete decisions. If nothing has changed yet, choose that option — it is a legitimate and useful answer.",
      evidenceHints: ["Minutes or decision records for the decisions listed"],
    }),
    D("D01", "Foresight", "d01-03", "Which assumptions underlying the current institutional model could be materially affected by AI in the next 3–5 years?", {
      kind: "ranked_list",
      count: 5,
      itemLabel: "Assumption",
      provisionalOptions: true,
      allowOther: true,
      options: scale([
        "Demand for current programmes",
        "How learning is assessed",
        "How academic staff time is used",
        "Sources of revenue and fee income",
        "Employability of current graduates",
        "How research is funded and conducted",
        "Staff roles and workforce size",
        "Campus and physical delivery model",
        "How students are admitted and selected",
        "The value of credentials and qualifications",
        "Regulatory and accreditation requirements",
        "Partnership and industry relationships",
      ]),
      itemFields: [
        { id: "horizon", label: "When it bites", type: "select", options: scale(["Already affecting us", "Within 1–2 years", "Within 3–5 years", "Not sure"]) },
        { id: "response", label: "Institutional response so far", type: "select", options: scale(["Not yet considered", "Under discussion", "Being analysed", "Action planned", "Action under way"]) },
      ],
    }, {
      help: "Think about assumptions the institution relies on: demand for particular programmes, how learning is assessed, how staff time is used, where revenue comes from. Most significant first.",
    }),
    D("D01", "Foresight", "d01-04", "When a significant external change is detected, what normally happens from detection to institutional action?", {
      kind: "process_steps",
      stepLabel: "Step",
      min: 2,
      max: 8,
      provisionalOptions: true,
      stepFields: [
        { id: "what", label: "What happens", type: "select", allowOther: true, options: scale(["Change noticed by individuals", "Raised informally with senior colleagues", "Formal horizon-scan or foresight report", "Discussed at a committee", "Analysis or options paper prepared", "Consultation with faculties or services", "Decision by executive or committee", "Resources allocated", "Action implemented", "Action reviewed"]) },
        { id: "who", label: "Who is involved", type: "multi_select", options: actors },
        { id: "time", label: "Typical time", type: "select", options: timeBands },
      ],
    }, {
      help: "Build the sequence as it usually happens, from the moment a change is noticed to the moment the institution acts on it. Informal steps count.",
      evidenceHints: ["A documented foresight, horizon-scanning or scenario process, if one exists"],
    }),
    D("D01", "Experimentation & resourcing", "d01-05", "How many AI pilots were conducted, evaluated, scaled or stopped in the last 24 months?", {
      kind: "numbers",
      period: "Last 24 months",
      precision: true,
      fields: [
        { id: "conducted", label: "Pilots conducted" },
        { id: "evaluated", label: "Pilots formally evaluated", hint: "Cannot exceed pilots conducted" },
        { id: "scaled", label: "Pilots scaled" },
        { id: "stopped", label: "Pilots stopped" },
      ],
    }, {
      help: "Approximate figures are acceptable if exact counts are not held centrally — indicate this below.",
      evidenceHints: ["Pilot evaluation reports or scaling / stopping decisions"],
    }),
    D("D01", "Leadership & differentiation", "d01-06", "A major AI development threatens a major programme within three years. What would the institution do first, who initiates it, and through what mechanism?", {
      kind: "structured_form",
      provisionalOptions: true,
      fields: [
        { id: "first", label: "What would the institution do first?", type: "select", allowOther: true, options: scale(["Commission a rapid review of the programme", "Convene an executive or task group", "Escalate to Council / Board", "Begin redesigning the programme", "Suspend or reduce intake", "Seek external or industry advice", "Wait for clearer evidence before acting", "No established response — it would depend on individuals"]) },
        { id: "who", label: "Who initiates it?", type: "multi_select", allowOther: true, max: 3, options: actors },
        { id: "mechanism", label: "Through what mechanism?", type: "multi_select", allowOther: true, options: scale(["Existing strategic planning cycle", "Programme review or re-approval process", "Dedicated AI or futures committee", "Executive decision", "Ad hoc or emergency task group", "Faculty-level decision", "Informal senior discussion"]) },
        { id: "nuance", label: "Anything that would change this answer", type: "short_text", maxLength: 160, optional: true, placeholder: "e.g. Depends on whether the programme is accredited" },
      ],
    }, {
      help: "Answer as things would actually happen today, not as the institution would wish them to happen.",
    }),
    D("D01", "Leadership & differentiation", "d01-07", "What distinctive institutional value does the university intend to strengthen as AI makes information and routine content increasingly abundant?", {
      kind: "structured_form",
      provisionalOptions: true,
      fields: [
        { id: "value", label: "The value the institution intends to strengthen", hint: "Choose up to three.", type: "multi_select", allowOther: true, max: 3, options: scale(["Human judgement and critical thinking", "Disciplinary depth and expertise", "Original research and knowledge creation", "Mentorship and personal academic relationships", "Practical, professional and experiential learning", "Community, civic and regional contribution", "Ethical and responsible leadership", "Interdisciplinary, problem-focused learning", "Trusted credentials and assessment integrity", "Access and inclusion"]) },
        { id: "demonstrated", label: "Where this is already visible in practice", type: "multi_select", options: scale(["Named in strategy or positioning", "Programme design", "Assessment design", "Resource allocation", "Staff recruitment or development", "External recognition or partnerships", "Not yet visibly demonstrated"]) },
        { id: "rationale", label: "Why this value — in one sentence", type: "short_text", maxLength: 200, optional: true, placeholder: "The institutional reasoning, in your own words" },
      ],
    }, {
      evidenceHints: ["Strategy, positioning or programme documents that express this value"],
    }),
  ],
  D02: [
    D("D02", "Ownership & decision-making", "d02-01", "A new AI system processing student information is proposed. Who can authorise institutional deployment?", {
      kind: "structured_form",
      provisionalOptions: true,
      fields: [
        { id: "who", label: "Who can authorise deployment?", type: "multi_select", allowOther: true, max: 3, options: actors },
        { id: "basis", label: "Where does that authority come from?", type: "select", options: scale(["A formal delegation schedule", "Committee terms of reference", "A policy or framework provision", "Established practice, not documented", "Not defined — decided case by case", "Not sure"]) },
        { id: "name", label: "Name of the body, schedule or policy", type: "short_text", maxLength: 100, optional: true, placeholder: "e.g. Digital Governance Committee ToR, s.4" },
      ],
    }, {
      evidenceHints: ["AI governance framework or policy", "Delegation schedule or committee terms of reference"],
    }),
    D("D02", "Ownership & decision-making", "d02-02", "What steps actually occur before a consequential AI system is approved?", {
      kind: "process_steps",
      stepLabel: "Step",
      min: 1,
      max: 8,
      provisionalOptions: true,
      stepFields: [
        { id: "what", label: "What happens", type: "select", allowOther: true, options: scale(["Business case or proposal", "Data protection / privacy assessment", "Security review", "Ethics review", "Academic or pedagogical review", "Procurement or contract review", "Equality, bias or fairness assessment", "Pilot or trial", "Committee approval", "Executive sign-off", "Communication or training"]) },
        { id: "who", label: "Who owns this step", type: "multi_select", options: actors },
        { id: "consistency", label: "How consistently it happens", type: "select", options: consistency },
      ],
    }, {
      help: "In the order they happen in practice. If approval is currently informal, show that through the steps and how consistently they occur.",
      evidenceHints: ["Approval or review workflow documentation"],
    }),
    D("D02", "Policy & data", "d02-03", "Which AI governance policies are approved, implemented and reviewed?", {
      kind: "matrix",
      provisionalOptions: true,
      rows: { source: "respondent_select", rowLabel: "Policy", allowOther: true, options: scale(["Responsible / ethical AI policy", "Generative AI in teaching & assessment guidance", "Academic integrity policy (AI provisions)", "Data protection provisions for AI", "AI procurement or vendor standards", "Research use of AI guidance", "Staff use of AI guidance", "Student use of AI guidance", "AI risk management framework"]) },
      columns: [
        { id: "approved", label: "Approved", type: "check" },
        { id: "implemented", label: "Implemented", type: "check" },
        { id: "reviewed", label: "Reviewed", type: "check" },
        { id: "lastReview", label: "Last review", type: "month" },
      ],
    }, {
      evidenceHints: ["The policies listed, with approval and review dates"],
    }),
    D("D02", "Policy & data", "d02-05", "For approved AI tools, how many process personal/student data and how many have undergone defined privacy/data review?", {
      kind: "numbers",
      precision: true,
      fields: [
        { id: "processing", label: "Approved AI tools processing personal or student data" },
        { id: "reviewed", label: "Of those, tools that have undergone a defined privacy / data review", hint: "Cannot exceed the number above" },
      ],
    }, {
      evidenceHints: ["Privacy or data review record for one representative system"],
    }),
    D("D02", "Integrity & oversight", "d02-06", "How does the institution determine whether student generative-AI use is appropriate?", {
      kind: "structured_form",
      provisionalOptions: true,
      fields: [
        { id: "how", label: "How appropriateness is determined", type: "multi_select", options: scale(["Institution-wide policy defines permitted use", "Programme or module-level rules", "Each assessment brief specifies permitted AI use", "Academic judgement, case by case", "Student declaration of AI use", "Detection tools", "Not currently determined"]) },
        { id: "criteria", label: "Criteria or decision points used", type: "multi_select", options: scale(["Learning outcomes being assessed", "Type of task", "Level of study", "Discipline norms", "Disclosure and attribution by the student", "Professional body requirements"]) },
        { id: "consistency", label: "How consistently this is applied", type: "select", options: scale(["Consistently, institution-wide", "Broadly, with faculty variation", "Varies widely", "Not sure"]) },
      ],
    }, {
      evidenceHints: ["Academic integrity / generative AI guidance", "One assessment brief showing how AI use is specified"],
    }),
    D("D02", "Integrity & oversight", "d02-07", "For consequential AI-assisted decisions, where can a human review or override the output?", {
      kind: "matrix",
      provisionalOptions: true,
      rows: { source: "respondent_select", rowLabel: "Consequential AI-assisted decision", allowOther: true, options: consequentialDecisions },
      columns: [
        { id: "reviewPoint", label: "Where a human reviews", type: "select", options: scale(["Before the output is acted on", "After — on appeal or complaint", "Sampled or periodic review", "No defined review point", "Not sure"]) },
        { id: "override", label: "Override possible", type: "select", options: yesNoUnsure },
      ],
    }),
    D("D02", "Incidents, vendors & testing", "d02-04", "An AI system produces a harmful or discriminatory outcome affecting a student. What happens next?", {
      kind: "structured_form",
      provisionalOptions: true,
      fields: [
        { id: "occurred", label: "Has such an incident actually occurred?", type: "yes_no_unsure" },
        { id: "next", label: "What happens next?", type: "multi_select", allowOther: true, options: scale(["Reported through a defined incident channel", "Reported informally to a manager", "System paused or withdrawn", "Affected student contacted and remedy offered", "Formal investigation opened", "Vendor engaged", "Data protection officer or regulator notified where required", "No defined step — handled ad hoc"]) },
        { id: "who", label: "Who is involved?", type: "multi_select", options: actors },
        { id: "decides", label: "Who decides?", type: "select", allowOther: true, options: actors },
        { id: "learning", label: "How does the institution learn from it?", type: "multi_select", options: scale(["Formal incident review", "Change to policy or process", "Change to system or vendor", "Lessons shared institution-wide", "Recorded in the risk register", "No structured learning", "Not sure"]) },
        { id: "nuance", label: "Anything specific to how this works here", type: "short_text", maxLength: 160, optional: true },
      ],
    }, {
      help: "If this has actually happened, answer for what occurred. If not, answer for what would happen under current arrangements.",
      evidenceHints: ["Incident record or a test / exercise of the response process"],
    }),
    D("D02", "Incidents, vendors & testing", "d02-08", "For the three most consequential external AI systems, what due diligence and monitoring has occurred?", {
      kind: "records",
      recordLabel: "External AI system",
      min: 1,
      max: 3,
      provisionalOptions: true,
      noneOption: "No external AI system is in consequential use",
      fields: [
        { id: "type", label: "Type of system", type: "select", allowOther: true, options: externalSystemTypes },
        { id: "name", label: "System name", type: "short_text", maxLength: 60, optional: true, placeholder: "Product or vendor" },
        { id: "diligence", label: "Due diligence before adoption", type: "multi_select", options: scale(["Data protection assessment", "Security review", "Contract or terms review", "Bias or fairness assessment", "Academic or pedagogical review", "Reference checks with peer institutions", "Pilot evaluation", "None", "Not sure"]) },
        { id: "monitoring", label: "Monitoring since adoption", type: "multi_select", options: scale(["Usage monitoring", "Periodic performance or accuracy review", "Incident or complaint tracking", "Contract or renewal review", "Vendor change notices reviewed", "None", "Not sure"]) },
      ],
    }, {
      evidenceHints: ["Vendor or tool review records for the systems listed"],
    }),
    D("D02", "Incidents, vendors & testing", "d02-09", "Has the institution tested its AI governance process? What changed as a result?", {
      kind: "single_choice",
      provisionalOptions: true,
      options: [
        { value: "tested-changed", label: "Yes — tested, and changes were made as a result" },
        { value: "tested-unchanged", label: "Yes — tested; no changes were considered necessary" },
        { value: "planned", label: "Not yet, but a test is planned" },
        { value: "no", label: "No" },
      ],
      nuance: { label: "What was tested and what changed", maxLength: 160, placeholder: "e.g. Tabletop exercise on a biased admissions model; added a pre-deployment fairness check" },
    }, {
      evidenceHints: ["Record of the test, exercise or review and any resulting changes"],
    }),
  ],
  D03: [
    D("D03", "Capability architecture", "d03-01", "Which graduate capabilities does the institution explicitly intend students to develop in the AI era?", {
      kind: "multi_choice",
      options: d03Capabilities,
    }, {
      help: "Select only capabilities the institution has explicitly committed to — in a graduate attributes framework, programme outcomes or equivalent.",
      evidenceHints: ["Graduate capability or graduate attributes framework"],
    }),
    D("D03", "Capability architecture", "d03-02", "For representative programmes, where is each selected capability intended, developed, demonstrated and assessed?", {
      kind: "matrix",
      rows: { source: "prior_response", promptId: "d03-01", rowLabel: "Capability" },
      columns: [
        { id: "intended", label: "Intended", type: "check" },
        { id: "developed", label: "Developed", type: "check" },
        { id: "demonstrated", label: "Demonstrated", type: "check" },
        { id: "assessed", label: "Assessed", type: "check" },
      ],
    }, {
      help: "Rows are the capabilities you selected in the previous question. Tick what is true for a representative set of programmes, not the best case.",
    }),
    D("D03", "Demonstration & assessment", "d03-03", "Provide one representative student activity/work sample demonstrating each of 3–5 selected capabilities.", {
      kind: "evidence_request",
      items: ["One representative student activity or work sample for each of 3–5 of the capabilities you selected"],
      note: "Add these through the Evidence workspace. Anonymised samples are acceptable.",
      noteField: { label: "Which capabilities the samples will cover", maxLength: 120, placeholder: "e.g. Critical thinking, verification, problem formulation" },
    }, {
      allowNotSure: false,
    }),
    D("D03", "Demonstration & assessment", "d03-04", "How are students required to demonstrate capability rather than simply produce an answer?", {
      kind: "matrix",
      provisionalOptions: true,
      rows: { source: "prior_response", promptId: "d03-01", rowLabel: "Capability" },
      columns: [{ id: "how", label: "How students are required to demonstrate it", type: "multi_select", options: scale(["Oral defence or viva", "Showing working or process documentation", "Reflective commentary", "Live or in-class performance", "Iterative drafts with feedback", "Application to a novel case", "Team work with individual accountability", "Practical, lab or placement", "Not specifically required"]) }],
    }, {
      evidenceHints: ["Rubrics or capability criteria", "Representative assessment briefs"],
    }),
    D("D03", "Verification & problem formulation", "d03-05", "Where are students expected to verify, challenge or contextualise AI-generated output?", {
      kind: "records",
      recordLabel: "Programme, course or activity",
      min: 1,
      max: 5,
      provisionalOptions: true,
      noneOption: "Students are not yet expected to do this anywhere",
      fields: [
        { id: "level", label: "Where", type: "select", options: scale(["Across most programmes", "Specific programmes", "Specific modules", "Co-curricular or skills programme"]) },
        { id: "name", label: "Programme, module or activity name", type: "short_text", maxLength: 80, optional: true },
        { id: "what", label: "What students are required to do", type: "multi_select", options: scale(["Verify factual accuracy against sources", "Identify errors, gaps or bias", "Compare with their own reasoning", "Improve or refine the output", "Contextualise for the discipline or local setting", "Justify acceptance or rejection", "Document the process"]) },
      ],
    }, {
      evidenceHints: ["An AI verification activity or assessment brief"],
    }),
    D("D03", "Verification & problem formulation", "d03-06", "How often do students work on unfamiliar or ambiguous problems with no single prepared answer?", {
      kind: "single_choice",
      provisionalOptions: true,
      options: scale(["In most programmes, as a designed feature", "In many programmes", "In some programmes or modules", "Occasionally, depending on the academic", "Rarely"]),
    }, {
      evidenceHints: ["An example task or project brief"],
    }),
    D("D03", "Outcomes & disciplines", "d03-07", "Where available, what proportion of students meet defined competency thresholds for selected capabilities?", {
      kind: "numbers",
      precision: true,
      fields: [{ id: "proportion", label: "Proportion of students meeting defined thresholds (%)", hint: "For the capabilities where a threshold is defined and measured" }],
    }, {
      help: "Many institutions do not yet measure this. If no defined thresholds exist, request Not applicable — do not estimate.",
      allowNotApplicable: true,
      evidenceHints: ["Capability outcome data, where it exists"],
    }),
    D("D03", "Outcomes & disciplines", "d03-08", "For non-technical disciplines, how are students developing AI capability relevant to their discipline?", {
      kind: "matrix",
      provisionalOptions: true,
      rows: { source: "respondent_select", rowLabel: "Non-technical discipline", allowOther: true, options: scale(["Humanities", "Social sciences", "Law", "Business & management", "Education", "Health & nursing", "Arts & design", "Languages"]) },
      columns: [
        { id: "how", label: "How students develop discipline-relevant AI capability", type: "multi_select", options: scale(["Dedicated AI-in-discipline module", "Embedded in core modules", "Optional or elective module", "Co-curricular workshops", "Individual academic initiative", "Not yet"]) },
        { id: "sample", label: "Sample available", type: "select", options: yesNoUnsure },
      ],
    }, {
      allowNotApplicable: true,
      help: "Request Not applicable only if the institution genuinely teaches no non-technical disciplines.",
    }),
    D("D03", "Leadership reflection", "d03-09", "Which three graduate capabilities are least convincingly demonstrated today, and what evidence led to that conclusion?", {
      kind: "ranked_list",
      count: 3,
      itemLabel: "Capability",
      options: d03Capabilities,
      provisionalOptions: true,
      itemFields: [
        { id: "basis", label: "What led to this conclusion", type: "multi_select", options: scale(["Assessment results", "External examiner feedback", "Employer feedback", "Student feedback", "Staff judgement", "Programme review", "No systematic evidence"]) },
        { id: "nuance", label: "In one line, if helpful", type: "short_text", maxLength: 120, optional: true },
      ],
    }, {
      help: "A candid answer strengthens the assessment. Self-awareness about weak areas is itself informative.",
    }),
  ],
};

/**
 * Targeted follow-up prompts (workbook remediation probes). In production the
 * backend activates these; the mock pre-activates one per domain to exercise
 * the presentation framework.
 */
export const targetedPrompts: Record<"D01" | "D02" | "D03", Prompt[]> = {
  D01: [
    D("D01", "Experimentation & resourcing", "d01-t-02", "Show the last 12–18 months of material AI/future-priority decisions and corresponding budget, people, infrastructure or leadership-time movements. Which priority received resources and what evidence shows the movement was real?", {
      kind: "records",
      recordLabel: "Priority",
      min: 1,
      max: 5,
      provisionalOptions: true,
      fields: [
        { id: "priority", label: "Priority or decision", type: "short_text", maxLength: 80, placeholder: "e.g. Institution-wide GenAI licence and training" },
        { id: "movement", label: "What moved", type: "multi_select", options: scale(["Budget", "People or roles", "Infrastructure", "Leadership time", "Nothing yet"]) },
        { id: "period", label: "Over which period", type: "period", range: true },
        { id: "evidence", label: "What shows the movement was real", type: "multi_select", options: scale(["Budget or finance records", "Appointment or HR records", "Committee decisions", "Project records", "Leadership agendas or diaries", "No record available"]) },
      ],
    }, {
      origin: "targeted",
      targetedReason: "Opened by the assessment following your earlier responses in this domain.",
      evidenceHints: ["Two records showing the resource movement"],
    }),
  ],
  D02: [
    D("D02", "Incidents, vendors & testing", "d02-t-02", "Select the three most consequential AI use cases. Show how each risk was identified, rated, treated, assigned to an owner and monitored, including residual-risk decisions.", {
      kind: "records",
      recordLabel: "AI use case",
      min: 1,
      max: 3,
      provisionalOptions: true,
      fields: [
        { id: "useCase", label: "Use case", type: "select", allowOther: true, options: consequentialDecisions },
        { id: "identified", label: "How the risk was identified", type: "select", options: scale(["Formal risk assessment", "Procurement or approval review", "Following an incident", "Informal judgement", "Not identified"]) },
        { id: "rated", label: "How it was rated", type: "select", options: scale(["Rated in the risk register", "Rated informally", "Not rated"]) },
        { id: "treatment", label: "Treatment", type: "multi_select", options: scale(["Controls implemented", "Contract terms", "Human oversight point", "Restricted use", "Training", "Accepted without treatment"]) },
        { id: "owner", label: "Owner", type: "select", allowOther: true, options: actors },
        { id: "monitoring", label: "Monitoring", type: "select", options: scale(["Regular review cycle", "Ad hoc", "None"]) },
        { id: "residual", label: "Residual-risk decision", type: "select", options: scale(["Formally accepted", "Informally accepted", "Not decided", "Not sure"]) },
      ],
    }, {
      origin: "targeted",
      targetedReason: "Opened by the assessment following your earlier responses in this domain.",
      evidenceHints: ["Risk register extract for the three cases"],
    }),
  ],
  D03: [
    D("D03", "Demonstration & assessment", "d03-t-01", "Give two examples of assessed student work where students had to formulate or refine the question/problem rather than merely answer a supplied prompt. How was quality judged?", {
      kind: "records",
      recordLabel: "Example",
      min: 2,
      max: 2,
      provisionalOptions: true,
      fields: [
        { id: "task", label: "Task and programme", type: "short_text", maxLength: 80, placeholder: "e.g. Capstone inquiry project, BSc Economics" },
        { id: "formulation", label: "How students formulated or refined the question", type: "multi_select", allowOther: true, options: scale(["Chose their own question", "Refined a broad brief", "Reframed a supplied problem", "Defined scope and constraints", "Generated hypotheses"]) },
        { id: "judged", label: "How quality was judged", type: "multi_select", options: scale(["Rubric criterion for question quality", "Supervisor judgement", "Peer review", "Oral defence", "External examiner", "Not explicitly judged"]) },
      ],
    }, {
      origin: "targeted",
      targetedReason: "Opened by the assessment following your earlier responses in this domain.",
      evidenceHints: ["Two work samples and the rubric used"],
    }),
  ],
};

/* ---------------- Evidence requests (workbook evidence lists) ---------------- */

const E = (code: DomainCode, n: number, label: string, quantity: string, requirement: string): EvidenceRequest => ({
  id: `${code}-E${String(n).padStart(2, "0")}`,
  domainCode: code,
  domainName: domainNames[code],
  label,
  quantity,
  requirement,
  fulfilledByIds: [],
});

export const evidenceRequests: EvidenceRequest[] = [
  E("D01", 1, "Strategic plan / AI strategy", "1–2", "If exists"),
  E("D01", 2, "Material strategic decision influenced by AI", "Up to 3", "Full assessment"),
  E("D01", 3, "Programme review showing future / AI consideration", "1–2", "Sample"),
  E("D01", 4, "Foresight / scenario process", "1", "If exists"),
  E("D01", 5, "Pilot evaluation / scaling decision", "Up to 3", "If pilots exist"),
  E("D02", 1, "AI governance framework / policy", "1–3", "If exists"),
  E("D02", 2, "AI approval / review workflow", "1", "Full assessment"),
  E("D02", 3, "Data / privacy control evidence", "1", "Representative system"),
  E("D02", 4, "Academic integrity / AI guidance", "1", "If exists"),
  E("D02", 5, "AI-affected assessment example", "1", "Representative"),
  E("D02", 6, "Incident / test evidence", "1", "If exists"),
  E("D02", 7, "Vendor / tool review", "Up to 3", "Representative"),
  E("D03", 1, "Graduate capability framework", "1", "If claimed"),
  E("D03", 2, "Representative assessment / activity", "3–5", "Full assessment"),
  E("D03", 3, "Rubric / capability criteria", "1–3", "If used"),
  E("D03", 4, "AI verification activity", "1", "If claimed"),
  E("D03", 5, "Non-technical discipline sample", "Up to 3", "Where applicable"),
  E("D03", 6, "Capability outcome evidence", "1", "If available"),
];

export const evidenceTypes: ChoiceOption[] = [
  { value: "strategy-policy", label: "Strategy, policy or framework" },
  { value: "governance-record", label: "Committee paper, minutes or decision record" },
  { value: "process", label: "Process, workflow or procedure" },
  { value: "operational-record", label: "Operational record or register" },
  { value: "assessment-material", label: "Assessment brief, rubric or student work sample" },
  { value: "outcome-data", label: "Outcome data or evaluation report" },
  { value: "external-review", label: "External or independent review" },
  { value: "other", label: "Other" },
];

export const evidenceScopes: ChoiceOption[] = ["Institution-wide", "Faculty / school", "Department", "Programme", "Central service", "Pilot / project"].map((s) => ({ value: s, label: s }));

/* ---------------- Assessor metric catalogue (D01–D03 matrices) ---------------- */

export interface MetricDef {
  id: string;
  domainCode: "D01" | "D02" | "D03";
  name: string;
  capabilityArea: string;
  measurement: string;
}

const M = (domainCode: "D01" | "D02" | "D03", n: number, capabilityArea: string, name: string, measurement: string): MetricDef => ({
  id: `${domainCode}-I${String(n).padStart(2, "0")}`,
  domainCode,
  name,
  capabilityArea,
  measurement,
});

export const metricCatalogue: MetricDef[] = [
  M("D01", 1, "Institutional AI Awareness", "Strategic AI Integration", "Multi-select + sampled decisions"),
  M("D01", 2, "Future-of-Institution Thinking", "Future Foresight Maturity", "Scenario + foresight mechanism + evidence"),
  M("D01", 3, "Strategic Translation", "Strategic Translation Rate", "Numerical ratio + samples"),
  M("D01", 4, "Programme Portfolio Foresight", "Programme Future-Review Coverage", "Numerical ratio + sample quality"),
  M("D01", 5, "Institutional Value Proposition", "Strategic Differentiation Clarity", "Structured response + evidence"),
  M("D01", 6, "Scenario & Foresight Capability", "Foresight Response Architecture", "Process map"),
  M("D01", 7, "Strategic Investment Alignment", "Resource Alignment", "Budget bands + mapping"),
  M("D01", 8, "Leadership Alignment", "Leadership Alignment", "Role map + scenario"),
  M("D01", 9, "Strategic Experimentation", "Experimentation Effectiveness", "Pilot data + evidence"),
  M("D01", 10, "Institutional Learning Loop", "Strategic Learning Rate", "Decision history"),
  M("D02", 1, "Governance Ownership", "Governance Ownership", "Responsibility matrix + scenario"),
  M("D02", 2, "Decision Architecture", "Decision Architecture", "Workflow + evidence"),
  M("D02", 3, "Responsible AI Framework", "Responsible AI Maturity", "Policy matrix + scenario"),
  M("D02", 4, "Data Governance", "Data Governance Readiness", "Tool inventory + evidence"),
  M("D02", 5, "Academic Integrity Governance", "Academic Integrity Governance", "Scenario + guidance + assessment sample"),
  M("D02", 6, "Assessment Governance", "Assessment Governance", "Assessment governance map"),
  M("D02", 7, "AI Risk Management", "AI Risk Management", "Risk map + evidence"),
  M("D02", 8, "Incident Response", "Incident Responsiveness", "Scenario + process/test evidence"),
  M("D02", 9, "Human Oversight", "Human Accountability", "Process matrix"),
  M("D02", 10, "Vendor/Tool Governance", "Vendor/Tool Governance", "Top-3 tool sample"),
  M("D02", 11, "Intellectual Property", "IP Governance", "Policy/evidence"),
  M("D02", 12, "Research Governance", "Research AI Governance", "Research guidance/evidence"),
  M("D02", 13, "Governance Review", "Governance Review Adaptability", "Dates + change records"),
  M("D02", 14, "Governance Effectiveness", "Governance Effectiveness", "Triangulation"),
  M("D03", 1, "Foundational Knowledge", "Foundational Knowledge Depth", "Capability map + assessment"),
  M("D03", 2, "Critical Thinking", "Critical Reasoning Development", "Capability evidence chain"),
  M("D03", 3, "Question Formulation", "Question Formulation", "Project/assessment evidence"),
  M("D03", 4, "Analytical Reasoning", "Analytical Reasoning", "Assessment/rubric"),
  M("D03", 5, "Problem Formulation", "Problem Formulation", "Project/case evidence"),
  M("D03", 6, "Creativity & Originality", "Creativity & Originality", "Portfolio/project"),
  M("D03", 7, "Judgement & Decision-Making", "Judgement Capability", "Case/viva/practical"),
  M("D03", 8, "Verification & Epistemic Discipline", "AI Verification Capability", "Assessment/activity"),
  M("D03", 9, "Metacognition", "Metacognitive Capability", "Portfolio/reflection"),
  M("D03", 10, "Human-AI Collaboration", "Human-AI Collaboration", "Project evidence"),
  M("D03", 11, "Communication & Defence", "Communication & Defence", "Viva/oral/project"),
  M("D03", 12, "Collaboration", "Collaboration Capability", "Project evidence"),
  M("D03", 13, "Practical Capability", "Practical Capability", "Practical evidence"),
  M("D03", 14, "Ethical/Social Judgement", "Ethical/Social Judgement", "Case/professional evidence"),
  M("D03", 15, "Intellectual Agency", "Intellectual Agency", "Student work/project"),
  M("D03", 16, "Transfer Capability", "Transfer Capability", "Case/project/simulation"),
  M("D03", 17, "Non-Technical Discipline AI Capability", "Non-Technical Discipline AI Capability", "Discipline matrix + sample work"),
];

/** Prompt → metric linkage as recorded in the workbook question banks (assessor-facing only). */
export const promptMetricLinks: Record<string, string[]> = {
  "d01-01": ["D01-I01", "D01-I08"],
  "d01-02": ["D01-I01", "D01-I03"],
  "d01-03": ["D01-I02"],
  "d01-04": ["D01-I02", "D01-I06"],
  "d01-05": ["D01-I09"],
  "d01-06": ["D01-I08"],
  "d01-07": ["D01-I05"],
  "d01-t-02": ["D01-I07"],
  "d02-01": ["D02-I01"],
  "d02-02": ["D02-I02"],
  "d02-03": ["D02-I03", "D02-I13"],
  "d02-04": ["D02-I08"],
  "d02-05": ["D02-I04"],
  "d02-06": ["D02-I05"],
  "d02-07": ["D02-I09"],
  "d02-08": ["D02-I10"],
  "d02-09": ["D02-I14"],
  "d02-t-02": ["D02-I07"],
  "d03-01": ["D03-I01"],
  "d03-02": ["D03-I01"],
  "d03-03": ["D03-I02", "D03-I04", "D03-I07", "D03-I15", "D03-I16"],
  "d03-04": ["D03-I02", "D03-I04", "D03-I07"],
  "d03-05": ["D03-I08"],
  "d03-06": ["D03-I05", "D03-I16"],
  "d03-07": ["D03-I07"],
  "d03-08": ["D03-I17"],
  "d03-09": ["D03-I15", "D03-I16"],
  "d03-t-01": ["D03-I03"],
};
