export type Tag = "Returning Guest" | "Loyalty";
export type Eng = "Not Contacted" | "Awaiting Response" | "Engaged" | "Responded";
export type Ready = "Ready" | "Awaiting Guest" | "Action Required" | "Not Contacted";
export type Day = "today" | "tomorrow" | "week";
export type ReqStatus = "Confirmed" | "Awaiting Hotel Confirmation" | "Captured" | "None";

export type Request = { name: string; status: ReqStatus };
export type Msg = { from: "guest" | "alfon"; text: string };

export type PreGuest = {
  id: number;
  name: string;
  tint: string;
  tags: Tag[];
  room: string | null;
  type: string;
  nights: number;
  day: Day;
  date: string; // display date for "week"
  time: string;
  eng: Eng;
  ready: Ready;
  last: string;
  prefs: string[];
  reqs: Request[];
  chips: string[];
  wa: boolean;
  consent: boolean;
  consentSrc: string;
  adults: number;
  children: number;
  lang: string;
  missing?: string;
  brief: string;
  recommend: string;
  convo: Msg[];
};

const TINTS = [
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
];

type Opts = {
  tags?: Tag[];
  prefs?: string[];
  reqs?: [string, ReqStatus][];
  chips?: string[];
  wa?: boolean;
  consent?: boolean;
  missing?: string;
  brief?: string;
  recommend?: string;
  convo?: Msg[];
  date?: string;
  adults?: number;
  children?: number;
  lang?: string;
};

export function mk(
  id: number,
  name: string,
  room: string | null,
  type: string,
  nights: number,
  day: Day,
  time: string,
  eng: Eng,
  ready: Ready,
  last: string,
  o: Opts = {},
): PreGuest {
  const first = name.split(" ")[0];
  const prefs = o.prefs ?? [];
  const reqs = (o.reqs ?? []).map(([n, s]) => ({ name: n, status: s }));
  const wa = o.wa ?? true;
  const consent = o.consent ?? true;

  const convo: Msg[] =
    o.convo ??
    (eng === "Not Contacted"
      ? []
      : eng === "Awaiting Response"
        ? [{ from: "alfon", text: `Hello ${first}, we are looking forward to welcoming you. Is there anything we can prepare before you arrive?` }]
        : [
            { from: "alfon", text: `Hello ${first}, we are looking forward to welcoming you. Is there anything we can prepare before you arrive?` },
            { from: "guest", text: prefs.length ? `Yes please — ${prefs.slice(0, 2).join(" and ").toLowerCase()} would be great.` : "Everything looks good, thank you!" },
          ]);

  const pendingReqs = reqs.filter((r) => r.status === "Awaiting Hotel Confirmation");
  const brief =
    o.brief ??
    (ready === "Not Contacted"
      ? `${first} has not been contacted yet.${!consent ? " Messaging consent is missing on the reservation, so hotel-initiated messages cannot be sent." : ""}${!wa ? " WhatsApp is not available for this guest." : ""}`
      : ready === "Awaiting Guest"
        ? `${first} has received the pre-arrival message and has not replied yet. No hotel action is needed until the guest responds.`
        : ready === "Ready"
          ? `${first} has completed pre-arrival${prefs.length ? ` and shared preferences: ${prefs.join(", ").toLowerCase()}` : ""}. No outstanding actions.`
          : `${first} has ${pendingReqs.length ? `requested ${pendingReqs.map((r) => r.name.toLowerCase()).join(" and ")}` : "shared preferences"} for this stay${prefs.length ? ` and prefers ${prefs.join(", ").toLowerCase()}` : ""}. Hotel confirmation is needed before arrival.`);

  const recommend =
    o.recommend ??
    (ready === "Action Required"
      ? `Confirm ${pendingReqs.map((r) => r.name.toLowerCase()).join(" and ") || "the open request"} with the relevant department before arrival.`
      : ready === "Awaiting Guest"
        ? "Review the drafted reminder and send it if the guest has not replied by this evening."
        : ready === "Not Contacted"
          ? !consent
            ? "Request messaging consent through the booking channel. Do not send a WhatsApp message until consent is confirmed."
            : !wa
              ? "Contact the guest by email or phone — WhatsApp is not available."
              : "Review and send the first pre-arrival message."
          : "No action needed. Welcome the guest on arrival.");

  return {
    id,
    name,
    tint: TINTS[id % TINTS.length],
    tags: o.tags ?? [],
    room,
    type,
    nights,
    day,
    date: o.date ?? "",
    time,
    eng,
    ready,
    last,
    prefs,
    reqs,
    chips: o.chips ?? [...reqs.map((r) => r.name), ...prefs],
    wa,
    consent,
    consentSrc: ["Booking Form", "Pre-Check-in Form", "Reservation Email"][id % 3],
    adults: o.adults ?? 2,
    children: o.children ?? 0,
    lang: o.lang ?? "English",
    missing: o.missing,
    brief,
    recommend,
    convo,
  };
}

