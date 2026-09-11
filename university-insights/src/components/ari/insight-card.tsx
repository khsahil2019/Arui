import type { ReactNode } from "react";
import { AlertTriangle, ArrowLeftRight, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightKind = "early" | "strength" | "vulnerability" | "contradiction" | "attention";

const styles: Record<InsightKind, { icon: typeof Sparkles; accent: string; label: string }> = {
  early: { icon: Sparkles, accent: "border-l-blue", label: "Early signal — not your final assessment" },
  strength: { icon: ShieldCheck, accent: "border-l-teal", label: "Strength" },
  vulnerability: { icon: AlertTriangle, accent: "border-l-rose", label: "Vulnerability" },
  contradiction: { icon: ArrowLeftRight, accent: "border-l-amber", label: "Contradiction signal" },
  attention: { icon: Compass, accent: "border-l-navy", label: "Requires attention" },
};

interface InsightCardProps {
  kind: InsightKind;
  title?: ReactNode;
  children: ReactNode;
  label?: ReactNode;
  footer?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function InsightCard({ kind, title, children, label, footer, className, compact }: InsightCardProps) {
  const s = styles[kind];
  const Icon = s.icon;
  return (
    <article className={cn("rounded-lg border border-border border-l-[3px] bg-card shadow-card", s.accent, compact ? "px-4 py-3.5" : "px-5 py-5", className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="eyebrow">{label ?? s.label}</span>
      </div>
      {title && <h3 className={cn("mt-2 font-sans font-semibold tracking-normal text-foreground", compact ? "text-sm" : "text-[15px]")}>{title}</h3>}
      <div className={cn("text-muted-foreground leading-relaxed", title ? "mt-1.5" : "mt-2", compact ? "text-[13px]" : "text-sm")}>{children}</div>
      {footer && <div className="mt-3 flex flex-wrap items-center gap-2">{footer}</div>}
    </article>
  );
}

export function Chip({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "navy" | "teal"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "border-border bg-ivory-deep/70 text-foreground/80",
        tone === "navy" && "border-navy/20 bg-navy/[0.06] text-navy",
        tone === "teal" && "border-teal/25 bg-teal-soft text-teal",
        className,
      )}
    >
      {children}
    </span>
  );
}
