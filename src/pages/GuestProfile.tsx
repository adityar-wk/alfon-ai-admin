import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Search, Plus, User, Lightbulb, Bell, BedDouble, UtensilsCrossed, Target, MessageCircle, AlarmClock, Thermometer, Wine, Newspaper, Calendar, Hourglass, History, SlidersHorizontal, Check } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card, Modal, Button, Field, Input, Select } from "../components/ui";
import { Flag } from "../components/Flag";
import { GUESTS, type Guest } from "../data/guests";
import { type ChatMsg } from "../components/GuestChat";

type Prefs = {
  room: string[];
  dietary: string[];
  purpose: string[];
  language: string[];
  wake: string[];
  temp: string[];
  minibar: string[];
  newspaper: string[];
};

type ActionItem = { text: string; dept: string; who: string; status: "Completed" | "Pending" };
type Note = { author: string; time: string; text: string };

type Profile = {
  summary: string;
  anticipated: string;
  prefs: Prefs;
  actions: ActionItem[];
  notes: Note[];
  history: string[];
  previousStays: number;
};

const EMMA: Profile = {
  summary:
    "Emma is on her third stay at the property, travelling for a combination of business and anniversary. She prefers discreet, proactive service with minimal interruption. A private transfer is confirmed for tomorrow morning at 7:00 AM.",
  anticipated:
    "Offer an unpacking service on arrival. As the guest is staying for 7 nights, she is likely to have more luggage and may appreciate the gesture.",
  prefs: {
    room: ["High floor", "Firm pillow", "Extra blanket", "Blackout curtains"],
    dietary: ["No shellfish", "No nuts. Breakfast preference: fresh fruit and pastries."],
    purpose: ["Business", "Anniversary. Service style: proactive and anticipatory."],
    language: ["English"],
    wake: ["7:00 AM"],
    temp: ["Cool room (20°C)"],
    minibar: ["Sparkling water", "Dark chocolate"],
    newspaper: ["Financial Times"],
  },
  actions: [
    {
      text: "Third visit — check stay history and avoid repeating the same welcome amenity. Offer something new.",
      dept: "Room Service",
      who: "RS",
      status: "Completed",
    },
    {
      text: "Guest mentioned Mike from Front Desk was very helpful during her last stay. Inform Mike to be present for her arrival and meet and greet.",
      dept: "Front Desk",
      who: "MJ",
      status: "Completed",
    },
  ],
  notes: [
    {
      author: "John S. (Concierge)",
      time: "May 24 10:15 AM",
      text: "Guest requested private transfer for tomorrow 7AM. Booked and confirmed.",
    },
  ],
  history: ["Oct 2024 · Room 1402 · 4 nights", "Mar 2024 · Room 1608 · 6 nights", "Sep 2023 · Room 1201 · 3 nights"],
  previousStays: 3,
};


