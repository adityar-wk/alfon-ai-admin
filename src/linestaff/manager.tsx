import { Button } from "../components/ui";
import { Logo } from "../components/Logo";
import { useMemo, useState } from "react";
import {
  Bell, LayoutDashboard, CheckSquare, MessageSquare, Plus, Users, UserCog, UserPlus, ArrowUpRight, Send, Filter, ChevronRight, ChevronLeft, Search,
  UserRound, BarChart3, AlertTriangle, User, BedDouble, DoorOpen, DoorClosed, Building2, FileText, Download, UtensilsCrossed, Languages, Thermometer, AlarmClock, Wine, Phone, Mail, Sparkles, SlidersHorizontal, LogOut,
  CheckCircle2, Clock, Loader, AlertCircle, CircleSlash, Wrench, ClipboardCheck, Timer,
} from "lucide-react";
import { CLEANING_CHECKLIST, INSPECTION_CHECKLIST, TAG_TONE } from "../data/housekeepingChecklists";
import { DEPARTMENTS } from "../data/departments";
import { useClock } from "../data/attention";
import { DetailRow, ProfileSection, GuestProfileScreen, GuestChatScreen, MessageGuestButton } from "./guestviews";
import { pastel } from "../data/pastel";
import { NotificationSettingsScreen, SignedOutScreen } from "./profile";
import { DEPTS, METRICS, COMPLAINT_DETAIL } from "../pages/Analytics";
import { Donut } from "../components/Donut";
import { BarChart } from "../components/BarChart";
import { SEED_TASKS, SEED_REQUESTS, STAFF, GUEST_STAYS, PRE_ARRIVAL_GUESTS, CHECKED_OUT_GUESTS, GUEST_PROFILES, ROOMS, roomTypeOf, type MTask, type Presence, type Staffer, type HkRoom, type RoomStatus, type EscType } from "./data";
import {
  PhoneFrame, ScreenHeader, SectionTitle, TaskCard, StatCard, HomeStat, Avatar, Chips, Segmented, FloatingNav, SelectField, TextField, Label, Sheet,
  useNav, useToast, CARD_SHADOW, TextHeader, SlaCountdown, fmtMins, CompensationSheet, slaTone, type Priority,
  ChatRow,
  NotifRow,
  PersonRow,
  SearchField,
  sampleUnread,
  ManualTaskFields,
} from "./mobile";
import { StaffPicker, ReasonSheet, StatusTag, activeCount, atRiskCount, overdueCount, isOpen, isAtRisk, isOverdue } from "./parts";

type Screen = {
  name: "home" | "tasks" | "team" | "staffDetail" | "housekeeping" | "guests" | "guestDetail" | "guestProfile" | "detail" | "notifications" | "create" | "menu" | "analytics" | "reports" | "guestsRoster" | "notifSettings";
  id?: string;
};
type SheetState = { k: "needHelp" | "assign" | "support" | "duty" | "void"; taskId: string } | null;
const VOID_REASONS = ["Task no longer required", "Duplicate", "Wrong info"] as const;

