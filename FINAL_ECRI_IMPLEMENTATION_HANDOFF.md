# FINAL ECRI v6.0 — IMPLEMENTATION HANDOFF

This package is the final source-code baseline for ECRI. Use the source tree directly. Do not recreate changes from prose and do not redesign the methodology.

## Mandatory implementation outcomes
1. ECRI uses the canonical 11 dimensions / 132 metrics registry.
2. ECRI metric scoring is methodology-driven: current v6.0 metrics use 60% maturity + 40% implementation; outcome is not eligible for the current 132-metric registry. Future outcome-eligible metrics must use the configured formula in `src/modules/scoring/methodologyFormula.ts`.
3. Dimension scores are weighted means using metric weights; overall ECRI uses the declared 8/8/9/10/8/9/8/8/10/12/10 dimension weights.
4. Maturity is kept separate from performance and is never reconstructed from score.
5. Required maturity uses the declared P0-4 dimension targets.
6. E0/E1 evidence cannot substantiate maturity >=3; evidence confidence remains a separate assurance signal.
7. ECRI UI uses ECRI dimension names, not ARUI names.
8. The sample experience uses one canonical synthetic dataset. All five sample PDFs and the public scorecards must agree mathematically.

## Sample deliverables
- `public/samples/ECRI_Sample_Executive_Report.pdf` — 17 pages
- `public/samples/ECRI_Sample_Detailed_132_Metric_Report.pdf` — 45 pages
- `public/samples/ECRI_Sample_Board_Scorecard.pdf` — 4 pages
- `public/samples/ECRI_Sample_Evidence_Integrity_Dossier.pdf` — 8 pages
- `public/samples/ECRI_Sample_Transformation_Roadmap.pdf` — 7 pages
- `public/samples/ECRI_Demonstration_Dataset.json`

## Canonical sample score
Overall = **74.80 / 100**, calculated from the visible 11 dimension scores and the declared weights.

## Verification
From `arui-backend`: `npm ci`, `npm run build`, `node src/tests/ecri_final_acceptance.mjs`, then the relevant ECRI test suites. From frontend: `npm ci` and `npm run build`.

Return build logs and test results. Do not substitute a new methodology or alter the canonical sample values without updating the canonical dataset and consistency tests together.

## Regenerating the demonstration PDFs
The report source is included at `tools/generate_ecri_sample_reports.py`. It uses the canonical dataset at `arui-backend/src/methodology/ecri_sample/canonical_demo.json`. Regenerate the five PDFs only when the canonical sample dataset or report design is intentionally versioned.

## Key source changes
- `arui-backend/src/modules/scoring/methodologyFormula.ts`
- `arui-backend/src/modules/scoring/engine.ts`
- `arui-backend/src/modules/assessor/routes.ts`
- `arui-backend/src/modules/questions/routes.ts`
- `university-insights-main/src/routes/ecri.assessment.$domain.tsx`
- `university-insights-main/src/routes/ecri.index.tsx`
- `arui-backend/src/methodology/ecri_sample/canonical_demo.json`
- `university-insights-main/public/samples/ECRI_Demonstration_Dataset.json`
- `arui-backend/src/tests/ecri_final_acceptance.mjs`
