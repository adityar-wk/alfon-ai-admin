import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, ChevronRight, Check, X } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card } from "../components/ui";
import { ScopePicker } from "../components/ScopePicker";
import { TASKS, logAudit, shortName } from "../data/tasks";
import { INITIAL } from "../data/staff";
import { DEPTS, METRICS, COMPLAINT_DETAIL } from "./Analytics";
import { usePersona, canonDept } from "../persona";

type HelpRequest = { id: number; dept: string; from: string; task: string; type: "Reassignment" | "Extra support"; reason: string };

// requests escalated to the department head by their supervisors / staff
const HELP: HelpRequest[] = [
  { id: 1, dept: "Housekeeping", from: "Sarah Ali (Supervisor)", task: "Extra Towels — Room 2104", type: "Extra support", reason: "Floor 21 team is fully booked until 4 PM." },
  { id: 2, dept: "Housekeeping", from: "Lisa Morgan", task: "Fresh Linen Change — Room 1502", type: "Reassignment", reason: "Called away to a VIP turndown; needs someone to take over." },
  { id: 3, dept: "Engineering", from: "Raj Patel (Supervisor)", task: "Plumbing Issue — Room 1802", type: "Extra support", reason: "Needs a second technician to isolate the water line." },
  { id: 4, dept: "Engineering", from: "Mike Rogers", task: "AC Not Working — Room 2205", type: "Reassignment", reason: "Compressor part needed; cannot finish this shift." },
  { id: 5, dept: "Front Desk", from: "Noah Bennett (Supervisor)", task: "Room Move Request — 1107", type: "Extra support", reason: "Two group check-ins arriving at the same time." },
];

