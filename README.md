# AI Resilient University Index (ARUI) — Production System

ARUI is an institutional capability and resilience assessment platform evaluating universities across **11 Domains, 143 Capabilities, and 143 Metrics**.

---

## 🏛️ Project Architecture & Directory Structure

```
Arui/
├── arui-backend/                      # Production Backend (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── db/                        # Migrations, Authoritative Registry Seeder & PG Pool
│   │   ├── middleware/                # Strict Auth, RBAC & Multi-Tenant Institution Isolation
│   │   ├── methodology/               # Authoritative 143-Metric JSON Registry
│   │   ├── modules/                   # Modular Express APIs (Auth, Assessment, Scoring, Reports, etc.)
│   │   └── tests/                     # Automated E2E, Reproducibility & 18-Action Audit Suites
│   ├── scripts/                       # Executive PDF & Assessment Walkthrough Generators
│   ├── uploads/                       # Secure Multi-Tenant Evidence Vault
│   ├── package.json
│   └── tsconfig.json
│
├── university-insights-main/          # Production Frontend (React + Vite + TanStack)
│   ├── src/                           # Adaptive Assessment UI, Assessor Workspace & API Client
│   ├── public/                        # Static Branding & Icon Assets
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                              # Project Documentation & Reference Models
│   ├── methodology/                   # 8 Master Excel Engines (P0-1 to P0-8) & Developer Specs
│   ├── guides/                        # Master Guide PDF, Walkthrough HTML & Pending Gates JSON
│   └── screenshots/                   # High-Resolution Platform Walkthrough Screenshots
│
├── README.md                          # Master Workspace Documentation
└── .gitignore                         # Project-Wide Git Ignore Rules
```

---

## 🚀 Quickstart & Operational Commands

### 1. Database Setup (PostgreSQL)
Ensure PostgreSQL is running locally or configure `DATABASE_URL` in `arui-backend/.env`:
```bash
cd arui-backend
npm run migrate    # Applies relational schema
npm run seed       # Seeds the 143-metric registry & initial data
```

### 2. Start Backend API
```bash
cd arui-backend
npm run build      # Compiles TypeScript with zero errors
npm start          # Starts server on http://localhost:4000
```
- **Health Check**: `http://localhost:4000/health`
- **Interactive Documentation**: `http://localhost:4000/docs`

### 3. Start Frontend Application
```bash
cd university-insights-main
npm run build      # Builds TanStack Start / Vite bundle
npm run preview    # Runs preview server on http://localhost:8080
```

### 4. Run Full Verification & Audit Suites
```bash
cd arui-backend
npm run test:all
```
This executes:
1. **End-to-End Test Suite**: Database integrity, 25-field profile, screening, evidence vault, assessor M/I/O scoring, and report payloads.
2. **Reproducibility Test**: 100% deterministic bit-for-bit score run consistency.
3. **18-Action & 22-DoD Specification Audit**: Complete 53-assertion compliance audit.

---

## 📊 Scoring & Mathematical Standards

- **Metric Score with Outcome**:
  $$\text{Metric Score} = 100 \times \frac{0.45M + 0.30I + 0.25O}{5}$$
- **Metric Score where Outcome is N/A**:
  $$\text{Metric Score} = 100 \times \frac{0.60M + 0.40I}{5}$$
- **Domain Score**: Arithmetic mean of applicable assessed metrics.
- **Context Calibration ($R_d$) & Cross-Domain Diagnostics (CD01–CD25)**: Diagnostic controls with zero direct score alteration.

---

## 🔒 Security & Roles

- **Authentication**: JWT with strict environment secrets; passwords hashed using Bcrypt.
- **RBAC Roles**: `INSTITUTION_ADMIN`, `ASSESSOR`, `LEAD_AUDITOR`, `SUPER_ADMIN`.
- **Institution Isolation**: Enforced server-side via `requireInstitutionAccess` middleware.
