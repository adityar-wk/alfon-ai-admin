import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  X,
  Wrench,
  ConciergeBell,
  KeyRound,
  UtensilsCrossed,
  BedDouble,
  Wine,
  Headset,
  Sparkles,
  Building2,
  MessageCircle,
  RefreshCw,
  Check,
  Search,
  Filter,
  ChevronDown,
  List,
  Columns3,
  ListChecks,
  Timer,
  UserRound,
  CheckCircle2,
  DollarSign,
  Loader,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { GuestChat, type ChatMsg, type ChatMode } from "../components/GuestChat";
import { Card, Button, Field, Input, Select, Textarea, RoomNo, StatCard } from "../components/ui";
import { TASKS, TASK_DEPTS, HELP_REQUESTS, AI_DRAFTS, logAudit, pendingHelpFor, resolveHelp, shortName, type Task, type Priority } from "../data/tasks";
import { GUESTS } from "../data/guests";
import { taskStatus, STATUS_PILL, statusPillClass, COMPLAINT_PILL, slaSecs, formatClock, useClock, type TaskStatusLabel } from "../data/attention";
import { SlaClock } from "../components/SlaClock";
import { usePersona } from "../persona";
import { ScopePicker } from "../components/ScopePicker";

const PREFS: Record<string, string[]> = {
  "James Wilson": ["Quiet room", "Fast response", "Regular updates", "Traveling with child"],
  "Emma Davis": ["High floor", "Vegetarian", "Late wake-up", "Sparkling water"],
  "Olivia Brown": ["Feather-free bedding", "Late checkout"],
  "Khalid Al-Mansouri": ["Arabic-speaking staff", "Halal meals", "Prayer mat"],
  "Isabella Rossi": ["Extra pillows", "Italian speaker"],
  "Liam Anderson": ["Non-smoking", "Early breakfast"],
};

const STAFF: Record<string, string[]> = {
  Engineering: ["Mike R.", "David K.", "Raj P."],
  Concierge: ["John S.", "Daniel W."],
  "Front Desk": ["Sarah K.", "Maria S.", "James W."],
  "Room Service": ["Anna P.", "Ali H."],
  Housekeeping: ["Maria S.", "Lisa M.", "Sarah A."],
  "Food & Beverage": ["Tom H.", "Ali H."],
  "Guest Services": ["Priya N.", "Maria L."],
};
const DEPTS = TASK_DEPTS;

// availability comes from the live task list
function availabilityOf(name: string): { label: string; dot: string; text: string } {
  const open = TASKS.filter((t) => t.owner === name && !["Completed", "Void"].includes(t.status)).length;
  return open === 0
    ? { label: "Available", dot: "bg-green-500", text: "text-green-600" }
    : { label: "Busy", dot: "bg-blue-500", text: "text-blue-600" };
}
const AvailabilityTag = ({ name }: { name: string }) => {
  const a = availabilityOf(name);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium ${a.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} /> {a.label}
    </span>
  );
};

const DEPT_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Engineering: Wrench,
  Concierge: ConciergeBell,
  "Front Desk": KeyRound,
  "Room Service": UtensilsCrossed,
  Housekeeping: BedDouble,
  "Food & Beverage": Wine,
  "Guest Services": Headset,
};

type View = "action" | "overdue" | "escalated" | "risk" | "complaints" | "unassigned" | "progress" | "completed" | "all";
const VIEWS: { key: View; label: string; test: (t: Task) => boolean }[] = [
  { key: "action", label: "Action required", test: (t) => t.status !== "Completed" && t.status !== "Void" },
  { key: "overdue", label: "Overdue / breached", test: (t) => t.sla.kind === "overdue" && t.status !== "Completed" },
  { key: "escalated", label: "Escalated", test: (t) => t.status === "Escalated" },
  { key: "risk", label: "SLA at risk", test: (t) => t.sla.kind === "overdue" || t.sla.kind === "due" },
  { key: "complaints", label: "Complaints", test: (t) => t.tag === "Complaint" },
  { key: "unassigned", label: "Unassigned", test: (t) => t.owner === null && t.status !== "Completed" },
  { key: "progress", label: "In progress", test: (t) => t.status === "In Progress" },
  { key: "completed", label: "Completed", test: (t) => t.status === "Completed" },
  { key: "all", label: "All tasks", test: () => true },
];

const PRIORITY_DOT: Record<Priority, string> = {
  Critical: "bg-red-500",
  High: "bg-brand",
  Medium: "bg-amber-400",
  Low: "bg-gray-300",
};

function PriorityLabel({ p }: { p: Priority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink">
      <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[p]}`} /> {p}
    </span>
  );
}

function ComplaintPill({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${COMPLAINT_PILL} ${className}`}>
      <AlertTriangle className="h-3 w-3" /> Complaint
    </span>
  );
}

/** SLA-breach/at-risk isn't surfaced as a status anywhere the countdown already shows it — it just reads "In Progress" */
const displayStatus = (label: TaskStatusLabel): TaskStatusLabel => (label === "SLA breached" || label === "SLA at risk" ? "In Progress" : label);

function StatusLabel({ t }: { t: Pick<Task, "status" | "owner" | "sla"> }) {
  return <StatusPill t={t} />;
}

/** pill background + text, matching the Alt Prototype's StatusBadge */
const STATUS_BADGE: Record<string, { background: string; color: string }> = {
  Escalated: { background: "#FEF2F2", color: "#EF4444" },
  "SLA breached": { background: "#FEF2F2", color: "#EF4444" },
  "SLA at risk": { background: "#FFF9EC", color: "#F59E0B" },
  "In Progress": { background: "#FFF9EC", color: "#D97706" },
  Pending: { background: "#F5F5F5", color: "#6B7280" },
  Completed: { background: "#F0FDF4", color: "#22C55E" },
  Void: { background: "#F5F5F5", color: "#9CA3AF" },
};

function StatusPill({ t }: { t: Pick<Task, "status" | "owner" | "sla"> }) {
  const label = displayStatus(taskStatus(t));
  return (
    <span className="inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium" style={STATUS_BADGE[label] ?? { background: "#F5F5F5", color: "#6B7280" }}>
      {label}
    </span>
  );
}

const SlaText = ({ sla }: { sla: Task["sla"] }) => <SlaClock sla={sla} />;

/** compact SLA readout for the tasks table, matching the Alt Prototype's SlaCountdownCompact */
function SlaCompact({ t }: { t: Task }) {
  if (t.status === "Completed" || t.sla.kind === "met") {
    return <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#22C55E]"><CheckCircle2 className="h-3.5 w-3.5" /> SLA met</span>;
  }
  const secs = slaSecs(t.sla);
  if (secs === null) return <span className="text-[12px] text-ink-tertiary">{t.sla.text}</span>;
  const overdue = secs < 0 || t.sla.kind === "overdue";
  const color = overdue ? "text-[#EF4444]" : t.sla.kind === "due" ? "text-[#F59E0B]" : "text-[#22C55E]";
  return (
    <span className={`inline-flex items-center gap-1 font-display text-[12px] font-semibold ${color}`}>
      <Timer className="h-3 w-3" />
      {overdue ? `+${formatClock(Math.abs(secs))}` : formatClock(secs)}
    </span>
  );
}

