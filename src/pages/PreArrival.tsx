import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  ChevronLeft,
  Upload,
  ChevronRight,
  MessageCircle,
  Plus,
  FileText,
  Pencil,
  ShieldCheck,
  ShieldAlert,
  Check,
  MoreHorizontal,
  X,
  CalendarDays,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { GuestChat, type ChatMsg, type ChatMode, type MessageTemplate } from "../components/GuestChat";

const PRE_ARRIVAL_TEMPLATES: MessageTemplate[] = [
  { label: "Welcome & preferences", text: "Hi {name}, we are delighted to welcome you soon! Could you share any preferences, such as room setup, dietary needs or a special occasion, so we can prepare your stay?" },
  { label: "Arrival time", text: "Hi {name}, your room is being prepared. Check-in starts at 3:00 PM. Could you let us know your estimated arrival time so we can have everything ready?" },
  { label: "Airport transfer", text: "Hi {name}, would you like us to arrange an airport transfer for your arrival? Just share your flight details and we will take care of the rest." },
  { label: "Early check-in", text: "Hi {name}, we will do our best to have your room ready early. We will message you as soon as it is available." },
  { label: "Messaging consent", text: "Hi {name}, may we message you here with updates about your stay? Reply YES to opt in." },
];
import { Drawer } from "../components/Drawer";
import { Page, Card, Button, Modal, Select } from "../components/ui";
import { PRE_GUESTS, mk, type PreGuest, type Ready, type ReqStatus } from "../data/preArrival";

/* ---------- small pieces ---------- */

const READY_STYLE: Record<Ready, string> = {
  Ready: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Awaiting Guest": "bg-slate-100 text-slate-600 ring-slate-200",
  "Action Required": "bg-amber-50 text-amber-700 ring-amber-200",
  "Not Contacted": "bg-gray-100 text-gray-600 ring-gray-200",
};

function ReadyBadge({ r }: { r: Ready }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${READY_STYLE[r]}`}>
      {r}
    </span>
  );
}

// what the engagement column reads as
const ENG_LABEL: Record<string, string> = {
  "Not Contacted": "Pending",
  "Awaiting Response": "Message sent",
  Engaged: "Responded",
  Responded: "Responded",
};

/** text colour only, no chip */
const ENG_PILL: Record<string, string> = {
  "Not Contacted": "text-slate-500",
  "Awaiting Response": "text-sky-600",
  Engaged: "text-emerald-600",
  Responded: "text-emerald-600",
};

function Avatar({ g, size = 36, soft = false }: { g: PreGuest; size?: number; soft?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${soft ? "bg-brand-tint text-brand" : g.tint}`}
      style={{ width: size, height: size, fontSize: size > 40 ? 16 : 12 }}
    >
      {g.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
    </span>
  );
}

function TagChips({ g }: { g: PreGuest }) {
  return (
    <>
      {g.tags.map((t) => (
        <span
          key={t}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600"
        >
          {t}
        </span>
      ))}
    </>
  );
}

function arrivalLabel(g: PreGuest) {
  return g.day === "today" ? "Today" : g.day === "tomorrow" ? "Tomorrow" : g.date;
}

function checkinDay(g: PreGuest) {
  return g.day === "today" ? 24 : g.day === "tomorrow" ? 25 : parseInt(g.date.split(" ")[1], 10);
}

