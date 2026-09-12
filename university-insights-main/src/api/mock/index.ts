/**
 * MOCK IMPLEMENTATION of ArUiApi.
 *
 * Runs entirely in the browser with local data so the frontend can be built
 * and reviewed before the production backend exists. It stands in for the
 * backend by SEQUENCING and STORING — it does not score, weight, calibrate or
 * apply any methodology rule. Values that the real engine would compute
 * (required maturity, transformation distance, metric scores, confidence,
 * findings) are fixed illustrative fixtures, clearly labelled as such.
 *
 * State persists in localStorage so a refresh keeps the demo session.
 */

import {
  domainCodes,
  domainNames,
  inScopeDomains,
  roleLabels,
  type DomainCode,
  type Role,
} from "@/lib/catalogue";
import type { ArUiApi, SaveResponseInput } from "../client";
import type {
  AssessmentStatus,
  AssessmentStatusView,
  ContextCalibration,
  DomainProgress,
  EvidenceItem,
  ExecutionLogEntry,
  MetricScoring,
  NextPromptResponse,
  PreliminaryResults,
  ProfileValues,
  Prompt,
  PromptPosition,
  PromptResponse,
  ScoreRun,
  Session,
  StageProgress,
} from "../types";
import {
  domainPrompts,
  evidenceRequests,
  evidenceScopes,
  evidenceTypes,
  metricCatalogue,
  profileForm,
  promptMetricLinks,
  screeningPrompts,
  targetedPrompts,
} from "./content";

type SliceDomain = "D01" | "D02" | "D03";
const ASSESSMENT_ID = "asm-demo-2026";
const INSTITUTION = { id: "inst-demo", name: "Demonstration University" };
const METHODOLOGY_VERSION = "ARUI P0-8 (pre-pilot) · mock";
const STORAGE_KEY = "arui.mock.v2";

interface MockState {
  session: Session | null;
  profile: ProfileValues;
  profileUpdatedAt: string | null;
  responses: Record<string, PromptResponse>;
  evidence: EvidenceItem[];
  metricScoring: Record<string, MetricScoring>;
  scoreRuns: ScoreRun[];
  log: ExecutionLogEntry[];
  seq: number;
}

const now = () => new Date().toISOString();
const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */

function seedEvidence(): EvidenceItem[] {
  const base = { demo: true, confirmedSupports: [] as string[] };
  return [
    {
      ...base,
      id: "ev-1",
      title: "Institutional Strategic Plan 2024–2029",
      kind: "document",
      evidenceType: "strategy-policy",
      fileName: "strategic-plan-2024-2029.pdf",
      fileSize: 2_400_000,
      periodStart: "2024-01",
      periodEnd: "2029-12",
      description:
        "Approved plan including the digital transformation pillar and AI statement of intent.",
      scope: "Institution-wide",
      proposedSupports: [domainNames.D01, domainNames.D02],
      confirmedSupports: [domainNames.D01],
      fulfilsRequestIds: ["D01-E01"],
      status: "accepted",
      addedAt: "2026-03-02T09:12:00Z",
    },
    {
      ...base,
      id: "ev-2",
      title: "Academic Integrity and Generative AI Guidance",
      kind: "url",
      evidenceType: "strategy-policy",
      url: "https://example.edu/integrity/generative-ai",
      periodStart: "2025-08",
      description: "Published guidance for staff and students on acceptable use in assessment.",
      scope: "Institution-wide",
      proposedSupports: [domainNames.D02, domainNames.D03],
      fulfilsRequestIds: ["D02-E04"],
      status: "under_review",
      addedAt: "2026-03-02T10:40:00Z",
    },
    {
      ...base,
      id: "ev-3",
      title: "AI Working Group — terms of reference",
      kind: "document",
      evidenceType: "governance-record",
      fileName: "ai-working-group-tor.docx",
      fileSize: 88_000,
      periodStart: "2025-02",
      description: "Membership, reporting line and remit of the cross-institutional working group.",
      scope: "Institution-wide",
      proposedSupports: [domainNames.D02, domainNames.D01],
      fulfilsRequestIds: ["D02-E01"],
      status: "submitted",
      addedAt: "2026-03-03T14:05:00Z",
    },
    {
      ...base,
      id: "ev-4",
      title: "Faculty of Engineering staff development pilot",
      kind: "note",
      evidenceType: "other",
      description:
        "Short description of the 2025 pilot programme; formal evaluation not yet available.",
      scope: "Faculty / school",
      proposedSupports: [domainNames.D03],
      fulfilsRequestIds: [],
      status: "draft",
      addedAt: "2026-03-04T08:30:00Z",
    },
  ];
}

