// Realistic sample data for the Alfon AI prototype. All frontend state — no backend.

window.hotelData = {
  name: "Layana Resort & Spa",
  location: "Tokyo, Japan",
  rooms: 245,
  rating: 5,
  checkInToday: 34,
  checkOutToday: 28,
  occupancy: 87,
};

window.dutyManager = { name: "Franck Delen", role: "Duty Manager", initials: "FD" };

window.preArrivalMessageTemplate = (guest) => `Dear ${guest.name},

We are delighted to welcome you to Layana Resort & Spa. Your arrival is confirmed for ${guest.checkIn} and we look forward to having you with us.

To ensure we have everything perfectly prepared for your arrival, we would love to learn a little more about your preferences. Could you spare a moment to share the following?

- Do you have any room preferences? (floor level, pillow type, temperature)
- Any dietary requirements we should be aware of?
- What is the purpose of your visit? (leisure, business, special occasion)
- Do you require an airport transfer?

We look forward to welcoming you personally.

Warm regards,
Layana Resort & Spa`;

window.preArrivalGuests = [
  {
    id: 1, name: "Emma Davis", initials: "ED", vip: false, room: "1608", roomType: "Executive Suite",
    checkIn: "Today 3:00 PM", checkOut: "May 31", nights: 7, status: "Message Sent", hasWhatsApp: true,
    phone: "+91 98765 11201", email: "emma.davis@example.com", arrivalDay: "today",
    timeline: [
      { label: "Guest imported from arrival report", time: "May 24, 08:45 AM", done: true },
      { label: "Pre-arrival message sent", time: "May 24, 09:00 AM", done: true },
      { label: "Guest opened message", time: "Pending", done: false },
      { label: "Guest responded", time: "Pending", done: false },
      { label: "Preferences collected", time: "Pending", done: false },
      { label: "Guest arrives", time: "Today, 3:00 PM", done: false },
      { label: "Transfer to In-House", time: "Pending front desk action", done: false },
    ],
    preferences: null,
    messages: [
      { from: "ai", text: "Dear Emma Davis, we are delighted to welcome you to Layana Resort & Spa. Your arrival is confirmed for Today 3:00 PM...", time: "09:00 AM" },
    ],
  },
  {
    id: 2, name: "Liam Anderson", initials: "LA", vip: false, room: "1802", roomType: "Deluxe Room",
    checkIn: "Today 4:00 PM", checkOut: "May 28", nights: 4, status: "Responded", hasWhatsApp: true,
    phone: "+91 98765 11202", email: "liam.anderson@example.com", arrivalDay: "today",
    timeline: [
      { label: "Guest imported from arrival report", time: "May 24, 08:45 AM", done: true },
      { label: "Pre-arrival message sent", time: "May 24, 09:00 AM", done: true },
      { label: "Guest opened message", time: "May 24, 11:23 AM", done: true },
      { label: "Guest responded", time: "May 24, 11:45 AM", done: true },
      { label: "Preferences collected", time: "Pending", done: false },
      { label: "Guest arrives", time: "Today, 4:00 PM", done: false },
      { label: "Transfer to In-House", time: "Pending front desk action", done: false },
    ],
    preferences: null,
    messages: [
      { from: "ai", text: "Dear Liam Anderson, we are delighted to welcome you to Layana Resort & Spa...", time: "09:00 AM" },
      { from: "guest", text: "Thank you! Looking forward to it.", time: "11:45 AM" },
    ],
  },
  {
    id: 3, name: "Olivia Brown", initials: "OB", vip: false, room: "1203", roomType: "Standard Room",
    checkIn: "Today 5:00 PM", checkOut: "May 27", nights: 3, status: "Pending", hasWhatsApp: true,
    phone: "+91 98765 11203", email: "olivia.brown@example.com", arrivalDay: "today",
    timeline: [
      { label: "Guest imported from arrival report", time: "May 24, 08:45 AM", done: true },
      { label: "Pre-arrival message sent", time: "Pending", done: false },
      { label: "Guest opened message", time: "Pending", done: false },
      { label: "Guest responded", time: "Pending", done: false },
      { label: "Preferences collected", time: "Pending", done: false },
      { label: "Guest arrives", time: "Today, 5:00 PM", done: false },
      { label: "Transfer to In-House", time: "Pending front desk action", done: false },
    ],
    preferences: null,
    messages: [],
  },
  {
    id: 4, name: "Sarah Mitchell", initials: "SM", vip: false, room: "2501", roomType: "Presidential Suite",
    checkIn: "Today 6:00 PM", checkOut: "May 26", nights: 2, status: "Responded", hasWhatsApp: true,
    phone: "+91 98765 11204", email: "sarah.mitchell@example.com", arrivalDay: "today",
    timeline: [
      { label: "Guest imported from arrival report", time: "May 24, 08:45 AM", done: true },
      { label: "Pre-arrival message sent", time: "May 24, 09:00 AM", done: true },
      { label: "Guest opened message", time: "May 24, 10:10 AM", done: true },
      { label: "Guest responded", time: "May 24, 10:30 AM", done: true },
      { label: "Preferences collected", time: "Pending", done: false },
      { label: "Guest arrives", time: "Today, 6:00 PM", done: false },
      { label: "Transfer to In-House", time: "Pending front desk action", done: false },
    ],
    preferences: null,
    messages: [
      { from: "ai", text: "Dear Sarah Mitchell, we are delighted to welcome you to Layana Resort & Spa...", time: "09:00 AM" },
      { from: "guest", text: "Hi! Yes, could I get a quiet room away from the elevator please?", time: "10:30 AM" },
    ],
  },
  {
    id: 5, name: "James Wilson", initials: "JW", vip: false, room: "2205", roomType: "Deluxe Room",
    checkIn: "Today 7:00 PM", checkOut: "May 29", nights: 5, status: "No WhatsApp", hasWhatsApp: false,
    phone: "+91 98765 11205", email: "james.wilson@example.com", arrivalDay: "today",
    timeline: [
      { label: "Guest imported from arrival report", time: "May 24, 08:45 AM", done: true },
      { label: "Pre-arrival message sent", time: "Not available — no WhatsApp number", done: false },
      { label: "Guest arrives", time: "Today, 7:00 PM", done: false },
      { label: "Transfer to In-House", time: "Pending front desk action", done: false },
    ],
    preferences: null,
    messages: [],
  },
  {
    id: 6, name: "Noah Martinez", initials: "NM", vip: false, room: "1802", roomType: "Standard Room",
    checkIn: "Today 8:00 PM", checkOut: "May 25", nights: 1, status: "Pending", hasWhatsApp: true,
    phone: "+91 98765 11206", email: "noah.martinez@example.com", arrivalDay: "today",
    timeline: [
      { label: "Guest imported from arrival report", time: "May 24, 08:45 AM", done: true },
      { label: "Pre-arrival message sent", time: "Pending", done: false },
      { label: "Guest opened message", time: "Pending", done: false },
      { label: "Guest responded", time: "Pending", done: false },
      { label: "Preferences collected", time: "Pending", done: false },
      { label: "Guest arrives", time: "Today, 8:00 PM", done: false },
      { label: "Transfer to In-House", time: "Pending front desk action", done: false },
    ],
    preferences: null,
    messages: [],
  },
  {
    id: 7, name: "Isabella Rossi", initials: "IR", vip: false, room: "2104", roomType: "Junior Suite",
    checkIn: "Tomorrow 2:00 PM", checkOut: "Jun 02", nights: 6, status: "Preferences Collected", hasWhatsApp: true,
    phone: "+91 98765 11207", email: "isabella.rossi@example.com", arrivalDay: "tomorrow",
    timeline: [
      { label: "Guest imported from arrival report", time: "May 24, 08:45 AM", done: true },
      { label: "Pre-arrival message sent", time: "May 24, 09:00 AM", done: true },
      { label: "Guest opened message", time: "May 24, 09:40 AM", done: true },
      { label: "Guest responded", time: "May 24, 10:02 AM", done: true },
      { label: "Preferences collected", time: "May 24, 10:05 AM", done: true },
      { label: "Guest arrives", time: "Tomorrow, 2:00 PM", done: false },
      { label: "Transfer to In-House", time: "Pending front desk action", done: false },
    ],
    preferences: [
      { icon: "🛏", label: "High floor" },
      { icon: "🍽", label: "Vegetarian" },
      { icon: "🗣", label: "English" },
      { icon: "🌡", label: "Cool room" },
      { icon: "🚗", label: "Airport transfer needed" },
    ],
    messages: [
      { from: "ai", text: "Dear Isabella Rossi, we are delighted to welcome you to Layana Resort & Spa...", time: "09:00 AM" },
      { from: "guest", text: "Hello! I'd love a high floor room, and I'm vegetarian. Could you arrange an airport transfer too?", time: "10:02 AM" },
      { from: "ai", text: "Of course! We've noted your preferences and arranged an airport transfer for you.", time: "10:05 AM" },
    ],
  },
  { id: 8, name: "William Taylor", initials: "WT", vip: false, room: "1107", roomType: "Standard Room", checkIn: "Tomorrow 1:00 PM", checkOut: "May 28", nights: 3, status: "Pending", hasWhatsApp: true, phone: "+91 98765 11208", email: "william.taylor@example.com", arrivalDay: "tomorrow", timeline: [], preferences: null, messages: [] },
  { id: 9, name: "Ava Thompson", initials: "AT", vip: false, room: "2501", roomType: "Deluxe Room", checkIn: "Tomorrow 3:00 PM", checkOut: "May 30", nights: 5, status: "Pending", hasWhatsApp: true, phone: "+91 98765 11209", email: "ava.thompson@example.com", arrivalDay: "tomorrow", timeline: [], preferences: null, messages: [] },
  { id: 10, name: "Daniel Kim", initials: "DK", vip: false, room: "1305", roomType: "Deluxe Room", checkIn: "Tomorrow 5:00 PM", checkOut: "May 27", nights: 2, status: "Pending", hasWhatsApp: false, phone: "+91 98765 11210", email: "daniel.kim@example.com", arrivalDay: "tomorrow", timeline: [], preferences: null, messages: [] },
  { id: 11, name: "Sophia Lee", initials: "SL", vip: false, room: "2204", roomType: "Junior Suite", checkIn: "Tomorrow 6:00 PM", checkOut: "Jun 01", nights: 7, status: "Pending", hasWhatsApp: true, phone: "+91 98765 11211", email: "sophia.lee@example.com", arrivalDay: "tomorrow", timeline: [], preferences: null, messages: [] },
  { id: 12, name: "Ethan Walker", initials: "EW", vip: false, room: "1410", roomType: "Standard Room", checkIn: "Tomorrow 7:00 PM", checkOut: "May 26", nights: 1, status: "Pending", hasWhatsApp: true, phone: "+91 98765 11212", email: "ethan.walker@example.com", arrivalDay: "tomorrow", timeline: [], preferences: null, messages: [] },
  { id: 13, name: "Mia Johnson", initials: "MJ", vip: false, room: "1612", roomType: "Deluxe Room", checkIn: "May 26, 2:00 PM", checkOut: "May 30", nights: 4, status: "Pending", hasWhatsApp: true, phone: "+91 98765 11213", email: "mia.johnson@example.com", arrivalDay: "upcoming", timeline: [], preferences: null, messages: [] },
  { id: 14, name: "Lucas Garcia", initials: "LG", vip: false, room: "1709", roomType: "Standard Room", checkIn: "May 27, 1:00 PM", checkOut: "May 29", nights: 2, status: "Pending", hasWhatsApp: true, phone: "+91 98765 11214", email: "lucas.garcia@example.com", arrivalDay: "upcoming", timeline: [], preferences: null, messages: [] },
  { id: 15, name: "Charlotte White", initials: "CW", vip: false, room: "2010", roomType: "Junior Suite", checkIn: "May 29, 4:00 PM", checkOut: "Jun 03", nights: 5, status: "Pending", hasWhatsApp: true, phone: "+91 98765 11215", email: "charlotte.white@example.com", arrivalDay: "upcoming", timeline: [], preferences: null, messages: [] },
];

window.preArrivalStats = {
  arrivingToday: { value: 18, sub: "3 messages pending" },
  arrivingTomorrow: { value: 24 },
  preArrivalSent: { value: 31, sub: "89% open rate" },
  preferencesCollected: { value: 27, sub: "87% response rate" },
};

window.healthScore = {
  overall: 82,
  label: "Excellent Performance",
  multiplier: "1.6x",
  pillars: {
    guestPulse: { name: "Guest Pulse", weight: 30, score: 88, label: "Excellent", trend: 5, desc: "Tracks how guests feel throughout their stay — drawn from AI chat sentiment, complaint volume, and the tone and frequency of guest-initiated messages." },
    operationsHeartbeat: { name: "Operations Heartbeat", weight: 25, score: 79, label: "Good", trend: -2, emoji: "🔵", desc: "Measures how efficiently the hotel runs day to day — task completion rates, average response time, SLA breaches, and whether requests are being closed or left open." },
    housekeepingRhythm: { name: "Housekeeping Rhythm", weight: 20, score: 86, label: "Excellent", trend: 6, emoji: "🏠", desc: "Evaluates room turnover speed, amenity fulfilment accuracy, and whether pre-arrival requests such as minibar preferences and room setup notes were actioned before the guest arrived." },
    teamEnergy: { name: "Workload Balance", weight: 15, score: 84, label: "Excellent", trend: 2, emoji: "👥", desc: "Measures how evenly work is distributed across the team — whether tasks are being claimed by multiple staff members or concentrated on one person, and whether any department is understaffed relative to its open task volume." },
    recoveryRate: { name: "Recovery Rate", weight: 10, score: 74, label: "Good", trend: 4, emoji: "⚡", desc: "Scores how well the team turns a negative guest experience into a positive one — complaint-to-resolution time, compensation approvals, and whether a follow-up was made after the issue was closed." },
  },
};