export default function DepartmentDashboard() {
  const navigate = useNavigate();
  const { me, scopeDepts, inScope } = usePersona();
  const [helpDone, setHelpDone] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2000);
  };

  const mine = TASKS.filter((t) => inScope(t.dept));
  const open = mine.filter((t) => t.status !== "Completed" && t.status !== "Unable to Complete");
  const escalated = open.filter((t) => t.status === "Escalated");
  const overdue = open.filter((t) => t.sla.kind === "overdue");
  const atRisk = open.filter((t) => t.sla.kind === "due");
  const help = HELP.filter((h) => inScope(h.dept) && !helpDone.has(h.id));

  const complaints = open.filter((t) => t.tag === "Complaint");
  const unassignedCritical = open.filter((t) => t.owner === null && (t.priority === "High" || t.priority === "Critical" || t.sla.kind === "due" || t.sla.kind === "overdue"));

  // needs attention: escalated, unassigned or SLA breached
  const rank = (t: (typeof TASKS)[number]) => (t.status === "Escalated" ? 0 : t.sla.kind === "overdue" ? 1 : 2);
  const attention = open
    .filter((t) => t.status === "Escalated" || t.sla.kind === "overdue" || t.owner === null)
    .sort((a, b) => rank(a) - rank(b));

  // team availability + workload
  const team = INITIAL.filter((s) => inScope(s.dept)).map((s) => {
    const n = TASKS.filter((t) => t.owner === shortName(s.name) && t.status !== "Completed" && t.status !== "Unable to Complete").length;
    return { ...s, n };
  });

  // service levels + recurring issues from the department's analytics
  const dm = DEPTS.filter((d) => scopeDepts.includes(canonDept(d.name)));
  const totalTasks = dm.reduce((a, d) => a + d.tasks, 0);
  const completedPct = Math.round(dm.reduce((a, d) => a + d.tasks * METRICS[d.name].done, 0) / Math.max(totalTasks, 1));
  const overdueTotal = dm.reduce((a, d) => a + METRICS[d.name].overdue, 0);
  const respSecs = dm.reduce((a, d) => {
    const m = METRICS[d.name].resp.match(/(\d+)m (\d+)s/);
    return a + (m ? Number(m[1]) * 60 + Number(m[2]) : 0);
  }, 0) / Math.max(dm.length, 1);
  const avgResp = `${Math.floor(respSecs / 60)}m ${String(Math.round(respSecs % 60)).padStart(2, "0")}s`;
  const recurring = [
    ...dm.flatMap((d) => d.items.filter(([l]) => l !== "Other").map(([l, v]) => ({ label: l, v, kind: "Requests" as const }))),
    ...Object.entries(COMPLAINT_DETAIL).flatMap(([label, c]) => c.by.filter(([d]) => scopeDepts.includes(canonDept(d))).map(([, v]) => ({ label, v, kind: "Complaints" as const, delta: c.delta }))),
  ]
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);

  const ops = [
    { label: "Open tasks", value: open.length, tone: "text-ink", to: "/tasks?view=all" },
    { label: "SLA at risk", value: atRisk.length, tone: "text-amber-600", to: "/tasks?view=risk" },
    { label: "Overdue", value: overdue.length, tone: "text-red-600", to: "/tasks?view=overdue" },
    { label: "Escalations", value: escalated.length, tone: "text-brand", to: "/tasks?view=escalated" },
    { label: "Complaints", value: complaints.length, tone: "text-violet-600", to: "/tasks?view=complaints" },
    { label: "Unassigned critical", value: unassignedCritical.length, tone: "text-red-600", to: "/tasks?view=unassigned" },
  ];
  const sla = [
    { label: "Total tasks", value: totalTasks.toLocaleString(), tone: "text-ink" },
    { label: "Completed", value: `${completedPct}%`, tone: "text-emerald-600" },
    { label: "Overdue", value: overdueTotal, tone: "text-red-600" },
    { label: "Avg response", value: avgResp, tone: "text-ink" },
  ];

  const decide = (r: HelpRequest, ok: boolean) => {
    logAudit(me.name, ok ? `${r.type} approved` : `${r.type} declined`, r.task.split(" — ")[0], `Requested by ${r.from}`);
    setHelpDone((s) => new Set(s).add(r.id));
    flash(ok ? `${r.type} approved` : "Request declined");
  };

  return (
    <>
      <Topbar title="Department Dashboard" subtitle={scopeDepts.join(" · ")} showSearch={false} actions={<ScopePicker />} />
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

        <h3 className="mb-3 mt-6 flex items-center gap-2.5 text-[16px] font-semibold text-ink"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Service levels</h3>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {sla.map((k) => (
            <div key={k.label} className="rounded-card border border-line bg-white p-4">
              <div className={`text-[28px] font-bold leading-tight ${k.tone}`}>{k.value}</div>
              <div className="mt-0.5 text-[13px] text-ink-secondary">{k.label}</div>
            </div>
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
                        {t.owner === null && <span className="text-[11px] font-medium text-brand">Unassigned</span>}
                        {t.sla.kind === "overdue" && <span className="text-[11px] font-medium text-red-600">SLA breached</span>}
                      </div>
                      <div className="text-[12px] text-ink-tertiary">
                        {scopeDepts.length > 1 && <>{t.dept} · </>}
                        {t.guest} · Room {t.room}{t.owner && <> · {t.owner}</>}
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

            <Card id="help" className="overflow-hidden">
              <div className="px-5 py-4">
                <h3 className="text-[15px] font-semibold text-ink">Help &amp; reassignment requests</h3>
                <p className="text-[12px] text-ink-tertiary">From your team, escalated beyond supervisor level</p>
              </div>
              <div className="divide-y divide-line/70 border-t border-line/70">
                {help.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-ink">
                        {r.task} <span className="ml-1 text-[11px] font-medium text-ink-tertiary">{r.type}</span>
                      </div>
                      <div className="text-[12px] text-ink-secondary">{r.reason}</div>
                      <div className="text-[11px] text-ink-tertiary">From {r.from}{scopeDepts.length > 1 && ` · ${r.dept}`}</div>
                    </div>
                    <button onClick={() => decide(r, false)} className="flex shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-semibold text-ink-secondary hover:bg-subtle">
                      <X className="h-3 w-3" /> Decline
                    </button>
                    <button onClick={() => decide(r, true)} className="flex shrink-0 items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-hover">
                      <Check className="h-3 w-3" /> Approve
                    </button>
                  </div>
                ))}
                {!help.length && <p className="px-5 py-8 text-center text-[13px] text-ink-tertiary">No pending requests.</p>}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5">
              <h3 className="text-[15px] font-semibold text-ink">Team availability &amp; workload</h3>
              <div className="mt-3 divide-y divide-line/70">
                {team.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${s.status === "On Duty" ? "bg-emerald-500" : s.status === "On Break" ? "bg-amber-400" : "bg-gray-300"}`} />
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="text-[13px] font-medium text-ink">{s.name}</div>
                      <div className="text-[11px] text-ink-tertiary">{s.role} · {s.status}{scopeDepts.length > 1 && ` · ${s.dept}`}</div>
                    </div>
                    <span className={`shrink-0 text-[12px] ${s.n >= 3 ? "font-semibold text-brand" : "text-ink-secondary"}`}>
                      {s.n} open{s.n >= 3 ? " · High" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/team" className="mt-2 flex items-center gap-1 text-[12px] font-medium text-brand">
                Open team <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Recurring issues</h3>
                <Link to="/analytics" className="text-[12px] font-medium text-brand">Analytics</Link>
              </div>
              <div className="mt-2 divide-y divide-line/70">
                {recurring.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 text-[13px]">
                    <span className="flex-1 text-ink">{r.label}</span>
                    <span className="text-[11px] text-ink-tertiary">{r.kind}</span>
                    <span className="w-8 text-right font-semibold text-ink">{r.v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </Page>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </>
  );
}
