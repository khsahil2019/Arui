import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck2,
  GraduationCap,
  Layers,
  Lock,
  ScrollText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Higher Education Advisory — Dual Assessment Frameworks (ARUI & ECRI)" },
      {
        name: "description",
        content:
          "Institutional evaluation and transformation intelligence across AI Resilience (ARUI) and Graduate Employability (ECRI).",
      },
    ],
  }),
  component: WelcomePage,
});

const facts = [
  {
    icon: Clock,
    title: "Executive Assessment Time",
    body: "Around 3–4 hours across senior leadership sittings. The evaluation adapts dynamically to institutional scale and context.",
  },
  {
    icon: ScrollText,
    title: "Institutional Deliverables",
    body: "Domain-level positioning, transformation distance analysis, vulnerability index, and actionable executive roadmaps.",
  },
  {
    icon: FileCheck2,
    title: "Evidence & Verification",
    body: "Support self-assessment with institutional policies and artifacts. Documents can cross-reference multiple rubric metrics.",
  },
  {
    icon: Lock,
    title: "Enterprise Confidentiality",
    body: "Responses and telemetry remain private to your institution. Results are strictly locked to authorized institutional leadership.",
  },
];

function WelcomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-navy selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-3.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-navy font-serif text-sm font-bold text-white shadow-sm ring-1 ring-white/10">
              HE
            </div>
            <div>
              <span className="block font-serif text-base font-semibold tracking-tight text-foreground">
                Higher Education Advisory
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Institutional Benchmarking Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dual Engines Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-28 md:px-10">
        {/* Hero Section */}
        <section className="pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-navy/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-navy mb-5">
              <Sparkles className="size-3.5 text-navy" />
              <span>Institutional Excellence Platform</span>
            </div>
            <h1 className="text-4xl font-serif leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Institutional evaluation &{" "}
              <span className="italic font-serif text-navy">transformation</span> intelligence.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Select an assessment engine to benchmark your institution against global standards,
              evaluate risk and maturity, and unlock board-ready transformation intelligence.
            </p>
          </div>

          {/* Large Distinct Product Assessment Cards */}
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Card 1: ARUI */}
            <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-border/90 bg-card p-8 shadow-card transition-all duration-300 hover:border-navy hover:shadow-xl">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 -mr-12 -mt-12 size-48 rounded-full bg-navy/5 blur-3xl pointer-events-none transition-all group-hover:bg-navy/10" />

              <div>
                {/* Header Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-navy text-white shadow-sm">
                      <Cpu className="size-4.5" />
                    </span>
                    <div>
                      <span className="block font-bold text-xs uppercase tracking-widest text-navy">
                        ARUI Framework
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Version 4.0 Assessment Model
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-md border border-navy/20 bg-navy/5 px-3 py-1 text-xs font-bold text-navy shadow-sm">
                    <BarChart3 className="size-3.5 text-navy" />
                    <span>11 Domains · 143 Metrics</span>
                  </div>
                </div>

                {/* Card Title & Description */}
                <div className="mt-6">
                  <h2 className="text-2xl font-serif font-bold text-foreground group-hover:text-navy transition-colors">
                    AI-Resilient University Index
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Comprehensive research-grade evaluation measuring how institutional strategy,
                    ethical governance, curriculum co-adaptation, faculty capability, and tech
                    infrastructure respond to artificial intelligence.
                  </p>
                </div>

                {/* Key Pillars */}
                <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-medium text-foreground">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-navy shrink-0" />
                    <span>Strategic AI Leadership</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-navy shrink-0" />
                    <span>Academic & Exam Integrity</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-navy shrink-0" />
                    <span>Faculty AI Capability</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-navy shrink-0" />
                    <span>Compute & Data Sovereignty</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <Link
                  to="/arui/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-navy/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-navy/30"
                >
                  <span>Start ARUI Workspace</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/arui"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-navy/80 hover:underline px-2 py-1.5"
                >
                  <BookOpen className="size-3.5" />
                  <span>Explore Product Specs</span>
                </Link>
              </div>
            </div>

            {/* Card 2: ECRI */}
            <div className="group relative flex flex-col justify-between rounded-2xl border-2 border-teal/40 bg-teal/[0.03] p-8 shadow-card transition-all duration-300 hover:border-teal hover:shadow-xl">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 -mr-12 -mt-12 size-48 rounded-full bg-teal/10 blur-3xl pointer-events-none transition-all group-hover:bg-teal/15" />

              <div>
                {/* Header Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 border-b border-teal/20">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-teal text-white shadow-sm">
                      <Briefcase className="size-4.5" />
                    </span>
                    <div>
                      <span className="block font-bold text-xs uppercase tracking-widest text-teal">
                        ECRI Benchmark
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        Employability & Work-Readiness
                      </span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-md border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-bold text-teal shadow-sm">
                    <BarChart3 className="size-3.5 text-teal" />
                    <span>11 Dimensions · 132 Metrics</span>
                  </div>
                </div>

                {/* Card Title & Description */}
                <div className="mt-6">
                  <h2 className="text-2xl font-serif font-bold text-foreground group-hover:text-teal transition-colors">
                    Employability & Career Readiness Index
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    In-depth multi-dimensional framework assessing employer partnerships, industry
                    co-designed curriculum, Work-Integrated Learning (WIL), alumni tracking, and
                    high-impact career pathways.
                  </p>
                </div>

                {/* Key Pillars */}
                <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-medium text-foreground">
                  <div className="flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-teal shrink-0" />
                    <span>Employer Curriculum Co-Design</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-teal shrink-0" />
                    <span>Structured Internships (WIL)</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-teal shrink-0" />
                    <span>Alumni Career Progression</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2">
                    <CheckCircle2 className="size-3.5 text-teal shrink-0" />
                    <span>Industry Faculty Exchange</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-teal/20 pt-6">
                <Link
                  to="/ecri/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-teal/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal/30"
                >
                  <span>Start ECRI Workspace</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/ecri"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:text-teal/80 hover:underline px-2 py-1.5"
                >
                  <BookOpen className="size-3.5" />
                  <span>Explore Product Specs</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Informational Guidance Section */}
        <section className="mt-16 pt-12 border-t border-border">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="eyebrow mb-2">Institutional Advisory</p>
              <h3 className="text-2xl font-serif font-bold text-foreground">
                Built for university executive leadership.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Engineered specifically for Vice-Chancellors, Provosts, Deans, IQAC Directors, and
                institutional planning committees. Designed for single-lead administration or
                distributed multi-contributor evaluation.
              </p>
            </div>

            <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
              {facts.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-ivory-deep/80 text-navy">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-foreground">{f.title}</h4>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted-foreground md:px-10">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-foreground">Higher Education Advisory</span>
            <span>·</span>
            <span>Dual Assessment Frameworks</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/arui" className="hover:text-foreground">
              ARUI Specs
            </Link>
            <Link to="/ecri" className="hover:text-foreground">
              ECRI Specs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
