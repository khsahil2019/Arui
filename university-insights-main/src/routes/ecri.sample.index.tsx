import { useState } from "react";
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
  Sliders,
  ChevronDown,
  ChevronUp,
  Target,
  Check,
  Sparkles,
  Search,
  Users,
  Briefcase,
  Cpu,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecri/sample/")({
  component: EcriSampleOverviewPage,
});

const dimensionsList = [
  {
    code: "D01",
    name: "Employer Demand Intelligence",
    score: 78.0,
    cur: 4,
    req: 3,
    dist: "+1",
    simpleQuestion:
      "Does your university regularly track what employers need and use this to guide strategy and budgets?",
    whyItMatters:
      "Ensures university leadership and faculties actively align program offerings and funding with evolving market and industry skill requirements.",
    whatIsExamined:
      "Methods for capturing employer feedback, leadership accountability, dedicated career budgets, and regular review cadences.",
    relevantMetrics: "D01-M01 to D01-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Board or Senate minutes on employability strategy",
      "Dedicated career services budget ledger",
      "Annual employer demand survey report",
      "Faculty KPI alignment documentation",
    ],
  },
  {
    code: "D02",
    name: "Industry Ecosystem & Partnerships",
    score: 72.0,
    cur: 4,
    req: 3,
    dist: "+1",
    simpleQuestion:
      "How actively does your university collaborate with industry partners, advisory boards, and corporate recruiters?",
    whyItMatters:
      "Strong corporate partnerships translate directly into internships, co-designed programs, research funding, and direct hiring pipelines for students.",
    whatIsExamined:
      "Active MoUs, Departmental Industry Advisory Boards, corporate labs, executive-in-residence programs, and recurring recruiter summits.",
    relevantMetrics: "D02-M01 to D02-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Active corporate MoUs with verified activity reports",
      "Departmental Advisory Board minutes with employer notes",
      "Co-branded industry lab agreements",
      "Employer summit attendance records",
    ],
  },
  {
    code: "D03",
    name: "Curriculum Co-Design & Modernization",
    score: 81.0,
    cur: 4,
    req: 4,
    dist: "0",
    simpleQuestion:
      "Are course syllabi co-designed with industry experts to reflect modern technologies and skills?",
    whyItMatters:
      "Prevents graduates from entering the job market with outdated theoretical knowledge by embedding industry-relevant competencies directly into academic credit.",
    whatIsExamined:
      "External industry involvement in Board of Studies, syllabus modernization cadences, agile elective rollouts, and multi-disciplinary skill pathways.",
    relevantMetrics: "D03-M01 to D03-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Board of Studies curriculum approval records with industry signatures",
      "Recent syllabus updates reflecting emerging tools",
      "Industry co-designed module course outlines",
      "Annual curriculum review cycle reports",
    ],
  },
  {
    code: "D04",
    name: "Experiential & Practice-Based Learning",
    score: 67.0,
    cur: 3,
    req: 4,
    dist: "+1",
    simpleQuestion:
      "Do all students complete mandatory, supervised, credit-bearing internships and live industry projects?",
    whyItMatters:
      "Work-Integrated Learning (WIL) bridges academic knowledge and workplace reality, significantly increasing post-graduation hiring rates.",
    whatIsExamined:
      "Mandatory internship credit policies, student cohort coverage (>80%), industry capstone projects, employer mentor feedback, and clinical rotations.",
    relevantMetrics: "D04-M01 to D04-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Mandatory credit-bearing internship academic policy",
      "Cohort internship completion logs with company names",
      "Employer supervisor evaluation rubrics",
      "Live industry capstone project reports",
    ],
  },
  {
    code: "D05",
    name: "Career Development Infrastructure",
    score: 76.0,
    cur: 4,
    req: 3,
    dist: "0",
    simpleQuestion:
      "Does the university provide professional 1-on-1 career guidance, resume masterclasses, and industry mentorship?",
    whyItMatters:
      "Empowers students with career self-efficacy, tailored career navigation, and structured interview preparation across all academic disciplines.",
    whatIsExamined:
      "Staff-to-student counseling ratio, 1-on-1 career navigation software, interview clinics, industry mentorship networks, and student tracking.",
    relevantMetrics: "D05-M01 to D05-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Career center staffing structure & counselor ratios",
      "1-on-1 student career counseling log / CRM records",
      "Industry mentorship program roster",
      "Interview masterclass schedule and feedback",
    ],
  },
  {
    code: "D06",
    name: "Applied Competencies & Transversal Skills",
    score: 74.0,
    cur: 4,
    req: 3,
    dist: "0",
    simpleQuestion:
      "Are critical thinking, professional communication, and modern digital tools integrated into graduation requirements?",
    whyItMatters:
      "Employers prioritize transversal capabilities (adaptability, problem-solving, collaboration) and digital fluencies alongside technical degree knowledge.",
    whatIsExamined:
      "Communication mastery modules, data analytics/AI literacy for non-tech majors, design thinking workshops, and ethical leadership courses.",
    relevantMetrics: "D06-M01 to D06-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Transversal skill assessment rubrics",
      "Digital literacy and AI tool syllabus requirements",
      "Student project presentations evaluation sheets",
      "Critical thinking course modules",
    ],
  },
  {
    code: "D07",
    name: "Assessment Integrity & Authentic Evaluation",
    score: 79.0,
    cur: 4,
    req: 4,
    dist: "0",
    simpleQuestion:
      "Do student evaluations use real-world industry tasks, oral defenses, and recognized micro-credentials?",
    whyItMatters:
      "Authentic assessments demonstrate tangible competency to employers far better than conventional rote memorization examinations.",
    whatIsExamined:
      "Performance-based evaluations, oral defenses/pitches, external industry exam moderators, embedded vendor certifications (AWS, Google, CFA).",
    relevantMetrics: "D07-M01 to D07-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Real-world case study exam papers",
      "Oral defense / client pitch evaluation scorecards",
      "Embedded industry micro-credential completion logs",
      "External industry moderator review reports",
    ],
  },
  {
    code: "D08",
    name: "Entrepreneurship & Venture Creation",
    score: 69.0,
    cur: 3,
    req: 3,
    dist: "0",
    simpleQuestion:
      "Does the university support student startups with incubation facilities, seed funding, and founder mentoring?",
    whyItMatters:
      "Fosters job creation, entrepreneurial mindset, technology commercialization, and alternative career pathways for graduates.",
    whatIsExamined:
      "Incubator/FabLab facilities, student seed grant funds, patent/IP support, founder-in-residence mentorship, and startup survival tracking.",
    relevantMetrics: "D08-M01 to D08-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "TBI / Incubator facility documentation",
      "Student seed funding disbursement records",
      "List of active student startup ventures and revenue",
      "Patent/IP filing documentation for student/faculty projects",
    ],
  },
  {
    code: "D09",
    name: "Placement Architecture & Corporate Relations",
    score: 77.0,
    cur: 4,
    req: 4,
    dist: "0",
    simpleQuestion:
      "How robust is the campus placement machinery in securing verified, high-quality, diversified employer offers?",
    whyItMatters:
      "Measures immediate graduate employment success, median compensation trajectories, employer diversity, and fair placement governance.",
    whatIsExamined:
      "Audited placement ledger, median CTC growth, employer repeat-hiring rates, dream offer conversion, and unplaced student support clinics.",
    relevantMetrics: "D09-M01 to D09-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Audited annual placement report with salary distributions",
      "Recruiter roster with sector diversification",
      "Placement policy and code of conduct document",
      "Unplaced student intervention clinic records",
    ],
  },
  {
    code: "D10",
    name: "Employment Outcome Quality",
    score: 73.0,
    cur: 3,
    req: 4,
    dist: "+1",
    simpleQuestion:
      "Does the university systematically track graduate career progression at 3, 5, and 10 years and engage alumni as mentors?",
    whyItMatters:
      "Longitudinal career trajectory data validates the lifelong value of the degree and provides a powerful mentoring and hiring network for current students.",
    whatIsExamined:
      "Alumni career database, longitudinal fast-track promotion studies, alumni-led hiring circles, and alumni representation on academic boards.",
    relevantMetrics: "D10-M01 to D10-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "3/5/10-year alumni career tracking database extract",
      "Alumni mentorship network directory",
      "Alumni Board of Studies meeting records",
      "Alumni career milestone and outcome survey report",
    ],
  },
  {
    code: "D11",
    name: "Continuous Improvement & Labor Market Calibration",
    score: 77.7,
    cur: 3,
    req: 3,
    dist: "0",
    simpleQuestion:
      "Does the institution conduct annual employer satisfaction audits and use data to continuously improve all programs?",
    whyItMatters:
      "Transforms employability from an ad-hoc placement effort into an institutionalized, continuous quality improvement loop.",
    whatIsExamined:
      "Annual Employer Satisfaction Index (ESI) surveys, department-level remediation plans, peer benchmarking, and evidence integrity audits.",
    relevantMetrics: "D11-M01 to D11-M12 (12 Canonical Metrics)",
    evidenceExamples: [
      "Annual Employer Satisfaction Index (ESI) audit report",
      "Dean-level employability improvement plans",
      "Longitudinal underemployment analytics study",
      "Comprehensive 3-year employability impact review",
    ],
  },
];

