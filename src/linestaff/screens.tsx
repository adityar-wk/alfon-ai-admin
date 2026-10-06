import { Button } from "../components/ui";
import { Logo } from "../components/Logo";
import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight, Plus, BedDouble, User, Building2, ChevronLeft, ArrowUpRight, Clock, AlertTriangle, ClipboardCheck, LayoutGrid, CheckSquare, MessageSquare, Search, Send, UserCog } from "lucide-react";
import { PRE_ARRIVAL_GUESTS } from "./data";
import { secsFromMinutes, useClock } from "../data/attention";
import {
  PhoneFrame,
  ScreenHeader,
  TextHeader,
  SectionTitle,
  SlaClockChip,
  TaskCard,
  SlaCountdown,
  CompensationSheet,
  FloatingNav,
  Avatar,
  Sheet,
  TextField,
  Segmented,
  Label,
  useNav,
  useToast,
  CARD_SHADOW,
  ICON_BTN,
  type Priority,
  ChatRow,
  NotifRow,
  SearchField,
  Chips,
  HomeStat,
  sampleUnread,
  ManualTaskFields,
} from "./mobile";
import { GuestProfileScreen, GuestChatScreen, MessageGuestButton, type ChatMsg } from "./guestviews";
import { ProfileScreen, NotificationSettingsScreen, SignedOutScreen } from "./profile";

type Screen = { name: "home" | "tasks" | "notifications" | "taskDetail" | "create" | "guests" | "guestChat" | "guestProfile" | "profile" | "notifSettings" | "analytics"; id?: string };

