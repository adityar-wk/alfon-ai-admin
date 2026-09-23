import { useMemo, useState } from "react";
import {
  Bell, Home as HomeIcon, Plus, Users, UserCog, UserPlus, ArrowUpRight, MessageCircle, Send, Filter, ChevronRight, ChevronLeft, Search,
  Menu as MenuIcon, ListChecks, BarChart3, AlertTriangle, User, BedDouble, DoorClosed, Lightbulb, Check, Building2,
} from "lucide-react";
import { DEPARTMENTS } from "../data/departments";
import { DEPTS, METRICS, COMPLAINT_DETAIL } from "../pages/Analytics";
import { Donut } from "../components/Donut";
import { BarChart } from "../components/BarChart";
import { SEED_TASKS, SEED_REQUESTS, STAFF, PRESENCE_DOT, GUEST_STAYS, PRE_ARRIVAL_GUESTS, CHECKED_OUT_GUESTS, ROOMS, type MTask, type Presence, type Staffer, type HkRoom, type RoomStatus, type EscType } from "./data";
import {
  PhoneFrame, ScreenHeader, SectionTitle, TaskCard, StatCard, Avatar, Chips, Segmented, FloatingNav, PrimaryButton, GhostButton, SelectField, TextField, Label, Sheet,
  useNav, useToast, CARD_SHADOW, TextHeader, PriorityPill, SlaCountdown, fmtMins, type Priority,
} from "./mobile";
import { StaffPicker, ReasonSheet, StatusTag, activeCount, atRiskCount, overdueCount, isOpen, isAtRisk, isOverdue } from "./parts";

type Screen = {
  name: "home" | "tasks" | "team" | "staffDetail" | "housekeeping" | "guests" | "guestDetail" | "guestProfile" | "preArrivalProfile" | "detail" | "notifications" | "create" | "menu" | "analytics" | "guestsRoster";
  id?: string;
};
type SheetState = { k: "needHelp" | "assign" | "support" | "gm"; taskId: string } | null;

const ME = "Daniel Reyes";
const ESC_FILTERS = ["All", "SLA breach", "SLA at risk", "Guest complaint", "Unable to complete", "Staffing issue", "Supervisor escalation", "High priority"] as const;
const SEVS = ["Low", "Medium", "High", "Critical"] as const;
const SEV_COLOR: Record<(typeof SEVS)[number], string> = { Low: "bg-slate-500", Medium: "bg-amber-500", High: "bg-orange-500", Critical: "bg-red-500" };
const SEV_SLA: Record<Priority, number> = { Low: 60, Medium: 40, High: 20, Critical: 10 };
type EscFilter = (typeof ESC_FILTERS)[number];
const AVAIL_ORDER: Presence[] = ["Available", "On Break", "Off work"];
const teamStatus = (s: Staffer): Presence => (s.status === "Busy" ? "Available" : s.status);
const ROLE_FILTERS = ["All", "Supervisor", "Line Staff"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];
const AVAIL_FILTERS = ["All", "Available", "On Break", "Off work"] as const;
type AvailFilter = (typeof AVAIL_FILTERS)[number];
const GUEST_FILTERS = ["All", "Complaints", "Open requests"] as const;
type GuestFilter = (typeof GUEST_FILTERS)[number];
const ROSTER_STAGE_FILTERS = ["All", "In-house", "Pre-arrival", "Checked out"] as const;
type RosterStage = (typeof ROSTER_STAGE_FILTERS)[number];
const ROOM_STATUS_FILTERS = ["All", "In Progress", "Dirty", "Out of Service", "Clean"] as const;
type RoomStatusFilter = (typeof ROOM_STATUS_FILTERS)[number];
const ROOM_STATUSES = ["Clean", "In Progress", "Dirty", "Out of Service"] as const;
const ROOM_STATUS_TONE: Record<RoomStatus, string> = {
  Clean: "bg-emerald-50 text-emerald-600",
  "In Progress": "bg-blue-50 text-blue-600",
  Dirty: "bg-amber-50 text-amber-700",
  "Out of Service": "bg-red-50 text-red-600",
};
const TASK_FILTERS = ["All", "Unassigned", "In Progress", "At Risk", "Overdue", "Completed"] as const;
type TaskFilter = (typeof TASK_FILTERS)[number];
const STAFF_TABS = ["Overview", "Schedule", "Performance"] as const;
type StaffTab = (typeof STAFF_TABS)[number];
const STAFF_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHIFTS = ["Morning · 6:00 AM – 2:00 PM", "Afternoon · 2:00 PM – 10:00 PM", "Night · 10:00 PM – 6:00 AM"];
const SKILLS_BY_ROLE: Record<Staffer["role"], string[]> = {
  "Line Staff": ["Room turnover", "Linen handling", "Guest courtesy"],
  Supervisor: ["Team coordination", "Quality checks", "Escalation handling"],
};
const KvRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3 border-b border-line/70 py-2.5 text-[13px] last:border-0">
    <span className="text-ink-secondary">{label}</span>
    <span className="text-right text-ink">{children}</span>
  </div>
);