function EcriSampleOverviewPage() {
  const [showTechnicalEvidence, setShowTechnicalEvidence] = useState(false);
  const [expandedDim, setExpandedDim] = useState<string | null>("D01");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-16">
      {/* 1. Overview & Scope Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-semibold uppercase tracking-wider">
          <Compass className="size-3.5" /> ECRI Demonstration Environment
        </div>
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
          Employability & Career Readiness Intelligence (ECRI)
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
          The complete institutional intelligence package measuring graduate employability, employer
          demand integration, and career readiness capability. All sample views operate from a
          single canonical baseline assessment:
          <strong> Metropolitan Apex University (74.8 / 100)</strong>.
        </p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          to="/ecri/sample/institution"
          className="p-5 rounded-xl bg-card border border-border hover:border-teal/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-3">
            <BarChart3 className="size-5" />
          </div>
          <h3 className="font-semibold text-sm group-hover:text-teal transition-colors">
            Institution View →
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Overall score 74.8, 11-dimension profile, current vs required maturity, strengths, and
            priority gaps.
          </p>
        </Link>

        <Link
          to="/ecri/sample/assessor"
          className="p-5 rounded-xl bg-card border border-border hover:border-teal/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-3">
            <ShieldCheck className="size-5" />
          </div>
          <h3 className="font-semibold text-sm group-hover:text-teal transition-colors">
            Assessor View →
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Isolated ECRI adjudicator workspace evaluating all 132 canonical metrics and E0–E4
            evidence dossiers.
          </p>
        </Link>

        <Link
          to="/ecri/sample/reports"
          className="p-5 rounded-xl bg-card border border-border hover:border-teal/50 hover:shadow-md transition-all group"
        >
          <div className="size-10 rounded-lg bg-teal/10 text-teal flex items-center justify-center mb-3">
            <FileText className="size-5" />
          </div>
          <h3 className="font-semibold text-sm group-hover:text-teal transition-colors">
            Report Centre (5 PDFs) →
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Executive Intelligence, Detailed 132-Metric Diagnostic, Board Scorecard, Evidence
            Dossier, and Roadmap.
          </p>
        </Link>
      </div>

      {/* 2. What is ECRI? */}
      <section
        id="what-is-ecri"
        className="p-8 rounded-2xl bg-card border border-border space-y-4 scroll-mt-6"
      >
        <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
          <BookOpen className="size-4" /> Foundation
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">What is ECRI?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The <strong>Employability & Career Readiness Index (ECRI)</strong> is an institutional
          diagnostic system designed to measure, validate, and accelerate the employability
          capabilities of universities and higher education institutions.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ECRI goes far beyond superficial statistics like placement percentages, number of
          recruiters, average starting salaries, or headcounts placed. It evaluates whether the
          university possesses the <strong>institutional capability chain</strong> to deliver
          enduring, lifelong graduate career resilience.
        </p>
      </section>

      {/* 3. Why ECRI? */}
      <section
        id="why-ecri"
        className="p-8 rounded-2xl bg-card border border-border space-y-4 scroll-mt-6"
      >
        <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
          <Zap className="size-4" /> Strategic Value
        </div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Why ECRI?</h2>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
            <h4 className="text-xs font-bold text-foreground">Beyond Placement Percentages</h4>
            <p className="text-xs text-muted-foreground">
              Measures foundational capability, curriculum co-design, and pedagogical authenticity
              rather than volatile short-term hiring spikes.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
            <h4 className="text-xs font-bold text-foreground">Employer Co-Design Alignment</h4>
            <p className="text-xs text-muted-foreground">
              Quantifies real-time industry voice participation and curriculum modernization across
              all academic faculties.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
            <h4 className="text-xs font-bold text-foreground">Anti-Gaming Evidence Architecture</h4>
            <p className="text-xs text-muted-foreground">
              High maturity scores require verified operational records, meeting logs, and student
              participation data (E0–E4 model).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
            <h4 className="text-xs font-bold text-foreground">3-Horizon Transformation Roadmap</h4>
            <p className="text-xs text-muted-foreground">
              Translates diagnostic findings directly into actionable 90-day, 12-month, and 24-month
              executive interventions.
            </p>
          </div>
        </div>
      </section>

      {/* 4. NEW: ECRI Methodology (Major Section - Instruction #4, #5, #7, #8, #9) */}
      <section
        id="methodology"
        className="p-8 rounded-2xl bg-card border border-border space-y-8 scroll-mt-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
            <Sliders className="size-4" /> Intellectual Framework
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
            ECRI Methodology
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Understanding what ECRI measures and how institutional capability is evaluated across
            system, practice, and outcome layers.
          </p>
        </div>

        {/* The Institutional Capability Chain */}
        <div className="p-6 rounded-xl bg-muted/30 border border-border/60 space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            The Institutional Capability Chain
          </h3>
          <p className="text-xs text-muted-foreground">
            ECRI examines how an institution transforms labor market intelligence into verified
            graduate career outcomes through 11 linked capability stages:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {[
              "Employer Demand",
              "Capability Definition",
              "Curriculum",
              "Practice",
              "Career Development",
              "Student Capability",
              "Capability Signalling",
              "Employer Ecosystem",
              "Employment Quality",
              "Career Trajectory",
              "Institutional Learning",
            ].map((node, nIdx) => (
              <div key={nIdx} className="flex items-center gap-2">
                <span className="px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs font-semibold text-foreground shadow-xs">
                  {node}
                </span>
                {nIdx < 10 && <span className="text-teal font-bold text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* The Three Core ECRI Layers (Instruction #5) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            The Three Core ECRI Evaluation Layers
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-card border-2 border-teal/40 space-y-2 shadow-xs">
              <span className="text-xs font-mono font-bold text-teal">01 — SYSTEM</span>
              <h4 className="text-sm font-bold text-foreground">
                Does the institution have the system?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluates approved governance policies, dedicated budget lines, assigned leadership
                roles, and documented operating procedures.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-card border-2 border-teal/40 space-y-2 shadow-xs">
              <span className="text-xs font-mono font-bold text-teal">02 — IMPLEMENTATION</span>
              <h4 className="text-sm font-bold text-foreground">
                Does the system actually operate in practice?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluates execution across all faculties, student cohort coverage (&gt;80%), active
                advisory boards, and authentic curriculum modernization.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-card border-2 border-teal/40 space-y-2 shadow-xs">
              <span className="text-xs font-mono font-bold text-teal">03 — OUTCOME</span>
              <h4 className="text-sm font-bold text-foreground">
                Does it produce meaningful outcomes?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluates employer satisfaction indices, verified placement ledgers, median salary
                trajectories, and longitudinal alumni career mobility.
              </p>
            </div>
          </div>
        </div>

        {/* The 6 Maturity Levels (Instruction #7) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            The 0–5 Capability Maturity Model
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { level: "0", label: "Absent", desc: "The capability is not in place." },
              {
                level: "1",
                label: "Isolated",
                desc: "Exists only in individual or limited areas.",
              },
              {
                level: "2",
                label: "Selected",
                desc: "Operates in some areas but not consistently.",
              },
              {
                level: "3",
                label: "Repeatable",
                desc: "Defined, owned and operating across full scope.",
              },
              {
                level: "4",
                label: "Integrated",
                desc: "Embedded in institutional systems & decisions.",
              },
              {
                level: "5",
                label: "Adaptive",
                desc: "Measures, learns and continuously improves.",
              },
            ].map((m) => (
              <div
                key={m.level}
                className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-center space-y-1"
              >
                <span className="text-xl font-serif font-bold text-teal">{m.level}</span>
                <p className="text-xs font-bold text-foreground">{m.label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Required Maturity & Transformation Distance (Instruction #8) */}
        <div className="p-6 rounded-xl bg-muted/30 border border-border/60 space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Required Maturity & Transformation Distance
          </h3>
          <div className="flex flex-wrap items-center gap-3 py-2">
            <span className="px-3 py-1.5 rounded bg-card border border-border text-xs font-bold text-foreground">
              Current Maturity (Level 4.0)
            </span>
            <span className="text-teal font-bold">→</span>
            <span className="px-3 py-1.5 rounded bg-teal/10 border border-teal/30 text-xs font-bold text-teal">
              Required Maturity (Level 3.6 Context-Derived)
            </span>
            <span className="text-teal font-bold">→</span>
            <span className="px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Transformation Distance (Achieved)
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ECRI does not simply ask whether something exists. It considers the level of capability
            appropriate for the institution&apos;s specific context (student size, faculties,
            research intensity) and calculates the precise distance between current standing and
            required maturity.
          </p>
        </div>

        {/* Evidence Verification Model (Instruction #9) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Evidence & Verification Architecture
          </h3>
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl bg-muted/40 border border-border/60 text-center">
            {["Claim", "Evidence", "Verification", "Assessment", "Score"].map((step, sIdx) => (
              <div key={sIdx} className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-md bg-card border border-border text-xs font-bold text-foreground">
                  {step}
                </span>
                {sIdx < 4 && <span className="text-teal font-bold">↓</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ECRI does not grant higher maturity simply because an institution makes a claim. Claims
            are corroborated alongside uploaded supporting documents and verified by independent
            assessors.
          </p>

          <button
            onClick={() => setShowTechnicalEvidence(!showTechnicalEvidence)}
            className="text-xs text-teal font-semibold flex items-center gap-1 hover:underline"
          >
            {showTechnicalEvidence ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
            {showTechnicalEvidence
              ? "Hide technical evidence model"
              : "View technical evidence methodology (E0–E4)"}
          </button>

          {showTechnicalEvidence && (
            <div className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
              <p>
                <strong>E0 — None:</strong> No supporting evidence or uncorroborated verbal
                assertion.
              </p>
              <p>
                <strong>E1 — Low:</strong> Isolated departmental statement or unverified draft.
              </p>
              <p>
                <strong>E2 — Moderate:</strong> Formal approved policy or institutional guideline.
              </p>
              <p>
                <strong>E3 — High:</strong> Triangulated evidence: approved policy + operational
                meeting records + student participation data.
              </p>
              <p>
                <strong>E4 — Audited:</strong> Independently audited outcomes with longitudinal data
                and external stakeholder corroboration.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. The 11 Dimensions in Plain Language (Instruction #6, #16) */}
      <section
        id="dimensions"
        className="p-8 rounded-2xl bg-card border border-border space-y-6 scroll-mt-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
            <Layers className="size-4" /> 11 Dimensions
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            The 11 Canonical Dimensions (132 Metrics)
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore the 11 plain-language dimensions evaluated across the institution. Click any
            dimension to inspect what is examined and sample evidence.
          </p>
        </div>

        <div className="space-y-3">
          {dimensionsList.map((d) => {
            const isExpanded = expandedDim === d.code;
            return (
              <div
                key={d.code}
                className={cn(
                  "rounded-xl border transition-all overflow-hidden",
                  isExpanded
                    ? "bg-card border-teal/50 shadow-sm"
                    : "bg-muted/20 border-border/60 hover:border-border",
                )}
              >
                <button
                  onClick={() => setExpandedDim(isExpanded ? null : d.code)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-teal/10 text-teal text-xs font-bold font-mono">
                      {d.code}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{d.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.simpleQuestion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-sm font-bold text-teal">{d.score}%</span>
                      <span className="text-[10px] text-muted-foreground block">
                        Maturity L{d.cur}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-border/40 space-y-3 text-xs bg-muted/10">
                    <div>
                      <span className="font-bold text-foreground">Why this matters: </span>
                      <span className="text-muted-foreground">{d.whyItMatters}</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground">What is examined: </span>
                      <span className="text-muted-foreground">{d.whatIsExamined}</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground">Relevant Metrics: </span>
                      <span className="text-teal font-mono">{d.relevantMetrics}</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground">Evidence Examples:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                        {d.evidenceExamples.map((ex, exIdx) => (
                          <li key={exIdx}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. How the Assessment Works (Instruction #11, #12, #13) */}
      <section
        id="how-it-works"
        className="p-8 rounded-2xl bg-card border border-border space-y-6 scroll-mt-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
            <HelpCircle className="size-4" /> Assessment Experience
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            How the Assessment Works
          </h2>
          <p className="text-sm text-muted-foreground">
            Every question is designed in plain, understandable language so faculty, career teams,
            and registrars can answer without jargon.
          </p>
        </div>

        {/* 4 Simple Layers Example */}
        <div className="p-6 rounded-xl bg-muted/30 border border-border/60 space-y-4">
          <h3 className="text-xs font-bold text-teal uppercase tracking-wider">
            Example: The 4 Simple Question Layers
          </h3>
          <div className="p-5 rounded-lg bg-card border border-border space-y-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-teal uppercase tracking-wider">
                1. QUESTION
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                Does your university have a regular process for understanding what employers
                currently need?
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                2. WHAT ARE WE ASKING?
              </p>
              <p className="text-muted-foreground mt-0.5">
                Tell us how your university collects information about employer needs, who is
                responsible for it, and how often it is updated.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                3. WHAT TO UPLOAD
              </p>
              <p className="text-muted-foreground mt-0.5">
                Please upload 2–3 recent documents or records (from the last 12–24 months) showing
                this process is actively used.
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                4. EXAMPLES
              </p>
              <p className="text-muted-foreground mt-0.5">
                Employer survey report, advisory board meeting notes, labour market review, or proof
                of a curriculum change based on employer feedback.
              </p>
            </div>
            <div className="pt-2 border-t border-border flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded bg-teal/10 text-teal text-xs font-semibold">
                ✓ Yes — Fully in place
              </span>
              <span className="px-3 py-1 rounded bg-muted text-muted-foreground text-xs font-medium">
                Partly — In some areas
              </span>
              <span className="px-3 py-1 rounded bg-muted text-muted-foreground text-xs font-medium">
                No — Not in place
              </span>
              <span className="px-3 py-1 rounded bg-muted text-muted-foreground text-xs font-medium">
                Not applicable
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. What Your Institution Receives (Instruction #38, #39) */}
      <section
        id="what-you-receive"
        className="p-8 rounded-2xl bg-card border border-border space-y-8 scroll-mt-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal font-semibold text-xs uppercase tracking-wider">
            <Award className="size-4" /> Comprehensive Intelligence & Transformation Package
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
            Not Just a Report. An Institutional Intelligence & Transformation Package.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            One assessment. Multiple institutional outputs. Continuous improvement. Public
            institutional visibility.
          </p>
        </div>

        {/* Value Breadth Visual Flow */}
        <div className="p-5 rounded-xl bg-muted/30 border border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-2 text-center text-xs font-bold">
            {[
              "ASSESS",
              "DIAGNOSE",
              "TRANSFORM",
              "DOCUMENT",
              "REPORT",
              "PUBLISH",
              "REASSESS",
              "COMPARE",
            ].map((step, sIdx) => (
              <div key={sIdx} className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-card border border-border text-foreground">
                  {step}
                </span>
                {sIdx < 7 && <span className="text-teal font-bold">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* 8 Commercial Cards (Instruction #38) */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              num: "01",
              title: "Executive Intelligence",
              desc: "Know exactly where the institution stands with high-level scores, percentile rank, and capability benchmarks.",
              icon: BarChart3,
            },
            {
              num: "02",
              title: "132-Metric Diagnostic",
              desc: "Understand what is driving every result across all 11 dimensions and 132 canonical metric constructs.",
              icon: Layers,
            },
            {
              num: "03",
              title: "Transformation Roadmap",
              desc: "Know what to improve and what to do next with prescribed 90-day, 12-month, and 24-month action steps.",
              icon: TrendingUp,
            },
            {
              num: "04",
              title: "Public ECRI Institutional Profile",
              desc: "Publish the certified institutional profile directly on the university website to attract students & recruiters.",
              icon: Globe,
            },
            {
              num: "05",
              title: "Continuous Reassessment",
              desc: "Improve, add evidence, and request updated evaluations over the 12-month validity period without overwriting baseline.",
              icon: Sliders,
            },
            {
              num: "06",
              title: "Evidence & Verification",
              desc: "Understand what supports the institutional position with transparent E0–E4 audit trails and anti-gaming protection.",
              icon: ShieldCheck,
            },
            {
              num: "07",
              title: "Board & Leadership Scorecard",
              desc: "Turn assessment findings into executive decisions with concise governance scorecards and radar balance profiles.",
              icon: Award,
            },
            {
              num: "08",
              title: "Transformation Record",
              desc: "Track baseline → reassessment → improvement with certified year-over-year Transformation Delta reporting.",
              icon: CheckCircle2,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.num}
                className="p-5 rounded-xl bg-card border border-border/80 hover:border-teal/50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal">{card.num}</span>
                  <Icon className="size-4 text-teal" />
                </div>
                <h4 className="text-sm font-bold text-foreground">{card.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTAs */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            to="/ecri/sample/institution"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-teal text-white font-semibold text-sm shadow-md hover:bg-teal/90 transition-colors"
          >
            Explore Sample Institution View →
          </Link>
          <Link
            to="/ecri/engagement"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-card border border-border hover:border-teal/50 font-semibold text-sm transition-colors"
          >
            Proceed to ECRI Assessment
          </Link>
        </div>
      </section>
    </div>
  );
}
