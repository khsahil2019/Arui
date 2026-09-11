import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Base surface used by cards across the product. */
export function Panel({ className, children, tone = "card", ...props }: React.HTMLAttributes<HTMLDivElement> & { tone?: "card" | "muted" | "navy" | "plain" }) {
  return (
    <div
      className={cn(
        "rounded-lg border",
        tone === "card" && "border-border bg-card shadow-card",
        tone === "muted" && "border-border/70 bg-ivory-deep/60",
        tone === "navy" && "border-navy-deep bg-navy text-primary-foreground",
        tone === "plain" && "border-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ eyebrow, title, aside, className }: { eyebrow?: ReactNode; title?: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-border px-6 py-4", className)}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h3 className="mt-1 font-sans text-[15px] font-semibold tracking-normal text-foreground">{title}</h3>}
      </div>
      {aside}
    </div>
  );
}

export function DefinitionList({ items, className }: { items: { term: ReactNode; detail: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-border", className)}>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,9rem)_1fr] gap-4 py-3 text-sm">
          <dt className="text-muted-foreground">{it.term}</dt>
          <dd className="text-foreground">{it.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
