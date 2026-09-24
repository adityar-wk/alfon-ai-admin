import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, ChevronRight, ChevronDown } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card } from "../components/ui";
import { ScopePicker } from "../components/ScopePicker";
import { TASKS, shortName } from "../data/tasks";
import { INITIAL } from "../data/staff";
import { usePersona } from "../persona";

export default function DepartmentDashboard() {
  const navigate = useNavigate();
  const { scopeDepts, inScope } = usePersona();
  const [who, setWho] = useState("All team");

  const mine = TASKS.filter((t) => inScope(t.dept));
  const open = mine.filter((t) => t.status !== "Completed" && t.status !== "Unable to Complete" && t.status !== "Void");
  const escalated = open.filter((t) => t.status === "Escalated");
  const overdue = open.filter((t) => t.sla.kind === "overdue");
  const atRisk = open.filter((t) => t.sla.kind === "due");
  const complaints = open.filter((t) => t.tag === "Complaint");
  const unassignedCritical = open.filter((t) => t.owner === null && (t.priority === "High" || t.priority === "Critical" || t.sla.kind === "due" || t.sla.kind === "overdue"));

  // needs attention: escalations, complaints, SLA breaches and unassigned tasks about to breach
  const attentionRank = (t: (typeof TASKS)[number]) => (t.status === "Escalated" ? 0 : t.sla.kind === "overdue" ? 1 : t.tag === "Complaint" ? 2 : 3);
  const attention = open
    .filter((t) => t.status === "Escalated" || t.tag === "Complaint" || t.sla.kind === "overdue" || (t.owner === null && t.sla.kind === "due"))
    .sort((x, y) => attentionRank(x) - attentionRank(y));

  // open unassigned tasks the manager can review and pick up
  const pickable = open.filter((t) => t.owner === null);

  // team availability + tasks picked up today
  const team = INITIAL.filter((s) => inScope(s.dept)).map((s) => {
    const n = TASKS.filter((t) => t.owner === shortName(s.name)).length;
    return { ...s, n };
  });
  const totalPicked = team.reduce((sum, s) => sum + s.n, 0);
  const shown = who === "All team" ? totalPicked : team.find((s) => s.name === who)?.n ?? 0;
  const onDuty = team.filter((s) => s.status === "On Duty").length;

  // hourly "popular times" style profile of tasks picked up (6a – 11p)
  const HOURS = Array.from({ length: 18 }, (_, i) => i + 6);
  const CURVE = [1, 2, 3, 4, 4, 3.5, 3.5, 3.5, 3.5, 4, 5, 7, 7.5, 7.5, 6, 4.5, 3, 2];
  const nowHour = Math.min(23, Math.max(6, new Date().getHours()));
  const bars = useMemo(() => {
    const seed = who === "All team" ? 0 : (who.length % 5) + 1;
    const curve = CURVE.map((v, i) => v * (1 + (((i * (seed + 3)) % 5) - 2) * 0.08 * (seed ? 1 : 0)));
    const sum = curve.reduce((a, b) => a + b, 0);
    return curve.map((v) => (v / sum) * Math.max(shown, 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [who, shown]);
  const maxBar = Math.max(...bars) * 1.35;
  const liveIdx = nowHour - 6;
  const liveTotal = bars[liveIdx] * (open.length > onDuty * 2 ? 1.5 : 1.05);
  const busier = liveTotal > bars[liveIdx] * 1.2;
  const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`;

  const ops = [
    { label: "Open tasks", value: open.length, tone: "text-ink", to: "/tasks?view=all" },
    { label: "SLA at risk", value: atRisk.length, tone: "text-amber-600", to: "/tasks?view=risk" },
    { label: "Overdue", value: overdue.length, tone: "text-red-600", to: "/tasks?view=overdue" },
    { label: "Escalations", value: escalated.length, tone: "text-brand", to: "/tasks?view=escalated" },
    { label: "Complaints", value: complaints.length, tone: "text-violet-600", to: "/tasks?view=complaints" },
    { label: "Unassigned critical", value: unassignedCritical.length, tone: "text-red-600", to: "/tasks?view=unassigned" },
  ];
  return (
    <>
      <Topbar title="Department Dashboard" subtitle={scopeDepts.join(" · ")} actions={<ScopePicker />} />
      <Page>
        <h3 className="mb-3 flex items-center gap-2.5 text-[16px] font-semibold text-ink"><span className="h-2 w-2 rounded-full bg-brand" /> Department operations</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {ops.map((k) => (
            <button key={k.label} onClick={() => navigate(k.to)} className="rounded-card border border-line bg-white p-4 text-left hover:border-brand/40">
              <div className={`text-[28px] font-bold leading-tight ${k.tone}`}>{k.value}</div>
              <div className="mt-0.5 text-[13px] text-ink-secondary">{k.label}</div>
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-[15px] font-semibold text-ink">Needs your attention</h3>
                <Link to="/tasks" className="flex items-center gap-1 text-[12px] font-medium text-brand">
                  All department tasks <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-line/70 border-t border-line/70">
                {attention.map((t) => (
                  <div key={t.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink">
                        {t.title}
                        {t.status === "Escalated" && <span className="text-[11px] font-medium text-red-600">Escalated</span>}
                        {t.tag === "Complaint" && <span className="text-[11px] font-medium text-violet-600">Complaint</span>}
                        {t.sla.kind === "overdue" && <span className="text-[11px] font-medium text-red-600">SLA breached</span>}
                        {t.owner === null && <span className="text-[11px] font-medium text-brand">Unassigned</span>}
                      </div>
                      <div className="text-[12px] text-ink-tertiary">
                        {scopeDepts.length > 1 && <>{t.dept} · </>}
                        Room {t.room}{t.owner && <> · {t.owner}</>}
                      </div>
                    </div>
                    <span className={`flex shrink-0 items-center gap-1 text-[12px] ${t.sla.kind === "overdue" ? "font-medium text-red-600" : t.sla.kind === "due" ? "font-medium text-brand" : "text-ink-secondary"}`}>
                      <Clock className="h-3.5 w-3.5" /> {t.sla.text}
                    </span>
                    <Link to={`/tasks?open=${t.id}`} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-subtle">
                      View
                    </Link>
                  </div>
                ))}
                {!attention.length && <p className="px-5 py-8 text-center text-[13px] text-ink-tertiary">Nothing needs attention in your department.</p>}
              </div>
            </Card>

          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[15px] font-semibold text-ink">Team availability &amp; workload</h3>
                <div className="relative">
                  <select
                    value={who}
                    onChange={(e) => setWho(e.target.value)}
                    aria-label="Show workload for"
                    className="h-8 appearance-none rounded-lg bg-subtle py-0 pl-3 pr-7 text-[13px] font-medium text-ink outline-none"
                  >
                    <option>All team</option>
                    {team.map((s) => <option key={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px]">
                <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Live</span>
                <span className="italic text-ink-secondary">{busier ? "Busier than usual" : "As busy as usual"}</span>
                <span className="ml-auto text-ink-tertiary">{shown} picked up today</span>
              </div>
              <div className="mt-3 border-t border-dashed border-line/90">
                <div className="flex h-32 items-end gap-[3px]" role="img" aria-label="Tasks picked up by hour">
                  {bars.map((v, i) => {
                    const live = i === liveIdx;
                    const h = (v / maxBar) * 100;
                    return (
                      <div key={i} title={`${hourLabel(HOURS[i])} · ${live ? liveTotal.toFixed(1) : v.toFixed(1)} tasks`} className="relative flex-1" style={{ height: `${live ? (liveTotal / maxBar) * 100 : h}%` }}>
                        <div className={`absolute inset-0 rounded-t-[3px] ${live ? "bg-[#E5484D]" : "bg-[#3B98A8]"}`} />
                        {live && <div className="absolute inset-x-0 bottom-0 rounded-t-[3px] bg-[#B4262B]" style={{ height: `${(bars[i] / liveTotal) * 100}%` }} />}
                      </div>
                    );
                  })}
                </div>
                <div className="relative mt-1.5 h-4 text-[11px] text-ink-tertiary">
                  {[0, 3, 6, 9, 12, 15].map((i) => (
                    <span key={i} className="absolute -translate-x-1/2" style={{ left: `${((i + 0.5) / bars.length) * 100}%` }}>{hourLabel(HOURS[i])}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3 divide-y divide-line/70 border-t border-line/70">
                {team.map((s) => (
                  <div key={s.id} className="flex items-center gap-2.5 py-2">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${s.status === "On Duty" ? "bg-emerald-500" : s.status === "On Break" ? "bg-amber-400" : "bg-gray-300"}`} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{s.name}</span>
                    <span className="text-[11px] text-ink-tertiary">{s.status}</span>
                  </div>
                ))}
              </div>
              <Link to="/team" className="mt-2 flex items-center gap-1 text-[12px] font-medium text-brand">
                Open team <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Open tasks to pick up</h3>
                <span className="text-[12px] text-ink-tertiary">{pickable.length} unassigned</span>
              </div>
              <div className="mt-2 divide-y divide-line/70">
                {pickable.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="truncate text-[13px] font-medium text-ink">{t.title}</div>
                      <div className="text-[11px] text-ink-tertiary">{scopeDepts.length > 1 && <>{t.dept} · </>}Room {t.room} · {t.sla.text}</div>
                    </div>
                    <Link to={`/tasks?open=${t.id}`} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-subtle">
                      View
                    </Link>
                  </div>
                ))}
                {!pickable.length && <p className="py-6 text-center text-[13px] text-ink-tertiary">No open unassigned tasks.</p>}
              </div>
            </Card>
          </div>
        </div>
      </Page>
    </>
  );
}
