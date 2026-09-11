# ARUI — Institution Profile Data-Completeness Audit

Audit only. No application code was added, removed or modified for this document.

**Sources of truth**
- Methodology workbooks (uploaded): `P0-4_CONTEXT_REQUIRED_MATURITY_ENGINE.xlsx`, `P0-8_ASSESSMENT_EXECUTION_ADAPTIVE_ENGINE.xlsx` (P0-8 is cumulative and carries all earlier sheets).
  Sheets used: `Institution_Profile` (IP01–IP25), `Institutional_Data` (D01/D02/D03 numeric items), `Assessment_Input_Architecture`, `Context_Calibration`, `P0-4_Context_Profile`, `P0-4_Context_Factors`, `P0-4_Applicability_Rules`, `P0-4_Methodology`, `P0-4_Evidence_Burden`, `Dxx_Institutional_Data`.
- Current codebase: `src/api/mock/content.ts` (`profileForm`), `src/api/types.ts` (profile contracts), `src/api/mock/index.ts` (seed profile + persistence), `src/api/client.ts` / `src/api/http.ts` (API surface), `src/routes/_workspace.profile.tsx` (UI).

**Headline finding.** The current Institution Profile implements the ten P0-4 context-calibration variables (with two representation deviations) and one identity field. It does **not** implement the 25-field `Institution_Profile` register (IP01–IP25) from P0-8, and it does not implement the `Institutional_Data` numeric baseline at all. The profile is a context-calibration screen, not the full institutional data architecture.

---

## A. Institution identity / basic information

Methodology register: `Institution_Profile` sheet, IP01–IP25 (present identically in P0-4 and P0-8 workbooks).

| ID | Methodology field | Input | Requirement | Current UI | Current TS/data | Mock data | API | Status |
|---|---|---|---|---|---|---|---|---|
| IP01 | Institution name | Text | Required | Yes — `name` (`content.ts` step `identity`) | `ProfileValues["name"]` (untyped record) | Seeded | via `getProfile`/`saveProfile` | COMPLETE |
| IP02 | Institution type | Single select | Required | Yes — `institutionType` | Generic record key | Seeded `comprehensive` | Yes | COMPLETE (option list is prototype-provisional, not the workbook list) |
| IP03 | Governance type (ownership/status: public/private/autonomous etc.) | Single select | Required | No | No | No | No | MISSING |
| IP04 | State | Dropdown | Required | No | No | No | No | MISSING |
| IP05 | District | Dropdown | Required | No | No | No | No | MISSING |
| IP06 | Location (rural / semi-urban / urban / metro) | Single select | Required | No — only a coarse world-region `geography` multi-select | No | Region only | Region only | PARTIAL |
| IP07 | Year established | Number | Required | No | No | No | No | MISSING |
| IP08 | Students (headcount) | Number | Required | Band only (`scale`) | Band string | Band | Band | PARTIAL — methodology requires an exact number |
| IP09 | Faculty | Number | Required | No | No | No | No | MISSING |
| IP10 | Active programmes | Number | Required | No | No | No | No | MISSING |
| IP11 | UG programmes | Number | Required | No | No | No | No | MISSING |
| IP12 | PG programmes | Number | Required | No | No | No | No | MISSING |
| IP13 | Doctoral programmes | Number | Optional | No | No | No | No | MISSING |
| IP14 | Major disciplines | Multi-select | Required | No (a discipline catalogue exists only inside D03 prompts) | No | No | No | MISSING |
| IP15 | Research intensity | Single select | Required | Yes — `researchIntensity` (1–5 scale) | Number | Seeded 3 | Yes | PARTIAL — scale, not the workbook's teaching-led / balanced / research-intensive select |
| IP16 | Annual expenditure band | Range | Required | Collapsed into one `resourceEnvelope` band | Single band | Seeded `medium` | Yes | PARTIAL |
| IP17 | Technology/IT expenditure band | Range | Required | No | No | No | No | MISSING |
| IP18 | Research funding band | Range | Optional | No | No | No | No | MISSING |
| IP19 | Industry engagement | Single select | Required | No | No | No | No | MISSING |
| IP20 | Innovation/incubation ecosystem | Single select | Required | No | No | No | No | MISSING |
| IP21 | Student catchment | Multi-select | Required | No | No | No | No | MISSING |
| IP22 | Student mobility pattern | Multi-select | Required | No | No | No | No | MISSING |
| IP23 | Institutional mandate | Multi-select | Required | Yes — `mandate` | Record key | Seeded `["broad"]` | Yes | COMPLETE |
| IP24 | Residential model | Single select | Required | No | No | No | No | MISSING |
| IP25 | International exposure | Single select | Optional | No | No | No | No | MISSING |

