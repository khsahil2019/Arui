/**
 * HTTP implementation of ArUiApi for the production Node.js backend.
 *
 * Endpoint paths are a proposal for the backend team; adjust here only —
 * nothing else in the frontend knows about URLs. The session token is sent as
 * a bearer token. All responses are expected as JSON matching src/api/types.ts.
 */

import type { ArUiApi } from "./client";
import type { LoginRequest, Session } from "./types";

function getStorageKey(engine?: string): string {
  if (engine) return `${engine.toLowerCase()}.session`;
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/ecri")) {
      return "ecri.session";
    }
    if (window.location.pathname.startsWith("/arui")) {
      return "arui.session";
    }
  }
  return "arui.session";
}

function readSession(engine?: string): Session | null {
  if (typeof window === "undefined") return null;
  const key = getStorageKey(engine);
  const raw = window.localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw) as Session;
    } catch {
      // Continue to fallback
    }
  }
  // Check engine-specific or fallback session keys
  const fallbackKeys = engine ? [getStorageKey(engine)] : ["arui.session", "ecri.session"];
  for (const fk of fallbackKeys) {
    const fRaw = window.localStorage.getItem(fk);
    if (fRaw) {
      try {
        const s = JSON.parse(fRaw) as Session;
        if (!engine || s.engine === engine || s.productCode === engine) {
          return s;
        }
      } catch {}
    }
  }
  return null;
}

export function createHttpApi(baseUrl: string): ArUiApi {
  const root = baseUrl.replace(/\/$/, "");

  async function call<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<T> {
    let session = readSession();
    if (!session && typeof window !== "undefined") {
      session = readSession("arui") || readSession("ecri");
    }
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
    async login(input: LoginRequest) {
      const targetEngine = (input.engine || input.productCode || "arui").toLowerCase();
      const session = await call<Session>("POST", "/auth/login", {
        ...input,
        engine: targetEngine,
        productCode: targetEngine,
      });
      session.engine = targetEngine;
      session.productCode = targetEngine;
      const key = getStorageKey(targetEngine);
      window.localStorage.setItem(key, JSON.stringify(session));
      return session;
    },
    async register(input) {
      const targetEngine = (input.productCode || "ecri").toLowerCase();
      const session = await call<Session>("POST", "/auth/register", {
        ...input,
        productCode: targetEngine,
      });
      session.engine = targetEngine;
      session.productCode = targetEngine;
      const key = getStorageKey(targetEngine);
      window.localStorage.setItem(key, JSON.stringify(session));
      return session;
    },
    async logout(engine?: string) {
      await call<void>("POST", "/auth/logout").catch(() => undefined);
      const key = getStorageKey(engine);
      window.localStorage.removeItem(key);
    },
    async getSession(engine?: string) {
      return readSession(engine);
    },
    async getPortfolio() {
      return call("GET", "/entitlements/portfolio");
    },
    async purchaseEngine(productCode: string, input?: any) {
      return call("POST", `/entitlements/${encodeURIComponent(productCode)}/purchase`, input || {});
    },

    getStatus: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `${a(id)}/status`)),
    getProfileForm: () => call("GET", `/methodology/profile-form`),
    getProfile: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `${a(id)}/profile`)),
    saveProfile: (id, values) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("PUT", `${a(id)}/profile`, { values })),
    getScreening: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `${a(id)}/screening`)),
    getNextPrompt: (id, domainCode, afterPromptId) =>
      !id || id === "undefined"
        ? Promise.reject(new Error("Missing assessment ID"))
        : call(
            "GET",
            `${a(id)}/domains/${domainCode}/next${afterPromptId ? `?after=${encodeURIComponent(afterPromptId)}` : ""}`,
          ),
    getPromptById: (id, domainCode, promptId) =>
      !id || id === "undefined"
        ? Promise.reject(new Error("Missing assessment ID"))
        : call("GET", `${a(id)}/domains/${domainCode}/prompts/${encodeURIComponent(promptId)}`),
    saveResponse: (id, input) =>
      !id || id === "undefined"
        ? Promise.reject(new Error("Missing assessment ID"))
        : call("PUT", `${a(id)}/responses/${encodeURIComponent(input.promptId)}`, input),
    getEvidence: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `${a(id)}/evidence`)),
    createEvidence: (id, input) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("POST", `${a(id)}/evidence`, input)),
    submitEvidence: (id, evidenceId) =>
      !id || id === "undefined"
        ? Promise.reject(new Error("Missing assessment ID"))
        : call("POST", `${a(id)}/evidence/${encodeURIComponent(evidenceId)}/submit`),
    getPreliminaryResults: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `${a(id)}/results/preliminary`)),

    getAssessorQueue: () => call("GET", `/assessor/queue`),
    getAssessorAssessment: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `/assessor${a(id)}`)),
    getResponseReview: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `/assessor${a(id)}/responses`)),
    getEvidenceReview: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `/assessor${a(id)}/evidence`)),
    getMetricScoring: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `/assessor${a(id)}/metrics`)),
    saveMetricScoring: (id, metricId, input) =>
      !id || id === "undefined"
        ? Promise.reject(new Error("Missing assessment ID"))
        : call("PATCH", `/assessor${a(id)}/metrics/${encodeURIComponent(metricId)}`, input),
    getContextCalibration: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `/assessor${a(id)}/context`)),
    getScoreRuns: (id) => (!id || id === "undefined" ? Promise.reject(new Error("Missing assessment ID")) : call("GET", `/assessor${a(id)}/score-runs`)),
    requestScoreRun: (id, kind) => call("POST", `/assessor${a(id)}/score-runs`, { kind }),
    getExecutionLog: (id) => call("GET", `/assessor${a(id)}/execution-log`),
    getBenchmarkSummary: (id, peerGroupId) =>
      !id || id === "undefined"
        ? Promise.reject(new Error("Missing assessment ID"))
        : call("GET", `/benchmarking/assessments/${encodeURIComponent(id)}/summary${peerGroupId ? `?peer_group_id=${encodeURIComponent(peerGroupId)}` : ""}`),
    getPeerGroups: (productCode) =>
      call("GET", `/benchmarking/peer-groups${productCode ? `?product_code=${encodeURIComponent(productCode)}` : ""}`),
  };
}
