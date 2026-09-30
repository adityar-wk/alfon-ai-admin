function formatMMSS(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function useSlaCountdown(slaMinutes, elapsedSecondsAtMount) {
  const totalSeconds = slaMinutes * 60;
  const [remaining, setRemaining] = React.useState(totalSeconds - elapsedSecondsAtMount);

  React.useEffect(() => {
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, []);

  return { remaining, totalSeconds };
}

function SlaCountdown({ task }) {
  if (task.status === "Completed" || !task.slaMinutes) {
    return (
      <div className="text-sm text-success font-medium flex items-center gap-1.5">
        <Icon name="CheckCircle2" size={15} /> SLA met
      </div>
    );
  }

  const { remaining, totalSeconds } = useSlaCountdown(task.slaMinutes, task.elapsedSeconds || 0);
  const overdue = remaining <= 0;
  const percentRemaining = (remaining / totalSeconds) * 100;

  let color = "#22C55E";
  let pulse = false;
  if (overdue) {
    color = "#EF4444";
    pulse = true;
  } else if (percentRemaining <= 25) {
    color = "#EF4444";
    pulse = true;
  } else if (percentRemaining <= 50) {
    color = "#F59E0B";
  }

  const barPercent = Math.max(0, Math.min(100, percentRemaining));

  return (
    <div>
      <div className="text-[11px] font-medium text-slate uppercase tracking-wide mb-1">SLA Target: {task.slaMinutes} minutes</div>
      {overdue ? (
        <div className={`font-display font-bold text-lg text-error ${pulse ? "sla-critical-pulse" : ""}`}>
          OVERDUE — {formatMMSS(Math.abs(remaining))} over SLA
        </div>
      ) : (
        <div className={`font-display font-bold text-3xl ${pulse ? "sla-critical-pulse" : ""}`} style={{ color }}>
          {formatMMSS(remaining)}
        </div>
      )}
      <div className="h-1.5 rounded-full bg-lightgray overflow-hidden mt-2">
        <div className="h-full rounded-full" style={{ width: `${overdue ? 0 : barPercent}%`, backgroundColor: color, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

function SlaCountdownCompact({ task }) {
  if (task.status === "Completed" || !task.slaMinutes) {
    return <span className="text-xs text-success font-medium flex items-center gap-1"><Icon name="CheckCircle2" size={12} /> SLA met</span>;
  }
  const { remaining, totalSeconds } = useSlaCountdown(task.slaMinutes, task.elapsedSeconds || 0);
  const overdue = remaining <= 0;
  const percentRemaining = (remaining / totalSeconds) * 100;
  let color = "#22C55E";
  if (overdue || percentRemaining <= 25) color = "#EF4444";
  else if (percentRemaining <= 50) color = "#F59E0B";

  return (
    <span className="text-xs font-display font-semibold flex items-center gap-1" style={{ color }}>
      <Icon name="Timer" size={12} />
      {overdue ? `+${formatMMSS(Math.abs(remaining))}` : formatMMSS(remaining)}
    </span>
  );
}

function NewTaskModal({ open, onClose, onCreate }) {
  const [form, setForm] = React.useState({
    title: "", department: "Housekeeping", guest: "", room: "", assignee: "", due: "", notes: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.title.trim()) return;
    onCreate({ ...form, id: Date.now(), status: "Pending" });
    setForm({ title: "", department: "Housekeeping", guest: "", room: "", assignee: "", due: "", notes: "" });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate">Task Title</label>
          <input value={form.title} onChange={set("title")} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-orange/30" placeholder="e.g. Airport Pickup" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate">Department</label>
            <select value={form.department} onChange={set("department")} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm">
              {window.DEPARTMENT_NAMES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate">Guest</label>
            <input value={form.guest} onChange={set("guest")} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm" placeholder="Search guest..." />
          </div>
          <div>
            <label className="text-xs font-medium text-slate">Room Number</label>
            <input value={form.room} onChange={set("room")} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm" placeholder="e.g. 1608" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate">Assigned To</label>
          <select value={form.assignee} onChange={set("assignee")} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm">
            <option value="">Select team member</option>
            {window.teamMembers.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate">Notes</label>
          <textarea value={form.notes} onChange={set("notes")} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm" placeholder="Additional context..." />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="alfon-btn px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-lightgray">Cancel</button>
          <button onClick={submit} className="alfon-btn px-4 py-2 text-sm font-medium rounded-lg bg-orange text-white hover:bg-orangeHover">Create Task</button>
        </div>
      </div>
    </Modal>
  );
}

function TaskTimeline({ task }) {
  const timeline = window.getTaskTimeline(task);
  return (
    <div className="space-y-4">
      {timeline.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center pt-0.5">
            <span className={step.done ? "text-orange" : "text-border"}>
              {step.done ? <Icon name="CheckCircle2" size={16} /> : <Icon name="Circle" size={16} />}
            </span>
            {i < timeline.length - 1 && <span className="w-px flex-1 bg-border mt-1" style={{ minHeight: 20 }} />}
          </div>
          <div className="pb-2">
            <div className={`text-sm font-medium ${step.done ? "text-darktext" : "text-slate"}`}>{step.label} — {step.time}</div>
            {step.desc && <div className="text-xs text-slate mt-0.5">{step.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DutyManagerNotice({ task }) {
  const dm = window.dutyManager;
  // Alfon AI auto-detects the complaint/service failure on open and notifies the duty
  // manager itself — no line-staff action required. Briefly shows "Notifying..." so the
  // automatic hand-off is visible, then settles into the confirmed state.
  const [notified, setNotified] = React.useState(false);

  React.useEffect(() => {
    setNotified(false);
    const id = setTimeout(() => setNotified(true), 700);
    return () => clearTimeout(id);
  }, [task.id]);

  return (
    <div className="border-t border-border/60 pt-4 mb-5">
      <div className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
        <Icon name="AlertTriangle" size={13} color="#DC2626" /> Guest Complaint Impact
      </div>
      <div className="rounded-lg px-3 py-3 mb-3 text-sm" style={{ background: "#FEF2F2", color: "#991B1B" }}>
        Alfon AI detected this as a guest complaint / service failure for <span className="font-semibold">{task.guest}</span>. It counts against the
        <span className="font-semibold"> Guest Pulse</span> and <span className="font-semibold">Recovery Rate</span> pillars of the
        Hotel Health Score and will lower the Guest Satisfaction score until resolved.
      </div>
      <div className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "#F5F5F5" }}>
        <div className="flex items-center gap-2 text-sm">
          <span className="w-7 h-7 rounded-full bg-orange text-white text-[10px] flex items-center justify-center font-display font-semibold">{dm.initials}</span>
          <div>
            <div className="font-medium text-darktext">{dm.name}</div>
            <div className="text-xs text-slate">{dm.role}</div>
          </div>
        </div>
        {notified ? (
          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "#22C55E" }}>
            <Icon name="CheckCircle2" size={14} /> Auto-notified by Alfon AI
          </span>
        ) : (
          <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#9CA3AF" }}>
            <Icon name="Loader" size={12} className="ai-pulse" /> Notifying duty manager...
          </span>
        )}
      </div>
    </div>
  );
}

function CompensationSection({ task }) {
  const existing = task.compensation;
  const [type, setType] = React.useState(existing ? existing.type : "Chocolate Cake — $10");
  const [reason, setReason] = React.useState(existing ? existing.reason : "");
  const [approvedBy, setApprovedBy] = React.useState(existing ? existing.approvedBy : "");
  const [submitted, setSubmitted] = React.useState(!!existing);

  return (
    <div className="border-t border-border/60 pt-4 mb-5">
      <div className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
        <Icon name="DollarSign" size={13} color="#22C55E" /> Guest Compensation
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate">Compensation Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm">
            {[
              "Chocolate Cake — $10",
              "Fruit Platter — $10",
              "Date Box — $10",
              "Non-Alcoholic Sparkling Beverage — $10",
              "Prosecco — $20",
              "Champagne — $50",
              "Resort Credit — $500",
              "Resort Credit — $1,000",
            ].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-orange/30" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate">Approved By</label>
          <select value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm">
            <option value="">Select designation...</option>
            {[
              "Front Office Manager",
              "Duty Manager",
              "F&B Manager",
              "Guest Relations Manager",
              "Housekeeping Manager",
              "General Manager",
            ].map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        {submitted && (
          <div className="flex justify-between text-sm"><span className="text-slate">Status</span><StatusBadge status="Completed" /></div>
        )}
        <button
          onClick={() => setSubmitted(true)}
          className="alfon-btn w-full py-2.5 rounded-lg font-display font-semibold text-sm text-white"
          style={{ background: "#22C55E" }}
        >
          {submitted ? "Compensation Logged" : "Submit Compensation"}
        </button>
      </div>
    </div>
  );
}

const VOID_REASONS = ["Task no longer required", "Duplicate", "Wrong info"];

function VoidReasonModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = React.useState(VOID_REASONS[0]);

  return (
    <Modal open={open} onClose={onClose} title="Void Task">
      <div className="space-y-3">
        <p className="text-sm text-slate">Please select a reason for voiding this task.</p>
        <div className="space-y-2">
          {VOID_REASONS.map((r) => (
            <label
              key={r}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border text-sm cursor-pointer hover:bg-lightgray"
            >
              <input type="radio" name="voidReason" checked={reason === r} onChange={() => setReason(r)} />
              <span className="text-darktext">{r}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="alfon-btn px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-lightgray">Cancel</button>
          <button
            onClick={() => onConfirm(reason)}
            className="alfon-btn px-4 py-2 text-sm font-medium rounded-lg text-white"
            style={{ background: "#9CA3AF" }}
          >
            Void Task
          </button>
        </div>
      </div>
    </Modal>
  );
}

function TaskDetailPanel({ task, onClose, onComplete, onVoid }) {
  const [notes, setNotes] = React.useState(task ? task.notes : "");
  const [voidModalOpen, setVoidModalOpen] = React.useState(false);
  React.useEffect(() => { if (task) setNotes(task.notes); }, [task && task.id]);

  if (!task) return null;
  const initial = (task.assignee || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const showCompensation = task.category === "Complaint" || task.escalated;
  const isVoid = task.status === "Void";

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <div className="bg-card w-full max-w-md h-full overflow-y-auto shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-darktext text-lg pr-4">{task.title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-lightgray shrink-0"><Icon name="X" size={18} className="text-slate" /></button>
        </div>
        <div className="flex items-center gap-2 mb-5">
          <StatusBadge status={task.status} />
          {task.category === "Complaint" && <ComplaintBadge />}
          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ml-auto" style={{ background: "#F5F5F5", color: "#9CA3AF" }}>#{String(task.id).padStart(3, "0")}</span>
        </div>

        <div className="alfon-card p-4 mb-5" style={{ background: "linear-gradient(180deg, #FFFBF8, #FFFFFF)" }}>
          <SlaCountdown task={task} />
        </div>

        {task.category === "Complaint" && <DutyManagerNotice task={task} />}

        {isVoid && task.voidReason && (
          <div className="rounded-lg px-3 py-3 mb-5 text-sm flex items-center gap-2" style={{ background: "#F5F5F5", color: "#6B7280" }}>
            <Icon name="Ban" size={14} color="#9CA3AF" />
            <span>Voided: <span className="font-medium text-darktext">{task.voidReason}</span></span>
          </div>
        )}

        <div className="border-t border-border/60 pt-4 mb-5">
          <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Task Timeline</div>
          <TaskTimeline task={task} />
        </div>

        <div className="border-t border-border/60 pt-4 mb-5 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate">Guest</span><span className="text-darktext font-medium">{task.guest}</span></div>
          <div className="flex justify-between"><span className="text-slate">Room</span><span className="text-darktext font-medium">{task.room}</span></div>
          <div className="flex justify-between"><span className="text-slate">Department</span><span className="text-darktext font-medium">{task.department}</span></div>
          <div className="flex justify-between items-center">
            <span className="text-slate">Assigned To</span>
            <span className="flex items-center gap-2 text-darktext font-medium">
              <span className="w-6 h-6 rounded-full bg-orange text-white text-[10px] flex items-center justify-center font-display">{initial}</span>
              {task.assignee}
            </span>
          </div>
        </div>

        <div className="border-t border-border/60 pt-4 mb-5">
          <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-orange/30"
          />
        </div>

        <div className="border-t border-border/60 pt-4 mb-6">
          <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Internal Notes</div>
          <div className="text-sm bg-lightgray rounded-lg px-3 py-2">
            <div className="text-xs text-slate mb-0.5">{task.timeline ? task.timeline[0].time : "09:48 AM"} — System</div>
            <div className="text-darktext">{task.notes}</div>
          </div>
        </div>

        {(() => {
          const editHistory = window.taskEditHistory && window.taskEditHistory[task.id];
          if (!editHistory || editHistory.length === 0) return null;
          return (
            <div className="border-t border-border/60 pt-4 mb-5">
              <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">Edit History</div>
              <div className="space-y-3">
                {editHistory.map((entry, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <div className="mt-1.5 shrink-0">
                      {entry.type === "create" ? (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#E8623A" }} />
                      ) : entry.type === "flagged" ? (
                        <Icon name="AlertTriangle" size={10} color="#F59E0B" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#D1D5DB" }} />
                      )}
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: entry.type === "flagged" ? "#F59E0B" : "#1A1A1A" }}>
                        {entry.label}
                        {entry.type === "flagged" && <Icon name="AlertTriangle" size={12} color="#F59E0B" className="ml-1 inline" />}
                      </div>
                      <div className="text-xs text-slate">{entry.time}{entry.editedBy ? ` · ${entry.editedBy}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {showCompensation && <CompensationSection task={task} />}

        <div className="space-y-2">
          {task.status !== "Completed" && !isVoid && (
            <button onClick={() => onComplete(task.id)} className="alfon-btn w-full py-2.5 rounded-lg bg-success text-white font-medium text-sm hover:bg-success/90">
              Mark as Complete
            </button>
          )}
          <div className="flex gap-2">
            <button className="alfon-btn flex-1 py-2.5 rounded-lg border border-border text-darktext font-medium text-sm hover:bg-lightgray">
              Reassign Task
            </button>
            <button className="alfon-btn flex-1 py-2.5 rounded-lg border border-border text-darktext font-medium text-sm hover:bg-lightgray">
              Add Note
            </button>
          </div>
          {!isVoid && (
            <button
              onClick={() => setVoidModalOpen(true)}
              className="alfon-btn w-full py-2.5 rounded-lg border border-border font-medium text-sm hover:bg-lightgray"
              style={{ color: "#9CA3AF" }}
            >
              Void Task
            </button>
          )}
        </div>
      </div>

      <VoidReasonModal
        open={voidModalOpen}
        onClose={(e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          setVoidModalOpen(false);
        }}
        onConfirm={(reason) => {
          onVoid(task.id, reason);
          setVoidModalOpen(false);
        }}
      />
    </div>
  );
}

function TaskCard({ task, onClick }) {
  return (
    <button
      onClick={onClick}
      className="alfon-card alfon-card-hover text-left p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5">
          {task.compensation && (
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#F0FDF4", color: "#22C55E" }} title="Compensation logged">$</span>
          )}
          <span className="text-[11px] text-slate uppercase tracking-wide">{task.department}</span>
        </span>
        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: "#F5F5F5", color: "#9CA3AF" }}>#{String(task.id).padStart(3, "0")}</span>
      </div>
      {task.category === "Complaint" && <div className="mb-2"><ComplaintBadge /></div>}
      <div className={`font-display font-semibold text-darktext mb-1 ${task.status === "Completed" ? "line-through opacity-60" : ""}`}>{task.title}</div>
      <div className="text-sm text-slate mb-4">{task.guest}</div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate">Room {task.room}</span>
        <SlaCountdownCompact task={task} />
      </div>
    </button>
  );
}

function TasksScreen() {
  const [tasks, setTasks] = React.useState(window.tasks);
  const syncTasks = (updater) => {
    setTasks((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      window.tasks = next;
      return next;
    });
  };
  const [filter, setFilter] = React.useState("All");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [view, setView] = React.useState("list");
  const [showVoided, setShowVoided] = React.useState(false);

  React.useEffect(() => {
    if (window.pendingTaskId != null) {
      const match = tasks.find((t) => t.id === window.pendingTaskId);
      if (match) setSelected(match);
      window.pendingTaskId = null;
    }
  }, []);

  const filters = ["All", "New Task", "In Progress", "Completed", "Complaints", "My Tasks"];

  const voided = tasks.filter((t) => t.status === "Void");

  const filtered = tasks.filter((t) => {
    if (t.status === "Void") return false;
    if (filter === "All" || filter === "My Tasks") return true;
    if (filter === "New Task") return !t.assignee || t.assignee === "";
    if (filter === "Complaints") return t.category === "Complaint";
    return t.status === filter;
  });

  const complete = (id) => {
    syncTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: "Completed" } : t)));
    setSelected((s) => (s && s.id === id ? { ...s, status: "Completed" } : s));
  };

  const voidTask = (id, reason) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    syncTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status: "Void", voidReason: reason, voidedAt: now } : t)));
    setSelected((s) => (s && s.id === id ? { ...s, status: "Void", voidReason: reason, voidedAt: now } : s));
  };

  const create = (t) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newTask = {
      ...t,
      assignee: "",
      status: "Pending",
      slaMinutes: 10,
      elapsedSeconds: 0,
      createdAt: timeStr,
      due: t.due || timeStr,
      timeline: [
        { label: "Task created", time: timeStr, done: true },
        { label: "Claimed by team member", time: "Awaiting", done: false },
        { label: "In progress", time: "Pending", done: false },
        { label: "Completed", time: "Pending", done: false },
      ],
    };
    syncTasks((ts) => [newTask, ...ts]);
    setSelected(newTask);
  };

  return (
    <div>
      <Header title="Tasks" onNewTask={() => setModalOpen(true)} />
      <div className="pt-7 px-6 pb-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon="ListChecks" label="All Tasks" value={tasks.length} />
          <StatCard icon="Loader" label="In Progress" value={tasks.filter((t) => t.status === "In Progress").length} />
          <StatCard icon="Clock" label="Pending" value={tasks.filter((t) => t.status === "Pending").length} />
          <StatCard icon="CheckCircle2" label="Completed" value={tasks.filter((t) => t.status === "Completed").length} />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`alfon-btn px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  filter === f ? "bg-orange text-white" : "bg-white border border-border text-slate hover:bg-lightgray"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-lightgray rounded-full p-1">
            <button
              onClick={() => setView("list")}
              className={`alfon-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${view === "list" ? "bg-white shadow-sm text-darktext" : "text-slate"}`}
            >
              <Icon name="List" size={13} /> List
            </button>
            <button
              onClick={() => setView("cards")}
              className={`alfon-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${view === "cards" ? "bg-white shadow-sm text-darktext" : "text-slate"}`}
            >
              <Icon name="LayoutGrid" size={13} /> Cards
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card><EmptyState title="No urgent tasks right now." desc="Your team is on top of everything. ✨" /></Card>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t) => (
              <TaskCard key={t.id} task={t} onClick={() => setSelected(t)} />
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden p-0" hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-lightgray text-slate text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">#</th>
                    <th className="text-left px-4 py-3 font-medium">Task</th>
                    <th className="text-left px-4 py-3 font-medium">Guest</th>
                    <th className="text-left px-4 py-3 font-medium">Room</th>
                    <th className="text-left px-4 py-3 font-medium">Department</th>
                    <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                    <th className="text-left px-4 py-3 font-medium">SLA</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelected(t)}
                      className={`border-b border-border/60 cursor-pointer hover:bg-lightgray/60 transition-colors duration-200 strike-fade ${t.status === "Completed" ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: "#F5F5F5", color: "#9CA3AF" }}>#{String(t.id).padStart(3, "0")}</span>
                      </td>
                      <td className={`px-4 py-3 font-medium text-darktext ${t.status === "Completed" ? "line-through" : ""}`}>
                        <span className="flex items-center gap-1.5">
                          {t.title}
                          {t.compensation && (
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "#F0FDF4", color: "#22C55E" }} title="Compensation logged">$</span>
                          )}
                          {t.category === "Complaint" && <ComplaintBadge />}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate">{t.guest}</td>
                      <td className="px-4 py-3 text-slate">{t.room}</td>
                      <td className="px-4 py-3 text-slate">{t.department}</td>
                      <td className="px-4 py-3 text-slate">{t.assignee}</td>
                      <td className="px-4 py-3"><SlaCountdownCompact task={t} /></td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {voided.length > 0 && (
          <div>
            <button
              onClick={() => setShowVoided((v) => !v)}
              className="alfon-btn flex items-center gap-2 text-sm font-medium w-full text-left"
              style={{ color: "#6B7280" }}
            >
              <Icon name={showVoided ? "ChevronDown" : "ChevronRight"} size={15} color="#9CA3AF" />
              Voided Tasks
              <span
                className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "#F3F4F6", color: "#6B7280" }}
              >
                {voided.length}
              </span>
            </button>

            {showVoided && (
              <Card className="overflow-hidden p-0 mt-3" hover={false}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-lightgray text-slate text-xs uppercase tracking-wide">
                        <th className="text-left px-4 py-3 font-medium">#</th>
                        <th className="text-left px-4 py-3 font-medium">Task</th>
                        <th className="text-left px-4 py-3 font-medium">Guest</th>
                        <th className="text-left px-4 py-3 font-medium">Room</th>
                        <th className="text-left px-4 py-3 font-medium">Department</th>
                        <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                        <th className="text-left px-4 py-3 font-medium">Void Reason</th>
                        <th className="text-left px-4 py-3 font-medium">Voided At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voided.map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => setSelected(t)}
                          className="border-b border-border/60 cursor-pointer hover:bg-lightgray/60 transition-colors duration-200 opacity-60"
                        >
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ background: "#F5F5F5", color: "#9CA3AF" }}>#{String(t.id).padStart(3, "0")}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-darktext line-through">{t.title}</td>
                          <td className="px-4 py-3 text-slate">{t.guest}</td>
                          <td className="px-4 py-3 text-slate">{t.room}</td>
                          <td className="px-4 py-3 text-slate">{t.department}</td>
                          <td className="px-4 py-3 text-slate">{t.assignee}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "#F3F4F6", color: "#6B7280" }}>
                              {t.voidReason || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate">{t.voidedAt || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      <NewTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={create} />
      <TaskDetailPanel task={selected} onClose={() => setSelected(null)} onComplete={complete} onVoid={voidTask} />
    </div>
  );
}
window.TasksScreen = TasksScreen;
