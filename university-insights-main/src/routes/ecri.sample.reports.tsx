import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  BarChart3,
  Globe,
} from "lucide-react";

export const Route = createFileRoute("/ecri/sample/reports")({
  component: EcriSampleReportsView,
});

const reportCards = [
  {
    id: "RPT-ECRI-EXEC-001",
    title: "1. Executive Assessment Report",
    filename: "ECRI_Sample_Executive_Report.pdf",
    pageCount: "20 Pages (Exact Physical Count)",
    purpose: "Comprehensive executive briefing detailing institutional employability positioning, strengths, priority gaps, cross-domain pathways, and 3-horizon action roadmap.",
    audience: "Vice-Chancellor, Executive Board & Academic Council",
    url: "/samples/ECRI_Sample_Executive_Report.pdf",
    badge: "20-Page Full Dossier",
  },
  {
    id: "RPT-ECRI-DET-002",
    title: "2. Detailed 132-Metric Taxonomy Diagnostic",
    filename: "ECRI_Sample_Detailed_132_Metric_Report.pdf",
    pageCount: "14 Pages (Exact Physical Count)",
    purpose: "Exhaustive rubric-level audit documenting all 11 Dimensions × 12 Canonical Metrics (132 total metrics) with implementation scores and evidence levels.",
    audience: "Deans of Faculty, Heads of Department & Curriculum Committees",
    url: "/samples/ECRI_Sample_Detailed_132_Metric_Report.pdf",
    badge: "132 Canonical Metrics",
  },
  {
    id: "RPT-ECRI-BRD-003",
    title: "3. Boardroom Governance & Risk Scorecard",
    filename: "ECRI_Sample_Board_Scorecard.pdf",
    pageCount: "4 Pages (Exact Physical Count)",
    purpose: "High-level governance summary synthesizing capability radar balance, transformation distance matrix, and strategic board decisions.",
    audience: "University Council, Board of Governors & Trustees",
    url: "/samples/ECRI_Sample_Board_Scorecard.pdf",
    badge: "Board Briefing",
  },
  {
    id: "RPT-ECRI-EVI-004",
    title: "4. Evidence Integrity & Verification Dossier",
    filename: "ECRI_Sample_Evidence_Integrity_Dossier.pdf",
    pageCount: "4 Pages (Exact Physical Count)",
    purpose: "Audit trail report demonstrating multi-source artifact corroboration, cryptographic verification hashes, and anti-gaming safeguards.",
    audience: "Quality Assurance Units, Accreditation Bodies & Lead Adjudicators",
    url: "/samples/ECRI_Sample_Evidence_Integrity_Dossier.pdf",
    badge: "Audit & Traceability",
  },
  {
    id: "RPT-ECRI-RDM-005",
    title: "5. Strategic 3-Horizon Transformation Roadmap",
    filename: "ECRI_Sample_Transformation_Roadmap.pdf",
    pageCount: "4 Pages (Exact Physical Count)",
    purpose: "Actionable management blueprint phasing capability interventions across Now (90 days), Next (12 months), and Future (24 months) horizons.",
    audience: "Transformation Taskforces & Academic Leadership",
    url: "/samples/ECRI_Sample_Transformation_Roadmap.pdf",
    badge: "Action Blueprint",
  },
];

function EcriSampleReportsView() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-border">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-teal/10 text-teal text-[11px] font-bold uppercase tracking-wider">
          <FileText className="size-3.5" /> ECRI Report Centre
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Your ECRI Assessment Package</h1>
        <p className="text-xs text-muted-foreground">
          Five distinct institutional intelligence outputs generated from the single canonical assessment for <strong>Metropolitan Apex University (ECRI v6.0 · 74.8 / 100)</strong>.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="space-y-4">
        {reportCards.map((r, idx) => (
          <div
            key={r.id}
            className="p-6 rounded-2xl bg-card border border-border hover:border-teal/50 transition-all space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-wider">
                    {r.badge}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">{r.id}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mt-1.5">{r.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">{r.purpose}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                  <span><strong>Audience:</strong> {r.audience}</span>
                  <span>•</span>
                  <span><strong>Scope:</strong> {r.pageCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-teal text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-teal/90 transition-colors shadow-sm"
                >
                  <Download className="size-3.5" /> Download PDF
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
