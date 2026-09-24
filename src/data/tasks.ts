export type Priority = "Critical" | "High" | "Medium" | "Low";
export type SlaKind = "overdue" | "due" | "left" | "met";
export type Status = "Escalated" | "In Progress" | "Yet to be picked" | "Completed" | "Unable to Complete" | "Void";

export type Task = {
  id: number;
  title: string;
  tag?: "Complaint";
  vip?: boolean;
  guest: string;
  room: string;
  dept: string;
  owner: string | null;
  priority: Priority;
  sla: { kind: SlaKind; text: string };
  status: Status;
  source: string;
  details?: string;
  escalation?: string;
  summary?: string;
  /** management-level notes (Mid Manager) */
  notes?: { author: string; text: string; time: string }[];
  /** extra staff added to help */
  support?: string[];
  escalatedTo?: string;
  /** reason recorded when a manager closes / overrides / marks unable */
  resolution?: string;
  /** guest compensation given for this task */
  compensation?: { type: string; reason: string; approvedBy: string; time: string }[];
};

const T = (
  id: number, title: string, guest: string, room: string, dept: string, owner: string | null,
  priority: Priority, sla: Task["sla"], status: Status, source: string, extra: Partial<Task> = {},
): Task => ({ id, title, guest, room, dept, owner, priority, sla, status, source, ...extra });

