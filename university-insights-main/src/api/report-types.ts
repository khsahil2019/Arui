/**
 * ARUI ASSESSMENT REPORT — DATA CONTRACT (proposal for the production backend)
 *
 * This file defines what the report generator (frontend print view or a
 * server-side PDF renderer) will RECEIVE from the Node.js backend in order to
 * produce the comprehensive ARUI Assessment Report. It is a contract only:
 * nothing in the frontend computes any of these values, and no route imports
 * this file yet. The sample payload that exercises every field is
 * `docs/samples/report-payload.sample.json`; the design reference PDF is
 * `docs/samples/ARUI_Sample_Assessment_Report.pdf`.
 *
 * Rules carried over from the methodology workbooks (P0-2 → P0-8):
 *  - Capability scores, evidence confidence, context calibration and
 *    cross-domain diagnostics are SEPARATE. None of them modifies another.
 *  - Transformation distance = required maturity − current maturity. Diagnostic.
 *  - Cross-domain findings never adjust a score (score adjustment = 0 always).
 *  - Missing evidence is never N/A; unknown is never zero; N/A needs a reason
 *    and assessor acceptance.
 *  - Anything marked `METHODOLOGY DECISION REQUIRED` below is undefined in
 *    the workbooks and must not be silently resolved by either side.
 */

import type { AssessmentStatus, Confidence, DomainCode, EvidenceLevel, MaturityLevel } from "./types";

/* ------------------------------------------------------------------ */
/* Envelope                                                            */
/* ------------------------------------------------------------------ */

export interface AssessmentReportPayload {
  report: ReportMeta;
  institution: ReportInstitution;
  assessment: ReportAssessment;
  scope: ReportScope;
  executiveSummary: ReportExecutiveSummary;
  overall: ReportOverallPosition;
  domains: ReportDomainSection[];
  crossDomain: ReportCrossDomain;
  validation: ReportValidation;
  evidence: ReportEvidence;
  assessorObservations: ReportObservation[];
  priorities: ReportPriorities;
  methodologyNote: ReportMethodologyNote;
  limitations: string[];
  reassessment: ReportReassessment;
}

export interface ReportMeta {
  /** Stable report identifier, printed on every page footer. */
  id: string;
  /** "preliminary" until a verification score run is complete and accepted. */
  kind: "preliminary" | "verified";
  /** ISO timestamp of generation. */
  generatedAt: string;
  /** Immutable methodology version the score run used, e.g. "ARUI v4 P0-8 (pre-pilot)". */
  methodologyVersion: string;
  /** Score run this report renders. One report = one score run. */
  scoreRunId: string;
  /** Template/layout version of the report itself. */
  templateVersion: string;
  /** Label printed in the header band on every page, e.g. "Preliminary — D01–D03 assessed". */
  statusBanner: string;
  /** Confidentiality line printed on cover and footer. */
  confidentiality: string;
  /** Audience the report is addressed to (institutional leadership). */
  audience: string;
}

/* ------------------------------------------------------------------ */
/* Institution identity and profile                                    */
/* ------------------------------------------------------------------ */

export interface ReportInstitution {
  id: string;
  name: string;
  /** Rendered as the identity block on the cover and report-information page. */
  identity: {
    institutionType: string | null;
    governanceType: string | null;
    state: string | null;
    district: string | null;
    location: string | null;
    yearEstablished: number | null;
  };
  /**
   * Snapshot of the 25 Institution_Profile fields (IP01–IP25) as captured at
   * the time of the score run. Values are labels, never internal codes or
   * calibration factors. Grouped for the "Institutional context" section.
   */
  profile: ReportProfileGroup[];
  /** Backend-derived. `complete` is required before scoring (P0-8 gate G1). */
  profileCompleteness: "complete" | "incomplete";
}

export interface ReportProfileGroup {
  group: string;
  fields: { id: string; label: string; value: string | null; note?: string }[];
}

/* ------------------------------------------------------------------ */
/* Assessment, scope and coverage                                      */
/* ------------------------------------------------------------------ */

export interface ReportAssessment {
  id: string;
  status: AssessmentStatus;
  /** Assessment window (ISO dates). */
  periodStart: string;
  periodEnd: string;
  submittedAt: string | null;
  contributors: { role: string; name: string | null }[];
  assessors: { name: string; role: "lead" | "second" | "adjudicator" }[];
}

