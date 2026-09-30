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

function ServiceHours({
  allDay,
  start,
  end,
  onChange,
}: {
  allDay: boolean;
  start: string;
  end: string;
  onChange: (patch: Partial<Pick<ServiceSla, "hours247" | "hoursStart" | "hoursEnd">>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative mt-1">
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
  const goNext = useGoNextStep(6);
  const [defaults, setDefaults] = useState(DEFAULTS);
  const [deptSlug, setDeptSlug] = useState(DEPARTMENTS[0].slug);
  const [sla, setSla] = useState<SlaMap>(seedSla);
  const [levelsByDept, setLevelsByDept] = useState<Record<string, Level[]>>(() =>
    Object.fromEntries(DEPARTMENTS.map((d) => [d.slug, SEED_LEVELS.map((l) => ({ ...l }))])),
  );
  const [toast, setToast] = useState<string | null>(null);

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

        <Card className="overflow-hidden">
          <div className="border-b border-line px-8 py-6">
            <h3 className="text-[16px] font-semibold text-ink">SLA &amp; Escalation</h3>
            <p className="text-[12px] text-ink-secondary">
              Set how fast each service should be answered, and who it escalates to when that time is missed.
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
                        <span className={active ? "text-brand/70" : "text-ink-tertiary"}>{d.services.length}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 p-6 lg:p-8">
              <div className="mb-5 flex items-center justify-between">
                <div className="text-[16px] font-semibold text-ink">{dept.name}</div>
                <div className="text-[12px] text-ink-tertiary">
                  {dept.services.length} services · {customCount(deptSlug)} customised
                </div>
              </div>

              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 max-w-2xl overflow-x-auto">
                  <table className="w-full table-fixed text-left">
                    <colgroup>
                      <col />
                      <col className="w-[4.5rem]" />
                      <col className="w-[4.5rem]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 text-center font-medium">
                          Response
                          <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-ink-tertiary">min</span>
                        </th>
                        <th className="pb-3 text-center font-medium">
                          Resolve
                          <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-ink-tertiary">min</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dept.services.map((s) => {
                        const row = sla[key(s.name)];
                        return (
                          <tr key={s.name} className="border-b border-line/60 last:border-0">
                            <td className="py-3 pr-4">
                              <div className="text-[14px] font-medium text-ink">{s.name}</div>
                              <ServiceHours
                                allDay={row.hours247}
                                start={row.hoursStart}
                                end={row.hoursEnd}
                                onChange={(patch) => update(s.name, patch)}
                              />
                            </td>
                            <td className="py-3 align-top">
                              <Input
                                className="h-9 px-1 text-center"
                                value={row.response}
                                onChange={(e) => update(s.name, { response: e.target.value })}
                              />
                            </td>
                            <td className="py-3 pl-2 align-top">
                              <Input
                                className="h-9 px-1 text-center"
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
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <Select
                            className="mt-3 h-9"
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
                          <div className="flex justify-center py-2 text-ink-tertiary">
                            <ArrowDown className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2.5 rounded-card border border-amber-100 bg-amber-50/60 p-3.5">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <p className="text-[12px] text-ink-secondary">
                      Tasks inherit the SLA of the service they belong to.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
