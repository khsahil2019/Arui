import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, FileText, Link2, Plus, StickyNote, UploadCloud } from "lucide-react";
import { PageContainer, PagePending } from "@/components/ari/workspace-shell";
import { PageHeader } from "@/components/ari/page-header";
import { EvidenceCard } from "@/components/ari/evidence-card";
import { Panel, PanelHeader } from "@/components/ari/panel";
import { Field, SelectField, ShortText, TextInput } from "@/components/ari/form-field";
import { StatusBadge } from "@/components/ari/status-badge";
import { CoverageBar } from "@/components/ari/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceKind } from "@/api/types";
import { queries, useCreateEvidence, useSubmitEvidence } from "@/api/hooks";

export const Route = createFileRoute("/ecri/evidence")({
  loader: async ({ context }) => {
    const assessmentId = (context as any)?.assessmentId;
    if (assessmentId) {
      await context.queryClient
        .ensureQueryData(queries.evidence(assessmentId))
        .catch(() => undefined);
    }
  },
  pendingComponent: () => <PagePending />,
  head: () => ({
    meta: [
      { title: "ECRI Evidence & WIL Vault — Employability & Career Readiness" },
      {
        name: "description",
        content:
          "Upload WIL agreements, employer co-design meeting minutes, and graduate career outcome audits.",
      },
    ],
  }),
  component: EcriEvidencePage,
});

const kinds: { value: EvidenceKind; label: string; icon: typeof FileText; hint: string }[] = [
  {
    value: "document",
    label: "Upload document",
    icon: FileText,
    hint: "Employer agreements, WIL data, MoUs, accreditation files",
  },
  {
    value: "url",
    label: "Add link",
    icon: Link2,
    hint: "Industry portal, alumni placement tracking site",
  },
  {
    value: "note",
    label: "Add description",
    icon: StickyNote,
    hint: "Program co-design notes, advisory board meeting summaries",
  },
];

