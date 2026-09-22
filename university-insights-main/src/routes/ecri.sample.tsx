import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Compass,
  FileText,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  BookOpen,
  HelpCircle,
  Award,
  Zap,
  Eye,
  Briefcase,
  TrendingUp,
  Sliders,
  Globe,
  Check,
} from "lucide-react";
import { Wordmark } from "@/components/ari/wordmark";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ecri/sample")({
  component: EcriSampleLayout,
});

const sampleNavItems = [
  { group: "ECRI OVERVIEW", items: [
    { to: "/ecri/sample", label: "1. Overview & Scope", icon: Compass, exact: true },
    { to: "/ecri/sample#what-is-ecri", label: "2. What is ECRI", icon: BookOpen },
    { to: "/ecri/sample#why-ecri", label: "3. Why ECRI", icon: Zap },
    { to: "/ecri/sample#dimensions", label: "4. 11 Dimensions", icon: Layers },
    { to: "/ecri/sample#how-it-works", label: "5. How It Works", icon: HelpCircle },
    { to: "/ecri/sample#deliverables", label: "6. What Institution Receives", icon: Award },
  ]},
  { group: "SAMPLE ASSESSMENT", items: [
    { to: "/ecri/sample/institution", label: "7. Institution View", icon: Briefcase },
    { to: "/ecri/sample/assessor", label: "8. Assessor View (132 Metrics)", icon: ShieldCheck },
  ]},
  { group: "SAMPLE OUTPUTS & INTELLIGENCE", items: [
    { to: "/ecri/sample/reports", label: "9–13. Report Centre (5 Reports)", icon: FileText },
    { to: "/ecri/sample/continuous", label: "14. Continuous Assessment", icon: TrendingUp },
    { to: "/ecri/sample/profile", label: "15. Public Institutional Profile", icon: Globe },
  ]},
  { group: "START ENGAGEMENT", items: [
    { to: "/ecri/engagement", label: "16. Proceed to ECRI Assessment", icon: ArrowRight, highlight: true },
  ]}
];

function EcriSampleLayout() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Persistent 16-Item Left Navigation */}
      <aside className="w-full lg:w-72 border-r border-border bg-card/60 backdrop-blur shrink-0 flex flex-col justify-between p-6">
        <div>
          {/* Brand Header */}
          <div className="pb-6 border-b border-border flex items-center justify-between">
            <Link to="/ecri" className="block">
              <Wordmark engine="ecri" />
            </Link>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal/10 text-teal uppercase tracking-wider">
              DEMO HUB
            </span>
          </div>

          <div className="my-4 p-3 rounded-lg bg-teal/5 border border-teal/15">
            <p className="text-[11px] font-bold text-teal uppercase tracking-wider">Canonical Institution</p>
            <p className="text-xs font-semibold text-foreground mt-0.5">Metropolitan Apex University</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">ECRI v6.0 · Synthetic / Illustrative Baseline</p>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 space-y-6">
            {sampleNavItems.map((group, gIdx) => (
              <div key={gIdx}>
                <p className="px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? currentPath === item.to
                      : currentPath.startsWith(item.to) && item.to !== "/ecri/sample";

                    return (
                      <Link
                        key={idx}
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors",
                          item.highlight
                            ? "bg-teal text-white hover:bg-teal/90 shadow-sm"
                            : isActive
                            ? "bg-teal/10 text-teal font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-6 mt-6 border-t border-border text-[11px] text-muted-foreground">
          <p>© 2026 ECRI Global Advisory</p>
          <p className="mt-1">Single Canonical Assessment Model</p>
        </div>
      </aside>

      {/* Main Experience Viewport */}
      <main className="flex-1 min-w-0 bg-background/50 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
