import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Clock,
  FileCheck2,
  Lock,
  ScrollText,
  CheckCircle2,
  Award,
  Building2,
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
  Map,
  ShieldCheck,
  Mail,
  Phone,
  Send,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";

export const Route = createFileRoute("/ecri")({
  head: () => ({
    meta: [
      { title: "ECRI — Employability & Career Readiness Index | Institutional Assessment" },
      {
        name: "description",
        content:
          "Comprehensive institutional evaluation framework assessing higher education universities across 11 critical dimensions of employability, curriculum co-design, experiential learning, and labor market integration.",
      },
    ],
  }),
  component: EcriProductPage,
});

const ecriDimensions = [
  {
    code: "D01",
    name: "Institutional Strategy, Employability Governance & Resourcing",
    desc: "Board-level mandate, dedicated employability budget, and leadership accountability.",
  },
  {
    code: "D02",
    name: "Industry Ecosystem, Partnerships & Employer Integration",
    desc: "Tier-1 corporate advisory councils, co-branded labs, and structured employer roundtables.",
  },
  {
    code: "D03",
    name: "Curriculum Co-Design, Skills Forecasting & Modernization",
    desc: "Annual employer syllabus reviews, emerging tech/AI literacy, and practical lab weighting.",
  },
  {
    code: "D04",
    name: "Experiential Learning, Internships & Work-Integrated Learning",
    desc: "Mandatory credit-bearing internships (>12 weeks), live capstones, and employer evaluations.",
  },
  {
    code: "D05",
    name: "Career Services, Guidance, Mentorship & Student Agency",
    desc: "4-year career navigation, 1-on-1 counseling, ATS resume clinics, and alumni mentorship.",
  },
  {
    code: "D06",
    name: "Applied Competencies, Digital Proficiency & Transversal Skills",
    desc: "Critical thinking, domain digital software mastery, quantitative reasoning, and communication.",
  },
  {
    code: "D07",
    name: "Assessment Integrity, Authentic Evaluation & Industry Certification",
    desc: "Real-world performance evaluations, viva voce, simulation exams, and micro-credentials.",
  },
  {
    code: "D08",
    name: "Entrepreneurship, Venture Creation & Innovation Ecosystem",
    desc: "Campus incubator (TBI), seed funding access, startup mentoring, and academic IP support.",
  },
  {
    code: "D09",
    name: "Placement Architecture, Corporate Relations & Career Outcomes",
    desc: "Campus recruitment infrastructure, median CTC trajectory, verified placement conversion.",
  },
  {
    code: "D10",
    name: "Alumni Engagement, Career Tracking & Lifelong Progression",
    desc: "Longitudinal 3-5-10 year career tracking, alumni hiring networks, and lifelong reskilling.",
  },
  {
    code: "D11",
    name: "Continuous Calibration, Evidence Intelligence & Labor Market Alignment",
    desc: "Employer satisfaction audits (ESI), graduate salary audits, and real-time evidence integrity.",
  },
];

const sampleReports = [
  {
    id: "executive-report",
    title: "Executive Assessment Report (PDF)",
    tag: "Board Ready",
    desc: "A premium, publication-grade analytical dossier presenting your institution's global ECRI index, dimension radar, maturity distribution, and executive imperatives.",
    icon: FileSpreadsheet,
    badge: "15 Pages · Executive Summary",
  },
  {
    id: "scoreboard",
    title: "Institutional Scoreboard & PDF",
    tag: "Interactive Analytics",
    desc: "Interactive visual matrix comparing Capability (M), Implementation Depth (I), and Graduate Outcomes (O) against sector benchmarks.",
    icon: BarChart3,
    badge: "11 Dimensions · 132 Metrics",
  },
  {
    id: "gap-analysis",
    title: "Detailed Gap Analysis",
    tag: "Diagnostic Precision",
    desc: "Granular comparison of Observed Maturity vs Required Context Maturity across all 132 canonical metrics with automated priority scoring.",
    icon: ShieldCheck,
    badge: "Observed vs Required",
  },
  {
    id: "transformation-roadmap",
    title: "Transformation Roadmap",
    tag: "Action Plan",
    desc: "Sequenced 12–36 month institutional intervention strategy mapping high-impact capability investments, curriculum renewals, and employer partnerships.",
    icon: Map,
    badge: "12-36 Month Interventions",
  },
];

