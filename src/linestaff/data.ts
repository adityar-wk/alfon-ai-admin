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
    escalated: true, escType: "SLA breach", escBy: "Sarah Ali", escReason: "This task passed its resolution SLA with no update from the assignee.",
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

export const GUEST_STAYS: Record<string, { checkIn: string; checkOut: string }> = {
  "Emma Davis": { checkIn: "Sep 22", checkOut: "Sep 26" },
  "Liam Anderson": { checkIn: "Sep 21", checkOut: "Sep 24" },
  "Ananya Kapoor": { checkIn: "Sep 23", checkOut: "Sep 27" },
  "Sarah Chen": { checkIn: "Sep 20", checkOut: "Sep 25" },
  "Rohan Sharma": { checkIn: "Sep 23", checkOut: "Sep 24" },
  "Michael Johnson": { checkIn: "Sep 22", checkOut: "Sep 29" },
  "Ethan Ross": { checkIn: "Sep 19", checkOut: "Sep 23" },
  "Grace Kim": { checkIn: "Sep 21", checkOut: "Sep 23" },
  "David Williams": { checkIn: "Sep 23", checkOut: "Sep 26" },
  "Isabella Rossi": { checkIn: "Sep 23", checkOut: "Sep 25" },
};

export type PreArrivalGuest = {
  name: string;
  room: string;
  roomType: string;
  eta: string;
  vip: boolean;
  notes: string;
  country: string;
  flag: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  profile: string;
  anticipatedNeeds: string;
  actions: { text: string; dept: string }[];
  prefs: { label: string; value: string }[];
};
export const PRE_ARRIVAL_GUESTS: PreArrivalGuest[] = [
  {
    name: "James Whitfield", room: "Room 615", roomType: "Executive Room", eta: "Today, Sep 23 · 11:30 AM", vip: false,
    notes: "Requested early check-in — room to be ready by 11 AM.",
    country: "United Kingdom", flag: "🇬🇧", checkIn: "Sep 23, 2026", checkOut: "Sep 26, 2026", nights: 3,
    profile: "James is a returning guest travelling alone on a business trip. He has stayed with us twice before and prefers a quiet, work-friendly room.",
    anticipatedNeeds: "Have the room ready ahead of his 11:30 AM early check-in request. A quiet, high-floor room away from the elevator is preferred.",
    actions: [
      { text: "Prepare the room for an 11 AM early check-in.", dept: "Housekeeping" },
      { text: "Confirm a high-floor, quiet room assignment.", dept: "Front Desk" },
    ],
    prefs: [
      { label: "Room", value: "High floor, quiet, work desk" },
      { label: "Beverage", value: "Black coffee on arrival" },
    ],
  },
  {
    name: "Priya Nair", room: "Room 902", roomType: "Junior Suite", eta: "Today, Sep 23 · 1:00 PM", vip: true,
    notes: "VIP arrival — welcome amenities and turndown setup requested.",
    country: "India", flag: "🇮🇳", checkIn: "Sep 23, 2026", checkOut: "Sep 27, 2026", nights: 4,
    profile: "Priya is a VIP loyalty member celebrating her anniversary. She has requested a quiet, romantic setup and has stayed at the property before.",
    anticipatedNeeds: "VIP welcome amenities and a turndown setup should be ready before arrival. Consider a small anniversary gesture.",
    actions: [
      { text: "Set up VIP welcome amenities and turndown service.", dept: "Housekeeping" },
      { text: "Arrange an anniversary card and small gift for the room.", dept: "Guest Services" },
    ],
    prefs: [
      { label: "Room", value: "High floor, king bed, city view" },
      { label: "Occasion", value: "Anniversary — champagne on arrival" },
    ],
  },
  {
    name: "Marco Bellini", room: "Room 340", roomType: "Connecting Family Rooms", eta: "Tomorrow, Sep 24 · 3:15 PM", vip: false,
    notes: "Connecting rooms for a family of four — rollaway bed needed.",
    country: "Italy", flag: "🇮🇹", checkIn: "Sep 24, 2026", checkOut: "Sep 28, 2026", nights: 4,
    profile: "Marco is travelling with his wife and two young children. The family has booked connecting rooms and needs a child-friendly setup.",
    anticipatedNeeds: "Connecting rooms with a rollaway bed and child-safety measures should be prepared. Family-friendly amenities can be offered on arrival.",
    actions: [
      { text: "Set up a rollaway bed and connecting-room access.", dept: "Housekeeping" },
      { text: "Add child-safety covers and a welcome kit for kids.", dept: "Guest Services" },
    ],
    prefs: [
      { label: "Room", value: "Connecting rooms, rollaway bed" },
      { label: "Family", value: "Two children — crib not required" },
    ],
  },
  {
    name: "Olivia Turner", room: "Room 1108", roomType: "Deluxe Room", eta: "Tomorrow, Sep 24 · 4:45 PM", vip: false,
    notes: "Hypoallergenic bedding requested ahead of arrival.",
    country: "United States", flag: "🇺🇸", checkIn: "Sep 24, 2026", checkOut: "Sep 25, 2026", nights: 1,
    profile: "Olivia is on a short business stopover and has a known allergy to synthetic bedding.",
    anticipatedNeeds: "Hypoallergenic bedding must be set up ahead of arrival to avoid a reaction.",
    actions: [
      { text: "Replace bedding with hypoallergenic linens.", dept: "Housekeeping" },
    ],
    prefs: [
      { label: "Room", value: "Hypoallergenic bedding" },
      { label: "Stay", value: "Short business stopover" },
    ],
  },
];

