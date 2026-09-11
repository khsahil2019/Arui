# ARUI — Final Developer Handoff

**AI Resilient University Index (ARUI) · Institutional AI Resilience Assessment**
Frontend prototype baseline → production Node.js + PostgreSQL implementation.

This is the single consolidated handoff. It supersedes and absorbs:

- `docs/ARUI_DEVELOPER_HANDOFF.md` — codebase baseline (kept for detail; nothing in it is contradicted here)
- `docs/ARUI_INSTITUTION_PROFILE_COMPLETENESS_AUDIT.md` — profile gap analysis (kept; its gap table is the field-level evidence for Part B)
- `docs/respondent-input-audit.md` — per-question input audit

Everything below describes the **actual current codebase** or a **specification derived line-by-line from the ARUI workbooks (P0-2 → P0-8)**. Where the workbooks are silent, the text says **METHODOLOGY DECISION REQUIRED (MD-nn)** and nothing is invented. The workbooks remain the only source of truth for methodology.

Hard boundaries that remain in force: no scoring, routing, evidence intelligence, required-maturity or cross-domain logic in the frontend; no Supabase / Lovable Cloud; no production database in this repository; D04–D11 are names only.

---

## Contents

- Part A — Current frontend (what exists)
- Part B — Institution Profile: all 25 `Institution_Profile` fields
- Part C — Institutional Data: all 23 D01–D03 `Institutional_Data` items
- Part D — Recommended profile and institutional-data UX
- Part E — ARUI Assessment Report (PDF) specification
- Part F — Report API payload contract
- Part G — Provisional option lists
- Part H — Unresolved methodology decisions (consolidated register)
- Part I — Lovable dependencies, replacement points, limitations, debt
- Part J — Production implementation order

---

# Part A — Current frontend

## A1. Architecture

```
React 19 + TypeScript · TanStack Start v1 (SSR shell, Vite build, file-based routing)
  src/routes/**              screens
  src/components/ari/**      ARUI presentation components (design language)
  src/components/ui/**       shadcn/ui + Radix primitives
  src/lib/catalogue.ts       canonical names/labels only — no rules
  src/api/**                 THE ONLY BACKEND BOUNDARY
    types.ts                 DTO contracts (521 lines) — the schema specification
    report-types.ts          Report payload contract (Part F) — proposal, not yet consumed by a route
    client.ts                ArUiApi interface + getApi() (mock ⇄ http switch)
    http.ts                  fetch adapter; endpoint paths are a proposal
    hooks.ts                 TanStack Query bindings used by screens
    mock/                    in-browser mock (content.ts, index.ts) — throwaway
docs/samples/                report-payload.sample.json, ARUI_Sample_Assessment_Report.pdf, report_sample_generator.py
```

Rules enforced in code: screens call `src/api/hooks.ts` only; `VITE_ARUI_API_BASE_URL` set → HTTP adapter, unset → mock; respondent payloads never carry metric IDs, weights, formulas, anchors, thresholds or rule names; no server functions, no `src/routes/api/*`, no server-side data access.

## A2. Routes

| File | URL | Purpose |
|---|---|---|
| `__root.tsx` | — | HTML shell, fonts (Newsreader + IBM Plex Sans), error boundary |
| `index.tsx` | `/` | Public welcome |
| `login.tsx` | `/login` | Entry; mock role pick |
| `_workspace.tsx` | — | Respondent layout + client session guard |
| `_workspace.overview.tsx` | `/overview` | Stage/domain/evidence status |
| `_workspace.profile.tsx` | `/profile` | Institution Profile — data-driven multi-step form |
| `_workspace.orientation.tsx` | `/orientation` | How the assessment works |
| `_workspace.pulse.tsx` | `/pulse` | Screening prompts (s-01…s-05) |
| `_workspace.assessment.index.tsx` | `/assessment` | Domain hub; D04–D11 "Not yet assessed" |
| `_workspace.assessment.$domain.tsx` | `/assessment/D01…D03` | One-prompt-at-a-time runner |
| `_workspace.evidence.tsx` | `/evidence` | Evidence submission |
| `_workspace.intelligence.tsx` | `/intelligence` | Preliminary ARUI Assessment (read-only) |
| `assessor.tsx`, `assessor.index.tsx`, `assessor.$id.*` | `/assessor/**` | Queue, overview, responses, evidence review, M/I/O scoring, context & required maturity, score runs & log |

## A3. Journeys

**Respondent:** login → profile → orientation → pulse → D01 → D02 → D03 (backend-sequenced prompts; targeted follow-ups) → evidence (8–12 core items) → preliminary results.
**Assessor:** queue → overview → responses → evidence review (E0–E4, authenticity, metric linkage) → M/I/O scoring (applicability, N/A rationale, outcome-N/A vs blank, flags, engine outputs) → context / required maturity / transformation distance → score runs → execution log.

Response states are distinct and never collapsed: `answered`, `not_sure`, `not_applicable_requested`, `not_answered`. No unbounded textarea exists in the respondent experience.

## A4. Contracts in `src/api/types.ts`

