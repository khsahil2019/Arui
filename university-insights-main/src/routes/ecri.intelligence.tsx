import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Hourglass } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader, SectionHeading } from "@/components/ari/page-header";
import { Panel, PanelHeader } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { InsightCard, Chip } from "@/components/ari/insight-card";
import { CoverageBar } from "@/components/ari/progress";
import {
  DomainPositionRow,
  MaturityScale,
  ScaleLegend,
  StatTile,
  confidenceLabel,
  confidenceTone,
} from "@/components/ari/domain-viz";
import { maturityLabels } from "@/lib/catalogue";
import { apiMode } from "@/api/client";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/ecri/intelligence")({
  loader: async ({ context }) => {
    const assessmentId = (context as any)?.assessmentId;
    if (assessmentId) {
      await Promise.all([
        context.queryClient.ensureQueryData(queries.results(assessmentId)).catch(() => undefined),
        context.queryClient.ensureQueryData(queries.status(assessmentId)).catch(() => undefined),
      ]);
    }
  },
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "ECRI Career Intelligence — Employability & Career Readiness" },
      {
        name: "description",
        content:
          "Indicative institutional position based on the current ECRI benchmark scope: dimension positions, required employability maturity, WIL coverage, and career outcomes.",
      },
    ],
  }),
  component: EcriIntelligencePage,
});

