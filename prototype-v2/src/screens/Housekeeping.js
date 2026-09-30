const STATUS_STYLE = {
  Clean: { bg: "bg-success/10", border: "border-success/30", dotColor: "#22C55E", label: "Clean & Ready" },
  InProgress: { bg: "bg-warning/10", border: "border-warning/30", dotColor: "#F59E0B", label: "In Progress" },
  Inspection: { bg: "bg-orange/10", border: "border-orange/30", dotColor: "#E8623A", label: "Needs Inspection" },
  OutOfService: { bg: "bg-slate/10", border: "border-slate/30", dotColor: "#6B7280", label: "Out of Service" },
};

function RoomCard({ room, onClick }) {
  const s = STATUS_STYLE[room.status];
  return (
    <button
      onClick={() => onClick(room)}
      className={`text-left p-3 rounded-lg border ${s.border} ${s.bg} hover:shadow-card hover:border-orange/30 transition-all duration-300`}
    >
      <div className="font-semibold text-sm text-darktext">Room {room.number}</div>
      {room.guest && <div className="text-xs text-slate truncate">{room.guest}</div>}
      <div className="text-xs text-slate truncate">{room.type}</div>
      {room.timer && (
        <div className="text-xs text-slate flex items-center gap-1 mt-1">
          <Icon name="Clock" size={11} /> {room.timer}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-xs font-medium mt-1.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dotColor }} />
        {s.label}
      </div>
    </button>
  );
}

function ChecklistPanel({ room, onClose, onSubmit }) {
  const [checked, setChecked] = React.useState(Array(window.checklistItems.length - 2).fill(true));

  if (!room) return null;
  const toggle = (i) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));
  const allDone = checked.every(Boolean);

  return (
    <Modal open={!!room} onClose={onClose} title={`Room ${room.number} — Occupied Room Cleaning`} width="max-w-md">
      <div className="text-sm text-slate mb-1">Housekeeper: Maria Santos</div>
      <div className="text-sm text-slate mb-4">Started: 10:23 AM &nbsp;|&nbsp; Timer: ⏱ 14:32</div>
      <div className="space-y-2 mb-5">
        {window.checklistItems.slice(0, -2).map((item, i) => (
          <label key={item} className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} className="mt-0.5 accent-orange" />
            <span className={checked[i] ? "text-darktext" : "text-slate"}>{item}</span>
          </label>
        ))}
        {window.checklistItems.slice(-2).map((item) => (
          <label key={item} className="flex items-start gap-2 text-sm">
            <input type="checkbox" disabled className="mt-0.5" />
            <span className="text-slate">{item}</span>
          </label>
        ))}
      </div>
      <button
        disabled={!allDone}
        onClick={() => { onSubmit(room.id); onClose(); }}
        className="w-full py-2.5 rounded-lg bg-orange text-white font-medium text-sm hover:bg-orangeHover transition-colors duration-200 disabled:opacity-40"
      >
        Submit for Inspection
      </button>
    </Modal>
  );
}

const LQA_CATEGORY_STYLE = {
  Cleanliness: { bg: "#F0F9FF", color: "#0369A1" },
  Sustainability: { bg: "#F0FDF4", color: "#16A34A" },
  Service: { bg: "#FFF7ED", color: "#C2410C" },
};

function LqaCategoryTag({ category }) {
  const s = LQA_CATEGORY_STYLE[category] || LQA_CATEGORY_STYLE.Cleanliness;
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 whitespace-nowrap" style={{ background: s.bg, color: s.color, borderRadius: 8 }}>
      {category}
    </span>
  );
}

