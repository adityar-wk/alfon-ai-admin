import { useState } from "react";
import { Plus, Trash2, CheckCircle2, ArrowDown, Lightbulb } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card, Button, Input, Select } from "../components/ui";
import { DEPARTMENTS } from "../data/departments";

type Priority = "Urgent" | "High" | "Medium" | "Low";
type Target = { response: string; resolve: string };

const PRIORITY_META: Record<Priority, { desc: string; dot: string; text: string; card: string }> = {
  Urgent: { desc: "Safety or guest-blocking issues", dot: "bg-red-500", text: "text-red-600", card: "border-red-100 bg-red-50/40" },
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

        {/* Service SLAs (left) + Escalation (right) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden">
            <div className="border-b border-line px-8 py-6">
              <h3 className="text-[16px] font-semibold text-ink">Service-Level SLA</h3>
              <p className="text-[12px] text-ink-secondary">
                Override the defaults for a specific service under a department.
              </p>
            </div>

            <div className="grid md:grid-cols-[210px_minmax(0,1fr)]">
              <div className="border-b border-line p-4 md:border-b-0 md:border-r">
                <div className="flex gap-2 overflow-x-auto md:flex-col">
                  {DEPARTMENTS.map((d) => {
                    const n = customCount(d.slug);
                    const active = d.slug === deptSlug;
                    return (
                      <button
                        key={d.slug}
                        onClick={() => setDeptSlug(d.slug)}
                        className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-4 py-3.5 text-left text-[13px] ${
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

              <div className="min-w-0 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-[16px] font-semibold text-ink">{dept.name}</div>
                  <div className="text-[12px] text-ink-tertiary">
                    {dept.services.length} services · {customCount(deptSlug)} customised
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left">
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                        <th className="pb-4 font-medium">Service</th>
                        <th className="pb-4 font-medium">Response (min)</th>
                        <th className="pb-4 font-medium">Resolve (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dept.services.map((s) => {
                        const row = sla[key(s.name)];
                        const custom = isCustom(deptSlug, s.name);
                        return (
                          <tr key={s.name} className="border-b border-line/60 last:border-0">
                            <td className="py-6 pr-4 text-[14px] font-medium text-ink">{s.name}</td>
                            <td className="py-6 pr-4">
                              <Input
                                className="h-10 w-24 text-center"
                                value={row.response}
                                onChange={(e) => update(s.name, { response: e.target.value })}
                              />
                            </td>
                            <td className="py-6">
                              <Input
                                className="h-10 w-24 text-center"
                                value={row.resolve}
                                onChange={(e) => update(s.name, { resolve: e.target.value })}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-6 text-[12px] text-ink-tertiary">
                  Response is the time to first reply; resolve is the time to close the task.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-7">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-ink">Escalation Path</h3>
                <button
                  onClick={addLevel}
                  className="flex items-center gap-1 text-[13px] font-medium text-brand"
                >
                  <Plus className="h-4 w-4" /> Add Level
                </button>
              </div>
              <p className="mb-7 mt-1.5 text-[12px] text-ink-secondary">
                When a task breaches its SLA, escalate in this order.
              </p>

              <div>
                {levels.map((l, i) => (
                  <div key={l.id}>
                    <div className="rounded-xl border border-line p-5">
                      <div className="flex items-center gap-3">
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
                        className="mt-4 h-10"
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
                      <div className="flex justify-center py-3 text-ink-tertiary">
                        <ArrowDown className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-3 rounded-card border border-amber-100 bg-amber-50/60 p-5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p className="text-[12px] text-ink-secondary">
                Tasks inherit the SLA of the service they belong to.
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