window.scoreBreakdown = [
  { label: "Guest Satisfaction", value: "88%", status: "Excellent", trend: "up", data: [60, 64, 70, 75, 80, 84, 88] },
  { label: "Response Time", value: "2m 45s", status: "Excellent", trend: "up", data: [4.2, 3.8, 3.5, 3.1, 2.9, 2.8, 2.75] },
  { label: "Task Completion", value: "86%", status: "Good", trend: "flat", data: [82, 83, 85, 84, 86, 85, 86] },
  { label: "Service Quality", value: "79%", status: "Good", trend: "flat", data: [76, 77, 78, 77, 79, 78, 79] },
  { label: "Team Performance", value: "84%", status: "Excellent", trend: "up", data: [74, 76, 78, 80, 81, 83, 84] },
];

window.morningBrief = [
  { icon: "TrendingUp", title: "Guest satisfaction improved 6%", desc: "Great start! Keep elevating the guest experience." },
  { icon: "Sparkles", title: "Housekeeping efficiency at an all-time high", desc: "Rooms turned faster with excellent quality." },
  { icon: "Users", title: "Team engagement up 8%", desc: "Your team's energy is driving exceptional service." },
];

window.teamMembers = [
  { id: 1, name: "Maria Santos", initials: "MS", department: "Housekeeping", role: "Senior Housekeeper", tasksToday: 24, avgTime: "28 min", rating: 4.9, trend: 12, onDuty: true, dutySince: "06:30 AM" },
  { id: 2, name: "John Stevens", initials: "JS", department: "Concierge", role: "Concierge Lead", tasksToday: 18, avgTime: "12 min", rating: 4.8, trend: 8, onDuty: true, dutySince: "07:00 AM" },
  { id: 3, name: "Anna Petrov", initials: "AP", department: "Room Service", role: "Room Service Captain", tasksToday: 21, avgTime: "8 min", rating: 4.7, trend: 0, onDuty: true, dutySince: "07:00 AM" },
  { id: 4, name: "Mike Rodriguez", initials: "MR", department: "Engineering", role: "Maintenance Technician", tasksToday: 15, avgTime: "45 min", rating: 4.6, trend: -5, onDuty: true, dutySince: "08:00 AM" },
  { id: 5, name: "Sarah Kim", initials: "SK", department: "Front Desk", role: "Front Desk Supervisor", tasksToday: 32, avgTime: "4 min", rating: 4.9, trend: 15, onDuty: true, dutySince: "07:00 AM" },
  { id: 6, name: "Lisa Mitchell", initials: "LM", department: "Housekeeping", role: "Housekeeper", tasksToday: 19, avgTime: "31 min", rating: 4.5, trend: 3, onDuty: true, dutySince: "06:30 AM" },
  { id: 7, name: "Tom Hassan", initials: "TH", department: "Food and Beverage", role: "Restaurant Supervisor", tasksToday: 28, avgTime: "6 min", rating: 4.7, trend: 9, onDuty: true, dutySince: "06:00 AM" },
  { id: 8, name: "James Chen", initials: "JC", department: "Housekeeping", role: "Floor Supervisor", tasksToday: 11, avgTime: "15 min", rating: 4.8, trend: 6, onDuty: true, dutySince: "06:30 AM" },
  { id: 9, name: "Franck Delen", initials: "FD", department: "Front Desk", role: "Guest Relations", tasksToday: 14, avgTime: "5 min", rating: 4.9, trend: 10, onDuty: false, dutySince: "—" },
  { id: 10, name: "Daniel Okafor", initials: "DO", department: "Engineering", role: "Chief Engineer", tasksToday: 9, avgTime: "52 min", rating: 4.6, trend: 2, onDuty: true, dutySince: "08:00 AM" },
];

window.taskTypesByMember = {
  1: [ // Maria Santos — Housekeeping
    { type: "Room Cleaning", count: 11 },
    { type: "Turndown Service", count: 6 },
    { type: "Amenity Replacement", count: 4 },
    { type: "Linen Change", count: 3 },
  ],
  2: [ // John Stevens — Concierge
    { type: "Restaurant Reservation", count: 7 },
    { type: "Private Transfer", count: 5 },
    { type: "Tour & Excursion Booking", count: 4 },
    { type: "Ticket Arrangement", count: 2 },
  ],
  3: [ // Anna Petrov — Room Service
    { type: "Food & Beverage Delivery", count: 10 },
    { type: "Minibar Restock", count: 5 },
    { type: "Amenity Delivery", count: 4 },
    { type: "Special Setup", count: 2 },
  ],
  4: [ // Mike Rodriguez — Engineering
    { type: "AC Maintenance", count: 6 },
    { type: "Safe Box Issue", count: 4 },
    { type: "Plumbing", count: 3 },
    { type: "Lighting & Electrical", count: 2 },
  ],
  5: [ // Sarah Kim — Front Desk
    { type: "Document Printing", count: 12 },
    { type: "Loyalty Program Inquiries", count: 9 },
    { type: "Late Checkout Request", count: 7 },
    { type: "Room Change", count: 4 },
  ],
  6: [ // Lisa Mitchell — Housekeeping
    { type: "Room Cleaning", count: 9 },
    { type: "Turndown Service", count: 5 },
    { type: "Amenity Replacement", count: 3 },
    { type: "Deep Cleaning", count: 2 },
  ],
  7: [ // Tom Hassan — Food & Beverage
    { type: "Restaurant Setup", count: 11 },
    { type: "In-Room Dining", count: 8 },
    { type: "Special Menu Request", count: 5 },
    { type: "Bar Service", count: 4 },
  ],
  8: [ // James Chen — Housekeeping Floor Supervisor
    { type: "Room Cleaning Oversight", count: 5 },
    { type: "Turndown Service", count: 3 },
    { type: "Lost & Found", count: 2 },
    { type: "Amenity Replacement", count: 1 },
  ],
  9: [ // Franck Delen — Guest Relations
    { type: "Loyalty Program Inquiries", count: 6 },
    { type: "Service Recovery", count: 4 },
    { type: "VIP Welcome", count: 3 },
    { type: "Late Checkout Request", count: 1 },
  ],
  10: [ // Daniel Okafor — Engineering
    { type: "AC Maintenance", count: 4 },
    { type: "Safe Box Issue", count: 2 },
    { type: "Plumbing", count: 2 },
    { type: "Preventive Maintenance", count: 1 },
  ],
};

window.weeklyTasksByMember = {
  5: [
    { day: "Mon", tasks: 28 }, { day: "Tue", tasks: 31 }, { day: "Wed", tasks: 26 },
    { day: "Thu", tasks: 34 }, { day: "Fri", tasks: 32 }, { day: "Sat", tasks: 29 }, { day: "Sun", tasks: 32 },
  ],
};

