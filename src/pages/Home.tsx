import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ListChecks,
  Timer,
  BedDouble,
  Smile,
  Heart,
  Users,
  Clock,
  ArrowDown,
  ArrowUp,
  Minus,
  Wrench,
  ConciergeBell,
  KeyRound,
  UtensilsCrossed,
  Wine,
  Headset,
  Building2,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Select } from "../components/ui";
import { TASKS } from "../data/tasks";
import Orb from "../components/Orb";
import { scoreBand } from "../data/scoreBand";

type Icon = React.ComponentType<{ className?: string }>;

const HOTEL = "Layana Resort & Spa";

const PILLARS = [
  { label: "Guest Satisfaction", value: "88%", tag: "Excellent", trend: "up", icon: Smile, spark: [60, 62, 61, 64, 66, 68] },
  { label: "Response Time", value: "2m 45s", tag: "Excellent", trend: "up", icon: Timer, spark: [50, 48, 52, 47, 46, 45] },
  { label: "Service Quality", value: "79%", tag: "Good", trend: "flat", icon: Heart, spark: [55, 54, 56, 55, 56, 55] },
  { label: "Team Performance", value: "84%", tag: "Excellent", trend: "up", icon: Users, spark: [58, 59, 60, 60, 61, 62] },
] as const;

const DEPT_ICON: Record<string, Icon> = {
  Engineering: Wrench, Concierge: ConciergeBell, "Front Desk": KeyRound, "Room Service": UtensilsCrossed,
  Housekeeping: BedDouble, "Food & Beverage": Wine, "Guest Services": Headset,
};

const DEPT_PERF = [
  { name: "Housekeeping", tasks: 52, onTime: 96 },
  { name: "Front Desk", tasks: 32, onTime: 97 },
  { name: "Concierge", tasks: 18, onTime: 94 },
  { name: "Room Service", tasks: 21, onTime: 91 },
  { name: "Guest Services", tasks: 27, onTime: 93 },
  { name: "Engineering", tasks: 15, onTime: 88 },
];

/** Health score = 82 at the starting data; it moves as tasks are resolved or new problems appear. */
const penalty = (ts: typeof TASKS) => {
  const open = ts.filter((t) => t.status !== "Completed" && t.status !== "Unable to Complete" && t.status !== "Void");
  return (
    open.filter((t) => t.sla.kind === "overdue").length * 2.5 +
    open.filter((t) => t.status === "Escalated").length * 2 +
    open.filter((t) => t.sla.kind === "due").length * 0.75 +
    open.filter((t) => t.owner === null).length
  );
};
const BASELINE = penalty(TASKS);

function Spark({ data }: { data: readonly number[] }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / Math.max(max - min, 1)) * 22}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" className="mt-3 h-8 w-full" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="#8DB4EE" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Trend({ t }: { t: "up" | "down" | "flat" }) {
  if (t === "up") return <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (t === "down") return <ArrowDown className="h-3.5 w-3.5 text-brand" />;
  return <Minus className="h-3.5 w-3.5 text-ink-tertiary" />;
}