function seedScoring(): Record<string, MetricScoring> {
  const out: Record<string, MetricScoring> = {};
  for (const m of metricCatalogue) {
    out[m.id] = {
      metricId: m.id,
      metricName: m.name,
      domainCode: m.domainCode,
      capabilityArea: m.capabilityArea,
      measurementMethod: m.measurement,
      status: "unscored",
      applicable: true,
      notApplicableRationale: "",
      maturity: null,
      implementation: null,
      outcome: null,
      outcomeNotApplicable: false,
      outcomeNotApplicableRationale: "",
      evidenceLevel: null,
      rationale: "",
      linkedResponseIds: Object.entries(promptMetricLinks)
        .filter(([, ids]) => ids.includes(m.id))
        .map(([pid]) => pid),
      linkedEvidenceIds: [],
      flags: [],
      engine: null,
    };
  }
  // Illustrative assessor drafts (fixtures, not computed).
  Object.assign(out["D01-I01"]!, {
    status: "scored",
    maturity: 3,
    implementation: 2,
    outcome: null,
    outcomeNotApplicable: true,
    outcomeNotApplicableRationale: "Outcome construct not yet observable within the review period.",
    evidenceLevel: "E1",
    rationale:
      "Strategy names AI with executive sponsor; decision sampling shows two decisions influenced.",
    linkedEvidenceIds: ["ev-1"],
    engine: { metricScore: 52, validation: "OK", runId: "run-1" },
  });
  Object.assign(out["D01-I02"]!, {
    status: "draft",
    maturity: 2,
    implementation: 2,
    outcome: null,
    evidenceLevel: "E0",
    rationale: "Foresight described as ad hoc; no documented mechanism supplied yet.",
    engine: null,
  });
  Object.assign(out["D01-I09"]!, {
    status: "review",
    maturity: 4,
    implementation: 3,
    outcome: 3,
    evidenceLevel: "E0",
    rationale:
      "Respondent reports 6 pilots, 5 evaluated, 2 scaled. Evaluation records not yet supplied.",
    flags: [
      {
        code: "REVIEW",
        label: "High claim without evidence above claim level",
        severity: "review",
        source: "engine",
      },
    ],
    engine: { metricScore: 68, validation: "REVIEW", runId: "run-1" },
  });
  Object.assign(out["D02-I01"]!, {
    status: "scored",
    maturity: 2,
    implementation: 2,
    outcome: null,
    outcomeNotApplicable: true,
    outcomeNotApplicableRationale: "No outcome construct for this metric in the current cycle.",
    evidenceLevel: "E1",
    rationale:
      "Authority sits with an advisory working group; no delegated decision right recorded.",
    linkedEvidenceIds: ["ev-3"],
    engine: { metricScore: 40, validation: "OK", runId: "run-1" },
  });
  Object.assign(out["D02-I05"]!, {
    status: "draft",
    maturity: 3,
    implementation: 2,
    outcome: null,
    evidenceLevel: "E1",
    rationale: "Published guidance exists; implementation varies by faculty.",
    linkedEvidenceIds: ["ev-2"],
  });
  Object.assign(out["D03-I08"]!, {
    status: "draft",
    maturity: 2,
    implementation: 1,
    outcome: null,
    evidenceLevel: null,
    rationale: "",
  });
  Object.assign(out["D03-I17"]!, {
    status: "not_applicable",
    applicable: false,
    notApplicableRationale:
      "PENDING ACCEPTANCE — respondent requested N/A; institution states no non-technical disciplines are taught. Requires verification against the programme register.",
    flags: [
      {
        code: "NA-REVIEW",
        label: "N/A request awaiting assessor acceptance",
        severity: "review",
        source: "engine",
      },
    ],
  });
  return out;
}

function seedResponses(): Record<string, PromptResponse> {
  const t = "2026-03-03T11:00:00Z";
  return {
    "s-01": { promptId: "s-01", state: "answered", value: "strategic-priority", updatedAt: t },
    "s-02": {
      promptId: "s-02",
      state: "answered",
      value: "informally-where-individuals-take-initiative",
      updatedAt: t,
    },
    "d01-01": {
      promptId: "d01-01",
      state: "answered",
      value: "a-stated-strategic-priority-with-senior-ownership",
      note: "Named under the digital pillar of the 2024–2029 strategy; DVC (Academic) is executive sponsor.",
      updatedAt: t,
    },
    "d01-02": {
      promptId: "d01-02",
      state: "answered",
      value: [
        {
          decision: "Assessment policy revision",
          change: "Mandated AI-use statements on all assessment briefs from 2025–26.",
          when: "Academic Council, June 2025",
        },
        {
          decision: "Foundation-year intake review",
          change: "Intake paused pending review of AI-exposed content.",
          when: "Planning Committee, Nov 2025",
        },
      ],
      updatedAt: t,
    },
    "d01-03": {
      promptId: "d01-03",
      state: "not_sure",
      value: null,
      note: "Requires input from the Planning Office.",
      updatedAt: t,
    },
  };
}