export interface ReportScope {
  assessedDomains: DomainCode[];
  totalDomains: 11;
  /** Σ weights of scored domains (P0-3_Overall_Index "Weighted domain coverage"). */
  weightedDomainCoverage: number | null;
  domains: { code: DomainCode; name: string; inScope: boolean; metricCount: number | null }[];
  /** Human sentence, e.g. "Assessment coverage: 3 of 11 domains". */
  coverageStatement: string;
}

/* ------------------------------------------------------------------ */
/* Executive summary                                                   */
/* ------------------------------------------------------------------ */

export interface ReportExecutiveSummary {
  headline: string;
  narrative: string;
  keyStrengths: ReportFinding[];
  priorityGaps: ReportFinding[];
  /** Narrative text is assessor-authored; the engine supplies figures only. */
  authoredBy: "assessor";
}

export interface ReportFinding {
  title: string;
  body: string;
  domainCodes: DomainCode[];
  /** Evidence status of the finding, not a score. */
  evidenceStatus: "evidenced" | "partially_evidenced" | "unvalidated";
}

/* ------------------------------------------------------------------ */
/* Overall position                                                    */
/* ------------------------------------------------------------------ */

export interface ReportOverallPosition {
  /**
   * Overall ARUI /100 = Σ(domain score × weight). With partial domain
   * coverage the workbook does not renormalise; whether and how to present an
   * overall figure at partial coverage is METHODOLOGY DECISION REQUIRED (MD-08).
   * Send null and a `withheldReason` until decided.
   */
  arui100: number | null;
  withheldReason: string | null;
  weightedDomainCoverage: number | null;
  /** Mean of per-metric evidence-confidence values (E0 .20 … E4 1.00), 0–1. */
  averageEvidenceConfidence: number | null;
  /** LOW/MODERATE/HIGH band — formula is METHODOLOGY DECISION REQUIRED (MD-06). Null until defined. */
  confidenceBand: Confidence | null;
  /** Share of scored metrics whose gating evidence requirement is met, 0–1. */
  evidenceCoverage: number | null;
  /** Per-domain summary rows rendered as the position chart. */
  domainPositions: {
    code: DomainCode;
    name: string;
    currentMaturity: MaturityLevel | null;
    requiredMaturity: MaturityLevel | null;
    transformationDistance: number | null;
    domainScore: number | null;
    status: DomainScoreStatus;
  }[];
  narrative: string;
}

/** P0-3 scorecard status thresholds: ≥80 STRONG, ≥60 DEVELOPING, else PRIORITY, blank NOT SCORED. */
export type DomainScoreStatus = "STRONG" | "DEVELOPING" | "PRIORITY" | "NOT SCORED";

/* ------------------------------------------------------------------ */
/* Domain sections                                                     */
/* ------------------------------------------------------------------ */

export interface ReportDomainSection {
  code: DomainCode;
  name: string;
  /** Average of applicable metric scores (0–100), blank excluded. */
  domainScore: number | null;
  status: DomainScoreStatus;
  currentMaturity: MaturityLevel | null;
  requiredMaturity: MaturityLevel | null;
  requiredMaturitySource: "engine" | "assessor_override" | "fallback_default";
  transformationDistance: number | null;
  confidence: {
    averageEvidenceConfidence: number | null;
    band: Confidence | null;
    evidenceCoverage: number | null;
    levelDistribution: Record<EvidenceLevel, number>;
  };
  metricSummary: {
    total: number;
    applicable: number;
    scored: number;
    notApplicable: number;
    incomplete: number;
    reviewFlags: number;
  };
  /**
   * Named derived outputs for the domain (workbook sheet Derived_Outputs),
   * e.g. "Strategic AI Integration", "Governance Ownership". Leadership-facing
   * labels; metric IDs are not printed in the institution copy.
   */
  capabilities: { label: string; score: number | null; status: DomainScoreStatus; evidenceLevel: EvidenceLevel | null }[];
  strengths: ReportFinding[];
  gaps: ReportFinding[];
  /** Claims the methodology gates on evidence that remain unvalidated. */
  unvalidatedClaims: { claim: string; evidenceRequired: string }[];
  /** Institutional Data items for the domain (Institutional_Data sheet), as collected. */
  institutionalData: { id: string; item: string; value: number | null; state: "provided" | "not_provided" | "not_applicable_accepted" | "not_sure" }[];
  assessorObservation: string | null;
}

