import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  Check,
  Trash2,
  ArrowDown,
  Lightbulb,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Button, Field, Input, Textarea, Modal, Select } from "../components/ui";
import { getDepartment, type DeptMember, type DeptService } from "../data/departments";
import { deptIcon } from "../data/deptIcons";

type SlaRow = { hours247: boolean; hoursStart: string; hoursEnd: string; response: string; resolve: string };
type Level = { id: number; trigger: string; to: string };

const blankSla = (): SlaRow => ({ hours247: true, hoursStart: "09:00", hoursEnd: "18:00", response: "20", resolve: "90" });

const SEED_LEVELS: Level[] = [
  { id: 1, trigger: "Escalation", to: "Supervisor" },
  { id: 2, trigger: "+15 min after Level 1", to: "Department Head" },
  { id: 3, trigger: "+30 min after Level 2", to: "General Manager" },
];

function ServiceHours({
  allDay,
  start,
  end,
  onChange,
}: {
  allDay: boolean;
  start: string;
  end: string;
  onChange: (patch: Partial<Pick<SlaRow, "hours247" | "hoursStart" | "hoursEnd">>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[12px] font-medium text-ink-secondary underline decoration-[#E5E5E5] underline-offset-2 hover:text-ink"
      >
        {allDay ? "Open all day" : `${start} – ${end}`}
      </button>
      {open && (
        <>
          <button aria-label="Close hours" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-6 z-20 w-56 overflow-hidden rounded-xl border border-line bg-white p-3 shadow-lg">
            <div className="flex rounded-full bg-[#F7F7F7] p-0.5 text-[12px] font-medium">
              <button type="button" onClick={() => onChange({ hours247: true })} className={`flex-1 rounded-full py-1 ${allDay ? "bg-white text-ink shadow-sm" : "text-ink-secondary"}`}>All day</button>
              <button type="button" onClick={() => onChange({ hours247: false })} className={`flex-1 rounded-full py-1 ${!allDay ? "bg-white text-ink shadow-sm" : "text-ink-secondary"}`}>Set hours</button>
            </div>
            {!allDay && (
              <div className="mt-3 space-y-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] text-ink-tertiary">Starts</span>
                  <Input type="time" className="h-9 w-full min-w-0 px-2 text-[12px]" value={start} onChange={(e) => onChange({ hoursStart: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-ink-tertiary">Ends</span>
                  <Input type="time" className="h-9 w-full min-w-0 px-2 text-[12px]" value={end} onChange={(e) => onChange({ hoursEnd: e.target.value })} />
                </label>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function DepartmentDetail() {
  const { slug = "" } = useParams();
  const [search] = useSearchParams();
  const listPath = search.get("from") === "onboarding" ? "/onboarding/departments" : "/departments";
  const dept = getDepartment(slug);

  const [members, setMembers] = useState<DeptMember[]>(dept?.members ?? []);
  const [services, setServices] = useState<DeptService[]>(dept?.services ?? []);
  const [addingService, setAddingService] = useState(false);
  const [newService, setNewService] = useState({ name: "", description: "" });
  const [toast, setToast] = useState<string | null>(null);
  const [managerName, setManagerName] = useState<string | null>(null); // set once the manager is edited or added
  const [editingManager, setEditingManager] = useState(false);
  const [managerDraft, setManagerDraft] = useState("");
  const [description, setDescription] = useState(dept?.description ?? "");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [editingService, setEditingService] = useState<string | null>(null);
  const [serviceDescDraft, setServiceDescDraft] = useState("");
  const [sla, setSla] = useState<Record<string, SlaRow>>({});
  const [levels, setLevels] = useState<Level[]>(() => SEED_LEVELS.map((l) => ({ ...l })));

  useEffect(() => {
    if (!dept) return;
    setMembers(dept.members);
    setServices(dept.services);
    setDescription(dept.description);
    setSla(Object.fromEntries(dept.services.map((s) => [s.name, blankSla()])));
    setLevels(SEED_LEVELS.map((l) => ({ ...l })));
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

  const addService = () => {
    if (!newService.name.trim()) return;
    const name = newService.name.trim();
    setServices((s) => [
      ...s,
      { name, description: newService.description.trim() || undefined, active: true },
    ]);
    setSla((rows) => ({ ...rows, [name]: blankSla() }));
    setNewService({ name: "", description: "" });
    setAddingService(false);
  };

  const patchSla = (name: string, patch: Partial<SlaRow>) =>
    setSla((rows) => ({ ...rows, [name]: { ...(rows[name] ?? blankSla()), ...patch } }));

  const targets = Array.from(new Set([...members.map((m) => m.role).filter((r) => r !== "Line Staff"), "Duty Manager", "General Manager"]));

  const saveServiceDesc = (name: string) => {
    setServices((s) => s.map((sv) => (sv.name === name ? { ...sv, description: serviceDescDraft.trim() || undefined } : sv)));
    setEditingService(null);
    setToast("Service description updated");
  };

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Department"
          backTo={listPath}
          actions={
            <Button onClick={() => setToast("Changes saved")}>
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          }
        />
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

          <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 max-w-3xl">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[16px] font-semibold text-ink">Services</h3>
                <button onClick={() => setAddingService((v) => !v)} className="flex items-center gap-1.5 text-[13px] font-medium text-brand">
                  <Plus className="h-4 w-4" /> Add Service
                </button>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full table-fixed text-left">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col />
                    <col className="w-[7rem]" />
                    <col className="w-[4.5rem]" />
                    <col className="w-[4.5rem]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                      <th className="pb-3 font-medium">Service</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">Service time</th>
                      <th className="pb-3 text-center font-medium">
                        Response
                        <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-ink-tertiary">min</span>
                      </th>
                      <th className="pb-3 text-center font-medium">
                        Resolution
                        <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-ink-tertiary">min</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((sv) => {
                      const row = sla[sv.name] ?? blankSla();
                      const editing = editingService === sv.name;
                      return (
                        <tr key={sv.name} className="border-b border-line/60 align-top last:border-0">
                          <td className="py-3 pr-3 text-[14px] font-medium text-ink">{sv.name}</td>
                          <td className="py-3 pr-3">
                            {editing ? (
                              <div className="space-y-2">
                                <Textarea
                                  autoFocus
                                  rows={2}
                                  placeholder="What does this service cover?"
                                  value={serviceDescDraft}
                                  onChange={(e) => setServiceDescDraft(e.target.value)}
                                />
                                <div className="flex gap-2">
                                  <Button className="h-8 px-3 text-[12px]" onClick={() => saveServiceDesc(sv.name)}>Save</Button>
                                  <Button variant="outline" className="h-8 px-3 text-[12px]" onClick={() => setEditingService(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingService(sv.name); setServiceDescDraft(sv.description ?? ""); }}
                                className="text-left text-[13px] leading-relaxed text-ink-secondary hover:text-ink"
                              >
                                {sv.description || <span className="text-ink-tertiary">Add description</span>}
                              </button>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <ServiceHours
                              allDay={row.hours247}
                              start={row.hoursStart}
                              end={row.hoursEnd}
                              onChange={(patch) => patchSla(sv.name, patch)}
                            />
                          </td>
                          <td className="py-3">
                            <Input className="h-9 px-1 text-center" value={row.response} onChange={(e) => patchSla(sv.name, { response: e.target.value })} />
                          </td>
                          <td className="py-3 pl-2">
                            <Input className="h-9 px-1 text-center" value={row.resolve} onChange={(e) => patchSla(sv.name, { resolve: e.target.value })} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {!services.length && <p className="py-6 text-center text-[13px] text-ink-tertiary">No services added yet.</p>}
              </div>

              {addingService && (
                <div className="mt-3 max-w-lg space-y-3 rounded-lg border border-line bg-subtle p-4">
                  <Field label="Service Name" required>
                    <Input autoFocus placeholder="e.g. Pillow Menu" value={newService.name} onChange={(e) => setNewService((sv) => ({ ...sv, name: e.target.value }))} />
                  </Field>
                  <Field label="Description (Optional)">
                    <Textarea rows={2} placeholder="What does this service cover?" value={newService.description} onChange={(e) => setNewService((sv) => ({ ...sv, description: e.target.value }))} />
                  </Field>
                  <div className="flex gap-2">
                    <Button onClick={addService}>Add</Button>
                    <Button variant="outline" onClick={() => setAddingService(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="xl:border-l xl:border-line xl:pl-8">
              <h4 className="text-[16px] font-semibold text-ink">Escalation path</h4>
              <p className="mt-1 text-[12px] text-ink-secondary">When a task misses its time, it moves up this list.</p>
              <div className="mt-4">
                {levels.map((l, i) => (
                  <div key={l.id}>
                    <div className="rounded-xl border border-line p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-semibold text-brand">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 text-[12px] text-ink-secondary">{l.trigger}</span>
                        <button
                          onClick={() => setLevels((ls) => ls.filter((x) => x.id !== l.id))}
                          className="text-ink-tertiary hover:text-danger"
                          aria-label="Remove escalation step"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Select
                        className="mt-3 h-9"
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
              </div>
              <div className="mt-4 flex gap-2.5 rounded-card border border-amber-100 bg-amber-50/60 p-3.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-[12px] text-ink-secondary">Tasks inherit the SLA of the service they belong to.</p>
              </div>
            </div>
          </div>
        </Page>
      </div>

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
