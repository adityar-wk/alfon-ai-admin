import { useEffect, useState } from "react";
import {
  ShieldAlert,
  ScrollText,
  History,
  Bell,
  ClipboardCheck,
  ListChecks,
  AlertTriangle,
  DollarSign,
  Users,
  Star,
  Timer,
  Globe,
  Lock,
  ArrowRight,
  Download,
  X,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Button, Field, Select } from "../components/ui";
import { AUDIT, TASKS } from "../data/tasks";
import { usePersona } from "../persona";
import { ScopePicker } from "../components/ScopePicker";

type Action = "view" | "generate" | "download";

type Report = {
  key: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  action: Action;
  gmOnly?: boolean;
  cols: string[];
  rows: string[][];
};

const REPORTS: Report[] = [
  {
    key: "integrity", title: "Manual Task Integrity Report", icon: ShieldAlert, action: "view", gmOnly: true,
    desc: "All manually created tasks, with automatic flagging of suspicious patterns for review.",
    cols: ["Task", "Created by", "Department", "Created", "Flag"],
    rows: [
      ["Comp. minibar for Room 1802", "Sarah K.", "Room Service", "May 8, 11:42 PM", "After-hours"],
      ["Late checkout override 1203", "James W.", "Front Desk", "May 8, 4:10 PM", "Repeated by user"],
      ["Room upgrade 1608", "Maria S.", "Front Desk", "May 7, 9:05 AM", "—"],
      ["Extra towels 2104", "Lisa M.", "Housekeeping", "May 7, 8:30 AM", "—"],
      ["Airport pickup", "John S.", "Concierge", "May 6, 6:15 PM", "No guest request"],
    ],
  },
  {
    key: "sla-adjust", title: "SLA & Timing Adjustment Report", icon: History, action: "view", gmOnly: true,
    desc: "Every change made to SLA targets or task completion times, with full attribution.",
    cols: ["Item", "Changed by", "From", "To", "When"],
    rows: [
      ["Housekeeping · Extra towels SLA", "Sophia Carter", "20 min", "30 min", "May 8, 10:02 AM"],
      ["Task #1042 completion time", "Mike R.", "48 min", "31 min", "May 7, 3:14 PM"],
      ["Engineering · AC repair SLA", "Sophia Carter", "60 min", "45 min", "May 6, 9:30 AM"],
      ["Task #1017 completion time", "Sarah K.", "25 min", "12 min", "May 5, 6:48 PM"],
    ],
  },
  {
    key: "action", title: "Action Report", icon: Bell, action: "generate",
    desc: "All proactive guest actions flagged by Alfon AI — department, assignee, and completion status.",
    cols: ["Action", "Department", "Assignee", "Status"],
    rows: [["Offer early check-in", "Front Desk", "Sarah K.", "Completed"], ["Arrange baby cot", "Housekeeping", "Lisa M.", "In progress"], ["Prepare vegetarian welcome", "Food & Beverage", "Tom H.", "Pending"]],
  },
  {
    key: "prearrival", title: "Pre-Arrival Preference Report", icon: ClipboardCheck, action: "download",
    desc: "Amenity preparation guide per arriving guest — dietary, minibar, room setup, and special requests.",
    cols: ["Guest", "Room", "Dietary", "Minibar", "Room setup", "Special requests"],
    rows: [["Emma Davis", "1608", "Vegetarian", "Sparkling water", "High floor, firm pillow", "Airport pickup"], ["Liam Anderson", "1102", "None", "No alcohol", "Quiet room", "Early check-in"], ["Rohan Sharma", "1205", "No shellfish", "Standard", "Extra blanket", "Late turndown"]],
  },
  {
    key: "task", title: "Task Report", icon: ListChecks, action: "generate",
    desc: "Breakdown of all tasks by department, status, and response time.",
    cols: ["Department", "Total", "Completed", "Overdue", "Avg response"],
    rows: [["Housekeeping", "1281", "1204", "52", "3m 10s"], ["Room Service", "802", "760", "31", "2m 40s"], ["Front Desk", "691", "655", "20", "2m 05s"], ["Engineering", "426", "390", "24", "4m 30s"]],
  },
  {
    key: "complaint", title: "Complaint Report", icon: AlertTriangle, action: "generate",
    desc: "Guest complaints logged, their category, and resolution status.",
    cols: ["Category", "Logged", "Resolved", "Open"],
    rows: [["Room move", "67", "60", "7"], ["AC not working", "31", "29", "2"], ["Elevator issues", "18", "18", "0"], ["Noise disturbance", "11", "9", "2"]],
  },
  {
    key: "compensation", title: "Compensation Report", icon: DollarSign, action: "generate",
    desc: "Compensation issued to guests with reason and approval trail.",
    cols: ["Guest", "Room", "Reason", "Amount", "Approved by"],
    rows: [["James Wilson", "2205", "AC outage", "$120", "Sophia Carter"], ["Liam Anderson", "1802", "Plumbing issue", "$80", "Sophia Carter"], ["Ava Thompson", "2501", "Noise", "$40", "Noah B."]],
  },
  {
    key: "team", title: "Team Performance Report", icon: Users, action: "generate",
    desc: "Tasks completed, on-time rate, and workload by team member.",
    cols: ["Staff", "Department", "Tasks", "On-time", "Avg time"],
    rows: [["Sarah Ali", "Housekeeping", "42", "96%", "14 min"], ["David Kim", "Engineering", "35", "91%", "22 min"], ["Maria Lopez", "Guest Services", "38", "94%", "9 min"], ["James Wilson", "Front Desk", "51", "98%", "6 min"]],
  },
  {
    key: "satisfaction", title: "Guest Satisfaction Report", icon: Star, action: "generate",
    desc: "Satisfaction scores and trends across the selected period.",
    cols: ["Week", "Avg score", "Responses"],
    rows: [["W1", "4.30", "182"], ["W2", "4.45", "201"], ["W3", "4.20", "176"], ["W4", "4.60", "214"], ["W5", "4.55", "198"], ["W6", "4.75", "223"]],
  },
  {
    key: "breach", title: "SLA Breach Report", icon: ShieldAlert, action: "generate",
    desc: "Tasks that missed their SLA escalation window, by department.",
    cols: ["Department", "Breaches", "Worst delay", "Top cause"],
    rows: [["Housekeeping", "52", "48 min", "Staffing"], ["Engineering", "24", "1h 05m", "Parts"], ["Room Service", "31", "35 min", "Peak hours"], ["Front Desk", "20", "22 min", "Queue"]],
  },
  {
    key: "response", title: "Response Time Report", icon: Timer, action: "generate",
    desc: "Average and peak response times across departments and channels.",
    cols: ["Channel", "Average", "Peak", "Fastest dept"],
    rows: [["WhatsApp", "2m 10s", "9m 40s", "Front Desk"], ["Phone", "1m 30s", "6m 05s", "Operator"], ["Staff app", "3m 20s", "12m 00s", "Housekeeping"]],
  },
  {
    key: "language", title: "Language & Guest Origin Report", icon: Globe, action: "generate",
    desc: "Guest nationality and preferred communication language distribution.",
    cols: ["Nationality", "Share", "Top language"],
    rows: [["United Kingdom", "28%", "English"], ["United States", "24%", "English"], ["France", "18%", "French"], ["UAE", "16%", "Arabic"], ["India", "8%", "Hindi"]],
  },
];