function seedLog(): ExecutionLogEntry[] {
  const L = (
    n: number,
    timestamp: string,
    stage: string,
    domainCode: DomainCode | null,
    metricOrRule: string | null,
    status: string,
    evidenceRef: string | null,
    actor: string,
    decision: string,
  ): ExecutionLogEntry => ({
    id: `log-${n}`,
    timestamp,
    stage,
    domainCode,
    metricOrRule,
    status,
    evidenceRef,
    actor,
    decision,
  });
  return [
    L(
      1,
      "2026-03-01T09:00:00Z",
      "1 Profile",
      null,
      null,
      "COMPLETE",
      null,
      "Institution Admin",
      "Profile submitted",
    ),
    L(
      2,
      "2026-03-02T09:15:00Z",
      "2 Screening",
      null,
      null,
      "IN PROGRESS",
      null,
      "Institution Admin",
      "2 of 5 screening prompts recorded",
    ),
    L(
      3,
      "2026-03-03T11:02:00Z",
      "3 Branch",
      "D01",
      "d01-t-02",
      "ACTIVATED",
      null,
      "Engine",
      "Targeted prompt opened",
    ),
    L(
      4,
      "2026-03-03T14:10:00Z",
      "4 Evidence",
      "D01",
      "D01-E01",
      "RECEIVED",
      "ev-1",
      "Institution Admin",
      "Evidence submitted",
    ),
    L(
      5,
      "2026-03-04T10:00:00Z",
      "Assessor",
      "D01",
      "D01-I01",
      "SCORED",
      "ev-1",
      "Assessor A",
      "M3 / I2 / O n.a.",
    ),
    L(
      6,
      "2026-03-04T10:30:00Z",
      "Engine",
      "D01",
      "D01-I09",
      "REVIEW",
      null,
      "Engine",
      "Review flag raised — high claim, E0",
    ),
    L(
      7,
      "2026-03-04T16:00:00Z",
      "Score run",
      null,
      "run-1",
      "COMPLETE",
      null,
      "Engine",
      "Preliminary run over D01–D03",
    ),
  ];
}

function seedState(): MockState {
  return {
    session: null,
    profile: {
      name: INSTITUTION.name,
      institutionType: "comprehensive",
      mandate: ["broad"],
      scale: "m",
      geography: ["south-asia"],
      resourceEnvelope: "medium",
      researchIntensity: 3,
      studentProfileComplexity: 3,
      aiExposure: null,
      disciplinaryConsequence: null,
      trajectory: null,
    },
    profileUpdatedAt: "2026-03-01T09:00:00Z",
    responses: seedResponses(),
    evidence: seedEvidence(),
    metricScoring: seedScoring(),
    scoreRuns: [
      {
        id: "run-1",
        createdAt: "2026-03-04T16:00:00Z",
        status: "complete",
        kind: "preliminary",
        methodologyVersion: METHODOLOGY_VERSION,
        scope: ["D01", "D02", "D03"],
        triggeredBy: "Assessor A",
        summary:
          "Preliminary run over D01–D03. 3 metrics scored, 1 review flag, 1 N/A pending acceptance. Illustrative fixture.",
      },
    ],
    log: seedLog(),
    seq: 100,
  };
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

let state: MockState | null = null;

function load(): MockState {
  if (state) return state;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw) as MockState;
        return state;
      }
    } catch {
      /* ignore corrupt storage */
    }
  }
  state = seedState();
  return state;
}

