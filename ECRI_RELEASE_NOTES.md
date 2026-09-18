# ECRI Final Release Notes

This release is a corrective implementation package based on the supplied ARUI/ECRI developer bundle.

## Corrected
- ECRI registry metadata now reflects the actual registry counts.
- Assessment-scoped entitlement is enforced from the stored assessment product.
- Engine cross-contamination is blocked at assessment-scoped APIs.
- ECRI screening endpoint serves Screening items rather than Diagnostic items.
- Adaptive domain questioning prioritizes dimensions flagged by screening.
- ECRI profile completeness uses canonical IP01–IP25 registry requirements and removes AI-only required fields.
- ECRI evidence presentation is capped to a representative institution-facing queue while preserving internal 132-metric traceability.
- Benchmark peer samples are filtered by configured peer-group rules rather than falling back to the entire product dataset.
- Benchmark queries retain context profile data needed for peer matching.
- ECRI report filenames identify ECRI rather than ARUI.
- Active methodology fallback is removed from assessment creation.
- Historical assessments retain their pinned methodology version.
- Server-side price/currency authority is enforced for payment activation.
- Fresh-install migration order is corrected for `brand_configs` and `institutions`.
- Public ECRI sample report actions now open a real sample PDF.
- Added a deterministic registry/source release validator.

## Explicitly preserved
- Existing ECRI methodology registry data.
- Existing ARUI engine.
- Existing database model and report payload architecture except where required for isolation/integrity.
- Existing public ECRI visual experience.

## Verification limitation
The original supplied bundle did not contain a complete installed dependency tree, so a clean TypeScript build could not be completed inside the audit container. The package therefore includes the exact clean-install/build commands the developer must run. The registry/source validation script passes.
