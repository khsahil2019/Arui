import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceShell, aruiNav } from "@/components/ari/workspace-shell";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/arui")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    // If accessing the public product specs page (/arui or /arui/) or login (/arui/login), allow without authentication
    if (location.pathname === "/arui" || location.pathname === "/arui/" || location.pathname.startsWith("/arui/login")) {
      return {};
    }
    const session = await context.queryClient.ensureQueryData(queries.session());
    if (!session || session.institution?.name?.toLowerCase().includes("horizon")) {
      throw redirect({ to: "/arui/login", search: { redirect: location.href } });
    }
    if (session.user.role === "assessor") {
      throw redirect({ to: "/assessor" });
    }
    return { session, assessmentId: session.assessmentId || "31d74aad-331b-4124-8b63-17a757448c42" };
  },
  component: AruiLayout,
});

function AruiLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ctx = Route.useRouteContext();
  const session = (ctx as any)?.session;
  const assessmentId = (ctx as any)?.assessmentId ?? "31d74aad-331b-4124-8b63-17a757448c42";

  if (pathname === "/arui" || pathname === "/arui/" || pathname.startsWith("/arui/login") || !session) {
    return <Outlet />;
  }

  const status = useQuery(queries.status(assessmentId));
  return (
    <WorkspaceShell
      session={session}
      nav={aruiNav}
      navLabel="ARUI Framework"
      engine="arui"
      status={status.data ?? null}
    >
      <Outlet />
    </WorkspaceShell>
  );
}
