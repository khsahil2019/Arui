import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel, PanelHeader } from "@/components/ari/panel";
import { Button } from "@/components/ui/button";
import { queries } from "@/api/hooks";
import { Compass, ArrowRight, ShieldCheck, FileSpreadsheet, Lock } from "lucide-react";

export const Route = createFileRoute("/arui/orientation")({
  loader: async ({ context }) => {
    const assessmentId = (context as any)?.assessmentId;
    if (assessmentId) {
      await context.queryClient.ensureQueryData(queries.status(assessmentId)).catch(() => undefined);
    }
  },
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "ARUI Orientation — Methodology Scope" },
      {
        name: "description",
        content: "Overview of ARUI assessment methodology, confidentiality, and data handling.",
      },
    ],
  }),
  component: AruiOrientationPage,
});

function AruiOrientationPage() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any)?.assessmentId;
  const { data: status } = useQuery({
    ...queries.status(assessmentId || ""),
    enabled: !!assessmentId,
  });

  if (!status) {
    return <PagePending />;
  }

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="ARUI Orientation"
        title="Assessment Scope & Methodology."
        lede="Understand the 11 domains, the role of institutional evidence, and our rigorous confidentiality protocols."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Panel className="p-6">
          <ShieldCheck className="size-6 text-navy mb-3" />
          <h3 className="text-base font-semibold text-foreground">11 Assessed Domains</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Covers governance, human capability, student agency, compute infrastructure, and research integrity.
          </p>
        </Panel>

        <Panel className="p-6">
          <FileSpreadsheet className="size-6 text-navy mb-3" />
          <h3 className="text-base font-semibold text-foreground">Calibrated Maturity (0–5)</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Evaluates capability against contextual baselines calibrated to your institution's profile.
          </p>
        </Panel>

        <Panel className="p-6">
          <Lock className="size-6 text-navy mb-3" />
          <h3 className="text-base font-semibold text-foreground">Strict Confidentiality</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Institutional responses remain private and confidential until independently verified.
          </p>
        </Panel>
      </div>

      <div className="mt-10 flex justify-end">
        <Button asChild className="bg-navy text-white hover:bg-navy-deep">
          <Link to="/arui/assessment">
            Enter 11 Domains Assessment <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