Session (`Session`, `Role`), status (`AssessmentStatusView`, `StageProgress`, `DomainProgress`, `AssessmentStatus` = `draft|profile|pulse|assessment|evidence|preliminary|verified|locked`), profile (`ProfileFormDefinition → ProfileStepDefinition → ProfileFieldDefinition`, `ProfileFieldType = text|single|multi|scale5|band`, `ProfileValues = Record<string, string|string[]|number|null>`), prompts (`Prompt`, `PromptPresentation` × 9 kinds, `FieldDef` × 7 types, `PromptResponse`, `ResponseState`), evidence (`EvidenceItem`, `EvidenceRequest`, `EvidenceView`, `CreateEvidenceInput`), results (`PreliminaryResults`, `DomainResult`, `Finding`), assessor (`MetricScoring`, `MetricScoringInput`, `ContextCalibration`, `ScoreRun`, `ExecutionLogEntry`, `EvidenceLevel` E0–E4).

Presentation-kind value shapes and the endpoint table are unchanged from `docs/ARUI_DEVELOPER_HANDOFF.md` §6–§7 and are not repeated here.

## A5. Endpoint proposal (implemented in `src/api/http.ts`)

Session: `POST /auth/login`, `POST /auth/logout`.
Respondent: `GET /assessments/{id}/status`, `GET /methodology/profile-form`, `GET|PUT /assessments/{id}/profile`, `GET /assessments/{id}/screening`, `GET /assessments/{id}/domains/{code}/next?after=`, `GET /assessments/{id}/domains/{code}/prompts/{promptId}`, `PUT /assessments/{id}/responses/{promptId}`, `GET|POST /assessments/{id}/evidence`, `POST /assessments/{id}/evidence/{evidenceId}/submit`, `GET /assessments/{id}/results/preliminary`.
Assessor: `GET /assessor/queue`, `GET /assessor/assessments/{id}`, `/responses`, `/evidence`, `GET|PATCH /metrics[/{metricId}]`, `/context`, `GET|POST /score-runs`, `/execution-log`.

**New endpoints required by this handoff (not yet in `http.ts`):**

| Method | Path | Purpose |
|---|---|---|
| GET | `/methodology/reference/states` and `/methodology/reference/states/{state}/districts` | Reference data for IP04/IP05 dependent dropdowns |
| GET / PUT | `/assessments/{id}/institutional-data/{domainCode}` | The 23 D01–D03 numeric items (Part C) with per-item state |
| GET | `/assessments/{id}/report/preliminary` | `AssessmentReportPayload` (Part F) |
| GET | `/assessments/{id}/report/preliminary.pdf` | Rendered PDF if generated server-side |

## A6. Mock data (to be deleted)

`src/api/mock/content.ts` — profile form (11 fields), screening prompts, D01–D03 prompt catalogue, targeted prompts, evidence requests/types/scopes, illustrative metric catalogue and prompt→metric links.
`src/api/mock/index.ts` — the mock `ArUiApi`; fixed `asm-demo-2026` / "Demonstration University"; localStorage `arui.mock.v2`; fixed `preliminaryFixture` and `contextFixture`. It sequences and stores; it never scores or routes by rule.

## A7. Evidence and results as currently expected by the UI

Evidence: title, kind (`document|url|note`), type, file name + size (metadata only, no bytes transmitted), url, `periodStart/periodEnd` (YYYY-MM), bounded description ≤240, scope, `proposedSupports[]`, `fulfilsRequestIds[]`; statuses `draft → submitted → under_review → accepted|returned`; core target `{min: 8, max: 12}` supplied by backend. Production must add a signed-URL upload path, MIME/size limits, scanning, retention, and engine/assessor-owned `confirmedSupports[]`.

Results (`PreliminaryResults`): label, scope note, `coverage {assessed, total, codes}`, score run id, overall (current, required, transformation distance, confidence, evidence coverage, narrative), `domains[]` (unassessed domains carry `assessed:false` and no numeric fields), strengths, vulnerabilities, contradictions, attention, caveats. The UI performs no arithmetic on any of these.

---

# Part B — Institution Profile: all 25 `Institution_Profile` fields

Source: workbook sheet `Institution_Profile` (identical in P0-4 and P0-8). Column "Use" in the workbook is `Context` for all rows except IP15–IP18, which are `Context calibration`. Where the workbook lists no option values, the table says so; **do not invent option lists**.

"Engine effect" records only what a workbook sheet states. "—" means no engine consumer is defined in the D01–D03 sheets; the field is stored and reported as institutional context.

