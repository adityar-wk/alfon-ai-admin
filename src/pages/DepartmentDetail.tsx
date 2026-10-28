import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  CheckCircle2,
  Check,
  Trash2,
  Lightbulb,
  ArrowDown,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Button, Field, Input, Textarea, Modal, Select } from "../components/ui";
import { getDepartment, type DeptMember, type DeptService } from "../data/departments";
import { deptIcon } from "../data/deptIcons";

type SlaRow = { hours247: boolean; hoursStart: string; hoursEnd: string; response: string; resolve: string };
type Level = { id: number; to: string; minutes: string };
type ModalState = { mode: "add" } | { mode: "edit"; service: DeptService } | null;

const blankSla = (): SlaRow => ({ hours247: true, hoursStart: "09:00", hoursEnd: "18:00", response: "20", resolve: "90" });
const hoursLabel = (row: SlaRow) => (row.hours247 ? "Open all day" : `${row.hoursStart} – ${row.hoursEnd}`);

const SEED_LEVELS: Level[] = [
  { id: 1, to: "Supervisor", minutes: "" },
  { id: 2, to: "Department Head", minutes: "15" },
  { id: 3, to: "General Manager", minutes: "30" },
];
const freshLevels = (): Level[] => SEED_LEVELS.map((l) => ({ ...l }));

type Area = { id: number; name: string; minutes: string };

const SEED_AREAS: Area[] = [
  { id: 1, name: "Spa", minutes: "30" },
  { id: 2, name: "Lobby", minutes: "20" },
];

function HousekeepingAreas() {
  const [areas, setAreas] = useState<Area[]>(SEED_AREAS);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Area[]>(SEED_AREAS);
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState("");
  const [confirming, setConfirming] = useState(false);

  const start = () => {
    setDraft(areas.map((a) => ({ ...a })));
    setName("");
    setMinutes("");
    setConfirming(false);
    setEditing(true);
  };

  const add = () => {
    const nextName = name.trim();
    const nextMinutes = minutes.replace(/\D/g, "");
    if (!nextName || !nextMinutes || Number(nextMinutes) < 1) return;
    if (draft.some((a) => a.name.toLowerCase() === nextName.toLowerCase())) return;
    setDraft((list) => [...list, { id: Math.max(0, ...list.map((a) => a.id)) + 1, name: nextName, minutes: nextMinutes }]);
    setName("");
    setMinutes("");
  };

  const timersOk = draft.every((a) => Number(a.minutes) >= 1);

  return (
    <section className="mt-8 max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-ink">Housekeeping areas</h3>
          <p className="mt-1 text-[13px] text-ink-secondary">
            Spaces outside guest rooms, such as the spa or lobby. Each area has one SLA timer, in minutes.
          </p>
        </div>
        {!editing && (
          <Button variant="outline" className="h-9 shrink-0 px-3" onClick={start}>Change</Button>
        )}
      </div>

      {!editing && (
        <div className="mt-3 divide-y divide-line rounded-xl border border-line">
          {areas.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="text-[13px] font-medium text-ink">{a.name}</span>
              <span className="text-[13px] text-ink-secondary">{a.minutes} min</span>
            </div>
          ))}
          {!areas.length && <p className="px-4 py-6 text-center text-[13px] text-ink-tertiary">No areas yet.</p>}
        </div>
      )}

      {editing && (
        <>
          <div className="mt-3 flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); }}
              placeholder="e.g. Spa"
              aria-label="Area name"
            />
            <div className="w-24 shrink-0">
              <Input
                inputMode="numeric"
                aria-label="SLA timer in minutes"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter") add(); }}
                placeholder="min"
              />
            </div>
            <Button
              variant="outline"
              className="h-10 shrink-0 px-3"
              disabled={!name.trim() || !minutes || Number(minutes) < 1}
              onClick={add}
            >
              Add
            </Button>
          </div>
          <div className="mt-3 divide-y divide-line rounded-xl border border-line">
            {draft.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{a.name}</span>
                <div className="w-20 shrink-0">
                  <Input
                    inputMode="numeric"
                    aria-label={`${a.name} SLA timer in minutes`}
                    value={a.minutes}
                    onChange={(e) => {
                      const next = e.target.value.replace(/\D/g, "");
                      setDraft((list) => list.map((x) => (x.id === a.id ? { ...x, minutes: next } : x)));
                    }}
                  />
                </div>
                <span className="shrink-0 text-[12px] text-ink-tertiary">min</span>
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => setDraft((list) => list.filter((x) => x.id !== a.id))}
                  className="shrink-0 rounded-md p-1 text-ink-tertiary hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {!draft.length && <p className="px-3 py-6 text-center text-[13px] text-ink-tertiary">No areas yet.</p>}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setEditing(false); setConfirming(false); }}>Cancel</Button>
            <Button disabled={!timersOk} className="disabled:opacity-40" onClick={() => setConfirming(true)}>Save</Button>
          </div>
        </>
      )}

      {confirming && (
        <Modal
          title="Confirm housekeeping areas"
          onClose={() => setConfirming(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirming(false)}>Back to edit</Button>
              <Button onClick={() => { setAreas(draft.map((a) => ({ ...a }))); setConfirming(false); setEditing(false); }}>Confirm</Button>
            </>
          }
        >
          <p className="text-[13px] text-ink-secondary">These areas and their SLA timers will be saved.</p>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
            {draft.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-3 py-2 text-[13px]">
                <span className="font-medium text-ink">{a.name}</span>
                <span className="text-ink-secondary">{a.minutes} min</span>
              </li>
            ))}
            {!draft.length && <li className="px-3 py-4 text-center text-[13px] text-ink-tertiary">No areas.</li>}
          </ul>
        </Modal>
      )}
    </section>
  );
}

