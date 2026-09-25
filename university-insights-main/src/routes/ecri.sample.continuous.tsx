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
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Continuous Assessment & Transformation Delta
        </h1>
        <p className="text-xs text-muted-foreground">
          ECRI is designed as a continuous institutional operating system, not a one-time static PDF
          generator.
        </p>
      </div>

      {/* Lifecycle Flow Architecture (Section 25 of spec) */}
      <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          The Continuous Evaluation Lifecycle
        </h3>

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

      {/* Longitudinal Trajectory Simulator & Reassessment Delta (Instruction #31-#32) */}
      <div className="p-8 rounded-2xl bg-card border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-wider">
                Illustrative Demonstration
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                12-Month Validity Cycle
              </span>
            </div>
            <h3 className="text-lg font-serif font-bold text-foreground mt-1">
              Reassessment & Transformation Delta
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tracking verifiable capability gains from 2026 Baseline to 2027 Annual Reassessment
            </p>
          </div>
          <div className="text-left sm:text-right p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Transformation Delta
            </span>
            <span className="text-2xl font-serif font-bold text-emerald-600 dark:text-emerald-400">
              +6.4 Points
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              2026 Frozen Baseline
            </p>
            <p className="text-3xl font-serif font-bold text-foreground mt-1">
              74.8{" "}
              <span className="text-sm font-sans font-normal text-muted-foreground">/ 100</span>
            </p>
            <p className="text-[11px] text-teal font-semibold mt-1">Level 4 · Established</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Validated September 2026</p>
          </div>

          <div className="p-4 rounded-xl bg-teal/5 border border-teal/20">
            <p className="text-[10px] font-bold text-teal uppercase">2027 Annual Reassessment</p>
            <p className="text-3xl font-serif font-bold text-teal mt-1">
              81.2{" "}
              <span className="text-sm font-sans font-normal text-muted-foreground">/ 100</span>
            </p>
            <p className="text-[11px] text-teal font-semibold mt-1">Level 5 · Benchmark Leader</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Illustrative Demonstration</p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">
              Validity & Governance
            </p>
            <p className="text-sm font-bold text-foreground mt-1.5 flex items-center gap-1.5">
              <Calendar className="size-4 text-teal" /> 12 Months Validity
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Baseline is never overwritten; all changes tracked as verified Delta records.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Dimension-by-Dimension Movement (All 11 Dimensions):
          </h4>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {[
              {
                code: "D01",
                name: "Employer Demand Intelligence",
                base: 78.0,
                reassess: 82.0,
                delta: "+4.0",
              },
              {
                code: "D02",
                name: "Industry Ecosystem & Partnerships",
                base: 72.0,
                reassess: 78.0,
                delta: "+6.0",
              },
              {
                code: "D03",
                name: "Curriculum Co-Design & Modernization",
                base: 81.0,
                reassess: 85.0,
                delta: "+4.0",
              },
              {
                code: "D04",
                name: "Experiential & Practice-Based Learning",
                base: 67.0,
                reassess: 78.0,
                delta: "+11.0",
              },
              {
                code: "D05",
                name: "Career Development Infrastructure",
                base: 76.0,
                reassess: 81.0,
                delta: "+5.0",
              },
              {
                code: "D06",
                name: "Applied Competencies & Transversal Skills",
                base: 74.0,
                reassess: 79.0,
                delta: "+5.0",
              },
              {
                code: "D07",
                name: "Assessment Integrity & Authentic Evaluation",
                base: 79.0,
                reassess: 83.0,
                delta: "+4.0",
              },
              {
                code: "D08",
                name: "Entrepreneurship & Venture Creation",
                base: 69.0,
                reassess: 77.0,
                delta: "+8.0",
              },
              {
                code: "D09",
                name: "Placement Architecture & Corporate Relations",
                base: 77.0,
                reassess: 82.0,
                delta: "+5.0",
              },
              {
                code: "D10",
                name: "Employment Outcome Quality",
                base: 73.0,
                reassess: 80.0,
                delta: "+7.0",
              },
              {
                code: "D11",
                name: "Continuous Improvement & Labor Market Calibration",
                base: 77.7,
                reassess: 84.0,
                delta: "+6.3",
              },
            ].map((d) => (
              <div
                key={d.code}
                className="p-3 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-teal">{d.code}</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                    {d.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-muted-foreground">{d.base} → </span>
                  <span className="font-bold text-foreground">{d.reassess}</span>
                  <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">
                    {d.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
