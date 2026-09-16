import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Users,
  ShieldCheck,
  PlusCircle,
  Key,
  LogIn,
  Building2,
  CheckCircle2,
  FileText,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Search,
  Database,
  Table as TableIcon,
  Eye,
  EyeOff,
  Layers,
  FileCheck2,
  Lock,
  LogOut,
  Unlock,
  ShieldAlert,
} from "lucide-react";
import { Wordmark, PageContainer } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel, PanelHeader } from "@/components/ari/panel";
import { StatusBadge } from "@/components/ari/status-badge";
import { useLogin } from "@/api/hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Super Admin Security & Database Explorer — AI Resilient University" },
      {
        name: "description",
        content:
          "Super Admin Protected Management Panel for Users, Database Tables, and Assessment Progress.",
      },
    ],
  }),
  component: AdminPage,
});

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  institutionId: string | null;
  institutionName: string;
  institutionState: string;
  assessmentId: string | null;
  assessmentStatus: string;
  assessmentStage: string;
  workProgress: {
    answeredResponses: number;
    evidenceSubmitted: number;
    latestScore: string;
  };
  createdAt: string;
}

interface SystemStats {
  institutions: number;
  users: number;
  assessments: number;
  answeredResponses: number;
  evidenceItems: number;
  scoreRuns: number;
}

interface TableMetadata {
  name: string;
  rowCount: number;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
}

interface TableDataResponse {
  tableName: string;
  totalRows: number;
  limit: number;
  offset: number;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
  }>;
  rows: Record<string, unknown>[];
}

const ADMIN_TOKEN_KEY = "arui.admin_token";