const ME = "Daniel Reyes";
const ME_INITIALS = ME.split(" ").map((p) => p[0]).join("").slice(0, 2);
/** FloatingNav icon: filled initials avatar that follows active/inactive text color. */
function MoreNavIcon({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className ?? ""}`}>
      <span className="flex h-full w-full items-center justify-center rounded-full bg-current">
        <span className="text-[9px] font-bold leading-none text-white">{ME_INITIALS}</span>
      </span>
    </span>
  );
}
const ESC_FILTERS = ["All", "SLA breach", "SLA at risk", "Guest complaint", "Staffing issue", "Supervisor escalation", "High priority"] as const;
const DEFAULT_SLA = 40;
type EscFilter = (typeof ESC_FILTERS)[number];
const ROLE_FILTERS = ["All", "Supervisor", "Line Staff"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];
const GUEST_FILTERS = ["All", "Unread", "Complaints", "Open requests", "Pre-arrival"] as const;
type GuestFilter = (typeof GUEST_FILTERS)[number];
const ROSTER_STAGE_FILTERS = ["All", "In-house", "Pre-arrival", "Checked out"] as const;
type RosterStage = (typeof ROSTER_STAGE_FILTERS)[number];
const ROOM_STATUS_FILTERS = ["All", "In Progress", "Needs Inspection", "Out of Service", "Out of Order", "Inspected"] as const;
type RoomStatusFilter = (typeof ROOM_STATUS_FILTERS)[number];
const ROOM_STATUSES = ["Inspected", "In Progress", "Needs Inspection", "Out of Service", "Out of Order"] as const;
/** matches the colour coding used on the web Housekeeping tab */
const CARD_BADGE: Record<MTask["status"], string> = { unassigned: "Pending", assigned: "In Progress", progress: "In Progress", completed: "Completed", void: "Void" };
const ROOM_STATUS_ICON: Record<RoomStatus, React.ComponentType<{ className?: string }>> = {
  Inspected: CheckCircle2,
  "In Progress": Loader,
  "Needs Inspection": AlertCircle,
  "Out of Service": CircleSlash,
  "Out of Order": Wrench,
};
const ROOM_STATUS_ICON_TONE: Record<RoomStatus, string> = {
  Inspected: "bg-green-50 text-success",
  "In Progress": "bg-brand-tint text-brand",
  "Needs Inspection": "bg-amber-50 text-amber-600",
  "Out of Service": "bg-red-50 text-danger",
  "Out of Order": "bg-subtle text-ink-tertiary",
};
const ROOM_CARD_TEXT: Record<RoomStatus, string> = {
  Inspected: "text-green-600",
  "In Progress": "text-blue-600",
  "Needs Inspection": "text-amber-600",
  "Out of Service": "text-red-600",
  "Out of Order": "text-gray-500",
};
const ROOM_SLA_MINS: Partial<Record<RoomStatus, number>> = { "In Progress": 30, "Needs Inspection": 15 };
const roomDue = (s: RoomStatus) => {
  const m = ROOM_SLA_MINS[s];
  return m ? Date.now() + m * 60_000 : undefined;
};
const seedRooms = () => ROOMS.map((r) => ({ ...r, due: r.mins != null ? Date.now() + r.mins * 60_000 : undefined }));

function RoomTimer({ room }: { room: HkRoom }) {
  useClock();
  if (room.due == null) return null;
  const secs = Math.round((room.due - Date.now()) / 1000);
  const tone = slaTone(secs / 60, ROOM_SLA_MINS[room.status] ?? 30);
  const abs = Math.abs(secs);
  return (
    <span className={`flex shrink-0 items-center gap-1 font-medium tabular-nums ${tone.text}`}>
      <Timer className="h-3 w-3" /> {secs < 0 ? "-" : ""}{String(Math.floor(abs / 60)).padStart(2, "0")}:{String(abs % 60).padStart(2, "0")}
    </span>
  );
}

/** The same housekeeper / SLA block on the room sheet and both checklists. */
function RoomSummary({ room, progress }: { room: HkRoom; progress?: { done: number; total: number } }) {
  const role = room.status === "Needs Inspection" ? "Inspector" : "Housekeeper";
  const who = room.assignee ?? (room.open ? "Open task" : "Unassigned");
  const pct = progress ? Math.round((progress.done / Math.max(progress.total, 1)) * 100) : 0;
  const row = "flex items-center justify-between gap-3 py-3 text-[13px]";
  return (
    <div className="rounded-2xl bg-[#F6F6F8] px-4">
      <div className={row}>
        <span className="text-ink-secondary">{role}</span>
        <span className={`truncate font-semibold ${room.open && !room.assignee ? "text-amber-700" : "text-ink"}`}>{who}</span>
      </div>
      <div className={`${row} border-t border-[#E8E8EC]`}>
        <span className="text-ink-secondary">SLA</span>
        {room.due != null ? <RoomTimer room={room} /> : <span className="font-medium text-ink">—</span>}
      </div>
      {progress && (
        <div className="border-t border-[#E8E8EC] py-3">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-secondary">Progress</span>
            <span className="font-semibold text-ink">{progress.done} / {progress.total}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
const TASK_FILTERS = ["All", "Unassigned", "At Risk", "Overdue", "Completed"] as const;
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



const MENU_ITEMS = [
  { key: "team" as const, label: "Team Management", icon: Users },
  { key: "housekeeping" as const, label: "Housekeeping", icon: DoorOpen },
  { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
  { key: "reports" as const, label: "Reports", icon: FileText },
];

const REPORTS: { name: string; desc: string }[] = [
  { name: "Action Report", desc: "All proactive guest actions flagged by Alfon AI — department, assignee, and completion status." },
  { name: "Pre-Arrival Preference Report", desc: "Amenity preparation guide per arriving guest — dietary, minibar, room setup, and special requests." },
  { name: "Task Report", desc: "Breakdown of all tasks by department, status, and response time." },
  { name: "Complaint Report", desc: "Guest complaints logged, their category, and resolution status." },
  { name: "Team Performance Report", desc: "Tasks completed, on-time rate, and workload by team member." },
  { name: "Guest Satisfaction Report", desc: "Satisfaction scores and trends across the selected period." },
  { name: "SLA Breach Report", desc: "Tasks that missed their SLA escalation window, by department." },
  { name: "Response Time Report", desc: "Average and peak response times across departments and channels." },
  { name: "Audit Trail", desc: "Escalations, overrides, reassignments and other task changes with who did what and when." },
];

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
const downloadCsv = (name: string, rows: (string | number)[][]) => {
  const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};

/* ---------- Housekeeping analytics, sourced from the desktop Analytics page ---------- */
const HK_DEPT = DEPTS.find((d) => d.name === "Housekeeping")!;
const HK_METRICS = METRICS["Housekeeping"];
const HK_COMPLAINTS = Object.entries(COMPLAINT_DETAIL)
  .map(([name, c]) => ({ name, v: c.by.filter(([d]) => d === "Housekeeping").reduce((a, [, x]) => a + x, 0), delta: c.delta }))
  .filter((x) => x.v > 0)
  .sort((a, b) => b.v - a.v);
const HK_TOP_REQUESTS = [...HK_DEPT.items].filter(([l]) => l !== "Other").sort((a, b) => b[1] - a[1]).slice(0, 5);
/** Compact mobile analytics extras — aligned with desktop SATISFACTION / peak-hour heat */
const HK_SATISFACTION = { score: 4.7, delta: "+0.2", promoters: 72, neutral: 19, detractors: 9 };
const HK_PEAK_HOURS: { dept: string; peak: string; load: number }[] = [
  { dept: "Housekeeping", peak: "9 AM", load: 94 },
  { dept: "Front Desk", peak: "3 PM", load: 88 },
  { dept: "Room Service", peak: "7 PM", load: 82 },
  { dept: "Engineering", peak: "10 AM", load: 76 },
  { dept: "Laundry", peak: "11 AM", load: 68 },
];
const rampColors = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const from = [241, 90, 36], to = [253, 226, 212];
    return `rgb(${from.map((f, k) => Math.round(f + (to[k] - f) * t)).join(",")})`;
  });
const HK_DONUT_COLORS = pastel(HK_DEPT.items.length);

const NOTIFS = [
  { label: "Escalation", tone: "text-danger", task: "Deep clean", sub: "Room 1204 · Staffing risk", time: "10:20 AM", to: "t5" },
  { label: "SLA breach", tone: "text-brand", task: "Stained bedding", sub: "Room 1103 · 14 min over", time: "10:10 AM", to: "t6" },
  { label: "Complaint", tone: "text-amber-600", task: "Guest complaint", sub: "Michael Johnson · Negative sentiment", time: "10:15 AM", to: "t6" },
  { label: "SLA breach", tone: "text-brand", task: "Extra pillows", sub: "Room 908 · Breached twice today", time: "10:25 AM", to: "t10" },
  { label: "Help request", tone: "text-success", task: "Aanya Khan is overloaded", sub: "2 tasks, 1 overdue", time: "10:28 AM", to: "team" },
  { label: "Unassigned", tone: "text-blue-600", task: "Extra towels", sub: "Room 2104 · High priority", time: "10:31 AM", to: "t12" },
  { label: "Escalation", tone: "text-danger", task: "Guest conversation", sub: "Room 1103 · Escalated by AI", time: "10:14 AM", to: "t6" },
];

const isEsc = (t: MTask) => isOpen(t) && !!t.escalated;

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
  const [teamFilterOpen, setTeamFilterOpen] = useState(false);
  const [guestQuery, setGuestQuery] = useState("");
  const [guestFilter, setGuestFilter] = useState<GuestFilter>("All");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("All");
  const [taskQuery, setTaskQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<RosterStage>("All");
  const [rosterQuery, setRosterQuery] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [rosterFilterOpen, setRosterFilterOpen] = useState(false);
  const [staffTab, setStaffTab] = useState<StaffTab>("Overview");
  const [compOpen, setCompOpen] = useState(false);
  const [rooms, setRooms] = useState<HkRoom[]>(seedRooms);
  const [roomFilter, setRoomFilter] = useState<RoomStatusFilter>("All");
  const [roomQuery, setRoomQuery] = useState("");
  const [roomSheet, setRoomSheet] = useState<string | null>(null);
  const [roomChecklist, setRoomChecklist] = useState<{ number: string; kind: "cleaning" | "inspection" } | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [needHelpReason, setNeedHelpReason] = useState("");
  const [chat, setChat] = useState<Record<string, { from: "guest" | "ai" | "me"; text: string }[]>>({});
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState("");
  const [aiDrafts, setAiDrafts] = useState<Record<string, string>>({});
  const [signedOut, setSignedOut] = useState(false);
  const [reportFrom, setReportFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10); });
  const [reportTo, setReportTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [reportDept, setReportDept] = useState("All departments");
  const [editingDraft, setEditingDraft] = useState(false);
  // create task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDept, setTaskDept] = useState("Housekeeping");
  const [room, setRoom] = useState("");
  const [taskGuest, setTaskGuest] = useState("");
  const [details, setDetails] = useState("");

  const cur = nav.cur;
  const task = tasks.find((t) => t.id === cur.id);
  const patch = (id: string, p: Partial<MTask>, log?: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p, timeline: log ? [...t.timeline, { t: "now", text: log }] : t.timeline } : t)));

  const escalated = tasks.filter(isEsc);
  const inProgressCount = tasks.filter((t) => t.status === "progress").length;
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
    "Staffing issue": (t) => isEsc(t) && t.escType === "Staffing issue",
    "Supervisor escalation": (t) => isEsc(t) && t.escType === "Supervisor escalation",
    "High priority": (t) => isEsc(t) && (t.priority === "High" || t.priority === "Critical"),
  };
  const filtered = useMemo(
    () => tasks.filter(escTests[filter]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, filter],
  );
  const chipCounts = Object.fromEntries(ESC_FILTERS.map((f) => [f, tasks.filter(escTests[f]).length])) as Record<EscFilter, number>;

  const open = (id: string) => nav.push({ name: "detail", id });
  // escalated and complaint read as plain coloured text beside the room; other statuses follow the shared labels
  const cardProps = (t: MTask) => {
    const escalated = !!t.escType || !!t.escalated;
    // never both: an escalation is an escalation, a complaint stays a complaint
    const flags = escalated
      ? [{ label: "Escalation", tone: "text-red-600" }]
      : t.complaint
        ? [{ label: "Complaint", tone: "text-amber-600" }]
        : [];
    return {
      room: t.room,
      dept: t.dept ?? "Housekeeping",
      note: t.title,
      staff: t.owner,
      left: isOpen(t) ? t.slaLeft : undefined,
      total: t.slaTotal,
      done: t.status === "completed",
      badge: CARD_BADGE[t.status],
      flags,
    };
  };
  const card = (t: MTask) => <TaskCard key={t.id} {...cardProps(t)} onClick={() => open(t.id)} />;

  const stuckAt = (t: MTask) =>
    t.status === "unassigned" ? "Not picked up — no owner" : `With ${t.owner}`;

  /* ---------- all tasks, filterable ---------- */
  const taskFilterFn: Record<TaskFilter, (t: MTask) => boolean> = {
    All: () => true,
    Unassigned: (t) => t.status === "unassigned",
    "At Risk": isAtRisk,
    Overdue: isOverdue,
    Completed: (t) => t.status === "completed",
  };
  const tasksFiltered = useMemo(() => {
    const s = taskQuery.trim().toLowerCase();
    return tasks
      .filter(taskFilterFn[taskFilter])
      .filter((t) => !s || `${t.room} ${t.guest} ${t.title}`.toLowerCase().includes(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, taskFilter, taskQuery]);
  const taskChipCounts = Object.fromEntries(TASK_FILTERS.map((f) => [f, tasks.filter(taskFilterFn[f]).length])) as Record<TaskFilter, number>;
  const genericCard = (t: MTask) => <TaskCard key={t.id} {...cardProps(t)} onClick={() => open(t.id)} />;

  /* ---------- guests derived from the department's tasks ---------- */
  const guestMap = useMemo(() => {
    const map = new Map<string, GuestEntry>();
    for (const t of tasks) {
      if (!t.guest || t.guest === "—") continue;
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
  const unreadChats = guestsSorted.filter((g) => sampleUnread(g.name) > 0).length;
  const guestsFiltered = useMemo(() => {
    const q = guestQuery.trim().toLowerCase();
    return guestsSorted.filter((g) => {
      if (guestFilter === "Pre-arrival") return false;
      if (guestFilter === "Unread" && !sampleUnread(g.name)) return false;
      if (guestFilter === "Complaints" && !g.complaint) return false;
      if (guestFilter === "Open requests" && !g.items.some(isOpen)) return false;
      return !q || `${g.name} ${g.room}`.toLowerCase().includes(q);
    });
  }, [guestsSorted, guestFilter, guestQuery]);
  const rosterFiltered = useMemo(() => {
    const q = rosterQuery.trim().toLowerCase();
    const match = (n: string, r: string) => !q || `${n} ${r}`.toLowerCase().includes(q);
    const current = stageFilter === "Pre-arrival" || stageFilter === "Checked out" ? [] : guestsSorted.filter((g) => match(g.name, g.room)).map((g) => ({ stage: "Current" as const, g }));
    const upcoming = stageFilter === "In-house" || stageFilter === "Checked out" ? [] : PRE_ARRIVAL_GUESTS.filter((g) => match(g.name, g.room)).map((g) => ({ stage: "Upcoming" as const, g }));
    const departed = stageFilter === "In-house" || stageFilter === "Pre-arrival" ? [] : CHECKED_OUT_GUESTS.filter((g) => match(g.name, g.room)).map((g) => ({ stage: "Departed" as const, g }));
    return [...current, ...upcoming, ...departed];
  }, [guestsSorted, stageFilter, rosterQuery]);
  const rosterActiveFilters = stageFilter !== "All" ? 1 : 0;

  const roomsFiltered = rooms.filter((r) => (roomFilter === "All" || r.status === roomFilter) && (!roomQuery.trim() || r.number.toLowerCase().includes(roomQuery.trim().toLowerCase()) || (r.assignee ?? "").toLowerCase().includes(roomQuery.trim().toLowerCase())));
  const roomChipCounts = Object.fromEntries(ROOM_STATUS_FILTERS.map((f) => [f, f === "All" ? rooms.length : rooms.filter((r) => r.status === f).length])) as Record<RoomStatusFilter, number>;
  const roomEntry = roomSheet ? rooms.find((r) => r.number === roomSheet) : undefined;
  const checklistRoom = roomChecklist ? rooms.find((r) => r.number === roomChecklist.number) : undefined;

  const staffName = cur.name === "staffDetail" ? cur.id : undefined;
  const staffEntry = staffName ? STAFF.find((s) => s.name === staffName) : undefined;
  const staffIndex = staffEntry ? STAFF.findIndex((s) => s.name === staffEntry.name) : 0;
  const staffShift = SHIFTS[staffIndex % SHIFTS.length];
  const staffDayOff = staffIndex % 7;
  const staffTasks = staffEntry ? tasks.filter((t) => t.owner === staffEntry.name || t.support.includes(staffEntry.name)) : [];

  const guestName = cur.name === "guestDetail" || cur.name === "guestProfile" ? cur.id : undefined;
  const guestEntry = guestName ? guestMap.get(guestName) : undefined;
  const preGuest = guestName && !guestEntry ? PRE_ARRIVAL_GUESTS.find((g) => g.name === guestName) : undefined;
  const chatSeed = guestEntry?.convo ?? preGuest?.notes;
  const seedGuestChat = () => (chatSeed && chatSeed !== "—" ? [{ from: "guest" as const, text: chatSeed }, { from: "ai" as const, text: "Thanks for letting us know — I've flagged this to the team." }] : []);
  const guestThread = guestName ? chat[guestName] ?? seedGuestChat() : [];
  const guestManual = guestName ? !!manual[guestName] : false;
  const completeTask = (task: MTask) => {
    patch(task.id, { status: "completed", escalated: false }, `${ME} marked complete`);
    if (!guestMap.has(task.guest)) { flash("Task marked complete"); nav.back(); return; }
    const first = task.guest.split(" ")[0];
    setAiDrafts((d) => ({ ...d, [task.guest]: `Hi ${first}, we've taken care of your request (${task.title.toLowerCase()}) for ${task.room}. Please let us know if there's anything else we can do — we hope you're enjoying your stay.` }));
    setEditingDraft(false);
    flash("Task complete — review the reply to your guest");
    nav.push({ name: "guestDetail", id: task.guest });
  };
  const approveDraft = () => {
    if (!guestName || !aiDrafts[guestName]?.trim()) return;
    const text = aiDrafts[guestName].trim();
    setChat((c) => ({ ...c, [guestName]: [...guestThread, { from: "me", text }] }));
    setAiDrafts((d) => { const n = { ...d }; delete n[guestName]; return n; });
    setEditingDraft(false);
    flash("Reply sent to guest");
  };
  const sendGuestChat = () => {
    if (!guestName || !draft.trim()) return;
    setChat((c) => ({ ...c, [guestName]: [...guestThread, { from: "me", text: draft.trim() }] }));
    setDraft("");
  };

  /* ---------- shell ---------- */
  const openCreate = () => {
    setTaskTitle(""); setTaskDept("Housekeeping"); setRoom(""); setTaskGuest(""); setDetails("");
    nav.push({ name: "create" });
  };
  const shell = (key: "home" | "tasks" | "guests" | "guestsRoster" | "menu", body: React.ReactNode) => (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-24 no-scrollbar">{body}</div>
      <FloatingNav
        active={key}
        onChange={(k) => nav.go({ name: k })}
        items={[
          { key: "home", label: "Home", icon: LayoutDashboard },
          { key: "tasks", label: "Tasks", icon: CheckSquare },
          { key: "guests", label: "Chats", icon: MessageSquare },
          { key: "guestsRoster", label: "Guests", icon: UserRound },
          { key: "menu", label: "More", icon: MoreNavIcon },
        ]}
      />
    </div>
  );

  const bellBtn = (
    <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-ink/5">
      <Bell className="h-[22px] w-[22px]" /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
    </button>
  );

  const Home = shell("home", (
    <>
      <div className="px-6 py-2">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          {bellBtn}
        </div>
        <div className="mt-3 min-w-0">
          <div className="truncate font-display text-[18px] font-bold leading-tight text-ink">Good morning, {ME.split(" ")[0]} 👋</div>
          <p className="mt-0.5 text-[12px] font-normal text-ink-secondary">Here's what's happening today</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 px-6">
        <HomeStat icon={CheckSquare} label="Open Tasks" value={counts.open} sub={`${inProgressCount} in progress`} onClick={() => setFilter("All")} />
        <HomeStat icon={MessageSquare} label="Guest Chats" value={guestsSorted.length} sub={`${unreadChats} unread`} onClick={() => nav.go({ name: "guests" })} />
        <HomeStat icon={Clock} label="Avg. Response" value="2m 45s" sub="↓ 18%" subTone="text-[#22C55E]" onClick={() => nav.push({ name: "analytics" })} />
        <HomeStat icon={AlertTriangle} label="Complaints" value={counts.complaints} sub={counts.complaints ? "Needs attention" : "All clear"} subTone={counts.complaints ? "text-[#EF4444]" : "text-[#22C55E]"} onClick={() => setFilter("Guest complaint")} />
      </div>

      <div className="mt-7"><SectionTitle tone="bg-red-500">Tasks</SectionTitle></div>
      <div className="mt-3"><Chips calm flat items={ESC_FILTERS} active={filter} onChange={setFilter} counts={chipCounts} /></div>
      <div className="mt-3 space-y-3 px-6">
        {filtered.map(card)}
        {!filtered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No tasks in this view.</p>}
      </div>
    </>
  ));

  /* ---------- tasks ---------- */
  const Tasks = shell("tasks", (
    <>
      <div className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-white pb-3">
<div className="flex items-center justify-between px-6 py-2">
        <div className="font-display text-[20px] font-bold text-ink">Tasks</div>
        <div className="flex items-center gap-2">
          {bellBtn}
          <button onClick={openCreate} aria-label="Create task" className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white active:bg-brand-hover">
            <Plus className="h-6 w-6" strokeWidth={2.25} />
          </button>
        </div>
      </div>
      <div className="mt-3 px-6">
        <SearchField value={taskQuery} onChange={setTaskQuery} placeholder="Search room, guest or task" />
      </div>
      <div className="mt-3"><Chips flat items={TASK_FILTERS} active={taskFilter} onChange={setTaskFilter} counts={taskChipCounts} /></div>
</div>
      <div className="mt-3 space-y-3 px-6">
        {tasksFiltered.map(genericCard)}
        {!tasksFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No tasks match.</p>}
      </div>
    </>
  ));

  /* ---------- team ---------- */
  const teamActiveFilters = roleFilter !== "All" ? 1 : 0;
  const filteredTeam = STAFF.filter((s) => {
    const q = teamQuery.trim().toLowerCase();
    return (roleFilter === "All" || s.role === roleFilter) && (!q || s.name.toLowerCase().includes(q));
  });

  const filterBtn = (active: number, onClick: () => void) => (
    <button
      onClick={onClick}
      aria-label="Filter"
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${active ? "bg-brand text-white" : "bg-white text-ink shadow-sm"}`}
    >
      <Filter className="h-[18px] w-[18px]" />
      {active > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{active}</span>}
    </button>
  );
  const searchRow = (value: string, onChange: (v: string) => void, placeholder: string, filter: React.ReactNode) => (
    <div className="flex items-center gap-2 px-6">
      <SearchField value={value} onChange={onChange} placeholder={placeholder} />
      {filter}
    </div>
  );

  const Team = (
    <div className="flex h-full flex-col">
      <ScreenHeader onBack={nav.back} title="Team" divider={false} />
      {searchRow(teamQuery, setTeamQuery, "Search team member", null)}
      <div className="mt-3 border-b border-[#F0F0F0] pb-3"><Chips flat items={ROLE_FILTERS} active={roleFilter} onChange={setRoleFilter} /></div>
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
        {filteredTeam.map((s) => (
          <PersonRow
            key={s.name}
            name={s.name}
            sub={s.role}
            tone={s.role === "Supervisor" ? "bg-violet-50 text-violet-600" : undefined}
            onOpen={() => nav.push({ name: "staffDetail", id: s.name })}
          />
        ))}
        {!filteredTeam.length && <p className="py-10 text-center text-[13px] text-ink-tertiary">No one matches these filters.</p>}
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
            <div className="font-display text-[17px] font-bold text-ink">{staffEntry.name}</div>
            <div className="mt-0.5 text-[12px] text-ink-secondary">{staffEntry.role}</div>
          </div>
        </div>

        {(
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Tasks completed", `${18 + staffIndex * 3}`],
                ["Avg completion", `${16 + staffIndex * 2} min`],
                ["Guest rating", "4.8/5"],
                ["Performance", `${86 + staffIndex}%`],
              ].map(([l, v]) => (
                <div key={l} className={`rounded-2xl bg-white p-3 ${CARD_SHADOW}`}>
                  <div className="text-[11px] text-ink-secondary">{l}</div>
                  <div className="mt-1 font-display text-[16px] font-bold text-ink">{v}</div>
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
      <ScreenHeader onBack={nav.back} title="Housekeeping" divider={false} />
      <div className="flex px-6"><SearchField value={roomQuery} onChange={setRoomQuery} placeholder="Search room or staff" /></div>
      <div className="mt-3 border-b border-[#F0F0F0] pb-3"><Chips flat items={ROOM_STATUS_FILTERS} active={roomFilter} onChange={setRoomFilter} counts={roomChipCounts} /></div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 pt-3 no-scrollbar">
        {roomsFiltered.map((r) => {
          const occupied = guestsSorted.some((g) => g.room === r.number);
          const dulled = r.status === "Out of Order";
          return (
          <button key={r.number} onClick={() => setRoomSheet(r.number)} className={`block w-full rounded-2xl border p-3 text-left active:scale-[0.99] border-line ${dulled ? "bg-subtle" : "bg-white"}`}>
            <div className="flex items-center justify-between gap-2">
              <div className={`min-w-0 truncate text-[13px] font-bold ${dulled ? "text-ink-tertiary" : "text-ink"}`}>{r.number}</div>
              <span className="flex shrink-0 items-center gap-1.5">
                {(r.status === "Inspected" || r.status === "In Progress" || r.status === "Needs Inspection") && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${r.status === "Inspected" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {r.status === "Inspected" ? "Clean" : "Dirty"}
                  </span>
                )}
                <span title={occupied ? "Occupied" : "Vacant"} aria-label={occupied ? "Occupied" : "Vacant"} className="flex h-6 w-6 items-center justify-center text-ink">
                  {occupied ? <User className="h-3.5 w-3.5" /> : <DoorClosed className="h-3.5 w-3.5" />}
                </span>
              </span>
            </div>
            <div className="truncate text-[11px] text-ink-secondary">{r.roomType} · Floor {r.floor}</div>
            <div className={`mt-1.5 text-[12px] font-semibold ${ROOM_CARD_TEXT[r.status]}`}>{r.status}</div>
            {(r.status === "In Progress" || r.status === "Needs Inspection") && (
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[10px] font-medium text-ink-secondary">{r.assignee ?? "Unassigned"}</span>
                <span className="ml-auto text-[11px]"><RoomTimer room={r} /></span>
              </div>
            )}
          </button>
          );
        })}
        {!roomsFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No rooms match.</p>}
      </div>
    </div>
  );

  const RoomSheet = roomEntry && (
    <Sheet title={roomEntry.number} onClose={() => setRoomSheet(null)}>
      {(roomEntry.status === "In Progress" || roomEntry.status === "Needs Inspection") && (
        <div className="mb-4"><RoomSummary room={roomEntry} /></div>
      )}
      <Label>Status</Label>
      <div className="space-y-2">
        {ROOM_STATUSES.map((v) => {
          const on = v === roomEntry.status;
          const Icon = ROOM_STATUS_ICON[v];
          const gated = (roomEntry.status === "In Progress" && v === "Needs Inspection") || (roomEntry.status === "Needs Inspection" && v === "Inspected");
          return (
            <button
              key={v}
              onClick={() => {
                if (gated) return setRoomChecklist({ number: roomEntry.number, kind: roomEntry.status === "In Progress" ? "cleaning" : "inspection" });
                setRooms((rs) => rs.map((r) => (r.number === roomEntry.number ? v === r.status ? r : { ...r, status: v, assignee: null, open: false, due: roomDue(v) } : r)));
                flash(`${roomEntry.number} marked ${v}`);
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${on ? "border-brand bg-brand-tint/40" : "border-line bg-white"}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ROOM_STATUS_ICON_TONE[v]}`}><Icon className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5 text-[14px] font-medium text-ink">
                  {v}
                  {v === "Inspected" && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${roomEntry.status === "Inspected" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {roomEntry.status === "Inspected" ? "Clean" : "Dirty"}
                    </span>
                  )}
                </span>
                {gated && <span className="flex items-center gap-1 text-[11px] text-ink-tertiary"><ClipboardCheck className="h-3 w-3" /> Requires checklist</span>}
              </span>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-brand" : "border-line"}`}>
                {on && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </span>
            </button>
          );
        })}
      </div>
      {(roomEntry.status === "Needs Inspection" || roomEntry.status === "In Progress") && !roomEntry.assignee && (
        <>
          <div className="mt-5" />
          {roomEntry.status === "In Progress" && !roomEntry.open && (
            <>
              <button
                onClick={() => { setRooms((rs) => rs.map((r) => (r.number === roomEntry.number ? { ...r, open: true } : r))); flash(`${roomEntry.number} is now open for line staff to pick up`); }}
                className="w-full rounded-control border-[1.5px] border-brand/35 bg-brand-tint py-[15px] font-display text-[14px] font-bold text-brand active:bg-[#FDE9E1]"
              >
                Make open task
              </button>
              <div className="my-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                <span className="h-px flex-1 bg-line" /> or assign to someone <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}
          <Label>{roomEntry.status === "In Progress" ? "Assign cleaner" : "Assign inspector"}</Label>
          <StaffPicker
            tasks={tasks}
            avatars={false}
            exclude={roomEntry.assignee ? [roomEntry.assignee] : []}
            onPick={(s) => { setRooms((rs) => rs.map((r) => (r.number === roomEntry.number ? { ...r, assignee: s.name, open: false } : r))); flash(`${roomEntry.number} assigned to ${s.name}`); }}
            cta="Assign"
          />
        </>
      )}
    </Sheet>
  );

  /* ---------- guest communication ---------- */
  const Guests = shell("guests", (
    <>
      <div className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-white pb-3">
<div className="flex items-center justify-between px-6 py-2">
        <div className="font-display text-[20px] font-bold text-ink">Chats</div>
        <div className="flex items-center gap-2">
          {bellBtn}
          <button
            onClick={() => setNewChatOpen(true)}
            aria-label="New chat"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white active:bg-brand-hover"
          >
            <Plus className="h-6 w-6" strokeWidth={2.25} />
          </button>
        </div>
      </div>
      <div className="mt-3 px-6">
        <SearchField value={guestQuery} onChange={setGuestQuery} placeholder="Search guest or room" />
      </div>
      <div className="mt-3"><Chips flat items={GUEST_FILTERS} active={guestFilter} onChange={setGuestFilter} /></div>
</div>
      <div className="mt-1 px-6">
        {guestsFiltered.map((g) => (
          <ChatRow
            key={g.name}
            name={g.name}
            room={g.room}
            roomType={roomTypeOf(g.room)}
            preview={g.convo !== "—" ? g.convo : "No messages yet"}
            tone={g.complaint ? "bg-red-50 text-red-600" : undefined}
            complaint={!!g.complaint}
            unread={sampleUnread(g.name)}
            status={g.complaint || sampleUnread(g.name) > 0 ? "Pending" : "Active"}
            onOpen={() => nav.push({ name: "guestDetail", id: g.name })}
          />
        ))}
        {(guestFilter === "All" || guestFilter === "Pre-arrival" || guestFilter === "Unread") && PRE_ARRIVAL_GUESTS
          .filter((g) => (!guestQuery.trim() || g.name.toLowerCase().includes(guestQuery.trim().toLowerCase())) && (guestFilter !== "Unread" || sampleUnread(g.name) > 0))
          .slice(0, guestFilter === "Pre-arrival" ? 10 : 3)
          .map((g) => (
            <ChatRow
              key={`pre-${g.name}`}
              name={g.name}
              room={g.room || "Room TBC"}
              roomType={g.roomType}
              status="Pre-Arrival"
              tone="bg-subtle text-ink-secondary"
              preview={g.notes}
              unread={sampleUnread(g.name)}
              onOpen={() => nav.push({ name: "guestDetail", id: g.name })}
            />
          ))}
        {!guestsFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No guests match.</p>}
      </div>
    </>
  ));

  const chatTasks = guestName ? tasks.filter((t) => t.guest === guestName && isOpen(t)) : [];
  const chatTask = chatTasks.find((t) => t.owner === ME || t.status === "progress") ?? chatTasks[0];
  const GuestDetail = guestName && (guestEntry || preGuest) && (
    <GuestChatScreen
      name={guestName}
      room={guestEntry?.room ?? "Pre-arrival"}
      roomType={guestEntry ? roomTypeOf(guestEntry.room) : preGuest?.roomType}
      complaint={!!guestEntry?.complaint}
      thread={guestThread}
      manual={guestManual}
      onToggle={() => { setManual((m) => ({ ...m, [guestName]: !guestManual })); flash(guestManual ? "Handed back to AI" : "AI paused — you're now replying"); }}
      onSend={(text) => setChat((c) => ({ ...c, [guestName]: [...guestThread, { from: "me", text }] }))}
      onBack={nav.back}
      onProfile={() => nav.push({ name: "guestProfile", id: guestName })}
      task={chatTask && {
        id: chatTask.id, title: chatTask.title, left: chatTask.slaLeft, total: chatTask.slaTotal,
        action: chatTask.owner === ME || chatTask.status === "progress" ? "Complete" : "Accept",
        onAction: () => {
          if (chatTask.owner !== ME && chatTask.status !== "progress") {
            patch(chatTask.id, { owner: ME, status: "progress" }, `${ME} accepted the task`);
            return flash("Task assigned to you");
          }
          patch(chatTask.id, { status: "completed", escalated: false }, `${ME} marked complete`);
          setAiDrafts((d) => ({ ...d, [guestName]: `Hi ${guestName.split(" ")[0]}, we've taken care of your request (${chatTask.title.toLowerCase()}) for ${chatTask.room}. Please let us know if there's anything else we can do — we hope you're enjoying your stay.` }));
          flash("Task complete — review the reply to your guest");
        },
      }}
      aiDraft={aiDrafts[guestName]}
      onDraftChange={(text) => setAiDrafts((d) => ({ ...d, [guestName]: text }))}
      onApproveDraft={approveDraft}
    />
  );

  const profileName = cur.name === "guestProfile" ? cur.id : undefined;
  const GuestProfile = profileName && (
    <GuestProfileScreen name={profileName} author="Daniel Reyes · Mid Manager" onBack={nav.back} onMessage={() => nav.push({ name: "guestDetail", id: profileName })} />
  );

  const Detail = task ? (
    <div className="relative flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-6 pb-3 pt-4">
        <button onClick={nav.back} aria-label="Back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">Task detail</span>
        {isOpen(task) && <div className="ml-auto"><SlaCountdown left={task.slaLeft} total={task.slaTotal} /></div>}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 pt-4 no-scrollbar">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand"><BedDouble className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h2 className="font-display text-[18px] font-bold leading-[1.25] text-ink">{task.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <StatusTag s={task.status} />
            </div>
          </div>
        </div>

        <div className="divide-y divide-line rounded-2xl border border-line bg-white px-4">
          {task.guest !== "—" && (
            <DetailRow icon={User} label="Guest">
              <button onClick={() => nav.push({ name: "guestProfile", id: task.guest })} className="flex items-center gap-1 text-left font-medium text-brand">
                {task.guest} <ChevronRight className="h-4 w-4" />
              </button>
            </DetailRow>
          )}
          <DetailRow icon={BedDouble} label="Room">{task.room}</DetailRow>
          <DetailRow icon={Building2} label="Department">{task.dept ?? "Housekeeping"}</DetailRow>
          <DetailRow icon={UserCog} label="Assigned to">{task.owner ?? <span className="text-red-600">Unassigned</span>}</DetailRow>
          {task.support.length > 0 && <DetailRow icon={UserPlus} label="Support">{task.support.join(", ")}</DetailRow>}
        </div>

        <div className="rounded-2xl bg-[#F6F6F8] p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-tertiary">Notes</div>
          {(() => {
            const staffNotes = SEED_REQUESTS.filter((r) => r.taskId === task.id);
            if (!staffNotes.length) return <p className="mt-2 text-[14px] font-normal leading-[1.6] text-ink">{task.note}</p>;
            return staffNotes.map((r) => (
              <div key={r.id} className="mt-1.5">
                <p className="text-[14px] font-normal leading-[1.6] text-ink">{r.note}</p>
                <p className="mt-1 text-[12px] text-ink-tertiary"><span className="font-semibold text-ink-secondary">{r.staff}</span> · {STAFF.find((s) => s.name === r.staff)?.role ?? "Line Staff"}</p>
              </div>
            ));
          })()}
        </div>

        {task.complaint && (
        <div className="rounded-2xl border border-line bg-white p-4">
          {task.compensation?.length ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-ink-tertiary">Compensation</span>
                <button onClick={() => setCompOpen(true)} className="text-[13px] font-semibold text-brand">Add compensation</button>
              </div>
              <div className="mt-2 space-y-2">
                {task.compensation.map((c, i) => (
                  <div key={i} className="rounded-xl bg-[#F6F6F8] p-3">
                    <div className="text-[14px] font-medium text-ink">{c.type}</div>
                    <p className="text-[12px] text-ink-secondary">{c.reason}</p>
                    <p className="mt-0.5 text-[11px] text-ink-tertiary">Approved by {c.by}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <button onClick={() => setCompOpen(true)} className="block w-full text-center text-[13px] font-semibold text-brand">Add compensation</button>
          )}
        </div>
        )}

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

      {task.guest !== "—" && <MessageGuestButton raised onClick={() => nav.push({ name: "guestDetail", id: task.guest })} />}

      {isOpen(task) && (
        <div className="flex shrink-0 gap-3 px-6 pb-6 pt-3">
          {task.owner === ME || task.status === "progress" ? (
            <>
              <Button variant="outline" className="flex-1" onClick={() => setSheet({ k: "needHelp", taskId: task.id })}>Assist</Button>
              <button
                className="flex-[1.3] rounded-control border-[1.5px] border-brand/35 bg-brand-tint py-[15px] font-display text-[14px] font-bold text-brand active:bg-[#FDE9E1] disabled:opacity-40"
                onClick={() => completeTask(task)}
              >
                Complete
              </button>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex-1 !font-bold" onClick={() => setSheet({ k: "void", taskId: task.id })}>Void</Button>
              <button
                onClick={() => { patch(task.id, { owner: ME, status: "progress" }, `${ME} accepted the task`); flash("Task assigned to you"); }}
                className="flex-[1.3] rounded-control border-[1.5px] border-brand/35 bg-brand-tint py-[15px] font-display text-[14px] font-bold text-brand active:bg-[#FDE9E1]"
              >
                Accept
              </button>
            </>
          )}
        </div>
      )}
    </div>
  ) : null;

  const Notifications = (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Notifications"
        onBack={nav.back}
        right={<button onClick={() => nav.push({ name: "notifSettings" })} aria-label="Notification settings" className="flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-ink/5"><SlidersHorizontal className="h-[18px] w-[18px]" /></button>}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {NOTIFS.map((n, i) => (
          <NotifRow key={i} label={n.label} tone={n.tone} time={n.time} task={n.task} sub={n.sub} unread={i < 3} onOpen={() => (n.to === "team" ? nav.push({ name: "team" }) : open(n.to))} />
        ))}
      </div>
    </div>
  );

  const Create = (
    <div className="flex h-full flex-col">
      <TextHeader title="Create Manual Task" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-4 no-scrollbar">
        <ManualTaskFields
          guest={taskGuest} onGuest={setTaskGuest}
          room={room} onRoom={setRoom}
          title={taskTitle} onTitle={setTaskTitle}
          dept={taskDept} onDept={setTaskDept}
          details={details} onDetails={setDetails}
        />
      </div>
      <div className="shrink-0 px-6 pb-6 pt-2">
        <Button
          className="w-full"
          disabled={!taskTitle.trim()}
          onClick={() => {
            const id = "n" + Date.now();
            const roomLabel = room.trim() ? `Room ${room.trim().replace(/^room\s*/i, "")}` : "—";
            const title = taskTitle.trim();
            setTasks((ts) => [{
              id, room: roomLabel, guest: taskGuest.trim() || "—", title, dept: taskDept, note: details.trim() || title, priority: "Medium", status: "unassigned", owner: null, support: [],
              slaTotal: DEFAULT_SLA, slaLeft: DEFAULT_SLA, isNew: true, createdAt: "now", pickup: "Not yet picked up", summary: details.trim() || title, prefs: [], convo: "Created manually by the department head.",
              timeline: [{ t: "now", text: `Created manually by ${ME}` }], notes: [],
            }, ...ts]);
            nav.go({ name: "home" });
            flash("Task created — unassigned");
          }}
        >
          Create Task
        </Button>
      </div>
    </div>
  );

  const Menu = shell("menu", (
    <>
      <div className="px-6 pb-6 pt-2">
        <div className="flex flex-col items-center pb-8 pt-6 text-center">
          <Avatar name={ME} size={88} tone="bg-brand text-white" />
          <div className="mt-5 truncate font-display text-[20px] font-bold text-ink">{ME}</div>
          <div className="mt-1.5 font-display text-[14px] font-semibold text-ink-secondary">Housekeeping Manager</div>
          <div className="mt-1 text-[13px] text-ink-tertiary">daniel.reyes@alfonhotel.com</div>
        </div>

        <div className="mt-2">
          <button onClick={() => nav.push({ name: "notifSettings" })} className="flex w-full items-center gap-4 border-b border-[#EEEEF1] py-4 text-left">
            <SlidersHorizontal className="h-[19px] w-[19px] shrink-0 text-ink" />
            <span className="min-w-0 flex-1 text-[15px] font-medium text-ink">Notification settings</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
          </button>
          {MENU_ITEMS.map((m) => (
            <button
              key={m.key}
              onClick={() => nav.push({ name: m.key })}
              className="flex w-full items-center gap-4 border-b border-[#EEEEF1] py-4 text-left"
            >
              <m.icon className="h-[19px] w-[19px] shrink-0 text-ink" />
              <span className="min-w-0 flex-1 text-[15px] font-medium text-ink">{m.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
            </button>
          ))}
          <button onClick={() => setSignedOut(true)} className="flex w-full items-center gap-4 py-4 text-left">
            <LogOut className="h-[19px] w-[19px] shrink-0 text-red-600" />
            <span className="text-[15px] font-medium text-red-600">Sign out</span>
          </button>
        </div>
      </div>
    </>
  ));

  const Analytics = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Analytics" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total tasks" value={HK_DEPT.tasks.toLocaleString()} />
          <StatCard label="Completed" value={`${HK_METRICS.done}%`} />
          <StatCard label="Overdue" value={HK_METRICS.overdue} />
          <StatCard label="Avg response" value={HK_METRICS.resp} />
        </div>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[13px] font-semibold text-ink">Task breakdown</div>
          <div className="mt-4 flex justify-center">
            <div className="relative">
              <Donut size={150} thickness={24} segments={HK_DEPT.items.map(([l, v], i) => ({ label: l, value: v, color: HK_DONUT_COLORS[i] }))} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[18px] font-bold text-ink">{HK_DEPT.tasks.toLocaleString()}</span>
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
          <div className="text-[13px] font-semibold text-ink">Top requests</div>
          <div className="mt-3 space-y-3">
            {HK_TOP_REQUESTS.slice(0, 4).map(([label, count]) => (
              <div key={label}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-ink">{label}</span>
                  <span className="font-display text-[14px] font-semibold text-ink">{count.toLocaleString()}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F0EEE8]">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round((count / HK_TOP_REQUESTS[0][1]) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[13px] font-semibold text-ink">Recurring complaints</div>
          <div className="mt-3 space-y-3">
            {HK_COMPLAINTS.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-3">
                <span className="min-w-0 text-[13px] text-ink">{c.name}</span>
                <span className="shrink-0 font-display text-[14px] font-semibold text-ink">{c.v}</span>
              </div>
            ))}
            {!HK_COMPLAINTS.length && <p className="text-[13px] text-ink-tertiary">None this week.</p>}
          </div>
        </div>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[13px] font-semibold text-ink">Guest satisfaction</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-display text-[32px] font-bold leading-none text-ink">{HK_SATISFACTION.score}</span>
            <span className="text-[13px] text-ink-tertiary">/ 5</span>
            <span className="ml-auto text-[12px] font-medium text-brand">{HK_SATISFACTION.delta} vs last week</span>
          </div>
          <div className="mt-4 space-y-2.5">
            {([
              ["Promoters", HK_SATISFACTION.promoters, "bg-green-500"],
              ["Neutral", HK_SATISFACTION.neutral, "bg-amber-400"],
              ["Detractors", HK_SATISFACTION.detractors, "bg-red-400"],
            ] as const).map(([label, pct, bar]) => (
              <div key={label}>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span className="text-ink-secondary">{label}</span>
                  <span className="font-semibold text-ink">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F0EEE8]">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[13px] font-semibold text-ink">Peak hour</div>
          <div className="mt-3 space-y-3">
            {HK_PEAK_HOURS.map((row) => (
              <div key={row.dept}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] text-ink">{row.dept}</span>
                  <span className="shrink-0 text-[13px] font-semibold text-ink">{row.peak}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F0EEE8]">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${row.load}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const reportRangeOk = !!reportFrom && !!reportTo && reportFrom <= reportTo;
  const reportDeptOk = (dept: string) => reportDept === "All departments" || dept === reportDept;
  const reportRows = (name: string): (string | number)[][] => {
    const meta: (string | number)[][] = [[name], [`Period: ${reportFrom} to ${reportTo}`], [`Department: ${reportDept}`], []];
    const scoped = tasks.filter(() => reportDeptOk("Housekeeping"));
    const taskRow = (t: MTask) => [t.room, t.title, t.priority, t.status, t.owner ?? "Unassigned", t.slaLeft];
    const taskHead = ["Room", "Task", "Priority", "Status", "Owner", "SLA left (min)"];
    if (name === "Team Performance Report") return [...meta, ["Name", "Role"], ...(reportDeptOk("Housekeeping") ? STAFF.map((x) => [x.name, x.role]) : [])];
    if (name === "Pre-Arrival Preference Report") return [...meta, ["Guest", "Room", "Arrival", "Preferences"], ...(reportDeptOk("Housekeeping") ? PRE_ARRIVAL_GUESTS.map((g) => [g.name, g.room, g.eta, g.prefs.map((p) => `${p.label}: ${p.value}`).join("; ")]) : [])];
    if (name === "Complaint Report") return [...meta, taskHead, ...scoped.filter((t) => t.complaint).map(taskRow)];
    if (name === "SLA Breach Report") return [...meta, taskHead, ...scoped.filter(isOverdue).map(taskRow)];
    if (name === "Audit Trail") return [...meta, ["Room", "Time", "Event"], ...scoped.flatMap((t) => t.timeline.map((e) => [t.room, e.t, e.text]))];
    return [...meta, taskHead, ...scoped.map(taskRow)];
  };

  const Reports = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Reports" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-ink-secondary">From</span>
              <input type="date" value={reportFrom} max={reportTo || undefined} onChange={(e) => setReportFrom(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-2 text-[13px] text-ink outline-none focus:border-brand" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-ink-secondary">To</span>
              <input type="date" value={reportTo} min={reportFrom || undefined} onChange={(e) => setReportTo(e.target.value)} className="h-11 w-full rounded-xl border border-line bg-white px-2 text-[13px] text-ink outline-none focus:border-brand" />
            </label>
          </div>
          <div className="mt-3">
            <span className="mb-1.5 block text-[12px] font-semibold text-ink-secondary">Department</span>
            <SelectField value={reportDept} onChange={setReportDept} placeholder="Department" options={["All departments", ...DEPARTMENTS.map((d) => d.name)]} />
          </div>
          {!reportRangeOk && <p className="mt-2 text-[12px] text-red-600">Choose a start date on or before the end date.</p>}
        </div>
        {REPORTS.map((r) => (
          <div key={r.name} className={`flex items-center gap-3 rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand"><FileText className="h-[18px] w-[18px]" /></span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-ink">{r.name}</div>
              <div className="mt-0.5 text-[12px] text-ink-secondary">{r.desc}</div>
            </div>
            <button
              disabled={!reportRangeOk}
              onClick={() => { downloadCsv(r.name, reportRows(r.name)); flash(`${r.name} downloaded`); }}
              aria-label={`Download ${r.name}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand disabled:opacity-40"
            >
              <Download className="h-[18px] w-[18px]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const GuestsRoster = shell("guestsRoster", (
    <>
      <div className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-white pb-3">
<div className="flex items-center justify-between px-6 py-2">
        <div className="font-display text-[20px] font-bold text-ink">Guests</div>
        <div className="flex items-center gap-2">{bellBtn}</div>
      </div>
      <div className="mt-3 px-6">
        <SearchField value={rosterQuery} onChange={setRosterQuery} placeholder="Search guest or room" />
      </div>
      <div className="mt-3"><Chips flat items={ROSTER_STAGE_FILTERS} active={stageFilter} onChange={setStageFilter} /></div>
</div>
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
        {rosterFiltered.map((row) => {
          const roomType = row.stage === "Upcoming" ? row.g.roomType : GUEST_PROFILES[row.g.name]?.roomType;
          const room = <><DoorOpen className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{row.g.room.replace(/^Room\s+/i, "")}{roomType ? ` · ${roomType}` : ""}</span></>;
          const stay =
            row.stage === "Upcoming"
              ? `${GUEST_PROFILES[row.g.name]?.checkIn.replace(/, \d{4}/, "")} – ${GUEST_PROFILES[row.g.name]?.checkOut.replace(/, \d{4}/, "")}`
              : row.g.checkIn
                ? `${row.g.checkIn} – ${row.g.checkOut}`
                : undefined;
          const right =
            row.stage === "Current" ? <span className="text-success">In-house</span> : row.stage === "Upcoming" ? <span className="text-blue-600">Pre-arrival</span> : <span className="text-ink-tertiary">Checked out</span>;
          return (
            <PersonRow
              key={row.g.name}
              name={row.g.name}
              sub={room}
              detail={stay}
              right={right}
              tone={row.stage === "Current" && row.g.complaint ? "bg-red-50 text-red-600" : "bg-subtle text-ink-secondary"}
              onOpen={() => nav.push({ name: "guestProfile", id: row.g.name })}
            />
          );
        })}
        {!rosterFiltered.length && <p className="py-10 text-center text-[13px] text-ink-tertiary">No guests match.</p>}
      </div>
    </>
  ));

  const VIEWS: Record<Screen["name"], React.ReactNode> = {
    home: Home, tasks: Tasks, team: Team, staffDetail: StaffDetail, housekeeping: Housekeeping, guests: Guests, guestDetail: GuestDetail, guestProfile: GuestProfile,
    detail: Detail, notifications: Notifications, create: Create,
    menu: Menu, analytics: Analytics, reports: Reports, guestsRoster: GuestsRoster, notifSettings: <NotificationSettingsScreen persona="manager" onBack={nav.back} />,
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
            <button onClick={() => setSheet({ k: "duty", taskId: t0.id })} className="flex w-full items-center gap-3 rounded-2xl border border-line p-3.5 text-left active:bg-brand-tint/40">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"><ArrowUpRight className="h-[18px] w-[18px]" /></span>
              <span className="text-[14px] font-semibold text-ink">Escalation</span>
            </button>
          </div>
        </Sheet>
      )}
      {sheet.k === "assign" && t0 && (
        <Sheet title={t0.owner ? "Change owner" : "Assign task"} onClose={closeHelpSheet}>
          <p className="mb-3 text-[13px] text-ink-secondary">Within Housekeeping only · {t0.room}</p>
          <Label>Reason (optional)</Label>
          <TextField rows={2} value={needHelpReason} onChange={setNeedHelpReason} placeholder="Why does this need to be reassigned?" />
          <div className="mt-4">
            <Button variant="outline"
              className="w-full"
              onClick={() => { patch(t0.id, { owner: null, status: "unassigned" }, `${ME} reopened the task for anyone${needHelpReason.trim() ? ` — ${needHelpReason.trim()}` : ""}`); closeHelpSheet(); flash("Reopened for anyone to pick up"); }}
            >
              Reopen — let anyone pick it up
            </Button>
            <div className="my-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
              <span className="h-px flex-1 bg-line" /> or assign to someone <span className="h-px flex-1 bg-line" />
            </div>
            <StaffPicker tasks={tasks} exclude={t0.owner ? [t0.owner] : []} onPick={(s) => { patch(t0.id, { owner: s.name, status: "assigned" }, `${ME} assigned to ${s.name}${needHelpReason.trim() ? ` — ${needHelpReason.trim()}` : ""}`); closeHelpSheet(); flash(`Assigned to ${s.name}`); }} cta="Assign" />
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
      {sheet.k === "duty" && t0 && (
        <ReasonSheet title="Escalation" noteLabel="Reason (optional)" placeholder="Add context for the Duty Manager…" cta="Escalate" tone="bg-red-600" onClose={() => setSheet(null)}
          onSubmit={(_reason, note) => { patch(t0.id, { escType: (t0.escType ?? "Supervisor escalation") as EscType, notes: [{ by: ME, t: "Just now", text: note ? `Escalated to Duty Manager — ${note}` : "Escalated to Duty Manager" }, ...t0.notes] }, `${ME} escalated to Duty Manager`); setSheet(null); flash("Escalated to the Duty Manager"); }} />
      )}
      {sheet.k === "void" && t0 && (
        <ReasonSheet title="Void this task" reasons={VOID_REASONS} noteLabel="Note (optional)" placeholder="Anything the team should know…" cta="Mark as Void" tone="bg-red-600" onClose={() => setSheet(null)}
          onSubmit={(reason, note) => { patch(t0.id, { status: "void", escalated: false, resolution: reason }, `${ME} marked the task void — ${reason}${note ? ` · ${note}` : ""}`); setSheet(null); flash("Task marked void"); }} />
      )}
    </>
  );

  const TeamFilterSheet = teamFilterOpen && (
    <Sheet title="Filter team" onClose={() => setTeamFilterOpen(false)}>
      <Label>Role</Label>
      <Chips items={ROLE_FILTERS} active={roleFilter} onChange={setRoleFilter} />
      <Button className="mt-6 w-full" onClick={() => setTeamFilterOpen(false)}>Done</Button>
      {teamActiveFilters > 0 && (
        <Button variant="outline" className="mt-2 w-full" onClick={() => setRoleFilter("All")}>Clear filters</Button>
      )}
    </Sheet>
  );

  const NewChatSheet = newChatOpen && (
    <Sheet title="New chat" onClose={() => setNewChatOpen(false)}>
      <div className="-mx-1 max-h-[420px] overflow-y-auto">
        {guestsSorted.map((g) => (
          <ChatRow
            key={g.name}
            name={g.name}
            room={g.room}
            roomType={roomTypeOf(g.room)}
            plain
            preview="Start a conversation"
            onOpen={() => { setNewChatOpen(false); nav.push({ name: "guestDetail", id: g.name }); }}
          />
        ))}
        {PRE_ARRIVAL_GUESTS.map((g) => (
          <ChatRow
            key={`new-${g.name}`}
            name={g.name}
            room="Pre-arrival"
            tone="bg-subtle text-ink-secondary"
            plain
            preview="Start a conversation"
            onOpen={() => { setNewChatOpen(false); nav.push({ name: "guestProfile", id: g.name }); }}
          />
        ))}
      </div>
    </Sheet>
  );

  const RosterFilterSheet = rosterFilterOpen && (
    <Sheet title="Filter guests" onClose={() => setRosterFilterOpen(false)}>
      <Chips items={ROSTER_STAGE_FILTERS} active={stageFilter} onChange={setStageFilter} />
      <Button className="mt-6 w-full" onClick={() => setRosterFilterOpen(false)}>Done</Button>
      {rosterActiveFilters > 0 && <Button variant="outline" className="mt-2 w-full" onClick={() => setStageFilter("All")}>Clear filter</Button>}
    </Sheet>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame white={!signedOut && ["guests", "menu", "team", "guestsRoster", "housekeeping"].includes(cur.name)}>
        {signedOut ? <SignedOutScreen onSignIn={() => { setSignedOut(false); nav.reset(); }} /> : VIEWS[cur.name]}
        {sheetNode}
        {TeamFilterSheet}
        {NewChatSheet}
        {RosterFilterSheet}
        {RoomSheet}
        {roomChecklist?.kind === "cleaning" && checklistRoom && (
          <CleaningChecklistSheet
            room={checklistRoom}
            onClose={() => setRoomChecklist(null)}
            onSubmit={() => {
              setRooms((rs) => rs.map((r) => (r.number === checklistRoom.number ? { ...r, status: "Needs Inspection", assignee: null, open: false, due: roomDue("Needs Inspection") } : r)));
              flash(`${checklistRoom.number} submitted for inspection`);
              setRoomChecklist(null);
            }}
          />
        )}
        {roomChecklist?.kind === "inspection" && checklistRoom && (
          <InspectionChecklistSheet
            room={checklistRoom}
            onClose={() => setRoomChecklist(null)}
            onApprove={() => {
              setRooms((rs) => rs.map((r) => (r.number === checklistRoom.number ? { ...r, status: "Inspected", assignee: null, open: false, due: undefined } : r)));
              flash(`${checklistRoom.number} approved and cleared`);
              setRoomChecklist(null);
            }}
            onFlag={() => {
              setRooms((rs) => rs.map((r) => (r.number === checklistRoom.number ? { ...r, status: "In Progress", due: roomDue("In Progress") } : r)));
              flash(`${checklistRoom.number} flagged for re-cleaning`);
              setRoomChecklist(null);
            }}
          />
        )}
        {compOpen && task && (
          <CompensationSheet
            subtitle={`${task.title} · ${task.room}`}
            approvers={["Sophia Carter (General Manager)", "Duty Manager", "Daniel Reyes (Housekeeping Manager)"]}
            onClose={() => setCompOpen(false)}
            onSubmit={(type, reason, by) => {
              patch(task.id, { compensation: [...(task.compensation ?? []), { type, reason, by }] }, `Compensation given: ${type}`);
              setCompOpen(false);
              flash("Compensation submitted");
            }}
          />
        )}
        {toast}
      </PhoneFrame>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary"
          onClick={() => {
            nav.reset(); setTasks(SEED_TASKS); setRooms(seedRooms()); setSheet(null); setNeedHelpReason(""); setChat({}); setManual({});
            setFilter("All"); setRoleFilter("All"); setGuestFilter("All"); setGuestQuery("");
            setTaskFilter("All"); setTaskQuery(""); setStageFilter("All"); setRosterQuery(""); setTeamQuery(""); setStaffTab("Overview"); setRoomFilter("All"); setRoomQuery(""); setRoomSheet(null); setRoomChecklist(null);
          }}
        >
          Reset
        </button>
      </div>
      <p className="text-center text-[12px] text-ink-tertiary">Current screen: <span className="font-medium text-ink-secondary">{cur.name}</span> · open Guests to chat with a guest, or Room 1103 to see full task context.</p>
    </div>
  );
}

function CleaningChecklistSheet({
  room,
  onClose,
  onSubmit,
}: {
  room: HkRoom;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => CLEANING_CHECKLIST.map(() => false));
  const doneCount = checked.filter(Boolean).length;
  const allDone = checked.every(Boolean);
  const toggle = (i: number) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));

  return (
    <Sheet title={`${room.number} — Room Cleaning`} onClose={onClose}>
      <RoomSummary room={room} progress={{ done: doneCount, total: CLEANING_CHECKLIST.length }} />
      <SelectAllRow checked={allDone} onChange={() => setChecked(CLEANING_CHECKLIST.map(() => !allDone))} />
      <div className="mt-4 space-y-2">
        {CLEANING_CHECKLIST.map((item, i) => (
          <label
            key={item}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-[13px] ${checked[i] ? "border-green-200 bg-green-50/50" : "border-line bg-white"}`}
          >
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-brand" checked={checked[i]} onChange={() => toggle(i)} />
            <span className={checked[i] ? "text-ink" : "text-ink-secondary"}>{item}</span>
          </label>
        ))}
      </div>
      <Button className="mt-5 w-full disabled:opacity-40" disabled={!allDone} onClick={onSubmit}>
        Submit for Inspection
      </Button>
      {!allDone && <p className="mt-2.5 text-center text-[12px] text-ink-tertiary">Complete every item to submit this room for inspection.</p>}
    </Sheet>
  );
}

function SelectAllRow({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-[13px] font-semibold text-ink">
      <input type="checkbox" className="h-4 w-4 shrink-0 accent-brand" checked={checked} onChange={onChange} />
      Select all
    </label>
  );
}

function InspectionChecklistSheet({
  room,
  onClose,
  onApprove,
  onFlag,
}: {
  room: HkRoom;
  onClose: () => void;
  onApprove: () => void;
  onFlag: () => void;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => INSPECTION_CHECKLIST.map(() => false));
  const doneCount = checked.filter(Boolean).length;
  const allDone = doneCount === INSPECTION_CHECKLIST.length;
  const toggle = (i: number) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));
  const sections = Array.from(new Set(INSPECTION_CHECKLIST.map((it) => it.section)));

  return (
    <Sheet title={`${room.number} — LQA Inspection`} onClose={onClose}>
      <RoomSummary room={room} progress={{ done: doneCount, total: INSPECTION_CHECKLIST.length }} />
      <SelectAllRow checked={allDone} onChange={() => setChecked(INSPECTION_CHECKLIST.map(() => !allDone))} />

      <div className="mt-4 space-y-5">
        {sections.map((sec) => (
          <div key={sec}>
            <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-ink-tertiary">{sec}</div>
            <div className="space-y-2">
              {INSPECTION_CHECKLIST.filter((it) => it.section === sec).map((it) => (
                <label
                  key={it.n}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border p-3 text-[13px] ${checked[it.n - 1] ? "border-green-200 bg-green-50/50" : "border-line bg-white"}`}
                >
                  <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-brand" checked={checked[it.n - 1]} onChange={() => toggle(it.n - 1)} />
                  <span className="min-w-0 flex-1">
                    <span className={checked[it.n - 1] ? "text-ink" : "text-ink-secondary"}><span className="mr-1 text-ink-tertiary">{it.n}.</span>{it.text}</span>
                    <span className={`ml-2 inline-block rounded px-1.5 py-0.5 align-middle text-[10px] font-medium ${TAG_TONE[it.tag]}`}>{it.tag}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={onFlag}>
          Flag for Re-cleaning
        </Button>
        <Button disabled={!allDone} className="disabled:opacity-40" onClick={onApprove}>
          Approve & Clear
        </Button>
      </div>
    </Sheet>
  );
}
