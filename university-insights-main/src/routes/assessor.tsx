import { createFileRoute, Outlet, redirect, useParams } from "@tanstack/react-router";
import { ClipboardCheck, FolderSearch, Inbox, ListChecks, ScrollText, SlidersHorizontal, Table2 } from "lucide-react";
import { WorkspaceShell, type NavItem } from "@/components/ari/workspace-shell";
import { queries } from "@/api/hooks";

/**
 * Assessor / admin area. Client-only, role-gated. The backend must enforce the
 * same role check on every assessor endpoint; this gate only shapes the UI.
 */
export const Route = createFileRoute("/assessor")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(queries.session());
    if (!session) throw redirect({ to: "/login", search: { redirect: location.href } });
    if (session.user.role !== "assessor") throw redirect({ to: "/overview" });
    return { session };
  },
  component: AssessorLayout,
});

function AssessorLayout() {
  const { session } = Route.useRouteContext();
  const params = useParams({ strict: false });
  const id = params.id;

  const nav: NavItem[] = [
    { to: "/assessor", label: "Review queue", icon: Inbox, exact: true },
    ...(id
      ? [
          { to: "/assessor/$id", params: { id }, label: "Assessment overview", icon: ClipboardCheck, exact: true },
          { to: "/assessor/$id/responses", params: { id }, label: "Responses", icon: ListChecks },
          { to: "/assessor/$id/evidence", params: { id }, label: "Evidence review", icon: FolderSearch },
          { to: "/assessor/$id/scoring", params: { id }, label: "Metric scoring", icon: Table2 },
          { to: "/assessor/$id/context", params: { id }, label: "Context & required maturity", icon: SlidersHorizontal },
          { to: "/assessor/$id/runs", params: { id }, label: "Score runs & log", icon: ScrollText },
        ]
      : []),
  ];

  return (
    <WorkspaceShell session={session} nav={nav} navLabel="Assessor" identity={{ title: session.user.name, subtitle: "Assessor workspace · methodology internal" }}>
      <Outlet />
    </WorkspaceShell>
  );
}