export type CheckedOutGuest = { name: string; room: string; checkIn: string; checkOut: string };
export const CHECKED_OUT_GUESTS: CheckedOutGuest[] = [
  { name: "Noah Martinez", room: "Room 118", checkIn: "Sep 18", checkOut: "Sep 22" },
  { name: "Hannah Lee", room: "Room 520", checkIn: "Sep 17", checkOut: "Sep 22" },
  { name: "Omar Haddad", room: "Room 1012", checkIn: "Sep 19", checkOut: "Sep 21" },
];


export type GuestProfileInfo = {
  room: string; roomType: string; country: string; flag: string; checkIn: string; checkOut: string; nights: number; profile: string;
  prefs: { room: string; dietary: string; language: string; temperature: string; wakeUp: string; minibar: string };
  phone: string; email: string;
};
const gp = (
  room: string, roomType: string, country: string, flag: string, checkIn: string, checkOut: string, nights: number, profile: string,
  p: [string, string, string, string, string, string], phone: string, email: string,
): GuestProfileInfo => ({ room, roomType, country, flag, checkIn, checkOut, nights, profile, prefs: { room: p[0], dietary: p[1], language: p[2], temperature: p[3], wakeUp: p[4], minibar: p[5] }, phone, email });

export const GUEST_PROFILES: Record<string, GuestProfileInfo> = {
  "Michael Johnson": gp("Room 1103", "Deluxe King", "United States", "🇺🇸", "Sep 22, 2026", "Sep 29, 2026", 7, "Michael is a loyal repeat guest who expects a five-star experience. He values quiet, attentive service and a personal apology when things go wrong.", ["Firm pillow, quiet room", "None", "English", "Standard (22°C)", "7:00 AM", "Sparkling water only"], "+1 (555) 210-4411", "michael.johnson@email.com"),
  "Ananya Kapoor": gp("Room 908", "Executive King", "India", "🇮🇳", "Sep 23, 2026", "Sep 27, 2026", 4, "Ananya is travelling with family and appreciates prompt, friendly service. She often asks for small comfort items.", ["High floor, extra pillows", "Vegetarian", "English, Hindi", "Cool (21°C)", "7:30 AM", "Standard inventory"], "+91 98200 44112", "ananya.kapoor@email.com"),
  "Emma Davis": gp("Room 501", "Deluxe King", "United Kingdom", "🇬🇧", "Sep 22, 2026", "Sep 26, 2026", 4, "Emma has a linen allergy and prefers hypoallergenic bedding. She is easygoing and values a quiet room.", ["Hypoallergenic bedding, firm pillow", "None", "English", "Standard (22°C)", "8:00 AM", "Standard inventory"], "+44 7700 900123", "emma.davis@email.com"),
  "Isabella Rossi": gp("Room 2104", "Junior Suite", "Italy", "🇮🇹", "Sep 23, 2026", "Sep 25, 2026", 2, "Isabella is visiting with friends and prefers to communicate in Italian. She likes a well-stocked room.", ["High floor, extra towels", "None", "Italian, English", "Standard (22°C)", "9:00 AM", "Wine and snacks"], "+39 340 555 0192", "isabella.rossi@email.com"),
  "Liam Anderson": gp("Room 623", "Deluxe Twin", "Australia", "🇦🇺", "Sep 21, 2026", "Sep 24, 2026", 3, "Liam is a relaxed business traveller who prefers a non-smoking room and minimal interruption.", ["Non-smoking, twin beds", "None", "English", "Standard (22°C)", "6:30 AM", "Standard inventory"], "+61 412 555 018", "liam.anderson@email.com"),
  "Rohan Sharma": gp("Room 1204", "Executive Suite", "India", "🇮🇳", "Sep 23, 2026", "Sep 24, 2026", 1, "Rohan is a loyalty member arriving for a short stay. He appreciates a personalised greeting and a late turndown.", ["High floor, late turndown", "Vegetarian", "English, Hindi", "Cool (21°C)", "8:00 AM", "Soft drinks only"], "+91 99100 55231", "rohan.sharma@email.com"),
  "Sarah Chen": gp("Room 704", "Deluxe King", "Singapore", "🇸🇬", "Sep 20, 2026", "Sep 25, 2026", 5, "Sarah is travelling with an infant and needs a baby cot and a quiet room. She prefers sparkling water and no alcohol.", ["Baby cot, quiet room", "No alcohol", "English, Mandarin", "Warm (23°C)", "7:30 AM", "Sparkling water, no alcohol"], "+65 8123 4567", "sarah.chen@email.com"),
  "David Williams": gp("Room 1501", "Accessible Suite", "Canada", "🇨🇦", "Sep 23, 2026", "Sep 26, 2026", 3, "David has reduced mobility and needs an accessible room setup, including a shower chair and bath mat.", ["Accessible room, bath mat", "None", "English", "Standard (22°C)", "8:00 AM", "Standard inventory"], "+1 (555) 678-2204", "david.williams@email.com"),
  "Ethan Ross": gp("Room 410", "Deluxe King", "United States", "🇺🇸", "Sep 19, 2026", "Sep 23, 2026", 4, "Ethan is a low-maintenance guest checking out today. He requested a fresh linen change during his stay.", ["Standard", "None", "English", "Standard (22°C)", "7:00 AM", "Standard inventory"], "+1 (555) 340-9981", "ethan.ross@email.com"),
  "Grace Kim": gp("Room 227", "Standard Twin", "South Korea", "🇰🇷", "Sep 21, 2026", "Sep 23, 2026", 2, "Grace is a quiet guest who appreciates prompt restocking of towels and amenities.", ["Twin beds", "None", "Korean, English", "Standard (22°C)", "8:30 AM", "Standard inventory"], "+82 10 5555 0142", "grace.kim@email.com"),
  "James Whitfield": gp("Room 615", "Executive Room", "United Kingdom", "🇬🇧", "Sep 23, 2026", "Sep 26, 2026", 3, "James is a returning guest travelling alone on business. He prefers a quiet, work-friendly room and an early check-in.", ["High floor, quiet, work desk", "None", "English", "Cool (21°C)", "6:30 AM", "Standard inventory"], "+44 7700 900456", "james.whitfield@email.com"),
  "Priya Nair": gp("Room 902", "Junior Suite", "India", "🇮🇳", "Sep 23, 2026", "Sep 27, 2026", 4, "Priya is celebrating her anniversary and has requested a quiet, romantic setup. She has stayed at the property before.", ["High floor, king bed, city view", "Vegetarian", "English, Malayalam", "Standard (22°C)", "8:30 AM", "Champagne on arrival"], "+91 98450 22118", "priya.nair@email.com"),
  "Marco Bellini": gp("Room 340", "Connecting Family Rooms", "Italy", "🇮🇹", "Sep 24, 2026", "Sep 28, 2026", 4, "Marco is travelling with his wife and two young children. The family needs connecting rooms and a child-friendly setup.", ["Connecting rooms, rollaway bed", "None", "Italian, English", "Standard (22°C)", "7:30 AM", "Juice and snacks for kids"], "+39 347 555 0177", "marco.bellini@email.com"),
  "Olivia Turner": gp("Room 1108", "Deluxe Room", "United States", "🇺🇸", "Sep 24, 2026", "Sep 25, 2026", 1, "Olivia is on a short business stopover and has an allergy to synthetic bedding.", ["Hypoallergenic bedding", "Gluten-free", "English", "Standard (22°C)", "6:45 AM", "Standard inventory"], "+1 (555) 902-3345", "olivia.turner@email.com"),
  "Noah Martinez": gp("Room 118", "Deluxe King", "Spain", "🇪🇸", "Sep 18, 2026", "Sep 22, 2026", 4, "Noah enjoyed his stay and appreciated the attentive turndown service and extra water bottles.", ["Standard", "None", "Spanish, English", "Standard (22°C)", "8:00 AM", "Standard inventory"], "+34 612 555 019", "noah.martinez@email.com"),
  "Hannah Lee": gp("Room 520", "Junior Suite", "Singapore", "🇸🇬", "Sep 17, 2026", "Sep 22, 2026", 5, "Hannah expressed genuine satisfaction with her room and overall experience. She is a content and relaxed guest who appreciates warm and attentive service.", ["Standard", "None", "English", "Standard (22°C)", "8:00 AM", "Standard inventory"], "+65 9123 4501", "hannah.lee@email.com"),
  "Omar Haddad": gp("Room 1012", "Deluxe King", "United Arab Emirates", "🇦🇪", "Sep 19, 2026", "Sep 21, 2026", 2, "Omar stayed for a short business trip and preferred Arabic-language communication.", ["High floor, king bed", "Halal only", "Arabic, English", "Cool (21°C)", "6:00 AM", "Standard inventory"], "+971 50 555 0166", "omar.haddad@email.com"),
};