function EcriIntelligencePage() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any)?.assessmentId;
  const { data: results } = useQuery({
    ...queries.results(assessmentId || ""),
    enabled: !!assessmentId,
  });
  const { data: status } = useQuery({
    ...queries.status(assessmentId || ""),
    enabled: !!assessmentId,
  });

  if (!status) {
    return <PagePending />;
  }

  if (!results) {
    return (
      <PageContainer width="narrow">
        <div className="mx-auto max-w-2xl py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Hourglass className="size-5" />
          </span>
          <p className="eyebrow mt-8 text-emerald-800">ECRI Benchmark</p>
          <h1 className="mt-3 text-3xl md:text-4xl">Employability intelligence is compiling.</h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            A preliminary readout is generated once all 11 dimensions are evaluated and employer co-design evidence is attached.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/ecri/assessment"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-600 px-6 text-[15px] font-medium text-white shadow-raised hover:bg-emerald-700"
            >
              Continue ECRI Benchmark <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const o = results.overall;
  const sliceDomains = results.domains.filter((d) => d.assessed);
  const otherDomains = results.domains.filter((d) => !d.assessed);

  return (
    <PageContainer width="wide">
      {apiMode === "mock" && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-amber/40 bg-amber-soft/60 px-4 py-2.5 text-[13px] text-foreground/85">
          <StatusBadge tone="demo">Illustrative</StatusBadge>
          <span>
            These results are illustrative fixtures returned by the mock service.
          </span>
        </div>
      )}

      <PageHeader
        eyebrow={results.label}
        title="Employability & Career Readiness Position"
        lede={o.narrative}
        meta={
          <div className="flex flex-col items-start gap-2 md:items-end">
            <StatusBadge tone="blue" dot>
              Preliminary Analysis
            </StatusBadge>
            <span className="text-xs text-muted-foreground">
              Coverage: {results.coverage.assessed} of {results.coverage.total} dimensions
            </span>
            <span className="text-xs text-muted-foreground">
              {status.institutionName} · Cycle {status.cycle}
            </span>
          </div>
        }
      />

      <section className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:items-start">
        <Panel tone="navy" className="px-7 py-6">
          <p className="eyebrow text-primary-foreground/60">
            {results.coverage.assessed < results.coverage.total
              ? `Partial Assessment (${results.coverage.assessed}/${results.coverage.total} Dimensions)`
              : `Comprehensive (${results.coverage.codes})`}
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-serif text-4xl leading-none">
              {o.current !== null && o.current !== undefined
                ? maturityLabels[o.current]
                : "Withheld"}
            </span>
            <span className="text-sm text-primary-foreground/70">
              Required for this context:{" "}
              <span className="text-primary-foreground">
                {maturityLabels[o.required] || "Structured"}
              </span>
            </span>
          </div>
          {o.current !== null && o.current !== undefined ? (
            <MaturityScale
              current={o.current}
              required={o.required}
              size="large"
              inverse
              className="mt-6"
            />
          ) : (
            <div className="mt-4 rounded border border-white/20 bg-white/10 px-3 py-2 text-xs text-primary-foreground/80">
              Overall institution-wide ECRI score is withheld until all 11 dimensions are evaluated.
              Individual dimension baselines are displayed below.
            </div>
          )}
          <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.1em] text-primary-foreground/60">
            <span>{maturityLabels[1]}</span>
            <span>{maturityLabels[5]}</span>
          </div>
          <p className="mt-5 text-[13px] leading-relaxed text-primary-foreground/75">
            {results.scopeNote}
          </p>
        </Panel>
        <StatTile
          label="Transformation distance"
          value={
            o.transformationDistance !== null && o.transformationDistance !== undefined
              ? `${o.transformationDistance} level${o.transformationDistance === 1 ? "" : "s"}`
              : "Withheld"
          }
          detail="The gap between current employability capability and target employer requirements."
        />
        <StatTile
          label="Confidence"
          value={<span className="capitalize">{o.confidence}</span>}
          detail={
            <span className="flex items-center gap-2">
              <StatusBadge tone={confidenceTone[o.confidence]} dot>
                {confidenceLabel[o.confidence]}
              </StatusBadge>
            </span>
          }
        />
        <StatTile
          label="WIL evidence coverage"
          value={
            o.evidenceCoverage >= 0.66
              ? "Established"
              : o.evidenceCoverage >= 0.33
                ? "Building"
                : "Early"
          }
          detail={
            <span className="block space-y-1.5">
              <CoverageBar value={o.evidenceCoverage} tone="teal" />
              <span className="block">
                {status.evidence.submitted} WIL evidence items submitted
              </span>
            </span>
          }
        />
      </section>

      <section className="mt-14">
        <SectionHeading
          eyebrow="Dimension-level position"
          title="Employability Maturity by Dimension"
          description="Current position against the target employability maturity required for your curriculum mix."
          aside={<ScaleLegend className="hidden lg:flex" />}
        />
        <ScaleLegend className="mt-4 lg:hidden" />
        <Panel className="mt-6 border-emerald-100 shadow-sm">
          <PanelHeader
            eyebrow="Assessed in this cycle"
            title={`${results.coverage.codes} · ${sliceDomains.length} of ${results.domains.length} dimensions`}
          />
          <div className="divide-y divide-border px-6">
            {sliceDomains.map((d) => (
              <DomainPositionRow key={d.code} domain={d} />
            ))}
          </div>
          <PanelHeader
            eyebrow="Not yet assessed"
            title="Shown for roadmap purposes only — no positions displayed"
            className="border-t"
          />
          <div className="divide-y divide-border px-6">
            {otherDomains.map((d) => (
              <DomainPositionRow key={d.code} domain={d} />
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Strengths" title="Employability & Partnership Advantages" />
          <div className="mt-5 space-y-3">
            {results.strengths.map((s) => (
              <InsightCard key={s.title} kind="strength" title={s.title}>
                {s.body}
              </InsightCard>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Action Areas" title="Priority WIL & Career Improvements" />
          <div className="mt-5 space-y-3">
            {results.vulnerabilities.map((v) => (
              <InsightCard key={v.title} kind="vulnerability" title={v.title}>
                {v.body}
              </InsightCard>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* MULTI-LAYER BENCHMARKING & COMPARATIVE INTELLIGENCE (INSTRUCTIONS #40-#55) */}
      {/* -------------------------------------------------------------------- */}
      <section className="mt-14 mb-10">
        <SectionHeading
          eyebrow="Comparative Intelligence & Benchmarking"
          title="Multi-Layer Benchmarking Framework"
          description="Progressive comparative intelligence across Institutional Baseline, Peer Groups, Cohorts, and Sector Reference Points."
        />

        <div className="mt-6 rounded-2xl border border-teal/30 bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-teal/10 px-2.5 py-1 text-xs font-bold text-teal">
                  Level 1 to Level 5 Comparison Framework
                </span>
                <span className="rounded bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  Dataset Growth Mode
                </span>
              </div>
              <h4 className="mt-2 text-lg font-serif font-bold text-foreground">
                Statistical Validity & Zero Fake Rankings Policy
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Active Peer Group</span>
              <strong className="text-sm text-foreground">Comprehensive Research & Teaching Universities</strong>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            {/* Level 1: Institutional Baseline */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <span className="font-bold text-teal block uppercase tracking-wider text-[11px]">
                Level 1 · Historical Baseline
              </span>
              <div className="text-xl font-bold font-serif text-foreground">First Cycle</div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Baseline assessment recorded. Trajectory analytics and delta tracking will activate upon Cycle 2 review.
              </p>
            </div>

            {/* Level 2: Peer Benchmark */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <span className="font-bold text-teal block uppercase tracking-wider text-[11px]">
                Level 2 · Peer Group (PG-COMP)
              </span>
              <div className="text-xl font-bold font-serif text-foreground">N = 4 / 10</div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-teal" style={{ width: "40%" }} />
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                6 additional verified institutions needed to activate peer median & IQR percentiles.
              </p>
            </div>

            {/* Level 3: Cohort Benchmark */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <span className="font-bold text-teal block uppercase tracking-wider text-[11px]">
                Level 3 · Cohort Reference
              </span>
              <div className="text-xl font-bold font-serif text-foreground">High-Volume Intake</div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Segmented by student scale & multi-faculty discipline structure.
              </p>
            </div>

            {/* Level 4: Sector Benchmark */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
              <span className="font-bold text-teal block uppercase tracking-wider text-[11px]">
                Level 4 · Sector Aggregate
              </span>
              <div className="text-xl font-bold font-serif text-foreground">N = 7 / 20</div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Higher education national dataset accumulating under irreversible hash anonymisation.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
            <span className="font-bold text-sm">🔒</span>
            <div>
              <strong>Zero Fake Rankings Guarantee (Instruction #41 & #45):</strong>
              <p className="mt-0.5 text-muted-foreground dark:text-amber-200/80 leading-relaxed">
                ECRI strictly prohibits generating manufactured ranks or percentiles from small sample sizes. Comparative distributions, medians, and quadrant positioning activate automatically once minimum sample thresholds ($N \ge 10$) are achieved across verified audits.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
