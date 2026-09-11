import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { SegmentedControl } from "@/components/ari/segmented-control";
import { Field, SelectField, TextArea } from "@/components/ari/form-field";
import { Chip } from "@/components/ari/insight-card";
import { Button } from "@/components/ui/button";
import { inScopeDomains, maturityLabels, type MaturityLevel } from "@/lib/catalogue";
import type { EvidenceLevel, MetricScoring, MetricScoringInput, MetricScoringStatus } from "@/api/types";
import { queries, useSaveMetricScoring } from "@/api/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessor/$id/scoring")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(queries.metricScoring(params.id)).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Metric scoring — ARUI Assessor" },
      { name: "description", content: "Record maturity, implementation depth and outcome per metric, with N/A decisions, rationale and flags." },
      { property: "og:title", content: "Metric scoring — ARUI Assessor" },
      { property: "og:description", content: "Assessor M/I/O metric scoring." },
    ],
  }),
  component: ScoringPage,
});

const statusTone: Record<MetricScoringStatus, { tone: "neutral" | "blue" | "teal" | "amber" | "rose"; label: string }> = {
  unscored: { tone: "neutral", label: "Unscored" },
  draft: { tone: "blue", label: "Draft" },
  scored: { tone: "teal", label: "Scored" },
  review: { tone: "amber", label: "Review" },
  not_applicable: { tone: "rose", label: "N/A" },
};

const levels: MaturityLevel[] = [0, 1, 2, 3, 4, 5];
const evidenceLevels: EvidenceLevel[] = ["E0", "E1", "E2", "E3", "E4"];

