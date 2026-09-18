# FINAL ECRI v6.0 DEVELOPER HANDOFF — CODE + ARCHITECTURE FREEZE

## Status
This package is the **single source of truth for the final ECRI correction pass**.

The supplied developer bundle was audited against the current ECRI registry and then patched in-place. The methodology registry itself has not been rewritten or invented. The code is corrected around the registry that is actually present.

## Canonical ECRI registry counts
- 11 dimensions
- 132 metrics (12 per dimension)
- 132 capability cards
- 792 maturity anchors (132 × 6)
- 132 calibration records
- 13 anti-gaming rules
- 10 cross-domain rules
- 153 questions: 21 Screening + 132 Diagnostic
- 132 evidence requirements (internal assessor mapping; NOT 132 institutional uploads)
- 3 badge definitions
- 11 intervention records

Do not hard-code alternative counts anywhere in the application.

## Non-negotiable architecture
### 1. Engine isolation
Every assessment-scoped API must derive the product from the assessment record. Never trust a browser-supplied product code to authorize an assessment.

`institution access + assessment product + active entitlement` must all pass.

ARUI and ECRI must never cross-read each other's assessment state, methodology, evidence, reports or score runs.

### 2. Methodology pinning
An assessment pins its methodology version at creation. Every calculation and report must use that pinned version. A later active methodology must not change a historical assessment.

### 3. Execution-light evidence
The institution-facing evidence queue exposes a small representative set (8–12 target). The 132 evidence requirements remain an internal traceability layer. One evidence item may support multiple metrics.

### 4. Adaptive assessment
The 21 Screening items are the pulse layer. Diagnostic questions are served after screening and should prioritize the affected dimension when screening signals are non-affirmative or uncertain. The browser never receives the full scoring graph.

### 5. Server-authoritative pricing
The server reads the active price for the product. Client-provided amount/currency can only be validated against the server value; it cannot override it.

### 6. Reports
Production reports are generated from the canonical assessment result. ECRI reports must identify ECRI, use ECRI filenames, and preserve assessment/methodology version metadata.

### 7. Sample experience
The public ECRI page must expose a real sample executive report at:
`/samples/ECRI_Sample_Executive_Report.pdf`

The sample is illustrative and must remain clearly labelled as such.

## Files changed in this package
- `arui-backend/src/engines/ecri/index.ts`
- `arui-backend/src/middleware/entitlement.ts`
- `arui-backend/src/modules/assessment/routes.ts`
- `arui-backend/src/modules/questions/routes.ts`
- `arui-backend/src/modules/evidence/routes.ts`
- `arui-backend/src/modules/profile/routes.ts`
- `arui-backend/src/modules/reports/routes.ts`
- `arui-backend/src/modules/benchmarking/routes.ts`
- `arui-backend/src/modules/benchmarking/service.ts`
- `arui-backend/src/modules/entitlements/service.ts`
- `arui-backend/src/db/migrate.ts`
- `university-insights-main/src/routes/ecri.index.tsx`
- `university-insights-main/public/samples/ECRI_Sample_Executive_Report.pdf`
- `arui-backend/src/tests/ecri_final_release_validation.mjs`

A machine-readable unified diff is also supplied as `FINAL_ECRI_PATCH.diff`.

## Required developer execution
From the backend:

```bash
npm ci
npm run build
node src/tests/ecri_final_release_validation.mjs
npm run test:ecri
npm run test:isolation
npm run test:benchmarking
npm run test:entitlements
```

From the frontend:

```bash
npm ci
npm run build
```

Do not report success from a cached or partially installed `node_modules` directory. Run the build in a clean environment.

## End-to-end acceptance tests
1. Register one institution.
2. Confirm ARUI and ECRI both exist as `NOT_PURCHASED` entitlements.
3. Attempt to open ECRI assessment without entitlement → HTTP 403.
4. Activate ECRI entitlement through the configured payment/activation path.
5. Open ECRI assessment → only ECRI methodology/version is used.
6. Open ECRI profile → IP01–IP25 canonical profile, with no ARUI-only AI exposure/disciplinary fields required.
7. Complete ECRI screening → 21 Screening questions only.
8. Give a non-affirmative D04 screening response → D04 diagnostic items are prioritized.
9. Add one evidence item → it may support multiple metrics; institutional queue remains execution-light.
10. Generate ECRI report → ECRI filename and ECRI product identity.
11. Re-run scoring after a new methodology version becomes active → old assessment remains pinned to its original methodology version.
12. Attempt to access another institution's assessment → HTTP 403.
13. Attempt to use ARUI product code against an ECRI assessment → server derives ECRI from assessment and blocks cross-engine misuse.
14. Benchmarking with insufficient peer N → peer comparison remains unavailable/baseline-only.
15. Benchmarking with sufficient peer N → only snapshots matching the configured peer rules are included.
16. Open `/ecri` public page → both sample report actions open the actual ECRI sample PDF.

## Important implementation rule
Do not manually “improve” the methodology in code. If a future methodology change is required, create a new versioned registry and pin new assessments to that version.

## Deployment configuration
The repository intentionally excludes real `.env` files. Create deployment environment variables from the supplied `.env.example` files and inject production secrets through the deployment environment.

Payment provider credentials are deployment configuration. The application code must never contain payment secrets.

## Definition of done
The developer's work is complete when the source package builds cleanly in a clean environment and the acceptance tests above pass. There is no requirement for another architecture rewrite.
