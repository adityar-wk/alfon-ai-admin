import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ArrowUp,
  ArrowDown,
  Search,
  MessageCircle,
  MessageSquare,
  Plus,
  UserRound,
  Lock,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Drawer } from "../components/Drawer";
import { BarChart } from "../components/BarChart";
import { Card, Button, Field, Input, Select, Modal, RoomNo, StatCard } from "../components/ui";
import { TASKS, assignTask, shortName } from "../data/tasks";
import { usePersona, canonDept } from "../persona";
import { ScopePicker } from "../components/ScopePicker";
import { INITIAL, SHIFT_TIME, TINTS, type Staff, type ShiftName } from "../data/staff";
import { DEPARTMENTS } from "../data/departments";

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

const DEPT_CHIPS = DEPARTMENTS.map((d) => d.name);

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function Avatar({ s, size = 36 }: { s: Staff; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-display text-[12px] font-semibold ${s.tint}`}
      style={{ width: size, height: size, fontSize: size > 40 ? 18 : 12 }}
    >
      {initials(s.name)}
    </span>
  );
}

/** deterministic per-staff performance numbers, shared by the Team table and the Staff Details drawer */
function perfOf(s: Staff) {
  const n = Number(s.id.replace(/\D/g, ""));
  const tasksDone = 20 + n;
  const avgTime = 14 + n * 2;
  const trendPct = ((n * 13) % 21) - 6;
  return { tasksDone, avgTime, trendPct };
}

function TrendCell({ pct }: { pct: number }) {
  if (pct > 0) return <span className="whitespace-nowrap text-[14px] font-medium text-[#22C55E]">↑ +{pct}%</span>;
  if (pct < 0) return <span className="whitespace-nowrap text-[14px] font-medium text-brand">↓ {pct}%</span>;
  return <span className="whitespace-nowrap text-[14px] font-medium text-ink-tertiary">→ 0%</span>;
}

export default function Team() {
  const [staff, setStaff] = useState<Staff[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All Departments");
  const [selected, setSelected] = useState<Staff | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
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
  const permsOf = (st: Staff): Perms => PRESETS[presetFor(st)];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = staff.filter(
      (s) =>
        inScope(s.dept) &&
        (!q || [s.name, s.role, s.dept].some((v) => v.toLowerCase().includes(q))) &&
        (dept === "All Departments" || canonDept(s.dept) === canonDept(dept)),
    );
    return r;
  }, [staff, query, dept, scopeDepts, manager]);

  const filtered = !!query || dept !== "All Departments";
  const scoped = staff.filter((s) => inScope(s.dept));
  const total = manager ? scoped.length : 63 + (staff.length - INITIAL.length);
  const STATS = manager
    ? [
        { label: "Total Staff", value: total, foot: scopeDepts.join(" + "), icon: Users },
        { label: "Tasks Completed Today", value: scoped.reduce((n, s) => n + perfOf(s).tasksDone, 0), foot: undefined, icon: CheckCircle2 },
        { label: "Avg Response Time", value: "2m 45s", foot: undefined, icon: MessageCircle },
      ]
    : [
        { label: "Team Members", value: total, foot: undefined, icon: Users },
        { label: "Tasks Completed Today", value: staff.reduce((n, s) => n + perfOf(s).tasksDone, 0), foot: undefined, icon: CheckCircle2 },
        { label: "Avg Response Time", value: "2m 45s", foot: undefined, icon: MessageCircle },
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
        <main className="flex-1 overflow-y-auto bg-page">
        <div className="px-8 pb-8 pt-7">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {STATS.map((s) => (
              <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} foot={s.foot} />
            ))}
          </div>

          <div className="mt-7 space-y-3">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search staff by name, role, department…"
                className="h-10 w-full rounded-control border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", ...DEPT_CHIPS].map((d) => {
                const on = d === "All" ? dept === "All Departments" : dept === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDept(d === "All" ? "All Departments" : d)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-px ${
                      on ? "bg-brand text-white" : "border border-line bg-white text-ink-secondary hover:bg-subtle"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <Card table className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] table-fixed text-left">
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">

                    <th className="py-3.5 pl-6 font-medium">Staff Member</th>
                    <th className="py-3.5 pl-6 font-medium">Role</th>
                    <th className="py-3.5 pl-6 font-medium">Department</th>
                    <th className="py-3.5 pl-6 font-medium">Tasks Done</th>
                    <th className="py-3.5 pl-6 font-medium">Avg Time</th>
                    <th className="py-3.5 pl-6 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const perf = perfOf(s);
                    return (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className={`cursor-pointer border-b border-line/50 ${
                        selected?.id === s.id ? "bg-brand-tint/40" : "hover:bg-subtle/60"
                      }`}
                    >

                      <td className="py-3.5 pl-6 pr-3">
                        <span className="flex items-center gap-3">
                          <Avatar s={s} />
                          <span className="text-[14px] font-medium text-ink">{s.name}</span>
                        </span>
                      </td>
                      <td className="text-[14px] text-ink-secondary py-3.5 pl-6 pr-3">{s.role}</td>
                      <td className="text-[14px] text-ink-secondary py-3.5 pl-6 pr-3">{s.dept}</td>
                      <td className="text-[14px] text-ink-secondary py-3.5 pl-6 pr-3">{perf.tasksDone} tasks</td>
                      <td className="text-[14px] text-ink-secondary py-3.5 pl-6 pr-3">{perf.avgTime} min</td>
                      <td className="py-3.5 pl-6 pr-3"><TrendCell pct={perf.trendPct} /></td>
                    </tr>
                    );
                  })}
                  {!rows.length && (
                    <tr>
                      <td colSpan={6} className="text-center text-[14px] text-ink-tertiary py-3.5 pl-6 pr-3">
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
        </div>
        </main>
      </div>

      {selected && (
        <Drawer
          title="Staff Details"
          width={400}
          onClose={() => setSelected(null)}
        >
          <StaffDetails key={selected.id} s={selected} perms={permsOf(selected)} manager={manager} />
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

export function StaffDetails({ s, perms, manager }: { s: Staff; perms: Perms; manager?: boolean }) {
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
          </div>
          <div className="mt-1 text-[13px] text-ink-secondary">
            {s.role} • {s.dept}
          </div>
          {s.phone && (
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-secondary">
              <Phone className="h-3.5 w-3.5 text-ink-tertiary" /> {s.phone}
            </div>
          )}
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

      {tab === "Access" && <AccessEditor saved={perms} />}

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
                  {t.dept} · {t.guest} · <RoomNo room={t.room} />
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

/** view-only — access levels are set by Alfon Super Admin and can't be changed by a Mid Manager or General Manager here */
function AccessEditor({ saved }: { saved: Perms }) {
  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-subtle px-3 py-2 text-[12px] text-ink-secondary">
        <Lock className="h-3.5 w-3.5 shrink-0 text-ink-tertiary" />
        View only — access levels are managed by Alfon Super Admin.
      </div>
      <div className="overflow-hidden rounded-xl border border-line">
        <div className="grid grid-cols-[1fr_52px_52px] items-center gap-2 border-b border-line bg-subtle/50 px-3 py-2 text-[11px] font-medium text-ink-secondary">
          <span>Module</span>
          <span className="text-center">View</span>
          <span className="text-center">Edit</span>
        </div>
        {MODULES.map((m) => (
          <div key={m.key} className="grid grid-cols-[1fr_52px_52px] items-center gap-2 border-b border-line/70 px-3 py-2.5 last:border-0">
            <div className="leading-tight">
              <div className="text-[13px] font-medium text-ink">{m.label}</div>
              <div className="text-[11px] text-ink-tertiary">{m.hint}</div>
            </div>
            <span className="flex justify-center">
              <input type="checkbox" aria-label={`${m.label} view`} className="h-4 w-4 accent-ink-tertiary" checked={saved[m.key].view} disabled readOnly />
            </span>
            <span className="flex justify-center">
              <input type="checkbox" aria-label={`${m.label} edit`} className="h-4 w-4 accent-ink-tertiary" checked={saved[m.key].edit} disabled readOnly />
            </span>
          </div>
        ))}
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
  const [dept, setDept] = useState(DEPT_CHIPS[0]);
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
            {DEPT_CHIPS.map((d) => (
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
