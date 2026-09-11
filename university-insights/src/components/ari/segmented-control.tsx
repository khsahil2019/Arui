import { cn } from "@/lib/utils";
import type { ChoiceOption } from "@/lib/catalogue";

interface SegmentedControlProps {
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function SegmentedControl({ options, value, onChange, className, ariaLabel }: SegmentedControlProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("inline-flex max-w-full flex-wrap gap-px overflow-hidden rounded-md border border-input bg-input/60 p-px", className)}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "cursor-pointer rounded-[5px] px-3.5 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-navy text-primary-foreground shadow-card" : "bg-card text-muted-foreground hover:bg-ivory-deep hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
