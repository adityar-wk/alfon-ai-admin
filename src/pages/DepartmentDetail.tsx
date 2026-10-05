import { Fragment, useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  CheckCircle2,
  Check,
  Trash2,
  Lightbulb,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Button, Field, Input, Textarea, Modal, Select, Toggle } from "../components/ui";
import { getDepartment, type DeptMember, type DeptService } from "../data/departments";
import { deptIcon } from "../data/deptIcons";

type SlaRow = { hours247: boolean; hoursStart: string; hoursEnd: string; response: string; resolve: string };
type Level = { id: number; trigger: string; to: string };
type ServicePath = { enabled: boolean; levels: Level[] };
type ModalState = { mode: "add" } | { mode: "edit"; service: DeptService } | null;

const blankSla = (): SlaRow => ({ hours247: true, hoursStart: "09:00", hoursEnd: "18:00", response: "20", resolve: "90" });
const hoursLabel = (row: SlaRow) => (row.hours247 ? "Open all day" : `${row.hoursStart} – ${row.hoursEnd}`);

const SEED_LEVELS: Level[] = [
  { id: 1, trigger: "Escalation", to: "Supervisor" },
  { id: 2, trigger: "+15 min after Level 1", to: "Department Head" },
  { id: 3, trigger: "+30 min after Level 2", to: "General Manager" },
];
const freshPath = (): ServicePath => ({ enabled: true, levels: SEED_LEVELS.map((l) => ({ ...l })) });

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
  const [managerName, setManagerName] = useState<string | null>(null); // set once the manager is edited or added
  const [editingManager, setEditingManager] = useState(false);
  const [managerDraft, setManagerDraft] = useState("");
  const [description, setDescription] = useState(dept?.description ?? "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [sla, setSla] = useState<Record<string, SlaRow>>({});
  const [paths, setPaths] = useState<Record<string, ServicePath>>({});
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set());
  const togglePath = (name: string) =>
    setOpenPaths((s) => {
      const next = new Set(s);
      if (!next.delete(name)) next.add(name);
      return next;
    });

  useEffect(() => {
    if (!dept) return;
    setMembers(dept.members);
    setServices(dept.services);
    setDescription(dept.description);
    setSla(Object.fromEntries(dept.services.map((s) => [s.name, blankSla()])));
    setPaths(Object.fromEntries(dept.services.map((s) => [s.name, freshPath()])));
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

  const head = managerName ?? members.find((m) => m.role === "Department Head")?.name ?? "";
  const Icon = deptIcon(dept.name);

  const targets = Array.from(new Set([...members.map((m) => m.role).filter((r) => r !== "Line Staff"), "Duty Manager", "General Manager"]));
  const pathOf = (name: string) => paths[name] ?? freshPath();
  const setPath = (name: string, next: ServicePath) => setPaths((ps) => ({ ...ps, [name]: next }));

  const saveService = (s: DeptService, row: SlaRow, editingName?: string) => {
    if (editingName) {
      setServices((ss) => ss.map((x) => (x.name === editingName ? s : x)));
      setSla((rows) => {
        const next = { ...rows };
        if (editingName !== s.name) delete next[editingName];
        next[s.name] = row;
        return next;
      });
      setPaths((ps) => {
        const next = { ...ps };
        const prev = next[editingName] ?? freshPath();
        if (editingName !== s.name) delete next[editingName];
        next[s.name] = prev;
        return next;
      });
      setToast(`"${s.name}" updated`);
    } else {
      setServices((ss) => [...ss, s]);
      setSla((rows) => ({ ...rows, [s.name]: row }));
      setPaths((ps) => ({ ...ps, [s.name]: freshPath() }));
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
    setPaths((ps) => {
      const next = { ...ps };
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
              <div className="mt-0.5 flex items-center gap-2 text-[13px] text-ink-secondary">
                <span>Department Manager · {head || "—"}</span>
                <button
                  onClick={() => { setManagerDraft(head); setEditingManager(true); }}
                  className="text-[12px] font-semibold text-brand hover:underline"
                >
                  {head ? "Edit" : "Add manager"}
                </button>
              </div>
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

          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[16px] font-semibold text-ink">Services</h3>
              <button onClick={() => setModal({ mode: "add" })} className="flex items-center gap-1.5 text-[13px] font-medium text-brand">
                <Plus className="h-4 w-4" /> Add Service
              </button>
            </div>
            <div className="mt-2 flex gap-2.5 rounded-card border border-amber-100 bg-amber-50/60 p-3.5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-[12px] text-ink-secondary">Each service has its own escalation path. Turn it off to keep a missed task with the assignee.</p>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="bg-[#F4F4F5] text-[11px] uppercase tracking-wide text-ink-secondary">
                    <th className="py-3 pl-4 pr-3 font-medium">Service</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Description</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Service time</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Response</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Resolution</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Escalation</th>
                    <th className="py-3 pl-4 pr-4" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {services.map((sv) => {
                    const row = sla[sv.name] ?? blankSla();
                    const path = paths[sv.name] ?? freshPath();
                    const setPath = (next: ServicePath) => setPaths((ps) => ({ ...ps, [sv.name]: next }));
                    return (
                      <Fragment key={sv.name}>
                        <tr className="border-t-2 border-line first:border-t-0">
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] font-semibold text-ink">{sv.name}</td>
                          <td className="py-3 pl-4 pr-3 text-[13px] leading-relaxed text-ink-secondary">
                            {sv.description || <span className="text-ink-tertiary">—</span>}
                          </td>
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{hoursLabel(row)}</td>
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{row.response} min</td>
                          <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{row.resolve} min</td>
                          <td className="py-3 pl-4 pr-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setPath({ ...path, enabled: !path.enabled })}
                                aria-pressed={path.enabled}
                                aria-label={`${path.enabled ? "Disable" : "Enable"} escalation for ${sv.name}`}
                                className="inline-flex shrink-0 items-center gap-2"
                              >
                                <Toggle checked={path.enabled} />
                                <span className="w-5 text-[12px] font-medium text-ink-secondary">{path.enabled ? "On" : "Off"}</span>
                              </button>
                              {path.enabled && (
                                <button
                                  type="button"
                                  onClick={() => togglePath(sv.name)}
                                  aria-expanded={openPaths.has(sv.name)}
                                  aria-label={`${openPaths.has(sv.name) ? "Hide" : "Edit"} escalation path for ${sv.name}`}
                                  className="flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-ink-secondary hover:bg-subtle hover:text-ink"
                                >
                                  <span className="max-w-[300px] truncate whitespace-nowrap">
                                    {path.levels.length ? path.levels.map((l) => l.to).join(" → ") : "No steps"}
                                  </span>
                                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${openPaths.has(sv.name) ? "rotate-180" : ""}`} />
                                </button>
                              )}
                            </div>
                          </td>
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
                        {path.enabled && openPaths.has(sv.name) && (
                          <tr key={`${sv.name}-path`} className="bg-[#FAFAFA]">
                            <td colSpan={7} className="border-l-2 border-brand px-4 py-2.5">
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Escalates to</span>
                                {path.levels.map((l, i) => (
                                  <Fragment key={l.id}>
                                    {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-tertiary" />}
                                    <div className="flex items-center gap-1.5 rounded-lg border border-line bg-white py-1 pl-1.5 pr-1" title={l.trigger}>
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[10px] font-semibold text-brand">{i + 1}</span>
                                      <Select
                                        className="!h-7 !w-[160px] !py-0 !text-[12px]"
                                        aria-label={`Level ${i + 1} escalation target for ${sv.name}`}
                                        value={l.to}
                                        onChange={(e) => setPath({ ...path, levels: path.levels.map((x) => (x.id === l.id ? { ...x, to: e.target.value } : x)) })}
                                      >
                                        {targets.map((t) => <option key={t}>{t}</option>)}
                                      </Select>
                                      <button
                                        onClick={() => setPath({ ...path, levels: path.levels.filter((x) => x.id !== l.id) })}
                                        className="rounded p-1 text-ink-tertiary hover:bg-red-50 hover:text-danger"
                                        aria-label={`Remove escalation step ${i + 1} for ${sv.name}`}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </Fragment>
                                ))}
                                {!path.levels.length && <span className="text-[12px] text-ink-tertiary">No steps on this path.</span>}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {!services.length && (
                    <tr><td colSpan={7} className="py-8 text-center text-[13px] text-ink-tertiary">No services yet — add the first one.</td></tr>
                  )}
                </tbody>
                </table>
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

      {editingManager && (
        <Modal
          title={head ? "Edit department manager" : "Add department manager"}
          onClose={() => setEditingManager(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditingManager(false)}>Cancel</Button>
              <Button
                disabled={!managerDraft.trim()}
                onClick={() => { setManagerName(managerDraft.trim()); setEditingManager(false); setToast("Department manager updated"); }}
              >
                Save
              </Button>
            </>
          }
        >
          <Field label="Manager name" required>
            <Input list="dept-staff" autoFocus value={managerDraft} onChange={(e) => setManagerDraft(e.target.value)} placeholder="Pick from the team or type a name" />
            <datalist id="dept-staff">{members.map((m) => <option key={m.name} value={m.name} />)}</datalist>
          </Field>
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
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast}
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
