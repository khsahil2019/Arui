# ARUI — Developer Handoff

**AI Resilient University Index (ARUI) — Institutional AI Resilience Assessment**
Frontend prototype baseline · first vertical slice (Profile → Pulse → D01–D03 → evidence → preliminary results → assessor shell).

This document describes the **actual current codebase**. Nothing here is aspirational.
The ARUI Excel workbooks (P0-2 → P0-8) remain the source of truth for methodology.
The frontend contains **no** scoring, adaptive routing, evidence intelligence or cross-domain logic, and must never contain any.

---

## 1. Application architecture

```
React 19 + TypeScript
  └── TanStack Start v1 (SSR, Vite 7 build, file-based routing via TanStack Router)
        ├── src/routes/**            screens (file-based routes)
        ├── src/components/ari/**    ARUI presentation component library
        ├── src/components/ui/**     shadcn/ui primitives (Radix)
        ├── src/lib/catalogue.ts     canonical names/labels only (no rules)
        └── src/api/**               THE ONLY BACKEND BOUNDARY
              ├── types.ts   DTO contracts
              ├── client.ts  ArUiApi interface + getApi() factory
              ├── http.ts    fetch adapter for the production API
              ├── mock/      in-browser mock (localStorage)
              └── hooks.ts   TanStack Query bindings used by screens
```

Rules currently enforced in code:

- Screens/components call **`src/api/hooks.ts`** only; they never fetch, never call `getApi()` directly (except the session guard), and never hold methodology rules.
- `getApi()` returns the **HTTP** implementation when `VITE_ARUI_API_BASE_URL` is set, otherwise the **mock**. This is the single switch.
- Respondent payloads carry no metric IDs, weights, formulas, anchors, thresholds or rule names. Metric identity appears **only** in assessor payloads/screens.
- Server-side rendering is used for delivery only. There are **no** server functions, no `src/routes/api/*` endpoints, no server-side data access.

State management: TanStack Query (`@tanstack/react-query`) for all server state; local component state for in-progress form values. No Redux/Zustand/context store.

---

## 2. Route / screen inventory

| Route file | URL | Purpose |
|---|---|---|
| `src/routes/__root.tsx` | — | HTML shell, fonts, global head metadata, error boundary |
| `index.tsx` | `/` | Public welcome / product introduction |
| `login.tsx` | `/login` | Entry. Email + password; mock role pick (Institution Admin / Assessor) |
| `_workspace.tsx` | — | Respondent layout: session guard + `WorkspaceShell` + `<Outlet />` |
| `_workspace.overview.tsx` | `/overview` | Assessment status: stages, domain progress, evidence counts, contributors |
| `_workspace.profile.tsx` | `/profile` | Institution Profile (multi-step, backend-defined form) |
| `_workspace.orientation.tsx` | `/orientation` | How the assessment works, confidentiality, evidence stance |
| `_workspace.pulse.tsx` | `/pulse` | Institutional Pulse / screening prompts + backend "early signal" |
| `_workspace.assessment.index.tsx` | `/assessment` | Domain hub: D01–D03 in scope, D04–D11 "Not yet assessed" |
| `_workspace.assessment.$domain.tsx` | `/assessment/D01` … `/D03` | Prompt runner (one prompt at a time, backend-sequenced) |
| `_workspace.evidence.tsx` | `/evidence` | Evidence submission, requests, mapping, status |
| `_workspace.intelligence.tsx` | `/intelligence` | Preliminary ARUI Assessment (read-only, backend-computed) |
| `assessor.tsx` | — | Assessor layout + nav |
| `assessor.index.tsx` | `/assessor` | Review queue |
| `assessor.$id.tsx` | — | Assessment layout |
| `assessor.$id.index.tsx` | `/assessor/:id` | Assessment overview: profile summary, applicability, counts |
| `assessor.$id.responses.tsx` | `/assessor/:id/responses` | Response review, metric linkage, review state |
| `assessor.$id.evidence.tsx` | `/assessor/:id/evidence` | Evidence review: E-level, authenticity, metric linkage |
| `assessor.$id.scoring.tsx` | `/assessor/:id/scoring` | M / I / O entry, N/A + rationale, flags, engine outputs |
| `assessor.$id.context.tsx` | `/assessor/:id/context` | Required maturity, current maturity, transformation distance |
| `assessor.$id.runs.tsx` | `/assessor/:id/runs` | Score runs + execution log |

