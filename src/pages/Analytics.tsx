import { pastel, PASTEL, TAGS } from "../data/pastel";
import { useEffect, useMemo, useState } from "react";
import { ListChecks, CheckCircle2, AlertTriangle, Timer, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Download, Filter, CalendarDays, X } from "lucide-react";
import { Field, Input, Select } from "../components/ui";
import { Topbar } from "../components/Topbar";
import { Page, Card } from "../components/ui";
import { Donut } from "../components/Donut";
import { Flag } from "../components/Flag";
import { usePersona, canonDept } from "../persona";
import { ScopePicker } from "../components/ScopePicker";

/* ---------- range ---------- */

type RangeKey = "week" | "month" | "custom";
const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// soft pastel palette for the charts
const ramp = (n: number) => pastel(n);

/* ---------- data ---------- */

export const DEPTS: { name: string; tasks: number; items: [string, number][] }[] = [
  { name: "Front Desk", tasks: 691, items: [["Loyalty program inquiries", 312], ["Late checkout", 189], ["Room change", 67], ["Document request", 45], ["Wake-up call", 38], ["Lost & found", 22], ["Other", 18]] },
  { name: "Guest Services", tasks: 590, items: [["Guest complaints", 180], ["Special occasions", 120], ["Information requests", 110], ["Local recommendations", 90], ["Feedback follow-up", 60], ["Other", 30]] },
  { name: "Concierge", tasks: 477, items: [["Airport transfer", 128], ["Restaurant booking", 104], ["Tours & tickets", 92], ["Taxi request", 54], ["Spa appointment", 72], ["Other", 27]] },
  { name: "Food and Beverage", tasks: 686, items: [["Restaurant reservation", 210], ["Dietary requests", 130], ["Event catering", 110], ["Bar service", 96], ["Breakfast changes", 90], ["Other", 50]] },
  { name: "Housekeeping", tasks: 1281, items: [["Extra towels", 340], ["Room cleaning", 310], ["Turndown service", 210], ["Linen change", 170], ["Toiletries", 130], ["Deep clean", 80], ["Other", 41]] },
  { name: "Laundry", tasks: 481, items: [["Express laundry", 170], ["Dry cleaning", 140], ["Pressing", 90], ["Stain treatment", 51], ["Other", 30]] },
  { name: "Engineering", tasks: 426, items: [["AC / heating", 130], ["Plumbing", 96], ["Electrical", 80], ["TV / Wi-Fi", 60], ["Furniture repair", 40], ["Other", 20]] },
  { name: "Room Service", tasks: 802, items: [["In-room dining", 360], ["Minibar refill", 180], ["Water / beverages", 112], ["Tray collection", 90], ["Other", 60]] },
  { name: "Security", tasks: 248, items: [["Safe assistance", 90], ["Access / key issues", 70], ["Noise complaints", 48], ["Incident reports", 25], ["Other", 15]] },
  { name: "IT", tasks: 331, items: [["Wi-Fi support", 140], ["TV casting", 90], ["Device charging", 60], ["Printing", 25], ["Other", 16]] },
  { name: "Operator", tasks: 87, items: [["Call transfers", 40], ["Wake-up calls", 30], ["Message relay", 17]] },
  { name: "Reservation", tasks: 536, items: [["Booking changes", 200], ["Cancellations", 110], ["Group bookings", 90], ["Rate inquiries", 86], ["Other", 50]] },
];

// per-department quality metrics: completion %, overdue tasks, avg response, change vs last period (%)
export const METRICS: Record<string, { done: number; overdue: number; resp: string; delta: number }> = {
  "Front Desk": { done: 95, overdue: 20, resp: "2m 05s", delta: 6 },
  "Guest Services": { done: 93, overdue: 24, resp: "3m 15s", delta: 12 },
  Concierge: { done: 96, overdue: 12, resp: "2m 40s", delta: 4 },
  "Food and Beverage": { done: 92, overdue: 31, resp: "3m 50s", delta: -3 },
  Housekeeping: { done: 94, overdue: 52, resp: "3m 10s", delta: 18 },
  Laundry: { done: 97, overdue: 9, resp: "4m 20s", delta: 2 },
  Engineering: { done: 91, overdue: 24, resp: "4m 30s", delta: -5 },
  "Room Service": { done: 95, overdue: 31, resp: "2m 40s", delta: 9 },
  Security: { done: 98, overdue: 3, resp: "1m 45s", delta: 1 },
  IT: { done: 93, overdue: 14, resp: "3m 30s", delta: -8 },
  Operator: { done: 99, overdue: 1, resp: "0m 50s", delta: 0 },
  Reservation: { done: 94, overdue: 17, resp: "2m 55s", delta: 7 },
};

