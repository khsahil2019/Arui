import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChoiceOption } from "@/lib/catalogue";

interface AnswerCardProps {
  option: ChoiceOption;
  selected: boolean;
  onSelect: (value: string) => void;
  size?: "default" | "compact" | undefined;
  name?: string | undefined;
}

export function AnswerCard({
  option,
  selected,
  onSelect,
  size = "default",
  name,
}: AnswerCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      name={name}
      onClick={() => onSelect(option.value)}
      className={cn(
        "group relative flex w-full cursor-pointer items-start gap-4 rounded-lg border bg-card text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        size === "default" ? "px-5 py-4" : "px-4 py-3",
        selected
          ? "border-navy bg-navy/[0.035] shadow-card"
          : "border-border hover:border-navy/40 hover:bg-ivory-deep/40",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-[3px] flex size-[18px] shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-navy bg-navy"
            : "border-input bg-background group-hover:border-navy/50",
        )}
      >
        <span
          className={cn(
            "size-[7px] rounded-full bg-primary-foreground transition-opacity",
            selected ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block font-medium text-foreground",
            size === "default" ? "text-[15px]" : "text-sm",
          )}
        >
          {option.label}
        </span>
        {option.description && (
          <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
            {option.description}
          </span>
        )}
      </span>
    </button>
  );
}

interface AnswerCardGroupProps {
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  columns?: 1 | 2;
  size?: "default" | "compact";
  /** Adds the distinct "Not sure / Need to check" response below the options. */
  allowUnsure?: boolean;
  unsureLabel?: string;
  ariaLabel?: string;
}

export const UNSURE_VALUE = "__unsure__";

export function AnswerCardGroup({
  options,
  value,
  onChange,
  columns = 1,
  size,
  allowUnsure,
  unsureLabel = "Not sure / Need to check",
  ariaLabel,
}: AnswerCardGroupProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="space-y-3">
      <div className={cn("grid gap-2.5", columns === 2 && "sm:grid-cols-2")}>
        {options.map((o) => (
          <AnswerCard
            key={o.value}
            option={o}
            selected={value === o.value}
            onSelect={onChange}
            size={size}
          />
        ))}
      </div>
      {allowUnsure && (
        <button
          type="button"
          role="radio"
          aria-checked={value === UNSURE_VALUE}
          onClick={() => onChange(UNSURE_VALUE)}
          className={cn(
            "flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed px-5 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === UNSURE_VALUE
              ? "border-teal bg-teal-soft/60 text-foreground"
              : "border-input text-muted-foreground hover:border-teal/60 hover:text-foreground",
          )}
        >
          <HelpCircle className="size-4 shrink-0 text-teal" />
          <span className="font-medium">{unsureLabel}</span>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
            Recorded separately — never treated as “no”
          </span>
        </button>
      )}
    </div>
  );
}