`src/routeTree.gen.ts` is generated — never edit it.

---

## 3. Respondent journey

1. `/login` → session stored, redirect to `/overview`.
2. `/profile` — institution context, form definition supplied by `GET /methodology/profile-form`.
3. `/orientation` — static explanation of process, confidentiality and evidence stance.
4. `/pulse` — screening prompts; backend may return an `earlySignal`.
5. `/assessment` → `/assessment/D01|D02|D03` — one prompt at a time. The UI asks the backend for the **next** prompt and renders whichever `PromptPresentation` it receives. Progress is expressed as *"D01 · Institutional Strategy · Foresight · Exploring 2 of 4 signals"* — never "17 of 143".
6. `/evidence` — 8–12 core items; upload/link/note, type, period, scope, proposed mapping, submit.
7. `/intelligence` — Preliminary ARUI Assessment; only shown when the backend returns results.

Response states are distinct and never collapsed: `answered`, `not_sure`, `not_applicable_requested` (reason category + bounded note), `not_answered`.

**Structured input first.** No unbounded textarea exists anywhere in the respondent experience. Free text survives only as bounded `short_text` (mandatory `maxLength`) or the unused `narrative` type, which requires an on-screen justification. Full per-question audit: `docs/respondent-input-audit.md`.

---

## 4. Assessor journey

Queue → assessment overview → response review → evidence review (E0–E4, authenticity, metric linkage) → M/I/O scoring per metric (with applicability, N/A rationale, outcome-N/A distinct from blank outcome, evidence level, rationale, flags, engine outputs) → context & required maturity / transformation distance (diagnostic only) → request a preliminary or verification score run → execution log.

Assessor screens are the **only** place methodology internals are visible.

---

## 5. Component structure (`src/components/ari/`)

| Component | Role |
|---|---|
| `workspace-shell.tsx` | Respondent chrome: nav, stage rail, session, confidentiality note |
| `page-header.tsx`, `panel.tsx` | Layout primitives |
| `question-card.tsx` | Prompt frame: prompt text, help, evidence hints, targeted reason |
| `prompt-input.tsx` (539 lines) | **Renderer for every `PromptPresentation` kind.** The single place presentation logic lives |
| `response-controls.tsx` | Save / Not sure / Does not apply (reason + bounded note) |
| `form-field.tsx` | Field controls: `ShortText` with counter, `MonthInput`, `ChipGroup`, `SegmentedChoice`, Yes/No/Not sure |
| `answer-card.tsx`, `segmented-control.tsx` | Selection controls |
| `progress.tsx` | Theme-based, respondent-safe progress |
| `evidence-card.tsx` | Evidence item display/status |
| `domain-viz.tsx`, `insight-card.tsx`, `status-badge.tsx` | Results and status presentation |

Underneath: shadcn/ui + Radix primitives in `src/components/ui/`, Tailwind v4 tokens in `src/styles.css`.

---

## 6. Current TypeScript interfaces

All contracts live in **`src/api/types.ts` (521 lines)** — treat that file as the schema specification and read it alongside this document. Summary:

- **Session** — `Session`, `SessionUser`, `LoginRequest`, `Role` (`institution_admin | contributor | viewer | assessor`).
- **Status** — `AssessmentStatusView`, `StageProgress` (`StageId`, `StageState`), `DomainProgress`, `AssessmentStatus` (`draft | profile | pulse | assessment | evidence | preliminary | verified | locked`).
- **Profile** — `ProfileFormDefinition` → `ProfileStepDefinition` → `ProfileFieldDefinition` (`text | single | multi | scale5 | band`), `ProfileValues`, `InstitutionProfile`.
- **Prompts** — `Prompt`, `PromptPosition`, `PromptPresentation` (9 kinds), `FieldDef` (7 types), `MatrixColumnDef`, `MatrixRowSource`, `ShortTextDef`, `NumberFieldDef`, `OTHER_VALUE = "__other__"`, `PromptResponse`, `ResponseState`, `NextPromptResponse`, `ScreeningView`.
- **Evidence** — `EvidenceItem`, `EvidenceRequest`, `EvidenceView`, `CreateEvidenceInput`, `EvidenceKind`, `EvidenceSubmissionStatus`.
- **Results** — `PreliminaryResults`, `DomainResult`, `Finding`, `MaturityLevel` (0–5), `Confidence`.
- **Assessor** — `AssessorQueueItem`, `AssessorAssessmentView`, `ResponseReviewItem`, `EvidenceReviewItem`, `EvidenceLevel` (E0–E4), `MetricScoring`, `MetricScoringInput`, `MetricScoringStatus`, `MetricFlag`, `ContextCalibration`, `ScoreRun`, `ExecutionLogEntry`.

