import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ListChecks,
  MessageCircle,
  Timer,
  Activity,
  BedDouble,
  Smile,
  CheckCircle2,
  Heart,
  Users,
  HeartPulse,
  Zap,
  Home as HomeIcon,
  Clock,
  ArrowDown,
  ArrowUp,
  Minus,
  Check,
  Wrench,
  ConciergeBell,
  KeyRound,
  UtensilsCrossed,
  Wine,
  Headset,
  Building2,
  ChevronDown,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Select } from "../components/ui";
import { GUESTS } from "../data/guests";
import { TASKS, type Priority } from "../data/tasks";
import { usePersona } from "../persona";
import { HealthOrb, scoreBand } from "../components/HealthOrb";

type Icon = React.ComponentType<{ className?: string }>;

const HOTEL = "Layana Resort & Spa";

const PILLARS = [
  { label: "Guest Satisfaction", value: "88%", tag: "Excellent", trend: "up", icon: Smile, spark: [60, 62, 61, 64, 66, 68] },
  { label: "Response Time", value: "2m 45s", tag: "Excellent", trend: "up", icon: Timer, spark: [50, 48, 52, 47, 46, 45] },
  { label: "Task Completion", value: "86%", tag: "Good", trend: "flat", icon: CheckCircle2, spark: [58, 59, 57, 58, 58, 59] },
  { label: "Service Quality", value: "79%", tag: "Good", trend: "flat", icon: Heart, spark: [55, 54, 56, 55, 56, 55] },
  { label: "Team Performance", value: "84%", tag: "Excellent", trend: "up", icon: Users, spark: [58, 59, 60, 60, 61, 62] },
] as const;

const SCORE_EXPLAINED = [
  { icon: HeartPulse, name: "Guest Pulse", weight: 30, text: "Tracks how guests feel throughout their stay — drawn from AI chat sentiment, complaint volume, and the tone and frequency of guest-initiated messages." },
  { icon: Activity, name: "Operations Heartbeat", weight: 25, text: "Measures how efficiently the hotel runs day to day — task completion rates, average response time, SLA breaches, and whether requests are being closed or left open." },
  { icon: HomeIcon, name: "Housekeeping Rhythm", weight: 20, text: "Evaluates room turnover speed, amenity fulfilment accuracy, and whether pre-arrival requests such as minibar preferences and room setup notes were actioned before the guest arrived." },
  { icon: Users, name: "Workload Balance", weight: 15, text: "Measures how evenly work is distributed across the team — whether tasks are being claimed by multiple staff members or concentrated on one person, and whether any department is understaffed relative to its open task volume." },
  { icon: Zap, name: "Recovery Rate", weight: 10, text: "Scores how well the team turns a negative guest experience into a positive one — complaint-to-resolution timing, compensation approvals, and whether a follow-up was made after the issue was closed." },
] as const;

const DEPT_ICON: Record<string, Icon> = {
  Engineering: Wrench, Concierge: ConciergeBell, "Front Desk": KeyRound, "Room Service": UtensilsCrossed,
  Housekeeping: BedDouble, "Food & Beverage": Wine, "Guest Services": Headset,
};

const PRIORITY_DOT: Record<Priority, string> = { Critical: "bg-red-500", High: "bg-brand", Medium: "bg-amber-400", Low: "bg-gray-300" };

const CHATS = [
  { guestId: 2, last: "That's perfect, thank you!", time: "9:16 PM" },
  { guestId: 3, last: "Puo contare si noi di noi…", time: "May 22" },
  { guestId: 1, last: "Our pleasure, Mr. Wilson…", time: "9:47 AM" },
];

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

