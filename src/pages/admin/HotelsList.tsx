import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, CheckCircle2, PauseCircle, Link2, Search, Plus, ChevronRight, MessageSquare, Server } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Button, Select } from "../../components/ui";
import { HOTELS, REGIONS, hotelStats, type Hotel } from "../../data/hotels";

const TABS = ["All", "Active", "Inactive", "New"] as const;

const STATUS_TONE: Record<Hotel["status"], string> = { Active: "text-emerald-600", Inactive: "text-red-600", New: "text-sky-600" };
const CONN_TONE: Record<Hotel["whatsapp"], string> = { Connected: "text-emerald-600", Pending: "text-amber-600", Disconnected: "text-red-500" };
const CONN_DOT: Record<Hotel["whatsapp"], string> = { Connected: "bg-emerald-500", Pending: "bg-amber-400", Disconnected: "bg-red-400" };

const KPIS = [
  { label: "Total Hotels", icon: Building2, key: "total" as const, tint: "bg-brand-tint text-brand", foot: "20% vs last month" },
  { label: "Active Hotels", icon: CheckCircle2, key: "active" as const, tint: "bg-emerald-50 text-emerald-600", foot: "11% vs last month" },
  { label: "Inactive Hotels", icon: PauseCircle, key: "inactive" as const, tint: "bg-amber-50 text-amber-600", foot: "0% vs last month" },
  { label: "System Connections", icon: Link2, key: "connections" as const, tint: "bg-sky-50 text-sky-600", foot: "28% vs last month" },
];

export default function HotelsList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const stats = hotelStats();

  useEffect(() => {
    const created = params.get("created");
    if (!created) return;
    setToast(`"${created}" was created — connect its systems whenever you're ready.`);
    setParams({}, { replace: true });
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = HOTELS.filter((h) => {
    if (tab !== "All" && h.status !== tab) return false;
    if (region !== "all" && h.region !== region) return false;
    const q = query.trim().toLowerCase();
    return !q || `${h.name} ${h.location}`.toLowerCase().includes(q);
  });

  return (
    <>
      <Topbar
        title="Hotels"
        hideQuickActions
        actions={
          <Button onClick={() => navigate("/admin/hotels/new")}>
            <Plus className="h-4 w-4" /> Add Hotel
          </Button>
        }
      />
      <Page>
        <h2 className="font-display text-[26px] font-bold leading-tight text-ink">Manage Hotels</h2>
        <p className="mt-1 text-[13px] text-ink-secondary">Add new hotels, view their status, manage connections and monitor performance.</p>

        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((k) => (
            <Card key={k.label} className="p-4">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.tint}`}>
                <k.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="mt-3 text-[13px] text-ink-secondary">{k.label}</div>
              <div className="text-[26px] font-bold leading-tight text-ink">{stats[k.key]}</div>
              <div className="text-[12px] text-ink-tertiary">{k.foot}</div>
            </Card>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-line bg-white p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-3 py-1.5 text-[13px] font-medium ${tab === t ? "bg-brand-tint text-brand" : "text-ink-secondary hover:text-ink"}`}
              >
                {t} Hotels{t === "All" ? "" : ""}
              </button>
            ))}
          </div>
          <div className="relative min-w-0 max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hotels…"
              className="h-10 w-full rounded-control border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>
          <div className="w-44">
            <Select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
              <option value="all">All Regions</option>
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </div>
        </div>

        <Card table className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed text-left">
              <colgroup>
                <col />
                <col className="w-[100px]" />
                <col className="w-[160px]" />
                <col className="w-[110px]" />
                <col className="w-[90px]" />
                <col className="w-[70px]" />
                <col className="w-[150px]" />
                <col className="w-[140px]" />
              </colgroup>
              <thead>
                <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                  <th className="py-3.5 pl-6 font-medium">Hotel</th>
                  <th className="py-3.5 pl-6 font-medium">Status</th>
                  <th className="py-3.5 pl-6 font-medium">Connections</th>
                  <th className="py-3.5 pl-6 font-medium">Departments</th>
                  <th className="py-3.5 pl-6 font-medium">Staff</th>
                  <th className="py-3.5 pl-6 font-medium">Health</th>
                  <th className="py-3.5 pl-6 font-medium" />
                  <th className="w-24 py-3.5 pr-6" />
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <tr key={h.id} onClick={() => navigate(`/admin/hotels/${h.id}`)} className="cursor-pointer border-b border-line/50 last:border-0 hover:bg-subtle/60">
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand"><Building2 className="h-4 w-4" /></span>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-ink">{h.name}</div>
                          <div className="truncate text-[12px] text-ink-tertiary">{h.location} · {h.rooms} Rooms</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pl-6 pr-3"><span className={`text-[13px] font-medium ${STATUS_TONE[h.status]}`}>{h.status}</span></td>
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-1.5 text-[12px]"><MessageSquare className="h-3.5 w-3.5 text-ink-tertiary" /><span className={`flex items-center gap-1 ${CONN_TONE[h.whatsapp]}`}><span className={`h-1.5 w-1.5 rounded-full ${CONN_DOT[h.whatsapp]}`} />{h.whatsapp}</span></div>
                      <div className="mt-1 flex items-center gap-1.5 text-[12px]"><Server className="h-3.5 w-3.5 text-ink-tertiary" /><span className={`flex items-center gap-1 ${CONN_TONE[h.pms]}`}><span className={`h-1.5 w-1.5 rounded-full ${CONN_DOT[h.pms]}`} />{h.pms}</span></div>
                    </td>
                    <td className="py-3.5 pl-6 pr-3 text-[13px] text-ink-secondary">{h.departments}</td>
                    <td className="py-3.5 pl-6 pr-3 text-[13px] text-ink-secondary">{h.staff}</td>
                    <td className="py-3.5 pl-6 pr-3">
                      {h.healthScore === null ? (
                        <span className="text-[13px] text-ink-tertiary">—</span>
                      ) : (
                        <div className="w-24">
                          <div className="text-[13px] font-semibold text-ink">{h.healthScore}%</div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${h.healthScore}%` }} /></div>
                        </div>
                      )}
                    </td>
                    <td />
                    <td className="py-3.5 pr-6 text-right">
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand">View Details <ChevronRight className="h-3.5 w-3.5" /></span>
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={8} className="py-10 text-center text-[13px] text-ink-tertiary">No hotels match.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-line px-6 py-3 text-[12px] text-ink-tertiary">
            <span>Showing {rows.length} of {HOTELS.length} hotels</span>
          </div>
        </Card>
      </Page>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast}
          </span>
        </div>
      )}
    </>
  );
}
