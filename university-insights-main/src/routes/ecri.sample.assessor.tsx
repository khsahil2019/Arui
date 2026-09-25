import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Layers,
  BarChart3,
  Sliders,
  Check,
  Search,
  Filter,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecri/sample/assessor")({
  component: EcriSampleAssessorView,
});

const dimensionsList = [
  { code: "D01", name: "Employer Demand Intelligence", score: 78.0, count: 12 },
  { code: "D02", name: "Industry Ecosystem & Partnerships", score: 72.0, count: 12 },
  { code: "D03", name: "Curriculum Co-Design & Modernization", score: 81.0, count: 12 },
  { code: "D04", name: "Experiential & Practice-Based Learning", score: 67.0, count: 12 },
  { code: "D05", name: "Career Development Infrastructure", score: 76.0, count: 12 },
  { code: "D06", name: "Applied Competencies & Transversal Skills", score: 74.0, count: 12 },
  { code: "D07", name: "Assessment Integrity & Authentic Evaluation", score: 79.0, count: 12 },
  { code: "D08", name: "Entrepreneurship & Venture Creation", score: 69.0, count: 12 },
  { code: "D09", name: "Placement Architecture & Corporate Relations", score: 77.0, count: 12 },
  { code: "D10", name: "Employment Outcome Quality", score: 73.0, count: 12 },
  {
    code: "D11",
    name: "Continuous Improvement & Labor Market Calibration",
    score: 77.7,
    count: 12,
  },
];

const sampleEvidence = [
  {
    id: "EV-01",
    title: "Institutional WIL Governance & Supervision Policy (2025–2028)",
    dim: "D04",
    metric: "I01",
    level: "E3",
    status: "VERIFIED",
    hash: "sha256:7f83b165...9069",
  },
  {
    id: "EV-02",
    title: "Industry Advisory Council Curriculum Co-Design Audits (14 Faculties)",
    dim: "D03",
    metric: "I03",
    level: "E4",
    status: "VERIFIED",
    hash: "sha256:4a5b28d0...7500",
  },
  {
    id: "EV-03",
    title: "Real-Time Labor Market Intelligence Integration Specification",
    dim: "D01",
    metric: "I01",
    level: "E3",
    status: "CORROBORATED",
    hash: "sha256:1a82f9b8...7a8b",
  },
  {
    id: "EV-04",
    title: "Longitudinal Graduate Outcome Destination & Salary Census",
    dim: "D10",
    metric: "I01",
    level: "E4",
    status: "VERIFIED",
    hash: "sha256:9c8d7e6f...9c8d",
  },
];

