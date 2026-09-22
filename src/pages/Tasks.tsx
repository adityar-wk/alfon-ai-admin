import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  X,
  Wrench,
  ConciergeBell,
  KeyRound,
  UtensilsCrossed,
  BedDouble,
  Wine,
  Headset,
  Plus,
  Sparkles,
  Building2,
  MessageCircle,
  RefreshCw,
  Check,
  Search,
  Filter,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { GuestChat, type ChatMsg, type ChatMode } from "../components/GuestChat";
import { Page, Card, Button, Field, Input, Select, Textarea } from "../components/ui";
import { TASKS, logAudit, type Task, type Priority, type Status } from "../data/tasks";
import { GUESTS } from "../data/guests";
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
const DEPTS = Object.keys(STAFF);
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const SLA_OPTS = ["15 min", "30 min", "1 hour", "2 hours", "4 hours"];

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
  { key: "action", label: "Action required", test: (t) => t.status !== "Completed" && t.status !== "Unable to Complete" },
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

function StatusLabel({ s }: { s: Status }) {
  const dot = s === "Unable to Complete" ? "bg-amber-400" : s === "Completed" ? "bg-emerald-500" : s === "Escalated" ? "bg-red-500" : s === "In Progress" ? "bg-brand" : "bg-gray-300";
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {s}
    </span>
  );
}

function SlaText({ sla }: { sla: Task["sla"] }) {
  const tone = sla.kind === "overdue" ? "text-red-600 font-medium" : sla.kind === "due" ? "text-brand font-medium" : "text-ink-secondary";
  return (
    <span className={`inline-flex items-center gap-1 text-[13px] ${tone}`}>
      <Clock className="h-3.5 w-3.5" /> {sla.text}
    </span>
  );
}

function DeptIcon({ dept }: { dept: string }) {
  const Icon = DEPT_ICON[dept] ?? Building2;
  return (
    <span title={dept} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-secondary">
      <Icon className="h-4 w-4" />
    </span>
  );
}

