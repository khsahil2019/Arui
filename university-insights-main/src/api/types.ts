/**
 * ARUI FRONTEND API CONTRACTS
 *
 * These types describe the data the frontend expects from the production
 * backend (Node.js / PostgreSQL, owned by the development team). The frontend
 * renders what it is given; it never computes maturity, scores, required
 * maturity, transformation distance, confidence, routing decisions or
 * cross-domain findings. Everything of that kind arrives from the backend
 * already decided.
 *
 * Respondent-facing payloads carry NO metric IDs, weights, formulas, anchors,
 * thresholds or rule names. Assessor payloads may carry metric identities.
 */

import type {
  AssessmentStatus,
  Confidence,
  ChoiceOption,
  DomainCode,
  MaturityLevel,
  Role,
} from "@/lib/catalogue";

export type { AssessmentStatus, Confidence, ChoiceOption, DomainCode, MaturityLevel, Role };

/* ------------------------------------------------------------------ */
/* Session / entry                                                     */
/* ------------------------------------------------------------------ */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Session {
  token: string;
  user: SessionUser;
  institution: { id: string; name: string } | null;
  /** Institutional assessment the user is currently working in (null for assessors). */
  assessmentId: string | null;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  /** Mock only — the production backend derives role from the account. */
  roleHint?: Role;
}

/* ------------------------------------------------------------------ */
/* Assessment status / progress                                        */
/* ------------------------------------------------------------------ */

export type StageId = "profile" | "orientation" | "pulse" | "assessment" | "evidence" | "results";
export type StageState = "complete" | "current" | "upcoming" | "locked";

export interface StageProgress {
  id: StageId;
  label: string;
  /** Human progress caption, e.g. "3 of 5 signals captured". */
  caption: string;
  state: StageState;
}

export type DomainProgressState = "not_started" | "in_progress" | "complete" | "not_in_scope";

export interface DomainProgress {
  code: DomainCode;
  name: string;
  inScope: boolean;
  state: DomainProgressState;
  /** Themes are respondent-facing groupings decided by the backend. */
  themesExplored: number;
  themesTotal: number;
  /** Whether the backend has activated targeted follow-up prompts in this domain. */
  targetedFollowUp: boolean;
}