window.guests = [
  {
    id: 1, name: "Emma Davis", initials: "ED", photo: "https://i.pravatar.cc/150?img=47", room: "1608", roomType: "Deluxe Suite", vip: false, status: "In-House",
    nationality: "United Kingdom", flag: "🇬🇧", phone: "+1 (555) 123-4567", email: "emma.davis@email.com",
    checkIn: "May 20, 2025", checkOut: "May 27, 2025", nights: 7, adults: 2, source: "Direct Booking",
    aiSummary: "Emma is on her third stay at the property, travelling for a combination of business and anniversary. She prefers discreet, proactive service with minimal interruption. A private transfer is confirmed for tomorrow morning at 7:00 AM.",
    anticipatedNeeds: "Offer an unpacking service on arrival. As the guest is staying for 7 nights, she is likely to have more luggage and may appreciate the gesture.",
    preferences: { room: "High floor, Firm pillow, Extra blanket, Blackout curtains", dietary: "No shellfish, No nuts. Breakfast preference: fresh fruit and pastries.", language: "English", transport: "Private transfers preferred. Early morning departures require transfer coordination.", temperature: "Cool room (20°C)", newspaper: "Financial Times", purpose: "Business, Anniversary. Service style: proactive and anticipatory.", wakeup: "7:00 AM", minibar: "Sparkling water, Dark chocolate" },
    history: [
      { date: "Oct 2024", room: "1402", nights: 4, rating: 5 },
      { date: "Mar 2024", room: "1608", nights: 6, rating: 5 },
      { date: "Sep 2023", room: "1201", nights: 3, rating: 4 },
    ],
    notes: [{ time: "May 24 10:15 AM", author: "John S. (Concierge)", text: "Guest requested private transfer for tomorrow 7AM. Booked and confirmed." }],
    actions: [
      { reason: "Third visit — check stay history and avoid repeating the same welcome amenity. Offer something new.", department: "Room Service", assignedTo: "Room Service Team", status: "Completed" },
      { reason: "Guest mentioned Mike from Front Desk was very helpful during her last stay. Inform Mike to be present for her arrival and meet and greet.", department: "Front Desk", assignedTo: "Mike Johnson", status: "Completed" },
    ],
    handover: { active: true, to: "Mike Johnson", role: "Front Desk", time: "10:10 AM", reason: "Emma mentioned in her last stay that Mike from Front Desk was very helpful. Inform Mike upon arrival for meet and greet.", status: "Resolved" },
    metrics: { vipScore: 92, returnProbability: 87, satisfaction: 95 },
  },
  { id: 2, name: "James Wilson", initials: "JW", photo: "https://i.pravatar.cc/150?img=12", room: "2205", roomType: "Executive Room", vip: false, status: "In-House", nationality: "United States", flag: "🇺🇸", phone: "+1 (555) 234-5678", email: "james.wilson@email.com", checkIn: "May 22, 2025", checkOut: "May 26, 2025", nights: 4, adults: 1, source: "OTA - Booking.com",
    aiSummary: "James is visiting for leisure and has been using the fitness centre during his stay. He has lactose intolerance.",
    anticipatedNeeds: "Wellness-focused guest. You may offer post-workout smoothies from Room Service and introduce the spa.",
    preferences: { room: "Quiet room away from elevator", dietary: "Vegetarian", language: "English", transport: "N/A", temperature: "Standard (22°C)", newspaper: "Wall Street Journal", purpose: "Leisure. Service style: straightforward and efficient.", wakeup: "8:00 AM", minibar: "Standard inventory" },
    history: [], notes: [],
    handover: { active: true, to: "Housekeeping Team", role: "Housekeeping", time: "09:45 AM", reason: "James has lactose intolerance. Please fill the minibar with lactose-free milk before arrival. Additionally, prepare a wellness amenity kit for the room as the guest has been inquiring about the gym.", status: "Completed" } },
  { id: 3, name: "Olivia Brown", initials: "OB", photo: "https://i.pravatar.cc/150?img=44", room: "1203", roomType: "Premium Room", vip: false, status: "Checked Out", nationality: "Australia", flag: "🇦🇺", phone: "+1 (555) 345-6789", email: "olivia.brown@email.com", checkIn: "May 21, 2025", checkOut: "May 25, 2025", nights: 4, adults: 2, source: "Direct Booking",
    aiSummary: "Olivia has requested a late checkout until 4:00 PM, currently pending confirmation from Front Desk.",
    anticipatedNeeds: "Little has been shared about Olivia's plans or preferences beyond the late checkout. A friendly, brief check-in during the stay could help identify any needs and leave a warmer impression before departure.",
    preferences: { room: "Mid floor", dietary: "None", language: "English", transport: "N/A", temperature: "Standard (22°C)", newspaper: "None", purpose: "Leisure. Service style: friendly and relaxed.", wakeup: "8:00 AM", minibar: "Sugar-free amenities" },
    history: [], notes: [],
    handover: { active: true, to: "Front Desk Team", role: "Front Desk", time: "09:33 AM", reason: "Please mention our coffee shop's sugar-free desserts to Ms. Brown upon arrival.", status: "Completed" } },
  { id: 4, name: "Liam Anderson", initials: "LA", photo: "https://i.pravatar.cc/150?img=13", room: "2104", roomType: "Corner Suite", vip: false, status: "Checked Out", nationality: "United Kingdom", flag: "🇬🇧", phone: "+1 (555) 456-7890", email: "liam.anderson@email.com", checkIn: "May 20, 2025", checkOut: "May 24, 2025", nights: 4, adults: 2, source: "Travel Agent",
    aiSummary: "Liam is staying with his wife for their 10th wedding anniversary. Following a noise disturbance on their first night, he was moved to Room 2104. Service recovery was handled promptly and the General Manager personally arranged a complimentary rooftop dinner as an anniversary gesture.",
    anticipatedNeeds: "The couple experienced a service failure at the start of their stay. Any additional thoughtful gesture during the remaining nights, however small, would reinforce the recovery and leave a strong final impression. A surprise amenity or departure gift could be meaningful here.",
    preferences: { room: "High floor, corner suite, quiet (moved to Room 2104)", dietary: "None", language: "English", transport: "N/A", temperature: "Standard (22°C)", newspaper: "None", purpose: "Wedding anniversary. Rooftop dinner arranged personally by the General Manager. Sensitive stay, handle with care.", wakeup: "8:00 AM", minibar: "Standard inventory" },
    history: [], notes: [],
    handover: { active: true, to: "Guest Relations Team", role: "Guest Relations", time: "11:46 PM", reason: "Guest is celebrating their 10th wedding anniversary. A departure gift is to be prepared as the guest additionally encountered a service failure during their stay.", status: "Completed" } },
  { id: 5, name: "Sarah Mitchell", initials: "SM", photo: "https://i.pravatar.cc/150?img=45", room: "2501", roomType: "Presidential Suite", vip: false, status: "Pre-Arrival", nationality: "France", flag: "🇫🇷", phone: "+1 (555) 567-8901", email: "sarah.mitchell@email.com", checkIn: "Tomorrow", checkOut: "Jun 2, 2025", nights: 5, adults: 2, source: "Direct Booking",
    aiSummary: "Sarah is arriving tomorrow for a restorative stay following a period of personal stress. She has asked for quiet and privacy above all else.",
    anticipatedNeeds: "Guest is arriving on a late-night flight — offer the room service late-night menu on arrival.",
    preferences: { room: "Quiet, high floor preferred (noted, pending Front Desk confirmation)", dietary: "To be confirmed on arrival", language: "French, English", transport: "Airport pickup requested", temperature: "Cool room (20°C)", newspaper: "Le Monde", purpose: "Rest and recovery. Minimal contact, undisturbed service style.", wakeup: "8:00 AM", minibar: "Herbal tea, relaxation amenity, spa treatment accepted" },
    history: [{ date: "Jan 2024", room: "2501", nights: 4, rating: 5 }], notes: [],
    handover: { active: true, to: "Front Desk Team", role: "Front Desk", time: "10:31 AM", reason: "All departments: minimal contact approach for this guest.", status: "Completed" } },
  { id: 6, name: "Ava Thompson", initials: "AT", photo: "https://i.pravatar.cc/150?img=49", room: "2501", roomType: "Junior Suite", vip: false, status: "Checked Out", nationality: "Canada", flag: "🇨🇦", phone: "+1 (555) 678-9012", email: "ava.thompson@email.com", checkIn: "May 18, 2025", checkOut: "May 23, 2025", nights: 5, adults: 1, source: "Direct Booking",
    aiSummary: "Ava expressed genuine satisfaction with her room and overall experience. She is a content and relaxed guest who appreciates warm and attentive service. No outstanding requests or concerns at this time.",
    preferences: { room: "Standard", dietary: "None", language: "English", transport: "N/A", temperature: "Standard (22°C)", newspaper: "None", purpose: "Leisure", wakeup: "8:00 AM", minibar: "Standard inventory" },
    history: [], notes: [], handover: null },
  { id: 7, name: "William Taylor", initials: "WT", photo: "https://i.pravatar.cc/150?img=14", room: "1107", roomType: "Deluxe Room", vip: false, status: "Checked Out", nationality: "United States", flag: "🇺🇸", phone: "+1 (555) 789-0123", email: "william.taylor@email.com", checkIn: "May 17, 2025", checkOut: "May 23, 2025", nights: 6, adults: 2, source: "OTA - Expedia",
    aiSummary: "William made a straightforward request for extra towels which was fulfilled promptly. He prefers brief, efficient interactions. No further requests at this time.",
    preferences: { room: "Standard", dietary: "None", language: "English", transport: "N/A", temperature: "Standard (22°C)", newspaper: "None", purpose: "Leisure", wakeup: "8:00 AM", minibar: "Standard inventory" },
    history: [], notes: [], handover: null },
  {
    id: 9, name: "Alexander Hartmann", initials: "AH", photo: "https://i.pravatar.cc/150?img=11", room: "1904", roomType: "Deluxe Suite", vip: false, status: "In-House",
    nationality: "Germany", flag: "🇩🇪", phone: "+49 170 123 4567", email: "a.hartmann@hartmann-ventures.de",
    checkIn: "May 22, 2025", checkOut: "May 26, 2025", nights: 4, adults: 1, source: "Direct Booking",
    aiSummary: "Alexander is a German business traveller on his first stay at Layana Resort & Spa. He raised a query about his bill breakdown and Layana loyalty points, which has been escalated to Front Desk for a personal follow-up.",
    anticipatedNeeds: "As a first-time guest who is detail-oriented and values transparency, a smooth checkout with a clear, itemised invoice will be important. If his experience is positive, there is a genuine opportunity to build a lasting relationship and encourage a return visit.",
    preferences: { room: "High floor, city view", dietary: "None", language: "English, German", transport: "Business class preferred", temperature: "Standard (22°C)", newspaper: "Financial Times", purpose: "Business", wakeup: "7:00 AM", minibar: "Sparkling water, nuts" },
    history: [],
    notes: [{ time: "May 24 11:22 AM", author: "Sarah Kim (Front Desk Supervisor)", text: "Guest enquired about bill itemisation and Layana loyalty points earned this stay. I will review the folio and call back within 15 minutes." }],
    handover: null,
    metrics: { vipScore: 61, returnProbability: 72, satisfaction: 85 },
  },
  {
    id: 11, name: "Philip Johnson", initials: "PJ", photo: "https://i.pravatar.cc/150?img=67", room: "Villa 4", roomType: "Beachfront Villa", vip: false, status: "In-House",
    nationality: "United Kingdom", flag: "🇬🇧", phone: "+44 7700 900123", email: "philip.johnson@email.com",
    checkIn: "May 25, 2025", checkOut: "Jun 1, 2025", nights: 5, adults: 2, source: "Direct Booking",
    aiSummary: "Philip is travelling with his wife to celebrate their wedding anniversary. His wife follows a vegetarian diet. The couple has booked a couples spa treatment and a dinner reservation at the resort's signature restaurant Sarn.",
    anticipatedNeeds: "Look for opportunities to surprise the couple with thoughtful anniversary gestures throughout their stay.",
    preferences: { room: null, dietary: "Vegetarian (wife). Please ensure all menus clearly indicate vegetarian options.", language: null, transport: null, temperature: null, newspaper: null, purpose: "Wedding anniversary", wakeup: null, minibar: null },
    history: [], notes: [],
    actions: [
      { reason: "Prepare a vegetarian anniversary cake and arrange delivery to Villa 4 as a surprise gesture for the couple.", department: "Room Service", assignedTo: "Room Service Team", status: "Completed" },
    ],
    itinerary: [
      { day: "Arrival Day", time: "2:00 PM",      label: "Airport Transfer",         detail: "Toyota Alphard Royal Lounge from Krabi Airport, tracking flight PG212 from Bangkok" },
      { day: "Day 1",       time: "3:00 PM",      label: "Couples Journey Spa",      detail: "90-minute Couples Journey at the resort spa" },
      { day: "Day 2",       time: "7:30 PM",      label: "Dinner at Sarn",           detail: "Vegetarian tasting menu, Chef Niran Sombat" },
    ],
    metrics: { vipScore: 78, returnProbability: 85, satisfaction: 0 },
  },
  { id: 8, name: "Isabella Rossi", initials: "IR", photo: "https://i.pravatar.cc/150?img=48", room: "2104", roomType: "Executive Suite", vip: false, status: "Checked Out", nationality: "Italy", flag: "🇮🇹", phone: "+1 (555) 890-1234", email: "isabella.rossi@email.com", checkIn: "May 19, 2025", checkOut: "May 22, 2025", nights: 3, adults: 1, source: "Direct Booking",
    aiSummary: "Isabella is a guest from Italy. Her preferred language is Italian and all communication was conducted accordingly. She booked a hot stone massage at the resort spa for 10:00 AM.",
    preferences: { room: "Quiet, away from elevator", dietary: "Gluten-free", language: "Italian", transport: "Italian-speaking staff preferred", temperature: "Cool room (20°C)", newspaper: "Corriere della Sera", purpose: "Leisure", wakeup: "8:00 AM", minibar: "Standard inventory" },
    history: [], notes: [],
    handover: { active: true, to: "Laura Bianchi", role: "Guest Relations", time: "14:19", reason: "Isabella's preferred language is Italian. Inform Laura upon arrival to assist the guest throughout her stay.", status: "Completed" } },
  {
    id: 10, name: "Khalid Al-Mansouri", initials: "KA", photo: "https://i.pravatar.cc/150?img=59",
    room: "1710", roomType: "Deluxe Suite", vip: false, status: "In-House",
    nationality: "Saudi Arabia", flag: "🇸🇦", phone: "+966 50 123 4567", email: "k.almansouri@email.com",
    checkIn: "May 24, 2025", checkOut: "May 27, 2025", nights: 3, adults: 2, source: "Direct Booking",
    aiSummary: "Khalid is travelling from Saudi Arabia with his family, including his 4-year-old daughter Mira. He prefers Arabic-language communication.",
    anticipatedNeeds: "Consider anticipating babysitting needs and have childcare options ready to offer upon arrival. Family-friendly activities and curated experiences can also be offered. Proactively offer a cot and bottle warmer, and show the family how to use the blackout curtains and place the room on DND.",
    preferences: {
      room: "High floor, King bed, City view", dietary: "Halal food only, No pork, No alcohol",
      language: "Arabic", transport: "Private transfers preferred",
      temperature: "Warm room (23°C)", newspaper: "Asharq Al-Awsat",
      purpose: "Leisure with family", wakeup: "7:30 AM", minibar: "Dates, Arabic coffee, Still water"
    },
    history: [],
    notes: [],
    actions: [
      {
        reason: "An Arabic-speaking Front Desk team member must be present at the entrance to greet the guest upon arrival.",
        assignedTo: "Sarah Kim",
        department: "Front Desk",
        status: "Completed",
      },
      {
        reason: "Please set the television language to Arabic before the guest checks in.",
        assignedTo: "Maria Santos",
        department: "Housekeeping",
        status: "Completed",
      },
    ],
    metrics: { vipScore: 91, returnProbability: 88, satisfaction: 95 },
  },
];

// Deterministic fallback ring metrics for guests without an explicit `metrics` field,
// so every guest profile shows VIP Score / Return Probability / Satisfaction rings.
window.getGuestMetrics = (guest) => {
  if (guest.metrics) return guest.metrics;
  const seed = guest.id * 37;
  return {
    vipScore: guest.vip ? 78 + (seed % 15) : 45 + (seed % 25),
    returnProbability: 55 + (seed % 35),
    satisfaction: 70 + (seed % 25),
  };
};

window.DEPARTMENT_NAMES = [
  "Front Desk", "Guest Services", "Concierge", "Food and Beverage", "Housekeeping",
  "Laundry", "Engineering", "Room Service", "Security", "IT", "Operator", "Reservation",
];

window.departments = [
  { name: "Front Desk", staffCount: 9, head: "Sarah Kim" },
  { name: "Guest Services", staffCount: 7, head: "Franck Delen" },
  { name: "Concierge", staffCount: 5, head: "John Stevens" },
  { name: "Food and Beverage", staffCount: 12, head: "Tom Hassan" },
  { name: "Housekeeping", staffCount: 14, head: "James Chen" },
  { name: "Laundry", staffCount: 6, head: "Carlos Mendes" },
  { name: "Engineering", staffCount: 6, head: "Daniel Okafor" },
  { name: "Room Service", staffCount: 8, head: "Anna Petrov" },
  { name: "Security", staffCount: 8, head: "Marcus Reid" },
  { name: "IT", staffCount: 3, head: "Priya Sharma" },
  { name: "Operator", staffCount: 4, head: "Rahul Verma" },
  { name: "Reservation", staffCount: 5, head: "Linda Park" },
];

window.DEPARTMENT_DONUT_COLORS = ["#F4A57A", "#F8BFA0", "#FBCFB5", "#FCD9C4", "#FDE3D4", "#FFF0E8"];

window.departmentTaskBreakdown = [
  { department: "Front Desk", total: 691, categories: [
    { name: "Loyalty program inquiries", value: 312 }, { name: "Late checkout", value: 189 }, { name: "Room change", value: 67 },
    { name: "Document request", value: 45 }, { name: "Wake-up call", value: 38 }, { name: "Lost & found", value: 22 }, { name: "Other", value: 18 },
  ]},
  { department: "Guest Services", total: 590, categories: [
    { name: "Luggage assistance", value: 441 }, { name: "Valet request", value: 89 }, { name: "Room move", value: 28 },
    { name: "Package delivery", value: 7 }, { name: "Taxi request", value: 3 }, { name: "Envelope delivery", value: 2 }, { name: "Other", value: 20 },
  ]},
  { department: "Concierge", total: 477, categories: [
    { name: "Restaurant reservation", value: 156 }, { name: "Tour booking", value: 98 }, { name: "Transport arrangement", value: 87 },
    { name: "Ticket booking", value: 45 }, { name: "Spa booking", value: 38 }, { name: "Flower arrangement", value: 22 }, { name: "Other", value: 31 },
  ]},
  { department: "Food and Beverage", total: 686, categories: [
    { name: "Room service order", value: 289 }, { name: "Restaurant inquiry", value: 134 }, { name: "Minibar restock", value: 89 },
    { name: "Special dietary request", value: 67 }, { name: "Breakfast extension", value: 45 }, { name: "Wine request", value: 34 }, { name: "Other", value: 28 },
  ]},
  { department: "Housekeeping", total: 1281, categories: [
    { name: "Room cleaning", value: 523 }, { name: "Turndown service", value: 234 }, { name: "Extra towels", value: 189 },
    { name: "Extra pillow", value: 134 }, { name: "Amenity request", value: 89 }, { name: "Deep cleaning", value: 45 }, { name: "Other", value: 67 },
  ]},
  { department: "Laundry", total: 481, categories: [
    { name: "Laundry pickup", value: 178 }, { name: "Pressing service", value: 134 }, { name: "Dry cleaning", value: 89 },
    { name: "Urgent laundry", value: 45 }, { name: "Stain removal", value: 23 }, { name: "Other", value: 12 },
  ]},
  { department: "Engineering", total: 426, categories: [
    { name: "AC issue", value: 134 }, { name: "Plumbing", value: 89 }, { name: "Electrical", value: 67 },
    { name: "Safe issue", value: 45 }, { name: "TV/Remote", value: 38 }, { name: "Furniture", value: 22 }, { name: "Other", value: 31 },
  ]},
  { department: "Room Service", total: 802, categories: [
    { name: "Food delivery", value: 312 }, { name: "Beverage delivery", value: 189 }, { name: "Breakfast in room", value: 156 },
    { name: "Late night order", value: 89 }, { name: "Special occasion setup", value: 34 }, { name: "Other", value: 22 },
  ]},
  { department: "Security", total: 248, categories: [
    { name: "Lost key", value: 89 }, { name: "Noise complaint", value: 67 }, { name: "Suspicious activity", value: 12 },
    { name: "Parcel delivery", value: 34 }, { name: "Safe assistance", value: 28 }, { name: "Other", value: 18 },
  ]},
  { department: "IT", total: 331, categories: [
    { name: "WiFi issue", value: 156 }, { name: "TV setup", value: 89 }, { name: "Device charging", value: 45 },
    { name: "Printer request", value: 23 }, { name: "Other", value: 18 },
  ]},
  { department: "Operator", total: 87, categories: [
    { name: "Wake-up call setup", value: 31 }, { name: "Guest inquiry (dining)", value: 22 },
    { name: "Guest inquiry (spa)", value: 18 }, { name: "Guest inquiry (general)", value: 16 },
  ]},
  { department: "Reservation", total: 536, categories: [
    { name: "Booking modification", value: 178 }, { name: "Rate inquiry", value: 134 }, { name: "Cancellation", value: 45 },
    { name: "Extension request", value: 89 }, { name: "Early check-in request", value: 67 }, { name: "Other", value: 23 },
  ]},
];