`src/lib/catalogue.ts` holds only names/labels: canonical D01–D11 domain names, `inScopeDomains = ["D01","D02","D03"]`, maturity labels 0–5 (Absent → Adaptive), status labels, role labels. No thresholds, weights or rules.

### Presentation kinds and their value shapes

| Kind | Value written back in `PromptResponse.value` |
|---|---|
| `single_choice` | `string` or `{ choice, other?, nuance? }` |
| `multi_choice` | `{ selected: string[]; other?; nuance? }` |
| `ranked_list` | `{ items: ({ value; other? } & Record<string, unknown>)[] }` (order = rank) |
| `process_steps` | `Record<string, unknown>[]` (order = sequence) |
| `numbers` | `{ values: Record<string, number \| null>; precision? }` |
| `structured_form` | `Record<string, unknown>` |
| `records` | `{ none: boolean; rows: Record<string, unknown>[] }` |
| `matrix` | `{ rows: { id; label; other?; cells: Record<string, unknown> }[] }` |
| `evidence_request` | `{ acknowledged: boolean; note? }` |

`provisionalOptions: true` marks any option catalogue not defined by the workbooks; the UI tells respondents so.

---

## 7. API abstraction and expected endpoints

Interface: `ArUiApi` in `src/api/client.ts`. Paths below are the **proposal** implemented in `src/api/http.ts`; if your backend differs, change only that file. `{id}` is URL-encoded. Base = `VITE_ARUI_API_BASE_URL`. Auth = `Authorization: Bearer <session.token>`, `content-type: application/json`.

### Session
| Method | Path | Request | Response |
|---|---|---|---|
| POST | `/auth/login` | `LoginRequest` | `Session` |
| POST | `/auth/logout` | — | 204 |

`getSession()` is client-local (reads `localStorage["arui.session"]`); there is currently **no** `GET /auth/session` call.

### Respondent
| Method | Path | Request | Response |
|---|---|---|---|
| GET | `/assessments/{id}/status` | — | `AssessmentStatusView` |
| GET | `/methodology/profile-form` | — | `ProfileFormDefinition` |
| GET | `/assessments/{id}/profile` | — | `InstitutionProfile` |
| PUT | `/assessments/{id}/profile` | `{ values: ProfileValues }` | `InstitutionProfile` |
| GET | `/assessments/{id}/screening` | — | `ScreeningView` |
| GET | `/assessments/{id}/domains/{code}/next?after={promptId}` | — | `NextPromptResponse` |
| GET | `/assessments/{id}/domains/{code}/prompts/{promptId}` | — | `NextPromptResponse` |
| PUT | `/assessments/{id}/responses/{promptId}` | `SaveResponseInput` = `{ promptId, state, value?, note?, notApplicableRationale? }` | `PromptResponse` |
| GET | `/assessments/{id}/evidence` | — | `EvidenceView` |
| POST | `/assessments/{id}/evidence` | `CreateEvidenceInput` | `EvidenceItem` |
| POST | `/assessments/{id}/evidence/{evidenceId}/submit` | — | `EvidenceItem` |
| GET | `/assessments/{id}/results/preliminary` | — | `PreliminaryResults \| null` |

