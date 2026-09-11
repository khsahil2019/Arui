import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ClipboardList, Compass, FolderOpen, LayoutDashboard, LogOut, Map, Radio, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { assessmentStatusLabels, roleLabels } from "@/lib/catalogue";
import type { AssessmentStatusView, Session, StageId } from "@/api/types";
import { useLogout } from "@/api/hooks";
import { apiMode } from "@/api/client";
import { StatusBadge } from "./status-badge";

export type NavStatus = "complete" | "current" | "upcoming" | "locked";

export interface NavItem {
  to: string;
  params?: Record<string, string>;
  label: string;
  icon: LucideIcon;
  status?: NavStatus | undefined;
  stage?: StageId | undefined;
  exact?: boolean | undefined;
}

export const workspaceNav: NavItem[] = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/profile", label: "Institution Profile", icon: Building2, stage: "profile" },
  { to: "/orientation", label: "Orientation", icon: Map, stage: "orientation" },
  { to: "/pulse", label: "Institutional Pulse", icon: Radio, stage: "pulse" },
  { to: "/assessment", label: "Assessment", icon: ClipboardList, stage: "assessment" },
  { to: "/evidence", label: "Evidence", icon: FolderOpen, stage: "evidence" },
  { to: "/intelligence", label: "Preliminary results", icon: Compass, stage: "results" },
];

export function Wordmark({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-3", className)}>
      <span className={cn("flex size-8 items-center justify-center rounded-[5px] border font-serif text-[15px] font-medium leading-none", inverse ? "border-sidebar-border bg-sidebar-accent text-sidebar-foreground" : "border-navy bg-navy text-primary-foreground")}>
        AR
      </span>
      <span className="leading-tight">
        <span className={cn("block font-serif text-[15px] font-medium tracking-[-0.005em]", inverse ? "text-sidebar-primary" : "text-foreground")}>AI Resilient University</span>
        <span className={cn("block text-[10px] uppercase tracking-[0.14em]", inverse ? "text-sidebar-foreground/60" : "text-muted-foreground")}>Institutional AI Resilience Assessment</span>
      </span>
    </Link>
  );
}

interface WorkspaceShellProps {
  children: ReactNode;
  session: Session;
  nav: NavItem[];
  navLabel: string;
  /** Institution status block (respondent workspace). */
  status?: AssessmentStatusView | null;
  /** Identity line under the nav (assessor workspace). */
  identity?: { title: string; subtitle: string; badge?: ReactNode };
}

export function WorkspaceShell({ children, session, nav, navLabel, status, identity }: WorkspaceShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const logout = useLogout();

  const items = nav.map((item) => ({
    ...item,
    status: item.status ?? (item.stage && status ? (status.stages.find((s) => s.id === item.stage)?.state as NavStatus | undefined) : undefined),
  }));
  const resolve = (item: NavItem) => Object.entries(item.params ?? {}).reduce((acc, [k, v]) => acc.replace(`$${k}`, v), item.to);
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const current = [...items].reverse().find((n) => isActive(resolve(n)))?.label ?? navLabel;

  const id = identity ?? {
    title: status?.institutionName ?? session.institution?.name ?? "Institution",
    subtitle: `Assessment cycle ${status?.cycle ?? "2026"}`,
    badge: status ? (
      <StatusBadge tone="outline" className="border-sidebar-border text-sidebar-foreground/80">
        Status · {assessmentStatusLabels[status.status]}
      </StatusBadge>
    ) : null,
  };

  const signOut = async () => {
    await logout.mutateAsync();
    qc.clear();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="px-6 pb-6 pt-7">
          <Wordmark inverse />
        </div>
        <nav className="flex-1 px-3">
          <p className="eyebrow mb-2 px-3 text-sidebar-foreground/50">{navLabel}</p>
          <ul className="space-y-0.5">
            {items.map((item) => {
              const active = item.exact ? pathname === resolve(item) : isActive(resolve(item));
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    params={item.params ?? {}}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2.5 text-[13.5px] transition-colors",
                      active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.status && <NavStatusDot status={item.status} active={active} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-sidebar-border px-6 py-5">
          <p className="eyebrow text-sidebar-foreground/50">{identity ? "Signed in as" : "Institution"}</p>
          <p className="mt-1.5 text-sm font-medium text-sidebar-primary">{id.title}</p>
          <p className="text-xs text-sidebar-foreground/60">{id.subtitle}</p>
          {id.badge && <div className="mt-3 flex items-center gap-2">{id.badge}</div>}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-5 md:px-8">
            <div className="flex items-center gap-4 lg:hidden">
              <Wordmark />
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
              <span>{id.title}</span>
              <span className="text-border">/</span>
              <span className="text-foreground">{current}</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge tone="demo">{apiMode === "mock" ? "Mock data" : "Live"}</StatusBadge>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {session.user.name} · {roleLabels[session.user.role]}
              </span>
              <button type="button" onClick={signOut} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-ivory-deep" aria-label="Sign out">
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
          <nav className="overflow-x-auto border-t border-border lg:hidden">
            <ul className="flex min-w-max gap-1 px-3">
              {items.map((item) => {
                const active = item.exact ? pathname === resolve(item) : isActive(resolve(item));
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      params={item.params ?? {}}
                      className={cn(
                        "block border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors",
                        active ? "border-navy text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function NavStatusDot({ status, active }: { status: NavStatus; active: boolean }) {
  if (status === "complete") {
    return (
      <span className={cn("flex size-4 items-center justify-center rounded-full", active ? "bg-teal/15 text-teal" : "bg-sidebar-accent text-teal")}>
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === "current") {
    return <span className={cn("size-1.5 rounded-full", active ? "bg-blue" : "bg-blue/80")} />;
  }
  return <span className={cn("size-1.5 rounded-full", active ? "bg-navy/30" : "bg-sidebar-foreground/20")} />;
}

/** Standard content container for workspace pages. */
export function PageContainer({ children, className, width = "default" }: { children: ReactNode; className?: string; width?: "default" | "narrow" | "wide" }) {
  return (
    <div className={cn("mx-auto w-full px-5 py-8 md:px-8 md:py-10 lg:px-12", width === "default" && "max-w-6xl", width === "narrow" && "max-w-4xl", width === "wide" && "max-w-7xl", className)}>
      {children}
    </div>
  );
}

/** Loading placeholder that keeps the layout stable. */
export function PagePending({ label = "Loading…" }: { label?: string }) {
  return (
    <PageContainer>
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground" role="status" aria-live="polite">
        {label}
      </div>
    </PageContainer>
  );
}
