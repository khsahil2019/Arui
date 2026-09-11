# Respondent Input Audit — D01–D03, Pulse, Profile, Evidence, N/A

**Principle:** Structured input first. Free text only when genuinely necessary.

**Scope:** Every respondent-facing input. Assessor-side inputs (M/I/O rationale, flags, N/A adjudication) are out of scope — they are expert workspaces and deliberately retain free text.

**Classification**
- **A** — Can be structured → converted to a selection/control.
- **B** — Requires limited institutional explanation → bounded short text (character limit shown to the respondent).
- **C** — Genuinely requires narrative reasoning → retained, bounded, and justified on screen. *No input in D01–D03 currently falls in class C.*

**Methodology position.** The workbooks (P0-2 → P0-8) define *what* each question measures and its measurement path. They do **not** define answer-choice catalogues, and they do not define any answer-choice → M/I/O mapping. Therefore:
- Every option catalogue introduced here is marked `provisionalOptions: true` in the API contract and shown to respondents as "provisional and will be confirmed by the methodology team". **METHODOLOGY DECISION REQUIRED #1.**
- Changing the control changes *how* the information is supplied, not *what* is measured. Prompt IDs, wording, metric linkage and evidence hints are unchanged.
- Responses remain inputs for assessor/backend M/I/O scoring. Nothing in the frontend scores, weights or routes.
- "Other" is offered wherever a catalogue could plausibly be incomplete, with a bounded name field (≤ 80 chars).

Controls used: single select (cards or segmented), multi-select (cards or chips), dropdown, ranked top-N from a catalogue, number with precision flag, Yes / No / Not sure, structured matrix, structured process builder, month / period selector, evidence request, bounded short text.

---

## D01 — Institutional Strategy, Foresight & AI Direction

| Question | Previous input | Recommended / implemented input | Reason | Req. |
|---|---|---|---|---|
| d01-01 How is AI positioned in decision-making? | Single choice | Single choice (unchanged) | Already structured | Required |
| d01-02 Which decisions have changed in the last 18 months? | 3 records × (text, **textarea**, text) | Records ×≤3: area of decision (select + Other), nature of change (select), driver (multi-select), decided by (select + Other), when (month), *decision in one line* (short text ≤120, optional). Explicit "No decision has changed yet" state. | A. Category, change type, driver, body and date are all enumerable; only the decision's name is institution-specific. Absence is a legitimate answer and now first-class. | Required |
| d01-03 Assumptions materially affected by AI in 3–5 years | Ranked list of 5 × free text + **textarea** explanation each | Ranked top-5 from a catalogue of institutional assumptions (+ Other); per item: horizon (select), institutional response so far (select). Reorder arrows. | A. The methodology asks *which* assumptions, in what order; a catalogue captures this with far higher consistency across institutions. | Required |
| d01-04 Detection → institutional action process | Process steps × (text, text, text) | Process builder (2–8 steps): what happens (select + Other), who is involved (multi-select actors), typical time (select bands). | A. Process stages, actors and time bands are enumerable; the sequence itself is the information. | Required |
| d01-05 Pilots conducted / evaluated / scaled / stopped | 4 numbers | 4 numbers + precision flag (exact / approximate / partly known). | Unchanged; precision replaces the "say so in the explanation" instruction. | Required |
| d01-06 Threatened-programme scenario | 3 × **textarea** (first / who / mechanism) | Structured form: first action (select + Other), who initiates (multi-select ≤3 + Other), mechanism (multi-select + Other), *anything that would change this* (short text ≤160, optional). | A. First-response, actors and mechanisms are enumerable. | Required; nuance optional |
| d01-07 Distinctive institutional value | 3 × **textarea** (value / rationale / evidence) | Structured form: value categories (multi-select ≤3 + Other), where already visible (multi-select), *why this value — one sentence* (short text ≤200, optional). | A for value and demonstration; B for rationale, which is genuinely institution-specific but fits one sentence. | Required; rationale optional |

## D02 — Governance, Responsible AI & Institutional Risk

| Question | Previous input | Recommended / implemented input | Reason | Req. |
|---|---|---|---|---|
| d02-01 Who can authorise deployment? | text + **textarea** | Structured form: who (multi-select ≤3 actors + Other), basis of authority (select), *name of body / schedule / policy* (short text ≤100, optional). | A. Roles and authority bases are enumerable; only the document name is free. | Required; name optional |
| d02-02 Steps before a consequential system is approved | Process steps × (text, text) | Process builder (1–8): what happens (select + Other), who owns it (multi-select), how consistently it happens (select). | A. Informality is captured through "how consistently", not prose. | Required |
| d02-03 Governance policies approved / implemented / reviewed | Matrix with free-text rows + free-text "last review" | Matrix: rows chosen from a policy catalogue (+ Other named ≤60), columns approved / implemented / reviewed (check) + last review (month). | A. Policy types are enumerable; dates are dates. | Required |
| d02-05 Tools processing personal data / reviewed | 2 numbers | 2 numbers + precision flag. | Unchanged | Required |
| d02-06 How appropriateness of student GenAI use is determined | 2 × **textarea** | Structured form: how determined (multi-select), criteria used (multi-select), consistency (select). | A | Required |
| d02-07 Human review / override points | Matrix: free-text rows + free-text review point + Y/N/? | Matrix: rows from a consequential-decision catalogue (+ Other), review point (select), override possible (Y/N/Not sure). | A | Required |
| d02-04 Harmful outcome scenario | 3 × **textarea** | Structured form: has it occurred (Y/N/Not sure), what happens next (multi-select + Other), who is involved (multi-select), who decides (select + Other), how the institution learns (multi-select), *anything specific here* (short text ≤160, optional). | A; the occurred/hypothetical distinction was previously buried in help text. | Required; nuance optional |
| d02-08 External systems due diligence & monitoring | 3 records × (text, **textarea**, **textarea**) | Records ×≤3: system type (select + Other), *system name* (short text ≤60, optional), due diligence (multi-select), monitoring (multi-select). "No external system in consequential use" state. | A | Required |
| d02-09 Governance process tested? | Single choice ("use the explanation") | Single choice + *what was tested and what changed* (short text ≤160, optional). | B. The workbook asks "what changed" — one line suffices. | Required; nuance optional |

