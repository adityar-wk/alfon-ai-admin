import type { Priority } from "./mobile";

export type TStatus = "unassigned" | "assigned" | "progress" | "completed" | "unable";
export type EscType = "SLA breach" | "Guest complaint" | "Unable to complete" | "Staffing issue" | "Supervisor escalation";

export type MTask = {
  id: string;
  room: string;
  guest: string;
  title: string;
  note: string;
  priority: Priority;
  status: TStatus;
  owner: string | null;
  support: string[];
  slaTotal: number; // minutes
  slaLeft: number; // minutes (negative = overdue)
  isNew?: boolean;
  createdAt: string;
  pickup: string;
  summary: string;
  prefs: string[];
  convo: string;
  timeline: { t: string; text: string }[];
  notes: { by: string; t: string; text: string }[];
  escalated?: boolean;
  escType?: EscType;
  escReason?: string;
  escBy?: string;
  complaint?: boolean;
  sentiment?: "Negative" | "Neutral";
  risk?: "High" | "Medium";
  vip?: boolean;
  related?: string[];
  resolution?: string;
};

export type Presence = "Available" | "Busy" | "On Break" | "Off work";
export type Staffer = { name: string; role: "Line Staff" | "Supervisor"; status: Presence; phone: string };

export const STAFF: Staffer[] = [
  { name: "Aanya Khan", role: "Line Staff", status: "Busy", phone: "+971 50 111 2201" },
  { name: "Maria Santos", role: "Line Staff", status: "Busy", phone: "+971 50 111 2202" },
  { name: "Lisa Morgan", role: "Line Staff", status: "Available", phone: "+971 50 111 2203" },
  { name: "Fatima Khan", role: "Line Staff", status: "Available", phone: "+971 50 111 2204" },
  { name: "Ravi Menon", role: "Line Staff", status: "On Break", phone: "+971 50 111 2205" },
  { name: "Jonas Weber", role: "Line Staff", status: "Off work", phone: "+971 50 111 2206" },
  { name: "Sarah Ali", role: "Supervisor", status: "Available", phone: "+971 50 111 2210" },
  { name: "Tom Hughes", role: "Supervisor", status: "On Break", phone: "+971 50 111 2211" },
];

const NOW = "10:31 AM";