function InspectionPanel({ room, onClose, onApprove, onFlag }) {
  const items = window.inspectionItems;
  const [checked, setChecked] = React.useState(() => Array(items.length).fill(false));

  React.useEffect(() => { if (room) setChecked(Array(items.length).fill(false)); }, [room && room.id]);

  if (!room) return null;
  const toggle = (i) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));
  const verifiedCount = checked.filter(Boolean).length;
  const allDone = verifiedCount === items.length;

  const sections = [
    { name: "Bedroom", items: items.filter((it) => it.section === "Bedroom") },
    { name: "Bathroom", items: items.filter((it) => it.section === "Bathroom") },
  ];

  return (
    <Modal open={!!room} onClose={onClose} title={`Room ${room.number} — LQA Room Inspection 2026–2028`} width="max-w-2xl">
      <div className="text-center mb-1">
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Leading Quality Assurance Standard</div>
      </div>
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-slate">Housekeeper: Maria Santos</span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#FFF4F0", color: "#E8623A" }}>
          <Icon name="Shield" size={12} /> Floor Supervisor
        </span>
      </div>

      <div className="sticky top-0 bg-card pb-3 mb-2" style={{ zIndex: 1 }}>
        <div className="flex items-center justify-between text-sm font-medium mb-1.5" style={{ color: "#1A1A1A" }}>
          <span>{verifiedCount} / {items.length} items verified</span>
          <span style={{ color: allDone ? "#22C55E" : "#9CA3AF" }}>{Math.round((verifiedCount / items.length) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F5F5F5" }}>
          <div className="h-full rounded-full" style={{ width: `${(verifiedCount / items.length) * 100}%`, background: "#E8623A", transition: "width 200ms ease" }} />
        </div>
      </div>

      <div className="mb-5" style={{ maxHeight: 420, overflowY: "auto" }}>
        {sections.map((section) => (
          <div key={section.name}>
            <div className="text-center my-3">
              <div style={{ borderTop: "1px solid #F0F0F0" }} />
              <div className="font-display font-bold text-xs uppercase tracking-widest -mt-2.5" style={{ color: "#1A1A1A" }}>
                <span className="bg-card px-3">{section.name}</span>
              </div>
            </div>
            {section.items.map((item, sIdx) => {
              const globalIdx = item.n - 1;
              const isChecked = checked[globalIdx];
              const isEven = item.n % 2 === 0;
              return (
                <label
                  key={item.n}
                  className="flex items-start gap-3 text-sm px-2 py-2.5 cursor-pointer"
                  style={{ background: isEven ? "#FAFAFA" : "#FFFFFF" }}
                >
                  <input type="checkbox" checked={isChecked} onChange={() => toggle(globalIdx)} className="mt-0.5 accent-orange shrink-0" />
                  <span className="text-xs shrink-0 w-5 text-right" style={{ color: "#9CA3AF" }}>{item.n}.</span>
                  <span className="flex-1" style={{ color: isChecked ? "#1A1A1A" : "#6B7280" }}>{item.text}</span>
                  <LqaCategoryTag category={item.category} />
                </label>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          disabled={!allDone}
          onClick={() => { onApprove(room.id); onClose(); }}
          title={!allDone ? "Complete all 36 LQA checks to approve room" : ""}
          className="flex-1 py-2.5 rounded-lg font-display font-semibold text-sm transition-colors duration-200"
          style={{ background: allDone ? "#E8623A" : "#F5F5F5", color: allDone ? "#FFFFFF" : "#9CA3AF", cursor: allDone ? "pointer" : "not-allowed" }}
        >
          Approve &amp; Clear Room
        </button>
        <button
          onClick={() => { onFlag(room.id); onClose(); }}
          className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors duration-200"
          style={{ border: "1.5px solid #DC2626", color: "#DC2626", background: "#FFFFFF" }}
        >
          Flag for Re-cleaning
        </button>
      </div>
    </Modal>
  );
}

function HousekeepingScreen() {
  const [rooms, setRooms] = React.useState(window.rooms);
  const [cleaningRoom, setCleaningRoom] = React.useState(null);
  const [inspectingRoom, setInspectingRoom] = React.useState(null);
  const [filterFloor, setFilterFloor] = React.useState("All");

  const stats = {
    total: rooms.length,
    clean: rooms.filter((r) => r.status === "Clean").length,
    inProgress: rooms.filter((r) => r.status === "InProgress").length,
    inspection: rooms.filter((r) => r.status === "Inspection").length,
    outOfService: rooms.filter((r) => r.status === "OutOfService").length,
  };

  const floors = ["All", ...Array.from(new Set(window.rooms.map((r) => r.floor))).sort()];
  const visibleRooms = filterFloor === "All" ? rooms : rooms.filter((r) => r.floor === filterFloor);

  const handleRoomClick = (room) => {
    if (room.status === "InProgress") setCleaningRoom(room);
    else if (room.status === "Inspection") setInspectingRoom(room);
  };

  const submitForInspection = (id) => setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, status: "Inspection", timer: null } : r)));
  const approveRoom = (id) => setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, status: "Clean" } : r)));
  const flagRoom = (id) => {
    setRooms((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      // Create a recleaning task in the global tasks list
      const newTask = {
        id: Date.now(),
        title: `Room Recleaning — Room ${r.number}`,
        description: `Room ${r.number} was flagged for recleaning during inspection. Please reclean and resubmit for inspection.`,
        status: "Open",
        priority: "High",
        department: "Housekeeping",
        assignedTo: r.assignedTo || "Housekeeping Team",
        room: r.number,
        guest: r.guest || "—",
        slaMinutes: 30,
        elapsedSeconds: 0,
        category: "Housekeeping",
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        compensation: null,
      };
      if (window.tasks) window.tasks.unshift(newTask);
      return { ...r, status: "InProgress", timer: "0 mins" };
    }));
  };

  return (
    <div>
      <Header title="Housekeeping" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon="BedDouble" label="Total Rooms" value={stats.total} />
          <StatCard icon="CheckCircle2" label="Clean & Ready" value={stats.clean} subColor="text-success" sub={`${Math.round((stats.clean/stats.total)*100)}%`} />
          <StatCard icon="Loader" label="In Progress" value={stats.inProgress} />
          <StatCard icon="AlertCircle" label="Needs Inspection" value={stats.inspection} subColor="text-orange" />
          <StatCard icon="Ban" label="Out of Service" value={stats.outOfService} />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {floors.map((f) => (
            <button
              key={f}
              onClick={() => setFilterFloor(f)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                filterFloor === f ? "bg-orange text-white" : "bg-white border border-border text-slate hover:bg-lightgray"
              }`}
            >
              {f === "All" ? "All Floors" : `Floor ${f}`}
            </button>
          ))}
        </div>

        <Card className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {visibleRooms.map((room) => (
              <RoomCard key={room.id} room={room} onClick={handleRoomClick} />
            ))}
          </div>
        </Card>
      </div>

      <ChecklistPanel room={cleaningRoom} onClose={() => setCleaningRoom(null)} onSubmit={submitForInspection} />
      <InspectionPanel room={inspectingRoom} onClose={() => setInspectingRoom(null)} onApprove={approveRoom} onFlag={flagRoom} />
    </div>
  );
}
window.HousekeepingScreen = HousekeepingScreen;
