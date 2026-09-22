import { useMemo, useState } from "react";
import {
  Bell, Home as HomeIcon, Siren, Plus, Users, UserCog, UserPlus, Repeat, Ban, CheckCircle2, StickyNote, Undo2, Hand, ArrowUpRight, Split, MessageCircle, Phone, Send,
} from "lucide-react";
import { DEPARTMENTS } from "../data/departments";
import { SEED_TASKS, STAFF, PRESENCE_DOT, HELP_REASONS, type MTask, type Presence, type Staffer, type EscType } from "./data";
import {
  PhoneFrame, ScreenHeader, SectionTitle, TaskCard, StatCard, Avatar, Chips, Segmented, FloatingNav, PrimaryButton, GhostButton, SelectField, TextField, Label, Sheet,
  useNav, useToast, CARD_SHADOW, TextHeader, type Priority,
} from "./mobile";
import { DetailBody, ActionGrid, StaffPicker, ReasonSheet, ContactSheet, StatusTag, activeCount, atRiskCount, overdueCount, isOpen, isAtRisk, isOverdue } from "./parts";

type Screen = { name: "home" | "escalations" | "team" | "detail" | "notifications" | "create"; id?: string };
type SheetState =
  | { k: "assign" | "support" | "status" | "unable" | "close" | "note" | "sendBack" | "gm" | "route" | "chat"; taskId: string }
  | { k: "contact"; staff: Staffer }
  | null;

const ME = "Daniel Reyes";
const ESC_FILTERS = ["All", "SLA breach", "SLA at risk", "Guest complaint", "Unable to complete", "Staffing issue", "Supervisor escalation", "High priority"] as const;
const SEVS = ["Low", "Medium", "High", "Critical"] as const;
const SEV_COLOR: Record<(typeof SEVS)[number], string> = { Low: "bg-slate-500", Medium: "bg-amber-500", High: "bg-orange-500", Critical: "bg-red-500" };
const SEV_SLA: Record<Priority, number> = { Low: 60, Medium: 40, High: 20, Critical: 10 };
type EscFilter = (typeof ESC_FILTERS)[number];
const STATUS_CHOICES = ["In progress", "Awaiting acceptance", "Unassigned"] as const;

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
const isEsc = (t: MTask) => isOpen(t) || t.status === "unable" ? !!t.escalated : false;