## D03 — Human Capability, Cognitive Readiness & AI-Ready Education

| Question | Previous input | Recommended / implemented input | Reason | Req. |
|---|---|---|---|---|
| d03-01 Intended graduate capabilities | Multi-choice (methodology capability list) | Unchanged | Already structured; catalogue is workbook-derived | Required |
| d03-02 Intended / developed / demonstrated / assessed | Check matrix on prior response | Unchanged | Already structured | Required |
| d03-03 Work samples for 3–5 capabilities | Evidence request (acknowledge) | Evidence request + *which capabilities the samples will cover* (short text ≤120, optional). | B | Acknowledge required |
| d03-04 How capability is demonstrated, not just answered | Matrix with free-text cell per capability | Matrix: per capability, demonstration modes (multi-select chips). | A | Required |
| d03-05 Where students verify / challenge AI output | Records × (text, **textarea**) | Records ×≤5: where (select), *programme/module name* (short text ≤80, optional), what students must do (multi-select). "Not yet anywhere" state. | A | Required |
| d03-06 Frequency of unfamiliar / ambiguous problems | Single choice | Unchanged | Already structured | Required |
| d03-07 Proportion meeting thresholds | 1 number, N/A allowed | Number + precision flag; N/A allowed. | Unchanged | Required or N/A |
| d03-08 Non-technical disciplines | Matrix: free-text rows + free-text "how" + Y/N/? | Matrix: rows from discipline catalogue (+ Other), how (multi-select), sample available (Y/N/Not sure). | A | Required or N/A |
| d03-09 Three least convincingly demonstrated capabilities | Ranked list × free text + **textarea** | Ranked top-3 from the methodology capability list; per item: what led to the conclusion (multi-select), *one line* (short text ≤120, optional). | A. The capabilities are already a fixed list; the evidence basis is enumerable. | Required; nuance optional |

## Targeted follow-ups (remediation probes)

| Question | Previous input | Recommended / implemented input | Reason | Req. |
|---|---|---|---|---|
| d01-t-02 Resource movement behind priorities | Records × (text, **textarea**, **textarea**) | Records ×1–5: *priority* (short text ≤80), what moved (multi-select), period (month range), what shows it was real (multi-select). | A/B. The priority is institution-specific; the movement and evidence are enumerable. | Required |
| d02-t-02 Three most consequential use cases — risk treatment | Records × (text, **textarea**, **textarea**, text) | Records ×1–3: use case (select + Other), identified (select), rated (select), treatment (multi-select), owner (select + Other), monitoring (select), residual-risk decision (select). | A. This is a risk-register structure; every column is categorical. | Required |
| d03-t-01 Question/problem formulation examples | 2 records × (text, **textarea**, **textarea**) | Records ×2: *task and programme* (short text ≤80), how students formulated (multi-select + Other), how quality was judged (multi-select). | A/B | Required |

## Pulse, Profile, Evidence and N/A

| Input | Previous | Implemented | Reason | Req. |
|---|---|---|---|---|
| Pulse s-01 … s-05 | Single choice | Unchanged | Already structured | Required |
| Profile — institution name | Bounded text input | Unchanged | Inherently free | Required |
| Profile — all other fields | Select / multi / band / 5-point scale | Unchanged | Already structured | Required |
| Evidence — short description | **textarea** (3 rows) | Short text ≤240, two lines | B | Optional |
| Evidence — title / link / type / period / scope / mapping | Text / select / month / checkboxes | Unchanged | Already structured or inherently free | Title & type required |
| "Does not apply" rationale | **textarea**, ≥12 chars | Reason category (select, provisional) + brief note (short text ≤160; required only for "Another reason") | A/B. Genuine-inapplicability categories are enumerable; the assessor still adjudicates every request. | Required to submit N/A |

## Result

- Unbounded textareas in the respondent experience: **0** (was 27 fields across D01–D03, targeted, evidence and N/A).
- Bounded short-text fields: 14, all optional except two institution-specific names (priority, task) and the "Other" specifiers.
- Class C (justified narrative) fields: **0**. The `narrative` field type exists in the contract for future use and must carry an on-screen justification if ever used.

## Open items for the methodology team

1. Confirm or replace every provisional catalogue (actors, time bands, decision areas, mechanisms, policy types, consequential decisions, external system types, verification activities, demonstration modes, disciplines, N/A reasons).
2. Confirm whether any D01–D03 question genuinely requires narrative reasoning (class C). None has been retained pending that decision.
3. Confirm the "none" states added to d01-02, d02-08 and d03-05 are acceptable as explicit responses distinct from "Not sure" and "N/A".