const RICH: Record<number, Profile> = {
  1: {
    summary:
      "Rohan is a loyalty member on his fifth stay, travelling for business with an extended leisure weekend. He values speed and personal recognition, and prefers to be greeted by name. Late evening turndown has been part of every previous stay.",
    anticipated:
      "Have the room ready before the 2:00 PM arrival and offer a fresh towel set on arrival. As a repeat guest he is likely to request a late check-out on his final morning.",
    prefs: {
      room: ["High floor", "Extra towels", "Late turndown", "Firm pillow"],
      dietary: ["Vegetarian", "No onion or garlic. Breakfast preference: masala omelette alternative and fresh juice."],
      purpose: ["Business", "Loyalty stay. Service style: quick, discreet and personalised."],
      language: ["English", "Hindi"],
      wake: ["6:30 AM"],
      temp: ["Cool room (21°C)"],
      minibar: ["Sparkling water", "Roasted almonds"],
      newspaper: ["Economic Times"],
    },
    actions: [
      { text: "Confirm early check-in before the 2:00 PM arrival and let the Front Desk lead know.", dept: "Front Desk", who: "SK", status: "Completed" },
      { text: "Restock extra towels and schedule late evening turndown for the duration of the stay.", dept: "Housekeeping", who: "MS", status: "Pending" },
    ],
    notes: [{ author: "Sarah K. (Front Desk)", time: "May 23 04:20 PM", text: "Guest asked for an early check-in and extra towels. Front Desk is checking availability." }],
    history: ["Feb 2025 · Room 1201 · 3 nights", "Nov 2024 · Room 905 · 5 nights", "Jun 2024 · Room 1205 · 4 nights"],
    previousStays: 4,
  },
  3: {
    summary:
      "Ananya is on her second stay, travelling for leisure with her family. She prefers a calm, unhurried service style and appreciates clear explanations of dining options. Vegetarian meals were requested during her last visit.",
    anticipated:
      "Confirm vegetarian and Jain meal options with the kitchen before her arrival. She is likely to appreciate a family-friendly local activity suggestion on day one.",
    prefs: {
      room: ["Quiet room", "Extra pillows", "Blackout curtains", "Twin sofa bed"],
      dietary: ["Vegetarian", "Jain meals. Breakfast preference: poha, fresh fruit and masala chai."],
      purpose: ["Leisure", "Family holiday. Service style: warm and attentive."],
      language: ["English", "Hindi"],
      wake: ["8:00 AM"],
      temp: ["Warm room (24°C)"],
      minibar: ["Fresh juice", "Dry fruits"],
      newspaper: ["None"],
    },
    actions: [
      { text: "Confirm Jain and vegetarian meal options for breakfast and room service.", dept: "Food & Beverage", who: "TH", status: "Completed" },
      { text: "Arrange a welcome amenity suitable for children on arrival.", dept: "Guest Services", who: "PN", status: "Pending" },
    ],
    notes: [{ author: "Priya N. (Guest Services)", time: "May 22 11:05 AM", text: "Guest confirmed dietary requirements over WhatsApp. Kitchen has been informed." }],
    history: ["Dec 2024 · Room 812 · 5 nights", "Aug 2023 · Room 905 · 3 nights"],
    previousStays: 2,
  },
  4: {
    summary:
      "Michael is a returning guest travelling for business. He keeps a tight schedule and prefers early, efficient service with minimal interruption. Previous stays show a strong preference for early breakfast and a quiet room away from the elevator.",
    anticipated:
      "He has a 9 AM meeting tomorrow — offer early breakfast delivery and confirm a wake-up call. A printer and stationery set in the room may be appreciated.",
    prefs: {
      room: ["Quiet room", "Away from elevator", "Extra pillow", "Work desk"],
      dietary: ["No dietary restrictions", "Breakfast preference: eggs benedict and black coffee, delivered before 7:30 AM."],
      purpose: ["Business", "Client meetings. Service style: efficient and proactive."],
      language: ["English"],
      wake: ["6:15 AM"],
      temp: ["Cool room (20°C)"],
      minibar: ["Still water", "Espresso pods"],
      newspaper: ["Wall Street Journal"],
    },
    actions: [
      { text: "Schedule early breakfast delivery for tomorrow before his 9 AM meeting.", dept: "Room Service", who: "AP", status: "Pending" },
      { text: "Confirm saved preferences with the Front Desk lead before arrival.", dept: "Front Desk", who: "SK", status: "Completed" },
    ],
    notes: [{ author: "John S. (Concierge)", time: "May 23 09:40 AM", text: "Guest mentioned a 9 AM meeting tomorrow. Suggested early breakfast; awaiting his confirmation." }],
    history: ["Mar 2025 · Room 1103 · 4 nights", "Oct 2024 · Room 1103 · 6 nights", "Apr 2024 · Room 1002 · 3 nights"],
    previousStays: 3,
  },
  5: {
    summary:
      "Sarah is a first-time leisure guest from Singapore, staying for a short city break. She books through the mobile app and prefers quick answers over WhatsApp. No special occasions were mentioned.",
    anticipated:
      "As a first-time guest she may want orientation to the property and nearby dining. Offer a concise welcome message with Wi-Fi details and breakfast hours.",
    prefs: {
      room: ["High floor", "City view", "Firm pillow"],
      dietary: ["Gluten-free", "No dairy. Breakfast preference: fresh fruit, eggs and gluten-free toast."],
      purpose: ["Leisure", "Short city break. Service style: friendly and low-key."],
      language: ["English", "Mandarin"],
      wake: ["No wake-up call"],
      temp: ["Cool room (22°C)"],
      minibar: ["Sparkling water", "Green tea"],
      newspaper: ["None"],
    },
    actions: [
      { text: "Share gluten-free menu options with the guest before check-in.", dept: "Food & Beverage", who: "TH", status: "Completed" },
      { text: "Send a welcome message with Wi-Fi details, breakfast hours and local recommendations.", dept: "Guest Services", who: "PN", status: "Completed" },
    ],
    notes: [{ author: "Sarah K. (Front Desk)", time: "May 23 04:20 PM", text: "Confirmed deluxe king for 2 nights. Guest requested a high floor and gluten-free breakfast." }],
    history: ["First stay"],
    previousStays: 0,
  },
  6: {
    summary:
      "David is a business traveller on his second stay, attending a multi-day conference nearby. He prefers a functional room with a good desk and reliable connectivity, and rarely uses hotel dining.",
    anticipated:
      "Offer a late check-out on the final day and confirm the express laundry option. A quiet workspace or meeting room booking may be useful.",
    prefs: {
      room: ["Work desk", "Twin beds", "Quiet room", "Extra hangers"],
      dietary: ["No shellfish", "Breakfast preference: continental with strong coffee."],
      purpose: ["Business", "Conference attendance. Service style: efficient and minimal."],
      language: ["English"],
      wake: ["6:45 AM"],
      temp: ["Cool room (21°C)"],
      minibar: ["Still water", "Energy drink"],
      newspaper: ["The Australian"],
    },
    actions: [
      { text: "Offer express laundry and confirm the guest's pressing requirements for the week.", dept: "Laundry", who: "CM", status: "Completed" },
      { text: "Check availability of a late check-out on the departure day.", dept: "Front Desk", who: "SK", status: "Pending" },
    ],
    notes: [{ author: "Maria S. (Housekeeping)", time: "May 22 03:15 PM", text: "Guest asked for twin beds pushed apart and an extra desk lamp." }],
    history: ["Nov 2024 · Room 1008 · 4 nights"],
    previousStays: 1,
  },
  7: {
    summary:
      "Pooja is arriving for a leisure stay and has not yet been contacted. Her booking includes breakfast, and no special requests are on file. Messaging consent is missing on the reservation.",
    anticipated:
      "Since no preferences are captured yet, capture them at check-in. Offer a room upgrade if available, as this is her first stay with the hotel.",
    prefs: {
      room: ["Not yet captured"],
      dietary: ["Not yet captured"],
      purpose: ["Leisure"],
      language: ["English", "Hindi"],
      wake: ["Not yet captured"],
      temp: ["Not yet captured"],
      minibar: ["Not yet captured"],
      newspaper: ["Not yet captured"],
    },
    actions: [
      { text: "Request messaging consent through the booking channel before any pre-arrival message is sent.", dept: "Front Desk", who: "SK", status: "Pending" },
      { text: "Capture room and dining preferences at check-in.", dept: "Guest Services", who: "PN", status: "Pending" },
    ],
    notes: [{ author: "Sarah K. (Front Desk)", time: "May 23 05:10 PM", text: "Reservation confirmed via OTA. No contact details beyond email on file." }],
    history: ["First stay"],
    previousStays: 0,
  },
  8: {
    summary:
      "Robert is arriving for a short business stay. He has not been contacted yet because messaging consent is missing on the reservation. Corporate rate booked through his employer's travel desk.",
    anticipated:
      "Prepare a quick check-in and confirm the invoice details with the company. Offer early breakfast and a quiet room for evening calls.",
    prefs: {
      room: ["Quiet room", "Work desk"],
      dietary: ["No dietary restrictions"],
      purpose: ["Business", "Corporate booking. Service style: efficient and discreet."],
      language: ["English"],
      wake: ["Not yet captured"],
      temp: ["Not yet captured"],
      minibar: ["Not yet captured"],
      newspaper: ["Not yet captured"],
    },
    actions: [
      { text: "Confirm corporate invoice details with the company's travel desk.", dept: "Front Desk", who: "SK", status: "Pending" },
      { text: "Request messaging consent through the booking channel before any pre-arrival message is sent.", dept: "Front Desk", who: "SK", status: "Pending" },
    ],
    notes: [{ author: "Sarah K. (Front Desk)", time: "May 23 05:30 PM", text: "Corporate rate applied. Invoice to be sent to the company after departure." }],
    history: ["Sep 2024 · Room 704 · 2 nights"],
    previousStays: 1,
  },
};

