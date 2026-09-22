import { INITIAL, TINTS, type Status as Avail, type ShiftName } from "./staff";

export type ModuleKey = "tasks" | "chats" | "profiles" | "prearrival" | "housekeeping" | "analytics" | "reports" | "settings";

export const MODULES: { key: ModuleKey; label: string; desc: string }[] = [
  { key: "tasks", label: "Tasks", desc: "View and manage assigned tasks" },
  { key: "chats", label: "Guest Chats", desc: "View and respond to guest chats" },
  { key: "profiles", label: "Guest Profiles", desc: "View guest information" },
  { key: "prearrival", label: "Pre-Arrival", desc: "View pre-arrival information" },
  { key: "housekeeping", label: "Housekeeping", desc: "View housekeeping tasks" },
  { key: "analytics", label: "Analytics", desc: "View basic department reports" },
  { key: "reports", label: "Reports", desc: "Access operational reports" },
  { key: "settings", label: "Settings", desc: "Hotel and system configuration" },
];

export const DEPARTMENTS = ["Front Office", "Housekeeping", "F&B", "Engineering", "Guest Services", "Management", "System"] as const;
export const PERSONA_TYPES = ["Line Staff", "Supervisor", "Mid Manager", "High Management", "System"] as const;

export const GUEST_DATA = ["No access", "Basic Information", "Full Profile"] as const;
export const TASK_VIS = ["Assigned to Me", "My Department", "All Departments"] as const;
export const CONVO = ["No Access", "View Only", "View and Respond"] as const;
export const REPORT_ACC = ["No Access", "Department Only", "All Reports"] as const;

export const SPECIAL_RULES = [
  { key: "reassign", label: "Reassign tasks", desc: "Move a task to another staff member" },
  { key: "support", label: "Add support staff", desc: "Bring extra people onto a task" },
  { key: "override", label: "Close / override tasks", desc: "With a reason recorded in the audit trail" },
  { key: "unable", label: "Mark tasks unable to complete", desc: "With a mandatory reason" },
  { key: "escalate", label: "Escalate to General Manager", desc: "Send serious issues upward" },
  { key: "takeover", label: "Take over guest conversations", desc: "Switch a chat from Auto to Manual" },
  { key: "notes", label: "Add management notes", desc: "Notes visible to managers only" },
  { key: "audit", label: "View audit trail", desc: "Escalations, overrides and task changes" },
  { key: "export", label: "Export reports", desc: "Download CSV / PDF reports" },
  { key: "users", label: "Manage users & roles", desc: "Invite users and change roles" },
] as const;
export type RuleKey = (typeof SPECIAL_RULES)[number]["key"];

export type Role = {
  id: string;
  name: string;
  desc: string;
  persona: (typeof PERSONA_TYPES)[number];
  dept: (typeof DEPARTMENTS)[number];
  modules: Record<ModuleKey, boolean>;
  guestData: string;
  taskVis: string;
  convo: string;
  reports: string;
  crossDepts: string[];
  rules: Record<RuleKey, boolean>;
};

const mods = (on: ModuleKey[]): Record<ModuleKey, boolean> =>
  Object.fromEntries(MODULES.map((m) => [m.key, on.includes(m.key)])) as Record<ModuleKey, boolean>;
const rules = (on: RuleKey[]): Record<RuleKey, boolean> =>
  Object.fromEntries(SPECIAL_RULES.map((r) => [r.key, on.includes(r.key)])) as Record<RuleKey, boolean>;

export const newRole = (p: Partial<Role> & { name: string }): Role => ({
  id: "r" + Math.random().toString(36).slice(2, 8),
  desc: "",
  persona: "Line Staff",
  dept: "Front Office",
  modules: mods(["tasks"]),
  guestData: "No access",
  taskVis: "Assigned to Me",
  convo: "No Access",
  reports: "No Access",
  crossDepts: [],
  rules: rules([]),
  ...p,
});

