import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { MaturityScale } from "@/components/ari/domain-viz";
import { maturityLabels } from "@/lib/catalogue";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/assessor/$id/context")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(queries.context(params.id)).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Context calibration — ARUI Assessor" },
      { name: "description", content: "Required maturity per domain derived from institutional context, current maturity and diagnostic transformation distance." },
      { property: "og:title", content: "Context calibration — ARUI Assessor" },
      { property: "og:description", content: "Required maturity and transformation distance." },
    ],
  }),
  component: ContextPage,
});

function ContextPage() {
  const { id } = Route.useParams();
  const { data: rows } = useSuspenseQuery(queries.context(id));
  return (
    <PageContainer width="wide">
      <PageHeader eyebrow="Context calibration" title="Required maturity and transformation distance" lede="Required maturity is derived by the engine from the institution's context profile. Transformation distance is Required − Current and is diagnostic only — it never adjusts a score. Overrides need a reason, evidence and second review." />
      <Panel className="mt-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-ivory-deep/60 text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-6 py-3 font-semibold">Domain</th>
              <th className="px-4 py-3 font-semibold">Scale</th>
              <th className="px-4 py-3 font-semibold">Required</th>
              <th className="px-4 py-3 font-semibold">Current</th>
              <th className="px-4 py-3 font-semibold">Distance</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Second review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.domainCode} className="align-top">
                <td className="px-6 py-4">
                  <span className="block font-mono text-[11px] text-muted-foreground">{r.domainCode}</span>
                  <span className="block text-foreground">{r.domainName}</span>
                  {r.rationale && <span className="mt-1 block max-w-md text-xs leading-relaxed text-muted-foreground">{r.rationale}</span>}
                </td>
                <td className="w-48 px-4 py-4">{r.currentMaturity !== null && r.requiredMaturity !== null ? <MaturityScale current={r.currentMaturity} required={r.requiredMaturity} className="mt-1.5" /> : <span className="text-xs text-muted-foreground">Pending</span>}</td>
                <td className="px-4 py-4">{r.requiredMaturity !== null ? `${r.requiredMaturity} · ${maturityLabels[r.requiredMaturity]}` : "—"}</td>
                <td className="px-4 py-4">{r.currentMaturity !== null ? `${r.currentMaturity} · ${maturityLabels[r.currentMaturity]}` : "—"}</td>
                <td className="px-4 py-4 font-mono">{r.transformationDistance ?? "—"}</td>
                <td className="px-4 py-4">
                  <StatusBadge tone={r.source === "engine" ? "teal" : r.source === "assessor_override" ? "amber" : "neutral"}>{r.source.replace("_", " ")}</StatusBadge>
                  {r.overrideRequested && <span className="mt-1 block text-[11px] text-amber">Override requested</span>}
                </td>
                <td className="px-4 py-4 text-muted-foreground capitalize">{r.secondReview.replace("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </PageContainer>
  );
}