window.analyticsMetrics = {
  totalTasks: { value: 2847, trend: "up", change: "16%" },
  completed: { value: 2651, trend: "up", change: "18%" },
  overdue: { value: 196, trend: "down", change: "8%" },
  avgResponse: { value: "2m 45s", trend: "down", change: "12%" },
};

window.taskVolumeTrend = [
  { day: "Mon", tasks: 380 }, { day: "Tue", tasks: 412 }, { day: "Wed", tasks: 395 },
  { day: "Thu", tasks: 448 }, { day: "Fri", tasks: 467 }, { day: "Sat", tasks: 389 }, { day: "Sun", tasks: 356 },
];

window.satisfactionTrend = [
  { week: "W1", score: 4.3 }, { week: "W2", score: 4.4 }, { week: "W3", score: 4.2 },
  { week: "W4", score: 4.6 }, { week: "W5", score: 4.5 }, { week: "W6", score: 4.7 },
];

window.topRequestsBreakdown = [
  { name: "Extra Towels", count: 156 },
  { name: "Late Checkout", count: 134 },
  { name: "Airport Transfer", count: 128 },
  { name: "Water / Minibar Refill", count: 112 },
  { name: "Room Service Order", count: 98 },
  { name: "Shampoo / Toiletries", count: 87 },
  { name: "Spa Appointment", count: 72 },
  { name: "Restaurant Reservation", count: 68 },
  { name: "Wake-up Call", count: 61 },
  { name: "Taxi Request", count: 54 },
];

window.guestNationality = [
  { name: "UK", flag: "🇬🇧", value: 28 }, { name: "US", flag: "🇺🇸", value: 24 }, { name: "France", flag: "🇫🇷", value: 18 },
  { name: "UAE", flag: "🇦🇪", value: 16 }, { name: "India", flag: "🇮🇳", value: 8 }, { name: "Other", flag: "🌍", value: 6 },
];

window.guestLanguage = [
  { name: "English", value: 68 }, { name: "Arabic", value: 15 }, { name: "French", value: 10 }, { name: "Hindi", value: 4 }, { name: "Other", value: 3 },
];

window.peakHoursHeatmap = (() => {
  const departments = [
    { label: "Front Desk",    color: "#A5B4FC", peaks: { 0:12,1:8,2:5,3:3,4:3,5:8,6:22,7:72,8:88,9:76,10:58,11:44,12:36,13:30,14:68,15:92,16:88,17:74,18:54,19:40,20:32,21:26,22:28,23:18 } },
    { label: "Concierge",     color: "#7DD3FC", peaks: { 0:5,1:3,2:2,3:2,4:4,5:6,6:12,7:28,8:52,9:78,10:82,11:68,12:54,13:60,14:72,15:58,16:44,17:38,18:72,19:88,20:76,21:54,22:32,23:16 } },
    { label: "Housekeeping",  color: "#FDBA74", peaks: { 0:4,1:2,2:2,3:2,4:3,5:6,6:14,7:42,8:88,9:96,10:92,11:84,12:72,13:60,14:48,15:36,16:62,17:76,18:64,19:38,20:22,21:14,22:10,23:6 } },
    { label: "Food & Bev",    color: "#FDE68A", peaks: { 0:8,1:5,2:4,3:4,4:5,5:10,6:28,7:82,8:92,9:68,10:44,11:54,12:88,13:84,14:58,15:36,16:28,17:34,18:52,19:88,20:96,21:82,22:56,23:28 } },
    { label: "Engineering",   color: "#94A3B8", peaks: { 0:10,1:8,2:6,3:5,4:5,5:8,6:14,7:28,8:52,9:68,10:72,11:64,12:48,13:54,14:62,15:58,16:52,17:44,18:36,19:30,20:24,21:20,22:16,23:12 } },
    { label: "Guest Rel.",    color: "#86EFAC", peaks: { 0:6,1:4,2:3,3:3,4:4,5:6,6:10,7:22,8:44,9:62,10:74,11:72,12:60,13:64,14:70,15:68,16:58,17:46,18:40,19:34,20:26,21:18,22:12,23:8 } },
  ];
  return departments.map(({ label, color, peaks }) => ({
    label, color,
    hours: Array.from({ length: 24 }, (_, h) => peaks[h] || 0),
  }));
})();

window.compensationReports = [
  { id: 1, guest: "James Chen", room: "412", type: "Room Discount", amount: 120, reason: "AC malfunction during stay", approvedBy: "Sarah Kim", status: "Approved", date: "2026-06-18" },
  { id: 2, guest: "Amira Al-Farsi", room: "208", type: "Free Meal", amount: 65, reason: "Delayed room service order", approvedBy: "Tom Hassan", status: "Approved", date: "2026-06-19" },
  { id: 3, guest: "Robert Lin", room: "315", type: "Spa Voucher", amount: 150, reason: "Noise complaint resolution", approvedBy: "Marcus Reid", status: "Approved", date: "2026-06-20" },
  { id: 4, guest: "Sophie Dubois", room: "601", type: "Room Discount", amount: 90, reason: "Late housekeeping service", approvedBy: "James Chen", status: "Pending", date: "2026-06-21" },
  { id: 5, guest: "Vikram Mehta", room: "118", type: "Free Beverage", amount: 40, reason: "Incorrect order delivered", approvedBy: "Tom Hassan", status: "Approved", date: "2026-06-21" },
  { id: 6, guest: "Emma Davis", room: "527", type: "Late Checkout Waiver", amount: 80, reason: "Flight delay accommodation", approvedBy: "Sarah Kim", status: "Approved", date: "2026-06-22" },
];

window.taskReportRows = [
  { department: "Front Desk", total: 691, completed: 658, overdue: 12, avgResponse: "3m 10s" },
  { department: "Guest Services", total: 590, completed: 571, overdue: 8, avgResponse: "2m 20s" },
  { department: "Concierge", total: 477, completed: 460, overdue: 6, avgResponse: "4m 05s" },
  { department: "Food and Beverage", total: 686, completed: 645, overdue: 22, avgResponse: "2m 50s" },
  { department: "Housekeeping", total: 1281, completed: 1198, overdue: 41, avgResponse: "3m 35s" },
  { department: "Laundry", total: 481, completed: 462, overdue: 9, avgResponse: "2m 15s" },
  { department: "Engineering", total: 426, completed: 398, overdue: 19, avgResponse: "5m 40s" },
  { department: "Room Service", total: 802, completed: 779, overdue: 14, avgResponse: "1m 55s" },
];

window.complaintReportRows = [
  { id: 1, guest: "James Chen", room: "412", category: "Room Maintenance", description: "AC unit not cooling properly", status: "Resolved", date: "2026-06-18" },
  { id: 2, guest: "Sophie Dubois", room: "601", category: "Housekeeping", description: "Room not serviced by requested time", status: "Resolved", date: "2026-06-21" },
  { id: 3, guest: "Robert Lin", room: "315", category: "Noise", description: "Excessive noise from adjacent room", status: "Resolved", date: "2026-06-20" },
  { id: 4, guest: "Vikram Mehta", room: "118", category: "Food and Beverage", description: "Incorrect order delivered to room", status: "In Progress", date: "2026-06-21" },
];

window.whatsappConfig = {
  number: "+91 98765 43210",
  displayName: "Layana Resort & Spa",
  status: "Active",
  sentToday: 47,
  receivedToday: 34,
};

window.conversations = [
  { id: 1, guestId: 1, guest: "Emma Davis", initials: "ED", room: "1608", time: "9:16 PM", lastMessage: "That's perfect, thank you!", status: "In Progress", priority: "High", department: "Concierge", assignedTo: "Tim Ahyong (Concierge)", channel: "In-App Chat", language: "English", created: "Yesterday at 9:12 PM" },
  { id: 7, guestId: 8, guest: "Isabella Rossi", initials: "IR", room: "2104", time: "May 22", lastMessage: "Puo contare su di noi...", status: "Resolved", priority: "Medium", department: "Concierge", assignedTo: "John Stevens (Concierge)", channel: "In-App Chat", language: "Italian", created: "May 22, 2025 at 02:00 PM" },
  { id: 2, guestId: 2, guest: "James Wilson", initials: "JW", room: "2205", time: "9:47 AM", lastMessage: "Our pleasure, Mr. Wilson...", status: "Resolved", priority: "Low", department: "Concierge", assignedTo: "John Stevens (Concierge)", channel: "In-App Chat", language: "English", created: "May 24, 2025 at 09:45 AM" },
  { id: 3, guestId: 3, guest: "Olivia Brown", initials: "OB", room: "1203", time: "9:33 AM", lastMessage: "Our Front Desk team will be in touch...", status: "In Progress", priority: "Medium", department: "Front Desk", assignedTo: "Sarah Kim (Front Desk)", channel: "In-App Chat", language: "English", created: "May 24, 2025 at 09:30 AM" },
  { id: 4, guestId: 4, guest: "Liam Anderson", initials: "LA", room: "2104", time: "8:40 AM", lastMessage: "A reservation has been arranged for you this evening...", status: "Resolved", priority: "High", department: "Front Desk", assignedTo: "Sarah Kim (Front Desk)", channel: "In-App Chat", language: "English", created: "Yesterday at 11:43 PM" },
  { id: 5, guestId: 6, guest: "Ava Thompson", initials: "AT", room: "2501", time: "Yesterday", lastMessage: "Good night.", status: "Resolved", priority: "Low", department: "Front Desk", assignedTo: "Sarah Kim (Front Desk)", channel: "In-App Chat", language: "English", created: "May 23, 2025 at 11:00 AM" },
  { id: 6, guestId: 7, guest: "William Taylor", initials: "WT", room: "1107", time: "Yesterday", lastMessage: "Please reach out anytime...", status: "Resolved", priority: "Low", department: "Housekeeping", assignedTo: "Maria Santos (Housekeeping)", channel: "In-App Chat", language: "English", created: "May 23, 2025 at 09:00 AM" },
  { id: 8, guestId: 5, guest: "Sarah Mitchell", initials: "SM", room: "2501", time: "10:34 AM", lastMessage: "We look forward to welcoming you tomorrow.", status: "Pre-Arrival", priority: "Medium", department: "Front Desk", assignedTo: "Sarah Kim (Front Desk)", channel: "In-App Chat", language: "English", created: "Today at 10:15 AM" },
  { id: 9, guestId: 9, guest: "Alexander Hartmann", initials: "AH", room: "1904", time: "11:18 AM", lastMessage: "Allow us a moment — our Front Desk team will have the full details for you shortly.", status: "In Progress", priority: "Medium", department: "Front Desk", assignedTo: "Sarah Kim (Front Desk)", channel: "In-App Chat", language: "English", created: "Today at 11:14 AM" },
  { id: 10, guestId: 10, guest: "Khalid Al-Mansouri", initials: "KA", photo: "https://i.pravatar.cc/150?img=59", room: "1710", time: "2:15 PM", lastMessage: "✦ An Arabic-speaking team member will be ready to welcome you upon arrival, and your TV will be set to Arabic before you enter your room.", status: "In Progress", priority: "High", department: "Front Desk", assignedTo: "Sarah Kim (Front Desk)", channel: "In-App Chat", language: "Arabic", created: "Today at 2:10 PM" },
  { id: 11, guestId: 11, guest: "Philip Johnson", initials: "PJ", photo: "https://i.pravatar.cc/150?img=67", room: "Villa 4", time: "3:20 PM", lastMessage: "✦ We will have everything beautifully arranged for your arrival. We look forward to celebrating this very special occasion with you.", status: "In-House", priority: "High", department: "Concierge", assignedTo: "Tim Ahyong (Concierge)", channel: "In-App Chat", language: "English", created: "Today at 3:00 PM" },
];

window.currentStaffUser = { name: "Franck Delen", role: "General Manager", id: "FD001" };