Additional identity concepts the audit brief lists that the workbooks **do not** define, and which must therefore not be invented: affiliation / system relationship, external institutional identifier (AISHE/UDISE/registration number), accreditation body/grade, campus count. Not present in `Institution_Profile` or elsewhere in P0-4/P0-8. Status: **NOT DEFINED — methodology decision required.**

Coverage of the identity register: 3 of 25 complete, 4 partial, 18 missing.

---

## B. P0-4 / P0-8 context profile (the ten calibration variables)

Methodology reference: `P0-4_Context_Profile` (the ten inputs), `P0-4_Context_Factors` (level values), `P0-4_Methodology` (how each is used), `Context_Calibration`.
All ten are required — `P0-4_Context_Profile` states "missing context cannot be used as a default".

Every field below is defined in `src/api/mock/content.ts` → `profileForm`, rendered generically by `src/routes/_workspace.profile.tsx` → `ProfileField`, typed only as `ProfileValues = Record<string, string | string[] | number | null>` in `src/api/types.ts`, seeded in `src/api/mock/index.ts` → `seedState()`, and exposed through `getProfile` / `saveProfile` in `src/api/client.ts` (HTTP shape in `src/api/http.ts`).

| # | Variable | Methodology requirement | Required? | UI field | TS/data field | Mock field | API | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | Institution Type | Informs mandate interpretation and assessor branching; no automatic score effect (`P0-4_Applicability_Rules`) | Yes | `institutionType`, single select | Untyped key | Yes | Yes | **COMPLETE** — option list is prototype-defined, not workbook-defined |
| 2 | Mandate | Level → factor: Teaching-intensive 0, Broad teaching + research 0.25, Research-intensive 0.5, Professional/regulated 0.5, Specialist 0.25 | Yes | `mandate`, **multi**-select | Untyped key (`string[]`) | Yes | Yes | **PARTIAL** — workbook expects one graded level per institution; multi-select produces a set with no defined factor resolution |
| 3 | AI Exposure | Low 0 / Moderate 0.25 / High 0.5 / Critical 0.75 | Yes | `aiExposure`, 1–5 scale | Number | Seeded `null` | Yes | **PARTIAL** — 5-point scale does not map onto the 4 defined levels |
| 4 | Disciplinary Consequence | Low 0 / Moderate 0.25 / High 0.5 / Critical 0.75 | Yes | `disciplinaryConsequence`, 1–5 scale | Number | Seeded `null` | Yes | **PARTIAL** — same 5-vs-4 level mismatch |
| 5 | Trajectory | Declining 0 / Stable 0.1 / Transforming 0.25 / High-growth 0.35 | Yes | `trajectory`, 1–5 scale | Number | Seeded `null` | Yes | **PARTIAL** — 5-point scale, and "Declining" has no representation on a stable→rapid axis |
| 6 | Scale | Proportional sampling and evidence design; examples `<2k / 2–10k / 10–25k / >25k` | Yes | `scale`, band | String | Yes | Yes | **PARTIAL** — bands are `<2k / 2–10k / 10–30k / 30–60k / >60k`, not the workbook bands; IP08 also requires an exact number |
| 7 | Geography | Access/industry/infrastructure context; example values rural / semi-urban / urban / metro / aspirational district; P0-4 sample value "India / mixed urban-regional" | Yes | `geography`, world-region multi-select | `string[]` | Yes | Yes | **PARTIAL** — captures continent, not the settlement-type dimension the engine uses (and not IP04/IP05 state/district) |
| 8 | Resource Envelope | Changes evidence-burden multiplier only (`P0-4_Evidence_Burden`); expenditure/funding bands | Yes | `resourceEnvelope`, 5 bands | String | Yes | Yes | **PARTIAL** — single subjective band replaces IP16/IP17/IP18 expenditure bands |
| 9 | Research Intensity | Teaching-led / balanced / research-intensive; activates research-related depth | Yes | `researchIntensity`, 1–5 scale | Number | Yes | Yes | **PARTIAL** — scale, not the 3 defined levels |
| 10 | Student Profile Complexity | Support needs/exposure: first-generation, commuter/residential, digital access | Yes | `studentProfileComplexity`, 1–5 scale | Number | Yes | Yes | **PARTIAL** — a single subjective scale replaces the composite (IP21 catchment, IP22 mobility, IP24 residential model) |

