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
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { GuestChat, type ChatMsg, type ChatMode } from "../components/GuestChat";
import { Drawer } from "../components/Drawer";
import { Page, Card, Button, Modal, Select } from "../components/ui";
import { PRE_GUESTS, type PreGuest, type Ready, type ReqStatus } from "../data/preArrival";

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

const ENG_DOT: Record<string, string> = {
  "Not Contacted": "bg-gray-300",
  "Awaiting Response": "bg-amber-400",
  Engaged: "bg-sky-400",
  Responded: "bg-emerald-500",
};

function Avatar({ g, size = 36 }: { g: PreGuest; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${g.tint}`}
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
  const [selDay, setSelDay] = useState(24);
  const [weekStart, setWeekStart] = useState(24);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
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
  const dayGuests = useMemo(() => guests.filter((g) => checkinDay(g) === selDay), [guests, selDay]);
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
  const goToday = (t: Tab) => { setSelDay(24); setWeekStart(24); setTab(t); };

  const contacted = today.filter((g) => g.eng !== "Not Contacted").length;
  const responded = today.filter((g) => g.eng === "Engaged" || g.eng === "Responded").length;
  const kpiNC = today.filter((g) => g.eng === "Not Contacted").length;
  const kpiAW = today.filter((g) => g.eng === "Awaiting Response").length;
  const kpiAR = today.filter((g) => g.ready === "Action Required").length;
  const kpiReady = today.length - kpiAR;

  const roomTypes = useMemo(() => [...new Set(guests.map((g) => g.type))].sort(), [guests]);
  const langs = useMemo(() => [...new Set(guests.map((g) => g.lang))].sort(), [guests]);
  const activeFilterCount =
    Number(tab !== "all") + Number(filters.loyalty) + Number(filters.returning) + [filters.wa, filters.consent, filters.room, filters.lang, filters.request, filters.ready].filter((v) => v !== "all").length;

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
      <Topbar title="" searchPlaceholder="Search guests, rooms, reservations…" />
      <Page>
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Pre-Arrival</h1>
            <p className="mt-1 text-[13px] text-ink-secondary">
              Prepare arriving guests, capture preferences, and resolve requests before check-in.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) flash(`Arrival report uploaded: ${f.name}`);
                e.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Arrival Report
            </Button>
            <Button onClick={() => setBulkOpen(true)}>
              <Send className="h-4 w-4" /> Review &amp; Send Messages
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Kpi icon={Plane} tone="text-ink-secondary bg-subtle" label="Arriving Today" value={today.length} sub={`${contacted} contacted · ${responded} responded`} onClick={() => goToday("all")} />
          <Kpi icon={Send} tone="text-gray-500 bg-gray-100" label="Not Contacted" value={kpiNC} sub="Requires attention" onClick={() => goToday("nc")} />
          <Kpi icon={Clock} tone="text-amber-600 bg-amber-50" label="Awaiting Response" value={kpiAW} sub="Messages already sent" onClick={() => goToday("aw")} />
          <Kpi icon={AlertTriangle} tone="text-amber-700 bg-amber-100" label="Action Required" value={kpiAR} sub="Hotel intervention needed" emphasis onClick={() => goToday("ar")} />
          <Kpi icon={CheckCircle2} tone="text-emerald-600 bg-emerald-50" label="Ready for Arrival" value={kpiReady} sub="No outstanding actions" onClick={() => goToday("ready")} />
        </div>

        {/* search + date selector + filter, one line */}
        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[230px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guest, room…"
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>

          <DateStrip
            selDay={selDay}
            weekStart={weekStart}
            perDay={perDay}
            onSelect={setSelDay}
            onShift={(n) => setWeekStart((w) => w + n)}
            onToday={() => { setSelDay(24); setWeekStart(24); }}
          />

          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setFilters(NO_FILTERS); setTab("all"); }}
                className="text-[13px] font-medium text-brand"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              aria-label="Filters"
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${
                filtersOpen || activeFilterCount ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="absolute right-0 top-12 z-30 w-[440px] rounded-card border border-line bg-white p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-3">
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
                <button onClick={() => { setFilters(NO_FILTERS); setTab("all"); }} className="ml-auto text-[13px] font-medium text-brand">
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* table */}
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-line bg-subtle/50 text-[11px] uppercase tracking-wide text-ink-secondary">
                  <th className="py-3 pl-5 font-medium">Guest</th>
                  <th className="py-3 font-medium">Stay</th>
                  <th className="py-3 font-medium">Arrival</th>
                  <th className="py-3 font-medium">Engagement</th>
                  <th className="py-3 font-medium">Preferences / Requests</th>
                  <th className="py-3 font-medium">Last Interaction</th>
                  <th className="py-3 pr-5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => {
                  const active = g.id === selectedId;
                  return (
                    <tr
                      key={g.id}
                      onClick={() => setSelectedId(g.id)}
                      className={`cursor-pointer border-b border-line/70 ${active ? "bg-brand-tint/40" : "hover:bg-subtle/60"}`}
                    >
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <Avatar g={g} />
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-ink">{g.name}</div>
                            {g.tags.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                <TagChips g={g} />
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3.5 pr-3">
                        <div className="text-[13px] text-ink">{g.room ? `Room ${g.room}` : "Room not assigned"}</div>
                        <div className="text-[12px] text-ink-tertiary">
                          {g.type} · {g.nights} nights
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-3.5 pr-3">
                        <div className="text-[13px] font-medium text-ink">{arrivalLabel(g)}</div>
                        <div className="text-[12px] text-ink-tertiary">{g.time}</div>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className="flex items-center gap-2 whitespace-nowrap text-[13px] text-ink">
                          <span className={`h-2 w-2 rounded-full ${ENG_DOT[g.eng]}`} /> {g.eng}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3">
                        {g.chips.length === 0 ? (
                          <span className="text-[12px] text-ink-tertiary">—</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {g.chips.slice(0, 3).map((c) => (
                              <span key={c} className="whitespace-nowrap rounded-md bg-subtle px-2 py-1 text-[12px] text-ink-secondary">
                                {c}
                              </span>
                            ))}
                            {g.chips.length > 3 && (
                              <span className="text-[12px] font-medium text-ink-tertiary">+{g.chips.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-3.5 pr-3 text-[13px] text-ink-secondary">{g.last}</td>
                      <td className="py-3.5 pr-5 text-right">
                        <span
                          className={`inline-flex rounded-lg px-3 py-1.5 text-[12px] font-semibold ${
                            g.ready === "Action Required"
                              ? "bg-brand text-white"
                              : "border border-line bg-white text-ink-secondary"
                          }`}
                        >
                          {g.ready === "Action Required" ? "Review" : "View"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[13px] text-ink-tertiary">
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
        </Card>
      </Page>

      {selected && (
        <>
          <button className="fixed inset-0 z-30 bg-black/10" aria-label="Close" onClick={() => setSelectedId(null)} />
          <div className="fixed inset-y-0 right-0 z-40 flex shadow-2xl">
            <GuestDrawer
              g={selected}
              msgs={chatFor(selected)}
              mode={modes[selected.id] ?? "auto"}
              setMode={(m) => setModes((x) => ({ ...x, [selected.id]: m }))}
              onSend={(t) => sendChat(selected, t)}
              onClose={() => setSelectedId(null)}
              onCreateTask={() => createTask(selected)}
              flash={flash}
            />
          </div>
        </>
      )}

      {bulkOpen && (
        <BulkModal
          onClose={() => setBulkOpen(false)}
          onSend={() => { setBulkOpen(false); flash("Messages queued for 12 eligible guests"); }}
          onReview={() => { setBulkOpen(false); goToday("nc"); }}
        />
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
  icon: Icon, tone, label, value, sub, emphasis, onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  label: string;
  value: number;
  sub: string;
  emphasis?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-card border p-4 text-left transition-colors hover:border-brand/40 ${
        emphasis ? "border-amber-200 bg-amber-50/50 shadow-sm" : "border-line bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[13px] font-medium text-ink-secondary">{label}</span>
      </div>
      <div className="mt-2 text-[28px] font-bold leading-none text-ink">{value}</div>
      <div className="mt-1.5 text-[12px] text-ink-secondary">{sub}</div>
    </button>
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
    <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
      <button onClick={() => onShift(-7)} aria-label="Previous week" className="rounded-lg p-1.5 text-ink-secondary hover:bg-subtle">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="w-[74px] text-center text-[13px] font-semibold text-ink">{monthLabel}</span>
      <button onClick={() => onShift(7)} aria-label="Next week" className="rounded-lg p-1.5 text-ink-secondary hover:bg-subtle">
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="flex gap-1.5">
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
              className={`w-[52px] rounded-lg border py-1 text-center transition-colors ${
                on
                  ? "border-brand bg-brand text-white"
                  : isToday
                    ? "border-brand/40 bg-brand-tint/40 text-ink hover:bg-brand-tint"
                    : "border-line bg-white text-ink hover:border-brand/40 hover:bg-subtle"
              }`}
            >
              <div className={`text-[10px] font-medium lowercase leading-tight ${on ? "text-white/80" : "text-ink-tertiary"}`}>
                {isToday ? "today" : DOW[date.getDay()]}
              </div>
              <div className="text-[15px] font-bold leading-tight">{date.getDate()}</div>
              <div className={`text-[10px] leading-tight ${on ? "text-white/85" : n ? "text-brand" : "text-ink-tertiary"}`}>
                {n || "–"}
              </div>
            </button>
          );
        })}
      </div>

      {selDay !== 24 && (
        <button onClick={onToday} className="ml-1 rounded-lg px-2 py-1 text-[12px] font-semibold text-brand hover:bg-brand-tint">
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
  g, msgs, mode, setMode, onSend, onClose, onCreateTask, flash,
}: {
  g: PreGuest;
  msgs: ChatMsg[];
  mode: ChatMode;
  setMode: (m: ChatMode) => void;
  onSend: (text: string) => void;
  onClose: () => void;
  onCreateTask: () => void;
  flash: (m: string) => void;
}) {
  const ci = checkinDay(g);
  return (
    <Drawer
      title="Guest Pre-Arrival"
      width={470}
      onClose={onClose}
      footer={
        <Button className="w-full" onClick={onCreateTask}>
          <Plus className="h-4 w-4" /> Create Task
        </Button>
      }
    >
      <div className="-mt-1 flex items-start gap-4">
        <Avatar g={g} size={52} />
        <div className="min-w-0 flex-1">
          <div className="text-[18px] font-bold leading-tight text-ink">{g.name}</div>
          {g.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              <TagChips g={g} />
            </div>
          )}
          <div className="mt-1.5 text-[13px] text-ink-secondary">
            {g.room ? `Room ${g.room}` : "Room not assigned"} · {g.type} · {g.nights} nights
          </div>
          <div className="text-[13px] text-ink-secondary">Arrives {arrivalLabel(g)} at {g.time}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 rounded-xl border border-line p-3.5 text-[13px]">
        <div><div className="text-[11px] text-ink-tertiary">Stay</div><div className="font-medium text-ink">{fmt(ci)} → {fmt(ci + g.nights)}</div></div>
        <div><div className="text-[11px] text-ink-tertiary">Guests</div><div className="font-medium text-ink">{g.adults} adult{g.adults === 1 ? "" : "s"}{g.children ? `, ${g.children} child${g.children === 1 ? "" : "ren"}` : ""}</div></div>
        <div><div className="text-[11px] text-ink-tertiary">Language</div><div className="font-medium text-ink">{g.lang}</div></div>
        <div>
          <div className="text-[11px] text-ink-tertiary">WhatsApp</div>
          <div className={`font-medium ${g.consent ? "text-emerald-700" : "text-amber-700"}`}>
            {g.wa ? (g.consent ? "Consent confirmed" : "Consent required") : "Unavailable"}
          </div>
        </div>
        {g.prefs.length > 0 && (
          <div className="col-span-2 flex flex-wrap gap-1.5 border-t border-line/70 pt-2.5">
            {g.prefs.slice(0, 5).map((p) => (
              <span key={p} className="rounded-md bg-subtle px-2 py-0.5 text-[11px] text-ink-secondary">{p}</span>
            ))}
            {g.prefs.length > 5 && <span className="px-1 text-[11px] text-ink-tertiary">+{g.prefs.length - 5}</span>}
          </div>
        )}
      </div>

      {!g.consent && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50/70 px-3 py-2 text-[12px] text-ink-secondary">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          Messaging consent required — hotel-initiated messages are blocked until the guest opts in.
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-line">
        <GuestChat
          className="h-[calc(100vh-520px)] min-h-[260px]"
          name={g.name}
          msgs={msgs}
          mode={mode}
          setMode={setMode}
          onSend={onSend}
          emptyText="No messages yet."
        />
      </div>
    </Drawer>
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