/** red complaint badge for the tasks table, matching the Alt Prototype's ComplaintBadge (elsewhere in the app it stays amber) */
function TableComplaintPill() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "#FEF2F2", color: "#DC2626" }}>
      <AlertTriangle className="h-2.5 w-2.5" /> Complaint
    </span>
  );
}

/** green "$" badge shown on tasks with logged compensation, matching the Alt Prototype */
function CompensationBadge() {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#F0FDF4", color: "#22C55E" }} title="Compensation logged">
      $
    </span>
  );
}

const BOARD_COLS: { key: string; label: string; dot: string; test: (t: Task) => boolean }[] = [
  { key: "unassigned", label: "Unassigned", dot: "bg-gray-300", test: (t) => t.status === "Yet to Assign" && !t.owner },
  { key: "progress", label: "In Progress", dot: "bg-brand", test: (t) => t.status === "In Progress" || (t.status === "Yet to Assign" && !!t.owner) },
  { key: "escalated", label: "Escalated", dot: "bg-red-500", test: (t) => t.status === "Escalated" },
  { key: "completed", label: "Completed", dot: "bg-green-500", test: (t) => t.status === "Completed" },
];

const cap = (t: Task) => (t.tag === "Complaint" ? "Complaint" : null);

export default function Tasks() {
  useClock();
  const [tasks, setTasks] = useState<Task[]>(() => [...TASKS]);
  const [view, setView] = useState<View>("action");
  const [layout, setLayout] = useState<"list" | "board">("list");
  const [query, setQuery] = useState("");
  const [fDept, setFDept] = useState("");
  const [fPriority, setFPriority] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [prefill, setPrefill] = useState<{ guest: string; room: string }>({ guest: "", room: "" });
  const [chats, setChats] = useState<Record<number, ChatMsg[]>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const { manager, me, scopeDepts, inScope } = usePersona();

  // keep the shared list in sync so other pages see changes
  useEffect(() => {
    TASKS.splice(0, TASKS.length, ...tasks);
  }, [tasks]);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  // arriving from Pre-Arrival / Guests with ?new=1&guest=&room=
  useEffect(() => {
    const v = params.get("view") as View | null;
    const open = Number(params.get("open"));
    if (v && VIEWS.some((x) => x.key === v)) {
      setView(v);
      setParams({}, { replace: true });
    }
    if (open) {
      setSelectedId(open);
      setParams({}, { replace: true });
    }
    if (params.get("new")) {
      setPrefill({ guest: params.get("guest") ?? "", room: params.get("room") ?? "" });
      setNewOpen(true);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  // a Mid Manager only sees tasks of the department(s) they are assigned to
  const visibleTasks = useMemo(() => (manager ? tasks.filter((t) => inScope(t.dept)) : tasks), [tasks, manager, scopeDepts]);

  const counts = useMemo(() => Object.fromEntries(VIEWS.map((v) => [v.key, visibleTasks.filter(v.test).length])) as Record<View, number>, [visibleTasks]);

  const rows = useMemo(() => {
    const test = layout === "board" ? () => true : VIEWS.find((v) => v.key === view)!.test;
    const q = query.trim().toLowerCase();
    return visibleTasks.filter(
      (t) =>
        test(t) &&
        (!fDept || t.dept === fDept) &&
        (!fPriority || t.priority === fPriority) &&
        (!q || `${t.title} ${t.guest} ${t.room} ${t.dept}`.toLowerCase().includes(q)),
    );
  }, [visibleTasks, view, layout, query, fDept, fPriority]);

  const selected = tasks.find((t) => t.id === selectedId) ?? null;
  const update = (id: number, patch: Partial<Task>) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const activeFilters = (fDept ? 1 : 0) + (fPriority ? 1 : 0) + (layout === "list" && view !== "action" ? 1 : 0);

  const stats = manager
    ? [
        { label: "Open tasks", value: counts.action, foot: "Needs action", go: "action" as View, icon: ListChecks },
        { label: "Escalated", value: counts.escalated, foot: "Waiting on you", go: "escalated" as View, icon: AlertTriangle },
        { label: "Complaints", value: counts.complaints, foot: "Guest complaints open", go: "complaints" as View, icon: MessageCircle },
        { label: "SLA at risk", value: counts.risk, foot: "Due within the hour", go: "risk" as View, icon: Timer },
        { label: "Overdue / breached", value: counts.overdue, foot: "Past SLA window", go: "overdue" as View, icon: AlertTriangle },
        { label: "Unassigned", value: counts.unassigned, foot: "Awaiting an owner", go: "unassigned" as View, icon: UserRound },
      ]
    : [
        { label: "Open tasks", value: counts.action, foot: "Needs action", go: "action" as View, icon: ListChecks },
        { label: "Escalated", value: counts.escalated, foot: "Needs a decision", go: "escalated" as View, icon: AlertTriangle },
        { label: "Complaints", value: counts.complaints, foot: "Guest complaints open", go: "complaints" as View, icon: MessageCircle },
        { label: "SLA at risk", value: counts.risk, foot: "Due within the hour", go: "risk" as View, icon: Timer },
        { label: "Unassigned", value: counts.unassigned, foot: "Awaiting an owner", go: "unassigned" as View, icon: UserRound },
      ];

  const applyUpdate = (t: Task, patch: Partial<Task>, action: string, detail: string, msg: string) => {
    update(t.id, patch);
    logAudit(me.name, action, t.title, detail);
    flash(msg);
  };

  const createTask = (t: Omit<Task, "id">) => {
    const id = Math.max(...tasks.map((x) => x.id)) + 1;
    setTasks((ts) => [{ ...t, id }, ...ts]);
    setView("action");
    setNewOpen(false);
    flash(`Task created${t.owner ? ` and assigned to ${t.owner}` : ""}`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Tasks"
        newTask
        actions={
          <div className="flex items-center gap-3">
            <ScopePicker />
          </div>
        }
      />
      <main className="flex-1 overflow-y-auto bg-page">
        <div className="px-8 pb-8 pt-7">

        <div className={`grid grid-cols-2 gap-5 lg:grid-cols-3 ${manager ? "xl:grid-cols-6" : "xl:grid-cols-5"}`}>
          {stats.map((s) => (
            <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} foot={s.foot} onClick={() => setView(s.go)} />
          ))}
        </div>

        <div className="relative mt-5 flex items-center gap-3">
          <div className="relative min-w-0 max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, guests, rooms…"
              className="h-10 w-full rounded-control border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>
          <div className="relative shrink-0">
            <button
              aria-label="Filters"
              onClick={() => setFiltersOpen((o) => !o)}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                filtersOpen || activeFilters ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                  {activeFilters}
                </span>
              )}
            </button>
            {filtersOpen && (
              <div className="absolute left-0 top-12 z-20 w-[300px] space-y-3 rounded-xl border border-line bg-white p-4 shadow-lg">
                {layout === "list" && (
                  <Field label="View">
                    <Select value={view} onChange={(e) => setView(e.target.value as View)}>
                      {VIEWS.map((v) => (
                        <option key={v.key} value={v.key}>{v.label} ({counts[v.key]})</option>
                      ))}
                    </Select>
                  </Field>
                )}
                {(!manager || scopeDepts.length > 1) && (
                  <Field label="Department">
                    <Select value={fDept} onChange={(e) => setFDept(e.target.value)}>
                      <option value="">{manager ? "All my departments" : "All departments"}</option>
                      {(manager ? scopeDepts : DEPTS).map((d) => <option key={d}>{d}</option>)}
                    </Select>
                  </Field>
                )}
              </div>
            )}
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setView("action"); setFDept(""); setFPriority(""); }} className="text-[13px] font-medium text-brand">
              Clear filters
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex rounded-lg border border-line bg-white p-0.5" role="group" aria-label="Task layout">
              {([["list", "List view", List], ["board", "Board view", Columns3]] as const).map(([k, label, Icon]) => (
                <button
                  key={k}
                  aria-label={label}
                  aria-pressed={layout === k}
                  title={label}
                  onClick={() => setLayout(k)}
                  className={`flex h-9 w-9 items-center justify-center rounded-md ${layout === k ? "bg-brand-tint text-brand" : "text-ink-tertiary hover:text-ink"}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="mb-2 mt-4 text-[13px] text-ink-secondary">
          <span className="font-semibold text-ink">{layout === "board" ? "Board" : VIEWS.find((v) => v.key === view)!.label}</span> · {rows.length} {rows.length === 1 ? "task" : "tasks"}
        </div>

        {layout === "board" ? (
          <div className="flex gap-4 overflow-x-auto pb-3">
            {BOARD_COLS.map((col) => {
              const items = rows.filter(col.test);
              return (
                <div key={col.key} className="flex w-[290px] shrink-0 flex-col rounded-2xl bg-subtle/70 p-3">
                  <div className="flex items-center gap-2 px-2 pb-3 pt-1">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    <span className="text-[13px] font-semibold text-ink">{col.label}</span>
                    <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-ink-secondary">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((t) => {
                      const D = DEPT_ICON[t.dept] ?? Building2;
                      return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedId(t.id)}
                        className={`block w-full rounded-xl border border-line/70 bg-white p-3 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-brand/40 ${t.status === "Completed" ? "opacity-50" : ""}`}
                      >
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold leading-snug text-ink">{t.title}</div>
                          <div className="mt-0.5 text-[11px] text-ink-tertiary">{t.guest} · <RoomNo room={t.room} /></div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            {cap(t) && <ComplaintPill />}
                            {(taskStatus(t) === "SLA at risk" || taskStatus(t) === "SLA breached") && (
                              <span className={`${statusPillClass} ${STATUS_PILL[taskStatus(t)]}`}>{taskStatus(t)}</span>
                            )}
                          </div>
                        </div>
                        {t.status !== "Completed" && (
                          <div className="mt-2">
                            <SlaText sla={t.sla} />
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-line/70 pt-2 text-[11px]">
                          <span className="flex min-w-0 items-center gap-1.5 text-ink-secondary">
                            <D className="h-3.5 w-3.5 shrink-0 text-ink-tertiary" />
                            <span className="truncate">{t.dept}</span>
                          </span>
                          {t.owner && <span className="shrink-0 text-ink-secondary">{t.owner}</span>}
                        </div>
                      </button>
                      );
                    })}
                    {!items.length && <p className="px-2 py-6 text-center text-[12px] text-ink-tertiary">No tasks</p>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
        <Card table className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] table-fixed text-left">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[22%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="bg-subtle text-[12px] uppercase tracking-wide text-ink-secondary">
                  <th className="truncate px-4 py-3 font-medium">#</th>
                  <th className="truncate px-4 py-3 font-medium">Task</th>
                  <th className="truncate px-4 py-3 font-medium">Guest</th>
                  <th className="truncate px-4 py-3 font-medium">Room</th>
                  <th className="truncate px-4 py-3 font-medium">Department</th>
                  <th className="truncate px-4 py-3 font-medium">Assigned To</th>
                  <th className="truncate px-4 py-3 font-medium">SLA</th>
                  <th className="truncate px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => {
                  const completed = t.status === "Completed";
                  return (
                    <tr key={t.id} onClick={() => setSelectedId(t.id)} className={`cursor-pointer border-b border-line/60 last:border-0 transition-colors duration-200 hover:bg-subtle/60 ${completed ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] font-semibold text-ink-tertiary">#{String(t.id).padStart(3, "0")}</span>
                      </td>
                      <td className="min-w-0 px-4 py-3">
                        <div className={`flex min-w-0 items-center gap-1.5 text-[14px] font-medium text-ink ${completed ? "line-through" : ""}`}>
                          <span className="truncate">{t.title}</span>
                          {!!t.compensation?.length && <CompensationBadge />}
                          {cap(t) && <TableComplaintPill />}
                        </div>
                      </td>
                      <td className="truncate px-4 py-3 text-[14px] text-ink-secondary">{t.guest}</td>
                      <td className="truncate px-4 py-3 text-[14px] text-ink-secondary">{String(t.room).replace(/^Room\s+/i, "")}</td>
                      <td className="truncate px-4 py-3 text-[14px] text-ink-secondary">{t.dept}</td>
                      <td className="truncate px-4 py-3 text-[14px]">
                        {t.owner ? <span className="truncate text-ink">{t.owner}</span> : <span className="font-medium text-brand">Unassigned</span>}
                      </td>
                      <td className="truncate px-4 py-3"><SlaCompact t={t} /></td>
                      <td className="truncate px-4 py-3"><StatusPill t={t} /></td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan={8} className="px-4 py-3.5 text-center text-[14px] text-ink-tertiary">No tasks in this view.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        )}
        </div>
      </main>

      {selected && (
        <ManagerTaskWindow
          key={selected.id}
          gm={!manager}
          task={selected}
          allTasks={tasks}
          msgs={chats[selected.id]}
          onSend={(text) =>
            setChats((c) => ({
              ...c,
              [selected.id]: [...(c[selected.id] ?? seedThread(selected)), { from: "staff", text, time: "Now" }],
            }))
          }
          onClose={() => setSelectedId(null)}
          onApply={(patch, action, detail, msg, close) => {
            applyUpdate(selected, patch, action, detail, msg);
            if (close) setSelectedId(null);
          }}
        />
      )}

      {newOpen && <NewTask prefill={prefill} deptOptions={DEPTS} onClose={() => setNewOpen(false)} onCreate={createTask} />}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- floating window ---------- */

function seedThread(t: Task): ChatMsg[] {
  if (t.source !== "Guest Chat") return [];
  return [
    { from: "guest", text: `Hi, I need help with this: ${t.title.toLowerCase()}.`, time: "Earlier" },
    { from: "ai", text: `Sorry about that${t.tag === "Complaint" ? "" : " — happy to help"}. I've passed it to ${t.dept} and they're on it.`, time: "Earlier" },
  ];
}

function Overlay({ children, onClose, wide = false }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${wide ? "max-w-[760px]" : "max-w-[560px]"}`}
      >
        {children}
      </div>
    </div>
  );
}

function TaskWindow({
  task, msgs, onSend, onClose, onReassign, onResolve,
}: {
  task: Task;
  msgs?: ChatMsg[];
  onSend: (t: string) => void;
  onClose: () => void;
  onReassign: (owner: string) => void;
  onResolve: () => void;
}) {
  const [reassigning, setReassigning] = useState(false);
  const [pick, setPick] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("manual");
  const thread = msgs ?? seedThread(task);
  const staff = (STAFF[task.dept] ?? []).filter((s) => s !== task.owner);
  const prefs = PREFS[task.guest];
  const summary =
    task.summary ??
    `${task.guest} (Room ${task.room}) asked for “${task.title.toLowerCase()}” via ${task.source.toLowerCase()}. It's ${task.status.toLowerCase()} with ${task.dept}${task.owner ? `, owned by ${task.owner}` : " and has no owner yet"}.`;
  const done = task.status === "Completed";

  return (
    <Overlay onClose={onClose} wide={chatOpen}>
      <div className="flex items-start gap-3 border-b border-line px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] font-bold leading-tight text-ink">{task.title}</h2>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-secondary">
            <span>{task.dept}</span>
            <span><RoomNo room={task.room} /></span>
            <span>via {task.source}</span>
            <StatusLabel t={task} />
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] text-ink-tertiary">Assigned to</div>
            <div className="mt-1 text-[13px] font-medium text-ink">{task.owner ?? <span className="text-brand">Unassigned</span>}</div>
          </div>
          <div>
            <div className="text-[11px] text-ink-tertiary">SLA</div>
            <div className="mt-1"><SlaText sla={task.sla} /></div>
          </div>
        </div>

        {task.escalation && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50/40 px-3.5 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div className="text-[13px] leading-snug text-ink">
              <span className="font-semibold">Escalated · </span>{task.escalation}
            </div>
          </div>
        )}

        {task.details && (
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">Details</div>
            <p className="text-[13px] leading-relaxed text-ink">{task.details}</p>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" /> Guest summary — {task.guest}
          </div>
          <p className="text-[13px] leading-relaxed text-ink">{summary}</p>
          <div className="mt-3">
            <div className="mb-1.5 text-[11px] text-ink-tertiary">Preferences</div>
            {prefs ? (
              <div className="flex flex-wrap gap-1.5">
                {prefs.map((p) => (
                  <span key={p} className="rounded-md bg-subtle px-2.5 py-1 text-[12px] text-ink-secondary">{p}</span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-ink-tertiary">No preferences on file.</p>
            )}
          </div>
        </div>

        {reassigning && (
          <div className="rounded-xl border border-line bg-subtle/40 p-4">
            <div className="mb-2 text-[13px] font-semibold text-ink">Reassign to</div>
            <div className="flex gap-2">
              <Select value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">Select a {task.dept} team member</option>
                {staff.map((s) => <option key={s}>{s}</option>)}
              </Select>
              <Button
                disabled={!pick}
                className="disabled:opacity-40"
                onClick={() => { onReassign(pick); setReassigning(false); setPick(""); }}
              >
                Confirm
              </Button>
              <Button variant="outline" onClick={() => setReassigning(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {chatOpen && (
          <div className="overflow-hidden rounded-xl border border-line">
            <GuestChat className="h-[320px]" name={task.guest} msgs={thread} mode={mode} setMode={setMode} onSend={onSend} emptyText="No messages yet." />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-6 py-3.5">
        <Button variant="outline" onClick={() => setChatOpen((o) => !o)}>
          <MessageCircle className="h-4 w-4" /> {chatOpen ? "Hide chat" : "Message guest"}
        </Button>
        <Button variant="outline" onClick={() => setReassigning((o) => !o)} disabled={done}>
          <RefreshCw className="h-4 w-4" /> Reassign
        </Button>
        <Button className="ml-auto" onClick={onResolve} disabled={done}>
          <Check className="h-4 w-4" /> {done ? "Resolved" : "Resolve"}
        </Button>
      </div>
    </Overlay>
  );
}

/* ---------- mid-manager task window ---------- */

type Panel = null | "reassign" | "support" | "note" | "escalate" | "override";

const COMP_TYPES = ["Chocolate Cake — $10", "Fruit Platter — $10", "Date Box — $10", "Non-Alcoholic Sparkling Beverage — $10", "Prosecco — $20", "Champagne — $50", "Resort Credit — $500", "Resort Credit — $1,000", "Other"];
const APPROVERS = ["Front Office Manager", "Duty Manager", "F&B Manager", "Guest Relations Manager", "Housekeeping Manager", "General Manager"];

const SLA_TARGET: Record<Priority, number> = { Critical: 10, High: 20, Medium: 40, Low: 60 };
const slaMinutes = (text: string) => {
  const h = text.match(/(\d+)\s*hr/);
  const m = text.match(/(\d+)\s*min/);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
};

function SlaTimer({ task }: { task: Task }) {
  const target = SLA_TARGET[task.priority];
  const met = task.sla.kind === "met" || task.status === "Completed";
  const start = task.sla.kind === "overdue" ? -slaMinutes(task.sla.text) * 60 : slaMinutes(task.sla.text) * 60;
  useClock();
  const secs = slaSecs(task.sla) ?? start;
  const total = Math.max(target, Math.ceil(Math.abs(start) / 60)) * 60;
  const over = !met && secs < 0;
  const frac = met ? 1 : over ? 1 : Math.max(0.03, Math.min(1, secs / total));
  const tone = met ? "text-[#22C55E]" : over ? "text-[#EF4444]" : frac < 0.25 ? "text-brand" : "text-[#22C55E]";
  const bar = met ? "bg-green-500" : over ? "bg-red-500" : frac < 0.25 ? "bg-brand" : "bg-green-500";
  const abs = Math.abs(secs);
  const clock = `${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
        {met ? "SLA met" : `SLA Target: ${target} minutes`}
      </div>
      {met ? (
        <div className="mt-1.5 flex items-center gap-1.5 font-display text-[18px] font-bold text-[#22C55E]">
          <CheckCircle2 className="h-[18px] w-[18px]" /> SLA met
        </div>
      ) : (
        <div className={`mt-1 font-display font-bold leading-none tracking-tight tabular-nums ${tone} ${over ? "text-[18px]" : "text-[30px]"}`}>
          {over ? `OVERDUE — ${clock} over SLA` : clock}
        </div>
      )}
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-subtle"><div className={`h-full rounded-full ${bar}`} style={{ width: `${frac * 100}%` }} /></div>
    </div>
  );
}

const clockText = (mins: number) => {
  const m = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

const DUTY_MANAGER = { initials: "FD", name: "Franck Delen", role: "Duty Manager" };

/** complaint tasks: the health-score impact, and the duty manager Alfon AI notifies on its own */
function ComplaintImpact({ task }: { task: Task }) {
  const [notified, setNotified] = useState(false);
  useEffect(() => {
    setNotified(false);
    const id = setTimeout(() => setNotified(true), 700);
    return () => clearTimeout(id);
  }, [task.id]);
  return (
    <div className="border-t border-line pt-5">
      <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
        <AlertTriangle className="h-[13px] w-[13px] text-[#DC2626]" /> Guest Complaint Impact
      </div>
      <div className="mb-3 rounded-lg bg-[#FEF2F2] px-3 py-3 text-sm text-[#991B1B]">
        Alfon AI detected this as a guest complaint / service failure for <span className="font-semibold">{task.guest}</span>. It counts against the{" "}
        <span className="font-semibold">Guest Pulse</span> and <span className="font-semibold">Recovery Rate</span> pillars of the Hotel Health Score and will lower the Guest Satisfaction score until resolved.
      </div>
      <div className="flex items-center justify-between rounded-lg bg-subtle px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand font-display text-[10px] font-semibold text-white">{DUTY_MANAGER.initials}</span>
          <div>
            <div className="font-medium text-ink">{DUTY_MANAGER.name}</div>
            <div className="text-xs text-ink-secondary">{DUTY_MANAGER.role}</div>
          </div>
        </div>
        {notified ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-[#22C55E]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Auto-notified by Alfon AI
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-ink-tertiary">
            <Loader className="h-3 w-3 animate-pulse" /> Notifying duty manager...
          </span>
        )}
      </div>
    </div>
  );
}

function ManagerTaskWindow({
  task, onClose, onApply, gm = false,
}: {
  /** general manager: same panel, but nothing to escalate to */
  gm?: boolean;
  task: Task;
  allTasks: Task[];
  msgs?: ChatMsg[];
  onSend: (t: string) => void;
  onClose: () => void;
  onApply: (patch: Partial<Task>, action: string, detail: string, msg: string, close?: boolean) => void;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const navigate = useNavigate();
  const [, force] = useState(0);
  const { me: mgr } = usePersona();
  const [person, setPerson] = useState("");
  const [support, setSupport] = useState<string[]>(task.support ?? []);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSel, setAssignSel] = useState<string[]>([]);
  const [assignQuery, setAssignQuery] = useState("");
  const [text, setText] = useState("");
  const [modal, setModal] = useState<null | "help" | "void">(null);
  const [voidReason, setVoidReason] = useState("");
  const [compType, setCompType] = useState("");
  const [compOther, setCompOther] = useState("");
  const [compReason, setCompReason] = useState("");
  const [compBy, setCompBy] = useState("");
  const [notesDraft, setNotesDraft] = useState(task.details ?? "");

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const closed = task.status === "Completed" || task.status === "Void";
  const help = pendingHelpFor(task.id);
  const guestId = GUESTS.find((g) => g.name === task.guest)?.id;
  const anyHelp = HELP_REQUESTS.find((h) => h.taskId === task.id);
  const settleHelp = () => {
    if (help) {
      resolveHelp(help.id);
      force((n) => n + 1);
    }
  };
  const me = `${mgr.name} (${mgr.role})`;
  const teamMates = (STAFF[task.dept] ?? []).filter((s) => s !== task.owner);
  const open = (p: Panel) => {
    setPanel((cur) => (cur === p ? null : p));
    setText("");
    setPerson("");
  };

  // timeline derived from the task
  const t0 = 9 * 60 + 30 + ((task.id * 7) % 40);
  const started = task.status !== "Yet to Assign" || false;
  const steps: { done: boolean; title: string; sub?: string }[] = [
    { done: true, title: `Task Created — ${clockText(t0)}`, sub: task.source === "Guest Chat" ? "Generated from guest WhatsApp request" : task.source === "PMS" ? "Synced from PMS" : "Created by staff" },
    task.owner
      ? { done: true, title: `Task Assigned — ${clockText(t0 + 1)}`, sub: `Assigned to ${task.owner} (${task.dept})` }
      : { done: false, title: "Task Assigned — Pending", sub: "Waiting for an owner" },
    task.owner && started
      ? { done: true, title: `Task Accepted — ${clockText(t0 + 4)}`, sub: `${task.owner} confirmed receipt` }
      : { done: false, title: "Task Accepted — Pending" },
    ...(anyHelp ? [{ done: true, title: `${anyHelp.type} requested — ${clockText(t0 + 12)}`, sub: `${anyHelp.from}: ${anyHelp.reason}` }] : []),
    ...(task.status === "Escalated"
      ? [{ done: true, title: `Task Escalated — ${clockText(t0 + 20)}`, sub: `Escalated to ${task.escalatedTo ?? "Department Head"}` }]
      : []),
    task.status === "Completed"
      ? { done: true, title: `Task Completed — ${clockText(t0 + 30)}`, sub: task.resolution }
      : task.status === "Void"
        ? { done: true, title: "Task Marked Void", sub: task.resolution }
        : { done: false, title: "Task Completed — Pending" },
  ];

  const clock24 = (m: number) => {
    const x = ((m % 1440) + 1440) % 1440;
    return `Today ${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
  };
  const slaTarget = SLA_TARGET[task.priority];
  const editHistory: { label: string; time: string; by?: string; create?: boolean }[] = [
    { label: `Created by ${task.owner ?? "System"} (${task.owner ? "Staff" : "System"})`, time: clock24(t0 - 30), create: true },
    ...(task.tag === "Complaint" || task.status === "Escalated"
      ? [
          { label: `Completion time set: ${slaTarget + 12} min`, time: clock24(t0 - 20) },
          { label: `Completion time changed: ${slaTarget + 12} min → ${slaTarget} min`, time: clock24(t0 + 5), by: "James C. (Supervisor)" },
        ]
      : []),
  ];

  const roleOf = (name: string) => (name === mgr.name || name === shortName(mgr.name) ? mgr.role : "Line Staff");
  const notes = [
    ...(anyHelp ? [{ author: anyHelp.from, text: anyHelp.reason, time: "" }] : []),
    ...(task.escalation ? [{ author: task.owner ?? "Line Staff", text: task.escalation, time: "" }] : []),
    ...(task.notes ?? []),
  ].map((n) => {
    const m = n.author.match(/^(.*?)\s*\((.+)\)$/);
    return m ? { ...n, author: m[1], role: m[2] } : { ...n, role: roleOf(n.author) };
  });
  const description =
    task.details ?? task.summary ?? `${task.guest} (Room ${task.room}) asked for “${task.title.toLowerCase()}” via ${task.source.toLowerCase()}.`;
  const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const smallBtn = (p: Exclude<Panel, null>, label: string) => (
    <button
      onClick={() => open(p)}
      disabled={closed}
      className={`flex-1 rounded-lg border px-3 py-2.5 text-[13px] font-semibold disabled:opacity-40 ${
        panel === p ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink hover:bg-subtle"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-ink/20" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-label="Task details" className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="px-6 pb-3 pt-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 pr-4 font-display text-[18px] font-bold leading-tight text-ink">{task.title}</h2>
            <button onClick={onClose} aria-label="Close" className="shrink-0 rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium"
              style={STATUS_BADGE[displayStatus(taskStatus(task))] ?? { background: "#F5F5F5", color: "#6B7280" }}
            >
              {displayStatus(taskStatus(task))}
            </span>
            {task.tag === "Complaint" && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${COMPLAINT_PILL}`}>
                <AlertTriangle className="h-3.5 w-3.5" /> Complaint
              </span>
            )}
            <span className="ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold text-ink-tertiary" style={{ background: "#F5F5F5" }}>
              #{String(task.id).padStart(3, "0")}
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 pb-5">
          <div className="rounded-card border border-line p-4" style={{ background: "linear-gradient(180deg, #FFFBF8, #FFFFFF)" }}>
            <SlaTimer key={task.id + task.sla.text} task={task} />
          </div>

          {task.tag === "Complaint" && <ComplaintImpact task={task} />}

          <div className="border-t border-line pt-5">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Task Timeline</div>
            <ol>
              {steps.map((st, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${st.done ? "border-brand text-brand" : "border-line text-transparent"}`}>
                      <Check className="h-3 w-3" />
                    </span>
                    {i < steps.length - 1 && <span className="my-1 w-px flex-1 bg-line" />}
                  </div>
                  <div className={`pb-4 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                    <div className={`text-[14px] ${st.done ? "font-medium text-ink" : "text-ink-tertiary"}`}>{st.title}</div>
                    {st.sub && <div className="text-[12px] text-ink-secondary">{st.sub}</div>}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-2 border-t border-line pt-4 text-[14px]">
            <div className="flex items-center justify-between"><span className="text-ink-secondary">Guest</span>{task.guest === "—" ? <span className="font-medium text-ink">—</span> : <Link to={guestId ? `/guest-chats?guest=${guestId}` : `/guest-chats?name=${encodeURIComponent(task.guest)}&room=${task.room}`} className="font-medium text-brand hover:underline">{task.guest}</Link>}</div>
            <div className="flex items-center justify-between"><span className="text-ink-secondary">Room</span><span className="font-medium text-ink">{task.room}</span></div>
            <div className="flex items-center justify-between"><span className="text-ink-secondary">Department</span><span className="font-medium text-ink">{task.dept}</span></div>
            <div>
              <button
                type="button"
                disabled={closed}
                aria-expanded={assignOpen}
                aria-label="Assigned to"
                onClick={() => { setAssignOpen(true); setAssignQuery(""); setAssignSel([...(task.owner ? [task.owner] : []), ...(task.support ?? [])]); }}
                className="flex w-full items-center justify-between disabled:cursor-default"
              >
                <span className="text-ink-secondary">Assigned To</span>
                <span className="flex items-center gap-2">
                  {task.owner ? (
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{initials(task.owner)}</span>
                      {task.owner}
                    </span>
                  ) : (
                    <span className="font-medium text-brand">Unassigned</span>
                  )}
                  {!closed && <ChevronDown className="h-4 w-4 text-ink-tertiary" />}
                </span>
              </button>
            </div>
            {!!task.support?.length && (
              <div className="flex items-center justify-between"><span className="text-ink-secondary">Support</span><span className="font-medium text-ink">{task.support.join(", ")}</span></div>
            )}
          </div>

          {(task.tag === "Complaint" || task.status === "Escalated") && (
          <div className="border-t border-line pt-5">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">
              <DollarSign className="h-[13px] w-[13px] text-[#22C55E]" /> Guest Compensation
            </div>
            {!!task.compensation?.length && (
              <div className="mb-3 space-y-2">
                {task.compensation.map((c, i) => (
                  <div key={i} className="rounded-lg bg-subtle px-3 py-2.5">
                    <div className="text-[14px] font-medium text-ink">{c.type}</div>
                    <p className="text-[13px] leading-snug text-ink-secondary">{c.reason}</p>
                    <p className="mt-0.5 text-[11px] text-ink-tertiary">Approved by {c.approvedBy} · {c.time}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-ink-secondary">Compensation Type</label>
                <Select className="mt-1" value={compType} onChange={(e) => setCompType(e.target.value)} disabled={closed}>
                  <option value="">Select compensation...</option>
                  {COMP_TYPES.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
              {compType === "Other" && (
                <div>
                  <label className="text-xs font-medium text-ink-secondary">What is the compensation?</label>
                  <Input className="mt-1" value={compOther} onChange={(e) => setCompOther(e.target.value)} placeholder="e.g. Late check-out, spa voucher" disabled={closed} />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-ink-secondary">Reason</label>
                <Textarea className="mt-1" rows={2} value={compReason} onChange={(e) => setCompReason(e.target.value)} disabled={closed} />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-secondary">Approved By</label>
                <Select className="mt-1" value={compBy} onChange={(e) => setCompBy(e.target.value)} disabled={closed}>
                  <option value="">Select designation...</option>
                  {APPROVERS.map((c) => <option key={c}>{c}</option>)}
                </Select>
              </div>
              {!!task.compensation?.length && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-secondary">Status</span>
                  <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: "#F0FDF4", color: "#22C55E" }}>Completed</span>
                </div>
              )}
              <button
                disabled={closed || !compType || (compType === "Other" && !compOther.trim()) || !compReason.trim() || !compBy}
                onClick={() => {
                  const type = compType === "Other" ? `Other — ${compOther.trim()}` : compType;
                  onApply(
                    { compensation: [...(task.compensation ?? []), { type, reason: compReason.trim(), approvedBy: compBy, time: "Just now" }] },
                    "Compensation submitted", `${type} · approved by ${compBy}`, "Compensation submitted",
                  );
                  setCompType(""); setCompOther(""); setCompReason(""); setCompBy("");
                }}
                className="w-full rounded-lg bg-[#22C55E] py-2.5 font-display text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {task.compensation?.length && !compType && !compReason.trim() && !compBy ? "Compensation Logged" : "Submit Compensation"}
              </button>
            </div>
          </div>
          )}

          <div className="border-t border-line pt-5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Notes</div>
            <Textarea
              rows={3}
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={() => { if (notesDraft !== (task.details ?? "")) onApply({ details: notesDraft }, "Notes updated", notesDraft, "Notes updated"); }}
              disabled={closed}
            />
          </div>

          <div className="border-t border-line pt-5">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Internal Notes</div>
            {notes.length ? (
              <div className="space-y-2">
                {notes.map((n, i) => (
                  <div key={i} className="rounded-lg bg-subtle px-3 py-2.5">
                    <p className="text-[14px] leading-relaxed text-ink">{n.text}</p>
                    <div className="mt-1.5 text-[12px] text-ink-tertiary"><span className="font-semibold text-ink-secondary">{n.author}</span> · {n.role}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-subtle px-3 py-2.5 text-[14px] leading-relaxed text-ink">{description}</div>
            )}
          </div>

          <div className="border-t border-line pt-5">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Edit History</div>
            <div className="space-y-3">
              {editHistory.map((e, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${e.create ? "bg-brand" : "bg-[#D1D5DB]"}`} />
                  <div>
                    <div className="text-sm text-ink">{e.label}</div>
                    <div className="text-xs text-ink-secondary">{e.time}{e.by ? ` · ${e.by}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-h-[52%] shrink-0 space-y-2 overflow-y-auto border-t border-line px-6 py-4">
          {panel === "note" && (
            <PanelBox title="Add note" ok="Save note" disabled={!text.trim()} onCancel={() => setPanel(null)}
              onOk={() => {
                onApply({ notes: [{ author: me, text: text.trim(), time: "Just now" }, ...(task.notes ?? [])] }, "Note added", text.trim(), "Note added");
                setPanel(null);
              }}>
              <Textarea rows={2} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Visible to managers only…" />
            </PanelBox>
          )}
          {task.owner || closed ? (
            <button
              onClick={() => {
                onApply({ status: "Completed", sla: { kind: "met", text: "Met" } }, "Marked complete", "Completed by manager", "Task marked complete — review the reply to your guest", true);
                AI_DRAFTS[task.guest] = `Hi ${task.guest.split(" ")[0]}, we've taken care of your request (${task.title.toLowerCase()}) for room ${task.room}. Please let us know if there's anything else we can do — we hope you're enjoying your stay.`;
                navigate(guestId ? `/guest-chats?guest=${guestId}` : `/guest-chats?name=${encodeURIComponent(task.guest)}&room=${task.room}`);
              }}
              disabled={closed}
              className="w-full rounded-lg bg-[#22C55E] py-3 text-[14px] font-semibold text-white hover:bg-[#1DA750] disabled:opacity-40"
            >
              {closed ? "Closed" : "Mark as Complete"}
            </button>
          ) : (
            <button
              onClick={() => onApply({ owner: shortName(mgr.name), status: "In Progress" }, "Accepted task", `Accepted by ${mgr.name}`, "Task accepted — it's yours")}
              className="w-full rounded-lg bg-brand py-3 text-[14px] font-semibold text-white hover:bg-brand-hover"
            >
              Accept
            </button>
          )}
          <div className="flex gap-2">
            {!gm && (
              <button
                onClick={() => { setText(""); setPanel("escalate"); }}
                disabled={closed}
                className="flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] font-semibold text-ink hover:bg-subtle disabled:opacity-40"
              >
                Escalate
              </button>
            )}
            {smallBtn("note", "Add Note")}
          </div>
          <button
            onClick={() => { setVoidReason(""); setModal("void"); }}
            disabled={closed}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[13px] font-semibold text-ink-tertiary hover:bg-subtle disabled:opacity-40"
          >
            Void Task
          </button>
        </div>
      </aside>

      {assignOpen && !closed && (
        <CenterDialog
          title="Assign task"
          sub={`${task.title} · Room ${task.room}`}
          ok={`Assign${assignSel.length > 1 ? ` (${assignSel.length})` : ""}`}
          disabled={!assignSel.length}
          onClose={() => setAssignOpen(false)}
          onOk={() => {
            const [owner, ...others] = assignSel;
            onApply(
              { owner, support: others, status: task.status === "Yet to Assign" ? "In Progress" : task.status },
              task.owner ? "Reassigned" : "Assigned",
              `${task.owner ?? "Unassigned"} → ${assignSel.join(", ")} (${task.dept})`,
              `Assigned to ${assignSel.join(", ")}`,
            );
            setSupport(others);
            settleHelp();
            setAssignOpen(false);
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              autoFocus
              value={assignQuery}
              onChange={(e) => setAssignQuery(e.target.value)}
              placeholder="Search team members"
              className="h-10 w-full rounded-control bg-subtle pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="mt-2 max-h-64 divide-y divide-line/60 overflow-y-auto">
            {(STAFF[task.dept] ?? []).filter((m) => m.toLowerCase().includes(assignQuery.trim().toLowerCase())).map((m) => {
              const idx = assignSel.indexOf(m);
              const av = availabilityOf(m);
              return (
                <label key={m} className="flex cursor-pointer items-center gap-3 py-3 text-[14px] text-ink">
                  <input type="checkbox" className="h-4 w-4 accent-brand" checked={idx >= 0} onChange={(e) => setAssignSel((cur) => (e.target.checked ? [...cur, m] : cur.filter((x) => x !== m)))} />
                  <span className="min-w-0 flex-1">
                    {m}
                    {idx === 0 && assignSel.length > 1 && <span className="ml-2 text-[12px] text-ink-tertiary">Owner</span>}
                  </span>
                  <span className={`text-[12px] ${av.text}`}>{av.label}</span>
                </label>
              );
            })}
            {!(STAFF[task.dept] ?? []).some((m) => m.toLowerCase().includes(assignQuery.trim().toLowerCase())) && (
              <p className="py-6 text-center text-[13px] text-ink-tertiary">No team members match.</p>
            )}
          </div>
          {assignSel.length > 1 && <p className="mt-1 text-[12px] text-ink-tertiary">The first person selected is the owner, the rest support.</p>}
          {task.owner && (
            <button
              onClick={() => { onApply({ owner: null, support: [], status: "Yet to Assign" }, "Reopened", "Reopened for anyone to pick up", "Task reopened for others to pick up"); settleHelp(); setAssignOpen(false); }}
              className="mt-3 text-[12px] font-medium text-ink-secondary hover:text-ink"
            >
              Make it an open task instead
            </button>
          )}
        </CenterDialog>
      )}
      {panel === "support" && (
        <CenterDialog
          title="Add support"
          sub={`${task.title} · Room ${task.room}`}
          ok="Add support"
          disabled={support.length === (task.support ?? []).length && support.every((s) => task.support?.includes(s))}
          onClose={() => setPanel(null)}
          onOk={() => {
            onApply({ support }, "Support added", support.join(", "), "Support staff added");
            settleHelp();
            setPanel(null);
          }}
        >
          <div className="mb-2 text-[12px] text-ink-secondary">Bring in extra {task.dept} team members</div>
          <div className="max-h-64 space-y-1.5 overflow-y-auto">
            {teamMates.map((s) => (
              <label key={s} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] text-ink ${support.includes(s) ? "border-brand bg-brand-tint/40" : "border-line hover:bg-subtle"}`}>
                <input type="checkbox" className="h-4 w-4 accent-brand" checked={support.includes(s)} onChange={(e) => setSupport((cur) => (e.target.checked ? [...cur, s] : cur.filter((x) => x !== s)))} />
                <span className="min-w-0 flex-1 font-medium">{s}</span>
                <AvailabilityTag name={s} />
              </label>
            ))}
          </div>
        </CenterDialog>
      )}
      {panel === "escalate" && (
        <CenterDialog
          title="Escalate to Duty Manager"
          sub={`${task.title} · Room ${task.room}`}
          ok="Escalate"
          onClose={() => setPanel(null)}
          onOk={() => {
            onApply({ status: "Escalated", escalatedTo: "Duty Manager", escalation: text.trim() || undefined }, "Escalated to Duty Manager", text.trim() || "No reason given", "Escalated to Duty Manager");
            settleHelp();
            setPanel(null);
          }}
        >
          <div className="mb-1 text-[12px] text-ink-secondary">Reason (optional)</div>
          <Textarea rows={3} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Add context for the Duty Manager…" />
        </CenterDialog>
      )}
      {panel === "reassign" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && setPanel(null)}>
          <div role="dialog" aria-label="Reassign task" className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-bold text-ink">Reassign task</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">{task.title} · Room {task.room}</p>
              </div>
              <button onClick={() => setPanel(null)} aria-label="Close" className="shrink-0 rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => { onApply({ owner: null, status: "Yet to Assign" }, "Reopened", "Reopened for anyone to pick up", "Task reopened for others to pick up"); settleHelp(); setPanel(null); }}
                className="w-full rounded-xl border border-line px-4 py-3 text-left hover:border-brand hover:bg-brand-tint/30"
              >
                <span className="block text-[14px] font-semibold text-ink">Make it an open task</span>
                <span className="block text-[12px] text-ink-secondary">Anyone in {task.dept} can pick it up</span>
              </button>
              <div className="my-3 text-center text-[11px] text-ink-tertiary">or assign to a person</div>
              <div className="mb-2 text-[12px] text-ink-secondary">Team member</div>
              <div className="max-h-56 space-y-1.5 overflow-y-auto">
                {teamMates.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPerson(s)}
                    aria-pressed={person === s}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13px] ${person === s ? "border-brand bg-brand-tint/40" : "border-line hover:bg-subtle"}`}
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${person === s ? "border-brand" : "border-line"}`}>
                      {person === s && <span className="h-2 w-2 rounded-full bg-brand" />}
                    </span>
                    <span className="min-w-0 flex-1 font-medium text-ink">{s}</span>
                    <AvailabilityTag name={s} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setPanel(null)} className="flex-1 rounded-control border border-line py-2.5 text-[13px] font-semibold text-ink-secondary hover:bg-subtle">Cancel</button>
              <button
                disabled={!person}
                onClick={() => {
                  onApply({ owner: person }, "Reassigned", `${task.owner ?? "Unassigned"} → ${person} (${task.dept})`, `Reassigned to ${person}`);
                  settleHelp();
                  setPanel(null);
                }}
                className="flex-1 rounded-control bg-brand py-2.5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-brand-hover disabled:opacity-40"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <div role="dialog" className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-2xl">
            {modal === "help" ? (
              <>
                <h3 className="text-[17px] font-bold text-ink">Need help?</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">{task.title} · Room {task.room}</p>
                <div className="mt-4 space-y-2">
                  {([
                    ["reassign", "Reassign task", "Hand this task to another team member"],
                    ["escalate", "Escalate to Duty Manager", "Send this up with a reason"],
                    ["support", "Add support", "Bring in extra team members"],
                  ] as const).map(([k, label, sub]) => (
                    <button key={k} onClick={() => { setModal(null); setPanel(k); setText(""); setPerson(""); }} className="block w-full rounded-xl border border-line px-4 py-3 text-left hover:border-brand hover:bg-brand-tint/30">
                      <span className="block text-[14px] font-semibold text-ink">{label}</span>
                      <span className="block text-[12px] text-ink-secondary">{sub}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setModal(null)} className="mt-4 w-full text-center text-[13px] font-medium text-ink-secondary">Cancel</button>
              </>
            ) : (
              <>
                <h3 className="text-[17px] font-bold text-ink">Void this task</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">Choose why this task is being voided.</p>
                <div className="mt-4 space-y-2">
                  {["Task no longer required", "Duplicate", "Wrong info"].map((r) => (
                    <label key={r} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-[14px] ${voidReason === r ? "border-brand bg-brand-tint/40" : "border-line"}`}>
                      <input type="radio" name="void-reason" className="accent-brand" checked={voidReason === r} onChange={() => setVoidReason(r)} />
                      {r}
                    </label>
                  ))}
                </div>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => setModal(null)} className="flex-1 rounded-control border border-line py-2.5 text-[13px] font-semibold text-ink-secondary hover:bg-subtle">Cancel</button>
                  <button
                    disabled={!voidReason}
                    onClick={() => { onApply({ status: "Void", resolution: voidReason }, "Marked void", `Reason: ${voidReason}`, "Task marked void", true); setModal(null); }}
                    className="flex-1 rounded-lg bg-red-500 py-2.5 text-[13px] font-semibold text-white hover:bg-red-600 disabled:opacity-40"
                  >
                    Mark as Void
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CenterDialog({
  title, sub, ok, disabled, onOk, onClose, children,
}: {
  title: string;
  sub?: string;
  ok: string;
  disabled?: boolean;
  onOk: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-label={title} className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[17px] font-bold text-ink">{title}</h3>
            {sub && <p className="mt-1 text-[13px] text-ink-secondary">{sub}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="shrink-0 rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-control border border-line py-2.5 text-[13px] font-semibold text-ink-secondary hover:bg-subtle">Cancel</button>
          <button onClick={onOk} disabled={disabled} className="flex-1 rounded-control bg-brand py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover disabled:opacity-40">{ok}</button>
        </div>
      </div>
    </div>
  );
}

function PanelBox({
  title, ok, disabled, onOk, onCancel, children,
}: {
  title: string;
  ok: string;
  disabled?: boolean;
  onOk: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 rounded-xl border border-line bg-subtle/40 p-4">
      <div className="mb-2 text-[13px] font-semibold text-ink">{title}</div>
      {children}
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onOk} disabled={disabled} className="disabled:opacity-40">{ok}</Button>
      </div>
    </div>
  );
}

/* ---------- new task ---------- */

function NewTask({
  prefill, deptOptions, onClose, onCreate,
}: {
  prefill: { guest: string; room: string };
  deptOptions: string[];
  onClose: () => void;
  onCreate: (t: Omit<Task, "id">) => void;
}) {
  const [guest, setGuest] = useState(prefill.guest);
  const [room, setRoom] = useState(prefill.room);
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState(deptOptions[0]);
  const [details, setDetails] = useState("");

  const valid = title.trim() && room.trim();

  const submit = () => {
    if (!valid) return;
    onCreate({
      title: title.trim(),
      guest: guest.trim() || "—",
      room: room.trim(),
      dept,
      owner: null,
      priority: "Medium",
      sla: { kind: "left", text: "40 min left" },
      status: "Yet to Assign",
      source: "Staff",
      details: details.trim() || undefined,
    });
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div>
          <h2 className="text-[17px] font-bold text-ink">New task</h2>
          <p className="text-[12px] text-ink-secondary">Create a request and route it to a department.</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <Field label="Guest" hint="Optional.">
            <Input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Guest name" />
          </Field>
          <Field label="Room" required>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="1608" required />
          </Field>
        </div>

        <Field label="What needs to be done?" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Extra pillows, AC check, airport pickup" autoFocus />
        </Field>

        <Field label="Department">
          <Select value={dept} onChange={(e) => setDept(e.target.value)}>
            {deptOptions.map((d) => <option key={d}>{d}</option>)}
          </Select>
        </Field>

        <Field label="Details" hint="Optional.">
          <Textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Anything the team should know…" />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-6 py-3.5">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!valid} className="disabled:opacity-40">Create task</Button>
      </div>
    </Overlay>
  );
}
