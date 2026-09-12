import { FileText, Link2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EvidenceItem, EvidenceKind, EvidenceSubmissionStatus } from "@/api/types";
import { StatusBadge } from "./status-badge";
import { Chip } from "./insight-card";

const kindIcon: Record<EvidenceKind, typeof FileText> = {
  document: FileText,
  url: Link2,
  note: StickyNote,
};
const kindLabel: Record<EvidenceKind, string> = {
  document: "Document",
  url: "Link",
  note: "Description",
};

export const evidenceStatusTone: Record<
  EvidenceSubmissionStatus,
  { tone: "neutral" | "blue" | "teal" | "amber" | "rose"; label: string }
> = {
  draft: { tone: "neutral", label: "Draft" },
  submitted: { tone: "blue", label: "Submitted" },
  under_review: { tone: "amber", label: "Under review" },
  accepted: { tone: "teal", label: "Supporting assessment" },
  returned: { tone: "rose", label: "Returned" },
};

function formatPeriod(item: EvidenceItem) {
  if (item.periodStart && item.periodEnd) return `${item.periodStart} – ${item.periodEnd}`;
  return item.periodStart ?? item.periodEnd ?? null;
}

function formatSize(bytes?: number) {
  if (!bytes) return null;
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

interface EvidenceCardProps {
  item: EvidenceItem;
  selected?: boolean;
  onSelect?: (id: string) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function EvidenceCard({ item, selected, onSelect, actions, className }: EvidenceCardProps) {
  const Icon = kindIcon[item.kind];
  const st = evidenceStatusTone[item.status];
  const period = formatPeriod(item);
  const supports = item.confirmedSupports.length ? item.confirmedSupports : item.proposedSupports;
  const confirmed = item.confirmedSupports.length > 0;
  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(item.id)}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(item.id);
        }
      }}
      className={cn(
        "rounded-lg border bg-card px-5 py-4 shadow-card transition-colors",
        onSelect && "cursor-pointer hover:border-navy/40",
        selected ? "border-navy" : "border-border",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-ivory-deep/70 text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-sans text-[15px] font-semibold tracking-normal text-foreground">
              {item.title}
            </h3>
            <StatusBadge tone={st.tone} dot>
              {st.label}
            </StatusBadge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {kindLabel[item.kind]}
            {item.fileName && (
              <>
                {" "}
                · {item.fileName}
                {formatSize(item.fileSize) ? ` (${formatSize(item.fileSize)})` : ""}
              </>
            )}
            {" · "}
            {item.scope}
            {period && <> · {period}</>}
            {item.demo && (
              <span className="ml-2 uppercase tracking-[0.1em] text-[10.5px] text-muted-foreground">
                Demo item
              </span>
            )}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              {confirmed ? "Supports" : "May support"}
            </span>
            {supports.map((s) => (
              <Chip key={s} tone={confirmed ? "teal" : "navy"}>
                {s}
              </Chip>
            ))}
            {supports.length === 0 && (
              <span className="text-xs text-muted-foreground">Mapping to be confirmed</span>
            )}
          </div>
          {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </div>
    </article>
  );
}
