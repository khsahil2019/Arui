import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel, PanelHeader } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { Button } from "@/components/ui/button";
import { queries, useRequestScoreRun } from "@/api/hooks";

export const Route = createFileRoute("/assessor/$id/runs")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(queries.scoreRuns(params.id)),
      context.queryClient.ensureQueryData(queries.executionLog(params.id)),
    ]).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Score runs & execution log — ARUI Assessor" },
      {
        name: "description",
        content:
          "Request preliminary score runs and inspect the execution log for an institutional assessment.",
      },
      { property: "og:title", content: "Score runs — ARUI Assessor" },
      { property: "og:description", content: "Preliminary score runs and execution log." },
    ],
  }),
  component: RunsPage,
});

function RunsPage() {
  const { id } = Route.useParams();
  const { data: runs } = useSuspenseQuery(queries.scoreRuns(id));
  const { data: log } = useSuspenseQuery(queries.executionLog(id));
  const request = useRequestScoreRun(id);

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Score runs"
        title="Preliminary score runs and execution log"
        lede="A run asks the engine to aggregate what assessors have recorded, under the pinned methodology version. Runs are traceable; nothing is computed in this interface."
        actions={
          <Button
            className="h-10"
            disabled={request.isPending}
            onClick={() => request.mutate("preliminary")}
          >
            <Play /> {request.isPending ? "Requesting…" : "Request preliminary run"}
          </Button>
        }
      />

      <Panel className="mt-8">
        <PanelHeader eyebrow="Runs" title={`${runs.length} run${runs.length === 1 ? "" : "s"}`} />
        <ul className="divide-y divide-border">
          {runs.map((r) => (
            <li
              key={r.id}
              className="grid gap-2 px-6 py-4 md:grid-cols-[10rem_8rem_1fr_auto] md:items-center"
            >
              <span className="font-mono text-xs text-foreground">{r.id}</span>
              <StatusBadge
                tone={r.status === "complete" ? "teal" : r.status === "failed" ? "rose" : "blue"}
                dot
                className="justify-self-start"
              >
                {r.status}
              </StatusBadge>
              <span className="text-sm text-muted-foreground">
                {r.kind} · {r.methodologyVersion} · {r.scope.join(", ")} · by {r.triggeredBy}
                {r.summary && <span className="block text-xs">{r.summary}</span>}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleString("en-GB")}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="mt-8">
        <PanelHeader
          eyebrow="Execution log"
          title="Assessment · stage · domain · metric/rule · status · evidence · actor · decision"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-xs">
            <thead>
              <tr className="border-b border-border bg-ivory-deep/60 text-left uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-6 py-2.5 font-semibold">Time</th>
                <th className="px-3 py-2.5 font-semibold">Stage</th>
                <th className="px-3 py-2.5 font-semibold">Domain</th>
                <th className="px-3 py-2.5 font-semibold">Metric / rule</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 font-semibold">Evidence</th>
                <th className="px-3 py-2.5 font-semibold">Actor</th>
                <th className="px-3 py-2.5 font-semibold">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...log].reverse().map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-6 py-2 text-muted-foreground">
                    {new Date(e.timestamp).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2">{e.stage}</td>
                  <td className="px-3 py-2 font-mono">{e.domainCode ?? "—"}</td>
                  <td className="px-3 py-2 font-mono">{e.metricOrRule ?? "—"}</td>
                  <td className="px-3 py-2">{e.status}</td>
                  <td className="px-3 py-2 font-mono">{e.evidenceRef ?? "—"}</td>
                  <td className="px-3 py-2">{e.actor}</td>
                  <td className="px-3 py-2 text-foreground">{e.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageContainer>
  );
}
