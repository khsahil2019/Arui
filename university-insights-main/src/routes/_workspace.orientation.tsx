import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, FileCheck2, GitBranch, HelpCircle, Lock, Radio } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { queries } from "@/api/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_workspace/orientation")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(queries.status(context.assessmentId)).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "How the assessment works — AI Resilient University" },
      {
        name: "description",
        content:
          "What to expect from the institutional assessment: the stages, how questions adapt to your context, how evidence works and how results are presented.",
      },
      { property: "og:title", content: "Assessment orientation — AI Resilient University" },
      {
        property: "og:description",
        content: "What to expect from the institutional AI resilience assessment.",
      },
    ],
  }),
  component: OrientationPage,
});

const principles = [
  {
    icon: Radio,
    title: "It starts with a short pulse",
    body: "A handful of strategic signals gives the assessment an early sense of where the institution stands, so it knows where to look more closely.",
  },
  {
    icon: GitBranch,
    title: "Questions adapt to your institution",
    body: "Each domain opens with a core set of questions. Where a response is unclear, incomplete or appears to sit in tension with another, the assessment asks a targeted follow-up. Not every institution sees the same questions.",
  },
  {
    icon: HelpCircle,
    title: "“Not sure” is a legitimate answer",
    body: "It is recorded separately and never treated as “no”. Where something genuinely does not apply to your institution, you can say so and explain why; an assessor confirms it.",
  },
  {
    icon: FileCheck2,
    title: "Evidence strengthens confidence",
    body: "Evidence is optional at first. Missing evidence does not automatically reduce capability. Where the methodology requires evidence for a particular claim, that claim may remain unvalidated until sufficient evidence is available.",
  },
  {
    icon: Clock,
    title: "Work in sittings",
    body: "Everything is saved as you go. Contributors can be invited by area; a single institutional lead can also complete the whole assessment.",
  },
  {
    icon: Lock,
    title: "Results are preliminary until verified",
    body: "Responses are read by trained assessors who record the institution's position. What you see first is an indicative position based on the current assessment scope.",
  },
];

function OrientationPage() {
  const { assessmentId } = Route.useRouteContext();
  const { data: status } = useSuspenseQuery(queries.status(assessmentId));
  const inScope = status.domains.filter((d) => d.inScope);
  const later = status.domains.filter((d) => !d.inScope);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Orientation"
        title="How the assessment works."
        lede="Five minutes of reading before the assessment begins. Nothing here is a question."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ol className="grid gap-4 sm:grid-cols-2">
          {principles.map((p) => (
            <li
              key={p.title}
              className="rounded-lg border border-border bg-card px-6 py-6 shadow-card"
            >
              <span className="flex size-9 items-center justify-center rounded-md border border-border bg-ivory-deep/70 text-navy">
                <p.icon className="size-4" />
              </span>
              <h2 className="mt-4 font-sans text-[15px] font-semibold tracking-normal text-foreground">
                {p.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ol>

        <div className="space-y-6">
          <Panel>
            <div className="border-b border-border px-6 py-4">
              <p className="eyebrow">Assessment scope · this cycle</p>
            </div>
            <ul className="divide-y divide-border">
              {inScope.map((d) => (
                <li key={d.code} className="flex items-baseline gap-3 px-6 py-3.5">
                  <span className="font-mono text-[11px] text-muted-foreground">{d.code}</span>
                  <span className="text-sm text-foreground">{d.name}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-6 py-4">
              <p className="eyebrow mb-3 text-muted-foreground">Later cycles</p>
              <ul className="space-y-1.5">
                {later.map((d) => (
                  <li
                    key={d.code}
                    className={cn("flex items-baseline gap-3 text-[13px] text-muted-foreground")}
                  >
                    <span className="font-mono text-[11px]">{d.code}</span>
                    <span className="flex-1">{d.name}</span>
                    <StatusBadge tone="neutral" className="text-[9.5px]">
                      Not yet assessed
                    </StatusBadge>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Link
            to="/pulse"
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-md bg-navy px-6 text-[15px] font-medium text-primary-foreground shadow-raised transition-colors hover:bg-navy-deep"
          >
            Begin the Institutional Pulse <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
