import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  BookOpen,
  Zap,
  Layers,
  HelpCircle,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  BarChart3,
  TrendingUp,
  Globe,
} from "lucide-react";

export const Route = createFileRoute("/ecri/sample/")({
  component: EcriSampleOverviewPage,
});

function EcriSampleOverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      {/* 1. Overview & Scope Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-semibold uppercase tracking-wider">
          <Compass className="size-3.5" /> ECRI Demonstration Environment
        </div>
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
          Employability & Career Readiness Intelligence (ECRI)
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
          Explore the complete institutional benchmark environment driving graduate career outcomes,
          industry co-designed curricula, and work-integrated learning (WIL). All views in this demonstration
          operate from a single canonical assessment: <strong>Metropolitan Apex University (74.8 / 100)</strong>.
        </p>
      </div>

      {/* Quick Access Matrix */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          to="/ecri/sample/institution"
          className="p-5 rounded-xl bg-card border border-border hover:border-teal/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-3">
            <BarChart3 className="size-5" />
          </div>
          <h3 className="font-semibold text-sm group-hover:text-teal transition-colors">Institution View →</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Overall score 74.8, 11-dimension capability chart, strengths, priority gaps, and cross-domain diagnostics.
          </p>
        </Link>

        <Link
          to="/ecri/sample/assessor"
          className="p-5 rounded-xl bg-card border border-border hover:border-teal/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-3">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="font-semibold text-sm group-hover:text-teal transition-colors">Assessor View →</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Dedicated ECRI adjudicator workspace evaluating all 132 canonical metrics and E0–E4 evidence dossiers.
          </p>
        </Link>

        <Link
          to="/ecri/sample/reports"
          className="p-5 rounded-xl bg-card border border-border hover:border-teal/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-3">
            <FileText className="size-5" />
          </div>
          <h3 className="font-semibold text-sm group-hover:text-teal transition-colors">Report Centre (5 PDFs) →</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Download 20-page Executive Dossier, 132-Metric Taxonomy, Board Scorecard, Evidence Dossier, and Roadmap.
          </p>
        </Link>
      </div>

      {/* 2. What is ECRI */}
      <section id="what-is-ecri" className="p-8 rounded-2xl bg-card border border-border space-y-4 scroll-mt-6">
        <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
          <BookOpen className="size-4" /> Section 2 · Foundation
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">What is ECRI?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <strong>Employability & Career Readiness Index (ECRI)</strong> is an institutional benchmarking and diagnostic system designed to measure, validate, and accelerate the employability capabilities of universities and higher education institutions.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Unlike simple graduate employment rate surveys, ECRI assesses the systemic institutional machinery that produces long-term graduate agility, including employer co-design mechanisms, mandatory work-integrated learning (WIL), digital credentials, and lifelong alumni mobility.
        </p>
      </section>

      {/* 3. Why ECRI */}
      <section id="why-ecri" className="p-8 rounded-2xl bg-card border border-border space-y-4 scroll-mt-6">
        <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
          <Zap className="size-4" /> Section 3 · Strategic Value
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Why ECRI?</h2>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-1">
            <h4 className="text-xs font-bold text-foreground">Beyond Surface Rankings</h4>
            <p className="text-xs text-muted-foreground">Replaces lagging reputation indicators with granular, evidence-corroborated diagnostic capability measurements.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-1">
            <h4 className="text-xs font-bold text-foreground">Employer Co-Design Alignment</h4>
            <p className="text-xs text-muted-foreground">Quantifies real-time industry voice participation and curriculum co-design across 14 academic faculties.</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-1">
            <h4 className="text-xs font-bold text-foreground">Anti-Gaming Evidence Architecture</h4>
            <p className="text-xs text-muted-foreground">Claims above Level 2 require cryptographic multi-source artifact verification (E0–E4 standards).</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/40 border border-border/60 space-y-1">
            <h4 className="text-xs font-bold text-foreground">Prescribed 3-Horizon Roadmaps</h4>
            <p className="text-xs text-muted-foreground">Translates diagnostic findings directly into actionable 90-day, 12-month, and 24-month executive interventions.</p>
          </div>
        </div>
      </section>

      {/* 4. 11 Dimensions */}
      <section id="dimensions" className="p-8 rounded-2xl bg-card border border-border space-y-4 scroll-mt-6">
        <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
          <Layers className="size-4" /> Section 4 · Architecture
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">The 11 Canonical Dimensions (132 Metrics)</h2>
        <p className="text-xs text-muted-foreground">
          Every dimension contains exactly 12 standardized canonical metrics evaluated against 6 maturity anchors (M0–M5).
        </p>
        <div className="grid sm:grid-cols-2 gap-2.5 pt-2">
          {[
            { code: "D01", name: "Employer Demand Intelligence", score: 78.0, dist: "+1" },
            { code: "D02", name: "Employability Capability Framework", score: 72.0, dist: "+1" },
            { code: "D03", name: "Industry-Aligned Curriculum", score: 81.0, dist: "0" },
            { code: "D04", name: "Experiential & Practice-Based Learning", score: 67.0, dist: "+1" },
            { code: "D05", name: "Career Development Infrastructure", score: 76.0, dist: "0" },
            { code: "D06", name: "Professional & Human Capabilities", score: 74.0, dist: "0" },
            { code: "D07", name: "Digital & AI-Era Work Readiness", score: 79.0, dist: "0" },
            { code: "D08", name: "Portfolio & Capability Signalling", score: 69.0, dist: "0" },
            { code: "D09", name: "Employer Engagement & Recruitment", score: 77.0, dist: "0" },
            { code: "D10", name: "Employment Outcome Quality", score: 73.0, dist: "+1" },
            { code: "D11", name: "Career Adaptability & Lifelong Mobility", score: 77.7, dist: "0" },
          ].map((d) => (
            <div key={d.code} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-teal/10 text-teal text-[11px] font-bold">{d.code}</span>
                <span className="text-xs font-semibold text-foreground">{d.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-teal">{d.score}</span>
                <span className="text-[10px] text-muted-foreground ml-1.5">(Dist {d.dist})</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="p-8 rounded-2xl bg-card border border-border space-y-4 scroll-mt-6">
        <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
          <HelpCircle className="size-4" /> Section 5 · Workflow
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">How the Assessment Works</h2>
        <div className="space-y-3 pt-2">
          {[
            { step: "1. Institutional Calibration", desc: "Profile configuration establishing mandate, degree offerings, and context-derived required maturity." },
            { step: "2. Institutional Pulse (Screening)", desc: "Adaptive screening across foundational indicators to determine full diagnostic scoping." },
            { step: "3. 132-Metric Deep Dive Diagnostic", desc: "Faculty-wide data entry capturing curriculum co-design, WIL participation, and employer integration." },
            { step: "4. Evidence Repository & Dossier Upload", desc: "Corroborating policy charters, syllabus audit logs, and employment surveys mapped to claims." },
            { step: "5. Independent Assessor Calibration", desc: "Lead adjudicators audit evidence veracity, validate maturity scores, and finalize score runs." },
          ].map((s, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="size-6 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">{s.step}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. What Institution Receives */}
      <section id="deliverables" className="p-8 rounded-2xl bg-card border border-border space-y-4 scroll-mt-6">
        <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
          <Award className="size-4" /> Section 6 · Deliverables
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">What the Institution Receives</h2>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileText className="size-4 text-teal" /> 5 Boardroom PDF Reports
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Executive Institutional Report, 132-Metric Diagnostic, Board Scorecard, Evidence Integrity Dossier, and 3-Horizon Transformation Roadmap.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BarChart3 className="size-4 text-teal" /> Living Scoreboard & Analytics Hub
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Interactive dashboard with capability radar balance, maturity quadrant matrix, and peer cohort benchmarking.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="size-4 text-teal" /> Certified Public Institutional HTML Profile
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Verified public credential demonstrating institutional employability standing to students, employers, and regulators.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-teal" /> Continuous Living Assessment License
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Ongoing annual cycle tracking capability movement, evidence accumulation, and year-over-year transformation delta.
            </p>
          </div>
        </div>

        <div className="pt-6 text-center">
          <Link
            to="/ecri/sample/institution"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal text-white font-semibold text-sm shadow-md hover:bg-teal/90 transition-colors"
          >
            Explore Sample Institution View →
          </Link>
        </div>
      </section>
    </div>
  );
}
