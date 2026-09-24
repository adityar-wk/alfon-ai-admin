import { useMemo, useState } from "react";
import {
  Bell, Home as HomeIcon, ListChecks, Users, Plus, Search, UserPlus, UserCog, Ban, ArrowUpRight, StickyNote, CheckCircle2, Phone,
} from "lucide-react";
import { DEPARTMENTS } from "../data/departments";
import { SEED_TASKS, SEED_REQUESTS, STAFF, HELP_REASONS, PRESENCE_DOT, type MTask, type HelpReq, type Presence, type Staffer } from "./data";
import {
  PhoneFrame, ScreenHeader, TextHeader, SectionTitle, TaskCard, StatCard, Avatar, Chips, Segmented, FloatingNav, PrimaryButton, GhostButton, SelectField, TextField, Label, Sheet,
  useNav, useToast, CARD_SHADOW, type Priority,
} from "./mobile";
import { DetailBody, ActionGrid, StaffPicker, ReasonSheet, ContactSheet, StatusTag, activeCount, atRiskCount, overdueCount, isOpen, isAtRisk, isOverdue } from "./parts";

type Screen = { name: "home" | "queue" | "team" | "detail" | "requests" | "notifications" | "create"; id?: string };
type SheetState =
  | { k: "assign" | "support" | "unable" | "escalate" | "note" | "close"; taskId: string }
  | { k: "contact"; staff: Staffer }
  | { k: "reject" | "reply"; reqId: string }
  | { k: "teamTasks"; staff: Staffer }
  | null;

const ME = "Sarah Ali";
const FILTERS = ["All", "New", "Unassigned", "In Progress", "At Risk", "Overdue", "Completed"] as const;
type Filter = (typeof FILTERS)[number];
const DEFAULT_SLA = 40;

const NOTIFS = [
  { icon: "🆕", text: "New unassigned task — Room 812 extra pillows & rollaway bed", time: "10:29 AM", to: "t3" },
  { icon: "🙋", text: "Maria Santos needs help on Room 305 (Need more staff)", time: "10:27 AM", to: "req" },
  { icon: "🔁", text: "Aanya Khan asked to reassign Room 908 (Wrong assignment)", time: "10:22 AM", to: "req" },
  { icon: "⚠️", text: "SLA at risk — Room 1204 deep clean, 14 min left", time: "10:20 AM", to: "t5" },
  { icon: "⏱️", text: "SLA breached — Room 908 extra pillows", time: "10:25 AM", to: "t10" },
  { icon: "🔔", text: "Ravi Menon went on break with 1 active task", time: "10:12 AM", to: "team" },
];

const isNewTask = (t: MTask) => !!t.isNew && (t.status === "unassigned" || t.status === "assigned");