export type RoomStatus = "Clean" | "In Progress" | "Dirty" | "Out of Service";
export type HkRoom = { number: string; floor: number; status: RoomStatus; assignee: string | null };
export const ROOMS: HkRoom[] = [
  { number: "Room 305", floor: 3, status: "In Progress", assignee: "Maria Santos" },
  { number: "Room 410", floor: 4, status: "Clean", assignee: null },
  { number: "Room 501", floor: 5, status: "In Progress", assignee: "Aanya Khan" },
  { number: "Room 623", floor: 6, status: "Dirty", assignee: null },
  { number: "Room 704", floor: 7, status: "Dirty", assignee: null },
  { number: "Room 812", floor: 8, status: "Dirty", assignee: null },
  { number: "Room 908", floor: 9, status: "In Progress", assignee: "Aanya Khan" },
  { number: "Room 1103", floor: 11, status: "Out of Service", assignee: null },
  { number: "Room 1204", floor: 12, status: "In Progress", assignee: "Fatima Khan" },
  { number: "Room 1501", floor: 15, status: "Out of Service", assignee: null },
  { number: "Room 2104", floor: 21, status: "Clean", assignee: null },
  { number: "Room 227", floor: 2, status: "Clean", assignee: null },
];

export const STATUS_ORDER = ["Available", "Busy", "On Break", "Off work"] as const;
export const PRESENCE_DOT: Record<Presence, string> = { Available: "bg-emerald-500", Busy: "bg-blue-500", "On Break": "bg-amber-400", "Off work": "bg-gray-300" };

export const NOW_LABEL = NOW;
