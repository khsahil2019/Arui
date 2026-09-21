import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { Panel } from "@/components/ari/panel";
import { Button } from "@/components/ui/button";
import { queries } from "@/api/hooks";
import { ArrowRight, ShieldCheck, Award, Briefcase } from "lucide-react";

export const Route = createFileRoute("/ecri/orientation")({
  loader: async ({ context }) => {
    const assessmentId = (context as any)?.assessmentId;
    if (assessmentId) {
      await context.queryClient
        .ensureQueryData(queries.status(assessmentId))
        .catch(() => undefined);
    }
  },
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "ECRI Orientation — Employability Methodology Scope" },
      {
        name: "description",
        content:
          "Overview of ECRI 11 dimensions, employer integration metrics, and accreditation calibration.",
      },
    ],
  }),
  component: EcriOrientationPage,
});

function EcriOrientationPage() {
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
        eyebrow="ECRI Orientation"
        title="Assessment Scope & Employability Protocol."
        lede="Understand the 11 employability dimensions, the role of Work-Integrated Learning (WIL) evidence, and employer co-design standards."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Panel className="p-6 border-emerald-100 shadow-sm">
          <Briefcase className="size-6 text-emerald-700 mb-3" />
          <h3 className="text-base font-semibold text-foreground">11 Employability Dimensions</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Covers employer co-design, industry tools, WIL internships, soft skills, and
            longitudinal career tracking.
          </p>
        </Panel>

        <Panel className="p-6 border-emerald-100 shadow-sm">
          <Award className="size-6 text-emerald-700 mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            Calibrated ECRI Benchmark (0–5)
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Evaluates capability against national employer demand baselines calibrated to your
            institution's degree mix.
          </p>
        </Panel>

        <Panel className="p-6 border-emerald-100 shadow-sm">
          <ShieldCheck className="size-6 text-emerald-700 mb-3" />
          <h3 className="text-base font-semibold text-foreground">Verified WIL Audit Standards</h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Institutional WIL metrics and partnership claims are validated against independent
            employer feedback and logs.
          </p>
        </Panel>
      </div>

      <div className="mt-10 flex justify-end">
        <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
          <Link to="/ecri/assessment">
            Enter 11 Dimensions Assessment <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </PageContainer>
  );
}
