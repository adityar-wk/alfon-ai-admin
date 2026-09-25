import { Button } from "../components/ui";
import { useEffect, useMemo, useState } from "react";
import { Bell, Menu as MenuIcon, Send, Plus, BedDouble, User, Building2, ChevronLeft, ChevronRight, ArrowUpRight, ListChecks, MessageCircle, Search } from "lucide-react";
import { DEPARTMENTS } from "../data/departments";
import {
  PhoneFrame,
  ScreenHeader,
  TextHeader,
  SectionTitle,
  SlaRing,
  SlaCountdown,
  CompensationSheet,
  FloatingNav,
  Avatar,
  Sheet,
  SelectField,
  TextField,
  Segmented,
  Label,
  useNav,
  useToast,
  CARD_SHADOW,
  type Priority,
  ChatRow,
  sampleUnread,
} from "./mobile";
import { GuestProfileScreen, GuestChatScreen, type ChatMsg } from "./guestviews";
import { ProfileScreen, NotificationSettingsScreen, SignedOutScreen } from "./profile";

type Screen = { name: "home" | "notifications" | "taskDetail" | "create" | "guests" | "guestChat" | "guestProfile" | "profile" | "notifSettings"; id?: string };

type HelpKind = "escalate" | "support" | "reassign";
const HELP_OPTIONS: { key: HelpKind; label: string; sub: string; cta: string; placeholder: string }[] = [
  { key: "escalate", label: "Escalate this task", sub: "Send it up to your supervisor", cta: "Escalate", placeholder: "Tell your supervisor what's blocking you…" },
  { key: "support", label: "Request support", sub: "Ask a colleague to help you with this task", cta: "Request support", placeholder: "What kind of help do you need…" },
  { key: "reassign", label: "Reassign to a colleague", sub: "Hand this task to someone else", cta: "Send request", placeholder: "Why does this need to be reassigned…" },
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
  escalatedTo?: "Supervisor" | "Mid Manager";
  complaint?: boolean;
  assignedBy?: string;
};

const ASSIGNED_SAMPLES = [
  { title: "Duvet & pillow set replacement", room: "Room 907", note: "Replace the duvet and add a hypoallergenic pillow set.", total: 30, by: "Sarah Ali · Supervisor", guest: "Marco Bianchi", roomType: "Deluxe King", floor: 9, stay: "Arriving today · 3 nights", prefs: ["Hypoallergenic bedding"] },
  { title: "Minibar restock", room: "Room 1410", note: "Restock the minibar before the guest returns from dinner.", total: 45, by: "Daniel Reyes · Mid Manager", guest: "Olivia Turner", roomType: "Deluxe Room", floor: 14, stay: "In house · 2 nights", prefs: ["Sparkling water"] },
  { title: "Turndown service", room: "Room 1206", note: "Evening turndown with extra water bottles.", total: 25, by: "Sarah Ali · Supervisor", guest: "James Whitfield", roomType: "Executive Room", floor: 12, stay: "In house · 3 nights", prefs: ["Late turndown"] },
];

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
  { title: "Full towel change & linens", room: "Room 501", state: "Completed", tone: "text-emerald-600", time: "10:31 AM", id: "t1" },
  { title: "Extra pillows", room: "Room 908", state: "Overdue by 8 mins", tone: "text-red-600", time: "10:28 AM", id: "t10" },
  { title: "Baby cot setup", room: "Room 704", state: "New task", tone: "text-brand", time: "10:26 AM", id: "t7" },
  { title: "Rollaway bed & pillows", room: "Room 812", state: "New task", tone: "text-brand", time: "10:22 AM", id: "t3" },
];

const DEFAULT_SLA = 40;

