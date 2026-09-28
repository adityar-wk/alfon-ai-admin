import { Link } from "react-router-dom";
import { MessageSquare, CheckCircle2, UserCheck, Coins, ChevronRight } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card } from "../../components/ui";
import { HOTELS, aiNetworkStats } from "../../data/hotels";

const TREND = [78, 81, 83, 85, 87, 88]; // network resolution rate, last 6 weeks

const ESCALATION_REASONS = [
  { label: "Guest asked to speak with a person", pct: 32 },
  { label: "Sensitive, medical or safety matter", pct: 24 },
  { label: "AI wasn't confident enough in its answer", pct: 21 },
  { label: "Guest sounded upset or distressed", pct: 14 },
  { label: "Not enough information in the hotel's files", pct: 9 },
];

export default function AiAnalytics() {
  const net = aiNetworkStats();
  const rows = [...HOTELS].sort((a, b) => b.aiQueries - a.aiQueries);
  const maxQueries = Math.max(...HOTELS.map((h) => h.aiQueries), 1);

  return (
    <>
      <Topbar title="AI Analytics" hideQuickActions />
      <Page>
        <h2 className="font-display text-[26px] font-bold leading-tight text-ink">AI Analytics</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-secondary">
          Queries, consumption and performance for the AI across every hotel — {net.hotelsLive} of {HOTELS.length} hotels have live traffic this period.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-tint text-brand"><MessageSquare className="h-[18px] w-[18px]" /></span>
            <div className="mt-3 text-[13px] text-ink-secondary">Total AI Queries</div>
            <div className="text-[26px] font-bold leading-tight text-ink">{net.queries.toLocaleString()}</div>
            <div className="text-[12px] text-ink-tertiary">Across the network this period</div>
          </Card>
          <Card className="p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-[18px] w-[18px]" /></span>
            <div className="mt-3 text-[13px] text-ink-secondary">AI Resolution Rate</div>
            <div className="text-[26px] font-bold leading-tight text-ink">{net.resolvedPct}%</div>
            <div className="text-[12px] text-ink-tertiary">Answered without a person</div>
          </Card>
          <Card className="p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600"><UserCheck className="h-[18px] w-[18px]" /></span>
            <div className="mt-3 text-[13px] text-ink-secondary">Avg Confidence Score</div>
            <div className="text-[26px] font-bold leading-tight text-ink">{net.confidence}%</div>
            <div className="text-[12px] text-ink-tertiary">Weighted by query volume</div>
          </Card>
          <Card className="p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Coins className="h-[18px] w-[18px]" /></span>
            <div className="mt-3 text-[13px] text-ink-secondary">Estimated AI Cost</div>
            <div className="text-[26px] font-bold leading-tight text-ink">${net.cost.toLocaleString()}</div>
            <div className="text-[12px] text-ink-tertiary">Usage this period, in USD</div>
          </Card>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          <Card table className="overflow-hidden">
            <div className="px-6 py-4"><h3 className="text-[15px] font-semibold text-ink">Queries per Hotel</h3></div>
            <div className="overflow-x-auto border-t border-line">
              <table className="w-full min-w-[720px] table-fixed text-left">
                <thead>
                  <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                    <th className="py-3.5 pl-6 font-medium">Hotel</th>
                    <th className="py-3.5 pl-6 font-medium">Queries</th>
                    <th className="py-3.5 pl-6 font-medium">AI Resolved</th>
                    <th className="py-3.5 pl-6 font-medium">Escalated</th>
                    <th className="py-3.5 pl-6 font-medium">Confidence</th>
                    <th className="py-3.5 pl-6 pr-6 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h) => (
                    <tr key={h.id} className="border-b border-line/50 last:border-0">
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="text-[13px] font-semibold text-ink">{h.name}</div>
                        <div className="mt-1 h-1 w-28 overflow-hidden rounded-full bg-subtle">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${(h.aiQueries / maxQueries) * 100}%` }} />
                        </div>
                      </td>
                      {h.aiQueries ? (
                        <>
                          <td className="py-3.5 pl-6 pr-3 text-[14px] font-medium text-ink">{h.aiQueries.toLocaleString()}</td>
                          <td className="py-3.5 pl-6 pr-3 text-[13px] text-emerald-600">{h.aiResolvedPct}%</td>
                          <td className="py-3.5 pl-6 pr-3 text-[13px] text-ink-secondary">{100 - h.aiResolvedPct}%</td>
                          <td className="py-3.5 pl-6 pr-3 text-[13px] text-ink-secondary">{h.avgConfidence}%</td>
                          <td className="py-3.5 pl-6 pr-6 text-[13px] text-ink-secondary">${h.aiCostUsd}</td>
                        </>
                      ) : (
                        <td colSpan={5} className="py-3.5 pl-6 pr-6 text-[13px] text-ink-tertiary">{h.status === "Inactive" ? "Deactivated — no traffic" : "Not live yet"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <h3 className="text-[14px] font-semibold text-ink">Resolution Rate — last 6 weeks</h3>
              <div className="mt-4 flex h-24 items-end gap-2">
                {TREND.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-full w-full items-end overflow-hidden rounded-md bg-subtle">
                      <div className="w-full rounded-md bg-brand" style={{ height: `${v}%` }} />
                    </div>
                    <span className="text-[10px] text-ink-tertiary">W{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px]">
                <span className="text-ink-tertiary">6 weeks ago</span>
                <span className="font-semibold text-emerald-600">{TREND[TREND.length - 1]}% now</span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-[14px] font-semibold text-ink">Why a person took over</h3>
              <p className="mt-1 text-[12px] text-ink-tertiary">Reasons the AI handed a conversation to hotel staff.</p>
              <div className="mt-3 space-y-3">
                {ESCALATION_REASONS.map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-[12px]"><span className="text-ink-secondary">{r.label}</span><span className="font-semibold text-ink">{r.pct}%</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-brand" style={{ width: `${r.pct}%` }} /></div>
                  </div>
                ))}
              </div>
              <Link to="/admin/ai-controls" className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-brand">
                Adjust the confidence threshold <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </div>
      </Page>
    </>
  );
}
