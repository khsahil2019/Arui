import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Award,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecri/sample/institution")({
  component: EcriSampleInstitutionView,
});

const dimensions = [
  { code: "D01", name: "Employer Demand Intelligence", score: 78.0, cur: 4, req: 3, dist: "+1", status: "DEVELOPING", color: "bg-teal" },
  { code: "D02", name: "Employability Capability Framework", score: 72.0, cur: 4, req: 3, dist: "+1", status: "DEVELOPING", color: "bg-teal" },
  { code: "D03", name: "Industry-Aligned Curriculum", score: 81.0, cur: 4, req: 4, dist: "0", status: "INTEGRATED", color: "bg-teal" },
  { code: "D04", name: "Experiential & Practice-Based Learning", score: 67.0, cur: 3, req: 4, dist: "+1", status: "DEVELOPING", color: "bg-amber-500" },
  { code: "D05", name: "Career Development Infrastructure", score: 76.0, cur: 4, req: 3, dist: "0", status: "ESTABLISHED", color: "bg-teal" },
  { code: "D06", name: "Professional & Human Capabilities", score: 74.0, cur: 4, req: 3, dist: "0", status: "ESTABLISHED", color: "bg-teal" },
  { code: "D07", name: "Digital & AI-Era Work Readiness", score: 79.0, cur: 4, req: 3, dist: "0", status: "DEVELOPING", color: "bg-teal" },
  { code: "D08", name: "Portfolio & Capability Signalling", score: 69.0, cur: 3, req: 3, dist: "0", status: "DEVELOPING", color: "bg-amber-500" },
  { code: "D09", name: "Employer Engagement & Recruitment", score: 77.0, cur: 4, req: 4, dist: "0", status: "ESTABLISHED", color: "bg-teal" },
  { code: "D10", name: "Employment Outcome Quality", score: 73.0, cur: 3, req: 4, dist: "+1", status: "DEVELOPING", color: "bg-teal" },
  { code: "D11", name: "Career Adaptability & Lifelong Agility", score: 77.7, cur: 3, req: 3, dist: "0", status: "ESTABLISHED", color: "bg-teal" },
];

