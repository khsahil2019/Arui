# ARUI frontend ↔ backend boundary

The frontend talks to the backend **only** through `ArUiApi` (`src/api/client.ts`).

| File | Purpose |
| --- | --- |
| `types.ts` | Typed contracts (DTOs) the UI renders. The source of truth for what the backend must return. |
| `client.ts` | `ArUiApi` interface and `getApi()` factory. |
| `http.ts` | Fetch implementation for the production Node.js API. Endpoint paths are a proposal; change them here only. |
| `mock/` | In-browser mock used when `VITE_ARUI_API_BASE_URL` is unset. Sequences and stores; never scores or routes by rule. |
| `hooks.ts` | TanStack Query bindings used by routes/components. |

## Division of responsibility

The backend owns every methodology decision: applicability, adaptive routing (which prompt comes next and why), evidence requests and mapping, M/I/O scoring, N/A acceptance, required maturity, transformation distance, confidence, metric/domain/overall scores, cross-domain findings, score runs, audit and versioning.

The frontend owns presentation: rendering whichever `PromptPresentation` the backend chooses, collecting responses with their state (`answered`, `not_sure`, `not_applicable_requested`, `not_answered`), collecting evidence metadata and uploads, and displaying backend-provided progress, status and results.

**Structured input first.** Respondent inputs are selections, rankings, numbers, periods, matrices and process steps; free text exists only as bounded `short_text` (mandatory `maxLength`) or a `narrative` field that must carry an on-screen `justification`. Option catalogues that are not workbook-defined are flagged `provisionalOptions: true` and the UI tells respondents so. Value shapes per presentation kind are documented in `types.ts`. The per-question audit is in `docs/respondent-input-audit.md`.

Respondent-facing payloads carry no metric IDs, weights, formulas, anchors, thresholds or rule names. Assessor payloads may carry metric identities.

## Switching to the real API

Set `VITE_ARUI_API_BASE_URL=https://api.example.org/v1`. Sessions are stored under `arui.session` and sent as a bearer token.

## Known open items for the backend team

- Response option sets flagged `provisionalOptions: true` in the mock are not defined in the methodology workbooks; the backend must supply the confirmed sets.
- The mock opens targeted follow-up prompts once a domain's core set has responses. The real branching rule is a backend concern.
- File uploads: the mock records file name and size only. The HTTP client will need a signed-upload or multipart endpoint.
