import { createFileRoute, Outlet } from "@tanstack/react-router";
import { queries } from "@/api/hooks";
import { PagePending } from "@/components/ari/workspace-shell";

export const Route = createFileRoute("/assessor/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(queries.assessorAssessment(params.id)).then(() => undefined),
  pendingComponent: () => <PagePending />,
  component: () => <Outlet />,
});
