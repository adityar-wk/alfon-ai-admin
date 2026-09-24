import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card } from "../components/ui";
import { ScopePicker } from "../components/ScopePicker";
import { TASKS, shortName, logAudit } from "../data/tasks";
import { INITIAL } from "../data/staff";
import { usePersona } from "../persona";

export default function DepartmentDashboard() {
  const navigate = useNavigate();
  const { scopeDepts, inScope, me } = usePersona();
  const [, refresh] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const mine = TASKS.filter((t) => inScope(t.dept));
  const open = mine.filter((t) => t.status !== "Completed" && t.status !== "Unable to Complete" && t.status !== "Void");
  const escalated = open.filter((t) => t.status === "Escalated");
  const overdue = open.filter((t) => t.sla.kind === "overdue");
  const atRisk = open.filter((t) => t.sla.kind === "due");
  const complaints = open.filter((t) => t.tag === "Complaint");
  const unassignedCritical = open.filter((t) => t.owner === null && (t.priority === "High" || t.priority === "Critical" || t.sla.kind === "due" || t.sla.kind === "overdue"));

  // needs attention: unassigned tasks whose SLA is at risk (or already breached)
  const attention = open
    .filter((t) => t.owner === null && (t.sla.kind === "due" || t.sla.kind === "overdue"))
    .sort((x, y) => Number(y.sla.kind === "overdue") - Number(x.sla.kind === "overdue"));

  // open unassigned tasks the manager can pick up
  const pickable = open.filter((t) => t.owner === null);
  const pickUp = (id: number) => {
    const t = TASKS.find((x) => x.id === id);
    if (!t) return;
    t.owner = shortName(me.name);
    t.status = "In Progress";
    logAudit(me.name, "Accepted task", t.title, `Picked up by ${me.name}`);
    setToast(`${t.title} is now yours`);
    setTimeout(() => setToast(null), 2200);
    refresh((n) => n + 1);
  };

  // team availability + tasks picked up today
  const team = INITIAL.filter((s) => inScope(s.dept)).map((s) => {
    const n = TASKS.filter((t) => t.owner === shortName(s.name)).length;
    return { ...s, n };
  });
  const maxPicked = Math.max(1, ...team.map((s) => s.n));

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
                        <span className="text-[11px] font-medium text-brand">Unassigned</span>
                        {t.sla.kind === "overdue" && <span className="text-[11px] font-medium text-red-600">SLA breached</span>}
                      </div>
                      <div className="text-[12px] text-ink-tertiary">
                        {scopeDepts.length > 1 && <>{t.dept} · </>}
                        Room {t.room}
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
                {!attention.length && <p className="px-5 py-8 text-center text-[13px] text-ink-tertiary">No unassigned tasks are at risk of breaching SLA.</p>}
              </div>
            </Card>

          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <h3 className="text-[15px] font-semibold text-ink">Team availability &amp; workload</h3>
              <p className="mt-0.5 text-[12px] text-ink-tertiary">Tasks picked up today</p>
              <div className="mt-3 space-y-3">
                {team.map((s) => (
                  <div key={s.id}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${s.status === "On Duty" ? "bg-emerald-500" : s.status === "On Break" ? "bg-amber-400" : "bg-gray-300"}`} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{s.name}</span>
                      <span className="text-[11px] text-ink-tertiary">{s.status}{scopeDepts.length > 1 && ` · ${s.dept}`}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2.5">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-subtle">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${(s.n / maxPicked) * 100}%` }} />
                      </div>
                      <span className="w-5 text-right text-[12px] font-semibold tabular-nums text-ink">{s.n}</span>
                    </div>
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
                    <button onClick={() => pickUp(t.id)} className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-hover">
                      Pick up
                    </button>
                  </div>
                ))}
                {!pickable.length && <p className="py-6 text-center text-[13px] text-ink-tertiary">No open unassigned tasks.</p>}
              </div>
            </Card>
          </div>
        </div>
      </Page>
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-white shadow-lg">{toast}</div>}
    </>
  );
}
