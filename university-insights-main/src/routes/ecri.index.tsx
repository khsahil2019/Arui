import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Download,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  LineChart,
  Lock,
  Mail,
  Map,
  PieChart,
  RefreshCw,
  ScrollText,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";

export const Route = createFileRoute("/ecri/")({
  head: () => ({
    meta: [
      {
        title:
          "ECRI — Employability & Career Readiness Intelligence | Institutional Assessment Instrument",
      },
      {
        name: "description",
        content:
          "A premium institutional assessment, intelligence and transformation instrument for higher education evaluating universities across 11 dimensions and 132 metrics of graduate employability, curriculum co-design, and work-integrated learning.",
      },
    ],
  }),
  component: EcriPublicExperiencePage,
});

/* -------------------------------------------------------------------------- */
/* AUTHORITATIVE 11 DIMENSIONS DATA                                           */
/* -------------------------------------------------------------------------- */
const ecriDimensionsData = [
  {
    code: "D01",
    name: "Employer Demand Intelligence",
    shortName: "Demand Intelligence",
    theme: "Market Demand & Sensing",
    metricCount: 12,
    weight: "8%",
    sampleScore: 78,
    sampleMaturity: 4,
    level: "Established",
    desc: "Labor market forecasting, employer demand sensing, and strategic industry intelligence.",
    strengths: [
      "Quarterly employer advisory councils across engineering and business schools.",
      "Real-time labor market telemetry integrated into annual academic planning.",
    ],
    gaps: [
      "Humanities and basic sciences lack structured employer demand forecasting.",
      "Unsynchronized placement trends between regional and multinational recruiters.",
    ],
    implications:
      "Establish cross-faculty industry sensing panels to ensure non-STEM programmes receive proactive curriculum alignment.",
  },
  {
    code: "D02",
    name: "Industry Ecosystem & Partnerships",
    shortName: "Industry Partnerships",
    theme: "Corporate Ecosystem",
    metricCount: 12,
    weight: "11%",
    sampleScore: 72,
    sampleMaturity: 4,
    level: "Established",
    desc: "Active corporate MoUs, Departmental Industry Advisory Boards, corporate labs, and recruiter summits.",
    strengths: [
      "Quarterly employer advisory councils active across major faculties.",
      "Over 350 active corporate hiring partners recruiting annually.",
    ],
    gaps: [
      "Departmental advisory board minutes lack systematic follow-up in humanities.",
      "Corporate lab co-investment remains concentrated in computer science.",
    ],
    implications:
      "Expand structured Industry Advisory Boards to 100% of academic faculties with formal curriculum co-design sign-offs.",
  },
  {
    code: "D03",
    name: "Curriculum Co-Design & Modernization",
    shortName: "Curriculum Co-Design",
    theme: "Curricular Relevance",
    metricCount: 12,
    weight: "11%",
    sampleScore: 81,
    sampleMaturity: 4,
    level: "Established",
    desc: "External industry participation on Board of Studies, syllabus modernization cadences, and agile electives.",
    strengths: [
      "Mandatory 20% industry co-teaching requirement in all professional faculties.",
      "Annual curriculum revision cycle incorporating emerging industry technologies.",
    ],
    gaps: [
      "Interdisciplinary elective options are constrained by rigid timetable scheduling.",
      "Limited modular certification integration within mainstream degree pathways.",
    ],
    implications:
      "Expand stackable micro-credentials recognized by Tier-1 corporate partners across all undergraduate tracks.",
  },
  {
    code: "D04",
    name: "Experiential & Practice-Based Learning",
    shortName: "Experiential Learning",
    theme: "Work-Integrated Learning (WIL)",
    metricCount: 12,
    weight: "12%",
    sampleScore: 67,
    sampleMaturity: 3,
    level: "Developing",
    desc: "Work-Integrated Learning (WIL), structured credit-bearing internships, and live industry capstones.",
    strengths: [
      "Mandatory 8-week summer internship for 100% of undergraduate engineering students.",
      "Active industry-sponsored prototyping labs on campus.",
    ],
    gaps: [
      "Internships are not credit-weighted across liberal arts and social sciences.",
      "Employer structured feedback during internships is only collected in 45% of placements.",
    ],
    implications:
      "Transition all internships into 12-to-16 week credit-bearing Work-Integrated Learning (WIL) modules with validated supervisor rubrics.",
  },
  {
    code: "D05",
    name: "Career Development Infrastructure",
    shortName: "Career Infrastructure",
    theme: "Career Services & Navigation",
    metricCount: 12,
    weight: "10%",
    sampleScore: 76,
    sampleMaturity: 4,
    level: "Established",
    desc: "Institutional career services, 4-year career pathways, personalized navigation, and employer clinics.",
    strengths: [
      "Dedicated Central Career Services hub with 12 full-time professional advisors.",
      "First-year mandatory career discovery and diagnostic profiling.",
    ],
    gaps: [
      "Student-to-career-counselor ratio of 850:1 exceeds the benchmark standard of 400:1.",
      "Limited targeted support for students seeking non-traditional and startup pathways.",
    ],
    implications:
      "Deploy digital career navigation toolkits and alumni peer-mentorship networks to scale guidance capacity.",
  },
  {
    code: "D06",
    name: "Applied Competencies & Transversal Skills",
    shortName: "Transversal Skills",
    theme: "Human & Digital Competencies",
    metricCount: 12,
    weight: "10%",
    sampleScore: 74,
    sampleMaturity: 4,
    level: "Established",
    desc: "Critical thinking, professional communication, AI fluency, problem-solving, and team collaboration.",
    strengths: [
      "Embedded communication and negotiation modules across all second-year curricula.",
      "Universal Python and data literacy foundation for all incoming undergraduate cohorts.",
    ],
    gaps: [
      "Formal assessment of executive presence and ethical workplace dilemmas is absent.",
      "Uneven faculty training on facilitating active team-based experiential learning.",
    ],
    implications:
      "Introduce authentic viva-voce and collaborative project defenses evaluated by external industry panels.",
  },
  {
    code: "D07",
    name: "Assessment Integrity & Authentic Evaluation",
    shortName: "Authentic Assessment",
    theme: "Evaluation Veracity",
    metricCount: 12,
    weight: "9%",
    sampleScore: 79,
    sampleMaturity: 4,
    level: "Established",
    desc: "Authentic workplace evaluations, oral pitches, external industry moderators, and micro-credentials.",
    strengths: [
      "Embedded professional micro-credentials (AWS, Microsoft, Google) across tech and business degrees.",
      "Oral capstone defenses moderated by external industry examiners.",
    ],
    gaps: [
      "Traditional rote memorization written exams remain in foundational courses.",
      "Lack of standardized rubrics for client-facing student consulting presentations.",
    ],
    implications:
      "Replace 50% of traditional end-semester exams with authentic scenario-based industry portfolio projects.",
  },
  {
    code: "D08",
    name: "Entrepreneurship & Venture Creation",
    shortName: "Venture Creation",
    theme: "Innovation & Startups",
    metricCount: 12,
    weight: "8%",
    sampleScore: 69,
    sampleMaturity: 3,
    level: "Developing",
    desc: "Incubation infrastructure, student seed grant funds, patent support, and founder mentorship.",
    strengths: [
      "Established Technology Business Incubator (TBI) supporting 28 active student startups.",
      "Annual venture pitch competition with INR 25 Lakhs seed grant pool.",
    ],
    gaps: [
      "Venture creation support is isolated to engineering and management faculties.",
      "Longitudinal tracking of venture survival and external VC funding is uncoordinated.",
    ],
    implications:
      "Create cross-disciplinary venture creation studios open to arts, sciences, and design students.",
  },
  {
    code: "D09",
    name: "Placement Architecture & Corporate Relations",
    shortName: "Placement Architecture",
    theme: "Recruitment Governance",
    metricCount: 12,
    weight: "11%",
    sampleScore: 77,
    sampleMaturity: 4,
    level: "Established",
    desc: "Audited placement ledger, median CTC growth, repeat recruiters, and unplaced student clinics.",
    strengths: [
      "Audited annual placement report with transparent salary distribution records.",
      "420+ repeat corporate recruiters visiting campus annually.",
    ],
    gaps: [
      "Recruiter diversification needed in clean energy, biotechnology, and public policy.",
      "Unplaced student intervention clinics need formal tracking protocols.",
    ],
    implications:
      "Institute specialized career recovery bootcamps for unplaced students 90 days prior to graduation.",
  },
  {
    code: "D10",
    name: "Employment Outcome Quality",
    shortName: "Outcome Quality",
    theme: "Market Performance & Trajectory",
    metricCount: 12,
    weight: "4%",
    sampleScore: 73,
    sampleMaturity: 3,
    level: "Developing",
    desc: "Longitudinal 3/5/10-year career tracking, median CTC progression, and alumni mentoring networks.",
    strengths: [
      "86% verified employment / higher education progression rate within 6 months of graduation.",
      "Active alumni mentorship circles across major metro hubs.",
    ],
    gaps: [
      "Lack of longitudinal tracking on 3-year and 5-year career promotions.",
      "Underemployment reporting in non-technical faculties lacks statutory verification.",
    ],
    implications:
      "Deploy automated alumni destination telemetry to track lifelong promotion trajectories and career shifts.",
  },
  {
    code: "D11",
    name: "Continuous Improvement & Labor Market Calibration",
    shortName: "Continuous Calibration",
    theme: "Institutional Learning",
    metricCount: 12,
    weight: "4%",
    sampleScore: 77.7,
    sampleMaturity: 3,
    level: "Developing",
    desc: "Annual Employer Satisfaction Index audits, dean remediation plans, and labor market intelligence loops.",
    strengths: [
      "Annual Employer Satisfaction Index (ESI) conducted across 150+ hiring managers.",
      "Dean-level employability improvement plans reviewed annually.",
    ],
    gaps: [
      "Labor market trend analysis is not formally integrated into annual faculty budgeting.",
      "Department-level remediation cycles lack independent QA sign-off.",
    ],
    implications:
      "Close the continuous learning loop by linking annual department budgets directly to validated ECRI action progress.",
  },
];

