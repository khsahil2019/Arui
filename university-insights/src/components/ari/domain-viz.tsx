import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { maturityLabels, type Confidence, type MaturityLevel } from "@/lib/catalogue";
import type { DomainResult } from "@/api/types";
import { StatusBadge } from "./status-badge";

const STEPS: MaturityLevel[] = [1, 2, 3, 4, 5];

export const confidenceTone: Record<Confidence, "rose" | "amber" | "teal"> = { low: "rose", moderate: "amber", high: "teal" };
export const confidenceLabel: Record<Confidence, string> = { low: "Low confidence", moderate: "Moderate confidence", high: "High confidence" };

export function levelLabel(level: MaturityLevel) {
  return `${maturityLabels[level]} (${level})`;
}

/** Maturity scale 0–5: level 0 shows no filled segment; current filled, required marked. */
export function MaturityScale({ current, required, size = "default", className, inverse }: { current: MaturityLevel; required?: MaturityLevel; size?: "default" | "large"; className?: string; inverse?: boolean }) {
  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Current ${maturityLabels[current]}${required !== undefined ? `, required ${maturityLabels[required]}` : ""}`}>
      {STEPS.map((b) => {
        const filled = b <= current;
        const isRequired = required === b;
        const gap = required !== undefined && b > current && b <= required;
        return (
          <span
            key={b}
            className={cn(
              "relative flex-1 rounded-[2px] transition-colors",
              size === "large" ? "h-3" : "h-2",
              inverse
                ? filled ? "bg-primary-foreground" : gap ? "bg-primary-foreground/30" : "bg-primary-foreground/12"
                : filled ? "bg-navy" : gap ? "bg-blue/20" : "bg-border/80",
              isRequired && (inverse ? "ring-1 ring-inset ring-primary-foreground/80" : "ring-1 ring-inset ring-blue"),
            )}
          >
            {isRequired && <span className={cn("absolute -top-1.5 left-1/2 size-0 -translate-x-1/2 border-x-[4px] border-b-[5px] border-x-transparent", inverse ? "border-b-primary-foreground" : "border-b-blue")} aria-hidden />}
          </span>
        );
      })}
    </div>
  );
}

export function ScaleLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground", className)}>
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-5 rounded-[2px] bg-navy" /> Current position
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-5 rounded-[2px] bg-blue/20 ring-1 ring-inset ring-blue" /> Required maturity for this context
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-5 rounded-[2px] bg-border" /> Transformation distance
      </span>
    </div>
  );
}

export function DomainPositionRow({ domain, showConfidence = true }: { domain: DomainResult; showConfidence?: boolean }) {
  const assessed = domain.assessed && domain.current !== undefined && domain.required !== undefined && domain.confidence !== undefined;
  if (!assessed) {
    // Not yet assessed: no position, no scale, no confidence — navigation/roadmap only.
    return (
      <div className="grid items-center gap-x-5 gap-y-2 py-3.5 opacity-60 md:grid-cols-[3.25rem_minmax(0,14rem)_1fr_minmax(0,9rem)_minmax(0,10rem)]">
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground">{domain.code}</span>
        <span className="text-sm font-medium text-foreground">{domain.name}</span>
        <span className="text-xs text-muted-foreground md:col-span-3">Not yet assessed</span>
      </div>
    );
  }
  const current = domain.current!;
  const required = domain.required!;
  const confidence = domain.confidence!;
  const distance = domain.transformationDistance ?? required - current;
  return (
    <div className="grid items-center gap-x-5 gap-y-2 py-3.5 md:grid-cols-[3.25rem_minmax(0,14rem)_1fr_minmax(0,9rem)_minmax(0,10rem)]">
      <span className="font-mono text-[11px] tracking-wide text-muted-foreground">{domain.code}</span>
      <span className="text-sm font-medium text-foreground">{domain.name}</span>
      <MaturityScale current={current} required={required} />
      <span className="text-xs text-muted-foreground">
        {maturityLabels[current]} → {maturityLabels[required]}
        <span className="ml-1.5 text-foreground/70">{distance === 0 ? "at required" : `${distance} level${distance > 1 ? "s" : ""}`}</span>
      </span>
      {showConfidence && (
        <StatusBadge tone={confidenceTone[confidence]} dot className="justify-self-start">
          {confidence} confidence
        </StatusBadge>
      )}
    </div>
  );
}

export function StatTile({ label, value, detail, className }: { label: string; value: ReactNode; detail?: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card px-5 py-4 shadow-card", className)}>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-serif text-2xl leading-none text-foreground md:text-[1.75rem]">{value}</p>
      {detail && <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail}</div>}
    </div>
  );
}
