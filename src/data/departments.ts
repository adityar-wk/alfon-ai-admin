export type DeptMember = {
  name: string;
  role: "Department Head" | "Supervisor" | "Line Staff";
  reports: string;
  status: "Active" | "Inactive";
};

export type DeptService = {
  name: string;
  description?: string;
  active: boolean;
};

export type Department = {
  slug: string;
  code: string;
  name: string;
  description: string;
  members: DeptMember[];
  services: DeptService[];
};

export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const DEPARTMENTS: Department[] = [
  {
    slug: "front-desk",
    code: "FD",
    name: "Front Desk",
    description:
      "First point of contact for guests. Handles arrivals, departures and room assignment.",
    members: [
      { name: "Sarah Kim", role: "Department Head", reports: "—", status: "Active" },
      { name: "Noah Bennett", role: "Supervisor", reports: "Sarah Kim", status: "Active" },
      { name: "Ethan Brooks", role: "Line Staff", reports: "Noah Bennett", status: "Active" },
    ],
    services: [
      { name: "Guest Check-in", active: true },
      { name: "Guest Check-out", active: true },
      { name: "Room Assignment & Upgrades", active: true },
      { name: "Key Card Issuance", active: true },
      { name: "Guest Registration", active: true },
    ],
  },
  {
    slug: "guest-services",
    code: "GS",
    name: "Guest Services",
    description: "Handles guest requests, concierge-style assistance and day-to-day comfort needs.",
    members: [
      { name: "Priya Nair", role: "Department Head", reports: "—", status: "Active" },
      { name: "Omar Farouk", role: "Supervisor", reports: "Priya Nair", status: "Active" },
      { name: "Chloe Adams", role: "Line Staff", reports: "Omar Farouk", status: "Active" },
    ],
    services: [
      { name: "Concierge Requests", active: true },
      { name: "Luggage Assistance", active: true },
      { name: "Local Recommendations", active: true },
      { name: "Transport Booking", active: true },
    ],
  },
  {
    slug: "concierge",
    code: "CN",
    name: "Concierge",
    description: "Curates guest experiences — reservations, tickets and special arrangements.",
    members: [
      { name: "John Stevens", role: "Department Head", reports: "—", status: "Active" },
      { name: "Victor Lane", role: "Supervisor", reports: "John Stevens", status: "Active" },
      { name: "Nina Torres", role: "Line Staff", reports: "Victor Lane", status: "Active" },
    ],
    services: [
      { name: "Restaurant Reservations", active: true },
      { name: "Tour & Activity Booking", active: true },
      { name: "Ticket Arrangements", active: true },
      { name: "Special Occasion Setup", active: true },
    ],
  },
  {
    slug: "food-and-beverage",
    code: "FB",
    name: "Food and Beverage",
    description: "Runs in-house dining, banquets and beverage service across the property.",
    members: [
      { name: "Tom Hassan", role: "Department Head", reports: "—", status: "Active" },
      { name: "Diego Alvarez", role: "Supervisor", reports: "Tom Hassan", status: "Active" },
      { name: "Hannah Lee", role: "Line Staff", reports: "Diego Alvarez", status: "Active" },
    ],
    services: [
      { name: "Room Service Delivery", active: true },
      { name: "Restaurant Service", active: true },
      { name: "Banquet & Events", active: true },
      { name: "Minibar Restocking", active: true },
    ],
  },
  {
    slug: "housekeeping",
    code: "HK",
    name: "Housekeeping",
    description:
      "Responsible for maintaining cleanliness and comfort across all guest rooms and public areas. Ensures high standards of hygiene, presentation, and guest satisfaction.",
    members: [
      { name: "James Chen", role: "Department Head", reports: "—", status: "Active" },
      { name: "Lisa Mitchell", role: "Supervisor", reports: "James Chen", status: "Active" },
      { name: "Rahul S.", role: "Supervisor", reports: "James Chen", status: "Active" },
      { name: "Maria Santos", role: "Line Staff", reports: "Lisa Mitchell", status: "Active" },
      { name: "Priya Nair", role: "Line Staff", reports: "Lisa Mitchell", status: "Active" },
    ],
    services: [
      { name: "Room Cleaning", active: true },
      { name: "Extra Towels", active: true },
      { name: "Turndown Service", active: true },
      { name: "Linen Replacement", active: true },
      { name: "Amenities Refill", active: true },
    ],
  },
  {
    slug: "laundry",
    code: "LD",
    name: "Laundry",
    description: "Handles guest and in-house laundry, dry cleaning and linen turnaround.",
    members: [
      { name: "Carlos Mendes", role: "Department Head", reports: "—", status: "Active" },
      { name: "Fatima Noor", role: "Supervisor", reports: "Carlos Mendes", status: "Active" },
      { name: "Leo Martins", role: "Line Staff", reports: "Fatima Noor", status: "Active" },
    ],
    services: [
      { name: "Guest Laundry Pickup", active: true },
      { name: "Dry Cleaning", active: true },
      { name: "Linen Laundering", active: true },
      { name: "Express Service", active: true },
    ],
  },
  {
    slug: "engineering",
    code: "EN",
    name: "Engineering",
    description: "Maintains hotel systems, equipment and infrastructure in working order.",
    members: [
      { name: "Daniel Okafor", role: "Department Head", reports: "—", status: "Active" },
      { name: "Ryan Coleman", role: "Supervisor", reports: "Daniel Okafor", status: "Active" },
      { name: "Zara Khan", role: "Line Staff", reports: "Ryan Coleman", status: "Active" },
    ],
    services: [
      { name: "Preventive Maintenance", active: true },
      { name: "Repair Requests", active: true },
      { name: "HVAC Servicing", active: true },
      { name: "Electrical & Plumbing Fixes", active: true },
    ],
  },
  {
    slug: "room-service",
    code: "RS",
    name: "Room Service",
    description: "Delivers in-room dining and handles guest food & beverage requests.",
    members: [
      { name: "Anna Petrov", role: "Department Head", reports: "—", status: "Active" },
      { name: "Marco Silva", role: "Supervisor", reports: "Anna Petrov", status: "Active" },
      { name: "Ivy Chen", role: "Line Staff", reports: "Marco Silva", status: "Active" },
    ],
    services: [
      { name: "In-Room Dining Delivery", active: true },
      { name: "Special Dietary Requests", active: true },
      { name: "Late Night Menu", active: true },
      { name: "Tray Pickup", active: true },
    ],
  },
  {
    slug: "security",
    code: "SC",
    name: "Security",
    description: "Safeguards guests, staff and property across the hotel premises.",
    members: [
      { name: "Marcus Reid", role: "Department Head", reports: "—", status: "Active" },
      { name: "Derek Cole", role: "Supervisor", reports: "Marcus Reid", status: "Active" },
      { name: "Simone Park", role: "Line Staff", reports: "Derek Cole", status: "Active" },
    ],
    services: [
      { name: "CCTV Monitoring", active: true },
      { name: "Access Control", active: true },
      { name: "Incident Response", active: true },
      { name: "Guest Escort Requests", active: true },
    ],
  },
  {
    slug: "it",
    code: "IT",
    name: "IT",
    description: "Supports hotel technology systems, guest Wi-Fi and PMS infrastructure.",
    members: [
      { name: "Priya Sharma", role: "Department Head", reports: "—", status: "Active" },
      { name: "Aditya Rao", role: "Supervisor", reports: "Priya Sharma", status: "Active" },
      { name: "Kevin Wu", role: "Line Staff", reports: "Aditya Rao", status: "Active" },
    ],
    services: [
      { name: "Wi-Fi Support", active: true },
      { name: "Device Troubleshooting", active: true },
      { name: "PMS System Support", active: true },
      { name: "Guest Tech Assistance", active: true },
    ],
  },
  {
    slug: "operator",
    code: "OP",
    name: "Operator",
    description: "Manages the hotel switchboard — call routing, wake-up calls and messaging.",
    members: [
      { name: "Rahul Verma", role: "Department Head", reports: "—", status: "Active" },
      { name: "Naomi Fields", role: "Supervisor", reports: "Rahul Verma", status: "Active" },
      { name: "Owen Grant", role: "Line Staff", reports: "Naomi Fields", status: "Active" },
    ],
    services: [
      { name: "Call Routing", active: true },
      { name: "Wake-up Calls", active: true },
      { name: "Message Handling", active: true },
      { name: "Emergency Dispatch", active: true },
    ],
  },
  {
    slug: "reservations",
    code: "RSV",
    name: "Reservations",
    description: "Manages bookings, rates and group reservations ahead of guest arrival.",
    members: [
      { name: "Linda Park", role: "Department Head", reports: "—", status: "Active" },
      { name: "Mateo Rossi", role: "Supervisor", reports: "Linda Park", status: "Active" },
      { name: "Bella Cruz", role: "Line Staff", reports: "Mateo Rossi", status: "Active" },
    ],
    services: [
      { name: "Booking Management", active: true },
      { name: "Rate Configuration", active: true },
      { name: "Group Bookings", active: true },
      { name: "Cancellation Handling", active: true },
    ],
  },
];

export function addDepartment(d: Department) {
  DEPARTMENTS.push(d);
}

export function getDepartment(slug: string) {
  return DEPARTMENTS.find((d) => d.slug === slug);
}
