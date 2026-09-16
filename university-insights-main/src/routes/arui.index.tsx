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
  BrainCircuit,
  Cpu,
} from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";

export const Route = createFileRoute("/arui/")({
  head: () => ({
    meta: [
      { title: "ARUI — AI-Resilient University Index | Institutional Product Specifications" },
      {
        name: "description",
        content:
          "Comprehensive evaluation framework assessing higher education universities across 11 critical domains of artificial intelligence readiness, governance, pedagogy, and research resilience.",
      },
    ],
  }),
  component: AruiProductPage,
});

const aruiDomains = [
  {
    code: "D01",
    name: "Institutional Strategy & AI Direction",
    desc: "Executive vision, senior leadership mandate, AI Advisory Council, and multi-year strategic roadmap.",
  },
  {
    code: "D02",
    name: "AI Governance, Ethics & Policy Framework",
    desc: "Comprehensive AI policy covering copyright, data privacy, responsible AI use, and compliance safeguards.",
  },
  {
    code: "D03",
    name: "Academic Integrity & Assessment Adaptation",
    desc: "Redesign of evaluation protocols away from vulnerable formats towards authentic viva and project demonstration.",
  },
  {
    code: "D04",
    name: "Teaching, Learning & Curriculum Resilience",
    desc: "Curricular integration of generative AI tools across humanities, sciences, engineering, and business degrees.",
  },
  {
    code: "D05",
    name: "Faculty AI Capability & Workforce Readiness",
    desc: "Structured pedagogical upskilling, AI teaching grants, and accredited AI literacy certifications for professors.",
  },
  {
    code: "D06",
    name: "Student Agency, AI Literacy & Safe Access",
    desc: "Universal student access to enterprise-grade AI LLMs, student AI ethics codes, and peer AI ambassador programs.",
  },
  {
    code: "D07",
    name: "Research Integrity, AI Augmentation & Discovery",
    desc: "AI-augmented laboratory tools, data provenance auditing, grant proposal integrity, and compute provisioning.",
  },
  {
    code: "D08",
    name: "Digital Infrastructure, High-Speed Compute & Security",
    desc: "Campus GPU clusters, cloud AI API gateways, data warehousing, and cyber defense against automated adversarial threats.",
  },
  {
    code: "D09",
    name: "Operational & Administrative AI Integration",
    desc: "Automated student advising chatbots, admissions triage, financial forecasting, and administrative process automation.",
  },
  {
    code: "D10",
    name: "Community Engagement, Ethics & Societal Impact",
    desc: "Public interest AI initiatives, regional workforce transition workshops, and open-source civic AI research.",
  },
  {
    code: "D11",
    name: "Strategic Adaptability & Future-Proofing",
    desc: "Horizon scanning mechanisms, agile degree revision protocols, and continuous institutional AI benchmarking.",
  },
];

const deliverables = [
  {
    title: "Executive PDF Assessment Report",
    desc: "Comprehensive 40+ page publication-grade assessment report with domain scorecards, spider diagrams, maturity baselines, and executive synthesis.",
    icon: FileSpreadsheet,
    badge: "Publication Grade",
  },
  {
    title: "Interactive Institutional Scoreboard",
    desc: "Web-based diagnostic workspace featuring live maturity scales (Levels 0–5), granular metric audit, and peer comparison tools.",
    icon: BarChart3,
    badge: "Interactive Software",
  },
  {
    title: "3-Horizon AI Transformation Roadmap",
    desc: "Structured intervention sequencing outlining immediate (Horizon 1: 0–6 mo), intermediate (Horizon 2: 6–18 mo), and visionary (Horizon 3: 18–36 mo) milestones.",
    icon: Map,
    badge: "Strategic Advisory",
  },
  {
    title: "143-Metric Traceability Appendix",
    desc: "Exhaustive metric verification appendix cross-referencing all 143 indicators against institutional policy documents and compute logs.",
    icon: ShieldCheck,
    badge: "Audit Ready",
  },
];

const pricingPlans = [
  {
    id: "comprehensive",
    name: "Comprehensive Institutional AI Assessment",
    price: "$4,999",
    cycle: "Per Full Assessment Cycle",
    desc: "The definitive whole-institution evaluation covering all 11 AI Resilience domains, 143 metrics, executive report, and 3-Horizon roadmap.",
    popular: true,
    features: [
      "Full evaluation across all 11 AI Domains",
      "143 Canonical AI Metrics & 715 Maturity Anchors",
      "Executive PDF Assessment Report (40+ pages)",
      "Interactive Institutional Diagnostic Workspace",
      "3-Horizon Intervention & Transformation Roadmap",
      "Verified Institutional Evidence Vault Integration",
      "Peer Group Context Calibration & Required Maturity Score",
      "Senior Assessor Adjudication & Calibration Session",
    ],
  },
];

