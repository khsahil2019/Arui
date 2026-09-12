import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhyAskingProps {
  label?: string | undefined;
  children: ReactNode;
  className?: string;
}

/** Small contextual-help disclosure. */
export function WhyAsking({ label = "Why are we asking?", children, className }: WhyAskingProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("text-sm", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        {label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-xl rounded-md border-l-2 border-blue/40 bg-blue-soft/40 px-4 py-3 text-[13.5px] leading-relaxed text-foreground/80">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  eyebrow?: ReactNode;
  theme?: ReactNode;
  question: ReactNode;
  help?: ReactNode;
  helpLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** "hero" makes the question the visual centre of the screen. */
  variant?: "default" | "hero";
}

export function QuestionCard({
  eyebrow,
  theme,
  question,
  help,
  helpLabel,
  children,
  footer,
  className,
  variant = "default",
}: QuestionCardProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-card", className)}>
      <div className={cn("px-6 pt-7 md:px-10 md:pt-10", variant === "hero" && "md:px-14 md:pt-14")}>
        {(eyebrow || theme) && (
          <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {eyebrow && <span className="eyebrow text-foreground/70">{eyebrow}</span>}
            {eyebrow && theme && <span className="text-border">·</span>}
            {theme && <span className="text-xs text-muted-foreground">{theme}</span>}
          </div>
        )}
        <h2
          className={cn(
            "max-w-3xl text-foreground",
            variant === "hero"
              ? "text-3xl leading-[1.18] md:text-[2.5rem]"
              : "text-2xl leading-snug md:text-[1.75rem]",
          )}
        >
          {question}
        </h2>
        {help && (
          <WhyAsking label={helpLabel} className="mt-4">
            {help}
          </WhyAsking>
        )}
      </div>
      <div
        className={cn(
          "px-6 pb-7 pt-7 md:px-10 md:pb-10",
          variant === "hero" && "md:px-14 md:pb-12",
        )}
      >
        {children}
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4 md:px-10">
          {footer}
        </div>
      )}
    </section>
  );
}
