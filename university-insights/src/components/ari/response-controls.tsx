import { useEffect, useState } from "react";
import { Ban, Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChoiceOption } from "@/lib/catalogue";
import type { Prompt, PromptResponse } from "@/api/types";
import type { SaveResponseInput } from "@/api/client";
import { PromptInput, type ChangeMeta } from "./prompt-input";
import { SelectField, ShortText } from "./form-field";
import { Button } from "@/components/ui/button";

export type SaveInput = Omit<SaveResponseInput, "promptId">;

interface ResponsePanelProps {
  prompt: Prompt;
  existing: PromptResponse | null;
  saving: boolean;
  onSave: (input: SaveInput) => void;
  /** Persist discrete selections immediately; typed text still needs an explicit save. */
  autosaveChoices?: boolean;
  priorRows?: ChoiceOption[] | undefined;
}

/** Renders the prompt's presentation with a local draft. Selections save on the spot; typed text is saved explicitly. */
export function ResponsePanel({ prompt, existing, saving, onSave, autosaveChoices, priorRows }: ResponsePanelProps) {
  const [draft, setDraft] = useState<unknown>(existing?.state === "answered" ? existing.value : null);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setDraft(existing?.state === "answered" ? existing.value : null);
    setDirty(false);
  }, [prompt.id, existing?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const pres = prompt.presentation;
  const plainChoice = pres.kind === "single_choice" && !pres.allowOther && !pres.nuance;
  const change = (v: unknown, meta: ChangeMeta) => {
    setDraft(v);
    if (autosaveChoices && meta.commit) {
      onSave({ state: "answered", value: v });
      setDirty(false);
    } else setDirty(true);
  };
  const declined = existing?.state === "not_sure" || existing?.state === "not_applicable_requested";

  return (
    <div className={cn("space-y-4", declined && "opacity-60")}>
      <PromptInput presentation={pres} value={draft} onChange={change} priorRows={priorRows} disabled={saving} />
      {!(autosaveChoices && plainChoice) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {existing?.state === "answered" && !dirty ? (
              <span className="inline-flex items-center gap-1.5 text-teal">
                <Check className="size-3.5" /> Response recorded
              </span>
            ) : dirty ? (
              "Unsaved text — save when ready"
            ) : autosaveChoices ? (
              "Selections save automatically. Complete what you can — partial responses are fine."
            ) : (
              "Complete what you can — partial responses are fine."
            )}
          </span>
          <Button type="button" variant={dirty ? "default" : "outline"} className="h-9 px-4" disabled={!dirty || saving || draft === null} onClick={() => { onSave({ state: "answered", value: draft }); setDirty(false); }}>
            {saving ? "Saving…" : existing?.state === "answered" ? "Update response" : "Save response"}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Provisional N/A reason categories — genuine inapplicability only (METHODOLOGY DECISION REQUIRED #1). */
const naReasons: ChoiceOption[] = [
  { value: "no-mandate", label: "The institution has no mandate for this activity" },
  { value: "no-structure", label: "The practice concerns a structure or function the institution does not have" },
  { value: "external-constraint", label: "A regulatory or legal constraint removes this from the institution's control" },
  { value: "other", label: "Another reason (explain briefly)" },
];

interface ResponseControlsProps {
  prompt: Prompt;
  existing: PromptResponse | null;
  onSave: (input: SaveInput) => void;
  className?: string;
}

/** The distinct “Not sure” and “Does not apply” responses. Never conflated with “no” or zero. */
export function ResponseControls({ prompt, existing, onSave, className }: ResponseControlsProps) {
  const [naOpen, setNaOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  useEffect(() => {
    setNaOpen(false);
    setReason(null);
    setDetail("");
  }, [prompt.id]);
  const reasonLabel = naReasons.find((r) => r.value === reason)?.label ?? "";
  const naReady = !!reason && (reason !== "other" || detail.trim().length >= 12);
  const rationale = reason === "other" ? detail.trim() : detail.trim() ? `${reasonLabel} — ${detail.trim()}` : reasonLabel;

  if (!prompt.allowNotSure && !prompt.allowNotApplicable) return null;

  if (existing?.state === "not_sure") {
    return (
      <div className={cn("flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-teal bg-teal-soft/60 px-5 py-3 text-sm", className)}>
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <HelpCircle className="size-4 text-teal" /> Recorded as “Not sure / need to check”
        </span>
        <span className="text-xs text-muted-foreground">Recorded separately — never treated as “no”. You can return and answer later.</span>
      </div>
    );
  }
  if (existing?.state === "not_applicable_requested") {
    return (
      <div className={cn("rounded-lg border border-dashed border-amber bg-amber-soft/50 px-5 py-3 text-sm", className)}>
        <span className="inline-flex items-center gap-2 font-medium text-foreground">
          <Ban className="size-4 text-amber" /> Marked as not applicable — awaiting assessor confirmation
        </span>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Your reason: “{existing.notApplicableRationale}”. Not-applicable requests are only accepted where the practice genuinely cannot apply to an institution like yours.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {prompt.allowNotSure && (
          <button
            type="button"
            onClick={() => onSave({ state: "not_sure" })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input px-4 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:border-teal/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HelpCircle className="size-4 shrink-0 text-teal" /> Not sure / need to check
          </button>
        )}
        {prompt.allowNotApplicable && (
          <button
            type="button"
            aria-expanded={naOpen}
            onClick={() => setNaOpen((o) => !o)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input px-4 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:border-amber/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Ban className="size-4 shrink-0 text-amber" /> Does not apply to our institution
          </button>
        )}
      </div>
      {naOpen && (
        <div className="rounded-lg border border-amber/40 bg-amber-soft/40 p-4">
          <p className="text-sm font-medium text-foreground">Why does this not apply?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">“Not applicable” is reserved for practices that genuinely cannot apply to an institution like yours — not for things that are missing, unknown or not yet in place. An assessor reviews every request.</p>
          <div className="mt-3 space-y-3">
            <SelectField options={naReasons} value={reason} onChange={setReason} placeholder="Choose the reason" ariaLabel="Reason this does not apply" />
            <ShortText value={detail} maxLength={160} onChange={setDetail} placeholder={reason === "other" ? "Explain briefly (required)" : "Add a brief specific note (optional)"} ariaLabel="Brief note on why this does not apply" />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" className="h-9" onClick={() => setNaOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="h-9" disabled={!naReady} onClick={() => { onSave({ state: "not_applicable_requested", notApplicableRationale: rationale }); setNaOpen(false); }}>
              Request not applicable
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