/** task card: task name first, room second, SLA timer on the right, actions inside the card */
function LsCard({ t, onOpen, onAccept }: { t: Task; onOpen?: () => void; onAccept?: () => void }) {
  const done = t.status === "completed";
  return (
    <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
      <div onClick={onOpen} role={onOpen ? "button" : undefined} className={`flex items-start gap-3 ${onOpen ? "cursor-pointer" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold leading-snug text-ink">{t.title}</div>
          <div className="mt-0.5 text-[12px] font-medium text-ink-secondary">{t.room}</div>
          {t.assignedBy && !done && <span className="mt-1.5 mr-1.5 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">Assigned by {t.assignedBy.split(" · ")[1]}</span>}
          {t.escalatedTo && !done && <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600"><ArrowUpRight className="h-3 w-3" /> Escalated to {t.escalatedTo}</span>}
          {done && t.time && <div className="mt-1.5 text-[11px] font-medium text-emerald-600">✓ {t.time}</div>}
        </div>
        {!done && <SlaRing left={t.left} total={t.total} size={50} />}
      </div>
      {onAccept && (
        <div className="mt-3.5 border-t border-line pt-3.5">
          <button onClick={onAccept} className="flex h-10 w-full items-center justify-center rounded-xl bg-brand text-[13px] font-semibold text-white shadow-[0_2px_6px_rgba(241,90,36,0.16)]">
            Accept
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <Icon className="h-4 w-4 shrink-0 text-ink-tertiary" />
      <span className="w-24 shrink-0 text-[13px] text-ink-tertiary">{label}</span>
      <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{children}</span>
    </div>
  );
}

export function LineStaffPrototype() {
  const nav = useNav<Screen>({ name: "home" });
  const { flash, node: toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [incoming, setIncoming] = useState<{ id: string; title: string; room: string; total: number; by: string } | null>(null);
  const [bannerIn, setBannerIn] = useState(false);
  const [assignCount, setAssignCount] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpKind, setHelpKind] = useState<HelpKind>("escalate");
  const [helpNote, setHelpNote] = useState("");
  const [compOpen, setCompOpen] = useState(false);
  const [chat, setChat] = useState<Record<string, ChatMsg[]>>({});
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [guestQuery, setGuestQuery] = useState("");
  const [aiDrafts, setAiDrafts] = useState<Record<string, string>>({});
  const [signedOut, setSignedOut] = useState(false);

  // create manual task
  const [dept, setDept] = useState("");
  const [service, setService] = useState("");
  const [room, setRoom] = useState("");
  const [details, setDetails] = useState("");

  const cur = nav.cur;
  const setStatus = (id: string, status: Status, time?: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status, time } : t)));
  const openTask = (id: string) => nav.push({ name: "taskDetail", id });
  const accept = (id: string) => { setStatus(id, "progress"); flash("Task accepted"); };

  const pending = tasks.filter((t) => t.status === "pending");
  const inProgress = tasks.filter((t) => t.status === "progress");
  const completed = tasks.filter((t) => t.status === "completed");
  const active = tasks.find((t) => t.id === cur.id) ?? tasks[0];
  const services = DEPARTMENTS.find((d) => d.name === dept)?.services.filter((s) => s.active).map((s) => s.name) ?? [];

  const guests = useMemo(() => {
    const map = new Map<string, { name: string; room: string; title: string }>();
    for (const t of tasks) {
      if (!t.guest || t.guest === "—" || t.guest === "Guest") continue;
      if (!map.has(t.guest)) map.set(t.guest, { name: t.guest, room: t.room, title: t.title });
    }
    return Array.from(map.values());
  }, [tasks]);
  const seedThread = (g: { title: string; room: string }): ChatMsg[] => [
    { from: "guest", text: `Hello, could you help with this? ${g.title} for ${g.room}.` },
    { from: "ai", text: "Thanks for letting us know — I've passed this to housekeeping and they're on it." },
  ];
  const threadOf = (name: string) => chat[name] ?? seedThread(guests.find((g) => g.name === name) ?? { title: "a request", room: "my room" });
  const guestsFiltered = guests.filter((g) => `${g.name} ${g.room}`.toLowerCase().includes(guestQuery.trim().toLowerCase()));
  const lsNav = (
    <FloatingNav
      items={[
        { key: "tasks", label: "Tasks", icon: ListChecks },
        { key: "guests", label: "Chats", icon: MessageCircle },
      ]}
      active={cur.name === "guests" ? "guests" : "tasks"}
      onChange={(k) => nav.go({ name: k === "guests" ? "guests" : "home" })}
    />
  );

  const completeTask = (t: Task) => {
    setStatus(t.id, "completed", "Done just now");
    if (!t.guest || t.guest === "—" || t.guest === "Guest") { flash(`${t.room} marked complete`); nav.back(); return; }
    setAiDrafts((d) => ({ ...d, [t.guest]: `Hi ${t.guest.split(" ")[0]}, we've taken care of your request (${t.title.toLowerCase()}) for ${t.room}. Please let us know if there's anything else we can do — we hope you're enjoying your stay.` }));
    flash("Task complete — review the reply to your guest");
    nav.push({ name: "guestChat", id: t.guest });
  };

  // a task pushed to this staff member by a supervisor / mid manager: already assigned, so it lands in progress
  const simulateAssigned = () => {
    const s = ASSIGNED_SAMPLES[assignCount % ASSIGNED_SAMPLES.length];
    const id = "n" + Date.now();
    setTasks((ts) => [{ id, title: s.title, room: s.room, note: s.note, status: "progress", left: s.total, total: s.total, guest: s.guest, roomType: s.roomType, floor: s.floor, stay: s.stay, prefs: s.prefs, source: s.by, created: "Just now", assignedBy: s.by }, ...ts]);
    setAssignCount((n) => n + 1);
    setBannerIn(false);
    setIncoming({ id, title: s.title, room: s.room, total: s.total, by: s.by });
  };

  useEffect(() => {
    if (!incoming) return;
    const show = setTimeout(() => setBannerIn(true), 30);
    const hide = setTimeout(() => setIncoming(null), 7000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [incoming]);

  const openCreate = () => {
    setDept(""); setService(""); setRoom(""); setDetails("");
    nav.push({ name: "create" });
  };

  const createTask = () => {
    const id = "n" + Date.now();
    const r = room.trim() ? `Room ${room.trim().replace(/^room\s*/i, "")}` : dept;
    setTasks((ts) => [
      {
        id, title: service, room: r, note: details.trim() || service, status: "progress", left: DEFAULT_SLA, total: DEFAULT_SLA,
        guest: "—", roomType: "—", floor: 0, stay: "—", prefs: [], source: "Created by you", created: "Just now", dept,
      },
      ...ts,
    ]);
    nav.go({ name: "home" });
    flash("Task created and assigned to you");
  };

  /* ---------------- screens ---------------- */

  const Home = (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-28 no-scrollbar">
        <div className="flex items-center justify-between px-6 py-2">
          <button onClick={() => nav.push({ name: "profile" })} aria-label="Menu" className="flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-ink/5">
            <MenuIcon className="h-[22px] w-[22px]" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-ink/5">
              <Bell className="h-[22px] w-[22px] text-ink" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <button onClick={openCreate} aria-label="Create task" className="flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-ink/5">
              <Plus className="h-6 w-6" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="mt-5"><SectionTitle dot={false} small action={<span className="text-[12px] text-ink-tertiary">{inProgress.length}</span>}>In progress</SectionTitle></div>
        <div className="mt-2.5 space-y-3 px-6">
          {inProgress.map((t) => <LsCard key={t.id} t={t} onOpen={() => openTask(t.id)} />)}
          {!inProgress.length && <p className="rounded-2xl bg-white p-4 text-center text-[12px] text-ink-tertiary">Nothing in progress. Accept a pending task.</p>}
        </div>

        <div className="mt-6"><SectionTitle dot={false} small action={<span className="text-[12px] text-ink-tertiary">{pending.length}</span>}>Pending</SectionTitle></div>
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

  const Guests = (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-28 no-scrollbar">
        <h1 className="px-6 pb-2 pt-4 text-[20px] font-semibold text-ink">Chats</h1>
        <div className="px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={guestQuery}
              onChange={(e) => setGuestQuery(e.target.value)}
              placeholder="Search guest or room"
              className="h-11 w-full rounded-full bg-[#F4F4F6] pl-10 pr-3 text-[14px] outline-none placeholder:text-ink-tertiary focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>
        <div className="mt-2 px-6">
          {guestsFiltered.map((g) => {
            const th = threadOf(g.name);
            let unread = 0;
            for (let i = th.length - 1; i >= 0 && th[i].from === "guest"; i--) unread++;
            return (
              <ChatRow
                key={g.name}
                name={g.name}
                room={g.room}
                preview={th.length ? th[th.length - 1].text : "No messages yet"}
                unread={unread || sampleUnread(g.name)}
                onAvatar={() => nav.push({ name: "guestProfile", id: g.name })}
                onOpen={() => nav.push({ name: "guestChat", id: g.name })}
              />
            );
          })}
          {!guestsFiltered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No guests match.</p>}
        </div>
      </div>
      {lsNav}
    </div>
  );

  const chatName = cur.name === "guestChat" ? cur.id : undefined;
  const GuestChat = chatName && (
    <GuestChatScreen
      name={chatName}
      room={guests.find((g) => g.name === chatName)?.room ?? ""}
      thread={threadOf(chatName)}
      manual={!!manual[chatName]}
      onToggle={() => { setManual((m) => ({ ...m, [chatName]: !m[chatName] })); flash(manual[chatName] ? "Handed back to AI" : "AI paused — you're now replying"); }}
      onSend={(text) => setChat((c) => ({ ...c, [chatName]: [...threadOf(chatName), { from: "me", text }] }))}
      onBack={nav.back}
      onProfile={() => nav.push({ name: "guestProfile", id: chatName })}
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
    <GuestProfileScreen name={profileName} author="Aanya Khan · Line Staff" onBack={nav.back} onMessage={guests.some((g) => g.name === profileName) ? () => nav.push({ name: "guestChat", id: profileName }) : undefined} />
  );

  const Notifications = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Notifications" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {NOTIFS.map((n, i) => (
          <button key={i} onClick={() => openTask(n.id)} className="relative block w-full border-b border-dashed border-ink/20 py-3.5 pr-16 text-left last:border-0">
            <div className="text-[14px] font-semibold text-ink">{n.title}</div>
            <div className="mt-0.5 text-[12px]"><span className="text-ink-secondary">{n.room}</span> <span className="text-ink-tertiary">·</span> <span className={`font-semibold ${n.tone}`}>{n.state}</span></div>
            <span className="absolute bottom-3.5 right-0 text-[11px] text-ink-tertiary">{n.time}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const TaskDetail = (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-6 pb-3 pt-4">
        <button onClick={nav.back} aria-label="Back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-[13px] font-semibold text-ink-secondary">Task detail</span>
        {active.status !== "completed" && <div className="ml-auto"><SlaCountdown left={active.left} total={active.total} /></div>}
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4 pt-4 no-scrollbar">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand"><BedDouble className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h2 className="text-[18px] font-bold leading-snug text-ink">{active.title}</h2>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${active.status === "completed" ? "bg-emerald-50 text-emerald-600" : active.status === "progress" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-700"}`}>
              {active.status === "completed" ? "Completed" : active.status === "progress" ? "In progress" : "Pending"}
            </span>
            {active.escalatedTo && active.status !== "completed" && <span className="ml-1.5 mt-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-600"><ArrowUpRight className="h-3 w-3" /> Escalated to {active.escalatedTo}</span>}
          </div>
        </div>

        <div className="divide-y divide-line rounded-2xl border border-line bg-white px-4">
          {active.guest !== "—" && (
            <Row icon={User} label="Guest">
              <button onClick={() => nav.push({ name: "guestProfile", id: active.guest })} className="flex items-center gap-1 text-left font-semibold text-brand">
                {active.guest} <ChevronRight className="h-4 w-4" />
              </button>
            </Row>
          )}
          <Row icon={BedDouble} label="Room">{active.room}</Row>
          <Row icon={Building2} label="Department">{active.dept ?? "Housekeeping"}</Row>
        </div>

        <div className="rounded-2xl bg-[#F6F6F8] p-4">
          <div className="text-[12px] font-semibold text-ink-tertiary">Notes</div>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{active.note}</p>
          {active.staffNote && <p className="mt-2 text-[14px] leading-relaxed text-ink">{active.staffNote}</p>}
        </div>

        {active.complaint && (
        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-ink-tertiary">Compensation</span>
            <button onClick={() => setCompOpen(true)} className="text-[13px] font-semibold text-brand">Add compensation</button>
          </div>
          {active.compensation?.length ? (
            <div className="mt-2 space-y-2">
              {active.compensation.map((c, i) => (
                <div key={i} className="rounded-xl bg-[#F6F6F8] p-3">
                  <div className="text-[14px] font-medium text-ink">{c.type}</div>
                  <p className="text-[12px] text-ink-secondary">{c.reason}</p>
                  <p className="mt-0.5 text-[11px] text-ink-tertiary">Approved by {c.by}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-[13px] text-ink-tertiary">None given.</p>
          )}
        </div>
        )}
      </div>

      <div className="flex shrink-0 gap-3 px-6 pb-6 pt-3">
        {active.status === "pending" ? (
          <Button className="w-full" onClick={() => accept(active.id)}>Accept</Button>
        ) : (
          <>
            <Button variant="outline" className="flex-1" disabled={active.status === "completed"} onClick={() => { setHelpKind("escalate"); setHelpNote(""); setHelpOpen(true); }}>Need help</Button>
            <Button
              className="flex-[1.3]"
              disabled={active.status === "completed"}
              onClick={() => completeTask(active)}
            >
              {active.status === "completed" ? "Completed" : "Mark complete"}
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const helpSubmit = () => {
    const msg =
      helpKind === "escalate" ? "Escalated to your supervisor" : helpKind === "support" ? "Support request sent" : "Reassignment request sent to your supervisor";
    if (helpKind === "escalate") setTasks((ts) => ts.map((t) => (t.id === active.id ? { ...t, escalatedTo: "Supervisor" } : t)));
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
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-ink">{o.label}</span>
                <span className="block text-[12px] text-ink-secondary">{o.sub}</span>
              </span>
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
        <div className="space-y-3">
          <SelectField value={dept} onChange={(v) => { setDept(v); setService(""); }} placeholder="Select department" options={DEPARTMENTS.map((d) => d.name)} />
          <SelectField value={service} onChange={setService} placeholder="Select service" options={services} disabled={!dept} />
        </div>

        <Label>Room (optional)</Label>
        <TextField value={room} onChange={setRoom} placeholder="e.g. 501" />

        <Label>Details</Label>
        <TextField rows={5} value={details} onChange={setDetails} placeholder="Enter more details" />
      </div>
      <div className="shrink-0 px-6 pb-6 pt-2">
        <Button className="w-full" disabled={!dept || !service} onClick={createTask}>Create Task</Button>
      </div>
    </div>
  );

  const Profile = (
    <ProfileScreen
      name="Aanya Khan" role="Line Staff" dept="Housekeeping"
      onNotifSettings={() => nav.push({ name: "notifSettings" })}
      onSignOut={() => setSignedOut(true)}
      onBack={nav.back}
    />
  );
  const NotifSettings = <NotificationSettingsScreen persona="line" onBack={nav.back} />;

  const VIEWS: Record<Screen["name"], React.ReactNode> = { home: Home, notifications: Notifications, taskDetail: TaskDetail, create: Create, guests: Guests, guestChat: GuestChat, guestProfile: GuestProfile, profile: Profile, notifSettings: NotifSettings };

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame white={!signedOut && ["home", "guests", "profile"].includes(cur.name)}>
        {signedOut ? <SignedOutScreen onSignIn={() => { setSignedOut(false); nav.reset(); }} /> : VIEWS[cur.name]}
        {HelpSheet}
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

        {incoming && (
          <div className="absolute inset-x-3 top-3 z-50">
            <button
              onClick={() => { openTask(incoming.id); setIncoming(null); }}
              aria-label="New task assigned"
              className={`block w-full rounded-2xl bg-white p-3.5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/5 transition-all duration-300 ${bannerIn ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"><Bell className="h-[18px] w-[18px]" /></span>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[13px] font-semibold text-ink">New task assigned to you</div>
                  <div className="text-[11px] text-ink-tertiary">by {incoming.by}</div>
                </div>
                <span className="shrink-0 text-[11px] text-ink-tertiary">now</span>
              </div>
              <div className="mt-2.5 rounded-xl bg-[#F6F6F8] px-3 py-2.5">
                <div className="truncate text-[14px] font-semibold text-ink">{incoming.title}</div>
                <div className="mt-0.5 flex items-center justify-between text-[12px] text-ink-secondary">
                  <span>{incoming.room}</span>
                  <span className="font-semibold text-brand">SLA {incoming.total} min</span>
                </div>
              </div>
            </button>
          </div>
        )}
        {toast}
      </PhoneFrame>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white" onClick={simulateAssigned}>Simulate assigned task</button>
        <button
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary"
          onClick={() => { nav.reset(); setIncoming(null); setAssignCount(0); setTasks(INITIAL); setChat({}); setManual({}); setAiDrafts({}); }}
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
