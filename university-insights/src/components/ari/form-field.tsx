import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChoiceOption } from "@/lib/catalogue";

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode | undefined;
  optional?: boolean | undefined;
  children: ReactNode;
  className?: string | undefined;
}

export function Field({ label, hint, optional, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {optional && <span className="text-xs text-muted-foreground">Optional</span>}
      </div>
      {children}
      {hint && <p className="text-[13px] leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

export function SelectField({ options, value, onChange, placeholder = "Select…", ariaLabel }: SelectFieldProps) {
  return (
    <Select {...(value ? { value } : {})} onValueChange={onChange}>
      <SelectTrigger aria-label={ariaLabel} className="h-11 bg-card text-[15px] shadow-card">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-[14px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-md border border-input bg-card px-3.5 text-[15px] text-foreground shadow-card placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/60",
        props.className,
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full resize-none rounded-md border border-input bg-card px-3.5 py-3 text-[15px] leading-relaxed text-foreground shadow-card placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/60",
        props.className,
      )}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Structured-first controls                                           */
/* ------------------------------------------------------------------ */

interface ShortTextProps {
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  placeholder?: string | undefined;
  ariaLabel?: string | undefined;
  disabled?: boolean | undefined;
  /** Two-line box for bounded explanations; single line by default. */
  lines?: 1 | 2 | 3;
  className?: string;
}

/** Bounded text — always shows the remaining allowance. The only free-text control in respondent inputs. */
export function ShortText({ value, onChange, maxLength, placeholder, ariaLabel, disabled, lines = 1, className }: ShortTextProps) {
  const left = maxLength - value.length;
  return (
    <div className={cn("relative", className)}>
      {lines === 1 ? (
        <TextInput value={value} maxLength={maxLength} placeholder={placeholder} aria-label={ariaLabel} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="pr-14" />
      ) : (
        <TextArea rows={lines} value={value} maxLength={maxLength} placeholder={placeholder} aria-label={ariaLabel} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="pr-14" />
      )}
      <span aria-hidden className={cn("pointer-events-none absolute right-3 top-2.5 font-mono text-[10.5px] tabular-nums", left < 20 ? "text-amber" : "text-muted-foreground/70")}>
        {left}
      </span>
    </div>
  );
}

interface MonthInputProps {
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string | undefined;
  disabled?: boolean | undefined;
  className?: string;
}

export function MonthInput({ value, onChange, ariaLabel, disabled, className }: MonthInputProps) {
  return <TextInput type="month" value={value} aria-label={ariaLabel} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={cn("w-auto min-w-[11rem]", className)} />;
}

interface ChipGroupProps {
  options: ChoiceOption[];
  value: string[];
  onChange: (v: string[]) => void;
  max?: number | undefined;
  size?: "default" | "compact";
  ariaLabel?: string | undefined;
  disabled?: boolean | undefined;
}

/** Multi-select rendered as toggle chips — fast to scan, no typing. */
export function ChipGroup({ options, value, onChange, max, size = "default", ariaLabel, disabled }: ChipGroupProps) {
  const toggle = (v: string) => {
    if (value.includes(v)) return onChange(value.filter((x) => x !== v));
    if (max !== undefined && value.length >= max) return;
    onChange([...value, v]);
  };
  const full = max !== undefined && value.length >= max;
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            role="checkbox"
            aria-checked={on}
            disabled={disabled || (!on && full)}
            onClick={() => toggle(o.value)}
            title={o.description}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              size === "default" ? "px-3 py-1.5 text-[13px]" : "px-2.5 py-1 text-xs",
              on ? "border-navy bg-navy text-primary-foreground" : "border-input bg-card text-foreground hover:border-navy/50",
            )}
          >
            <span className={cn("size-1.5 rounded-full", on ? "bg-primary-foreground" : "bg-border")} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

interface SegmentedChoiceProps {
  options: ChoiceOption[];
  value: string | null;
  onChange: (v: string) => void;
  ariaLabel?: string | undefined;
  disabled?: boolean | undefined;
}

/** Compact single choice for 2–4 short options (Yes / No / Not sure). */
export function SegmentedChoice({ options, value, onChange, ariaLabel, disabled }: SegmentedChoiceProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-md border border-input bg-card p-0.5 shadow-card">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={on} disabled={disabled} onClick={() => onChange(o.value)} className={cn("cursor-pointer rounded-[5px] px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", on ? "bg-navy text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const yesNoUnsureOptions: ChoiceOption[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];
