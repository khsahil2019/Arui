/**
 * Presentation framework renderer.
 *
 * Principle: STRUCTURED INPUT FIRST. Free text appears only as bounded
 * `short_text` (institution-specific names, one-line nuance) or as a
 * `narrative` field that carries its own methodology justification. There is
 * no unbounded textarea anywhere in the respondent experience.
 *
 * Renders whichever `PromptPresentation` the backend chose and reports a
 * structured value back (shapes documented in src/api/types.ts).
 *
 * onChange(value, { commit }) — `commit` is true for discrete selections that
 * can be persisted immediately; false while the respondent is typing.
 */

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChoiceOption } from "@/lib/catalogue";
import { OTHER_VALUE, type FieldDef, type MatrixColumnDef, type PromptPresentation, type ShortTextDef } from "@/api/types";
import { AnswerCard } from "./answer-card";
import { ChipGroup, Field, MonthInput, SegmentedChoice, SelectField, ShortText, TextInput, yesNoUnsureOptions } from "./form-field";

export interface ChangeMeta {
  commit: boolean;
}

interface PromptInputProps {
  presentation: PromptPresentation;
  value: unknown;
  onChange: (value: unknown, meta: ChangeMeta) => void;
  /** Rows for matrix prompts whose rows come from a prior response. */
  priorRows?: ChoiceOption[] | undefined;
  disabled?: boolean | undefined;
}

type Rec = Record<string, unknown>;
const asRec = (v: unknown): Rec => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : {});
const asStr = (v: unknown) => (typeof v === "string" ? v : "");
const asArr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
const otherOption: ChoiceOption = { value: OTHER_VALUE, label: "Other" };

