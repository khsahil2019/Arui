import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceShell, workspaceNav } from "@/components/ari/workspace-shell";
import { queries } from "@/api/hooks";

/**
 * Respondent workspace. Client-only: the session and all assessment data come
 * from the API boundary, which in mock mode lives in the browser.
 */
export const Route = createFileRoute("/_workspace")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(queries.session());
    if (!session) throw redirect({ to: "/login", search: { redirect: location.href } });
    if (session.user.role === "assessor") {
      throw redirect({ to: "/assessor" });
    }
    return { session, assessmentId: session.assessmentId || "active" };
  },
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  const { session, assessmentId } = Route.useRouteContext();
  const status = useQuery(queries.status(assessmentId));
  return (
    <WorkspaceShell
      session={session}
      nav={workspaceNav}
      navLabel="Workspace"
      status={status.data ?? null}
    >
      <Outlet />
    </WorkspaceShell>
  );
}
