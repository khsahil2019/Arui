import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
  size?: "default" | "large";
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
  meta,
  className,
  size = "default",
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1
          className={cn(
            "text-foreground",
            size === "large"
              ? "text-4xl md:text-5xl"
              : "text-3xl md:text-[2.375rem] leading-[1.12]",
          )}
        >
          {title}
        </h1>
        {lede && (
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
        )}
      </div>
      {(actions || meta) && (
        <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
          {meta}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  aside,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-6", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="text-xl text-foreground md:text-2xl">{title}</h2>
        {description && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}
