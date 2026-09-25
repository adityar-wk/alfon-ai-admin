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
  FileText,
  ChevronLeft,
  X,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Button, Field, Select, Input } from "../components/ui";
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

const LABEL: Record<Action, string> = { view: "View Report", generate: "Generate", download: "Download" };

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };
const RANGE_PRESETS: { label: string; from: () => string; to: () => string }[] = [
  { label: "Today", from: () => daysAgo(0), to: () => daysAgo(0) },
  { label: "Last 7 days", from: () => daysAgo(6), to: () => daysAgo(0) },
  { label: "Last 30 days", from: () => daysAgo(29), to: () => daysAgo(0) },
];
const niceDate = (v: string) => new Date(v + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

type Filters = { from: string; to: string; depts: string[] };

/** rows narrowed to the chosen department (only reports that have a department column can be narrowed) */
function filterRows(r: Report, f: Filters): string[][] {
  const di = r.cols.findIndex((c) => /^(department|dept)$/i.test(c));
  if (di < 0) return r.rows;
  return r.rows.filter((row) => f.depts.includes(row[di]));
}

function saveBlob(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadCsv(r: Report, rows: string[][], meta: string[]) {
  const q = (c: string) => `"${c.replace(/"/g, '""')}"`;
  const lines = [[r.title], ...meta.map((m) => [m]), [], r.cols, ...rows].map((row) => row.map(q).join(","));
  saveBlob(new Blob([lines.join("\n")], { type: "text/csv" }), `${r.key}-report.csv`);
}

/** minimal dependency-free PDF (Helvetica, A4, paginated table) */
function downloadPdf(r: Report, rows: string[][], meta: string[]) {
  const esc = (t: string) =>
    t.replace(/[\u2013\u2014]/g, "-").replace(/\u2192/g, "->").replace(/[\\()]/g, (c) => "\\" + c).replace(/[^\x20-\x7e]/g, (c) => (c.charCodeAt(0) < 256 ? "\\" + c.charCodeAt(0).toString(8).padStart(3, "0") : "?"));
  const W = 595, H = 842, M = 40, usable = W - M * 2;
  const colW = usable / r.cols.length;
  const fit = (t: string, size: number) => { const max = Math.max(3, Math.floor(colW / (size * 0.5)) - 1); return t.length > max ? t.slice(0, max - 1) + "..." : t; };
  const rowH = 20;
  const perPage = Math.floor((H - M * 2 - 90) / rowH);
  const pages: string[] = [];
  for (let start = 0, pg = 0; start < Math.max(rows.length, 1); start += perPage, pg++) {
    let y = H - M;
    let c = "";
    if (pg === 0) {
      c += `BT /F2 16 Tf ${M} ${y} Td (${esc(r.title)}) Tj ET\n`;
      y -= 18;
      meta.forEach((m) => { c += `BT /F1 9 Tf 0.4 g ${M} ${y} Td (${esc(m)}) Tj ET 0 g\n`; y -= 12; });
      y -= 12;
    }
    c += `0.95 g ${M} ${y - 6} ${usable} ${rowH} re f 0 g\n`;
    r.cols.forEach((h, i) => { c += `BT /F2 9 Tf ${M + i * colW + 6} ${y} Td (${esc(fit(h.toUpperCase(), 9))}) Tj ET\n`; });
    y -= rowH;
    rows.slice(start, start + perPage).forEach((row) => {
      row.forEach((cell, i) => { c += `BT /F1 9 Tf ${M + i * colW + 6} ${y} Td (${esc(fit(cell, 9))}) Tj ET\n`; });
      c += `0.88 G ${M} ${y - 6} m ${W - M} ${y - 6} l S 0 G\n`;
      y -= rowH;
    });
    c += `BT /F1 8 Tf 0.5 g ${M} 24 Td (Page ${pg + 1}) Tj ET\n`;
    pages.push(c);
  }
  const objs: string[] = [];
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objs[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
  pages.forEach((content, i) => {
    objs[5 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`;
    objs[6 + i * 2] = `<< /Length ${content.length} >>\nstream\n${content}endstream`;
  });
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 1; i < objs.length; i++) { offsets[i] = out.length; out += `${i} 0 obj\n${objs[i]}\nendobj\n`; }
  const xref = out.length;
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n` + offsets.slice(1).map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  saveBlob(new Blob([bytes], { type: "application/pdf" }), `${r.key}-report.pdf`);
}

export default function Reports() {
  const { manager, scopeDepts, inScope } = usePersona();
  // hotel-wide reports (guest origin, compensation) stay with the General Manager
  const list = manager ? [...REPORTS.filter((r) => r.key !== "language" && r.key !== "compensation"), AUDIT_REPORT] : REPORTS;
  const scopeLabel = manager ? scopeDepts.join(", ") : "All departments";
  const [active, setActive] = useState<Report | null>(null);
  const [step, setStep] = useState<"filter" | "report">("filter");
  const deptOptions = manager ? scopeDepts : ["Housekeeping", "Front Desk", "Room Service", "Engineering", "Concierge", "Guest Services", "Food & Beverage"];
  const [filters, setFilters] = useState<Filters>({ from: daysAgo(6), to: daysAgo(0), depts: deptOptions });
  const [toast, setToast] = useState<string | null>(null);
  const allSelected = deptOptions.every((d) => filters.depts.includes(d));
  const deptLabel = allSelected ? "All departments" : filters.depts.join(", ");

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2000);
  };

  const run = (r: Report) => {
    if (r.key === "audit") {
      r = {
        ...r,
        rows: AUDIT.filter((a) => {
          const t = TASKS.find((x) => x.title === a.task);
          return !manager || (t && inScope(t.dept));
        }).map((a) => [a.time, a.who, a.action, a.task, a.detail]),
      };
    }
    setFilters({ from: daysAgo(6), to: daysAgo(0), depts: deptOptions });
    setStep("filter");
    setActive(r);
  };

  const reportRows = active ? filterRows(active, filters) : [];
  const meta = [`Period: ${niceDate(filters.from)} - ${niceDate(filters.to)}`, `Department: ${deptLabel}`, `Generated for: ${scopeLabel}`];
  const rangeOk = !!filters.from && !!filters.to && filters.from <= filters.to && filters.depts.length > 0;

  return (
    <>
      <Topbar title="Reports" subtitle={manager ? `Reports for ${scopeDepts.join(" + ")}` : "Generate and download operational reports"} actions={manager ? <ScopePicker /> : undefined} />
      <Page>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((r) => (
            <div key={r.key} className="relative flex flex-col rounded-card border border-line bg-white p-5 transition-colors hover:border-brand/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand/30 bg-brand-tint/40 text-brand">
                <r.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-ink">{r.title}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-snug text-ink-secondary">{r.desc}</p>
              <button onClick={() => run(r)} className="mt-4 flex items-center gap-1.5 self-start text-[13px] font-semibold text-brand hover:underline">
                {LABEL[r.action]}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Page>

      {active && (
        <Overlay onClose={() => setActive(null)} title={active.title} wide={step === "report"}>
          {step === "filter" ? (
            <>
              <div className="space-y-5 p-6">
                <p className="text-[13px] text-ink-secondary">{active.desc}</p>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-ink">Date range</span>
                    <div className="flex gap-1.5">
                      {RANGE_PRESETS.map((pr) => (
                        <button key={pr.label} onClick={() => setFilters((f) => ({ ...f, from: pr.from(), to: pr.to() }))} className="rounded-full bg-subtle px-2.5 py-1 text-[11px] font-medium text-ink-secondary hover:bg-line/60">{pr.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="From"><Input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} /></Field>
                    <Field label="To"><Input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} /></Field>
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-ink">Departments</span>
                    <span className="text-[11px] text-ink-tertiary">{allSelected ? "All selected" : `${filters.depts.length} selected`}</span>
                  </div>
                  <div className="space-y-1.5">
                    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium text-ink ${allSelected ? "border-brand bg-brand-tint/40" : "border-line hover:bg-subtle"}`}>
                      <input type="checkbox" className="h-4 w-4 accent-brand" checked={allSelected} onChange={(e) => setFilters((f) => ({ ...f, depts: e.target.checked ? deptOptions : [] }))} />
                      All departments
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {deptOptions.map((d) => {
                        const on = filters.depts.includes(d);
                        return (
                          <label key={d} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[13px] text-ink ${on ? "border-brand bg-brand-tint/40" : "border-line hover:bg-subtle"}`}>
                            <input type="checkbox" className="h-4 w-4 accent-brand" checked={on} onChange={(e) => setFilters((f) => ({ ...f, depts: e.target.checked ? [...f.depts, d] : f.depts.filter((x) => x !== d) }))} />
                            {d}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-line px-6 py-3.5">
                <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
                <Button onClick={() => setStep("report")} disabled={!rangeOk} className="disabled:opacity-40">Apply filter</Button>
              </div>
            </>
          ) : (
            <>
              <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-secondary">
                  <span><span className="text-ink-tertiary">Period</span> {niceDate(filters.from)} – {niceDate(filters.to)}</span>
                  <span><span className="text-ink-tertiary">{filters.depts.length === 1 ? "Department" : "Departments"}</span> {deptLabel}</span>
                  <span className="text-ink-tertiary">{reportRows.length} {reportRows.length === 1 ? "row" : "rows"}</span>
                </div>
                <div className="overflow-x-auto">
                  <ReportTable r={{ ...active, rows: reportRows }} />
                </div>
                {!reportRows.length && <p className="pt-4 text-center text-[13px] text-ink-tertiary">Nothing to report for this filter.</p>}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-line px-6 py-3.5">
                <Button variant="outline" onClick={() => setStep("filter")}><ChevronLeft className="h-4 w-4" /> Change filter</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { downloadCsv(active, reportRows, meta); flash("CSV downloaded"); }}>
                    <Download className="h-4 w-4" /> CSV
                  </Button>
                  <Button onClick={() => { downloadPdf(active, reportRows, meta); flash("PDF downloaded"); }}>
                    <FileText className="h-4 w-4" /> PDF
                  </Button>
                </div>
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
                <td key={j} className={`px-3 py-2.5 ${j === 0 ? "font-medium text-ink" : "text-ink-secondary"}`}>{c}</td>
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
