import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Layers,
  Calendar,
  Sparkles,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/ecri/sample/continuous")({
  component: EcriSampleContinuousView,
});

function EcriSampleContinuousView() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-border">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-teal/10 text-teal text-[11px] font-bold uppercase tracking-wider">
          <TrendingUp className="size-3.5" /> Living Assessment Framework
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Continuous Assessment & Transformation Delta</h1>
        <p className="text-xs text-muted-foreground">
          ECRI is designed as a continuous institutional operating system, not a one-time static PDF generator.
        </p>
      </div>

      {/* Lifecycle Flow Architecture (Section 25 of spec) */}
      <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">The Continuous Evaluation Lifecycle</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
          {[
            { step: "1. Baseline", desc: "Initial D01–D11 diagnostic score (74.8)" },
            { step: "2. Action", desc: "90-Day & 12-Month roadmap rollout" },
            { step: "3. Evidence", desc: "Ongoing policy & WIL artifact logging" },
            { step: "4. Reassessment", desc: "Annual calibration & score rerun" },
            { step: "5. Transformation Delta", desc: "Year-over-year capability gains" },
            { step: "6. Next Cycle", desc: "Institutional recalibration" },
          ].map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <div className="size-6 rounded-full bg-teal text-white flex items-center justify-center text-xs font-bold mx-auto mb-2">
                {idx + 1}
              </div>
              <p className="text-xs font-bold text-foreground">{s.step}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Longitudinal Trajectory Simulator */}
      <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Longitudinal Trajectory (Metropolitan Apex University)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Track capability movement across 2026 Baseline and 2027 Projected Target</p>
          </div>
          <span className="px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-bold">
            Projected Delta: +7.7 Points
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">2026 Baseline (Current)</p>
            <p className="text-2xl font-serif font-bold text-foreground mt-1">74.8 <span className="text-sm font-sans font-normal text-muted-foreground">/ 100</span></p>
            <p className="text-[11px] text-teal font-semibold mt-1">Level 4 · Established</p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">2027 Projected Target</p>
            <p className="text-2xl font-serif font-bold text-teal mt-1">82.5 <span className="text-sm font-sans font-normal text-muted-foreground">/ 100</span></p>
            <p className="text-[11px] text-teal font-semibold mt-1">Level 5 · Benchmark Leader</p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Next Reassessment Window</p>
            <p className="text-sm font-bold text-foreground mt-1.5 flex items-center gap-1.5">
              <Calendar className="size-4 text-teal" /> Q1 2027 (Annual Cycle)
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Formal verification review</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-foreground">Target Dimension Upgrades in Active Cycle:</h4>
          <div className="space-y-2">
            {[
              { dim: "D04 · Experiential & Practice-Based Learning", cur: 67.0, target: 78.0, delta: "+11.0", lever: "Rollout of central WIL Equity Placement Fund across all 14 faculties." },
              { dim: "D08 · Portfolio & Capability Signalling", cur: 69.0, target: 79.0, delta: "+10.0", lever: "Mandatory W3C digital badge issuance for undergraduate capstone projects." },
              { dim: "D10 · Employment Outcome Quality", cur: 73.0, target: 81.0, delta: "+8.0", lever: "Integration of longitudinal tax & destination tracking beyond 12-month mark." },
            ].map((d, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-foreground">{d.dim}</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{d.lever}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-bold text-foreground">{d.cur} → {d.target}</span>
                  <span className="block text-[10px] font-bold text-emerald-600">{d.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
