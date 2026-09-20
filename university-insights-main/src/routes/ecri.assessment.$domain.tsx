import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, GitBranch } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { QuestionCard } from "@/components/ari/question-card";
import { SignalProgress, SaveIndicator } from "@/components/ari/progress";
import { ResponseControls, ResponsePanel } from "@/components/ari/response-controls";
import { StatusBadge } from "@/components/ari/status-badge";
import { Button } from "@/components/ui/button";
import { ecriDimensionNames, inScopeDomains, type DomainCode, type ChoiceOption } from "@/lib/catalogue";
import { queries, useSaveResponse } from "@/api/hooks";

function isDomain(v: string): v is DomainCode {
  return v in ecriDimensionNames;
}

export const Route = createFileRoute("/ecri/assessment/$domain")({
  validateSearch: (search: Record<string, unknown>): { p?: string } =>
    typeof search["p"] === "string" ? { p: search["p"] } : {},
  beforeLoad: ({ params }) => {
    if (!isDomain(params.domain) || !inScopeDomains.includes(params.domain)) throw notFound();
    return { domain: params.domain };
  },
  loaderDeps: ({ search }) => ({ p: search.p }),
  loader: async ({ context, deps }) => {
    const assessmentId = (context as any)?.assessmentId;
    const domain = (context as any)?.domain;
    if (assessmentId && domain) {
      await context.queryClient
        .ensureQueryData(
          deps.p
            ? queries.promptById(assessmentId, domain, deps.p)
            : queries.nextPrompt(assessmentId, domain, null),
        )
        .catch(() => undefined);
    }
  },
  pendingComponent: () => <PagePending />,
  head: ({ params }) => {
    const name = isDomain(params.domain) ? ecriDimensionNames[params.domain] : "Assessment";
    return {
      meta: [
        { title: `${params.domain} · ${name} — ECRI Assessment` },
        { name: "description", content: `Assessment questions for ${name}.` },
      ],
    };
  },
  component: EcriDomainRunner,
});

function EcriDomainRunner() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any)?.assessmentId;
  const domain = (ctx as any)?.domain as DomainCode;
  const { p } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data } = useQuery({
    ...(p
      ? queries.promptById(assessmentId || "", domain, p)
      : queries.nextPrompt(assessmentId || "", domain, null)),
    enabled: !!assessmentId && !!domain,
  });
  const save = useSaveResponse(assessmentId || "");

  if (!data) {
    return <PagePending />;
  }

  const priorId =
    data.prompt?.presentation.kind === "matrix" &&
    data.prompt.presentation.rows.source === "prior_response"
      ? data.prompt.presentation.rows.promptId
      : null;
  const prior = useQuery({
    ...queries.promptById(assessmentId, domain, priorId ?? "none"),
    enabled: !!priorId,
  });
  const priorRows: ChoiceOption[] | undefined = (() => {
    if (!priorId || !prior.data?.prompt) return undefined;
    const pres = prior.data.prompt.presentation;
    const value =
      prior.data.existingResponse?.state === "answered" ? prior.data.existingResponse.value : null;
    if (pres.kind !== "multi_choice" || !Array.isArray(value)) return [];
    return pres.options.filter((o) => (value as string[]).includes(o.value));
  })();

  const goTo = (promptId: string | undefined) =>
    navigate({
      to: ".",
      search: promptId ? { p: promptId } : {},
      params: { domain },
    });

  if (!data.prompt) {
    return (
      <PageContainer width="narrow">
        <div className="mx-auto max-w-2xl py-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <p className="eyebrow mt-8 text-emerald-800">
            {domain} · {ecriDimensionNames[domain]}
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-serif">
            {data.domainComplete
              ? "This dimension is complete for now."
              : "Nothing further to evaluate right now."}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            The assessment will calculate calibration signals and verify against industry co-design metrics.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/ecri/assessment">All 11 Dimensions</Link>
            </Button>
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Link to="/ecri/evidence">Continue to WIL & Evidence Vault →</Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const { prompt, position, existingResponse: existing } = data;
  const idx = data.history.findIndex((h) => h.promptId === prompt.id);
  const prevId =
    idx > 0
      ? data.history[idx - 1]?.promptId
      : idx === -1 && data.history.length
        ? data.history[data.history.length - 1]?.promptId
        : undefined;
  const hasResponse = !!existing;

  return (
    <PageContainer width="narrow">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {position ? (
          <SignalProgress
            label={`${domain} · ${ecriDimensionNames[domain].split(",")[0]}`}
            caption={`${position.theme} · Exploring ${position.withinTheme.current} of ${position.withinTheme.total}`}
            current={position.themeIndex}
            total={position.themeTotal}
          />
        ) : (
          <span className="eyebrow text-emerald-800">{domain}</span>
        )}
        <SaveIndicator state={save.isPending ? "saving" : "saved"} />
      </div>

      <QuestionCard
        key={prompt.id}
        eyebrow={prompt.theme}
        theme={
          prompt.origin === "targeted" ? (
            <StatusBadge tone="amber">Targeted follow-up</StatusBadge>
          ) : (
            `Theme ${position ? position.themeIndex + 1 : ""}`
          )
        }
        question={prompt.prompt}
        help={prompt.help}
        className="mt-6 border-emerald-100"
        footer={
          <>
            <Button
              variant="ghost"
              className="text-muted-foreground"
              disabled={!prevId}
              onClick={() => goTo(prevId)}
            >
              <ArrowLeft /> Previous
            </Button>
            <div className="flex items-center gap-3">
              <Button
                className="h-10 px-5 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={!hasResponse}
                onClick={() => navigate({ to: ".", params: { domain }, search: {} })}
              >
                Continue <ArrowRight />
              </Button>
            </div>
          </>
        }
      >
        {prompt.targetedReason && (
          <div className="mb-5 flex gap-3 rounded-md border border-amber/40 bg-amber-soft/40 px-4 py-3 text-[13.5px] leading-relaxed text-foreground/80">
            <GitBranch className="mt-0.5 size-4 shrink-0 text-amber" />
            <p>{prompt.targetedReason}</p>
          </div>
        )}
        <ResponsePanel
          prompt={prompt}
          existing={existing}
          saving={save.isPending}
          onSave={(input) => save.mutate({ promptId: prompt.id, ...input })}
          priorRows={priorRows}
          autosaveChoices
        />
        <ResponseControls
          prompt={prompt}
          existing={existing}
          onSave={(input) => save.mutate({ promptId: prompt.id, ...input })}
          className="mt-4"
        />
      </QuestionCard>
    </PageContainer>
  );
}
