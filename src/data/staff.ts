export type ShiftName = "Morning" | "Afternoon" | "Night";

export type Staff = {
  id: string;
  name: string;
  role: string;
  dept: string;
  task: string | null;
  shift: ShiftName;
  tint: string;
  phone?: string;
};

export const SHIFT_TIME: Record<ShiftName, string> = {
  Morning: "7:00 AM – 3:00 PM",
  Afternoon: "3:00 PM – 11:00 PM",
  Night: "11:00 PM – 7:00 AM",
};

export const TINTS = ["bg-brand-tint text-brand"];

const SEED: Omit<Staff, "tint">[] = [
  { id: "#EMP001", name: "Sarah Ali", role: "Supervisor", dept: "Housekeeping", task: "Room 1401 Cleaning", shift: "Morning", phone: "+1 212 555 0101" },
  { id: "#EMP002", name: "David Kim", role: "Technician", dept: "Engineering", task: "AC Repair – 1401", shift: "Morning", phone: "+1 212 555 0102" },
  { id: "#EMP003", name: "Maria Lopez", role: "Guest Relations", dept: "Guest Services", task: null, shift: "Morning", phone: "+1 212 555 0103" },
  { id: "#EMP004", name: "James Wilson", role: "Front Desk Agent", dept: "Front Desk", task: "Guest Check-in", shift: "Morning", phone: "+1 212 555 0104" },
  { id: "#EMP005", name: "Ali Hassan", role: "F&B Associate", dept: "F&B", task: "Room Service – 1203", shift: "Afternoon", phone: "+1 212 555 0105" },
  { id: "#EMP006", name: "Olivia Brown", role: "Security Officer", dept: "Security", task: null, shift: "Night", phone: "+1 212 555 0106" },
  { id: "#EMP007", name: "Daniel Wilson", role: "Concierge", dept: "Concierge", task: "Guest Assistance", shift: "Morning", phone: "+1 212 555 0107" },
  { id: "#EMP008", name: "Fatima Khan", role: "Housekeeping", dept: "Housekeeping", task: "Room 1202 Cleaning", shift: "Morning", phone: "+1 212 555 0108" },
  { id: "#EMP009", name: "Ravi Shankar", role: "Technician", dept: "Engineering", task: null, shift: "Afternoon", phone: "+1 212 555 0109" },
  { id: "#EMP010", name: "Chen Li", role: "Guest Relations", dept: "Guest Services", task: "Guest Check-in", shift: "Morning", phone: "+1 212 555 0110" },
  { id: "#EMP011", name: "Lisa Morgan", role: "Housekeeping", dept: "Housekeeping", task: "Room 1502 Linen Change", shift: "Morning", phone: "+1 212 555 0111" },
  { id: "#EMP012", name: "Maria Santos", role: "Housekeeping", dept: "Housekeeping", task: null, shift: "Afternoon", phone: "+1 212 555 0112" },
  { id: "#EMP013", name: "Mike Rogers", role: "Technician", dept: "Engineering", task: "AC Not Working – 2205", shift: "Morning", phone: "+1 212 555 0113" },
  { id: "#EMP014", name: "Raj Patel", role: "Supervisor", dept: "Engineering", task: null, shift: "Morning", phone: "+1 212 555 0114" },
  { id: "#EMP015", name: "Sarah Khan", role: "Front Desk Agent", dept: "Front Desk", task: "Late Checkout – 1203", shift: "Morning", phone: "+1 212 555 0115" },
  { id: "#EMP016", name: "Noah Bennett", role: "Supervisor", dept: "Front Desk", task: null, shift: "Night", phone: "+1 212 555 0116" },
];

export const INITIAL: Staff[] = SEED.map((s, i) => ({ ...s, tint: TINTS[i % TINTS.length] }));

