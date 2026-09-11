/**
 * TanStack Query bindings over the ArUiApi boundary.
 * Components use these; they never call the api object directly.
 */

import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApi, type SaveResponseInput } from "./client";
import type { CreateEvidenceInput, DomainCode, MetricScoringInput, ProfileValues, ScoreRun } from "./types";

export const queries = {
  session: () => queryOptions({ queryKey: ["session"], queryFn: () => getApi().getSession(), staleTime: 60_000 }),
  status: (id: string) => queryOptions({ queryKey: ["assessment", id, "status"], queryFn: () => getApi().getStatus(id) }),
  profileForm: () => queryOptions({ queryKey: ["methodology", "profile-form"], queryFn: () => getApi().getProfileForm(), staleTime: Infinity }),
  profile: (id: string) => queryOptions({ queryKey: ["assessment", id, "profile"], queryFn: () => getApi().getProfile(id) }),
  screening: (id: string) => queryOptions({ queryKey: ["assessment", id, "screening"], queryFn: () => getApi().getScreening(id) }),
  nextPrompt: (id: string, domain: DomainCode, after: string | null) =>
    queryOptions({ queryKey: ["assessment", id, "domain", domain, "next", after ?? "first"], queryFn: () => getApi().getNextPrompt(id, domain, after) }),
  promptById: (id: string, domain: DomainCode, promptId: string) =>
    queryOptions({ queryKey: ["assessment", id, "domain", domain, "prompt", promptId], queryFn: () => getApi().getPromptById(id, domain, promptId) }),
  evidence: (id: string) => queryOptions({ queryKey: ["assessment", id, "evidence"], queryFn: () => getApi().getEvidence(id) }),
  results: (id: string) => queryOptions({ queryKey: ["assessment", id, "results"], queryFn: () => getApi().getPreliminaryResults(id) }),

  assessorQueue: () => queryOptions({ queryKey: ["assessor", "queue"], queryFn: () => getApi().getAssessorQueue() }),
  assessorAssessment: (id: string) => queryOptions({ queryKey: ["assessor", id, "overview"], queryFn: () => getApi().getAssessorAssessment(id) }),
  responseReview: (id: string) => queryOptions({ queryKey: ["assessor", id, "responses"], queryFn: () => getApi().getResponseReview(id) }),
  evidenceReview: (id: string) => queryOptions({ queryKey: ["assessor", id, "evidence"], queryFn: () => getApi().getEvidenceReview(id) }),
  metricScoring: (id: string) => queryOptions({ queryKey: ["assessor", id, "metrics"], queryFn: () => getApi().getMetricScoring(id) }),
  context: (id: string) => queryOptions({ queryKey: ["assessor", id, "context"], queryFn: () => getApi().getContextCalibration(id) }),
  scoreRuns: (id: string) => queryOptions({ queryKey: ["assessor", id, "runs"], queryFn: () => getApi().getScoreRuns(id) }),
  executionLog: (id: string) => queryOptions({ queryKey: ["assessor", id, "log"], queryFn: () => getApi().getExecutionLog(id) }),
};

export function useSession() {
  return useQuery(queries.session());
}

function useInvalidate() {
  const qc = useQueryClient();
  return (...keys: unknown[][]) => Promise.all(keys.map((queryKey) => qc.invalidateQueries({ queryKey })));
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<ReturnType<typeof getApi>["login"]>[0]) => getApi().login(input),
    onSuccess: (session) => qc.setQueryData(queries.session().queryKey, session),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => getApi().logout(),
    onSuccess: async () => {
      await qc.cancelQueries();
      qc.clear();
    },
  });
}

export function useSaveProfile(assessmentId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (values: ProfileValues) => getApi().saveProfile(assessmentId, values),
    onSuccess: () => invalidate(["assessment", assessmentId, "profile"], ["assessment", assessmentId, "status"]),
  });
}

export function useSaveResponse(assessmentId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: SaveResponseInput) => getApi().saveResponse(assessmentId, input),
    onSuccess: () => invalidate(["assessment", assessmentId]),
  });
}

export function useCreateEvidence(assessmentId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateEvidenceInput) => getApi().createEvidence(assessmentId, input),
    onSuccess: () => invalidate(["assessment", assessmentId, "evidence"], ["assessment", assessmentId, "status"]),
  });
}

export function useSubmitEvidence(assessmentId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (evidenceId: string) => getApi().submitEvidence(assessmentId, evidenceId),
    onSuccess: () => invalidate(["assessment", assessmentId, "evidence"], ["assessment", assessmentId, "status"]),
  });
}

export function useSaveMetricScoring(assessmentId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ metricId, input }: { metricId: string; input: MetricScoringInput }) => getApi().saveMetricScoring(assessmentId, metricId, input),
    onSuccess: () => invalidate(["assessor", assessmentId]),
  });
}

export function useRequestScoreRun(assessmentId: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (kind: ScoreRun["kind"]) => getApi().requestScoreRun(assessmentId, kind),
    onSuccess: () => invalidate(["assessor", assessmentId]),
  });
}
