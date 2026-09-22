import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  MoreVertical,
  Search,
  Check,
  Plus,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Card } from "../components/ui";
import { Flag } from "../components/Flag";
import { GUESTS, type Guest } from "../data/guests";
import { GuestChat, type ChatMsg, type ChatMode as Mode } from "../components/GuestChat";

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
      "Rohan is a VIP loyalty member on his fifth stay, travelling for business with an extended leisure weekend. He values speed and personal recognition, and prefers to be greeted by name. Late evening turndown has been part of every previous stay.",
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
      "Michael is a VIP returning guest travelling for business. He keeps a tight schedule and prefers early, efficient service with minimal interruption. Previous stays show a strong preference for early breakfast and a quiet room away from the elevator.",
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
      { text: "Confirm saved VIP preferences with the Front Desk lead before arrival.", dept: "Front Desk", who: "SK", status: "Completed" },
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

function buildProfile(g: Guest): Profile {
  if (g.id === 2) return EMMA;
  if (RICH[g.id]) return RICH[g.id];
  const first = g.name.split(" ")[0];
  const business = g.type === "Business";
  return {
    summary: `${first} is a ${g.type.toLowerCase()} guest from ${g.country}, staying ${g.nights} nights in Room ${g.room} (${g.roomType}). ${
      g.vip ? "VIP guest — prioritise service and personal touches. " : ""
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
    history: g.vip
      ? ["Feb 2025 · Room 1201 · 3 nights", "Nov 2024 · Room 905 · 5 nights"]
      : ["Jan 2025 · Room 704 · 2 nights"],
    previousStays: g.vip ? 2 : 1,
  };
}




function GuestList({ activeId }: { activeId: number }) {
  const [q, setQ] = useState("");
  const list = GUESTS.filter((g) => {
    const t = q.trim().toLowerCase();
    return !t || [g.name, g.room, g.contact, g.country].some((v) => v.toLowerCase().includes(t));
  });
  return (
    <aside className="flex w-[290px] shrink-0 flex-col border-r border-line bg-white">
      <div className="border-b border-line p-3">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[13px] font-semibold text-ink">Guests</span>
          <span className="text-[12px] text-ink-tertiary">{list.length} of {GUESTS.length}</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search guests…"
            className="h-9 w-full rounded-lg border border-line bg-subtle pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand focus:bg-white"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {list.map((g) => {
          const on = g.id === activeId;
          return (
            <Link
              key={g.id}
              to={`/guests/${g.id}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${on ? "bg-brand-tint" : "hover:bg-subtle"}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${g.tint}`}>
                {g.initials}
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="flex items-center gap-1.5">
                  <span className={`truncate text-[13px] font-semibold ${on ? "text-brand" : "text-ink"}`}>{g.name}</span>
                  {g.vip && <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700">VIP</span>}
                </span>
                <span className="block truncate text-[12px] text-ink-tertiary">
                  Room {g.room} · {g.status}
                </span>
              </span>
            </Link>
          );
        })}
        {!list.length && <p className="px-3 py-6 text-center text-[13px] text-ink-tertiary">No guests found.</p>}
      </div>
    </aside>
  );
}

function seedChat(g: Guest): ChatMsg[] {
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

const NOT_SET = (v: string) => v !== "Not yet captured" && v !== "None" && !v.toLowerCase().startsWith("no ");

const PREF_ROWS: { key: keyof Prefs; label: string }[] = [
  { key: "room", label: "Room" },
  { key: "dietary", label: "Dietary" },
  { key: "purpose", label: "Purpose" },
  { key: "language", label: "Language" },
  { key: "wake", label: "Wake-up" },
  { key: "temp", label: "Temperature" },
  { key: "minibar", label: "Minibar" },
  { key: "newspaper", label: "Newspaper" },
];

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function GuestProfile() {
  const { id } = useParams();
  const guest = GUESTS.find((g) => String(g.id) === id);
  const [chats, setChats] = useState<Record<number, ChatMsg[]>>({});
  const [modes, setModes] = useState<Record<number, Mode>>({});
  const [extraNotes, setExtraNotes] = useState<Record<number, Note[]>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setNoteOpen(false);
    setDraft("");
  }, [id]);

  if (!guest) return <Navigate to="/guests" replace />;

  const p = buildProfile(guest);
  const msgs = chats[guest.id] ?? seedChat(guest);
  const mode: Mode = modes[guest.id] ?? "auto";
  const notes = [...(extraNotes[guest.id] ?? []), ...p.notes];
  const actions = p.actions.map((a, i) => ({ ...a, key: `${guest.id}:${i}` }));
  const pending = actions.filter((a) => a.status === "Pending" && !done[a.key]);

  const send = (text: string) =>
    setChats((c) => ({ ...c, [guest.id]: [...(c[guest.id] ?? seedChat(guest)), { from: "staff", text, time: "Now" }] }));

  const addNote = () => {
    if (!draft.trim()) return;
    setExtraNotes((n) => ({ ...n, [guest.id]: [{ author: "Sophia Carter (GM)", time: "Just now", text: draft.trim() }, ...(n[guest.id] ?? [])] }));
    setDraft("");
    setNoteOpen(false);
  };

  const inHouse = guest.status === "In House";

  return (
    <>
      <Topbar title="" backTo="/guests" />
      <div className="flex min-h-0 flex-1">
        <GuestList activeId={guest.id} />

        {/* details in focus */}
        <div className="min-w-0 flex-1 overflow-y-auto bg-subtle/40 p-5">
          <div className="mx-auto max-w-[760px] space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-4">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold ${guest.tint}`}>
                {guest.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[20px] font-bold leading-tight text-ink">{guest.name}</h1>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${inHouse ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                    {inHouse ? "In-House" : "Arriving"}
                  </span>
                  {guest.vip && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">VIP</span>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-secondary">
                  <Flag country={guest.country} /> {guest.country}
                  <span>·</span> Room {guest.room} · {guest.roomType}
                  <span>·</span> {guest.type}
                </div>
              </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4 border-t border-line/70 pt-4 text-[13px]">
                <div><div className="text-[11px] text-ink-tertiary">Check-in</div><div className="font-medium text-ink">{guest.from}</div></div>
                <div><div className="text-[11px] text-ink-tertiary">Check-out</div><div className="font-medium text-ink">{guest.to}</div></div>
                <div><div className="text-[11px] text-ink-tertiary">Nights</div><div className="font-medium text-ink">{guest.nights}</div></div>
                <div><div className="text-[11px] text-ink-tertiary">Stays</div><div className="font-medium text-ink">{p.previousStays}</div></div>
              </div>
            </Card>

            <Card className="p-5">
              <Section title="About">
                <p className="text-[14px] leading-relaxed text-ink">{p.summary}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                  <span className="font-medium text-ink">Anticipate: </span>
                  {p.anticipated}
                </p>
              </Section>
            </Card>

            <Card className="p-5">
              <Section title="Preferences">
                <dl className="grid grid-cols-1 gap-x-8 2xl:grid-cols-2">
                  {PREF_ROWS.map((r) => (
                    <div key={r.key} className="grid grid-cols-[92px_1fr] gap-3 border-b border-line/70 py-2.5 text-[13px]">
                      <dt className="text-ink-tertiary">{r.label}</dt>
                      <dd className="text-ink">{p.prefs[r.key].join(" · ")}</dd>
                    </div>
                  ))}
                </dl>
              </Section>
            </Card>

            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              <Card className="p-5">
                <Section title="Stay history">
                  <div className="space-y-1.5">
                    {p.history.map((h) => (
                      <div key={h} className="rounded-lg bg-subtle px-3 py-2 text-[12px] text-ink">{h}</div>
                    ))}
                  </div>
                </Section>
              </Card>

              <Card className="p-5">
                <Section
                  title="Notes"
                  action={
                    <button onClick={() => setNoteOpen((o) => !o)} className="flex items-center gap-1 text-[12px] font-medium text-brand">
                      <Plus className="h-3.5 w-3.5" /> Add
                    </button>
                  }
                >
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
                      <button
                        onClick={addNote}
                        disabled={!draft.trim()}
                        className="mt-2 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40"
                      >
                        Save note
                      </button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {notes.map((n, i) => (
                      <div key={i} className="rounded-lg bg-subtle p-3">
                        <p className="text-[13px] leading-snug text-ink">{n.text}</p>
                        <p className="mt-1 text-[11px] text-ink-tertiary">{n.author} · {n.time}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              </Card>
            </div>
          </div>
        </div>

        {/* right rail — attention on top, chat docked bottom-right */}
        <aside className="flex w-[400px] shrink-0 flex-col gap-4 border-l border-line bg-white p-4">
          <Card className="max-h-[38%] shrink-0 overflow-y-auto p-4">
            <Section title="Needs attention">
              {pending.length ? (
                <div className="space-y-3">
                  {pending.map((a) => (
                    <div key={a.key} className="flex items-start gap-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-snug text-ink">{a.text}</p>
                        <span className="mt-1 inline-block rounded-full bg-subtle px-2 py-0.5 text-[11px] text-ink-secondary">{a.dept}</span>
                      </div>
                      <button
                        onClick={() => setDone((d) => ({ ...d, [a.key]: true }))}
                        className="mt-0.5 flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-[12px] font-semibold text-ink-secondary hover:bg-subtle"
                      >
                        <Check className="h-3.5 w-3.5" /> Done
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="flex items-center gap-2 text-[13px] text-emerald-600">
                  <Check className="h-4 w-4" /> All caught up
                </p>
              )}
            </Section>
          </Card>

          <Card className="flex min-h-[320px] flex-1 flex-col overflow-hidden shadow-md">
            <GuestChat
              className="h-full"
              name={guest.name}
              msgs={msgs}
              mode={mode}
              setMode={(m) => setModes((x) => ({ ...x, [guest.id]: m }))}
              onSend={send}
              emptyText="No messages yet. Guest hasn't been contacted."
            />
          </Card>
        </aside>
      </div>
    </>
  );
}
