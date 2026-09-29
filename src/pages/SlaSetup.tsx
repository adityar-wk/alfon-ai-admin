import { useState } from "react";
import { Trash2, CheckCircle2, ArrowDown, Lightbulb } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card, Button, Input, Select } from "../components/ui";
import { DEPARTMENTS, type Department } from "../data/departments";
import { useGoNextStep } from "../data/onboarding";

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
  { id: 1, trigger: "Escalation", to: "Supervisor" },
  { id: 2, trigger: "+15 min after Level 1", to: "Department Head" },
  { id: 3, trigger: "+30 min after Level 2", to: "General Manager" },
];

/** who a department can escalate to — its own roles (never Line Staff), then the two hotel-wide roles above every department */
const escalationTargets = (d: Department) => {
  const own = Array.from(new Set(d.members.map((m) => m.role))).filter((r) => r !== "Line Staff");
  return [...own, "Duty Manager", "General Manager"];
};

type ServiceSla = { priority: Priority; hours247: boolean; hoursStart: string; hoursEnd: string } & Target;
type SlaMap = Record<string, ServiceSla>;

function seedSla(): SlaMap {
  const map: SlaMap = {};
  for (const dept of DEPARTMENTS) {
    for (const s of dept.services) {
      map[`${dept.slug}::${s.name}`] = { priority: "Medium", hours247: true, hoursStart: "09:00", hoursEnd: "18:00", ...DEFAULTS.Medium };
    }
  }
  return map;
}

export default function SlaSetup() {
  const goNext = useGoNextStep(7);
  const [defaults, setDefaults] = useState(DEFAULTS);
  const [deptSlug, setDeptSlug] = useState(DEPARTMENTS[0].slug);
  const [sla, setSla] = useState<SlaMap>(seedSla);
  const [levelsByDept, setLevelsByDept] = useState<Record<string, Level[]>>(() =>
    Object.fromEntries(DEPARTMENTS.map((d) => [d.slug, SEED_LEVELS.map((l) => ({ ...l }))])),
  );
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"sla" | "escalation">("sla");

  const dept = DEPARTMENTS.find((d) => d.slug === deptSlug)!;
  const levels = levelsByDept[deptSlug];
  const setLevels = (updater: (ls: Level[]) => Level[]) =>
    setLevelsByDept((byDept) => ({ ...byDept, [deptSlug]: updater(byDept[deptSlug]) }));
  const targets = escalationTargets(dept);
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

  const save = () => {
    goNext();
  };

  return (
    <>
      <Topbar title="SLA & Escalation Setup" backTo="/onboarding" />
      <Page>
        <SetupTabs />

        {/* SLA / Escalation sub-tabs — each gets the full width to breathe */}
        <div className="mb-5 flex items-center gap-6 border-b border-line">
          {([["sla", "SLA"], ["escalation", "Escalation"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`-mb-px border-b-2 pb-3 text-[14px] font-medium transition-colors ${
                tab === k ? "border-brand font-semibold text-ink" : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          {tab === "sla" ? (
            <div className="border-b border-line px-8 py-6">
              <h3 className="text-[16px] font-semibold text-ink">Service-Level SLA</h3>
              <p className="text-[12px] text-ink-secondary">
                Override the defaults for a specific service under a department.
              </p>
            </div>
          ) : (
            <div className="border-b border-line px-8 py-6">
              <h3 className="text-[16px] font-semibold text-ink">Escalation Path</h3>
              <p className="text-[12px] text-ink-secondary">
                When a task breaches its SLA, escalate in this order. Every department sets its own path.
              </p>
            </div>
          )}

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
                        {tab === "sla" && n > 0 && (
                          <span className="rounded-full bg-brand px-1.5 py-0.5 font-semibold text-white">
                            {n}
                          </span>
                        )}
                        <span className={active ? "text-brand/70" : "text-ink-tertiary"}>
                          {tab === "sla" ? d.services.length : levelsByDept[d.slug].length}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {tab === "sla" ? (
              <div className="min-w-0 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-[16px] font-semibold text-ink">{dept.name}</div>
                  <div className="text-[12px] text-ink-tertiary">
                    {dept.services.length} services · {customCount(deptSlug)} customised
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                        <th className="pb-4 font-medium">Service</th>
                        <th className="pb-4 pr-4 font-medium">Service Hours</th>
                        <th className="pb-4 font-medium">Response (min)</th>
                        <th className="pb-4 font-medium">Resolve (min)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dept.services.map((s) => {
                        const row = sla[key(s.name)];
                        return (
                          <tr key={s.name} className="border-b border-line/60 last:border-0">
                            <td className="py-6 pr-4 text-[14px] font-medium text-ink">{s.name}</td>
                            <td className="py-6 pr-4">
                              <div className="flex items-center gap-3">
                                <label className="flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-ink-secondary">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-brand"
                                    checked={row.hours247}
                                    onChange={(e) => update(s.name, { hours247: e.target.checked })}
                                  />
                                  24/7
                                </label>
                                {!row.hours247 && (
                                  <div className="flex items-center gap-1.5">
                                    <Input
                                      type="time"
                                      className="h-9 w-[104px] text-[12px]"
                                      value={row.hoursStart}
                                      onChange={(e) => update(s.name, { hoursStart: e.target.value })}
                                    />
                                    <span className="text-ink-tertiary">–</span>
                                    <Input
                                      type="time"
                                      className="h-9 w-[104px] text-[12px]"
                                      value={row.hoursEnd}
                                      onChange={(e) => update(s.name, { hoursEnd: e.target.value })}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
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
                  Service Hours sets when guests can request this service. Response is the time to first reply; resolve is the time to close the task.
                </p>
              </div>
            ) : (
              <div className="min-w-0 p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-[16px] font-semibold text-ink">{dept.name}</div>
                </div>
                <div className="max-w-md">
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
                          {targets.map((t) => <option key={t}>{t}</option>)}
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
                <div className="mt-6 flex max-w-md gap-3 rounded-card border border-amber-100 bg-amber-50/60 p-5">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-[12px] text-ink-secondary">
                    Tasks inherit the SLA of the service they belong to.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={save}>Continue →</Button>
          <Button variant="outline" onClick={save}>
            Save as Draft
          </Button>
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
