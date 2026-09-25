import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Headset,
  BedDouble,
  UtensilsCrossed,
  Wrench,
  Crown,
  ShieldCheck,
  ClipboardCheck,
  MessageCircle,
  Plane,
  BarChart3,
  FileText,
  Settings,
  X,
  Filter,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Drawer } from "../components/Drawer";
import { StaffDetails, AddTaskModal, Avatar, StatusPill, PRESETS, presetFor, levelOf, ALL, type Perms } from "./Team";
import { SHIFT_TIME, TINTS, type Staff } from "../data/staff";
import { assignTask, shortName } from "../data/tasks";
import { Page, Card, Button, Field, Input, Select, Textarea } from "../components/ui";
import {
  STORE,
  MODULES,
  DEPARTMENTS,
  PERSONA_TYPES,
  GUEST_DATA,
  TASK_VIS,
  CONVO,
  REPORT_ACC,
  SPECIAL_RULES,
  TEMPLATES,
  newRole,
  ROLE_DEPT_TO_STAFF,
  type Role,
  type ModuleKey,
  type User,
} from "../data/roles";

type Icon = React.ComponentType<{ className?: string }>;

const DEPT_ICON: Record<string, { icon: Icon; tone: string }> = {
  "Front Office": { icon: UserIcon, tone: "bg-orange-50 text-orange-500" },
  "Guest Services": { icon: Headset, tone: "bg-violet-50 text-violet-500" },
  Housekeeping: { icon: BedDouble, tone: "bg-emerald-50 text-emerald-500" },
  "F&B": { icon: UtensilsCrossed, tone: "bg-amber-50 text-amber-500" },
  Engineering: { icon: Wrench, tone: "bg-blue-50 text-blue-500" },
  Management: { icon: Crown, tone: "bg-amber-50 text-amber-500" },
  System: { icon: ShieldCheck, tone: "bg-blue-50 text-blue-500" },
};

const MODULE_ICON: Record<ModuleKey, Icon> = {
  tasks: ClipboardCheck,
  chats: MessageCircle,
  profiles: UserIcon,
  prearrival: Plane,
  housekeeping: BedDouble,
  analytics: BarChart3,
  reports: FileText,
  settings: Settings,
};

type Tab = "roles" | "users";
type EditTab = "basic" | "advanced" | "members";

// week-over-week change in tasks handled, shown per user
const TREND = [12, 8, 0, -5, 15, 3, 9, 6, 10, 2];

function Shell({ embedded, children }: { embedded: boolean; children: React.ReactNode }) {
  return embedded ? <div className="mt-2">{children}</div> : <Page>{children}</Page>;
}

