import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe,
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileText,
  Lock,
  Building,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Wordmark } from "@/components/ari/wordmark";

export const Route = createFileRoute("/ecri/sample/profile")({
  component: EcriSamplePublicProfileView,
});

function EcriSamplePublicProfileView() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-border">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-teal/10 text-teal text-[11px] font-bold uppercase tracking-wider">
          <Globe className="size-3.5" /> Public Institutional Profile
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Verified Institutional Benchmark Credential</h1>
        <p className="text-xs text-muted-foreground">
          Public verification portal demonstrating certified employability credentials and transparency standards.
        </p>
      </div>

      {/* Verified Profile Card */}
      <div className="p-8 rounded-2xl bg-card border border-border shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> ECRI Assessed · 2026
              </span>
              <span className="text-xs font-mono text-muted-foreground">ID: ECRI-MAU-2026-CERT</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mt-2">Metropolitan Apex University</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Public State Chartered Research & Teaching University · Victoria & New South Wales, Australia
            </p>
          </div>

          <div className="text-left sm:text-right p-4 rounded-xl bg-teal/5 border border-teal/15">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Certified Overall Score</p>
            <div className="text-3xl font-serif font-bold text-teal mt-0.5">74.8 <span className="text-sm font-sans font-normal text-muted-foreground">/ 100</span></div>
            <p className="text-[11px] font-semibold text-foreground">Level 4 · Transformative</p>
          </div>
        </div>

        {/* 11 Dimensions Verified Scores */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Verified 11-Dimension Capability Assessment</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { code: "D01", name: "Employer Demand Intelligence", score: "78.0 / 100", status: "Level 4" },
              { code: "D02", name: "Employability Capability Framework", score: "72.0 / 100", status: "Level 4" },
              { code: "D03", name: "Industry-Aligned Curriculum", score: "81.0 / 100", status: "Level 4" },
              { code: "D04", name: "Experiential & Practice-Based Learning", score: "67.0 / 100", status: "Level 3" },
              { code: "D05", name: "Career Development Infrastructure", score: "76.0 / 100", status: "Level 4" },
              { code: "D06", name: "Professional & Human Capabilities", score: "74.0 / 100", status: "Level 4" },
              { code: "D07", name: "Digital & AI-Era Work Readiness", score: "79.0 / 100", status: "Level 4" },
              { code: "D08", name: "Portfolio & Capability Signalling", score: "69.0 / 100", status: "Level 3" },
              { code: "D09", name: "Employer Engagement & Recruitment", score: "77.0 / 100", status: "Level 4" },
              { code: "D10", name: "Employment Outcome Quality", score: "73.0 / 100", status: "Level 3" },
              { code: "D11", name: "Career Adaptability & Lifelong Mobility", score: "77.7 / 100", status: "Level 3" },
            ].map((d) => (
              <div key={d.code} className="p-3 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-teal">{d.code}</span>
                  <span className="font-semibold text-foreground">{d.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground">{d.score}</span>
                  <span className="block text-[10px] text-muted-foreground">{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Statement */}
        <div className="p-5 rounded-xl bg-muted/30 border border-border/60 space-y-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-teal" /> Assessor Verification & Cryptographic Provenance
          </p>
          <p className="leading-relaxed">
            This certified baseline was evaluated by independent ECRI adjudicators against the <strong>ECRI v6.0 Methodology</strong>.
            All capability claims above Level 2 have been corroborated with audited institutional artifacts under strict anti-gaming governance protocols.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-muted-foreground font-mono">
            <span>Cycle: 2026 Academic Baseline</span>
            <span>•</span>
            <span>Audited Metrics: 132 of 132</span>
            <span>•</span>
            <span>Evidence Level: E3+ Corroborated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