const SEED: Task[] = [
  T(1, "AC Not Working", "James Wilson", "2205", "Engineering", "Mike R.", "Critical", { kind: "overdue", text: "Overdue 12 min" }, "Escalated", "Guest Chat", {
    tag: "Complaint", vip: true,
    escalation: "No AC for over 30 minutes; guest asked for immediate help.",
    summary: "Air conditioning in Room 2205 stopped around 2:15 PM. The room is very warm, especially uncomfortable for their child. Guest followed up once and has been waiting 25+ minutes.",
  }),
  T(2, "Airport Pickup", "Emma Davis", "1608", "Concierge", "John S.", "High", { kind: "due", text: "Due in 4 min" }, "In Progress", "Guest Chat", { vip: true }),
  T(3, "Late Checkout Request", "Olivia Brown", "1203", "Front Desk", "Sarah K.", "Medium", { kind: "left", text: "22 min left" }, "Yet to be picked", "Guest Chat"),
  T(4, "Minibar Restock", "Noah Martinez", "1802", "Room Service", "Anna P.", "Medium", { kind: "left", text: "35 min left" }, "Yet to be picked", "Staff"),
  T(5, "Extra Towels", "Isabella Rossi", "2104", "Housekeeping", null, "Low", { kind: "due", text: "Due in 28 min" }, "Yet to be picked", "Guest Chat"),
  T(6, "Restaurant Reservation", "Sarah Mitchell", "2501", "Food & Beverage", "Tom H.", "Medium", { kind: "met", text: "On time" }, "In Progress", "Guest Chat"),
  T(7, "Plumbing Issue", "Liam Anderson", "1802", "Engineering", "Mike R.", "High", { kind: "due", text: "Due in 4 min" }, "In Progress", "Guest Chat", { tag: "Complaint" }),
  T(8, "Room Move Request", "William Taylor", "1107", "Front Desk", "Sarah K.", "Medium", { kind: "met", text: "On time" }, "Yet to be picked", "PMS"),
  T(9, "Wake-up Call Setup", "Ava Thompson", "2501", "Front Desk", "Maria S.", "Low", { kind: "met", text: "On time" }, "Yet to be picked", "Guest Chat"),
  T(10, "Newspaper Delivery", "Daniel Kim", "1305", "Room Service", null, "Low", { kind: "due", text: "Due in 18 min" }, "Yet to be picked", "Staff"),
  T(11, "Iron & Ironing Board", "Sophia Lee", "1904", "Housekeeping", "Maria S.", "Low", { kind: "met", text: "On time" }, "Yet to be picked", "Guest Chat"),
  T(12, "Arabic-Speaking Meet & Greet", "Khalid Al-Mansouri", "1710", "Concierge", "John S.", "High", { kind: "due", text: "Due in 12 min" }, "Yet to be picked", "Staff", { vip: true }),
  T(13, "Fresh Linen Change", "Mia Chen", "1502", "Housekeeping", "Lisa M.", "Low", { kind: "met", text: "Met" }, "Completed", "Guest Chat"),
  T(14, "Spa Booking", "Ethan Ross", "2010", "Guest Services", "Priya N.", "Medium", { kind: "met", text: "Met" }, "Completed", "Guest Chat"),
  T(15, "TV Remote Replacement", "Grace Kim", "1209", "Engineering", "Mike R.", "Low", { kind: "met", text: "Met" }, "Completed", "Staff"),
  T(16, "Room Deep Clean", "Rohan Sharma", "1205", "Housekeeping", "Sarah A.", "Medium", { kind: "overdue", text: "Overdue 8 min" }, "In Progress", "Staff"),
  T(17, "Extra Pillows", "Ananya Kapoor", "908", "Housekeeping", "Lisa M.", "Low", { kind: "due", text: "Due in 15 min" }, "Yet to be picked", "Guest Chat"),
  T(18, "Baby Cot Setup", "Sarah Chen", "704", "Housekeeping", null, "Medium", { kind: "due", text: "Due in 22 min" }, "Yet to be picked", "Guest Chat"),
  T(19, "Turndown Service", "Michael Johnson", "1103", "Housekeeping", "Maria S.", "Low", { kind: "left", text: "1 hr left" }, "In Progress", "Staff", { vip: true }),
  T(20, "Stained Bedding Complaint", "Michael Johnson", "1103", "Housekeeping", "Sarah A.", "High", { kind: "overdue", text: "Overdue 14 min" }, "Escalated", "Guest Chat", {
    tag: "Complaint", vip: true,
    escalation: "Guest reported stained linen; the supervisor could not resolve it within the SLA window.",
  }),
  T(21, "Wi-Fi Not Connecting", "David Williams", "1008", "Engineering", "Raj P.", "Medium", { kind: "due", text: "Due in 9 min" }, "Yet to be picked", "Guest Chat"),
  T(22, "Key Card Not Working", "Ananya Kapoor", "908", "Front Desk", "Sarah K.", "High", { kind: "overdue", text: "Overdue 5 min" }, "Escalated", "Guest Chat", {
    escalation: "Second key card failure this stay; agent could not re-encode.",
  }),
  T(23, "Bathroom Amenities Restock", "Olivia Brown", "1203", "Housekeeping", "Lisa M.", "Low", { kind: "left", text: "40 min left" }, "In Progress", "Staff"),
  T(24, "Extra Blanket", "Pooja Patel", "602", "Housekeeping", null, "Low", { kind: "due", text: "Due in 20 min" }, "Yet to be picked", "Guest Chat"),
  T(25, "Mattress Topper Request", "Robert Brown", "905", "Housekeeping", "Maria S.", "Medium", { kind: "left", text: "50 min left" }, "Yet to be picked", "PMS"),
  T(26, "Balcony Cleaning", "Sarah Mitchell", "2501", "Housekeeping", "Sarah A.", "Low", { kind: "overdue", text: "Overdue 6 min" }, "In Progress", "Staff"),
  T(27, "Laundry Pickup", "Ava Thompson", "2501", "Housekeeping", "Lisa M.", "Low", { kind: "met", text: "Met" }, "Completed", "Guest Chat"),
  T(28, "Room Ready for Early Check-in", "Khalid Al-Mansouri", "1710", "Housekeeping", "Maria S.", "High", { kind: "met", text: "Met" }, "Completed", "PMS"),
  T(29, "Pillow Menu Selection", "Emma Davis", "1608", "Housekeeping", null, "Medium", { kind: "due", text: "Due in 12 min" }, "Yet to be picked", "Guest Chat"),
  T(30, "Airport Transfer Booking", "Robert Brown", "905", "Concierge", "John S.", "Medium", { kind: "left", text: "45 min left" }, "Yet to be picked", "Guest Chat"),
  T(31, "Dinner Reservation — 4 Guests", "Sarah Mitchell", "2501", "Food & Beverage", "Tom H.", "Medium", { kind: "met", text: "On time" }, "In Progress", "Guest Chat"),
  T(32, "Heater Not Working", "Pooja Patel", "602", "Engineering", "Raj P.", "High", { kind: "overdue", text: "Overdue 10 min" }, "Escalated", "Guest Chat", {
    escalation: "Heating unit failed twice this evening; technician is waiting for a part.",
  }),
  T(33, "Invoice Copy Request", "David Williams", "1008", "Front Desk", null, "Low", { kind: "due", text: "Due in 25 min" }, "Yet to be picked", "Guest Chat"),
  T(34, "In-Room Dining Order", "Ananya Kapoor", "908", "Room Service", "Anna P.", "Medium", { kind: "met", text: "Met" }, "Completed", "Guest Chat"),
  T(35, "Wake-up Call Change", "Michael Johnson", "1103", "Front Desk", "Maria S.", "Low", { kind: "met", text: "Met" }, "Completed", "Guest Chat"),
  T(36, "Spa Appointment Change", "Emma Davis", "1608", "Guest Services", "Priya N.", "Medium", { kind: "left", text: "1 hr left" }, "Yet to be picked", "Guest Chat"),
  T(37, "Extra Hangers", "Liam Anderson", "623", "Housekeeping", null, "Low", { kind: "left", text: "55 min left" }, "Yet to be picked", "Guest Chat"),
  T(38, "Bathrobe Replacement", "Olivia Turner", "1108", "Housekeeping", null, "Medium", { kind: "left", text: "40 min left" }, "Yet to be picked", "Staff"),
];