export default function DepartmentDetail() {
  const { slug = "" } = useParams();
  const [search] = useSearchParams();
  const listPath = search.get("from") === "onboarding" ? "/onboarding/departments" : "/departments";
  const dept = getDepartment(slug);

  const [members, setMembers] = useState<DeptMember[]>(dept?.members ?? []);
  const [services, setServices] = useState<DeptService[]>(dept?.services ?? []);
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeptService | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [description, setDescription] = useState(dept?.description ?? "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [sla, setSla] = useState<Record<string, SlaRow>>({});
  const [levels, setLevels] = useState<Level[]>(freshLevels);

  useEffect(() => {
    if (!dept) return;
    setMembers(dept.members);
    setServices(dept.services);
    setDescription(dept.description);
    setSla(Object.fromEntries(dept.services.map((s) => [s.name, blankSla()])));
    setLevels(freshLevels());
  }, [dept]);

  useEffect(() => {
    if (search.get("created")) setToast("Department created");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!dept) return <Navigate to={listPath} replace />;

  const Icon = deptIcon(dept.name);

  const targets = Array.from(new Set([...members.map((m) => m.role).filter((r) => r !== "Line Staff"), "Duty Manager", "General Manager"]));

  const saveService = (s: DeptService, row: SlaRow, editingName?: string) => {
    if (editingName) {
      setServices((ss) => ss.map((x) => (x.name === editingName ? s : x)));
      setSla((rows) => {
        const next = { ...rows };
        if (editingName !== s.name) delete next[editingName];
        next[s.name] = row;
        return next;
      });
      setToast(`"${s.name}" updated`);
    } else {
      setServices((ss) => [...ss, s]);
      setSla((rows) => ({ ...rows, [s.name]: row }));
      setToast(`"${s.name}" added`);
    }
    setModal(null);
  };

  const deleteService = () => {
    if (!deleteTarget) return;
    setServices((ss) => ss.filter((x) => x.name !== deleteTarget.name));
    setSla((rows) => {
      const next = { ...rows };
      delete next[deleteTarget.name];
      return next;
    });
    setToast(`"${deleteTarget.name}" removed`);
    setDeleteTarget(null);
  };

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Department" backTo={listPath} />
        <Page>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand">
              <Icon className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <div className="text-[20px] font-semibold leading-tight text-ink">{dept.name}</div>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-3">
            <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-ink-tertiary">{description || "No description yet."}</p>
            <button
              onClick={() => { setDescDraft(description); setEditingDesc(true); }}
              className="shrink-0 text-[12px] font-semibold text-brand hover:underline"
            >
              {description ? "Edit" : "Add description"}
            </button>
          </div>

          {dept.slug === "housekeeping" && <HousekeepingAreas />}

          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[16px] font-semibold text-ink">Services</h3>
                <button onClick={() => setModal({ mode: "add" })} className="flex items-center gap-1.5 text-[13px] font-medium text-brand">
                  <Plus className="h-4 w-4" /> Add Service
                </button>
              </div>

              <div className="mt-3 overflow-x-auto rounded-xl border border-line">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="bg-[#F4F4F5] text-[11px] uppercase tracking-wide text-ink-secondary">
                      <th className="py-3 pl-4 pr-3 font-medium">Service</th>
                      <th className="py-3 pl-4 pr-3 font-medium">Description</th>
                      <th className="py-3 pl-4 pr-3 font-medium">Service time</th>
                      <th className="py-3 pl-4 pr-3 font-medium">Response</th>
                      <th className="py-3 pl-4 pr-3 font-medium">Resolution</th>
                      <th className="py-3 pl-4 pr-4" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((sv) => {
                      const row = sla[sv.name] ?? blankSla();
                      return (
                        <tr key={sv.name} className="border-t border-line">
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] font-semibold text-ink">{sv.name}</td>
                          <td className="py-3 pl-4 pr-3 text-[13px] leading-relaxed text-ink-secondary">
                            {sv.description || <span className="text-ink-tertiary">—</span>}
                          </td>
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{hoursLabel(row)}</td>
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{row.response} min</td>
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{row.resolve} min</td>
                          <td className="whitespace-nowrap py-3 pl-4 pr-4 text-right">
                            <button
                              onClick={() => setModal({ mode: "edit", service: sv })}
                              aria-label={`Edit ${sv.name}`}
                              className="rounded-md p-1.5 text-ink-tertiary hover:bg-subtle hover:text-ink"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(sv)}
                              aria-label={`Delete ${sv.name}`}
                              className="rounded-md p-1.5 text-ink-tertiary hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {!services.length && (
                      <tr><td colSpan={6} className="py-8 text-center text-[13px] text-ink-tertiary">No services yet — add the first one.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:border-l lg:border-line lg:pl-8">
              <h3 className="text-[16px] font-semibold text-ink">Escalation path</h3>
              <p className="mt-1 text-[12px] text-ink-secondary">When a task in {dept.name} misses its time, it moves up this list. Set the role and the minutes between each step. Up to 3 steps.</p>
              <div className="mt-4">
                {levels.map((l, i) => (
                  <div key={l.id}>
                    <div className="rounded-xl border border-line p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-semibold text-brand">{i + 1}</span>
                        {i === 0 ? (
                          <span className="min-w-0 flex-1 text-[12px] text-ink-secondary">When the task misses its time</span>
                        ) : (
                          <label className="flex min-w-0 flex-1 items-center gap-2 text-[12px] text-ink-secondary">
                            After
                            <span className="w-16 shrink-0">
                              <Input
                                inputMode="numeric"
                                aria-label={`Minutes before step ${i + 1}`}
                                className="h-8 px-2 text-center"
                                value={l.minutes}
                                onChange={(e) => {
                                  const minutes = e.target.value.replace(/\D/g, "");
                                  setLevels((ls) => ls.map((x) => (x.id === l.id ? { ...x, minutes } : x)));
                                }}
                              />
                            </span>
                            min
                          </label>
                        )}
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => setLevels((ls) => ls.filter((x) => x.id !== l.id))}
                            className="shrink-0 rounded-md p-1 text-ink-tertiary hover:bg-red-50 hover:text-red-600"
                            aria-label={`Remove escalation step ${i + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <Select
                        className="mt-3 h-9"
                        aria-label={`Level ${i + 1} escalation target`}
                        value={l.to}
                        onChange={(e) => setLevels((ls) => ls.map((x) => (x.id === l.id ? { ...x, to: e.target.value } : x)))}
                      >
                        {targets.map((t) => <option key={t}>{t}</option>)}
                      </Select>
                    </div>
                    {i < levels.length - 1 && (
                      <div className="flex justify-center py-2 text-ink-tertiary">
                        <ArrowDown className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                {!levels.length && <p className="text-[13px] text-ink-tertiary">No steps on this path.</p>}
                {levels.length < 3 ? (
                  <button
                    type="button"
                    onClick={() => setLevels((ls) => {
                      if (ls.length >= 3) return ls;
                      const id = Math.max(0, ...ls.map((x) => x.id)) + 1;
                      const to = targets.find((t) => !ls.some((x) => x.to === t)) ?? targets[0] ?? "Supervisor";
                      return [...ls, { id, to, minutes: "15" }];
                    })}
                    className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-brand"
                  >
                    <Plus className="h-4 w-4" /> Add step
                  </button>
                ) : (
                  <button type="button" disabled className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-ink-tertiary">
                    <Plus className="h-4 w-4" /> Add step
                  </button>
                )}
                <p className="mt-1 text-[12px] text-ink-tertiary">{levels.length} of 3 steps</p>
              </div>
              <div className="mt-4 flex gap-2.5 rounded-card border border-amber-100 bg-amber-50/60 p-3.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-[12px] text-ink-secondary">This path is the default for every service in the department.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end border-t border-line pt-6">
            <Button onClick={() => setToast("Changes saved")}>
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </Page>
      </div>

      {modal && (
        <ServiceModal
          key={modal.mode === "edit" ? modal.service.name : "new"}
          initial={modal.mode === "edit" ? modal.service : null}
          initialSla={modal.mode === "edit" ? sla[modal.service.name] ?? blankSla() : blankSla()}
          existingNames={services.map((s) => s.name)}
          onClose={() => setModal(null)}
          onSave={(s, row) => saveService(s, row, modal.mode === "edit" ? modal.service.name : undefined)}
        />
      )}

      {deleteTarget && (
        <Modal
          title="Delete service"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button tone="bg-red-600" onClick={deleteService}>Delete service</Button>
            </>
          }
        >
          <p className="text-[13px] text-ink-secondary">
            Remove "{deleteTarget.name}" from {dept.name}? This can't be undone.
          </p>
        </Modal>
      )}

      {editingDesc && (
        <Modal
          title="Edit department description"
          onClose={() => setEditingDesc(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditingDesc(false)}>Cancel</Button>
              <Button
                onClick={() => { setDescription(descDraft.trim()); setEditingDesc(false); setToast("Department description updated"); }}
              >
                Save
              </Button>
            </>
          }
        >
          <Field label="Description">
            <Textarea rows={4} autoFocus value={descDraft} onChange={(e) => setDescDraft(e.target.value)} placeholder="What does this department do?" />
          </Field>
        </Modal>
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-green-400" /> {toast}
          </span>
        </div>
      )}
    </div>
  );
}

function ServiceModal({
  initial, initialSla, existingNames, onClose, onSave,
}: {
  initial: DeptService | null;
  initialSla: SlaRow;
  existingNames: string[];
  onClose: () => void;
  onSave: (s: DeptService, row: SlaRow) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [allDay, setAllDay] = useState(initialSla.hours247);
  const [start, setStart] = useState(initialSla.hoursStart);
  const [end, setEnd] = useState(initialSla.hoursEnd);
  const [response, setResponse] = useState(initialSla.response);
  const [resolve, setResolve] = useState(initialSla.resolve);

  const trimmedName = name.trim();
  const duplicate = trimmedName.toLowerCase() !== (initial?.name ?? "").toLowerCase() && existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase());
  const ok = trimmedName && response.trim() && resolve.trim() && !duplicate;

  return (
    <Modal
      title={initial ? "Edit Service" : "Add Service"}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!ok}
            className="disabled:opacity-40"
            onClick={() =>
              onSave(
                { name: trimmedName, description: description.trim() || undefined, active: true },
                { hours247: allDay, hoursStart: start, hoursEnd: end, response: response.trim(), resolve: resolve.trim() },
              )
            }
          >
            {initial ? "Save Changes" : "Add Service"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Service Name" required hint={duplicate ? "A service with this name already exists." : undefined}>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pillow Menu" />
        </Field>
        <Field label="Description (Optional)">
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this service cover?" />
        </Field>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink-secondary">Service hours</span>
          <div className="flex rounded-full bg-subtle p-0.5 text-[12px] font-medium">
            <button type="button" onClick={() => setAllDay(true)} className={`flex-1 rounded-full py-1.5 ${allDay ? "bg-white text-ink shadow-sm" : "text-ink-secondary"}`}>All day</button>
            <button type="button" onClick={() => setAllDay(false)} className={`flex-1 rounded-full py-1.5 ${!allDay ? "bg-white text-ink shadow-sm" : "text-ink-secondary"}`}>Set hours</button>
          </div>
          {!allDay && (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <Field label="Starts"><Input type="time" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
              <Field label="Ends"><Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Response Target (min)" required><Input value={response} onChange={(e) => setResponse(e.target.value)} placeholder="e.g. 20" /></Field>
          <Field label="Resolve Target (min)" required><Input value={resolve} onChange={(e) => setResolve(e.target.value)} placeholder="e.g. 90" /></Field>
        </div>
      </div>
    </Modal>
  );
}
