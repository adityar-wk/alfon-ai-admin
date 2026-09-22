import { useState } from "react";
import { Plus, Trash2, CheckCircle2, ArrowDown, Lightbulb } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card, Button, Input, Select } from "../components/ui";
import { DEPARTMENTS } from "../data/departments";

type Priority = "Urgent" | "High" | "Medium" | "Low";
type Target = { response: string; resolve: string };

const PRIORITY_META: Record<Priority, { desc: string; dot: string; text: string; card: string }> = {
  Urgent: { desc: "Safety, VIP or guest-blocking issues", dot: "bg-red-500", text: "text-red-600", card: "border-red-100 bg-red-50/40" },
  High: { desc: "Time-sensitive guest requests", dot: "bg-orange-500", text: "text-orange-600", card: "border-orange-100 bg-orange-50/40" },
  Medium: { desc: "Standard service requests", dot: "bg-amber-500", text: "text-amber-600", card: "border-amber-100 bg-amber-50/40" },
  Low: { desc: "Routine, non-urgent tasks", dot: "bg-emerald-500", text: "text-emerald-600", card: "border-emerald-100 bg-emerald-50/40" },
};
const PRIORITIES = Object.keys(PRIORITY_META) as Priority[];

const DEFAULTS: Record<Priority, Target> = {
  Urgent: { response: "5", resolve: "20" },
  High: { response: "10", resolve: "45" },
  Medium: { response: "20", resolve: "90" },
  Low: { response: "40", resolve: "180" },
};

type Level = { id: number; trigger: string; to: string };
const SEED_LEVELS: Level[] = [
  { id: 1, trigger: "SLA breached", to: "Department Supervisor" },
  { id: 2, trigger: "+15 min after Level 1", to: "Department Head" },
  { id: 3, trigger: "+30 min after Level 2", to: "General Manager" },
];

type ServiceSla = { priority: Priority } & Target;
type SlaMap = Record<string, ServiceSla>;

function seedSla(): SlaMap {
  const map: SlaMap = {};
  for (const dept of DEPARTMENTS) {
    for (const s of dept.services) {
      map[`${dept.slug}::${s.name}`] = { priority: "Medium", ...DEFAULTS.Medium };
    }
  }
  return map;
}

