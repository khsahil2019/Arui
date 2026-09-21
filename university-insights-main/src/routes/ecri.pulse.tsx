import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { QuestionCard } from "@/components/ari/question-card";
import { SignalProgress, SaveIndicator } from "@/components/ari/progress";
import { InsightCard } from "@/components/ari/insight-card";
import { ResponseControls, ResponsePanel } from "@/components/ari/response-controls";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { queries, useSaveResponse } from "@/api/hooks";
import { ecriDimensionNames } from "@/lib/catalogue";

export const Route = createFileRoute("/ecri/pulse")({
  loader: async ({ context }) => {
    const assessmentId = (context as any)?.assessmentId;
    if (assessmentId) {
      await context.queryClient
        .ensureQueryData(queries.screening(assessmentId))
        .catch(() => undefined);
    }
  },
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "ECRI Career Pulse — Placement & Employability Signals" },
      {
        name: "description",
        content:
          "Strategic signals that give the ECRI assessment an early read of employer engagement, WIL penetration, and graduate readiness.",
      },
    ],
  }),
  component: EcriPulsePage,
});

function EcriPulsePage() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any)?.assessmentId;
  const { data: screening } = useQuery({
    ...queries.screening(assessmentId || ""),
    enabled: !!assessmentId,
  });
  const save = useSaveResponse(assessmentId || "");
  const [index, setIndex] = useState(0);
  const [complete, setComplete] = useState(false);

  if (!screening) {
    return <PagePending />;
  }

  const prompts = screening.prompts;
  const responded = new Set(screening.responses.map((r) => r.promptId));
  const firstOpen = prompts.findIndex((p) => !responded.has(p.id));

  const prompt = prompts[index]!;
  const existing = screening.responses.find((r) => r.promptId === prompt.id) ?? null;
  const captured = screening.responses.length;

  const next = () => {
    if (index < prompts.length - 1) setIndex(index + 1);
    else setComplete(true);
  };

  if (complete) {
    return (
      <PageContainer width="narrow">
        <div className="mx-auto max-w-2xl py-10 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="size-5" strokeWidth={2.5} />
          </span>
          <p className="eyebrow mt-8 text-emerald-800">{screening.title}</p>
          <h1 className="mt-3 text-3xl md:text-4xl font-serif">
            {prompts.length} career signals captured.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            The benchmark now has an early reading of employer integration across the institution.
            The next stage explores each dimension in turn, beginning with D01 ·{" "}
            {ecriDimensionNames.D01}.
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
            <Button
              asChild
              size="lg"
              className="h-11 px-6 text-[15px] bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Link to="/ecri/assessment/$domain" params={{ domain: "D01" }}>
                Begin D01 · Employer-Curriculum Co-Design <ArrowRight className="ml-2 size-4" />
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
          className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 border-emerald-100"
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
                <Button
                  className="h-10 px-5 bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={next}
                  disabled={!existing}
                >
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
                i === index && "text-emerald-950 font-semibold",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  responded.has(p.id)
                    ? "bg-emerald-700"
                    : i === index
                      ? "bg-emerald-500"
                      : "bg-border",
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