| ID | Field | Req. | Workbook input | Options defined? | Engine effect stated in workbooks | Frontend control | Backend / DB |
|---|---|---|---|---|---|---|---|
| IP01 | Institution name | Required | Text | n/a | — (identity; printed on report cover) | `text`, maxLength 160 | `text NOT NULL`; identity, versioned with profile |
| IP02 | Institution type | Required | Single select | **No** (MD-P1) | Informs mandate interpretation and assessor branching; no automatic score effect (`P0-4_Applicability_Rules`) | `single` cards | enum from methodology table |
| IP03 | Governance type (public/private/autonomous…) | Required | Single select | **No** (MD-P1) | — | `single` | enum |
| IP04 | State | Required | Dropdown | Reference data, not in workbook | — (geography context; see IP06) | **new `dropdown`**, searchable | FK to `ref_state` |
| IP05 | District | Required | Dropdown (depends on IP04) | Reference data | — | **new `dropdown`**, dependent on IP04 | FK to `ref_district` |
| IP06 | Location (rural / semi-urban / urban / metro) | Required | Single select | Values listed in `Context_Calibration` geography examples: rural, semi-urban, urban, metro, aspirational district — confirm set (MD-P1) | Geography → access/industry/infrastructure context; branching and sampling only | `single` | enum |
| IP07 | Year established | Required | Number | n/a | — | **new `number`**, integer, 4 digits | `smallint` |
| IP08 | Students (headcount) | Required | Number | n/a | Scale → proportional sampling and evidence design (`Context_Calibration`); band examples `<2k / 2–10k / 10–25k / >25k` — reconciliation with exact count is MD-P4 | **new `number`** with precision flag (exact/approximate) | `integer`; scale band derived server-side |
| IP09 | Faculty (headcount) | Required | Number | n/a | — | `number` | `integer` |
| IP10 | Active programmes | Required | Number | n/a | Also D01-D01 denominator (Part C) — single source, do not collect twice | `number` | `integer` |
| IP11 | UG programmes | Required | Number | n/a | — | `number` | `integer` |
| IP12 | PG programmes | Required | Number | n/a | — | `number` | `integer` |
| IP13 | Doctoral programmes | Optional | Number | n/a | — | `number` | `integer NULL` |
| IP14 | Major disciplines | Required | Multi-select | **No** at profile level; a discipline list exists in `D03_Discipline_Library` — confirm reuse (MD-P1) | Gates the D03 discipline / non-technical pathway (`D03_NonTechnical_Pathway`) | `multi` chips | join table |
| IP15 | Research intensity | Required | Single select | `Context_Calibration`: teaching-led / balanced / research-intensive; `P0-8_Profile_Form` shows a 1–5 scale — which set applies is MD-P6 | Activates research-related depth; context calibration | `single` (discrete levels, **not** the current `scale5`) | enum; level only, never a factor |
| IP16 | Annual expenditure band | Required | Range | **Boundaries not defined** (MD-P2) | Resource envelope → evidence-burden multiplier only (`P0-4_Evidence_Burden`); never maturity standards | `band` | enum band |
| IP17 | Technology / IT expenditure band | Required | Range | **Boundaries not defined** (MD-P2) | As IP16 | `band` | enum band |
| IP18 | Research funding band | Optional | Range | **Boundaries not defined** (MD-P2) | As IP16 | `band` | enum band NULL |
| IP19 | Industry engagement | Required | Single select | **No** (MD-P1) | — | `single` | enum |
| IP20 | Innovation / incubation ecosystem | Required | Single select | **No** (MD-P1) | — | `single` | enum |
| IP21 | Student catchment | Required | Multi-select | **No** (MD-P1) | Component of Student Profile Complexity (`Context_Calibration`); composition rule MD-P5 | `multi` | join table |
| IP22 | Student mobility pattern | Required | Multi-select | **No** (MD-P1) | Component of Student Profile Complexity; MD-P5 | `multi` | join table |
| IP23 | Institutional mandate | Required | Multi-select | Levels in `P0-4_Context_Factors`: Teaching-intensive, Broad teaching + research, Research-intensive, Professional/regulated, Specialist | Required-maturity factor (`P0-4_Context_Factors`); cardinality/factor resolution when multi-valued is MD-P3 | `multi` today; control finalised after MD-P3 | store selected level(s) only; factors live in methodology tables |
| IP24 | Residential model | Required | Single select | **No** (MD-P1) | Component of Student Profile Complexity; MD-P5 | `single` | enum |
| IP25 | International exposure | Optional | Single select | **No** (MD-P1) | — | `single` | enum NULL |

### B1. The ten P0-8 context concepts and how they relate to IP01–IP25

`P0-8_Profile_Form` lists ten required context concepts. Their relationship to the 25 fields, as the workbooks state it:

| Context concept | Fed by | Engine use stated | Representation issue in current prototype |
|---|---|---|---|
| Institution Type | IP02 | Mandate interpretation, branching | Prototype options are provisional |
| Mandate | IP23 | Required-maturity factor | Multi-select vs graded single level (MD-P3) |
| AI Exposure | Separate input (levels Low/Moderate/High/Critical in `P0-4_Context_Factors`) | Required-maturity factor | Prototype uses 1–5 scale; cannot be mapped without inventing (MD-05) |
| Disciplinary Consequence | Separate input (Low/Moderate/High/Critical) | Required-maturity factor | Same |
| Trajectory | Separate input (Declining/Stable/Transforming/High-growth) | Required-maturity factor | Same; "Declining" absent from prototype |
| Scale | IP08 | Sampling / evidence design | Bands differ (MD-P4) |
| Geography | IP04–IP06 | Access/industry/infrastructure context | Prototype captures world region only |
| Resource Envelope | IP16–IP18 | Evidence burden only | Prototype merges into one band |
| Research Intensity | IP15 | Research depth | Scale vs 3 levels (MD-P6) |
| Student Profile Complexity | IP21, IP22, IP24 (+ digital access, first-generation per `Context_Calibration`) | Support-need context | Prototype uses one subjective scale; derivation rule MD-P5 |

Also required by `P0-4_Context_Profile` / `P0-4_Context_Rationale` and absent from the prototype: **context rationale** for every non-default level (assessor-documented, assessor-approved, second review for overrides) and **context completeness** (server-derived; "missing context cannot be used as a default"; profile precedes scoring — P0-8 gate).

### B2. Not in any workbook — do not build until defined (MD-P9)

Affiliation / system relationship, external institutional identifier (AISHE/UDISE/registration), accreditation body/grade, campus count.

### B3. Frontend changes needed (additive, no redesign)

