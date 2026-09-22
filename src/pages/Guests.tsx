import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Luggage,
  Briefcase,
  Plane,
  Crown,
  ChevronDown,
  Plus,
  Search,
  Filter,
  MessageSquare,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Badge, Button, Select } from "../components/ui";
import { Flag } from "../components/Flag";
import { GUESTS } from "../data/guests";

function Foot({ dot, text }: { dot: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-secondary">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {text}
    </span>
  );
}

const STATS = [
  { label: "Total Guests", value: "256", icon: Users, chip: "bg-brand-tint text-brand", foot: <span className="text-emerald-600">↑ 12% vs yesterday</span> },
  { label: "In House", value: "186", icon: Luggage, chip: "bg-emerald-50 text-emerald-600", foot: <Foot dot="bg-emerald-500" text="Currently staying" /> },
  { label: "Arrivals Today", value: "28", icon: Briefcase, chip: "bg-blue-50 text-blue-600", foot: <Foot dot="bg-blue-500" text="Expected" /> },
  { label: "Departures Today", value: "22", icon: Plane, chip: "bg-violet-50 text-violet-600", foot: <Foot dot="bg-violet-500" text="Scheduled" /> },
  { label: "VIP Guests", value: "34", icon: Crown, chip: "bg-amber-50 text-amber-600", foot: <Foot dot="bg-amber-500" text="High priority" /> },
];

type Filters = { status: string; nationality: string; type: string; room: string; vip: boolean };
const NO_FILTERS: Filters = { status: "all", nationality: "all", type: "all", room: "all", vip: false };

