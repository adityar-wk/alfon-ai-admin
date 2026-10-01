import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ListChecks,
  Timer,
  BedDouble,
  MessageCircle,
  Smile,
  Heart,
  Users,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Minus,
  Wrench,
  ConciergeBell,
  KeyRound,
  UtensilsCrossed,
  Wine,
  Headset,
  Building2,
  HeartPulse,
  Activity,
  Home as HomeIcon,
  Scale,
  Zap,
  ChevronDown,
  Check,
  CheckCircle2,
  Circle,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card } from "../components/ui";
import { TASKS, type Task } from "../data/tasks";
import { GUESTS } from "../data/guests";
import { seedChat } from "./GuestProfile";
import Orb from "../components/Orb";
import { scoreBand } from "../data/scoreBand";
import { useClock } from "../data/attention";
import { usePersona } from "../persona";
import { useOnboardingProgress } from "../data/onboarding";
import { OnboardingStepsGrid } from "../components/OnboardingSteps";

type Icon = React.ComponentType<{ className?: string }>;

const HOTEL = "Layana Resort & Spa";

function greeting(name: string) {
  const first = name.split(" ")[0];
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${hello}, ${first} 👋`;
}

const PILLARS = [
  { label: "Guest Satisfaction", value: "88%", tag: "Excellent", trend: "up", icon: Smile, spark: [60, 62, 61, 64, 66, 68] },
  { label: "Response Time", value: "2m 45s", tag: "Excellent", trend: "up", icon: Timer, spark: [50, 48, 52, 47, 46, 45] },
  { label: "Task Completion", value: "86%", tag: "Good", trend: "flat", icon: CheckCircle2, spark: [59, 61, 60, 63, 62, 64] },
  { label: "Service Quality", value: "79%", tag: "Good", trend: "flat", icon: Heart, spark: [55, 54, 56, 55, 56, 55] },
  { label: "Team Performance", value: "84%", tag: "Excellent", trend: "up", icon: Users, spark: [58, 59, 60, 60, 61, 62] },
] as const;

const SCORE_PILLARS: { title: string; weight: number; icon: Icon; text: string }[] = [
  { title: "Guest Pulse", weight: 30, icon: HeartPulse, text: "Tracks how guests feel throughout their stay — drawn from AI chat sentiment, complaint volume, and the tone and frequency of guest-initiated messages." },
  { title: "Operations Heartbeat", weight: 25, icon: Activity, text: "Measures how efficiently the hotel runs day to day — task completion rates, average response time, SLA breaches, and whether requests are being closed or left open." },
  { title: "Housekeeping Rhythm", weight: 20, icon: HomeIcon, text: "Evaluates room turnover speed, amenity fulfilment accuracy, and whether pre-arrival requests such as minibar preferences and room setup notes were actioned before the guest arrived." },
  { title: "Workload Balance", weight: 15, icon: Scale, text: "Measures how evenly work is distributed across the team — whether tasks are being claimed by multiple staff members or concentrated on one person, and whether any department is understaffed relative to its open task volume." },
  { title: "Recovery Rate", weight: 10, icon: Zap, text: "Scores how well the team turns a negative guest experience into a positive one — complaint-to-resolution time, compensation approvals, and whether a follow-up was made after the issue was closed." },
];

export const DEPT_ICON: Record<string, Icon> = {
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
      <polyline points={pts} fill="none" stroke="#E8623A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function OnboardingProgressCard() {
  const { steps, isDone, currentStep, allDone, percent } = useOnboardingProgress();
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center gap-6">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#F0F0F0" strokeWidth="10" />
            <circle
              cx="50" cy="50" r={r} fill="none" stroke="#E8623A" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[20px] font-bold text-ink">{percent}%</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">Hotel Setup Progress</div>
          <div className="mt-1 text-[17px] font-bold leading-snug text-ink">
            {allDone ? "All set — ready to launch" : `Step ${currentStep.id} of ${steps.length}: ${currentStep.title}`}
          </div>
          <p className="mt-1 text-[13px] text-ink-secondary">{allDone ? "Every setup step is complete." : currentStep.desc}</p>
          {!allDone && (
            <Link
              to={currentStep.to}
              className="mt-3 inline-flex items-center gap-1.5 rounded-control bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-brand-hover"
            >
              Continue Setup <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line pt-4">
        {steps.map((s) => {
          const done = isDone(s.id);
          const current = s.id === currentStep.id && !allDone;
          return (
            <span key={s.id} className={`flex items-center gap-1.5 text-[12px] ${current ? "font-semibold text-brand" : done ? "text-ink-secondary" : "text-ink-tertiary"}`}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
              {s.title}
            </span>
          );
        })}
      </div>
    </Card>
  );
}

const CHAT_PREVIEW = GUESTS.filter((g) => g.status !== "Arriving").slice(0, 3).map((g) => {
  const last = seedChat(g).at(-1);
  return { id: g.id, name: g.name, initials: g.initials, preview: last?.text ?? "No messages yet", time: last?.time ?? "" };
});

const TREND = [74, 75, 76, 75, 74, 76, 77, 78, 77, 78, 79, 80, 81, 80];

function AnalyticsChart() {
  const w = 320;
  const h = 148;
  const pad = { l: 28, r: 8, t: 8, b: 22 };
  const min = 0;
  const max = 100;
  const x = (i: number) => pad.l + (i / (TREND.length - 1)) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  const d = TREND.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const yTicks = [0, 25, 50, 75, 100];
  const xTicks = [1, 5, 9, 13, 17, 21, 25, 29];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="#F3F3F3" />
          <text x={0} y={y(t) + 3} fill="#9CA3AF" fontSize="10">{t}</text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={t} x={pad.l + ((t - 1) / 28) * (w - pad.l - pad.r)} y={h - 4} fill="#9CA3AF" fontSize="10" textAnchor="middle">{t}</text>
      ))}
      <path d={d} fill="none" stroke="#E8623A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Trend({ t }: { t: "up" | "down" | "flat" }) {
  if (t === "up") return <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (t === "down") return <ArrowDown className="h-3.5 w-3.5 text-brand" />;
  return <Minus className="h-3.5 w-3.5 text-ink-tertiary" />;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "In Progress": { bg: "#FFF9EC", color: "#D97706" },
  Pending: { bg: "#F5F5F5", color: "#6B7280" },
  Escalated: { bg: "#FEF2F2", color: "#EF4444" },
  Completed: { bg: "#F0FDF4", color: "#22C55E" },
};

function homeStatus(t: Task) {
  if (t.status === "Escalated") return "Escalated";
  if (t.status === "In Progress") return "In Progress";
  if (t.status === "Completed") return "Completed";
  return "Pending";
}

/** clock time the task is due, from the SLA offset, matching the prototype Due column */
function dueClock(sla: Task["sla"]) {
  if (sla.kind === "met") return "—";
  const h = sla.text.match(/(\d+)\s*hr/);
  const m = sla.text.match(/(\d+)\s*min/);
  const mins = (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  const d = new Date();
  d.setMinutes(d.getMinutes() + (sla.kind === "overdue" ? -mins : mins));
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function FilterPill({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const current = options.find((o) => o.id === value)?.label ?? label;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-subtle px-2.5 py-1 text-[12px] text-ink-secondary"
      >
        {current}
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 max-h-64 w-44 overflow-auto rounded-xl border border-line bg-white p-1 shadow-lg">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-[12px] hover:bg-subtle ${o.id === value ? "font-semibold text-brand" : "text-ink"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  useClock();
  const navigate = useNavigate();
  const { persona, me } = usePersona();
  const hello = greeting(me.name);
  const [dept, setDept] = useState("all");
  const [priority, setPriority] = useState("all");
  const [scoreOpen, setScoreOpen] = useState(false);

  const open = TASKS.filter((t) => t.status !== "Completed" && t.status !== "Unable to Complete" && t.status !== "Void");

  const depts = Array.from(new Set(open.map((t) => t.dept))).sort();
  const pending = open
    .filter((t) => (dept === "all" || t.dept === dept) && (priority === "all" || t.priority === priority))
    .slice(0, 6);

  const score = Math.max(0, Math.min(100, Math.round(82 + BASELINE - penalty(TASKS))));
  const band = scoreBand(score);

  if (persona === "hoteladmin") {
    return (
      <>
        <Topbar title={hello} subtitle={`Here's what's happening at ${HOTEL}`} />
        <main className="flex-1 overflow-y-auto bg-page">
        <div className="px-8 pb-8 pt-7">
          <OnboardingProgressCard />
          <div className="mt-6">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">Setup steps</h3>
            <OnboardingStepsGrid />
          </div>
        </div>
        </main>
      </>
    );
  }

  const topStats = [
    { label: "Open Tasks", value: String(open.length), sub: "Needs action", subTone: "text-ink-tertiary", icon: ListChecks },
    { label: "Guest Chats", value: String(GUESTS.length), sub: "Active conversations", subTone: "text-ink-tertiary", icon: MessageCircle },
    { label: "Avg Response", value: "2m 45s", sub: "↓ 18%", subTone: "text-success", icon: Timer },
    { label: "Occupancy", value: "87%", sub: "34 arriving today", subTone: "text-ink-tertiary", icon: BedDouble },
  ];

  return (
    <>
      <Topbar title={hello} subtitle={`Here's what's happening at ${HOTEL}`} />
      <main className="flex-1 overflow-y-auto bg-page">
        <div className="flex flex-col gap-7 px-8 pb-8 pt-7">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {topStats.map((s) => (
            <Card key={s.label} className="px-6 py-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand/25 bg-white text-brand">
                <s.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="mt-3 text-sm text-ink-secondary">{s.label}</div>
              <div className="mt-0.5 font-display text-[28px] font-bold leading-tight text-ink">{s.value}</div>
              <div className={`mt-1 text-xs font-medium ${s.subTone}`}>{s.sub}</div>
            </Card>
          ))}
        </div>

        <Card className="flex min-h-[520px] flex-col items-center justify-center px-6 py-10">
          <Orb score={score} />
          <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">Hotel Health Score</div>
          <p className={`mt-2.5 rounded-full px-3 py-1 text-center text-[13px] font-medium ${band.pill}`}>
            {band.key === "excellent"
              ? "Your hotel is performing strong."
              : band.key === "good"
                ? "Your hotel is doing well, with room to improve."
                : band.key === "attention"
                  ? "Several things need attention."
                  : "Urgent: resolve overdue and escalated tasks."}
          </p>
          <button
            onClick={() => setScoreOpen((o) => !o)}
            aria-expanded={scoreOpen}
            className="mt-5 inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:underline"
          >
            {scoreOpen ? "View less" : "View more"} <ChevronDown className={`h-4 w-4 transition-transform ${scoreOpen ? "rotate-180" : ""}`} />
          </button>

          <div className="mt-8 w-full max-w-[280px]">
            <div className="flex items-center justify-between text-[10px] font-semibold text-ink-tertiary">
              <span>0</span>
              <span>100</span>
            </div>
            <div className="relative mt-1 h-2 w-full rounded-full" style={{ background: "linear-gradient(90deg, #F0776C 0%, #F5B15D 50%, #5FD3A9 100%)" }}>
              <div
                className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-[left] duration-700"
                style={{ left: `calc(${score}% - 8px)`, background: band.color }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-ink-tertiary">
              <span>Needs Attention</span>
              <span>Thriving</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {PILLARS.map((p) => (
            <Card key={p.label} className="px-6 py-5">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-brand/25 bg-white text-brand">
                <p.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="text-sm text-ink-secondary">{p.label}</div>
              <div className="mt-0.5 flex items-end justify-between gap-3">
                <div>
                  <div className="font-display text-[28px] font-bold leading-tight text-ink">{p.value}</div>
                  <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${p.tag === "Excellent" ? "text-success" : "text-warning"}`}>
                    <Trend t={p.trend} /> {p.tag}
                  </div>
                </div>
                <div className="w-24 shrink-0"><Spark data={p.spark} /></div>
              </div>
            </Card>
          ))}
        </div>

        {scoreOpen && (
          <Card className="p-6">
            <h3 className="text-[16px] font-semibold text-ink">How your score is calculated</h3>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-secondary">
              Alfon monitors your hotel&apos;s live operations around the clock and distils everything into one score. Five pillars are weighted by their impact on the guest experience and recalculated every night at midnight.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-5 xl:divide-x xl:divide-line">
              {SCORE_PILLARS.map((p, i) => (
                <div key={p.title} className={i > 0 ? "xl:pl-6" : ""}>
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-brand"><p.icon className="h-[18px] w-[18px]" /></span>
                    <span className="text-[16px] font-bold text-brand">{p.weight}%</span>
                  </div>
                  <div className="mt-3 text-[14px] font-semibold text-ink">{p.title}</div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-secondary">{p.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-4 text-[13px] text-ink-secondary">
              {["Recalculates automatically every midnight", "Benchmarks against your previous day's performance", "Surfaces the exact pillar pulling your score down"].map((t) => (
                <span key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" />{t}</span>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,46%)]">
          {/* height:0 + min-h-full so the tasks card matches the right column without growing the row */}
          <Card table className="flex min-h-0 flex-col overflow-hidden xl:h-0 xl:min-h-full">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-4">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-brand" />
                <h3 className="font-display text-[16px] font-semibold text-ink">Pending Tasks</h3>
              </div>
              <div className="flex items-center gap-2">
                <FilterPill
                  label="All Departments"
                  value={dept}
                  onChange={setDept}
                  options={[{ id: "all", label: "All Departments" }, ...depts.map((d) => ({ id: d, label: d }))]}
                />
                <FilterPill
                  label="All Priority"
                  value={priority}
                  onChange={setPriority}
                  options={[
                    { id: "all", label: "All Priority" },
                    { id: "Critical", label: "Critical" },
                    { id: "High", label: "High" },
                    { id: "Medium", label: "Medium" },
                    { id: "Low", label: "Low" },
                  ]}
                />
                <Link to="/tasks" className="ml-1 text-[14px] font-medium text-brand">View all</Link>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[760px] text-left text-[14px]">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="text-[12px] uppercase tracking-wide text-ink-tertiary">
                    <th className="px-6 py-2 font-medium" />
                    <th className="px-3 py-2 font-medium">Task</th>
                    <th className="px-3 py-2 font-medium">Department</th>
                    <th className="px-3 py-2 font-medium">Assigned To</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Due</th>
                    <th className="px-3 py-2 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {pending.map((t) => {
                    const D = DEPT_ICON[t.dept] ?? Building2;
                    const status = homeStatus(t);
                    const pill = STATUS_STYLE[status];
                    return (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/tasks?open=${t.id}`)}
                        className="cursor-pointer border-t border-line hover:bg-[#FAFAFA]"
                      >
                        <td className="px-6 py-3">
                          <input type="checkbox" aria-label={`Select ${t.title}`} className="accent-brand" onClick={(e) => e.stopPropagation()} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5 font-medium text-ink">
                            <span className="truncate">{t.title}</span>
                            {!!t.compensation?.length && (
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[10px] font-bold text-[#22C55E]" title="Compensation logged">$</span>
                            )}
                            {t.tag === "Complaint" && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FEF2F2] px-1.5 py-0.5 text-[10px] font-bold text-[#DC2626]">
                                <AlertTriangle className="h-2.5 w-2.5" /> Complaint
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-ink-tertiary">{t.guest} · Room {t.room}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-1.5 whitespace-nowrap text-ink-secondary">
                            <D className="h-[13px] w-[13px] shrink-0 text-ink-tertiary" /> {t.dept}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {t.owner ? (
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-[10px] font-semibold text-brand">{initials(t.owner)}</span>
                              <span className="text-ink">{t.owner}</span>
                            </span>
                          ) : (
                            <span className="font-medium text-brand">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: pill.bg, color: pill.color }}>
                            {status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-ink">{dueClock(t.sla)}</td>
                        <td className="px-3 py-3">
                          <MoreVertical className="h-[15px] w-[15px] text-ink-tertiary" />
                        </td>
                      </tr>
                    );
                  })}
                  {!pending.length && (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-[14px] text-ink-tertiary">No pending tasks match.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="flex h-full flex-col gap-5">
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
              <h3 className="text-[16px] font-semibold text-ink">Occupancy Today</h3>
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

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-ink">Guest Chats</h3>
              <Link to="/guest-chats" className="text-[13px] font-semibold text-brand">View all</Link>
            </div>
            <div className="space-y-1">
              {CHAT_PREVIEW.map((c) => (
                <Link key={c.id} to={`/guest-chats?guest=${c.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-subtle/70">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-[11px] font-semibold text-brand">{c.initials}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="truncate text-[14px] font-semibold text-ink">{c.name}</span>
                      <span className="shrink-0 text-[11px] text-ink-tertiary">{c.time}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-ink-secondary">{c.preview}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 text-[16px] font-semibold text-ink">Analytics Overview</h3>
            <AnalyticsChart />
            <div className="mt-3 grid grid-cols-3 text-center">
              {[
                { n: TASKS.length, label: "Total Tasks", tone: "text-ink" },
                { n: TASKS.filter((t) => t.status === "Completed").length, label: "Completed", tone: "text-emerald-500" },
                { n: TASKS.filter((t) => t.status !== "Completed" && t.status !== "Void" && t.status !== "Unable to Complete" && t.sla.kind === "overdue").length, label: "Overdue", tone: "text-red-500" },
              ].map((s) => (
                <div key={s.label}>
                  <div className={`font-display text-[28px] font-bold leading-none ${s.tone}`}>{s.n}</div>
                  <div className="mt-1 text-[11px] text-ink-tertiary">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        </div>
        </main>
    </>
  );
}
