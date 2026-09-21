import { useState } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";
import { queries, useLogin } from "@/api/hooks";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string; engine?: string } => ({
    ...(typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {}),
    ...(typeof search["engine"] === "string" ? { engine: search["engine"] } : {}),
  }),
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(queries.session());
    if (session) {
      const target =
        search.redirect ?? (session.user.role === "assessor" ? "/assessor" : "/overview");
      throw redirect({
        to: target as any,
        search: (search.engine ? { engine: search.engine } : {}) as any,
      });
    }
    if (search.engine === "ecri") {
      throw redirect({
        to: "/ecri/login",
        search: search.redirect ? { redirect: search.redirect } : {},
      });
    }
    if (search.engine === "arui") {
      throw redirect({
        to: "/arui/login",
        search: search.redirect ? { redirect: search.redirect } : {},
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — AI Resilient University" },
      {
        name: "description",
        content: "Sign in to your institution's AI Resilience assessment workspace.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect: back } = Route.useSearch();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const session = await login.mutateAsync({
        email: email.trim(),
        password: password.trim(),
      });
      navigate({
        to: back ?? (session.user.role === "assessor" ? "/assessor" : "/overview"),
        replace: true,
      });
    } catch (err) {
      // Error handled by query state
    }
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Left Sidebar */}
      <aside className="hidden flex-col justify-between bg-sidebar px-12 py-10 text-sidebar-foreground lg:flex">
        <Wordmark inverse />
        <div className="max-w-md">
          <p className="eyebrow text-sidebar-foreground/50">
            Institutional AI Resilience Assessment
          </p>
          <h1 className="mt-5 text-4xl leading-[1.12] text-sidebar-primary">
            A whole-institution reading of readiness for an AI-shaped future.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-sidebar-foreground/70">
            Evaluating 11 Domains, 143 Capabilities and 143 Metrics with context-calibrated maturity
            baselines and verifiable audit evidence.
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-sidebar-foreground/50">
          <span>© 2026 AI Resilient University Index</span>
          <span>Institutional Research Assessment</span>
        </div>
      </aside>

      {/* Right Content */}
      <main className="flex min-h-screen flex-col px-6 py-8 md:px-12 justify-center">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="mb-8">
            <p className="eyebrow">Institutional Access</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Sign in to your workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your authorized institutional credentials to continue.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Institutional Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/60 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>
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
              {login.isPending ? "Signing in…" : "Sign in to Assessment"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Quick Demo Sign-In Options (Environment-Gated for Security) */}
          {(import.meta.env.DEV || import.meta.env["VITE_ENABLE_DEMO_CREDENTIALS"] === "true") && (
            <div className="mt-6 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 p-4">
              <p className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="size-4" /> Instant Demo Access
              </p>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setEmail("lead@apex.edu");
                    setPassword("apex123");
                    try {
                      const session = await login.mutateAsync({
                        email: "lead@apex.edu",
                        password: "apex123",
                      });
                      navigate({
                        to: back ?? (session.user.role === "assessor" ? "/assessor" : "/overview"),
                        replace: true,
                      });
                    } catch {}
                  }}
                  disabled={login.isPending}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-navy hover:bg-card/80 transition-all cursor-pointer text-left"
                >
                  <div>
                    <p className="font-semibold text-navy">
                      🎓 Apex National University (ARUI Lead)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      lead@apex.edu / apex123 · 11 Domains · 143 Metrics
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 text-navy shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setEmail("lead@horizon.edu");
                    setPassword("horizon123");
                    try {
                      const session = await login.mutateAsync({
                        email: "lead@horizon.edu",
                        password: "horizon123",
                      });
                      navigate({
                        to: back ?? (session.user.role === "assessor" ? "/assessor" : "/portfolio"),
                        replace: true,
                      });
                    } catch {}
                  }}
                  disabled={login.isPending}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-teal hover:bg-card/80 transition-all cursor-pointer text-left"
                >
                  <div>
                    <p className="font-semibold text-teal">
                      💼 Horizon State University (ECRI Lead)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      lead@horizon.edu / horizon123 · Career & WIL
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 text-teal shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setEmail("sahilkh3014@gmail.com");
                    setPassword("123456");
                    try {
                      const session = await login.mutateAsync({
                        email: "sahilkh3014@gmail.com",
                        password: "123456",
                      });
                      navigate({
                        to: back ?? (session.user.role === "assessor" ? "/assessor" : "/overview"),
                        replace: true,
                      });
                    } catch {}
                  }}
                  disabled={login.isPending}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-navy hover:bg-card/80 transition-all cursor-pointer text-left"
                >
                  <div>
                    <p className="font-semibold text-foreground">🛡️ Global Higher Ed Admin</p>
                    <p className="text-[11px] text-muted-foreground">
                      sahilkh3014@gmail.com / 123456 · Full Platform
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setEmail("assessor@arui.org");
                    setPassword("assessor123");
                    try {
                      const session = await login.mutateAsync({
                        email: "assessor@arui.org",
                        password: "assessor123",
                      });
                      navigate({
                        to: back ?? (session.user.role === "assessor" ? "/assessor" : "/overview"),
                        replace: true,
                      });
                    } catch {}
                  }}
                  disabled={login.isPending}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-navy hover:bg-card/80 transition-all cursor-pointer text-left"
                >
                  <div>
                    <p className="font-semibold text-foreground">🔍 ARUI Assessor</p>
                    <p className="text-[11px] text-muted-foreground">
                      assessor@arui.org / assessor123 · Queue
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:underline">
              ← Master Portal Home
            </Link>
            <span className="font-mono text-[11px]">Multi-Product Platform</span>
          </div>
        </div>
      </main>
    </div>
  );
}