export interface AssessmentStatusView {
  assessmentId: string;
  institutionName: string;
  cycle: string;
  status: AssessmentStatus;
  methodologyVersion: string;
  stages: StageProgress[];
  domains: DomainProgress[];
  evidence: { submitted: number; drafts: number; coreTarget: { min: number; max: number } };
  contributors: { name: string; role: Role; areas: string[] }[];
  confidentiality: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Institution profile                                                 */
/* ------------------------------------------------------------------ */

export type ProfileFieldType = "text" | "single" | "multi" | "scale5" | "band";

export interface ProfileFieldDefinition {
  id: string;
  label: string;
  type: ProfileFieldType;
  required: boolean;
  hint?: string;
  options?: ChoiceOption[];
  /** For scale5: captions at each end of the scale. */
  scaleEnds?: { low: string; high: string };
}

export interface ProfileStepDefinition {
  id: string;
  label: string;
  description: string;
  fields: ProfileFieldDefinition[];
}

export interface ProfileFormDefinition {
  steps: ProfileStepDefinition[];
}

export type ProfileValue = string | string[] | number | null;
export type ProfileValues = Record<string, ProfileValue>;

export interface InstitutionProfile {
  values: ProfileValues;
  complete: boolean;
  updatedAt: string | null;
}

/* ------------------------------------------------------------------ */
/* Prompts (screening + domain assessment)                             */
/* ------------------------------------------------------------------ */

export interface NumberFieldDef {
  id: string;
  label: string;
  hint?: string;
}

/**
 * Short free text. The only text control available inside structured inputs.
 * `maxLength` is mandatory: there is no unbounded text in the respondent
 * experience. Use for institution-specific names and one-line nuance.
 */
export interface ShortTextDef {
  label: string;
  placeholder?: string;
  maxLength: number;
  hint?: string;
}

interface FieldBase {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
}

/**
 * Field types available inside forms, records, process steps and ranked-list
 * items. "Structured input first": select / multi_select / yes_no_unsure /
 * number / period are preferred; short_text is bounded; narrative exists only
 * where the methodology genuinely requires institutional reasoning and must
 * carry its justification.
 *
 * Value conventions (inside a Record<string, unknown>):
 *   select          string            ("__other__" + `${id}_other` string when allowOther)
 *   multi_select    string[]          ("__other__" + `${id}_other` string when allowOther)
 *   yes_no_unsure   "yes" | "no" | "unsure"
 *   short_text      string
 *   narrative       string
 *   number          number | null
 *   period          string (YYYY-MM)  or { from: string; to: string } when range
 */
export type FieldDef =
  | (FieldBase & { type: "select"; options: ChoiceOption[]; allowOther?: boolean })
  | (FieldBase & {
      type: "multi_select";
      options: ChoiceOption[];
      allowOther?: boolean;
      max?: number;
    })
  | (FieldBase & { type: "yes_no_unsure" })
  | (FieldBase & { type: "short_text"; placeholder?: string; maxLength: number })
  | (FieldBase & {
      type: "narrative";
      placeholder?: string;
      maxLength: number;
      justification: string;
    })
  | (FieldBase & { type: "number"; unit?: string })
  | (FieldBase & { type: "period"; range?: boolean });

export const OTHER_VALUE = "__other__";

export interface MatrixColumnDef {
  id: string;
  label: string;
  type: "check" | "select" | "multi_select" | "short_text" | "month";
  options?: ChoiceOption[];
  maxLength?: number;
}

export type MatrixRowSource =
  | { source: "fixed"; items: ChoiceOption[] }
  /** Respondent picks each row from a catalogue (with optional "Other" + short name). */
  | { source: "respondent_select"; rowLabel: string; options: ChoiceOption[]; allowOther?: boolean }
  /** Respondent names each row (bounded short text) — only where rows are inherently institution-specific. */
  | { source: "respondent"; rowLabel: string; placeholder?: string; maxLength: number }
  | { source: "prior_response"; promptId: string; rowLabel: string };

/**
 * Presentation framework. The backend chooses one of these per prompt; the
 * frontend renders it. Adding a new kind here is a contract change.
 *
 * `provisionalOptions` marks option catalogues that are NOT workbook-defined
 * and await confirmation by the methodology team (METHODOLOGY DECISION
 * REQUIRED #1). Changing an input control never changes what is measured.
 *
 * Value shapes:
 *   single_choice     string | { choice: string; other?: string; nuance?: string }
 *   multi_choice      { selected: string[]; other?: string; nuance?: string }
 *   ranked_list       { items: ({ value: string; other?: string } & Record<string, unknown>)[] }
 *   process_steps     Record<string, unknown>[]
 *   numbers           { values: Record<string, number | null>; precision?: string }
 *   structured_form   Record<string, unknown>
 *   records           { none: boolean; rows: Record<string, unknown>[] }
 *   matrix            { rows: { id: string; label: string; other?: string; cells: Record<string, unknown> }[] }
 *   evidence_request  { acknowledged: boolean; note?: string }
 */
export type PromptPresentation =
  | {
      kind: "single_choice";
      options: ChoiceOption[];
      provisionalOptions?: boolean;
      allowOther?: boolean;
      nuance?: ShortTextDef;
    }
  | {
      kind: "multi_choice";
      options: ChoiceOption[];
      provisionalOptions?: boolean;
      allowOther?: boolean;
      max?: number;
      nuance?: ShortTextDef;
    }
  | {
      kind: "ranked_list";
      count: number;
      itemLabel: string;
      options: ChoiceOption[];
      allowOther?: boolean;
      provisionalOptions?: boolean;
      itemFields?: FieldDef[];
    }
  | {
      kind: "process_steps";
      stepLabel: string;
      stepFields: FieldDef[];
      min?: number;
      max?: number;
      provisionalOptions?: boolean;
    }
  | { kind: "numbers"; fields: NumberFieldDef[]; period?: string; precision?: boolean }
  | { kind: "structured_form"; fields: FieldDef[]; provisionalOptions?: boolean }
  | {
      kind: "records";
      recordLabel: string;
      fields: FieldDef[];
      min?: number;
      max?: number;
      noneOption?: string;
      provisionalOptions?: boolean;
    }
  | {
      kind: "matrix";
      rows: MatrixRowSource;
      columns: MatrixColumnDef[];
      provisionalOptions?: boolean;
    }
  | { kind: "evidence_request"; items: string[]; note?: string; noteField?: ShortTextDef };

export interface Prompt {
  /** Opaque identifier — never a metric ID. */
  id: string;
  domainCode: DomainCode | null;
  domainName: string;
  /** Respondent-facing grouping shown in progress ("Strategic direction"). */
  theme: string;
  prompt: string;
  help?: string;
  presentation: PromptPresentation;
  evidenceHints?: string[];
  origin: "screening" | "core" | "targeted";
  /** Present only when origin === "targeted"; written by the backend. */
  targetedReason?: string;
  allowNotSure: boolean;
  allowNotApplicable: boolean;
}

export interface PromptPosition {
  theme: string;
  themeIndex: number;
  themeTotal: number;
  withinTheme: { current: number; total: number };
  themes: { label: string; state: "complete" | "current" | "upcoming" }[];
}

export type ResponseState = "answered" | "not_sure" | "not_applicable_requested" | "not_answered";

export interface PromptResponse {
  promptId: string;
  state: ResponseState;
  value: unknown;
  note?: string;
  notApplicableRationale?: string;
  updatedAt: string;
}

export interface NextPromptResponse {
  prompt: Prompt | null;
  position: PromptPosition | null;
  existingResponse: PromptResponse | null;
  domainComplete: boolean;
  /** Ordered list the respondent may step back through. */
  history: { promptId: string; theme: string; state: ResponseState }[];
}

export interface ScreeningView {
  title: string;
  intro: string;
  prompts: Prompt[];
  responses: PromptResponse[];
  /** Backend-written early observation; null until the backend chooses to show one. */
  earlySignal: { title: string; body: string } | null;
  complete: boolean;
}

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

export type EvidenceKind = "document" | "url" | "note";
export type EvidenceSubmissionStatus =
  "draft" | "submitted" | "under_review" | "accepted" | "returned";

export interface EvidenceItem {
  id: string;
  title: string;
  kind: EvidenceKind;
  evidenceType: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  periodStart?: string;
  periodEnd?: string;
  description: string;
  scope: string;
  /** Respondent-proposed areas; confirmed mapping is backend-owned. */
  proposedSupports: string[];
  /** Backend-confirmed areas (domain names / themes). Empty until reviewed. */
  confirmedSupports: string[];
  /** Fulfils one or more backend evidence requests. */
  fulfilsRequestIds: string[];
  status: EvidenceSubmissionStatus;
  addedAt: string;
  demo?: boolean;
}

export interface EvidenceRequest {
  id: string;
  domainCode: DomainCode;
  domainName: string;
  label: string;
  quantity: string;
  requirement: string;
  fulfilledByIds: string[];
}

export interface EvidenceView {
  items: EvidenceItem[];
  requests: EvidenceRequest[];
  coreTarget: { min: number; max: number };
  evidenceTypes: ChoiceOption[];
  scopes: ChoiceOption[];
  guidance: string[];
}

export interface CreateEvidenceInput {
  title: string;
  kind: EvidenceKind;
  evidenceType: string;
  fileName?: string;
  fileSize?: number;
  url?: string;
  periodStart?: string;
  periodEnd?: string;
  description: string;
  scope: string;
  proposedSupports: string[];
  fulfilsRequestIds: string[];
}

/* ------------------------------------------------------------------ */
/* Preliminary results (respondent-facing)                              */
/* ------------------------------------------------------------------ */

export interface DomainResult {
  code: DomainCode;
  name: string;
  assessed: boolean;
  current?: MaturityLevel;
  required?: MaturityLevel;
  /** Diagnostic only, supplied by backend. */
  transformationDistance?: number;
  confidence?: Confidence;
  evidenceCoverage?: number;
  unvalidatedClaims?: number;
}

export interface Finding {
  title: string;
  body: string;
  between?: string[];
}

export interface PreliminaryResults {
  label: "Preliminary ARUI Assessment";
  scopeNote: string;
  coverage: { assessed: number; total: number; codes: string };
  scoreRunId: string;
  generatedAt: string;
  overall: {
    current: MaturityLevel;
    required: MaturityLevel;
    transformationDistance: number;
    confidence: Confidence;
    evidenceCoverage: number;
    narrative: string;
  };
  domains: DomainResult[];
  strengths: Finding[];
  vulnerabilities: Finding[];
  contradictions: Finding[];
  attention: { area: string; reason: string }[];
  caveats: string[];
}

/* ------------------------------------------------------------------ */
/* Assessor / admin                                                    */
/* ------------------------------------------------------------------ */

export interface AssessorQueueItem {
  assessmentId: string;
  institutionName: string;
  status: AssessmentStatus;
  cycle: string;
  submittedAt: string | null;
  domainsInScope: DomainCode[];
  openFlags: number;
  assignedTo: string | null;
}

export interface ResponseReviewItem {
  promptId: string;
  domainCode: DomainCode | null;
  theme: string;
  prompt: string;
  origin: Prompt["origin"];
  response: PromptResponse | null;
  /** Backend-supplied linkage for assessor context. */
  informsMetricIds: string[];
  reviewNote: string;
  reviewState: "unreviewed" | "reviewed" | "query_raised";
}

export type EvidenceLevel = "E0" | "E1" | "E2" | "E3" | "E4";

export interface EvidenceReviewItem {
  evidence: EvidenceItem;
  assessorFinding: string;
  evidenceLevel: EvidenceLevel | null;
  authenticityCheck: "pending" | "passed" | "failed";
  linkedMetricIds: string[];
}

export type MetricScoringStatus = "unscored" | "draft" | "scored" | "review" | "not_applicable";

export interface MetricFlag {
  code: string;
  label: string;
  severity: "info" | "review" | "high";
  source: "engine" | "assessor";
}

export interface MetricScoring {
  metricId: string;
  metricName: string;
  domainCode: DomainCode;
  capabilityArea: string;
  measurementMethod: string;
  status: MetricScoringStatus;
  applicable: boolean;
  notApplicableRationale: string;
  maturity: MaturityLevel | null;
  implementation: MaturityLevel | null;
  outcome: MaturityLevel | null;
  /** Distinct from a blank outcome. */
  outcomeNotApplicable: boolean;
  outcomeNotApplicableRationale: string;
  evidenceLevel: EvidenceLevel | null;
  rationale: string;
  linkedResponseIds: string[];
  linkedEvidenceIds: string[];
  flags: MetricFlag[];
  /** Engine outputs from the latest score run; null when no run has included this metric. */
  engine: { metricScore: number | null; validation: string; runId: string } | null;
}

export interface MetricScoringInput {
  applicable?: boolean;
  notApplicableRationale?: string;
  maturity?: MaturityLevel | null;
  implementation?: MaturityLevel | null;
  outcome?: MaturityLevel | null;
  outcomeNotApplicable?: boolean;
  outcomeNotApplicableRationale?: string;
  evidenceLevel?: EvidenceLevel | null;
  rationale?: string;
  status?: MetricScoringStatus;
}

export interface ContextCalibration {
  domainCode: DomainCode;
  domainName: string;
  requiredMaturity: MaturityLevel | null;
  currentMaturity: MaturityLevel | null;
  transformationDistance: number | null;
  source: "engine" | "assessor_override" | "pending";
  rationale: string;
  overrideRequested: boolean;
  secondReview: "not_required" | "pending" | "complete";
}

export interface ScoreRun {
  id: string;
  createdAt: string;
  status: "queued" | "running" | "complete" | "failed";
  kind: "preliminary" | "verification";
  methodologyVersion: string;
  scope: DomainCode[];
  triggeredBy: string;
  summary: string | null;
}

export interface ExecutionLogEntry {
  id: string;
  timestamp: string;
  stage: string;
  domainCode: DomainCode | null;
  metricOrRule: string | null;
  status: string;
  evidenceRef: string | null;
  actor: string;
  decision: string;
}

export interface AssessorAssessmentView {
  assessmentId: string;
  institutionName: string;
  cycle: string;
  status: AssessmentStatus;
  methodologyVersion: string;
  profileSummary: { label: string; value: string }[];
  applicability: {
    domainCode: DomainCode;
    domainName: string;
    applicable: boolean | null;
    rationale: string;
    accepted: boolean;
  }[];
  counts: {
    responses: number;
    notSure: number;
    naRequested: number;
    evidence: number;
    metricsScored: number;
    metricsTotal: number;
    openFlags: number;
  };
}