### Assessor
| Method | Path | Response |
|---|---|---|
| GET | `/assessor/queue` | `AssessorQueueItem[]` |
| GET | `/assessor/assessments/{id}` | `AssessorAssessmentView` |
| GET | `/assessor/assessments/{id}/responses` | `ResponseReviewItem[]` |
| GET | `/assessor/assessments/{id}/evidence` | `EvidenceReviewItem[]` |
| GET | `/assessor/assessments/{id}/metrics` | `MetricScoring[]` |
| PATCH | `/assessor/assessments/{id}/metrics/{metricId}` (body `MetricScoringInput`) | `MetricScoring` |
| GET | `/assessor/assessments/{id}/context` | `ContextCalibration[]` |
| GET | `/assessor/assessments/{id}/score-runs` | `ScoreRun[]` |
| POST | `/assessor/assessments/{id}/score-runs` (body `{ kind: "preliminary" \| "verification" }`) | `ScoreRun` |
| GET | `/assessor/assessments/{id}/execution-log` | `ExecutionLogEntry[]` |

Error handling in `http.ts`: `204` → `undefined`; non-2xx → thrown `Error` with method, path, status and body text. There is currently **no** 401-triggered re-authentication, no retry policy and no refresh-token flow — see Known limitations.

Query keys and cache invalidation are defined in `src/api/hooks.ts` (`queries.*`, `useSaveResponse`, `useCreateEvidence`, `useSubmitEvidence`, `useSaveMetricScoring`, `useRequestScoreRun`, …). Saving a response invalidates `["assessment", id]`; assessor mutations invalidate `["assessor", id]`.

---

## 8. Mock data structures

- `src/api/mock/content.ts` (820 lines) — workbook-derived **content**: `profileForm`, `screeningPrompts` (s-01…s-05), `domainPrompts` for D01/D02/D03, `targetedPrompts`, `evidenceRequests`, `evidenceTypes`, `evidenceScopes`, `d03Capabilities`, plus assessor-side `metricCatalogue` (illustrative metric definitions for D01–D03) and `promptMetricLinks`.
- `src/api/mock/index.ts` (685 lines) — the mock `ArUiApi`. Fixed constants: `ASSESSMENT_ID = "asm-demo-2026"`, institution `"Demonstration University"`, `METHODOLOGY_VERSION = "ARUI P0-8 (pre-pilot) · mock"`, storage key `arui.mock.v2`. Seeds evidence, scoring rows, sample responses and execution-log entries; persists everything to `localStorage`; simulates latency.

The mock **sequences and stores**. It does not score, route by rule, derive required maturity or produce findings. `preliminaryFixture` and `contextFixture` are **fixed illustrative fixtures**, clearly labelled, not calculations.

---

## 9. Mock dependencies that must be replaced

1. Whole of `src/api/mock/` — replaced by your API (delete the directory and its import in `client.ts` once live).
2. Prompt content and ordering (`domainPrompts`, `targetedPrompts`, `screeningPrompts`) — must come from the methodology store, with real adaptive routing.
3. `profileForm` definition — must be served by `GET /methodology/profile-form`.
4. Every provisional option catalogue (see §19) — must be confirmed methodology data.
5. `preliminaryFixture` — real score-run output.
6. `contextFixture`, `metricCatalogue`, `promptMetricLinks`, seeded `MetricScoring` — real methodology master data and assessor state.
7. `evidenceRequests` — real, engine-triggered evidence requests.
8. Seeded evidence items (flagged `demo: true`) and seeded execution-log entries.
9. Progress captions, stage states and `lifecycleStatus()` derivation — currently computed in the mock, must be backend-owned.
10. Role inference from email / `roleHint` in `login()` — real accounts and roles.
11. `localStorage` persistence of responses/evidence/profile — real transactional storage.
12. Fixed `assessmentId`, institution and methodology version strings.

---

## 10. Authentication assumptions

- `POST /auth/login` returns `Session { token, user{id,name,email,role}, institution, assessmentId, expiresAt }`.
- The token is stored in `localStorage["arui.session"]` and sent as `Authorization: Bearer`.
- `LoginRequest.roleHint` is **mock-only**; production must derive the role from the account and may ignore it. Remove it from the contract when you implement real auth.
- Route protection is client-side only: `_workspace.tsx` redirects to `/login` when no session exists. **The backend must enforce all authorisation.**
- Roles in the contract: `institution_admin`, `contributor`, `viewer`, `assessor`. The UI currently exercises admin and assessor only.
- If you prefer httpOnly cookies over bearer tokens, change `src/api/http.ts` only (drop the header, add `credentials: "include"`).

---

## 11. Assessment state / lifecycle assumptions

Statuses: `draft → profile → pulse → assessment → evidence → preliminary → verified → locked`. The UI **displays** `AssessmentStatusView.status`; it must not derive it in production.