function persist() {
  if (typeof window !== "undefined" && state)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function logEntry(s: MockState, entry: Omit<ExecutionLogEntry, "id" | "timestamp">) {
  s.log.push({ id: `log-${++s.seq}`, timestamp: now(), ...entry });
}

/* ------------------------------------------------------------------ */
/* Derivations (sequencing/counting only)                              */
/* ------------------------------------------------------------------ */

function isSlice(code: DomainCode): code is SliceDomain {
  return (inScopeDomains as string[]).includes(code);
}

/** Ordered prompt list for a domain: core prompts, then any activated targeted prompts. */
function orderedPrompts(s: MockState, code: SliceDomain): Prompt[] {
  const core = domainPrompts[code];
  const coreDone = core.every((p) => s.responses[p.id]);
  // Mock stand-in for the backend router: targeted prompts open once the core set has responses.
  return coreDone ? [...core, ...targetedPrompts[code]] : core;
}

function profileComplete(s: MockState) {
  return profileForm.steps.every((st) =>
    st.fields.every(
      (f) =>
        !f.required ||
        (Array.isArray(s.profile[f.id])
          ? (s.profile[f.id] as string[]).length > 0
          : s.profile[f.id] !== null && s.profile[f.id] !== undefined && s.profile[f.id] !== ""),
    ),
  );
}

function domainProgress(s: MockState, code: DomainCode): DomainProgress {
  if (!isSlice(code))
    return {
      code,
      name: domainNames[code],
      inScope: false,
      state: "not_in_scope",
      themesExplored: 0,
      themesTotal: 0,
      targetedFollowUp: false,
    };
  const list = orderedPrompts(s, code);
  const themes = [...new Set(list.map((p) => p.theme))];
  const answered = list.filter((p) => s.responses[p.id]);
  const themesExplored = themes.filter((t) =>
    list.filter((p) => p.theme === t).every((p) => s.responses[p.id]),
  ).length;
  const state: DomainProgress["state"] =
    answered.length === 0
      ? "not_started"
      : answered.length === list.length
        ? "complete"
        : "in_progress";
  return {
    code,
    name: domainNames[code],
    inScope: true,
    state,
    themesExplored,
    themesTotal: themes.length,
    targetedFollowUp: list.some((p) => p.origin === "targeted"),
  };
}

function lifecycleStatus(s: MockState): AssessmentStatus {
  if (s.scoreRuns.some((r) => r.status === "complete")) return "preliminary";
  const domains = inScopeDomains.map((c) => domainProgress(s, c));
  if (domains.every((d) => d.state === "complete")) return "evidence";
  if (domains.some((d) => d.state !== "not_started")) return "assessment";
  if (screeningPrompts.some((p) => s.responses[p.id])) return "pulse";
  if (profileComplete(s)) return "pulse";
  return "profile";
}

function position(list: Prompt[], prompt: Prompt, s: MockState): PromptPosition {
  const themes = [...new Set(list.map((p) => p.theme))];
  const themeIndex = themes.indexOf(prompt.theme);
  const inTheme = list.filter((p) => p.theme === prompt.theme);
  return {
    theme: prompt.theme,
    themeIndex,
    themeTotal: themes.length,
    withinTheme: { current: inTheme.indexOf(prompt) + 1, total: inTheme.length },
    themes: themes.map((label) => ({
      label,
      state:
        label === prompt.theme
          ? "current"
          : list.filter((p) => p.theme === label).every((p) => s.responses[p.id])
            ? "complete"
            : "upcoming",
    })),
  };
}

function nextResponse(s: MockState, code: SliceDomain, prompt: Prompt | null): NextPromptResponse {
  const list = orderedPrompts(s, code);
  return {
    prompt,
    position: prompt ? position(list, prompt, s) : null,
    existingResponse: prompt ? (s.responses[prompt.id] ?? null) : null,
    domainComplete: list.every((p) => s.responses[p.id]),
    history: list
      .filter((p) => s.responses[p.id])
      .map((p) => ({ promptId: p.id, theme: p.theme, state: s.responses[p.id]!.state })),
  };
}

/* ------------------------------------------------------------------ */
/* Fixtures returned as engine output (illustrative, not computed)     */
/* ------------------------------------------------------------------ */

const preliminaryFixture: PreliminaryResults = {
  label: "Preliminary ARUI Assessment",
  scopeNote: "Indicative position based on the current assessment scope",
  coverage: { assessed: 3, total: 11, codes: "D01–D03" },
  scoreRunId: "run-1",
  generatedAt: "2026-03-04T16:00:00Z",
  overall: {
    current: 2,
    required: 4,
    transformationDistance: 2,
    confidence: "moderate",
    evidenceCoverage: 0.38,
    narrative:
      "Across the three assessed domains, the institution shows clearer strategic intent than institutional response capacity. Direction is articulated at the top; the governance mechanisms, human capability and evidence that would carry it through the institution are less developed and less well evidenced.",
  },
  domains: domainCodes.map((code) => {
    const fixtures: Partial<
      Record<DomainCode, Omit<PreliminaryResults["domains"][number], "code" | "name" | "assessed">>
    > = {
      D01: {
        current: 3,
        required: 4,
        transformationDistance: 1,
        confidence: "moderate",
        evidenceCoverage: 0.6,
        unvalidatedClaims: 2,
      },
      D02: {
        current: 2,
        required: 4,
        transformationDistance: 2,
        confidence: "moderate",
        evidenceCoverage: 0.45,
        unvalidatedClaims: 3,
      },
      D03: {
        current: 2,
        required: 3,
        transformationDistance: 1,
        confidence: "low",
        evidenceCoverage: 0.25,
        unvalidatedClaims: 5,
      },
    };
    return { code, name: domainNames[code], assessed: isSlice(code), ...(fixtures[code] ?? {}) };
  }),
  strengths: [
    {
      title: "Articulated strategic intent",
      body: "AI is named within the current strategic plan with senior ownership, which provides a mandate other areas can draw on.",
    },
    {
      title: "Published academic integrity guidance",
      body: "Institution-wide guidance on generative AI in assessment exists and is publicly accessible.",
    },
    {
      title: "A defined home for AI questions",
      body: "A cross-institutional AI working group with terms of reference exists, giving AI-related questions an identifiable owner.",
    },
  ],
  vulnerabilities: [
    {
      title: "Governance depends on a single working group",
      body: "Institutional response to AI questions routes through one advisory group without a defined decision right or escalation pathway.",
    },
    {
      title: "Capability development is largely self-directed",
      body: "Development opportunities exist but are optional and uneven; no institution-wide baseline is in place.",
    },
    {
      title: "Institutional response claims are thinly evidenced",
      body: "Claims about how the institution responds to new AI questions are not yet supported by documented decision or review mechanisms.",
    },
  ],
  contradictions: [
    {
      title: "Strategic priority, informal response",
      body: "AI is reported as a strategic priority, yet institutional responses to new AI questions are described as informal and individual-led. These two signals do not usually coexist for long.",
      between: [domainNames.D01, domainNames.D02],
    },
    {
      title: "Consistent guidance, uneven practice",
      body: "Institution-wide guidance exists, but practice in teaching and assessment is reported as varying significantly by faculty.",
      between: [domainNames.D02, domainNames.D03],
    },
  ],
  attention: [
    {
      area: domainNames.D02,
      reason: "Largest distance between current and required maturity within the assessed domains.",
    },
    {
      area: domainNames.D03,
      reason:
        "Low confidence: few claims evidenced; the position may change materially once evidence is added.",
    },
    {
      area: domainNames.D01,
      reason:
        "Intent is stated but resourcing is not yet evidenced; that claim remains unvalidated.",
    },
  ],
  caveats: [
    "Preliminary results are not a certification. Independent verification is a separate, later process.",
    "Missing evidence does not automatically reduce capability. Where the methodology requires evidence for a particular claim, that claim may remain unvalidated until sufficient evidence is available.",
    "Contradiction signals are diagnostic only and never adjust any position.",
  ],
};

const contextFixture: ContextCalibration[] = [
  {
    domainCode: "D01",
    domainName: domainNames.D01,
    requiredMaturity: 4,
    currentMaturity: 3,
    transformationDistance: 1,
    source: "engine",
    rationale:
      "Derived by the engine from the institution profile (mandate, AI exposure, consequence, trajectory).",
    overrideRequested: false,
    secondReview: "not_required",
  },
  {
    domainCode: "D02",
    domainName: domainNames.D02,
    requiredMaturity: 4,
    currentMaturity: 2,
    transformationDistance: 2,
    source: "engine",
    rationale: "Derived by the engine from the institution profile.",
    overrideRequested: false,
    secondReview: "not_required",
  },
  {
    domainCode: "D03",
    domainName: domainNames.D03,
    requiredMaturity: 3,
    currentMaturity: 2,
    transformationDistance: 1,
    source: "assessor_override",
    rationale:
      "Assessor A: profile understates disciplinary consequence for health programmes; override raised from engine value. Second review pending.",
    overrideRequested: true,
    secondReview: "pending",
  },
];

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

export function createMockApi(): ArUiApi {
  return {
    async login({ email, roleHint }) {
      await wait(350);
      const s = load();
      const role: Role =
        roleHint ?? (email.toLowerCase().includes("assessor") ? "assessor" : "institution_admin");
      const name =
        role === "assessor"
          ? "Assessor A"
          : email
              .split("@")[0]!
              .replace(/[._-]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()) || roleLabels[role];
      s.session = {
        token: `mock-${Date.now()}`,
        user: { id: `u-${role}`, name, email, role },
        institution: role === "assessor" ? null : INSTITUTION,
        assessmentId: role === "assessor" ? null : ASSESSMENT_ID,
        expiresAt: new Date(Date.now() + 8 * 3600_000).toISOString(),
      };
      persist();
      return clone(s.session);
    },
    async logout() {
      const s = load();
      s.session = null;
      persist();
    },
    async getSession() {
      return clone(load().session);
    },

    async getStatus(assessmentId) {
      await wait();
      const s = load();
      const status = lifecycleStatus(s);
      const screeningDone = screeningPrompts.filter((p) => s.responses[p.id]).length;
      const domains = domainCodes.map((c) => domainProgress(s, c));
      const slice = domains.filter((d) => d.inScope);
      const submitted = s.evidence.filter((e) => e.status !== "draft").length;
      const drafts = s.evidence.length - submitted;
      const pc = profileComplete(s);
      const order: StageProgress["id"][] = [
        "profile",
        "orientation",
        "pulse",
        "assessment",
        "evidence",
        "results",
      ];
      const done: Record<StageProgress["id"], boolean> = {
        profile: pc,
        orientation: pc,
        pulse: screeningDone === screeningPrompts.length,
        assessment: slice.every((d) => d.state === "complete"),
        evidence: submitted >= 8,
        results: false,
      };
      const firstOpen = order.find((id) => !done[id]) ?? "results";
      const stateOf = (id: StageProgress["id"]): StageProgress["state"] =>
        done[id]
          ? "complete"
          : id === firstOpen
            ? "current"
            : id === "results" && status !== "preliminary"
              ? "locked"
              : "upcoming";
      const stages: StageProgress[] = [
        {
          id: "profile",
          label: "Institution Profile",
          caption: pc ? "Context captured" : "Context incomplete",
          state: stateOf("profile"),
        },
        {
          id: "orientation",
          label: "Orientation",
          caption: "How the assessment works",
          state: stateOf("orientation"),
        },
        {
          id: "pulse",
          label: "Institutional Pulse",
          caption: `${screeningDone} of ${screeningPrompts.length} signals captured`,
          state: stateOf("pulse"),
        },
        {
          id: "assessment",
          label: "Assessment",
          caption: `${slice.filter((d) => d.state === "complete").length} of ${slice.length} domains complete · D01–D03 in scope`,
          state: stateOf("assessment"),
        },
        {
          id: "evidence",
          label: "Evidence",
          caption: `${submitted} submitted · core set 8–12 items`,
          state: stateOf("evidence"),
        },
        {
          id: "results",
          label: "Preliminary results",
          caption:
            status === "preliminary"
              ? "Preliminary ARUI Assessment available"
              : "Available after the preliminary score run",
          state: status === "preliminary" ? "current" : stateOf("results"),
        },
      ];
      const view: AssessmentStatusView = {
        assessmentId,
        institutionName: INSTITUTION.name,
        cycle: "2026",
        status,
        methodologyVersion: METHODOLOGY_VERSION,
        stages,
        domains,
        evidence: { submitted, drafts, coreTarget: { min: 8, max: 12 } },
        contributors: [
          {
            name: s.session?.user.name ?? "Institution Admin",
            role: "institution_admin",
            areas: ["All areas"],
          },
        ],
        confidentiality:
          "Institution-only. Responses and evidence are never shared or benchmarked without the institution's instruction.",
        updatedAt: now(),
      };
      return view;
    },

    async getProfileForm() {
      await wait(60);
      return clone(profileForm);
    },
    async getProfile() {
      await wait();
      const s = load();
      return {
        values: clone(s.profile),
        complete: profileComplete(s),
        updatedAt: s.profileUpdatedAt,
      };
    },
    async saveProfile(_id, values) {
      await wait(200);
      const s = load();
      s.profile = { ...s.profile, ...values };
      s.profileUpdatedAt = now();
      persist();
      return {
        values: clone(s.profile),
        complete: profileComplete(s),
        updatedAt: s.profileUpdatedAt,
      };
    },

    async getScreening() {
      await wait();
      const s = load();
      const responses = screeningPrompts
        .map((p) => s.responses[p.id])
        .filter((r): r is PromptResponse => Boolean(r));
      return {
        title: "Institutional Pulse",
        intro:
          "A short set of high-level signals across the institution. They shape where the assessment looks more closely; they are not scored on their own.",
        prompts: clone(screeningPrompts),
        responses: clone(responses),
        // Illustrative backend observation — returned only once the mock has enough signals to show one.
        earlySignal:
          responses.length >= 3
            ? {
                title:
                  "Your strategic direction appears clearer than your current institutional response mechanisms.",
                body: "Based on the first signals only. This will be revisited as the assessment progresses and evidence is added.",
              }
            : null,
        complete: responses.length === screeningPrompts.length,
      };
    },

    async getNextPrompt(_id, domainCode, afterPromptId) {
      await wait();
      const s = load();
      if (!isSlice(domainCode))
        return {
          prompt: null,
          position: null,
          existingResponse: null,
          domainComplete: false,
          history: [],
        };
      const list = orderedPrompts(s, domainCode);
      let prompt: Prompt | null;
      if (afterPromptId) {
        const i = list.findIndex((p) => p.id === afterPromptId);
        prompt = list[i + 1] ?? null;
      } else {
        prompt = list.find((p) => !s.responses[p.id]) ?? null;
      }
      return clone(nextResponse(s, domainCode, prompt));
    },
    async getPromptById(_id, domainCode, promptId) {
      await wait();
      const s = load();
      if (!isSlice(domainCode))
        return {
          prompt: null,
          position: null,
          existingResponse: null,
          domainComplete: false,
          history: [],
        };
      const prompt = orderedPrompts(s, domainCode).find((p) => p.id === promptId) ?? null;
      return clone(nextResponse(s, domainCode, prompt));
    },
    async saveResponse(_id, input: SaveResponseInput) {
      await wait(180);
      const s = load();
      const r: PromptResponse = {
        promptId: input.promptId,
        state: input.state,
        value: input.value ?? null,
        ...(input.note ? { note: input.note } : {}),
        ...(input.notApplicableRationale
          ? { notApplicableRationale: input.notApplicableRationale }
          : {}),
        updatedAt: now(),
      };
      s.responses[input.promptId] = r;
      const domain = input.promptId.startsWith("d0")
        ? (input.promptId.slice(0, 3).toUpperCase() as DomainCode)
        : null;
      logEntry(s, {
        stage: domain ? "3 Branch" : "2 Screening",
        domainCode: domain,
        metricOrRule: input.promptId,
        status: input.state.toUpperCase(),
        evidenceRef: null,
        actor: s.session?.user.name ?? "Respondent",
        decision: "Response recorded",
      });
      persist();
      return clone(r);
    },

    async getEvidence() {
      await wait();
      const s = load();
      const requests = evidenceRequests.map((r) => ({
        ...r,
        fulfilledByIds: s.evidence
          .filter((e) => e.fulfilsRequestIds.includes(r.id))
          .map((e) => e.id),
      }));
      return {
        items: clone(s.evidence).sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
        requests,
        coreTarget: { min: 8, max: 12 },
        evidenceTypes: clone(evidenceTypes),
        scopes: clone(evidenceScopes),
        guidance: [
          "Evidence strengthens confidence in your position.",
          "Missing evidence does not automatically reduce capability. Where the methodology requires evidence for a particular claim, that claim may remain unvalidated until sufficient evidence is available.",
          "One item can support several areas. You will not be asked for the same document twice.",
        ],
      };
    },
    async createEvidence(_id, input) {
      await wait(250);
      const s = load();
      const item: EvidenceItem = {
        id: `ev-${++s.seq}`,
        ...input,
        confirmedSupports: [],
        status: "draft",
        addedAt: now(),
      };
      s.evidence.unshift(item);
      persist();
      return clone(item);
    },
    async submitEvidence(_id, evidenceId) {
      await wait(200);
      const s = load();
      const item = s.evidence.find((e) => e.id === evidenceId);
      if (!item) throw new Error("Evidence not found");
      item.status = "submitted";
      logEntry(s, {
        stage: "4 Evidence",
        domainCode: null,
        metricOrRule: item.fulfilsRequestIds[0] ?? null,
        status: "RECEIVED",
        evidenceRef: item.id,
        actor: s.session?.user.name ?? "Respondent",
        decision: "Evidence submitted",
      });
      persist();
      return clone(item);
    },

    async getPreliminaryResults() {
      await wait();
      const s = load();
      return s.scoreRuns.some((r) => r.status === "complete") ? clone(preliminaryFixture) : null;
    },

    /* ---------------- assessor ---------------- */

    async getAssessorQueue() {
      await wait();
      const s = load();
      const openFlags = Object.values(s.metricScoring).reduce((n, m) => n + m.flags.length, 0);
      return [
        {
          assessmentId: ASSESSMENT_ID,
          institutionName: INSTITUTION.name,
          status: lifecycleStatus(s),
          cycle: "2026",
          submittedAt: "2026-03-03T14:10:00Z",
          domainsInScope: [...inScopeDomains],
          openFlags,
          assignedTo: "Assessor A",
        },
        {
          assessmentId: "asm-demo-2026-b",
          institutionName: "Riverside Institute of Technology (fixture)",
          status: "assessment",
          cycle: "2026",
          submittedAt: null,
          domainsInScope: [...inScopeDomains],
          openFlags: 0,
          assignedTo: null,
        },
      ];
    },
    async getAssessorAssessment(assessmentId) {
      await wait();
      const s = load();
      const responses = Object.values(s.responses);
      const scored = Object.values(s.metricScoring);
      const label = (fieldId: string) => {
        const f = profileForm.steps.flatMap((st) => st.fields).find((x) => x.id === fieldId);
        const v = s.profile[fieldId];
        if (!f) return String(v ?? "—");
        if (v === null || v === undefined || v === "") return "Not provided";
        if (Array.isArray(v))
          return v.map((x) => f.options?.find((o) => o.value === x)?.label ?? x).join(", ");
        if (typeof v === "number") return `${v} / 5`;
        return f.options?.find((o) => o.value === v)?.label ?? String(v);
      };
      return {
        assessmentId,
        institutionName: INSTITUTION.name,
        cycle: "2026",
        status: lifecycleStatus(s),
        methodologyVersion: METHODOLOGY_VERSION,
        profileSummary: profileForm.steps
          .flatMap((st) => st.fields)
          .map((f) => ({ label: f.label, value: label(f.id) })),
        applicability: domainCodes.map((code) => ({
          domainCode: code,
          domainName: domainNames[code],
          applicable: isSlice(code) ? true : null,
          rationale: isSlice(code)
            ? "In scope for this cycle."
            : "Not in the current assessment scope.",
          accepted: isSlice(code),
        })),
        counts: {
          responses: responses.length,
          notSure: responses.filter((r) => r.state === "not_sure").length,
          naRequested: responses.filter((r) => r.state === "not_applicable_requested").length,
          evidence: s.evidence.length,
          metricsScored: scored.filter(
            (m) => m.status === "scored" || m.status === "not_applicable",
          ).length,
          metricsTotal: scored.length,
          openFlags: scored.reduce((n, m) => n + m.flags.length, 0),
        },
      };
    },
    async getResponseReview() {
      await wait();
      const s = load();
      const all: Prompt[] = [
        ...screeningPrompts,
        ...inScopeDomains.flatMap((c) => (isSlice(c) ? orderedPrompts(s, c) : [])),
      ];
      return all.map((p) => ({
        promptId: p.id,
        domainCode: p.domainCode,
        theme: p.theme,
        prompt: p.prompt,
        origin: p.origin,
        response: clone(s.responses[p.id] ?? null),
        informsMetricIds: promptMetricLinks[p.id] ?? [],
        reviewNote: "",
        reviewState: "unreviewed" as const,
      }));
    },
    async getEvidenceReview() {
      await wait();
      const s = load();
      const finding: Record<
        string,
        {
          finding: string;
          level: MetricScoring["evidenceLevel"];
          auth: "pending" | "passed" | "failed";
          metrics: string[];
        }
      > = {
        "ev-1": {
          finding: "Approved institutional artifact; names AI within the digital pillar.",
          level: "E1",
          auth: "passed",
          metrics: ["D01-I01", "D01-I02"],
        },
        "ev-2": {
          finding: "Published guidance; implementation evidence not yet supplied.",
          level: "E1",
          auth: "passed",
          metrics: ["D02-I05"],
        },
        "ev-3": {
          finding: "Terms of reference received; authenticity check pending.",
          level: null,
          auth: "pending",
          metrics: ["D02-I01"],
        },
      };
      return s.evidence.map((e) => {
        const f = finding[e.id];
        return {
          evidence: clone(e),
          assessorFinding: f?.finding ?? "",
          evidenceLevel: f?.level ?? null,
          authenticityCheck: f?.auth ?? "pending",
          linkedMetricIds: f?.metrics ?? [],
        };
      });
    },
    async getMetricScoring() {
      await wait();
      return clone(Object.values(load().metricScoring));
    },
    async saveMetricScoring(_id, metricId, input) {
      await wait(200);
      const s = load();
      const m = s.metricScoring[metricId];
      if (!m) throw new Error("Unknown metric");
      Object.assign(m, input);
      if (input.applicable === false) m.status = "not_applicable";
      else if (m.status === "not_applicable" && input.applicable === true) m.status = "draft";
      // Engine outputs are invalidated until the next score run; the mock never recomputes them.
      m.engine = null;
      logEntry(s, {
        stage: "Assessor",
        domainCode: m.domainCode,
        metricOrRule: m.metricId,
        status: m.status.toUpperCase(),
        evidenceRef: m.linkedEvidenceIds[0] ?? null,
        actor: s.session?.user.name ?? "Assessor",
        decision: m.applicable
          ? `M${m.maturity ?? "–"} / I${m.implementation ?? "–"} / O${m.outcomeNotApplicable ? " n.a." : (m.outcome ?? "–")}`
          : "N/A recorded — awaiting acceptance",
      });
      persist();
      return clone(m);
    },
    async getContextCalibration() {
      await wait();
      return clone(contextFixture);
    },
    async getScoreRuns() {
      await wait();
      return clone(load().scoreRuns).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async requestScoreRun(_id, kind) {
      await wait(300);
      const s = load();
      const run: ScoreRun = {
        id: `run-${++s.seq}`,
        createdAt: now(),
        status: "queued",
        kind,
        methodologyVersion: METHODOLOGY_VERSION,
        scope: [...inScopeDomains],
        triggeredBy: s.session?.user.name ?? "Assessor",
        summary: "Queued. In production the engine executes this run; the mock leaves it queued.",
      };
      s.scoreRuns.push(run);
      logEntry(s, {
        stage: "Score run",
        domainCode: null,
        metricOrRule: run.id,
        status: "QUEUED",
        evidenceRef: null,
        actor: run.triggeredBy,
        decision: `${kind} run requested`,
      });
      persist();
      return clone(run);
    },
    async getExecutionLog() {
      await wait();
      return clone(load().log).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    },
  };
}

export const mockAssessmentId = ASSESSMENT_ID;