Also defined in `P0-4_Context_Profile` and **absent everywhere in the codebase**: `Context completeness` (a computed completeness state) and the governance rule that **non-default context selections require an assessor-documented rationale**. There is no rationale capture on the profile screen and no context-rationale surface in the assessor area (`src/routes/assessor.$id.context.tsx` shows engine output only). Status: MISSING.

Summary: 10 of 10 variables are present as *concepts*; 1 is faithfully complete, 9 are representationally partial because the UI uses 1–5 scales, world regions and merged bands where the workbook defines discrete named levels with numeric factors.

---

## C. Other institutional profile / baseline data

`Assessment_Input_Architecture` defines "Institutional Data — numbers, coverage, frequency, programme/faculty/student counts" as a distinct input layer feeding "metrics and ratios". The `Institutional_Data` sheet lists 23 numeric items for D01–D03 alone (plus `Dxx_Institutional_Data` sheets for D04–D11, out of scope).

**None of these exist in the codebase** — no UI, no type, no mock field, no API method. They are not part of `profileForm` and are not collected in the D01–D03 prompt flow.

| Item (sheet ID) | Requirement | Classification |
|---|---|---|
| Active programmes, UG/PG/doctoral counts, students, faculty (IP08–IP13) | Required | **1 — Required before assessment begins** (they are in the `Institution_Profile` register, marked Required) |
| Major disciplines (IP14) | Required | **1 — before assessment**; also gates the D03 discipline pathway (`D03_Discipline_Library`, `D03_NonTechnical_Pathway`) |
| D01-D01…D01-D09 (programmes reviewed, AI implications considered, programmes modified, strategic decisions, pilots conducted/evaluated/scaled/stopped) | 6 required, 3 optional | **2 — Required later, during D01** (domain-scoped ratio denominators) |
| D02-D01…D02-D06 (approved AI tools, tools processing personal data, reviewed tools, override coverage, policies, policies reviewed) | 3 required, 3 optional | **2 — Required later, during D02** |
| D03-D01…D03-D08 (programmes with capability frameworks, project learning, ambiguity, AI verification, interdisciplinary, non-technical AI outcomes, competency data) | 2 required, 1 conditional, 5 optional | **2 — Required later, during D03** |
| Expenditure / IT expenditure / research funding bands (IP16–IP18) | 2 required, 1 optional | **1 — before assessment** (drives evidence burden) |
| Industry engagement, innovation ecosystem, international exposure (IP19, IP20, IP25) | 2 required, 1 optional | **1 — before assessment** (context only; no defined engine consumer in D01–D03) |
| Student catchment, mobility, residential model (IP21, IP22, IP24) | Required | **1 — before assessment** (composite behind Student Profile Complexity) |
| Governance type, state, district, location, year established (IP03–IP07) | Required | **1 — before assessment** |
| Outcome signals; leadership judgement (`Assessment_Input_Architecture` layers) | Not itemised | **2 — later in the assessment**; already partially served by D01–D03 prompts |
| Context rationale for non-default selections | Required by `P0-4_Context_Profile` governance rule | **3 — backend/assessor, can be populated later** |
| Context completeness state | Required (missing context cannot default) | **3 — backend-derived** |
| Affiliation / system relationship, external institutional identifier, accreditation, campus count | Not in any workbook sheet | **5 — METHODOLOGY DECISION REQUIRED. Do not build until defined.** |
| Exact answer-option catalogues for IP02, IP03, IP06, IP14, IP19–IP22, IP24, IP25 and the band boundaries for IP16–IP18 | Fields defined, value lists not | **5 — METHODOLOGY DECISION REQUIRED** |
| Factor resolution when mandate is multi-valued | Not defined | **5 — METHODOLOGY DECISION REQUIRED** |
| D04–D11 institutional data | Out of scope this phase | **4 / deferred** |

