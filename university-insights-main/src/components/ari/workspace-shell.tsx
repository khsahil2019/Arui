import { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ClipboardList,
  Compass,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { StatusBadge } from "./status-badge";
import { cn } from "@/lib/utils";
import { assessmentStatusLabels } from "@/lib/catalogue";
import { apiMode } from "@/api/client";
import { useLogout } from "@/api/hooks";
import type { AssessmentStatusView, Session } from "@/api/types";

export type NavStatus = "complete" | "current" | "pending" | "disabled";

export type EngineType = "arui" | "ecri";

export interface EngineConfig {
  code: EngineType;
  title: string;
  shortTitle: string;
  domainsLabel: string;
}

export function getEngineConfig(engine?: EngineType | string): EngineConfig {
  const isEcri = engine?.toLowerCase() === "ecri";
  if (isEcri) {
    return {
      code: "ecri",
      title: "Employability & Career Readiness Index",
      shortTitle: "ECRI",
      domainsLabel: "11 Dimensions · 132 Metrics",
    };
  }
  return {
    code: "arui",
    title: "AI Resilient University",
    shortTitle: "ARUI",
    domainsLabel: "11 Domains · 143 Metrics",
  };
}

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean | undefined;
  params?: Record<string, string> | undefined;
  status?: NavStatus | undefined;
  stage?: "profile" | "pulse" | "assessment" | "evidence" | "results" | undefined;
}

const roleLabels: Record<string, string> = {
  institution_admin: "Institutional Lead",
  contributor: "Domain Contributor",
  assessor: "Independent Assessor",
  superadmin: "Platform Administrator",
};

export const aruiNav: NavItem[] = [
  { to: "/arui/overview", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/arui/profile", label: "Context Profile", icon: SlidersHorizontal, stage: "profile" },
  { to: "/arui/orientation", label: "Orientation", icon: Compass },
  { to: "/arui/pulse", label: "Institutional Pulse", icon: Radio, stage: "pulse" },
  {
    to: "/arui/assessment",
    label: "11 Domains Assessment",
    icon: ClipboardList,
    stage: "assessment",
  },
  { to: "/arui/evidence", label: "Evidence Vault", icon: FolderOpen, stage: "evidence" },
  { to: "/arui/intelligence", label: "Strategic Intelligence", icon: Compass, stage: "results" },
];

export const ecriNav: NavItem[] = [
  { to: "/ecri/overview", label: "Scoreboard Overview", icon: LayoutDashboard, exact: true },
  {
    to: "/ecri/profile",
    label: "Institutional & WIL Profile",
    icon: SlidersHorizontal,
    stage: "profile",
  },
  { to: "/ecri/orientation", label: "Benchmark Scope", icon: Compass },
  { to: "/ecri/pulse", label: "Placement Pulse", icon: Radio, stage: "pulse" },
  { to: "/ecri/assessment", label: "11 Dimensions Hub", icon: ClipboardList, stage: "assessment" },
  { to: "/ecri/evidence", label: "WIL Evidence Vault", icon: FolderOpen, stage: "evidence" },
  { to: "/ecri/intelligence", label: "Career Intelligence", icon: Compass, stage: "results" },
];

export const workspaceNav: NavItem[] = [
  { to: "/overview", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/profile", label: "Institution Profile", icon: SlidersHorizontal, stage: "profile" },
  { to: "/orientation", label: "Orientation", icon: Compass },
  { to: "/pulse", label: "Institutional Pulse", icon: Radio, stage: "pulse" },
  { to: "/assessment", label: "Assessment", icon: ClipboardList, stage: "assessment" },
  { to: "/evidence", label: "Evidence", icon: FolderOpen, stage: "evidence" },
  { to: "/intelligence", label: "Preliminary results", icon: Compass, stage: "results" },
];

export function Wordmark({
  className,
  inverse,
  engine = "arui",
}: {
  className?: string;
  inverse?: boolean;
  engine?: EngineType | string;
}) {
  const config = getEngineConfig(engine);
  const isEcri = config.code === "ecri";
  const homeTarget = isEcri ? "/ecri/overview" : "/overview";

  return (
    <Link to={homeTarget as any} className={cn("group inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-[5px] border font-serif text-[13px] font-bold leading-none tracking-tight",
          inverse
            ? isEcri
              ? "border-teal/40 bg-teal/20 text-teal"
              : "border-sidebar-border bg-sidebar-accent text-sidebar-foreground"
            : isEcri
              ? "border-teal bg-teal text-white"
              : "border-navy bg-navy text-primary-foreground",
        )}
      >
        {isEcri ? "EC" : "AR"}
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block font-serif text-[15px] font-medium tracking-[-0.005em]",
            inverse ? "text-sidebar-primary" : "text-foreground",
          )}
        >
          {config.title}
        </span>
        <span
          className={cn(
            "block text-[10px] uppercase tracking-[0.14em]",
            inverse ? "text-sidebar-foreground/60" : "text-muted-foreground",
          )}
        >
          {config.domainsLabel}
        </span>
      </span>
    </Link>
  );
}