function AdminPage() {
  const navigate = useNavigate();
  const login = useLogin();

  // Admin Gate State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(ADMIN_TOKEN_KEY);
    }
    return null;
  });
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [adminAuthPending, setAdminAuthPending] = useState(false);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"users" | "database" | "methodology">("users");

  // User State
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  // Database Explorer State
  const [tables, setTables] = useState<TableMetadata[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("users");
  const [tableData, setTableData] = useState<TableDataResponse | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableOffset, setTableOffset] = useState(0);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "INSTITUTION_ADMIN",
    institutionName: "",
    state: "Karnataka",
    district: "Bengaluru Urban",
  });

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      if (
        window.location.port === "8080" ||
        window.location.port === "5173" ||
        window.location.port === "3000"
      ) {
        return `${window.location.protocol}//${window.location.hostname}:4000`;
      }
      return window.location.origin;
    }
    return "http://localhost:4000";
  };

  const getAuthHeaders = () => {
    const token =
      adminToken ||
      (typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_TOKEN_KEY) : null);
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setAdminAuthPending(true);

    try {
      const root = getBaseUrl();
      const res = await fetch(`${root}/api/v1/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: adminEmail.trim(),
          password: adminPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid Super Admin credentials.");
      }

      window.localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setAdminToken(data.token);
      setStatusMsg({ type: "success", text: "Super Admin authorized successfully." });
    } catch (err: unknown) {
      setAdminAuthError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setAdminAuthPending(false);
    }
  };

  const handleAdminLogout = () => {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminToken(null);
    setStatusMsg(null);
  };

  const loadData = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const root = getBaseUrl();
      const headers = getAuthHeaders();
      const [usersRes, statsRes, tablesRes] = await Promise.all([
        fetch(`${root}/api/v1/admin/users`, { headers }).then((r) => {
          if (r.status === 401 || r.status === 403) {
            handleAdminLogout();
            throw new Error("Admin session expired. Please re-authenticate.");
          }
          return r.json();
        }),
        fetch(`${root}/api/v1/admin/stats`, { headers }).then((r) => r.json()),
        fetch(`${root}/api/v1/admin/tables`, { headers })
          .then((r) => r.json())
          .catch(() => ({ tables: [] })),
      ]);

      if (usersRes.users) setUsers(usersRes.users);
      if (statsRes) setStats(statsRes);
      if (tablesRes.tables) setTables(tablesRes.tables);
    } catch (e: unknown) {
      console.error("Failed to load admin data:", e);
      const msg = e instanceof Error ? e.message : "Error loading admin data";
      if (msg.includes("expired")) {
        setAdminAuthError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName: string, offset = 0) => {
    if (!adminToken) return;
    setTableLoading(true);
    try {
      const root = getBaseUrl();
      const headers = getAuthHeaders();
      const res = await fetch(
        `${root}/api/v1/admin/tables/${tableName}?limit=50&offset=${offset}`,
        { headers },
      );
      if (!res.ok) throw new Error("Failed to load table data");
      const data: TableDataResponse = await res.json();
      setTableData(data);
      setTableOffset(offset);
    } catch (err: unknown) {
      console.error(`Error loading table ${tableName}:`, err);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadData();
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken && activeTab === "database" && selectedTable) {
      loadTableData(selectedTable, 0);
    }
  }, [adminToken, activeTab, selectedTable]);

  const handleInstantLogin = async (user: UserRecord) => {
    const pass = window.prompt(`Enter password to sign in as ${user.email}:`);
    if (!pass) return;

    try {
      setStatusMsg({ type: "success", text: `Signing in as ${user.email}…` });
      const session = await login.mutateAsync({
        email: user.email,
        password: pass.trim(),
      });

      if (session) {
        navigate({
          to: session.user.role === "assessor" ? "/assessor" : "/overview",
        });
      }
    } catch {
      setStatusMsg({
        type: "error",
        text: `Sign-in failed. Please verify password or use 'Reset Password' to set a new password.`,
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPassword) return;

    try {
      const root = getBaseUrl();
      const headers = getAuthHeaders();
      const res = await fetch(`${root}/api/v1/admin/users/reset-password`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: resetTargetUser.id,
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password reset failed");

      setStatusMsg({
        type: "success",
        text: `Password successfully updated for ${resetTargetUser.email}!`,
      });
      setResetTargetUser(null);
      setNewPassword("");
    } catch (e: unknown) {
      setStatusMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Password reset failed",
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const root = getBaseUrl();
      const headers = getAuthHeaders();
      const res = await fetch(`${root}/api/v1/admin/users`, {
        method: "POST",
        headers,
        body: JSON.stringify(newUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user");

      setStatusMsg({ type: "success", text: `User ${newUser.email} created with assessment!` });
      setShowCreateModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "INSTITUTION_ADMIN",
        institutionName: "",
        state: "Karnataka",
        district: "Bengaluru Urban",
      });
      loadData();
    } catch (e: unknown) {
      setStatusMsg({
        type: "error",
        text: e instanceof Error ? e.message : "Failed to create user",
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.institutionName.toLowerCase().includes(q)
    );
  });

  // SCREEN 1: SUPER ADMIN SECURITY LOCK GATE (IF UNAUTHENTICATED)
  if (!adminToken) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
        <header className="border-b border-border bg-card/60 px-6 py-4 md:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Wordmark />
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1.5"
            >
              <ArrowLeft className="size-3.5" /> Back to Main Portal
            </Link>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
          <Panel tone="card" className="p-8 shadow-raised border-border">
            <div className="flex size-12 items-center justify-center rounded-full bg-navy/10 text-navy mb-5 mx-auto">
              <ShieldCheck className="size-6" />
            </div>

            <div className="text-center mb-6">
              <p className="eyebrow">Restricted Surface</p>
              <h1 className="font-serif text-2xl font-medium text-foreground mt-1.5">
                Super Admin Authentication
              </h1>
              <p className="text-xs text-muted-foreground mt-1.5">
                Protected system console for registry maintenance, credentials and PostgreSQL
                access.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Admin Email / ID
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@arui.org"
                  className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Admin Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="text-xs text-navy hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showAdminPassword ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    {showAdminPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showAdminPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {adminAuthError && (
                <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 font-medium flex items-center gap-2 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={adminAuthPending}
                className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-navy text-[14px] font-semibold text-primary-foreground shadow-raised transition-colors hover:bg-navy-deep disabled:opacity-60"
              >
                {adminAuthPending ? (
                  <RefreshCw className="size-4 animate-spin mr-1" />
                ) : (
                  <Unlock className="size-4" />
                )}
                Unlock Super Admin Panel
              </button>
            </form>

            <div className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
              <span>
                Authorized personnel only · All operations logged in PostgreSQL audit vault
              </span>
            </div>
          </Panel>
        </main>

        <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © 2026 AI Resilient University Index · Super Admin Console
        </footer>
      </div>
    );
  }

  // SCREEN 2: AUTHENTICATED SUPER ADMIN PANEL
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header matching product aesthetic */}
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-6">
            <Wordmark />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-muted-foreground/40">/</span>
              <StatusBadge tone="teal" dot>
                Super Admin Authenticated
              </StatusBadge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-ivory-deep cursor-pointer"
            >
              <RefreshCw
                className={cn("size-3.5 text-muted-foreground", loading && "animate-spin")}
              />
              Refresh
            </button>
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-ivory-deep"
            >
              <ArrowLeft className="size-3.5 text-muted-foreground" />
              Main Portal
            </Link>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer"
            >
              <LogOut className="size-3.5" /> Lock Console
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <PageContainer>
        {/* Status Notification */}
        {statusMsg && (
          <div
            className={cn(
              "mb-6 flex items-center justify-between rounded-lg p-4 text-xs font-medium border",
              statusMsg.type === "success"
                ? "border-teal/30 bg-teal/10 text-teal-900 dark:text-teal-200"
                : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-200",
            )}
          >
            <span>{statusMsg.text}</span>
            <button
              type="button"
              onClick={() => setStatusMsg(null)}
              className="ml-4 font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <PageHeader
          eyebrow="System Administration & Data Registry"
          title="ARUI Management & Database Explorer"
          lede="Inspect user credentials, live response counts on the 143 metrics, institutional baselines, and directly query all 26 authoritative PostgreSQL tables."
          meta={
            <StatusBadge tone="teal" dot>
              Live PostgreSQL Registry · v4.0
            </StatusBadge>
          }
        />

        {/* Global Statistics Grid */}
        {stats && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Panel tone="card" className="p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Universities
                </span>
                <Building2 className="size-4 text-navy" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {stats.institutions}
              </div>
            </Panel>
            <Panel tone="card" className="p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Users</span>
                <Users className="size-4 text-navy" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{stats.users}</div>
            </Panel>
            <Panel tone="card" className="p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Assessments
                </span>
                <FileText className="size-4 text-navy" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{stats.assessments}</div>
            </Panel>
            <Panel tone="card" className="p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Responses
                </span>
                <CheckCircle2 className="size-4 text-teal" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {stats.answeredResponses}
              </div>
            </Panel>
            <Panel tone="card" className="p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Evidence Files
                </span>
                <FileCheck2 className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {stats.evidenceItems}
              </div>
            </Panel>
            <Panel tone="card" className="p-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Score Runs
                </span>
                <BarChart3 className="size-4 text-navy" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{stats.scoreRuns}</div>
            </Panel>
          </div>
        )}

        {/* Tab Selection */}
        <div className="mt-10 flex items-center gap-8 border-b border-border text-sm">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex items-center gap-2 border-b-2 pb-3 font-medium transition-colors cursor-pointer",
              activeTab === "users"
                ? "border-navy text-navy font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Users className="size-4" />
            Users & Work Progress ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("database")}
            className={cn(
              "flex items-center gap-2 border-b-2 pb-3 font-medium transition-colors cursor-pointer",
              activeTab === "database"
                ? "border-navy text-navy font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Database className="size-4" />
            PostgreSQL Tables ({tables.length || 26})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("methodology")}
            className={cn(
              "flex items-center gap-2 border-b-2 pb-3 font-medium transition-colors cursor-pointer",
              activeTab === "methodology"
                ? "border-navy text-navy font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="size-4" />
            143-Metric Registry Overview
          </button>
        </div>

        {/* TAB 1: USER DIRECTORY & WORK DONE */}
        {activeTab === "users" && (
          <div className="mt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter users by name, email, role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 rounded-md border border-input bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/70 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-navy px-4 text-xs font-medium text-primary-foreground shadow-raised transition-colors hover:bg-navy-deep cursor-pointer"
              >
                <PlusCircle className="size-3.5" />
                Create New User
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-16 text-sm text-muted-foreground">
                <RefreshCw className="size-5 animate-spin mr-2 text-navy" />
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <Panel tone="muted" className="p-12 text-center text-sm text-muted-foreground">
                No users found matching "{searchTerm}"
              </Panel>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredUsers.map((user) => (
                  <Panel
                    key={user.id}
                    tone="card"
                    className="p-6 transition-all hover:border-navy/40"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-serif text-lg font-medium text-foreground">
                            {user.name}
                          </h3>
                          <StatusBadge
                            tone={
                              user.role === "SUPER_ADMIN"
                                ? "teal"
                                : user.role === "ASSESSOR"
                                  ? "amber"
                                  : "blue"
                            }
                          >
                            {user.role}
                          </StatusBadge>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono text-foreground/80">{user.email}</span>
                          <span>•</span>
                          <span>{user.institutionName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Work Progress Card */}
                    <div className="mt-5 rounded-lg border border-border bg-ivory-deep/40 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <BarChart3 className="size-3.5 text-navy" /> Work Done Across 143 Metrics
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-md bg-card p-3 border border-border">
                          <div className="text-[11px] text-muted-foreground">Answered Metrics</div>
                          <div className="mt-1 text-base font-semibold text-foreground">
                            {user.workProgress.answeredResponses} / 143
                          </div>
                        </div>
                        <div className="rounded-md bg-card p-3 border border-border">
                          <div className="text-[11px] text-muted-foreground">Evidence Uploads</div>
                          <div className="mt-1 text-base font-semibold text-foreground">
                            {user.workProgress.evidenceSubmitted}
                          </div>
                        </div>
                        <div className="rounded-md bg-card p-3 border border-border">
                          <div className="text-[11px] text-muted-foreground">Index Score</div>
                          <div className="mt-1 text-base font-semibold text-teal">
                            {user.workProgress.latestScore}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-2.5">
                        <span>
                          Stage:{" "}
                          <strong className="text-foreground capitalize">
                            {user.assessmentStage}
                          </strong>
                        </span>
                        <span>
                          Status:{" "}
                          <strong className="text-foreground">{user.assessmentStatus}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setResetTargetUser(user);
                          setNewPassword("");
                        }}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Key className="size-3.5" />
                        Reset Password
                      </button>

                      <button
                        type="button"
                        onClick={() => handleInstantLogin(user)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-navy px-3 text-xs font-medium text-primary-foreground shadow-raised transition-colors hover:bg-navy-deep cursor-pointer"
                      >
                        <LogIn className="size-3.5" />
                        Sign in as this user
                      </button>
                    </div>
                  </Panel>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POSTGRESQL TABLE EXPLORER */}
        {activeTab === "database" && (
          <div className="mt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-foreground">
                  PostgreSQL Database Registry
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Browse and inspect raw records from all 26 authoritative tables stored in
                  PostgreSQL.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">Selected Table:</span>
                <select
                  value={selectedTable}
                  onChange={(e) => {
                    setSelectedTable(e.target.value);
                    setTableOffset(0);
                  }}
                  className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:border-navy focus:outline-none cursor-pointer"
                >
                  {tables.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.rowCount} rows)
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => loadTableData(selectedTable, tableOffset)}
                  disabled={tableLoading}
                  className="rounded-md border border-input bg-background p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RefreshCw className={cn("size-3.5", tableLoading && "animate-spin")} />
                </button>
              </div>
            </div>

            {/* Quick Table Selector Pills */}
            <div className="mb-6 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-3 rounded-lg border border-border bg-ivory-deep/40">
              {tables.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setSelectedTable(t.name);
                    setTableOffset(0);
                  }}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer",
                    selectedTable === t.name
                      ? "bg-navy text-primary-foreground font-semibold shadow-sm"
                      : "bg-card text-muted-foreground hover:text-foreground border border-border",
                  )}
                >
                  {t.name} <span className="opacity-70">({t.rowCount})</span>
                </button>
              ))}
            </div>

            {/* Table Grid Panel */}
            <Panel tone="card" className="overflow-hidden">
              <PanelHeader
                eyebrow={`Table: ${selectedTable}`}
                title={
                  tableData
                    ? `Showing ${tableData.totalRows} records (${tableData.columns.length} columns)`
                    : selectedTable
                }
                aside={
                  tableData && tableData.totalRows > 50 ? (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        disabled={tableOffset === 0 || tableLoading}
                        onClick={() => loadTableData(selectedTable, Math.max(0, tableOffset - 50))}
                        className="rounded border border-border bg-background px-2.5 py-1 text-foreground hover:bg-ivory-deep disabled:opacity-40 cursor-pointer"
                      >
                        ← Prev 50
                      </button>
                      <span className="text-muted-foreground">
                        {tableOffset + 1}–{Math.min(tableOffset + 50, tableData.totalRows)} of{" "}
                        {tableData.totalRows}
                      </span>
                      <button
                        type="button"
                        disabled={tableOffset + 50 >= tableData.totalRows || tableLoading}
                        onClick={() => loadTableData(selectedTable, tableOffset + 50)}
                        className="rounded border border-border bg-background px-2.5 py-1 text-foreground hover:bg-ivory-deep disabled:opacity-40 cursor-pointer"
                      >
                        Next 50 →
                      </button>
                    </div>
                  ) : null
                }
              />

              {tableLoading ? (
                <div className="flex items-center justify-center p-20 text-xs text-muted-foreground">
                  <RefreshCw className="size-4 animate-spin mr-2 text-navy" />
                  Querying {selectedTable}...
                </div>
              ) : !tableData || tableData.rows.length === 0 ? (
                <div className="p-16 text-center text-xs text-muted-foreground">
                  Table <strong className="text-foreground">{selectedTable}</strong> currently
                  contains 0 records.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-ivory-deep/90 text-muted-foreground border-b border-border font-mono backdrop-blur">
                      <tr>
                        {tableData.columns.map((col) => (
                          <th
                            key={col.name}
                            className="px-4 py-2.5 font-semibold whitespace-nowrap"
                          >
                            <div className="text-foreground">{col.name}</div>
                            <div className="text-[10px] text-muted-foreground font-normal">
                              {col.type}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-mono text-[11px]">
                      {tableData.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-ivory-deep/30 transition-colors">
                          {tableData.columns.map((col) => {
                            const val = row[col.name];
                            const isNull = val === null || val === undefined;
                            let rendered = isNull ? "NULL" : String(val);
                            if (!isNull && typeof val === "object") {
                              rendered = JSON.stringify(val);
                            }

                            return (
                              <td
                                key={col.name}
                                className={cn(
                                  "px-4 py-2 whitespace-nowrap max-w-xs truncate",
                                  isNull ? "text-muted-foreground/50 italic" : "text-foreground",
                                )}
                                title={rendered}
                              >
                                {rendered}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>
        )}

        {/* TAB 3: 143-METRIC METHODOLOGY REGISTRY */}
        {activeTab === "methodology" && (
          <div className="mt-8">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-foreground">
                Authoritative 143-Metric Registry
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Strict preservation of the 11 Domains, 143 Capabilities, 143 Metrics, 69 Cards, 63
                Questions, and 25 Profile context fields.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  code: "D01",
                  name: "Institutional Strategy & Leadership",
                  capCount: 13,
                  metrics: 13,
                },
                { code: "D02", name: "Policy, Integrity & Governance", capCount: 13, metrics: 13 },
                {
                  code: "D03",
                  name: "Workforce & Talent Transformation",
                  capCount: 13,
                  metrics: 13,
                },
                {
                  code: "D04",
                  name: "Curriculum Modernisation & Pedagogy",
                  capCount: 13,
                  metrics: 13,
                },
                { code: "D05", name: "Student AI Literacy & Readiness", capCount: 13, metrics: 13 },
                { code: "D06", name: "Teaching Innovation & Learning", capCount: 13, metrics: 13 },
                {
                  code: "D07",
                  name: "Institutional Technology & Infrastructure",
                  capCount: 13,
                  metrics: 13,
                },
                {
                  code: "D08",
                  name: "Employability & Career Adaptability",
                  capCount: 13,
                  metrics: 13,
                },
                {
                  code: "D09",
                  name: "Research, Innovation & Commercialisation",
                  capCount: 13,
                  metrics: 13,
                },
                {
                  code: "D10",
                  name: "Operational Efficiency & Analytics",
                  capCount: 13,
                  metrics: 13,
                },
                {
                  code: "D11",
                  name: "Future Readiness & Continuous Evolution",
                  capCount: 13,
                  metrics: 13,
                },
              ].map((domain) => (
                <Panel key={domain.code} tone="card" className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-navy">{domain.code}</span>
                    <StatusBadge tone="outline">Canonical</StatusBadge>
                  </div>
                  <h3 className="mt-3 font-serif text-base font-medium text-foreground">
                    {domain.name}
                  </h3>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground border-t border-border pt-3">
                    <span>{domain.capCount} Capabilities</span>
                    <span>•</span>
                    <span>{domain.metrics} Metrics</span>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        )}
      </PageContainer>

      {/* CREATE NEW USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-raised">
            <h3 className="font-serif text-xl font-medium text-foreground">
              Create User & Institution
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              New institutional accounts automatically receive an initialized 143-metric baseline
              assessment.
            </p>

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Prof. John Doe"
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@university.edu"
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="text-[11px] text-navy hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showNewUserPassword ? (
                      <EyeOff className="size-3" />
                    ) : (
                      <Eye className="size-3" />
                    )}
                    {showNewUserPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    type={showNewUserPassword ? "text" : "password"}
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-xs text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showNewUserPassword ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-navy focus:outline-none cursor-pointer"
                >
                  <option value="INSTITUTION_ADMIN">Institution Admin</option>
                  <option value="ASSESSOR">Assessor</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              {newUser.role === "INSTITUTION_ADMIN" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.institutionName}
                    onChange={(e) => setNewUser({ ...newUser, institutionName: e.target.value })}
                    placeholder="Imperial University of Technology"
                    className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-input bg-background px-3.5 py-1.5 text-xs text-foreground hover:bg-ivory-deep cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-navy px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-raised hover:bg-navy-deep cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-raised">
            <h3 className="font-serif text-xl font-medium text-foreground">Reset Password</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Update password for{" "}
              <strong className="text-foreground font-mono">{resetTargetUser.email}</strong>.
            </p>

            <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="text-[11px] text-navy hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    {showResetPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-9 text-xs text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showResetPassword ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="rounded-md border border-input bg-background px-3.5 py-1.5 text-xs text-foreground hover:bg-ivory-deep cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-navy px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-raised hover:bg-navy-deep cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
