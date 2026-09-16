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

export const Route = createFileRoute("/ecri/")({
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
          <Wordmark engine="ecri" />
          <span className="rounded bg-teal/10 px-2.5 py-1 text-xs font-semibold tracking-wider text-teal uppercase">
            ECRI Benchmark
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
            to="/ecri/login"
            className="text-sm font-semibold text-teal underline-offset-4 hover:underline"
          >
            Sign In to ECRI
          </Link>
          <button
            onClick={() => setEnquiryOpen(true)}
            className="hidden rounded-md border border-teal px-4 py-2 text-xs font-semibold text-teal transition-colors hover:bg-teal hover:text-white sm:inline-flex"
          >
            Contact Assessment Team
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <section className="pt-10 md:pt-16">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-teal uppercase">
              <Sparkles className="size-4" /> Higher Education Employability Benchmark
            </div>
            <h1 className="mt-4 text-[2.75rem] leading-[1.06] font-normal tracking-tight text-foreground md:text-[3.75rem] lg:text-[4.25rem]">
              Employability & Career Readiness Index{" "}
              <span className="font-serif italic text-teal">(ECRI)</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              An exhaustive, evidence-backed evaluation framework assessing higher education
              institutions across <strong>11 critical dimensions</strong> and{" "}
              <strong>132 canonical metrics</strong> of graduate employability, curriculum
              co-design, experiential learning, and labor market integration.
            </p>
          </div>

          {/* Value Highlights & Commercial CTA */}
          <div className="mt-10 flex flex-wrap items-center gap-6 rounded-2xl border border-teal/20 bg-teal/5 p-6 md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal">
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
                to="/ecri/login"
                className="inline-flex h-12 items-center gap-3 rounded-md bg-teal px-7 text-sm font-medium text-white shadow-raised transition-all hover:bg-teal/90 hover:shadow-lg"
              >
                Enter ECRI Workspace
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
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-teal/40 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal bg-teal/10 px-2 py-0.5 rounded">
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

        {/* Effort, Evidence & Time Commitment */}
        <section className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="size-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal mb-4">
              <Clock className="size-5" />
            </div>
            <h3 className="font-bold text-foreground text-base">Effort & Time Commitment</h3>
            <p className="text-xs leading-relaxed text-muted-foreground mt-2">
              Around <strong>3–4 hours of senior time</strong> across multiple sittings. Save/resume
              is fully supported.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="size-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal mb-4">
              <FileCheck2 className="size-5" />
            </div>
            <h3 className="font-bold text-foreground text-base">Progressive Evidence</h3>
            <p className="text-xs leading-relaxed text-muted-foreground mt-2">
              Evidence can be uploaded progressively. One document can support multiple metrics.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="size-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal mb-4">
              <Lock className="size-5" />
            </div>
            <h3 className="font-bold text-foreground text-base">Strict Confidentiality</h3>
            <p className="text-xs leading-relaxed text-muted-foreground mt-2">
              Institutional responses and submitted evidence remain private to your leadership.
            </p>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="mt-20 rounded-2xl bg-slate-900 p-8 md:p-14 text-white text-center border border-teal/20">
          <h2 className="text-2xl md:text-4xl font-normal font-sans tracking-tight">
            Benchmark and Transform Your Institution's Career Readiness
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-slate-300 leading-relaxed">
            Gain executive clarity on graduate employability, employer integration, and curriculum
            modernization with the research-grade ECRI framework.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/ecri/login"
              className="inline-flex h-12 items-center gap-3 rounded-md bg-teal px-8 text-sm font-bold text-white shadow-raised transition-transform hover:scale-105"
            >
              Enter ECRI Assessment Workspace
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
                  className="mt-6 rounded-md bg-teal px-6 py-2 text-xs font-bold text-white hover:bg-teal/90"
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
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
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
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
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
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
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
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
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
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
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
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
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
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
                      placeholder="Details on your institutional cohort or timeline..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-teal py-2.5 text-sm font-bold text-white hover:bg-teal/90 disabled:opacity-60"
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
