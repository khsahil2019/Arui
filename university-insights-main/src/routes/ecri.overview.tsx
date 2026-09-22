import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Briefcase, Award, TrendingUp } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel, PanelHeader, DefinitionList } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { assessmentStatusLabels, roleLabels } from "@/lib/catalogue";
import type { StageId } from "@/api/types";
import { queries } from "@/api/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecri/overview")({
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
      { title: "ECRI Scoreboard & Dashboard — Employability Benchmark" },
      {
        name: "description",
        content:
          "Institutional Employability & Career Readiness Dashboard: 11 Dimensions, 132 Metrics, WIL audit.",
      },
    ],
  }),
  component: EcriOverviewPage,
});

const ecriStageLinks = {
  profile: "/ecri/profile",
  orientation: "/ecri/orientation",
  pulse: "/ecri/pulse",
  assessment: "/ecri/assessment",
  evidence: "/ecri/evidence",
  results: "/ecri/intelligence",
} as const satisfies Record<StageId, LinkProps["to"]>;

function EcriOverviewPage() {
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
        eyebrow="ECRI Benchmark · Executive Scoreboard"
        title={status.institutionName || "Metropolitan Apex University"}
        lede="Comprehensive institutional scoreboard evaluating graduate employability, industry-aligned curriculum, work-integrated learning (WIL), and career outcomes across 11 dimensions."
        meta={
          <div className="flex items-center gap-2">
            <span className="font-bold px-2.5 py-1 rounded text-xs bg-teal/10 text-teal flex items-center gap-1.5">
              <Briefcase className="size-3.5" /> ECRI Engine (Employability)
            </span>
            <StatusBadge tone="teal" dot>
              Status · {assessmentStatusLabels[status.status]}
            </StatusBadge>
          </div>
        }
        actions={
          nextStage && (
            <Link
              to={ecriStageLinks[nextStage.id]}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-teal px-4 text-sm font-medium text-white shadow-raised hover:bg-teal/90"
            >
              Continue · {nextStage.label} <ArrowRight className="size-4" />
            </Link>
          )
        }
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <Panel>
          <PanelHeader eyebrow="Assessment Journey" title="Employability Benchmark Workflow" />
          <ol className="divide-y divide-border">
            {status.stages.map((step, i) => (
              <li key={step.id}>
                <Link
                  to={ecriStageLinks[step.id]}
                  className="group flex items-center gap-5 px-6 py-4 transition-colors hover:bg-teal/5"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      step.state === "complete" && "border-teal bg-teal text-white",
                      step.state === "current" && "border-teal text-teal",
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
                    <StatusBadge tone="teal" dot>
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
                { term: "Engine", detail: "Employability & Career Readiness Index (ECRI)" },
                { term: "Cycle", detail: `${status.cycle} Assessment` },
                { term: "Scope", detail: "11 Dimensions · 132 Canonical Metrics" },
                {
                  term: "Contributors",
                  detail: status.contributors.length
                    ? status.contributors.map((c) => `${c.name} (${roleLabels[c.role]})`).join(", ")
                    : "Prof. Marcus Vance (Dean of Career & WIL)",
                },
                { term: "Methodology", detail: "ECRI v6.0 Calibrated Master" },
                { term: "Confidentiality", detail: "Institutional Confidential" },
              ]}
            />
          </Panel>
          <Panel tone="muted" className="px-6 py-5">
            <p className="eyebrow text-teal font-bold">Evidence & WIL Vault</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {status.evidence.submitted} verified artifacts submitted. Anti-gaming verification
              active across corporate MoUs and placement audit logs.
            </p>
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
}