export const SEED_TASKS: MTask[] = [
  {
    id: "t1", room: "Room 501", guest: "Emma Davis", title: "Full towel change & hypoallergenic linens",
    note: "Guest requested a full towel change and hypoallergenic linens before check-in.", priority: "Medium", status: "progress",
    owner: "Aanya Khan", support: [], slaTotal: 45, slaLeft: 18, createdAt: "9:48 AM", pickup: "Accepted in 3 min · met",
    summary: "Guest has a linen allergy and asked for a full towel change plus hypoallergenic bedding before she checks in this afternoon.",
    prefs: ["Hypoallergenic bedding", "Firm pillow", "Quiet room"], convo: "Guest mentioned sensitivity to feather bedding. No complaints.",
    timeline: [{ t: "9:48", text: "Request created from guest chat" }, { t: "9:51", text: "Assigned to Aanya Khan" }, { t: "9:54", text: "Accepted · in progress" }],
    notes: [], related: [],
  },
  {
    id: "t2", room: "Room 623", guest: "Liam Anderson", title: "Carpet vacuum & spot clean",
    note: "Carpet vacuum and spot clean requested by the guest.", priority: "Low", status: "assigned",
    owner: "Lisa Morgan", support: [], slaTotal: 60, slaLeft: 52, isNew: true, createdAt: "10:22 AM", pickup: "Awaiting acceptance · 4 min",
    summary: "Small stain near the window from a spilled drink. Guest is out until 2 PM.", prefs: ["Non-smoking"], convo: "Guest apologised for the spill; no urgency.",
    timeline: [{ t: "10:22", text: "Request created" }, { t: "10:23", text: "Assigned to Lisa Morgan" }], notes: [],
  },
  {
    id: "t3", room: "Room 812", guest: "Ananya Kapoor", title: "Extra pillows & rollaway bed",
    note: "Extra pillows and a rollaway bed for an arriving family of four.", priority: "Medium", status: "unassigned",
    owner: null, support: [], slaTotal: 40, slaLeft: 38, isNew: true, createdAt: "10:29 AM", pickup: "Not yet picked up",
    summary: "Family of four arriving at 12:30 needs a rollaway bed and four extra pillows set up before arrival.", prefs: ["High floor", "Extra pillows"], convo: "Booking note from the PMS. No chat yet.",
    timeline: [{ t: "10:29", text: "Created from PMS pre-arrival note" }], notes: [],
  },
  {
    id: "t4", room: "Room 305", guest: "Sarah Chen", title: "Minibar restock & glassware check",
    note: "Minibar restock and glassware check before the evening turndown.", priority: "Low", status: "progress",
    owner: "Maria Santos", support: [], slaTotal: 60, slaLeft: 40, createdAt: "9:30 AM", pickup: "Accepted in 2 min · met",
    summary: "Routine restock. Guest prefers sparkling water and no alcohol in the fridge.", prefs: ["Sparkling water", "No alcohol"], convo: "—",
    timeline: [{ t: "9:30", text: "Created" }, { t: "9:32", text: "Accepted by Maria Santos" }], notes: [],
  },
  {
    id: "t5", room: "Room 1204", guest: "Rohan Sharma", title: "Deep clean bathroom before VIP arrival",
    note: "Deep clean the bathroom before the VIP arrival at 3:00 PM.", priority: "High", status: "progress",
    owner: "Fatima Khan", support: ["Lisa Morgan"], slaTotal: 90, slaLeft: 14, createdAt: "8:40 AM", pickup: "Accepted in 4 min · met", vip: true,
    escalated: true, escType: "Supervisor escalation", escBy: "Sarah Ali", escReason: "Two hours of work left in under an hour and only one cleaner available. Needs a decision on staffing.",
    summary: "VIP loyalty guest arriving at 3 PM. Bathroom needs a full deep clean and amenity refresh.", prefs: ["Personalised greeting", "Late turndown"], convo: "Guest's assistant confirmed arrival time.",
    timeline: [{ t: "8:40", text: "Created" }, { t: "8:44", text: "Accepted by Fatima Khan" }, { t: "9:50", text: "Lisa Morgan added as support" }, { t: "10:20", text: "Sarah Ali escalated: staffing risk" }],
    notes: [{ by: "Sarah Ali", t: "10:20 AM", text: "Only two cleaners on this wing. Recommend pulling one from floor 9." }],
  },
  {
    id: "t6", room: "Room 1103", guest: "Michael Johnson", title: "Stained bedding complaint",
    note: "Guest reported stained bedding on arrival and asked for a manager.", priority: "Critical", status: "progress",
    owner: "Maria Santos", support: [], slaTotal: 30, slaLeft: -14, createdAt: "9:40 AM", pickup: "Accepted in 1 min · met", vip: true,
    complaint: true, sentiment: "Negative", risk: "High", escalated: true, escType: "Guest complaint", escBy: "Sarah Ali",
    escReason: "Guest is upset and asked for a manager. SLA already breached; linen replaced but guest has not been contacted.",
    summary: "VIP guest found stained bedding on arrival. Linen has been replaced; the guest is still waiting for an apology and a service recovery gesture.",
    prefs: ["Firm pillow", "Early breakfast", "Quiet room"], convo: "“This is not what I expect from a five-star stay. I would like to speak to someone in charge.”",
    timeline: [{ t: "9:40", text: "Complaint raised in chat" }, { t: "9:41", text: "Accepted by Maria Santos" }, { t: "10:10", text: "SLA breached" }, { t: "10:15", text: "Escalated by Sarah Ali" }],
    notes: [{ by: "Sarah Ali", t: "10:15 AM", text: "Linen swapped at 9:55. Guest not yet called back." }], related: ["Turndown Service — Room 1103", "Early breakfast request — Room 1103"],
  },
  {
    id: "t7", room: "Room 704", guest: "Sarah Chen", title: "Baby cot setup",
    note: "Baby cot to be set up in the room before the guest returns.", priority: "Medium", status: "unassigned",
    owner: null, support: [], slaTotal: 30, slaLeft: 22, isNew: true, createdAt: "10:26 AM", pickup: "Not yet picked up",
    summary: "Guest travelling with an infant; cot and bedding needed before 12:00.", prefs: ["Baby cot", "Quiet room"], convo: "Guest asked via chat this morning.",
    timeline: [{ t: "10:26", text: "Created from guest chat" }], notes: [],
  },
  {
    id: "t8", room: "Room 410", guest: "Ethan Ross", title: "Fresh linen change", note: "Fresh linen change requested by the guest.", priority: "Low", status: "completed",
    owner: "Lisa Morgan", support: [], slaTotal: 45, slaLeft: 12, createdAt: "7:50 AM", pickup: "Accepted in 2 min · met", summary: "Completed.", prefs: [], convo: "—",
    timeline: [{ t: "7:50", text: "Created" }, { t: "8:10", text: "Completed" }], notes: [], resolution: "Done at 8:10 AM",
  },
  {
    id: "t9", room: "Room 227", guest: "Grace Kim", title: "Towels replenished", note: "Bath towels replenished and amenities restocked.", priority: "Low", status: "completed",
    owner: "Maria Santos", support: [], slaTotal: 45, slaLeft: 20, createdAt: "8:20 AM", pickup: "Accepted in 1 min · met", summary: "Completed.", prefs: [], convo: "—",
    timeline: [{ t: "8:20", text: "Created" }, { t: "8:45", text: "Completed" }], notes: [], resolution: "Done at 8:45 AM",
  },
  {
    id: "t10", room: "Room 908", guest: "Ananya Kapoor", title: "Extra pillows", note: "Two extra pillows requested. Guest is waiting in the room.", priority: "Low", status: "progress",
    owner: "Aanya Khan", support: [], slaTotal: 30, slaLeft: -8, createdAt: "9:55 AM", pickup: "Accepted in 6 min · late",
    escalated: true, escType: "SLA breach", escBy: "System", escReason: "Task passed its resolution SLA with no update from the assignee.",
    summary: "Simple item request that has gone past its SLA. Pillows are in the floor pantry.", prefs: ["Extra pillows"], convo: "Guest followed up once asking for an update.",
    timeline: [{ t: "9:55", text: "Created" }, { t: "10:01", text: "Accepted (late)" }, { t: "10:25", text: "SLA breached" }], notes: [],
  },
  {
    id: "t11", room: "Room 1501", guest: "David Williams", title: "Accessible bath mat", note: "Wheelchair-accessible bath mat and shower chair requested.", priority: "High", status: "unable",
    owner: "Ravi Menon", support: [], slaTotal: 60, slaLeft: 25, createdAt: "9:20 AM", pickup: "Accepted in 2 min · met",
    escalated: true, escType: "Unable to complete", escBy: "Ravi Menon", escReason: "Item unavailable — the only shower chair is out for repair. Needs a decision or a substitute.",
    summary: "Guest with reduced mobility needs an accessible bath mat and shower chair in the room today.", prefs: ["Accessible room"], convo: "Guest is understanding but needs it before tonight.",
    timeline: [{ t: "9:20", text: "Created" }, { t: "9:40", text: "Marked unable to complete: item unavailable" }], notes: [], resolution: "Unable — item unavailable",
  },
  {
    id: "t12", room: "Room 2104", guest: "Isabella Rossi", title: "Extra towels", note: "Extra bath towels for four guests.", priority: "High", status: "unassigned",
    owner: null, support: [], slaTotal: 40, slaLeft: 9, createdAt: "10:00 AM", pickup: "Not yet picked up · 31 min",
    escalated: true, escType: "Staffing issue", escBy: "Sarah Ali", escReason: "No one available on floor 21 — everyone is on a task or break. Unassigned for 30+ minutes.",
    summary: "Routine request, but it has been unassigned for half an hour.", prefs: ["Italian speaker"], convo: "—",
    timeline: [{ t: "10:00", text: "Created" }, { t: "10:31", text: "Escalated: no staff available" }], notes: [],
  },
];

