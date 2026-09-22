import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, ChevronRight, Check, X, Send } from "lucide-react";
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
  const [nudged, setNudged] = useState<Set<number>>(new Set());

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

  const rank = (t: (typeof TASKS)[number]) => (t.status === "Escalated" ? 0 : t.sla.kind === "overdue" ? 1 : t.sla.kind === "due" ? 2 : 3);
  const attention = open
    .filter((t) => t.status === "Escalated" || t.sla.kind === "overdue" || t.sla.kind === "due" || t.owner === null)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 6);

  const supervisorOf = (dept: string) => INITIAL.find((s) => canonDept(s.dept) === dept && /supervisor/i.test(s.role));

  // team availability + workload
  const team = INITIAL.filter((s) => inScope(s.dept)).map((s) => {
    const n = TASKS.filter((t) => t.owner === shortName(s.name) && t.status !== "Completed" && t.status !== "Unable to Complete").length;
    return { ...s, n };
  });

  // performance + recurring issues from the department's analytics
  const dm = DEPTS.filter((d) => scopeDepts.includes(canonDept(d.name)));
  const onTime = Math.round(dm.reduce((a, d) => a + METRICS[d.name].done, 0) / Math.max(dm.length, 1));
  const overdueTotal = dm.reduce((a, d) => a + METRICS[d.name].overdue, 0);
  const recurring = [
    ...dm.flatMap((d) => d.items.filter(([l]) => l !== "Other").map(([l, v]) => ({ label: l, v, kind: "Requests" as const }))),
    ...Object.entries(COMPLAINT_DETAIL).flatMap(([label, c]) => c.by.filter(([d]) => scopeDepts.includes(canonDept(d))).map(([, v]) => ({ label, v, kind: "Complaints" as const, delta: c.delta }))),
  ]
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);

  const C = 2 * Math.PI * 46;
  const kpis = [
    { label: "Escalated to you", value: escalated.length, foot: "Beyond supervisor level", to: "/tasks?view=escalated" },
    { label: "SLA at risk", value: atRisk.length, foot: "Due within the hour", to: "/tasks?view=risk" },
    { label: "Overdue / breached", value: overdue.length, foot: "Past SLA window", to: "/tasks?view=overdue" },
    { label: "Help requests", value: help.length, foot: "Awaiting your decision", to: "" },
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((k) => (
            <button
              key={k.label}
              onClick={() => (k.to ? navigate(k.to) : document.getElementById("help")?.scrollIntoView({ behavior: "smooth" }))}
              className="rounded-card border border-line bg-white p-4 text-left hover:border-brand/40"
            >
              <div className="text-[13px] text-ink-secondary">{k.label}</div>
              <div className="mt-1 text-[26px] font-bold leading-tight text-ink">{k.value}</div>
              <div className="text-[12px] text-ink-tertiary">{k.foot}</div>
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
                {attention.map((t) => {
                  const sup = supervisorOf(canonDept(t.dept));
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                          {t.title}
                          {t.status === "Escalated" && <span className="text-[11px] font-medium text-red-600">Escalated</span>}
                        </div>
                        <div className="text-[12px] text-ink-tertiary">
                          {scopeDepts.length > 1 && <>{t.dept} · </>}
                          {t.guest} · Room {t.room} · {t.owner ?? <span className="font-medium text-brand">Unassigned</span>}
                        </div>
                      </div>
                      <span className={`flex shrink-0 items-center gap-1 text-[12px] ${t.sla.kind === "overdue" ? "font-medium text-red-600" : t.sla.kind === "due" ? "font-medium text-brand" : "text-ink-secondary"}`}>
                        <Clock className="h-3.5 w-3.5" /> {t.sla.text}
                      </span>
                      {sup && (
                        <button
                          onClick={() => {
                            setNudged((n) => new Set(n).add(t.id));
                            logAudit(me.name, "Followed up", t.title, `Nudged ${sup.name}`);
                            flash(`Follow-up sent to ${sup.name}`);
                          }}
                          disabled={nudged.has(t.id)}
                          className="flex shrink-0 items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-semibold text-ink-secondary hover:bg-subtle disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" /> {nudged.has(t.id) ? "Sent" : "Follow up"}
                        </button>
                      )}
                      <Link to={`/tasks?open=${t.id}`} className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-hover">
                        Intervene
                      </Link>
                    </div>
                  );
                })}
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
              <h3 className="text-[15px] font-semibold text-ink">SLA performance</h3>
              <div className="mt-4 flex items-center gap-5">
                <div className="relative h-[92px] w-[92px] shrink-0">
                  <svg viewBox="0 0 116 116" className="h-full w-full -rotate-90">
                    <circle cx="58" cy="58" r="46" fill="none" strokeWidth="10" className="stroke-subtle" />
                    <circle cx="58" cy="58" r="46" fill="none" strokeWidth="10" strokeLinecap="round" className="stroke-brand" strokeDasharray={C} strokeDashoffset={C * (1 - onTime / 100)} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[22px] font-bold leading-none text-ink">{onTime}%</span>
                    <span className="mt-0.5 text-[10px] text-ink-tertiary">completed</span>
                  </div>
                </div>
                <dl className="flex-1 space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><dt className="text-ink-secondary">Overdue this week</dt><dd className="font-semibold text-ink">{overdueTotal}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-secondary">At risk now</dt><dd className="font-semibold text-ink">{atRisk.length}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-secondary">Avg response</dt><dd className="font-semibold text-ink">{dm.length === 1 ? METRICS[dm[0].name].resp : "See analytics"}</dd></div>
                </dl>
              </div>
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
