import { useMemo, useState } from "react";
import { Bot, Bell, UserCog, Search, ListFilter } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Badge, Select } from "../../components/ui";
import { HOTELS } from "../../data/hotels";

type Category = "AI" | "Notification" | "Superadmin";

type LogEntry = {
  id: number;
  time: string;
  category: Category;
  actor: string;
  action: string;
  detail: string;
  hotel?: string;
};

const CATEGORY_META: Record<Category, { icon: React.ComponentType<{ className?: string }>; tone: "brand" | "info" | "neutral" }> = {
  AI: { icon: Bot, tone: "brand" },
  Notification: { icon: Bell, tone: "info" },
  Superadmin: { icon: UserCog, tone: "neutral" },
};

const LOGS: LogEntry[] = [
  { id: 1, time: "Today, 11:42 AM", category: "AI", actor: "Alfon AI", action: "Answer blocked — below confidence threshold", detail: "Guest asked about a refund; handed off to Front Desk.", hotel: "The Shoreline Hotel" },
  { id: 2, time: "Today, 11:20 AM", category: "Superadmin", actor: "Alex Rivera", action: "Updated global AI confidence threshold", detail: "Changed from 78% to 82%." },
  { id: 3, time: "Today, 10:45 AM", category: "Notification", actor: "System", action: "PMS sync completed", detail: "142 reservations updated.", hotel: "The Shoreline Hotel" },
  { id: 4, time: "Today, 10:12 AM", category: "AI", actor: "Alfon AI", action: "Escalated a guest chat to a person", detail: "Guest sounded distressed about a noise complaint.", hotel: "Bayview Hotel" },
  { id: 5, time: "Today, 9:50 AM", category: "Superadmin", actor: "Alex Rivera", action: "Created hotel", detail: "Added \"The Grand Vista\" to the network.", hotel: "The Grand Vista" },
  { id: 6, time: "Today, 9:30 AM", category: "Notification", actor: "System", action: "WhatsApp connection lost", detail: "Number disconnected — no messages sent since.", hotel: "Desert Pearl" },
  { id: 7, time: "Today, 9:10 AM", category: "AI", actor: "Alfon AI", action: "Answer sent to guest", detail: "Confidence 94% — pool hours question.", hotel: "City Suites" },
  { id: 8, time: "Today, 8:55 AM", category: "Superadmin", actor: "Alex Rivera", action: "Deactivated hotel", detail: "Marked \"Desert Pearl\" inactive after repeated connection issues.", hotel: "Desert Pearl" },
  { id: 9, time: "Today, 8:20 AM", category: "Notification", actor: "System", action: "Health score dropped below 70%", detail: "Engineering SLA breaches trending up.", hotel: "Palm Retreat" },
  { id: 10, time: "Today, 7:40 AM", category: "AI", actor: "Alfon AI", action: "Escalated a guest chat to a person", detail: "Guest asked to speak with a manager directly.", hotel: "Marina Heights" },
  { id: 11, time: "Yesterday, 6:15 PM", category: "Superadmin", actor: "Alex Rivera", action: "Reset WhatsApp API key", detail: "Rotated credentials after a support request.", hotel: "Sands Hotel" },
  { id: 12, time: "Yesterday, 5:02 PM", category: "Notification", actor: "System", action: "Onboarding link sent", detail: "Setup link emailed to hotel admin.", hotel: "Harborview Inn" },
  { id: 13, time: "Yesterday, 3:48 PM", category: "AI", actor: "Alfon AI", action: "Answer blocked — below confidence threshold", detail: "Ambiguous request about a rate change; handed off.", hotel: "Coral Bay Resort" },
  { id: 14, time: "Yesterday, 2:30 PM", category: "Superadmin", actor: "Alex Rivera", action: "Updated hotel details", detail: "Corrected time zone and currency.", hotel: "Alpine Lodge" },
  { id: 15, time: "Yesterday, 1:05 PM", category: "Notification", actor: "System", action: "New complaint flagged as high risk", detail: "Sentiment score below threshold.", hotel: "Bayview Hotel" },
  { id: 16, time: "Yesterday, 11:22 AM", category: "AI", actor: "Alfon AI", action: "Escalated a guest chat to a person", detail: "AI did not have enough information in the hotel's files.", hotel: "Lagoon Hotel" },
  { id: 17, time: "2 days ago, 4:10 PM", category: "Superadmin", actor: "Alex Rivera", action: "Signed in", detail: "New session from Dubai, UAE." },
  { id: 18, time: "2 days ago, 2:00 PM", category: "Notification", actor: "System", action: "PMS connection pending for 3 days", detail: "No sync since setup.", hotel: "City Suites" },
];

