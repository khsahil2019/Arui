import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { SegmentedControl } from "@/components/ari/segmented-control";
import { Chip } from "@/components/ari/insight-card";
import { inScopeDomains, type DomainCode } from "@/lib/catalogue";
import type { ResponseState } from "@/api/types";
import { queries } from "@/api/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessor/$id/responses")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(queries.responseReview(params.id)).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Response review — ARUI Assessor" },
      {
        name: "description",
        content:
          "Read institutional responses by domain and theme, with the metrics each response informs.",
      },
      { property: "og:title", content: "Response review — ARUI Assessor" },
      { property: "og:description", content: "Assessor response review." },
    ],
  }),
  component: ResponseReview,
});

const stateTone: Record<
  ResponseState,
  { tone: "teal" | "blue" | "amber" | "neutral"; label: string }
> = {
  answered: { tone: "teal", label: "Answered" },
  not_sure: { tone: "blue", label: "Not sure" },
  not_applicable_requested: { tone: "amber", label: "N/A requested" },
  not_answered: { tone: "neutral", label: "Not answered" },
};

function ResponseReview() {
  const { id } = Route.useParams();
  const { data: items } = useSuspenseQuery(queries.responseReview(id));
  const [domain, setDomain] = useState<string | null>("screening");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = items.filter((i) =>
    domain === "screening" ? i.domainCode === null : i.domainCode === domain,
  );
  const options = [
    { value: "screening", label: "Screening" },
    ...inScopeDomains.map((d) => ({ value: d, label: d })),
  ];

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Response review"
        title="Institutional responses"
        lede="Responses are inputs for assessor interpretation. Nothing here scores automatically; the metrics listed are those each response may inform."
        meta={
          <SegmentedControl
            options={options}
            value={domain}
            onChange={setDomain}
            ariaLabel="Domain"
          />
        }
      />

      <Panel className="mt-8">
        <ul className="divide-y divide-border">
          {filtered.map((r) => {
            const st = r.response ? stateTone[r.response.state] : stateTone.not_answered;
            const expanded = open === r.promptId;
            return (
              <li key={r.promptId}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : r.promptId)}
                  className="flex w-full cursor-pointer items-start gap-4 px-6 py-4 text-left hover:bg-ivory-deep/40"
                >
                  <span className="w-20 shrink-0 font-mono text-[11px] text-muted-foreground">
                    {r.promptId}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-muted-foreground">
                      {r.theme}
                      {r.origin === "targeted" && <span className="ml-2 text-amber">targeted</span>}
                    </span>
                    <span className="block text-sm text-foreground">{r.prompt}</span>
                  </span>
                  <StatusBadge tone={st.tone} dot>
                    {st.label}
                  </StatusBadge>
                </button>
                {expanded && (
                  <div className="grid gap-6 border-t border-border bg-ivory-deep/30 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <div>
                      <p className="eyebrow">Recorded response</p>
                      {r.response?.state === "answered" ? (
                        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-card p-4 font-sans text-[13px] leading-relaxed text-foreground">
                          {formatValue(r.response.value)}
                        </pre>
                      ) : r.response?.state === "not_applicable_requested" ? (
                        <p className="mt-2 text-sm text-foreground">
                          Not-applicable requested. Rationale:{" "}
                          <em>{r.response.notApplicableRationale}</em>
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {r.response
                            ? "Institution indicated it is not sure / needs to check."
                            : "No response recorded."}
                        </p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="eyebrow">Informs metrics</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {r.informsMetricIds.map((m) => (
                            <Chip key={m} tone="navy">
                              {m}
                            </Chip>
                          ))}
                          {r.informsMetricIds.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              Screening — informs routing only
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="eyebrow">Review state</p>
                        <p
                          className={cn(
                            "mt-1 text-sm capitalize",
                            r.reviewState === "unreviewed"
                              ? "text-muted-foreground"
                              : "text-foreground",
                          )}
                        >
                          {r.reviewState.replace("_", " ")}
                        </p>
                        {r.reviewNote && (
                          <p className="mt-1 text-xs text-muted-foreground">{r.reviewNote}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-6 py-10 text-center text-sm text-muted-foreground">
              No prompts served for {domain as DomainCode} yet.
            </li>
          )}
        </ul>
      </Panel>
    </PageContainer>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.every((x) => typeof x === "string")) return (v as string[]).join("\n");
  return JSON.stringify(v, null, 2);
}
