import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { CoverageBar } from "@/components/ari/progress";
import { queries } from "@/api/hooks";
import { aruiDomainNames, type DomainCode } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arui/assessment/")({
  loader: async ({ context }) => {
    const assessmentId = (context as any)?.assessmentId;
    if (assessmentId) {
      await context.queryClient
        .ensureQueryData(queries.status(assessmentId))
        .catch(() => undefined);
    }
  },
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "ARUI Assessment — 11 Domains of AI Resilience" },
      {
        name: "description",
        content: "Work through the 11 assessed domains of institutional AI resilience.",
      },
    ],
  }),
  component: AruiAssessmentHub,
});

function AruiAssessmentHub() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any)?.assessmentId;
  const { data: status } = useQuery({
    ...queries.status(assessmentId || ""),
    enabled: !!assessmentId,
  });

  if (!status) {
    return <PagePending />;
  }
  const inScope = status.domains.filter((d) => d.inScope);
  const next = inScope.find((d) => d.state !== "complete");

  return (
    <PageContainer>
      <PageHeader
        eyebrow="ARUI Framework · Assessment Matrix"
        title="The 11 Domains of Institutional AI Resilience"
        lede="Each domain opens with core questions grouped by theme. Where responses indicate higher exposure, targeted follow-ups trigger automatically. Complete in any order."
        meta={
          <StatusBadge tone="outline">
            Coverage · {inScope.length} of {status.domains.length} Domains Active
          </StatusBadge>
        }
      />

      <div className="mt-10 grid gap-4">
        {inScope.map((d) => {
          const pct = d.themesTotal ? d.themesExplored / d.themesTotal : 0;
          const name = aruiDomainNames[d.code as DomainCode] || d.name;

          return (
            <Link
              key={d.code}
              to="/arui/assessment/$domain"
              params={{ domain: d.code }}
              className={cn(
                "group grid gap-5 rounded-xl border bg-card px-6 py-6 shadow-card transition-colors hover:border-navy/40 md:grid-cols-[4rem_1fr_14rem_auto] md:items-center",
                next?.code === d.code ? "border-navy/40" : "border-border",
              )}
            >
              <span className="font-mono text-sm font-bold text-navy">{d.code}</span>
              <span>
                <span className="block font-serif text-xl leading-snug text-foreground">
                  {name}
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
    </PageContainer>
  );
}