function ScoringPage() {
  const { id } = Route.useParams();
  const { data: metrics } = useSuspenseQuery(queries.metricScoring(id));
  const [domain, setDomain] = useState<string | null>("D01");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = metrics.filter((m) => m.domainCode === domain);
  const selected = metrics.find((m) => m.metricId === selectedId) ?? list[0] ?? null;

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="Metric scoring"
        title="Maturity · Implementation · Outcome"
        lede="Each construct is recorded separately on the 0–5 scale. Respondent answers do not produce these values mechanically; assessors interpret responses and evidence against the domain anchors. Aggregation happens in a score run."
        meta={<SegmentedControl options={inScopeDomains.map((d) => ({ value: d, label: d }))} value={domain} onChange={(v) => { setDomain(v); setSelectedId(null); }} ariaLabel="Domain" />}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-ivory-deep/60 text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Metric</th>
                <th className="px-3 py-3 text-center font-semibold">M</th>
                <th className="px-3 py-3 text-center font-semibold">I</th>
                <th className="px-3 py-3 text-center font-semibold">O</th>
                <th className="px-3 py-3 text-center font-semibold">E</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Flags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((m) => {
                const st = statusTone[m.status];
                const active = selected?.metricId === m.metricId;
                return (
                  <tr key={m.metricId} onClick={() => setSelectedId(m.metricId)} className={cn("cursor-pointer hover:bg-ivory-deep/40", active && "bg-navy/[0.04]")}>
                    <td className="px-5 py-3">
                      <span className="block font-mono text-[11px] text-muted-foreground">{m.metricId}</span>
                      <span className="block text-foreground">{m.metricName}</span>
                    </td>
                    <Cell v={m.maturity} />
                    <Cell v={m.implementation} />
                    <td className="px-3 py-3 text-center font-mono text-xs">{m.outcomeNotApplicable ? <span className="text-muted-foreground">N/A</span> : m.outcome ?? <span className="text-muted-foreground">·</span>}</td>
                    <td className="px-3 py-3 text-center font-mono text-xs text-muted-foreground">{m.evidenceLevel ?? "·"}</td>
                    <td className="px-3 py-3">
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.flags.map((f) => (
                          <StatusBadge key={f.code} tone={f.severity === "high" ? "rose" : f.severity === "review" ? "amber" : "neutral"} title={f.label}>
                            {f.code}
                          </StatusBadge>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        {selected && <MetricEditor key={selected.metricId} assessmentId={id} metric={selected} />}
      </div>
    </PageContainer>
  );
}

function Cell({ v }: { v: MaturityLevel | null }) {
  return <td className="px-3 py-3 text-center font-mono text-xs">{v ?? <span className="text-muted-foreground">·</span>}</td>;
}

function MetricEditor({ assessmentId, metric }: { assessmentId: string; metric: MetricScoring }) {
  const save = useSaveMetricScoring(assessmentId);
  const [form, setForm] = useState<MetricScoringInput>({});
  useEffect(() => setForm({}), [metric.metricId]);
  const v = { ...metric, ...form };
  const set = <K extends keyof MetricScoringInput>(k: K, val: MetricScoringInput[K]) => setForm((f) => ({ ...f, [k]: val }));
  const dirty = Object.keys(form).length > 0;

  return (
    <Panel className="xl:sticky xl:top-24 xl:self-start">
      <div className="border-b border-border px-6 py-4">
        <p className="font-mono text-[11px] text-muted-foreground">{metric.metricId}</p>
        <h2 className="mt-1 font-sans text-[15px] font-semibold tracking-normal text-foreground">{metric.metricName}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {metric.capabilityArea} · {metric.measurementMethod}
        </p>
      </div>
      <div className="space-y-6 px-6 py-6">
        <Field label="Applicable to this institution" hint="N/A requires genuine contextual inapplicability and a documented rationale. Missing evidence or data is not N/A.">
          <SegmentedControl
            options={[
              { value: "yes", label: "Applicable" },
              { value: "no", label: "Not applicable" },
            ]}
            value={v.applicable ? "yes" : "no"}
            onChange={(x) => set("applicable", x === "yes")}
          />
        </Field>
        {v.applicable === false && (
          <Field label="N/A rationale">
            <TextArea rows={3} value={v.notApplicableRationale ?? ""} onChange={(e) => set("notApplicableRationale", e.target.value)} placeholder="Why this metric cannot apply to an institution of this type…" />
          </Field>
        )}

        {v.applicable !== false && (
          <>
            <LevelPicker label="Maturity (M)" value={v.maturity ?? null} onChange={(x) => set("maturity", x)} />
            <LevelPicker label="Implementation depth (I)" value={v.implementation ?? null} onChange={(x) => set("implementation", x)} />
            <div className="space-y-3">
              <LevelPicker label="Outcome (O)" value={v.outcome ?? null} onChange={(x) => { set("outcome", x); set("outcomeNotApplicable", false); }} disabled={!!v.outcomeNotApplicable} />
              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-muted-foreground">
                <input type="checkbox" className="mt-0.5" checked={!!v.outcomeNotApplicable} onChange={(e) => { set("outcomeNotApplicable", e.target.checked); if (e.target.checked) set("outcome", null); }} />
                <span>
                  Outcome legitimately not applicable for this metric <span className="block text-[11px]">Distinct from a blank outcome. A blank outcome is treated as incomplete, not as N/A.</span>
                </span>
              </label>
              {v.outcomeNotApplicable && <TextArea rows={2} value={v.outcomeNotApplicableRationale ?? ""} onChange={(e) => set("outcomeNotApplicableRationale", e.target.value)} placeholder="Why outcome cannot be observed for this metric…" />}
            </div>
            <Field label="Evidence level supporting this score">
              <SelectField options={evidenceLevels.map((l) => ({ value: l, label: l }))} value={v.evidenceLevel ?? null} onChange={(x) => set("evidenceLevel", x as EvidenceLevel)} placeholder="Select E0–E4" />
            </Field>
          </>
        )}

        <Field label="Rationale" hint="Required for every scored or N/A metric. Reference the responses and evidence relied upon.">
          <TextArea rows={4} value={v.rationale ?? ""} onChange={(e) => set("rationale", e.target.value)} />
        </Field>

        <div className="flex flex-wrap gap-1.5">
          {metric.linkedResponseIds.map((r) => (
            <Chip key={r}>{r}</Chip>
          ))}
          {metric.linkedEvidenceIds.map((e) => (
            <Chip key={e} tone="teal">
              {e}
            </Chip>
          ))}
        </div>

        {metric.engine && (
          <div className="rounded-md border border-border bg-ivory-deep/40 px-4 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Latest run {metric.engine.runId}:</span> metric score {metric.engine.metricScore ?? "—"} · {metric.engine.validation}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">{save.isSuccess && !dirty ? "Saved" : dirty ? "Unsaved changes" : ""}</span>
          <div className="flex gap-2">
            <Button variant="outline" className="h-9" disabled={!dirty || save.isPending} onClick={() => save.mutate({ metricId: metric.metricId, input: { ...form, status: "draft" } }, { onSuccess: () => setForm({}) })}>
              Save draft
            </Button>
            <Button className="h-9" disabled={save.isPending || !(v.rationale ?? "").trim()} onClick={() => save.mutate({ metricId: metric.metricId, input: { ...form, status: v.applicable === false ? "not_applicable" : "scored" } }, { onSuccess: () => setForm({}) })}>
              {v.applicable === false ? "Record N/A" : "Record score"}
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function LevelPicker({ label, value, onChange, disabled }: { label: string; value: MaturityLevel | null; onChange: (v: MaturityLevel) => void; disabled?: boolean }) {
  return (
    <Field label={label}>
      <div className={cn("grid grid-cols-6 gap-1.5", disabled && "pointer-events-none opacity-40")} role="radiogroup" aria-label={label}>
        {levels.map((l) => (
          <button key={l} type="button" role="radio" aria-checked={value === l} onClick={() => onChange(l)} className={cn("flex h-12 cursor-pointer flex-col items-center justify-center rounded-md border text-center transition-colors", value === l ? "border-navy bg-navy text-primary-foreground" : "border-border text-foreground hover:border-navy/40")}>
            <span className="font-serif text-base leading-none">{l}</span>
            <span className={cn("mt-1 text-[9px] uppercase tracking-[0.08em]", value === l ? "text-primary-foreground/80" : "text-muted-foreground")}>{maturityLabels[l]}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}