const LANG: Record<string, string> = {
  India: "English, Hindi",
  "United Kingdom": "English",
  "United States": "English",
  Singapore: "English, Mandarin",
  Australia: "English",
};

function pick<T>(list: T[], seed: number, n: number): T[] {
  return Array.from({ length: n }, (_, i) => list[(seed + i * 2) % list.length]);
}

export function buildProfile(g: Guest): Profile {
  if (g.id === 2) return EMMA;
  if (RICH[g.id]) return RICH[g.id];
  const first = g.name.split(" ")[0];
  const business = g.type === "Business";
  return {
    summary: `${first} is a ${g.type.toLowerCase()} guest from ${g.country}, staying ${g.nights} nights in Room ${g.room} (${g.roomType}). ${
      ""
    }Prefers clear, timely communication over WhatsApp.`,
    anticipated: business
      ? "Offer early breakfast delivery and a late check-out option. Check for meeting-room or printing needs."
      : "Suggest local experiences and dining reservations. Offer turndown service and a welcome amenity.",
    prefs: {
      room: pick(["High floor", "Quiet room", "Extra pillows", "Firm pillow", "Blackout curtains", "Near elevator"], g.id, 3),
      dietary: [g.id % 2 ? "No dietary restrictions" : "Vegetarian"],
      purpose: [g.type],
      language: [LANG[g.country] ?? "English"],
      wake: [g.id % 2 ? "6:30 AM" : "No wake-up call"],
      temp: [g.id % 2 ? "Cool room (21°C)" : "Warm room (24°C)"],
      minibar: pick(["Sparkling water", "Still water", "Dark chocolate", "Fresh juice"], g.id, 2),
      newspaper: [business ? "Financial Times" : "None"],
    },
    actions: [
      {
        text: `Welcome ${first} on arrival and confirm room preferences before check-in.`,
        dept: "Front Desk",
        who: "SK",
        status: g.status === "In House" ? "Completed" : "Pending",
      },
    ],
    notes: [
      {
        author: "Sarah K. (Front Desk)",
        time: "May 23 04:20 PM",
        text: `Confirmed ${g.roomType.toLowerCase()} for ${g.nights} nights. Guest requested a quiet floor.`,
      },
    ],
    history: g.id % 2
      ? ["Feb 2025 · Room 1201 · 3 nights", "Nov 2024 · Room 905 · 5 nights"]
      : ["Jan 2025 · Room 704 · 2 nights"],
    previousStays: g.id % 2 ? 2 : 1,
  };
}