export const TEMPLATES: Role[] = [
  newRole({ id: "t-line", name: "Line Staff", desc: "Execute assigned tasks", persona: "Line Staff", modules: mods(["tasks"]), guestData: "Basic Information" }),
  newRole({ id: "t-front", name: "Front Desk Agent", desc: "Handle guest check-in, requests and basic service tasks", persona: "Line Staff", dept: "Front Office", modules: mods(["tasks", "chats", "profiles", "prearrival"]), guestData: "Basic Information", convo: "View and Respond", reports: "Department Only" }),
  newRole({ id: "t-sup", name: "Team Supervisor", desc: "Lead a shift and resolve day-to-day issues", persona: "Supervisor", modules: mods(["tasks", "chats", "profiles", "housekeeping", "analytics"]), guestData: "Basic Information", taskVis: "My Department", convo: "View and Respond", reports: "Department Only", rules: rules(["reassign", "support", "notes", "takeover", "escalate"]) }),
  newRole({ id: "t-mid", name: "Department Manager", desc: "Own SLAs and daily service quality for a department", persona: "Mid Manager", modules: mods(["tasks", "chats", "profiles", "prearrival", "housekeeping", "analytics", "reports"]), guestData: "Full Profile", taskVis: "My Department", convo: "View and Respond", reports: "Department Only", rules: rules(["reassign", "support", "override", "unable", "escalate", "takeover", "notes", "audit", "export"]) }),
  newRole({ id: "t-gm", name: "General Manager", desc: "Hotel-wide oversight and analytics", persona: "High Management", dept: "Management", modules: mods(["tasks", "chats", "profiles", "prearrival", "housekeeping", "analytics", "reports", "settings"]), guestData: "Full Profile", taskVis: "All Departments", convo: "View and Respond", reports: "All Reports", rules: rules(["reassign", "support", "override", "unable", "escalate", "takeover", "notes", "audit", "export", "users"]) }),
];

const R = (name: string, desc: string, persona: Role["persona"], dept: Role["dept"], base: Role) =>
  ({ ...base, id: "r-" + name.toLowerCase().replace(/[^a-z]+/g, "-"), name, desc, persona, dept, modules: { ...base.modules }, rules: { ...base.rules }, crossDepts: [] });

const line = TEMPLATES[1], sup = TEMPLATES[2], mid = TEMPLATES[3], gm = TEMPLATES[4];

export const SEED_ROLES: Role[] = [
  R("Front Desk Agent", "Handle guest check-in, requests and basic service tasks", "Line Staff", "Front Office", line),
  R("Guest Services Supervisor", "Manage guest services team and escalations", "Supervisor", "Guest Services", sup),
  { ...R("Housekeeping Staff", "Execute assigned housekeeping tasks", "Line Staff", "Housekeeping", TEMPLATES[0]), modules: mods(["tasks", "housekeeping"]) },
  R("Housekeeping Manager", "Oversee housekeeping operations and SLAs", "Mid Manager", "Housekeeping", mid),
  { ...R("F&B Staff", "Handle restaurant and room service tasks", "Line Staff", "F&B", TEMPLATES[0]), modules: mods(["tasks", "chats"]) },
  R("Engineering Supervisor", "Manage maintenance tasks and team", "Supervisor", "Engineering", sup),
  R("Engineering Manager", "Oversee engineering operations and escalations", "Mid Manager", "Engineering", mid),
  R("General Manager", "Hotel-wide oversight and analytics", "High Management", "Management", gm),
  { ...R("Hotel Admin", "Manage users, roles and system configuration", "System", "System", gm), desc: "Manage users, roles and system configuration" },
  R("Housekeeping Supervisor", "Lead the housekeeping shift and unblock the team", "Supervisor", "Housekeeping", sup),
  R("Front Desk Supervisor", "Lead the front desk shift and handle escalations", "Supervisor", "Front Office", sup),
  { ...R("Engineering Technician", "Carry out maintenance and repair tasks", "Line Staff", "Engineering", TEMPLATES[0]), modules: mods(["tasks"]) },
  { ...R("Guest Relations Agent", "Look after guest requests and follow-ups", "Line Staff", "Guest Services", line), modules: mods(["tasks", "chats", "profiles"]) },
  { ...R("Concierge", "Bookings, transfers and local recommendations", "Line Staff", "Front Office", line), modules: mods(["tasks", "chats", "profiles", "prearrival"]) },
  { ...R("Security Officer", "Access control and incident response", "Line Staff", "Front Office", TEMPLATES[0]), modules: mods(["tasks"]) },
];

export const SEED_COUNTS: Record<string, number> = {
  "r-front-desk-agent": 12, "r-guest-services-supervisor": 8, "r-housekeeping-staff": 18, "r-housekeeping-manager": 4,
  "r-f-b-staff": 10, "r-engineering-supervisor": 6, "r-engineering-manager": 3, "r-general-manager": 2, "r-hotel-admin": 5,
  "r-housekeeping-supervisor": 3, "r-front-desk-supervisor": 2, "r-engineering-technician": 6, "r-guest-relations-agent": 4, "r-concierge": 3, "r-security-officer": 4,
};

