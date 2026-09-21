import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceShell, ecriNav } from "@/components/ari/workspace-shell";
import { queries } from "@/api/hooks";

export const Route = createFileRoute("/ecri")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    // Public routes under /ecri do not require session
    if (
      location.pathname === "/ecri" ||
      location.pathname === "/ecri/" ||
      location.pathname.startsWith("/ecri/login")
    ) {
      return {};
    }
    const session = await context.queryClient.ensureQueryData(queries.session("ecri"));
    if (!session || (session.engine && session.engine !== "ecri")) {
      throw redirect({ to: "/ecri/login", search: { redirect: location.href } });
    }
    if (session.user.role === "assessor") {
      throw redirect({ to: "/assessor" });
    }
    return { session, assessmentId: session.assessmentId };
  },
  component: EcriLayout,
});

function EcriLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ctx = Route.useRouteContext();
  const session = (ctx as any)?.session;
  const assessmentId = (ctx as any)?.assessmentId;
  const isPublic =
    pathname === "/ecri" || pathname === "/ecri/" || pathname.startsWith("/ecri/login") || !session;

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
      nav={ecriNav}
      navLabel="ECRI Benchmark"
      engine="ecri"
      status={status.data ?? null}
    >
      <Outlet />
    </WorkspaceShell>
  );
}
