import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowUp,
  ChevronDown,
  Filter,
  Search,
  MoreHorizontal,
  MessageCircle,
  MessageSquare,
  Plus,
  UserRound,
  Circle,
  ShieldCheck,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Drawer } from "../components/Drawer";
import { BarChart } from "../components/BarChart";
import { Page, Card, Button, Field, Input, Select, Modal } from "../components/ui";
import { TASKS, assignTask, shortName } from "../data/tasks";
import { usePersona, canonDept } from "../persona";
import { ScopePicker } from "../components/ScopePicker";
import { INITIAL, SHIFT_TIME, TINTS, type Staff, type Status, type ShiftName } from "../data/staff";

const STATUS_STYLE: Record<Status, string> = {
  "On Duty": "bg-emerald-50 text-emerald-600",
  "On Break": "bg-amber-50 text-amber-600",
  "Off Duty": "bg-red-50 text-red-600",
};

const SKILLS: Record<string, string[]> = {
  Engineering: ["HVAC", "Electrical", "Plumbing", "+2"],
  Housekeeping: ["Deep Clean", "Linen", "Inspection"],
  "Guest Services": ["Guest Care", "Languages", "Complaints"],
  "Front Desk": ["PMS", "Check-in", "Upselling"],
  "F&B": ["Service", "Allergens", "POS"],
  Security: ["CCTV", "First Aid", "Access Control"],
  Concierge: ["Bookings", "Local Guide", "Guest Care"],
};

const LOCATION: Record<string, string> = {
  Engineering: "Floor 14",
  Housekeeping: "Floor 12",
  "Guest Services": "Lobby",
  "Front Desk": "Lobby",
  "F&B": "Restaurant",
  Security: "Control Room",
  Concierge: "Lobby",
};

/* ---------- access control ---------- */

const MODULES = [
  { key: "tasks", label: "Tasks", hint: "Create, reassign, resolve" },
  { key: "prearrival", label: "Pre-Arrival", hint: "Arrivals & consent" },
  { key: "guests", label: "Guests & Chat", hint: "Profiles, reply to guests" },
  { key: "team", label: "Team", hint: "Staff & shifts" },
  { key: "housekeeping", label: "Housekeeping", hint: "Room status board" },
  { key: "departments", label: "Departments", hint: "Services, SLAs" },
  { key: "analytics", label: "Analytics & Reports", hint: "Insights, exports" },
  { key: "settings", label: "Settings", hint: "Hotel, integrations" },
] as const;

type ModKey = (typeof MODULES)[number]["key"];
export type Perms = Record<ModKey, { view: boolean; edit: boolean }>;

const mkPerms = (view: ModKey[], edit: ModKey[]): Perms =>
  Object.fromEntries(MODULES.map((m) => [m.key, { view: view.includes(m.key) || edit.includes(m.key), edit: edit.includes(m.key) }])) as Perms;

export const ALL = MODULES.map((m) => m.key) as ModKey[];

export const PRESETS: Record<string, Perms> = {
  Admin: mkPerms(ALL, ALL),
  Manager: mkPerms(ALL, ["tasks", "prearrival", "guests", "team", "housekeeping"]),
  Staff: mkPerms(["tasks", "guests", "housekeeping"], ["tasks"]),
  "View only": mkPerms(["tasks", "prearrival", "guests", "team", "housekeeping", "analytics"], []),
};

export function presetFor(s: Staff): string {
  return /supervisor|manager|head/i.test(s.role) ? "Manager" : "Staff";
}

const samePerms = (a: Perms, b: Perms) => ALL.every((k) => a[k].view === b[k].view && a[k].edit === b[k].edit);

export function levelOf(p: Perms): string {
  return Object.keys(PRESETS).find((n) => samePerms(PRESETS[n], p)) ?? "Custom";
}

const clonePerms = (p: Perms): Perms => JSON.parse(JSON.stringify(p));