const STATUS_LABEL: Record<Guest["status"], string> = { "In House": "In-House", Arriving: "Pre-Arrival", "Checked Out": "Checked Out" };
const STATUS_PILL: Record<Guest["status"], string> = {
  "In House": "text-emerald-600",
  Arriving: "text-blue-600",
  "Checked Out": "text-slate-500",
};
const LIST_FILTERS = ["All", "In House", "Arriving", "Checked Out"] as const;

function GuestList({ activeId }: { activeId: number }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof LIST_FILTERS)[number]>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const list = GUESTS.filter((g) => {
    const t = q.trim().toLowerCase();
    return (f === "All" || g.status === f) && (!t || [g.name, g.room, g.contact, g.country].some((v) => v.toLowerCase().includes(t)));
  });
  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-line bg-white">
      <div className="border-b border-line p-3">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search guests…"
              className="h-9 w-full rounded-control border border-line bg-subtle pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand focus:bg-white"
            />
          </div>
          <button
            onClick={() => setFilterOpen((o) => !o)}
            aria-label="Filter guests"
            aria-expanded={filterOpen}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${f !== "All" || filterOpen ? "bg-brand text-white" : "border border-line bg-white text-ink-secondary hover:bg-subtle"}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {f !== "All" && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">1</span>}
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-line bg-white p-1.5 shadow-lg">
              <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Stay status</div>
              {LIST_FILTERS.map((x) => (
                <button key={x} onClick={() => { setF(x); setFilterOpen(false); }} className="flex w-full items-center justify-between rounded-control px-2.5 py-2 text-left text-[13px] text-ink hover:bg-subtle">
                  {x === "All" ? "All" : STATUS_LABEL[x]}
                  {f === x && <Check className="h-4 w-4 text-brand" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {list.map((g) => {
          const on = g.id === activeId;
          return (
            <Link key={g.id} to={`/guests/${g.id}`} className={`flex items-center gap-3 border-b border-line/60 px-4 py-3 ${on ? "bg-brand-tint/50" : "hover:bg-subtle"}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-[12px] font-semibold ${g.tint}`}>{g.initials}</span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[14px] font-semibold text-ink">{g.name}</span>
                <span className="block truncate text-[12px] text-ink-tertiary">Room {g.room} · {STATUS_LABEL[g.status]}</span>
              </span>
              <Flag country={g.country} />
            </Link>
          );
        })}
        {!list.length && <p className="px-3 py-6 text-center text-[13px] text-ink-tertiary">No guests found.</p>}
      </div>
    </aside>
  );
}

export function seedChat(g: Guest): ChatMsg[] {
  if (g.status === "Arriving") return [];
  if (g.id === 2)
    return [
      { from: "guest", text: "Good evening! Is the cafe open for breakfast before our 7:00 AM transfer?", time: "10:08 PM" },
      { from: "ai", text: "Good evening, Ms. Davis. The cafe opens at 6:30 AM. I can arrange a table at 6:30, or prepare a to-go breakfast box if you prefer something lighter.", time: "10:11 PM" },
      { from: "guest", text: "The to-go box actually sounds perfect, thank you!", time: "10:12 PM" },
      { from: "ai", text: "Wonderful. How many boxes would you need, and is there anything specific you would like included?", time: "10:12 PM" },
      { from: "guest", text: "For 3 please. Orange juice, black coffee and donuts.", time: "10:13 PM" },
      { from: "ai", text: "Noted — three breakfast boxes will be ready for your 7:00 AM departure.", time: "10:13 PM" },
    ];
  const first = g.name.split(" ")[0];
  const business = g.type === "Business";
  return [
    { from: "ai", text: `Good afternoon ${first}, welcome! Is there anything we can prepare for your stay in Room ${g.room}?`, time: "10:02 AM" },
    { from: "guest", text: business ? "Could I get an early breakfast tomorrow around 7?" : "Could you recommend a good dinner spot nearby?", time: "10:05 AM" },
    {
      from: "ai",
      text: business
        ? "Of course. I've noted an early breakfast for 7:00 AM and will confirm it with Room Service."
        : "Certainly! Our rooftop restaurant is very popular. Would you like me to book a table?",
      time: "10:05 AM",
    },
  ];
}

const PREF_CARDS: { key: keyof Prefs; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "room", label: "Room preferences", icon: BedDouble },
  { key: "dietary", label: "Dietary requirements", icon: UtensilsCrossed },
  { key: "purpose", label: "Purpose of visit", icon: Target },
  { key: "language", label: "Communication language", icon: MessageCircle },
  { key: "wake", label: "Wake up call preference", icon: AlarmClock },
  { key: "temp", label: "Temperature preference", icon: Thermometer },
  { key: "minibar", label: "Minibar preference", icon: Wine },
  { key: "newspaper", label: "Newspaper preference", icon: Newspaper },
];

function Heading({ icon: Icon, tone, children }: { icon: React.ComponentType<{ className?: string }>; tone: string; children: React.ReactNode }) {
  return (
    <div className={`mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide ${tone}`}>
      <Icon className="h-3.5 w-3.5" /> {children}
    </div>
  );
}

export default function GuestProfile() {
  const { id } = useParams();
  const guest = GUESTS.find((g) => String(g.id) === id);
  const [extraNotes, setExtraNotes] = useState<Record<number, Note[]>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [, refresh] = useState(0);

  useEffect(() => {
    setNoteOpen(false);
    setDraft("");
  }, [id]);

  if (!guest) return <Navigate to={`/guests/${GUESTS[0].id}`} replace />;

  const p = buildProfile(guest);
  const notes = [...(extraNotes[guest.id] ?? []), ...p.notes];
  const actions = p.actions.map((a, i) => ({ ...a, key: `${guest.id}:${i}` }));

  const addNote = () => {
    if (!draft.trim()) return;
    setExtraNotes((n) => ({ ...n, [guest.id]: [{ author: "You", time: "Just now", text: draft.trim() }, ...(n[guest.id] ?? [])] }));
    setDraft("");
    setNoteOpen(false);
  };

  return (
    <>
      <Topbar title="Guests" />
      <div className="flex min-h-0 flex-1">
        <GuestList activeId={guest.id} />

        <div className="min-w-0 flex-1 overflow-y-auto bg-subtle/40 p-5">
          <div className="mx-auto max-w-[1400px] space-y-4">
            <Card className="overflow-hidden">
              <div className="flex items-start gap-4 p-6">
                <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-[20px] font-semibold ${guest.tint}`}>{guest.initials}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[22px] font-bold leading-tight text-ink">{guest.name}</h1>
                    <span className={`text-[13px] font-medium ${STATUS_PILL[guest.status]}`}>{STATUS_LABEL[guest.status]}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-secondary">
                    <Flag country={guest.country} /> {guest.country} <span>·</span> Room {guest.room} <span>·</span> {guest.roomType}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px] text-ink-secondary">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-ink-tertiary" /> Check-in <b className="text-ink">{guest.from}, 2025</b></span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-ink-tertiary" /> Check-out <b className="text-ink">{guest.to}, 2025</b></span>
                    <span className="flex items-center gap-1.5"><Hourglass className="h-3.5 w-3.5 text-ink-tertiary" /> Length of stay <b className="text-ink">{guest.nights} nights</b></span>
                    <span className="flex items-center gap-1.5"><History className="h-3.5 w-3.5 text-ink-tertiary" /> Previous stays <b className="text-ink">{p.previousStays}</b></span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => setEditOpen(true)} className="rounded-control border border-line px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-subtle">
                    Edit profile
                  </button>
                  <Link to={`/guest-chats?guest=${guest.id}`} className="rounded-lg border border-line px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-subtle">
                    Open chat
                  </Link>
                </div>
              </div>

            {/* everything at a glance in one card: profile + needs, preferences, history on the left; actions + notes on the right */}
            <div className="grid grid-cols-1 items-stretch border-t border-line xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_320px]">
              <div className="min-w-0 border-b border-line p-6 xl:border-r">
                <Heading icon={User} tone="text-ink-tertiary">Guest profile</Heading>
                <p className="text-[14px] leading-relaxed text-ink">{p.summary}</p>
              </div>
              <div className="min-w-0 border-b border-line p-6 xl:border-r">
                <Heading icon={Lightbulb} tone="text-ink-tertiary">Anticipated needs</Heading>
                <p className="text-[14px] leading-relaxed text-ink">{p.anticipated}</p>
              </div>

              <div className="min-w-0 border-b border-line p-6 xl:col-span-2 xl:col-start-1 xl:row-start-2 xl:border-r">
                <div className="mb-4 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary">Preferences</div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                  {PREF_CARDS.map(({ key, label, icon: Icon }) => (
                    <div key={key}>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary"><Icon className="h-3.5 w-3.5" /> {label}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {p.prefs[key].map((v) => <span key={v} className="rounded-full bg-subtle px-2.5 py-0.5 text-[13px] text-ink">{v}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0 p-6 xl:col-span-2 xl:col-start-1 xl:row-start-3 xl:border-r">
                <Heading icon={History} tone="text-ink-tertiary">Stay history</Heading>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  {p.history.map((h) => <div key={h} className="rounded-lg bg-subtle/70 px-3 py-2 text-[13px] text-ink">{h}</div>)}
                  {!p.history.length && <p className="text-[13px] text-ink-tertiary">No previous stays.</p>}
                </div>
              </div>

              <div className="min-w-0 divide-y divide-line xl:col-start-3 xl:row-span-3 xl:row-start-1">
                <div className="p-6">
                  <Heading icon={Bell} tone="text-red-700">Actions</Heading>
                  <div className="divide-y divide-line/70">
                    {actions.map((a, i) => {
                      const isDone = a.status === "Completed" || done[a.key];
                      return (
                        <div key={a.key} className="flex items-start gap-3 py-3">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-[11px] font-bold text-red-600">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] leading-snug text-ink">{a.text}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium text-ink-secondary">{a.dept}</span>
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-tint text-[9px] font-bold text-brand">{a.who}</span>
                              <button
                                onClick={() => !isDone && setDone((d) => ({ ...d, [a.key]: true }))}
                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isDone ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                              >
                                {isDone ? "Completed" : "Pending"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {!actions.length && <p className="py-3 text-[13px] text-ink-tertiary">No open actions for this guest.</p>}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-[11px] font-bold uppercase tracking-wide text-ink-tertiary">Notes</div>
                    <button onClick={() => setNoteOpen((o) => !o)} className="flex items-center gap-1 text-[12px] font-medium text-brand"><Plus className="h-3.5 w-3.5" /> Add note</button>
                  </div>
                  {noteOpen && (
                    <div className="mb-3">
                      <textarea
                        autoFocus
                        rows={2}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Add an internal note…"
                        className="w-full rounded-lg bg-subtle p-2.5 text-[13px] outline-none placeholder:text-ink-tertiary focus:ring-1 focus:ring-brand"
                      />
                      <button onClick={addNote} disabled={!draft.trim()} className="mt-2 rounded-control bg-brand px-[18px] py-2.5 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-brand-hover disabled:opacity-40">Add Note</button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {notes.map((n, i) => (
                      <div key={i} className="rounded-lg bg-subtle/70 p-3">
                        <p className="text-[11px] text-ink-tertiary">{n.author} · {n.time}</p>
                        <p className="mt-1 text-[13px] leading-snug text-ink">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </Card>
          </div>
        </div>
      </div>
      {editOpen && (
        <EditGuestModal
          guest={guest}
          onClose={() => setEditOpen(false)}
          onSave={(patch) => { Object.assign(guest, patch); setEditOpen(false); refresh((n) => n + 1); }}
        />
      )}
    </>
  );
}

function EditGuestModal({ guest, onClose, onSave }: { guest: Guest; onClose: () => void; onSave: (patch: Partial<Guest>) => void }) {
  const [f, setF] = useState({
    name: guest.name, contact: guest.contact, country: guest.country, type: guest.type,
    room: guest.room, roomType: guest.roomType, from: guest.from, to: guest.to, nights: String(guest.nights),
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const valid = f.name.trim() && f.room.trim();
  const save = () => {
    const name = f.name.trim();
    onSave({
      name,
      initials: name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
      contact: f.contact.trim(),
      country: f.country.trim(),
      type: f.type as Guest["type"],
      room: f.room.trim(),
      roomType: f.roomType.trim(),
      from: f.from.trim(),
      to: f.to.trim(),
      nights: Math.max(1, parseInt(f.nights, 10) || guest.nights),
    });
  };
  return (
    <Modal
      title="Edit guest profile"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={save} className="disabled:opacity-40">Save changes</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Field label="Full name" required><Input value={f.name} onChange={set("name")} /></Field></div>
        <Field label="Phone or email"><Input value={f.contact} onChange={set("contact")} /></Field>
        <Field label="Country">
          <Input list="guest-countries" value={f.country} onChange={set("country")} />
          <datalist id="guest-countries">{Array.from(new Set(GUESTS.map((g) => g.country))).map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
        <Field label="Guest type">
          <Select value={f.type} onChange={set("type")}><option>Leisure</option><option>Business</option></Select>
        </Field>
        <Field label="Room" required><Input value={f.room} onChange={set("room")} /></Field>
        <Field label="Room type"><Input value={f.roomType} onChange={set("roomType")} /></Field>
        <Field label="Nights"><Input inputMode="numeric" value={f.nights} onChange={set("nights")} /></Field>
        <Field label="Check-in"><Input value={f.from} onChange={set("from")} placeholder="May 14" /></Field>
        <Field label="Check-out"><Input value={f.to} onChange={set("to")} placeholder="May 18" /></Field>
      </div>
    </Modal>
  );
}
