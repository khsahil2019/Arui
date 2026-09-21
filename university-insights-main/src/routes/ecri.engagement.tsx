import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowRight,
  CreditCard,
  FileCheck2,
  Sparkles,
  Lock,
} from "lucide-react";
import { Wordmark } from "@/components/ari/workspace-shell";
import { getApi } from "@/api/client";
import type { Session } from "@/api/types";

export const Route = createFileRoute("/ecri/engagement")({
  component: EcriEngagementPage,
});

export function EcriEngagementPage() {
  const navigate = useNavigate();
  const api = getApi();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for first-time registration if not authenticated
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authForm, setAuthForm] = useState({
    institutionName: "",
    email: "",
    password: "",
    name: "",
    designation: "",
    phone: "",
  });
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const s = await api.getSession("ecri");
        setSession(s);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      if (isRegisterMode) {
        const s = await api.register({
          institutionName: authForm.institutionName,
          email: authForm.email,
          password: authForm.password,
          name: authForm.name,
          designation: authForm.designation,
          phone: authForm.phone,
          productCode: "ecri",
        });
        setSession(s);
      } else {
        const s = await api.login({
          email: authForm.email,
          password: authForm.password,
          productCode: "ecri",
          engine: "ecri",
        });
        setSession(s);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleActivateEngagement = async () => {
    setActivating(true);
    setError(null);
    try {
      await api.purchaseEngine("ecri", {
        productCode: "ecri",
        paymentMethod: "CARD",
        amount: 4999.0,
        currency: "USD",
        notes: "Institutional Assessment Engagement Activation",
      });
      navigate({ to: "/ecri/overview" });
    } catch (err: any) {
      setError(err.message || "Failed to activate assessment engagement.");
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium">
        Loading engagement details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-teal selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-4">
            <Link to="/ecri">
              <Wordmark engine="ecri" />
            </Link>
            <span className="hidden sm:inline-flex rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-bold text-teal">
              Institutional Assessment Engagement
            </span>
          </div>

          <Link
            to="/ecri"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            ← Back to Public Overview
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-12 md:px-10 space-y-10">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal/40 bg-teal/5 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-teal">
            <ShieldCheck className="size-3.5" /> Institutional Engagement Activation
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">
            Employability & Career Readiness Index (ECRI)
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Activate institutional evaluation for the 2026–2027 cycle. Comprehensive 11-dimension
            diagnostics, audit-grade evidence review, executive scoreboard, and boardroom PDF
            dossiers.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-700 dark:text-rose-400 text-center">
            {error}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-12">
          {/* Left Column: Engagement Scope & Features */}
          <div className="md:col-span-7 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-base font-serif font-bold text-foreground">
                Assessment Scope & Methodology Deliverables
              </h2>

              <div className="grid gap-3 text-xs">
                {[
                  {
                    title: "Exhaustive 11 Dimensions & 132 Metrics",
                    desc: "Curriculum co-design, work-integrated learning, career services, digital skills, alumni mobility.",
                  },
                  {
                    title: "Audit-Grade Evidence Verification",
                    desc: "Assessor adjudication against 792 calibrated maturity anchors (E0 to E3 evidence signals).",
                  },
                  {
                    title: "Executive Assessment Dossier (PDF)",
                    desc: "Boardroom-ready analytical report answering the 5 core leadership strategy questions.",
                  },
                  {
                    title: "Multi-Horizon Transformation Roadmap",
                    desc: "Actionable 3-horizon interventions with quantitative maturity targets and priority sequencing.",
                  },
                  {
                    title: "Longitudinal Reassessment & Benchmarking",
                    desc: "Annual evolution tracking and comparative intelligence with zero fake rankings guarantee.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-3"
                  >
                    <CheckCircle2 className="size-4 text-teal shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">{item.title}</strong>
                      <span className="text-muted-foreground text-[11px] leading-relaxed">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Account Recognition & Activation Action */}
          <div className="md:col-span-5 space-y-6">
            {session ? (
              /* User is authenticated: Show immediate activation */
              <div className="rounded-2xl border-2 border-teal/40 bg-card p-6 shadow-sm space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal">
                    Account Recognized (Instruction #59)
                  </span>
                  <h3 className="text-xl font-serif font-bold text-foreground">
                    {session.institution?.name || "Registered University"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Authorized Contact: <strong>{session.user.name}</strong> ({session.user.email})
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Institutional Engagement Fee:</span>
                    <span className="line-through">$5,499.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-foreground">
                    <span>Standard Annual Rate:</span>
                    <span className="text-teal text-base">$4,999.00 USD</span>
                  </div>
                  <span className="block text-[11px] text-muted-foreground">
                    Includes 12 months workspace access & full audit verification.
                  </span>
                </div>

                <button
                  onClick={handleActivateEngagement}
                  disabled={activating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal py-3.5 text-xs font-bold text-white shadow-raised hover:bg-teal/90 transition-all disabled:opacity-60"
                >
                  <CreditCard className="size-4" />
                  <span>
                    {activating
                      ? "Activating Engagement..."
                      : "Activate ECRI Assessment ($4,999 USD)"}
                  </span>
                </button>

                <p className="text-[11px] text-center text-muted-foreground">
                  Secure server-side entitlement activation. Payment receipt and invoice are
                  instantly generated.
                </p>
              </div>
            ) : (
              /* User not authenticated: Step 1 Registration / Sign In before Payment (Instruction #58) */
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-serif font-bold text-foreground">
                    {isRegisterMode ? "Register Institutional Account" : "Sign In to Proceed"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    className="text-xs font-semibold text-teal hover:underline"
                  >
                    {isRegisterMode ? "Existing Account? Sign In" : "New? Register First"}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground">
                  {isRegisterMode
                    ? "Establish your institutional identity prior to assessment activation (Instruction #58)."
                    : "Use your existing institutional credentials to activate ECRI without creating a duplicate account."}
                </p>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
                  {isRegisterMode && (
                    <>
                      <div>
                        <label className="block font-semibold mb-1">Institution Name</label>
                        <input
                          type="text"
                          required
                          value={authForm.institutionName}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, institutionName: e.target.value })
                          }
                          placeholder="e.g. Apex Global University"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-semibold mb-1">Contact Name</label>
                          <input
                            type="text"
                            required
                            value={authForm.name}
                            onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                            placeholder="e.g. Dr. Jane Smith"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold mb-1">Designation</label>
                          <input
                            type="text"
                            value={authForm.designation}
                            onChange={(e) =>
                              setAuthForm({ ...authForm, designation: e.target.value })
                            }
                            placeholder="e.g. Dean / Registrar"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block font-semibold mb-1">Institutional Email</label>
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      placeholder="e.g. assessment@university.edu"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-teal"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal py-3 text-xs font-bold text-white shadow-raised hover:bg-teal/90 transition-all disabled:opacity-60"
                  >
                    <span>
                      {authLoading
                        ? "Processing..."
                        : isRegisterMode
                          ? "Create Account & Proceed"
                          : "Sign In & Proceed"}
                    </span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