export default function Guests() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const nationalities = useMemo(() => [...new Set(GUESTS.map((g) => g.country))].sort(), []);
  const roomTypes = useMemo(() => [...new Set(GUESTS.map((g) => g.roomType))].sort(), []);

  const activeCount =
    [filters.status, filters.nationality, filters.type, filters.room].filter((v) => v !== "all").length +
    Number(filters.vip);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GUESTS.filter(
      (g) =>
        (!q || [g.name, g.contact, g.room, g.country].some((v) => v.toLowerCase().includes(q))) &&
        (filters.status === "all" || g.status === filters.status) &&
        (filters.nationality === "all" || g.country === filters.nationality) &&
        (filters.type === "all" || g.type === filters.type) &&
        (filters.room === "all" || g.roomType === filters.room) &&
        (!filters.vip || g.vip),
    );
  }, [query, filters]);

  const filtered = !!query || activeCount > 0;

  return (
    <>
      <Topbar
        title="Guests"
        actions={
          <div className="flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-ink-secondary hover:bg-subtle">
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
                9
              </span>
              <MessageSquare className="h-[18px] w-[18px]" />
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-ink">
              The Grand Luxury Hotel <ChevronDown className="h-4 w-4 text-ink-tertiary" />
            </button>
          </div>
        }
      />
      <Page>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink">Guests</h1>
            <p className="mt-1 text-[13px] text-ink-secondary">
              View and manage guest profiles, stay details and preferences.
            </p>
          </div>
          <div className="flex overflow-hidden rounded-lg">
            <Button className="rounded-none">
              <Plus className="h-4 w-4" /> Add Guest
            </Button>
            <button className="flex items-center border-l border-white/25 bg-brand px-2 text-white hover:bg-brand-hover">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((s) => (
            <Card key={s.label} className="p-4">
              <div className="flex items-start justify-between">
                <span className="text-[12px] font-medium text-ink-secondary">{s.label}</span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.chip}`}>
                  <s.icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-[26px] font-bold text-ink">{s.value}</div>
              <div className="mt-1 text-[11px]">{s.foot}</div>
            </Card>
          ))}
        </div>

        {/* search (left) + filter icon (right) */}
        <div className="relative mt-5 flex items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guests by name, room, phone, email…"
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>

          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={() => setFilters(NO_FILTERS)} className="text-[13px] font-medium text-brand">
                Clear filters
              </button>
            )}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              aria-label="Filters"
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${
                filtersOpen || activeCount
                  ? "border-brand bg-brand-tint text-brand"
                  : "border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              <Filter className="h-4 w-4" />
              {activeCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="absolute right-0 top-12 z-30 w-[380px] rounded-card border border-line bg-white p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] text-ink-secondary">Stay status</span>
                  <Select className="h-9 text-[13px]" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
                    <option value="all">Any</option>
                    <option>In House</option>
                    <option>Arriving</option>
                  </Select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-ink-secondary">Guest type</span>
                  <Select className="h-9 text-[13px]" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
                    <option value="all">Any</option>
                    <option>Leisure</option>
                    <option>Business</option>
                  </Select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-ink-secondary">Nationality</span>
                  <Select className="h-9 text-[13px]" value={filters.nationality} onChange={(e) => setFilters((f) => ({ ...f, nationality: e.target.value }))}>
                    <option value="all">Any</option>
                    {nationalities.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </Select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-ink-secondary">Room type</span>
                  <Select className="h-9 text-[13px]" value={filters.room} onChange={(e) => setFilters((f) => ({ ...f, room: e.target.value }))}>
                    <option value="all">Any</option>
                    {roomTypes.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </Select>
                </label>
              </div>
              <div className="mt-3 flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2 text-ink">
                  <input
                    type="checkbox"
                    className="accent-brand"
                    checked={filters.vip}
                    onChange={(e) => setFilters((f) => ({ ...f, vip: e.target.checked }))}
                  />
                  VIP guests only
                </label>
                <span className="flex items-center gap-3 text-[12px] text-ink-secondary">
                  {rows.length} match
                  <button onClick={() => setFiltersOpen(false)} className="font-semibold text-brand">
                    Done
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* table */}
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] whitespace-nowrap text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                  <th className="py-3 pl-5 font-medium">Guest</th>
                  <th className="py-3 font-medium">Room / Type</th>
                  <th className="py-3 font-medium">Stay Dates</th>
                  <th className="py-3 font-medium">Nationality</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 pr-5 font-medium">Last Interaction</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => navigate(`/guests/${g.id}`)}
                    className="cursor-pointer border-b border-line/70 hover:bg-subtle/50"
                  >
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold ${g.tint}`}>
                          {g.initials}
                        </span>
                        <div className="leading-tight">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold text-ink">{g.name}</span>
                            {g.vip && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">VIP</span>
                            )}
                          </div>
                          <div className="text-[12px] text-ink-tertiary">{g.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="text-[13px] font-medium text-ink">{g.room}</div>
                      <div className="text-[12px] text-ink-secondary">{g.roomType}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <div className="text-[13px] text-ink">
                        {g.from} – {g.to}
                      </div>
                      <div className="text-[12px] text-ink-secondary">{g.nights} nights</div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2 text-[13px] text-ink">
                        <Flag country={g.country} /> {g.country}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <Badge tone={g.status === "In House" ? "success" : "info"}>{g.status}</Badge>
                    </td>
                    <td className="py-3 pr-5">
                      {g.last ? (
                        <span className="flex items-center gap-2 text-[13px] text-ink-secondary">
                          {g.last}
                          <span className="flex items-center gap-0.5 text-ink-tertiary">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {g.msgs}
                          </span>
                        </span>
                      ) : (
                        <span className="text-ink-tertiary">–</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[13px] text-ink-tertiary">
                      No guests match your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 text-[12px] text-ink-tertiary">
            <span>
              {filtered ? `Showing ${rows.length} matching guests` : `Showing 1 to ${rows.length} of 256 guests`}
            </span>
            {!filtered && (
              <span className="flex items-center gap-1">
                <button className="rounded-md border border-line px-2 py-1">‹</button>
                {["1", "2", "3"].map((p) => (
                  <button
                    key={p}
                    className={`rounded-md border px-2.5 py-1 ${p === "1" ? "border-brand text-brand" : "border-line"}`}
                  >
                    {p}
                  </button>
                ))}
                <span className="px-1">…</span>
                <button className="rounded-md border border-line px-2.5 py-1">32</button>
                <button className="rounded-md border border-line px-2 py-1">›</button>
              </span>
            )}
          </div>
        </Card>
      </Page>
    </>
  );
}
