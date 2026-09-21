import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { StepList, SaveIndicator } from "@/components/ari/progress";
import { AnswerCardGroup } from "@/components/ari/answer-card";
import { SegmentedControl } from "@/components/ari/segmented-control";
import { Field, TextInput } from "@/components/ari/form-field";
import { Panel } from "@/components/ari/panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProfileFieldDefinition, ProfileValue, ProfileValues } from "@/api/types";
import { queries, useSaveProfile } from "@/api/hooks";

export const Route = createFileRoute("/ecri/profile")({
  loader: async ({ context }) => {
    const assessmentId = (context as any)?.assessmentId;
    if (assessmentId) {
      await Promise.all([
        context.queryClient.ensureQueryData(queries.profileForm()).catch(() => undefined),
        context.queryClient.ensureQueryData(queries.profile(assessmentId)).catch(() => undefined),
      ]);
    }
  },
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "ECRI Institutional & WIL Profile — Employability & Career Readiness" },
      {
        name: "description",
        content:
          "Institutional baseline setup to calibrate employer co-design, WIL internship scale, and graduate outcome tracking.",
      },
    ],
  }),
  component: EcriProfilePage,
});

function EcriProfilePage() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any)?.assessmentId;
  const { data: form } = useQuery(queries.profileForm());
  const { data: profile } = useQuery({
    ...queries.profile(assessmentId || ""),
    enabled: !!assessmentId,
  });
  const save = useSaveProfile(assessmentId || "");

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<ProfileValues>({});

  useEffect(() => {
    if (profile?.values) {
      setValues(profile.values);
    }
  }, [profile?.values]);

  const pending = useRef<ProfileValues>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = () => {
    if (Object.keys(pending.current).length === 0) return;
    const batch = pending.current;
    pending.current = {};
    save.mutate(batch);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      flush();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (!form || !profile) {
    return <PagePending />;
  }

  const set = (id: string, v: ProfileValue) => {
    setValues((s) => ({ ...s, [id]: v }));
    pending.current[id] = v;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, 500);
  };

  const steps = form.steps;
  const current = steps[step]!;
  const isLast = step === steps.length - 1;
  const stepComplete = (i: number) =>
    steps[i]!.fields.every((f) => !f.required || filled(values[f.id]));
  const completed = steps.filter((_, i) => stepComplete(i)).map((s) => s.id);
  const saveState = save.isPending || Object.keys(pending.current).length ? "saving" : "saved";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="ECRI Institutional & WIL Profile"
        title="Employability Context & Industry Baseline"
        lede="A short guided calibration. ECRI uses this context to calibrate required employability benchmarks, WIL internship proportionality, and regional hiring targets."
        meta={
          <SaveIndicator state={saveState} {...(profile.updatedAt ? { time: "recently" } : {})} />
        }
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow mb-3 px-3 text-emerald-800">Setup Parameters</p>
          <StepList steps={steps} currentIndex={step} completed={completed} onSelect={setStep} />
          <div className="mt-6 flex gap-3 rounded-md border border-emerald-200 bg-emerald-50/40 px-4 py-3.5 text-[13px] leading-relaxed text-emerald-950 shadow-card">
            <Info className="mt-0.5 size-4 shrink-0 text-emerald-700" />
            <p>
              These context parameters calibrate the required employability maturity target without
              penalizing degree specialization.
            </p>
          </div>
        </aside>

        <div className="max-w-3xl">
          <div className="mb-8">
            <p className="eyebrow mb-2 text-emerald-800">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="text-2xl text-foreground md:text-3xl">
              {current.label || (current as any).title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
          </div>

          <div
            key={current.id}
            className="space-y-10 animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
          >
            {current.fields.map((f) => (
              <ProfileField
                key={f.id}
                field={f}
                value={values[f.id] ?? null}
                onChange={(v) => set(f.id, v)}
              />
            ))}
            {isLast && (
              <Panel
                tone="muted"
                className="px-5 py-4 text-sm leading-relaxed text-muted-foreground border-emerald-100"
              >
                Once your ECRI profile is confirmed, proceed to Orientation and the Placement Pulse.
              </Panel>
            )}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-muted-foreground"
            >
              <ArrowLeft /> Back
            </Button>
            {isLast ? (
              <Button
                asChild
                size="lg"
                className="h-11 px-6 text-[15px] bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Link to="/ecri/orientation" onClick={flush}>
                  Continue to ECRI Orientation <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-11 px-6 text-[15px] bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
              >
                Continue <ArrowRight />
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function filled(v: ProfileValue | undefined) {
  if (Array.isArray(v)) return v.length > 0;
  return v !== null && v !== undefined && v !== "";
}

function ProfileField({
  field,
  value,
  onChange,
}: {
  field: ProfileFieldDefinition;
  value: ProfileValue;
  onChange: (v: ProfileValue) => void;
}) {
  const opts = field.options ?? [];
  const label = (
    <>
      {field.label}
      {!field.required && (
        <span className="ml-2 text-xs font-normal text-muted-foreground">Optional</span>
      )}
    </>
  );
  switch (field.type) {
    case "text":
      return (
        <Field label={label} hint={field.hint}>
          <TextInput
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            aria-label={field.label}
          />
        </Field>
      );
    case "single":
      return (
        <Field label={label} hint={field.hint}>
          <AnswerCardGroup
            options={opts}
            value={typeof value === "string" ? value : null}
            onChange={onChange}
            columns={2}
            size="compact"
            ariaLabel={field.label}
          />
        </Field>
      );
    case "band":
      return (
        <Field label={label} hint={field.hint}>
          <SegmentedControl
            options={opts}
            value={typeof value === "string" ? value : null}
            onChange={onChange}
            ariaLabel={field.label}
          />
        </Field>
      );
    case "multi": {
      const selected = Array.isArray(value) ? value : [];
      return (
        <Field label={label} hint={field.hint}>
          <div className="flex flex-wrap gap-2" role="group" aria-label={field.label}>
            {opts.map((o) => {
              const on = selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    onChange(on ? selected.filter((s) => s !== o.value) : [...selected, o.value])
                  }
                  className={cn(
                    "cursor-pointer rounded-md border px-3.5 py-2 text-sm font-medium transition-colors",
                    on
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-border bg-card text-foreground hover:border-emerald-600",
                  )}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </Field>
      );
    }
    case "scale5": {
      const n = typeof value === "number" ? value : null;
      return (
        <Field label={label} hint={field.hint}>
          <div className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={field.label}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={n === v}
                  onClick={() => onChange(v)}
                  className={cn(
                    "h-11 cursor-pointer rounded-md border font-serif text-lg transition-colors",
                    n === v
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-border text-foreground hover:border-emerald-600",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            {field.scaleEnds && (
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>{field.scaleEnds.low}</span>
                <span>{field.scaleEnds.high}</span>
              </div>
            )}
          </div>
        </Field>
      );
    }
  }
}
