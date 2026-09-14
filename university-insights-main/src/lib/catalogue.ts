/**
 * STATIC CATALOGUE — presentation constants shared by the UI.
 *
 * Only names and labels live here. No scoring, routing, thresholds or
 * methodology rules exist in the frontend; those belong to the backend engine
 * (see src/api/README.md).
 */

/** Canonical domain names. Do not abbreviate or rename. */
export const domainNames = {
  D01: "Institutional Strategy, Foresight & AI Direction",
  D02: "Governance, Responsible AI & Institutional Risk",
  D03: "Human Capability, Cognitive Readiness & AI-Ready Education",
  D04: "Curriculum & Programme Future Resilience",
  D05: "Faculty Capability & Academic Workforce Transformation",
  D06: "Student Capability, Agency & Future Readiness",
  D07: "Learning, Assessment & Evidence of Capability",
  D08: "Digital, Data & Institutional Intelligence",
  D09: "Employability, Industry & Economic Relevance",
  D10: "Research, Innovation & Knowledge Creation",
  D11: "Institutional Adaptability & AI Resilience",
} as const;

export type DomainCode = keyof typeof domainNames;
export const domainCodes = Object.keys(domainNames) as DomainCode[];

/** All 11 authoritative domains in the ARUI assessment scope. */
export const inScopeDomains: DomainCode[] = [
  "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11"
];

/** The eleven canonical assessment areas, in domain order. */
export const assessmentAreas = domainCodes.map((c) => domainNames[c]);

/**
 * Maturity levels as named in the methodology workbooks (0–5).
 * Whether respondents see these exact labels is a methodology presentation
 * decision; the workbook labels are used until instructed otherwise.
 */
export type MaturityLevel = 0 | 1 | 2 | 3 | 4 | 5;
export const maturityLabels: Record<MaturityLevel, string> = {
  0: "Absent",
  1: "Reactive",
  2: "Emerging",
  3: "Structured",
  4: "Integrated",
  5: "Adaptive",
};

export type Confidence = "low" | "moderate" | "high";

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
}

/** Lifecycle statuses of an institutional assessment. */
export const assessmentStatusLabels = {
  draft: "Draft",
  profile: "Profile",
  pulse: "Pulse",
  assessment: "Assessment",
  evidence: "Evidence",
  preliminary: "Preliminary",
  verified: "Verified",
  locked: "Locked",
} as const;
export type AssessmentStatus = keyof typeof assessmentStatusLabels;

export const roleLabels = {
  institution_admin: "Institution Admin",
  contributor: "Contributor",
  viewer: "Viewer",
  assessor: "Assessor",
} as const;
export type Role = keyof typeof roleLabels;