function EcriSampleAssessorView() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "scoring" | "evidence" | "runs" | "context"
  >("overview");
  const [selectedDim, setSelectedDim] = useState<string>("D01");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Assessor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-teal/10 text-teal text-[11px] font-bold uppercase tracking-wider">
              ECRI Assessor Workspace
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-semibold">
              Adjudicator Role · Dr. Robert Sterling
            </span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground mt-2">
            Assessment Calibration Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Evaluating <strong>Metropolitan Apex University</strong> · ECRI v6.0 · 11 Dimensions ·
            Exactly 132 Canonical Metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="size-4" /> Score Run Certified (74.8 / 100)
          </span>
        </div>
      </div>

      {/* Assessor Navigation Tabs (Section 11 of spec) */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-px">
        {[
          { id: "overview", label: "Assessment Overview" },
          { id: "scoring", label: "Metric Scoring (132 Metrics)" },
          { id: "evidence", label: "Evidence Review (E0–E4)" },
          { id: "context", label: "Context & Required Maturity" },
          { id: "runs", label: "Score Runs & Determinism" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-teal text-teal"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Institution
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">Metropolitan Apex Univ.</p>
              <p className="text-[10px] text-muted-foreground">ID: demo-ecri-asm-001</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Methodology
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">ECRI v6.0 Baseline</p>
              <p className="text-[10px] text-muted-foreground">11 Dimensions · 132 Metrics</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Overall Score
              </p>
              <p className="text-sm font-bold text-teal mt-0.5">74.8 / 100 (Level 4)</p>
              <p className="text-[10px] text-muted-foreground">Certified Deterministic</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Evidence Items
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">36 Artifacts Audited</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                100% Corroborated
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Dimension Evaluation Matrix
            </h3>
            <div className="divide-y divide-border">
              {dimensionsList.map((d) => (
                <div key={d.code} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-teal">{d.code}</span>
                    <span className="font-semibold text-foreground">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-muted-foreground">
                      {d.count} Canonical Metrics Scored
                    </span>
                    <span className="font-bold text-foreground">{d.score.toFixed(1)} / 100</span>
                    <span className="px-2 py-0.5 rounded bg-teal/10 text-teal text-[10px] font-bold">
                      VERIFIED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Metric Scoring (132 Metrics) */}
      {activeTab === "scoring" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Select Dimension:</span>
              <select
                value={selectedDim}
                onChange={(e) => setSelectedDim(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground"
              >
                {dimensionsList.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} — {d.name} (12 Metrics)
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-muted-foreground font-semibold">
              Showing 12 of 132 Canonical Metrics
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">
                {selectedDim} — {dimensionsList.find((d) => d.code === selectedDim)?.name}
              </h3>
              <span className="px-2.5 py-1 rounded bg-teal/10 text-teal text-xs font-bold">
                Dimension Score:{" "}
                {dimensionsList.find((d) => d.code === selectedDim)?.score.toFixed(1)} / 100
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  code: "I01",
                  name: "Demand Sensing & Labour Telemetry",
                  score: 78,
                  mat: 4,
                  impl: 80,
                  e: "E3",
                },
                {
                  code: "I02",
                  name: "Employer Voice Architecture",
                  score: 80,
                  mat: 4,
                  impl: 82,
                  e: "E3",
                },
                {
                  code: "I03",
                  name: "Occupational Demand Mapping",
                  score: 76,
                  mat: 4,
                  impl: 78,
                  e: "E3",
                },
                {
                  code: "I04",
                  name: "Emerging Skill Detection Feeds",
                  score: 82,
                  mat: 4,
                  impl: 84,
                  e: "E4",
                },
                {
                  code: "I05",
                  name: "Regional Labour Market Relevance",
                  score: 74,
                  mat: 4,
                  impl: 76,
                  e: "E3",
                },
                {
                  code: "I06",
                  name: "Sector Demand Diversity Matrix",
                  score: 77,
                  mat: 4,
                  impl: 79,
                  e: "E3",
                },
                {
                  code: "I07",
                  name: "Employer Signal Reliability Check",
                  score: 79,
                  mat: 4,
                  impl: 81,
                  e: "E3",
                },
                {
                  code: "I08",
                  name: "Demand-to-Programme Translation",
                  score: 81,
                  mat: 4,
                  impl: 83,
                  e: "E4",
                },
                {
                  code: "I09",
                  name: "Future Demand Scenario Modeling",
                  score: 75,
                  mat: 4,
                  impl: 77,
                  e: "E3",
                },
                {
                  code: "I10",
                  name: "Decision Use of Labour Data",
                  score: 78,
                  mat: 4,
                  impl: 80,
                  e: "E3",
                },
                {
                  code: "I11",
                  name: "Demand Data Governance & Integrity",
                  score: 83,
                  mat: 4,
                  impl: 85,
                  e: "E4",
                },
                {
                  code: "I12",
                  name: "Continuous Intelligence Improvement",
                  score: 76,
                  mat: 4,
                  impl: 78,
                  e: "E3",
                },
              ].map((m) => (
                <div
                  key={m.code}
                  className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-teal">
                      {selectedDim}-{m.code}
                    </span>
                    <span className="font-semibold text-foreground ml-2">{m.name}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Maturity Anchor Level {m.mat} · Implementation Depth {m.impl}% · Verified
                      Evidence Level {m.e}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">{m.score} / 100</span>
                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      VERIFIED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Evidence Review */}
      {activeTab === "evidence" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Audited Institutional Evidence Dossier
            </h3>
            <p className="text-xs text-muted-foreground">
              Cryptographically verified institutional policies, syllabus review charters, and
              graduate census data:
            </p>

            <div className="space-y-3 pt-2">
              {sampleEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-teal">{ev.id}</span>
                      <span className="font-semibold text-foreground">{ev.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                      {ev.status} [Level: {ev.level}]
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Target: {ev.dim}-{ev.metric} | Verification Hash: {ev.hash}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Context & Required Maturity */}
      {activeTab === "context" && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Context Calibration & Required Maturity Architecture
          </h3>
          <p className="text-xs text-muted-foreground">
            Required maturity is context-derived based on institutional mandate, disciplinary
            consequence, and AI exposure. It does not alter raw capability scores.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                Mandate Weight
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">High Professional WIL</p>
              <p className="text-xs text-muted-foreground mt-1">
                14 accredited faculties requiring industry licensing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                Disciplinary Exposure
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">Advanced STEM & Health</p>
              <p className="text-xs text-muted-foreground mt-1">
                Demands Level 4 required maturity in WIL & Outcomes.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                Anti-Gaming Threshold
              </p>
              <p className="text-sm font-bold text-teal mt-0.5">Strict E3/E4 Gating</p>
              <p className="text-xs text-muted-foreground mt-1">
                All Level 4+ claims corroborated with audit hashes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Score Runs */}
      {activeTab === "runs" && (
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Deterministic Score Runs
          </h3>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-foreground">Score Run #1 (Certified Baseline)</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Executed: 2026-09-18 · Methodology: ECRI v6.0
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-teal">74.80 / 100</span>
                <span className="block text-[10px] text-emerald-600 font-semibold">
                  100% REPRODUCIBLE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
