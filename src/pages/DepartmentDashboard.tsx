import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ListChecks, AlertTriangle, Timer, MessageCircle, UserRound, CheckCircle2 } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, RoomNo, StatCard } from "../components/ui";
import { ScopePicker } from "../components/ScopePicker";
import { TASKS, shortName } from "../data/tasks";
import { INITIAL } from "../data/staff";
import { usePersona } from "../persona";
import { formatClock, slaSecs, taskStatus, useClock } from "../data/attention";
import { SlaClock } from "../components/SlaClock";
import { FilterPill } from "./Home";

const STATUS_BADGE: Record<string, { background: string; color: string }> = {
  Escalated: { background: "#FEF2F2", color: "#EF4444" },
  "In Progress": { background: "#FFF9EC", color: "#D97706" },
  Pending: { background: "#F5F5F5", color: "#6B7280" },
  Completed: { background: "#F0FDF4", color: "#22C55E" },
  "Unable to Complete": { background: "#F5F5F5", color: "#6B7280" },
  Void: { background: "#F5F5F5", color: "#9CA3AF" },
};

export default function DepartmentDashboard() {
  useClock();
  const navigate = useNavigate();
  const { scopeDepts, inScope, me } = usePersona();
  const [dept, setDept] = useState("all");
  const [priority, setPriority] = useState("all");
  const first = me.name.split(" ")[0];
  const hour = new Date().getHours();
  const hello = `${hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"}, ${first} 👋`;

  const mine = TASKS.filter((t) => inScope(t.dept));
  const open = mine.filter((t) => t.status !== "Completed" && t.status !== "Unable to Complete" && t.status !== "Void");
  const escalated = open.filter((t) => t.status === "Escalated");
  const overdue = open.filter((t) => t.sla.kind === "overdue");
  const atRisk = open.filter((t) => t.sla.kind === "due");
  const complaints = open.filter((t) => t.tag === "Complaint");
  const unassignedCritical = open.filter((t) => t.owner === null && (t.priority === "High" || t.priority === "Critical" || t.sla.kind === "due" || t.sla.kind === "overdue"));

  // open unassigned tasks the manager can review and pick up
  const pickable = open.filter((t) => t.owner === null);

  // team availability + tasks picked up today
  const team = INITIAL.filter((s) => inScope(s.dept)).map((s) => {
    const n = TASKS.filter((t) => t.owner === shortName(s.name)).length;
    return { ...s, n };
  });
  const totalPicked = team.reduce((sum, s) => sum + s.n, 0);
  const maxPicked = Math.max(1, ...team.map((s) => s.n));
  const busiest = Math.max(...team.map((s) => s.n));

  const depts = Array.from(new Set(open.map((t) => t.dept))).sort();
  const pending = open
    .filter((t) => (dept === "all" || t.dept === dept) && (priority === "all" || t.priority === priority))
    .slice(0, 12);

  const ops = [
    { label: "Open tasks", value: open.length, to: "/tasks?view=all", icon: ListChecks },
    { label: "SLA at risk", value: atRisk.length, to: "/tasks?view=risk", icon: Timer },
    { label: "Overdue", value: overdue.length, to: "/tasks?view=overdue", icon: AlertTriangle },
    { label: "Escalations", value: escalated.length, to: "/tasks?view=escalated", icon: AlertTriangle },
    { label: "Complaints", value: complaints.length, to: "/tasks?view=complaints", icon: MessageCircle },
    { label: "Unassigned critical", value: unassignedCritical.length, to: "/tasks?view=unassigned", icon: UserRound },
  ];
  return (
    <>
      <Topbar title={hello} subtitle={`Here's what's happening in ${scopeDepts.join(" & ")}`} actions={<ScopePicker />} />
      <Page>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
          {ops.map((k) => (
            <StatCard key={k.label} icon={k.icon} label={k.label} value={k.value} onClick={() => navigate(k.to)} />
          ))}
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5">
          <div className="space-y-5">
            <Card table className="overflow-hidden">
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line px-6 py-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-brand" />
                  <h3 className="font-display text-[16px] font-semibold text-ink">Pending Tasks</h3>
                </div>
                <div className="flex items-center gap-2">
                  {depts.length > 1 && (
                    <FilterPill
                      label="All Departments"
                      value={dept}
                      onChange={setDept}
                      options={[{ id: "all", label: "All Departments" }, ...depts.map((d) => ({ id: d, label: d }))]}
                    />
                  )}
                  <FilterPill
                    label="All Priority"
                    value={priority}
                    onChange={setPriority}
                    options={[
                      { id: "all", label: "All Priority" },
                      { id: "Critical", label: "Critical" },
                      { id: "High", label: "High" },
                      { id: "Medium", label: "Medium" },
                      { id: "Low", label: "Low" },
                    ]}
                  />
                  <Link to="/tasks" className="ml-1 text-[14px] font-medium text-brand">View all</Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1120px] table-fixed text-left">
                  <colgroup>
                    <col className="w-[8%]" />
                    <col className="w-[22%]" />
                    <col className="w-[13%]" />
                    <col className="w-[8%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[11%]" />
                    <col className="w-[12%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-subtle text-[12px] uppercase tracking-wide text-ink-secondary">
                      <th className="truncate px-4 py-3 font-medium">#</th>
                      <th className="truncate px-4 py-3 font-medium">Task</th>
                      <th className="truncate px-4 py-3 font-medium">Guest</th>
                      <th className="truncate px-4 py-3 font-medium">Room</th>
                      <th className="truncate px-4 py-3 font-medium">Department</th>
                      <th className="truncate px-4 py-3 font-medium">Assigned To</th>
                      <th className="truncate px-4 py-3 font-medium">SLA</th>
                      <th className="truncate px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((t) => {
                      const label = taskStatus(t);
                      const status = label === "SLA breached" || label === "SLA at risk" ? "In Progress" : label;
                      const badge = STATUS_BADGE[status] ?? { background: "#F5F5F5", color: "#6B7280" };
                      const secs = slaSecs(t.sla);
                      const overdue = secs !== null && (secs < 0 || t.sla.kind === "overdue");
                      const slaColor = overdue ? "text-red-600" : t.sla.kind === "due" ? "text-amber-600" : "text-emerald-600";
                      return (
                        <tr
                          key={t.id}
                          onClick={() => navigate(`/tasks?open=${t.id}`)}
                          className="cursor-pointer border-b border-line/60 transition-colors duration-200 last:border-0 hover:bg-subtle/60"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono text-[10px] font-semibold text-ink-tertiary">#{String(t.id).padStart(3, "0")}</span>
                          </td>
                          <td className="min-w-0 px-4 py-3">
                            <div className="flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-ink">
                              <span className="truncate">{t.title}</span>
                              {!!t.compensation?.length && (
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "#F0FDF4", color: "#22C55E" }} title="Compensation logged">$</span>
                              )}
                              {t.tag === "Complaint" && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "#FEF2F2", color: "#DC2626" }}>
                                  <AlertTriangle className="h-2.5 w-2.5" /> Complaint
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="truncate px-4 py-3 text-[13px] text-ink-secondary">{t.guest}</td>
                          <td className="truncate px-4 py-3 text-[13px] text-ink-secondary">{String(t.room).replace(/^Room\s+/i, "")}</td>
                          <td className="truncate px-4 py-3 text-[13px] text-ink-secondary">{t.dept}</td>
                          <td className="truncate px-4 py-3 text-[13px]">
                            {t.owner ? <span className="truncate text-ink">{t.owner}</span> : <span className="font-medium text-brand">Unassigned</span>}
                          </td>
                          <td className="truncate px-4 py-3">
                            {t.status === "Completed" || t.sla.kind === "met" ? (
                              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> SLA met</span>
                            ) : secs === null ? (
                              <span className="text-[12px] text-ink-tertiary">{t.sla.text}</span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 font-display text-[12px] font-semibold ${slaColor}`}>
                                <Timer className="h-3 w-3" />
                                {overdue ? `+${formatClock(Math.abs(secs))}` : formatClock(secs)}
                              </span>
                            )}
                          </td>
                          <td className="truncate px-4 py-3">
                            <span className="inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium" style={badge}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                    {!pending.length && (
                      <tr>
                        <td colSpan={8} className="px-4 py-3.5 text-center text-[14px] text-ink-tertiary">No pending tasks match.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-[16px] font-semibold text-ink">Team availability &amp; workload</h3>
              <div className="mt-3 flex items-center gap-2 text-[12px]">
                <span className="text-ink-tertiary">{totalPicked} picked up today</span>
              </div>
              <div className="mt-3 overflow-x-auto border-t border-dashed border-line/90 pb-1">
                <div className="flex h-40 items-end gap-3" style={{ minWidth: team.length * 52 }} role="img" aria-label="Tasks picked up today by team member">
                  {team.map((s) => (
                    <div key={s.id} title={`${s.name} · ${s.n} picked up · ${s.status}`} className="flex h-full min-w-[40px] flex-1 flex-col items-center justify-end">
                      <span className="mb-1 text-[11px] font-semibold tabular-nums text-ink">{s.n}</span>
                      <div
                        className={`w-full rounded-t-[4px] ${s.n === busiest && s.n > 0 ? "bg-brand" : "bg-brand/55"} ${s.status === "On Duty" ? "" : "opacity-60"}`}
                        style={{ height: `${Math.max(4, (s.n / maxPicked) * 78)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3" style={{ minWidth: team.length * 52 }}>
                  {team.map((s) => (
                    <div key={s.id} className="min-w-[40px] flex-1 truncate pt-1.5 text-center text-[11px] text-ink-tertiary" title={s.name}>{s.name.split(" ")[0]}</div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2.5 border-t border-line/70 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                <span className="min-w-0 flex-1">Staff</span>
                <span className="shrink-0">Current Tasks</span>
              </div>
              <div className="divide-y divide-line/70">
                {team.map((s) => (
                  <div key={s.id} className="flex items-center gap-2.5 py-2">
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{s.name}</span>
                    <span className="shrink-0 text-[13px] font-semibold text-ink">{s.n}</span>
                  </div>
                ))}
              </div>
              <Link to="/team" className="mt-2 flex items-center gap-1 text-[12px] font-medium text-brand">
                Open team <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-semibold text-ink">Open tasks to pick up</h3>
                <span className="text-[12px] text-ink-tertiary">{pickable.length} unassigned</span>
              </div>
              {!!pickable.length && (
                <div className="mt-3 flex items-center gap-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">
                  <span className="min-w-0 flex-1">Task</span>
                  <span className="w-16 shrink-0">SLA</span>
                  <span className="w-[68px] shrink-0" />
                </div>
              )}
              <div className="divide-y divide-line/70 border-t border-line/70">
                {pickable.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="truncate text-[13px] font-medium text-ink">{t.title}</div>
                      <div className="text-[11px] text-ink-tertiary">{scopeDepts.length > 1 && <>{t.dept} · </>}<RoomNo room={t.room} /></div>
                    </div>
                    <div className="w-16 shrink-0"><SlaClock sla={t.sla} className="text-[12px]" /></div>
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