// complaints: [label, count, change vs last period (%), where it happened (department → weight)]
export const COMPLAINT_DETAIL: Record<string, { delta: number; by: [string, number][] }> = {
  "Room Move": { delta: 14, by: [["Front Desk", 40], ["Housekeeping", 15], ["Guest Services", 12]] },
  "AC Not Working": { delta: -6, by: [["Engineering", 26], ["Guest Services", 5]] },
  "Elevator Issues": { delta: 0, by: [["Engineering", 12], ["Security", 6]] },
  "Restaurant Unavailability": { delta: 22, by: [["Food and Beverage", 9], ["Concierge", 5]] },
  "Noise Disturbance": { delta: -10, by: [["Security", 7], ["Front Desk", 4]] },
  "Housekeeping Delay": { delta: 8, by: [["Housekeeping", 9]] },
};

const REQUEST_DELTA: Record<string, number> = {
  "Extra Towels": 5, "Late Checkout": 11, "Airport Transfer": -2, "Water / Minibar Refill": 3, "Room Service Order": 8,
  "Shampoo / Toiletries": -4, "Spa Appointment": 15, "Restaurant Reservation": 0, "Wake-up Call": -7, "Taxi Request": 2,
};

const COMPLAINTS: [string, number][] = [
  ["Room Move", 67], ["AC Not Working", 31], ["Elevator Issues", 18], ["Restaurant Unavailability", 14], ["Noise Disturbance", 11], ["Housekeeping Delay", 9],
];

const REQUESTS: [string, number][] = [
  ["Extra Towels", 156], ["Late Checkout", 134], ["Airport Transfer", 128], ["Water / Minibar Refill", 112], ["Room Service Order", 98],
  ["Shampoo / Toiletries", 87], ["Spa Appointment", 72], ["Restaurant Reservation", 68], ["Wake-up Call", 61], ["Taxi Request", 54],
];

const SATISFACTION = [4.3, 4.45, 4.2, 4.6, 4.55, 4.75];

const HEAT_DEPTS = ["Front Desk", "Concierge", "Housekeeping", "Food & Bev", "Engineering", "Guest Rel."];
// deterministic 0..1 intensity per dept/hour
const heat = (d: number, h: number) => {
  const base = [[9, 15], [10, 18], [9, 17], [8, 13, 19], [10, 14], [10, 15]][d % 6];
  const peaks = base.map((p) => p + Math.floor(d / 6));
  if (h < 5) return 0.03 + (d === 0 && h === 0 ? 0.12 : 0);
  const near = Math.max(...peaks.map((p) => 1 - Math.min(Math.abs(h - p), 4) / 4));
  const wobble = ((h * 7 + d * 13) % 5) / 25;
  return Math.min(1, 0.12 + near * 0.72 + wobble);
};

const NATIONS: { country: string; label: string; pct: number }[] = [
  { country: "United Kingdom", label: "UK", pct: 28 },
  { country: "United States", label: "US", pct: 24 },
  { country: "France", label: "France", pct: 18 },
  { country: "UAE", label: "UAE", pct: 16 },
  { country: "India", label: "India", pct: 8 },
  { country: "Other", label: "Other", pct: 6 },
];

const LANGS: [string, number][] = [["English", 68], ["Arabic", 15], ["French", 10], ["Hindi", 4], ["Other", 3]];

/* ---------- page ---------- */

const HEAT_INDEX: Record<string, number> = { "Front Desk": 0, Concierge: 1, Housekeeping: 2, "Food & Beverage": 3, Engineering: 4, "Guest Services": 5 };

