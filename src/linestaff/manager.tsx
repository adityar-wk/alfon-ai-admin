import { useMemo, useState } from "react";
import {
  Bell, Home as HomeIcon, Plus, Users, UserCog, UserPlus, Repeat, Ban, CheckCircle2, StickyNote, Undo2, Hand, ArrowUpRight, Split, MessageCircle, Send, Filter, Sparkles, ChevronRight, Search,
} from "lucide-react";
import { DEPARTMENTS } from "../data/departments";
import { SEED_TASKS, STAFF, PRESENCE_DOT, HELP_REASONS, type MTask, type Presence, type EscType } from "./data";
import {
  PhoneFrame, ScreenHeader, SectionTitle, TaskCard, StatCard, Avatar, Chips, Segmented, FloatingNav, PrimaryButton, GhostButton, SelectField, TextField, Label, Sheet,
  useNav, useToast, CARD_SHADOW, TextHeader, type Priority,
} from "./mobile";
import { DetailBody, ActionGrid, StaffPicker, ReasonSheet, StatusTag, activeCount, atRiskCount, overdueCount, isOpen, isAtRisk, isOverdue } from "./parts";

type Screen = { name: "home" | "team" | "guests" | "guestDetail" | "detail" | "notifications" | "create"; id?: string };
type SheetState = { k: "assign" | "support" | "status" | "unable" | "close" | "note" | "sendBack" | "gm" | "route"; taskId: string } | null;

const ME = "Daniel Reyes";
const ESC_FILTERS = ["All", "SLA breach", "SLA at risk", "Guest complaint", "Unable to complete", "Staffing issue", "Supervisor escalation", "High priority"] as const;
const SEVS = ["Low", "Medium", "High", "Critical"] as const;
const SEV_COLOR: Record<(typeof SEVS)[number], string> = { Low: "bg-slate-500", Medium: "bg-amber-500", High: "bg-orange-500", Critical: "bg-red-500" };
const SEV_SLA: Record<Priority, number> = { Low: 60, Medium: 40, High: 20, Critical: 10 };
type EscFilter = (typeof ESC_FILTERS)[number];
const STATUS_CHOICES = ["In progress", "Awaiting acceptance", "Unassigned"] as const;
const AVAIL_ORDER: Presence[] = ["Available", "Busy", "On Break", "Off work"];
const ROLE_FILTERS = ["All", "Supervisor", "Line Staff"] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];
const AVAIL_FILTERS = ["All", "Available", "Busy", "On Break", "Off work"] as const;
type AvailFilter = (typeof AVAIL_FILTERS)[number];
const GUEST_FILTERS = ["All", "Complaints", "VIP", "Open requests"] as const;
type GuestFilter = (typeof GUEST_FILTERS)[number];

const NOTIFS = [
  { icon: "🚨", text: "Supervisor escalation — Room 1204 deep clean (staffing risk)", time: "10:20 AM", to: "t5" },
  { icon: "⏱️", text: "Critical SLA breach — Room 1103 stained bedding, 14 min over", time: "10:10 AM", to: "t6" },
  { icon: "😠", text: "High-priority complaint — Michael Johnson (VIP), negative sentiment", time: "10:15 AM", to: "t6" },
  { icon: "🔁", text: "Repeated unresolved task — Room 908 extra pillows, breached twice today", time: "10:25 AM", to: "t10" },
  { icon: "📉", text: "Workload issue — Aanya Khan has 2 tasks, 1 overdue", time: "10:28 AM", to: "team" },
  { icon: "❗", text: "Unassigned critical request — Room 2104 extra towels (High)", time: "10:31 AM", to: "t12" },
  { icon: "🤖", text: "AI escalated a guest conversation — Room 1103", time: "10:14 AM", to: "t6" },
];

const escSort = (a: MTask, b: MTask) => a.slaLeft - b.slaLeft;
const isEsc = (t: MTask) => (isOpen(t) || t.status === "unable" ? !!t.escalated : false);