/** Shared in-memory task list — Tasks page and Team page both read/write it. */
export const TASKS: Task[] = [...SEED];

export const shortName = (full: string) => {
  const [first, ...rest] = full.split(" ");
  return rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
};

export function assignTask(id: number, owner: string) {
  const i = TASKS.findIndex((x) => x.id === id);
  if (i >= 0) TASKS[i] = { ...TASKS[i], owner };
}

/* ---------- audit trail ---------- */

export type AuditEntry = { id: number; time: string; who: string; action: string; task: string; detail: string };

export const AUDIT: AuditEntry[] = [
  { id: 5, time: "May 8, 3:05 PM", who: "Daniel Reyes", action: "Support added", task: "Extra Towels", detail: "Lisa M. added to help" },
  { id: 1, time: "May 8, 2:40 PM", who: "System", action: "Escalated", task: "AC Not Working", detail: "No resolution after 25 minutes → General Manager" },
  { id: 2, time: "May 8, 1:12 PM", who: "Daniel Reyes", action: "Reassigned", task: "Plumbing Issue", detail: "Sarah K. → Mike R. (Engineering)" },
  { id: 3, time: "May 7, 6:05 PM", who: "Daniel Reyes", action: "Override closed", task: "Late Checkout Request", detail: "Reason: guest checked out early, no action needed" },
  { id: 4, time: "May 7, 11:20 AM", who: "Sophia Carter", action: "Priority changed", task: "Airport Pickup", detail: "Medium → High" },
];

let auditSeq = AUDIT.length;

export function logAudit(who: string, action: string, task: string, detail: string) {
  const now = new Date();
  const time = now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  AUDIT.unshift({ id: ++auditSeq, time, who, action, task, detail });
}

/* ---------- help & reassignment requests (raised against a task) ---------- */

export type HelpRequest = { id: number; taskId: number; from: string; type: "Reassignment" | "Extra support"; reason: string; done?: boolean };

/** AI-drafted guest replies waiting for manager approval, keyed by guest name. */
export const AI_DRAFTS: Record<string, string> = {};

export const HELP_REQUESTS: HelpRequest[] = [
  { id: 1, taskId: 5, from: "Sarah Ali (Supervisor)", type: "Extra support", reason: "Floor 21 team is fully booked until 4 PM." },
  { id: 2, taskId: 17, from: "Lisa Morgan", type: "Reassignment", reason: "Called away to a guest turndown; needs someone to take over." },
  { id: 3, taskId: 7, from: "Raj Patel (Supervisor)", type: "Extra support", reason: "Needs a second technician to isolate the water line." },
  { id: 4, taskId: 1, from: "Mike Rogers", type: "Reassignment", reason: "Compressor part needed; cannot finish this shift." },
  { id: 5, taskId: 8, from: "Noah Bennett (Supervisor)", type: "Extra support", reason: "Two group check-ins arriving at the same time." },
];

export const pendingHelpFor = (taskId: number) => HELP_REQUESTS.find((h) => h.taskId === taskId && !h.done);
export function resolveHelp(id: number) {
  const h = HELP_REQUESTS.find((x) => x.id === id);
  if (h) h.done = true;
}