Stages (`StageId`): `profile`, `orientation`, `pulse`, `assessment`, `evidence`, `results`, each with `state` (`complete | current | upcoming | locked`) and a human `caption` written by the backend.
Domain progress (`DomainProgress`): `not_started | in_progress | complete | not_in_scope`, plus `themesExplored / themesTotal` and a `targetedFollowUp` flag.
Results appear only when `GET /results/preliminary` returns a body.

D04–D11 must be returned as `inScope: false` / `not_in_scope` and are rendered as "Not yet assessed" with no scores or maturity positions. Results are always labelled "Preliminary ARUI Assessment" with "Assessment coverage: 3 of 11 domains".

---

## 12. Evidence upload requirements

Current UI captures: title, kind (`document | url | note`), evidence type, file name + size **(metadata only — no bytes are transmitted)**, url, `periodStart`/`periodEnd` (YYYY-MM), bounded description (≤240 chars), scope, `proposedSupports[]`, `fulfilsRequestIds[]`.

Backend must add:
- A real upload path — signed-URL PUT (preferred; `http.ts` then needs an "obtain upload URL → PUT → confirm" sequence) or multipart POST.
- Accepted MIME types, max file size, virus scanning, retention and deletion.
- Status transitions `draft → submitted → under_review → accepted | returned`, and `confirmedSupports[]` written by the assessor/engine (respondent proposals are never authoritative).
- Core-set target is currently `{ min: 8, max: 12 }`, supplied by the backend in `EvidenceView.coreTarget`.

---

## 13. Score / result data expected by the UI

`PreliminaryResults`: fixed `label`, `scopeNote`, `coverage { assessed, total, codes }`, `scoreRunId`, `generatedAt`, `overall { current, required, transformationDistance, confidence, evidenceCoverage, narrative }`, `domains: DomainResult[]`, `strengths`, `vulnerabilities`, `contradictions` (`Finding[]`, optional `between[]` for cross-domain pairs), `attention[]`, `caveats[]`.

`DomainResult` for unassessed domains carries `assessed: false` and **no** numeric fields. Transformation distance and confidence are displayed as diagnostics; the UI performs no arithmetic on any of them. Cross-domain findings render as narrative only, never as score modifiers.

---

## 14. Environment variables

| Variable | Used in | Effect |
|---|---|---|
| `VITE_ARUI_API_BASE_URL` | `src/api/client.ts` | Unset → mock API. Set (e.g. `https://api.example.org/v1`) → HTTP API. |

That is the only application env var. No secrets are read by the frontend; there is no `.env` committed.

---

## 15. External dependencies

Runtime: React 19, React DOM, TanStack Start / Router / React Query, Tailwind CSS 4, Radix UI primitives, lucide-react, recharts, class-variance-authority, clsx, tailwind-merge, sonner, date-fns, react-hook-form + @hookform/resolvers, zod, cmdk, vaul, embla-carousel-react, input-otp, react-day-picker, react-resizable-panels.
Build/dev: Vite 8, TypeScript 5.8, ESLint 9 + typescript-eslint, Prettier, `@lovable.dev/vite-tanstack-config`, nitro.

No analytics, telemetry, payment, auth or AI SDK is present. Fonts are loaded via `<link>` in `__root.tsx`.

---

## 16. Lovable / Supabase / Cloud dependencies present

**No Supabase, no Lovable Cloud, no database, no server functions.** Verified: no `@supabase/*` dependency, no `src/integrations/`, no `src/routes/api/`.

Lovable-specific items that exist and how to remove them if you leave the platform:

| Item | What it is | Removal |
|---|---|---|
| `@lovable.dev/vite-tanstack-config` (devDependency, used in `vite.config.ts`) | Preset bundling tanstackStart, viteReact, tailwindcss, tsconfig-paths, nitro (Cloudflare target), path alias, dev error plugins | Replace `vite.config.ts` with a plain `defineConfig` from `vite` wiring `@tanstack/react-start/plugin/vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths`, and the `@` alias. Choose your own deploy target (Node adapter for a Node.js host). |
| `src/lib/lovable-error-reporting.ts`, imported by `src/routes/__root.tsx` | Reports render errors to the Lovable preview harness when present; a no-op otherwise | Delete the file and the two references in `__root.tsx` |
| `src/lib/error-capture.ts`, `src/lib/error-page.ts`, `src/server.ts`, `src/start.ts` | SSR error wrapper, h3 error normalisation, CSRF middleware for server functions | Generic TanStack Start code, safe to keep. `src/start.ts`'s CSRF middleware is inert while no server functions exist |
| Build target | The preset defaults to Cloudflare Workers via nitro | Switch to a Node preset if hosting alongside your Node.js API |
| `.lovable/`, `.workspace/`, `AGENTS.md`, `roadmap.md`, `bunfig.toml` | Platform/workflow metadata, not application code | Delete freely |

Nothing in `src/api/`, `src/components/`, `src/lib/catalogue.ts` or `src/routes/` (other than the error-reporting import) is Lovable-specific.

---

## 17. Replacing the mock with your backend — exact steps

1. Implement the endpoints in §7 (or your own paths).
2. If your paths/verbs differ, edit **only** `src/api/http.ts`. Nothing else in the frontend knows about URLs.
3. If a DTO shape must change, change `src/api/types.ts` and fix the resulting TypeScript errors — this is the intended contract-change signal. Prefer generating `types.ts` from your OpenAPI schema.
4. Implement the evidence upload path and extend `createEvidence` in `http.ts` to a two-step signed upload.
5. Decide the auth transport. Bearer token works as-is; for cookies, edit `readSession`/`call` in `http.ts` only.
6. Set `VITE_ARUI_API_BASE_URL` in the deployment environment and run the app — the mock is then never constructed.
7. Verify the respondent journey end to end (login → profile → pulse → D01–D03 → evidence → results) and the assessor journey.
8. Delete `src/api/mock/`, its import and the `configuredBaseUrl` fallback branch in `src/api/client.ts`, so the mock cannot ship.
9. Add integration tests against the contract (none exist today — see §21).

Cleanly modular by construction: 24 files import from `src/api/*`; **zero** files import `src/api/mock/*` except `src/api/client.ts`.

---

## 18. Provisional answer-option lists (not workbook-defined)

Every catalogue below is marked `provisionalOptions: true` in the contract and shown to respondents as provisional. They exist so the structured-input experience could be built; the methodology team must confirm or replace each, and must define any answer-choice → construct mapping.

Defined in `src/api/mock/content.ts`:

1. Pulse screening scales (s-01…s-05, five-point positioning scales).
2. Actors / who is involved (institutional roles).
3. Time bands (Within days · 1–4 weeks · 1–3 months · 3–6 months · 6–12 months · Over a year · Varies).
4. Consistency scale (Always · Usually · Sometimes · Rarely).
5. Institutional assumptions catalogue (D01 ranked top-5).
6. Decision areas, nature-of-change and drivers (D01 records).
7. Process-step actions for foresight → action (D01) and approval (D02).
8. First actions / initiators / mechanisms for the threatened-programme scenario (D01).
9. Institutional value categories and demonstration locations (D01).
10. Bases of authority for deployment approval (D02).
11. Governance policy types (D02 matrix rows).
12. Consequential AI decision types (D02 human-review matrix rows).
13. Harmful-incident response actions, actors and learning mechanisms (D02).
14. External system types, due-diligence and monitoring activities (D02).
15. Verification / challenge activities and locations (D03).
16. Capability demonstration modes (D03 matrix).
17. Non-technical discipline catalogue (D03 matrix rows).
18. Evidence-basis options for least-demonstrated capabilities (D03 ranked top-3).
19. Risk-register options for targeted follow-ups (identification, rating, treatment, owner, monitoring, residual-risk decision).
20. Evidence types and scopes.
21. "Does not apply" reason categories.
22. Precision flags (exact / approximate / partly known) and the explicit "none" states in d01-02, d02-08, d03-05.

Workbook-derived (not provisional): canonical D01–D11 names, the D03 graduate-capability list, maturity levels 0–5, evidence levels E0–E4, prompt wording and prompt IDs.

---

## 19. The 12 unresolved ARUI methodology decisions

Surfaced, deliberately **not** resolved in the frontend:

1. Answer-choice → construct (M/I/O) mappings for every provisional catalogue.
2. Blank outcome vs outcome-N/A semantics (distinct fields exist; the rule does not).
3. Screening / branch thresholds that trigger targeted follow-up prompts.
4. Evidence trigger threshold — when the engine requests evidence for a claim.
5. Profile scale → context-calibration mappings (the 5-point profile scales).
6. Confidence-band formula (how E-levels and coverage produce low/moderate/high).
7. Corroboration adjustment rule (multiple evidence items for one claim).
8. Partial-scope display rule — how an overall position may be expressed on 3 of 11 domains.
9. Response-state semantics — how `not_sure` and `not_answered` enter (or do not enter) scoring; unknown must never become zero.
10. Respondent-facing maturity labels — whether workbook labels (Absent … Adaptive) are shown to respondents.
11. Pulse equivalence — whether screening answers may substitute for domain responses.
12. Future-exposure scale definition and its use in required maturity.

Additionally open from the input redesign: confirmation of the provisional catalogues (#1 above), whether any D01–D03 question genuinely requires narrative reasoning, and whether the explicit "none" states are acceptable as first-class responses.

---

## 20. Known limitations

- Only D01, D02 and D03 are assessed; D04–D11 exist as canonical names only.
- Adaptive routing is not real: the mock opens targeted follow-ups once a domain's core set has responses.
- No scoring anywhere in the frontend; results are a fixed fixture.
- File uploads record name and size only; no bytes leave the browser.
- Session validity is not verified against a server; the client trusts `localStorage`.
- No 401 handling, token refresh, retry or offline queueing.
- No multi-user collaboration, no contributor/viewer permission differences in the UI, no concurrent-edit protection.
- No internationalisation; English only.
- No accessibility audit has been performed (Radix primitives give a reasonable baseline).
- Mobile layouts are secondary; the product is designed desktop/tablet first.
- No print/PDF export of results.

---

## 21. Known technical debt

- **No automated tests** — no unit, component, contract or e2e tests exist. Verification so far has been manual plus scripted browser walkthroughs.
- `src/api/mock/index.ts` (685 lines) and `content.ts` (820 lines) are large; they are throwaway and should be deleted rather than refactored.
- `PromptResponse.value` is `unknown`; value shapes are documented in `types.ts` but not runtime-validated. Zod schemas per presentation kind would make the boundary safe (zod is already a dependency).
- `LoginRequest.roleHint` is mock scaffolding inside a production contract.
- `getSession()` reads local storage instead of validating with the server.
- Save semantics differ by control: discrete choices autosave; composite inputs save explicitly. Worth unifying.
- `src/api/http.ts` has no shared error taxonomy — every failure is a generic `Error`.
- Unused shadcn/ui components remain in `src/components/ui/` and could be pruned.
- The `narrative` field type exists in the contract but is used nowhere.

---

## 22. Recommended production handoff sequence

1. **Contract freeze** — review `src/api/types.ts` with the methodology team; publish it as OpenAPI and generate `types.ts` from that point on.
2. **Methodology data model** — load the P0-2 → P0-8 workbooks into versioned, immutable methodology tables (domains, metrics, measurement paths, anchors, context rules, evidence rules, cross-domain rules). Never hand-copy into code.
3. **Resolve the 12 decisions** and confirm the provisional catalogues (§18/§19) before any scoring work.
4. **Auth and tenancy** — accounts, roles, institution scoping, server-side authorisation on every endpoint.
5. **Assessment runtime** — status lifecycle, prompt sequencing and real adaptive routing, response persistence with the four distinct states, append-only response history.
6. **Evidence service** — upload, scanning, retention, status transitions, engine-owned mapping.
7. **Scoring engine** — deterministic M/I/O, required maturity, transformation distance (diagnostic), evidence confidence (separate from capability), cross-domain diagnostics (never modifying scores). Test against explicit workbook examples only.
8. **Assessor workflow** — review states, N/A adjudication, flags, score runs, execution log, audit and versioning.
9. **Frontend cutover** — point `VITE_ARUI_API_BASE_URL` at a staging API, walk both journeys, delete `src/api/mock/`.
10. **Hardening** — contract tests, error taxonomy, accessibility audit, deployment target decision (§16), then pilot.

---

*Baseline frozen. No D04–D11, no production backend, no database, no Cloud dependency. Methodology remains owned by the ARUI workbooks.*