/* ------------------------------------------------------------------ */
/* Cross-domain diagnostics (never score-modifying)                    */
/* ------------------------------------------------------------------ */

export interface ReportCrossDomain {
  /** Rules computable within the assessed scope (D01–D03 slice: CD01, CD02 only). */
  computableRules: string[];
  incompleteRuleCount: number;
  dependencies: ReportCrossDomainFinding[];
  contradictions: ReportCrossDomainFinding[];
  /** P0-5 diagnostic summary rows applicable to the scope. */
  coherence: { diagnostic: string; state: "coherent" | "attention" | "incomplete"; note: string }[];
  scoreEffect: "NO DIRECT SCORE EFFECT";
}

export interface ReportCrossDomainFinding {
  ruleId: string;
  severity: "HIGH" | "MEDIUM";
  kind: "contradiction" | "dependency_gap" | "required_maturity_gap";
  upstream: { domainCode: DomainCode; label: string };
  downstream: { domainCode: DomainCode; label: string };
  interpretation: string;
  recommendedVerification: string;
}

/* ------------------------------------------------------------------ */
/* Validation, evidence and verification                               */
/* ------------------------------------------------------------------ */

export interface ReportValidation {
  /** P0-3 validation flags aggregated per domain. */
  flags: { domainCode: DomainCode; flag: "OK" | "REVIEW" | "CORROBORATION REVIEW" | "INCOMPLETE" | "N/A"; count: number; note: string }[];
  notApplicableDecisions: { domainCode: DomainCode; item: string; reason: string; decision: "accepted" | "rejected" | "pending" }[];
  overrides: { domainCode: DomainCode; item: string; reason: string; assessor: string; date: string; secondReview: "pending" | "complete" }[];
  /** Assessor calibration outcome where double scoring was applied (P0-7). */
  calibration: { doubleScoredMetrics: number; agreed: number; adjudicated: number };
  verificationStatus: "not_started" | "in_progress" | "complete";
}

export interface ReportEvidence {
  coreTarget: { min: number; max: number };
  counts: { submitted: number; underReview: number; accepted: number; returned: number };
  levelDistribution: Record<EvidenceLevel, number>;
  items: {
    title: string;
    type: string;
    period: string | null;
    status: "submitted" | "under_review" | "accepted" | "returned";
    level: EvidenceLevel | null;
    domainCodes: DomainCode[];
    /** P0-6 temporal validity window state. */
    temporalValidity: "within_window" | "outside_window" | "not_assessed";
  }[];
  unvalidatedClaimCount: number;
  stance: string;
}

export interface ReportObservation {
  domainCode: DomainCode | null;
  text: string;
  author: string;
  date: string;
}

/* ------------------------------------------------------------------ */
/* Priorities and recommended actions (assessor-authored)              */
/* ------------------------------------------------------------------ */

export interface ReportPriorities {
  areas: { rank: number; area: string; domainCode: DomainCode; reason: string }[];
  actions: ReportAction[];
  authoredBy: "assessor";
  note: string;
}

export interface ReportAction {
  horizon: "90_days" | "12_months" | "longer_term";
  title: string;
  detail: string;
  domainCodes: DomainCode[];
  linkedGap: string | null;
  suggestedOwner: string | null;
}

/* ------------------------------------------------------------------ */
/* Methodology note, limitations and reassessment                      */
/* ------------------------------------------------------------------ */

export interface ReportMethodologyNote {
  version: string;
  paragraphs: string[];
  /** Plain-language description of the scoring architecture; no formulas for the institution copy. */
  scoringSummary: string[];
  maturityScale: { level: MaturityLevel; label: string; meaning: string }[];
}

export interface ReportReassessment {
  recommendedWindow: string;
  triggers: string[];
  nextSteps: string[];
  /** Full-scope information for institutions assessed on the D01–D03 slice. */
  remainingDomains: { code: DomainCode; name: string }[];
}
