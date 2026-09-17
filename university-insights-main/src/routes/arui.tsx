import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceShell, aruiNav } from "@/components/ari/workspace-shell";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/arui")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    // Public routes under /arui do not require session
    if (
      location.pathname === "/arui" ||
      location.pathname === "/arui/" ||
      location.pathname.startsWith("/arui/login")
    ) {
      return {};
    }
    const session = await context.queryClient.ensureQueryData(queries.session("arui"));
    if (!session || (session.engine && session.engine !== "arui")) {
      throw redirect({ to: "/arui/login", search: { redirect: location.href } });
    }
    if (session.user.role === "assessor") {
      throw redirect({ to: "/assessor" });
    }
    return { session, assessmentId: session.assessmentId };
  },
  component: AruiLayout,
});

function AruiLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ctx = Route.useRouteContext();
  const session = (ctx as any)?.session;
  const assessmentId = (ctx as any)?.assessmentId;
  const isPublic =
    pathname === "/arui" ||
    pathname === "/arui/" ||
    pathname.startsWith("/arui/login") ||
    !session;

  const status = useQuery({
    ...queries.status(assessmentId || ""),
    enabled: !isPublic && !!assessmentId,
  });

  if (isPublic) {
    return <Outlet />;
  }

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
