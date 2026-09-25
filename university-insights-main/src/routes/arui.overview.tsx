import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Sparkles, BrainCircuit } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel, PanelHeader, DefinitionList } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { assessmentStatusLabels, roleLabels } from "@/lib/catalogue";
import type { StageId } from "@/api/types";
import { queries } from "@/api/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arui/overview")({
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
      { title: "ARUI Dashboard — AI-Resilient University Index" },
      {
        name: "description",
        content:
          "Institutional AI Resilience Dashboard: Strategy, Governance, Curriculum and Faculty Transformation.",
      },
    ],
  }),
  component: AruiOverviewPage,
});

const aruiStageLinks = {
  profile: "/arui/profile",
  orientation: "/arui/orientation",
  pulse: "/arui/pulse",
  assessment: "/arui/assessment",
  evidence: "/arui/evidence",
  results: "/arui/intelligence",
} as const satisfies Record<StageId, LinkProps["to"]>;

function AruiOverviewPage() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any)?.assessmentId;
  const { data: status } = useQuery({
    ...queries.status(assessmentId || ""),
    enabled: !!assessmentId,
  });

  if (!status) {
    return <PagePending />;
  }
  const nextStage = status.stages.find((s) => s.state === "current");

  return (
    <PageContainer>
      <PageHeader
        eyebrow="ARUI Framework · Institutional Dashboard"
        title={status.institutionName || "Metropolitan Apex University"}
        lede="Comprehensive executive scoreboard evaluating whole-institution AI resilience across 11 critical domains and 143 calibrated metrics."
        meta={
          <div className="flex items-center gap-2">
            <span className="font-bold px-2.5 py-1 rounded text-xs bg-navy/10 text-navy flex items-center gap-1.5">
              <BrainCircuit className="size-3.5" /> ARUI Engine (AI Readiness)
            </span>
            <StatusBadge tone="blue" dot>
              Status · {assessmentStatusLabels[status.status]}
            </StatusBadge>
          </div>
        }
        actions={
          nextStage && (
            <Link
              to={aruiStageLinks[nextStage.id]}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-medium text-primary-foreground shadow-raised hover:bg-navy-deep"
            >
              Continue · {nextStage.label} <ArrowRight className="size-4" />
            </Link>
          )
        }
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <Panel>
          <PanelHeader eyebrow="Assessment Journey" title="AI Resilience Progress & Workflow" />
          <ol className="divide-y divide-border">
            {status.stages.map((step, i) => (
              <li key={step.id}>
                <Link
                  to={aruiStageLinks[step.id]}
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
            <PanelHeader eyebrow="Assessment Record" />
            <DefinitionList
              className="px-6"
              items={[
                { term: "Engine", detail: "AI-Resilient University Index (ARUI)" },
                { term: "Cycle", detail: `${status.cycle} Assessment` },
                { term: "Scope", detail: "11 Domains · 143 Metrics" },
                {
                  term: "Contributors",
                  detail: status.contributors.length
                    ? status.contributors.map((c) => `${c.name} (${roleLabels[c.role]})`).join(", ")
                    : "Dr. Aris Thorne (Institutional Lead)",
                },
                { term: "Methodology", detail: status.methodologyVersion || "ARUI v4.0 Master" },
                {
                  term: "Confidentiality",
                  detail: status.confidentiality || "Institutional Confidential",
                },
              ]}
            />
          </Panel>
          <Panel tone="muted" className="px-6 py-5">
            <p className="eyebrow text-navy font-bold">Evidence Intelligence</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {status.evidence.submitted} verified artifacts submitted. Audit trails locked against
              institutional integrity protocols.
            </p>
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
}