const cap = (t: Task) => (t.tag === "Complaint" ? "Complaint" : null);

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(() => [...TASKS]);
  const [view, setView] = useState<View>("action");
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
    const test = VIEWS.find((v) => v.key === view)!.test;
    const q = query.trim().toLowerCase();
    return visibleTasks.filter(
      (t) =>
        test(t) &&
        (!fDept || t.dept === fDept) &&
        (!fPriority || t.priority === fPriority) &&
        (!q || `${t.title} ${t.guest} ${t.room} ${t.dept}`.toLowerCase().includes(q)),
    );
  }, [visibleTasks, view, query, fDept, fPriority]);

  const selected = tasks.find((t) => t.id === selectedId) ?? null;
  const update = (id: number, patch: Partial<Task>) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const activeFilters = (fDept ? 1 : 0) + (fPriority ? 1 : 0) + (view !== "action" ? 1 : 0);

  const stats = manager
    ? [
        { label: "Escalated", value: counts.escalated, foot: "Waiting on you", go: "escalated" as View },
        { label: "SLA at risk", value: counts.risk, foot: "Due within the hour", go: "risk" as View },
        { label: "Overdue / breached", value: counts.overdue, foot: "Past SLA window", go: "overdue" as View },
        { label: "Unassigned", value: counts.unassigned, foot: "Awaiting an owner", go: "unassigned" as View },
      ]
    : [
        { label: "Escalated", value: counts.escalated, foot: "Needs a decision", go: "escalated" as View },
        { label: "SLA at risk", value: counts.risk, foot: "Due within the hour", go: "risk" as View },
        { label: "Unassigned", value: counts.unassigned, foot: "Awaiting an owner", go: "unassigned" as View },
        { label: "Completed today", value: counts.completed, foot: "Across all departments", go: "completed" as View },
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
        showSearch={false}
        actions={
          <div className="flex items-center gap-3">
            <ScopePicker />
            <Button onClick={() => { setPrefill({ guest: "", room: "" }); setNewOpen(true); }}>
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </div>
        }
      />
      <Page>
        <p className="mb-4 text-[13px] text-ink-secondary">
          {manager ? `Escalations, SLA risks and requests for ${scopeDepts.join(" + ")}.` : "Monitor escalations, SLA risks and operational requests across departments."}
        </p>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={() => setView(s.go)}
              className="rounded-card border border-line bg-white p-4 text-left hover:border-brand/40"
            >
              <div className="text-[13px] text-ink-secondary">{s.label}</div>
              <div className="mt-1 text-[26px] font-bold leading-tight text-ink">{s.value}</div>
              <div className="text-[12px] text-ink-tertiary">{s.foot}</div>
            </button>
          ))}
        </div>

        <div className="relative mt-5 flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, guests, rooms…"
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            {activeFilters > 0 && (
              <button onClick={() => { setView("action"); setFDept(""); setFPriority(""); }} className="text-[13px] font-medium text-brand">
                Clear filters
              </button>
            )}
            <button
              aria-label="Filters"
              onClick={() => setFiltersOpen((o) => !o)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${
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
          </div>

          {filtersOpen && (
            <div className="absolute right-0 top-12 z-20 w-[300px] space-y-3 rounded-xl border border-line bg-white p-4 shadow-lg">
              <Field label="View">
                <Select value={view} onChange={(e) => setView(e.target.value as View)}>
                  {VIEWS.map((v) => (
                    <option key={v.key} value={v.key}>{v.label} ({counts[v.key]})</option>
                  ))}
                </Select>
              </Field>
              {(!manager || scopeDepts.length > 1) && (
                <Field label="Department">
                  <Select value={fDept} onChange={(e) => setFDept(e.target.value)}>
                    <option value="">{manager ? "All my departments" : "All departments"}</option>
                    {(manager ? scopeDepts : DEPTS).map((d) => <option key={d}>{d}</option>)}
                  </Select>
                </Field>
              )}
              <Field label="Priority">
                <Select value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
                  <option value="">All priorities</option>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </Select>
              </Field>
            </div>
          )}
        </div>

        <div className="mb-2 mt-4 text-[13px] text-ink-secondary">
          <span className="font-semibold text-ink">{VIEWS.find((v) => v.key === view)!.label}</span> · {rows.length} {rows.length === 1 ? "task" : "tasks"}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-line bg-subtle/50 text-[11px] uppercase tracking-wide text-ink-secondary">
                  <th className="py-3 pl-4 font-medium">Task</th>
                  <th className="py-3 font-medium">Guest / Room</th>
                  <th className="py-3 font-medium">Owner</th>
                  <th className="py-3 font-medium">Priority</th>
                  <th className="py-3 font-medium">SLA</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} onClick={() => setSelectedId(t.id)} className="cursor-pointer border-b border-line/70 last:border-0 hover:bg-subtle/60">
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <DeptIcon dept={t.dept} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                            {t.title}
                            {t.vip && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">VIP</span>}
                          </div>
                          {cap(t) && <div className="text-[11px] text-ink-tertiary">{cap(t)}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="text-[13px] text-ink">{t.guest}</div>
                      <div className="text-[12px] text-ink-tertiary">Room {t.room}</div>
                    </td>
                    <td className="py-3 pr-3 text-[13px]">
                      {t.owner ? <span className="text-ink-secondary">{t.owner}</span> : <span className="font-medium text-brand">Unassigned</span>}
                    </td>
                    <td className="py-3 pr-3"><PriorityLabel p={t.priority} /></td>
                    <td className="py-3 pr-3"><SlaText sla={t.sla} /></td>
                    <td className="py-3 pr-4"><StatusLabel s={t.status} /></td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[13px] text-ink-tertiary">No tasks in this view.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Page>

      {selected && manager && (
        <ManagerTaskWindow
          key={selected.id}
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

      {selected && !manager && (
        <TaskWindow
          key={selected.id}
          task={selected}
          msgs={chats[selected.id]}
          onSend={(text) =>
            setChats((c) => ({
              ...c,
              [selected.id]: [...(c[selected.id] ?? seedThread(selected)), { from: "staff", text, time: "Now" }],
            }))
          }
          onClose={() => setSelectedId(null)}
          onReassign={(owner) => {
            update(selected.id, { owner });
            flash(`Reassigned to ${owner}`);
          }}
          onResolve={() => {
            update(selected.id, { status: "Completed", sla: { kind: "met", text: "Met" } });
            setSelectedId(null);
            flash(`“${selected.title}” resolved`);
          }}
        />
      )}

      {newOpen && <NewTask prefill={prefill} deptOptions={manager ? scopeDepts : DEPTS} onClose={() => setNewOpen(false)} onCreate={createTask} />}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
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
            {task.vip && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">VIP</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-secondary">
            <span>{task.dept}</span>
            <span>Room {task.room}</span>
            <span>via {task.source}</span>
            <StatusLabel s={task.status} />
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] text-ink-tertiary">Assigned to</div>
            <div className="mt-1 text-[13px] font-medium text-ink">{task.owner ?? <span className="text-brand">Unassigned</span>}</div>
          </div>
          <div>
            <div className="text-[11px] text-ink-tertiary">Priority</div>
            <div className="mt-1"><PriorityLabel p={task.priority} /></div>
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

type Panel = null | "reassign" | "support" | "note" | "escalate" | "unable" | "override";


function ManagerTaskWindow({
  task, allTasks, msgs, onSend, onClose, onApply,
}: {
  task: Task;
  allTasks: Task[];
  msgs?: ChatMsg[];
  onSend: (t: string) => void;
  onClose: () => void;
  onApply: (patch: Partial<Task>, action: string, detail: string, msg: string, close?: boolean) => void;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [mode, setMode] = useState<ChatMode>("auto");
  const { me: mgr, inScope } = usePersona();
  const [person, setPerson] = useState("");
  const [support, setSupport] = useState<string[]>(task.support ?? []);
  const [text, setText] = useState("");

  const guest = GUESTS.find((g) => g.name === task.guest);
  const prefs = PREFS[task.guest];
  const previous = allTasks.filter((t) => t.guest === task.guest && t.id !== task.id && inScope(t.dept));
  const thread = msgs ?? seedThread(task);
  const closed = task.status === "Completed" || task.status === "Unable to Complete";
  const summary =
    task.summary ??
    `${task.guest} (Room ${task.room}) asked for “${task.title.toLowerCase()}” via ${task.source.toLowerCase()}. It's ${task.status.toLowerCase()} with ${task.dept}${task.owner ? `, owned by ${task.owner}` : " and has no owner yet"}.`;

  const open = (p: Panel) => {
    setPanel((cur) => (cur === p ? null : p));
    setText("");
    setPerson("");
  };
  const me = `${mgr.name} (${mgr.role})`;
  const teamMates = (STAFF[task.dept] ?? []).filter((s) => s !== task.owner);

  const btn = (p: Exclude<Panel, null>, label: string) => (
    <button
      onClick={() => open(p)}
      disabled={closed}
      className={`rounded-lg border px-3 py-1.5 text-[12px] font-semibold disabled:opacity-40 ${
        panel === p ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Overlay onClose={onClose} wide>
      <div className="flex items-start gap-3 border-b border-line px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px] font-bold leading-tight text-ink">{task.title}</h2>
            {task.vip && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">VIP</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-secondary">
            <span>{task.dept}</span>
            <span>Room {task.room}</span>
            <span>via {task.source}</span>
            <StatusLabel s={task.status} />
            {task.escalatedTo && <span className="font-medium text-red-600">Escalated to {task.escalatedTo}</span>}
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-[11px] text-ink-tertiary">Assigned to</div>
            <div className="mt-1 text-[13px] font-medium text-ink">
              {task.owner ?? <span className="text-brand">Unassigned</span>}
              {!!task.support?.length && <span className="ml-1 font-normal text-ink-secondary">+ {task.support.join(", ")}</span>}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-ink-tertiary">Priority</div>
            <div className="mt-1"><PriorityLabel p={task.priority} /></div>
          </div>
          <div>
            <div className="text-[11px] text-ink-tertiary">SLA</div>
            <div className="mt-1"><SlaText sla={task.sla} /></div>
          </div>
          <div>
            <div className="text-[11px] text-ink-tertiary">Status</div>
            <div className="mt-1">
              {closed ? (
                <StatusLabel s={task.status} />
              ) : (
                <select
                  value={task.status}
                  aria-label="Task status"
                  onChange={(e) => {
                    const st = e.target.value as Status;
                    onApply({ status: st }, "Status changed", `${task.status} → ${st}`, `Status set to ${st}`);
                  }}
                  className="h-8 rounded-lg border border-line bg-white px-2 text-[13px] text-ink outline-none focus:border-brand"
                >
                  {(["Pending", "In Progress", "Escalated"] as Status[]).map((st) => <option key={st}>{st}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>

        {task.escalation && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-100 bg-red-50/40 px-3.5 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <div className="text-[13px] leading-snug text-ink"><span className="font-semibold">Escalated · </span>{task.escalation}</div>
          </div>
        )}
        {task.resolution && (
          <div className="rounded-lg bg-subtle px-3.5 py-3 text-[13px] text-ink">
            <span className="font-semibold">Closed by management · </span>{task.resolution}
          </div>
        )}

        {/* intervention */}
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">Intervene</div>
          <div className="flex flex-wrap gap-2">
            {btn("reassign", "Reassign")}
            {btn("support", "Add support")}
            {btn("note", "Add note")}
            {btn("escalate", "Escalate to GM")}
          </div>

          {panel === "reassign" && (
            <PanelBox title={`Reassign to another ${task.dept} team member`} ok="Reassign" disabled={!person} onCancel={() => setPanel(null)}
              onOk={() => {
                onApply({ owner: person }, "Reassigned", `${task.owner ?? "Unassigned"} → ${person} (${task.dept})`, `Reassigned to ${person}`);
                setPanel(null);
              }}>
              <Select value={person} onChange={(e) => setPerson(e.target.value)}>
                <option value="">Select staff member</option>
                {teamMates.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </PanelBox>
          )}

          {panel === "support" && (
            <PanelBox title={`Add support from ${task.dept}`} ok="Add" disabled={support.length === (task.support ?? []).length && support.every((s) => task.support?.includes(s))} onCancel={() => setPanel(null)}
              onOk={() => {
                onApply({ support }, "Support added", support.join(", "), "Support staff added");
                setPanel(null);
              }}>
              <div className="grid max-h-36 grid-cols-3 gap-x-3 gap-y-1.5 overflow-y-auto">
                {teamMates.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-[13px] text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand"
                      checked={support.includes(s)}
                      onChange={(e) => setSupport((cur) => (e.target.checked ? [...cur, s] : cur.filter((x) => x !== s)))}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </PanelBox>
          )}

          {panel === "note" && (
            <PanelBox title="Management note" ok="Save note" disabled={!text.trim()} onCancel={() => setPanel(null)}
              onOk={() => {
                onApply({ notes: [{ author: me, text: text.trim(), time: "Just now" }, ...(task.notes ?? [])] }, "Note added", text.trim(), "Note added");
                setPanel(null);
              }}>
              <Textarea rows={2} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Visible to managers only…" />
            </PanelBox>
          )}

          {panel === "escalate" && (
            <PanelBox title="Escalate to General Manager" ok="Escalate" disabled={!text.trim()} onCancel={() => setPanel(null)}
              onOk={() => {
                onApply({ status: "Escalated", escalatedTo: "General Manager", escalation: text.trim() }, "Escalated to GM", text.trim(), "Escalated to General Manager");
                setPanel(null);
              }}>
              <Textarea rows={2} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Why does this need the General Manager?" />
            </PanelBox>
          )}

          {panel === "unable" && (
            <PanelBox title="Mark as unable to complete" ok="Mark unable" disabled={!text.trim()} onCancel={() => setPanel(null)}
              onOk={() => {
                onApply({ status: "Unable to Complete", resolution: text.trim() }, "Marked unable to complete", `Reason: ${text.trim()}`, "Marked unable to complete", true);
              }}>
              <Textarea rows={2} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Reason (required) — recorded in the audit trail" />
            </PanelBox>
          )}

          {panel === "override" && (
            <PanelBox title="Close / override this task" ok="Close task" disabled={!text.trim()} onCancel={() => setPanel(null)}
              onOk={() => {
                onApply({ status: "Completed", sla: { kind: "met", text: "Overridden" }, resolution: text.trim() }, "Override closed", `Reason: ${text.trim()}`, "Task closed with override", true);
              }}>
              <Textarea rows={2} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Reason (required) — recorded in the audit trail" />
            </PanelBox>
          )}
        </div>

        {/* guest context */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" /> Guest context — {task.guest}
          </div>
          <p className="text-[13px] leading-relaxed text-ink">{summary}</p>

          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl border border-line p-3.5 text-[13px] sm:grid-cols-4">
            <div><div className="text-[11px] text-ink-tertiary">Room</div><div className="font-medium text-ink">{task.room}{guest ? ` · ${guest.roomType}` : ""}</div></div>
            <div><div className="text-[11px] text-ink-tertiary">Check-in</div><div className="font-medium text-ink">{guest ? guest.from : "—"}</div></div>
            <div><div className="text-[11px] text-ink-tertiary">Check-out</div><div className="font-medium text-ink">{guest ? guest.to : "—"}</div></div>
            <div><div className="text-[11px] text-ink-tertiary">Stay</div><div className="font-medium text-ink">{guest ? `${guest.nights} nights` : "—"}</div></div>
            <div className="col-span-full text-[11px] text-ink-tertiary">Synced from PMS</div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 text-[11px] text-ink-tertiary">Preferences</div>
            {prefs ? (
              <div className="flex flex-wrap gap-1.5">
                {prefs.map((p) => <span key={p} className="rounded-md bg-subtle px-2.5 py-1 text-[12px] text-ink-secondary">{p}</span>)}
              </div>
            ) : (
              <p className="text-[13px] text-ink-tertiary">No preferences on file.</p>
            )}
          </div>

          <div className="mt-3">
            <div className="mb-1.5 text-[11px] text-ink-tertiary">Previous tasks this stay</div>
            {previous.length ? (
              previous.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-line/70 py-1.5 text-[13px] last:border-0">
                  <span className="text-ink">{t.title}</span>
                  <StatusLabel s={t.status} />
                </div>
              ))
            ) : (
              <p className="text-[13px] text-ink-tertiary">None.</p>
            )}
          </div>
        </div>

        {!!task.notes?.length && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">Management notes</div>
            <div className="space-y-2">
              {task.notes.map((n, i) => (
                <div key={i} className="rounded-lg bg-subtle p-3">
                  <p className="text-[13px] leading-snug text-ink">{n.text}</p>
                  <p className="mt-1 text-[11px] text-ink-tertiary">{n.author} · {n.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {task.source === "Guest Chat" && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">Conversation</div>
            <div className="overflow-hidden rounded-xl border border-line">
              <GuestChat className="h-[300px]" name={task.guest} msgs={thread} mode={mode} setMode={setMode} onSend={onSend} emptyText="No messages yet." />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-line px-6 py-3.5">
        <Button variant="outline" onClick={() => open("unable")} disabled={closed}>Unable to complete</Button>
        <Button className="ml-auto" onClick={() => open("override")} disabled={closed}>
          <Check className="h-4 w-4" /> {closed ? "Closed" : "Close / override"}
        </Button>
      </div>
    </Overlay>
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
  const [owner, setOwner] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [sla, setSla] = useState("30 min");
  const [details, setDetails] = useState("");

  const valid = title.trim() && guest.trim();

  const submit = () => {
    if (!valid) return;
    onCreate({
      title: title.trim(),
      guest: guest.trim(),
      room: room.trim() || "—",
      dept,
      owner: owner || STAFF[dept][0],
      priority,
      sla: { kind: "left", text: `${sla} left` },
      status: "Pending",
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
          <Field label="Guest" required>
            <Input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Guest name" />
          </Field>
          <Field label="Room">
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="1608" />
          </Field>
        </div>

        <Field label="What needs to be done?" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Extra pillows, AC check, airport pickup" autoFocus />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Department">
            <Select value={dept} onChange={(e) => { setDept(e.target.value); setOwner(""); }}>
              {deptOptions.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Assign to">
            <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
              <option value="">Auto-assign (ALFON)</option>
              {STAFF[dept].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-[1fr_150px] gap-3">
          <div>
            <div className="mb-1.5 text-[13px] font-medium text-ink">Priority</div>
            <div className="flex rounded-lg bg-subtle p-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium ${
                    priority === p ? "bg-white text-ink shadow-sm" : "text-ink-secondary"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[p]}`} /> {p}
                </button>
              ))}
            </div>
          </div>
          <Field label="Complete within">
            <Select value={sla} onChange={(e) => setSla(e.target.value)}>
              {SLA_OPTS.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Details" hint="Optional — shared with the assignee.">
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
