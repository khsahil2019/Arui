import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
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

export const Route = createFileRoute("/arui/intelligence")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(queries.results((context as any).assessmentId)),
      context.queryClient.ensureQueryData(queries.status((context as any).assessmentId)),
    ]).then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "ARUI Strategic Intelligence — Preliminary Analysis" },
      {
        name: "description",
        content:
          "Indicative institutional position based on the current ARUI assessment scope: domain positions, required maturity, transformation distance, and confidence signals.",
      },
    ],
  }),
  component: AruiIntelligencePage,
});

function AruiIntelligencePage() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any).assessmentId;
  const { data: results } = useSuspenseQuery(queries.results(assessmentId));
  const { data: status } = useSuspenseQuery(queries.status(assessmentId));

  if (!results) {
    return (
      <PageContainer width="narrow">
        <div className="mx-auto max-w-2xl py-16 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-soft text-blue">
            <Hourglass className="size-5" />
          </span>
          <p className="eyebrow mt-8">ARUI Assessment</p>
          <h1 className="mt-3 text-3xl md:text-4xl">Results are not yet available.</h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            A preliminary position is prepared once the assessed domains are complete and evidence has
            been submitted.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/arui/assessment"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-navy px-6 text-[15px] font-medium text-primary-foreground shadow-raised hover:bg-navy-deep"
            >
              Continue ARUI Assessment <ArrowRight className="size-4" />
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
        title="Institutional AI Resilience Strategic Position"
        lede={o.narrative}
        meta={
          <div className="flex flex-col items-start gap-2 md:items-end">
            <StatusBadge tone="blue" dot>
              Preliminary Analysis
            </StatusBadge>
            <span className="text-xs text-muted-foreground">
              Coverage: {results.coverage.assessed} of {results.coverage.total} domains
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
              ? `Partial Assessment (${results.coverage.assessed}/${results.coverage.total} Domains)`
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
              Overall institution-wide ARUI score is withheld until all 11 domains are evaluated.
              Individual domain baselines are displayed below.
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
          detail="The gap between current posture and calibrated requirements for high AI resilience."
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
          label="Evidence coverage"
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
                {status.evidence.submitted} evidence items submitted
              </span>
            </span>
          }
        />
      </section>

      <section className="mt-14">
        <SectionHeading
          eyebrow="Domain-level position"
          title="Where the institution stands, domain by domain"
          description="Current position against the maturity this institutional context requires, for the assessed domains only."
          aside={<ScaleLegend className="hidden lg:flex" />}
        />
        <ScaleLegend className="mt-4 lg:hidden" />
        <Panel className="mt-6">
          <PanelHeader
            eyebrow="Assessed in this cycle"
            title={`${results.coverage.codes} · ${sliceDomains.length} of ${results.domains.length} domains`}
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
          <SectionHeading eyebrow="Strengths" title="What the institution can build on" />
          <div className="mt-5 space-y-3">
            {results.strengths.map((s) => (
              <InsightCard key={s.title} kind="strength" title={s.title}>
                {s.body}
              </InsightCard>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Vulnerabilities" title="Where resilience is thin" />
          <div className="mt-5 space-y-3">
            {results.vulnerabilities.map((v) => (
              <InsightCard key={v.title} kind="vulnerability" title={v.title}>
                {v.body}
              </InsightCard>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