const DEPT_OPTIONS = ["Housekeeping", "Engineering", "Guest Services", "Front Desk", "F&B", "Security", "Concierge"];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function Avatar({ s, size = 36 }: { s: Staff; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${s.tint}`}
      style={{ width: size, height: size, fontSize: size > 40 ? 18 : 12 }}
    >
      {initials(s.name)}
    </span>
  );
}

export function StatusPill({ s }: { s: Status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium ${STATUS_STYLE[s]}`}>{s}</span>
  );
}

type GroupBy = "none" | "dept" | "shift" | "availability";

export default function Team() {
  const [staff, setStaff] = useState<Staff[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [status, setStatus] = useState("All Statuses");
  const [shift, setShift] = useState("All Shifts");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [access, setAccess] = useState<Record<string, Perms>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [, bump] = useState(0);
  const navigate = useNavigate();
  const { manager, scopeDepts, me } = usePersona();
  const inScope = (d: string) => !manager || scopeDepts.includes(canonDept(d));
  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };
  const permsOf = (st: Staff): Perms => access[st.id] ?? PRESETS[presetFor(st)];
  const saveAccess = (st: Staff, p: Perms) => {
    setAccess((a) => ({ ...a, [st.id]: p }));
    setToast(`Access updated for ${st.name}`);
    window.setTimeout(() => setToast(null), 1800);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = staff.filter(
      (s) =>
        inScope(s.dept) &&
        (!q || [s.name, s.role, s.dept, s.id].some((v) => v.toLowerCase().includes(q))) &&
        (dept === "All Departments" || s.dept === dept) &&
        (status === "All Statuses" || s.status === status) &&
        (shift === "All Shifts" || s.shift === shift),
    );
    if (groupBy === "dept") r = [...r].sort((a, b) => a.dept.localeCompare(b.dept));
    if (groupBy === "shift") {
      const order: ShiftName[] = ["Morning", "Afternoon", "Night"];
      r = [...r].sort((a, b) => order.indexOf(a.shift) - order.indexOf(b.shift));
    }
    if (groupBy === "availability") {
      const order: Status[] = ["On Duty", "On Break", "Off Duty"];
      r = [...r].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
    }
    return r;
  }, [staff, query, dept, status, shift, groupBy, scopeDepts, manager]);

  const activeFilters =
    Number(dept !== "All Departments") + Number(status !== "All Statuses") + Number(shift !== "All Shifts") + Number(groupBy !== "none");
  const filtered = !!query || activeFilters > 0;
  const clearFilters = () => {
    setDept("All Departments");
    setStatus("All Statuses");
    setShift("All Shifts");
    setGroupBy("none");
  };
  const scoped = staff.filter((s) => inScope(s.dept));
  const total = manager ? scoped.length : 63 + (staff.length - INITIAL.length);
  const onDuty = manager ? scoped.filter((s) => s.status === "On Duty").length : 48;
  const onBreak = manager ? scoped.filter((s) => s.status === "On Break").length : 10;
  const off = manager ? scoped.filter((s) => s.status === "Off Duty").length : 5;
  const pct = (n: number) => `${Math.round((n / Math.max(total, 1)) * 100)}%`;

  const STATS = manager
    ? [
        { label: "Total Staff", value: total, foot: scopeDepts.join(" + ") },
        { label: "On Duty", value: onDuty, foot: `${pct(onDuty)} of total` },
        { label: "On Break", value: onBreak, foot: `${pct(onBreak)} of total` },
        { label: "Off Duty", value: off, foot: `${pct(off)} of total` },
      ]
    : [
        { label: "Total Staff", value: total, foot: "Across all departments" },
        { label: "Departments", value: new Set(staff.map((x) => x.dept)).size, foot: "With staff assigned" },
      ];

  const toggle = (id: string) =>
    setChecked((c) => {
      const n = new Set(c);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const addStaff = (f: { name: string; role: string; dept: string; shift: ShiftName }) => {
    const n = staff.length + 1;
    const s: Staff = {
      id: `#EMP${String(n).padStart(3, "0")}`,
      name: f.name,
      role: f.role || "Staff",
      dept: f.dept,
      status: "On Duty",
      task: null,
      shift: f.shift,
      tint: TINTS[n % TINTS.length],
    };
    setStaff((st) => [...st, s]);
    setSelected(s);
    setAdding(false);
  };

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Team"
          actions={manager ? <ScopePicker /> : undefined}
        />
        <Page>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {STATS.map((s) => (
              <Card key={s.label} className="p-4">
                <div className="text-[13px] text-ink-secondary">{s.label}</div>
                <div className="mt-1 text-[26px] font-bold leading-tight text-ink">{s.value}</div>
                <div className="text-[12px] text-ink-tertiary">{s.foot}</div>
              </Card>
            ))}
          </div>

          <Card className="mt-5">
            <div className="relative flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search staff by name, role, department…"
                  className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
                />
              </div>

              <div className="flex items-center gap-3">
                {activeFilters > 0 && (
                  <button onClick={clearFilters} className="text-[13px] font-medium text-brand">
                    Clear filters
                  </button>
                )}
                <button
                  onClick={() => setFiltersOpen((o) => !o)}
                  aria-label="Filters"
                  className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${
                    filtersOpen || activeFilters
                      ? "border-brand bg-brand-tint text-brand"
                      : "border-line bg-white text-ink-secondary hover:bg-subtle"
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
                <div className="absolute right-4 top-14 z-30 w-[360px] rounded-card border border-line bg-white p-4 shadow-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1 block text-[11px] text-ink-secondary">Department</span>
                      <Select className="h-9 text-[13px]" value={dept} onChange={(e) => setDept(e.target.value)}>
                        <option>All Departments</option>
                        {DEPT_OPTIONS.filter(inScope).map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </Select>
                    </label>
                    {manager && <label className="block">
                      <span className="mb-1 block text-[11px] text-ink-secondary">Availability</span>
                      <Select className="h-9 text-[13px]" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option>All Statuses</option>
                        <option>On Duty</option>
                        <option>On Break</option>
                        <option>Off Duty</option>
                      </Select>
                    </label>}
                    <label className="block">
                      <span className="mb-1 block text-[11px] text-ink-secondary">Sort / group by</span>
                      <Select className="h-9 text-[13px]" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>
                        <option value="none">None</option>
                        <option value="dept">Department</option>
                        {manager && <option value="availability">Availability</option>}
                      </Select>
                    </label>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[12px] text-ink-secondary">
                    <span>{rows.length} staff match</span>
                    <button onClick={() => setFiltersOpen(false)} className="font-semibold text-brand">
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-line text-[11px] tracking-wide text-ink-secondary">
                    
                    <th className="py-3 pl-4 font-medium">Staff Member</th>
                    <th className="py-3 font-medium">Role</th>
                    <th className="py-3 font-medium">Department</th>
                    {manager && <th className="py-3 font-medium">Status</th>}
                    <th className="py-3 font-medium">Current Task</th>
                    {manager && <th className="py-3 font-medium">Open tasks</th>}
                    <th className="py-3 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className={`cursor-pointer border-b border-line/70 ${
                        selected?.id === s.id ? "bg-brand-tint/40" : "hover:bg-subtle/60"
                      }`}
                    >
                      
                      <td className="py-3 pl-4 pr-3">
                        <span className="flex items-center gap-3">
                          <Avatar s={s} />
                          <span className="leading-tight">
                            <span className="block text-[13px] font-semibold text-ink">{s.name}</span>
                            <span className="text-[11px] text-ink-tertiary">{s.id}</span>
                          </span>
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-[13px] text-ink-secondary">{s.role}</td>
                      <td className="py-3 pr-3 text-[13px] text-ink-secondary">{s.dept}</td>
                      {manager && (
                        <td className="py-3 pr-3">
                          <StatusPill s={s.status} />
                        </td>
                      )}
                      <td className="py-3 pr-3 text-[13px] text-ink-secondary">{s.task ?? "—"}</td>
                      {manager && (
                        <td className="whitespace-nowrap py-3 pr-3 leading-tight">
                          <WorkloadCell s={s} />
                        </td>
                      )}
                      <td className="py-3 pr-4">
                        <MoreHorizontal className="h-4 w-4 text-ink-tertiary" />
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={manager ? 7 : 5} className="py-10 text-center text-[13px] text-ink-tertiary">
                        No staff match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-[12px] text-ink-secondary">
              <span>
                Showing 1 to {rows.length} of {filtered ? rows.length : total} staff members
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <button className="rounded-md border border-line px-2 py-1">‹</button>
                  {["1", "2", "3"].map((p) => (
                    <button
                      key={p}
                      className={`rounded-md border px-2.5 py-1 ${p === "1" ? "border-brand text-brand" : "border-line"}`}
                    >
                      {p}
                    </button>
                  ))}
                  <span className="px-1">…</span>
                  <button className="rounded-md border border-line px-2.5 py-1">7</button>
                  <button className="rounded-md border border-line px-2 py-1">›</button>
                </span>
                <div className="w-32">
                  <Select className="h-8 text-[12px]" defaultValue="10">
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        </Page>
      </div>

      {selected && (
        <Drawer
          title="Staff Details"
          width={400}
          onClose={() => setSelected(null)}
        >
          <StaffDetails key={selected.id} s={selected} perms={permsOf(selected)} onSaveAccess={(p) => saveAccess(selected, p)} manager={manager} />
        </Drawer>
      )}

      {assigning && selected && (
        <AddTaskModal
          staff={selected}
          onClose={() => setAssigning(false)}
          onAssign={(id, title) => {
            assignTask(id, shortName(selected.name));
            bump((n) => n + 1);
            flash(`“${title}” assigned to ${selected.name}`);
          }}
          onCreate={() => navigate("/tasks?new=1")}
          scoped={manager ? (d) => inScope(d) : undefined}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}

      {adding && <AddStaffModal onClose={() => setAdding(false)} onAdd={addStaff} />}
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3 border-b border-line/70 py-2.5 text-[13px]">
      <span className="text-ink-secondary">{label}</span>
      <span className="text-ink">{children}</span>
    </div>
  );
}

const DETAIL_TABS = ["Performance", "Access"] as const;

export function StaffDetails({ s, perms, onSaveAccess, manager }: { s: Staff; perms: Perms; onSaveAccess: (p: Perms) => void; manager?: boolean }) {
  const [tab, setTab] = useState<(typeof DETAIL_TABS)[number]>("Performance");
  const first = s.name.split(" ")[0].toLowerCase();
  const last = s.name.split(" ").slice(-1)[0].toLowerCase();
  const n = Number(s.id.replace(/\D/g, ""));
  // names of the tasks this person has completed
  const done = TASKS.filter((t) => t.owner === shortName(s.name) && t.status === "Completed").map((t) => t.title);
  const taskRows = Array.from(new Set([...done, `${s.dept} inspection round`, "Shift handover", "Restocking supplies"])).slice(0, 6);
  const week = [9, 13, 11, 15, 8, 6, 5].map((v, i) => v + ((n + i) % 3));
  const shiftDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="-mt-1">
      <div className="flex items-center gap-4">
        <Avatar s={s} size={64} />
        <div className="leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-bold text-ink">{s.name}</span>
            {manager !== false && <StatusPill s={s.status} />}
          </div>
          <div className="mt-1 text-[13px] text-ink-secondary">{s.id}</div>
          <div className="text-[13px] text-ink-secondary">
            {s.role} • {s.dept}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-6 border-b border-line">
        {DETAIL_TABS.filter((t) => !(manager && t === "Access")).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-1 pb-2.5 text-[13px] font-medium ${
              t === tab ? "border-brand text-brand" : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Access" && <AccessEditor saved={perms} onSave={onSaveAccess} />}

      {tab === "Performance" && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Tasks Completed", `${20 + n}`],
              ["Avg Completion", `${14 + n * 2} min`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-line p-3">
                <div className="text-[11px] text-ink-secondary">{l}</div>
                <div className="mt-1 text-[16px] font-bold text-ink">{v}</div>
              </div>
            ))}
          </div>
          <div className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
            This Week
          </div>
          <div className="rounded-xl border border-line p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-[22px] font-bold leading-none text-ink">{week.reduce((a, b) => a + b, 0)}</span>
              <span className="text-[12px] text-ink-tertiary">tasks this week</span>
            </div>
            <div className="flex h-[132px] items-end gap-2.5 border-b border-line/80">
              {shiftDays.map((d, i) => {
                const top = Math.max(...week);
                const today = i === (new Date().getDay() + 6) % 7;
                return (
                  <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${d}: ${week[i]} tasks`}>
                    <span className={`text-[11px] font-semibold tabular-nums ${today ? "text-brand" : "text-ink-secondary"}`}>{week[i]}</span>
                    <div className={`w-full rounded-t-lg ${today ? "bg-brand" : "bg-brand/25"}`} style={{ height: `${(week[i] / top) * 78}%` }} />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2.5">
              {shiftDays.map((d, i) => (
                <span key={d} className={`flex-1 text-center text-[11px] ${i === (new Date().getDay() + 6) % 7 ? "font-semibold text-brand" : "text-ink-tertiary"}`}>{d}</span>
              ))}
            </div>
          </div>

          <div className="mb-1 mt-5 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Tasks completed</span>
            <span className="text-[13px] font-semibold text-ink">{20 + n}</span>
          </div>
          <div>
            {taskRows.map((t) => (
              <div key={t} className="border-b border-line/70 py-2.5 text-[13px] text-ink last:border-0">{t}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkloadCell({ s }: { s: Staff }) {
  const n = TASKS.filter((t) => t.owner === shortName(s.name) && t.status !== "Completed" && t.status !== "Unable to Complete" && t.status !== "Void").length + (s.task ? 1 : 0);
  const heavy = n >= 3;
  return (
    <>
      <div className={`text-[13px] ${heavy ? "font-semibold text-brand" : "text-ink"}`}>{n}</div>
      <div className="text-[11px] text-ink-tertiary">{heavy ? "High workload" : n === 0 ? "Available" : "Normal"}</div>
    </>
  );
}

const deptKey = (d: string) => (d === "F&B" ? "Food & Beverage" : d);

export function AddTaskModal({
  staff, onClose, onAssign, onCreate, scoped,
}: {
  scoped?: (dept: string) => boolean;
  staff: Staff;
  onClose: () => void;
  onAssign: (id: number, title: string) => void;
  onCreate: () => void;
}) {
  const open = TASKS.filter((t) => t.owner === null && t.status !== "Completed" && (!scoped || scoped(t.dept))).sort(
    (a, b) => Number(b.dept === deptKey(staff.dept)) - Number(a.dept === deptKey(staff.dept)),
  );
  return (
    <Modal
      title={`Add task for ${staff.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" /> Create new task
          </Button>
        </>
      }
    >
      <p className="mb-3 text-[12px] text-ink-secondary">Unassigned tasks waiting for an owner.</p>
      {open.length ? (
        <div className="divide-y divide-line/70 rounded-xl border border-line">
          {open.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[13px] font-medium text-ink">{t.title}</div>
                <div className="truncate text-[11px] text-ink-tertiary">
                  {t.dept} · {t.guest} · Room {t.room}
                  {t.dept === deptKey(staff.dept) && <span className="ml-1.5 font-medium text-brand">Same department</span>}
                </div>
              </div>
              <button
                onClick={() => onAssign(t.id, t.title)}
                className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink hover:border-brand hover:text-brand"
              >
                Assign
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-[13px] text-ink-tertiary">No unassigned tasks right now.</p>
      )}
    </Modal>
  );
}

function AccessEditor({ saved, onSave }: { saved: Perms; onSave: (p: Perms) => void }) {
  const [draft, setDraft] = useState<Perms>(() => clonePerms(saved));
  const dirty = !samePerms(draft, saved);
  const level = levelOf(draft);

  const toggle = (k: ModKey, f: "view" | "edit") =>
    setDraft((d) => {
      const cur = d[k];
      const next = { ...cur, [f]: !cur[f] };
      if (f === "edit" && next.edit) next.view = true; // editing implies viewing
      if (f === "view" && !next.view) next.edit = false;
      return { ...d, [k]: next };
    });

  const setAll = (f: "view" | "edit", on: boolean) =>
    setDraft((d) => Object.fromEntries(ALL.map((k) => [k, {
      view: f === "view" ? on : on ? true : d[k].view,
      edit: f === "edit" ? on : on ? d[k].edit : false,
    }])) as Perms);

  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-xl border border-line">
        <div className="grid grid-cols-[1fr_52px_52px] items-center gap-2 border-b border-line bg-subtle/50 px-3 py-2 text-[11px] font-medium text-ink-secondary">
          <span>Module</span>
          <label className="flex items-center justify-center gap-1">
            <input
              type="checkbox"
              aria-label="View all"
              className="h-3.5 w-3.5 accent-brand"
              checked={ALL.every((k) => draft[k].view)}
              onChange={(e) => setAll("view", e.target.checked)}
            />
            View
          </label>
          <label className="flex items-center justify-center gap-1">
            <input
              type="checkbox"
              aria-label="Edit all"
              className="h-3.5 w-3.5 accent-brand"
              checked={ALL.every((k) => draft[k].edit)}
              onChange={(e) => setAll("edit", e.target.checked)}
            />
            Edit
          </label>
        </div>
        {MODULES.map((m) => (
          <div key={m.key} className="grid grid-cols-[1fr_52px_52px] items-center gap-2 border-b border-line/70 px-3 py-2.5 last:border-0">
            <div className="leading-tight">
              <div className="text-[13px] font-medium text-ink">{m.label}</div>
              <div className="text-[11px] text-ink-tertiary">{m.hint}</div>
            </div>
            <span className="flex justify-center">
              <input
                type="checkbox"
                aria-label={`${m.label} view`}
                className="h-4 w-4 accent-brand"
                checked={draft[m.key].view}
                onChange={() => toggle(m.key, "view")}
              />
            </span>
            <span className="flex justify-center">
              <input
                type="checkbox"
                aria-label={`${m.label} edit`}
                className="h-4 w-4 accent-brand"
                checked={draft[m.key].edit}
                onChange={() => toggle(m.key, "edit")}
              />
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] text-ink-tertiary">Edit includes view access.</span>
        <div className="flex gap-2">
          {dirty && (
            <Button variant="outline" onClick={() => setDraft(clonePerms(saved))}>
              Reset
            </Button>
          )}
          <Button disabled={!dirty} className="disabled:opacity-40" onClick={() => onSave(clonePerms(draft))}>
            Save access
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddStaffModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (f: { name: string; role: string; dept: string; shift: ShiftName }) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [dept, setDept] = useState(DEPT_OPTIONS[0]);
  const [shift, setShift] = useState<ShiftName>("Morning");

  return (
    <Modal
      title="Add Staff"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!name.trim()} onClick={() => onAdd({ name: name.trim(), role: role.trim(), dept, shift })}>
            Add Staff
          </Button>
        </>
      }
    >
      <Field label="Full Name" required>
        <Input autoFocus placeholder="e.g. Aanya Sharma" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field className="mt-3" label="Role">
        <Input placeholder="e.g. Line Staff" value={role} onChange={(e) => setRole(e.target.value)} />
      </Field>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Department">
          <Select value={dept} onChange={(e) => setDept(e.target.value)}>
            {DEPT_OPTIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Shift">
          <Select value={shift} onChange={(e) => setShift(e.target.value as ShiftName)}>
            <option>Morning</option>
            <option>Afternoon</option>
            <option>Night</option>
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