window.chatMessages = {
  1: [
    { id: 1, sender: "divider", content: "Yesterday, 9:12 PM" },
    { id: 2, sender: "guest", content: "Hi, I'd like to arrange a private transfer to Krabi Airport tomorrow morning at 7:00 AM.", timestamp: "9:12 PM" },
    { id: 3, sender: "ai", content: "Good evening, Ms. Davis. We would be delighted to arrange that for you. To ensure we select the most comfortable vehicle, could you let us know how many guests will be travelling and how many pieces of luggage you will have?", timestamp: "9:13 PM", staffName: null, staffRole: null, staffId: null },
    { id: 4, sender: "guest", content: "There will be 3 of us with 4 suitcases.", timestamp: "9:14 PM" },
    { id: 5, sender: "ai", content: "Thank you, Ms. Davis. For 3 passengers and 4 suitcases, here are the options that would suit you best:\n\nBusiness Class SUV (up to 4 passengers, 4 bags) - THB 3,500\nVIP Mercedes Van (up to 7 passengers, 8 bags) - THB 4,500\n\nAll vehicles include a professional driver and complimentary still water on board. Which would you prefer?", timestamp: "9:15 PM", staffName: null, staffRole: null, staffId: null },
    { id: 6, sender: "guest", content: "The Business Class SUV please.", timestamp: "9:15 PM" },
    { id: 7, sender: "ai", content: "Confirmed, Ms. Davis. I have arranged the following for you:\n\nPickup: Tomorrow at 7:00 AM\nVehicle: Business Class SUV\nPassengers: 3, Luggage: 4 pieces\nDestination: Krabi Airport\n\nOur Concierge team will send you a confirmation shortly.", timestamp: "9:16 PM", staffName: null, staffRole: null, staffId: null },
    { id: 8, sender: "guest", content: "That's perfect, thank you!", timestamp: "9:16 PM" },
    { id: 9, sender: "ai", content: "It is our pleasure, Ms. Davis. Is there anything else we can assist you with?", timestamp: "9:17 PM", staffName: null, staffRole: null, staffId: null },
    { id: 10, sender: "guest", content: "Yes, could you please tell me what time the restaurant opens for breakfast tomorrow?", timestamp: "10:10 PM" },
    { id: 11, sender: "ai", content: "Good evening, Ms. Davis. The Cafe at Layana Resort & Spa opens for breakfast at 6:30 AM and serves until 10:30 AM. As your transfer departs at 7:00 AM, we would love to arrange a table for you at 6:30 AM, or we can prepare a to-go breakfast box if you would prefer something lighter on the way.", timestamp: "10:11 PM", staffName: null, staffRole: null, staffId: null },
    { id: 12, sender: "guest", content: "The to-go box actually sounds perfect, thank you!", timestamp: "10:12 PM" },
    { id: 13, sender: "ai", content: "Wonderful. Could you let us know how many boxes you would need and if there is anything specific you would like included?", timestamp: "10:12 PM", staffName: null, staffRole: null, staffId: null },
    { id: 14, sender: "guest", content: "For 3 please. Orange juice, black coffee and donuts.", timestamp: "10:13 PM" },
    { id: 15, sender: "ai", content: "Noted, Ms. Davis. Three breakfast boxes with orange juice, black coffee and donuts will be ready for your 7:00 AM departure. Please do not hesitate to reach out if there is anything else we can arrange before you leave.", timestamp: "10:13 PM", staffName: null, staffRole: null, staffId: null },
  ],
  2: [
    { id: 1, sender: "divider", content: "Today, 9:45 AM" },
    { id: 2, sender: "guest", content: "Do you have a gym on property?", timestamp: "9:45 AM" },
    { id: 3, sender: "ai", content: "Good morning, Mr. Wilson. Yes, our fitness centre is located on the 4th floor and is open 24 hours a day, exclusively for hotel guests.\n\nThe facility features Technogym equipment, free weights, a stretching zone, and complimentary chilled towels and infused water throughout.\n\nPlease let us know if there is anything you need ahead of your session and we will have it ready for you.", timestamp: "9:46 AM", staffName: null, staffRole: null, staffId: null },
    { id: 4, sender: "guest", content: "Perfect, thank you.", timestamp: "9:47 AM" },
    { id: 5, sender: "ai", content: "Our pleasure, Mr. Wilson. Enjoy your workout.", timestamp: "9:47 AM", staffName: null, staffRole: null, staffId: null },
  ],
  3: [
    { id: 1, sender: "divider", content: "Today, 9:30 AM" },
    { id: 2, sender: "guest", content: "Can I extend my checkout time?", timestamp: "9:30 AM" },
    { id: 3, sender: "ai", content: "Good morning, Ms. Brown. Of course, we will pass your request to our Front Desk team right away and they will confirm availability with you shortly.\n\nIs there a specific time you have in mind so we can note it for the team?", timestamp: "9:31 AM", staffName: null, staffRole: null, staffId: null },
    { id: 4, sender: "guest", content: "4pm would be perfect if possible.", timestamp: "9:32 AM" },
    { id: 5, sender: "ai", content: "Noted, Ms. Brown. A late checkout until 4:00 PM has been requested on your behalf. Our Front Desk team will be in touch shortly to confirm.\n\nPlease let us know if there is anything else we can assist with in the meantime.", timestamp: "9:33 AM", staffName: null, staffRole: null, staffId: null },
  ],
  5: [
    { id: 1, sender: "divider", content: "Yesterday, 6:15 PM" },
    { id: 2, sender: "ai", content: "Good evening, Ms. Thompson. We hope you are settling in comfortably. Is there anything we can arrange to make your stay more enjoyable?", timestamp: "6:15 PM", staffName: null, staffRole: null, staffId: null },
    { id: 3, sender: "guest", content: "Everything has been wonderful honestly. The room is stunning.", timestamp: "6:28 PM" },
    { id: 4, sender: "ai", content: "That is so lovely to hear, Ms. Thompson. Thank you for sharing that with us.\n\nPlease do not hesitate to reach out at any time. We are here whenever you need us.", timestamp: "6:29 PM", staffName: null, staffRole: null, staffId: null },
    { id: 5, sender: "guest", content: "Thank you so much!", timestamp: "6:30 PM" },
    { id: 6, sender: "ai", content: "The pleasure is entirely ours, Ms. Thompson. We hope the rest of your stay continues to exceed your expectations. Good night.", timestamp: "6:31 PM", staffName: null, staffRole: null, staffId: null },
  ],
  6: [
    { id: 1, sender: "divider", content: "Yesterday, 3:20 PM" },
    { id: 2, sender: "guest", content: "I need extra towels please.", timestamp: "3:20 PM" },
    { id: 3, sender: "ai", content: "Of course, Mr. Taylor. Fresh towels will be with you within 10 minutes.\n\nWould you also like us to replenish any other bathroom amenities while our team is with you?", timestamp: "3:21 PM", staffName: null, staffRole: null, staffId: null },
    { id: 4, sender: "guest", content: "Just the towels thank you.", timestamp: "3:22 PM" },
    { id: 5, sender: "ai", content: "Understood, Mr. Taylor. Your towels are on their way now.\n\nPlease reach out anytime if there is anything else you need.", timestamp: "3:22 PM", staffName: null, staffRole: null, staffId: null },
  ],
  7: [
    { id: 1, sender: "divider", content: "22 Maggio, ore 14:15" },
    { id: 2, sender: "guest", content: "Buonasera, vorrei prenotare un appuntamento alla spa per domani mattina.", timestamp: "14:15" },
    { id: 3, sender: "ai", content: "Buonasera, Signora Rossi. Saremmo lieti di organizzare il suo trattamento.\n\nDomani mattina abbiamo disponibilita alle 10:00 per il nostro Massaggio al Calore delle Pietre, oppure alle 11:30 per il trattamento Idratante Viso con ingredienti biologici locali. Quale preferisce?", timestamp: "14:16", staffName: null, staffRole: null, staffId: null },
    { id: 4, sender: "guest", content: "Il massaggio alle 10 va benissimo, grazie.", timestamp: "14:18" },
    { id: 5, sender: "ai", content: "Perfetto, Signora Rossi. Il suo appuntamento e confermato per domani alle 10:00 presso il Prime Spa, al quinto piano.\n\nLe consigliamo di arrivare 15 minuti prima per godersi la nostra lounge relax. Un accappatoio e le pantofole saranno pronti per lei.\n\nPuo contare su di noi per qualsiasi altra necessita. Buona serata.", timestamp: "14:19", staffName: null, staffRole: null, staffId: null },
  ],
  4: [
    { id: 1, sender: "divider", content: "Yesterday, 11:43 PM" },
    { id: 2, sender: "guest", content: "I need to speak to someone. The noise from the room next door has been going on for over an hour and my wife and I cannot sleep. This is our anniversary and it has been quite disappointing.", timestamp: "11:43 PM" },
    { id: 3, sender: "ai", content: "Mr. Anderson, I sincerely apologise for this. This is not the experience we want for you and Mrs. Anderson, particularly on such a meaningful occasion. Please accept my deepest apologies.\n\nI am escalating this to our Duty Manager immediately and the situation will be addressed right away.", timestamp: "11:44 PM", staffName: null, staffRole: null, staffId: null },
    { id: 4, sender: "guest", content: "A room move would actually be much better. Thank you.", timestamp: "11:45 PM" },
    { id: 5, sender: "human", content: "Of course, Mr. Anderson. Room 2104 on the 21st floor is being prepared for you right now. It is a corner suite with a beautiful city view and I trust it will be a much more fitting setting for your anniversary.\n\nOur team will assist with your belongings and escort you upstairs shortly.\n\nAgain, please accept our sincerest apologies. We are committed to ensuring the rest of your stay is everything it deserves to be.", timestamp: "11:46 PM", staffName: "Sarah Kim", staffRole: "Front Desk Supervisor", staffId: "SK005" },
    { id: 5.5, sender: "system", content: "Task created: Room move — Liam Anderson", timestamp: "11:46 PM", taskId: 13 },
    { id: 6, sender: "divider", content: "Today, 08:12 AM" },
    { id: 7, sender: "ai", content: "Good morning, Mr. Anderson. We hope you and Mrs. Anderson were able to rest well in your new suite.\n\nPlease let us know if there is anything we can arrange to make today special for your anniversary. It would be our honour to do something memorable for you both.", timestamp: "08:12 AM", staffName: null, staffRole: null, staffId: null },
    { id: 8, sender: "guest", content: "We slept wonderfully, thank you. The suite is absolutely beautiful.", timestamp: "08:34 AM" },
    { id: 9, sender: "ai", content: "That is wonderful to hear, Mr. Anderson. We are so pleased.\n\nHappy anniversary to you and Mrs. Anderson. Please let us know if there is anything at all we can do to make today special for you both.", timestamp: "08:35 AM", staffName: null, staffRole: null, staffId: null },
    { id: 10, sender: "system", content: "Conversation taken over by Franck Delen · General Manager", timestamp: "08:40 AM" },
    { id: 11, sender: "human", content: "A reservation has been arranged for you this evening at our rooftop restaurant as a complimentary gesture from the hotel. Your table will be ready at 7:30 PM with a special anniversary setup.", timestamp: "08:40 AM", staffName: "Franck Delen", staffRole: "General Manager", staffId: "FD001" },
    { id: 12, sender: "system", content: "Alfon AI resumed", timestamp: "08:41 AM" },
  ],
  9: [
    { id: 1, sender: "divider", content: "Today, 11:14 AM" },
    { id: 2, sender: "guest", content: "Hello, I was wondering if I could get a breakdown of my bill so far? I also wanted to check how many loyalty points I will be earning from this stay.", timestamp: "11:14 AM" },
    { id: 3, sender: "ai", content: "Good morning, Mr. Hartmann. Of course, we would be happy to assist with that.\n\nWe can pull up your current folio and confirm the Layana loyalty points accrued for this stay. Allow us a moment — our Front Desk team will have the full details for you shortly.", timestamp: "11:18 AM", staffName: null, staffRole: null, staffId: null },
    { id: 4, sender: "system", content: "Task created: Bill review & loyalty points — Alexander Hartmann · Front Desk", timestamp: "11:18 AM", taskId: 20 },
    { id: 5, sender: "system", content: "Conversation taken over by Sarah Kim · Front Desk Supervisor", timestamp: "11:22 AM" },
    { id: 6, sender: "human", content: "Mr. Hartmann, this is Sarah from the Front Desk. I have reviewed your folio and I am glad to assist.\n\nYour current balance stands at THB 142,800, which includes your suite for 4 nights, in-room dining on the evening of the 22nd, and the spa treatment on the 23rd. A full itemised statement will be sent to your email shortly.\n\nRegarding your Layana loyalty points, your stay qualifies you for 1,428 points, which will be credited to your account within 3 business days of checkout. Is there anything on the bill you would like to go through in more detail?", timestamp: "11:28 AM", staffName: "Sarah Kim", staffRole: "Front Desk Supervisor", staffId: "SK005" },
    { id: 7, sender: "guest", content: "That's very clear, thank you Sarah. The breakdown looks correct. I just want to make sure the spa treatment is posted under my company account, not personal.", timestamp: "11:31 AM" },
    { id: 8, sender: "human", content: "Absolutely, Mr. Hartmann. I will move the spa charge to your company folio right away. You will receive two separate statements — one for personal charges and one for company expenses — by email within the next few minutes. Is there anything else I can help with?", timestamp: "11:33 AM", staffName: "Sarah Kim", staffRole: "Front Desk Supervisor", staffId: "SK005" },
    { id: 9, sender: "guest", content: "Perfect, that is exactly what I needed. Thank you very much.", timestamp: "11:34 AM" },
    { id: 10, sender: "human", content: "My pleasure, Mr. Hartmann. Please do not hesitate to contact us if anything else comes up. Enjoy the rest of your stay.", timestamp: "11:35 AM", staffName: "Sarah Kim", staffRole: "Front Desk Supervisor", staffId: "SK005" },
  ],
  8: [
    { id: 1, sender: "divider", content: "Today, 10:15 AM" },
    { id: 2, sender: "ai", content: "Dear Ms. Mitchell, we are delighted to welcome you to Layana Resort & Spa tomorrow. Your suite is being prepared and we look forward to having you with us.\n\nTo ensure everything is perfectly in place for your arrival, may we ask if you have any room preferences or dietary requirements we should be aware of?\n\nWe would also love to know the purpose of your visit so we can tailor your experience accordingly.", timestamp: "10:15 AM", staffName: null, staffRole: null, staffId: null },
    { id: 3, sender: "guest", content: "Thank you! I am actually coming to recover after a really stressful few months. I just need rest and quiet.", timestamp: "10:28 AM" },
    { id: 4, sender: "ai", content: "Ms. Mitchell, thank you for sharing that with us. We want this stay to feel like a true retreat.\n\nCould you let us know if you have a preference for floor level, temperature, or anything else that would help you feel most at ease? We will share these with our Front Desk team ahead of your arrival.\n\nWe would also be glad to arrange a moment of relaxation at our spa during your stay, entirely at your leisure, if that is of interest.", timestamp: "10:29 AM", staffName: null, staffRole: null, staffId: null },
    { id: 5, sender: "guest", content: "That's so kind. A quiet, high floor room would be lovely, and yes, the spa sounds wonderful.", timestamp: "10:30 AM" },
    { id: 6, sender: "ai", content: "Thank you, Ms. Mitchell. We have noted your preference for a quiet, high floor room and shared this with our Front Desk team ahead of your arrival.\n\nA complimentary herbal tea will be waiting for you, and our spa team will reach out with a curated selection of restorative treatments, entirely at your leisure.", timestamp: "10:31 AM", staffName: null, staffRole: null, staffId: null },
    { id: 7, sender: "guest", content: "This already feels different. Thank you so much.", timestamp: "10:33 AM" },
    { id: 8, sender: "ai", content: "It is our pleasure, Ms. Mitchell. You will not be disturbed unless you need us, and whenever you do, we are here.\n\nWe look forward to welcoming you tomorrow. Safe travels.", timestamp: "10:34 AM", staffName: null, staffRole: null, staffId: null },
  ],
};