const DetailRow = ({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 py-3.5">
    <Icon className="h-4 w-4 shrink-0 text-ink-tertiary" />
    <span className="w-24 shrink-0 text-[13px] text-ink-tertiary">{label}</span>
    <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{children}</span>
  </div>
);

const PROFILE_SECTION_TONE = {
  blue: { border: "border-blue-400", icon: "text-blue-600", label: "text-blue-700" },
  amber: { border: "border-amber-400", icon: "text-amber-600", label: "text-amber-700" },
  red: { border: "border-red-400", icon: "text-red-600", label: "text-red-700" },
} as const;
const ProfileSection = ({
  icon: Icon, label, tone, children,
}: {
  icon: React.ComponentType<{ className?: string }>; label: string; tone: keyof typeof PROFILE_SECTION_TONE; children: React.ReactNode;
}) => {
  const t = PROFILE_SECTION_TONE[tone];
  return (
    <div className={`rounded-2xl border-l-4 ${t.border} bg-white p-4 ${CARD_SHADOW}`}>
      <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${t.label}`}>
        <Icon className={`h-3.5 w-3.5 ${t.icon}`} /> {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};
const ActionRow = ({ n, text, dept, done, onClick }: { n: number; text: string; dept: string; done: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className="flex w-full items-start gap-3 border-b border-line/70 py-2.5 text-left last:border-0">
    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
      {done ? <Check className="h-3.5 w-3.5" /> : n}
    </span>
    <span className={`min-w-0 flex-1 text-[13px] leading-snug ${done ? "text-ink-tertiary line-through" : "text-ink"}`}>{text}</span>
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#F1F1F3] px-2 py-1 text-[10px] font-semibold text-ink-secondary">
      {dept} <span className={`h-1.5 w-1.5 rounded-full ${done ? "bg-emerald-500" : "bg-amber-500"}`} />
    </span>
  </button>
);
const MENU_ITEMS = [
  { key: "team" as const, label: "Team Management", icon: Users },
  { key: "housekeeping" as const, label: "Housekeeping", icon: DoorClosed },
  { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { key: "guestsRoster" as const, label: "Guests", icon: BedDouble },
];

/* ---------- Housekeeping analytics, sourced from the desktop Analytics page ---------- */
const HK_DEPT = DEPTS.find((d) => d.name === "Housekeeping")!;
const HK_METRICS = METRICS["Housekeeping"];
const HK_COMPLAINTS = Object.entries(COMPLAINT_DETAIL)
  .map(([name, c]) => ({ name, v: c.by.filter(([d]) => d === "Housekeeping").reduce((a, [, x]) => a + x, 0), delta: c.delta }))
  .filter((x) => x.v > 0)
  .sort((a, b) => b.v - a.v);
const HK_TOP_REQUESTS = [...HK_DEPT.items].filter(([l]) => l !== "Other").sort((a, b) => b[1] - a[1]).slice(0, 5);
const rampColors = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const from = [241, 90, 36], to = [253, 226, 212];
    return `rgb(${from.map((f, k) => Math.round(f + (to[k] - f) * t)).join(",")})`;
  });
const HK_DONUT_COLORS = rampColors(HK_DEPT.items.length);

const NOTIFS = [
  { text: "Supervisor escalation — Room 1204 deep clean (staffing risk)", time: "10:20 AM", to: "t5" },
  { text: "Critical SLA breach — Room 1103 stained bedding, 14 min over", time: "10:10 AM", to: "t6" },
  { text: "High-priority complaint — Michael Johnson, negative sentiment", time: "10:15 AM", to: "t6" },
  { text: "Repeated unresolved task — Room 908 extra pillows, breached twice today", time: "10:25 AM", to: "t10" },
  { text: "Workload issue — Aanya Khan has 2 tasks, 1 overdue", time: "10:28 AM", to: "team" },
  { text: "Unassigned critical request — Room 2104 extra towels (High)", time: "10:31 AM", to: "t12" },
  { text: "AI escalated a guest conversation — Room 1103", time: "10:14 AM", to: "t6" },
];

const escSort = (a: MTask, b: MTask) => a.slaLeft - b.slaLeft;
const isEsc = (t: MTask) => (isOpen(t) || t.status === "unable" ? !!t.escalated : false);

type GuestEntry = {
  name: string;
  room: string;
  complaint: boolean;
  sentiment?: string;
  risk?: string;
  prefs: string[];
  convo: string;
  summary: string;
  summaryIsComplaint: boolean;
  items: MTask[];
  checkIn?: string;
  checkOut?: string;
};

export function ManagerPrototype() {
  const nav = useNav<Screen>({ name: "home" });
  const { flash, node: toast } = useToast();
  const [tasks, setTasks] = useState<MTask[]>(SEED_TASKS);
  const [filter, setFilter] = useState<EscFilter>("All");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [availFilter, setAvailFilter] = useState<AvailFilter>("All");
  const [teamFilterOpen, setTeamFilterOpen] = useState(false);
  const [guestQuery, setGuestQuery] = useState("");
  const [guestFilter, setGuestFilter] = useState<GuestFilter>("All");
  const [guestFilterOpen, setGuestFilterOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("All");
  const [taskQuery, setTaskQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<RosterStage>("All");
  const [rosterQuery, setRosterQuery] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [rosterFilterOpen, setRosterFilterOpen] = useState(false);
  const [staffTab, setStaffTab] = useState<StaffTab>("Overview");
  const [rooms, setRooms] = useState<HkRoom[]>(ROOMS);
  const [roomFilter, setRoomFilter] = useState<RoomStatusFilter>("All");
  const [roomSheet, setRoomSheet] = useState<string | null>(null);
  const [preArrivalDone, setPreArrivalDone] = useState<Record<string, number[]>>({});
  const [sheet, setSheet] = useState<SheetState>(null);
  const [needHelpReason, setNeedHelpReason] = useState("");
  const [chat, setChat] = useState<Record<string, { from: "guest" | "ai" | "me"; text: string }[]>>({});
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState("");
  // create task
  const [service, setService] = useState("");
  const [sev, setSev] = useState<Priority>("Medium");
  const [room, setRoom] = useState("");
  const [details, setDetails] = useState("");

  const cur = nav.cur;
  const task = tasks.find((t) => t.id === cur.id);
  const patch = (id: string, p: Partial<MTask>, log?: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p, timeline: log ? [...t.timeline, { t: "now", text: log }] : t.timeline } : t)));

  const escalated = tasks.filter(isEsc);
  const counts = {
    open: tasks.filter(isOpen).length,
    risk: tasks.filter(isAtRisk).length,
    over: tasks.filter(isOverdue).length,
    esc: escalated.length,
    complaints: tasks.filter((t) => t.complaint && isOpen(t)).length,
    critical: tasks.filter((t) => t.status === "unassigned" && (t.priority === "High" || t.priority === "Critical")).length,
  };

  const escTests: Record<EscFilter, (t: MTask) => boolean> = {
    All: isEsc,
    "SLA breach": (t) => isOverdue(t) || (isEsc(t) && t.escType === "SLA breach"),
    "SLA at risk": isAtRisk,
    "Guest complaint": (t) => isEsc(t) && (t.escType === "Guest complaint" || !!t.complaint),
    "Unable to complete": (t) => isEsc(t) && (t.escType === "Unable to complete" || t.status === "unable"),
    "Staffing issue": (t) => isEsc(t) && t.escType === "Staffing issue",
    "Supervisor escalation": (t) => isEsc(t) && t.escType === "Supervisor escalation",
    "High priority": (t) => isEsc(t) && (t.priority === "High" || t.priority === "Critical"),
  };
  const filtered = useMemo(
    () => tasks.filter(escTests[filter]).sort(escSort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, filter],
  );
  const chipCounts = Object.fromEntries(ESC_FILTERS.map((f) => [f, tasks.filter(escTests[f]).length])) as Record<EscFilter, number>;

  const open = (id: string) => nav.push({ name: "detail", id });
  const tag = (t: MTask) => (
    <>
      {t.escType && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">{t.escType}</span>}
    </>
  );
  const card = (t: MTask) => (
    <TaskCard
      key={t.id}
      room={t.room}
      note={t.title}
      priority={t.priority}
      left={t.status === "completed" ? undefined : t.slaLeft}
      total={t.slaTotal}
      done={t.status === "completed"}
      tag={tag(t)}
      meta={`${t.escBy && t.escalated ? `Escalated by ${t.escBy} · ` : ""}${stuckAt(t)}`}
      onClick={() => open(t.id)}
    />
  );

  const stuckAt = (t: MTask) =>
    t.status === "unassigned" ? "Not picked up — no owner" : t.status === "assigned" ? `Awaiting acceptance by ${t.owner}` : t.status === "unable" ? `Blocked — ${t.resolution ?? "unable to complete"}` : `In progress with ${t.owner}`;

  const services = DEPARTMENTS.find((d) => d.name === "Housekeeping")?.services.filter((sv) => sv.active).map((sv) => sv.name) ?? [];

  /* ---------- all tasks, filterable ---------- */
  const taskFilterFn: Record<TaskFilter, (t: MTask) => boolean> = {
    All: () => true,
    Unassigned: (t) => t.status === "unassigned",
    "In Progress": (t) => t.status === "progress" || t.status === "assigned",
    "At Risk": isAtRisk,
    Overdue: isOverdue,
    Completed: (t) => t.status === "completed",
  };
  const tasksFiltered = useMemo(() => {
    const s = taskQuery.trim().toLowerCase();
    return tasks
      .filter(taskFilterFn[taskFilter])
      .filter((t) => !s || `${t.room} ${t.guest} ${t.title}`.toLowerCase().includes(s))
      .sort((a, b) => a.slaLeft - b.slaLeft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, taskFilter, taskQuery]);
  const taskChipCounts = Object.fromEntries(TASK_FILTERS.map((f) => [f, tasks.filter(taskFilterFn[f]).length])) as Record<TaskFilter, number>;
  const genericCard = (t: MTask) => (
    <TaskCard
      key={t.id}
      room={t.room}
      note={t.title}
      priority={t.priority}
      left={t.status === "completed" ? undefined : t.slaLeft}
      total={t.slaTotal}
      done={t.status === "completed"}
      tag={<StatusTag s={t.status} />}
      meta={t.owner ? `Owner · ${t.owner}${t.support.length ? ` +${t.support.length}` : ""}` : "No owner yet"}
      onClick={() => open(t.id)}
    />
  );

  /* ---------- guests derived from the department's tasks ---------- */
  const guestMap = useMemo(() => {
    const map = new Map<string, GuestEntry>();
    for (const t of tasks) {
      const stay = GUEST_STAYS[t.guest];
      const cur = map.get(t.guest) ?? {
        name: t.guest, room: t.room, complaint: false, prefs: [], convo: "—", summary: "", summaryIsComplaint: false, items: [],
        checkIn: stay?.checkIn, checkOut: stay?.checkOut,
      };
      cur.room = t.room;
      cur.complaint = cur.complaint || !!t.complaint;
      if (t.sentiment) cur.sentiment = t.sentiment;
      if (t.risk) cur.risk = t.risk;
      cur.prefs = Array.from(new Set([...cur.prefs, ...t.prefs]));
      if (t.convo && t.convo !== "—") cur.convo = t.convo;
      if (t.complaint || !cur.summaryIsComplaint) {
        cur.summary = t.summary ?? t.note;
        cur.summaryIsComplaint = !!t.complaint;
      }
      cur.items = [...cur.items, t];
      map.set(t.guest, cur);
    }
    return map;
  }, [tasks]);

  const guestsSorted = useMemo(
    () =>
      Array.from(guestMap.values()).sort(
        (a, b) => Number(b.complaint) - Number(a.complaint) || Number(b.items.some(isOpen)) - Number(a.items.some(isOpen)) || a.name.localeCompare(b.name),
      ),
    [guestMap],
  );
  const guestsFiltered = useMemo(() => {
    const q = guestQuery.trim().toLowerCase();
    return guestsSorted.filter((g) => {
      if (guestFilter === "Complaints" && !g.complaint) return false;
      if (guestFilter === "Open requests" && !g.items.some(isOpen)) return false;
      return !q || `${g.name} ${g.room}`.toLowerCase().includes(q);
    });
  }, [guestsSorted, guestFilter, guestQuery]);
  const guestActiveFilters = guestFilter !== "All" ? 1 : 0;
  const rosterFiltered = useMemo(() => {
    const q = rosterQuery.trim().toLowerCase();
    const match = (n: string, r: string) => !q || `${n} ${r}`.toLowerCase().includes(q);
    const current = stageFilter === "Pre-arrival" || stageFilter === "Checked out" ? [] : guestsSorted.filter((g) => match(g.name, g.room)).map((g) => ({ stage: "Current" as const, g }));
    const upcoming = stageFilter === "In-house" || stageFilter === "Checked out" ? [] : PRE_ARRIVAL_GUESTS.filter((g) => match(g.name, g.room)).map((g) => ({ stage: "Upcoming" as const, g }));
    const departed = stageFilter === "In-house" || stageFilter === "Pre-arrival" ? [] : CHECKED_OUT_GUESTS.filter((g) => match(g.name, g.room)).map((g) => ({ stage: "Departed" as const, g }));
    return [...current, ...upcoming, ...departed];
  }, [guestsSorted, stageFilter, rosterQuery]);
  const rosterActiveFilters = stageFilter !== "All" ? 1 : 0;

  const roomsFiltered = rooms.filter((r) => roomFilter === "All" || r.status === roomFilter);
  const roomChipCounts = Object.fromEntries(ROOM_STATUS_FILTERS.map((f) => [f, f === "All" ? rooms.length : rooms.filter((r) => r.status === f).length])) as Record<RoomStatusFilter, number>;
  const roomEntry = roomSheet ? rooms.find((r) => r.number === roomSheet) : undefined;

  const preArrivalName = cur.name === "preArrivalProfile" ? cur.id : undefined;
  const preArrivalEntry = preArrivalName ? PRE_ARRIVAL_GUESTS.find((g) => g.name === preArrivalName) : undefined;
  const toggleAction = (name: string, idx: number) =>
    setPreArrivalDone((m) => {
      const done = m[name] ?? [];
      return { ...m, [name]: done.includes(idx) ? done.filter((x) => x !== idx) : [...done, idx] };
    });

  const staffName = cur.name === "staffDetail" ? cur.id : undefined;
  const staffEntry = staffName ? STAFF.find((s) => s.name === staffName) : undefined;
  const staffIndex = staffEntry ? STAFF.findIndex((s) => s.name === staffEntry.name) : 0;
  const staffShift = SHIFTS[staffIndex % SHIFTS.length];
  const staffDayOff = staffIndex % 7;
  const staffTasks = staffEntry ? tasks.filter((t) => t.owner === staffEntry.name || t.support.includes(staffEntry.name)) : [];

  const guestName = cur.name === "guestDetail" || cur.name === "guestProfile" ? cur.id : undefined;
  const guestEntry = guestName ? guestMap.get(guestName) : undefined;
  const seedGuestChat = (g?: GuestEntry) => (g && g.convo !== "—" ? [{ from: "guest" as const, text: g.convo }, { from: "ai" as const, text: "Thanks for letting us know — I've flagged this to the team." }] : []);
  const guestThread = guestName ? chat[guestName] ?? seedGuestChat(guestEntry) : [];
  const guestManual = guestName ? !!manual[guestName] : false;
  const sendGuestChat = () => {
    if (!guestName || !draft.trim()) return;
    setChat((c) => ({ ...c, [guestName]: [...guestThread, { from: "me", text: draft.trim() }] }));
    setDraft("");
  };

  /* ---------- shell ---------- */
  const openCreate = () => {
    setService(""); setSev("Medium"); setRoom(""); setDetails("");
    nav.push({ name: "create" });
  };
  const shell = (key: "home" | "tasks" | "guests", body: React.ReactNode) => (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-24 no-scrollbar">{body}</div>
      <FloatingNav
        active={key}
        onChange={(k) => nav.go({ name: k })}
        items={[
          { key: "home", label: "Home", icon: HomeIcon },
          { key: "tasks", label: "Tasks", icon: ListChecks },
          { key: "guests", label: "Guests", icon: MessageCircle },
        ]}
      />
    </div>
  );

  const menuBtn = (
    <button onClick={() => nav.push({ name: "menu" })} aria-label="Menu" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
      <MenuIcon className="h-[18px] w-[18px]" />
    </button>
  );

  const Home = shell("home", (
    <>
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          {menuBtn}
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-ink">{ME}</div>
            <div className="text-[12px] text-ink-secondary">Housekeeping · Department Head</div>
          </div>
        </div>
        <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
          <Bell className="h-[18px] w-[18px]" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>

      <div className="mt-5"><SectionTitle tone="bg-brand">Department operations</SectionTitle></div>
      <div className="mt-3 grid grid-cols-3 gap-3 px-6">
        <StatCard label="Open tasks" value={counts.open} onClick={() => setFilter("All")} />
        <StatCard label="SLA at risk" value={counts.risk} tone="text-amber-600" onClick={() => setFilter("SLA at risk")} />
        <StatCard label="Overdue" value={counts.over} tone="text-red-600" onClick={() => setFilter("SLA breach")} />
        <StatCard label="Escalations" value={counts.esc} tone="text-brand" onClick={() => setFilter("All")} />
        <StatCard label="Complaints" value={counts.complaints} tone="text-violet-600" onClick={() => setFilter("Guest complaint")} />
        <StatCard label="Unassigned critical" value={counts.critical} tone="text-red-600" onClick={() => { const t = tasks.find((x) => x.status === "unassigned" && (x.priority === "High" || x.priority === "Critical")); if (t) open(t.id); }} />
      </div>

      <div className="mt-7"><SectionTitle tone="bg-red-500">Escalations</SectionTitle></div>
      <div className="mt-3"><Chips items={ESC_FILTERS} active={filter} onChange={setFilter} counts={chipCounts} /></div>
      <div className="mt-3 space-y-3 px-6">
        {filtered.map(card)}
        {!filtered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">Nothing escalated in this view.</p>}
      </div>
    </>
  ));

  /* ---------- tasks ---------- */
  const Tasks = shell("tasks", (
    <>
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          {menuBtn}
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-ink">Tasks</div>
            <div className="text-[12px] text-ink-secondary">All Housekeeping tasks</div>
          </div>
        </div>
        <button onClick={openCreate} className="flex h-9 items-center gap-1.5 rounded-2xl bg-brand px-3.5 text-[13px] font-semibold text-white shadow-sm">
          <Plus className="h-4 w-4" /> Create
        </button>
      </div>
      <div className="mt-3 px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={taskQuery}
            onChange={(e) => setTaskQuery(e.target.value)}
            placeholder="Search room, guest or task"
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-3 text-[14px] shadow-sm outline-none placeholder:text-ink-tertiary focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>
      <div className="mt-3"><Chips items={TASK_FILTERS} active={taskFilter} onChange={setTaskFilter} counts={taskChipCounts} /></div>
      <div className="mt-3 space-y-3 px-6">
        {tasksFiltered.map(genericCard)}
        {!tasksFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No tasks match.</p>}
      </div>
    </>
  ));

  /* ---------- team ---------- */
  const teamActiveFilters = (roleFilter !== "All" ? 1 : 0) + (availFilter !== "All" ? 1 : 0);
  const filteredTeam = STAFF.filter((s) => {
    const q = teamQuery.trim().toLowerCase();
    return (roleFilter === "All" || s.role === roleFilter) && (availFilter === "All" || teamStatus(s) === availFilter) && (!q || s.name.toLowerCase().includes(q));
  }).sort((a, b) => AVAIL_ORDER.indexOf(teamStatus(a)) - AVAIL_ORDER.indexOf(teamStatus(b)));

  const filterBtn = (active: number, onClick: () => void) => (
    <button
      onClick={onClick}
      aria-label="Filter"
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-brand text-white" : "bg-white text-ink shadow-sm"}`}
    >
      <Filter className="h-[18px] w-[18px]" />
      {active > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{active}</span>}
    </button>
  );
  const searchRow = (value: string, onChange: (v: string) => void, placeholder: string, filter: React.ReactNode) => (
    <div className="flex items-center gap-2 px-6">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-2xl bg-white pl-10 pr-3 text-[14px] shadow-sm outline-none placeholder:text-ink-tertiary focus:ring-2 focus:ring-brand/30"
        />
      </div>
      {filter}
    </div>
  );

  const Team = (
    <div className="flex h-full flex-col">
      <ScreenHeader onBack={nav.back} title="Team" />
      {searchRow(teamQuery, setTeamQuery, "Search team member", filterBtn(teamActiveFilters, () => setTeamFilterOpen(true)))}
      <div className="min-h-0 flex-1 overflow-y-auto pb-6 pt-3 no-scrollbar">
        <div className="grid grid-cols-3 gap-2 px-6">
          {AVAIL_ORDER.map((s) => (
            <div key={s} className={`rounded-2xl bg-white p-2.5 text-center ${CARD_SHADOW}`}>
              <div className="text-[20px] font-bold text-ink">{STAFF.filter((x) => teamStatus(x) === s).length}</div>
              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-medium text-ink-secondary"><span className={`h-1.5 w-1.5 rounded-full ${PRESENCE_DOT[s]}`} />{s}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-3 px-6">
          {filteredTeam.map((s) => (
            <button key={s.name} onClick={() => nav.push({ name: "staffDetail", id: s.name })} className={`flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left ${CARD_SHADOW}`}>
              <Avatar name={s.name} tone={s.role === "Supervisor" ? "bg-violet-50 text-violet-600" : undefined} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-[14px] font-semibold text-ink">{s.name}</div>
                <div className="text-[12px] text-ink-secondary">{s.role}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary">
                  <span className={`h-2 w-2 rounded-full ${PRESENCE_DOT[teamStatus(s)]}`} />
                  {teamStatus(s)}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
            </button>
          ))}
          {!filteredTeam.length && <p className="rounded-2xl bg-white p-4 text-center text-[13px] text-ink-tertiary">No one matches these filters.</p>}
        </div>
      </div>
    </div>
  );

  const StaffDetail = staffEntry && (
    <div className="flex h-full flex-col">
      <ScreenHeader onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
        <div className="flex items-center gap-3">
          <Avatar name={staffEntry.name} size={56} tone={staffEntry.role === "Supervisor" ? "bg-violet-50 text-violet-600" : undefined} />
          <div className="leading-tight">
            <div className="text-[17px] font-bold text-ink">{staffEntry.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary">
              <span className={`h-2 w-2 rounded-full ${PRESENCE_DOT[teamStatus(staffEntry)]}`} />{teamStatus(staffEntry)} · {staffEntry.role}
            </div>
          </div>
        </div>

        <div className="mt-4"><Segmented items={STAFF_TABS} active={staffTab} onChange={setStaffTab} /></div>

        {staffTab === "Overview" && (
          <div className={`mt-4 rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
            <KvRow label="Phone">{staffEntry.phone}</KvRow>
            <KvRow label="Role">{staffEntry.role}</KvRow>
            <KvRow label="Shift">{staffShift}</KvRow>
            <div className="py-2.5">
              <div className="mb-1.5 text-ink-secondary text-[13px]">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {SKILLS_BY_ROLE[staffEntry.role].map((k) => (
                  <span key={k} className="rounded-full bg-[#F1F1F3] px-2.5 py-1 text-[12px] text-ink-secondary">{k}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {staffTab === "Schedule" && (
          <div className={`mt-4 rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
            {STAFF_DAYS.map((d, i) => (
              <div key={d} className="flex items-center justify-between border-b border-line/70 py-2.5 text-[13px] last:border-0">
                <span className="w-10 font-semibold text-ink">{d}</span>
                <span className={i === staffDayOff ? "text-ink-tertiary" : "text-ink-secondary"}>{i === staffDayOff ? "Off" : staffShift}</span>
              </div>
            ))}
          </div>
        )}

        {staffTab === "Performance" && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Tasks completed", `${18 + staffIndex * 3}`],
                ["Avg completion", `${16 + staffIndex * 2} min`],
                ["Guest rating", "4.8/5"],
                ["Performance", `${86 + staffIndex}%`],
              ].map(([l, v]) => (
                <div key={l} className={`rounded-2xl bg-white p-3 ${CARD_SHADOW}`}>
                  <div className="text-[11px] text-ink-secondary">{l}</div>
                  <div className="mt-1 text-[16px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
            <div className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">This week</div>
            <div className={`rounded-2xl bg-white p-3 ${CARD_SHADOW}`}>
              <BarChart data={STAFF_DAYS.map((d, i) => ({ label: d, value: 4 + ((staffIndex + i * 3) % 10) }))} />
            </div>
            <div className="mb-1 mt-5 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Active tasks</span>
              <span className="text-[12px] text-ink-tertiary">{staffTasks.length}</span>
            </div>
            <div className="space-y-2">
              {staffTasks.map((t) => (
                <button key={t.id} onClick={() => open(t.id)} className={`flex w-full items-center justify-between gap-2 rounded-2xl bg-white p-3 text-left ${CARD_SHADOW}`}>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{t.title}</span>
                  <StatusTag s={t.status} />
                </button>
              ))}
              {!staffTasks.length && <p className={`rounded-2xl bg-white p-4 text-center text-[12px] text-ink-tertiary ${CARD_SHADOW}`}>No active tasks.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ---------- housekeeping (rooms) ---------- */
  const Housekeeping = (
    <div className="flex h-full flex-col">
      <ScreenHeader onBack={nav.back} title="Housekeeping" sub="Room status" />
      <div><Chips items={ROOM_STATUS_FILTERS} active={roomFilter} onChange={setRoomFilter} counts={roomChipCounts} /></div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 pt-3 no-scrollbar">
        {roomsFiltered.map((r) => (
          <button key={r.number} onClick={() => setRoomSheet(r.number)} className={`flex w-full items-center justify-between gap-3 rounded-2xl bg-white p-3.5 text-left ${CARD_SHADOW}`}>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-ink">{r.number}</div>
              <div className="mt-0.5 text-[12px] text-ink-tertiary">{r.assignee ? `Assigned · ${r.assignee}` : "Unassigned"}</div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${ROOM_STATUS_TONE[r.status]}`}>{r.status}</span>
          </button>
        ))}
        {!roomsFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No rooms match.</p>}
      </div>
    </div>
  );

  const RoomSheet = roomEntry && (
    <Sheet title={roomEntry.number} onClose={() => setRoomSheet(null)}>
      <Label>Status</Label>
      <Chips
        items={ROOM_STATUSES}
        active={roomEntry.status}
        onChange={(v) => { setRooms((rs) => rs.map((r) => (r.number === roomEntry.number ? { ...r, status: v } : r))); flash(`${roomEntry.number} marked ${v}`); }}
      />
      <div className="mt-5" />
      <Label>Assign to</Label>
      <StaffPicker
        tasks={tasks}
        exclude={roomEntry.assignee ? [roomEntry.assignee] : []}
        onPick={(s) => { setRooms((rs) => rs.map((r) => (r.number === roomEntry.number ? { ...r, assignee: s.name } : r))); flash(`${roomEntry.number} assigned to ${s.name}`); }}
        cta="Assign"
      />
      {roomEntry.assignee && (
        <GhostButton className="mt-3 w-full" onClick={() => { setRooms((rs) => rs.map((r) => (r.number === roomEntry.number ? { ...r, assignee: null } : r))); flash("Unassigned"); }}>
          Unassign
        </GhostButton>
      )}
    </Sheet>
  );

  /* ---------- guest communication ---------- */
  const Guests = shell("guests", (
    <>
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          {menuBtn}
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-ink">Guest Communication</div>
            <div className="text-[12px] text-ink-secondary">Chat with guests</div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 px-6">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={guestQuery}
            onChange={(e) => setGuestQuery(e.target.value)}
            placeholder="Search guest or room"
            className="h-11 w-full rounded-2xl bg-white pl-10 pr-3 text-[14px] shadow-sm outline-none placeholder:text-ink-tertiary focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <button
          onClick={() => setGuestFilterOpen(true)}
          aria-label="Filter"
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${guestActiveFilters ? "bg-brand text-white" : "bg-white text-ink shadow-sm"}`}
        >
          <Filter className="h-[18px] w-[18px]" />
          {guestActiveFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{guestActiveFilters}</span>
          )}
        </button>
      </div>
      <div className="mt-3 space-y-3 px-6">
        {guestsFiltered.map((g) => (
          <button key={g.name} onClick={() => nav.push({ name: "guestDetail", id: g.name })} className={`flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left ${CARD_SHADOW}`}>
            <Avatar name={g.name} tone={g.complaint ? "bg-red-50 text-red-600" : undefined} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-2">
                <span className="truncate text-[14px] font-semibold text-ink">{g.name}</span>
                {g.complaint && <span className="shrink-0 rounded-full bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600">Complaint</span>}
              </div>
              <div className="text-[12px] text-ink-tertiary">{g.room}</div>
              <p className="mt-0.5 truncate text-[12px] text-ink-secondary">{g.convo !== "—" ? g.convo : "No messages yet"}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
          </button>
        ))}
        {!guestsFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No guests match.</p>}
      </div>
    </>
  ));

  const GuestDetail = guestEntry && (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-center gap-3 px-6 pb-3 pt-4">
        <button onClick={nav.back} aria-label="Back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => nav.push({ name: "guestProfile", id: guestName })} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <Avatar name={guestEntry.name} size={34} tone={guestEntry.complaint ? "bg-red-50 text-red-600" : undefined} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[18px] font-bold text-ink">{guestEntry.name}</div>
            <div className="text-[12px] text-ink-secondary">{guestEntry.room}</div>
          </div>
        </button>
      </div>
      <div className={`flex shrink-0 items-center justify-between gap-3 border-y border-line px-6 py-2.5 text-[12px] ${guestManual ? "bg-brand-tint/50 text-brand" : "bg-violet-50 text-violet-700"}`}>
        <span className="font-medium">{guestManual ? "You're replying — AI is paused" : "ALFON AI is replying automatically"}</span>
        <button
          onClick={() => { setManual((m) => ({ ...m, [guestName!]: !guestManual })); flash(guestManual ? "Handed back to AI" : "AI paused — you're now replying"); }}
          aria-pressed={guestManual}
          aria-label="Take over"
          className="flex items-center gap-2"
        >
          <span className="text-[11px] font-semibold">Take over</span>
          <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${guestManual ? "bg-brand" : "bg-[#D8D8DC]"}`}>
            <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${guestManual ? "translate-x-5" : ""}`} />
          </span>
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-6 py-4">
        {!guestThread.length && <p className="py-6 text-center text-[12px] text-ink-tertiary">No messages yet.</p>}
        {guestThread.map((m, i) => (
          <div key={i} className={`flex ${m.from === "guest" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${m.from === "guest" ? "bg-[#F1F1F3] text-ink" : m.from === "ai" ? "bg-violet-50 text-ink" : "bg-brand-tint text-ink"}`}>
              {m.text}
              <div className="mt-1 text-[10px] font-semibold text-ink-tertiary">{m.from === "ai" ? "ALFON AI" : m.from === "me" ? "You" : "Guest"}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-line px-6 py-3">
        <input
          value={draft}
          disabled={!guestManual}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendGuestChat()}
          placeholder={guestManual ? "Reply as hotel staff…" : "Take over to reply"}
          className="h-11 flex-1 rounded-2xl border border-line px-4 text-[14px] outline-none focus:border-brand disabled:bg-[#F6F6F8]"
        />
        <button onClick={sendGuestChat} disabled={!guestManual || !draft.trim()} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const GuestProfile = guestEntry && (
    <div className="flex h-full flex-col">
      <ScreenHeader
        onBack={nav.back}
        title={guestEntry.name}
        sub={guestEntry.room}
        right={
          guestEntry.complaint ? (
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">Complaint</span>
          ) : undefined
        }
      />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 no-scrollbar">
        {guestEntry.checkIn && (
          <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
            <div className="flex items-center gap-3">
              <Avatar name={guestEntry.name} size={48} tone={guestEntry.complaint ? "bg-red-50 text-red-600" : undefined} />
              <div className="text-[13px] font-medium text-ink-secondary">In-house guest</div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-[12px]">
              <div><div className="text-ink-tertiary">Check-in</div><div className="mt-0.5 text-[13px] font-bold text-ink">{guestEntry.checkIn}</div></div>
              <div><div className="text-ink-tertiary">Check-out</div><div className="mt-0.5 text-[13px] font-bold text-ink">{guestEntry.checkOut}</div></div>
            </div>
          </div>
        )}

        <ProfileSection icon={User} label="Guest profile" tone="blue">
          <p className="text-[13px] leading-relaxed text-ink">{guestEntry.summary}</p>
        </ProfileSection>

        {guestEntry.complaint && (
          <ProfileSection icon={Lightbulb} label="Anticipated needs" tone="amber">
            <p className="text-[13px] leading-relaxed text-ink">
              {guestEntry.complaint
                ? `Sentiment: ${guestEntry.sentiment} · Risk: ${guestEntry.risk}. Prioritize a fast, empathetic resolution.`
                : "Anticipate extra attention and proactive service."}
            </p>
          </ProfileSection>
        )}

        <ProfileSection icon={Bell} label="Actions" tone="red">
          <div className="-mb-2.5">
            {guestEntry.items.map((t, i) => (
              <ActionRow key={t.id} n={i + 1} text={t.title} dept="Housekeeping" done={t.status === "completed"} onClick={() => open(t.id)} />
            ))}
            {!guestEntry.items.length && <p className="py-3 text-center text-[12px] text-ink-tertiary">No requests yet.</p>}
          </div>
        </ProfileSection>

        {guestEntry.prefs.length > 0 && (
          <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
            <div className="text-[11px] font-semibold text-ink-secondary">Preferences</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {guestEntry.prefs.map((p) => <span key={p} className="rounded-full bg-[#F1F1F3] px-2.5 py-1 text-[12px] text-ink-secondary">{p}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const PreArrivalProfile = preArrivalEntry && (
    <div className="flex h-full flex-col">
      <ScreenHeader
        onBack={nav.back}
        title={preArrivalEntry.name}
        sub={`${preArrivalEntry.room} · ${preArrivalEntry.roomType}`}
        right={<span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">Pre-Arrival</span>}
      />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 no-scrollbar">
        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="flex items-center gap-3">
            <Avatar name={preArrivalEntry.name} size={48} />
            <div className="leading-tight">
              <div className="text-[13px] font-medium text-ink-secondary">{preArrivalEntry.flag} {preArrivalEntry.country}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line pt-3 text-[12px]">
            <div><div className="text-ink-tertiary">Check-in</div><div className="mt-0.5 text-[13px] font-bold text-ink">{preArrivalEntry.checkIn}</div></div>
            <div><div className="text-ink-tertiary">Check-out</div><div className="mt-0.5 text-[13px] font-bold text-ink">{preArrivalEntry.checkOut}</div></div>
          </div>
          <div className="mt-1 text-[12px] text-ink-tertiary">{preArrivalEntry.nights} night{preArrivalEntry.nights === 1 ? "" : "s"}</div>
        </div>

        <ProfileSection icon={User} label="Guest profile" tone="blue">
          <p className="text-[13px] leading-relaxed text-ink">{preArrivalEntry.profile}</p>
        </ProfileSection>

        <ProfileSection icon={Lightbulb} label="Anticipated needs" tone="amber">
          <p className="text-[13px] leading-relaxed text-ink">{preArrivalEntry.anticipatedNeeds}</p>
        </ProfileSection>

        <ProfileSection icon={Bell} label="Actions" tone="red">
          <div className="-mb-2.5">
            {preArrivalEntry.actions.map((a, i) => (
              <ActionRow
                key={i}
                n={i + 1}
                text={a.text}
                dept={a.dept}
                done={(preArrivalDone[preArrivalEntry.name] ?? []).includes(i)}
                onClick={() => toggleAction(preArrivalEntry.name, i)}
              />
            ))}
          </div>
        </ProfileSection>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[11px] font-semibold text-ink-secondary">Preferences</div>
          <div className="mt-2 divide-y divide-line/70">
            {preArrivalEntry.prefs.map((p) => (
              <div key={p.label} className="flex items-start justify-between gap-3 py-2 text-[13px]">
                <span className="text-ink-tertiary">{p.label}</span>
                <span className="text-right font-medium text-ink">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Detail = task ? (
    <div className="relative flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-6 pb-3 pt-4">
        <button onClick={nav.back} aria-label="Back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-[13px] font-semibold text-ink-secondary">Task detail</span>
        {task.status !== "completed" && <div className="ml-auto"><SlaCountdown left={task.slaLeft} total={task.slaTotal} /></div>}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 pt-4 no-scrollbar">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand"><BedDouble className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold leading-snug text-ink">{task.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <PriorityPill p={task.priority} />
              <StatusTag s={task.status} />
            </div>
          </div>
        </div>

        <div className="divide-y divide-line rounded-2xl border border-line bg-white px-4">
          <DetailRow icon={User} label="Guest">
            <button onClick={() => nav.push({ name: "guestProfile", id: task.guest })} className="flex items-center gap-1 text-left font-semibold text-brand">
              {task.guest} <ChevronRight className="h-4 w-4" />
            </button>
          </DetailRow>
          <DetailRow icon={BedDouble} label="Room">{task.room}</DetailRow>
          <DetailRow icon={Building2} label="Department">Housekeeping</DetailRow>
          <DetailRow icon={UserCog} label="Assigned to">{task.owner ?? <span className="text-red-600">Unassigned</span>}</DetailRow>
          {task.support.length > 0 && <DetailRow icon={UserPlus} label="Support">{task.support.join(", ")}</DetailRow>}
        </div>

        <div className="rounded-2xl bg-[#F6F6F8] p-4">
          <div className="text-[12px] font-semibold text-ink-tertiary">Notes</div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{task.note}</p>
        </div>

        {SEED_REQUESTS.filter((r) => r.taskId === task.id).map((r) => (
          <div key={r.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-amber-800"><AlertTriangle className="h-4 w-4" /> Note from {r.staff} · {r.reason}</div>
            <p className="mt-1.5 text-[13px] leading-snug text-ink">{r.note}</p>
          </div>
        ))}

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[11px] font-semibold text-ink-secondary">Timeline</div>
          <ol className="relative mt-3 space-y-3 border-l border-line pl-4">
            {task.timeline.map((e, i) => (
              <li key={i} className="relative text-[13px]">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand" />
                <span className="mr-2 text-[12px] text-ink-tertiary">{e.t}</span>
                <span className="text-ink">{e.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <button
        onClick={() => nav.push({ name: "guestDetail", id: task.guest })}
        aria-label="Message guest"
        className="absolute bottom-24 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_6px_18px_rgba(241,90,36,0.4)]"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {task.status !== "completed" && (
        <div className="flex shrink-0 gap-3 px-6 pb-6 pt-3">
          <GhostButton className="flex-1" onClick={() => setSheet({ k: "needHelp", taskId: task.id })}>Assist</GhostButton>
          {task.owner === ME ? (
            <PrimaryButton
              className="flex-[1.3]"
              onClick={() => { patch(task.id, { status: "completed", escalated: false }, `${ME} marked complete`); flash("Task marked complete"); nav.back(); }}
            >
              Complete
            </PrimaryButton>
          ) : (
            <PrimaryButton
              className="flex-[1.3]"
              onClick={() => { patch(task.id, { owner: ME, status: "progress" }, `${ME} accepted the task`); flash("Task assigned to you"); }}
            >
              Accept
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  ) : null;

  const Notifications = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Notifications" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {NOTIFS.map((n, i) => {
          const nt = n.to !== "team" ? tasks.find((x) => x.id === n.to) : undefined;
          return (
            <button key={i} onClick={() => (n.to === "team" ? nav.push({ name: "team" }) : open(n.to))} className="relative flex w-full flex-col border-b border-dashed border-ink/20 py-3.5 pr-14 text-left last:border-0">
              <p className="text-[14px] leading-snug text-ink">{n.text}</p>
              {nt && (
                <div className="mt-1.5 flex items-center gap-2">
                  <PriorityPill p={nt.priority} />
                  {nt.status !== "completed" && (
                    <span className={`text-[12px] font-semibold ${nt.slaLeft < 0 ? "text-red-600" : "text-ink-secondary"}`}>
                      {fmtMins(nt.slaLeft)}{nt.slaLeft < 0 ? " over" : " left"}
                    </span>
                  )}
                </div>
              )}
              <span className="absolute right-0 top-3.5 text-[11px] text-ink-tertiary">{n.time}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const Create = (
    <div className="flex h-full flex-col">
      <TextHeader title="Create Manual Task" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-4 no-scrollbar">
        <SelectField value="Housekeeping" onChange={() => {}} placeholder="Department" options={["Housekeeping"]} disabled />
        <div className="mt-3"><SelectField value={service} onChange={setService} placeholder="Select service" options={services} /></div>
        <Label>How severe is it?</Label>
        <Segmented items={SEVS} active={sev as (typeof SEVS)[number]} onChange={(v) => setSev(v)} colors={SEV_COLOR} />
        <p className="mt-2 px-1 text-[12px] text-ink-tertiary">Resolution SLA: <span className="font-semibold text-ink-secondary">{SEV_SLA[sev]} min</span></p>
        <Label>Room</Label>
        <TextField value={room} onChange={setRoom} placeholder="e.g. 501" />
        <Label>Details</Label>
        <TextField rows={4} value={details} onChange={setDetails} placeholder="Enter more details" />
      </div>
      <div className="shrink-0 px-6 pb-6 pt-2">
        <PrimaryButton
          className="w-full"
          disabled={!service || !room.trim()}
          onClick={() => {
            const id = "n" + Date.now();
            setTasks((ts) => [{
              id, room: `Room ${room.trim().replace(/^room\s*/i, "")}`, guest: "Guest", title: service, note: details || service, priority: sev, status: "unassigned", owner: null, support: [],
              slaTotal: SEV_SLA[sev], slaLeft: SEV_SLA[sev], isNew: true, createdAt: "now", pickup: "Not yet picked up", summary: details || service, prefs: [], convo: "Created manually by the department head.",
              timeline: [{ t: "now", text: `Created manually by ${ME}` }], notes: [],
            }, ...ts]);
            nav.go({ name: "home" });
            flash(sev === "High" || sev === "Critical" ? "Task created — unassigned critical" : "Task created — unassigned");
          }}
        >
          Create Task
        </PrimaryButton>
      </div>
    </div>
  );

  const Menu = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="More" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {MENU_ITEMS.map((m) => (
          <button
            key={m.key}
            onClick={() => nav.push({ name: m.key })}
            className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ${CARD_SHADOW}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand"><m.icon className="h-[18px] w-[18px]" /></div>
            <div className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{m.label}</div>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
          </button>
        ))}
      </div>
    </div>
  );

  const Analytics = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Analytics" sub="Housekeeping · this period" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total tasks" value={HK_DEPT.tasks.toLocaleString()} />
          <StatCard label="Completed" value={`${HK_METRICS.done}%`} tone="text-emerald-600" />
          <StatCard label="Overdue" value={HK_METRICS.overdue} tone="text-red-600" />
          <StatCard label="Avg response" value={HK_METRICS.resp} />
        </div>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[13px] font-semibold text-ink">Task breakdown</div>
          <div className="mt-4 flex justify-center">
            <div className="relative">
              <Donut size={150} thickness={24} segments={HK_DEPT.items.map(([l, v], i) => ({ label: l, value: v, color: HK_DONUT_COLORS[i] }))} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[18px] font-bold text-ink">{HK_DEPT.tasks.toLocaleString()}</span>
                <span className="text-[10px] text-ink-tertiary">tasks</span>
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {HK_DEPT.items.map(([l, v], i) => (
              <div key={l} className="flex items-center gap-2 text-[12px]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: HK_DONUT_COLORS[i] }} />
                <span className="flex-1 truncate text-ink-secondary">{l}</span>
                <span className="font-semibold text-ink">{v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[13px] font-semibold text-ink">Recurring complaints</div>
          <div className="mt-2 divide-y divide-line">
            {HK_COMPLAINTS.map((c) => (
              <div key={c.name} className="flex items-center justify-between py-2 text-[12px]">
                <span className="text-ink">{c.name}</span>
                <span className="font-semibold text-ink">{c.v}</span>
              </div>
            ))}
            {!HK_COMPLAINTS.length && <p className="py-3 text-center text-[12px] text-ink-tertiary">No recurring complaints.</p>}
          </div>
        </div>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[13px] font-semibold text-ink">Top requests</div>
          <div className="mt-2 divide-y divide-line">
            {HK_TOP_REQUESTS.map(([l, v], i) => (
              <div key={l} className="flex items-center gap-2 py-2 text-[12px]">
                <span className="text-ink-tertiary">{i + 1}</span>
                <span className="flex-1 truncate text-ink">{l}</span>
                <span className="font-semibold text-ink">{v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const GuestsRoster = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Guests" sub="All hotel guests" onBack={nav.back} />
      {searchRow(rosterQuery, setRosterQuery, "Search guest or room", filterBtn(rosterActiveFilters, () => setRosterFilterOpen(true)))}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 pt-3 no-scrollbar">
        {rosterFiltered.map((row) =>
          row.stage === "Current" ? (
            <button key={row.g.name} onClick={() => nav.push({ name: "guestDetail", id: row.g.name })} className={`flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left ${CARD_SHADOW}`}>
              <Avatar name={row.g.name} tone={row.g.complaint ? "bg-red-50 text-red-600" : undefined} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-ink">{row.g.name}</span>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">In-house</span>
                </div>
                <div className="text-[12px] text-ink-tertiary">{row.g.room}{row.g.checkIn ? ` · ${row.g.checkIn} – ${row.g.checkOut}` : ""}</div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
            </button>
          ) : row.stage === "Upcoming" ? (
            <button key={row.g.name} onClick={() => nav.push({ name: "preArrivalProfile", id: row.g.name })} className={`w-full rounded-2xl bg-white p-3.5 text-left ${CARD_SHADOW}`}>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-ink">{row.g.name}</span>
                <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">Pre-arrival</span>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-ink-tertiary" />
              </div>
              <div className="mt-0.5 text-[12px] text-ink-tertiary">{row.g.room}</div>
              <div className="mt-1 text-[12px] font-semibold text-brand">Arriving {row.g.eta}</div>
              <p className="mt-1.5 text-[12px] leading-snug text-ink-secondary">{row.g.notes}</p>
            </button>
          ) : (
            <div key={row.g.name} className={`flex items-center gap-3 rounded-2xl bg-white p-3.5 opacity-70 ${CARD_SHADOW}`}>
              <Avatar name={row.g.name} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold text-ink">{row.g.name}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">Checked out</span>
                </div>
                <div className="text-[12px] text-ink-tertiary">{row.g.room} · {row.g.checkIn} – {row.g.checkOut}</div>
              </div>
            </div>
          ),
        )}
        {!rosterFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No guests match.</p>}
      </div>
    </div>
  );

  const VIEWS: Record<Screen["name"], React.ReactNode> = {
    home: Home, tasks: Tasks, team: Team, staffDetail: StaffDetail, housekeeping: Housekeeping, guests: Guests, guestDetail: GuestDetail, guestProfile: GuestProfile,
    preArrivalProfile: PreArrivalProfile, detail: Detail, notifications: Notifications, create: Create,
    menu: Menu, analytics: Analytics, guestsRoster: GuestsRoster,
  };

  /* ---------- sheets ---------- */
  const t0 = sheet && "taskId" in sheet ? tasks.find((t) => t.id === sheet.taskId) : undefined;

  const closeHelpSheet = () => { setSheet(null); setNeedHelpReason(""); };

  const sheetNode = !sheet ? null : (
    <>
      {sheet.k === "needHelp" && t0 && (
        <Sheet title="Assist" onClose={() => setSheet(null)}>
          <p className="mb-3 text-[13px] text-ink-secondary">{t0.room} · {t0.title}</p>
          <div className="space-y-2.5">
            <button onClick={() => setSheet({ k: "assign", taskId: t0.id })} className="flex w-full items-center gap-3 rounded-2xl border border-line p-3.5 text-left active:bg-brand-tint/40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"><UserCog className="h-[18px] w-[18px]" /></span>
              <span className="text-[14px] font-semibold text-ink">Reassign task</span>
            </button>
            <button onClick={() => setSheet({ k: "support", taskId: t0.id })} disabled={!t0.owner} className="flex w-full items-center gap-3 rounded-2xl border border-line p-3.5 text-left active:bg-brand-tint/40 disabled:opacity-40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><UserPlus className="h-[18px] w-[18px]" /></span>
              <span className="text-[14px] font-semibold text-ink">Add support</span>
            </button>
            <button onClick={() => setSheet({ k: "gm", taskId: t0.id })} className="flex w-full items-center gap-3 rounded-2xl border border-line p-3.5 text-left active:bg-brand-tint/40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"><ArrowUpRight className="h-[18px] w-[18px]" /></span>
              <span className="text-[14px] font-semibold text-ink">Escalate to GM</span>
            </button>
          </div>
        </Sheet>
      )}
      {sheet.k === "assign" && t0 && (
        <Sheet title={t0.owner ? "Change owner" : "Assign task"} onClose={closeHelpSheet}>
          <p className="mb-3 text-[13px] text-ink-secondary">Within Housekeeping only · {t0.room}</p>
          <Label>Reason</Label>
          <TextField rows={2} value={needHelpReason} onChange={setNeedHelpReason} placeholder="Why does this need to be reassigned?" />
          <div className={`mt-4 ${needHelpReason.trim() ? "" : "pointer-events-none opacity-40"}`}>
            <GhostButton
              className="w-full"
              onClick={() => { patch(t0.id, { owner: null, status: "unassigned" }, `${ME} reopened the task for anyone — ${needHelpReason.trim()}`); closeHelpSheet(); flash("Reopened for anyone to pick up"); }}
            >
              Reopen — let anyone pick it up
            </GhostButton>
            <div className="my-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
              <span className="h-px flex-1 bg-line" /> or assign to someone <span className="h-px flex-1 bg-line" />
            </div>
            <StaffPicker tasks={tasks} exclude={t0.owner ? [t0.owner] : []} onPick={(s) => { patch(t0.id, { owner: s.name, status: "assigned" }, `${ME} assigned to ${s.name} — ${needHelpReason.trim()}`); closeHelpSheet(); flash(`Assigned to ${s.name}`); }} cta="Assign" />
          </div>
        </Sheet>
      )}
      {sheet.k === "support" && t0 && (
        <Sheet title="Add support staff" onClose={closeHelpSheet}>
          <Label>Reason</Label>
          <TextField rows={2} value={needHelpReason} onChange={setNeedHelpReason} placeholder="Why do you need extra support?" />
          <div className={`mt-4 ${needHelpReason.trim() ? "" : "pointer-events-none opacity-40"}`}>
            <StaffPicker tasks={tasks} exclude={[t0.owner ?? "", ...t0.support]} onPick={(s) => { patch(t0.id, { support: [...t0.support, s.name] }, `${s.name} added as support — ${needHelpReason.trim()}`); closeHelpSheet(); flash(`${s.name} notified`); }} cta="Add" />
          </div>
        </Sheet>
      )}
      {sheet.k === "gm" && t0 && (
        <ReasonSheet title="Escalate to High Management" reasons={["Critical guest complaint", "Repeated SLA breach", "Unresolved operational issue", "VIP / high-risk situation", "Serious service recovery"]} requireNote placeholder="Context for the General Manager…" cta="Escalate to GM" tone="bg-red-600" onClose={() => setSheet(null)}
          onSubmit={(reason, note) => { patch(t0.id, { escType: (t0.escType ?? "Supervisor escalation") as EscType, notes: [{ by: ME, t: "Just now", text: `Escalated to GM — ${reason}: ${note}` }, ...t0.notes] }, `${ME} escalated to General Manager`); setSheet(null); flash("Escalated to the General Manager"); }} />
      )}
    </>
  );

  const TeamFilterSheet = teamFilterOpen && (
    <Sheet title="Filter team" onClose={() => setTeamFilterOpen(false)}>
      <Label>Role</Label>
      <Chips items={ROLE_FILTERS} active={roleFilter} onChange={setRoleFilter} />
      <div className="mt-5" />
      <Label>Availability</Label>
      <Chips items={AVAIL_FILTERS} active={availFilter} onChange={setAvailFilter} />
      <PrimaryButton className="mt-6 w-full" onClick={() => setTeamFilterOpen(false)}>Done</PrimaryButton>
      {teamActiveFilters > 0 && (
        <GhostButton className="mt-2 w-full" onClick={() => { setRoleFilter("All"); setAvailFilter("All"); }}>Clear filters</GhostButton>
      )}
    </Sheet>
  );

  const GuestFilterSheet = guestFilterOpen && (
    <Sheet title="Filter guests" onClose={() => setGuestFilterOpen(false)}>
      <Label>Show</Label>
      <Chips items={GUEST_FILTERS} active={guestFilter} onChange={setGuestFilter} />
      <PrimaryButton className="mt-6 w-full" onClick={() => setGuestFilterOpen(false)}>Done</PrimaryButton>
      {guestActiveFilters > 0 && <GhostButton className="mt-2 w-full" onClick={() => setGuestFilter("All")}>Clear filter</GhostButton>}
    </Sheet>
  );

  const RosterFilterSheet = rosterFilterOpen && (
    <Sheet title="Filter guests" onClose={() => setRosterFilterOpen(false)}>
      <Chips items={ROSTER_STAGE_FILTERS} active={stageFilter} onChange={setStageFilter} />
      <PrimaryButton className="mt-6 w-full" onClick={() => setRosterFilterOpen(false)}>Done</PrimaryButton>
      {rosterActiveFilters > 0 && <GhostButton className="mt-2 w-full" onClick={() => setStageFilter("All")}>Clear filter</GhostButton>}
    </Sheet>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame>
        {VIEWS[cur.name]}
        {sheetNode}
        {TeamFilterSheet}
        {GuestFilterSheet}
        {RosterFilterSheet}
        {RoomSheet}
        {toast}
      </PhoneFrame>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary"
          onClick={() => {
            nav.reset(); setTasks(SEED_TASKS); setRooms(ROOMS); setSheet(null); setNeedHelpReason(""); setChat({}); setManual({});
            setFilter("All"); setRoleFilter("All"); setAvailFilter("All"); setGuestFilter("All"); setGuestQuery("");
            setTaskFilter("All"); setTaskQuery(""); setStageFilter("All"); setRosterQuery(""); setTeamQuery(""); setStaffTab("Overview"); setRoomFilter("All"); setRoomSheet(null); setPreArrivalDone({});
          }}
        >
          Reset
        </button>
      </div>
      <p className="text-center text-[12px] text-ink-tertiary">Current screen: <span className="font-medium text-ink-secondary">{cur.name}</span> · open Guests to chat with a guest, or Room 1103 to see full task context.</p>
    </div>
  );
}
