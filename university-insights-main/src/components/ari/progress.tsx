import { Check, CloudCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignalProgressProps {
  /** Small uppercase label, e.g. "INSTITUTIONAL PULSE" or "D01 · Institutional Strategy". */
  label: string;
  /** Human caption, e.g. "3 of 5 signals captured". */
  caption: string;
  current: number;
  total: number;
  className?: string;
  align?: "left" | "right";
}

/** Meaningful progress: segments per signal, never "Question X of 143". */
export function SignalProgress({ label, caption, current, total, className, align = "left" }: SignalProgressProps) {
  return (
    <div className={cn("flex flex-col gap-2", align === "right" && "items-end", className)}>
      <div className={cn("flex items-baseline gap-3", align === "right" && "flex-row-reverse")}>
        <span className="eyebrow text-foreground/70">{label}</span>
        <span className="text-xs text-muted-foreground">{caption}</span>
      </div>
      <div className="flex w-full max-w-[16rem] gap-1" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={cn("h-[3px] flex-1 rounded-full transition-colors duration-500", i < current ? "bg-navy" : i === current ? "bg-blue/50" : "bg-border")} />
        ))}
      </div>
    </div>
  );
}

interface StepListProps {
  steps: { id: string; label: string; description?: string }[];
  currentIndex: number;
  completed: Set<string> | string[];
  onSelect?: (index: number) => void;
  className?: string;
}

/** Vertical step rail for guided setup flows. */
export function StepList({ steps, currentIndex, completed, onSelect, className }: StepListProps) {
  const done = new Set(completed);
  return (
    <ol className={cn("space-y-1", className)}>
      {steps.map((s, i) => {
        const isCurrent = i === currentIndex;
        const isDone = done.has(s.id);
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect?.(i)}
              disabled={!onSelect}
              className={cn(
                "flex w-full cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors disabled:cursor-default",
                isCurrent ? "bg-card shadow-card" : "hover:bg-ivory-deep/70",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                  isDone ? "border-teal bg-teal text-primary-foreground" : isCurrent ? "border-navy text-navy" : "border-border text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-sm font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                {s.description && isCurrent && <span className="mt-0.5 block text-xs text-muted-foreground">{s.description}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function SaveIndicator({ state, time, className }: { state: "saved" | "saving" | "idle"; time?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)} aria-live="polite">
      {state === "saving" ? (
        <>
          <Loader2 className="size-3.5 animate-spin" /> Saving…
        </>
      ) : state === "saved" ? (
        <>
          <CloudCheck className="size-3.5 text-teal" /> Saved{time ? ` · ${time}` : ""}
        </>
      ) : (
        <>
          <CloudCheck className="size-3.5" /> Autosave on
        </>
      )}
    </span>
  );
}

export function CoverageBar({ value, className, tone = "navy" }: { value: number; className?: string; tone?: "navy" | "teal" | "blue" }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-border/80", className)} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-[width] duration-700", tone === "navy" && "bg-navy", tone === "teal" && "bg-teal", tone === "blue" && "bg-blue")} style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}
