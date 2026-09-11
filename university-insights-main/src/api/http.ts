/**
 * HTTP implementation of ArUiApi for the production Node.js backend.
 *
 * Endpoint paths are a proposal for the backend team; adjust here only —
 * nothing else in the frontend knows about URLs. The session token is sent as
 * a bearer token. All responses are expected as JSON matching src/api/types.ts.
 */

import type { ArUiApi } from "./client";
import type { Session } from "./types";

const SESSION_KEY = "arui.session";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Session) : null;
}

export function createHttpApi(baseUrl: string): ArUiApi {
  const root = baseUrl.replace(/\/$/, "");

  async function call<T>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown): Promise<T> {
    const session = readSession();
    const init: RequestInit = {
      method,
      headers: {
        "content-type": "application/json",
        ...(session ? { authorization: `Bearer ${session.token}` } : {}),
      },
    };
    if (body !== undefined) init.body = JSON.stringify(body);
    const res = await fetch(`${root}${path}`, init);
    if (res.status === 204) return undefined as T;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`ARUI API ${method} ${path} failed (${res.status}): ${text}`);
    }
    return (await res.json()) as T;
  }

  const a = (id: string) => `/assessments/${encodeURIComponent(id)}`;

  return {
    async login(input) {
      const session = await call<Session>("POST", "/auth/login", input);
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    },
    async logout() {
      await call<void>("POST", "/auth/logout").catch(() => undefined);
      window.localStorage.removeItem(SESSION_KEY);
    },
    async getSession() {
      return readSession();
    },

    getStatus: (id) => call("GET", `${a(id)}/status`),
    getProfileForm: () => call("GET", `/methodology/profile-form`),
    getProfile: (id) => call("GET", `${a(id)}/profile`),
    saveProfile: (id, values) => call("PUT", `${a(id)}/profile`, { values }),
    getScreening: (id) => call("GET", `${a(id)}/screening`),
    getNextPrompt: (id, domainCode, afterPromptId) => call("GET", `${a(id)}/domains/${domainCode}/next${afterPromptId ? `?after=${encodeURIComponent(afterPromptId)}` : ""}`),
    getPromptById: (id, domainCode, promptId) => call("GET", `${a(id)}/domains/${domainCode}/prompts/${encodeURIComponent(promptId)}`),
    saveResponse: (id, input) => call("PUT", `${a(id)}/responses/${encodeURIComponent(input.promptId)}`, input),
    getEvidence: (id) => call("GET", `${a(id)}/evidence`),
    createEvidence: (id, input) => call("POST", `${a(id)}/evidence`, input),
    submitEvidence: (id, evidenceId) => call("POST", `${a(id)}/evidence/${encodeURIComponent(evidenceId)}/submit`),
    getPreliminaryResults: (id) => call("GET", `${a(id)}/results/preliminary`),

    getAssessorQueue: () => call("GET", `/assessor/queue`),
    getAssessorAssessment: (id) => call("GET", `/assessor${a(id)}`),
    getResponseReview: (id) => call("GET", `/assessor${a(id)}/responses`),
    getEvidenceReview: (id) => call("GET", `/assessor${a(id)}/evidence`),
    getMetricScoring: (id) => call("GET", `/assessor${a(id)}/metrics`),
    saveMetricScoring: (id, metricId, input) => call("PATCH", `/assessor${a(id)}/metrics/${encodeURIComponent(metricId)}`, input),
    getContextCalibration: (id) => call("GET", `/assessor${a(id)}/context`),
    getScoreRuns: (id) => call("GET", `/assessor${a(id)}/score-runs`),
    requestScoreRun: (id, kind) => call("POST", `/assessor${a(id)}/score-runs`, { kind }),
    getExecutionLog: (id) => call("GET", `/assessor${a(id)}/execution-log`),
  };
}