function shortDay(day: number) {
  return new Date(2025, 4, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmt(day: number) {
  return new Date(2025, 4, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Tab = "all" | "nc" | "aw" | "eng" | "ar" | "ready";

const TABS: { key: Tab; label: string; test: (g: PreGuest) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "nc", label: "Not Contacted", test: (g) => g.eng === "Not Contacted" },
  { key: "aw", label: "Awaiting Response", test: (g) => g.eng === "Awaiting Response" },
  { key: "eng", label: "Engaged", test: (g) => g.eng === "Engaged" || g.eng === "Responded" },
  { key: "ar", label: "Action Required", test: (g) => g.ready === "Action Required" },
  { key: "ready", label: "Ready", test: (g) => g.ready !== "Action Required" },
];

type Filters = {
  loyalty: boolean;
  returning: boolean;
  wa: string;
  consent: string;
  room: string;
  lang: string;
  request: string;
  ready: string;
};
const NO_FILTERS: Filters = { loyalty: false, returning: false, wa: "all", consent: "all", room: "all", lang: "all", request: "all", ready: "all" };

const REQUEST_KEYS = ["Airport", "Early Check-In", "Dietary", "Vegetarian", "Accessibility"];

/* ---------- page ---------- */

export default function PreArrival() {
  const [guests, setGuests] = useState<PreGuest[]>(PRE_GUESTS);
  const [dateOn, setDateOn] = useState(false);
  const [selDay, setSelDay] = useState(24);
  const [weekStart, setWeekStart] = useState(24);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [chats, setChats] = useState<Record<number, ChatMsg[]>>({});
  const [modes, setModes] = useState<Record<number, ChatMode>>({});
  const navigate = useNavigate();
  const timer = useRef<number>();
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (m: string) => {
    setToast(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const today = useMemo(() => guests.filter((g) => g.day === "today"), [guests]);
  const dayGuests = useMemo(() => (dateOn ? guests.filter((g) => checkinDay(g) === selDay) : guests), [guests, selDay, dateOn]);
  const perDay = useMemo(() => {
    const m: Record<number, number> = {};
    guests.forEach((g) => { m[checkinDay(g)] = (m[checkinDay(g)] ?? 0) + 1; });
    return m;
  }, [guests]);
  const chatFor = (g: PreGuest): ChatMsg[] =>
    chats[g.id] ?? g.convo.map((m) => ({ from: m.from === "alfon" ? ("ai" as const) : ("guest" as const), text: m.text, time: "" }));
  const sendChat = (g: PreGuest, text: string) =>
    setChats((c) => ({ ...c, [g.id]: [...chatFor(g), { from: "staff", text, time: "Now" }] }));
  const createTask = (g: PreGuest) =>
    navigate(`/tasks?new=1&guest=${encodeURIComponent(g.name)}&room=${encodeURIComponent(g.room ?? "")}`);
  const goToday = (t: Tab) => { setDateOn(true); setSelDay(24); setWeekStart(24); setTab(t); };

  // guests nobody has messaged yet
  const unsent = guests.filter((g) => g.eng === "Not Contacted");
  const [confirmSend, setConfirmSend] = useState(false);

  const sendAll = () => {
    const ids = new Set(unsent.map((g) => g.id));
    setGuests((gs) => gs.map((g) => (ids.has(g.id) ? { ...g, eng: "Awaiting Response", ready: "Awaiting Guest", last: "Just now" } : g)));
    setConfirmSend(false);
    flash(`Pre-arrival message sent to ${unsent.length} guests`);
  };

  // arrival report: Name, Room Type, Nights (header row optional; only the first column is required)
  const importReport = async (file: File) => {
    const lines = (await file.text()).split(/\r?\n/).map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""))).filter((r) => r.some(Boolean));
    if (!lines.length) return flash("That file is empty");
    const head = lines[0].map((c) => c.toLowerCase());
    const hasHeader = head.some((c) => /name|guest|room|night/.test(c));
    const col = (re: RegExp, fallback: number) => { const i = head.findIndex((c) => re.test(c)); return hasHeader && i >= 0 ? i : fallback; };
    const iName = col(/name|guest/, 0), iType = col(/room|type/, 1), iNights = col(/night/, 2);
    const known = new Set(guests.map((g) => g.name.toLowerCase()));
    let id = Math.max(0, ...guests.map((g) => g.id));
    const fresh: PreGuest[] = [];
    for (const r of hasHeader ? lines.slice(1) : lines) {
      const name = r[iName];
      if (!name || known.has(name.toLowerCase())) continue;
      known.add(name.toLowerCase());
      fresh.push(mk(++id, name, null, r[iType] || "Deluxe King", Math.max(1, parseInt(r[iNights], 10) || 2), "today", "3:00 PM", "Not Contacted", "Not Contacted", "—"));
    }
    if (!fresh.length) return flash("No new guests found in that file");
    setGuests((gs) => [...gs, ...fresh]);
    flash(`${fresh.length} arrivals imported from ${file.name}`);
  };

  const kpiNC = today.filter((g) => g.eng === "Not Contacted").length;
  const kpiAW = today.filter((g) => g.eng === "Awaiting Response").length;
  const kpiAR = today.filter((g) => g.ready === "Action Required").length;
  const kpiReady = today.length - kpiAR;

  const roomTypes = useMemo(() => [...new Set(guests.map((g) => g.type))].sort(), [guests]);
  const langs = useMemo(() => [...new Set(guests.map((g) => g.lang))].sort(), [guests]);
  const activeFilterCount =
    Number(tab !== "all") + Number(filters.loyalty) + Number(filters.returning) + [filters.wa, filters.consent, filters.room, filters.lang, filters.request, filters.ready].filter((v) => v !== "all").length;

  const filterBadge = activeFilterCount + Number(dateOn);

  const hasRequest = (g: PreGuest, key: string) =>
    [...g.reqs.map((r) => r.name), ...g.prefs].some((v) => v.toLowerCase().includes(key.toLowerCase()));

  const afterFilters = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dayGuests.filter(
      (g) =>
        (!q || [g.name, g.room ?? "", g.type, `res-${100000 + g.id * 731}`].some((v) => v.toLowerCase().includes(q))) &&
        (!filters.loyalty || g.tags.includes("Loyalty")) &&
        (!filters.returning || g.tags.includes("Returning Guest")) &&
        (filters.wa === "all" || (filters.wa === "available") === g.wa) &&
        (filters.consent === "all" || (filters.consent === "confirmed") === g.consent) &&
        (filters.room === "all" || g.type === filters.room) &&
        (filters.lang === "all" || g.lang === filters.lang) &&
        (filters.request === "all" || hasRequest(g, filters.request)) &&
        (filters.ready === "all" || g.ready === filters.ready),
    );
  }, [dayGuests, query, filters]);

  const tabCount = (t: Tab) => afterFilters.filter(TABS.find((x) => x.key === t)!.test).length;
  const rows = afterFilters.filter(TABS.find((x) => x.key === tab)!.test);
  const selected = guests.find((g) => g.id === selectedId) ?? null;

  const confirmRequests = (id: number) =>
    setGuests((gs) =>
      gs.map((g) =>
        g.id === id
          ? { ...g, reqs: g.reqs.map((r) => (r.status === "Awaiting Hotel Confirmation" ? { ...r, status: "Confirmed" as ReqStatus } : r)) }
          : g,
      ),
    );

  const confirmOne = (id: number, name: string) =>
    setGuests((gs) =>
      gs.map((g) =>
        g.id === id ? { ...g, reqs: g.reqs.map((r) => (r.name === name ? { ...r, status: "Confirmed" as ReqStatus } : r)) } : g,
      ),
    );

  const resolve = (id: number) => {
    setGuests((gs) =>
      gs.map((g) =>
        g.id === id
          ? {
              ...g,
              ready: "Ready",
              missing: undefined,
              reqs: g.reqs.map((r) => (r.status === "Awaiting Hotel Confirmation" ? { ...r, status: "Confirmed" as ReqStatus } : r)),
            }
          : g,
      ),
    );
    flash("Pre-arrival actions resolved — guest marked Ready");
  };

  return (
    <>
      <Topbar title="Pre-Arrival" subtitle="Prepare arriving guests, capture preferences, and resolve requests before check-in." />
      <Page>
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <Kpi icon={Plane} tone="text-slate-500" label="Arriving Today" value={today.length} onClick={() => goToday("all")} />
          <Kpi icon={Send} tone="text-sky-500" label="Not Contacted" value={kpiNC} onClick={() => goToday("nc")} />
          <Kpi icon={Clock} tone="text-amber-500" label="Awaiting Response" value={kpiAW} onClick={() => goToday("aw")} />
          <Kpi icon={AlertTriangle} tone="text-red-500" label="Action Required" value={kpiAR} onClick={() => goToday("ar")} />
        </div>

        {/* search + filter | date strip | bulk actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex shrink-0 items-center gap-3">
            <div className="relative w-[230px] shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guest, room…"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
              />
            </div>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              aria-label="Filters"
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                filtersOpen || filterBadge ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              <Filter className="h-4 w-4" />
              {filterBadge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                  {filterBadge}
                </span>
              )}
            </button>
            {(activeFilterCount > 0 || dateOn) && (
              <button
                onClick={() => { setFilters(NO_FILTERS); setTab("all"); setDateOn(false); }}
                className="text-[13px] font-medium text-brand"
              >
                Clear
              </button>
            )}
          {filtersOpen && (
            <div className="absolute left-0 top-12 z-30 w-[440px] rounded-card border border-line bg-white p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <ArrivalCalendar
                    selDay={dateOn ? selDay : null}
                    perDay={perDay}
                    onPick={(d) => {
                      if (d === null) return setDateOn(false);
                      setDateOn(true);
                      setSelDay(d);
                      if (d < weekStart || d > weekStart + 6) setWeekStart(d);
                    }}
                  />
                </div>
                <FilterSelect
                  label="Status"
                  value={tab}
                  onChange={(v) => setTab(v as Tab)}
                  options={TABS.map((t) => [t.key, `${t.label} (${tabCount(t.key)})`] as [string, string])}
                />
                <FilterSelect label="Readiness" value={filters.ready} onChange={(v) => setFilters((f) => ({ ...f, ready: v }))} options={[["all", "Any"], ["Ready", "Ready"], ["Awaiting Guest", "Awaiting Guest"], ["Action Required", "Action Required"], ["Not Contacted", "Not Contacted"]]} />
                <FilterSelect label="WhatsApp" value={filters.wa} onChange={(v) => setFilters((f) => ({ ...f, wa: v }))} options={[["all", "Any"], ["available", "Available"], ["unavailable", "Unavailable"]]} />
                <FilterSelect label="Messaging consent" value={filters.consent} onChange={(v) => setFilters((f) => ({ ...f, consent: v }))} options={[["all", "Any"], ["confirmed", "Confirmed"], ["missing", "Missing"]]} />
                <FilterSelect label="Room type" value={filters.room} onChange={(v) => setFilters((f) => ({ ...f, room: v }))} options={[["all", "Any"], ...roomTypes.map((r) => [r, r] as [string, string])]} />
                <FilterSelect label="Preferred language" value={filters.lang} onChange={(v) => setFilters((f) => ({ ...f, lang: v }))} options={[["all", "Any"], ...langs.map((r) => [r, r] as [string, string])]} />
                <FilterSelect label="Request type" value={filters.request} onChange={(v) => setFilters((f) => ({ ...f, request: v }))} options={[["all", "Any"], ...REQUEST_KEYS.map((r) => [r, r] as [string, string])]} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-ink">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-brand" checked={filters.loyalty} onChange={(e) => setFilters((f) => ({ ...f, loyalty: e.target.checked }))} />
                  Loyalty members
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-brand" checked={filters.returning} onChange={(e) => setFilters((f) => ({ ...f, returning: e.target.checked }))} />
                  Returning guest
                </label>
                <button onClick={() => { setFilters(NO_FILTERS); setTab("all"); setDateOn(false); }} className="ml-auto text-[13px] font-medium text-brand">
                  Clear all
                </button>
              </div>
            </div>
          )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importReport(f);
                e.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload report
            </Button>
            <Button disabled={!unsent.length} onClick={() => setConfirmSend(true)} className="disabled:opacity-40">
              <Send className="h-4 w-4" /> Send to all unsent{unsent.length ? ` (${unsent.length})` : ""}
            </Button>
          </div>
        </div>

        {dateOn && (
          <div className="mt-3">
            <DateStrip
            selDay={selDay}
            weekStart={weekStart}
            perDay={perDay}
            onSelect={setSelDay}
            onShift={(n) => setWeekStart((w) => w + n)}
            onToday={() => { setSelDay(24); setWeekStart(24); }}
          />
          </div>
        )}

        {/* table */}
        <div className="mt-5 overflow-hidden rounded-[20px] border border-line/40 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] table-fixed text-left">
              <colgroup>
                <col /><col /><col /><col /><col />
                <col className="w-16" />
              </colgroup>
              <thead>
                <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                  <th className="py-3.5 pl-6 font-medium">Guest</th>
                  <th className="py-3.5 pl-6 font-medium">Stay</th>
                  <th className="py-3.5 pl-6 font-medium">Arrival</th>
                  <th className="py-3.5 pl-6 font-medium">Engagement</th>
                  <th className="py-3.5 pl-6 font-medium">Last Interaction</th>
                  <th className="w-12 py-3.5 pr-6" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => {
                  const active = g.id === selectedId;
                  return (
                    <tr
                      key={g.id}
                      onClick={() => setSelectedId(g.id)}
                      className={`cursor-pointer border-b border-line/50 last:border-0 ${active ? "bg-brand-tint/40" : "hover:bg-subtle/60"}`}
                    >
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <Avatar g={g} size={36} soft />
                          <div className="min-w-0">
                            <div className="text-[14px] font-medium text-ink">{g.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-[14px] text-ink-secondary">
                        {shortDay(checkinDay(g))} – {shortDay(checkinDay(g) + g.nights)}
                      </td>
                      <td className="whitespace-nowrap py-3.5 pl-6 pr-3">
                        <div className="text-[14px] text-ink-secondary">{arrivalLabel(g)}</div>
                        <div className="text-[12px] text-ink-tertiary">{g.time}</div>
                      </td>
                      <td className="py-3.5 pl-6 pr-3">
                        <span className={`whitespace-nowrap text-[14px] font-medium ${ENG_PILL[g.eng]}`}>
                          {ENG_LABEL[g.eng]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-3.5 pl-6 pr-3 text-[14px] text-ink-secondary">{g.last}</td>
                      <td className="py-3.5 pr-6 text-right">
                        <MoreHorizontal className="ml-auto h-5 w-5 text-ink-tertiary" aria-label="More actions" />
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[13px] text-ink-tertiary">
                      No guests match this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 text-[12px] text-ink-tertiary">
            Showing {rows.length} of {dayGuests.length} guests
          </div>
        </div>
      </Page>

      {confirmSend && (
        <Modal
          title="Send pre-arrival message?"
          onClose={() => setConfirmSend(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmSend(false)}>Cancel</Button>
              <Button onClick={sendAll}>Send to {unsent.length}</Button>
            </>
          }
        >
          <p className="text-[13px] leading-relaxed text-ink-secondary">
            {unsent.length} guests have not been messaged yet. The standard pre-arrival message will be sent to all of them now.
          </p>
        </Modal>
      )}

      {selected && (
        <>
          <button className="fixed inset-0 z-30 bg-black/10" aria-label="Close" onClick={() => setSelectedId(null)} />
          <div className="fixed inset-y-0 right-0 z-40 flex shadow-2xl">
            <GuestDrawer
              g={selected}
              onClose={() => setSelectedId(null)}
              onPrefs={(prefs) => setGuests((gs) => gs.map((x) => (x.id === selected.id ? { ...x, prefs } : x)))}
              onTransfer={() => navigate(`/guest-chats?name=${encodeURIComponent(selected.name)}&room=${selected.room ?? ""}`)}
              onViewChat={() => navigate(`/guest-chats?name=${encodeURIComponent(selected.name)}&room=${selected.room ?? ""}`)}
            />
          </div>
        </>
      )}


      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </>
  );
}

function Kpi({
  icon: Icon, tone, label, value, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  label: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-card border border-line bg-white p-4 text-left transition-colors hover:border-brand/40"
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-[18px] w-[18px] ${tone}`} />
        <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      </div>
      <div className="mt-2 text-[28px] font-bold leading-none text-ink">{value}</div>
    </button>
  );
}

/** Day numbers count from 1 May 2025 (today is the 24th); 32 is 1 June. */
const DAY0 = new Date(2025, 4, 1).getTime();
const dayNumber = (d: Date) => Math.round((d.getTime() - DAY0) / 86400000) + 1;

function ArrivalCalendar({ selDay, perDay, onPick }: { selDay: number | null; perDay: Record<number, number>; onPick: (d: number | null) => void }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => (selDay ? new Date(2025, 4, selDay).getMonth() : 4));
  const first = new Date(2025, month, 1);
  const daysInMonth = new Date(2025, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => dayNumber(new Date(2025, month, i + 1)))];
  const label = selDay === null ? "All dates" : `${shortDay(selDay)}${selDay === 24 ? " (Today)" : selDay === 25 ? " (Tomorrow)" : ""}`;

  return (
    <div>
      <span className="mb-1 block text-[11px] text-ink-secondary">Arrival date</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 text-[13px] ${open ? "border-brand" : "border-line"} ${selDay === null ? "text-ink-secondary" : "text-ink"}`}
      >
        <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-ink-tertiary" /> {label}</span>
        {selDay !== null && (
          <span
            role="button"
            aria-label="Clear date"
            onClick={(e) => { e.stopPropagation(); onPick(null); }}
            className="rounded p-0.5 text-ink-tertiary hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-line bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => m - 1)} className="rounded-md p-1 text-ink-secondary hover:bg-subtle"><ChevronLeft className="h-4 w-4" /></button>
            <span className="text-[13px] font-semibold text-ink">{first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            <button type="button" aria-label="Next month" onClick={() => setMonth((m) => m + 1)} className="rounded-md p-1 text-ink-secondary hover:bg-subtle"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] text-ink-tertiary">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 text-center">
            {cells.map((d, i) => {
              if (d === null) return <span key={`b${i}`} />;
              const on = d === selDay;
              const n = perDay[d] ?? 0;
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => { onPick(d); setOpen(false); }}
                  className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] ${
                    on ? "bg-brand font-semibold text-white" : d === 24 ? "font-semibold text-brand ring-1 ring-brand/40 hover:bg-brand-tint" : n ? "font-medium text-ink hover:bg-subtle" : "text-ink-tertiary hover:bg-subtle"
                  }`}
                  title={n ? `${n} arriving` : "No arrivals"}
                >
                  {new Date(DAY0 + (d - 1) * 86400000).getDate()}
                  {n > 0 && !on && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brand/60" />}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-line pt-2 text-[12px]">
            <span className="text-ink-tertiary">Dots mark days with arrivals</span>
            <button type="button" onClick={() => { onPick(null); setOpen(false); }} className="font-medium text-brand">All dates</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-ink-secondary">{label}</span>
      <Select className="h-9 text-[13px]" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </Select>
    </label>
  );
}

/* ---------- date timeline ---------- */

const DOW = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function DateStrip({
  selDay, weekStart, perDay, onSelect, onShift, onToday,
}: {
  selDay: number;
  weekStart: number;
  perDay: Record<number, number>;
  onSelect: (d: number) => void;
  onShift: (n: number) => void;
  onToday: () => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => weekStart + i);
  const first = new Date(2025, 4, days[0]);
  const last = new Date(2025, 4, days[6]);
  const monthLabel =
    first.getMonth() === last.getMonth()
      ? first.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : `${first.toLocaleDateString("en-US", { month: "short" })} – ${last.toLocaleDateString("en-US", { month: "short" })}`;

  return (
    <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
      <button onClick={() => onShift(-7)} aria-label="Previous week" className="flex h-10 w-7 items-center justify-center rounded-lg text-ink-secondary hover:bg-subtle">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="w-24 shrink-0 whitespace-nowrap text-center text-[13px] font-medium text-ink">{monthLabel}</span>
      <button onClick={() => onShift(7)} aria-label="Next week" className="flex h-10 w-7 items-center justify-center rounded-lg text-ink-secondary hover:bg-subtle">
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="flex gap-1">
        {days.map((d) => {
          const date = new Date(2025, 4, d);
          const on = d === selDay;
          const n = perDay[d] ?? 0;
          const isToday = d === 24;
          return (
            <button
              key={d}
              onClick={() => onSelect(d)}
              title={`${n} ${n === 1 ? "arrival" : "arrivals"}`}
              className={`flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[13px] transition-colors ${
                on ? "bg-brand text-white" : "text-ink-secondary hover:bg-subtle"
              }`}
            >
              <span className={`text-[12px] capitalize ${on ? "text-white/85" : "text-ink-tertiary"}`}>{isToday ? "Today" : DOW[date.getDay()]}</span>
              <span className={`font-semibold ${on ? "text-white" : "text-ink"}`}>{date.getDate()}</span>
              {n > 0 && <span className={`text-[11px] font-medium ${on ? "text-white/85" : "text-brand"}`}>{n}</span>}
            </button>
          );
        })}
      </div>

      {selDay !== 24 && (
        <button onClick={onToday} className="ml-1 flex h-10 items-center rounded-lg px-2 text-[12px] font-semibold text-brand hover:bg-brand-tint">
          Today
        </button>
      )}
    </div>
  );
}

/* ---------- drawer ---------- */

const REQ_STYLE: Record<ReqStatus, string> = {
  Confirmed: "bg-emerald-50 text-emerald-700",
  "Awaiting Hotel Confirmation": "bg-amber-50 text-amber-700",
  Captured: "bg-slate-100 text-slate-600",
  None: "bg-gray-100 text-gray-500",
};

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">{children}</span>
      {action}
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-line/60 py-2 text-[13px] last:border-0">
      <span className="text-ink-secondary">{label}</span>
      <span className="text-ink">{children}</span>
    </div>
  );
}

function GuestDrawer({
  g, onClose, onPrefs, onTransfer, onViewChat,
}: {
  g: PreGuest;
  onClose: () => void;
  onPrefs: (prefs: string[]) => void;
  onTransfer: () => void;
  onViewChat: () => void;
}) {
  const ci = checkinDay(g);
  const contacted = g.eng !== "Not Contacted";
  const opened = g.eng === "Engaged" || g.eng === "Responded";
  const responded = opened;
  const prefsDone = g.ready === "Ready";
  const [editPrefs, setEditPrefs] = useState(false);
  const [newPref, setNewPref] = useState("");
  const addPref = () => {
    const v = newPref.trim();
    if (v && !g.prefs.some((p) => p.toLowerCase() === v.toLowerCase())) onPrefs([...g.prefs, v]);
    setNewPref("");
  };
  const steps: { title: string; sub: string; done: boolean }[] = [
    { title: "Guest imported from arrival report", sub: `${shortDay(24)}, 08:45 AM`, done: true },
    { title: "Pre-arrival message sent", sub: contacted ? `${shortDay(24)}, 09:00 AM` : "Not sent yet", done: contacted },
    { title: "Guest opened message", sub: opened ? `${shortDay(24)}, 11:23 AM` : "Pending", done: opened },
    { title: "Guest responded", sub: responded ? `${shortDay(24)}, 11:45 AM` : "Pending", done: responded },
    { title: "Preferences collected", sub: prefsDone ? "Collected" : "Pending", done: prefsDone },
    { title: "Guest arrives", sub: `${arrivalLabel(g)}, ${g.time}`, done: false },
    { title: "Transfer to In-House", sub: "Pending front desk action", done: false },
  ];
  return (
    <aside role="dialog" aria-label="Guest pre-arrival" className="flex w-[400px] shrink-0 flex-col border-l border-line bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="flex items-start gap-3.5">
          <Avatar g={g} size={48} soft />
          <div className="min-w-0 flex-1">
            <div className="text-[19px] font-bold leading-tight text-ink">{g.name}</div>
            <div className="mt-0.5 text-[13px] text-ink-secondary">{g.room ? `Room ${g.room}` : "Room not assigned"} · {g.type}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 text-[14px] text-ink-secondary">
          {arrivalLabel(g)} {g.time} → {shortDay(ci + g.nights)} <span className="text-ink-tertiary">· {g.nights} nights</span>
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <div className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-ink-tertiary">Pre-arrival journey</div>
          <ol>
            {steps.map((st, i) => (
              <li key={st.title} className="flex gap-3.5">
                <div className="flex flex-col items-center">
                  {st.done ? (
                    <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-brand" />
                  ) : (
                    <span className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-line" />
                  )}
                  {i < steps.length - 1 && <span className={`my-1 w-px flex-1 ${st.done && steps[i + 1].done ? "bg-brand" : "bg-line"}`} />}
                </div>
                <div className={i < steps.length - 1 ? "pb-4" : ""}>
                  <div className={`text-[15px] leading-tight ${st.done ? "font-medium text-ink" : "text-ink-tertiary"}`}>{st.title}</div>
                  <div className="mt-0.5 text-[12px] text-ink-tertiary">{st.sub}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-2 border-t border-line pt-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[12px] font-semibold uppercase tracking-wide text-ink-tertiary">Preferences collected</div>
            <button onClick={() => { setEditPrefs((e) => !e); setNewPref(""); }} className="text-[13px] font-medium text-brand hover:underline">
              {editPrefs ? "Done" : "Edit"}
            </button>
          </div>
          {g.prefs.length > 0 || editPrefs ? (
            <div className="flex flex-wrap gap-1.5">
              {g.prefs.map((pr) => (
                <span key={pr} className="inline-flex items-center gap-1 rounded-md bg-subtle px-2 py-1 text-[12px] text-ink-secondary">
                  {pr}
                  {editPrefs && (
                    <button onClick={() => onPrefs(g.prefs.filter((x) => x !== pr))} aria-label={`Remove ${pr}`} className="text-ink-tertiary hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[14px] text-ink-secondary">
              <span className="h-2 w-2 rounded-full bg-brand/60" /> {prefsDone ? "No preferences yet" : "Awaiting guest response"}
            </div>
          )}
          {editPrefs && (
            <div className="mt-3 flex gap-2">
              <input
                autoFocus
                value={newPref}
                onChange={(e) => setNewPref(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addPref(); }}
                placeholder="e.g. Feather-free pillows"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
              />
              <Button onClick={addPref} disabled={!newPref.trim()} className="h-9 disabled:opacity-40">Add</Button>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-5">
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-tertiary">Pre-arrival conversation summary</div>
          <p className="rounded-xl bg-subtle px-4 py-3 text-[14px] leading-relaxed text-ink">
            {contacted ? g.brief : "No conversation yet. The pre-arrival message has not been sent."}
          </p>
          <button onClick={onViewChat} className="mt-3 text-[14px] font-medium text-brand hover:underline">View full conversation →</button>
        </div>
      </div>
      <div className="shrink-0 border-t border-line p-5">
        <Button className="w-full" onClick={onTransfer}>Transfer to In-House Chat</Button>
      </div>
    </aside>
  );
}

function FooterBtn({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-white py-2 text-[12px] font-semibold text-ink-secondary hover:bg-subtle">
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function MiniBtn({ children, onClick, primary, disabled }: { children: React.ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-[12px] font-semibold disabled:opacity-40 ${
        primary ? "bg-brand text-white hover:bg-brand-hover" : "border border-line bg-white text-ink-secondary hover:bg-subtle"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- bulk modal ---------- */

function BulkModal({ onClose, onSend, onReview }: { onClose: () => void; onSend: () => void; onReview: () => void }) {
  const rowsData = [
    { n: 12, label: "eligible to receive WhatsApp message", tone: "bg-emerald-500", sub: "WhatsApp available · consent confirmed" },
    { n: 3, label: "already contacted", tone: "bg-slate-400", sub: "Will not be messaged again" },
    { n: 2, label: "missing valid consent", tone: "bg-amber-400", sub: "Excluded until consent is captured" },
    { n: 1, label: "WhatsApp unavailable", tone: "bg-gray-300", sub: "Contact by email or phone" },
  ];
  return (
    <Modal
      title="Review & Send Messages"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onReview}>Review Guests</Button>
          <Button onClick={onSend}>Send to 12 Eligible Guests</Button>
        </>
      }
    >
      <div className="text-[13px] text-ink-secondary">Arriving today</div>
      <div className="text-[26px] font-bold text-ink">18 guests</div>

      <div className="mt-4 space-y-3">
        {rowsData.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${r.tone}`} />
            <div className="flex-1">
              <div className="text-[13px] text-ink">
                <span className="font-semibold">{r.n}</span> {r.label}
              </div>
              <div className="text-[12px] text-ink-tertiary">{r.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-lg bg-subtle px-3 py-2.5 text-[12px] text-ink-secondary">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
        <span>
          ALFON checks WhatsApp availability and messaging consent for every guest. Messages are only sent to
          eligible guests — you can review each guest first.
        </span>
      </div>
    </Modal>
  );
}