1. Extend `ProfileFieldType` with `number` (integer, min/max, optional precision flag) and `dropdown` (searchable; `dependsOn` field id; options fetched from a reference endpoint).
2. Replace `scale5` for AI exposure, disciplinary consequence, trajectory, research intensity with discrete `single` levels once the level sets are confirmed.
3. Split `resourceEnvelope` into IP16/IP17/IP18 `band` fields.
4. Add IP03–IP07, IP09–IP14, IP19–IP22, IP24, IP25 as fields in the served form definition.
5. Add an optional bounded `short_text` "context rationale" beneath any field whose level is non-default (the default per field is methodology data; the frontend only displays the flag the backend returns).
6. Grow the wizard from 4 to 7 steps (Part D). Step list, autosave, completeness and stage gate are already generic.

### B4. Backend / database requirements

- `institution_profile` (versioned, append-only history; one current row per assessment) with the 25 columns typed as above, plus `profile_version`, `captured_at`, `captured_by`.
- `institution_profile_context` — the ten context levels (selected level codes only), `is_default` per level, `rationale`, `rationale_by`, `approved_by`, `second_review_status`. Factors, baselines `B_d` and required-maturity computation live in versioned methodology tables and the scoring engine, never in the profile row.
- Reference tables: `ref_state`, `ref_district(state_id)`, and one methodology-owned option table per enumerated field.
- `context_completeness` computed server-side and exposed in `AssessmentStatusView`; the `profile` stage cannot be marked complete until it is `complete`.

---

# Part C — Institutional Data: all 23 D01–D03 items

Source: workbook sheets `Institutional_Data`, `D01_Institutional_Data`, `D02_Institutional_Data`, `D03_Institutional_Data`. `Assessment_Input_Architecture` defines this as a distinct input layer ("numbers, coverage, frequency, programme/faculty/student counts") feeding metrics and ratios. The workbooks label each item `Source-defined` and define **no numeric validation rules**. Where a structural check is listed below it is marked **PROPOSED** and must be confirmed before it can reject input.

Common to every item:

- **Type / control:** non-negative integer; `number` control with precision flag (`exact | approximate | partly_known`) and explicit states `provided | not_sure | not_provided | not_applicable_requested` (N/A requires reason; assessor accepts/rejects). Not sure ≠ zero ≠ N/A ≠ not answered.
- **Collection timing:** **MD-P10** — the workbooks do not say where these are collected. The prototype audit recommends a "Domain data" step at the entry of each domain (D01 items before D01 prompts, etc.), separate from the Institution Profile; IP10 (active programmes) is captured once in the profile and reused as D01-D01.
- **Frontend:** a new `InstitutionalDataStep` presentation rendered by the existing prompt framework (`numbers` kind with per-item state) — no new route.
- **Backend / DB:** `institutional_data_item(assessment_id, item_id, value integer NULL, state, precision, reason, captured_at, captured_by, reviewed_by, review_decision)`; append-only history.
- **Evidence:** the workbooks attach evidence to metrics, not to these counts. Where a metric that consumes an item is evidence-gated, the item's supporting document (programme register, tool inventory, policy register, competency dataset) is requested through the normal evidence-request flow. No item-level evidence rule is defined.

| ID | Item | Req. | Domain purpose (as far as the workbook states) | PROPOSED structural check |
|---|---|---|---|---|
| D01-D01 | Active programmes | Required | Denominator for programme-coverage ratios; = IP10 | ≥ 0; single source with IP10 |
| D01-D02 | Programmes reviewed in last 3 years | Required | Programme future-review coverage | ≤ D01-D01 |
| D01-D03 | Programmes where AI / future implications were considered | Required | Programme future-review coverage | ≤ D01-D02 |
| D01-D04 | Programmes modified due to AI / employment changes | Optional | Strategic translation | ≤ D01-D01 |
| D01-D05 | Material AI / future strategic decisions in last 18 months | Required | Strategic translation / decision cadence | ≥ 0 |
| D01-D06 | AI pilots conducted in last 24 months | Required | Strategic experimentation | ≥ 0 |
| D01-D07 | AI pilots formally evaluated | Required | Institutional learning rate | ≤ D01-D06 |
| D01-D08 | AI pilots scaled | Optional | Institutional learning rate | ≤ D01-D07 |
| D01-D09 | AI pilots stopped after evaluation | Optional | Institutional learning rate | ≤ D01-D07 |
| D02-D01 | Approved AI tools | Required | Governance coverage denominator | ≥ 0 |
| D02-D02 | Approved tools processing personal / student data | Required | Data governance readiness | ≤ D02-D01 |
| D02-D03 | Data / privacy reviewed tools | Optional | Data governance readiness | ≤ D02-D02 |
| D02-D04 | Consequential AI use cases with named human override | Optional | Human accountability | ≥ 0 |
| D02-D05 | Approved AI governance policies / guidelines | Required | Governance ownership / effectiveness | ≥ 0 |
| D02-D06 | Governance policies reviewed in last 12 months | Optional | Governance effectiveness | ≤ D02-D05 |
| D03-D01 | Programmes with explicit graduate capability framework | Required | Human capability development coverage | ≤ D01-D01 |
| D03-D02 | Programmes using project / case / practical learning | Optional | Capability demonstration | ≤ D01-D01 |
| D03-D03 | Programmes requiring unfamiliar / ambiguous problem solving | Optional | Transfer capability | ≤ D01-D01 |
| D03-D04 | Programmes with explicit AI verification activity | Optional | AI verification capability | ≤ D01-D01 |
| D03-D05 | Programmes with interdisciplinary AI learning | Optional | Interdisciplinary capability | ≤ D01-D01 |
| D03-D06 | Non-technical programmes with explicit AI capability outcomes | Required where applicable | Non-technical AI capability (applicability from IP14 / D03 pathway) | ≤ D01-D01; N/A only via applicability rule |
| D03-D07 | Students with competency outcome data | Optional | Assessment validity / competency evidence | ≤ IP08 |
| D03-D08 | Students meeting defined competency threshold | Optional | Assessment validity | ≤ D03-D07 |