---

## D. Frontend vs backend vs database vs assessor vs later stage

| Missing / partial item | Frontend | Backend/API | Database | Assessor UI | Later stage |
|---|---|---|---|---|---|
| IP03–IP07, IP09–IP14, IP16–IP22, IP24, IP25 (18 identity/context fields) | Yes — additional profile steps, all renderable by existing field types except state/district dropdowns and numeric inputs | Yes — `GET /profile-form` must serve them; `PUT /profile` must persist them | Yes — `institution_profile` columns/rows, versioned | Read-only view | No |
| State / district dropdowns (IP04, IP05) | New field type `dropdown` with dependent options | Reference-data endpoint | Reference tables | — | No |
| Numeric profile fields (IP07–IP13) | New field type `number` in `ProfileFieldType` | Validation | Integer columns | — | No |
| Exact student headcount vs band | Frontend + backend | Yes | Yes | — | No |
| Discrete levels for AI exposure / consequence / trajectory / mandate / research intensity (replacing 1–5 scales) | Frontend representation change only | Level→factor table stays server-side | Store selected level, never the factor | — | No |
| Settlement-type geography (rural/urban/metro) alongside region | Frontend | Backend | Database | — | No |
| Expenditure / IT / research funding bands (IP16–IP18) | Frontend | Backend | Database | — | No |
| Context rationale for non-default selections | Optional short field | Yes | Yes | **Yes — assessor must review and second-review overrides** | No |
| Context completeness computation | Display only | **Backend (authoritative)** | Derived/stored | Yes | No |
| Required-maturity computation `R_d = clamp(round(B_d + F_mandate + F_AI + F_consequence + F_trajectory))` | Never in frontend | **Backend** | Stored per score run | Yes | No |
| Institutional Data numeric items (D01/D02/D03, 23 items) | Frontend — but as a domain-stage data step, not the profile screen | Yes — new endpoints | Yes | Review + N/A handling | **Yes — collected during D01/D02/D03** |
| Evidence-burden multiplier from resource envelope | No | **Backend** | Stored | Yes | No |
| Outcome signals / leadership judgement layers | Existing prompt framework | Backend | Yes | Yes | Yes |

---

## E. Most important question

> **"Can the current frontend and data architecture accommodate the complete ARUI institutional profile without redesigning the application?"**

## **PARTIALLY**

**Why it is not a NO.** The architecture is the right shape and nothing structural has to be thrown away:
- The profile screen is fully data-driven. `src/routes/_workspace.profile.tsx` renders whatever steps and fields the API returns; adding IP03–IP25 requires no route or layout work.
- `ProfileValues` is an open `Record<string, string | string[] | number | null>`, so extra fields need no contract break.
- The API boundary already has exactly the right two calls (`getProfileForm`, `getProfile`/`saveProfile`), and the HTTP adapter in `src/api/http.ts` will serve a longer form unchanged.
- Autosave, step navigation, completeness tracking and the status/stage gate are all generic over the form definition.

**What must change before the profile is methodology-complete.**

