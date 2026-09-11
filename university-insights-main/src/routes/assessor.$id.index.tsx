import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { DefinitionList, Panel, PanelHeader } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { StatTile } from "@/components/ari/domain-viz";
import { assessmentStatusLabels } from "@/lib/catalogue";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/assessor/$id/")({
  head: () => ({
    meta: [
      { title: "Assessment overview — ARUI Assessor" },
      { name: "description", content: "Profile summary, applicability decisions and review counts for an institutional assessment." },
      { property: "og:title", content: "Assessment overview — ARUI Assessor" },
      { property: "og:description", content: "Assessor overview of an institutional assessment." },
    ],
  }),
  component: AssessorOverview,
});

function AssessorOverview() {
  const { id } = Route.useParams();
  const { data: a } = useSuspenseQuery(queries.assessorAssessment(id));
  const c = a.counts;

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow={`Assessment ${a.assessmentId}`}
        title={a.institutionName}
        lede={`Cycle ${a.cycle} · ${a.methodologyVersion}`}
        meta={
          <StatusBadge tone="blue" dot>
            {assessmentStatusLabels[a.status]}
          </StatusBadge>
        }
      />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Responses" value={c.responses} detail={`${c.notSure} not sure · ${c.naRequested} N/A requested`} />
        <StatTile label="Evidence items" value={c.evidence} detail="Awaiting or under review" />
        <StatTile label="Metrics scored" value={`${c.metricsScored} / ${c.metricsTotal}`} detail="M / I / O recorded by assessor" />
        <StatTile label="Open flags" value={c.openFlags} detail="Engine and assessor flags to resolve" />
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader eyebrow="Institution profile" title="Context as declared by the institution" />
          <DefinitionList className="px-6" items={a.profileSummary.map((p) => ({ term: p.label, detail: p.value }))} />
        </Panel>
        <Panel>
          <PanelHeader eyebrow="Applicability" title="Domain applicability decisions" />
          <ul className="divide-y divide-border">
            {a.applicability.map((d) => (
              <li key={d.domainCode} className="flex items-start gap-4 px-6 py-3.5">
                <span className="w-9 font-mono text-[11px] text-muted-foreground">{d.domainCode}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-foreground">{d.domainName}</span>
                  <span className="block text-xs text-muted-foreground">{d.rationale}</span>
                </span>
                {d.applicable === null ? <StatusBadge tone="neutral">Pending</StatusBadge> : d.applicable ? <StatusBadge tone="teal">{d.accepted ? "Applicable" : "Applicable · unconfirmed"}</StatusBadge> : <StatusBadge tone="amber">N/A</StatusBadge>}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel tone="muted" className="mt-8 px-6 py-5">
        <p className="eyebrow">Workflow</p>
        <ol className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-5">
          {(
            [
              ["Responses", "/assessor/$id/responses"],
              ["Evidence", "/assessor/$id/evidence"],
              ["Metric scoring", "/assessor/$id/scoring"],
              ["Context", "/assessor/$id/context"],
              ["Score runs", "/assessor/$id/runs"],
            ] as const
          ).map(([label, to], i) => (
            <li key={to}>
              <Link to={to} params={{ id }} className="group flex items-center gap-2 text-foreground hover:underline">
                <span className="font-mono text-[11px] text-muted-foreground">{i + 1}</span>
                {label}
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ol>
      </Panel>
    </PageContainer>
  );
}