function EcriSampleInstitutionView() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-teal/10 text-teal text-[11px] font-bold uppercase tracking-wider">
              ECRI v6.0 · Synthetic / Illustrative Assessment
            </span>
            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-semibold">
              SAMPLE ENVIRONMENT
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mt-2">Metropolitan Apex University</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Comprehensive Public State Chartered University · 28,500 Students · 14 Faculties · 2026 Academic Baseline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/ecri/sample/assessor"
            className="px-4 py-2 rounded-lg bg-card border border-border hover:border-teal/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="size-4 text-teal" /> Assessor View →
          </Link>
          <Link
            to="/ecri/sample/reports"
            className="px-4 py-2 rounded-lg bg-teal text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-teal/90 transition-colors shadow-sm"
          >
            <FileText className="size-4" /> View 5 Reports
          </Link>
        </div>
      </div>

      {/* Overall Position Hero Card */}
      <div className="p-8 rounded-2xl bg-card border border-border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Overall ECRI Score</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-serif font-bold text-teal">74.8</span>
              <span className="text-xl text-muted-foreground font-light">/ 100</span>
            </div>
            <p className="text-xs font-semibold text-foreground mt-1">Level 4 · Transformative & Scaling</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Top Decile Position (84th Percentile among evaluated peer institutions)</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Current Maturity</p>
              <p className="text-lg font-bold text-foreground mt-0.5">Level 4</p>
              <p className="text-[9px] text-muted-foreground">Established</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Required Maturity</p>
              <p className="text-lg font-bold text-foreground mt-0.5">Level 3.6</p>
              <p className="text-[9px] text-muted-foreground">Context-Derived</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Evidence Confidence</p>
              <p className="text-lg font-bold text-teal mt-0.5">88.0%</p>
              <p className="text-[9px] text-muted-foreground">High (E3+)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Coverage</p>
              <p className="text-lg font-bold text-foreground mt-0.5">100%</p>
              <p className="text-[9px] text-muted-foreground">132 / 132 Metrics</p>
            </div>
          </div>
        </div>

        {/* 11-Dimension Capability Bar Profile */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">11-Dimension Institutional Capability Profile</h3>
            <span className="text-xs text-muted-foreground">Comprehensive Benchmark</span>
          </div>

          <div className="space-y-3">
            {dimensions.map((dim) => (
              <div key={dim.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-8 font-mono font-bold text-teal">{dim.code}</span>
                    <span className="font-medium text-foreground">{dim.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-muted-foreground">Req L{dim.req} / Cur L{dim.cur} (Dist {dim.dist})</span>
                    <span className="font-bold text-foreground w-12 text-right">{dim.score.toFixed(1)}</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", dim.color)}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Strengths & Transformation Priorities */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strategic Strengths */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="size-4" /> Strategic Strengths (5 Key Findings)
          </div>
          <ul className="space-y-3">
            {[
              "Comprehensive 84% Industry Co-Designed Curricula across all undergraduate faculties.",
              "Leading Graduate Outcome Quality: 89.2% full-time employment at 6 months (+14.8% salary premium).",
              "Campus-wide Digital & AI Literacy Integration with 92% student credentialing rate.",
              "Tier-1 Employer Recruitment Ecosystem encompassing 450+ corporate & public-sector partners.",
              "Structured 3-Year Alumni Lifelong Upskilling Entitlement maintaining ongoing graduate mobility.",
            ].map((s, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                <span className="size-4 rounded-full bg-teal/10 text-teal flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Transformation Priorities */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="size-4" /> Transformation Priorities (5 Key Levers)
          </div>
          <ul className="space-y-3">
            {[
              "Institutionalize universal WIL Stipend Equity & standardized supervision across all 14 faculties.",
              "Expand regional SME and startup participation in annual curriculum co-design feedback loops.",
              "Standardize W3C verifiable digital skill credentialing across humanities and liberal arts degrees.",
              "Implement granular underemployment telemetry tracking beyond the 12-month graduation milestone.",
              "Scale continuous postgraduate micro-credential stackability for alumni mid-career transitions.",
            ].map((p, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                <span className="size-4 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  !
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Cross-Domain Intelligence Coherence Pathway */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">
          <Activity className="size-4" /> Cross-Domain Pathway & Coherence Intelligence
        </div>
        <p className="text-xs text-muted-foreground">
          Systemic transmission analysis mapping how strategic inputs translate into graduate career mobility:
        </p>

        {/* Pipeline steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-center">
          {[
            { step: "1. Demand Sensing", code: "D01", val: "78.0", state: "Strong" },
            { step: "2. Curriculum Link", code: "D03", val: "81.0", state: "Strong" },
            { step: "3. Practice Learning", code: "D04", val: "67.0", state: "Friction" },
            { step: "4. Capability Signalling", code: "D08", val: "69.0", state: "Developing" },
            { step: "5. Graduate Outcomes", code: "D10", val: "73.0", state: "High Yield" },
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-muted/40 border border-border/50">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">{item.step}</p>
              <p className="text-xs font-bold text-foreground mt-0.5">{item.code} · {item.val}</p>
              <span className={cn(
                "inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold",
                item.state === "Strong" || item.state === "High Yield" ? "bg-teal/10 text-teal" : "bg-amber-500/10 text-amber-500"
              )}>
                {item.state}
              </span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-teal/5 border border-teal/15 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Coherence Diagnostic Finding (84.5% Systemic Coherence)</p>
          <p>
            Strong transmission exists from Employer Demand (D01) through Industry Curricula (D03). The primary structural friction point is between Curriculum (D03) and Experiential Learning (D04), where student placement capacity in non-STEM faculties lags behind accredited engineering clusters.
          </p>
        </div>
      </div>
    </div>
  );
}