function EcriPublicExperiencePage() {
  const [activeTab, setActiveTab] = useState<
    "scoreboard" | "dimensions" | "analytics" | "gaps" | "evolution" | "reports"
  >("scoreboard");
  const [selectedDimension, setSelectedDimension] = useState<(typeof ecriDimensionsData)[number]>(
    (ecriDimensionsData[3] ?? ecriDimensionsData[0])!,
  );
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [consultForm, setConsultForm] = useState({
    name: "",
    institutionName: "",
    designation: "",
    email: "",
    phone: "",
    message: "",
  });
  const [consultSubmitted, setConsultSubmitted] = useState(false);
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultError, setConsultError] = useState<string | null>(null);

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultSubmitting(true);
    setConsultError(null);
    try {
      const envUrl = (import.meta.env["VITE_ARUI_API_BASE_URL"] as string | undefined)
        ?.trim()
        ?.replace(/\/$/, "");
      let root = "";
      if (envUrl) {
        root = envUrl;
      } else if (
        typeof window !== "undefined" &&
        (window.location.port === "8080" ||
          window.location.port === "5173" ||
          window.location.port === "3000")
      ) {
        root = `${window.location.protocol}//${window.location.hostname}:4000`;
      } else if (typeof window !== "undefined") {
        root = window.location.origin;
      }

      const res = await fetch(`${root}/api/v1/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...consultForm, productCode: "ecri" }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Server responded with status ${res.status}`,
        );
      }

      setConsultSubmitted(true);
    } catch (err: any) {
      console.error("Enquiry submission failed:", err);
      setConsultError(
        err.message ||
          "Failed to submit enquiry. Please try again or contact evaluations@ecri.org directly.",
      );
    } finally {
      setConsultSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-teal selection:text-white">
      {/* -------------------------------------------------------------------- */}
      {/* TOP INSTITUTIONAL HEADER                                             */}
      {/* -------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-4">
            <Wordmark engine="ecri" />
            <span className="hidden sm:inline-flex rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-teal">
              Institutional Assessment Instrument
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              to="/"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Master Portal
            </Link>
            <Link
              to="/ecri/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:underline"
            >
              <span>Sign In to Workspace</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <button
              onClick={() => setConsultModalOpen(true)}
              className="hidden md:inline-flex items-center justify-center rounded-lg bg-teal px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-teal/90 hover:shadow"
            >
              Request an ECRI Assessment
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-28 md:px-10">
        {/* ------------------------------------------------------------------ */}
        {/* HERO SECTION (VALUE-FIRST, ZERO PRICING)                           */}
        {/* ------------------------------------------------------------------ */}
        <section className="pt-12 pb-8 md:pt-16 md:pb-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal mb-4">
              <Sparkles className="size-3.5 text-teal" />
              <span>Higher Education Advisory · Assessment & Intelligence Instrument</span>
            </div>

            <h1 className="text-4xl font-serif leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Employability & Career Readiness Intelligence{" "}
              <span className="italic font-serif text-teal">(ECRI)</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-muted-foreground max-w-3xl">
              An authoritative institutional assessment and transformation instrument for higher
              education leadership. Evaluates universities across <strong>11 Dimensions</strong> and{" "}
              <strong>132 Canonical Metrics</strong> spanning employer demand forecasting,
              curriculum co-design, Work-Integrated Learning (WIL), and graduate career progression.
            </p>

            {/* Quick Action & Consultative Engagement Banner */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/ecri/sample"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-6 py-3 text-sm font-bold text-white shadow-raised transition-all hover:bg-teal/90 hover:shadow-lg"
              >
                <Eye className="size-4" />
                <span>Explore Sample ECRI Assessment</span>
                <ArrowRight className="size-4" />
              </Link>

              <button
                onClick={() => {
                  const el = document.getElementById("enquiry-form-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition-colors hover:border-teal hover:text-teal"
              >
                <Mail className="size-4" />
                <span>Discuss ECRI With Our Advisory Team</span>
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* THE SAMPLE EXPERIENCE (THE CENTERPIECE OF /ecri)                  */}
        {/* ------------------------------------------------------------------ */}
        <section
          id="sample-experience-section"
          className="mt-6 rounded-2xl border-2 border-teal/30 bg-card p-6 shadow-xl md:p-8 relative overflow-hidden"
        >
          {/* Subtle decorative background watermark */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 size-96 rounded-full bg-teal/5 blur-3xl pointer-events-none" />

          {/* Sample Banner & Institutional Context */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-3.5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-teal font-serif text-lg font-bold text-white shadow-md">
                MU
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Metropolitan Apex University
                  </h3>
                  <span className="rounded bg-teal/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal">
                    Illustrative Sample
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Autonomous State University · Enrolment: 18,500 · 11 Evaluated Dimensions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground">
                ECRI Benchmark Version:
              </span>
              <span className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-bold text-foreground">
                ECRI v6.0 Calibrated
              </span>
            </div>
          </div>

          {/* Interactive Navigation Tabs for the Sample */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
            <button
              onClick={() => setActiveTab("scoreboard")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "scoreboard"
                  ? "bg-teal text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <BarChart3 className="size-4" />
              <span>01 — Executive Scoreboard</span>
            </button>

            <button
              onClick={() => setActiveTab("dimensions")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dimensions"
                  ? "bg-teal text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Layers className="size-4" />
              <span>02 — 11 Dimensions Deep Dive</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-teal text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <PieChart className="size-4" />
              <span>03 — Visual Analytics Hub</span>
            </button>

            <button
              onClick={() => setActiveTab("gaps")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "gaps"
                  ? "bg-teal text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Map className="size-4" />
              <span>04 — Transformation Gap</span>
            </button>

            <button
              onClick={() => setActiveTab("evolution")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "evolution"
                  ? "bg-teal text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <TrendingUp className="size-4" />
              <span>05 — Living Assessment & Evolution</span>
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "bg-teal text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="size-4" />
              <span>06 — Boardroom Reports & PDF</span>
            </button>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* TAB 1: EXECUTIVE SCOREBOARD                                      */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "scoreboard" && (
            <div className="mt-8 space-y-8 animate-in fade-in duration-300">
              {/* Overall Index Hero Card */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border-2 border-teal/40 bg-teal/[0.04] p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal">
                      Overall ECRI Benchmark Score
                    </span>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-5xl font-serif font-bold text-foreground">74.8</span>
                      <span className="text-sm font-semibold text-muted-foreground">/ 100</span>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-teal/15 px-3 py-1 text-xs font-bold text-teal">
                      <CheckCircle2 className="size-3.5" />
                      <span>Level 4 · Established Practice</span>
                    </div>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                      The institution demonstrates robust employer co-teaching and strong 6-month
                      graduate placement, with priority transformation required in Work-Integrated
                      Learning (WIL) credit weighting and alumni longitudinal tracking.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-teal/20 flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>11 Dimensions Assessed</span>
                    <span>132 Metrics Evaluated</span>
                  </div>
                </div>

                {/* Key Executive Observations */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                      <Compass className="size-4 text-teal" /> Executive Diagnostic Observations
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 text-xs">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400 block mb-1">
                          Primary Institutional Strength
                        </span>
                        <p className="text-muted-foreground leading-relaxed">
                          <strong>Industry Co-Design & Recruitment (84%):</strong> Over 350+ active
                          corporate hiring partners with embedded syllabus co-teaching in
                          professional schools.
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                        <span className="font-bold text-amber-800 dark:text-amber-400 block mb-1">
                          Critical Transformation Opportunity
                        </span>
                        <p className="text-muted-foreground leading-relaxed">
                          <strong>Work-Integrated Learning (D04: 67%):</strong> Internships are
                          largely uncredited in non-STEM departments, creating employability
                          disparities across faculties.
                        </p>
                      </div>

                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                        <span className="font-bold text-blue-800 dark:text-blue-400 block mb-1">
                          Digital Work-Readiness (79%)
                        </span>
                        <p className="text-muted-foreground leading-relaxed">
                          Universal Python and AI productivity toolkits successfully mandated across
                          first-year undergraduate programs.
                        </p>
                      </div>

                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                        <span className="font-bold text-rose-800 dark:text-rose-400 block mb-1">
                          Capability Signalling Gap (63%)
                        </span>
                        <p className="text-muted-foreground leading-relaxed">
                          Absence of standardized digital project repositories (e.g.
                          GitHub/ePortfolios) limits employer pre-hiring verification.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Evidence Corroboration: <strong>E2 (Reviewed & Corroborated)</strong>
                    </span>
                    <span>
                      Audit Status: <strong>Verified</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* 11 Dimensions Scorecard Grid */}
              <div>
                <h4 className="text-base font-serif font-bold text-foreground mb-4">
                  11-Dimension Institutional Scorecard
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {ecriDimensionsData.map((d) => (
                    <div
                      key={d.code}
                      onClick={() => {
                        setSelectedDimension(d);
                        setActiveTab("dimensions");
                      }}
                      className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-teal hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-teal/10 px-2 py-0.5 text-[11px] font-bold text-teal">
                          {d.code}
                        </span>
                        <span className="text-xs font-bold text-foreground">{d.sampleScore}%</span>
                      </div>
                      <h5 className="mt-2 text-sm font-bold text-foreground group-hover:text-teal transition-colors">
                        {d.name}
                      </h5>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>{d.metricCount} Metrics</span>
                        <span className="font-medium text-teal flex items-center gap-0.5">
                          Deep Dive <ChevronRight className="size-3" />
                        </span>
                      </div>
                      {/* Score Meter */}
                      <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-teal rounded-full transition-all duration-500"
                          style={{ width: `${d.sampleScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 2: 11 DIMENSIONS GRANULAR DEEP DIVE                          */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "dimensions" && (
            <div className="mt-8 space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h4 className="text-base font-serif font-bold text-foreground">
                    Dimension Diagnostic Deep Dive
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Select any of the 11 dimensions to inspect metric distributions, observed
                    strengths, and transformation imperatives.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ecriDimensionsData.map((dim) => (
                    <button
                      key={dim.code}
                      onClick={() => setSelectedDimension(dim)}
                      className={`rounded px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                        selectedDimension.code === dim.code
                          ? "bg-teal text-white"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {dim.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Dimension Detail Card */}
              <div className="rounded-2xl border-2 border-teal/30 bg-card p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <span className="rounded bg-teal/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-teal">
                      Dimension {selectedDimension.code} · {selectedDimension.theme}
                    </span>
                    <h3 className="mt-2 text-2xl font-serif font-bold text-foreground">
                      {selectedDimension.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
                      {selectedDimension.desc}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-serif font-bold text-teal">
                      {selectedDimension.sampleScore}%
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase">
                      Level {selectedDimension.sampleMaturity} · {selectedDimension.level}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {/* Observed Strengths */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Observed Institutional Strengths
                    </h5>
                    <ul className="space-y-2.5 text-xs text-foreground/90">
                      {selectedDimension.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-0.5 size-1.5 rounded-full bg-emerald-600 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Identified Gaps */}
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                      <ShieldAlert className="size-4" /> Diagnostic Gaps & Vulnerabilities
                    </h5>
                    <ul className="space-y-2.5 text-xs text-foreground/90">
                      {selectedDimension.gaps.map((g, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-0.5 size-1.5 rounded-full bg-amber-600 shrink-0" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Institutional Implications */}
                <div className="mt-6 rounded-xl border border-teal/20 bg-teal/5 p-5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-teal mb-2 flex items-center gap-1.5">
                    <Sparkles className="size-4" /> Executive Transformation Recommendation
                  </h5>
                  <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                    {selectedDimension.implications}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 3: VISUAL ANALYTICS HUB                                      */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "analytics" && (
            <div className="mt-8 space-y-8 animate-in fade-in duration-300">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Visual Chart 1: Dimension Balance Comparison */}
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-1 flex items-center gap-2">
                    <BarChart3 className="size-4 text-teal" /> 11-Dimension Capability Balance
                  </h4>
                  <p className="text-xs text-muted-foreground mb-6">
                    Distribution of scores against the 75% institutional excellence benchmark line.
                  </p>

                  <div className="space-y-3">
                    {ecriDimensionsData.map((d) => (
                      <div key={d.code} className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground">
                            {d.code} · {d.shortName}
                          </span>
                          <span className="font-bold text-teal">{d.sampleScore}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
                          <div
                            className="h-full bg-teal rounded-full"
                            style={{ width: `${d.sampleScore}%` }}
                          />
                          {/* Benchmark Target Indicator at 75% */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                            style={{ left: "75%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Chart 2: Maturity Quadrant Matrix */}
                <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-foreground mb-1 flex items-center gap-2">
                      <PieChart className="size-4 text-teal" /> Maturity Quadrant Matrix
                    </h4>
                    <p className="text-xs text-muted-foreground mb-6">
                      Dimension distribution across Institutional Impact vs Transformation Distance.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                        <span className="font-bold text-emerald-800 dark:text-emerald-400 block mb-1">
                          High Impact · Strong Maturity
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          D03 (Curriculum), D09 (Employer Ecosystem), D10 (Outcomes)
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <span className="font-bold text-amber-800 dark:text-amber-400 block mb-1">
                          High Impact · Priority Action
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          D04 (WIL Internships), D08 (Portfolios), D11 (Alumni Mobility)
                        </p>
                      </div>

                      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                        <span className="font-bold text-blue-800 dark:text-blue-400 block mb-1">
                          Foundational · Stable
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          D01 (Demand Intelligence), D02 (Capability), D07 (Digital Readiness)
                        </p>
                      </div>

                      <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
                        <span className="font-bold text-purple-800 dark:text-purple-400 block mb-1">
                          Operational Support
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          D05 (Career Services), D06 (Professional Capabilities)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border text-[11px] text-muted-foreground">
                    Analytical Model: <strong>ECRI Multi-Variable Weighted Regression</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 4: TRANSFORMATION GAP                                        */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "gaps" && (
            <div className="mt-8 space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-border pb-4">
                <h4 className="text-base font-serif font-bold text-foreground">
                  Transformation Gap & Strategic Roadmapping
                </h4>
                <p className="text-xs text-muted-foreground">
                  ECRI identifies not only where your institution stands today, but the exact
                  distance to target maturity and high-impact interventions.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    dim: "D04 · Experiential & Practice-Based Learning (WIL)",
                    current: "Level 3 (Developing)",
                    target: "Level 5 (Exemplary)",
                    gap: "-2 Maturity Levels",
                    action:
                      "Standardize 12-week mandatory credit-bearing internships across all non-STEM faculties and implement structured employer evaluation rubrics.",
                    timeline: "6–12 Months",
                  },
                  {
                    dim: "D08 · Portfolio & Capability Signalling",
                    current: "Level 3 (Developing)",
                    target: "Level 4 (Established)",
                    gap: "-1 Maturity Level",
                    action:
                      "Mandate digital project repositories and verified capstone portfolios as a universal degree requirement.",
                    timeline: "3–6 Months",
                  },
                  {
                    dim: "D11 · Lifelong Readiness & Employability Intelligence",
                    current: "Level 3 (Developing)",
                    target: "Level 5 (Exemplary)",
                    gap: "-2 Maturity Levels",
                    action:
                      "Launch the Alumni Executive Reskilling Academy and institute 3-to-5 year longitudinal graduate career tracking.",
                    timeline: "12–18 Months",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground">{item.dim}</span>
                      <span className="rounded bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:text-rose-400">
                        Gap: {item.gap}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-muted/40 p-3 rounded-lg">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Current State
                        </span>
                        <strong className="text-foreground">{item.current}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">
                          Required Maturity
                        </span>
                        <strong className="text-teal">{item.target}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Horizon</span>
                        <strong className="text-foreground">{item.timeline}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>Prescribed Institutional Action:</strong> {item.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 5: LIVING ASSESSMENT & EVOLUTION (CONTINUOUS TRACKING)        */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "evolution" && (
            <div className="mt-8 space-y-6 animate-in fade-in duration-300">
              <div className="rounded-2xl border border-teal/30 bg-teal/5 p-6">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal mb-2">
                  <TrendingUp className="size-4" /> Longitudinal Continuity Architecture
                </div>
                <h4 className="text-2xl font-serif font-bold text-foreground">
                  ECRI Is a Continuous, Living Intelligence Instrument
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-3xl">
                  As relevant institutional information changes, policies mature, or employer
                  initiatives expand, ECRI is reassessed over versioned snapshots. Historical audits
                  remain preserved, creating an auditable trajectory of institutional progress.
                </p>
              </div>

              {/* Version Comparison Table */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <h5 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                  Illustrative Evolution: Initial Baseline vs Annual Progress Review
                </h5>

                <div className="grid gap-4 sm:grid-cols-3 text-xs mb-6">
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <span className="text-muted-foreground block mb-1 font-semibold">
                      Assessment Snapshot v1 (June 2026)
                    </span>
                    <div className="text-2xl font-bold font-serif text-foreground">66.4%</div>
                    <span className="text-[11px] text-muted-foreground">
                      Level 3 · Developing Baseline
                    </span>
                  </div>

                  <div className="rounded-xl border-2 border-teal/40 bg-teal/[0.04] p-4">
                    <span className="text-teal block mb-1 font-bold">
                      Progress Review Snapshot v2 (June 2027)
                    </span>
                    <div className="text-2xl font-bold font-serif text-teal">74.8%</div>
                    <span className="text-[11px] text-teal font-bold">
                      +8.4 pts · Level 4 Established
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <span className="text-muted-foreground block mb-1 font-semibold">
                      Institutional Interventions Verified
                    </span>
                    <div className="text-2xl font-bold font-serif text-foreground">6 Major</div>
                    <span className="text-[11px] text-muted-foreground">
                      Curriculum & WIL Mandates
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground">
                        D04 · Experiential Learning & Internships (WIL)
                      </span>
                      <p className="text-muted-foreground text-[11px]">
                        Credit weighting enacted for Arts & Sciences internships; 4 metric rubrics
                        updated.
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                      58% → 67% (+9.0 pts)
                    </span>
                  </div>

                  <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-foreground">
                        D07 · Digital & AI-Era Work Readiness
                      </span>
                      <p className="text-muted-foreground text-[11px]">
                        Campus-wide Python foundation introduced for 100% of incoming cohorts.
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                      71% → 79% (+8.0 pts)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* TAB 6: BOARDROOM REPORTS & PDF PREVIEW                           */}
          {/* ---------------------------------------------------------------- */}
          {activeTab === "reports" && (
            <div className="mt-8 space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-border pb-4">
                <h4 className="text-base font-serif font-bold text-foreground">
                  Boardroom-Ready Deliverables & PDF Ecosystem
                </h4>
                <p className="text-xs text-muted-foreground">
                  ECRI deliverables are engineered specifically for executive decision-making by
                  Vice-Chancellors, Provosts, and Governing Boards.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Deliverable 1: Executive Summary Report */}
                <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded bg-teal/10 px-2.5 py-1 text-xs font-bold text-teal">
                        Decision Dossier
                      </span>
                      <FileSpreadsheet className="size-5 text-teal" />
                    </div>
                    <h5 className="text-lg font-serif font-bold text-foreground">
                      Executive Assessment Report (PDF)
                    </h5>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      A concise, high-level analytical report answering the 5 core leadership
                      questions: Where do we stand? What are our primary strengths? Where are our
                      critical gaps? What requires immediate board attention? What transformation
                      priorities emerge?
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      20 Pages · Executive Assessment
                    </span>
                    <button
                      onClick={() =>
                        window.open(
                          "/samples/ECRI_Sample_Executive_Report.pdf",
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:underline"
                    >
                      <Download className="size-3.5" /> View Sample Report
                    </button>
                  </div>
                </div>

                {/* Deliverable 2: Detailed Assessment Report */}
                <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded bg-navy/10 px-2.5 py-1 text-xs font-bold text-navy">
                        Comprehensive Audit
                      </span>
                      <FileText className="size-5 text-navy" />
                    </div>
                    <h5 className="text-lg font-serif font-bold text-foreground">
                      Detailed 132-Metric Diagnostic Report
                    </h5>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      The granular technical foundation backing the executive summary. Features
                      dimension-by-dimension metric distributions, observed evidence reviews,
                      anti-gaming protection audits, and multi-year transformation work packages.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      14 Pages · 132-Metric Traceability
                    </span>
                    <button
                      onClick={() =>
                        window.open(
                          "/samples/ECRI_Sample_Detailed_132_Metric_Report.pdf",
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:underline"
                    >
                      <Download className="size-3.5" /> View Sample Report
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {[
                  [
                    "Board Scorecard",
                    "ECRI_Sample_Board_Scorecard.pdf",
                    "4 Pages · Leadership Scorecard",
                  ],
                  [
                    "Evidence & Claim Integrity Dossier",
                    "ECRI_Sample_Evidence_Integrity_Dossier.pdf",
                    "8 Pages · Evidence Intelligence",
                  ],
                  [
                    "Transformation Roadmap",
                    "ECRI_Sample_Transformation_Roadmap.pdf",
                    "7 Pages · Action & Sequencing",
                  ],
                ].map(([title, file, meta]) => (
                  <div
                    key={file}
                    className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between"
                  >
                    <div>
                      <span className="rounded bg-teal/10 px-2.5 py-1 text-xs font-bold text-teal">
                        Sample Deliverable
                      </span>
                      <h5 className="mt-3 text-base font-serif font-bold text-foreground">
                        {title}
                      </h5>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        Uses the same canonical ECRI demonstration dataset and score architecture.
                      </p>
                    </div>
                    <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{meta}</span>
                      <button
                        onClick={() =>
                          window.open(`/samples/${file}`, "_blank", "noopener,noreferrer")
                        }
                        className="text-xs font-bold text-teal hover:underline"
                      >
                        View PDF →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* LIGHTWEIGHT EVIDENCE PHILOSOPHY SECTION                            */}
        {/* ------------------------------------------------------------------ */}
        <section className="mt-20 border-t border-border pt-12">
          <div className="max-w-3xl mb-8">
            <p className="eyebrow mb-2">Operational Rigor & Low Overhead</p>
            <h3 className="text-2xl font-serif font-bold text-foreground">
              Execution-Light Evidence Philosophy
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              ECRI is strictly not an onerous document-collection exercise. Evidence is supporting
              context (links, representative policies, sample capstone artifacts) that can
              cross-reference multiple dimensions without administrative friction.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-border bg-card p-5">
              <FileCheck2 className="size-5 text-teal mb-3" />
              <h4 className="font-bold text-foreground mb-1">One-to-Many Linking</h4>
              <p className="text-muted-foreground leading-relaxed">
                A single comprehensive academic policy document can substantiate multiple rubric
                metrics across D02, D03, and D04.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <ShieldCheck className="size-5 text-teal mb-3" />
              <h4 className="font-bold text-foreground mb-1">Peer & Assessor Verification</h4>
              <p className="text-muted-foreground leading-relaxed">
                Senior higher-education assessors review evidence artifacts with clear temporal
                validity status (E1 Policy → E2 Operational Proof).
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <Lock className="size-5 text-teal mb-3" />
              <h4 className="font-bold text-foreground mb-1">Enterprise Confidentiality</h4>
              <p className="text-muted-foreground leading-relaxed">
                All data, institutional profiles, and metric responses remain the private property
                of your university and are never publicised without instruction.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* FINAL CONSULTATIVE CALL TO ACTION                                  */}
        {/* ------------------------------------------------------------------ */}
        <section className="mt-20 rounded-2xl border-2 border-teal/40 bg-teal/5 p-8 text-center md:p-12">
          <div className="mx-auto max-w-2xl">
            <span className="rounded-full bg-teal text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Institutional Engagement
            </span>
            <h3 className="mt-4 text-3xl font-serif font-bold text-foreground md:text-4xl">
              Commission an ECRI Assessment for Your University
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Engage with our advisory team to establish an institutional employability baseline,
              identify critical curriculum gaps, and empower your executive board with verified
              transformation intelligence.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setConsultModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal px-8 py-3.5 text-sm font-bold text-white shadow-raised transition-all hover:bg-teal/90 hover:shadow-lg"
              >
                <Mail className="size-4" />
                <span>Request an ECRI Assessment</span>
                <ArrowRight className="size-4" />
              </button>

              <Link
                to="/ecri/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
              >
                <span>Existing Assessment Sign In</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* INSTITUTIONAL CONSULTATION MODAL                                     */}
      {/* -------------------------------------------------------------------- */}
      {consultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
            <button
              onClick={() => {
                setConsultModalOpen(false);
                setConsultSubmitted(false);
              }}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {consultSubmitted ? (
              <div className="text-center py-6">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal/10 text-teal mb-4">
                  <CheckCircle2 className="size-6" />
                </div>
                <h4 className="text-xl font-serif font-bold text-foreground">
                  Assessment Request Received
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Thank you. An ECRI Higher Education Advisor will contact you within 24 hours to
                  review your institution's scope and coordinate the assessment engagement.
                </p>
                <button
                  onClick={() => {
                    setConsultModalOpen(false);
                    setConsultSubmitted(false);
                  }}
                  className="mt-6 rounded-lg bg-teal px-6 py-2.5 text-xs font-bold text-white hover:bg-teal/90"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal mb-1">
                  <Building2 className="size-4" /> Higher Education Advisory
                </div>
                <h4 className="text-xl font-serif font-bold text-foreground">
                  Request an ECRI Institutional Assessment
                </h4>
                <p className="mt-1 text-xs text-muted-foreground mb-6">
                  Provide your institutional details. Our advisory team will coordinate a
                  consultation to structure your assessment.
                </p>

                {consultError && (
                  <div className="mb-4 rounded-md border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                    {consultError}
                  </div>
                )}

                <form onSubmit={handleConsultSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Lead Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={consultForm.name}
                      onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                      placeholder="e.g. Prof. Rajesh Sharma"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        University / Institution *
                      </label>
                      <input
                        type="text"
                        required
                        value={consultForm.institutionName}
                        onChange={(e) =>
                          setConsultForm({ ...consultForm, institutionName: e.target.value })
                        }
                        placeholder="e.g. Metropolitan Apex University"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Designation / Role *
                      </label>
                      <input
                        type="text"
                        required
                        value={consultForm.designation}
                        onChange={(e) =>
                          setConsultForm({ ...consultForm, designation: e.target.value })
                        }
                        placeholder="e.g. Provost / Dean / Director"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Official Institutional Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={consultForm.email}
                        onChange={(e) => setConsultForm({ ...consultForm, email: e.target.value })}
                        placeholder="lead@university.edu"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        Direct Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={consultForm.phone}
                        onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">
                      Institutional Context & Goals
                    </label>
                    <textarea
                      rows={3}
                      value={consultForm.message}
                      onChange={(e) => setConsultForm({ ...consultForm, message: e.target.value })}
                      placeholder="Briefly describe your institution's size, current employability objectives, or accreditation priorities..."
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={consultSubmitting}
                    className="w-full rounded-xl bg-teal py-3 text-xs font-bold text-white shadow-raised hover:bg-teal/90 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {consultSubmitting ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    <span>Submit Assessment Request</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* FOOTER                                                               */}
      {/* -------------------------------------------------------------------- */}
      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted-foreground md:px-10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">
              ECRI · Employability & Career Readiness Intelligence
            </span>
            <span>·</span>
            <span>Higher Education Advisory</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/ecri/login" className="hover:text-foreground">
              Assessment Workspace
            </Link>
            <Link to="/arui" className="hover:text-foreground">
              ARUI Framework
            </Link>
            <button onClick={() => setConsultModalOpen(true)} className="hover:text-foreground">
              Contact Advisory Team
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