Domain totals: D01 = 9 (6 required, 3 optional), D02 = 6 (3 required, 3 optional), D03 = 8 (2 required, 1 required-where-applicable, 5 optional).

---

# Part D — Recommended profile and institutional-data UX

Uses the existing design language (`PageHeader`, `StepList`, `AnswerCardGroup`, `SegmentedControl`, `ChipGroup`, `Field`, `Panel`) and the structured-first rule. Free text appears only as bounded `short_text`.

## D1. Institution Profile — seven steps

| Step | Fields | Controls |
|---|---|---|
| 1 Identity | IP01, IP02, IP03, IP07 | text; single cards; single cards; number |
| 2 Location | IP04, IP05, IP06 | dropdown; dependent dropdown; single cards |
| 3 Scale & academic character | IP08, IP09, IP10, IP11, IP12, IP13, IP14 | numbers with precision flag (one compact numeric grid); multi chips |
| 4 Research & resources | IP15, IP16, IP17, IP18 | single (discrete levels); three band selectors |
| 5 Engagement & ecosystem | IP19, IP20, IP25 | single cards |
| 6 Student profile | IP21, IP22, IP24 | multi chips; multi chips; single cards |
| 7 Mandate & AI context | IP23 + AI exposure, disciplinary consequence, trajectory (discrete levels) | multi/single per MD-P3; single cards with level descriptions |

Rules: each step shows the existing "context never gives a score advantage or disadvantage" note; a bounded "why this level?" `short_text` (≤200) appears under a field only when the backend flags the selection as non-default; completeness per step is displayed from backend `context_completeness`; the wizard remains fully driven by `GET /methodology/profile-form`, so step composition can change without frontend work.

## D2. Domain data step

At the entry of each of D01, D02, D03 the runner shows a single "A few figures about your institution" screen: a compact numeric grid of that domain's items, each row with value, precision flag, and a `Not sure` / `Does not apply` control (the latter opening the existing reason picker). Items already known (IP10 → D01-D01) are pre-filled and read-only. Optional items are labelled Optional. The step saves through `PUT /assessments/{id}/institutional-data/{domainCode}` and then hands over to `getNextPrompt`.

## D3. Assessor additions

Context page gains: the ten levels with default markers, rationale text, approve / request-change actions, second-review state for overrides; institutional-data review with N/A adjudication. No score inputs appear on these pages.

---

# Part E — ARUI Assessment Report (PDF) specification

Audience: Vice-Chancellor / executive board / academic council. Purpose: a serious institutional-intelligence document, not a certificate. One report renders exactly one score run under one immutable methodology version.

Reference artefacts in this repository:

- `docs/samples/ARUI_Sample_Assessment_Report.pdf` — 20-page design reference rendered from mock data, watermark-free but banner-marked "SAMPLE · MOCK DATA" on every page.
- `docs/samples/report-payload.sample.json` — illustrative payload exercising every field of the contract. **All numbers are invented and are not methodology outputs.**
- `docs/samples/report_sample_generator.py` — the layout as executable specification (Python/reportlab). The production stack is free; section order, labels, and bindings are the requirement.

## E1. Section order and content

| # | Section | Content and data binding (Part F field) |
|---|---|---|
| 0 | Cover | Product name, "Preliminary ARUI Assessment Report", institution name, identity line (type · governance · district, state · established), status banner chip (`report.statusBanner`), meta grid (assessment id, report id, period, methodology version, score run, status, generated, audience), confidentiality line, "Not a certification engine" line, 11-dot coverage mark (3 filled) |
| 1 | Report information | `assessment.*`, `report.*`, contributors, assessors, "How to read this report" (current vs required maturity, transformation distance, evidence confidence, cross-domain = diagnostic), coverage callout, contents |
| 2 | Executive summary | `executiveSummary.headline/narrative`, four tiles (coverage 3 of 11, weighted coverage, average evidence confidence, evidence coverage), domain positions table, key strengths, priority gaps; caption "narrative is assessor-authored" |
| 3 | Institutional context & profile | `institution.profile` groups in two columns; profile completeness callout; band/option provisionality note |
| 4 | Scope & coverage | All 11 domains; assessed rows "Assessed", others "Not yet assessed" with no numbers; metrics in scope; weighted coverage; note that weights are provisional |
| 5 | Overall ARUI position | Current-vs-required maturity chart (0–5 with workbook labels Absent…Adaptive), tiles: overall /100 **withheld** with `withheldReason` (MD-08), weighted coverage, evidence confidence, confidence band **not reported** (MD-06); "reading transformation distance" |
| 6.n | Domain result (one per assessed domain) | Tiles: current maturity, required maturity + source, distance, domain score + P0-3 status, evidence confidence + coverage; metric summary line; capability positions (Derived_Outputs labels, score bar, status, E-level); strengths; gaps; claims awaiting evidence + the standing evidence sentence; institutional data supplied with states; assessor observation |
| 7 | Cross-domain dependencies & contradictions | Computable rules (CD01, CD02 in D01–D03 scope), contradictions, dependency gaps, coherence diagnostics, mandatory callout "Score effect: none" |
| 8 | Validation, evidence & verification | Tiles (items submitted vs 8–12 target, accepted, claims awaiting evidence, verification status); validation flags; N/A decisions; calibration summary; evidence register (type, period, domains, status, E-level, temporal validity) |
| 9 | Assessor observations & priority areas | Observations (author, date, scope); ranked priority areas with reason |
| 10 | Recommended actions | Grouped by horizon: next 90 days · within 12 months · longer-term; each with linked gap, domains, suggested owner |
| 11 | Methodology note | Version, plain-language paragraphs, scoring in brief (no formulas), maturity scale table |
| 12 | Limitations & provisional status | `limitations[]` incl. partial coverage, preliminary status, withheld overall, confidence band pending, unvalidated claims, pre-pilot methodology, public benchmark blocked |
| 13 | Reassessment | Recommended window, triggers, next steps, remaining domains for full scope |