interface WorkspaceShellProps {
  children: ReactNode;
  session: Session;
  nav?: NavItem[];
  navLabel?: string;
  engine?: EngineType;
  /** Institution status block (respondent workspace). */
  status?: AssessmentStatusView | null;
  /** Identity line under the nav (assessor workspace). */
  identity?: { title: string; subtitle: string; badge?: ReactNode };
}

export function WorkspaceShell({
  children,
  session,
  nav,
  navLabel = "Workspace",
  engine: explicitEngine,
  status,
  identity,
}: WorkspaceShellProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const rawEngine = explicitEngine || (pathname.startsWith("/ecri") ? "ecri" : "arui");
  const engine: EngineType = rawEngine?.toLowerCase() === "ecri" ? "ecri" : "arui";
  const engineConfig = getEngineConfig(engine);

  const defaultNav =
    engine === "ecri" ? ecriNav : pathname.startsWith("/arui") ? aruiNav : nav || workspaceNav;
  const activeNav = nav || defaultNav;

  const navigate = useNavigate();
  const qc = useQueryClient();
  const logout = useLogout();

  const items: NavItem[] = activeNav.map((item) => ({
    ...item,
    status:
      item.status ??
      (item.stage && status
        ? (status.stages.find((s) => s.id === item.stage)?.state as NavStatus | undefined)
        : undefined),
  }));
  const resolve = (item: NavItem) =>
    Object.entries(item.params ?? {}).reduce((acc, [k, v]) => acc.replace(`$${k}`, v), item.to);
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);
  const current = [...items].reverse().find((n) => isActive(resolve(n)))?.label ?? navLabel;

  const id = identity ?? {
    title:
      status?.institutionName ??
      session.institution?.name ??
      (engine === "ecri" ? "Horizon State University" : "Apex National University"),
    subtitle: `${engineConfig.shortTitle} Cycle · 2026`,
    badge: status ? (
      <StatusBadge tone="outline" className="border-sidebar-border text-sidebar-foreground/80">
        Status · {assessmentStatusLabels[status.status]}
      </StatusBadge>
    ) : null,
  };

  const signOut = async () => {
    await logout.mutateAsync();
    qc.clear();
    navigate({ to: (engine === "ecri" ? "/ecri/login" : "/login") as any, replace: true });
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="px-6 pb-6 pt-6">
          <Wordmark inverse engine={engine} />
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
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0 opacity-80" />
                    <span className="flex-1">{item.label}</span>
                    {item.status && <NavStatusDot status={item.status} active={active} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-sidebar-border px-6 py-5">
          <p className="eyebrow text-sidebar-foreground/50">
            {identity ? "Signed in as" : "Institution"}
          </p>
          <p className="mt-1.5 text-sm font-medium text-sidebar-primary">{id.title}</p>
          <p className="text-xs text-sidebar-foreground/60">{id.subtitle}</p>
          {id.badge && <div className="mt-3 flex items-center gap-2">{id.badge}</div>}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-5 md:px-8">
            <div className="flex items-center gap-4 lg:hidden">
              <Wordmark engine={engine} />
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
              <span className="font-semibold text-foreground">{id.title}</span>
              <span className="text-border">/</span>
              <span
                className={cn(
                  "font-bold px-2 py-0.5 rounded text-[11px]",
                  engine === "ecri" ? "bg-teal/10 text-teal" : "bg-navy/10 text-navy",
                )}
              >
                {engineConfig.shortTitle} Platform
              </span>
              <span className="text-border">/</span>
              <span className="text-foreground">{current}</span>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge tone="demo">{apiMode === "mock" ? "Mock data" : "Live"}</StatusBadge>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {session.user.name} · {roleLabels[session.user.role]}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-ivory-deep"
                aria-label="Sign out"
              >
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
                        active
                          ? "border-navy text-foreground font-semibold"
                          : "border-transparent text-muted-foreground hover:text-foreground",
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
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-full",
          active ? "bg-teal/15 text-teal" : "bg-sidebar-accent text-teal",
        )}
      >
        <Check className="size-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === "current") {
    return <span className={cn("size-1.5 rounded-full", active ? "bg-blue" : "bg-blue/80")} />;
  }
  return (
    <span
      className={cn("size-1.5 rounded-full", active ? "bg-navy/30" : "bg-sidebar-foreground/20")}
    />
  );
}

/** Standard content container for workspace pages. */
export function PageContainer({
  children,
  className,
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "narrow" | "wide";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 py-8 md:px-8 md:py-10 lg:px-12",
        width === "default" && "max-w-6xl",
        width === "narrow" && "max-w-4xl",
        width === "wide" && "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Loading placeholder that keeps the layout stable. */
export function PagePending({ label = "Loading…" }: { label?: string }) {
  return (
    <PageContainer>
      <div
        className="flex h-64 items-center justify-center text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        {label}
      </div>
    </PageContainer>
  );
}
