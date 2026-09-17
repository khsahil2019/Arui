import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";
import { queries, useLogin } from "@/api/hooks";

export const Route = createFileRoute("/arui/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {},
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(queries.session("arui"));
    if (session && (session.engine === "arui" || !session.engine))
      throw redirect({
        to: search.redirect ?? (session.user.role === "assessor" ? "/assessor" : "/arui/overview"),
      });
  },
  head: () => ({
    meta: [
      { title: "ARUI Engine Sign In — AI Resilient University Index" },
      {
        name: "description",
        content: "Sign in to your institution's AI Resilience assessment workspace.",
      },
    ],
  }),
  component: AruiLoginPage,
});

function AruiLoginPage() {
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
        productCode: "arui",
        engine: "arui",
      });
      navigate({
        to: (back ?? (session.user.role === "assessor" ? "/assessor" : "/arui/overview")) as any,
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
      <aside className="hidden flex-col justify-between bg-sidebar px-12 py-10 text-sidebar-foreground lg:flex">
        <Wordmark inverse engine="arui" />
        <div className="max-w-md">
          <span className="rounded bg-navy/30 px-2.5 py-1 text-[11px] font-bold text-sidebar-primary uppercase tracking-wider">
            ARUI Framework Engine
          </span>
          <h1 className="mt-5 text-4xl leading-[1.12] text-sidebar-primary">
            A whole-institution reading of AI readiness and transformation.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-sidebar-foreground/70">
            Evaluating 11 Domains, 143 Capabilities and 143 Metrics with context-calibrated maturity
            baselines and verifiable audit evidence.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-sidebar-foreground/60 border-t border-sidebar-border pt-6">
            <div>
              <p className="font-bold text-sidebar-primary">11 Domains</p>
              <p className="text-[11px]">Strategy to Adaptability</p>
            </div>
            <div>
              <p className="font-bold text-sidebar-primary">143 Metrics</p>
              <p className="text-[11px]">Calibrated Rubric</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-sidebar-foreground/50">
          <span>© 2026 AI Resilient University</span>
          <Link to="/ecri/login" className="text-teal hover:underline font-semibold">
            Switch to ECRI Engine Login →
          </Link>
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex min-h-screen flex-col px-6 py-8 md:px-12 justify-center">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <span className="rounded bg-navy/10 px-2.5 py-1 text-xs font-bold text-navy uppercase tracking-wider">
                ARUI Engine
              </span>
              <Link to="/ecri/login" className="text-xs text-muted-foreground hover:text-teal">
                Switch to <strong>ECRI Engine</strong>
              </Link>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-foreground">Sign in to ARUI Workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter authorized institutional credentials to access the AI Resilience assessment.
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
                placeholder="lead@apex.edu"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/60 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
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
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/60 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
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
              className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-navy text-[14px] font-semibold text-primary-foreground shadow-raised transition-colors hover:bg-navy-deep disabled:opacity-60"
            >
              {login.isPending ? "Signing in…" : "Sign in to ARUI Workspace"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Quick Demo Sign-In Options for ARUI */}
          <div className="mt-6 rounded-xl border border-navy/20 bg-navy/5 p-4">
            <p className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> 1-Click ARUI Demo Credentials
            </p>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("lead@apex.edu");
                  setPassword("apex123");
                  handleLogin("lead@apex.edu", "apex123");
                }}
                disabled={login.isPending}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-xs font-medium text-foreground hover:border-navy hover:bg-card/80 transition-all cursor-pointer text-left shadow-sm"
              >
                <div>
                  <p className="font-bold text-navy">🎓 Apex National University (Institutional Lead)</p>
                  <p className="text-[11px] text-muted-foreground">lead@apex.edu / apex123 · 11 Domains · 143 Metrics</p>
                </div>
                <ArrowRight className="size-4 text-navy shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("sahilkh3014@gmail.com");
                  setPassword("123456");
                  handleLogin("sahilkh3014@gmail.com", "123456");
                }}
                disabled={login.isPending}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-navy hover:bg-card/80 transition-all cursor-pointer text-left"
              >
                <div>
                  <p className="font-semibold text-foreground">🛡️ Global Higher Ed Administrator</p>
                  <p className="text-[11px] text-muted-foreground">sahilkh3014@gmail.com / 123456 · Super Admin</p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("assessor@arui.org");
                  setPassword("assessor123");
                  handleLogin("assessor@arui.org", "assessor123");
                }}
                disabled={login.isPending}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-navy hover:bg-card/80 transition-all cursor-pointer text-left"
              >
                <div>
                  <p className="font-semibold text-foreground">🔍 ARUI Independent Assessor</p>
                  <p className="text-[11px] text-muted-foreground">assessor@arui.org / assessor123 · Audit Queue</p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">← Master Portal Home</Link>
            <span className="font-mono text-[11px]">ARUI Master v4.0</span>
          </div>
        </div>
      </main>
    </div>
  );
}