window.chatMessages[10] = [
  { id: 1, sender: "divider", content: "اليوم", timestamp: null, staffName: null, staffRole: null, staffId: null },
  { id: 2, sender: "guest", content: "السلام عليكم، أودّ الاستفسار عن إمكانية وجود موظف ناطق بالعربية لاستقبالي عند الوصول.", timestamp: "2:10 PM", staffName: null, staffRole: null, staffId: null },
  { id: 3, sender: "ai", content: "وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً بكم يا سيد المنصوري.\n\nيسعدنا جداً تلبية طلبكم. سيكون أحد أعضاء فريقنا الناطقين بالعربية في استقبالكم عند الوصول لمرافقتكم وتسهيل إجراءات تسجيل الدخول. هل هناك أي طلبات أخرى يمكننا تجهيزها لكم؟", timestamp: "2:11 PM", staffName: null, staffRole: null, staffId: null },
  { id: 4, sender: "guest", content: "شكراً جزيلاً. أيضاً، هل يمكن ضبط لغة التلفاز على العربية في الغرفة؟", timestamp: "2:12 PM", staffName: null, staffRole: null, staffId: null },
  { id: 5, sender: "ai", content: "بكل سرور يا سيد المنصوري. سنقوم بتنسيق ذلك مع فريق الغرف فوراً لضبط لغة التلفاز على العربية قبل وصولكم.\n\nهل تودّون أي شيء آخر نجهزه لكم في الغرفة؟", timestamp: "2:13 PM", staffName: null, staffRole: null, staffId: null },
  { id: 6, sender: "guest", content: "لا، هذا كافٍ. أقدّر تعاونكم.", timestamp: "2:14 PM", staffName: null, staffRole: null, staffId: null },
  { id: 7, sender: "ai", content: "شرف لنا خدمتكم يا سيد المنصوري. سيكون في انتظاركم موظف ناطق بالعربية عند وصولكم، وسيتم ضبط التلفاز على العربية قبل دخولكم الغرفة.\n\nنتطلع إلى استقبالكم في أمان نيويورك. أهلاً وسهلاً.", timestamp: "2:15 PM", staffName: null, staffRole: null, staffId: null },
];

window.chatMessages[11] = [
  { id: 1, sender: "divider", content: "Today, 3:00 PM" },
  { id: 2, sender: "guest", content: "Hi, can you arrange an airport transfer for us?", timestamp: "3:00 PM" },
  { id: 3, sender: "ai", content: "Good afternoon, Mr. Johnson. We would be delighted to arrange your arrival transfer.\n\nTo ensure we have the right vehicle ready for you, could you share a few details: your flight number and arrival time, the number of guests travelling, and how much luggage you will be bringing?", timestamp: "3:01 PM", staffName: null, staffRole: null, staffId: null },
  { id: 4, sender: "guest", content: "Flight PG212 from Bangkok, arriving tomorrow around 2pm. Just the two of us, one suitcase each.", timestamp: "3:03 PM" },
  { id: 5, sender: "ai", content: "Thank you. Based on your details, we have the following vehicles available from Krabi Airport:\n\n- Mercedes E-Class Sedan: refined and comfortable, ideal for two guests travelling light (THB 2,500)\n- Toyota Alphard Royal Lounge: our most requested choice, with executive seating, tinted windows, and generous luggage space (THB 3,500)\n- Mercedes V-Class: the ultimate in space and comfort for those who prefer extra room to relax on arrival (THB 4,500)\n\nAll transfers include a meet-and-greet at the arrivals hall with a name board, chilled towels, and refreshments on board. Which would you prefer?", timestamp: "3:04 PM", staffName: null, staffRole: null, staffId: null },
  { id: 6, sender: "guest", content: "The Alphard please, that sounds lovely.", timestamp: "3:06 PM" },
  { id: 7, sender: "human", content: "With pleasure. Your Toyota Alphard Royal Lounge is confirmed for tomorrow, Mr. Johnson, tracking flight PG212 from Bangkok. Our driver will meet you at Krabi Airport arrivals hall with a name board.\n\nThe transfer fee of THB 3,500 will be charged to your villa upon arrival.\n\nIs there anything else we can prepare before you arrive?", timestamp: "3:07 PM", staffName: "Concierge", staffRole: "Concierge Team", staffId: "CON001" },
  { id: 8, sender: "guest", content: "That's wonderful, thank you. We're actually celebrating our anniversary.", timestamp: "3:08 PM" },
  { id: 9, sender: "ai", content: "How lovely, congratulations! That is wonderful news and it has been noted.\n\nHave you planned anything special for the occasion? We would love to help if there is anything we can arrange to make it even more meaningful.", timestamp: "3:09 PM", staffName: null, staffRole: null, staffId: null },
  { id: 10, sender: "guest", content: "Yes please, that would be lovely. Also, my wife is vegetarian.", timestamp: "3:11 PM" },
  { id: 11, sender: "ai", content: "Regarding your wife's vegetarian diet, our signature restaurant Sarn specialises in contemporary Thai cuisine with a dedicated focus on plant-based cooking. Our Executive Chef, Chef Niran Sombat, crafts a seasonal vegetarian tasting menu each evening drawing from locally grown herbs and produce from our garden. Signature dishes include a wild mushroom tom kha, roasted vegetable massaman, and a house green mango salad with toasted coconut.\n\nWould you care for a dinner reservation at Sarn during your stay?", timestamp: "3:12 PM", staffName: null, staffRole: null, staffId: null },
  { id: 12, sender: "guest", content: "Yes please, that would be wonderful.", timestamp: "3:14 PM" },
  { id: 13, sender: "ai", content: "With pleasure. Which evening would you prefer, and may I ask what time suits you best?", timestamp: "3:15 PM", staffName: null, staffRole: null, staffId: null },
  { id: 14, sender: "guest", content: "The second evening of our stay, around 7:30pm.", timestamp: "3:16 PM" },
  { id: 15, sender: "ai", content: "Your table at Sarn is confirmed for 26 May at 7:30 PM. Chef Niran will be informed of your wife's vegetarian preference and our F&B team will ensure the tasting menu is tailored accordingly.\n\nWe very much look forward to your stay, Mr. Johnson.", timestamp: "3:17 PM", staffName: null, staffRole: null, staffId: null },
  { id: 16, sender: "divider", content: "In House" },
  { id: 17, sender: "guest", content: "Good morning! Can we book a couples massage?", timestamp: "9:15 AM" },
  { id: 18, sender: "ai", content: "Good morning! We would be happy to arrange a couples treatment for you.\n\nWe have two options available:\n\n- Couples Journey (90 min): coconut scrub, aromatic oil massage, and a private soak in your couples bathing suite\n- Traditional Thai Couples Massage (60 min): in our signature treatment pavilion\n\nWhich would you prefer, and would you care for a morning or afternoon booking?", timestamp: "9:16 AM", staffName: null, staffRole: null, staffId: null },
  { id: 19, sender: "guest", content: "The 90-minute couples journey sounds perfect. This afternoon please.", timestamp: "9:18 AM" },
  { id: 20, sender: "ai", content: "We will pass your request to our spa team right away and they will confirm your booking shortly, including any preparation notes for your treatment.", timestamp: "9:19 AM", staffName: null, staffRole: null, staffId: null },
  { id: 21, sender: "human", content: "Good morning. Your 90-Minute Couples Journey is confirmed for this afternoon at 3:00 PM. Please arrive 10 minutes early to enjoy our relaxation lounge and herbal tea. We recommend light clothing and suggest avoiding the pool for 2 hours prior to your treatment. We look forward to welcoming you.", timestamp: "9:24 AM", staffName: "Spa Reception", staffRole: "Spa Team", staffId: "SPA001" },
];
window.CHAT_QUICK_SUMMARY = {
  9: [
    "💳 Bill breakdown requested — folio reviewed by Sarah Kim, Front Desk ✓",
    "🏅 1,428 Layana loyalty points confirmed for this stay ✓",
    "📋 Spa charge moved to company folio — two separate statements sent ✓",
  ],
  1: [
    "🚙 Business Class SUV transfer at 7:00 AM — Krabi Airport ✓",
    "🥐 To-go breakfast box arranged for 7:00 AM departure ✓",
  ],
  4: [
    "🛎 Moved to Room 2104 after a noise complaint ✓ Service recovery completed",
    "🍽 GM personally arranged a rooftop dinner reservation for tonight ✓ Anniversary context flagged for all departments",
  ],
  5: [
    "🧘 Arriving tomorrow for a restorative stay ✓ Quiet, high floor preference shared with Front Desk",
    "🍵 Herbal tea arranged ✓ Spa offer accepted ✓ Minimal contact requested",
  ],
  10: [
    "Arabic-speaking meet & greet requested — Task created for Front Desk",
    "TV language to Arabic in Room 1710 — Task created for Housekeeping",
  ],
};

window.guestItineraries = {
  1: [
    { time: "7:00 AM", event: "Private Transfer to Krabi Airport" },
    { time: "7:00 AM", event: "To-go Breakfast Box" },
  ],
  4: [
    { time: "7:30 PM", event: "Rooftop Restaurant Dinner" },
  ],
  8: [
    { time: "10:00 AM", event: "Spa: Hot Stone Massage (Prime Spa, 5th Floor)" },
  ],
  11: [
    { time: "2:00 PM",  event: "Airport Transfer: flight PG212, Toyota Alphard from Krabi Airport" },
    { time: "3:00 PM",  event: "Couples Journey Spa (90 min)" },
    { time: "7:30 PM",  event: "Dinner at Sarn (26 May, vegetarian tasting menu)" },
  ],
};

