import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { EvidenceCard } from "@/components/ari/evidence-card";
import { Panel } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { Chip } from "@/components/ari/insight-card";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/assessor/$id/evidence")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(queries.evidenceReview(params.id)).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Evidence review — ARUI Assessor" },
      {
        name: "description",
        content:
          "Review submitted evidence, record evidence level (E0–E4), authenticity checks and metric linkage.",
      },
      { property: "og:title", content: "Evidence review — ARUI Assessor" },
      { property: "og:description", content: "Assessor evidence review." },
    ],
  }),
  component: EvidenceReview,
});

const levelLabel: Record<string, string> = {
  E0: "E0 · Claim",
  E1: "E1 · Institutional artifact",
  E2: "E2 · Operational evidence",
  E3: "E3 · Outcome evidence",
  E4: "E4 · Independent corroboration",
};

function EvidenceReview() {
  const { id } = Route.useParams();
  const { data: items } = useSuspenseQuery(queries.evidenceReview(id));

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Evidence review"
        title="Submitted evidence"
        lede="Evidence level and authenticity are recorded per item and feed confidence reporting. Evidence never multiplies or discounts capability scores."
      />
      <div className="mt-8 space-y-4">
        {items.map(
          ({ evidence, evidenceLevel, authenticityCheck, assessorFinding, linkedMetricIds }) => (
            <Panel key={evidence.id} className="p-0">
              <EvidenceCard
                item={evidence}
                className="rounded-b-none border-0 border-b shadow-none"
              />
              <div className="grid gap-5 px-5 py-4 md:grid-cols-3">
                <div>
                  <p className="eyebrow">Evidence level</p>
                  <p className="mt-1.5 text-sm text-foreground">
                    {evidenceLevel ? (
                      levelLabel[evidenceLevel]
                    ) : (
                      <span className="text-muted-foreground">Not yet assigned</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Authenticity check</p>
                  <div className="mt-1.5">
                    <StatusBadge
                      tone={
                        authenticityCheck === "passed"
                          ? "teal"
                          : authenticityCheck === "failed"
                            ? "rose"
                            : "neutral"
                      }
                      dot
                    >
                      {authenticityCheck}
                    </StatusBadge>
                  </div>
                </div>
                <div>
                  <p className="eyebrow">Linked metrics</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {linkedMetricIds.map((m) => (
                      <Chip key={m} tone="navy">
                        {m}
                      </Chip>
                    ))}
                    {linkedMetricIds.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        Construct-specific mapping pending
                      </span>
                    )}
                  </div>
                </div>
                {assessorFinding && (
                  <p className="text-[13px] leading-relaxed text-muted-foreground md:col-span-3">
                    <span className="font-medium text-foreground">Assessor finding.</span>{" "}
                    {assessorFinding}
                  </p>
                )}
              </div>
            </Panel>
          ),
        )}
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-input px-6 py-10 text-center text-sm text-muted-foreground">
            No evidence submitted yet.
          </p>
        )}
      </div>
    </PageContainer>
  );
}
