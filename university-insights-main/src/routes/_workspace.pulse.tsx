import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { QuestionCard } from "@/components/ari/question-card";
import { SignalProgress, SaveIndicator } from "@/components/ari/progress";
import { InsightCard } from "@/components/ari/insight-card";
import { ResponseControls, ResponsePanel } from "@/components/ari/response-controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { queries, useSaveResponse } from "@/api/hooks";
import { domainNames } from "@/lib/catalogue";

export const Route = createFileRoute("/_workspace/pulse")({
  loader: ({ context }) =>
    context.queryClient
      .ensureQueryData(queries.screening(context.assessmentId))
      .then(() => undefined),
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "Institutional Pulse — AI Resilient University" },
      {
        name: "description",
        content:
          "A short set of strategic signals that give the assessment an early read of how AI is positioned, governed and practised across the institution.",
      },
      { property: "og:title", content: "Institutional Pulse — AI Resilient University" },
      {
        property: "og:description",
        content: "A short strategic diagnostic of institutional signals.",
      },
    ],
  }),
  component: PulsePage,
});

function PulsePage() {
  const { assessmentId } = Route.useRouteContext();
  const { data: screening } = useSuspenseQuery(queries.screening(assessmentId));
  const save = useSaveResponse(assessmentId);
  const prompts = screening?.prompts || [];
  const responded = new Set((screening?.responses || []).map((r) => r.promptId));
  const firstOpen = prompts.findIndex((p) => !responded.has(p.id));
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [complete, setComplete] = useState(Boolean(screening?.complete && firstOpen === -1));

  if (prompts.length === 0) {
    return (
      <PageContainer width="narrow">
        <div className="mx-auto max-w-2xl py-10 text-center">
          <h1 className="mt-3 text-3xl font-serif">Assessment Ready</h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            No preliminary screening signals required. You can proceed directly to the domain assessment.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-11 px-6 text-[15px]">
              <Link to="/assessment/$domain" params={{ domain: "D01" }}>
                Begin D01 · Institutional Strategy <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const prompt = prompts[index] || prompts[0];
  const existing = (screening?.responses || []).find((r) => r.promptId === prompt?.id) ?? null;
  const captured = screening?.responses?.length || 0;

  const next = () => {
    if (index < prompts.length - 1) setIndex(index + 1);
    else setComplete(true);
  };

  if (complete) {
    return (
      <PageContainer width="narrow">
        <div className="mx-auto max-w-2xl py-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-teal-soft text-teal">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <p className="eyebrow mt-8">{screening.title}</p>
          <h1 className="mt-3 text-3xl md:text-4xl">{prompts.length} signals captured.</h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            The assessment now has an early sense of how AI sits within the institution. The next
            stage explores each domain in turn, beginning with D01 · {domainNames.D01}.
          </p>
          {screening.earlySignal && (
            <div className="mt-10 text-left">
              <InsightCard kind="early" title={screening.earlySignal.title}>
                {screening.earlySignal.body}
              </InsightCard>
            </div>
          )}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setComplete(false);
                setIndex(0);
              }}
            >
              Review signals
            </Button>
            <Button asChild size="lg" className="h-11 px-6 text-[15px]">
              <Link to="/assessment/$domain" params={{ domain: "D01" }}>
                Begin D01 · Institutional Strategy <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="narrow">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SignalProgress
          label={screening.title}
          caption={`${captured} of ${prompts.length} signals captured`}
          current={captured}
          total={prompts.length}
        />
        <SaveIndicator state={save.isPending ? "saving" : "saved"} />
      </div>
      {index === 0 && captured === 0 && (
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {screening.intro}
        </p>
      )}

      <div className="mt-8 space-y-6">
        <QuestionCard
          key={prompt.id}
          variant="hero"
          eyebrow={prompt.theme}
          theme={`Signal ${index + 1}`}
          question={prompt.prompt}
          help={prompt.help}
          className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          footer={
            <>
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
              >
                <ArrowLeft /> Previous signal
              </Button>
              <div className="flex items-center gap-3">
                {!existing && (
                  <span className="text-xs text-muted-foreground">
                    Select a response to continue
                  </span>
                )}
                <Button className="h-10 px-5" onClick={next} disabled={!existing}>
                  {index === prompts.length - 1 ? "Complete pulse" : "Next signal"} <ArrowRight />
                </Button>
              </div>
            </>
          }
        >
          <ResponsePanel
            prompt={prompt}
            existing={existing}
            saving={save.isPending}
            onSave={(input) => save.mutate({ promptId: prompt.id, ...input })}
            autosaveChoices
          />
          <ResponseControls
            prompt={prompt}
            existing={existing}
            onSave={(input) => save.mutate({ promptId: prompt.id, ...input })}
            className="mt-3"
          />
        </QuestionCard>

        {screening.earlySignal && (
          <div className="animate-in fade-in-0 duration-500">
            <InsightCard kind="early" title={screening.earlySignal.title}>
              {screening.earlySignal.body}
            </InsightCard>
          </div>
        )}
      </div>

      <ol className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
        {prompts.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 underline-offset-4 hover:underline",
                i === index && "text-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  responded.has(p.id) ? "bg-navy" : i === index ? "bg-blue" : "bg-border",
                )}
              />
              {p.theme}
            </button>
          </li>
        ))}
      </ol>
    </PageContainer>
  );
}
