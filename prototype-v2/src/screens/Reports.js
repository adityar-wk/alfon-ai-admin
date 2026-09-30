function ManualTaskIntegrityOverlay({ onClose }) {
  const logs = window.auditLog || [];
  const flagged = logs.filter((r) => r.flags.length > 0);
  const mgmtCreated = logs.filter((r) => r.flags.includes("MANAGEMENT_CREATED"));

  const rowBg = (flags) => {
    if (flags.includes("UNUSUALLY_FAST")) return "#FEF2F2";
    if (flags.length > 0) return "#FFFBEB";
    return "transparent";
  };
  const rowBorder = (flags) => {
    if (flags.includes("UNUSUALLY_FAST")) return "3px solid #EF4444";
    if (flags.length > 0) return "3px solid #F59E0B";
    return "none";
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-6 py-4 flex items-center justify-between">
        <div className="font-display font-semibold text-lg" style={{ color: "#1A1A1A" }}>Manual Task Integrity Report</div>
        <div className="flex items-center gap-2">
          <button className="alfon-btn flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
            <Icon name="Download" size={13} /> Download PDF
          </button>
          <button className="alfon-btn flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
            <Icon name="Download" size={13} /> Download CSV
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1"><Icon name="X" size={18} color="#6B7280" /></button>
        </div>
      </div>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="rounded-lg px-4 py-3 text-sm" style={{ borderLeft: "4px solid #F59E0B", background: "#FFFBEB", color: "#92400E" }}>
          Manual tasks are a normal part of operations. This report highlights patterns worth reviewing, not proof of misconduct. Use it as a starting point for a conversation, not a conclusion.
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Manual Tasks", value: logs.length, color: "#1A1A1A" },
            { label: "% of All Tasks", value: "34%", color: "#1A1A1A" },
            { label: "Flagged as Suspicious", value: flagged.length, color: "#EF4444" },
            { label: "Created by Management", value: mgmtCreated.length, color: "#F59E0B" },
          ].map((s) => (
            <div key={s.label} className="alfon-card p-4">
              <div className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>{s.label}</div>
              <div className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="alfon-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                {["Date", "Task", "Room", "Department", "Created By", "Role", "Duration", "Flag"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 font-medium" style={{ color: "#9CA3AF", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((r) => (
                <tr key={r.taskId} style={{ borderBottom: "1px solid #F5F5F5", background: rowBg(r.flags), borderLeft: rowBorder(r.flags) }}>
                  <td className="py-2 px-3" style={{ color: "#6B7280" }}>{r.createdAt}</td>
                  <td className="py-2 px-3 font-medium" style={{ color: "#1A1A1A" }}>{r.taskTitle}</td>
                  <td className="py-2 px-3" style={{ color: "#6B7280" }}>{r.room}</td>
                  <td className="py-2 px-3" style={{ color: "#6B7280" }}>{r.department}</td>
                  <td className="py-2 px-3" style={{ color: "#1A1A1A" }}>{r.createdBy}</td>
                  <td className="py-2 px-3" style={{ color: "#6B7280" }}>{r.role}</td>
                  <td className="py-2 px-3" style={{ color: "#1A1A1A" }}>{r.actualDuration} min</td>
                  <td className="py-2 px-3">
                    <div className="flex flex-col gap-1">
                      {r.flags.includes("DUPLICATE") && <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: "#FFFBEB", color: "#F59E0B" }}>Duplicate</span>}
                      {r.flags.includes("UNUSUALLY_FAST") && <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: "#FEF2F2", color: "#EF4444" }}>Unusually Fast</span>}
                      {r.flags.includes("MANAGEMENT_CREATED") && <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: "#FFFBEB", color: "#F59E0B" }}>Mgmt Created</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SlaAdjustmentOverlay({ onClose }) {
  const logs = (window.slaAdjustmentLog || []).filter((r) => r.flags.includes("REDUCED_PAST_SLA"));
  const completionChanges = logs.filter((r) => r.field === "Completion Time");
  const slaTargetChanges = logs.filter((r) => r.field === "SLA Target");
  const mgmtChanges = logs.filter((r) => r.role === "GM");

  const rowBg = (flags) => {
    if (flags.includes("REDUCED_PAST_SLA")) return "#FEF2F2";
    if (flags.includes("SLA_EXTENDED_AFTER_START")) return "#FFFBEB";
    return "transparent";
  };
  const rowBorder = (flags) => {
    if (flags.includes("REDUCED_PAST_SLA")) return "3px solid #EF4444";
    if (flags.includes("SLA_EXTENDED_AFTER_START")) return "3px solid #F59E0B";
    return "none";
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 px-6 py-4 flex items-center justify-between">
        <div className="font-display font-semibold text-lg" style={{ color: "#1A1A1A" }}>SLA & Timing Adjustment Report</div>
        <div className="flex items-center gap-2">
          <button className="alfon-btn flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
            <Icon name="Download" size={13} /> Download PDF
          </button>
          <button className="alfon-btn flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
            <Icon name="Download" size={13} /> Download CSV
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 ml-1"><Icon name="X" size={18} color="#6B7280" /></button>
        </div>
      </div>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="rounded-lg px-4 py-3 text-sm" style={{ borderLeft: "4px solid #F59E0B", background: "#FFFBEB", color: "#92400E" }}>
          Timing corrections are often legitimate. This report exists to ensure every change is transparent and attributable, not to assume wrongdoing.
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Adjustments", value: logs.length, color: "#1A1A1A" },
            { label: "Completion Time Changes", value: completionChanges.length, color: "#1A1A1A" },
            { label: "SLA Target Changes", value: slaTargetChanges.length, color: "#1A1A1A" },
            { label: "Adjustments by Management", value: mgmtChanges.length, color: "#F59E0B" },
          ].map((s) => (
            <div key={s.label} className="alfon-card p-4">
              <div className="text-xs font-medium mb-1" style={{ color: "#9CA3AF" }}>{s.label}</div>
              <div className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div className="alfon-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
                {["Date/Time", "Task", "Room", "Field Changed", "From → To", "Changed By", "Role", "Flag"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 font-medium" style={{ color: "#9CA3AF", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #F5F5F5", background: rowBg(r.flags), borderLeft: rowBorder(r.flags) }}>
                  <td className="py-2 px-3" style={{ color: "#6B7280" }}>{r.dateTime}</td>
                  <td className="py-2 px-3 font-medium" style={{ color: "#1A1A1A" }}>{r.taskTitle}</td>
                  <td className="py-2 px-3" style={{ color: "#6B7280" }}>{r.room}</td>
                  <td className="py-2 px-3" style={{ color: "#6B7280" }}>{r.field}</td>
                  <td className="py-2 px-3" style={{ color: "#1A1A1A" }}>{r.fromVal} → {r.toVal}</td>
                  <td className="py-2 px-3" style={{ color: "#1A1A1A" }}>{r.changedBy}</td>
                  <td className="py-2 px-3" style={{ color: "#6B7280" }}>{r.role}</td>
                  <td className="py-2 px-3">
                    <div className="flex flex-col gap-1">
                      {r.flags.includes("REDUCED_PAST_SLA") && <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: "#FEF2F2", color: "#EF4444", fontWeight: 700 }}>Reduced Past SLA</span>}
                      {r.flags.includes("SLA_EXTENDED_AFTER_START") && <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit" style={{ background: "#FFFBEB", color: "#F59E0B" }}>SLA Extended</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const REPORT_DEFS = [
  { id: "action", title: "Action Report", icon: "Bell", desc: "All proactive guest actions flagged by Alfon AI — department, assignee, and completion status." },
  { id: "prearrival", title: "Pre-Arrival Preference Report", icon: "ClipboardCheck", desc: "Amenity preparation guide per arriving guest — dietary, minibar, room setup, and special requests.", download: true },
  { id: "task", title: "Task Report", icon: "ListChecks", desc: "Breakdown of all tasks by department, status, and response time." },
  { id: "complaint", title: "Complaint Report", icon: "AlertTriangle", desc: "Guest complaints logged, their category, and resolution status." },
  { id: "compensation", title: "Compensation Report", icon: "DollarSign", desc: "Compensation issued to guests with reason and approval trail." },
  { id: "team", title: "Team Performance Report", icon: "Users", desc: "Tasks completed, on-time rate, and workload by team member." },
  { id: "satisfaction", title: "Guest Satisfaction Report", icon: "Star", desc: "Satisfaction scores and trends across the selected period." },
  { id: "sla", title: "SLA Breach Report", icon: "ShieldAlert", desc: "Tasks that missed their SLA escalation window, by department." },
  { id: "response", title: "Response Time Report", icon: "Timer", desc: "Average and peak response times across departments and channels." },
  { id: "language", title: "Language & Guest Origin Report", icon: "Globe2", desc: "Guest nationality and preferred communication language distribution." },
];

function ReportCard({ def, onClick }) {
  return (
    <button onClick={onClick} className="alfon-card alfon-card-hover text-left p-5 w-full flex flex-col">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#FFFFFF", border: "1px solid rgba(232,98,58,0.25)" }}>
        <Icon name={def.icon} size={18} color="#E8623A" />
      </div>
      <div className="font-display font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>{def.title}</div>
      <div className="text-xs flex-1" style={{ color: "#6B7280" }}>{def.desc}</div>
      <div className="flex items-center gap-1 text-xs font-medium mt-3" style={{ color: "#E8623A" }}>
        {def.download ? <><Icon name="Download" size={13} /> Download</> : <>Generate <Icon name="ArrowRight" size={13} /></>}
      </div>
    </button>
  );
}

function TaskReportTable() {
  const rows = window.taskReportRows;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
          {["Department", "Total", "Completed", "Overdue", "Avg Response"].map((h) => (
            <th key={h} className="text-left py-2 font-medium" style={{ color: "#9CA3AF", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.department} style={{ borderBottom: "1px solid #F5F5F5" }}>
            <td className="py-2" style={{ color: "#1A1A1A" }}>{r.department}</td>
            <td className="py-2" style={{ color: "#1A1A1A" }}>{r.total}</td>
            <td className="py-2" style={{ color: "#22C55E" }}>{r.completed}</td>
            <td className="py-2" style={{ color: r.overdue > 20 ? "#EF4444" : "#6B7280" }}>{r.overdue}</td>
            <td className="py-2" style={{ color: "#6B7280" }}>{r.avgResponse}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CompensationReportTable() {
  const rows = window.compensationReports;
  const total = rows.reduce((a, r) => a + r.amount, 0);
  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
            {["Guest", "Room", "Type", "Amount", "Approved By", "Status"].map((h) => (
              <th key={h} className="text-left py-2 font-medium" style={{ color: "#9CA3AF", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
              <td className="py-2" style={{ color: "#1A1A1A" }}>{r.guest}</td>
              <td className="py-2" style={{ color: "#6B7280" }}>{r.room}</td>
              <td className="py-2" style={{ color: "#1A1A1A" }}>{r.type}</td>
              <td className="py-2" style={{ color: "#1A1A1A" }}>${r.amount}</td>
              <td className="py-2" style={{ color: "#6B7280" }}>{r.approvedBy}</td>
              <td className="py-2"><StatusBadge status={r.status === "Approved" ? "Completed" : "Pending"} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-2 text-sm font-display font-semibold" style={{ color: "#1A1A1A" }}>
        Total: ${total} USD
      </div>
    </>
  );
}

function ComplaintReportTable() {
  // Sourced live from window.tasks (category === "Complaint") so it reflects whatever
  // is currently marked as a guest complaint in the Tasks screen — plus historical
  // complaints already on record that predate the live task data.
  const liveRows = window.tasks
    .filter((t) => t.category === "Complaint")
    .map((t) => ({
      id: `task-${t.id}`,
      guest: t.guest,
      room: t.room,
      department: t.department,
      description: t.notes,
      status: t.status === "Completed" ? "Resolved" : t.status,
      compensation: t.compensation || null,
    }));
  const rows = [...liveRows, ...window.complaintReportRows.map((r) => ({ ...r, department: r.category }))];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
          {["Guest", "Room", "Department", "Description", "Comp.", "Status"].map((h) => (
            <th key={h} className="text-left py-2 font-medium" style={{ color: "#9CA3AF", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} style={{ borderBottom: "1px solid #F5F5F5" }}>
            <td className="py-2" style={{ color: "#1A1A1A" }}>{r.guest}</td>
            <td className="py-2" style={{ color: "#6B7280" }}>{r.room}</td>
            <td className="py-2" style={{ color: "#1A1A1A" }}>{r.department}</td>
            <td className="py-2" style={{ color: "#6B7280" }}>{r.description}</td>
            <td className="py-2" style={{ color: "#22C55E" }}>{r.compensation ? `$${r.compensation.amount}` : "—"}</td>
            <td className="py-2"><StatusBadge status={r.status === "Resolved" ? "Resolved" : r.status === "In Progress" ? "In Progress" : "Pending"} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ActionReportTable() {
  const rows = (window.guests || []).flatMap((g) => {
    const actions = g.actions || (g.handover && g.handover.active ? [{ reason: g.handover.reason, department: g.handover.role, assignedTo: g.handover.to, status: g.handover.status }] : []);
    return actions.map((a) => ({ guest: g.name, room: g.room, reason: a.reason, department: a.department, assignedTo: a.assignedTo, status: a.status }));
  });
  const statusStyle = (s) => {
    if (s === "Completed" || s === "Resolved") return { bg: "#DCFCE7", color: "#16A34A" };
    return { bg: "#FEF3C7", color: "#D97706" };
  };
  return (
    <table className="w-full text-sm">
      <thead>
        <tr style={{ borderBottom: "1px solid #F0F0F0" }}>
          {["Guest", "Room", "Action", "Department", "Assignee", "Status"].map((h) => (
            <th key={h} className="text-left py-2 font-medium" style={{ color: "#9CA3AF", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const ss = statusStyle(r.status);
          return (
            <tr key={i} style={{ borderBottom: "1px solid #F5F5F5" }}>
              <td className="py-2 font-medium" style={{ color: "#1A1A1A" }}>{r.guest}</td>
              <td className="py-2" style={{ color: "#6B7280" }}>{r.room}</td>
              <td className="py-2" style={{ color: "#374151", maxWidth: 240 }}>{r.reason}</td>
              <td className="py-2" style={{ color: "#6B7280" }}>{r.department}</td>
              <td className="py-2" style={{ color: "#6B7280" }}>{r.assignedTo}</td>
              <td className="py-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: ss.bg, color: ss.color }}>{r.status || "Pending"}</span>
              </td>
            </tr>
          );
        })}
        {rows.length === 0 && <tr><td colSpan={6} className="py-4 text-center text-sm" style={{ color: "#9CA3AF" }}>No actions logged for this period.</td></tr>}
      </tbody>
    </table>
  );
}

const PREVIEW_TABLES = {
  action: ActionReportTable,
  task: TaskReportTable,
  compensation: CompensationReportTable,
  complaint: ComplaintReportTable,
};

function ReportModal({ report, onClose }) {
  const [depts, setDepts] = React.useState([]);
  const [applied, setApplied] = React.useState(false);

  React.useEffect(() => { setApplied(false); setDepts([]); }, [report]);

  if (!report) return null;
  const PreviewTable = PREVIEW_TABLES[report.id];

  const toggleDept = (d) => {
    setDepts((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  };

  return (
    <Modal open={!!report} onClose={onClose} title={report.title} width="max-w-3xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Date Range</label>
            <input type="text" defaultValue="May 3 – May 9, 2026" className="w-full mt-1 px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }} />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Format</label>
            <select className="w-full mt-1 px-3 py-2 text-sm rounded-lg" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
              <option>PDF</option>
              <option>CSV</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Departments</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {window.DEPARTMENT_NAMES.map((d) => (
              <button
                key={d}
                onClick={() => toggleDept(d)}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: depts.includes(d) ? "#E8623A" : "#F5F5F5", color: depts.includes(d) ? "#FFFFFF" : "#6B7280" }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setApplied(true)}
          className="alfon-btn font-display font-semibold text-sm text-white px-4 py-2 rounded-lg"
          style={{ background: "#E8623A" }}
        >
          Apply Filters
        </button>

        {applied && (
          <div className="pt-3" style={{ borderTop: "1px solid #F0F0F0" }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9CA3AF" }}>Preview</div>
            {PreviewTable ? <PreviewTable /> : (
              <p className="text-sm" style={{ color: "#6B7280" }}>Preview generated for the selected range and departments — full report available via download.</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="alfon-btn text-sm font-medium px-4 py-2 rounded-lg" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
            Close
          </button>
          <button onClick={() => window.print()} className="alfon-btn flex items-center gap-1.5 text-sm font-display font-semibold text-white px-4 py-2 rounded-lg" style={{ background: "#E8623A" }}>
            <Icon name="Download" size={14} /> Download PDF
          </button>
          <button onClick={() => window.print()} className="alfon-btn flex items-center gap-1.5 text-sm font-display font-semibold px-4 py-2 rounded-lg" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
            <Icon name="Download" size={14} /> Download CSV
          </button>
        </div>
      </div>
    </Modal>
  );
}

function MgmtReportCard({ icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="alfon-card alfon-card-hover text-left p-5 w-full flex flex-col relative">
      <div className="absolute top-3 right-3 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#FFFBEB", color: "#F59E0B", border: "1px solid #FDE68A" }}>
        <Icon name="Lock" size={9} color="#F59E0B" /> GM Only
      </div>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#FFFFFF", border: "1px solid rgba(232,98,58,0.25)" }}>
        <Icon name={icon} size={18} color="#E8623A" />
      </div>
      <div className="font-display font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>{title}</div>
      <div className="text-xs flex-1" style={{ color: "#6B7280" }}>{desc}</div>
      <div className="flex items-center gap-1 text-xs font-medium mt-3" style={{ color: "#E8623A" }}>
        View Report <Icon name="ArrowRight" size={13} />
      </div>
    </button>
  );
}

function ReportsScreen() {
  const [activeReport, setActiveReport] = React.useState(null);
  const [showIntegrity, setShowIntegrity] = React.useState(false);
  const [showSla, setShowSla] = React.useState(false);

  return (
    <div>
      <Header title="Reports" subtitle="Generate and download operational reports" />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MgmtReportCard
            icon="ShieldAlert"
            title="Manual Task Integrity Report"
            desc="All manually created tasks, with automatic flagging of suspicious patterns for review."
            onClick={() => setShowIntegrity(true)}
          />
          <MgmtReportCard
            icon="History"
            title="SLA & Timing Adjustment Report"
            desc="Every change made to SLA targets or task completion times, with full attribution."
            onClick={() => setShowSla(true)}
          />
          {REPORT_DEFS.map((def) => (
            <ReportCard key={def.id} def={def} onClick={() => setActiveReport(def)} />
          ))}
        </div>
      </div>
      <ReportModal report={activeReport} onClose={() => setActiveReport(null)} />
      {showIntegrity && <ManualTaskIntegrityOverlay onClose={() => setShowIntegrity(false)} />}
      {showSla && <SlaAdjustmentOverlay onClose={() => setShowSla(false)} />}
    </div>
  );
}
window.ReportsScreen = ReportsScreen;
