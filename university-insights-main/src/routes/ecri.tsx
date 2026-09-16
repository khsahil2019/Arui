import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceShell, ecriNav } from "@/components/ari/workspace-shell";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/ecri")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    // If accessing the public product page (/ecri or /ecri/) or login (/ecri/login), allow without workspace auth
    if (location.pathname === "/ecri" || location.pathname === "/ecri/" || location.pathname.startsWith("/ecri/login")) {
      return {};
    }
    const session = await context.queryClient.ensureQueryData(queries.session());
    // Require session specifically for Horizon State University / ECRI tenant
    if (!session || !session.institution?.name?.toLowerCase().includes("horizon")) {
      throw redirect({ to: "/ecri/login", search: { redirect: location.href } });
    }
    if (session.user.role === "assessor") {
      throw redirect({ to: "/assessor" });
    }
    return { session, assessmentId: session.assessmentId || "1e2e9604-6b6c-4a13-a5ee-4628284065f6" };
  },
  component: EcriLayout,
});

function EcriLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ctx = Route.useRouteContext();
  const session = (ctx as any)?.session;
  const assessmentId = (ctx as any)?.assessmentId ?? "1e2e9604-6b6c-4a13-a5ee-4628284065f6";

  // For exact public /ecri page or login, render Outlet directly without the workspace shell
  if (pathname === "/ecri" || pathname === "/ecri/" || pathname.startsWith("/ecri/login") || !session) {
    return <Outlet />;
  }

  const status = useQuery(queries.status(assessmentId));
  return (
    <WorkspaceShell
      session={session}
      nav={ecriNav}
      navLabel="ECRI Benchmark"
      engine="ecri"
      status={status.data ?? null}
    >
      <Outlet />
    </WorkspaceShell>
  );
}
