import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Award,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  Layers,
  Sparkles,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";
import { getApi } from "@/api/client";
import type { PortfolioView, Session } from "@/api/types";

export const Route = createFileRoute("/portfolio")({
  component: InstitutionalPortfolioPage,
});

export function InstitutionalPortfolioPage() {
  const navigate = useNavigate();
  const api = getApi();
  const [session, setSession] = useState<Session | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const s = await api.getSession();
        if (!s) {
          navigate({ to: "/ecri/login" });
          return;
        }
        setSession(s);
        const p = await api.getPortfolio();
        setPortfolio(p);
      } catch (err) {
        console.error("Failed to load portfolio:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await api.logout();
    navigate({ to: "/" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium">
        Loading institutional assessment portfolio...
      </div>
    );
  }

  const institutionName = portfolio?.institutionName || session?.institution?.name || "University Account";
  const user = session?.user;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-teal selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Wordmark engine="ecri" />
            </Link>
            <span className="hidden sm:inline-flex rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
              Institutional Assessment Portfolio
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex flex-col text-right">
              <strong className="text-foreground">{user?.name}</strong>
              <span className="text-muted-foreground text-[11px]">{institutionName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 md:px-10 space-y-10">
        {/* Institutional Welcome Card */}
        <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal">
                <Building2 className="size-4" /> Single Institutional Identity (Instruction #56)
              </div>
              <h1 className="text-3xl font-serif font-bold text-foreground">{institutionName}</h1>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Centralized institutional management for all authorized Higher Education assessment instruments.
                Each assessment engine operates with independent methodology, evidence audit, and transformation roadmap.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-muted/40 p-4 rounded-xl border border-border text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Active Engagements</span>
                <strong className="text-lg font-bold text-teal">
                  {portfolio?.totalActiveEngagements || 0} / {portfolio?.totalAvailableEngagements || 2}
                </strong>
              </div>
              <div className="border-l border-border pl-4">
                <span className="text-muted-foreground block text-[11px]">Primary Contact</span>
                <strong className="text-sm text-foreground">{user?.name}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Assessment Portfolio Matrix */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground">
                Higher Education Assessment Instruments
              </h2>
              <p className="text-xs text-muted-foreground">
                One login. Separate engine entitlements and independent assessment workflows.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* 1. ECRI Instrument Card */}
            <div className="rounded-2xl border-2 border-teal/40 bg-card p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-teal/10 px-3 py-1 text-xs font-bold text-teal">
                    11 Dimensions · 132 Metrics
                  </span>
                  {session?.engineEntitlements?.["ecri"] === "ACTIVE" ||
                  portfolio?.entitlements.some((e) => e.productCode === "ecri" && e.status === "ACTIVE") ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Entitlement Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-400">
                      <Lock className="size-3.5" /> Unactivated
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    ECRI — Employability & Career Readiness Index
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Comprehensive institutional evaluation across 11 dimensions of industry curriculum co-design,
                    mandatory WIL/internships, AI work readiness, and graduate outcomes.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Engagement Cycle</span>
                    <strong className="text-foreground">2026–2027 Annual</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Assessment Scope</span>
                    <strong className="text-teal">Full 11 Dimensions</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground font-medium">
                  Authoritative Methodology: <strong>ecri-v6.0</strong>
                </span>

                <Link
                  to="/ecri/overview"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal/90 transition-all"
                >
                  <span>Enter ECRI Workspace</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. ARUI Instrument Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-navy/10 px-3 py-1 text-xs font-bold text-navy">
                    11 Domains · 143 Metrics
                  </span>
                  {session?.engineEntitlements?.["arui"] === "ACTIVE" ||
                  portfolio?.entitlements.some((e) => e.productCode === "arui" && e.status === "ACTIVE") ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Entitlement Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-400">
                      <Lock className="size-3.5" /> Unactivated
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    ARUI — AI-Resilient University Index
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Institutional readiness framework for artificial intelligence adaptation, academic integrity
                    governance, teaching transformation, and administrative resilience.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Engagement Cycle</span>
                    <strong className="text-foreground">2026–2027 Annual</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Assessment Scope</span>
                    <strong className="text-navy">Comprehensive 11 Domains</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground font-medium">
                  Authoritative Methodology: <strong>arui-v4.0</strong>
                </span>

                <Link
                  to="/arui/overview"
                  className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy/90 transition-all"
                >
                  <span>Enter ARUI Workspace</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Future Assessment Expansion Notice (Instruction #63, #76) */}
        <section className="rounded-2xl border border-dashed border-border p-6 bg-muted/20">
          <div className="flex items-start gap-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-teal/10 text-teal">
              <Layers className="size-5" />
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Extensible Higher Education Assessment Architecture</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As future evaluation frameworks (e.g. Sustainability & ESG Index, Global Research Impact Benchmark) are
                introduced, your institution accesses them seamlessly through this account without creating new credentials.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