export default function RolesPermissions({ embedded = false }: { embedded?: boolean }) {
  const [roles, setRoles] = useState<Role[]>(() => STORE.roles);
  const [users, setUsers] = useState<User[]>(() => STORE.users);
  const [tab, setTab] = useState<Tab>("roles");
  const [selectedId, setSelectedId] = useState(roles[0].id);
  const [editTab, setEditTab] = useState<EditTab>("basic");
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [draft, setDraft] = useState<Role>(() => structuredClone(roles[0]));
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    STORE.roles = roles;
    STORE.users = users;
  }, [roles, users]);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2000);
  };

  const countOf = (id: string) => users.filter((u) => u.roleId === id).length;
  const saved = roles.find((r) => r.id === selectedId) ?? roles[0];
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const select = (id: string) => {
    const r = roles.find((x) => x.id === id);
    if (!r) return;
    setSelectedId(id);
    setDraft(structuredClone(r));
    setActionsOpen(false);
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roles.filter((r) => (deptFilter === "All" || r.dept === deptFilter) && (!q || `${r.name} ${r.desc}`.toLowerCase().includes(q)));
  }, [roles, query, deptFilter]);

  const save = () => {
    setRoles((rs) => rs.map((r) => (r.id === draft.id ? structuredClone(draft) : r)));
    flash(`“${draft.name}” saved`);
  };

  const addRole = (r: Role) => {
    setRoles((rs) => [...rs, r]);
    setSelectedId(r.id);
    setDraft(structuredClone(r));
    setEditTab("basic");
    setTab("roles");
    setDeptFilter("All");
    setQuery("");
    window.setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const duplicate = () => {
    const copy = newRole({ ...structuredClone(saved), name: `${saved.name} (copy)` });
    addRole(copy);
    flash("Role duplicated");
  };

  const remove = () => {
    if (countOf(saved.id) > 0) {
      flash(`Reassign the ${countOf(saved.id)} users first`);
      return;
    }
    const rest = roles.filter((r) => r.id !== saved.id);
    setRoles(rest);
    setSelectedId(rest[0].id);
    setDraft(structuredClone(rest[0]));
    flash("Role deleted");
  };

  const viewUsers = () => {
    setEditTab("members");
    editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const moveUser = (id: number, roleId: string) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, roleId } : u)));
    flash(`Moved to ${roles.find((r) => r.id === roleId)?.name}`);
  };

  const set = <K extends keyof Role>(k: K, v: Role[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const cfg = DEPT_ICON[draft.dept];

  return (
    <>
      {!embedded && <Topbar title="Roles & Permissions" subtitle="Define what each role can access and do, and who belongs to it." />}
      <Shell embedded={embedded}>
        <div className="flex gap-6 border-b border-line">
          {([["roles", "Role Configuration"], ["users", "User Management"]] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`-mb-px border-b-2 pb-2.5 text-[14px] font-medium ${tab === k ? "border-brand text-brand" : "border-transparent text-ink-secondary hover:text-ink"}`}
            >
              {l}
            </button>
          ))}
        </div>

        {tab === "roles" ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(340px,0.9fr)_1.4fr]">
              {/* roles list */}
              <Card className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[17px] font-semibold text-ink">Roles</h2>
                    <p className="text-[12px] text-ink-secondary">Select a role to view or edit its permissions.</p>
                  </div>
                  <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> Create Role</Button>
                </div>
                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search roles…"
                    className="h-10 w-full rounded-lg border border-line bg-subtle pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand focus:bg-white"
                  />
                </div>
                <div className="mt-3">
                  <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} aria-label="Department">
                    <option value="All">All departments</option>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </Select>
                </div>
                <div className="mt-3 max-h-[560px] space-y-1 overflow-y-auto">
                  {visible.map((r) => {
                    const c = DEPT_ICON[r.dept];
                    const on = r.id === selectedId;
                    return (
                      <button
                        key={r.id}
                        onClick={() => select(r.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${on ? "bg-brand-tint/60" : "hover:bg-subtle"}`}
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.tone}`}><c.icon className="h-5 w-5" /></span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate text-[14px] font-semibold text-ink">{r.name}</span>
                          <span className="block truncate text-[12px] text-ink-secondary">{r.desc || "No description"}</span>
                        </span>
                        <span className="shrink-0 text-[12px] text-ink-secondary">{countOf(r.id)} users</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
                      </button>
                    );
                  })}
                  {!visible.length && <p className="py-8 text-center text-[13px] text-ink-tertiary">No roles match.</p>}
                </div>
              </Card>

              {/* editor */}
              <Card className="p-5" >
                <div ref={editorRef} />
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${cfg.tone}`}><cfg.icon className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[18px] font-semibold text-ink">{draft.name || "Untitled role"}</h2>
                    <p className="truncate text-[13px] text-ink-secondary">{draft.desc || "No description"}</p>
                  </div>
                  <div className="relative">
                    <button onClick={() => setActionsOpen((o) => !o)} className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink hover:bg-subtle">
                      Actions <ChevronDown className="h-4 w-4" />
                    </button>
                    {actionsOpen && (
                      <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-line bg-white p-1.5 shadow-lg">
                        <button onClick={() => { duplicate(); setActionsOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-ink hover:bg-subtle">Duplicate role</button>
                        <button onClick={() => { viewUsers(); setActionsOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-ink hover:bg-subtle">View users</button>
                        <button onClick={() => { setDraft(structuredClone(saved)); setActionsOpen(false); flash("Changes discarded"); }} className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-ink hover:bg-subtle">Discard changes</button>
                        <button onClick={() => { remove(); setActionsOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50">Delete role</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-6 border-b border-line">
                  {([["basic", "Basic Configuration"], ["advanced", "Advanced Settings"], ["members", `Members (${countOf(saved.id)})`]] as const).map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setEditTab(k)}
                      className={`-mb-px border-b-2 pb-2.5 text-[14px] font-medium ${editTab === k ? "border-brand text-brand" : "border-transparent text-ink-secondary hover:text-ink"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                {editTab === "basic" ? (
                  <div className="pt-5">
                    <h3 className="text-[15px] font-semibold text-ink">Role Details</h3>
                    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                      <Field label="Role Name"><Input value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field>
                      <Field label="Persona">
                        <Select value={draft.persona} onChange={(e) => set("persona", e.target.value as Role["persona"])}>
                          {PERSONA_TYPES.map((p) => <option key={p}>{p}</option>)}
                        </Select>
                      </Field>
                      <Field label="Description"><Textarea rows={3} value={draft.desc} onChange={(e) => set("desc", e.target.value)} /></Field>
                      <div>
                        <Field label="Department">
                          <Select value={draft.dept} onChange={(e) => set("dept", e.target.value as Role["dept"])}>
                            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                          </Select>
                        </Field>
                        <button onClick={viewUsers} className="mt-2 flex w-full items-center justify-end gap-1 text-[12px] font-medium text-brand hover:underline">
                          View {countOf(saved.id)} members <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-8 text-[15px] font-semibold text-ink">Module Access</h3>
                    <p className="text-[12px] text-ink-secondary">Choose the main modules this role can access.</p>
                    <div className="mt-2 grid grid-cols-1 gap-x-10 md:grid-cols-2">
                      {MODULES.map((m) => {
                        const I = MODULE_ICON[m.key];
                        const on = draft.modules[m.key];
                        return (
                          <label key={m.key} className="flex cursor-pointer items-center gap-3 border-b border-line/70 py-3">
                            <I className={`h-[18px] w-[18px] shrink-0 ${on ? "text-brand" : "text-ink-tertiary"}`} />
                            <span className="min-w-0 flex-1 leading-tight">
                              <span className="block text-[13px] font-medium text-ink">{m.label}</span>
                              <span className="block truncate text-[11px] text-ink-tertiary">{on ? m.desc : "No access"}</span>
                            </span>
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={(e) => set("modules", { ...draft.modules, [m.key]: e.target.checked })}
                              className="h-4 w-4 shrink-0 accent-brand"
                              aria-label={`${m.label} access`}
                            />
                          </label>
                        );
                      })}
                    </div>

                    <h3 className="mt-8 text-[15px] font-semibold text-ink">Data Visibility</h3>
                    <p className="text-[12px] text-ink-secondary">Define what data this role can see.</p>
                    <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                      <Field label="Guest Data Access" hint={draft.guestData === "Full Profile" ? "Preferences, history, notes" : draft.guestData === "Basic Information" ? "Name, room number, stay dates" : "Guest data hidden"}>
                        <Select value={draft.guestData} onChange={(e) => set("guestData", e.target.value)}>{GUEST_DATA.map((o) => <option key={o}>{o}</option>)}</Select>
                      </Field>
                      <Field label="Task Visibility" hint={draft.taskVis === "Assigned to Me" ? "Only tasks assigned to this user" : draft.taskVis === "My Department" ? "All tasks in their department" : "Tasks across the hotel"}>
                        <Select value={draft.taskVis} onChange={(e) => set("taskVis", e.target.value)}>{TASK_VIS.map((o) => <option key={o}>{o}</option>)}</Select>
                      </Field>
                      <Field label="Conversation Access" hint={draft.convo === "View and Respond" ? "Can respond to guest messages" : draft.convo === "View Only" ? "Can read guest messages" : "No chat access"}>
                        <Select value={draft.convo} onChange={(e) => set("convo", e.target.value)}>{CONVO.map((o) => <option key={o}>{o}</option>)}</Select>
                      </Field>
                      <Field label="Reports Access" hint={draft.reports === "Department Only" ? `Reports for ${draft.dept}` : draft.reports === "All Reports" ? "Hotel-wide reports" : "No reports"}>
                        <Select value={draft.reports} onChange={(e) => set("reports", e.target.value)}>{REPORT_ACC.map((o) => <option key={o}>{o}</option>)}</Select>
                      </Field>
                    </div>
                  </div>
                ) : editTab === "advanced" ? (
                  <div className="pt-5">
                    <h3 className="text-[15px] font-semibold text-ink">Cross-department access</h3>
                    <p className="text-[12px] text-ink-secondary">Departments this role can see in addition to {draft.dept}. Effective access is the union of all assignments.</p>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                      {DEPARTMENTS.filter((d) => d !== draft.dept && d !== "System").map((d) => (
                        <label key={d} className="flex items-center gap-2 text-[13px] text-ink">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-brand"
                            checked={draft.crossDepts.includes(d)}
                            onChange={(e) => set("crossDepts", e.target.checked ? [...draft.crossDepts, d] : draft.crossDepts.filter((x) => x !== d))}
                          />
                          {d}
                        </label>
                      ))}
                    </div>

                    <h3 className="mt-6 text-[15px] font-semibold text-ink">Special rules</h3>
                    <p className="text-[12px] text-ink-secondary">Actions this role is authorised to perform.</p>
                    <div className="mt-3 divide-y divide-line/70 rounded-xl border border-line">
                      {SPECIAL_RULES.map((r) => {
                        const on = draft.rules[r.key];
                        return (
                          <div key={r.key} className="flex items-center gap-3 px-4 py-3">
                            <div className="min-w-0 flex-1 leading-tight">
                              <div className="text-[13px] font-medium text-ink">{r.label}</div>
                              <div className="text-[11px] text-ink-tertiary">{r.desc}</div>
                            </div>
                            <button
                              role="switch"
                              aria-checked={on}
                              aria-label={r.label}
                              onClick={() => set("rules", { ...draft.rules, [r.key]: !on })}
                              className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${on ? "bg-brand" : "bg-gray-300"}`}
                            >
                              <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <RoleMembers
                    role={saved}
                    roles={roles}
                    members={users.filter((u) => u.roleId === saved.id)}
                    onMove={moveUser}
                    onInvite={() => setInviteRole(saved.id)}
                  />
                )}

                <div className={`mt-8 flex items-center justify-end gap-3 ${editTab === "members" ? "hidden" : ""}`}>
                  {dirty && <span className="mr-auto text-[12px] text-ink-tertiary">Unsaved changes</span>}
                  <Button variant="outline" onClick={() => { setDraft(structuredClone(saved)); }} disabled={!dirty}>Cancel</Button>
                  <Button onClick={save} disabled={!dirty || !draft.name.trim()} className="disabled:opacity-40">Save Changes</Button>
                </div>
              </Card>
            </div>
          </>
        ) : (
          <UserManagement roles={roles} users={users} setUsers={setUsers} roleFilter={userRoleFilter} setRoleFilter={setUserRoleFilter} flash={flash} />
        )}
      </Shell>

      {createOpen && <CreateRole onClose={() => setCreateOpen(false)} onCreate={(r) => { addRole(r); setCreateOpen(false); flash(`Role “${r.name}” created`); }} />}

      {inviteRole && (
        <InviteUser
          roles={roles}
          defaultRoleId={inviteRole}
          onClose={() => setInviteRole(null)}
          onInvite={(name, email, roleId) => {
            setUsers((us) => [mkUser(name, email, roleId, roles, us), ...us]);
            setInviteRole(null);
            flash(`Invitation sent to ${email}`);
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </>
  );
}

/* ---------- members of a role ---------- */

function RoleMembers({
  role, roles, members, onMove, onInvite,
}: {
  role: Role;
  roles: Role[];
  members: User[];
  onMove: (id: number, roleId: string) => void;
  onInvite: () => void;
}) {
  const [q, setQ] = useState("");
  const list = members.filter((u) => !q.trim() || `${u.name} ${u.email}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="pt-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${role.name} members…`}
            className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
          />
        </div>
        <Button variant="outline" onClick={onInvite}><Plus className="h-4 w-4" /> Invite</Button>
      </div>

      <div className="mt-4 max-h-[440px] divide-y divide-line/70 overflow-y-auto rounded-xl border border-line">
        {list.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-subtle text-[11px] font-semibold text-ink-secondary">
              {u.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[13px] font-medium text-ink">{u.name}</div>
              <div className="truncate text-[11px] text-ink-tertiary">{u.email} · {u.last}</div>
            </div>
            <span className={`shrink-0 text-[12px] ${u.status === "Active" ? "text-emerald-600" : u.status === "Invited" ? "text-amber-600" : "text-ink-tertiary"}`}>{u.status}</span>
            <div className="w-44 shrink-0">
              <Select className="h-8 text-[12px]" value={u.roleId} onChange={(e) => onMove(u.id, e.target.value)} aria-label={`Role for ${u.name}`}>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </div>
          </div>
        ))}
        {!list.length && (
          <p className="px-4 py-10 text-center text-[13px] text-ink-tertiary">
            {members.length ? "No members match." : "No one has this role yet. Invite someone or move a user here."}
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- user management (the staff table) ---------- */

const PAGE = 10;

function mkUser(name: string, email: string, roleId: string, roles: Role[], users: User[]): User {
  const id = Math.max(0, ...users.map((u) => u.id)) + 1;
  const dept = roles.find((r) => r.id === roleId)?.dept ?? "Front Office";
  return {
    id, name, email, roleId, status: "Invited", last: "—",
    dept: ROLE_DEPT_TO_STAFF[dept] ?? "Front Desk", avail: "Off Duty", shift: "Morning", task: null, tint: TINTS[id % TINTS.length],
  };
}

const toStaff = (u: User, roleName: string): Staff => ({
  id: `#EMP${String(u.id).padStart(3, "0")}`,
  name: u.name,
  role: roleName,
  dept: u.dept,
  status: u.avail,
  task: u.task,
  shift: u.shift,
  tint: u.tint,
});

function UserManagement({
  roles, users, setUsers, roleFilter, setRoleFilter, flash,
}: {
  roles: Role[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  roleFilter: string;
  setRoleFilter: (v: string) => void;
  flash: (m: string) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dept, setDept] = useState("all");
  const [avail, setAvail] = useState("all");
  const [shift, setShift] = useState("all");
  const [acct, setAcct] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [access, setAccess] = useState<Record<number, Perms>>({});
  const [, bump] = useState(0);

  const roleOf = (id: string) => roles.find((r) => r.id === id);
  const depts = Array.from(new Set(users.map((u) => u.dept))).sort();
  const activeFilters = [roleFilter, dept, avail, shift, acct].filter((v) => v !== "all").length;
  const clear = () => { setRoleFilter("all"); setDept("all"); setAvail("all"); setShift("all"); setAcct("all"); setPage(0); };

  const list = users.filter(
    (u) =>
      (roleFilter === "all" || u.roleId === roleFilter) &&
      (dept === "all" || u.dept === dept) &&
      (avail === "all" || u.avail === avail) &&
      (shift === "all" || u.shift === shift) &&
      (acct === "all" || u.status === acct) &&
      (!q.trim() || `${u.name} ${u.email} ${roleOf(u.roleId)?.name} ${u.dept}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const rows = list.slice(cur * PAGE, cur * PAGE + PAGE);

  const update = (id: number, patch: Partial<User>) => setUsers((us) => us.map((u) => (u.id === id ? { ...u, ...patch } : u)));

  const selected = users.find((u) => u.id === selectedId) ?? null;
  const selStaff = selected ? toStaff(selected, roleOf(selected.roleId)?.name ?? "Staff") : null;
  const permsOf = (u: User): Perms => access[u.id] ?? PRESETS[presetFor(toStaff(u, roleOf(u.roleId)?.name ?? "Staff"))];

  return (
    <div className="mt-6">
      <Card>
        <div className="relative flex items-center gap-3 border-b border-line px-4 py-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(0); }}
              placeholder="Search by name, email, role, department…"
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            {activeFilters > 0 && <button onClick={clear} className="text-[13px] font-medium text-brand">Clear filters</button>}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              aria-label="Filters"
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${filtersOpen || activeFilters ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"}`}
            >
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">{activeFilters}</span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="absolute right-4 top-14 z-30 w-[340px] rounded-card border border-line bg-white p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role">
                  <Select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
                    <option value="all">All roles</option>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </Select>
                </Field>
                <Field label="Department">
                  <Select value={dept} onChange={(e) => { setDept(e.target.value); setPage(0); }}>
                    <option value="all">All departments</option>
                    {depts.map((d) => <option key={d}>{d}</option>)}
                  </Select>
                </Field>
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-ink-secondary">
                <span>{list.length} users match</span>
                <button onClick={() => setFiltersOpen(false)} className="font-semibold text-brand">Done</button>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-line text-[11px] tracking-wide text-ink-secondary">
                <th className="py-3 pl-4 font-medium">Staff Member</th>
                <th className="py-3 font-medium">Role</th>
                <th className="py-3 font-medium">Department</th>
                <th className="py-3 font-medium">Current Task</th>
                <th className="py-3 pr-4 font-medium">Task Trend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const st = toStaff(u, roleOf(u.roleId)?.name ?? "Staff");
                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`cursor-pointer border-b border-line/70 ${selectedId === u.id ? "bg-brand-tint/40" : "hover:bg-subtle/60"} ${u.status === "Deactivated" ? "opacity-60" : ""}`}
                  >
                    <td className="py-3 pl-4 pr-3">
                      <span className="flex items-center gap-3">
                        <Avatar s={st} />
                        <span className="leading-tight">
                          <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                            {u.name}
                            {u.status !== "Active" && (
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${u.status === "Invited" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-ink-secondary"}`}>{u.status}</span>
                            )}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-[13px] text-ink">{roleOf(u.roleId)?.name ?? "Staff"}</td>
                    <td className="py-3 pr-3 text-[13px] text-ink-secondary">{u.dept}</td>
                    <td className="py-3 pr-3 text-[13px] text-ink-secondary">{u.task ?? "—"}</td>
                    <td className="whitespace-nowrap py-3 pr-4 text-[13px] font-semibold">
                      {(() => {
                        const v = TREND[u.id % TREND.length];
                        return v > 0
                          ? <span className="text-emerald-600">↑ +{v}%</span>
                          : v < 0
                            ? <span className="text-brand">↓ {v}%</span>
                            : <span className="text-ink-secondary">→ 0%</span>;
                      })()}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={5} className="py-10 text-center text-[13px] text-ink-tertiary">No users match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-[12px] text-ink-secondary">
          <span>{list.length ? `${cur * PAGE + 1}–${Math.min(list.length, cur * PAGE + PAGE)} of ${list.length} users` : "0 users"}</span>
          <div className="flex items-center gap-2">
            <button disabled={cur === 0} onClick={() => setPage(cur - 1)} className="rounded-md border border-line px-2.5 py-1 disabled:opacity-40">‹ Prev</button>
            <span>Page {cur + 1} of {pages}</span>
            <button disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} className="rounded-md border border-line px-2.5 py-1 disabled:opacity-40">Next ›</button>
          </div>
        </div>
      </Card>

      {selected && selStaff && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button aria-label="Close details" onClick={() => setSelectedId(null)} className="absolute inset-0 bg-black/10" />
          <div className="relative flex h-full">
            <Drawer
              title="Staff Details"
              width={420}
              onClose={() => setSelectedId(null)}
            >
              <StaffDetails
                key={selected.id}
                s={selStaff}
                perms={permsOf(selected)}
                onSaveAccess={(p) => { setAccess((a) => ({ ...a, [selected.id]: p })); flash(`Access updated for ${selected.name}`); }}
              />
            </Drawer>
          </div>
        </div>
      )}

      {assigning && selStaff && (
        <AddTaskModal
          staff={selStaff}
          onClose={() => setAssigning(false)}
          onAssign={(id, title) => { assignTask(id, shortName(selStaff.name)); bump((n) => n + 1); flash(`“${title}” assigned to ${selStaff.name}`); }}
          onCreate={() => navigate("/tasks?new=1")}
        />
      )}

      {inviteOpen && (
        <InviteUser
          roles={roles}
          defaultRoleId={roleFilter !== "all" ? roleFilter : undefined}
          onClose={() => setInviteOpen(false)}
          onInvite={(name, email, roleId) => {
            setUsers((us) => [mkUser(name, email, roleId, roles, us), ...us]);
            setInviteOpen(false);
            flash(`Invitation sent to ${email}`);
          }}
        />
      )}
    </div>
  );
}

/* ---------- dialogs ---------- */

function Dialog({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink"><X className="h-4 w-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

function CreateRole({ onClose, onCreate }: { onClose: () => void; onCreate: (r: Role) => void }) {
  const [name, setName] = useState("");
  const [dept, setDept] = useState<Role["dept"]>("Front Office");
  const [persona, setPersona] = useState<Role["persona"]>("Line Staff");
  const [tpl, setTpl] = useState("");
  const [desc, setDesc] = useState("");

  const submit = () => {
    const t = TEMPLATES.find((x) => x.id === tpl);
    onCreate(newRole({ ...(t ? structuredClone(t) : {}), name: name.trim(), dept, persona, desc: desc.trim() || t?.desc || "" }));
  };

  return (
    <Dialog
      title="Create role"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={!name.trim()} className="disabled:opacity-40">Create role</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Role name" required><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Laundry Supervisor" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Department"><Select value={dept} onChange={(e) => setDept(e.target.value as Role["dept"])}>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</Select></Field>
          <Field label="Persona"><Select value={persona} onChange={(e) => setPersona(e.target.value as Role["persona"])}>{PERSONA_TYPES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        </div>
        <Field label="Start from template" hint="Optional — copies its module access and data visibility.">
          <Select value={tpl} onChange={(e) => setTpl(e.target.value)}>
            <option value="">Blank role</option>
            {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
        <Field label="Description"><Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
      </div>
    </Dialog>
  );
}

function InviteUser({ roles, onClose, onInvite, defaultRoleId }: { roles: Role[]; onClose: () => void; onInvite: (name: string, email: string, roleId: string) => void; defaultRoleId?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(defaultRoleId ?? roles[0].id);
  const ok = name.trim() && /\S+@\S+\.\S+/.test(email);
  return (
    <Dialog
      title="Invite user"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onInvite(name.trim(), email.trim(), roleId)} disabled={!ok} className="disabled:opacity-40">Send invite</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Full name" required><Input autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Work email" required><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@alfonhotels.com" /></Field>
        <Field label="Role"><Select value={roleId} onChange={(e) => setRoleId(e.target.value)}>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</Select></Field>
      </div>
    </Dialog>
  );
}
