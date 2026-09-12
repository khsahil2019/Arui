import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, GitBranch, Paperclip } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { QuestionCard } from "@/components/ari/question-card";
import { SignalProgress, SaveIndicator } from "@/components/ari/progress";
import { ResponseControls, ResponsePanel } from "@/components/ari/response-controls";
import { StatusBadge } from "@/components/ari/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { domainNames, inScopeDomains, type DomainCode } from "@/lib/catalogue";
import type { ChoiceOption } from "@/lib/catalogue";
import { queries, useSaveResponse } from "@/api/hooks";

function isDomain(v: string): v is DomainCode {
  return v in domainNames;
}

export const Route = createFileRoute("/_workspace/assessment/$domain")({
  validateSearch: (search: Record<string, unknown>): { p?: string } =>
    typeof search["p"] === "string" ? { p: search["p"] } : {},
  beforeLoad: ({ params }) => {
    if (!isDomain(params.domain) || !inScopeDomains.includes(params.domain)) throw notFound();
    return { domain: params.domain };
  },
  loaderDeps: ({ search }) => ({ p: search.p }),
  loader: ({ context, deps }) =>
    context.queryClient
      .ensureQueryData(
        deps.p
          ? queries.promptById(context.assessmentId, context.domain, deps.p)
          : queries.nextPrompt(context.assessmentId, context.domain, null),
      )
      .then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: ({ params }) => {
    const name = isDomain(params.domain) ? domainNames[params.domain] : "Assessment";
    return {
      meta: [
        { title: `${params.domain} · ${name} — AI Resilient University` },
        { name: "description", content: `Assessment questions for ${name}.` },
        { property: "og:title", content: `${params.domain} · ${name} — AI Resilient University` },
        { property: "og:description", content: `Assessment questions for ${name}.` },
      ],
    };
  },
  component: DomainRunner,
});

function DomainRunner() {
  const { assessmentId, domain } = Route.useRouteContext();
  const { p } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data } = useSuspenseQuery(
    p
      ? queries.promptById(assessmentId, domain, p)
      : queries.nextPrompt(assessmentId, domain, null),
  );
  const save = useSaveResponse(assessmentId);

  // Matrix prompts may build on an earlier response; fetch it through the same boundary.
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
    navigate({ to: ".", search: promptId ? { p: promptId } : {}, params: { domain } });

  if (!data.prompt) {
    return (
      <PageContainer width="narrow">
        <div className="mx-auto max-w-2xl py-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-soft text-teal">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <p className="eyebrow mt-8">
            {domain} · {domainNames[domain]}
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl">
            {data.domainComplete
              ? "This domain is complete for now."
              : "Nothing further to ask right now."}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            The assessment may return with targeted follow-ups once responses and evidence have been
            reviewed. You can revisit any response from the list below.
          </p>
          <ol className="mx-auto mt-8 max-w-md divide-y divide-border rounded-lg border border-border bg-card text-left shadow-card">
            {data.history.map((h, i) => (
              <li key={h.promptId}>
                <button
                  type="button"
                  onClick={() => goTo(h.promptId)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm hover:bg-ivory-deep/50"
                >
                  <span className="w-5 font-mono text-[11px] text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 text-foreground">{h.theme}</span>
                  <StateChip state={h.state} />
                </button>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/assessment">All domains</Link>
            </Button>
            <NextDomainButton current={domain} />
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
            label={`${domain} · ${shortName(domain)}`}
            caption={`${position.theme} · Exploring ${position.withinTheme.current} of ${position.withinTheme.total}`}
            current={position.themeIndex}
            total={position.themeTotal}
          />
        ) : (
          <span className="eyebrow">{domain}</span>
        )}
        <SaveIndicator state={save.isPending ? "saving" : "saved"} />
      </div>

      {position && (
        <ol className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          {position.themes.map((t) => (
            <li
              key={t.label}
              className={cn(
                "inline-flex items-center gap-2",
                t.state === "current" && "text-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  t.state === "complete"
                    ? "bg-navy"
                    : t.state === "current"
                      ? "bg-blue"
                      : "bg-border",
                )}
              />
              {t.label}
            </li>
          ))}
        </ol>
      )}

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
        className="mt-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
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
              {!hasResponse && (
                <span className="text-xs text-muted-foreground">
                  Save a response, or tell us you're not sure, to continue
                </span>
              )}
              <Button
                className="h-10 px-5"
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
        {prompt.evidenceHints && prompt.evidenceHints.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <Paperclip className="size-3.5" />
            <span>Evidence that would strengthen this response:</span>
            {prompt.evidenceHints.map((h) => (
              <span
                key={h}
                className="rounded-sm border border-border bg-ivory-deep/60 px-2 py-0.5 text-foreground/80"
              >
                {h}
              </span>
            ))}
            <Link to="/evidence" className="ml-auto text-blue underline-offset-4 hover:underline">
              Open evidence workspace
            </Link>
          </div>
        )}
      </QuestionCard>
    </PageContainer>
  );
}

function shortName(code: DomainCode) {
  return domainNames[code].split(",")[0]!.split(" & ")[0]!;
}

function StateChip({ state }: { state: string }) {
  const map: Record<string, { tone: "teal" | "blue" | "amber" | "neutral"; label: string }> = {
    answered: { tone: "teal", label: "Answered" },
    not_sure: { tone: "blue", label: "Not sure" },
    not_applicable_requested: { tone: "amber", label: "N/A requested" },
    not_answered: { tone: "neutral", label: "Open" },
  };
  const m = map[state] ?? map["not_answered"]!;
  return <StatusBadge tone={m.tone}>{m.label}</StatusBadge>;
}

function NextDomainButton({ current }: { current: DomainCode }) {
  const i = inScopeDomains.indexOf(current);
  const next = inScopeDomains[i + 1];
  if (!next) {
    return (
      <Button asChild size="lg" className="h-11 px-6 text-[15px]">
        <Link to="/evidence">
          Continue to evidence <ArrowRight />
        </Link>
      </Button>
    );
  }
  return (
    <Button asChild size="lg" className="h-11 px-6 text-[15px]">
      <Link to="/assessment/$domain" params={{ domain: next }}>
        Begin {next} · {shortName(next)} <ArrowRight />
      </Link>
    </Button>
  );
}