export function ManagerPrototype() {
  const nav = useNav<Screen>({ name: "home" });
  const { flash, node: toast } = useToast();
  const [tasks, setTasks] = useState<MTask[]>(SEED_TASKS);
  const [filter, setFilter] = useState<EscFilter>("All");
  const [teamTab, setTeamTab] = useState<"Staff" | "Supervisors">("Staff");
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

  /* ---------- shell ---------- */
  const openCreate = () => {
    setService(""); setSev("Medium"); setRoom(""); setDetails("");
    nav.push({ name: "create" });
  };
  const shell = (key: "home" | "escalations" | "team", body: React.ReactNode) => (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-32 no-scrollbar">{body}</div>
      <FloatingNav
        active={key}
        onChange={(k) => nav.go({ name: k })}
        items={[
          { key: "home", label: "Home", icon: HomeIcon },
          { key: "escalations", label: "Escalations", icon: Siren, badge: counts.esc },
          { key: "team", label: "Team", icon: Users },
        ]}
        fab={{ icon: Plus, label: "Create task", onClick: openCreate }}
      />
    </div>
  );

  const supervisors = STAFF.filter((s) => s.role === "Supervisor");

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
        <StatCard label="Open tasks" value={counts.open} onClick={() => { setFilter("All"); nav.go({ name: "escalations" }); }} />
        <StatCard label="SLA at risk" value={counts.risk} tone="text-amber-600" onClick={() => { setFilter("SLA at risk"); nav.go({ name: "escalations" }); }} />
        <StatCard label="Overdue" value={counts.over} tone="text-red-600" onClick={() => { setFilter("SLA breach"); nav.go({ name: "escalations" }); }} />
        <StatCard label="Escalations" value={counts.esc} tone="text-brand" onClick={() => { setFilter("All"); nav.go({ name: "escalations" }); }} />
        <StatCard label="Complaints" value={counts.complaints} tone="text-violet-600" onClick={() => { setFilter("Guest complaint"); nav.go({ name: "escalations" }); }} />
        <StatCard label="Unassigned critical" value={counts.critical} tone="text-red-600" onClick={() => { const t = tasks.find((x) => x.status === "unassigned" && (x.priority === "High" || x.priority === "Critical")); if (t) open(t.id); }} />
      </div>

      <div className="mt-7">
        <SectionTitle tone="bg-red-500" action={<button onClick={() => nav.go({ name: "escalations" })} className="text-[14px] font-semibold text-brand">See all({counts.esc})</button>}>Escalated to you</SectionTitle>
      </div>
      <div className="mt-3 space-y-3 px-6">{[...escalated].sort(escSort).slice(0, 2).map(card)}</div>

      <div className="mt-7"><SectionTitle tone="bg-violet-500">Supervisor attention</SectionTitle></div>
      <div className="mt-3 space-y-3 px-6">
        {supervisors.map((s) => {
          const esc = escalated.filter((t) => t.escBy === s.name).length;
          return (
            <div key={s.name} className={`flex items-center gap-3 rounded-2xl bg-white p-3.5 ${CARD_SHADOW}`}>
              <Avatar name={s.name} tone="bg-violet-50 text-violet-600" />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-[14px] font-semibold text-ink">{s.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary"><span className={`h-2 w-2 rounded-full ${PRESENCE_DOT[s.status]}`} />{s.status} · {esc} escalation{esc === 1 ? "" : "s"}</div>
              </div>
              <button onClick={() => setSheet({ k: "contact", staff: s })} aria-label={`Contact ${s.name}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Phone className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </>
  ));

  const Escalations = shell("escalations", (
    <>
      <ScreenHeader title="Escalations" sub="Sorted by urgency" />
      <Chips items={ESC_FILTERS} active={filter} onChange={setFilter} counts={chipCounts} />
      <div className="mt-4 space-y-3 px-6">
        {filtered.map(card)}
        {!filtered.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">Nothing escalated in this view.</p>}
      </div>
    </>
  ));

  const lineStaff = STAFF.filter((s) => s.role === "Line Staff");
  const byStatus = (s: Presence) => lineStaff.filter((x) => x.status === s).length;
  const Team = shell("team", (
    <>
      <ScreenHeader title="Team" sub="Housekeeping workload" />
      <div className="px-6"><Segmented items={["Staff", "Supervisors"] as const} active={teamTab} onChange={setTeamTab} /></div>
      {teamTab === "Staff" ? (
        <>
          <div className="mt-4 grid grid-cols-4 gap-2 px-6">
            {(["Available", "Busy", "On Break", "Off work"] as Presence[]).map((s) => (
              <div key={s} className={`rounded-2xl bg-white p-2.5 text-center ${CARD_SHADOW}`}>
                <div className="text-[20px] font-bold text-ink">{byStatus(s)}</div>
                <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-medium text-ink-secondary"><span className={`h-1.5 w-1.5 rounded-full ${PRESENCE_DOT[s]}`} />{s}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3 px-6">
            {lineStaff.map((s) => {
              const n = activeCount(tasks, s.name), r = atRiskCount(tasks, s.name), o = overdueCount(tasks, s.name);
              const over = n >= 2 && (r > 0 || o > 0);
              return (
                <div key={s.name} className={`flex items-center gap-3 rounded-2xl bg-white p-3.5 ${CARD_SHADOW}`}>
                  <Avatar name={s.name} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-ink">{s.name}{over && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">Overloaded</span>}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary"><span className={`h-2 w-2 rounded-full ${PRESENCE_DOT[s.status]}`} />{s.status} · {n} active{o ? ` · ${o} overdue` : ""}</div>
                  </div>
                  <button onClick={() => setSheet({ k: "contact", staff: s })} aria-label={`Contact ${s.name}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Phone className="h-4 w-4" /></button>
                </div>
              );
            })}
          </div>
          <div className="mt-7"><SectionTitle tone="bg-red-500">Unassigned tasks</SectionTitle></div>
          <div className="mt-3 space-y-3 px-6">
            {tasks.filter((t) => t.status === "unassigned").map(card)}
            {!tasks.some((t) => t.status === "unassigned") && <p className="rounded-2xl bg-white p-4 text-center text-[13px] text-ink-tertiary">Everything is assigned.</p>}
          </div>
        </>
      ) : (
        <div className="mt-4 space-y-3 px-6">
          {supervisors.map((s) => {
            const mine = escalated.filter((t) => t.escBy === s.name).length;
            return (
              <div key={s.name} className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} size={44} tone="bg-violet-50 text-violet-600" />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-[15px] font-semibold text-ink">{s.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary"><span className={`h-2 w-2 rounded-full ${PRESENCE_DOT[s.status]}`} />{s.status}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 text-[12px]">
                  <span className="rounded-full bg-[#F1F1F3] px-2.5 py-1 font-semibold text-ink-secondary">Queue {tasks.filter(isOpen).length}</span>
                  <span className={`rounded-full px-2.5 py-1 font-semibold ${mine ? "bg-red-50 text-red-600" : "bg-[#F1F1F3] text-ink-secondary"}`}>{mine} escalated</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  <GhostButton className="h-10 text-[13px]" onClick={() => setSheet({ k: "contact", staff: s })}><Phone className="h-4 w-4" /> Contact</GhostButton>
                  <GhostButton className="h-10 text-[13px]" disabled={s.status !== "Available"} onClick={() => flash(`Escalations will be routed to ${s.name}`)}>Route to {s.name.split(" ")[0]}</GhostButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  ));

  const Detail = task ? (
    <div className="flex h-full flex-col">
      <ScreenHeader onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-8 no-scrollbar">
        {task.complaint && (
          <PrimaryButton className="w-full" tone="bg-violet-600" onClick={() => setSheet({ k: "chat", taskId: task.id })}><MessageCircle className="h-4 w-4" /> Take over conversation</PrimaryButton>
        )}
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

  const VIEWS: Record<Screen["name"], React.ReactNode> = { home: Home, escalations: Escalations, team: Team, detail: Detail, notifications: Notifications, create: Create };

  /* ---------- sheets ---------- */
  const t0 = sheet && "taskId" in sheet ? tasks.find((t) => t.id === sheet.taskId) : undefined;
  const thread = t0 ? chat[t0.id] ?? [{ from: "guest" as const, text: t0.convo }, { from: "ai" as const, text: "I'm sorry about this — I've alerted the housekeeping manager right away." }] : [];
  const isManual = t0 ? !!manual[t0.id] : false;
  const sendChat = () => {
    if (!t0 || !draft.trim()) return;
    setChat((c) => ({ ...c, [t0.id]: [...thread, { from: "me", text: draft.trim() }] }));
    setDraft("");
  };

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
      {sheet.k === "contact" && <ContactSheet name={sheet.staff.name} phone={sheet.staff.phone} onClose={() => setSheet(null)} onDone={(m) => { setSheet(null); flash(m); }} />}
      {sheet.k === "chat" && t0 && (
        <Sheet title={`${t0.guest}`} onClose={() => setSheet(null)}>
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#F6F6F8] px-3 py-2 text-[12px]">
            <span className="text-ink-secondary">{isManual ? "AI paused — you're replying" : "AI is replying to the guest"}</span>
            <button onClick={() => { setManual((m) => ({ ...m, [t0.id]: !isManual })); flash(isManual ? "Handed back to AI" : "AI paused"); }} className="font-semibold text-brand">{isManual ? "Hand back to AI" : "Take over"}</button>
          </div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {thread.map((m, i) => (
              <div key={i} className={`flex ${m.from === "guest" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${m.from === "guest" ? "bg-[#F1F1F3] text-ink" : m.from === "ai" ? "bg-violet-50 text-ink" : "bg-brand-tint text-ink"}`}>
                  {m.text}
                  <div className="mt-1 text-[10px] font-semibold text-ink-tertiary">{m.from === "ai" ? "ALFON AI" : m.from === "me" ? "You" : "Guest"}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={draft} disabled={!isManual} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder={isManual ? "Reply as hotel staff…" : "Take over to reply"} className="h-12 flex-1 rounded-2xl border border-line px-4 text-[14px] outline-none focus:border-brand disabled:bg-[#F6F6F8]" />
            <button onClick={sendChat} disabled={!isManual || !draft.trim()} aria-label="Send" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
          </div>
        </Sheet>
      )}
    </>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame>
        {VIEWS[cur.name]}
        {sheetNode}
        {toast}
      </PhoneFrame>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary" onClick={() => { nav.reset(); setTasks(SEED_TASKS); setSheet(null); setChat({}); setManual({}); setFilter("All"); }}>Reset</button>
      </div>
      <p className="text-center text-[12px] text-ink-tertiary">Current screen: <span className="font-medium text-ink-secondary">{cur.name}</span> · open the Room 1103 complaint to try the chat takeover.</p>
    </div>
  );
}