const AUDIT_REPORT: Report = {
  key: "audit", title: "Audit Trail", icon: ScrollText, action: "view",
  desc: "Escalations, overrides, reassignments and other task changes with who did what and when.",
  cols: ["When", "Who", "Action", "Task", "Detail"],
  rows: [],
};

const PERIODS = ["Today", "Last 7 days", "Last 30 days", "This month", "Last month"];
const LABEL: Record<Action, string> = { view: "View Report", generate: "Generate", download: "Download" };

function downloadCsv(r: Report, period: string) {
  const lines = [r.cols, ...r.rows].map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(","));
  const blob = new Blob([`"${r.title}","${period}"\n` + lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${r.key}-report.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Reports() {
  const { manager, scopeDepts, inScope } = usePersona();
  // hotel-wide reports (guest origin, compensation) stay with the General Manager
  const list = manager ? [...REPORTS.filter((r) => r.key !== "language" && r.key !== "compensation"), AUDIT_REPORT] : REPORTS;
  const scopeLabel = manager ? scopeDepts.join(", ") : "All departments";
  const [active, setActive] = useState<Report | null>(null);
  const [period, setPeriod] = useState(PERIODS[1]);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2000);
  };

  const run = (r: Report) => {
    if (manager && r.gmOnly) return;
    if (r.key === "audit") {
      r = {
        ...r,
        rows: AUDIT.filter((a) => {
          const t = TASKS.find((x) => x.title === a.task);
          return !manager || (t && inScope(t.dept));
        }).map((a) => [a.time, a.who, a.action, a.task, a.detail]),
      };
    }
    if (r.action === "download") {
      downloadCsv(r, `Arriving today · ${scopeLabel}`);
      flash(`${r.title} downloaded`);
    } else {
      setPeriod(PERIODS[1]);
      setActive(r);
    }
  };

  return (
    <>
      <Topbar title="Reports" subtitle={manager ? `Reports for ${scopeDepts.join(" + ")}` : "Generate and download operational reports"} actions={manager ? <ScopePicker /> : undefined} />
      <Page>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((r) => (
            <div key={r.key} className={`relative flex flex-col rounded-card border border-line bg-white p-5 transition-colors ${manager && r.gmOnly ? "opacity-60" : "hover:border-brand/40"}`}>
              {r.gmOnly && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                  <Lock className="h-2.5 w-2.5" /> GM Only
                </span>
              )}
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand/30 bg-brand-tint/40 text-brand">
                <r.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-ink">{r.title}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-snug text-ink-secondary">{r.desc}</p>
              {manager && r.gmOnly ? (
                <span className="mt-4 flex items-center gap-1.5 self-start text-[13px] font-medium text-ink-tertiary">
                  <Lock className="h-3.5 w-3.5" /> Restricted to General Manager
                </span>
              ) : (
                <button onClick={() => run(r)} className="mt-4 flex items-center gap-1.5 self-start text-[13px] font-semibold text-brand hover:underline">
                  {r.action === "download" && <Download className="h-3.5 w-3.5" />}
                  {LABEL[r.action]}
                  {r.action !== "download" && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          ))}
        </div>
      </Page>

      {active && (
        <Overlay onClose={() => setActive(null)} title={active.title} wide={active.action === "view"}>
          {active.action === "view" ? (
            <>
              <div className="overflow-x-auto p-6">
                <ReportTable r={active} />
              </div>
              <div className="flex justify-end gap-2 border-t border-line px-6 py-3.5">
                <Button variant="outline" onClick={() => setActive(null)}>Close</Button>
                <Button onClick={() => { downloadCsv(active, `All time · ${scopeLabel}`); flash("Report exported"); }}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4 p-6">
                <p className="text-[13px] text-ink-secondary">{active.desc}</p>
                <Field label="Period">
                  <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
                    {PERIODS.map((p) => <option key={p}>{p}</option>)}
                  </Select>
                </Field>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">Preview</div>
                  <ReportTable r={active} />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-line px-6 py-3.5">
                <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
                <Button onClick={() => { downloadCsv(active, `${period} · ${scopeLabel}`); flash(`${active.title} generated`); setActive(null); }}>
                  <Download className="h-4 w-4" /> Generate CSV
                </Button>
              </div>
            </>
          )}
        </Overlay>
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </>
  );
}

function ReportTable({ r }: { r: Report }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-subtle/50 text-[11px] uppercase tracking-wide text-ink-secondary">
            {r.cols.map((c) => <th key={c} className="px-3 py-2.5 font-medium">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {r.rows.map((row, i) => (
            <tr key={i} className="border-b border-line/70 last:border-0">
              {row.map((c, j) => (
                <td key={j} className={`px-3 py-2.5 ${j === 0 ? "font-medium text-ink" : "text-ink-secondary"} ${r.gmOnly && j === row.length - 1 && c !== "—" ? "font-medium text-brand" : ""}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Overlay({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${wide ? "max-w-[760px]" : "max-w-[600px]"}`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