const DAILY = [74, 76, 78, 77, 75, 76, 78, 79, 77, 76, 78, 80, 79, 77, 76, 78, 79, 81, 80, 79, 78, 79, 80, 82, 83, 82, 81, 82, 82];

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
  const { me } = usePersona();
  const [dept, setDept] = useState("all");
  const [prio, setPrio] = useState("all");
  const [showExplain, setShowExplain] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const open = TASKS.filter((t) => t.status !== "Completed" && t.status !== "Unable to Complete" && t.status !== "Void");
  const inProgress = open.filter((t) => t.status === "In Progress").length;
  const completed = TASKS.filter((t) => t.status === "Completed").length;
  const overdue = open.filter((t) => t.sla.kind === "overdue").length;

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

  const kpis = [
    { label: "Open Tasks", value: String(open.length), foot: `${inProgress} in progress`, footTone: "text-ink-secondary", icon: ListChecks, chip: "bg-sky-100 text-sky-700" },
    { label: "Avg Response", value: "2m 45s", foot: "↓ 18%", footTone: "text-emerald-600", icon: Timer, chip: "bg-violet-100 text-violet-700" },
    { label: "Occupancy", value: "87%", foot: "34 arriving today", footTone: "text-ink-tertiary", icon: BedDouble, chip: "bg-emerald-100 text-emerald-700" },
  ];


  return (
    <>
      <Topbar title={`${greeting}, ${me.name.split(" ")[0]} 👋`} subtitle={`Here's what's happening at ${HOTEL}`} />
      <Page>
        {/* health score */}
        {/* score pillars */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {PILLARS.map((p) => (
                <div key={p.label} className="rounded-xl border border-line p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-brand"><p.icon className="h-3.5 w-3.5" /></span>
                    <Trend t={p.trend} />
                  </div>
                  <div className="mt-2.5 text-[12px] text-ink-secondary">{p.label}</div>
                  <div className="text-[20px] font-bold leading-tight text-ink">{p.value}</div>
                  <div className={`text-[12px] font-medium ${p.tag === "Excellent" ? "text-emerald-600" : "text-amber-600"}`}>{p.tag}</div>
                  <Spark data={p.spark} />
                </div>
              ))}
            </div>

        <div className="mt-5">
          <Card className="p-8">
            <div className="flex flex-col items-center">
              <HealthOrb score={score} size={300}>
                <span className="text-[56px] font-bold leading-none tracking-tight text-ink">{score}%</span>
              </HealthOrb>
              <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">Hotel Health Score</div>

              <div className="mt-5 w-full max-w-[460px]">
                <div className="flex justify-between text-[12px] text-ink-secondary">
                  <span>Needs Attention</span>
                  <span>Thriving</span>
                </div>
                <div className="relative mt-1.5 h-2 rounded-full" style={{ background: "linear-gradient(90deg,#F5A0AF 0%,#F7BC7A 45%,#F3DC9B 65%,#7FDDBB 90%)" }}>
                  <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow" style={{ left: `${score}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-ink-tertiary">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              <p className={`mt-5 rounded-full px-4 py-2 text-[13px] font-medium ${band.pill}`}>
                {band.key === "excellent"
                  ? "Your hotel is performing strong. Keep up the great work."
                  : band.key === "good"
                    ? "Your hotel is doing well, with room to improve."
                    : band.key === "attention"
                      ? "Several things need attention — start with overdue and escalated tasks."
                      : "Urgent: resolve overdue and escalated tasks to recover the score."}
              </p>

              <button
                onClick={() => setShowExplain((v) => !v)}
                aria-expanded={showExplain}
                className="mt-6 flex items-center gap-1.5 text-[13px] font-medium text-brand hover:underline"
              >
                How your score is calculated
                <ChevronDown className={`h-4 w-4 transition-transform ${showExplain ? "rotate-180" : ""}`} />
              </button>

              {showExplain && (
                <div className="mt-5 w-full max-w-[760px] border-t border-line pt-5 text-left">
                  <p className="text-[13px] leading-relaxed text-ink-secondary">
                    Alfon monitors your hotel's live operations around the clock and distils everything into one score. Five pillars are weighted by their impact on the guest experience and recalculated every night at midnight.
                  </p>
                  <div className="mt-4 divide-y divide-line/70">
                    {SCORE_EXPLAINED.map((sx) => (
                      <div key={sx.name} className="flex gap-3 py-3.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-brand"><sx.icon className="h-4 w-4" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-semibold text-ink">{sx.name}</span>
                            <span className="text-[13px] font-semibold text-brand">{sx.weight}%</span>
                          </div>
                          <p className="mt-0.5 text-[12px] leading-relaxed text-ink-secondary">{sx.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-3 space-y-1.5 border-t border-line pt-3 text-[12px] text-ink-secondary">
                    {["Recalculates automatically every midnight", "Benchmarks against your previous day's performance"].map((t) => (
                      <li key={t} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" /> {t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </Card>

        </div>

        {/* KPIs */}
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {kpis.map((k) => (
            <Card key={k.label} className="p-5">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.chip}`}>
                <k.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="mt-3 text-[13px] text-ink-secondary">{k.label}</div>
              <div className="text-[28px] font-bold leading-tight text-ink">{k.value}</div>
              <div className={`mt-1 text-[12px] font-medium ${k.footTone}`}>{k.foot}</div>
            </Card>
          ))}
        </div>

        {/* pending tasks + hotel info */}
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
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
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-line bg-subtle/50 text-[11px] uppercase tracking-wide text-ink-secondary">
                    <th className="py-3 pl-5 font-medium">Task</th>
                    <th className="py-3 font-medium">Department</th>
                    <th className="py-3 font-medium">Assigned To</th>
                    <th className="py-3 font-medium">Priority</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 pr-5 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((t) => {
                    const D = DEPT_ICON[t.dept] ?? Building2;
                    return (
                      <tr key={t.id} onClick={() => navigate(`/tasks?open=${t.id}`)} className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-subtle/60">
                        <td className="py-3 pl-5 pr-3">
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                            {t.title}
                            {t.tag && <span className="text-[11px] font-medium text-red-600">{t.tag}</span>}
                          </div>
                          <div className="text-[12px] text-ink-tertiary">{t.guest} · Room {t.room}</div>
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
                        <td className="py-3 pr-3"><span className="inline-flex items-center gap-1.5 text-[13px] text-ink"><span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[t.priority]}`} />{t.priority}</span></td>
                        <td className="py-3 pr-3 text-[13px] text-ink-secondary">{t.status}</td>
                        <td className={`whitespace-nowrap py-3 pr-5 text-[13px] ${t.sla.kind === "overdue" ? "font-medium text-red-600" : t.sla.kind === "due" ? "font-medium text-brand" : "text-ink-secondary"}`}>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{t.sla.text}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {!pending.length && <tr><td colSpan={6} className="py-10 text-center text-[13px] text-ink-tertiary">No pending tasks match.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="self-start p-6">
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

        {/* chats + analytics + team */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.4fr_1fr]">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-ink">Guest Chats</h3>
              <Link to="/guests" className="text-[13px] font-semibold text-brand">View all</Link>
            </div>
            <div className="mt-3 divide-y divide-line/70">
              {CHATS.map((c) => {
                const g = GUESTS.find((x) => x.id === c.guestId)!;
                return (
                  <Link key={g.id} to={`/guests/${g.id}`} className="flex items-center gap-3 py-3 hover:opacity-80">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${g.tint}`}>{g.initials}</span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[13px] font-semibold text-ink">{g.name}</span>
                      <span className="block truncate text-[12px] text-ink-secondary">{c.last}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-tertiary">{c.time}</span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-ink">Analytics Overview</h3>
              <Link to="/analytics" className="text-[13px] font-semibold text-brand">Details</Link>
            </div>
            <p className="text-[12px] text-ink-tertiary">Daily task completion rate</p>
            <DailyChart data={DAILY} />
            <div className="mt-3 grid grid-cols-3 text-center">
              <div><div className="text-[22px] font-bold text-ink">{TASKS.length}</div><div className="text-[12px] text-ink-tertiary">Total Tasks</div></div>
              <div><div className="text-[22px] font-bold text-emerald-600">{completed}</div><div className="text-[12px] text-ink-tertiary">Completed</div></div>
              <div><div className="text-[22px] font-bold text-rose-500">{overdue}</div><div className="text-[12px] text-ink-tertiary">Overdue</div></div>
            </div>
          </Card>

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
        </div>
      </Page>
    </>
  );
}

function DailyChart({ data }: { data: number[] }) {
  const W = 520, H = 190, L = 30, R = 8, T = 8, B = 22;
  const x = (i: number) => L + (i * (W - L - R)) / (data.length - 1);
  const y = (v: number) => T + ((100 - v) / 100) * (H - T - B);
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const [hover, setHover] = useState<number | null>(null);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
      {[0, 25, 50, 75, 100].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#EDEDED" />
          <text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#9CA3AF">{t}</text>
        </g>
      ))}
      {[1, 5, 9, 13, 17, 21, 25, 29].map((day) => (
        <text key={day} x={x(day - 1)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9CA3AF">{day}</text>
      ))}
      <path d={d} fill="none" stroke="#7FA8E0" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => (
        <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <circle cx={x(i)} cy={y(v)} r="8" fill="transparent" />
          {hover === i && (
            <>
              <circle cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke="#7FA8E0" strokeWidth="2" />
              <rect x={x(i) - 34} y={y(v) - 30} width="68" height="20" rx="5" fill="#111" />
              <text x={x(i)} y={y(v) - 16} textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff">May {i + 1} · {v}%</text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}