export default function Analytics() {
  const { manager, scopeDepts } = usePersona();
  const [range, setRange] = useState<RangeKey>("week");
  const [offset, setOffset] = useState(0); // weeks back from the current week
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [from, setFrom] = useState("2026-05-01");
  const [to, setTo] = useState("2026-05-15");
  const [breakdown, setBreakdown] = useState<{ title: string; items: [string, number][]; total: number } | null>(null);
  const [sortBy, setSortBy] = useState<"n" | "done" | "overdue" | "delta">("n");
  const [toast, setToast] = useState<string | null>(null);

  const days = Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1);
  const factor = range === "week" ? Math.max(0.5, 1 - 0.06 * offset) : range === "month" ? 4.3 : days / 7;
  const scale = (n: number) => Math.round(n * factor);
  const weekStart = new Date(2026, 4, 3 - 7 * offset);
  const weekEnd = new Date(2026, 4, 9 - 7 * offset);
  const short = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const label =
    range === "week"
      ? `${short(weekStart)} – ${short(weekEnd)}, ${weekEnd.getFullYear()}`
      : range === "month"
        ? "May 1 – May 31, 2026"
        : `${fmtDate(from)} – ${fmtDate(to)}`;
  const period = range === "week" ? (offset === 0 ? "This Week" : offset === 1 ? "Last Week" : "Earlier week") : range === "month" ? "This Month" : "Custom";
  const activeFilters = range === "week" && offset === 0 ? 0 : 1;
  const pickPeriod = (v: string) => {
    if (v === "This Week") { setRange("week"); setOffset(0); }
    else if (v === "Last Week") { setRange("week"); setOffset(1); }
    else if (v === "This Month") setRange("month");
    else if (v === "Custom") setRange("custom");
  };
  const step = (dir: -1 | 1) => {
    if (range !== "week") { setRange("week"); setOffset(dir === -1 ? 1 : 0); return; }
    setOffset((o) => Math.max(0, Math.min(8, o - dir)));
  };

  const depts = useMemo(() => DEPTS.map((d) => ({ ...d, n: scale(d.tasks) })), [factor]);
  const mine = DEPTS.filter((d) => scopeDepts.includes(canonDept(d.name)));
  const secs = (t: string) => { const m = t.match(/(\d+)m (\d+)s/); return m ? Number(m[1]) * 60 + Number(m[2]) : 0; };
  const fmtSecs = (n: number) => `${Math.floor(n / 60)}m ${String(Math.round(n % 60)).padStart(2, "0")}s`;
  const total = manager ? mine.reduce((a, d) => a + scale(d.tasks), 0) : scale(2847);
  const completed = manager ? mine.reduce((a, d) => a + Math.round(scale(d.tasks) * METRICS[d.name].done / 100), 0) : scale(2651);
  const overdue = manager ? mine.reduce((a, d) => a + scale(METRICS[d.name].overdue), 0) : scale(196);
  const avgResp = manager ? fmtSecs(mine.reduce((a, d) => a + secs(METRICS[d.name].resp), 0) / Math.max(mine.length, 1)) : "2m 45s";
  const sorted = [...depts].sort((a, b) => b.n - a.n);
  const maxDept = sorted[0].n;
  // each department keeps the same colour everywhere
  const deptIdx = (name: string) => Math.max(0, DEPTS.findIndex((x) => x.name === name)) % TAGS.length;
  const deptColors = sorted.map((d) => TAGS[deptIdx(d.name)].mid);

  const kpis = [
    { label: "Total Tasks", value: total.toLocaleString(), delta: "16% vs last period", up: true, icon: ListChecks, chip: "bg-sky-100 text-sky-700" },
    { label: "Completed", value: completed.toLocaleString(), delta: "18% vs last period", up: true, icon: CheckCircle2, chip: "bg-emerald-100 text-emerald-700" },
    { label: "Overdue", value: overdue.toLocaleString(), delta: "8% vs last period", up: false, icon: AlertTriangle, chip: "bg-rose-100 text-rose-600" },
    { label: "Avg Response", value: avgResp, delta: "12% vs last period", up: false, icon: Timer, chip: "bg-violet-100 text-violet-700" },
  ];

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  const exportData = () => {
    const rows = [["Department", "Tasks", "Period"], ...depts.map((d) => [d.name, String(d.n), label])];
    const blob = new Blob([rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "alfon-analytics.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    flash("Analytics exported");
  };

  const complaintTotal = COMPLAINTS.reduce((a, [, v]) => a + v, 0);
  const requestTotal = REQUESTS.reduce((a, [, v]) => a + v, 0);
  const rows = depts
    .map((d) => ({ ...d, m: METRICS[d.name] }))
    .sort((a, b) =>
      sortBy === "n" ? b.n - a.n : sortBy === "done" ? b.m.done - a.m.done : sortBy === "overdue" ? b.m.overdue - a.m.overdue : b.m.delta - a.m.delta,
    );

  return (
    <>
      <Topbar title="Analytics" actions={manager ? <ScopePicker /> : undefined} />
      <Page>
        {/* date range + export + filter, one line */}
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-line bg-white p-1">
            <button onClick={() => step(-1)} aria-label="Previous period" className="rounded-md p-1.5 text-ink-secondary hover:bg-subtle">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex min-w-[200px] items-center justify-center gap-2 px-2 text-[13px] font-semibold text-ink">
              <CalendarDays className="h-4 w-4 text-ink-tertiary" /> {label}
            </span>
            <button onClick={() => step(1)} disabled={range === "week" && offset === 0} aria-label="Next period" className="rounded-md p-1.5 text-ink-secondary hover:bg-subtle disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => pickPeriod("This Week")} className="text-[13px] font-medium text-brand">
              Back to this week
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <button onClick={exportData} className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3.5 text-[13px] font-semibold text-ink hover:bg-subtle">
              <Download className="h-4 w-4" /> Export Data
            </button>
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              aria-label="Filters"
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${
                filtersOpen || activeFilters ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="absolute right-0 top-12 z-20 w-[290px] space-y-3 rounded-xl border border-line bg-white p-4 shadow-lg">
              <Field label="Period">
                <Select value={period} onChange={(e) => pickPeriod(e.target.value)}>
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                  <option>Custom</option>
                  {period === "Earlier week" && <option>Earlier week</option>}
                </Select>
              </Field>
              {range === "custom" && (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="From"><Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></Field>
                  <Field label="To"><Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></Field>
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={() => setFiltersOpen(false)} className="text-[13px] font-semibold text-brand">Done</button>
              </div>
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="p-5">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.chip}`}>
                <k.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="mt-3 text-[13px] text-ink-secondary">{k.label}</div>
              <div className="text-[28px] font-bold leading-tight text-ink">{k.value}</div>
              <div className="mt-1 flex items-center gap-1 text-[12px] font-medium text-ink-secondary">
                {k.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} {k.delta}
              </div>
            </Card>
          ))}
        </div>

        {manager ? (
          <>
            {/* department breakdown */}
            <h3 className="mb-3 mt-7 text-[15px] font-semibold text-ink">Task breakdown</h3>
            <div className={`grid grid-cols-1 gap-4 ${mine.length > 1 ? "lg:grid-cols-2" : ""}`}>
              {mine.map((d) => {
                const n = scale(d.tasks);
                const wsum = d.items.reduce((x, [, w]) => x + w, 0);
                const items = d.items.map(([l, w]) => [l, Math.round((n * w) / wsum)] as [string, number]);
                const colors = ramp(items.length);
                const m = METRICS[d.name];
                return (
                  <Card key={d.name} className="p-6">
                    <div className="flex items-baseline justify-between">
                      <h4 className="text-[14px] font-semibold text-ink">{d.name}</h4>
                      <span className="text-[12px] text-ink-tertiary">{m.done}% completed · {m.resp} avg response · <Delta v={m.delta} /></span>
                    </div>
                    <div className="mt-4 grid grid-cols-1 items-center gap-5 sm:grid-cols-[170px_1fr]">
                      <div className="relative flex justify-center">
                        <Donut size={160} thickness={26} segments={items.map(([l, v], i) => ({ label: l, value: v, color: colors[i] }))} />
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[20px] font-bold leading-none text-ink">{n.toLocaleString()}</span>
                          <span className="mt-1 text-[11px] text-ink-tertiary">tasks</span>
                        </div>
                      </div>
                      <div>
                        {items.map(([l, v], i) => (
                          <div key={l} className="flex items-center gap-2.5 border-b border-line/70 py-1.5 text-[13px] last:border-0">
                            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[i] }} />
                            <span className="flex-1 text-ink">{l}</span>
                            <span className="text-ink">{v.toLocaleString()}</span>
                            <span className="w-9 text-right text-[12px] text-ink-tertiary">{Math.round((v / n) * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-[15px] font-semibold text-ink">Recurring complaints</h3>
                <p className="text-[12px] text-ink-tertiary">Complaint categories involving your department</p>
                <div className="mt-3 divide-y divide-line/70">
                  {Object.entries(COMPLAINT_DETAIL)
                    .map(([name, c]) => ({ name, c, v: c.by.filter(([d]) => scopeDepts.includes(canonDept(d))).reduce((a, [, x]) => a + x, 0) }))
                    .filter((x) => x.v > 0)
                    .sort((a, b) => b.v - a.v)
                    .map(({ name, c, v }) => (
                      <div key={name} className="grid grid-cols-[1fr_44px_70px] items-center gap-3 py-3 text-[13px]">
                        <span className="truncate text-ink">{name}</span>
                        <span className="text-right font-bold text-ink">{scale(v)}</span>
                        <span className="text-right"><Delta v={c.delta} badWhenUp /></span>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-[15px] font-semibold text-ink">Top requests</h3>
                <div className="mt-3 divide-y divide-line/70">
                  {(() => {
                    const all = mine.flatMap((d) => d.items.filter(([l]) => l !== "Other").map(([l, v]) => [l, scale(v)] as [string, number])).sort((a, b) => b[1] - a[1]).slice(0, 8);
                    const sum = all.reduce((a, [, v]) => a + v, 0);
                    return all.map(([l, v], i) => (
                      <div key={l} className="grid grid-cols-[18px_1fr_44px_46px] items-center gap-3 py-2.5 text-[13px]">
                        <span className="text-[11px] text-ink-tertiary">{i + 1}</span>
                        <span className="truncate text-ink">{l}</span>
                        <span className="text-right font-bold text-ink">{v}</span>
                        <span className="text-right text-ink-secondary">{Math.round((v / sum) * 100)}%</span>
                      </div>
                    ));
                  })()}
                </div>
              </Card>
            </div>

            <Card className="mt-4 p-6">
              <h3 className="text-[15px] font-semibold text-ink">Guest satisfaction — {scopeDepts.join(" + ")} requests</h3>
              <SatisfactionChart values={SATISFACTION} />
            </Card>
          </>
        ) : (
          <>
        {/* tasks by department */}
        <div className="mb-3 mt-7 flex items-baseline justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Tasks by Department</h3>
          <span className="text-[12px] text-ink-tertiary">Use View more for a department's task breakdown</span>
        </div>
        <Card table className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[720px] text-left">
              <thead>
                <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                  <th className="py-3.5 pl-6 font-medium">Department</th>
                  <SortTh label="Tasks" k="n" cur={sortBy} set={setSortBy} />
                  <SortTh label="Completed" k="done" cur={sortBy} set={setSortBy} />
                  <SortTh label="Overdue" k="overdue" cur={sortBy} set={setSortBy} />
                  <th className="py-3.5 pl-6 font-medium">Avg response</th>
                  <SortTh label="vs last period" k="delta" cur={sortBy} set={setSortBy} />
                  <th className="w-24 py-3.5 pr-6" />
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.name} className="border-b border-line/50 last:border-0">
                    <td className="py-3.5 pl-6 pr-3"><span className={`inline-flex rounded-md px-2.5 py-1 text-[12px] font-semibold ${TAGS[deptIdx(d.name)].pill}`}>{d.name}</span></td>
                    <td className="text-[14px] font-bold text-ink py-3.5 pl-6 pr-3">{d.n.toLocaleString()}</td>
                    <td className="text-[14px] text-ink-secondary py-3.5 pl-6 pr-3">{d.m.done}%</td>
                    <td className={`py-3 text-[13px] ${d.m.overdue / d.tasks > 0.04 ? "font-semibold text-rose-500" : "text-ink-secondary"}`}>{scale(d.m.overdue)}</td>
                    <td className="text-[14px] text-ink-secondary py-3.5 pl-6 pr-3">{d.m.resp}</td>
                    <td className="text-[14px] py-3.5 pl-6 pr-3"><Delta v={d.m.delta} /></td>
                    <td className="text-right py-3.5 pr-6">
                      <button onClick={() => setBreakdown({ title: `${d.name} — Task Breakdown`, items: d.items, total: d.n })} className="whitespace-nowrap text-[12px] font-semibold text-brand hover:underline">
                        View more
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* complaints + comparison */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Complaint Insights</h3>
            <div className="mt-3 divide-y divide-line/70">
              {COMPLAINTS.map(([name, v]) => {
                const det = COMPLAINT_DETAIL[name];
                const n = scale(v);
                return (
                  <div key={name} className="grid w-full grid-cols-[1fr_44px_46px_70px] items-center gap-3 py-3 text-left text-[13px]">
                    <span className="truncate text-ink">{name}</span>
                    <span className="text-right font-bold text-ink">{n}</span>
                    <span className="text-right text-ink-secondary">{Math.round((v / complaintTotal) * 100)}%</span>
                    <span className="text-right"><Delta v={det.delta} badWhenUp /></span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Department Comparison</h3>
            <div className="mt-4 flex justify-center">
              <Donut size={190} thickness={34} segments={sorted.map((d, i) => ({ label: d.name, value: d.n, color: deptColors[i] }))} />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[12px] text-ink-secondary">
              {sorted.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: deptColors[i] }} />
                  {d.name} <b className="text-ink">{d.n.toLocaleString()}</b>
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* satisfaction + top requests */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Guest Satisfaction Trend</h3>
            <SatisfactionChart values={SATISFACTION} />
          </Card>

          <Card className="p-6">
            <h3 className="text-[15px] font-semibold text-ink">Top Requests</h3>
            <div className="mt-3 divide-y divide-line/70">
              {REQUESTS.map(([name, v], i) => (
                <div key={name} className="grid grid-cols-[18px_1fr_44px_46px_70px] items-center gap-3 py-2.5 text-[13px]">
                  <span className="text-[11px] text-ink-tertiary">{i + 1}</span>
                  <span className="truncate text-ink">{name}</span>
                  <span className="text-right font-bold text-ink">{scale(v)}</span>
                  <span className="text-right text-ink-secondary">{Math.round((v / requestTotal) * 100)}%</span>
                  <span className="text-right"><Delta v={REQUEST_DELTA[name] ?? 0} /></span>
                </div>
              ))}
            </div>
          </Card>
        </div>

          </>
        )}

        {/* peak hours */}
        <Card className="mt-4 p-6">
          <h3 className="text-[15px] font-semibold text-ink">Peak Hours by Department</h3>
          <p className="text-[12px] text-ink-tertiary">Request volume per hour — darker = higher demand</p>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="ml-[156px] grid grid-cols-24 text-[10px] text-ink-tertiary" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
                {Array.from({ length: 24 }, (_, h) => (
                  <span key={h}>{h % 3 === 0 ? (h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`) : ""}</span>
                ))}
              </div>
              {(manager ? scopeDepts.map((n) => [n, Math.max(0, DEPTS.findIndex((x) => x.name === n))] as [string, number]) : DEPTS.map((x, i) => [x.name, i] as [string, number])).map(([name, d]) => (
                <div key={name} className="mt-1.5 flex items-center gap-3">
                  <span className="w-36 shrink-0 truncate text-[12px] text-ink-secondary">{name}</span>
                  <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
                    {Array.from({ length: 24 }, (_, h) => {
                      const v = heat(d, h);
                      return (
                        <span
                          key={h}
                          title={`${name} · ${h}:00 — ${Math.round(v * 100)}% of peak`}
                          className="h-7 rounded"
                          style={{ background: `rgba(120,150,235,${0.08 + v * 0.62})` }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-ink-tertiary">
                Low
                {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                  <span key={v} className="h-3.5 w-3.5 rounded" style={{ background: `rgba(120,150,235,${0.08 + v * 0.62})` }} />
                ))}
                High
              </div>
            </div>
          </div>
        </Card>

        {!manager && (
          <>
        {/* guest insights */}
        <h3 className="mb-3 mt-7 text-[15px] font-semibold text-ink">Guest Insights</h3>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <h4 className="text-[14px] font-semibold text-ink">By Nationality</h4>
            <div className="mt-4 space-y-4">
              {NATIONS.map((n, ni) => (
                <div key={n.label} className="grid grid-cols-[24px_52px_1fr_36px] items-center gap-3 text-[13px]">
                  {n.country === "Other" ? <span className="h-3.5 w-5 rounded-[3px] bg-gray-200" /> : <Flag country={n.country} />}
                  <span className="text-ink">{n.label}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-subtle">
                    <span className="block h-full rounded-full" style={{ width: `${(n.pct / 28) * 100}%`, background: PASTEL[(ni + 1) % PASTEL.length] }} />
                  </span>
                  <span className="text-right text-ink-secondary">{n.pct}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-[14px] font-semibold text-ink">Communication Language</h4>
            <div className="mt-4 flex justify-center">
              <Donut size={170} thickness={26} segments={LANGS.map(([l, v], i) => ({ label: l, value: v, color: ramp(LANGS.length)[i] }))} />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[12px] text-ink-secondary">
              {LANGS.map(([l, v], i) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: ramp(LANGS.length)[i] }} />
                  {l} {v}%
                </span>
              ))}
            </div>
          </Card>
        </div>
          </>
        )}
      </Page>

      {breakdown && <BreakdownModal {...breakdown} onClose={() => setBreakdown(null)} />}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </>
  );
}

/* ---------- department breakdown modal ---------- */

function BreakdownModal({ title, items: raw, total, onClose }: { title: string; items: [string, number][]; total: number; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const weightSum = raw.reduce((s, [, w]) => s + w, 0);
  const items = raw.map(([label, w]) => [label, Math.round((total * w) / weightSum)] as [string, number]);
  const colors = ramp(items.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" className="w-full max-w-[680px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 items-center gap-6 p-6 sm:grid-cols-[200px_1fr]">
          <div className="relative flex justify-center">
            <Donut size={190} thickness={30} segments={items.map(([l, v], i) => ({ label: l, value: v, color: colors[i] }))} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-bold leading-none text-ink">{total.toLocaleString()}</span>
              <span className="mt-1 text-[11px] text-ink-tertiary">total</span>
            </div>
          </div>
          <div>
            {items.map(([l, v], i) => (
              <div key={l} className="flex items-center gap-2.5 border-b border-line/70 py-2 text-[13px] last:border-0">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: colors[i] }} />
                <span className="flex-1 text-ink">{l}</span>
                <span className="text-ink">{v.toLocaleString()}</span>
                <span className="w-10 text-right text-[12px] text-ink-tertiary">{Math.round((v / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SortTh({ label, k, cur, set }: { label: string; k: "n" | "done" | "overdue" | "delta"; cur: string; set: (k: "n" | "done" | "overdue" | "delta") => void }) {
  return (
    <th className="py-3 font-medium">
      <button onClick={() => set(k)} className={`flex items-center gap-1 uppercase tracking-wide ${cur === k ? "text-brand" : "hover:text-ink"}`}>
        {label} {cur === k && <ArrowDown className="h-3 w-3" />}
      </button>
    </th>
  );
}

/** change vs last period; for complaints, an increase is the bad direction */
function Delta({ v, badWhenUp = false }: { v: number; badWhenUp?: boolean }) {
  if (v === 0) return <span className="text-ink-tertiary">—</span>;
  const up = v > 0;
  const bad = badWhenUp ? up : false;
  const good = badWhenUp ? !up : false;
  return (
    <span className={`inline-flex items-center gap-0.5 ${bad ? "font-medium text-rose-500" : good ? "font-medium text-emerald-600" : "text-ink-secondary"}`}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(v)}%
    </span>
  );
}

/* ---------- satisfaction line chart ---------- */

function SatisfactionChart({ values }: { values: number[] }) {
  const W = 560, H = 250, L = 34, R = 10, T = 12, B = 26;
  const min = 3.5, max = 5;
  const x = (i: number) => L + (i * (W - L - R)) / (values.length - 1);
  const y = (v: number) => T + ((max - v) / (max - min)) * (H - T - B);
  const pts = values.map((v, i) => [x(i), y(v)] as const);

  // smooth curve (Catmull-Rom → cubic Bézier)
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  const area = `${d} L${x(values.length - 1)},${H - B} L${x(0)},${H - B} Z`;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full">
      <defs>
        <linearGradient id="satFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#8DB7F0" stopOpacity="0.28" />
          <stop offset="1" stopColor="#8DB7F0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[5, 4.5, 4, 3.5].map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#F0F0F0" />
          <text x={L - 8} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#9CA3AF">{t}</text>
        </g>
      ))}
      <path d={area} fill="url(#satFill)" />
      <path d={d} fill="none" stroke="#7FA8E0" strokeWidth="2.5" strokeLinecap="round" />
      {pts.map(([px, py], i) => (
        <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <text x={px} y={H - 8} textAnchor="middle" fontSize="10" fill="#9CA3AF">W{i + 1}</text>
          <circle cx={px} cy={py} r="14" fill="transparent" />
          <circle cx={px} cy={py} r={hover === i ? 5 : 3} fill="#fff" stroke="#7FA8E0" strokeWidth="2" />
          {hover === i && (
            <g>
              <rect x={px - 22} y={py - 30} width="44" height="20" rx="5" fill="#1A1A1A" />
              <text x={px} y={py - 16} textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">{values[i].toFixed(2)}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}