Mandatory sentences (verbatim): "Missing evidence does not automatically reduce capability. Where the methodology requires evidence for a particular claim, that claim may remain unvalidated until sufficient evidence is available." · "Evidence strengthens confidence in your position." · "Assessment coverage: 3 of 11 domains" · "Preliminary — D01–D03 assessed".

Never printed in the institution copy: metric IDs, weights, formulas, anchors, thresholds, rule names beyond CD-rule ids, calibration factors.

## E2. Visual design

- **Format:** A4 portrait, 18 mm margins; header band (navy) with running title + status chip + sample chip; footer with report id, methodology version, confidentiality, page number.
- **Type:** Newsreader (display/serif) for titles, tile values and ledes; IBM Plex Sans for body, tables and labels. Body 9 pt / 13 pt leading; table cells 8.2 pt; eyebrows 7.2 pt uppercase letter-spaced.
- **Palette (print equivalents of `src/styles.css` tokens):** navy `#283552`, navy-deep `#1A2440`, blue `#3F66A8`, teal `#3F8A8F`, amber `#C88F3A`, rose `#B5484F`, ivory `#FBFAF6`, ivory-deep `#F3F1EA`, ink `#22283A`, slate `#5C6270`, border `#E1DDD3`. Status: STRONG teal, DEVELOPING blue, PRIORITY amber, NOT SCORED slate; each with a soft tint.
- **Components:** eyebrow + serif H1 + rule; KPI tiles (label / serif value / sub-line); data tables with a navy header rule and hairline rows, zebra ivory; score bars (0–100) tinted by status; maturity chart (bars = current, teal tick = required); callouts with a 2 pt coloured left rule (blue = information, teal = coverage/positive, amber = withheld/pending decision, navy = assessor voice).
- **Tone:** restrained, no icons, no gradients, no decorative imagery; whitespace and hierarchy carry the document.
- **Sample marking:** any render from mock data carries the amber "SAMPLE · MOCK DATA" chip on every page. Production removes the chip and prints `report.kind` ("Preliminary" / "Verified") in its place.

## E3. Generation options for production

1. Server-side HTML → PDF (Playwright/Chromium or Puppeteer) from a React print route that consumes `AssessmentReportPayload` — reuses the design tokens directly. Recommended.
2. Server-side reportlab / PDFKit port of `report_sample_generator.py`.
3. Frontend print view of the same payload (`/intelligence/report`) for screen use, with server PDF for distribution.

In every option the payload is produced by the backend from the stored score run; the renderer computes nothing.

---

# Part F — Report API payload contract

`src/api/report-types.ts` — `AssessmentReportPayload`. Endpoint: `GET /assessments/{id}/report/preliminary` (and `/verified` once a verification run is accepted). Response is one JSON document per score run; regenerating a report for the same `scoreRunId` must be byte-identical.

```
AssessmentReportPayload
├─ report            ReportMeta            id, kind, generatedAt, methodologyVersion, scoreRunId, templateVersion, statusBanner, confidentiality, audience
├─ institution       ReportInstitution     id, name, identity{institutionType, governanceType, state, district, location, yearEstablished}, profile: ReportProfileGroup[] (IP01–IP25 as labels), profileCompleteness
├─ assessment        ReportAssessment      id, status, periodStart, periodEnd, submittedAt, contributors[], assessors[{name, role lead|second|adjudicator}]
├─ scope             ReportScope           assessedDomains, totalDomains: 11, weightedDomainCoverage, domains[{code,name,inScope,metricCount}], coverageStatement
├─ executiveSummary  ReportExecutiveSummary headline, narrative, keyStrengths[], priorityGaps[] (ReportFinding), authoredBy: "assessor"
├─ overall           ReportOverallPosition arui100 | null, withheldReason, weightedDomainCoverage, averageEvidenceConfidence, confidenceBand | null, evidenceCoverage, domainPositions[], narrative
├─ domains[]         ReportDomainSection   code, name, domainScore, status, currentMaturity, requiredMaturity, requiredMaturitySource, transformationDistance, confidence{…, levelDistribution E0–E4}, metricSummary{…}, capabilities[], strengths[], gaps[], unvalidatedClaims[], institutionalData[{id,item,value,state}], assessorObservation
├─ crossDomain       ReportCrossDomain     computableRules, incompleteRuleCount, dependencies[], contradictions[], coherence[], scoreEffect: "NO DIRECT SCORE EFFECT"
├─ validation        ReportValidation      flags[], notApplicableDecisions[], overrides[], calibration{doubleScoredMetrics, agreed, adjudicated}, verificationStatus
├─ evidence          ReportEvidence        coreTarget{min,max}, counts{…}, levelDistribution, items[{title,type,period,status,level,domainCodes,temporalValidity}], unvalidatedClaimCount, stance
├─ assessorObservations[] ReportObservation domainCode | null, text, author, date
├─ priorities        ReportPriorities      areas[{rank, area, domainCode, reason}], actions[{horizon 90_days|12_months|longer_term, title, detail, domainCodes, linkedGap, suggestedOwner}], authoredBy: "assessor", note
├─ methodologyNote   ReportMethodologyNote version, paragraphs[], scoringSummary[], maturityScale[{level,label,meaning}]
├─ limitations       string[]
└─ reassessment      ReportReassessment    recommendedWindow, triggers[], nextSteps[], remainingDomains[]
```