// slaMinutes = SLA target duration. elapsedSeconds = how long the task has already
// been running when the app loads, so different tasks open in different SLA states
// (green / amber / red-critical / overdue) for the live countdown demo.
window.tasks = [
  { id: 1, priority: "High", title: "Airport Pickup", guest: "Emma Davis", room: "1608", department: "Concierge", assignee: "John S.", due: "10:00 AM", status: "In Progress", notes: "Private car requested for 7:00 AM airport transfer.", slaMinutes: 10, elapsedSeconds: 180,
    timeline: [
      { label: "Task Created", time: "09:48 AM", desc: "Generated from guest WhatsApp request", done: true },
      { label: "Task Assigned", time: "09:49 AM", desc: "Assigned to John S. (Concierge)", done: true },
      { label: "Task Accepted", time: "09:52 AM", desc: "John S. confirmed receipt", done: true },
      { label: "Task Completed", time: "Pending", desc: "", done: false },
    ] },
  { id: 2, priority: "Medium", title: "AC Maintenance", guest: "James Wilson", room: "2205", department: "Engineering", assignee: "Mike R.", due: "11:30 AM", status: "Pending", notes: "Guest reports AC unit not cooling effectively.", slaMinutes: 60, elapsedSeconds: 2400, category: "Complaint",
    compensation: { type: "Room Discount", amount: 120, reason: "AC malfunction during stay", approvedBy: "Sarah Kim", status: "Approved" } },
  { id: 3, priority: "Low", title: "Late Checkout", guest: "Liam Anderson", room: "1203", department: "Front Desk", assignee: "Sarah K.", due: "01:00 PM", status: "Pending", notes: "Requested checkout extended to 2:00 PM.", slaMinutes: 20, elapsedSeconds: 1130 },
  { id: 4, priority: "Medium", title: "Welcome Amenity", guest: "Isabella Rossi", room: "2104", department: "Room Service", assignee: "Anna P.", due: "03:00 PM", status: "Pending", notes: "VIP welcome amenity to be delivered before guest returns.", slaMinutes: 30, elapsedSeconds: 300 },
  { id: 5, priority: "High", title: "Extra Towels", guest: "William Taylor", room: "1107", department: "Housekeeping", assignee: "Lisa M.", due: "09:45 AM", status: "Completed", notes: "Delivered 4 extra towels.", slaMinutes: 15, elapsedSeconds: 600 },
  { id: 6, priority: "Medium", title: "Breakfast Inquiry", guest: "Noah Martinez", room: "1802", department: "Food and Beverage", assignee: "Tom H.", due: "08:30 AM", status: "Completed", notes: "Confirmed breakfast included, informed guest of dining hours.", slaMinutes: 10, elapsedSeconds: 240 },
  { id: 7, priority: "High", title: "Spa Appointment Confirmation", guest: "Isabella Rossi", room: "2104", department: "Concierge", assignee: "John S.", due: "12:00 PM", status: "In Progress", notes: "Confirming 2:00 PM massage booking.", slaMinutes: 10, elapsedSeconds: 780 },
  { id: 8, priority: "Medium", title: "Minibar Restock", guest: "Olivia Brown", room: "1203", department: "Room Service", assignee: "Anna P.", due: "02:00 PM", status: "Pending", notes: "Restock minibar per standard inventory.", slaMinutes: 25, elapsedSeconds: 60 },
  { id: 9, priority: "Low", title: "Newspaper Delivery", guest: "Emma Davis", room: "1608", department: "Front Desk", assignee: "Sarah K.", due: "07:00 AM", status: "Completed", notes: "Financial Times delivered daily.", slaMinutes: 5, elapsedSeconds: 120 },
  { id: 10, priority: "High", title: "Plumbing Issue", guest: "Liam Anderson", room: "1802", department: "Engineering", assignee: "Mike R.", due: "10:30 AM", status: "In Progress", notes: "Slow drain reported in bathroom sink.", slaMinutes: 45, elapsedSeconds: 1500, category: "Complaint" },
  { id: 11, priority: "Medium", title: "Turndown Service", guest: "James Wilson", room: "2205", department: "Housekeeping", assignee: "Maria S.", due: "07:00 PM", status: "Pending", notes: "Standard evening turndown.", slaMinutes: 15, elapsedSeconds: 200 },
  { id: 12, priority: "Low", title: "Restaurant Reservation", guest: "Sarah Mitchell", room: "2501", department: "Food and Beverage", assignee: "Tom H.", due: "07:30 PM", status: "Pending", notes: "Anniversary dinner table for 2, window seating preferred.", slaMinutes: 20, elapsedSeconds: 90 },
  { id: 13, priority: "High", title: "Room move — Liam Anderson", guest: "Liam Anderson", room: "1802 → 2104", department: "Front Desk", assignee: "Sarah K.", due: "Yesterday 11:44 PM", status: "Completed", notes: "Guest moved due to noise complaint on anniversary night. Corner suite arranged.", category: "Complaint",
    compensation: { type: "Complimentary Room Upgrade", amount: 0, reason: "Noise disturbance on anniversary night", approvedBy: "Sarah Kim", status: "Approved" } },
  { id: 15, priority: "Medium", title: "Late checkout request — Olivia Brown", guest: "Olivia Brown", room: "1203", department: "Front Desk", assignee: "Sarah K.", due: "Today 10:00 AM", status: "Pending", notes: "Guest has requested late checkout until 4:00 PM. Please confirm availability and respond to guest directly." },
  { id: 16, priority: "Low", title: "Extra towels — William Taylor", guest: "William Taylor", room: "1107", department: "Housekeeping", assignee: "Maria S.", due: "Yesterday 3:21 PM", status: "Completed", notes: "Guest requested extra towels only. Delivered within 10 minutes." },
  { id: 20, title: "Bill Review & Loyalty Points", guest: "Alexander Hartmann", room: "1904", department: "Front Desk", assignee: "", status: "Pending", notes: "Guest requested a full folio breakdown and confirmation of loyalty points earned this stay. Ensure spa charge is split to company account. Escalated from AI chat.", slaMinutes: 15, elapsedSeconds: 0,
    timeline: [
      { label: "Task Created", time: "11:18 AM", desc: "Generated from guest chat — AI escalation", done: true },
      { label: "Task Assigned", time: "Pending", desc: "", done: false },
      { label: "Task Accepted", time: "Pending", desc: "", done: false },
      { label: "Task Completed", time: "Pending", desc: "", done: false },
    ] },
  { id: 17, title: "Iron & Ironing Board Request", guest: "Daniel Kim", room: "1305", department: "Housekeeping", assignee: "", due: "02:30 PM", status: "Pending", notes: "Guest requested an iron and ironing board to be delivered to room.", slaMinutes: 15, elapsedSeconds: 0 },
  { id: 18, title: "Taxi Arrangement", guest: "Noah Martinez", room: "1802", department: "Concierge", assignee: "", due: "03:00 PM", status: "Pending", notes: "Guest needs a standard taxi to Shinjuku. No preference on vehicle type.", slaMinutes: 10, elapsedSeconds: 0 },
  { id: 19, title: "Wake-up Call Setup", guest: "Ava Thompson", room: "2501", department: "Front Desk", assignee: "", due: "Tomorrow 6:00 AM", status: "Pending", notes: "Guest requested a wake-up call at 6:00 AM for an early morning flight.", slaMinutes: 20, elapsedSeconds: 0 },
  { id: 22, title: "Arabic-Speaking Meet & Greet — Khalid Al-Mansouri", guest: "Khalid Al-Mansouri", room: "1710", department: "Front Desk", assignee: "Sarah Kim", due: "Upon Arrival", status: "Pending", notes: "An Arabic-speaking Front Desk team member must be present at the entrance to greet the guest upon arrival.", slaMinutes: 10, elapsedSeconds: 0 },
  { id: 23, title: "TV Language Set to Arabic — Room 1710", guest: "Khalid Al-Mansouri", room: "1710", department: "Housekeeping", assignee: "Maria Santos", due: "Before Guest Arrival", status: "Pending", notes: "Please set the television language to Arabic before the guest checks in.", slaMinutes: 15, elapsedSeconds: 0 },
];