function EcriEvidencePage() {
  const ctx = Route.useRouteContext();
  const assessmentId = (ctx as any)?.assessmentId;
  const { data: view } = useQuery({
    ...queries.evidence(assessmentId || ""),
    enabled: !!assessmentId,
  });
  const create = useCreateEvidence(assessmentId || "");
  const submit = useSubmitEvidence(assessmentId || "");

  const [kind, setKind] = useState<EvidenceKind>("document");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState<string | null>(null);
  const [scope, setScope] = useState<string | null>("Institution-wide");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [requestIds, setRequestIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!view) {
    return <PagePending />;
  }

  const submitted = view.items.filter((i) => i.status !== "draft").length;
  const coverage = Math.min(1, submitted / view.coreTarget.min);
  const outstanding = view.requests.filter((r) => r.fulfilledByIds.length === 0);
  const proposed = [
    ...new Set(view.requests.filter((r) => requestIds.includes(r.id)).map((r) => r.domainName)),
  ];

  const reset = () => {
    setTitle("");
    setUrl("");
    setDescription("");
    setEvidenceType(null);
    setPeriodStart("");
    setPeriodEnd("");
    setFile(null);
    setRequestIds([]);
  };
  const add = async () => {
    if (!title.trim() || !evidenceType) return;
    const item = await create.mutateAsync({
      title: title.trim(),
      kind,
      evidenceType,
      ...(file ? { fileName: file.name, fileSize: file.size } : {}),
      ...(kind === "url" && url ? { url } : {}),
      ...(periodStart ? { periodStart } : {}),
      ...(periodEnd ? { periodEnd } : {}),
      description: description.trim() || (kind === "url" ? url : "Description to follow."),
      scope: scope ?? "Institution-wide",
      proposedSupports: proposed,
      fulfilsRequestIds: requestIds,
    });
    setSelected(item.id);
    reset();
  };

  return (
    <PageContainer width="wide">
      <PageHeader
        eyebrow="ECRI Evidence & WIL Vault"
        title="Employer Partnerships & Career Evidence"
        lede="Upload Industry Advisory Board minutes, verified WIL internship logs, co-designed syllabi, and verified graduate career outcome audits."
        meta={
          <div className="w-56">
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="text-muted-foreground">Core items submitted</span>
              <span className="font-medium text-foreground">
                {submitted} of {view.coreTarget.min}–{view.coreTarget.max}
              </span>
            </div>
            <CoverageBar value={coverage} tone="teal" />
            <p className="mt-1.5 text-[11px] text-muted-foreground">Accreditation audit target</p>
          </div>
        }
      />

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section>
          <Panel className="mb-8 border-emerald-100 shadow-sm">
            <PanelHeader
              eyebrow="What the assessment is asking for"
              title={`${outstanding.length} of ${view.requests.length} requests still open`}
            />
            <ul className="divide-y divide-border">
              {view.requests.map((r) => {
                const done = r.fulfilledByIds.length > 0;
                return (
                  <li key={r.id} className="flex items-start gap-4 px-6 py-3.5">
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                        done ? "border-emerald-600 bg-emerald-600 text-white" : "border-border",
                      )}
                    >
                      {done && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        {r.label}{" "}
                        <span className="font-normal text-muted-foreground">· {r.quantity}</span>
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {r.domainCode} · {r.requirement}
                      </span>
                    </span>
                    {!done && (
                      <button
                        type="button"
                        onClick={() => setRequestIds((s) => (s.includes(r.id) ? s : [...s, r.id]))}
                        className="cursor-pointer text-xs font-medium text-emerald-700 underline-offset-4 hover:underline"
                      >
                        Provide
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-sans text-[15px] font-semibold tracking-normal text-foreground">
                Evidence items
              </h2>
              <span className="text-xs text-muted-foreground">{view.items.length} items</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StatusBadge tone="teal" dot>
                Supporting assessment
              </StatusBadge>
              <StatusBadge tone="blue" dot>
                Submitted
              </StatusBadge>
              <StatusBadge tone="neutral" dot>
                Draft
              </StatusBadge>
            </div>
          </div>
          <div className="space-y-3">
            {view.items.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                selected={selected === item.id}
                onSelect={setSelected}
                actions={
                  item.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      disabled={submit.isPending}
                      onClick={(e) => {
                        e.stopPropagation();
                        submit.mutate(item.id);
                      }}
                    >
                      Submit for review
                    </Button>
                  )
                }
              />
            ))}
            {view.items.length === 0 && (
              <p className="rounded-lg border border-dashed border-emerald-200 px-6 py-10 text-center text-sm text-muted-foreground">
                No evidence yet. Start with what already exists — an Employer MoU, Advisory Board
                minutes, or internship completion audit.
              </p>
            )}
          </div>

          <Panel tone="muted" className="mt-8 px-6 py-5 border-emerald-100">
            <p className="eyebrow text-emerald-800">How evidence is used</p>
            <div className="mt-3 grid gap-5 text-[13.5px] leading-relaxed text-muted-foreground md:grid-cols-3">
              {view.guidance.map((g, i) => (
                <p key={i}>{g}</p>
              ))}
            </div>
          </Panel>
        </section>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Panel className="border-emerald-200 shadow-sm">
            <PanelHeader eyebrow="ECRI Verification" title="New WIL evidence item" />
            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-2">
                {kinds.map((k) => {
                  const active = kind === k.value;
                  return (
                    <button
                      key={k.value}
                      type="button"
                      onClick={() => setKind(k.value)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-2.5 text-left transition-colors",
                        active
                          ? "border-emerald-700 bg-emerald-50"
                          : "border-border hover:border-emerald-600/40",
                      )}
                    >
                      <k.icon
                        className={cn(
                          "size-4",
                          active ? "text-emerald-700" : "text-muted-foreground",
                        )}
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-foreground">{k.label}</span>
                        <span className="block text-xs text-muted-foreground">{k.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {kind === "document" && (
                <>
                  <input
                    ref={fileInput}
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                      if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""));
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-emerald-300 bg-emerald-50/30 px-4 py-8 text-center transition-colors hover:border-emerald-600"
                  >
                    <UploadCloud className="size-5 text-emerald-600" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {file ? file.name : "Choose a file"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {file
                        ? `${Math.round(file.size / 1000)} KB · file details are recorded; upload is completed by the production service`
                        : "Up to 25 MB"}
                    </p>
                  </button>
                </>
              )}

              <Field label="Title">
                <TextInput
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Industry Advisory Board Review 2026"
                />
              </Field>
              {kind === "url" && (
                <Field label="Link">
                  <TextInput
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://"
                    inputMode="url"
                  />
                </Field>
              )}
              <Field label="Evidence type">
                <SelectField
                  options={view.evidenceTypes}
                  value={evidenceType}
                  onChange={setEvidenceType}
                  placeholder="Select a type"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Period from" optional>
                  <TextInput
                    type="month"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </Field>
                <Field label="To" optional>
                  <TextInput
                    type="month"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </Field>
              </div>
              <Field
                label="Short description"
                optional
                hint="What it is, who approved it, and what it shows — one or two lines."
              >
                <ShortText
                  value={description}
                  onChange={setDescription}
                  maxLength={240}
                  lines={2}
                  placeholder="e.g. Industry Advisory Board approval of 2026 data science curriculum"
                  ariaLabel="Short description"
                />
              </Field>
              <Field label="Evidence scope" hint="Where in the institution this evidence applies.">
                <SelectField options={view.scopes} value={scope} onChange={setScope} />
              </Field>

              <div className="rounded-md border border-emerald-200 bg-card px-4 py-3.5">
                <p className="eyebrow text-emerald-800">Responds to</p>
                <div className="mt-2.5 space-y-1.5">
                  {view.requests.map((r) => {
                    const on = requestIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() =>
                          setRequestIds((s) => (on ? s.filter((x) => x !== r.id) : [...s, r.id]))
                        }
                        className={cn(
                          "flex w-full cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-emerald-50",
                          on && "bg-emerald-50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-[3px] flex size-3.5 shrink-0 items-center justify-center rounded-[2px] border",
                            on ? "border-emerald-700 bg-emerald-700" : "border-input",
                          )}
                        >
                          {on && <Check className="size-2.5 text-white" strokeWidth={3} />}
                        </span>
                        <span className="text-foreground">
                          {r.label} <span className="text-muted-foreground">· {r.domainCode}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[11.5px] leading-relaxed text-muted-foreground">
                  Indicative. The assessment confirms linkage as it reviews your responses; one item
                  may end up supporting several areas.
                </p>
              </div>

              <Button
                className="h-11 w-full text-[15px] bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={add}
                disabled={!title.trim() || !evidenceType || create.isPending}
              >
                <Plus /> {create.isPending ? "Adding…" : "Add to ECRI evidence"}
              </Button>
            </div>
          </Panel>
        </aside>
      </div>
    </PageContainer>
  );
}