Contract rules:

- Capability score, evidence confidence, context calibration (required maturity), transformation distance and cross-domain diagnostics are separate fields and must be produced by separate engine stages. No field is derived from another in the renderer.
- `DomainScoreStatus` follows P0-3: ≥80 STRONG, ≥60 DEVELOPING, otherwise PRIORITY, blank NOT SCORED.
- `overall.arui100` is `null` with `withheldReason` until MD-08 is decided; `confidenceBand` is `null` until MD-06 is decided. The renderer must display "Withheld" / "Not reported" and never compute a substitute.
- `institution.profile` carries labels, never codes or factors. `institutionalData[].state` preserves `provided | not_provided | not_applicable_accepted | not_sure`.
- Narrative fields (`executiveSummary`, `strengths/gaps` bodies, observations, priorities, actions) are assessor-authored and stored against the score run; the engine never generates prose.
- Unassessed domains appear only in `scope.domains` and `reassessment.remainingDomains` — never in `overall.domainPositions` or `domains[]`.

Backend storage: `report(id, assessment_id, score_run_id, kind, template_version, payload jsonb, generated_at, generated_by)`; immutable once generated; PDF stored in object storage keyed by report id.

---

# Part G — Provisional option lists (not workbook-defined)

All are flagged `provisionalOptions: true` in the contract and shown to respondents as provisional. The methodology team must confirm or replace each and define any answer-choice → M/I/O mapping (MD-01). Defined in `src/api/mock/content.ts`:

1. Pulse screening scales (s-01…s-05) · 2. Actors / roles · 3. Time bands · 4. Consistency scale · 5. Institutional assumptions (D01 ranked top-5) · 6. Decision areas, nature-of-change, drivers (D01) · 7. Process-step actions (D01 foresight→action; D02 approval) · 8. Threatened-programme scenario first actions / initiators / mechanisms (D01) · 9. Institutional value categories and demonstration locations (D01) · 10. Bases of authority for deployment approval (D02) · 11. Governance policy types (D02 matrix rows) · 12. Consequential AI decision types (D02) · 13. Harmful-incident response actions, actors, learning mechanisms (D02) · 14. External system types, due-diligence and monitoring activities (D02) · 15. Verification / challenge activities and locations (D03) · 16. Capability demonstration modes (D03) · 17. Non-technical discipline catalogue (D03) · 18. Evidence-basis options (D03 ranked top-3) · 19. Risk-register options (targeted follow-ups) · 20. Evidence types and scopes · 21. "Does not apply" reason categories · 22. Precision flags and explicit "none" states (d01-02, d02-08, d03-05).

Profile-level lists still to be supplied (Part B, MD-P1): IP02, IP03, IP06, IP14, IP19, IP20, IP21, IP22, IP24, IP25; band boundaries IP16–IP18 (MD-P2).

Workbook-derived and therefore **not** provisional: canonical D01–D11 names; D03 graduate-capability list; maturity levels 0–5 (Absent, Reactive, Emerging, Structured, Integrated, Adaptive); evidence levels E0–E4; P0-3 status thresholds; mandate levels; AI exposure / consequence / trajectory levels; prompt wording and IDs; the 25 profile fields; the 23 institutional-data items.

---

# Part H — Unresolved methodology decisions (consolidated register)

None of these may be resolved by either engineering team. Each needs a written methodology decision, versioned with the workbook.

**Engine / measurement (from the methodology map and prior handoff)**

| ID | Decision |
|---|---|
| MD-01 | Answer-choice → construct (M/I/O) mappings for every provisional catalogue |
| MD-02 | Blank outcome vs outcome-N/A semantics |
| MD-03 | Screening / branch thresholds that open targeted follow-up prompts |
| MD-04 | Evidence trigger threshold — when the engine requests evidence for a claim |
| MD-05 | Profile level → context-calibration mapping (replaces the prototype 1–5 scales) |
| MD-06 | Confidence-band formula (E-levels + coverage → low/moderate/high) |
| MD-07 | Corroboration adjustment rule for multiple evidence items on one claim |
| MD-08 | Partial-scope overall presentation (whether/how an overall /100 is shown on 3 of 11 domains) |
| MD-09 | Response-state semantics — how `not_sure` / `not_answered` enter scoring; unknown never becomes zero |
| MD-10 | Respondent-facing maturity labels |
| MD-11 | Pulse equivalence — whether screening answers may substitute for domain responses |
| MD-12 | Future-exposure scale definition and its use in required maturity |

**Profile / institutional data (from the completeness audit)**

