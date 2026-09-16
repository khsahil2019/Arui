import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { CoverageBar } from "@/components/ari/progress";
import { queries } from "@/api/hooks";
import { cn } from "@/lib/utils";

import { getEngineConfig, getFrameworkDomains, type EngineType, type DomainCode } from "@/lib/catalogue";
import { useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/_workspace/assessment/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(queries.status(context.assessmentId)).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Assessment — AI Resilient University" },
      {
        name: "description",
        content:
          "Work through the assessed domains — strategy, governance and human capability — in any order, at your own pace.",
      },
      { property: "og:title", content: "Assessment — AI Resilient University" },
      {
        property: "og:description",
        content: "The assessed domains of the institutional AI resilience assessment.",
      },
    ],
  }),
  component: AssessmentHub,
});

function AssessmentHub() {
  const { assessmentId } = Route.useRouteContext();
  const { data: status } = useSuspenseQuery(queries.status(assessmentId));
  const routerState = useRouterState();
  const rawEngine = new URLSearchParams(routerState.location.search).get("engine");
  const engine: EngineType = rawEngine?.toLowerCase() === "ecri" ? "ecri" : "arui";
  const engineConfig = getEngineConfig(engine);
  const frameworkDomains = getFrameworkDomains(engine);

  const inScope = status.domains.filter((d) => d.inScope);
  const later = status.domains.filter((d) => !d.inScope);
  const next = inScope.find((d) => d.state !== "complete");

  return (
    <PageContainer>
      <PageHeader
        eyebrow={`${engineConfig.name} · Assessment Matrix`}
        title={`The ${engineConfig.scopeCount} ${engine === "ecri" ? "Dimensions" : "Domains"} of ${engineConfig.shortTitle}`}
        lede={`Exhaustive institutional evaluation of ${engineConfig.title} across ${engineConfig.domainsLabel}. Complete the areas in any order and return at any time.`}
        meta={
          <div className="flex items-center gap-2">
            <span className={cn("font-bold px-2.5 py-1 rounded text-xs", engine === "ecri" ? "bg-teal/10 text-teal" : "bg-navy/10 text-navy")}>
              {engineConfig.shortTitle} Mode
            </span>
            <StatusBadge tone="outline">
              Coverage · {inScope.length} of {status.domains.length} {engine === "ecri" ? "dimensions" : "domains"}
            </StatusBadge>
          </div>
        }
      />

      <div className="mt-10 grid gap-4">
        {inScope.map((d) => {
          const pct = d.themesTotal ? d.themesExplored / d.themesTotal : 0;
          const displayName = frameworkDomains[d.code as DomainCode] || d.name;

          return (
            <Link
              key={d.code}
              to="/assessment/$domain"
              params={{ domain: d.code }}
              search={{ engine }}
              className={cn(
                "group grid gap-5 rounded-xl border bg-card px-6 py-6 shadow-card transition-colors hover:border-navy/40 md:grid-cols-[4rem_1fr_14rem_auto] md:items-center",
                next?.code === d.code ? "border-navy/40" : "border-border",
              )}
            >
              <span className="font-mono text-sm text-muted-foreground">{d.code}</span>
              <span>
                <span className="block font-serif text-xl leading-snug text-foreground">
                  {displayName}
                </span>
                <span className="mt-1 block text-[13px] text-muted-foreground">
                  {d.state === "not_started" && "Not started"}
                  {d.state === "in_progress" &&
                    `Exploring theme ${Math.min(d.themesExplored + 1, d.themesTotal)} of ${d.themesTotal}`}
                  {d.state === "complete" && `All ${d.themesTotal} themes explored`}
                  {d.targetedFollowUp && " · targeted follow-up added"}
                </span>
              </span>
              <span>
                <CoverageBar value={pct} tone={d.state === "complete" ? "teal" : "navy"} />
                <span className="mt-1.5 block text-[11px] text-muted-foreground">
                  {d.themesExplored} of {d.themesTotal} themes
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-navy">
                {d.state === "complete" ? (
                  <>
                    <Check className="size-4 text-teal" /> Review
                  </>
                ) : d.state === "in_progress" ? (
                  "Continue"
                ) : (
                  "Begin"
                )}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>

      <Panel tone="muted" className="mt-10 px-6 py-5">
        <p className="eyebrow">Later cycles · not yet assessed</p>
        <ul className="mt-3 grid gap-x-8 gap-y-2 text-[13.5px] text-muted-foreground sm:grid-cols-2">
          {later.map((d) => (
            <li key={d.code} className="flex items-baseline gap-3">
              <span className="font-mono text-[11px]">{d.code}</span>
              <span className="flex-1">{d.name}</span>
              <span className="text-[11px] uppercase tracking-[0.1em]">Not yet assessed</span>
            </li>
          ))}
        </ul>
      </Panel>
    </PageContainer>
  );
}
