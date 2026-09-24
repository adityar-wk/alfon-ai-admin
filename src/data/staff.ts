export type Status = "On Duty" | "On Break" | "Off Duty";
export type ShiftName = "Morning" | "Afternoon" | "Night";

export type Staff = {
  id: string;
  name: string;
  role: string;
  dept: string;
  status: Status;
  task: string | null;
  shift: ShiftName;
  tint: string;
};

export const SHIFT_TIME: Record<ShiftName, string> = {
  Morning: "7:00 AM – 3:00 PM",
  Afternoon: "3:00 PM – 11:00 PM",
  Night: "11:00 PM – 7:00 AM",
};

export const TINTS = [
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
];

const SEED: Omit<Staff, "tint">[] = [
  { id: "#EMP001", name: "Sarah Ali", role: "Supervisor", dept: "Housekeeping", status: "On Duty", task: "Room 1401 Cleaning", shift: "Morning" },
  { id: "#EMP002", name: "David Kim", role: "Technician", dept: "Engineering", status: "On Duty", task: "AC Repair – 1401", shift: "Morning" },
  { id: "#EMP003", name: "Maria Lopez", role: "Guest Relations", dept: "Guest Services", status: "On Break", task: null, shift: "Morning" },
  { id: "#EMP004", name: "James Wilson", role: "Front Desk Agent", dept: "Front Desk", status: "On Duty", task: "Guest Check-in", shift: "Morning" },
  { id: "#EMP005", name: "Ali Hassan", role: "F&B Associate", dept: "F&B", status: "On Duty", task: "Room Service – 1203", shift: "Afternoon" },
  { id: "#EMP006", name: "Olivia Brown", role: "Security Officer", dept: "Security", status: "Off Duty", task: null, shift: "Night" },
  { id: "#EMP007", name: "Daniel Wilson", role: "Concierge", dept: "Concierge", status: "On Duty", task: "Guest Assistance", shift: "Morning" },
  { id: "#EMP008", name: "Fatima Khan", role: "Housekeeping", dept: "Housekeeping", status: "On Duty", task: "Room 1202 Cleaning", shift: "Morning" },
  { id: "#EMP009", name: "Ravi Shankar", role: "Technician", dept: "Engineering", status: "On Break", task: null, shift: "Afternoon" },
  { id: "#EMP010", name: "Chen Li", role: "Guest Relations", dept: "Guest Services", status: "On Duty", task: "Guest Check-in", shift: "Morning" },
  { id: "#EMP011", name: "Lisa Morgan", role: "Housekeeping", dept: "Housekeeping", status: "On Duty", task: "Room 1502 Linen Change", shift: "Morning" },
  { id: "#EMP012", name: "Maria Santos", role: "Housekeeping", dept: "Housekeeping", status: "On Break", task: null, shift: "Afternoon" },
  { id: "#EMP013", name: "Mike Rogers", role: "Technician", dept: "Engineering", status: "On Duty", task: "AC Not Working – 2205", shift: "Morning" },
  { id: "#EMP014", name: "Raj Patel", role: "Supervisor", dept: "Engineering", status: "On Duty", task: null, shift: "Morning" },
  { id: "#EMP015", name: "Sarah Khan", role: "Front Desk Agent", dept: "Front Desk", status: "On Duty", task: "Late Checkout – 1203", shift: "Morning" },
  { id: "#EMP016", name: "Noah Bennett", role: "Supervisor", dept: "Front Desk", status: "Off Duty", task: null, shift: "Night" },
];

export const INITIAL: Staff[] = SEED.map((s, i) => ({ ...s, tint: TINTS[i % TINTS.length] }));