1. **Add two field types.** `ProfileFieldType` currently supports `text | single | multi | scale5 | band`. IP07–IP13 need `number`; IP04/IP05 need a searchable `dropdown` with dependent options (district depends on state). Both are additive to `src/api/types.ts` and `ProfileField` in the profile route — no redesign.
2. **Replace the four 1–5 scales with the workbook's discrete levels.** AI exposure, disciplinary consequence, trajectory and research intensity are currently `scale5`. P0-4 defines named levels with exact factors (4 / 4 / 4 / 3 levels). The 1–5 scales cannot be mapped to them without inventing a mapping, which is forbidden. This is a content change in `src/api/mock/content.ts` (and the production form definition), using the existing `single`/`band` controls.
3. **Resolve mandate cardinality.** Mandate is currently multi-select; `P0-4_Context_Factors` grades it as one level. Methodology decision required before the control is finalised.
4. **Split resource envelope.** One subjective band currently stands in for IP16/IP17/IP18. Restore the three expenditure/funding bands.
5. **Add the settlement-type geography dimension** (IP06) and state/district (IP04, IP05) alongside the existing region multi-select; the region field alone does not serve the engine's geography use.
6. **Grow the form from 11 fields to 25 + rationale.** At 25 required fields the current four-step wizard needs more steps (identity, location, scale, programmes, disciplines, resources, engagement, student profile, AI context) — a content/grouping change, not a redesign. The step list, autosave and progress already handle arbitrary step counts.
7. **Build a separate Institutional Data capture surface.** The 23 D01–D03 numeric items are a *different input layer* per `Assessment_Input_Architecture`. They must not be bolted onto the profile screen; they belong at the start of each domain. This is genuinely new frontend work, not a modification of existing screens.
8. **Backend-only additions:** context completeness, required-maturity computation, evidence-burden multiplier, context rationale storage and second review. None of these belong in the frontend and none exist there today — correctly so.
9. **Blocked on methodology:** all option catalogues for the 18 missing fields, IP16–IP18 band boundaries, mandate cardinality, and whether affiliation / external identifier / accreditation exist at all.

In short: the *plumbing* accommodates the complete profile; the *content* is roughly one third of it, and four existing fields use a representation the engine cannot consume.

---

## Gap table

