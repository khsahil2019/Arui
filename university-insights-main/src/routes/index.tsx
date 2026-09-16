import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, FileCheck2, Lock, ScrollText } from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";
import { assessmentAreas } from "@/lib/catalogue";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Resilient University — Institutional AI Resilience Assessment" },
      {
        name: "description",
        content:
          "Understand how prepared your institution is for an AI-shaped future. A research-grade assessment for universities across strategy, governance, people, curriculum and more.",
      },
      { property: "og:title", content: "AI Resilient University" },
      {
        property: "og:description",
        content: "Understand how prepared your institution is for an AI-shaped future.",
      },
    ],
  }),
  component: WelcomePage,
});

const facts = [
  {
    icon: Clock,
    title: "Estimated effort",
    body: "Around 3–4 hours of senior time across a few sittings. The assessment adapts to your context, so many institutions need less.",
  },
  {
    icon: ScrollText,
    title: "What your institution receives",
    body: "An institutional position across the assessed domains, the maturity your context requires, your transformation distance, strengths, vulnerabilities and early contradiction signals — written for executive decision-making.",
  },
  {
    icon: FileCheck2,
    title: "How evidence works",
    body: "Evidence is optional at first and strengthens confidence in your results. One document can support several areas of the assessment; you are never asked for the same item twice.",
  },
  {
    icon: Lock,
    title: "Confidentiality",
    body: "Responses and evidence remain the institution's own. Results are preliminary until independently verified and are never shared or benchmarked without your instruction.",
  },
];

function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <Wordmark />
        <Link
          to="/overview"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Return to an existing assessment
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <section className="grid gap-14 pt-10 md:pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div>
            <p className="eyebrow mb-4">Higher Education Assessment Platform</p>
            <h1 className="max-w-2xl text-[2.75rem] leading-[1.06] text-foreground md:text-[3.75rem] lg:text-[4.25rem]">
              Institutional evaluation &{" "}
              <em className="font-normal italic text-navy">transformation</em> intelligence.
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              A unified research-grade platform evaluating universities across artificial
              intelligence resilience, graduate employability, curricular co-design, and governance.
            </p>

            {/* Assessment Products Selection Grid */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {/* Product 1: ARUI */}
              <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:border-navy/40 hover:shadow-lg">
                <div>
                  <span className="rounded bg-navy/10 px-2.5 py-1 text-[11px] font-bold text-navy uppercase tracking-wider">
                    ARUI Framework
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-foreground">
                    AI-Resilient University Index
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Exhaustive 11-domain assessment of AI strategy, governance, human capability,
                    curriculum resilience, and academic integrity.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:underline"
                  >
                    Start ARUI <ArrowRight className="size-3.5" />
                  </Link>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    11 Domains · 143 Metrics
                  </span>
                </div>
              </div>

              {/* Product 2: ECRI */}
              <div className="flex flex-col justify-between rounded-xl border border-navy/30 bg-navy/5 p-6 shadow-card transition-all hover:border-navy hover:shadow-lg">
                <div>
                  <span className="rounded bg-navy text-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
                    ECRI Benchmark
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-foreground">
                    Employability & Career Readiness Index
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Rigorous 11-dimension evaluation of employer integration, curriculum co-design,
                    internships (WIL), and graduate career progression.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-navy/15 pt-4">
                  <Link
                    to="/ecri"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:underline"
                  >
                    Explore ECRI Product <ArrowRight className="size-3.5" />
                  </Link>
                  <span className="font-mono text-[11px] font-semibold text-navy">
                    11 Dimensions · 132 Metrics
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-border pt-6">
              <p className="eyebrow mb-3">Universal Platform Standards</p>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FileCheck2 className="size-3.5 text-navy" /> Save & Resume Workflow
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-navy" /> Private & Verified Evidence
                </span>
                <span className="flex items-center gap-1.5">
                  <ScrollText className="size-3.5 text-navy" /> Single Canonical Report Payload
                </span>
              </div>
            </div>
          </div>

          <aside className="lg:pt-4">
            <div className="rounded-xl border border-border bg-card shadow-card">
              <div className="border-b border-border px-7 py-5">
                <p className="eyebrow">Before you begin</p>
              </div>
              <ul className="divide-y divide-border">
                {facts.map((f) => (
                  <li key={f.title} className="flex gap-5 px-7 py-6">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-ivory-deep/70 text-navy">
                      <f.icon className="size-4" />
                    </span>
                    <div>
                      <h2 className="font-sans text-[15px] font-semibold tracking-normal text-foreground">
                        {f.title}
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {f.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 px-1 text-xs leading-relaxed text-muted-foreground">
              Designed for Vice-Chancellors, Presidents, Provosts, Registrars, Deans, IQAC
              leadership and institutional strategy teams. A single institutional lead can complete
              the assessment; contributors can be invited by area.
            </p>
          </aside>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:px-10">
          <span>© 2026 AI Resilient University</span>
          <span>Stage 1 product prototype · No methodology content or scoring is active</span>
        </div>
      </footer>
    </div>
  );
}
