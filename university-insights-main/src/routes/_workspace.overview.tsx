import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel, PanelHeader, DefinitionList } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { assessmentStatusLabels, roleLabels } from "@/lib/catalogue";
import type { StageId } from "@/api/types";
import { queries } from "@/api/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_workspace/overview")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(queries.status(context.assessmentId)).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Overview — AI Resilient University" },
      {
        name: "description",
        content:
          "Your institution's assessment workspace: progress across profile, orientation, pulse, assessment, evidence and preliminary results.",
      },
      { property: "og:title", content: "Assessment Overview — AI Resilient University" },
      {
        property: "og:description",
        content: "Progress across the institutional AI resilience assessment.",
      },
    ],
  }),
  component: OverviewPage,
});

import { getEngineConfig, type EngineType } from "@/lib/catalogue";
import { useRouterState } from "@tanstack/react-router";

const stageLinks = {
  profile: "/profile",
  orientation: "/orientation",
  pulse: "/pulse",
  assessment: "/assessment",
  evidence: "/evidence",
  results: "/intelligence",
} as const satisfies Record<StageId, LinkProps["to"]>;

function OverviewPage() {
  const { assessmentId } = Route.useRouteContext();
  const { data: status } = useSuspenseQuery(queries.status(assessmentId));
  const routerState = useRouterState();
  const rawEngine = new URLSearchParams(routerState.location.search).get("engine");
  const engine: EngineType = rawEngine?.toLowerCase() === "ecri" ? "ecri" : "arui";
  const engineConfig = getEngineConfig(engine);

  const nextStage = status.stages.find((s) => s.state === "current");

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`${engineConfig.name} · Workspace Overview`}
        title={status.institutionName}
        lede={`Institutional assessment workspace for ${engineConfig.title}. Track progress across profile, pulse, ${engineConfig.domainsLabel}, evidence vault, and executive intelligence.`}
        meta={
          <div className="flex items-center gap-2">
            <span className={cn("font-bold px-2.5 py-1 rounded text-xs", engine === "ecri" ? "bg-teal/10 text-teal" : "bg-navy/10 text-navy")}>
              {engineConfig.shortTitle} Mode
            </span>
            <StatusBadge tone="blue" dot>
              Status · {assessmentStatusLabels[status.status]}
            </StatusBadge>
          </div>
        }
        actions={
          nextStage && (
            <Link
              to={stageLinks[nextStage.id]}
              search={{ engine }}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-medium text-primary-foreground shadow-raised hover:bg-navy-deep"
            >
              Continue · {nextStage.label} <ArrowRight className="size-4" />
            </Link>
          )
        }
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <Panel>
          <PanelHeader eyebrow="Assessment journey" title="Where the assessment stands" />
          <ol className="divide-y divide-border">
            {status.stages.map((step, i) => (
              <li key={step.id}>
                <Link
                  to={stageLinks[step.id]}
                  search={{ engine }}
                  className="group flex items-center gap-5 px-6 py-4 transition-colors hover:bg-ivory-deep/50"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      step.state === "complete" && "border-teal bg-teal text-primary-foreground",
                      step.state === "current" && "border-navy text-navy",
                      (step.state === "upcoming" || step.state === "locked") &&
                        "border-border text-muted-foreground",
                    )}
                  >
                    {step.state === "complete" ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[15px] font-medium",
                        step.state === "complete" || step.state === "current"
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="block text-[13px] text-muted-foreground">{step.caption}</span>
                  </span>
                  {step.state === "current" && (
                    <StatusBadge tone="blue" dot>
                      In progress
                    </StatusBadge>
                  )}
                  <ArrowRight className="size-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <PanelHeader eyebrow="Assessment record" />
            <DefinitionList
              className="px-6"
              items={[
                { term: "Engine", detail: `${engineConfig.name} (${engineConfig.title})` },
                { term: "Cycle", detail: `${status.cycle} Assessment` },
                {
                  term: "Scope",
                  detail: engineConfig.domainsLabel,
                },
                {
                  term: "Contributors",
                  detail: status.contributors.length
                    ? status.contributors.map((c) => `${c.name} (${roleLabels[c.role]})`).join(", ")
                    : "None yet invited",
                },
                { term: "Methodology", detail: engine === "ecri" ? "ECRI v6.0 Calibrated Master (132 Metrics)" : status.methodologyVersion },
                { term: "Confidentiality", detail: status.confidentiality },
              ]}
            />
          </Panel>
          <Panel tone="muted" className="px-6 py-5">
            <p className="eyebrow">Evidence Vault</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {status.evidence.submitted} submitted · {status.evidence.drafts} in draft. Verified against the {engineConfig.shortTitle} evidence intelligence rubric.
            </p>
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
}