/* ---------- users ---------- */

export type User = {
  id: number;
  name: string;
  email: string;
  roleId: string;
  /** account state */
  status: "Active" | "Invited" | "Deactivated";
  last: string;
  /** working state, shown in the staff table */
  dept: string;
  avail: Avail;
  shift: ShiftName;
  task: string | null;
  tint: string;
};

const FIRST = ["Aanya", "Liam", "Sofia", "Noah", "Maya", "Omar", "Elena", "Kabir", "Chloe", "Ravi", "Zara", "Lucas", "Nina", "Ethan", "Layla", "Arjun", "Emma", "Yusuf", "Isla", "Mateo", "Priya", "Hugo", "Amira", "Jonas"];
const LAST = ["Sharma", "Bennett", "Rossi", "Hassan", "Patel", "Khan", "Silva", "Nair", "Brooks", "Chen", "Adams", "Morgan", "Farouk", "Santos", "Wilson", "Lopez", "Kim", "Reyes", "Haddad", "Petrov"];
const LAST_SEEN = ["Just now", "5 min ago", "22 min ago", "1 hr ago", "3 hrs ago", "Yesterday", "2 days ago"];

export const ROLE_DEPT_TO_STAFF: Record<string, string> = {
  "Front Office": "Front Desk", Housekeeping: "Housekeeping", "F&B": "F&B", Engineering: "Engineering",
  "Guest Services": "Guest Services", Management: "Management", System: "IT",
};
const AVAIL: Avail[] = ["On Duty", "On Duty", "On Duty", "On Break", "On Duty", "Off Duty"];
const SHIFTS: ShiftName[] = ["Morning", "Morning", "Afternoon", "Night"];

/** map the real staff (INITIAL) onto the closest role */
function roleForStaff(dept: string, role: string): string {
  const sup = /supervisor/i.test(role);
  if (dept === "Housekeeping") return sup ? "r-housekeeping-supervisor" : "r-housekeeping-staff";
  if (dept === "Engineering") return sup ? "r-engineering-supervisor" : "r-engineering-technician";
  if (dept === "Front Desk") return sup ? "r-front-desk-supervisor" : "r-front-desk-agent";
  if (dept === "Guest Services") return "r-guest-relations-agent";
  if (dept === "F&B") return "r-f-b-staff";
  if (dept === "Concierge") return "r-concierge";
  return "r-security-officer";
}

export function seedUsers(): User[] {
  const out: User[] = INITIAL.map((s, i) => ({
    id: i + 1,
    name: s.name,
    email: `${s.name.split(" ")[0]}.${s.name.split(" ").slice(-1)[0]}@alfonhotels.com`.toLowerCase(),
    roleId: roleForStaff(s.dept, s.role),
    status: "Active" as const,
    last: LAST_SEEN[i % LAST_SEEN.length],
    dept: s.dept,
    avail: s.status,
    shift: s.shift,
    task: s.task,
    tint: s.tint,
  }));

  let id = out.length + 1;
  for (const [roleId, n] of Object.entries(SEED_COUNTS)) {
    const have = out.filter((u) => u.roleId === roleId).length;
    const roleDept = SEED_ROLES.find((r) => r.id === roleId)?.dept ?? "Front Office";
    for (let i = have; i < n; i++, id++) {
      const f = FIRST[(id * 7) % FIRST.length];
      const l = LAST[(id * 11 + i) % LAST.length];
      const invited = id % 17 === 0;
      out.push({
        id,
        name: `${f} ${l}`,
        email: `${f}.${l}@alfonhotels.com`.toLowerCase(),
        roleId,
        status: invited ? "Invited" : id % 23 === 0 ? "Deactivated" : "Active",
        last: invited ? "—" : LAST_SEEN[id % LAST_SEEN.length],
        dept: ROLE_DEPT_TO_STAFF[roleDept] ?? "Front Desk",
        avail: AVAIL[id % AVAIL.length],
        shift: SHIFTS[id % SHIFTS.length],
        task: null,
        tint: TINTS[id % TINTS.length],
      });
    }
  }
  return out;
}

/** in-memory store shared across visits within a session */
export const STORE = { roles: SEED_ROLES.map((r) => ({ ...r })), users: seedUsers() };