| REQUIREMENT | SOURCE | CURRENT STATUS | WHERE IT EXISTS | WHAT IS MISSING | PRODUCTION OWNER |
|---|---|---|---|---|---|
| Institution name (IP01) | P0-8 `Institution_Profile` | COMPLETE | `content.ts` `profileForm.identity.name` | — | — |
| Institution type (IP02) | `Institution_Profile`; `P0-4_Applicability_Rules` | COMPLETE (provisional options) | `content.ts` `institutionType` | Workbook-approved option list | Methodology + Backend |
| Governance type / ownership (IP03) | `Institution_Profile` | MISSING | — | Field + option list | Methodology, Frontend, Backend, DB |
| State (IP04) | `Institution_Profile` | MISSING | — | Dropdown field + reference data | Frontend, Backend, DB |
| District (IP05) | `Institution_Profile` | MISSING | — | Dependent dropdown + reference data | Frontend, Backend, DB |
| Location: rural/urban/metro (IP06) | `Institution_Profile`; `Context_Calibration` | PARTIAL | Region multi-select `geography` in `content.ts` | Settlement-type dimension | Frontend, Backend, DB |
| Year established (IP07) | `Institution_Profile` | MISSING | — | Numeric field type | Frontend, Backend, DB |
| Students exact count (IP08) | `Institution_Profile` | PARTIAL | Band `scale` | Exact number; workbook band boundaries | Frontend, Backend, DB |
| Faculty count (IP09) | `Institution_Profile` | MISSING | — | Numeric field | Frontend, Backend, DB |
| Programme counts: active/UG/PG/doctoral (IP10–IP13) | `Institution_Profile` | MISSING | — | Four numeric fields | Frontend, Backend, DB |
| Major disciplines (IP14) | `Institution_Profile`; `D03_Discipline_Library` | MISSING | Discipline list exists only inside D03 prompts | Profile-level multi-select | Methodology, Frontend, Backend, DB |
| Research intensity (IP15) | `Institution_Profile`; `Context_Calibration` | PARTIAL | `researchIntensity` 1–5 scale | Discrete teaching-led / balanced / research-intensive | Methodology, Frontend |
| Expenditure / IT / research funding bands (IP16–IP18) | `Institution_Profile`; `P0-4_Evidence_Burden` | PARTIAL | Merged into `resourceEnvelope` | Three separate banded fields + boundaries | Methodology, Frontend, Backend, DB |
| Industry engagement (IP19) | `Institution_Profile` | MISSING | — | Field + option list | Methodology, Frontend, Backend, DB |
| Innovation/incubation ecosystem (IP20) | `Institution_Profile` | MISSING | — | Field + option list | Methodology, Frontend, Backend, DB |
| Student catchment (IP21) | `Institution_Profile` | MISSING | — | Multi-select | Methodology, Frontend, Backend, DB |
| Student mobility pattern (IP22) | `Institution_Profile` | MISSING | — | Multi-select | Methodology, Frontend, Backend, DB |
| Institutional mandate (IP23) | `Institution_Profile`; `P0-4_Context_Factors` | PARTIAL | `mandate` multi-select | Cardinality decision; graded level | Methodology, Backend |
| Residential model (IP24) | `Institution_Profile` | MISSING | — | Single select | Methodology, Frontend, Backend, DB |
| International exposure (IP25) | `Institution_Profile` | MISSING | — | Single select | Methodology, Frontend, Backend, DB |
| AI exposure levels (Low/Moderate/High/Critical) | `P0-4_Context_Factors` | PARTIAL | `aiExposure` 1–5 scale | Four discrete levels | Methodology, Frontend |
| Disciplinary consequence levels | `P0-4_Context_Factors` | PARTIAL | `disciplinaryConsequence` 1–5 scale | Four discrete levels | Methodology, Frontend |
| Trajectory levels (incl. Declining) | `P0-4_Context_Factors` | PARTIAL | `trajectory` 1–5 scale | Four discrete levels | Methodology, Frontend |
| Scale bands `<2k / 2–10k / 10–25k / >25k` | `Context_Calibration` | PARTIAL | Five different bands in `content.ts` | Alignment to workbook bands | Methodology, Frontend |
| Student profile complexity composite | `Context_Calibration` | PARTIAL | Single 1–5 scale | Composition rule over IP21/IP22/IP24 | Methodology, Backend |
| Context rationale for non-default selections | `P0-4_Context_Profile`; `P0-4_Applicability_Rules` | MISSING | — | Capture + assessor review + second review | Frontend, Backend, DB, Assessor UI |
| Context completeness state | `P0-4_Context_Profile` | MISSING | Only boolean `complete` in `mock/index.ts` `profileComplete()` | Authoritative server-side completeness | Backend, DB |
| Required maturity `R_d` computation | `P0-4_Methodology` | MISSING from frontend (correctly) | Hard-coded fixtures in `mock/index.ts` | Real computation | Backend |
| Evidence-burden multiplier | `P0-4_Evidence_Burden` | MISSING | — | Computation + display | Backend, Assessor UI |
| Institutional Data D01 (9 items) | `Institutional_Data`; `D01_Institutional_Data` | MISSING | — | Numeric capture step at D01 | Frontend (later stage), Backend, DB |
| Institutional Data D02 (6 items) | `Institutional_Data`; `D02_Institutional_Data` | MISSING | — | Numeric capture step at D02 | Frontend (later stage), Backend, DB |
| Institutional Data D03 (8 items) | `Institutional_Data`; `D03_Institutional_Data` | MISSING | — | Numeric capture step at D03 | Frontend (later stage), Backend, DB |
| Affiliation / system relationship, external identifier, accreditation, campus count | Not found in any P0-2…P0-8 sheet | NOT DEFINED | — | Methodology definition before any build | Methodology |

---

## Methodology decisions required (do not invent)

1. Answer-option catalogues for IP02, IP03, IP06, IP14, IP19, IP20, IP21, IP22, IP24, IP25.
2. Band boundaries for IP16, IP17, IP18.
3. Whether institutional mandate is single-valued (as `P0-4_Context_Factors` implies) or multi-valued, and if multi-valued, how factors resolve.
4. Reconciliation of the two scale band sets (`Context_Calibration` `<2k/2–10k/10–25k/>25k` vs the current five bands) and whether the exact IP08 headcount supersedes bands.
5. Whether Student Profile Complexity is a respondent input or derived from IP21/IP22/IP24.
6. Whether Research Intensity is IP15's three-level select or the P0-4 "Moderate"-style level set.
7. Geography representation: state/district (IP04/IP05) + settlement type (IP06) vs the P0-4 sample value "India / mixed urban-regional" — and whether ARUI is India-scoped or international.
8. Domain-specific baselines `B_d` (currently provisional 3 for all domains) and domain sensitivity coefficients before required maturity can be computed.
9. Whether affiliation / external institutional identifier / accreditation / campus count belong in the profile at all.
10. Where the D01–D03 Institutional Data items are collected: profile stage, domain entry, or assessor-supplied.

**Audit only — no code was changed.**
