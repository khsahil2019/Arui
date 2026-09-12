import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { assessmentStatusLabels } from "@/lib/catalogue";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/assessor/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(queries.assessorQueue()).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Review queue — ARUI Assessor" },
      {
        name: "description",
        content:
          "Institutional assessments awaiting assessor review, scoring and preliminary score runs.",
      },
      { property: "og:title", content: "Review queue — ARUI Assessor" },
      { property: "og:description", content: "Assessor review queue." },
    ],
  }),
  component: QueuePage,
});

function QueuePage() {
  const { data: queue } = useSuspenseQuery(queries.assessorQueue());
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Assessor"
        title="Review queue"
        lede="Institutional assessments assigned for review. Respondent inputs are read and interpreted here; the engine aggregates only what assessors record."
      />
      <Panel className="mt-10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-ivory-deep/60 text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-6 py-3 font-semibold">Institution</th>
              <th className="px-4 py-3 font-semibold">Cycle</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Scope</th>
              <th className="px-4 py-3 font-semibold">Open flags</th>
              <th className="px-4 py-3 font-semibold">Assigned</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {queue.map((q) => (
              <tr key={q.assessmentId} className="hover:bg-ivory-deep/40">
                <td className="px-6 py-4 font-medium text-foreground">{q.institutionName}</td>
                <td className="px-4 py-4 text-muted-foreground">{q.cycle}</td>
                <td className="px-4 py-4">
                  <StatusBadge tone="blue" dot>
                    {assessmentStatusLabels[q.status]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  {q.domainsInScope.join(" · ")}
                </td>
                <td className="px-4 py-4">
                  {q.openFlags ? (
                    <StatusBadge tone="amber">{q.openFlags}</StatusBadge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-muted-foreground">{q.assignedTo ?? "Unassigned"}</td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to="/assessor/$id"
                    params={{ id: q.assessmentId }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:underline"
                  >
                    Open <ArrowRight className="size-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </PageContainer>
  );
}