const A = "Awaiting Hotel Confirmation" as const;

export const PRE_GUESTS: PreGuest[] = [
  // ---- Today (18) ----
  mk(1, "Emma Davis", "1608", "Deluxe King", 7, "today", "3:00 PM", "Responded", "Action Required", "12 min ago", {
    tags: ["Returning Guest"],
    prefs: ["Vegetarian", "Quiet Room", "High Floor", "Extra Pillow", "Late Housekeeping"],
    reqs: [["Airport Transfer", "Confirmed"], ["Early Check-In", A], ["Vegetarian Breakfast", "Captured"]],
    chips: ["Vegetarian", "Airport Pickup", "Early Check-In", "Quiet Room", "High Floor"],
    missing: "Flight / arrival details not provided.",
    brief:
      "Returning guest who prefers quiet, high-floor rooms and vegetarian breakfast. Guest has requested airport transportation and early check-in for this stay. Previous stays show a preference for extra pillows.",
    recommend: "Confirm early check-in before 1:00 PM and share the airport transfer details with the guest.",
    convo: [
      { from: "guest", text: "Would it be possible to arrange an airport pickup?" },
      { from: "alfon", text: "Absolutely. May I know your flight number and arrival time?" },
      { from: "guest", text: "EK202, arriving at 1:40 PM." },
    ],
  }),
  mk(2, "Liam Anderson", "1102", "Suite", 4, "today", "4:00 PM", "Responded", "Ready", "28 min ago", {
    prefs: ["Quiet Room", "High Floor"],
  }),
  mk(3, "Rohan Sharma", "1205", "Deluxe King", 4, "today", "2:00 PM", "Engaged", "Action Required", "20 min ago", {
    tags: ["Loyalty"],
    prefs: ["Extra Towels", "Late Turndown"],
    reqs: [["Early Check-In", A]],
    missing: "Preferred check-in time not confirmed.",
  }),
  mk(4, "Ananya Kapoor", "908", "Executive King", 4, "today", "1:30 PM", "Responded", "Action Required", "35 min ago", {
    tags: ["Returning Guest"],
    prefs: ["Vegetarian", "Jain Meals"],
    reqs: [["Dietary Requirement", A]],
    lang: "English, Hindi",
  }),
  mk(5, "Michael Johnson", "1103", "Suite", 6, "today", "5:00 PM", "Engaged", "Action Required", "1 hr ago", {
    tags: ["Returning Guest"],
    prefs: ["Early Breakfast", "Quiet Room", "Extra Pillow"],
    reqs: [["Returning Guest Preference", A]],
    brief:
      "Returning guest whose previous stays show a preference for early breakfast and a quiet room. ALFON detected these from past conversations — hotel confirmation is needed before applying them to this stay.",
    recommend: "Confirm the saved preferences with the Front Desk lead before arrival.",
  }),
  mk(6, "Sarah Chen", "704", "Deluxe King", 2, "today", "6:00 PM", "Responded", "Action Required", "42 min ago", {
    prefs: ["High Floor"],
    reqs: [["Airport Transfer", A]],
    missing: "Flight / arrival details not provided.",
    lang: "English, Mandarin",
  }),
  mk(7, "David Williams", "1008", "Executive Twin", 5, "today", "3:30 PM", "Not Contacted", "Not Contacted", "—", { wa: false }),
  mk(8, "Pooja Patel", "602", "Superior King", 2, "today", "4:30 PM", "Not Contacted", "Not Contacted", "—", { consent: false, lang: "English, Hindi" }),
  mk(9, "Robert Brown", "905", "Superior Twin", 4, "today", "5:30 PM", "Not Contacted", "Not Contacted", "—", { consent: false }),
  mk(10, "Olivia Brown", "1203", "Deluxe Room", 3, "today", "2:30 PM", "Responded", "Ready", "1 hr ago", { prefs: ["Late Check-Out", "Extra Blanket"] }),
  mk(11, "Noah Martinez", "1802", "Junior Suite", 3, "today", "6:30 PM", "Engaged", "Ready", "2 hrs ago", { prefs: ["Firm Pillow"] }),
  mk(12, "Isabella Rossi", "2104", "Deluxe King", 2, "today", "1:00 PM", "Awaiting Response", "Awaiting Guest", "3 hrs ago", { lang: "English, Italian" }),
  mk(13, "Mia Chen", "1502", "Deluxe Room", 3, "today", "3:15 PM", "Awaiting Response", "Awaiting Guest", "3 hrs ago"),
  mk(14, "Ethan Ross", "2010", "Executive King", 5, "today", "4:15 PM", "Awaiting Response", "Awaiting Guest", "4 hrs ago", { tags: ["Loyalty"] }),
  mk(15, "Grace Kim", "1209", "Superior Twin", 2, "today", "5:15 PM", "Awaiting Response", "Awaiting Guest", "4 hrs ago"),
  mk(16, "Daniel Kim", "1305", "Deluxe King", 3, "today", "7:00 PM", "Awaiting Response", "Awaiting Guest", "5 hrs ago"),
  mk(17, "Sophia Lee", "1904", "Junior Suite", 4, "today", "2:45 PM", "Awaiting Response", "Awaiting Guest", "5 hrs ago", { tags: ["Returning Guest"] }),
  mk(18, "Ava Thompson", "2501", "Suite", 6, "today", "6:15 PM", "Awaiting Response", "Awaiting Guest", "6 hrs ago", { tags: [] }),

  // ---- Tomorrow (6) ----
  mk(19, "Aisha Rahman", "1401", "Deluxe King", 3, "tomorrow", "11:00 AM", "Responded", "Action Required", "1 hr ago", { prefs: ["Halal Meals", "Quiet Room"], reqs: [["Dietary Requirement", A]], lang: "English, Arabic" }),
  mk(20, "Tom Baker", "1502", "Superior Twin", 2, "tomorrow", "2:00 PM", "Responded", "Ready", "3 hrs ago", { prefs: ["High Floor"] }),
  mk(21, "Lucia Fernandez", "1706", "Suite", 5, "tomorrow", "4:00 PM", "Awaiting Response", "Awaiting Guest", "5 hrs ago", { tags: [], lang: "English, Spanish" }),
  mk(22, "Kenji Sato", "1210", "Deluxe Room", 4, "tomorrow", "3:00 PM", "Not Contacted", "Not Contacted", "—", { consent: false, lang: "English, Japanese" }),
  mk(23, "Priya Menon", "1904", "Executive King", 3, "tomorrow", "5:00 PM", "Engaged", "Ready", "2 hrs ago", { prefs: ["Vegetarian"] }),
  mk(24, "Oscar Nilsson", "2003", "Junior Suite", 2, "tomorrow", "6:00 PM", "Awaiting Response", "Awaiting Guest", "6 hrs ago"),

  // ---- Upcoming 7 days (8) ----
  mk(25, "Hannah Weber", null, "Deluxe King", 4, "week", "2:00 PM", "Awaiting Response", "Awaiting Guest", "1 day ago", { date: "May 26" }),
  mk(26, "Marco Bianchi", null, "Suite", 3, "week", "3:00 PM", "Responded", "Action Required", "1 day ago", { date: "May 26", prefs: ["Late Arrival"], reqs: [["Airport Transfer", A]], lang: "English, Italian" }),
  mk(27, "Zoe Turner", null, "Superior Twin", 2, "week", "1:00 PM", "Not Contacted", "Not Contacted", "—", { date: "May 27" }),
  mk(28, "Carlos Ruiz", null, "Executive King", 5, "week", "4:00 PM", "Engaged", "Ready", "2 days ago", { date: "May 28", prefs: ["High Floor"], lang: "English, Spanish" }),
  mk(29, "Nina Petrova", null, "Deluxe Room", 3, "week", "5:00 PM", "Awaiting Response", "Awaiting Guest", "2 days ago", { date: "May 28", tags: ["Loyalty"] }),
  mk(30, "Yusuf Demir", null, "Junior Suite", 4, "week", "2:30 PM", "Not Contacted", "Not Contacted", "—", { date: "May 29", wa: false }),
  mk(31, "Grace Lee", null, "Suite", 6, "week", "3:30 PM", "Responded", "Ready", "3 days ago", { date: "May 30", tags: ["Returning Guest"], prefs: ["Quiet Room", "Extra Pillow"] }),
  mk(32, "Peter Novak", null, "Deluxe King", 2, "week", "6:00 PM", "Awaiting Response", "Awaiting Guest", "3 days ago", { date: "May 30" }),
];
