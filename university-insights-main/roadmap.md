# Roadmap

## Stage 1 — Premium product shell (complete)

Design tokens, typography, reusable `src/components/ari/` library, workspace shell, welcome page.

## Stage 2 — Frontend vertical slice on a mock API boundary (complete)

Frontend only. Production Node.js / PostgreSQL / engines are owned by the development team; the UI talks only to `ArUiApi` (`src/api/`), switched between mock and HTTP by `VITE_ARUI_API_BASE_URL`. No Lovable Cloud / Supabase. No methodology logic in the frontend.

- [x] Typed API boundary: `src/api/types.ts`, `src/api/client.ts`, `src/api/http.ts`, `src/api/hooks.ts`, `src/api/README.md`
- [x] Mock implementation (localStorage): `src/api/mock/` — content and fixed backend-like fixtures, clearly labelled MOCK DATA
- [x] Login / entry (`/login`) — Institution Admin and Assessor (mock role pick; production credentials go through the API)
- [x] Respondent workspace (`/_workspace`): Overview, Institution Profile, Orientation, Institutional Pulse, Assessment hub, D01/D02/D03 prompt runner (`/assessment/$domain`), Evidence, Preliminary results
- [x] Adaptive-question presentation framework (`prompt-input.tsx`) — backend chooses prompt and presentation; UI renders
- [x] Distinct response states: answered · not sure · N/A requested (with rationale) · not answered
- [x] Meaningful progress ("D01 · Institutional Strategy · Foresight · Exploring 2 of 4 signals"), never "17/143"
- [x] Assessor shell (`/assessor`): review queue, assessment overview, response review, evidence review (E-level, authenticity, linkage), M/I/O metric scoring with N/A + rationale + flags, context & required maturity / transformation distance, score runs & execution log
- [x] Respondent confidentiality: no metric IDs, weights, anchors, thresholds or rules on respondent screens; assessor screens are the only place internals appear

## Stage 2b — Structured-first respondent inputs (complete)

"Structured input first. Free text only when genuinely necessary." Presentation contract extended (`FieldDef`: select · multi_select · yes_no_unsure · number · period · bounded short_text · justified narrative; ranked top-N from catalogue; process builder; respondent-selected matrix rows; precision flag; explicit "none" states). Zero unbounded textareas remain in the respondent experience; N/A rationale is a reason category + bounded note. Measurement paths, prompt IDs and wording unchanged; every new option catalogue is `provisionalOptions: true`. Audit: `docs/respondent-input-audit.md`.

## Handoff to backend team (see `src/api/README.md`)

- Implement endpoints listed in `src/api/http.ts`; keep DTO shapes in `src/api/types.ts` (or regenerate from OpenAPI)
- Real adaptive routing, screening thresholds, evidence triggers, scoring, cross-domain diagnostics, required-maturity derivation — engine side only
- Production file upload (mock stores metadata only), auth/session, roles (Institution Admin · Contributor · Viewer · Assessor)

## Awaiting instruction (not built by design)

D04–D11 prompts, transformation planning, payments, certification, benchmarking, methodology editing UI, P0-9.

## METHODOLOGY DECISION REQUIRED (surfaced, not resolved)

Answer-choice → construct mappings; blank outcome vs N/A; screening/branch thresholds; evidence trigger threshold; profile scale mappings; confidence-band formula; corroboration adjustment; partial-scope display; response-state semantics; respondent-facing maturity labels; Pulse equivalence; future-exposure scale. Provisional UI options are flagged `provisional: true` in mock content.

## Stage 3 — Development freeze and handoff (complete)

Baseline frozen at the approved first vertical slice. Full technical handoff for the production Node.js + PostgreSQL team: `docs/ARUI_DEVELOPER_HANDOFF.md`. No further feature work unless explicitly instructed.

## Stage 4 — Final product specification and freeze (complete)

Consolidated final handoff: `docs/ARUI_FINAL_DEVELOPER_HANDOFF.md` (25 `Institution_Profile` fields, 23 `Institutional_Data` items, profile UX, PDF report specification, report payload contract `src/api/report-types.ts`, decision register MD-01…12 / MD-P1…P10 / MD-R1…R3). Design-reference sample: `docs/samples/ARUI_Sample_Assessment_Report.pdf` rendered from mock `report-payload.sample.json` by `report_sample_generator.py` — no production infrastructure. Lovable development phase closed; no features, backend, database or methodology changes without explicit instruction.