const CATS: (Category | "All")[] = ["All", "AI", "Notification", "Superadmin"];

export default function AuditLogs() {
  const [cat, setCat] = useState<Category | "All">("All");
  const [hotel, setHotel] = useState("all");
  const [query, setQuery] = useState("");

  const hotelNames = useMemo(() => Array.from(new Set(HOTELS.map((h) => h.name))).sort(), []);

  const rows = LOGS.filter(
    (l) =>
      (cat === "All" || l.category === cat) &&
      (hotel === "all" || l.hotel === hotel) &&
      (!query.trim() || `${l.actor} ${l.action} ${l.detail} ${l.hotel ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())),
  );

  const countOf = (c: Category) => LOGS.filter((l) => l.category === c).length;

  const KPIS: { label: string; icon: React.ComponentType<{ className?: string }>; tint: string; value: number }[] = [
    { label: "Total Events", icon: ListFilter, tint: "bg-subtle text-ink-secondary", value: LOGS.length },
    { label: "AI Actions", icon: Bot, tint: "bg-brand-tint text-brand", value: countOf("AI") },
    { label: "Notifications", icon: Bell, tint: "bg-sky-50 text-sky-600", value: countOf("Notification") },
    { label: "Superadmin Actions", icon: UserCog, tint: "bg-violet-50 text-violet-600", value: countOf("Superadmin") },
  ];

  return (
    <>
      <Topbar title="Audit Logs" hideQuickActions />
      <Page>
        <h2 className="font-display text-[26px] font-bold leading-tight text-ink">Audit Logs</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-secondary">
          Every AI decision, system notification and superadmin action across the network, in one place.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((k) => (
            <Card key={k.label} className="p-5">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.tint}`}><k.icon className="h-[18px] w-[18px]" /></span>
              <div className="mt-3 text-[22px] font-bold leading-tight text-ink">{k.value}</div>
              <div className="text-[12px] text-ink-secondary">{k.label}</div>
            </Card>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actor, action or detail…"
              className="h-10 w-full rounded-control border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>
          <div className="flex gap-2">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-3.5 py-2 text-[13px] font-medium ${cat === c ? "bg-brand text-white" : "bg-subtle text-ink-secondary hover:text-ink"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="ml-auto w-52">
            <Select value={hotel} onChange={(e) => setHotel(e.target.value)} aria-label="Hotel">
              <option value="all">All hotels</option>
              {hotelNames.map((h) => <option key={h}>{h}</option>)}
            </Select>
          </div>
        </div>

        <Card table className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] table-fixed text-left">
              <colgroup>
                <col className="w-[160px]" />
                <col className="w-[130px]" />
                <col className="w-[160px]" />
                <col />
                <col className="w-[170px]" />
              </colgroup>
              <thead>
                <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                  <th className="py-3.5 pl-6 font-medium">Time</th>
                  <th className="py-3.5 pl-6 font-medium">Category</th>
                  <th className="py-3.5 pl-6 font-medium">Actor</th>
                  <th className="py-3.5 pl-6 font-medium">Event</th>
                  <th className="py-3.5 pl-6 font-medium">Hotel</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const meta = CATEGORY_META[l.category];
                  return (
                    <tr key={l.id} className="border-b border-line/50 last:border-0">
                      <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-[13px] text-ink-secondary">{l.time}</td>
                      <td className="py-3.5 pl-6 pr-3"><Badge tone={meta.tone}><meta.icon className="h-3 w-3" /> {l.category}</Badge></td>
                      <td className="py-3.5 pl-6 pr-3 text-[13px] font-medium text-ink">{l.actor}</td>
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="text-[13px] font-medium text-ink">{l.action}</div>
                        <div className="text-[12px] text-ink-tertiary">{l.detail}</div>
                      </td>
                      <td className="py-3.5 pl-6 pr-3 text-[13px] text-ink-secondary">{l.hotel ?? "—"}</td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr><td colSpan={5} className="py-8 text-center text-[13px] text-ink-tertiary">No events match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Page>
    </>
  );
}