export default function Home() {
  const navigate = useNavigate();
  const [dept, setDept] = useState("all");
  const [prio, setPrio] = useState("all");

  const open = TASKS.filter((t) => t.status !== "Completed" && t.status !== "Unable to Complete" && t.status !== "Void");

  const rank = (t: (typeof TASKS)[number]) => (t.status === "Escalated" ? 0 : t.sla.kind === "overdue" ? 1 : t.sla.kind === "due" ? 2 : 3);
  const depts = Array.from(new Set(open.map((t) => t.dept))).sort();
  const pending = useMemo(
    () =>
      open
        .filter((t) => (dept === "all" || t.dept === dept) && (prio === "all" || t.priority === prio))
        .sort((a, b) => rank(a) - rank(b))
        .slice(0, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [TASKS.length, dept, prio],
  );

  const score = Math.max(0, Math.min(100, Math.round(82 + BASELINE - penalty(TASKS))));
  const band = scoreBand(score);

  return (
    <>
      <Topbar title={HOTEL} />
      <Page>
        {/* pillars | orb | department performance + occupancy */}
        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
            {PILLARS.map((p) => (
              <div key={p.label} className="flex flex-col justify-between rounded-card border border-line bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] text-ink-secondary">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-brand"><p.icon className="h-3.5 w-3.5" /></span>
                    {p.label}
                  </span>
                  <Trend t={p.trend} />
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[22px] font-bold leading-tight text-ink">{p.value}</div>
                    <div className={`text-[12px] font-medium ${p.tag === "Excellent" ? "text-emerald-600" : "text-amber-600"}`}>{p.tag}</div>
                  </div>
                  <div className="w-24 shrink-0"><Spark data={p.spark} /></div>
                </div>
              </div>
            ))}
          </div>

          <Card className="flex flex-col items-center justify-center overflow-hidden px-6 pb-8 pt-4">
            <div className="relative h-[340px] w-[340px] max-w-full">
              <Orb hue={band.hue} hoverIntensity={0.2} rotateOnHover backgroundColor="#ffffff" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className={`text-[60px] font-bold leading-none tracking-tight transition-colors duration-700 ${band.text}`}>{score}%</span>
              </div>
            </div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">Hotel Health Score</div>
            <p className="mt-2 text-center text-[14px] text-ink-secondary">
              {band.key === "excellent"
                ? "Your hotel is performing strong."
                : band.key === "good"
                  ? "Your hotel is doing well, with room to improve."
                  : band.key === "attention"
                    ? "Several things need attention."
                    : "Urgent: resolve overdue and escalated tasks."}
            </p>
          </Card>

          <div className="flex flex-col gap-5">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-ink">Department Performance</h3>
                <Link to="/analytics" className="text-[13px] font-semibold text-brand">Analytics</Link>
              </div>
              <div className="mt-3 divide-y divide-line/70">
                {DEPT_PERF.map((d) => (
                  <div key={d.name} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1 text-[13px] font-semibold text-ink">{d.name}</div>
                    <div className="text-right leading-tight">
                      <div className="text-[13px] font-semibold text-ink">{d.tasks} tasks</div>
                      <div className="text-[11px] text-ink-tertiary">{d.onTime}% on time</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-[16px] font-semibold text-ink">{HOTEL}</h3>
              <dl className="mt-4 space-y-3.5 text-[13px]">
                {[["Occupancy", "87%"], ["Check-ins Today", "34"], ["Check-outs Today", "28"], ["Total Rooms", "245"]].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between">
                    <dt className="text-ink-secondary">{l}</dt>
                    <dd className="font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>

        {/* pending tasks */}
        <div className="mt-5">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4">
              <ListChecks className="h-[18px] w-[18px] text-brand" />
              <h3 className="text-[16px] font-semibold text-ink">Pending Tasks</h3>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-40"><Select className="h-9 text-[12px]" value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
                  <option value="all">All Departments</option>{depts.map((d) => <option key={d}>{d}</option>)}
                </Select></div>
                <div className="w-32"><Select className="h-9 text-[12px]" value={prio} onChange={(e) => setPrio(e.target.value)} aria-label="Priority">
                  <option value="all">All Priority</option>{(["Critical", "High", "Medium", "Low"] as const).map((p) => <option key={p}>{p}</option>)}
                </Select></div>
                <Link to="/tasks" className="ml-2 text-[13px] font-semibold text-brand">View all</Link>
              </div>
            </div>
            <div className="overflow-x-auto border-t border-line">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-line bg-subtle/50 text-[11px] uppercase tracking-wide text-ink-secondary">
                    <th className="py-3 pl-5 font-medium">Status</th>
                    <th className="py-3 font-medium">Task</th>
                    <th className="py-3 font-medium">Department</th>
                    <th className="py-3 font-medium">Assigned To</th>
                    <th className="py-3 pr-5 font-medium">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((t) => {
                    const D = DEPT_ICON[t.dept] ?? Building2;
                    return (
                      <tr key={t.id} onClick={() => navigate(`/tasks?open=${t.id}`)} className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-subtle/60">
                        <td className="py-3 pl-5 pr-3">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                            {t.status === "Escalated" ? (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[12px] font-semibold text-red-700">Escalated</span>
                            ) : (
                              <span className="text-[13px] text-ink-secondary">{t.status === "Yet to Assign" ? (t.owner ? "Assigned" : "Unassigned") : t.status}</span>
                            )}
                            <span className={`flex items-center gap-1 whitespace-nowrap text-[12px] ${t.sla.kind === "overdue" ? "font-medium text-red-600" : t.sla.kind === "due" ? "font-medium text-brand" : "text-ink-secondary"}`}>
                              <Clock className="h-3.5 w-3.5" />{t.sla.text}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                            {t.title}
                            {t.tag === "Complaint" && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Complaint</span>}
                          </div>
                          <div className="text-[12px] text-ink-tertiary">{t.guest}</div>
                        </td>
                        <td className="whitespace-nowrap py-3 pr-3 text-[13px] text-ink-secondary"><span className="flex items-center gap-2"><D className="h-4 w-4 text-ink-tertiary" />{t.dept}</span></td>
                        <td className="whitespace-nowrap py-3 pr-3 text-[13px]">
                          {t.owner ? (
                            <span className="flex items-center gap-2 text-ink">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-tint text-[9px] font-bold text-brand">{t.owner.split(" ").map((w) => w[0]).join("")}</span>
                              {t.owner}
                            </span>
                          ) : (
                            <span className="font-medium text-brand">Unassigned</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap py-3 pr-5 text-[13px] text-ink-secondary">{t.room}</td>
                      </tr>
                    );
                  })}
                  {!pending.length && <tr><td colSpan={5} className="py-10 text-center text-[13px] text-ink-tertiary">No pending tasks match.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

      </Page>
    </>
  );
}
