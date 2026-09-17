import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";
import { queries, useLogin } from "@/api/hooks";

export const Route = createFileRoute("/ecri/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(queries.session("ecri"));
    if (session && session.engine === "ecri") {
      throw redirect({
        to: search.redirect ?? (session.user.role === "assessor" ? "/assessor" : "/ecri/overview"),
      });
    }
  },
  head: () => ({
    meta: [
      { title: "ECRI Engine Sign In — Employability & Career Readiness Index" },
      {
        name: "description",
        content: "Sign in to your institution's ECRI Employability & Career Readiness workspace.",
      },
    ],
  }),
  component: EcriLoginPage,
});

function EcriLoginPage() {
  const navigate = useNavigate();
  const { redirect: back } = Route.useSearch();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (userEmail: string, userPass: string) => {
    try {
      const session = await login.mutateAsync({
        email: userEmail.trim(),
        password: userPass.trim(),
        productCode: "ecri",
        engine: "ecri",
      });
      if (session.engineEntitlements && session.engineEntitlements["ecri"] === "NOT_PURCHASED") {
        navigate({
          to: "/ecri/engagement",
          replace: true,
        });
        return;
      }
      navigate({
        to: (back ?? (session.user.role === "assessor" ? "/assessor" : "/ecri/overview")) as any,
        replace: true,
      });
    } catch {
      // Error handled by query state
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Left Sidebar */}
      <aside className="hidden flex-col justify-between bg-slate-900 px-12 py-10 text-white lg:flex border-r border-teal/20">
        <Wordmark inverse engine="ecri" />
        <div className="max-w-md">
          <span className="rounded bg-teal px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
            ECRI Benchmark Engine
          </span>
          <h1 className="mt-5 text-4xl leading-[1.12] text-white">
            Institutional Benchmark for Graduate Employability & Career Readiness.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-slate-300">
            Exhaustive evaluation of 11 Dimensions, 132 Canonical Metrics, employer co-design,
            internships (WIL), and longitudinal career outcomes.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-slate-300 border-t border-slate-800 pt-6">
            <div>
              <p className="font-bold text-teal">11 Dimensions</p>
              <p className="text-[11px]">Employer Demand to Lifelong Agility</p>
            </div>
            <div>
              <p className="font-bold text-teal">132 Metrics</p>
              <p className="text-[11px]">792 Maturity Anchors</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 ECRI Global Advisory</span>
          <Link to="/arui/login" className="text-teal hover:underline font-semibold">
            Switch to ARUI Engine Login →
          </Link>
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex min-h-screen flex-col px-6 py-8 md:px-12 justify-center">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <span className="rounded bg-teal/10 px-2.5 py-1 text-xs font-bold text-teal uppercase tracking-wider">
                ECRI Engine
              </span>
              <Link to="/arui/login" className="text-xs text-muted-foreground hover:text-navy">
                Switch to <strong>ARUI Engine</strong>
              </Link>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-foreground">Sign in to ECRI Workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter authorized institutional credentials to access the Employability & Career Readiness benchmark.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Institutional Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lead@horizon.edu"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/60 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="size-3.5" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="size-3.5" /> Show
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/60 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {login.isError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
                <Lock className="size-4 shrink-0" />
                <span>Invalid credentials. Please verify your email and password.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-teal text-[14px] font-semibold text-white shadow-raised transition-colors hover:bg-teal/90 disabled:opacity-60"
            >
              {login.isPending ? "Signing in…" : "Sign in to ECRI Workspace"}
              <ArrowRight className="size-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/ecri/engagement" className="text-xs font-semibold text-teal hover:underline">
                New institution? Register Institutional Account & Activate Engagement →
              </Link>
            </div>
          </form>

          {/* Quick Demo Sign-In Options for ECRI */}
          <div className="mt-6 rounded-xl border border-teal/30 bg-teal/5 p-4">
            <p className="text-xs font-bold text-teal uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="size-4" /> 1-Click ECRI Demo Credentials
            </p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("lead@horizon.edu");
                  setPassword("horizon123");
                  handleLogin("lead@horizon.edu", "horizon123");
                }}
                disabled={login.isPending}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-medium text-foreground hover:border-teal hover:bg-card/80 transition-all cursor-pointer text-left shadow-sm"
              >
                <div>
                  <p className="font-bold text-teal">💼 Horizon State University (Dean of Career & WIL)</p>
                  <p className="text-[11px] text-muted-foreground">lead@horizon.edu / horizon123 · 11 Dimensions · 132 Metrics</p>
                </div>
                <ArrowRight className="size-4 text-teal shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("industry@horizon.edu");
                  setPassword("horizon123");
                  handleLogin("industry@horizon.edu", "horizon123");
                }}
                disabled={login.isPending}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-teal hover:bg-card/80 transition-all cursor-pointer text-left"
              >
                <div>
                  <p className="font-semibold text-foreground">🤝 Director of Corporate Partnerships & WIL</p>
                  <p className="text-[11px] text-muted-foreground">industry@horizon.edu / horizon123 · Work-Integrated Learning</p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("assessor@ecri.org");
                  setPassword("assessor123");
                  handleLogin("assessor@ecri.org", "assessor123");
                }}
                disabled={login.isPending}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-teal hover:bg-card/80 transition-all cursor-pointer text-left"
              >
                <div>
                  <p className="font-semibold text-foreground">🔍 Lead ECRI Adjudicator</p>
                  <p className="text-[11px] text-muted-foreground">assessor@ecri.org / assessor123 · Calibration & Review</p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">← Master Portal Home</Link>
            <span className="font-mono text-[11px]">ECRI Master v6.0</span>
          </div>
        </div>
      </main>
    </div>
  );
}