function EcriProductPage() {
  const [activeSample, setActiveSample] = useState(0);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    institutionName: "",
    designation: "",
    email: "",
    phone: "",
    whatsapp: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ctaText, setCtaText] = useState("Begin Institutional ECRI Assessment");
  const [price, setPrice] = useState("$4,999 USD");

  useEffect(() => {
    // Fetch product pricing and CTA configs if available
    const root =
      typeof window !== "undefined" &&
      (window.location.port === "8080" ||
        window.location.port === "5173" ||
        window.location.port === "3000")
        ? `${window.location.protocol}//${window.location.hostname}:4000`
        : "http://localhost:4000";

    fetch(`${root}/api/v1/products`)
      .then((res) => res.json())
      .then(
        (
          products: Array<{
            code: string;
            amount?: number | string;
            currency?: string;
            cta_text?: string;
          }>,
        ) => {
          const ecri = products.find((p) => p.code === "ecri");
          if (ecri) {
            if (ecri.amount)
              setPrice(`$${Number(ecri.amount).toLocaleString()} ${ecri.currency || "USD"}`);
            if (ecri.cta_text) setCtaText(ecri.cta_text);
          }
        },
      )
      .catch(() => {});
  }, []);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const root =
        typeof window !== "undefined" &&
        (window.location.port === "8080" ||
          window.location.port === "5173" ||
          window.location.port === "3000")
          ? `${window.location.protocol}//${window.location.hostname}:4000`
          : "http://localhost:4000";

      await fetch(`${root}/api/v1/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...enquiryForm, productCode: "ecri" }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-4">
          <Wordmark />
          <span className="rounded bg-navy/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-navy uppercase">
            ECRI Index
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            All Assessments
          </Link>
          <Link
            to="/overview"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Existing Assessment
          </Link>
          <button
            onClick={() => setEnquiryOpen(true)}
            className="hidden rounded-md border border-navy px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-navy hover:text-white sm:inline-flex"
          >
            Contact Assessment Team
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <section className="pt-10 md:pt-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-navy uppercase">
              <Sparkles className="size-4" /> Higher Education Employability Benchmark
            </div>
            <h1 className="mt-4 text-[2.75rem] leading-[1.06] font-normal tracking-tight text-foreground md:text-[3.75rem] lg:text-[4.25rem]">
              Employability & Career Readiness Index{" "}
              <span className="font-serif italic text-navy">(ECRI)</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              An exhaustive, evidence-backed evaluation framework assessing higher education
              institutions across <strong>11 critical dimensions</strong> and{" "}
              <strong>132 canonical metrics</strong> of graduate employability, curriculum
              co-design, experiential learning, and labor market integration.
            </p>
          </div>

          {/* Value Highlights & Commercial CTA */}
          <div className="mt-10 flex flex-wrap items-center gap-6 rounded-2xl border border-navy/15 bg-navy/5 p-6 md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-navy">
                Standard Institutional Assessment
              </p>
              <p className="mt-1 text-3xl font-bold text-foreground">{price}</p>
              <p className="text-xs text-muted-foreground">
                Complete 11-dimension institutional evaluation & report ecosystem
              </p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block"></div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/profile"
                className="inline-flex h-12 items-center gap-3 rounded-md bg-navy px-7 text-sm font-medium text-primary-foreground shadow-raised transition-all hover:bg-navy-deep hover:shadow-lg"
              >
                {ctaText}
                <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={() => setEnquiryOpen(true)}
                className="inline-flex h-12 items-center gap-2 rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Mail className="size-4" />
                Request Institutional Consultation
              </button>
            </div>
          </div>
        </section>

        {/* 11 Dimensions Matrix */}
        <section className="mt-20">
          <div className="border-b border-border pb-4">
            <p className="eyebrow">Methodology Architecture</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              The 11 Dimensions of Graduate Employability
            </h2>
            <p className="text-sm text-muted-foreground">
              Exhaustive coverage of governance, employer partnerships, curriculum co-design, and
              long-term career outcomes.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ecriDimensions.map((d) => (
              <div
                key={d.code}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-navy/40 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-navy bg-navy/10 px-2 py-0.5 rounded">
                    {d.code}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground">12 Metrics</span>
                </div>
                <h3 className="mt-3 font-sans text-sm font-semibold text-foreground leading-snug">
                  {d.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sample Output Showcase */}
        <section className="mt-24 rounded-2xl border border-border bg-muted/30 p-8 md:p-12">
          <div className="max-w-3xl">
            <p className="eyebrow">Institutional Intelligence Ecosystem</p>
            <h2 className="mt-1 text-2xl md:text-3xl font-bold text-foreground">
              What Your Institution Receives
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every completed ECRI assessment produces a coherent, multi-format decision package
              derived strictly from a single canonical frozen assessment payload.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sampleReports.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => setActiveSample(idx)}
                className={`flex flex-col text-left rounded-xl border p-5 transition-all ${
                  activeSample === idx
                    ? "border-navy bg-card shadow-card ring-1 ring-navy"
                    : "border-border bg-card/60 hover:bg-card"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <r.icon
                    className={`size-5 ${activeSample === idx ? "text-navy" : "text-muted-foreground"}`}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {r.tag}
                  </span>
                </div>
                <h4 className="mt-4 font-sans text-sm font-semibold text-foreground">{r.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.desc}</p>
                <span className="mt-4 text-[11px] font-mono text-navy font-semibold">
                  {r.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Sample Preview Card */}
          <div className="mt-8 rounded-xl border border-border bg-card p-6 md:p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-navy">
                  Sample Output Demonstration
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">
                  {sampleReports[activeSample]?.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sampleReports[activeSample]?.desc}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Derived from Canonical Payload
                </span>
                <Link
                  to="/profile"
                  className="rounded-md bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-deep"
                >
                  Start Assessment
                </Link>
              </div>
            </div>

            {/* Visual Representation */}
            <div className="mt-6 rounded-lg bg-muted/40 p-6">
              {activeSample === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-navy text-white p-4 rounded">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/70">
                        Executive Assessment Report
                      </p>
                      <h4 className="text-base font-bold">
                        Apex National University — ECRI 2026 Baseline
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">Overall ECRI Score</p>
                      <p className="text-2xl font-bold font-mono">78.4 / 100</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-card p-3 rounded border">
                      <p className="text-xs text-muted-foreground">Maturity Level</p>
                      <p className="text-sm font-bold text-navy">Level 4: Integrated</p>
                    </div>
                    <div className="bg-card p-3 rounded border">
                      <p className="text-xs text-muted-foreground">Evidence Confidence</p>
                      <p className="text-sm font-bold text-emerald-600">High (E3 Verified)</p>
                    </div>
                    <div className="bg-card p-3 rounded border">
                      <p className="text-xs text-muted-foreground">Transformation Priority</p>
                      <p className="text-sm font-bold text-amber-600">D03 & D04 Focus</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSample === 1 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold border-b pb-2">
                    <span>Dimension</span>
                    <span>Score (0-100)</span>
                    <span>Maturity Tier</span>
                  </div>
                  {ecriDimensions.slice(0, 5).map((d, i) => (
                    <div
                      key={d.code}
                      className="flex justify-between items-center text-xs py-1.5 border-b border-dashed"
                    >
                      <span className="font-medium text-foreground">
                        {d.code} — {d.name}
                      </span>
                      <span className="font-mono font-bold text-navy">
                        {[82, 88, 71, 74, 85][i]}%
                      </span>
                      <span className="rounded bg-navy/10 px-2 py-0.5 text-[10px] font-semibold text-navy">
                        {["Integrated", "Integrated", "Structured", "Structured", "Integrated"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeSample === 2 && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold border-b pb-2">
                    <span>Metric Code & Name</span>
                    <span>Observed</span>
                    <span>Required</span>
                    <span>Gap Priority</span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2 border-b border-dashed">
                    <span className="font-medium">D03-M01: Annual Industry Curriculum Review</span>
                    <span className="font-mono text-amber-600">Level 2</span>
                    <span className="font-mono text-emerald-600">Level 4</span>
                    <span className="rounded bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">
                      Critical Priority
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs py-2 border-b border-dashed">
                    <span className="font-medium">
                      D04-M01: Mandatory 12+ Week Credit Internships
                    </span>
                    <span className="font-mono text-amber-600">Level 3</span>
                    <span className="font-mono text-emerald-600">Level 4</span>
                    <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                      Medium Priority
                    </span>
                  </div>
                </div>
              )}

              {activeSample === 3 && (
                <div className="space-y-3">
                  <div className="rounded border bg-card p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-navy">
                        Horizon 1: 0–6 Months (Foundation)
                      </span>
                      <span className="text-[10px] font-bold bg-navy/10 text-navy px-2 py-0.5 rounded">
                        High Impact
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Establish Governing Board Employability Committee & mandate industry co-design
                      on top 5 major degrees.
                    </p>
                  </div>
                  <div className="rounded border bg-card p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-navy">
                        Horizon 2: 6–18 Months (Scale)
                      </span>
                      <span className="text-[10px] font-bold bg-navy/10 text-navy px-2 py-0.5 rounded">
                        Core Transformation
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Institutionalize 12-week mandatory internships with corporate supervisor
                      rubrics and pre-placement offer tracking.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Effort, Evidence & Time Commitment */}
        <section className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="size-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy mb-4">
              <Clock className="size-5" />
            </div>
            <h3 className="font-bold text-foreground text-base">Effort & Time Commitment</h3>
            <p className="text-xs leading-relaxed text-muted-foreground mt-2">
              Around <strong>3–4 hours of senior time</strong> across multiple sittings. Save/resume
              is fully supported. Sections can be completed collaboratively by designated
              institutional leads.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="size-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy mb-4">
              <FileCheck2 className="size-5" />
            </div>
            <h3 className="font-bold text-foreground text-base">Progressive Evidence</h3>
            <p className="text-xs leading-relaxed text-muted-foreground mt-2">
              Evidence can be uploaded progressively. One document (e.g. Academic Council minutes)
              can support multiple metrics. Anti-gaming protection ensures authentic verification.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="size-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy mb-4">
              <Lock className="size-5" />
            </div>
            <h3 className="font-bold text-foreground text-base">Strict Confidentiality</h3>
            <p className="text-xs leading-relaxed text-muted-foreground mt-2">
              Institutional responses and submitted evidence remain the private property of your
              leadership. Reports are only certified after external assessor calibration and
              adjudication.
            </p>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="mt-20 rounded-2xl bg-navy p-8 md:p-14 text-white text-center">
          <h2 className="text-2xl md:text-4xl font-normal font-sans tracking-tight">
            Benchmark and Transform Your Institution's Career Readiness
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-white/80 leading-relaxed">
            Gain executive clarity on graduate employability, employer integration, and curriculum
            modernization with the research-grade ECRI framework.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/profile"
              className="inline-flex h-12 items-center gap-3 rounded-md bg-white px-8 text-sm font-bold text-navy shadow-raised transition-transform hover:scale-105"
            >
              {ctaText}
              <ArrowRight className="size-4" />
            </Link>
            <button
              onClick={() => setEnquiryOpen(true)}
              className="inline-flex h-12 items-center gap-2 rounded-md border border-white/30 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Mail className="size-4" /> Contact Assessment Team
            </button>
          </div>
        </section>
      </main>

      {/* Institutional Enquiry Modal */}
      {enquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl">
            <button
              onClick={() => {
                setEnquiryOpen(false);
                setSubmitted(false);
              }}
              className="absolute right-5 top-5 text-muted-foreground hover:text-foreground text-lg"
            >
              ✕
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle2 className="size-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground">Enquiry Received</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  Thank you for reaching out. Our Higher Education assessment advisory team will
                  contact you within 1 business day.
                </p>
                <button
                  onClick={() => {
                    setEnquiryOpen(false);
                    setSubmitted(false);
                  }}
                  className="mt-6 rounded-md bg-navy px-6 py-2 text-xs font-bold text-white hover:bg-navy-deep"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-foreground">Institutional Enquiry</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Connect with the ECRI Assessment Advisory Team regarding your institution.
                </p>

                <form onSubmit={handleEnquirySubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.name}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                      placeholder="Dr. / Prof. / Registrar"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.institutionName}
                      onChange={(e) =>
                        setEnquiryForm({ ...enquiryForm, institutionName: e.target.value })
                      }
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                      placeholder="University / Institute Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={enquiryForm.designation}
                        onChange={(e) =>
                          setEnquiryForm({ ...enquiryForm, designation: e.target.value })
                        }
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                        placeholder="Dean / IQAC Director"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={enquiryForm.email}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                        placeholder="leadership@university.edu"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={enquiryForm.phone}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                        placeholder="+91 / +1 ..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        WhatsApp (Optional)
                      </label>
                      <input
                        type="tel"
                        value={enquiryForm.whatsapp}
                        onChange={(e) =>
                          setEnquiryForm({ ...enquiryForm, whatsapp: e.target.value })
                        }
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                        placeholder="For quick communication"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Message / Key Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                      placeholder="Details on your institutional cohort or timeline..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-navy py-2.5 text-sm font-bold text-white hover:bg-navy-deep disabled:opacity-60"
                  >
                    <Send className="size-4" />{" "}
                    {submitting ? "Submitting..." : "Submit Institutional Enquiry"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:px-10">
          <span>
            © 2026 Employability & Career Readiness Index (ECRI) · Higher Education Benchmark
          </span>
          <span>Official Institutional Assessment Module</span>
        </div>
      </footer>
    </div>
  );
}