export function SupervisorPrototype() {
  const nav = useNav<Screen>({ name: "home" });
  const { flash, node: toast } = useToast();
  const [tasks, setTasks] = useState<MTask[]>(SEED_TASKS);
  const [requests, setRequests] = useState<HelpReq[]>(SEED_REQUESTS);
  const [presence, setPresence] = useState<"Available" | "On Break" | "Offline">("Available");
  const [presenceMenu, setPresenceMenu] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [q, setQ] = useState("");
  const [teamFilter, setTeamFilter] = useState<"All" | Presence>("All");
  const [sheet, setSheet] = useState<SheetState>(null);
  // create
  const [service, setService] = useState("");
  const [room, setRoom] = useState("");
  const [details, setDetails] = useState("");

  const cur = nav.cur;
  const task = tasks.find((t) => t.id === cur.id);
  const patch = (id: string, p: Partial<MTask>, log?: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p, timeline: log ? [...t.timeline, { t: "now", text: log }] : t.timeline } : t)));
  const staffStatus = (name: string): Presence => STAFF.find((s) => s.name === name)?.status ?? "Available";

  const counts = {
    newT: tasks.filter(isNewTask).length,
    progress: tasks.filter((t) => t.status === "progress").length,
    risk: tasks.filter(isAtRisk).length,
    over: tasks.filter(isOverdue).length,
    unassigned: tasks.filter((t) => t.status === "unassigned").length,
  };

  const filterFn: Record<Filter, (t: MTask) => boolean> = {
    All: () => true,
    New: isNewTask,
    Unassigned: (t) => t.status === "unassigned",
    "In Progress": (t) => t.status === "progress",
    "At Risk": isAtRisk,
    Overdue: isOverdue,
    Completed: (t) => t.status === "completed",
  };
  const chipCounts = Object.fromEntries(FILTERS.map((f) => [f, tasks.filter(filterFn[f]).length])) as Record<Filter, number>;
  const queue = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tasks
      .filter(filterFn[filter])
      .filter((t) => !s || `${t.room} ${t.guest} ${t.title}`.toLowerCase().includes(s))
      .sort((a, b) => a.slaLeft - b.slaLeft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, filter, q]);

  const open = (id: string) => nav.push({ name: "detail", id });
  const card = (t: MTask) => (
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

  /* ---------- actions ---------- */
  const assign = (id: string, s: Staffer) => {
    patch(id, { owner: s.name, status: "assigned" }, `Assigned to ${s.name} by ${ME}`);
    setSheet(null);
    flash(`Assigned to ${s.name} — notified`);
  };
  const addSupport = (id: string, s: Staffer) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, support: [...t.support, s.name], timeline: [...t.timeline, { t: "now", text: `${s.name} added as support` }] } : t)));
    setSheet(null);
    flash(`${s.name} notified — original owner kept`);
  };

  /* ---------- screens ---------- */
  const shell = (key: "home" | "queue" | "team", body: React.ReactNode) => (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-32 no-scrollbar">{body}</div>
      <FloatingNav
        active={key}
        onChange={(k) => nav.go({ name: k })}
        items={[
          { key: "home", label: "Home", icon: HomeIcon },
          { key: "queue", label: "Queue", icon: ListChecks, badge: counts.unassigned },
          { key: "team", label: "Team", icon: Users },
        ]}
        fab={{ icon: Plus, label: "Create task", onClick: () => { setService(""); setRoom(""); setDetails(""); nav.push({ name: "create" }); } }}
      />
    </div>
  );

  const Home = shell("home", (
    <>
      <div className="relative flex items-center justify-between px-6 py-2">
        <Avatar name={ME} size={40} tone="bg-brand text-white" />
        <button
          onClick={() => {
            if (presence === "Available") setPresenceMenu((o) => !o);
            else { setPresence("Available"); setPresenceMenu(false); flash("You're available"); }
          }}
          aria-pressed={presence === "Available"}
          aria-label="Availability"
          className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-[14px] font-medium text-ink shadow-[0_3px_12px_rgba(0,0,0,0.12)]"
        >
          <span className={`h-2 w-2 rounded-full ${presence === "Available" ? "bg-emerald-500" : presence === "On Break" ? "bg-amber-500" : "bg-gray-400"}`} />
          {presence}
          <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${presence === "Available" ? "bg-emerald-500" : "bg-[#C8C8C8]"}`}>
            <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${presence === "Available" ? "translate-x-5" : ""}`} />
          </span>
        </button>
        <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
          <Bell className="h-[18px] w-[18px] text-ink" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {presenceMenu && (
          <div className="absolute left-1/2 top-14 z-30 w-52 -translate-x-1/2 rounded-2xl bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            {(["On Break", "Offline"] as const).map((v) => (
              <button
                key={v}
                onClick={() => { setPresence(v); setPresenceMenu(false); flash(`You're ${v.toLowerCase()}`); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-ink hover:bg-[#F6F6F8]"
              >
                <span className={`h-2 w-2 rounded-full ${v === "On Break" ? "bg-amber-500" : "bg-gray-400"}`} /> {v}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="px-6 pt-1 text-[13px] text-ink-secondary"><span className="font-semibold text-ink">{ME}</span> · Housekeeping Supervisor</div>

      <div className="mt-5"><SectionTitle tone="bg-brand">Shift overview</SectionTitle></div>
      <div className="mt-3 grid grid-cols-3 gap-3 px-6">
        <StatCard label="New" value={counts.newT} tone="text-brand" onClick={() => { setFilter("New"); nav.go({ name: "queue" }); }} hint="awaiting" />
        <StatCard label="In progress" value={counts.progress} tone="text-blue-600" onClick={() => { setFilter("In Progress"); nav.go({ name: "queue" }); }} />
        <StatCard label="At risk" value={counts.risk} tone="text-amber-600" onClick={() => { setFilter("At Risk"); nav.go({ name: "queue" }); }} />
        <StatCard label="Overdue" value={counts.over} tone="text-red-600" onClick={() => { setFilter("Overdue"); nav.go({ name: "queue" }); }} />
        <StatCard label="Unassigned" value={counts.unassigned} onClick={() => { setFilter("Unassigned"); nav.go({ name: "queue" }); }} />
        <StatCard label="Requests" value={requests.length} tone="text-violet-600" onClick={() => nav.push({ name: "requests" })} hint="from staff" />
      </div>

      <div className="mt-7">
        <SectionTitle tone="bg-violet-500" action={<button onClick={() => nav.push({ name: "requests" })} className="text-[14px] font-semibold text-brand">See all({requests.length})</button>}>Staff requests</SectionTitle>
      </div>
      <div className="mt-3 space-y-3 px-6">
        {requests.slice(0, 2).map((r) => (
          <button key={r.id} onClick={() => nav.push({ name: "requests" })} className={`flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left ${CARD_SHADOW}`}>
            <Avatar name={r.staff} tone="bg-violet-50 text-violet-600" />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[14px] font-semibold text-ink">{r.staff}</div>
              <div className="mt-0.5 text-[12px] text-ink-secondary">{r.kind === "help" ? "Needs help" : "Wants to reassign"} · {r.reason}</div>
            </div>
            <span className="text-[11px] text-ink-tertiary">{r.time}</span>
          </button>
        ))}
        {!requests.length && <p className="rounded-2xl bg-white p-4 text-center text-[13px] text-ink-tertiary">No open requests.</p>}
      </div>

      <div className="mt-7"><SectionTitle tone="bg-red-500">Needs attention</SectionTitle></div>
      <div className="mt-3 space-y-3 px-6">
        {tasks.filter((t) => isOverdue(t) || isAtRisk(t)).sort((a, b) => a.slaLeft - b.slaLeft).slice(0, 3).map(card)}
      </div>
    </>
  ));

  const Queue = shell("queue", (
    <>
      <ScreenHeader title="Department queue" sub="Housekeeping · all tasks" />
      <div className="px-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search room, guest or task" className="h-12 w-full rounded-2xl bg-white pl-11 pr-4 text-[14px] shadow-sm outline-none placeholder:text-ink-tertiary focus:ring-2 focus:ring-brand/30" />
        </div>
      </div>
      <div className="mt-3"><Chips items={FILTERS} active={filter} onChange={setFilter} counts={chipCounts} /></div>
      <div className="mt-4 space-y-3 px-6">
        {queue.map(card)}
        {!queue.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No tasks in this view.</p>}
      </div>
    </>
  ));

  const teamList = STAFF.filter((s) => s.role === "Line Staff" && (teamFilter === "All" || s.status === teamFilter));
  const Team = shell("team", (
    <>
      <ScreenHeader title="Team" sub="Line staff availability & workload" />
      <Chips items={["All", "Available", "Busy", "On Break", "Off work"] as const} active={teamFilter} onChange={setTeamFilter} />
      <div className="mt-4 space-y-3 px-6">
        {teamList.map((s) => {
          const n = activeCount(tasks, s.name), r = atRiskCount(tasks, s.name), o = overdueCount(tasks, s.name);
          return (
            <div key={s.name} className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
              <div className="flex items-center gap-3">
                <Avatar name={s.name} size={44} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[15px] font-semibold text-ink">{s.name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary"><span className={`h-2 w-2 rounded-full ${PRESENCE_DOT[s.status]}`} />{s.status}</div>
                </div>
                <div className="text-right leading-tight">
                  <div className="text-[20px] font-bold text-ink">{n}</div><div className="text-[11px] text-ink-tertiary">active</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px]">
                <span className={`rounded-full px-2.5 py-1 font-semibold ${r ? "bg-amber-50 text-amber-700" : "bg-[#F1F1F3] text-ink-tertiary"}`}>{r} at risk</span>
                <span className={`rounded-full px-2.5 py-1 font-semibold ${o ? "bg-red-50 text-red-600" : "bg-[#F1F1F3] text-ink-tertiary"}`}>{o} overdue</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <GhostButton className="h-10 text-[13px]" onClick={() => setSheet({ k: "contact", staff: s })}><Phone className="h-4 w-4" /> Contact</GhostButton>
                <GhostButton className="h-10 text-[13px]" disabled={!n} onClick={() => setSheet({ k: "teamTasks", staff: s })}><UserCog className="h-4 w-4" /> Reassign</GhostButton>
              </div>
            </div>
          );
        })}
      </div>
    </>
  ));

  const Detail = task ? (
    <div className="flex h-full flex-col">
      <ScreenHeader onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-8 no-scrollbar">
        <ActionGrid
          actions={[
            { label: task.owner ? "Reassign" : "Assign", icon: UserCog, onClick: () => setSheet({ k: "assign", taskId: task.id }), disabled: !isOpen(task) },
            { label: "Add support", icon: UserPlus, onClick: () => setSheet({ k: "support", taskId: task.id }), disabled: !isOpen(task) || !task.owner },
            { label: "Add note", icon: StickyNote, onClick: () => setSheet({ k: "note", taskId: task.id }), tone: "bg-amber-50 text-amber-600" },
            { label: "Unable to complete", icon: Ban, onClick: () => setSheet({ k: "unable", taskId: task.id }), tone: "bg-slate-100 text-slate-600", disabled: !isOpen(task) },
            { label: "Escalate", icon: ArrowUpRight, onClick: () => setSheet({ k: "escalate", taskId: task.id }), tone: "bg-red-50 text-red-600", disabled: !isOpen(task) || !!task.escalated },
            { label: "Close task", icon: CheckCircle2, onClick: () => setSheet({ k: "close", taskId: task.id }), tone: "bg-emerald-50 text-emerald-600", disabled: !isOpen(task) },
          ]}
        />
        <DetailBody task={task} viewer="supervisor" />
        {task.owner && (
          <GhostButton className="w-full" onClick={() => setSheet({ k: "contact", staff: STAFF.find((s) => s.name === task.owner)! })}><Phone className="h-4 w-4" /> Contact {task.owner.split(" ")[0]}</GhostButton>
        )}
      </div>
    </div>
  ) : null;

  const reqTask = (r: HelpReq) => tasks.find((t) => t.id === r.taskId);
  const Requests = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Staff requests" sub="Help & reassignment" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-8 no-scrollbar">
        {requests.map((r) => {
          const t = reqTask(r);
          return (
            <div key={r.id} className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
              <div className="flex items-center gap-3">
                <Avatar name={r.staff} tone="bg-violet-50 text-violet-600" />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[14px] font-semibold text-ink">{r.staff}</div>
                  <div className="text-[12px] text-ink-tertiary">{r.time} · {r.kind === "help" ? "Need help" : "Reassignment request"}</div>
                </div>
              </div>
              <button onClick={() => t && open(t.id)} className="mt-3 block w-full rounded-xl bg-[#F6F6F8] p-3 text-left">
                <div className="text-[13px] font-semibold text-ink">{t?.room} · {t?.title}</div>
                <div className="mt-1.5 inline-block rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">{r.reason}</div>
                <p className="mt-1.5 text-[13px] text-ink-secondary">{r.note}</p>
              </button>
              {r.kind === "help" ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <PrimaryButton className="h-10 text-[12px]" onClick={() => setSheet({ k: "support", taskId: r.taskId })}>Add support</PrimaryButton>
                  <GhostButton className="h-10 text-[12px]" onClick={() => setSheet({ k: "assign", taskId: r.taskId })}>Reassign</GhostButton>
                  <GhostButton className="h-10 text-[12px]" onClick={() => setSheet({ k: "reply", reqId: r.id })}>Reply</GhostButton>
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <PrimaryButton className="h-10 text-[12px]" tone="bg-emerald-600" onClick={() => { patch(r.taskId, { owner: null, status: "unassigned" }, `Reassignment approved for ${r.staff}`); setRequests((rs) => rs.filter((x) => x.id !== r.id)); setSheet({ k: "assign", taskId: r.taskId }); }}>Approve</PrimaryButton>
                  <GhostButton className="h-10 text-[12px]" onClick={() => setSheet({ k: "reject", reqId: r.id })}>Reject</GhostButton>
                  <GhostButton className="h-10 text-[12px]" onClick={() => setSheet({ k: "assign", taskId: r.taskId })}>Assign other</GhostButton>
                </div>
              )}
            </div>
          );
        })}
        {!requests.length && <p className="rounded-2xl bg-white p-8 text-center text-[13px] text-ink-tertiary">No open requests — nice work.</p>}
      </div>
    </div>
  );

  const Notifications = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Notifications" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {NOTIFS.map((n, i) => (
          <button
            key={i}
            onClick={() => (n.to === "req" ? nav.push({ name: "requests" }) : n.to === "team" ? nav.go({ name: "team" }) : open(n.to))}
            className="relative flex w-full gap-3 border-b border-dashed border-ink/20 py-4 pr-14 text-left last:border-0"
          >
            <span className="text-[18px]">{n.icon}</span>
            <p className="text-[14px] leading-snug text-ink">{n.text}</p>
            <span className="absolute bottom-4 right-0 text-[11px] text-ink-tertiary">{n.time}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const services = DEPARTMENTS.find((d) => d.name === "Housekeeping")?.services.filter((s) => s.active).map((s) => s.name) ?? [];
  const Create = (
    <div className="flex h-full flex-col">
      <TextHeader title="Create Manual Task" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-4 no-scrollbar">
        <SelectField value="Housekeeping" onChange={() => {}} placeholder="Department" options={["Housekeeping"]} disabled />
        <div className="mt-3"><SelectField value={service} onChange={setService} placeholder="Select service" options={services} /></div>
        <Label>Room</Label>
        <TextField value={room} onChange={setRoom} placeholder="e.g. 501" />
        <Label>Details</Label>
        <TextField rows={4} value={details} onChange={setDetails} placeholder="Enter more details" />
      </div>
      <div className="shrink-0 px-6 pb-6 pt-2">
        <PrimaryButton className="w-full" disabled={!service || !room.trim()} onClick={() => {
          const id = "n" + Date.now();
          setTasks((ts) => [{
            id, room: `Room ${room.trim().replace(/^room\s*/i, "")}`, guest: "Guest", title: service, note: details || service, priority: "Medium", status: "unassigned", owner: null, support: [],
            slaTotal: DEFAULT_SLA, slaLeft: DEFAULT_SLA, isNew: true, createdAt: "now", pickup: "Not yet picked up", summary: details || service, prefs: [], convo: "Created manually by supervisor.",
            timeline: [{ t: "now", text: `Created manually by ${ME}` }], notes: [],
          }, ...ts]);
          nav.go({ name: "queue" });
          setFilter("Unassigned");
          flash("Task created — assign it to someone");
        }}>Create Task</PrimaryButton>
      </div>
    </div>
  );

  const VIEWS: Record<Screen["name"], React.ReactNode> = { home: Home, queue: Queue, team: Team, detail: Detail, requests: Requests, notifications: Notifications, create: Create };

  /* ---------- sheets ---------- */
  const t0 = sheet && "taskId" in sheet ? tasks.find((t) => t.id === sheet.taskId) : undefined;
  const r0 = sheet && "reqId" in sheet ? requests.find((r) => r.id === sheet.reqId) : undefined;
  const sheetNode = !sheet ? null : (
    <>
      {sheet.k === "assign" && t0 && (
        <Sheet title={t0.owner ? "Reassign task" : "Assign task"} onClose={() => setSheet(null)}>
          <p className="mb-3 text-[13px] text-ink-secondary">{t0.room} · {t0.title}</p>
          <StaffPicker tasks={tasks} exclude={t0.owner ? [t0.owner] : []} onPick={(s) => assign(t0.id, s)} cta={t0.owner ? "Reassign" : "Assign"} />
        </Sheet>
      )}
      {sheet.k === "support" && t0 && (
        <Sheet title="Add support" onClose={() => setSheet(null)}>
          <p className="mb-3 text-[13px] text-ink-secondary">{t0.owner ?? "Owner"} keeps the task. The person you add is notified.</p>
          <StaffPicker tasks={tasks} exclude={[t0.owner ?? "", ...t0.support]} onPick={(s) => addSupport(t0.id, s)} cta="Add" />
        </Sheet>
      )}
      {sheet.k === "unable" && t0 && (
        <ReasonSheet title="Unable to complete" reasons={HELP_REASONS} placeholder="Add a short note" cta="Mark unable to complete" tone="bg-slate-700" onClose={() => setSheet(null)}
          onSubmit={(reason, note) => { patch(t0.id, { status: "unable", resolution: `${reason}${note ? ` — ${note}` : ""}` }, `Marked unable to complete: ${reason}`); setSheet(null); flash("Marked unable to complete"); }} />
      )}
      {sheet.k === "escalate" && t0 && (
        <ReasonSheet title="Escalate to Mid Manager" requireNote placeholder="Why does this need the department head?" cta="Escalate" onClose={() => setSheet(null)}
          onSubmit={(_, note) => { patch(t0.id, { escalated: true, escType: "Supervisor escalation", escBy: ME, escReason: note }, `${ME} escalated to Mid Manager`); setSheet(null); flash("Escalated to the Housekeeping Manager"); }} />
      )}
      {sheet.k === "note" && t0 && (
        <ReasonSheet title="Add internal note" requireNote placeholder="Handover context, what you've tried…" cta="Save note" onClose={() => setSheet(null)}
          onSubmit={(_, note) => { setTasks((ts) => ts.map((t) => (t.id === t0.id ? { ...t, notes: [{ by: ME, t: "Just now", text: note }, ...t.notes] } : t))); setSheet(null); flash("Note added"); }} />
      )}
      {sheet.k === "close" && t0 && (
        <ReasonSheet title="Close task" requireNote placeholder="Why is it being closed? (recorded)" cta="Close task" tone="bg-emerald-600" onClose={() => setSheet(null)}
          onSubmit={(_, note) => { patch(t0.id, { status: "completed", resolution: note }, `Closed by ${ME}: ${note}`); setSheet(null); flash("Task closed"); }} />
      )}
      {sheet.k === "contact" && <ContactSheet name={sheet.staff.name} phone={sheet.staff.phone} onClose={() => setSheet(null)} onDone={(m) => { setSheet(null); flash(m); }} />}
      {sheet.k === "teamTasks" && (
        <Sheet title={`${sheet.staff.name.split(" ")[0]}'s active tasks`} onClose={() => setSheet(null)}>
          <div className="space-y-2">
            {tasks.filter((t) => (t.owner === sheet.staff.name) && isOpen(t)).map((t) => (
              <button key={t.id} onClick={() => { setSheet({ k: "assign", taskId: t.id }); }} className="flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left">
                <div className="min-w-0 flex-1"><div className="text-[14px] font-semibold text-ink">{t.room}</div><div className="truncate text-[12px] text-ink-secondary">{t.title}</div></div>
                <span className="text-[12px] font-semibold text-brand">Reassign</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {sheet.k === "reject" && r0 && (
        <ReasonSheet title="Reject reassignment" requireNote placeholder={`Tell ${r0.staff.split(" ")[0]} why…`} cta="Reject with note" tone="bg-red-600" onClose={() => setSheet(null)}
          onSubmit={() => { setRequests((rs) => rs.filter((x) => x.id !== r0.id)); setSheet(null); flash("Rejected — note sent"); }} />
      )}
      {sheet.k === "reply" && r0 && (
        <ReasonSheet title={`Reply to ${r0.staff.split(" ")[0]}`} requireNote placeholder="Type a quick reply…" cta="Send reply" onClose={() => setSheet(null)}
          onSubmit={() => { setSheet(null); flash("Reply sent"); }} />
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
        <button
          className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white"
          onClick={() => {
            const id = "n" + Date.now();
            setTasks((ts) => [{ id, room: "Room 1610", guest: "New guest", title: "Extra towels", note: "Extra towels for two guests.", priority: "Medium", status: "unassigned", owner: null, support: [], slaTotal: 40, slaLeft: 40, isNew: true, createdAt: "now", pickup: "Not yet picked up", summary: "Guest chat request.", prefs: [], convo: "—", timeline: [{ t: "now", text: "Created from guest chat" }], notes: [] }, ...ts]);
            flash("New unassigned task — Room 1610");
          }}
        >
          Simulate new unassigned task
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary" onClick={() => { nav.reset(); setTasks(SEED_TASKS); setRequests(SEED_REQUESTS); setSheet(null); setFilter("All"); setQ(""); }}>Reset</button>
      </div>
      <p className="text-center text-[12px] text-ink-tertiary">Current screen: <span className="font-medium text-ink-secondary">{cur.name}</span> · try Assign, Add support, Unable to complete and Escalate on a task.</p>
    </div>
  );
}
