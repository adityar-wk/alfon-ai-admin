import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, CheckCircle2, AlertTriangle, Activity, Search, Plus, MoreHorizontal, Check, X, Clock } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Button, Select, StatCard } from "../../components/ui";
import { HOTELS, REGIONS, type Hotel, type ConnStatus } from "../../data/hotels";

const TABS = ["All", "Active", "Inactive", "Pending", "New"] as const;

const STATUS_TONE: Record<Hotel["status"], string> = { Active: "text-green-600", Inactive: "text-red-600", Pending: "text-amber-600", New: "text-blue-600" };

function ConnIcon({ status }: { status: ConnStatus }) {
  if (status === "Connected") return <Check className="h-4 w-4 text-green-600" aria-label="Connected" />;
  if (status === "Disconnected") return <X className="h-4 w-4 text-red-500" aria-label="Disconnected" />;
  return <Clock className="h-4 w-4 text-amber-500" aria-label="Pending" />;
}

export default function HotelsList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [toast, setToast] = useState<string | null>(null);

  const total = HOTELS.length;
  const active = HOTELS.filter((h) => h.status === "Active").length;
  const inactive = HOTELS.filter((h) => h.status === "Inactive").length;
  const connIssues = HOTELS.filter((h) => h.status !== "Inactive" && (h.whatsapp !== "Connected" || h.pms !== "Connected")).length;
  const needsAttention = inactive + connIssues;
  const scored = HOTELS.filter((h) => h.healthScore !== null);
  const avgHealth = scored.length ? Math.round(scored.reduce((n, h) => n + (h.healthScore ?? 0), 0) / scored.length) : 0;

  const KPIS = [
    { label: "Total Hotels", icon: Building2, value: total, foot: `Across ${REGIONS.length} regions` },
    { label: "Needs Attention", icon: AlertTriangle, value: needsAttention, foot: `${inactive} inactive · ${connIssues} connection issue${connIssues === 1 ? "" : "s"}` },
    { label: "Active Hotels", icon: CheckCircle2, value: active, foot: `${Math.round((active / total) * 100)}% of the network` },
    { label: "Avg Health Score", icon: Activity, value: `${avgHealth}%`, foot: `Across ${scored.length} scored hotels` },
  ];

  useEffect(() => {
    const created = params.get("created");
    if (!created) return;
    const email = params.get("email");
    setToast(email ? `"${created}" was created — setup link sent to ${email}.` : `"${created}" was created — connect its systems whenever you're ready.`);
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

        <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {KPIS.map((k) => (
            <StatCard key={k.label} icon={k.icon} label={k.label} value={k.value} foot={k.foot} />
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="flex h-10 shrink-0 items-center gap-1 rounded-control border border-line bg-white p-1">
            {TABS.map((t) => {
              const count = t === "All" ? HOTELS.length : HOTELS.filter((h) => h.status === t).length;
              const on = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex h-full items-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors ${on ? "bg-brand-tint text-brand" : "text-ink-secondary hover:bg-subtle hover:text-ink"}`}
                >
                  {t}
                  <span className={`text-[11px] ${on ? "text-brand/70" : "text-ink-tertiary"}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full max-w-xs shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hotels…"
              className="h-10 w-full rounded-control border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-44 shrink-0">
              <Select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
                <option value="all">All Regions</option>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </Select>
            </div>
          </div>
        </div>

        <Card table className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] table-fixed text-left">
              <colgroup>
                <col />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[130px]" />
                <col className="w-[130px]" />
                <col className="w-[150px]" />
                <col className="w-[56px]" />
              </colgroup>
              <thead>
                <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                  <th className="py-3.5 pl-6 font-medium">Hotel</th>
                  <th className="py-3.5 pl-6 font-medium">Status</th>
                  <th className="py-3.5 pl-6 font-medium">WhatsApp</th>
                  <th className="py-3.5 pl-6 font-medium">PMS</th>
                  <th className="py-3.5 pl-6 font-medium">Last Sync</th>
                  <th className="py-3.5 pl-6 font-medium">Health Score</th>
                  <th className="py-3.5 pl-6 font-medium">Onboarding Date</th>
                  <th className="py-3.5 pr-6" />
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <tr key={h.id} onClick={() => navigate(`/admin/hotels/${h.id}`)} className={`cursor-pointer border-b border-line/50 last:border-0 hover:bg-subtle/60 ${h.disabled ? "bg-[#F6F6F7] text-ink-tertiary" : ""}`}>
                    <td className="py-3.5 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand"><Building2 className="h-4 w-4" /></span>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-ink">{h.name}</div>
                          <div className="truncate text-[12px] text-ink-tertiary">{h.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pl-6 pr-3"><span className={`text-[13px] font-medium ${h.disabled ? "text-ink-tertiary" : STATUS_TONE[h.status]}`}>{h.disabled ? "Disabled" : h.status}</span></td>
                    <td className="py-3.5 pl-6 pr-3"><ConnIcon status={h.whatsapp} /></td>
                    <td className="py-3.5 pl-6 pr-3"><ConnIcon status={h.pms} /></td>
                    <td className="py-3.5 pl-6 pr-3 text-[13px] text-ink-secondary">{h.lastSync}</td>
                    <td className="py-3.5 pl-6 pr-3">
                      {h.healthScore === null ? (
                        <span className="text-[13px] text-ink-tertiary">—</span>
                      ) : (
                        <div className="w-24">
                          <div className="text-[13px] font-semibold text-ink">{h.healthScore}%</div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-green-500" style={{ width: `${h.healthScore}%` }} /></div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 pl-6 pr-3 text-[13px] text-ink-secondary">{h.onboarded}</td>
                    <td className="py-3.5 pr-6 text-right">
                      <button aria-label={`Actions for ${h.name}`} className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
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
            <CheckCircle2 className="h-4 w-4 text-green-400" /> {toast}
          </span>
        </div>
      )}
    </>
  );
}
