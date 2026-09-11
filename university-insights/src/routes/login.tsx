import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";
import { Field, TextInput } from "@/components/ari/form-field";
import { StatusBadge } from "@/components/ari/status-badge";
import { queries, useLogin } from "@/api/hooks";
import { apiMode } from "@/api/client";
import type { Role } from "@/lib/catalogue";

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => (typeof search["redirect"] === "string" ? { redirect: search["redirect"] } : {}),
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(queries.session());
    if (session) throw redirect({ to: search.redirect ?? (session.user.role === "assessor" ? "/assessor" : "/overview") });
  },
  head: () => ({
    meta: [
      { title: "Sign in — AI Resilient University" },
      { name: "description", content: "Sign in to your institution's AI Resilience assessment workspace." },
      { property: "og:title", content: "Sign in — AI Resilient University" },
      { property: "og:description", content: "Sign in to your institution's AI Resilience assessment workspace." },
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
  const [role, setRole] = useState<Extract<Role, "institution_admin" | "assessor">>("institution_admin");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = await login.mutateAsync({ email, password, ...(apiMode === "mock" ? { roleHint: role } : {}) });
    navigate({ to: back ?? (session.user.role === "assessor" ? "/assessor" : "/overview"), replace: true });
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="hidden flex-col justify-between bg-sidebar px-12 py-10 text-sidebar-foreground lg:flex">
        <Wordmark inverse />
        <div className="max-w-md">
          <p className="eyebrow text-sidebar-foreground/50">Institutional AI Resilience Assessment</p>
          <h1 className="mt-5 text-4xl leading-[1.12] text-sidebar-primary">A whole-institution reading of readiness for an AI-shaped future.</h1>
          <p className="mt-6 text-[15px] leading-relaxed text-sidebar-foreground/70">Responses and evidence remain the institution's own. Results are preliminary until independently verified and are never shared or benchmarked without your instruction.</p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">© 2026 AI Resilient University</p>
      </aside>

      <main className="flex min-h-screen flex-col px-6 py-8 md:px-12">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="eyebrow">Sign in</p>
              <h2 className="mt-2 text-3xl text-foreground">Your assessment workspace</h2>
            </div>
            <Lock className="size-5 text-muted-foreground" />
          </div>

          <form onSubmit={submit} className="space-y-5">
            <Field label="Institutional email">
              <TextInput type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@university.edu" />
            </Field>
            <Field label="Password">
              <TextInput type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </Field>

            {apiMode === "mock" && (
              <div className="rounded-lg border border-amber/40 bg-amber-soft/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Enter as</span>
                  <StatusBadge tone="demo">Mock sign-in</StatusBadge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(
                    [
                      ["institution_admin", "Institution Admin", "Complete the assessment"],
                      ["assessor", "Assessor", "Review, score and run"],
                    ] as const
                  ).map(([value, label, desc]) => (
                    <button key={value} type="button" onClick={() => setRole(value)} aria-pressed={role === value} className={`cursor-pointer rounded-md border px-3 py-2.5 text-left transition-colors ${role === value ? "border-navy bg-card" : "border-border bg-card/60 hover:border-navy/40"}`}>
                      <span className="block text-sm font-medium text-foreground">{label}</span>
                      <span className="block text-xs text-muted-foreground">{desc}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Any email and password are accepted while the production sign-in is not connected. Accounts, roles and sessions will be issued by the institutional backend.</p>
              </div>
            )}

            {login.isError && <p className="text-sm text-rose">Sign-in failed. Please check your details and try again.</p>}

            <button type="submit" disabled={login.isPending} className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-navy text-[15px] font-medium text-primary-foreground shadow-raised transition-colors hover:bg-navy-deep disabled:opacity-60">
              {login.isPending ? "Signing in…" : "Continue"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground">Access is issued to named institutional leads and contributors. If you have not received an invitation, contact your institution's assessment lead.</p>
        </div>
      </main>
    </div>
  );
}
