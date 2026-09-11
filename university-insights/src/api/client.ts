/**
 * ARUI API CLIENT BOUNDARY
 *
 * `ArUiApi` is the only surface the UI talks to. Two implementations exist:
 *  - mock  (src/api/mock)  — in-browser, local data, default in this repo
 *  - http  (src/api/http)  — thin fetch client for the production Node.js API
 *
 * Select with VITE_ARUI_API_BASE_URL. When unset, the mock is used.
 */

import { createHttpApi } from "./http";
import { createMockApi } from "./mock";
import type {
  AssessmentStatusView,
  AssessorAssessmentView,
  AssessorQueueItem,
  ContextCalibration,
  CreateEvidenceInput,
  DomainCode,
  EvidenceItem,
  EvidenceReviewItem,
  EvidenceView,
  ExecutionLogEntry,
  InstitutionProfile,
  LoginRequest,
  MetricScoring,
  MetricScoringInput,
  NextPromptResponse,
  PreliminaryResults,
  ProfileFormDefinition,
  ProfileValues,
  PromptResponse,
  ResponseReviewItem,
  ResponseState,
  ScoreRun,
  ScreeningView,
  Session,
} from "./types";

export interface SaveResponseInput {
  promptId: string;
  state: ResponseState;
  value?: unknown;
  note?: string;
  notApplicableRationale?: string;
}

export interface ArUiApi {
  /* session */
  login(input: LoginRequest): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;

  /* respondent */
  getStatus(assessmentId: string): Promise<AssessmentStatusView>;
  getProfileForm(): Promise<ProfileFormDefinition>;
  getProfile(assessmentId: string): Promise<InstitutionProfile>;
  saveProfile(assessmentId: string, values: ProfileValues): Promise<InstitutionProfile>;
  getScreening(assessmentId: string): Promise<ScreeningView>;
  getNextPrompt(assessmentId: string, domainCode: DomainCode, afterPromptId?: string | null): Promise<NextPromptResponse>;
  getPromptById(assessmentId: string, domainCode: DomainCode, promptId: string): Promise<NextPromptResponse>;
  saveResponse(assessmentId: string, input: SaveResponseInput): Promise<PromptResponse>;
  getEvidence(assessmentId: string): Promise<EvidenceView>;
  createEvidence(assessmentId: string, input: CreateEvidenceInput): Promise<EvidenceItem>;
  submitEvidence(assessmentId: string, evidenceId: string): Promise<EvidenceItem>;
  getPreliminaryResults(assessmentId: string): Promise<PreliminaryResults | null>;

  /* assessor / admin */
  getAssessorQueue(): Promise<AssessorQueueItem[]>;
  getAssessorAssessment(assessmentId: string): Promise<AssessorAssessmentView>;
  getResponseReview(assessmentId: string): Promise<ResponseReviewItem[]>;
  getEvidenceReview(assessmentId: string): Promise<EvidenceReviewItem[]>;
  getMetricScoring(assessmentId: string): Promise<MetricScoring[]>;
  saveMetricScoring(assessmentId: string, metricId: string, input: MetricScoringInput): Promise<MetricScoring>;
  getContextCalibration(assessmentId: string): Promise<ContextCalibration[]>;
  getScoreRuns(assessmentId: string): Promise<ScoreRun[]>;
  requestScoreRun(assessmentId: string, kind: ScoreRun["kind"]): Promise<ScoreRun>;
  getExecutionLog(assessmentId: string): Promise<ExecutionLogEntry[]>;
}

const configuredBaseUrl = (import.meta.env["VITE_ARUI_API_BASE_URL"] as string | undefined) || null;

export const apiMode: "mock" | "http" = configuredBaseUrl ? "http" : "mock";

let instance: ArUiApi | undefined;

export function getApi(): ArUiApi {
  const api = instance ?? (configuredBaseUrl ? createHttpApi(configuredBaseUrl) : createMockApi());
  instance = api;
  return api;
}
