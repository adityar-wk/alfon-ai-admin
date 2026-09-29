/** Network-wide default department templates — what every new hotel's departments and SLAs start from. */

export type Priority = "Urgent" | "High" | "Medium" | "Low";

export const SLA_BY_PRIORITY: Record<Priority, { response: string; resolve: string }> = {
  Urgent: { response: "5 min", resolve: "20 min" },
  High: { response: "10 min", resolve: "45 min" },
  Medium: { response: "20 min", resolve: "90 min" },
  Low: { response: "40 min", resolve: "180 min" },
};

export type TemplateService = {
  name: string;
  description: string;
  response: string;
  resolve: string;
};

export type DeptTemplateData = {
  slug: string;
  name: string;
  description: string;
  services: TemplateService[];
};

type SeedService = { name: string; description: string; priority: Priority };
type SeedDept = { slug: string; name: string; description: string; services: SeedService[] };

const SEED_TEMPLATES: SeedDept[] = [
  {
    slug: "front-desk",
    name: "Front Desk",
    description: "First point of contact for guests — handles arrivals, departures and everyday requests at the desk.",
    services: [
      { name: "Guest Check-in", description: "Verify identity, confirm the reservation and hand over room keys.", priority: "High" },
      { name: "Guest Check-out", description: "Settle the folio and close out the stay.", priority: "High" },
      { name: "Room Assignment & Upgrades", description: "Assign rooms and process upgrade requests.", priority: "Medium" },
      { name: "Late Check-out Request", description: "Extend a guest's check-out time where availability allows.", priority: "Medium" },
      { name: "Invoice & Billing Query", description: "Resolve questions about charges on the guest folio.", priority: "Medium" },
      { name: "Lost & Found Enquiry", description: "Log and track guest enquiries about lost items.", priority: "Low" },
      { name: "Wake-up Call Scheduling", description: "Set a wake-up call for a guest's room.", priority: "Low" },
    ],
  },
  {
    slug: "guest-services",
    name: "Guest Services",
    description: "Concierge-style assistance for day-to-day guest comfort and requests.",
    services: [
      { name: "Concierge Requests", description: "General assistance with guest requests throughout the stay.", priority: "Medium" },
      { name: "Transport Booking", description: "Arrange taxis, transfers and car hire for guests.", priority: "Medium" },
      { name: "Special Occasion Setup", description: "Prepare a room for a birthday, anniversary or celebration.", priority: "Medium" },
      { name: "Amenity Requests", description: "Provide extra pillows, chargers and other in-room amenities.", priority: "Low" },
      { name: "Local Recommendations", description: "Suggest restaurants, attractions and things to do nearby.", priority: "Low" },
      { name: "Guest Feedback Follow-up", description: "Follow up on feedback left by a guest during their stay.", priority: "Low" },
    ],
  },
  {
    slug: "concierge",
    name: "Concierge",
    description: "Curates guest experiences — reservations, tickets and special arrangements.",
    services: [
      { name: "Airport Transfer", description: "Arrange pickup or drop-off transport to the airport.", priority: "High" },
      { name: "Restaurant Reservations", description: "Book a table at an on-site or partner restaurant.", priority: "Medium" },
      { name: "Tour & Activity Booking", description: "Arrange tours, excursions and local activities.", priority: "Medium" },
      { name: "Ticket Arrangements", description: "Secure tickets for shows, attractions and events.", priority: "Medium" },
      { name: "Taxi & Car Hire", description: "Book a taxi or arrange a rental car for a guest.", priority: "Medium" },
      { name: "Spa Booking", description: "Reserve a spa treatment or wellness appointment.", priority: "Low" },
    ],
  },
  {
    slug: "food-and-beverage",
    name: "Food and Beverage",
    description: "Runs in-house dining, banquets and beverage service across the property.",
    services: [
      { name: "Room Service Delivery", description: "Deliver food and drink orders to a guest's room.", priority: "High" },
      { name: "Special Dietary Requests", description: "Accommodate allergies and dietary preferences for a meal.", priority: "High" },
      { name: "Restaurant Service", description: "Serve guests dining at an on-site restaurant.", priority: "Medium" },
      { name: "Banquet & Events", description: "Coordinate food and beverage for private events and banquets.", priority: "Medium" },
      { name: "Bar Service", description: "Serve drinks at the hotel bar or lounge.", priority: "Medium" },
      { name: "Minibar Restocking", description: "Refill an in-room minibar after use.", priority: "Low" },
    ],
  },
  {
    slug: "housekeeping",
    name: "Housekeeping",
    description: "Maintains cleanliness and comfort across all guest rooms and public areas.",
    services: [
      { name: "Room Cleaning", description: "Standard daily cleaning of an occupied guest room.", priority: "Medium" },
      { name: "Extra Towels & Linen", description: "Deliver additional towels or linen to a room.", priority: "Medium" },
      { name: "Rollaway Bed Setup", description: "Set up an extra rollaway bed in a guest room.", priority: "Medium" },
      { name: "Turndown Service", description: "Prepare a room for the evening with turndown service.", priority: "Low" },
      { name: "Deep Cleaning", description: "A thorough clean of a room beyond the daily standard.", priority: "Low" },
      { name: "Amenity Restocking", description: "Refill toiletries and in-room amenities.", priority: "Low" },
      { name: "Minibar Check", description: "Check and log minibar consumption in a room.", priority: "Low" },
    ],
  },
  {
    slug: "laundry",
    name: "Laundry",
    description: "Handles guest and in-house laundry, dry cleaning and linen turnaround.",
    services: [
      { name: "Express Laundry", description: "Same-day laundry turnaround for an urgent request.", priority: "High" },
      { name: "Guest Laundry Pickup", description: "Collect a guest's laundry for washing.", priority: "Medium" },
      { name: "Dry Cleaning", description: "Dry clean garments submitted by a guest.", priority: "Medium" },
      { name: "Stain Treatment", description: "Treat a stain on a guest garment before laundering.", priority: "Medium" },
      { name: "Ironing & Pressing", description: "Press or iron a guest's garment.", priority: "Low" },
    ],
  },
  {
    slug: "engineering",
    name: "Engineering",
    description: "Maintains hotel systems, equipment and infrastructure in working order.",
    services: [
      { name: "Electrical & Plumbing Fixes", description: "Resolve an electrical or plumbing fault in a room.", priority: "Urgent" },
      { name: "Lift Breakdown", description: "Respond to an elevator malfunction.", priority: "Urgent" },
      { name: "Repair Requests", description: "Fix a reported issue with room fixtures or equipment.", priority: "High" },
      { name: "HVAC Servicing", description: "Service or repair heating and cooling systems.", priority: "High" },
      { name: "TV & Remote Issues", description: "Troubleshoot a guest room television or remote.", priority: "Medium" },
      { name: "Furniture Repair", description: "Repair or replace damaged furniture in a room.", priority: "Low" },
      { name: "Preventive Maintenance", description: "Scheduled upkeep of hotel systems and equipment.", priority: "Low" },
    ],
  },
  {
    slug: "room-service",
    name: "Room Service",
    description: "Delivers in-room dining and handles guest food & beverage requests.",
    services: [
      { name: "In-Room Dining Order", description: "Take and deliver a guest's in-room dining order.", priority: "High" },
      { name: "Special Dietary Requests", description: "Accommodate a dietary requirement for an in-room order.", priority: "High" },
      { name: "Special Occasion Delivery", description: "Deliver a celebratory food or drink order to a room.", priority: "Medium" },
      { name: "Late Night Menu", description: "Deliver from the late-night dining menu.", priority: "Medium" },
      { name: "Tray Collection", description: "Collect used trays and dishware from a guest room.", priority: "Low" },
    ],
  },
  {
    slug: "security",
    name: "Security",
    description: "Safeguards guests, staff and property across the hotel premises.",
    services: [
      { name: "Incident Response", description: "Respond to a security incident or safety concern.", priority: "Urgent" },
      { name: "Room Access Request", description: "Grant access to a locked-out guest room.", priority: "High" },
      { name: "CCTV Monitoring", description: "Monitor hotel premises via the CCTV network.", priority: "Medium" },
      { name: "Access Control", description: "Manage access to restricted areas of the property.", priority: "Medium" },
      { name: "Guest Escort Requests", description: "Escort a guest across the property on request.", priority: "Medium" },
      { name: "Lost Property Report", description: "Log a report of lost or missing property.", priority: "Low" },
    ],
  },
  {
    slug: "it",
    name: "IT",
    description: "Supports hotel technology systems, guest Wi-Fi and PMS infrastructure.",
    services: [
      { name: "PMS System Support", description: "Resolve an issue with the property management system.", priority: "Urgent" },
      { name: "Wi-Fi Support", description: "Troubleshoot a guest or staff Wi-Fi connectivity issue.", priority: "High" },
      { name: "Device Troubleshooting", description: "Help a guest with a personal device issue.", priority: "Medium" },
      { name: "Smart TV & Casting", description: "Help a guest cast or connect to the in-room smart TV.", priority: "Low" },
      { name: "Printing Request", description: "Print a document on behalf of a guest.", priority: "Low" },
    ],
  },
  {
    slug: "operator",
    name: "Operator",
    description: "Manages the hotel switchboard — call routing, wake-up calls and messaging.",
    services: [
      { name: "Emergency Dispatch", description: "Route an emergency call to the right responder.", priority: "Urgent" },
      { name: "Call Routing", description: "Route an incoming call to the correct department or room.", priority: "High" },
      { name: "Wake-up Calls", description: "Place a scheduled wake-up call to a guest room.", priority: "Medium" },
      { name: "Message Handling", description: "Take and deliver a message for a guest.", priority: "Low" },
      { name: "Outside Line Requests", description: "Connect a guest to an outside line.", priority: "Low" },
    ],
  },
  {
    slug: "reservations",
    name: "Reservations",
    description: "Manages bookings, rates and group reservations ahead of guest arrival.",
    services: [
      { name: "Booking Management", description: "Create or update a guest reservation.", priority: "Medium" },
      { name: "Group Bookings", description: "Coordinate a multi-room group reservation.", priority: "Medium" },
      { name: "Cancellation Request", description: "Process a guest's booking cancellation.", priority: "Medium" },
      { name: "Rate Configuration", description: "Set or adjust room rates and packages.", priority: "Low" },
      { name: "Loyalty Points Query", description: "Answer a guest's question about loyalty points.", priority: "Low" },
    ],
  },
];

export const DEPT_TEMPLATES: DeptTemplateData[] = SEED_TEMPLATES.map((d) => ({
  ...d,
  services: d.services.map((s) => ({ name: s.name, description: s.description, ...SLA_BY_PRIORITY[s.priority] })),
}));

/** in-memory store so edits made in the Super Admin UI stick for the session */
export const STORE = {
  depts: DEPT_TEMPLATES.map((d) => ({ ...d, services: d.services.map((s) => ({ ...s })) })),
};

export function getDeptTemplate(slug: string) {
  return STORE.depts.find((d) => d.slug === slug);
}