export default function SlaSetup() {
  const [defaults, setDefaults] = useState(DEFAULTS);
  const [deptSlug, setDeptSlug] = useState(DEPARTMENTS[0].slug);
  const [sla, setSla] = useState<SlaMap>(seedSla);
  const [levels, setLevels] = useState(SEED_LEVELS);
  const [toast, setToast] = useState<string | null>(null);

  const dept = DEPARTMENTS.find((d) => d.slug === deptSlug)!;
  const key = (service: string, slug = deptSlug) => `${slug}::${service}`;

  const isCustom = (slug: string, service: string) => {
    const r = sla[key(service, slug)];
    const d = defaults[r.priority];
    return r.response !== d.response || r.resolve !== d.resolve;
  };
  const customCount = (slug: string) =>
    DEPARTMENTS.find((d) => d.slug === slug)!.services.filter((s) => isCustom(slug, s.name)).length;

  const update = (service: string, patch: Partial<ServiceSla>) =>
    setSla((s) => ({ ...s, [key(service)]: { ...s[key(service)], ...patch } }));

  const setPriority = (service: string, priority: Priority) =>
    update(service, { priority, ...defaults[priority] });

  const addLevel = () =>
    setLevels((l) => [...l, { id: Date.now(), trigger: "+30 min after previous level", to: "General Manager" }]);

  const save = () => {
    setToast("SLA settings saved");
    window.setTimeout(() => setToast(null), 2000);
  };

  return (
    <>
      <Topbar title="SLA & Escalation Setup" backTo="/onboarding" />
      <Page>
        <SetupTabs />
        <p className="mb-5 text-[13px] text-ink-secondary">
          Define response times, service SLAs, and escalation paths.
        </p>

        {/* Priority defaults — one compact card per priority */}
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Default SLA by Priority</h3>
          <span className="text-[12px] text-ink-tertiary">
            Applied to any task without a service-level override
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PRIORITIES.map((p) => {
            const m = PRIORITY_META[p];
            return (
              <div key={p} className={`rounded-card border p-4 ${m.card}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${m.dot}`} />
                  <span className={`text-[14px] font-semibold ${m.text}`}>{p}</span>
                </div>
                <p className="mt-1 text-[12px] text-ink-secondary">{m.desc}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label>
                    <span className="mb-1 block text-[11px] text-ink-secondary">First response</span>
                    <span className="relative block">
                      <Input
                        value={defaults[p].response}
                        onChange={(e) =>
                          setDefaults((d) => ({ ...d, [p]: { ...d[p], response: e.target.value } }))
                        }
                        className="pr-10 bg-white"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-tertiary">
                        min
                      </span>
                    </span>
                  </label>
                  <label>
                    <span className="mb-1 block text-[11px] text-ink-secondary">Resolve within</span>
                    <span className="relative block">
                      <Input
                        value={defaults[p].resolve}
                        onChange={(e) =>
                          setDefaults((d) => ({ ...d, [p]: { ...d[p], resolve: e.target.value } }))
                        }
                        className="pr-10 bg-white"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-tertiary">
                        min
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Service SLAs (left) + Escalation (right) */}
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h3 className="text-[15px] font-semibold text-ink">Service-Level SLA</h3>
              <p className="text-[12px] text-ink-secondary">
                Override the defaults for a specific service under a department.
              </p>
            </div>

            <div className="grid md:grid-cols-[210px_minmax(0,1fr)]">
              <div className="border-b border-line p-2 md:border-b-0 md:border-r">
                <div className="flex gap-1 overflow-x-auto md:max-h-[420px] md:flex-col md:overflow-y-auto">
                  {DEPARTMENTS.map((d) => {
                    const n = customCount(d.slug);
                    const active = d.slug === deptSlug;
                    return (
                      <button
                        key={d.slug}
                        onClick={() => setDeptSlug(d.slug)}
                        className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] ${
                          active
                            ? "bg-brand-tint font-semibold text-brand"
                            : "text-ink-secondary hover:bg-subtle hover:text-ink"
                        }`}
                      >
                        <span className="whitespace-nowrap">{d.name}</span>
                        <span className="flex items-center gap-1.5 text-[11px]">
                          {n > 0 && (
                            <span className="rounded-full bg-brand px-1.5 py-0.5 font-semibold text-white">
                              {n}
                            </span>
                          )}
                          <span className={active ? "text-brand/70" : "text-ink-tertiary"}>
                            {d.services.length}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-w-0 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[14px] font-semibold text-ink">{dept.name}</div>
                  <div className="text-[12px] text-ink-tertiary">
                    {dept.services.length} services · {customCount(deptSlug)} customised
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left">
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                        <th className="pb-2 font-medium">Service</th>
                        <th className="pb-2 font-medium">Priority</th>
                        <th className="pb-2 font-medium">Response</th>
                        <th className="pb-2 font-medium">Resolve</th>
                        <th className="pb-2 text-right font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dept.services.map((s) => {
                        const row = sla[key(s.name)];
                        const custom = isCustom(deptSlug, s.name);
                        return (
                          <tr key={s.name} className="border-b border-line/70">
                            <td className="py-2.5 pr-3 text-[13px] font-medium text-ink">{s.name}</td>
                            <td className="py-2.5 pr-2">
                              <Select
                                className="h-9 w-28"
                                value={row.priority}
                                onChange={(e) => setPriority(s.name, e.target.value as Priority)}
                              >
                                {PRIORITIES.map((p) => (
                                  <option key={p}>{p}</option>
                                ))}
                              </Select>
                            </td>
                            <td className="py-2.5 pr-2">
                              <Input
                                className="h-9 w-16 text-center"
                                value={row.response}
                                onChange={(e) => update(s.name, { response: e.target.value })}
                              />
                            </td>
                            <td className="py-2.5 pr-2">
                              <Input
                                className="h-9 w-16 text-center"
                                value={row.resolve}
                                onChange={(e) => update(s.name, { resolve: e.target.value })}
                              />
                            </td>
                            <td className="py-2.5 text-right">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  custom
                                    ? "bg-brand-tint text-brand"
                                    : "bg-gray-100 text-ink-tertiary"
                                }`}
                              >
                                {custom ? "Custom" : "Default"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-[11px] text-ink-tertiary">
                  Times in minutes. Changing priority resets a service to that priority&apos;s default.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Escalation Path</h3>
                <button
                  onClick={addLevel}
                  className="flex items-center gap-1 text-[13px] font-medium text-brand"
                >
                  <Plus className="h-4 w-4" /> Add Level
                </button>
              </div>
              <p className="mb-4 mt-1 text-[12px] text-ink-secondary">
                When a task breaches its SLA, escalate in this order.
              </p>

              <div>
                {levels.map((l, i) => (
                  <div key={l.id}>
                    <div className="rounded-lg border border-line p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-tint text-[11px] font-semibold text-brand">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-[12px] text-ink-secondary">{l.trigger}</span>
                        <button
                          onClick={() => setLevels((ls) => ls.filter((x) => x.id !== l.id))}
                          className="text-ink-tertiary hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <Select
                        className="mt-2.5 h-9"
                        value={l.to}
                        onChange={(e) =>
                          setLevels((ls) =>
                            ls.map((x) => (x.id === l.id ? { ...x, to: e.target.value } : x)),
                          )
                        }
                      >
                        <option>Department Supervisor</option>
                        <option>Department Head</option>
                        <option>General Manager</option>
                      </Select>
                    </div>
                    {i < levels.length - 1 && (
                      <div className="flex justify-center py-1 text-ink-tertiary">
                        <ArrowDown className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-3 rounded-card border border-amber-100 bg-amber-50/60 p-4">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-[12px] text-ink-secondary">
                Tasks inherit the SLA of the service they belong to. If a service isn&apos;t
                customised, the default for its priority applies.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={save}>Continue →</Button>
              <Button variant="outline" onClick={save}>
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </Page>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast}
          </span>
        </div>
      )}
    </>
  );
}