const LS_ME = "Aanya Khan";
const LS_ME_INITIALS = LS_ME.split(" ").map((p) => p[0]).join("").slice(0, 2);
/** FloatingNav icon: filled initials avatar that follows active/inactive text color. */
function MoreNavIcon({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center ${className ?? ""}`}>
      <span className="flex h-full w-full items-center justify-center rounded-full bg-current">
        <span className="text-[9px] font-bold leading-none text-white">{LS_ME_INITIALS}</span>
      </span>
    </span>
  );
}

const CHAT_FILTERS = ["All", "Unread", "Complaints", "Open requests", "Pre-arrival"] as const;
const TASK_FILTERS = ["All", "Unassigned", "At Risk", "Overdue", "Completed"] as const;

type HelpKind = "escalate" | "escalateDuty" | "reassign";
const HELP_OPTIONS: { key: HelpKind; label: string; cta: string; placeholder: string }[] = [
  { key: "escalate", label: "Escalate to supervisor", cta: "Escalate", placeholder: "Tell your supervisor what's blocking you…" },
  { key: "escalateDuty", label: "Escalate to Duty Manager", cta: "Escalate to Duty Manager", placeholder: "Tell the Duty Manager what's blocking you…" },
  { key: "reassign", label: "Reassign", cta: "Send request", placeholder: "Why does this need to be reassigned…" },
];
type Status = "pending" | "progress" | "completed";
type Task = {
  id: string;
  title: string;
  room: string;
  note: string;
  status: Status;
  left: number;
  total: number;
  time?: string;
  // room + request details
  guest: string;
  roomType: string;
  floor: number;
  stay: string;
  prefs: string[];
  source: string;
  created: string;
  staffNote?: string;
  dept?: string;
  compensation?: { type: string; reason: string; by: string }[];
  escalatedTo?: "Supervisor" | "Mid Manager" | "Duty Manager";
  complaint?: boolean;
  assignedBy?: string;
};

/** New tasks offered to the staff member: each arrives as a notification and stays pending until they accept it. */
const NEW_TASKS = [
  {
    title: "Private Transfer — Emma Davis", room: "Room 1608", note: "Guest is ready for a private transfer. Confirm the pickup and escort them to the car.",
    total: 30, dept: "Concierge", guest: "Emma Davis", time: "09:57", roomType: "Deluxe King", floor: 16, stay: "In house · 3 nights", prefs: ["Airport transfer"],
  },
  { title: "Duvet & pillow set replacement", room: "Room 907", note: "Replace the duvet and add a hypoallergenic pillow set.", total: 30, dept: "Housekeeping", guest: "Marco Bianchi", time: "Just now", roomType: "Deluxe King", floor: 9, stay: "Arriving today · 3 nights", prefs: ["Hypoallergenic bedding"] },
  { title: "Minibar restock", room: "Room 1410", note: "Restock the minibar before the guest returns from dinner.", total: 45, dept: "Housekeeping", guest: "Olivia Turner", time: "Just now", roomType: "Deluxe Room", floor: 14, stay: "In house · 2 nights", prefs: ["Sparkling water"] },
  { title: "Turndown service", room: "Room 1206", note: "Evening turndown with extra water bottles.", total: 25, dept: "Housekeeping", guest: "James Whitfield", time: "Just now", roomType: "Executive Room", floor: 12, stay: "In house · 3 nights", prefs: ["Late turndown"] },
];

type Incoming = {
  id: string;
  title: string;
  room: string;
  total: number;
  dept: string;
};

const INITIAL: Task[] = [
  {
    id: "t20", title: "Dirty bathroom complaint", room: "Room 1108", note: "Guest complained the bathroom was not cleaned properly.",
    status: "progress", left: 24, total: 40, guest: "Olivia Turner", roomType: "Deluxe Room", floor: 11, stay: "In house · 2 nights", prefs: ["Quiet room"],
    source: "Guest chat", created: "10:05 AM", complaint: true,
  },
  {
    id: "t1", title: "Full towel change & hypoallergenic linens", room: "Room 501", note: "Guest requested a full towel change and hypoallergenic linens before check-in.",
    status: "progress", left: 18, total: 45, guest: "Emma Davis", roomType: "Deluxe King", floor: 5, stay: "Arriving today · 7 nights", prefs: ["Hypoallergenic bedding", "Firm pillow", "Quiet room"],
    source: "Guest chat", created: "9:48 AM", staffNote: "Use the green-tagged linen set from storage. Tell the front desk if anything is missing.",
  },
  {
    id: "t10", title: "Extra pillows", room: "Room 908", note: "Two extra pillows requested. Guest is waiting in the room.",
    status: "progress", left: -8, total: 30, guest: "Ananya Kapoor", roomType: "Executive King", floor: 9, stay: "In house · 4 nights", prefs: ["Extra pillows"], escalatedTo: "Mid Manager",
    source: "Guest chat", created: "9:55 AM",
  },
  {
    id: "t2", title: "Carpet vacuum & spot clean", room: "Room 623", note: "Carpet vacuum and spot clean requested by the guest.",
    status: "pending", left: 52, total: 60, guest: "Liam Anderson", roomType: "Deluxe Twin", floor: 6, stay: "In house · 3 nights", prefs: ["Non-smoking"],
    source: "Guest chat", created: "10:22 AM", staffNote: "Small stain near the window. Guest is out until 2 PM.",
  },
  {
    id: "t3", title: "Rollaway bed & extra pillows", room: "Room 812", note: "Extra pillows and a rollaway bed for an arriving family of four.",
    status: "pending", left: 26, total: 40, guest: "Patel family", roomType: "Family Suite", floor: 8, stay: "Arriving 12:30 PM · 2 nights", prefs: ["High floor", "Extra pillows"],
    source: "PMS pre-arrival", created: "10:29 AM",
  },
  {
    id: "t7", title: "Baby cot setup", room: "Room 704", note: "Baby cot to be set up before the guest returns.",
    status: "pending", left: 12, total: 30, guest: "Sarah Chen", roomType: "Deluxe King", floor: 7, stay: "In house · 2 nights", prefs: ["Baby cot", "Quiet room"],
    source: "Guest chat", created: "10:26 AM",
  },
  {
    id: "t8", title: "Fresh linen change", room: "Room 410", note: "Fresh linen change requested by the guest.", status: "completed", left: 12, total: 45, time: "Done at 8:10 AM",
    guest: "Ethan Ross", roomType: "Deluxe King", floor: 4, stay: "In house", prefs: [], source: "Guest chat", created: "7:50 AM",
  },
  {
    id: "t9", title: "Towels replenished", room: "Room 227", note: "Bath towels replenished and amenities restocked.", status: "completed", left: 20, total: 45, time: "Done at 8:45 AM",
    guest: "Grace Kim", roomType: "Standard Twin", floor: 2, stay: "In house", prefs: [], source: "Staff", created: "8:20 AM",
  },
  {
    id: "t11", title: "Turndown service", room: "Room 118", note: "Turndown service completed with extra water bottles.", status: "completed", left: 30, total: 60, time: "Done at 9:05 AM",
    guest: "Noah Martinez", roomType: "Deluxe King", floor: 1, stay: "In house", prefs: [], source: "Staff", created: "8:50 AM",
  },
];

const NOTIFS = [
  { label: "Completed", tone: "text-success", task: "Full towel change & linens", sub: "Room 501", time: "10:31 AM", id: "t1" },
  { label: "SLA breach", tone: "text-brand", task: "Extra pillows", sub: "Room 908 · Overdue by 8 mins", time: "10:28 AM", id: "t10" },
  { label: "New task", tone: "text-blue-600", task: "Baby cot setup", sub: "Room 704", time: "10:26 AM", id: "t7" },
  { label: "New task", tone: "text-blue-600", task: "Rollaway bed & pillows", sub: "Room 812", time: "10:22 AM", id: "t3" },
];

const DEFAULT_SLA = 40;

/** Compact live SLA on the task notification, matching the prototype banner: mm:ss, +mm:ss once overdue. */
function NotifSla({ left, total }: { left: number; total: number }) {
  useClock();
  const remaining = secsFromMinutes(left);
  const totalSeconds = Math.max(total, 0) * 60;
  const overdue = remaining <= 0;
  const pct = totalSeconds > 0 ? Math.max(0, Math.min(100, (remaining / totalSeconds) * 100)) : 0;
  const color = overdue || pct <= 25 ? "#EF4444" : pct <= 50 ? "#F59E0B" : "#22C55E";
  const abs = Math.abs(remaining);
  const mm = Math.floor(abs / 60).toString().padStart(2, "0");
  const ss = (abs % 60).toString().padStart(2, "0");
  return <span className="text-[11px] font-bold tabular-nums" style={{ color }}>{overdue ? `+${mm}:${ss}` : `${mm}:${ss}`}</span>;
}

/** Line Staff task card: the shared TaskCard, with an Accept action when a task is waiting */
function LsCard({ t, onOpen, onAccept }: { t: Task; onOpen?: () => void; onAccept?: () => void }) {
  const done = t.status === "completed";
  return (
    <TaskCard
      room={t.room}
      dept={t.dept ?? "Housekeeping"}
      note={t.title}
      staff={t.status === "pending" ? null : LS_ME}
      left={done ? undefined : t.left}
      total={t.total}
      done={done}
      badge={done ? "Completed" : t.status === "pending" ? "Pending" : "In Progress"}
      flags={!done && t.escalatedTo ? [{ label: "Escalation", tone: "text-red-600" }] : []}
      onClick={onOpen}
      footer={
        onAccept ? (
          <button
            onClick={onAccept}
            className="w-full rounded-control border-[1.5px] border-brand/35 bg-brand-tint py-[15px] font-display text-[14px] font-bold text-brand active:bg-[#FDE9E1]"
          >
            Accept
          </button>
        ) : undefined
      }
    />
  );
}

function Row({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <Icon className="h-4 w-4 shrink-0 text-ink-tertiary" />
      <span className="w-24 shrink-0 text-[12px] font-normal text-ink-secondary">{label}</span>
      <span className="min-w-0 flex-1 text-[14px] font-medium text-ink">{children}</span>
    </div>
  );
}

export function LineStaffPrototype() {
  const nav = useNav<Screen>({ name: "home" });
  const { flash, node: toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [incoming, setIncoming] = useState<Incoming | null>(null);
  const [bannerIn, setBannerIn] = useState(false);
  const [simCount, setSimCount] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpKind, setHelpKind] = useState<HelpKind>("escalate");
  const [helpNote, setHelpNote] = useState("");
  const [compOpen, setCompOpen] = useState(false);
  const [chat, setChat] = useState<Record<string, ChatMsg[]>>({});
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [guestQuery, setGuestQuery] = useState("");
  const [guestFilter, setGuestFilter] = useState<(typeof CHAT_FILTERS)[number]>("All");
  const [taskQuery, setTaskQuery] = useState("");
  const [taskFilter, setTaskFilter] = useState<(typeof TASK_FILTERS)[number]>("All");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<Record<string, string>>({});
  const [signedOut, setSignedOut] = useState(false);
  // create manual task
  const [dept, setDept] = useState("Housekeeping");
  const [taskTitle, setTaskTitle] = useState("");
  const [room, setRoom] = useState("");
  const [guestName, setGuestName] = useState("");
  const [details, setDetails] = useState("");

  const cur = nav.cur;
  const offered = incoming ? tasks.find((t) => t.id === incoming.id && t.status === "pending") : undefined;
  const setStatus = (id: string, status: Status, time?: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status, time } : t)));
  const openTask = (id: string) => nav.push({ name: "taskDetail", id });
  const accept = (id: string) => { setStatus(id, "progress"); flash("Task accepted"); };

  const pending = tasks.filter((t) => t.status === "pending");
  const inProgress = tasks.filter((t) => t.status === "progress");
  const completed = tasks.filter((t) => t.status === "completed");
  const active = tasks.find((t) => t.id === cur.id) ?? tasks[0];

  // home stat cards — same set as the Mid Manager home, with Escalations swapped for Active Chats
  const lsOpen = tasks.filter((t) => t.status !== "completed");
  const lsAtRisk = tasks.filter((t) => t.status !== "completed" && t.left >= 0 && t.left / t.total < 0.35);
  const lsOverdue = tasks.filter((t) => t.status !== "completed" && t.left < 0);
  const lsComplaints = tasks.filter((t) => t.complaint && t.status !== "completed");
  const taskFilterFn: Record<(typeof TASK_FILTERS)[number], (t: Task) => boolean> = {
    All: () => true,
    Unassigned: (t) => t.status === "pending",
    "At Risk": (t) => t.status !== "completed" && t.left >= 0 && t.left / t.total < 0.35,
    Overdue: (t) => t.status !== "completed" && t.left < 0,
    Completed: (t) => t.status === "completed",
  };
  const tasksFiltered = tasks.filter((t) => {
    const q = taskQuery.trim().toLowerCase();
    const matches = !q || `${t.title} ${t.room} ${t.guest}`.toLowerCase().includes(q);
    return matches && taskFilterFn[taskFilter](t);
  });
  const taskChipCounts = Object.fromEntries(TASK_FILTERS.map((f) => [f, tasks.filter(taskFilterFn[f]).length])) as Record<(typeof TASK_FILTERS)[number], number>;

  const guests = useMemo(() => {
    const map = new Map<string, { name: string; room: string; roomType: string; title: string; open: boolean; complaint: boolean }>();
    for (const t of tasks) {
      if (!t.guest || t.guest === "—" || t.guest === "Guest") continue;
      const cur = map.get(t.guest);
      if (!cur) map.set(t.guest, { name: t.guest, room: t.room, roomType: t.roomType !== "—" ? t.roomType : "", title: t.title, open: t.status !== "completed", complaint: !!t.complaint });
      else {
        if (t.status !== "completed") cur.open = true;
        if (t.complaint) cur.complaint = true;
      }
    }
    return Array.from(map.values());
  }, [tasks]);
  const preArrival = (name: string) => PRE_ARRIVAL_GUESTS.find((g) => g.name === name && !guests.some((x) => x.name === name));
  const seedThread = (g: { title: string; room: string }): ChatMsg[] => [
    { from: "guest", text: `Hello, could you help with this? ${g.title} for ${g.room}.` },
    { from: "ai", text: "Thanks for letting us know — I've passed this to housekeeping and they're on it." },
  ];
  const threadOf = (name: string) => {
    if (chat[name]) return chat[name];
    const pre = preArrival(name);
    if (pre) return [{ from: "guest" as const, text: pre.notes }, { from: "ai" as const, text: "Thanks for letting us know — I've flagged this to the team." }];
    return seedThread(guests.find((g) => g.name === name) ?? { title: "a request", room: "my room" });
  };
  const guestQ = guestQuery.trim().toLowerCase();
  const guestsFiltered = guests
    .filter((g) => {
      if (guestFilter === "Pre-arrival") return false;
      if (guestFilter === "Unread" && !sampleUnread(g.name)) return false;
      if (guestFilter === "Complaints" && !g.complaint) return false;
      if (guestFilter === "Open requests" && !g.open) return false;
      return `${g.name} ${g.room}`.toLowerCase().includes(guestQ);
    })
    .sort((a, b) => Number(b.complaint) - Number(a.complaint) || Number(b.open) - Number(a.open) || a.name.localeCompare(b.name));
  const preArrivalFiltered = guestFilter === "All" || guestFilter === "Pre-arrival" || guestFilter === "Unread"
    ? PRE_ARRIVAL_GUESTS
        .filter((g) => !guests.some((x) => x.name === g.name) && (!guestQ || g.name.toLowerCase().includes(guestQ)) && (guestFilter !== "Unread" || sampleUnread(g.name) > 0))
        .slice(0, guestFilter === "Pre-arrival" ? 10 : 3)
    : [];
  const NewChatSheet = newChatOpen && (
    <Sheet title="New chat" onClose={() => setNewChatOpen(false)}>
      <div className="-mx-1 max-h-[420px] overflow-y-auto">
        {guests.map((g) => (
          <ChatRow
            key={g.name}
            name={g.name}
            room={g.room}
            roomType={g.roomType}
            plain
            preview="Start a conversation"
            onOpen={() => { setNewChatOpen(false); nav.push({ name: "guestChat", id: g.name }); }}
          />
        ))}
      </div>
    </Sheet>
  );
  const lsNav = (
    <FloatingNav
      items={[
        { key: "home", label: "Home", icon: LayoutGrid },
        { key: "tasks", label: "Tasks", icon: CheckSquare },
        { key: "guests", label: "Chats", icon: MessageSquare },
        { key: "profile", label: "More", icon: MoreNavIcon },
      ]}
      active={cur.name === "guests" ? "guests" : cur.name === "profile" ? "profile" : cur.name === "tasks" ? "tasks" : "home"}
      onChange={(k) => nav.go({ name: k as "home" | "tasks" | "guests" | "profile" })}
    />
  );

  const completeTask = (t: Task) => {
    setStatus(t.id, "completed", "Done just now");
    if (!t.guest || t.guest === "—" || t.guest === "Guest") { flash(`${t.room} marked complete`); nav.back(); return; }
    setAiDrafts((d) => ({ ...d, [t.guest]: `Hi ${t.guest.split(" ")[0]}, we've taken care of your request (${t.title.toLowerCase()}) for ${t.room}. Please let us know if there's anything else we can do — we hope you're enjoying your stay.` }));
    flash("Task complete — review the reply to your guest");
    nav.push({ name: "guestChat", id: t.guest });
  };

  // a new task offered to this staff member: the notification stays until they accept it
  const simulateTaskNotification = () => {
    const s = NEW_TASKS[simCount % NEW_TASKS.length];
    const id = "n" + Date.now();
    setTasks((ts) => [{
      id, title: s.title, room: s.room, note: s.note, status: "pending", left: s.total, total: s.total,
      guest: s.guest, roomType: s.roomType, floor: s.floor, stay: s.stay, prefs: s.prefs, source: "New task",
      created: s.time, dept: s.dept,
    }, ...ts]);
    setSimCount((n) => n + 1);
    setBannerIn(false);
    setIncoming({ id, title: s.title, room: s.room, total: s.total, dept: s.dept });
  };

  useEffect(() => {
    if (!incoming) return;
    const show = setTimeout(() => setBannerIn(true), 30);
    return () => clearTimeout(show);
  }, [incoming]);

  const openCreate = () => {
    setDept("Housekeeping"); setTaskTitle(""); setRoom(""); setGuestName(""); setDetails("");
    nav.push({ name: "create" });
  };

  const createTask = () => {
    const id = "n" + Date.now();
    const r = room.trim() ? `Room ${room.trim().replace(/^room\s*/i, "")}` : "—";
    const title = taskTitle.trim();
    setTasks((ts) => [
      {
        id, title, room: r, note: details.trim() || title, status: "pending", left: DEFAULT_SLA, total: DEFAULT_SLA,
        guest: guestName.trim() || "—", roomType: "—", floor: 0, stay: "—", prefs: [], source: "Created by you", created: "Just now", dept,
      },
      ...ts,
    ]);
    nav.go({ name: "home" });
    flash("Task created — unassigned");
  };

  /* ---------------- screens ---------------- */

  const Home = (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-28 no-scrollbar">
        <div className="px-6 py-2">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className={`relative ${ICON_BTN}`}>
                <Bell className="h-[22px] w-[22px] text-ink" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>
          <div className="mt-3 min-w-0">
            <div className="truncate font-display text-[18px] font-bold leading-tight text-ink">Good morning, {LS_ME.split(" ")[0]} 👋</div>
            <p className="mt-0.5 text-[12px] font-normal text-ink-secondary">Here's what's happening today</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 px-6">
          <HomeStat icon={CheckSquare} label="Open Tasks" value={lsOpen.length} sub={`${inProgress.length} in progress`} onClick={() => nav.go({ name: "tasks" })} />
          <HomeStat icon={MessageSquare} label="Guest Chats" value={guests.length} sub={`${guests.filter((g) => sampleUnread(g.name) > 0).length} unread`} onClick={() => nav.go({ name: "guests" })} />
          <HomeStat icon={Clock} label="Avg. Response" value="2m 45s" sub="↓ 18%" subTone="text-[#22C55E]" onClick={() => nav.push({ name: "analytics" })} />
          <HomeStat icon={AlertTriangle} label="Complaints" value={lsComplaints.length} sub={lsComplaints.length ? "Needs attention" : "All clear"} subTone={lsComplaints.length ? "text-[#EF4444]" : "text-[#22C55E]"} onClick={() => nav.go({ name: "tasks" })} />
        </div>

        <div className="mt-6"><SectionTitle dot={false} small action={<span className="text-[12px] text-ink-tertiary">{inProgress.length}</span>}>Active tasks</SectionTitle></div>
        <div className="mt-2.5 space-y-3 px-6">
          {inProgress.map((t) => <LsCard key={t.id} t={t} onOpen={() => openTask(t.id)} />)}
          {!inProgress.length && <p className="rounded-2xl bg-white p-4 text-center text-[12px] text-ink-tertiary">Nothing active. Accept a pending task.</p>}
        </div>

        <div className="mt-6"><SectionTitle dot={false} small action={<span className="text-[12px] text-ink-tertiary">{pending.length}</span>}>Open tasks</SectionTitle></div>
        <div className="mt-2.5 space-y-3 px-6">
          {pending.map((t) => <LsCard key={t.id} t={t} onOpen={() => openTask(t.id)} onAccept={() => accept(t.id)} />)}
          {!pending.length && <p className="rounded-2xl bg-white p-4 text-center text-[12px] text-ink-tertiary">You&apos;re all caught up.</p>}
        </div>

        <div className="mt-6"><SectionTitle dot={false} small action={<span className="text-[12px] text-ink-tertiary">{completed.length}</span>}>Completed</SectionTitle></div>
        <div className="mt-2.5 space-y-3 px-6">
          {completed.map((t) => <LsCard key={t.id} t={t} onOpen={() => openTask(t.id)} />)}
        </div>
      </div>
      {lsNav}
    </div>
  );

  const Tasks = (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-28 no-scrollbar">
        <div className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-white pb-3">
<div className="flex items-center justify-between px-6 py-2">
          <div className="font-display text-[20px] font-bold text-ink">Tasks</div>
          <div className="flex items-center gap-2">
            <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className={`relative ${ICON_BTN}`}>
              <Bell className="h-[22px] w-[22px] text-ink" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
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
          {tasksFiltered.map((t) => <LsCard key={t.id} t={t} onOpen={() => openTask(t.id)} />)}
          {!tasksFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No tasks match.</p>}
        </div>
      </div>
      {lsNav}
    </div>
  );

  const Guests = (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-28 no-scrollbar">
        <div className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-white pb-3">
<div className="flex items-center justify-between px-6 py-2">
          <div className="font-display text-[20px] font-bold text-ink">Chats</div>
          <div className="flex items-center gap-2">
            <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className={`relative ${ICON_BTN}`}>
              <Bell className="h-[22px] w-[22px] text-ink" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
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
        <div className="mt-3"><Chips flat items={CHAT_FILTERS} active={guestFilter} onChange={setGuestFilter} /></div>
</div>
        <div className="mt-1 px-6">
          {guestsFiltered.map((g) => {
            const th = threadOf(g.name);
            let unread = 0;
            for (let i = th.length - 1; i >= 0 && th[i].from === "guest"; i--) unread++;
            return (
              <ChatRow
                key={g.name}
                name={g.name}
                room={g.room}
                roomType={g.roomType}
                preview={th.length ? th[th.length - 1].text : "No messages yet"}
                tone={g.complaint ? "bg-red-50 text-red-600" : undefined}
                complaint={g.complaint}
                unread={unread || sampleUnread(g.name)}
                status={!g.open ? "Resolved" : g.complaint || (unread || sampleUnread(g.name)) > 0 ? "Pending" : "Active"}
                onAvatar={() => nav.push({ name: "guestProfile", id: g.name })}
                onOpen={() => nav.push({ name: "guestChat", id: g.name })}
              />
            );
          })}
          {preArrivalFiltered.map((g) => (
            <ChatRow
              key={`pre-${g.name}`}
              name={g.name}
              room={g.room || "Room TBC"}
              roomType={g.roomType}
              status="Pre-Arrival"
              tone="bg-subtle text-ink-secondary"
              preview={g.notes}
              unread={sampleUnread(g.name)}
              onAvatar={() => nav.push({ name: "guestProfile", id: g.name })}
              onOpen={() => nav.push({ name: "guestChat", id: g.name })}
            />
          ))}
          {!guestsFiltered.length && !preArrivalFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No guests match.</p>}
        </div>
      </div>
      {lsNav}
    </div>
  );

  const chatName = cur.name === "guestChat" ? cur.id : undefined;
  const chatTasks = chatName ? tasks.filter((t) => t.guest === chatName && t.status !== "completed") : [];
  const chatTask = chatTasks.find((t) => t.status === "progress") ?? chatTasks[0];
  const GuestChat = chatName && (
    <GuestChatScreen
      name={chatName}
      room={guests.find((g) => g.name === chatName)?.room ?? preArrival(chatName)?.room ?? ""}
      roomType={guests.find((g) => g.name === chatName)?.roomType ?? preArrival(chatName)?.roomType}
      thread={threadOf(chatName)}
      manual={!!manual[chatName]}
      onToggle={() => { setManual((m) => ({ ...m, [chatName]: !m[chatName] })); flash(manual[chatName] ? "Handed back to AI" : "AI paused — you're now replying"); }}
      onSend={(text) => setChat((c) => ({ ...c, [chatName]: [...threadOf(chatName), { from: "me", text }] }))}
      onBack={nav.back}
      onProfile={() => nav.push({ name: "guestProfile", id: chatName })}
      task={chatTask && {
        id: chatTask.id, title: chatTask.title, left: chatTask.left, total: chatTask.total,
        action: chatTask.status === "pending" ? "Accept" : "Complete",
        onAction: () => {
          if (chatTask.status === "pending") return accept(chatTask.id);
          setStatus(chatTask.id, "completed", "Done just now");
          setAiDrafts((d) => ({ ...d, [chatName]: `Hi ${chatName.split(" ")[0]}, we've taken care of your request (${chatTask.title.split(" — ")[0].toLowerCase()}) for ${chatTask.room}. Please let us know if there's anything else we can do — we hope you're enjoying your stay.` }));
          flash("Task complete — review the reply to your guest");
        },
      }}
      aiDraft={aiDrafts[chatName]}
      onDraftChange={(text) => setAiDrafts((d) => ({ ...d, [chatName]: text }))}
      onApproveDraft={() => {
        const text = aiDrafts[chatName]?.trim();
        if (!text) return;
        setChat((c) => ({ ...c, [chatName]: [...threadOf(chatName), { from: "me", text }] }));
        setAiDrafts((d) => { const n = { ...d }; delete n[chatName]; return n; });
        flash("Reply sent to guest");
      }}
    />
  );

  const profileName = cur.name === "guestProfile" ? cur.id : undefined;
  const GuestProfile = profileName && (
    <GuestProfileScreen name={profileName} author="Aanya Khan · Line Staff" onBack={nav.back} onMessage={guests.some((g) => g.name === profileName) || preArrival(profileName) ? () => nav.push({ name: "guestChat", id: profileName }) : undefined} />
  );

  const Notifications = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Notifications" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {NOTIFS.map((n, i) => (
          <NotifRow key={i} label={n.label} tone={n.tone} time={n.time} task={n.task} sub={n.sub} unread={i < 2} onOpen={() => openTask(n.id)} />
        ))}
      </div>
    </div>
  );

  const TaskDetail = (
    <div className="relative flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-6 pb-3 pt-4">
        <button onClick={nav.back} aria-label="Back" className={ICON_BTN}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-tertiary">Task detail</span>
        {active.status !== "completed" && <div className="ml-auto"><SlaCountdown left={active.left} total={active.total} /></div>}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4 pt-4 no-scrollbar">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand"><BedDouble className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h2 className="font-display text-[18px] font-bold leading-[1.25] text-ink">{active.title}</h2>
            {active.status !== "progress" && (
              <span className={`mt-1 inline-block text-[11px] font-bold ${active.status === "completed" ? "text-success" : "text-ink-tertiary"}`}>
                {active.status === "completed" ? "Completed" : "Pending"}
              </span>
            )}
            {active.escalatedTo && active.status !== "completed" && <span className="ml-1.5 mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600"><ArrowUpRight className="h-3 w-3" /> Escalated to {active.escalatedTo}</span>}
          </div>
        </div>

        <div className="divide-y divide-line rounded-2xl border border-line bg-white px-4">
          {active.guest !== "—" && (
            <Row icon={User} label="Guest">
              <button onClick={() => nav.push({ name: "guestProfile", id: active.guest })} className="flex items-center gap-1 text-left font-medium text-brand">
                {active.guest} <ChevronRight className="h-4 w-4" />
              </button>
            </Row>
          )}
          <Row icon={BedDouble} label="Room">{active.room}</Row>
          <Row icon={Building2} label="Department">{active.dept ?? "Housekeeping"}</Row>
          <Row icon={UserCog} label="Assigned to">
            {active.status === "pending" ? <span className="text-red-600">Unassigned</span> : LS_ME}
          </Row>
        </div>

        <div className="rounded-2xl bg-[#F6F6F8] p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-tertiary">Notes</div>
          <p className="mt-2 text-[14px] font-normal leading-[1.6] text-ink">{active.note}</p>
          {active.staffNote && <p className="mt-2 text-[14px] font-normal leading-[1.6] text-ink">{active.staffNote}</p>}
        </div>

        {active.complaint && (
        <div className="rounded-2xl border border-line bg-white p-4">
          {active.compensation?.length ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-ink-tertiary">Compensation</span>
                <button onClick={() => setCompOpen(true)} className="text-[13px] font-semibold text-brand">Add compensation</button>
              </div>
              <div className="mt-2 space-y-2">
                {active.compensation.map((c, i) => (
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
      </div>

      {active.guest !== "—" && <MessageGuestButton raised onClick={() => nav.push({ name: "guestChat", id: active.guest })} />}

      <div className="flex shrink-0 gap-3 px-6 pb-6 pt-3">
        {active.status === "pending" ? (
          <button
            onClick={() => accept(active.id)}
            className="w-full rounded-control border-[1.5px] border-brand/35 bg-brand-tint py-[15px] font-display text-[14px] font-bold text-brand active:bg-[#FDE9E1]"
          >
            Accept
          </button>
        ) : (
          <>
            <Button variant="outline" className="flex-1 !font-bold" disabled={active.status === "completed"} onClick={() => { setHelpKind("escalate"); setHelpNote(""); setHelpOpen(true); }}>Need help</Button>
            <button
              className="flex-[1.3] rounded-control border-[1.5px] border-brand/35 bg-brand-tint py-[15px] font-display text-[14px] font-bold text-brand active:bg-[#FDE9E1] disabled:opacity-40"
              disabled={active.status === "completed"}
              onClick={() => completeTask(active)}
            >
              {active.status === "completed" ? "Completed" : "Mark complete"}
            </button>
          </>
        )}
      </div>
    </div>
  );

  const helpSubmit = () => {
    const target = helpKind === "escalate" ? "Supervisor" : helpKind === "escalateDuty" ? "Duty Manager" : null;
    const msg = target ? `Escalated to the ${target}` : "Reassignment request sent to your supervisor";
    if (target) setTasks((ts) => ts.map((t) => (t.id === active.id ? { ...t, escalatedTo: target } : t)));
    flash(msg);
    setHelpOpen(false);
    setHelpNote("");
  };

  const HelpSheet = helpOpen && (
    <Sheet title="Need help?" onClose={() => setHelpOpen(false)}>
      <p className="mb-3 text-[13px] text-ink-secondary">{active.title} · {active.room}</p>
      <div className="space-y-2.5">
        {HELP_OPTIONS.map((o) => {
          const on = helpKind === o.key;
          return (
            <button
              key={o.key}
              onClick={() => setHelpKind(o.key)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left ${on ? "border-brand bg-brand-tint/40" : "border-line bg-white"}`}
            >
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-brand" : "border-line"}`}>
                {on && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </span>
              <span className="min-w-0 text-[14px] font-semibold text-ink">{o.label}</span>
            </button>
          );
        })}
      </div>
      <Label>Add details (optional)</Label>
      <TextField rows={4} value={helpNote} onChange={setHelpNote} placeholder={HELP_OPTIONS.find((o) => o.key === helpKind)!.placeholder} />
      <Button className="mt-5 w-full" onClick={helpSubmit}>
        <Send className="h-4 w-4" /> {HELP_OPTIONS.find((o) => o.key === helpKind)!.cta}
      </Button>
    </Sheet>
  );

  const Create = (
    <div className="flex h-full flex-col">
      <TextHeader title="Create Manual Task" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-4 no-scrollbar">
        <ManualTaskFields
          guest={guestName} onGuest={setGuestName}
          room={room} onRoom={setRoom}
          title={taskTitle} onTitle={setTaskTitle}
          dept={dept} onDept={setDept}
          details={details} onDetails={setDetails}
        />
      </div>
      <div className="shrink-0 px-6 pb-6 pt-2">
        <Button className="w-full" disabled={!taskTitle.trim()} onClick={createTask}>Create Task</Button>
      </div>
    </div>
  );

  const Profile = (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-24 no-scrollbar">
        <ProfileScreen
          name="Aanya Khan" role="Line Staff" email="aanya.khan@alfonhotel.com" dept="Housekeeping"
          onNotifSettings={() => nav.push({ name: "notifSettings" })}
          onSignOut={() => setSignedOut(true)}
        />
      </div>
      {lsNav}
    </div>
  );
  const NotifSettings = <NotificationSettingsScreen persona="line" onBack={nav.back} />;

  const Analytics = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Analytics" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-3 no-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          <HomeStat icon={Clock} label="Avg. Response" value="2m 45s" sub="↓ 18%" subTone="text-[#22C55E]" />
          <HomeStat icon={CheckSquare} label="Completed" value={completed.length} sub="today" subTone="text-[#22C55E]" />
          <HomeStat icon={ClipboardCheck} label="SLA on time" value={`${Math.round((100 * (tasks.length - lsOverdue.length)) / Math.max(tasks.length, 1))}%`} sub="of your tasks" subTone="text-ink-tertiary" />
          <HomeStat icon={AlertTriangle} label="Overdue" value={lsOverdue.length} sub={lsOverdue.length ? "Needs attention" : "All clear"} subTone={lsOverdue.length ? "text-[#EF4444]" : "text-[#22C55E]"} />
        </div>
      </div>
    </div>
  );

  const VIEWS: Record<Screen["name"], React.ReactNode> = { home: Home, tasks: Tasks, notifications: Notifications, taskDetail: TaskDetail, create: Create, guests: Guests, guestChat: GuestChat, guestProfile: GuestProfile, profile: Profile, notifSettings: NotifSettings, analytics: Analytics };

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame white={!signedOut && ["guests", "profile"].includes(cur.name)}>
        {signedOut ? <SignedOutScreen onSignIn={() => { setSignedOut(false); nav.reset(); }} /> : VIEWS[cur.name]}
        {HelpSheet}
        {NewChatSheet}
        {compOpen && (
          <CompensationSheet
            subtitle={`${active.title} · ${active.room}`}
            approvers={["Sarah Ali (Supervisor)", "Daniel Reyes (Housekeeping Manager)", "Duty Manager"]}
            onClose={() => setCompOpen(false)}
            onSubmit={(type, reason, by) => {
              setTasks((ts) => ts.map((t) => (t.id === active.id ? { ...t, compensation: [...(t.compensation ?? []), { type, reason, by }] } : t)));
              setCompOpen(false);
              flash("Compensation submitted");
            }}
          />
        )}

        {incoming && offered && (
          <div className="absolute inset-x-3 top-3 z-50">
            <div className={`flex items-center gap-3 rounded-[20px] bg-[#1A1A1A] p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 ${bannerIn ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}>
              <button
                onClick={() => { openTask(incoming.id); setIncoming(null); }}
                aria-label="Open new task"
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#E8623A] to-[#D4522D] text-white"><Bell className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-[0.5px] text-brand">New task · {incoming.dept}</span>
                  <span className="block truncate font-display text-[13px] font-bold text-white">{incoming.title}</span>
                  <span className="mt-px block text-[12px] text-[#9CA3AF]">{incoming.room} · <NotifSla left={offered.left} total={offered.total} /></span>
                </span>
              </button>
              <button
                onClick={() => { accept(incoming.id); setIncoming(null); }}
                className="shrink-0 rounded-[10px] bg-brand px-3.5 py-1.5 font-display text-[12px] font-bold text-white active:bg-brand-hover"
              >
                Accept
              </button>
            </div>
          </div>
        )}
        {toast}
      </PhoneFrame>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white" onClick={simulateTaskNotification}>Task notification</button>
        <button
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary"
          onClick={() => { nav.reset(); setIncoming(null); setSimCount(0); setTasks(INITIAL); setChat({}); setManual({}); setAiDrafts({}); }}
        >
          Reset
        </button>
      </div>
      <p className="text-center text-[12px] text-ink-tertiary">
        Current screen: <span className="font-medium text-ink-secondary">{cur.name}</span> · tap a task, the bell or the orange “+” button.
      </p>
    </div>
  );
}
