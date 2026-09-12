import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-sm border px-2 py-[3px] text-[10.5px] font-semibold uppercase tracking-[0.1em] leading-none whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        navy: "border-navy/20 bg-navy text-primary-foreground",
        blue: "border-blue/25 bg-blue-soft text-blue",
        teal: "border-teal/25 bg-teal-soft text-teal",
        amber: "border-amber/30 bg-amber-soft text-amber",
        rose: "border-rose/25 bg-rose-soft text-rose",
        outline: "border-border bg-transparent text-foreground",
        demo: "border-amber/40 bg-amber-soft text-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {
  dot?: boolean;
}

export function StatusBadge({ tone, dot, className, children, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(badge({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <StatusBadge tone="demo" className={className}>
      Demo / Prototype data
    </StatusBadge>
  );
}