export function PromptInput({ presentation, value, onChange, priorRows, disabled }: PromptInputProps) {
  const commit = (v: unknown) => onChange(v, { commit: true });
  const type = (v: unknown) => onChange(v, { commit: false });

  switch (presentation.kind) {
    case "single_choice": {
      const v = typeof value === "string" ? { choice: value } : (asRec(value) as { choice?: string; other?: string; nuance?: string });
      const options = presentation.allowOther ? [...presentation.options, otherOption] : presentation.options;
      const hasExtras = presentation.allowOther || presentation.nuance;
      const emit = (next: typeof v, meta: boolean) => (hasExtras ? onChange(next, { commit: meta }) : onChange(next.choice, { commit: meta }));
      return (
        <div className="space-y-4">
          <div role="radiogroup" className="grid gap-2.5">
            {options.map((o) => (
              <AnswerCard key={o.value} option={o} selected={v.choice === o.value} onSelect={(c) => emit({ ...v, choice: c }, true)} />
            ))}
          </div>
          {presentation.allowOther && v.choice === OTHER_VALUE && <ShortText value={v.other ?? ""} maxLength={80} placeholder="Describe briefly" ariaLabel="Other — please specify" disabled={disabled} onChange={(t) => emit({ ...v, other: t }, false)} />}
          {presentation.nuance && <NuanceField def={presentation.nuance} value={v.nuance ?? ""} disabled={disabled} onChange={(t) => emit({ ...v, nuance: t }, false)} />}
          {presentation.provisionalOptions && <ProvisionalNote />}
        </div>
      );
    }
    case "multi_choice": {
      const raw = asRec(value);
      const v = { selected: asArr(Array.isArray(value) ? value : raw["selected"]), other: asStr(raw["other"]), nuance: asStr(raw["nuance"]) };
      const options = presentation.allowOther ? [...presentation.options, otherOption] : presentation.options;
      const full = presentation.max !== undefined && v.selected.length >= presentation.max;
      const toggle = (val: string) => {
        const on = v.selected.includes(val);
        if (!on && full) return;
        commit({ ...v, selected: on ? v.selected.filter((s) => s !== val) : [...v.selected, val] });
      };
      return (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o) => {
              const on = v.selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  disabled={disabled || (!on && full)}
                  onClick={() => toggle(o.value)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    on ? "border-navy bg-navy/[0.035]" : "border-border hover:border-navy/40",
                  )}
                >
                  <CheckBox on={on} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{o.label}</span>
                    {o.description && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{o.description}</span>}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {v.selected.length} selected{presentation.max !== undefined && ` · up to ${presentation.max}`}
          </p>
          {presentation.allowOther && v.selected.includes(OTHER_VALUE) && <ShortText value={v.other} maxLength={80} placeholder="Other — describe briefly" ariaLabel="Other — please specify" disabled={disabled} onChange={(t) => type({ ...v, other: t })} />}
          {presentation.nuance && <NuanceField def={presentation.nuance} value={v.nuance} disabled={disabled} onChange={(t) => type({ ...v, nuance: t })} />}
          {presentation.provisionalOptions && <ProvisionalNote />}
        </div>
      );
    }
    case "ranked_list": {
      type Item = { value: string; other?: string } & Rec;
      const items = (asRec(value)["items"] as Item[] | undefined) ?? [];
      const options = presentation.allowOther ? [...presentation.options, otherOption] : presentation.options;
      const taken = new Set(items.map((i) => i.value).filter((x) => x !== OTHER_VALUE));
      const update = (next: Item[], meta = true) => onChange({ items: next }, { commit: meta });
      const move = (i: number, dir: -1 | 1) => {
        const next = [...items];
        const j = i + dir;
        if (j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j]!, next[i]!];
        update(next);
      };
      const canAdd = items.length < presentation.count;
      return (
        <div className="space-y-3">
          <p className="text-[13px] text-muted-foreground">
            Choose up to {presentation.count}, most significant first. Use the arrows to reorder.
          </p>
          <ol className="space-y-2.5">
            {items.map((item, i) => {
              const label = options.find((o) => o.value === item.value)?.label ?? item.value;
              return (
                <li key={i} className="rounded-lg border border-border bg-card p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    <span className="w-6 shrink-0 font-serif text-2xl leading-none text-navy">{i + 1}</span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-medium text-foreground">{label}</span>
                        {item.value === OTHER_VALUE && <ShortText value={item.other ?? ""} maxLength={80} placeholder={`${presentation.itemLabel} — describe briefly`} ariaLabel={`${presentation.itemLabel} ${i + 1} — other`} disabled={disabled} onChange={(t) => update(items.map((x, xi) => (xi === i ? { ...x, other: t } : x)), false)} className="min-w-[16rem] flex-1" />}
                      </div>
                      {presentation.itemFields && <FieldGrid fields={presentation.itemFields} value={item} disabled={disabled} onChange={(next, meta) => update(items.map((x, xi) => (xi === i ? ({ ...next, value: x.value, ...(x.other !== undefined ? { other: x.other } : {}) } as Item) : x)), meta)} />}
                    </div>
                    <div className="flex shrink-0 flex-col items-center gap-0.5 text-muted-foreground">
                      <IconButton label="Move up" disabled={disabled || i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp className="size-3.5" />
                      </IconButton>
                      <IconButton label="Move down" disabled={disabled || i === items.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown className="size-3.5" />
                      </IconButton>
                      <IconButton label="Remove" disabled={disabled} onClick={() => update(items.filter((_, xi) => xi !== i))}>
                        <X className="size-3.5" />
                      </IconButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          {canAdd && (
            <div className="rounded-lg border border-dashed border-input p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Add {presentation.itemLabel.toLowerCase()} {items.length + 1}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {options
                  .filter((o) => !taken.has(o.value))
                  .map((o) => (
                    <button key={o.value} type="button" disabled={disabled} onClick={() => update([...items, { value: o.value }])} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-input bg-card px-3 py-1.5 text-[13px] text-foreground transition-colors hover:border-navy/50 hover:bg-ivory-deep/40 disabled:opacity-50">
                      <Plus className="size-3 text-muted-foreground" /> {o.label}
                    </button>
                  ))}
              </div>
            </div>
          )}
          {presentation.provisionalOptions && <ProvisionalNote />}
        </div>
      );
    }
    case "process_steps":
      return <RecordList value={{ rows: Array.isArray(value) ? (value as Rec[]) : asRec(value)["rows"] }} onChange={(v, m) => onChange((v as { rows: Rec[] }).rows, m)} fields={presentation.stepFields} recordLabel={presentation.stepLabel} min={presentation.min ?? 1} max={presentation.max} numbered disabled={disabled} provisional={presentation.provisionalOptions} />;
    case "records":
      return <RecordList value={value} onChange={onChange} fields={presentation.fields} recordLabel={presentation.recordLabel} min={presentation.min ?? 1} max={presentation.max} noneOption={presentation.noneOption} disabled={disabled} provisional={presentation.provisionalOptions} />;
    case "numbers": {
      const raw = asRec(value);
      const values = (raw["values"] as Record<string, number | null> | undefined) ?? (Object.keys(raw).length && !("values" in raw) && !("precision" in raw) ? (raw as Record<string, number | null>) : {});
      const precision = asStr(raw["precision"]);
      const setNum = (id: string, n: number | null) => type({ values: { ...values, [id]: n }, precision });
      return (
        <div className="space-y-5">
          {presentation.period && <p className="text-sm text-muted-foreground">Period: {presentation.period}</p>}
          <div className="grid gap-5 sm:grid-cols-2">
            {presentation.fields.map((f) => (
              <Field key={f.id} label={f.label} hint={f.hint}>
                <TextInput type="number" inputMode="numeric" min={0} disabled={disabled} value={values[f.id] ?? ""} onChange={(e) => setNum(f.id, e.target.value === "" ? null : Number(e.target.value))} aria-label={f.label} className="max-w-[12rem]" />
              </Field>
            ))}
          </div>
          {presentation.precision && (
            <Field label="These figures are" hint="Approximate figures are acceptable where exact counts are not held centrally.">
              <SegmentedChoice options={precisionOptions} value={precision || null} disabled={disabled} onChange={(p) => commit({ values, precision: p })} ariaLabel="Precision of figures" />
            </Field>
          )}
        </div>
      );
    }
    case "structured_form":
      return (
        <div className="space-y-2">
          <FieldGrid fields={presentation.fields} value={asRec(value)} disabled={disabled} onChange={(v, meta) => onChange(v, { commit: meta })} />
          {presentation.provisionalOptions && <ProvisionalNote />}
        </div>
      );
    case "matrix":
      return <Matrix presentation={presentation} value={value} onChange={onChange} priorRows={priorRows} disabled={disabled} />;
    case "evidence_request": {
      const v = asRec(value) as { acknowledged?: boolean; note?: string };
      return (
        <div className="space-y-4">
          <ul className="space-y-2">
            {presentation.items.map((item) => (
              <li key={item} className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground shadow-card">
                {item}
              </li>
            ))}
          </ul>
          {presentation.note && <p className="text-[13px] leading-relaxed text-muted-foreground">{presentation.note}</p>}
          <button type="button" role="checkbox" aria-checked={!!v.acknowledged} disabled={disabled} onClick={() => commit({ ...v, acknowledged: !v.acknowledged })} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors", v.acknowledged ? "border-navy bg-navy/[0.035]" : "border-border hover:border-navy/40")}>
            <CheckBox on={!!v.acknowledged} />
            <span className="font-medium text-foreground">We will provide these through the Evidence workspace</span>
          </button>
          {presentation.noteField && <NuanceField def={presentation.noteField} value={v.note ?? ""} disabled={disabled} onChange={(t) => type({ ...v, note: t })} />}
        </div>
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

const precisionOptions: ChoiceOption[] = [
  { value: "exact", label: "Exact, from central records" },
  { value: "approximate", label: "Approximate" },
  { value: "partial", label: "Partly known" },
];

function ProvisionalNote() {
  return <p className="text-[11px] text-muted-foreground">Response options for this question are provisional and will be confirmed by the methodology team.</p>;
}

function CheckBox({ on }: { on: boolean }) {
  return <span className={cn("mt-[3px] flex size-4 shrink-0 items-center justify-center rounded-[3px] border", on ? "border-navy bg-navy" : "border-input bg-background")}>{on && <span className="size-2 bg-primary-foreground" />}</span>;
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean | undefined; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="cursor-pointer rounded p-1 hover:bg-ivory-deep/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30">
      {children}
    </button>
  );
}

function NuanceField({ def, value, onChange, disabled }: { def: ShortTextDef; value: string; onChange: (v: string) => void; disabled?: boolean | undefined }) {
  return (
    <Field label={def.label} optional hint={def.hint}>
      <ShortText value={value} maxLength={def.maxLength} placeholder={def.placeholder} ariaLabel={def.label} disabled={disabled} lines={def.maxLength > 120 ? 2 : 1} onChange={onChange} />
    </Field>
  );
}

/** Renders one FieldDef against a record and writes back into that record. */
function FieldControl({ def, record, onChange, disabled }: { def: FieldDef; record: Rec; onChange: (next: Rec, commit: boolean) => void; disabled?: boolean | undefined }) {
  const set = (patch: Rec, commit: boolean) => onChange({ ...record, ...patch }, commit);
  const otherKey = `${def.id}_other`;
  switch (def.type) {
    case "select": {
      const options = def.allowOther ? [...def.options, otherOption] : def.options;
      const v = asStr(record[def.id]);
      const compact = options.length <= 3 && options.every((o) => o.label.length <= 14);
      return (
        <div className="space-y-2">
          {compact ? <SegmentedChoice options={options} value={v || null} disabled={disabled} onChange={(c) => set({ [def.id]: c }, true)} ariaLabel={def.label} /> : <SelectField options={options} value={v || null} onChange={(c) => set({ [def.id]: c }, true)} ariaLabel={def.label} />}
          {def.allowOther && v === OTHER_VALUE && <ShortText value={asStr(record[otherKey])} maxLength={80} placeholder="Other — describe briefly" ariaLabel={`${def.label} — other`} disabled={disabled} onChange={(t) => set({ [otherKey]: t }, false)} />}
        </div>
      );
    }
    case "multi_select": {
      const options = def.allowOther ? [...def.options, otherOption] : def.options;
      const v = asArr(record[def.id]);
      return (
        <div className="space-y-2">
          <ChipGroup options={options} value={v} max={def.max} disabled={disabled} onChange={(next) => set({ [def.id]: next }, true)} ariaLabel={def.label} />
          {def.allowOther && v.includes(OTHER_VALUE) && <ShortText value={asStr(record[otherKey])} maxLength={80} placeholder="Other — describe briefly" ariaLabel={`${def.label} — other`} disabled={disabled} onChange={(t) => set({ [otherKey]: t }, false)} />}
        </div>
      );
    }
    case "yes_no_unsure":
      return <SegmentedChoice options={yesNoUnsureOptions} value={asStr(record[def.id]) || null} disabled={disabled} onChange={(c) => set({ [def.id]: c }, true)} ariaLabel={def.label} />;
    case "short_text":
      return <ShortText value={asStr(record[def.id])} maxLength={def.maxLength} placeholder={def.placeholder} ariaLabel={def.label} disabled={disabled} lines={def.maxLength > 120 ? 2 : 1} onChange={(t) => set({ [def.id]: t }, false)} />;
    case "narrative":
      return (
        <div className="space-y-1.5">
          <ShortText value={asStr(record[def.id])} maxLength={def.maxLength} placeholder={def.placeholder} ariaLabel={def.label} disabled={disabled} lines={3} onChange={(t) => set({ [def.id]: t }, false)} />
          <p className="text-[11px] text-muted-foreground">Why we ask for this in your own words: {def.justification}</p>
        </div>
      );
    case "number": {
      const n = record[def.id];
      return (
        <div className="flex items-center gap-2">
          <TextInput type="number" inputMode="numeric" min={0} disabled={disabled} value={typeof n === "number" ? n : ""} onChange={(e) => set({ [def.id]: e.target.value === "" ? null : Number(e.target.value) }, false)} aria-label={def.label} className="max-w-[10rem]" />
          {def.unit && <span className="text-sm text-muted-foreground">{def.unit}</span>}
        </div>
      );
    }
    case "period": {
      if (def.range) {
        const p = asRec(record[def.id]) as { from?: string; to?: string };
        return (
          <div className="flex flex-wrap items-center gap-2">
            <MonthInput value={p.from ?? ""} ariaLabel={`${def.label} — from`} disabled={disabled} onChange={(m) => set({ [def.id]: { ...p, from: m } }, true)} />
            <span className="text-sm text-muted-foreground">to</span>
            <MonthInput value={p.to ?? ""} ariaLabel={`${def.label} — to`} disabled={disabled} onChange={(m) => set({ [def.id]: { ...p, to: m } }, true)} />
          </div>
        );
      }
      return <MonthInput value={asStr(record[def.id])} ariaLabel={def.label} disabled={disabled} onChange={(m) => set({ [def.id]: m }, true)} />;
    }
  }
}

function FieldGrid({ fields, value, onChange, disabled }: { fields: FieldDef[]; value: Rec; onChange: (next: Rec, commit: boolean) => void; disabled?: boolean | undefined }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {fields.map((f) => {
        const wide = f.type === "multi_select" || f.type === "narrative" || (f.type === "short_text" && f.maxLength > 120);
        return (
          <Field key={f.id} label={f.label} hint={f.hint} optional={f.optional} className={cn(wide && "md:col-span-2")}>
            <FieldControl def={f} record={value} onChange={onChange} disabled={disabled} />
          </Field>
        );
      })}
    </div>
  );
}

function RecordList({ value, onChange, fields, recordLabel, min, max, numbered, noneOption, disabled, provisional }: { value: unknown; onChange: (v: unknown, meta: ChangeMeta) => void; fields: FieldDef[]; recordLabel: string; min: number; max?: number | undefined; numbered?: boolean; noneOption?: string | undefined; disabled?: boolean | undefined; provisional?: boolean | undefined }) {
  const raw = asRec(value);
  const none = raw["none"] === true;
  const stored = Array.isArray(value) ? (value as Rec[]) : ((raw["rows"] as Rec[] | undefined) ?? []);
  const rows: Rec[] = stored.length ? stored : none ? [] : Array.from({ length: min }, () => ({}) as Rec);
  const emit = (nextRows: Rec[], nextNone: boolean, commit: boolean) => onChange({ none: nextNone, rows: nextRows }, { commit });
  return (
    <div className="space-y-3">
      {noneOption && (
        <button type="button" role="checkbox" aria-checked={none} disabled={disabled} onClick={() => emit(none ? [] : [], !none, true)} className={cn("flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors", none ? "border-navy bg-navy/[0.035]" : "border-dashed border-input hover:border-navy/40")}>
          <CheckBox on={none} />
          <span className="font-medium text-foreground">{noneOption}</span>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">A legitimate answer — recorded as such</span>
        </button>
      )}
      {!none &&
        rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow text-foreground/70">
                {recordLabel} {numbered || rows.length > 1 ? i + 1 : ""}
              </span>
              {rows.length > min && (
                <button type="button" onClick={() => emit(rows.filter((_, ri) => ri !== i), false, true)} disabled={disabled} className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground" aria-label={`Remove ${recordLabel} ${i + 1}`}>
                  <X className="size-3.5" /> Remove
                </button>
              )}
            </div>
            <FieldGrid fields={fields} value={row} disabled={disabled} onChange={(next, commit) => emit(rows.map((r, ri) => (ri === i ? next : r)), false, commit)} />
          </div>
        ))}
      {!none && (max === undefined || rows.length < max) && (
        <button type="button" onClick={() => emit([...rows, {}], false, true)} disabled={disabled} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-navy/50 hover:text-foreground">
          <Plus className="size-4" /> Add {recordLabel.toLowerCase()}
        </button>
      )}
      {provisional && <ProvisionalNote />}
    </div>
  );
}

type MatrixRow = { id: string; label: string; other?: string; cells: Rec };
type MatrixValue = { rows: MatrixRow[] };

function Matrix({ presentation, value, onChange, priorRows, disabled }: { presentation: Extract<PromptPresentation, { kind: "matrix" }>; value: unknown; onChange: (v: unknown, meta: ChangeMeta) => void; priorRows?: ChoiceOption[] | undefined; disabled?: boolean | undefined }) {
  const current = ((value as MatrixValue | null)?.rows ?? []) as MatrixRow[];
  const src = presentation.rows;
  const editable = src.source === "respondent" || src.source === "respondent_select";

  let rows: MatrixRow[];
  if (editable) {
    rows = current;
  } else {
    const fixed = src.source === "fixed" ? src.items : (priorRows ?? []);
    rows = fixed.map((o) => current.find((r) => r.id === o.value) ?? { id: o.value, label: o.label, cells: {} });
  }

  const update = (next: MatrixRow[], commit = true) => onChange({ rows: next }, { commit });
  const setCell = (id: string, col: string, val: unknown, commit: boolean) => update(rows.map((r) => (r.id === id ? { ...r, cells: { ...r.cells, [col]: val } } : r)), commit);
  const rowLabel = src.source === "fixed" ? "" : src.rowLabel;
  const stacked = presentation.columns.some((c) => c.type === "multi_select");

  if (src.source === "prior_response" && rows.length === 0) {
    return <p className="rounded-md border border-dashed border-input px-4 py-6 text-center text-sm text-muted-foreground">This question builds on an earlier response that has not been recorded yet. Answer the earlier question first and this table will populate.</p>;
  }

  const selectOptions = src.source === "respondent_select" ? (src.allowOther ? [...src.options, otherOption] : src.options) : [];
  const taken = new Set(rows.map((r) => r.id).filter((id) => !id.startsWith(OTHER_VALUE)));

  const addRow = (o?: ChoiceOption) => {
    if (src.source === "respondent_select" && o) {
      const id = o.value === OTHER_VALUE ? `${OTHER_VALUE}-${Date.now()}` : o.value;
      update([...rows, { id, label: o.label, cells: {} }]);
    } else update([...rows, { id: `r${Date.now()}`, label: "", cells: {} }]);
  };

  const rowHead = (r: MatrixRow) => {
    if (src.source === "respondent") return <ShortText value={r.label} maxLength={src.maxLength} placeholder={src.placeholder} ariaLabel={rowLabel} disabled={disabled} onChange={(t) => update(rows.map((x) => (x.id === r.id ? { ...x, label: t } : x)), false)} />;
    if (src.source === "respondent_select" && r.id.startsWith(OTHER_VALUE)) return <ShortText value={r.other ?? ""} maxLength={60} placeholder={`Other ${rowLabel.toLowerCase()} — name it`} ariaLabel={`${rowLabel} — other`} disabled={disabled} onChange={(t) => update(rows.map((x) => (x.id === r.id ? { ...x, other: t } : x)), false)} />;
    return <span className="block py-1.5 font-medium text-foreground">{r.label}</span>;
  };

  const removeBtn = (r: MatrixRow) =>
    editable ? (
      <button type="button" disabled={disabled} onClick={() => update(rows.filter((x) => x.id !== r.id))} className="cursor-pointer text-muted-foreground hover:text-foreground" aria-label={`Remove ${r.label || rowLabel}`}>
        <X className="size-4" />
      </button>
    ) : null;

  return (
    <div className="space-y-3">
      {rows.length === 0 && editable && <p className="rounded-md border border-dashed border-input px-4 py-5 text-center text-sm text-muted-foreground">No {rowLabel.toLowerCase()} added yet. {src.source === "respondent_select" ? "Pick from the list below." : "Add the first one below."}</p>}

      {rows.length > 0 && stacked ? (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">{rowHead(r)}</div>
                {removeBtn(r)}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {presentation.columns.map((c) => (
                  <Field key={c.id} label={c.label} className={cn(c.type === "multi_select" && "md:col-span-2")}>
                    <MatrixCell col={c} value={r.cells[c.id]} disabled={disabled} onChange={(v, commit) => setCell(r.id, c.id, v, commit)} rowLabel={r.label} />
                  </Field>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-card">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-ivory-deep/60 text-left">
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{rowLabel || "Item"}</th>
                {presentation.columns.map((c) => (
                  <th key={c.id} className={cn("px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground", c.type === "check" && "text-center")}>
                    {c.label}
                  </th>
                ))}
                {editable && <th className="w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="min-w-[14rem] px-4 py-2 align-top">{rowHead(r)}</td>
                  {presentation.columns.map((c) => (
                    <td key={c.id} className={cn("px-3 py-2 align-top", c.type === "check" && "text-center")}>
                      <MatrixCell col={c} value={r.cells[c.id]} disabled={disabled} onChange={(v, commit) => setCell(r.id, c.id, v, commit)} rowLabel={r.label} />
                    </td>
                  ))}
                  {editable && <td className="px-2 py-3 align-top">{removeBtn(r)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {src.source === "respondent_select" && (
        <div className="rounded-lg border border-dashed border-input p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Add {rowLabel.toLowerCase()}</p>
          <div className="flex flex-wrap gap-1.5">
            {selectOptions
              .filter((o) => !taken.has(o.value))
              .map((o) => (
                <button key={o.value} type="button" disabled={disabled} onClick={() => addRow(o)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-input bg-card px-3 py-1.5 text-[13px] text-foreground transition-colors hover:border-navy/50 hover:bg-ivory-deep/40 disabled:opacity-50">
                  <Plus className="size-3 text-muted-foreground" /> {o.label}
                </button>
              ))}
          </div>
        </div>
      )}
      {src.source === "respondent" && (
        <button type="button" disabled={disabled} onClick={() => addRow()} className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-navy/50 hover:text-foreground">
          <Plus className="size-4" /> Add {rowLabel.toLowerCase()}
        </button>
      )}
      {presentation.provisionalOptions && <ProvisionalNote />}
    </div>
  );
}

function MatrixCell({ col, value, onChange, disabled, rowLabel }: { col: MatrixColumnDef; value: unknown; onChange: (v: unknown, commit: boolean) => void; disabled?: boolean | undefined; rowLabel: string }) {
  const aria = `${col.label} — ${rowLabel}`;
  switch (col.type) {
    case "check": {
      const on = value === true;
      return (
        <button type="button" role="checkbox" aria-checked={on} aria-label={aria} disabled={disabled} onClick={() => onChange(!on, true)} className={cn("mt-1 inline-flex size-5 cursor-pointer items-center justify-center rounded-[3px] border", on ? "border-navy bg-navy" : "border-input bg-background hover:border-navy/50")}>
          {on && <span className="size-2.5 bg-primary-foreground" />}
        </button>
      );
    }
    case "select": {
      const opts = col.options ?? [];
      const compact = opts.length <= 3 && opts.every((o) => o.label.length <= 14);
      return compact ? <SegmentedChoice options={opts} value={asStr(value) || null} disabled={disabled} onChange={(v) => onChange(v, true)} ariaLabel={aria} /> : <SelectField options={opts} value={asStr(value) || null} onChange={(v) => onChange(v, true)} ariaLabel={aria} />;
    }
    case "multi_select":
      return <ChipGroup options={col.options ?? []} value={asArr(value)} size="compact" disabled={disabled} onChange={(v) => onChange(v, true)} ariaLabel={aria} />;
    case "month":
      return <MonthInput value={asStr(value)} ariaLabel={aria} disabled={disabled} onChange={(v) => onChange(v, true)} className="h-9 text-sm" />;
    case "short_text":
      return <ShortText value={asStr(value)} maxLength={col.maxLength ?? 80} ariaLabel={aria} disabled={disabled} onChange={(v) => onChange(v, false)} />;
  }
}