window.taskTimelineMap = {
  2:  [ // AC Maintenance
    { label: "Task Created",   time: "10:05 AM", desc: "Generated from guest in-app complaint", done: true },
    { label: "Task Assigned",  time: "10:07 AM", desc: "Assigned to Mike R. (Engineering)", done: true },
    { label: "Task Accepted",  time: "10:11 AM", desc: "Mike R. confirmed receipt", done: true },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  3:  [ // Late Checkout
    { label: "Task Created",   time: "08:30 AM", desc: "Generated from guest phone call", done: true },
    { label: "Task Assigned",  time: "08:31 AM", desc: "Assigned to Sarah K. (Front Desk)", done: true },
    { label: "Task Accepted",  time: "08:35 AM", desc: "Sarah K. confirmed receipt", done: true },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  4:  [ // Welcome Amenity
    { label: "Task Created",   time: "02:10 PM", desc: "Generated from reservation notes", done: true },
    { label: "Task Assigned",  time: "02:12 PM", desc: "Assigned to Anna P. (Room Service)", done: true },
    { label: "Task Accepted",  time: "02:18 PM", desc: "Anna P. confirmed receipt", done: true },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  5:  [ // Extra Towels
    { label: "Task Created",   time: "09:20 AM", desc: "Generated from guest WhatsApp request", done: true },
    { label: "Task Assigned",  time: "09:21 AM", desc: "Assigned to Lisa M. (Housekeeping)", done: true },
    { label: "Task Accepted",  time: "09:24 AM", desc: "Lisa M. confirmed receipt", done: true },
    { label: "Task Completed", time: "09:38 AM", desc: "4 extra towels delivered to room", done: true },
  ],
  6:  [ // Breakfast Inquiry
    { label: "Task Created",   time: "07:55 AM", desc: "Generated from guest phone call", done: true },
    { label: "Task Assigned",  time: "07:56 AM", desc: "Assigned to Tom H. (Food and Beverage)", done: true },
    { label: "Task Accepted",  time: "07:58 AM", desc: "Tom H. confirmed receipt", done: true },
    { label: "Task Completed", time: "08:10 AM", desc: "Guest informed of breakfast hours and inclusions", done: true },
  ],
  7:  [ // Spa Appointment
    { label: "Task Created",   time: "11:30 AM", desc: "Generated from guest chat request", done: true },
    { label: "Task Assigned",  time: "11:31 AM", desc: "Assigned to John S. (Concierge)", done: true },
    { label: "Task Accepted",  time: "11:36 AM", desc: "John S. confirmed receipt", done: true },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  8:  [ // Minibar Restock
    { label: "Task Created",   time: "01:45 PM", desc: "Generated from housekeeping inspection", done: true },
    { label: "Task Assigned",  time: "01:46 PM", desc: "Assigned to Anna P. (Room Service)", done: true },
    { label: "Task Accepted",  time: "01:52 PM", desc: "Anna P. confirmed receipt", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  9:  [ // Newspaper Delivery
    { label: "Task Created",   time: "06:30 AM", desc: "Auto-generated from guest preference profile", done: true },
    { label: "Task Assigned",  time: "06:31 AM", desc: "Assigned to Sarah K. (Front Desk)", done: true },
    { label: "Task Accepted",  time: "06:33 AM", desc: "Sarah K. confirmed receipt", done: true },
    { label: "Task Completed", time: "06:52 AM", desc: "Financial Times delivered to room 1608", done: true },
  ],
  10: [ // Plumbing Issue
    { label: "Task Created",   time: "09:45 AM", desc: "Generated from guest WhatsApp complaint", done: true },
    { label: "Task Assigned",  time: "09:47 AM", desc: "Assigned to Mike R. (Engineering)", done: true },
    { label: "Task Accepted",  time: "09:50 AM", desc: "Mike R. confirmed receipt", done: true },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  11: [ // Turndown Service
    { label: "Task Created",   time: "05:00 PM", desc: "Auto-generated from housekeeping schedule", done: true },
    { label: "Task Assigned",  time: "05:01 PM", desc: "Assigned to Maria S. (Housekeeping)", done: true },
    { label: "Task Accepted",  time: "05:08 PM", desc: "Maria S. confirmed receipt", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  12: [ // Restaurant Reservation
    { label: "Task Created",   time: "03:20 PM", desc: "Generated from guest in-app request", done: true },
    { label: "Task Assigned",  time: "03:21 PM", desc: "Assigned to Tom H. (Food and Beverage)", done: true },
    { label: "Task Accepted",  time: "03:27 PM", desc: "Tom H. confirmed receipt", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  15: [ // Late Checkout — Olivia Brown
    { label: "Task Created",   time: "09:00 AM", desc: "Generated from guest chat request", done: true },
    { label: "Task Assigned",  time: "09:02 AM", desc: "Assigned to Sarah K. (Front Desk)", done: true },
    { label: "Task Accepted",  time: "09:06 AM", desc: "Sarah K. confirmed receipt", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  16: [ // Extra Towels — William Taylor
    { label: "Task Created",   time: "03:05 PM", desc: "Generated from guest WhatsApp request", done: true },
    { label: "Task Assigned",  time: "03:06 PM", desc: "Assigned to Maria S. (Housekeeping)", done: true },
    { label: "Task Accepted",  time: "03:09 PM", desc: "Maria S. confirmed receipt", done: true },
    { label: "Task Completed", time: "03:21 PM", desc: "Extra towels delivered to room 1107", done: true },
  ],
  17: [ // Iron & Ironing Board
    { label: "Task Created",   time: "02:15 PM", desc: "Generated from guest in-app request", done: true },
    { label: "Task Assigned",  time: "02:16 PM", desc: "Assigned to Housekeeping team", done: true },
    { label: "Task Accepted",  time: "Pending",  desc: "", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  18: [ // Taxi Arrangement
    { label: "Task Created",   time: "02:40 PM", desc: "Generated from guest phone call", done: true },
    { label: "Task Assigned",  time: "02:41 PM", desc: "Assigned to Concierge team", done: true },
    { label: "Task Accepted",  time: "Pending",  desc: "", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  19: [ // Wake-up Call
    { label: "Task Created",   time: "10:30 PM", desc: "Generated from guest phone call", done: true },
    { label: "Task Assigned",  time: "10:31 PM", desc: "Assigned to Front Desk team", done: true },
    { label: "Task Accepted",  time: "Pending",  desc: "", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  22: [ // Khalid Meet & Greet
    { label: "Task Created",   time: "11:00 AM", desc: "Generated from AI guest profile analysis", done: true },
    { label: "Task Assigned",  time: "11:02 AM", desc: "Assigned to Sarah Kim (Front Desk)", done: true },
    { label: "Task Accepted",  time: "11:07 AM", desc: "Sarah Kim confirmed receipt", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
  23: [ // TV Language Arabic
    { label: "Task Created",   time: "11:00 AM", desc: "Generated from AI guest profile analysis", done: true },
    { label: "Task Assigned",  time: "11:03 AM", desc: "Assigned to Maria Santos (Housekeeping)", done: true },
    { label: "Task Accepted",  time: "11:10 AM", desc: "Maria Santos confirmed receipt", done: false },
    { label: "Task Completed", time: "Pending",  desc: "", done: false },
  ],
};

window.defaultTaskTimeline = (task) => [
  { label: "Task Created",   time: "—",       desc: "Task created", done: true },
  { label: "Task Assigned",  time: "—",       desc: task.assignee ? `Assigned to ${task.assignee} (${task.department})` : "Pending assignment", done: !!task.assignee },
  { label: "Task Accepted",  time: "Pending", desc: "", done: task.status === "Completed" },
  { label: "Task Completed", time: task.status === "Completed" ? "—" : "Pending", desc: "", done: task.status === "Completed" },
];

window.getTaskTimeline = (task) => window.taskTimelineMap[task.id] || task.timeline || window.defaultTaskTimeline(task);

window.chatIntelligence = {
  9: {
    preferences: ["Bill Transparency", "Business Travel", "Loyalty Programme", "Company Account Billing"],
    sentiment: 88,
    sentimentLabel: "Positive Sentiment",
    loyalty: "Medium",
    recommendations: ["Send Itemised Folio by Email", "Confirm Points Credited at Checkout", "Offer Direct Booking Rate for Next Stay"],
  },
  1: {
    preferences: ["Private Transport", "Fast & Punctual Service", "Business Travel", "Early Departures"],
    sentiment: 94,
    sentimentLabel: "Positive Sentiment",
    loyalty: "High",
    recommendations: ["Offer Express Check-Out", "Offer Airport Assistance", "Create Preference Profile"],
  },
  2: {
    preferences: ["Fitness-Focused", "Quiet Rooms", "Vegetarian Dining"],
    sentiment: 81,
    sentimentLabel: "Positive Sentiment",
    loyalty: "Medium",
    recommendations: ["Offer Gym Class Schedule", "Suggest Vegetarian Tasting Menu"],
  },
  3: {
    preferences: ["Leisure Travel", "Flexible Schedule"],
    sentiment: 76,
    sentimentLabel: "Positive Sentiment",
    loyalty: "Medium",
    recommendations: ["Offer Late Checkout Upgrade", "Suggest Spa Package"],
  },
};

window.taskStats = { all: 128, inProgress: 45, pending: 31, completed: 52 };

window.auditLog = [
  { taskId: 11, taskTitle: "Turndown Service", room: "1802", department: "Housekeeping", origin: "manual", createdBy: "Maria S.", role: "Staff", createdAt: "Today 13:10", completedAt: "Today 13:22", actualDuration: 12, flags: [] },
  { taskId: 21, taskTitle: "Turndown Service", room: "1802", department: "Housekeeping", origin: "manual", createdBy: "Maria S.", role: "Staff", createdAt: "Today 18:45", completedAt: "Today 18:53", actualDuration: 8, flags: ["DUPLICATE"] },
  { taskId: 22, taskTitle: "Room Cleaning", room: "2205", department: "Housekeeping", origin: "manual", createdBy: "James C.", role: "Supervisor", createdAt: "Today 09:00", completedAt: "Today 09:04", actualDuration: 4, flags: ["UNUSUALLY_FAST"] },
  { taskId: 23, taskTitle: "Guest Request", room: "1608", department: "Front Desk", origin: "manual", createdBy: "Franck D.", role: "GM", createdAt: "Today 11:00", completedAt: "Today 11:15", actualDuration: 15, flags: ["MANAGEMENT_CREATED"] },
  { taskId: 24, taskTitle: "Extra Towels", room: "1107", department: "Housekeeping", origin: "manual", createdBy: "Lisa M.", role: "Staff", createdAt: "Yesterday 14:00", completedAt: "Yesterday 14:09", actualDuration: 9, flags: [] },
  { taskId: 25, taskTitle: "Minibar Restock", room: "1203", department: "Room Service", origin: "manual", createdBy: "Anna P.", role: "Staff", createdAt: "Yesterday 15:00", completedAt: "Yesterday 15:14", actualDuration: 14, flags: [] },
  { taskId: 26, taskTitle: "AC Check", room: "2205", department: "Engineering", origin: "manual", createdBy: "Mike R.", role: "Staff", createdAt: "Today 10:00", completedAt: "Today 10:45", actualDuration: 45, flags: [] },
  { taskId: 27, taskTitle: "Room Cleaning", room: "2205", department: "Housekeeping", origin: "manual", createdBy: "James C.", role: "Supervisor", createdAt: "Today 15:00", completedAt: "Today 15:03", actualDuration: 3, flags: ["UNUSUALLY_FAST", "DUPLICATE"] },
];

window.slaAdjustmentLog = [
  { id: 1, dateTime: "Today 14:32", taskTitle: "Guest Request", room: "1608", field: "Completion Time", fromVal: "12 min", toVal: "5 min", changedBy: "Franck D.", role: "GM", flags: ["REDUCED_PAST_SLA"], note: "Moved from over SLA to under SLA" },
  { id: 2, dateTime: "Today 11:15", taskTitle: "Room Cleaning", room: "2205", field: "Completion Time", fromVal: "52 min", toVal: "40 min", changedBy: "James C.", role: "Supervisor", flags: ["REDUCED_PAST_SLA"], note: "Moved past SLA threshold" },
  { id: 3, dateTime: "Today 10:40", taskTitle: "AC Maintenance", room: "1802", field: "SLA Target", fromVal: "60 min", toVal: "90 min", changedBy: "Mike R.", role: "Staff", flags: ["SLA_EXTENDED_AFTER_START"], note: "Target changed after task started" },
  { id: 4, dateTime: "Yesterday 16:20", taskTitle: "Extra Towels", room: "1107", field: "Completion Time", fromVal: "—", toVal: "9 min", changedBy: "Lisa M.", role: "Staff", flags: [], note: "Forgot to log, corrected same day" },
  { id: 5, dateTime: "Yesterday 09:05", taskTitle: "Turndown", room: "2104", field: "Status", fromVal: "Pending", toVal: "Completed", changedBy: "Anna P.", role: "Staff", flags: [], note: "Normal correction" },
];

window.taskEditHistory = {
  2: [
    { label: "Created by Mike R. (Staff)", time: "Today 09:00", type: "create" },
    { label: "Completion time set: 52 min", time: "Today 10:00", type: "normal" },
    { label: "Completion time changed: 52 min → 40 min", time: "Today 11:15", editedBy: "James C. (Supervisor)", type: "flagged" },
  ],
};

function makeRooms() {
  const floors = [10, 11, 12, 13, 14, 15, 16];
  const types = ["Deluxe Room", "Deluxe Suite", "Executive Room", "Premium Room", "Junior Suite"];
  const guestsPool = window.guests;
  const statuses = ["Clean", "InProgress", "Inspection", "OutOfService"];
  const weights = [0.6, 0.15, 0.1, 0.15];
  const rooms = [];
  let id = 0;
  floors.forEach((floor) => {
    for (let i = 1; i <= 5; i++) {
      id++;
      const roll = Math.random();
      let cum = 0, status = statuses[0];
      for (let s = 0; s < statuses.length; s++) { cum += weights[s]; if (roll <= cum) { status = statuses[s]; break; } }
      const occupied = Math.random() > 0.3;
      const guest = occupied ? guestsPool[id % guestsPool.length] : null;
      rooms.push({
        id, number: `${floor}0${i}`, floor, type: types[id % types.length], status,
        guest: guest ? guest.name : null, timer: status === "InProgress" ? `${10 + (id % 20)} mins` : null,
      });
    }
  });
  return rooms;
}
window.rooms = makeRooms();
window.roomStats = { total: 245, cleanReady: 189, inProgress: 23, needsInspection: 18, outOfService: 15 };

window.checklistItems = [
  "Remove used amenities and replace with fresh ones",
  "Strip and remake bed with fresh linen",
  "Clean and sanitise bathroom (toilet, sink, shower)",
  "Vacuum carpets and mop hard floors",
  "Dust all surfaces, furniture, and fixtures",
  "Clean mirrors and glass surfaces",
  "Restock minibar and check inventory",
  "Replace stationery and hotel literature",
  "Final walkthrough and quality check",
  "Submit for supervisor inspection",
];

window.inspectionItems = [
  // SECTION 1: BEDROOM (24 items)
  { n: 1, section: "Bedroom", category: "Cleanliness", text: "Were the carpet/tiles/wood flooring clean and free of stains/dust?" },
  { n: 2, section: "Bedroom", category: "Cleanliness", text: "Were all walls, doors, baseboards clean and free of marks/dirt/smudges/dust?" },
  { n: 3, section: "Bedroom", category: "Cleanliness", text: "Were ceilings, vents, smoke detectors and sprinklers clean and free of any dust?" },
  { n: 4, section: "Bedroom", category: "Cleanliness", text: "Was the room at a comfortable temperature on arrival?" },
  { n: 5, section: "Bedroom", category: "Cleanliness", text: "Was the room free of odor on arrival?" },
  { n: 6, section: "Bedroom", category: "Cleanliness", text: "Was the bed neatly made with clean linen, which was free of stains and tears and was the bed valance/skirting (if applicable) clean and neatly arranged?" },
  { n: 7, section: "Bedroom", category: "Cleanliness", text: "Was the headboard in excellent condition and if applicable, were the bedspread/blankets/scatter cushions/bolsters clean?" },
  { n: 8, section: "Bedroom", category: "Cleanliness", text: "Was all upholstered furniture clean and free of stains?" },
  { n: 9, section: "Bedroom", category: "Cleanliness", text: "Were all the furniture surfaces clean and dust/smear free?" },
  { n: 10, section: "Bedroom", category: "Cleanliness", text: "Were all the picture/door/mirror frames clean and dust free?" },
  { n: 11, section: "Bedroom", category: "Cleanliness", text: "Were all the windows/mirrors/chrome/metal surfaces clean and free of smears?" },
  { n: 12, section: "Bedroom", category: "Cleanliness", text: "Were the curtains/voiles/shutters/blinds clean and properly fitted?" },
  { n: 13, section: "Bedroom", category: "Cleanliness", text: "Was the wastepaper bin clean and in excellent condition?" },
  { n: 14, section: "Bedroom", category: "Cleanliness", text: "Was a notepad, pen/pencil available next to each telephone in the room?" },
  { n: 15, section: "Bedroom", category: "Cleanliness", text: "Was all in-room collateral clean and in excellent condition?" },
  { n: 16, section: "Bedroom", category: "Cleanliness", text: "Were the wardrobes/drawers clean and free of any scuffs, dust or debris?" },
  { n: 17, section: "Bedroom", category: "Cleanliness", text: "Was the television clean and correctly tuned in?" },
  { n: 18, section: "Bedroom", category: "Cleanliness", text: "If there were clocks in the room did they all display the correct time and were they synchronized within 2 minutes of each other and were all alarm clocks reset to no alarm?" },
  { n: 19, section: "Bedroom", category: "Cleanliness", text: "Were all light fixtures in the bathroom and bedroom working properly and were they clean and dust free?" },
  { n: 20, section: "Bedroom", category: "Cleanliness", text: "Was the balcony clean, swept and all balcony furniture clean and set up (weather permitting)?" },
  { n: 21, section: "Bedroom", category: "Cleanliness", text: "Were any pre-arrival requests/personal preferences in place on arrival (e.g. non allergic pillows, baby cot, etc.)?" },
  { n: 22, section: "Bedroom", category: "Sustainability", text: "Was all water provided in the room, in glass bottles or alternative eco-friendly containers only (i.e. no plastic bottles)?" },
  { n: 23, section: "Bedroom", category: "Sustainability", text: "Was local mineral water or hotel filtered bottled water promoted?" },
  { n: 24, section: "Bedroom", category: "Cleanliness", text: "Were all in-room amenities (tea/coffee making, in-room bar, etc.) clean and neatly arranged?" },
  // SECTION 2: BATHROOM (12 items)
  { n: 25, section: "Bathroom", category: "Cleanliness", text: "Was the bathroom completely mold free?" },
  { n: 26, section: "Bathroom", category: "Cleanliness", text: "Were the floor, walls, doors and ceiling clean?" },
  { n: 27, section: "Bathroom", category: "Cleanliness", text: "Were the shower, bath, sink and toilet clean?" },
  { n: 28, section: "Bathroom", category: "Cleanliness", text: "Were the showerhead and bath/sink taps polished and free of lime scale?" },
  { n: 29, section: "Bathroom", category: "Cleanliness", text: "Was the shower screen/door clean?" },
  { n: 30, section: "Bathroom", category: "Cleanliness", text: "Were all counters, shelves and soap dishes clean and dry?" },
  { n: 31, section: "Bathroom", category: "Cleanliness", text: "Was the wastepaper bin clean and in excellent condition?" },
  { n: 32, section: "Bathroom", category: "Service", text: "Was a complete set of unused amenities present on arrival and in the case of large format dispensers, were contents sufficient for the stay?" },
  { n: 33, section: "Bathroom", category: "Cleanliness", text: "Was there a box of tissues, a well presented toilet roll and a spare toilet roll available?" },
  { n: 34, section: "Bathroom", category: "Cleanliness", text: "Were there 2 x clean drinking water glasses or similar present?" },
  { n: 35, section: "Bathroom", category: "Cleanliness", text: "Were all towels clean, unstained and in excellent repair?" },
  { n: 36, section: "Bathroom", category: "Cleanliness", text: "Were bathrobes and slippers present on arrival and were they clean and in excellent repair?" },
];

window.slaConfig = [
  { department: "Room Service", taskType: "Food Delivery", expected: "25 min", escalate: "35 min" },
  { department: "Housekeeping", taskType: "Room Cleaning", expected: "45 min", escalate: "60 min" },
  { department: "Housekeeping", taskType: "Turndown Service", expected: "15 min", escalate: "25 min" },
  { department: "Engineering", taskType: "AC Maintenance", expected: "60 min", escalate: "90 min" },
  { department: "Concierge", taskType: "Transport Booking", expected: "10 min", escalate: "20 min" },
  { department: "Front Desk", taskType: "Check-in", expected: "5 min", escalate: "10 min" },
  { department: "Engineering", taskType: "Plumbing Issue", expected: "45 min", escalate: "60 min" },
];

window.knowledgeDocs = [
  { name: "Hotel Facilities Guide.pdf", status: "Published", date: "May 20" },
  { name: "Restaurant Menus 2025.pdf", status: "Published", date: "May 18" },
  { name: "Spa Services Brochure.pdf", status: "Published", date: "May 15" },
  { name: "Local Attractions Guide.pdf", status: "Pending Review", date: "May 24" },
];

window.analyticsData = {
  totals: { guests: 312, messages: 1847, tasksCompleted: 892, satisfaction: 4.8 },
  commVolume: [
    { day: "Mon", ai: 220, human: 40 },
    { day: "Tue", ai: 245, human: 38 },
    { day: "Wed", ai: 260, human: 35 },
    { day: "Thu", ai: 280, human: 42 },
    { day: "Fri", ai: 310, human: 50 },
    { day: "Sat", ai: 295, human: 45 },
    { day: "Sun", ai: 230, human: 36 },
  ],
  deptCompletion: [
    { dept: "Front Desk", rate: 96 },
    { dept: "Housekeeping", rate: 89 },
    { dept: "Concierge", rate: 93 },
    { dept: "Engineering", rate: 81 },
    { dept: "Food and Beverage", rate: 91 },
  ],
  satisfactionTrend: [
    { day: "Mon", score: 4.6 }, { day: "Tue", score: 4.65 }, { day: "Wed", score: 4.7 },
    { day: "Thu", score: 4.75 }, { day: "Fri", score: 4.8 }, { day: "Sat", score: 4.85 }, { day: "Sun", score: 4.8 },
  ],
  topRequests: [
    { name: "Room Service", value: 28 },
    { name: "Housekeeping", value: 22 },
    { name: "Transport", value: 18 },
    { name: "Information", value: 17 },
    { name: "Maintenance", value: 15 },
  ],
  nationality: [
    { name: "British", value: 28, flag: "🇬🇧" },
    { name: "American", value: 24, flag: "🇺🇸" },
    { name: "French", value: 18, flag: "🇫🇷" },
    { name: "UAE", value: 16, flag: "🇦🇪" },
    { name: "Other", value: 14, flag: "🌍" },
  ],
  purpose: [
    { name: "Leisure", value: 45 }, { name: "Business", value: 32 }, { name: "Anniversary/Special", value: 15 }, { name: "Other", value: 8 },
  ],
  length: [
    { name: "1-2 nights", value: 22 }, { name: "3-4 nights", value: 35 }, { name: "5-7 nights", value: 28 }, { name: "8+ nights", value: 15 },
  ],
  healthHistory: Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    score: Math.round(74 + (8 * i) / 29 + Math.sin(i / 3) * 2),
  })),
};