type GuestEntry = {
  name: string;
  room: string;
  vip: boolean;
  complaint: boolean;
  sentiment?: string;
  risk?: string;
  prefs: string[];
  convo: string;
  summary: string;
  summaryIsComplaint: boolean;
  items: MTask[];
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
  const [sheet, setSheet] = useState<SheetState>(null);
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

  /* ---------- guests derived from the department's tasks ---------- */
  const guestMap = useMemo(() => {
    const map = new Map<string, GuestEntry>();
    for (const t of tasks) {
      const cur = map.get(t.guest) ?? {
        name: t.guest, room: t.room, vip: false, complaint: false, prefs: [], convo: "—", summary: "", summaryIsComplaint: false, items: [],
      };
      cur.room = t.room;
      cur.vip = cur.vip || !!t.vip;
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
      if (guestFilter === "VIP" && !g.vip) return false;
      if (guestFilter === "Open requests" && !g.items.some(isOpen)) return false;
      return !q || `${g.name} ${g.room}`.toLowerCase().includes(q);
    });
  }, [guestsSorted, guestFilter, guestQuery]);
  const guestActiveFilters = guestFilter !== "All" ? 1 : 0;

  const guestName = cur.name === "guestDetail" ? cur.id : undefined;
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
  const shell = (key: "home" | "team" | "guests", body: React.ReactNode) => (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-32 no-scrollbar">{body}</div>
      <FloatingNav
        active={key}
        onChange={(k) => nav.go({ name: k })}
        items={[
          { key: "home", label: "Home", icon: HomeIcon },
          { key: "team", label: "Team", icon: Users },
          { key: "guests", label: "Guests", icon: MessageCircle },
        ]}
        fab={{ icon: Plus, label: "Create task", onClick: openCreate }}
      />
    </div>
  );

  const Home = shell("home", (
    <>
      <div className="flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-3">
          <Avatar name={ME} size={42} tone="bg-ink text-white" />
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

  /* ---------- team ---------- */
  const teamActiveFilters = (roleFilter !== "All" ? 1 : 0) + (availFilter !== "All" ? 1 : 0);
  const filteredTeam = STAFF.filter((s) => (roleFilter === "All" || s.role === roleFilter) && (availFilter === "All" || s.status === availFilter)).sort(
    (a, b) => AVAIL_ORDER.indexOf(a.status) - AVAIL_ORDER.indexOf(b.status),
  );

  const Team = shell("team", (
    <>
      <ScreenHeader
        title="Team"
        sub="Housekeeping workload"
        right={
          <button
            onClick={() => setTeamFilterOpen(true)}
            aria-label="Filter"
            className={`relative flex h-10 w-10 items-center justify-center rounded-full ${teamActiveFilters ? "bg-brand text-white" : "bg-white text-ink shadow-sm"}`}
          >
            <Filter className="h-[18px] w-[18px]" />
            {teamActiveFilters > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{teamActiveFilters}</span>
            )}
          </button>
        }
      />
      <div className="grid grid-cols-4 gap-2 px-6">
        {AVAIL_ORDER.map((s) => (
          <div key={s} className={`rounded-2xl bg-white p-2.5 text-center ${CARD_SHADOW}`}>
            <div className="text-[20px] font-bold text-ink">{STAFF.filter((x) => x.status === s).length}</div>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-medium text-ink-secondary"><span className={`h-1.5 w-1.5 rounded-full ${PRESENCE_DOT[s]}`} />{s}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3 px-6">
        {filteredTeam.map((s) => {
          const n = activeCount(tasks, s.name), r = atRiskCount(tasks, s.name), o = overdueCount(tasks, s.name);
          const over = n >= 2 && (r > 0 || o > 0);
          return (
            <div key={s.name} className={`flex items-center gap-3 rounded-2xl bg-white p-3.5 ${CARD_SHADOW}`}>
              <Avatar name={s.name} tone={s.role === "Supervisor" ? "bg-violet-50 text-violet-600" : undefined} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                  {s.name}
                  {over && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">Overloaded</span>}
                </div>
                <div className="text-[12px] text-ink-secondary">{s.role}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary">
                  <span className={`h-2 w-2 rounded-full ${PRESENCE_DOT[s.status]}`} />
                  {s.status}
                  {s.role === "Line Staff" && ` · ${n} active${o ? ` · ${o} overdue` : ""}`}
                </div>
              </div>
            </div>
          );
        })}
        {!filteredTeam.length && <p className="rounded-2xl bg-white p-4 text-center text-[13px] text-ink-tertiary">No one matches these filters.</p>}
      </div>

      <div className="mt-7"><SectionTitle tone="bg-red-500">Unassigned tasks</SectionTitle></div>
      <div className="mt-3 space-y-3 px-6">
        {tasks.filter((t) => t.status === "unassigned").map(card)}
        {!tasks.some((t) => t.status === "unassigned") && <p className="rounded-2xl bg-white p-4 text-center text-[13px] text-ink-tertiary">Everything is assigned.</p>}
      </div>
    </>
  ));

  /* ---------- guest communication ---------- */
  const Guests = shell("guests", (
    <>
      <ScreenHeader title="Guest Communication" sub="Chat with guests and review their context" />
      <div className="flex items-center gap-2 px-6">
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
                {g.vip && <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">VIP</span>}
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
    <div className="flex h-full flex-col">
      <ScreenHeader onBack={nav.back} title={guestEntry.name} sub={`${guestEntry.room}${guestEntry.vip ? " · VIP" : ""}`} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4 no-scrollbar">
        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-secondary"><Sparkles className="h-3.5 w-3.5 text-violet-500" /> Guest overview</div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink">{guestEntry.summary}</p>
          {guestEntry.complaint && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-600">Sentiment: {guestEntry.sentiment}</span>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[12px] font-semibold text-orange-700">Risk: {guestEntry.risk}</span>
            </div>
          )}
          {guestEntry.prefs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {guestEntry.prefs.map((p) => <span key={p} className="rounded-full bg-[#F1F1F3] px-2.5 py-1 text-[12px] text-ink-secondary">{p}</span>)}
            </div>
          )}
        </div>

        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[11px] font-semibold text-ink-secondary">Recent requests</div>
          <div className="mt-1 divide-y divide-line">
            {guestEntry.items.map((t) => (
              <button key={t.id} onClick={() => open(t.id)} className="flex w-full items-center gap-2 py-2.5 text-left">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{t.title}</div>
                  <div className="text-[11px] text-ink-tertiary">{t.room}</div>
                </div>
                <StatusTag s={t.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 px-1 text-[13px] font-semibold text-ink-secondary">Conversation</div>
          <div className={`overflow-hidden rounded-2xl bg-white ${CARD_SHADOW}`}>
            <div className={`flex items-center justify-between gap-3 px-4 py-2.5 text-[12px] ${guestManual ? "bg-brand-tint/50 text-brand" : "bg-violet-50 text-violet-700"}`}>
              <span>{guestManual ? "You're replying — AI is paused" : "ALFON AI is replying automatically"}</span>
              <button
                onClick={() => { setManual((m) => ({ ...m, [guestName!]: !guestManual })); flash(guestManual ? "Handed back to AI" : "AI paused — you're now replying"); }}
                className="font-semibold underline"
              >
                {guestManual ? "Hand back to AI" : "Take over"}
              </button>
            </div>
            <div className="max-h-[240px] space-y-2.5 overflow-y-auto p-4">
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
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-6 pb-6 pt-3">
        <input
          value={draft}
          disabled={!guestManual}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendGuestChat()}
          placeholder={guestManual ? "Reply as hotel staff…" : "Take over to reply"}
          className="h-12 flex-1 rounded-2xl border border-line px-4 text-[14px] outline-none focus:border-brand disabled:bg-[#F6F6F8]"
        />
        <button onClick={sendGuestChat} disabled={!guestManual || !draft.trim()} aria-label="Send" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const Detail = task ? (
    <div className="flex h-full flex-col">
      <ScreenHeader onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-8 no-scrollbar">
        <PrimaryButton className="w-full" tone="bg-violet-600" onClick={() => nav.push({ name: "guestDetail", id: task.guest })}>
          <MessageCircle className="h-4 w-4" /> Message guest
        </PrimaryButton>
        <div>
          <div className="mb-2 px-1 text-[13px] font-semibold text-ink-secondary">Intervene</div>
          <ActionGrid
            actions={[
              { label: "Reassign", icon: UserCog, onClick: () => setSheet({ k: "assign", taskId: task.id }), disabled: !isOpen(task) && task.status !== "unable" },
              { label: "Add support", icon: UserPlus, onClick: () => setSheet({ k: "support", taskId: task.id }), disabled: !task.owner },
              { label: "Change status", icon: Repeat, onClick: () => setSheet({ k: "status", taskId: task.id }), tone: "bg-blue-50 text-blue-600", disabled: !isOpen(task) },
              { label: "Unable to complete", icon: Ban, onClick: () => setSheet({ k: "unable", taskId: task.id }), tone: "bg-slate-100 text-slate-600", disabled: !isOpen(task) },
              { label: "Close / override", icon: CheckCircle2, onClick: () => setSheet({ k: "close", taskId: task.id }), tone: "bg-emerald-50 text-emerald-600", disabled: !isOpen(task) && task.status !== "unable" },
              { label: "Add note", icon: StickyNote, onClick: () => setSheet({ k: "note", taskId: task.id }), tone: "bg-amber-50 text-amber-600" },
            ]}
          />
        </div>
        <div>
          <div className="mb-2 px-1 text-[13px] font-semibold text-ink-secondary">Escalation review</div>
          <ActionGrid
            actions={[
              { label: "Send back", icon: Undo2, onClick: () => setSheet({ k: "sendBack", taskId: task.id }), tone: "bg-blue-50 text-blue-600", disabled: !task.escBy || task.escBy === "System" },
              { label: "Take ownership", icon: Hand, onClick: () => { patch(task.id, { owner: ME, status: "progress" }, `${ME} took ownership`); flash("You now own this task"); } },
              { label: "Route to dept", icon: Split, onClick: () => setSheet({ k: "route", taskId: task.id }), tone: "bg-slate-100 text-slate-600" },
              { label: "Escalate to GM", icon: ArrowUpRight, onClick: () => setSheet({ k: "gm", taskId: task.id }), tone: "bg-red-50 text-red-600" },
            ]}
          />
        </div>
        <DetailBody task={task} viewer="manager" />
      </div>
    </div>
  ) : null;

  const Notifications = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Notifications" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {NOTIFS.map((n, i) => (
          <button key={i} onClick={() => (n.to === "team" ? nav.go({ name: "team" }) : open(n.to))} className="relative flex w-full gap-3 border-b border-dashed border-ink/20 py-4 pr-14 text-left last:border-0">
            <span className="text-[18px]">{n.icon}</span>
            <p className="text-[14px] leading-snug text-ink">{n.text}</p>
            <span className="absolute bottom-4 right-0 text-[11px] text-ink-tertiary">{n.time}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const services = DEPARTMENTS.find((d) => d.name === "Housekeeping")?.services.filter((sv) => sv.active).map((sv) => sv.name) ?? [];
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

  const VIEWS: Record<Screen["name"], React.ReactNode> = { home: Home, team: Team, guests: Guests, guestDetail: GuestDetail, detail: Detail, notifications: Notifications, create: Create };

  /* ---------- sheets ---------- */
  const t0 = sheet && "taskId" in sheet ? tasks.find((t) => t.id === sheet.taskId) : undefined;

  const sheetNode = !sheet ? null : (
    <>
      {sheet.k === "assign" && t0 && (
        <Sheet title={t0.owner ? "Change owner" : "Assign task"} onClose={() => setSheet(null)}>
          <p className="mb-3 text-[13px] text-ink-secondary">Within Housekeeping only · {t0.room}</p>
          <StaffPicker tasks={tasks} exclude={t0.owner ? [t0.owner] : []} onPick={(s) => { patch(t0.id, { owner: s.name, status: "assigned" }, `${ME} assigned to ${s.name}`); setSheet(null); flash(`Assigned to ${s.name}`); }} cta="Assign" />
        </Sheet>
      )}
      {sheet.k === "support" && t0 && (
        <Sheet title="Add support staff" onClose={() => setSheet(null)}>
          <StaffPicker tasks={tasks} exclude={[t0.owner ?? "", ...t0.support]} onPick={(s) => { patch(t0.id, { support: [...t0.support, s.name] }, `${s.name} added as support`); setSheet(null); flash(`${s.name} notified`); }} cta="Add" />
        </Sheet>
      )}
      {sheet.k === "status" && t0 && (
        <ReasonSheet title="Change status" reasons={STATUS_CHOICES} reasonLabel="New status" placeholder="Optional note" cta="Update status" onClose={() => setSheet(null)}
          onSubmit={(st) => {
            const map = { "In progress": "progress", "Awaiting acceptance": "assigned", Unassigned: "unassigned" } as const;
            patch(t0.id, { status: map[st as keyof typeof map], owner: st === "Unassigned" ? null : t0.owner }, `${ME} set status to ${st}`);
            setSheet(null); flash(`Status set to ${st}`);
          }} />
      )}
      {sheet.k === "unable" && t0 && (
        <ReasonSheet title="Unable to complete" reasons={HELP_REASONS} placeholder="Add a note" cta="Mark unable to complete" tone="bg-slate-700" onClose={() => setSheet(null)}
          onSubmit={(reason, note) => { patch(t0.id, { status: "unable", resolution: `${reason}${note ? ` — ${note}` : ""}` }, `${ME} marked unable: ${reason}`); setSheet(null); flash("Marked unable to complete"); }} />
      )}
      {sheet.k === "close" && t0 && (
        <ReasonSheet title="Close / override" requireNote placeholder="Reason for closing or overriding (recorded)" cta="Close task" tone="bg-emerald-600" onClose={() => setSheet(null)}
          onSubmit={(_, note) => { patch(t0.id, { status: "completed", escalated: false, resolution: note }, `${ME} closed with override: ${note}`); setSheet(null); flash("Task closed — reason recorded"); }} />
      )}
      {sheet.k === "note" && t0 && (
        <ReasonSheet title="Management note" requireNote placeholder="Service-recovery or management note…" cta="Save note" onClose={() => setSheet(null)}
          onSubmit={(_, note) => { setTasks((ts) => ts.map((t) => (t.id === t0.id ? { ...t, notes: [{ by: ME, t: "Just now", text: note }, ...t.notes] } : t))); setSheet(null); flash("Note added"); }} />
      )}
      {sheet.k === "sendBack" && t0 && (
        <ReasonSheet title={`Send back to ${t0.escBy?.split(" ")[0]}`} requireNote placeholder="Your instruction to the supervisor…" cta="Send back" onClose={() => setSheet(null)}
          onSubmit={(_, note) => { patch(t0.id, { escalated: false, escType: undefined, notes: [{ by: ME, t: "Just now", text: `Instruction: ${note}` }, ...t0.notes] }, `${ME} sent back with instruction`); setSheet(null); flash("Sent back with instruction"); nav.back(); }} />
      )}
      {sheet.k === "route" && t0 && (
        <ReasonSheet title="Route to another department" reasons={DEPARTMENTS.map((d) => d.name).filter((d) => d !== "Housekeeping")} reasonLabel="Department" requireNote placeholder="Why does it belong there?" cta="Route" onClose={() => setSheet(null)}
          onSubmit={(dept, note) => { patch(t0.id, { escalated: false, escType: undefined, resolution: `Routed to ${dept}: ${note}` }, `${ME} routed to ${dept}`); setSheet(null); flash(`Routed to ${dept}`); nav.back(); }} />
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

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame>
        {VIEWS[cur.name]}
        {sheetNode}
        {TeamFilterSheet}
        {GuestFilterSheet}
        {toast}
      </PhoneFrame>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary" onClick={() => { nav.reset(); setTasks(SEED_TASKS); setSheet(null); setChat({}); setManual({}); setFilter("All"); setRoleFilter("All"); setAvailFilter("All"); setGuestFilter("All"); setGuestQuery(""); }}>Reset</button>
      </div>
      <p className="text-center text-[12px] text-ink-tertiary">Current screen: <span className="font-medium text-ink-secondary">{cur.name}</span> · open Guests to chat with a guest, or Room 1103 to see full task context.</p>
    </div>
  );
}