function AruiProductPage() {
  const [activeTab, setActiveTab] = useState<"domains" | "deliverables" | "pricing" | "faq">("domains");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Banner */}
      <div className="bg-navy text-primary-foreground px-4 py-2 text-center text-xs font-medium tracking-wide">
        <span>Official ARUI Framework Version 4.0 Released</span>
        <span className="mx-2 opacity-50">·</span>
        <span className="opacity-90">11 Domains · 143 Metrics · Calibrated AI Resilience Matrix</span>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Wordmark engine="arui" />

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("domains")}
              className={`hover:text-navy transition-colors ${activeTab === "domains" ? "text-navy border-b-2 border-navy pb-0.5" : ""}`}
            >
              11 Domains
            </button>
            <button
              onClick={() => setActiveTab("deliverables")}
              className={`hover:text-navy transition-colors ${activeTab === "deliverables" ? "text-navy border-b-2 border-navy pb-0.5" : ""}`}
            >
              Deliverables
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`hover:text-navy transition-colors ${activeTab === "pricing" ? "text-navy border-b-2 border-navy pb-0.5" : ""}`}
            >
              Pricing & Tiers
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`hover:text-navy transition-colors ${activeTab === "faq" ? "text-navy border-b-2 border-navy pb-0.5" : ""}`}
            >
              Methodology FAQ
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline"
            >
              ← Master Portal
            </Link>
            <Link
              to="/arui/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white shadow-raised hover:bg-navy-deep transition-all"
            >
              Start ARUI Assessment <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-navy/[0.03] to-transparent py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-navy/30 bg-navy/10 px-3 py-1 text-xs font-bold text-navy uppercase tracking-wider mb-6">
                <Sparkles className="size-3.5 text-navy" />
                <span>ARUI Assessment Engine v4.0</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground leading-[1.08]">
                The Global Standard for <span className="italic font-normal text-navy">University AI Resilience</span> & Transformation.
              </h1>

              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                A rigorous, multi-domain institutional evaluation framework assessing universities across 11 critical domains, 143 metrics, authentic assessment redesign, and calibrated compute maturity.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/arui/login"
                  className="inline-flex h-12 items-center gap-2 rounded-lg bg-navy px-6 text-sm font-bold text-white shadow-raised hover:bg-navy-deep transition-all"
                >
                  Enter ARUI Assessment Workspace <ArrowRight className="size-4" />
                </Link>
                <a
                  href="#pricing-section"
                  onClick={() => setActiveTab("pricing")}
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-muted transition-all"
                >
                  View Assessment Packages
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
                <div>
                  <span className="block font-bold text-foreground text-lg">11</span>
                  <span>Core Domains</span>
                </div>
                <div>
                  <span className="block font-bold text-foreground text-lg">143</span>
                  <span>Canonical Metrics</span>
                </div>
                <div>
                  <span className="block font-bold text-foreground text-lg">0–5</span>
                  <span>Calibrated Scale</span>
                </div>
              </div>
            </div>

            {/* Assessment Preview Card */}
            <div className="rounded-2xl border border-navy/20 bg-card p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-rose-500" />
                  <span className="size-3 rounded-full bg-amber-500" />
                  <span className="size-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">ARUI-SPEC-2026.pdf</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-navy/5 p-4 border border-navy/10">
                  <div className="flex items-center justify-between text-xs font-semibold text-navy mb-1">
                    <span>Observed AI Maturity</span>
                    <span>Level 3.4 / 5.0</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-navy rounded-full" style={{ width: "68%" }} />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Required Context Baseline: Level 3.8 · Transformation Distance: -0.4 Levels
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded border border-border bg-background">
                    <span className="font-semibold text-foreground">D01 Strategy & Leadership</span>
                    <span className="text-navy font-bold">Level 4 · Advanced</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded border border-border bg-background">
                    <span className="font-semibold text-foreground">D03 Assessment Adaptation</span>
                    <span className="text-amber-600 font-bold">Level 2 · Emerging</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded border border-border bg-background">
                    <span className="font-semibold text-foreground">D08 High-Speed Compute</span>
                    <span className="text-navy font-bold">Level 4 · Advanced</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-4 text-navy" /> Verified AI Architecture
                </span>
                <span className="font-bold text-navy">Audit Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: 11 Core Domains */}
      <section id="domains-section" className="py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-navy mb-2">Architectural Foundation</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              The 11 Assessed Domains of AI Resilience
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm md:text-base">
              Unlike simplistic survey checklists, ARUI evaluates whole-institution capability across governance, academic integrity, high-speed GPU clusters, faculty readiness, and strategic agility.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aruiDomains.map((dom) => (
              <div
                key={dom.code}
                className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-navy hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-navy bg-navy/10 px-2 py-0.5 rounded">
                      {dom.code}
                    </span>
                    <span className="text-[11px] text-muted-foreground">13 Metrics</span>
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-2">{dom.name}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{dom.desc}</p>
                </div>

                <div className="mt-6 border-t border-border pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Maturity 0–5 Rubric</span>
                  <Link to="/arui/login" className="text-navy font-semibold hover:underline inline-flex items-center gap-1">
                    Evaluate <ChevronRight className="size-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Deliverables */}
      <section id="deliverables-section" className="py-20 border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-navy mb-2">Tangible Institutional Value</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Assessment Deliverables & Strategic Reports
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm md:text-base">
              Every ARUI assessment produces executive artifacts designed specifically for Academic Boards, Vice-Chancellors, and Chief Information Officers.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {deliverables.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-8 shadow-card flex gap-6 items-start"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy border border-navy/20">
                  <item.icon className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="rounded bg-navy/10 text-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Pricing Packages */}
      <section id="pricing-section" className="py-20 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="eyebrow text-navy mb-2">Transparent Investment</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Institutional Assessment Package
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed text-sm md:text-base">
              Comprehensive institutional licensing with zero hidden add-ons. Full 11-domain evaluation, 143 metrics, executive PDF generation, and independent peer assessor adjudication.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {pricingPlans.map((tier) => (
              <div
                key={tier.id}
                className="rounded-2xl border-2 border-navy bg-card p-8 md:p-10 shadow-xl relative"
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-navy px-4 py-1 text-xs font-bold text-white uppercase tracking-wider shadow">
                  Institutional Standard
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{tier.desc}</p>
                  </div>
                  <div>
                    <span className="text-4xl font-bold text-navy">{tier.price}</span>
                    <span className="block text-xs text-muted-foreground">{tier.cycle}</span>
                  </div>
                </div>

                <div className="py-8">
                  <p className="eyebrow text-foreground mb-4">Included in Package:</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tier.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-foreground/90">
                        <CheckCircle2 className="size-4 text-navy shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground">
                    <span>Turnaround: 3–4 weeks from evidence submission</span>
                  </div>
                  <Link
                    to="/arui/login"
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-navy px-6 text-sm font-bold text-white shadow-raised hover:bg-navy-deep transition-all"
                  >
                    Initiate Institutional Assessment <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: FAQ */}
      <section id="faq-section" className="py-20 border-b border-border bg-muted/10">
        <div className="mx-auto max-w-4xl px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="eyebrow text-navy mb-2">Methodology Clarity</p>
            <h2 className="text-3xl font-serif font-bold text-foreground">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6 text-sm">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-bold text-foreground">How does ARUI calibrate against institutional type?</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                The 25-parameter institutional context profile calibrates the "Required Maturity Baseline". A specialized research university is expected to achieve higher maturity in high-speed GPU clusters (D08) and research integrity (D07) than a liberal arts teaching college, preventing unfair comparisons.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-bold text-foreground">Is institutional data kept confidential?</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Yes. All uploaded policy files, compute logs, and self-assessment scores remain strictly confidential within your institutional tenant. Results are never made public without explicit written authorization from the Vice-Chancellor.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-bold text-foreground">Can multiple department leads contribute simultaneously?</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Yes. The institutional lead can invite faculty deans, CIOs, and academic integrity officers to complete their respective domains independently. The platform aggregates all responses into the canonical executive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-6 md:px-10 flex flex-wrap items-center justify-between gap-6 text-xs text-muted-foreground">
          <div>
            <Wordmark engine="arui" />
            <p className="mt-2 text-[11px]">Official AI-Resilient University Index · Methodology Version 4.0</p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/arui/login" className="text-navy font-bold hover:underline">
              ARUI Login
            </Link>
            <Link to="/ecri" className="hover:underline">
              Explore ECRI Product
            </Link>
            <Link to="/" className="hover:underline">
              Master Portal Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
