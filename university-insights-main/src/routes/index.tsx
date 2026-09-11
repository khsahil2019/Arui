import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, FileCheck2, Lock, ScrollText } from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";
import { assessmentAreas } from "@/lib/catalogue";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Resilient University — Institutional AI Resilience Assessment" },
      { name: "description", content: "Understand how prepared your institution is for an AI-shaped future. A research-grade assessment for universities across strategy, governance, people, curriculum and more." },
      { property: "og:title", content: "AI Resilient University" },
      { property: "og:description", content: "Understand how prepared your institution is for an AI-shaped future." },
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
        <Link to="/overview" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Return to an existing assessment
        </Link>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <section className="grid gap-14 pt-10 md:pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div>
            <p className="eyebrow mb-6">Institutional AI Resilience Assessment</p>
            <h1 className="max-w-2xl text-[2.75rem] leading-[1.06] text-foreground md:text-[3.75rem] lg:text-[4.25rem]">
              Understand how prepared your institution is for an <em className="font-normal italic text-navy">AI-shaped</em> future.
            </h1>
            <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              AI Resilient University examines the institution as a whole — not a single office, policy or platform. It reads how strategy, governance, people, curriculum, students, learning, technology, employability, research and institutional adaptability hold together under AI-driven change.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                to="/profile"
                className="inline-flex h-12 items-center gap-3 rounded-md bg-navy px-6 text-[15px] font-medium text-primary-foreground shadow-raised transition-colors hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Begin Institutional Assessment
                <ArrowRight className="size-4" />
              </Link>
              <span className="text-sm text-muted-foreground">No commitment. Your progress is saved as you go.</span>
            </div>

            <div className="mt-16 border-t border-border pt-8">
              <p className="eyebrow mb-4">The assessment examines eleven domains</p>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-[15px] text-foreground/85 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {assessmentAreas.map((a, i) => (
                  <li key={a} className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-muted-foreground">D{String(i + 1).padStart(2, "0")}</span>
                    {a}
                  </li>
                ))}
              </ul>
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
                      <h2 className="font-sans text-[15px] font-semibold tracking-normal text-foreground">{f.title}</h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 px-1 text-xs leading-relaxed text-muted-foreground">
              Designed for Vice-Chancellors, Presidents, Provosts, Registrars, Deans, IQAC leadership and institutional strategy teams. A single institutional lead can complete the assessment; contributors can be invited by area.
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