export const HELP_REASONS = ["Need more staff", "Wrong assignment", "Technical blocker", "Guest unavailable", "Item unavailable", "Other"] as const;

export type HelpReq = { id: string; staff: string; taskId: string; reason: (typeof HELP_REASONS)[number]; note: string; kind: "help" | "reassign"; time: string };
export const SEED_REQUESTS: HelpReq[] = [
  { id: "h1", staff: "Maria Santos", taskId: "t4", reason: "Need more staff", note: "Two rooms on the same floor need restocking at the same time.", kind: "help", time: "4 min ago" },
  { id: "h2", staff: "Ravi Menon", taskId: "t11", reason: "Item unavailable", note: "The shower chair is out for repair.", kind: "help", time: "22 min ago" },
  { id: "h3", staff: "Aanya Khan", taskId: "t10", reason: "Wrong assignment", note: "I'm on floor 5 — this is a floor 9 request.", kind: "reassign", time: "9 min ago" },
];

export const STATUS_ORDER = ["Available", "Busy", "On Break", "Off work"] as const;
export const PRESENCE_DOT: Record<Presence, string> = { Available: "bg-emerald-500", Busy: "bg-blue-500", "On Break": "bg-amber-400", "Off work": "bg-gray-300" };

export const NOW_LABEL = NOW;