| ID | Decision |
|---|---|
| MD-P1 | Option catalogues for IP02, IP03, IP06, IP14, IP19–IP22, IP24, IP25 |
| MD-P2 | Band boundaries for IP16, IP17, IP18 |
| MD-P3 | Mandate cardinality (single graded level vs multi) and factor resolution if multi |
| MD-P4 | Scale bands (`<2k/2–10k/10–25k/>25k` vs prototype bands) and whether exact IP08 supersedes bands |
| MD-P5 | Whether Student Profile Complexity is respondent input or derived from IP21/IP22/IP24 (+ digital access, first-generation) |
| MD-P6 | Research intensity level set (IP15 three levels vs P0-8 1–5) |
| MD-P7 | Geography representation and whether ARUI is India-scoped or international |
| MD-P8 | Domain baselines `B_d` and sensitivity coefficients for required maturity |
| MD-P9 | Whether affiliation / external identifier / accreditation / campus count belong in the profile at all |
| MD-P10 | Where the 23 institutional-data items are collected (profile, domain entry, assessor) |

**Report**

| ID | Decision |
|---|---|
| MD-R1 | Whether domain weights may be printed while `P0-3` marks them provisional |
| MD-R2 | Whether any institution-facing copy may show metric-level rows (currently: capability labels only) |
| MD-R3 | Verified-report differences beyond `kind` and status banner |

---

# Part I — Lovable dependencies, replacement points, limitations, debt

## I1. Lovable / Supabase / Cloud

Verified: **no** `@supabase/*` dependency, no `src/integrations/`, no `src/routes/api/`, no database, no server functions, no secrets read by the frontend.

| Item | Removal |
|---|---|
| `@lovable.dev/vite-tanstack-config` (used in `vite.config.ts`) | Replace with plain Vite config wiring `@tanstack/react-start/plugin/vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths`, `@` alias; choose a Node deploy target |
| `src/lib/lovable-error-reporting.ts` + its two references in `__root.tsx` | Delete |
| `src/lib/error-capture.ts`, `error-page.ts`, `src/server.ts`, `src/start.ts` | Generic TanStack Start code; safe to keep |
| `.lovable/`, `.workspace/`, `AGENTS.md`, `roadmap.md`, `bunfig.toml` | Delete freely |

## I2. Replacement points (in order)

1. Implement the endpoints in A5 (existing + new). Paths differ? Edit `src/api/http.ts` only.
2. DTO changes go through `src/api/types.ts` / `report-types.ts`; prefer generating both from OpenAPI.
3. Serve the full 25-field profile form; add `number` and `dropdown` field types (B3).
4. Add the institutional-data step (D2) and endpoint.
5. Implement signed-URL evidence upload and extend `createEvidence`.
6. Decide auth transport (bearer as-is, or cookies by editing `http.ts` only). Remove `LoginRequest.roleHint`.
7. Set `VITE_ARUI_API_BASE_URL`; walk both journeys; delete `src/api/mock/` and the fallback in `client.ts`.
8. Build the report renderer against `AssessmentReportPayload`; validate with `docs/samples/report-payload.sample.json`.

## I3. Known limitations (baseline)

Only D01–D03 assessed; adaptive routing is simulated; results and context are fixed fixtures; uploads are metadata only; session trusted from localStorage; no 401/refresh/retry; no multi-user permissions in UI; English only; no accessibility audit; desktop/tablet first; no in-app PDF export (the sample PDF is generated offline from mock JSON).

## I4. Technical debt

No automated tests; large throwaway mock files; `PromptResponse.value` is `unknown` without runtime validation (zod available); `roleHint` in a production contract; `getSession()` not server-validated; mixed autosave/explicit-save semantics; no error taxonomy in `http.ts`; unused shadcn components; unused `narrative` field type; `report-types.ts` not yet consumed by any route.

---

# Part J — Production implementation order

1. **Methodology decisions** — resolve MD-P1…P10 and MD-01…12 that gate the profile and scoring (at minimum MD-P1–P6, MD-01, MD-05, MD-06, MD-08, MD-09).
2. **Contract freeze** — publish `types.ts` + `report-types.ts` as OpenAPI; generate clients from then on.
3. **Methodology data model** — versioned, immutable tables loaded from the workbooks: domains, metrics, measurement paths, anchors, context factors, baselines, evidence rules, cross-domain rules, option catalogues, reference data (states/districts).
4. **Auth and tenancy** — accounts, roles (institution_admin, contributor, viewer, assessor), institution scoping, server-side authorisation on every endpoint.
5. **Institution Profile service** — 25 fields, context levels, rationale, completeness, versioning; profile precedes scoring (P0-8 gate).
6. **Assessment runtime** — lifecycle, prompt sequencing with real adaptive routing (≤30 screening probes), institutional-data capture, response persistence with four states, append-only history.
7. **Evidence service** — upload, scanning, retention, status transitions, engine-owned mapping, temporal validity, 8–12 core sampling.
8. **Scoring engine** — deterministic M/I/O, applicability, required maturity, transformation distance (diagnostic), evidence confidence (separate), cross-domain diagnostics (never score-modifying); tests only against explicit workbook examples.
9. **Assessor workflow** — review states, N/A adjudication, overrides with second review, calibration, score runs, execution log.
10. **Report service** — payload assembly per score run, assessor-authored narrative capture, renderer (E3), immutable storage.
11. **Frontend cutover** — staging API, both journeys, delete mock.
12. **Hardening** — contract tests, error taxonomy, accessibility audit, deployment target, pilot.

---

*Lovable development phase closed. Frontend baseline frozen. No D04–D11, no production backend, no database, no Cloud dependency, no methodology decisions taken. Methodology remains owned by the ARUI workbooks.*
