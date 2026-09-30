// Alfon Staff Mobile App — Concierge view (Kenji Mori)
const { useState, useEffect, useRef } = React;

// ── Mobile SLA countdown ───────────────────────────────────────────
function MobileSla({ task, compact = false }) {
  const slaMinutes = task.slaMinutes || 10;
  const totalSeconds = slaMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds - (task.elapsedSeconds || 0));
  useEffect(() => {
    if (task.status === "Completed") return;
    const id = setInterval(() => setRemaining(r => r - 1), 1000);
    return () => clearInterval(id);
  }, [task.status]);
  if (task.status === "Completed") {
    return compact
      ? <span style={{ fontSize: 11, fontWeight: 700, color: "#16A34A" }}>SLA met</span>
      : <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A" }}>SLA met</span>;
  }
  const overdue = remaining <= 0;
  const pct = Math.max(0, Math.min(100, (remaining / totalSeconds) * 100));
  const color = overdue || pct <= 25 ? "#EF4444" : pct <= 50 ? "#F59E0B" : "#22C55E";
  const mm = Math.floor(Math.abs(remaining) / 60).toString().padStart(2, "0");
  const ss = (Math.abs(remaining) % 60).toString().padStart(2, "0");
  const label = overdue ? `+${mm}:${ss}` : `${mm}:${ss}`;
  if (compact) return <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 4 }}>SLA {slaMinutes} min · {overdue ? "Overdue" : label + " remaining"}</div>
      <div style={{ height: 4, borderRadius: 2, background: "#F0F0F0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${overdue ? 0 : pct}%`, background: color, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

// ── Staff profile ──────────────────────────────────────────────────
const TIM = { name: "Kenji", fullName: "Kenji Mori", initials: "KM", role: "Chief Concierge", department: "Concierge", id: "KM001" };

// ── Mobile task data ───────────────────────────────────────────────
const INITIAL_TASKS = [
  { id: "M001", title: "Private Transfer — Emma Davis",       guest: "Emma Davis",     guestInitials: "ED", room: "1608", department: "Concierge", priority: "High",   due: "Tomorrow 7:00 AM", status: "Open",      assignee: null,          icon: "Car",             hasChat: true,  notes: "Business Class SUV to Krabi Airport. 3 passengers. Pickup at 7:00 AM sharp. Guest requested bottled water on board." },
  { id: "M002", title: "Spa Booking — Isabella Rossi",        guest: "Isabella Rossi", guestInitials: "IR", room: "2104", department: "Concierge", priority: "Medium", due: "Today 12:00 PM",   status: "In Progress", assignee: "John S.",      icon: "Sparkles",        hasChat: false, notes: "Confirm 2:00 PM deep tissue massage. Therapist preference: Maria. VIP guest — handle with care." },
  { id: "M003", title: "Restaurant Reservation — James Wilson",guest: "James Wilson",  guestInitials: "JW", room: "2205", department: "Concierge", priority: "Medium", due: "Today 7:00 PM",    status: "Pending",     assignee: null,          icon: "UtensilsCrossed", hasChat: false, notes: "Table for 2 at rooftop restaurant. Birthday celebration — small cake requested. Window seating preferred." },
  { id: "M004", title: "Theatre Tickets — Olivia Brown",      guest: "Olivia Brown",   guestInitials: "OB", room: "1203", department: "Concierge", priority: "Low",    due: "Today 5:00 PM",    status: "Completed",   assignee: "Kenji Mori",  icon: "Ticket",          hasChat: false, notes: "2 tickets to Cape Town City Ballet. Collected from box office and delivered to room." },
  { id: "M005", title: "Wine Pairing — Liam Anderson",        guest: "Liam Anderson",  guestInitials: "LA", room: "2104", department: "Concierge", priority: "Low",    due: "Today 8:00 PM",    status: "Pending",     assignee: null,          icon: "Wine",            hasChat: false, notes: "Arrange sommelier for anniversary dinner. Guest prefers Bordeaux reds." },
];

// ── Task keyword detector ──────────────────────────────────────────
function detectTask(text) {
  const t = text.toLowerCase();
  if (t.includes("checkout") || t.includes("late check"))
    return { title: "Late Checkout — Emma Davis", icon: "Clock", priority: "Medium", due: "Tomorrow 12:00 PM", slaMinutes: 15, notes: `Guest requested late checkout. Message: "${text}"` };
  if (t.includes("dinner") || t.includes("restaurant") || t.includes("table") || t.includes("reservation"))
    return { title: "Restaurant Reservation — Emma Davis", icon: "UtensilsCrossed", priority: "High", due: "Today 7:00 PM", slaMinutes: 10, notes: `Guest requested a dinner reservation. Message: "${text}"` };
  if (t.includes("spa") || t.includes("massage") || t.includes("treatment"))
    return { title: "Spa Booking — Emma Davis", icon: "Sparkles", priority: "Medium", due: "Tomorrow 10:00 AM", slaMinutes: 15, notes: `Guest requested a spa treatment. Message: "${text}"` };
  if (t.includes("taxi") || t.includes("transfer") || t.includes("airport") || t.includes("car") || t.includes("pickup"))
    return { title: "Transport Request — Emma Davis", icon: "Car", priority: "High", due: "As requested", slaMinutes: 10, notes: `Guest requested transport. Message: "${text}"` };
  if (t.includes("pillow") || t.includes("towel") || t.includes("extra") || t.includes("blanket"))
    return { title: "Room Request — Emma Davis", icon: "Home", priority: "Low", due: "Immediate", slaMinutes: 10, notes: `Guest requested room items. Message: "${text}"` };
  return { title: "Guest Request — Emma Davis", icon: "ClipboardList", priority: "Medium", due: "Immediate", slaMinutes: 10, notes: `New request from guest. Message: "${text}"` };
}

// ── Transfer conversation (Emma Davis) ────────────────────────────
const TRANSFER_CHAT_INIT = [
  { id: 1, sender: "guest", content: "Hi, I'd like to arrange a private transfer to Krabi Airport tomorrow morning at 7:00 AM.", time: "Yesterday, 9:12 PM" },
  { id: 2, sender: "ai",    content: "Good evening, Ms. Davis. We would be delighted to arrange that for you. To ensure we select the most comfortable vehicle, could you let us know how many guests will be travelling and how many pieces of luggage you will have?", time: "Yesterday, 9:13 PM" },
  { id: 3, sender: "guest", content: "There will be 3 of us with 4 suitcases.", time: "Yesterday, 9:14 PM" },
  { id: 4, sender: "ai",    content: "Thank you, Ms. Davis. For 3 passengers and 4 suitcases, here are the options that would suit you best:\n\nBusiness Class SUV (up to 4 passengers, 4 bags) - THB 3,500\nVIP Mercedes Van (up to 7 passengers, 8 bags) - THB 4,500\n\nAll vehicles include a professional driver and complimentary still water on board. Which would you prefer?", time: "Yesterday, 9:15 PM" },
  { id: 5, sender: "guest", content: "The Business Class SUV please.", time: "Yesterday, 9:15 PM" },
  { id: 6, sender: "ai",    content: "Confirmed, Ms. Davis. I have arranged the following for you:\n\nPickup: Tomorrow at 7:00 AM\nVehicle: Business Class SUV\nPassengers: 3, Luggage: 4 pieces\nDestination: Krabi Airport\n\nOur Concierge team will send you a confirmation shortly.", time: "Yesterday, 9:16 PM" },
  { id: 7, sender: "guest", content: "That's perfect, thank you!", time: "Yesterday, 9:16 PM" },
  { id: 8, sender: "ai",    content: "It is our pleasure, Ms. Davis. Is there anything else we can assist you with?", time: "Yesterday, 9:17 PM" },
  { id: 9, sender: "guest", content: "Yes, could you please tell me what time the restaurant opens for breakfast tomorrow?", time: "Yesterday, 10:10 PM" },
  { id: 10, sender: "ai",   content: "Good evening, Ms. Davis. The Cafe at Layana Resort & Spa opens for breakfast at 6:30 AM and serves until 10:30 AM. As your transfer departs at 7:00 AM, we would love to arrange a table for you at 6:30 AM, or we can prepare a to-go breakfast box if you would prefer something lighter on the way.", time: "Yesterday, 10:11 PM" },
  { id: 11, sender: "guest", content: "The to-go box actually sounds perfect, thank you!", time: "Yesterday, 10:12 PM" },
  { id: 12, sender: "ai",    content: "Wonderful. Could you let us know how many boxes you would need and if there is anything specific you would like included?", time: "Yesterday, 10:12 PM" },
  { id: 13, sender: "guest", content: "For 3 please. Orange juice, black coffee and donuts.", time: "Yesterday, 10:13 PM" },
  { id: 14, sender: "ai",    content: "Noted, Ms. Davis. Three breakfast boxes with orange juice, black coffee and donuts will be ready for your 7:00 AM departure. Please do not hesitate to reach out if there is anything else we can arrange before you leave.", time: "Yesterday, 10:13 PM" },
];

// ── Icon wrapper (uses lucide UMD imperatively, same as main app) ──
function Icon({ name, size = 18, color = "currentColor" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = "";
    const iconNode = window.lucide[name];
    if (!iconNode) return;
    const svgEl = window.lucide.createElement(iconNode, {
      width: size, height: size, "stroke-width": 2, color: color || "currentColor",
    });
    ref.current.appendChild(svgEl);
  }, [name, size, color]);
  return <span ref={ref} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, flexShrink: 0 }} />;
}

// ── Badges ─────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = { High: ["#FEF2F2","#EF4444"], Medium: ["#FFFBEB","#F59E0B"], Low: ["#F0FDF4","#22C55E"], Open: ["#EFF6FF","#3B82F6"] };
  const [bg, color] = map[priority] || ["#F5F5F5","#6B7280"];
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{priority}</span>;
}

function StatusBadge({ status }) {
  const map = { "Open": ["#EFF6FF","#3B82F6"], "In Progress": ["#FFF7ED","#EA580C"], "Pending": ["#FFFBEB","#D97706"], "Completed": ["#F0FDF4","#16A34A"] };
  const [bg, color] = map[status] || ["#F5F5F5","#6B7280"];
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>{status}</span>;
}

// ── Task icon ──────────────────────────────────────────────────────
function TaskIcon({ name, size = 42 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: "#FFF4F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={name || "ClipboardList"} size={size * 0.43} color="#E8623A" />
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────
function Avatar({ initials, size = 36, bg = "#E8623A" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.33, flexShrink: 0, fontFamily: "Sora,sans-serif" }}>
      {initials}
    </div>
  );
}

// ── Bottom nav ─────────────────────────────────────────────────────
function BottomNav({ active, navigate }) {
  const items = [
    { key: "home",   icon: "Home",           label: "Home"   },
    { key: "tasks",  icon: "ClipboardList",  label: "Tasks"  },
    { key: "chats",  icon: "MessageSquare",  label: "Chats"  },
    { key: "guests", icon: "ContactRound",   label: "Guests" },
    { key: "more",   icon: "MoreHorizontal", label: "More"   },
  ];
  return (
    <nav style={{ background: "#fff", borderTop: "1px solid #F0F0F0", display: "flex", flexShrink: 0, paddingBottom: "env(safe-area-inset-bottom,8px)" }}>
      {items.map(item => {
        const on = active === item.key;
        return (
          <button key={item.key} onClick={() => navigate(item.key)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 0 6px", background: "none", border: "none", cursor: "pointer", gap: 2 }}>
            <Icon name={item.icon} size={22} color={on ? "#E8623A" : "#9CA3AF"} />
            <span style={{ fontSize: 10, fontWeight: 600, color: on ? "#E8623A" : "#9CA3AF" }}>{item.label}</span>
            {on && <div style={{ width: 4, height: 4, borderRadius: 2, background: "#E8623A" }} />}
          </button>
        );
      })}
    </nav>
  );
}

// ── Logo (mirrors main app: tries image asset, falls back to text) ─
function AlfonLogo({ height = 36 }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    const candidates = ["./public/assets/logo.png", "./public/assets/logo.svg"];
    let cancelled = false;
    (async () => {
      for (const path of candidates) {
        try {
          const r = await fetch(path, { method: "HEAD", cache: "no-store" });
          if (r.ok && !cancelled) { setSrc(path); return; }
        } catch (e) {}
      }
    })();
    return () => { cancelled = true; };
  }, []);
  if (src) {
    // The SVG has ~40% empty padding top & bottom; actual logo text is ~20% of image height.
    // Render the image at 5× the target height inside a clipped container so the text fills the space.
    const imgH = height * 5;
    return (
      <div style={{ height, overflow: "hidden", position: "relative", width: imgH * 0.9 }}>
        <img src={src} alt="Alfon" style={{
          height: imgH,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "block",
        }} />
      </div>
    );
  }
  return <span style={{ fontFamily: "Sora,sans-serif", fontWeight: 700, fontSize: height, color: "#1A1A1A", letterSpacing: "-2px", lineHeight: 1 }}>ALFON</span>;
}

// ═══════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", background: "linear-gradient(160deg,#FFF8F4 0%,#fff 55%)", overflowY: "auto" }}>
      <div style={{ marginBottom: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AlfonLogo height={64} />
      </div>

      <div style={{ width: "100%", borderRadius: 24, padding: 24, textAlign: "center", border: "1px solid #F0F0F0", boxShadow: "0 8px 32px rgba(0,0,0,0.07)", marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, margin: "0 auto 16px", background: "linear-gradient(135deg,#E8623A,#D4522D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", fontFamily: "Sora,sans-serif", boxShadow: "0 8px 24px rgba(232,98,58,0.35)" }}>
          {TIM.initials}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", marginBottom: 4 }}>Welcome back, {TIM.name}</div>
        <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 16 }}>{TIM.role}</div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFF4F0", color: "#E8623A", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 99 }}>
          <Icon name="ConciergeBell" size={12} color="#E8623A" />
          {TIM.department} Department
        </span>
      </div>

      <button onClick={onLogin}
        style={{ width: "100%", padding: "16px 0", borderRadius: 18, background: "linear-gradient(135deg,#E8623A,#D4522D)", color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "Sora,sans-serif", border: "none", cursor: "pointer", boxShadow: "0 10px 28px rgba(232,98,58,0.35)", marginBottom: 20 }}>
        Log In
      </button>
      <p style={{ fontSize: 12, color: "#9CA3AF" }}>Alfon Staff · Layana Resort & Spa</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════════════════════════════
function HomeScreen({ tasks, navigate, onTaskSelect }) {
  const [filter, setFilter] = useState("All");

  const newTasks  = tasks.filter(t => !t.assignee || t.assignee === "").length;
  const inProg    = tasks.filter(t => t.status === "In Progress").length;
  const done      = tasks.filter(t => t.status === "Completed").length;
  const complaints = tasks.filter(t => t.category === "Complaint").length;
  const myTasks   = tasks.filter(t => t.assignee === TIM.fullName).length;

  const filterCounts = { "All": tasks.length, "New Task": newTasks, "In Progress": inProg, "Completed": done, "Complaints": complaints, "My Tasks": myTasks };

  const filtered = tasks.filter(t => {
    if (filter === "All")        return t.status !== "Completed";
    if (filter === "New Task")   return !t.assignee || t.assignee === "";
    if (filter === "Complaints") return t.category === "Complaint";
    if (filter === "My Tasks")   return t.assignee === TIM.fullName;
    return t.status === filter;
  });

  const stats = [
    { icon: "ClipboardList", label: "Open Tasks",    value: String(newTasks + inProg), sub: `${inProg} in progress`, subColor: "#E8623A" },
    { icon: "MessageSquare", label: "Guest Chats",   value: "3",                       sub: "1 unread",               subColor: "#E8623A" },
    { icon: "Clock",         label: "Avg. Response", value: "3m 20s",                  sub: "↓ 8%",                   subColor: "#22C55E" },
    { icon: "CheckCircle2",  label: "Completed",     value: String(done),              sub: "today",                  subColor: "#22C55E" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 16, minHeight: 0 }}>
        {/* Top bar */}
        <div style={{ padding: "52px 20px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <AlfonLogo height={28} />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ width: 36, height: 36, borderRadius: 18, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", position: "relative" }}>
                <Icon name="Bell" size={17} color="#1A1A1A" />
                <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, background: "#E8623A", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
              </button>
              <button style={{ width: 36, height: 36, borderRadius: 18, background: "#E8623A", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                <Icon name="Plus" size={18} color="#fff" />
              </button>
            </div>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: "0 0 4px" }}>Good morning, {TIM.name} 👋</h1>
          <p style={{ fontSize: 14, color: "#6B7280", margin: 0 }}>Here's what's happening today</p>
        </div>

        {/* Stat cards 2×2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 20px 4px" }}>
          {stats.map(s => (
            <div key={s.label} style={{ borderRadius: 18, padding: 16, border: "1px solid #F0F0F0", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#FFF4F0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon name={s.icon} size={14} color="#E8623A" />
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.subColor, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* My Tasks */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: 0 }}>My Tasks</h2>
            <button onClick={() => navigate("tasks")} style={{ fontSize: 14, fontWeight: 600, color: "#E8623A", background: "none", border: "none", cursor: "pointer" }}>View all</button>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 12, paddingBottom: 4, scrollbarWidth: "none" }}>
            {["All","New Task","In Progress","Completed","Complaints","My Tasks"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                  background: filter === f ? "#E8623A" : "#F5F5F5",
                  color: filter === f ? "#fff" : "#6B7280" }}>
                {f} ({filterCounts[f] ?? 0})
              </button>
            ))}
          </div>

          {/* Task rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(t => (
              <button key={t.id} onClick={() => onTaskSelect(t)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", background: "#fff", cursor: "pointer", textAlign: "left", width: "100%" }}>
                <TaskIcon name={t.icon} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>Room {t.room}</div>
                  <MobileSla task={t} compact />
                </div>
                <Icon name="ChevronRight" size={16} color="#9CA3AF" />
              </button>
            ))}
          </div>
        </div>

        {/* Concierge Team Performance */}
        <div style={{ padding: "20px 20px 24px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: "0 0 12px" }}>Concierge Team Today</h2>
          <div style={{ borderRadius: 18, border: "1px solid #F0F0F0", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            {[
              { name: "Kenji Mori",  role: "Chief Concierge",  completed: 2, inProgress: 2, status: "On Duty", me: true  },
              { name: "John S.",     role: "Senior Concierge", completed: 5, inProgress: 1, status: "On Duty", me: false },
              { name: "Maria L.",    role: "Concierge Agent",  completed: 3, inProgress: 2, status: "On Duty", me: false },
              { name: "David K.",    role: "Concierge Agent",  completed: 0, inProgress: 0, status: "Off Duty",me: false },
            ].map((m, i, arr) => {
              const total = m.completed + m.inProgress;
              const pct = total > 0 ? Math.round((m.completed / total) * 100) : 0;
              const initials = m.name.split(" ").map(p => p[0]).join("").slice(0, 2);
              return (
                <div key={m.name} style={{ padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid #F0F0F0" : "none", background: m.me ? "#FFF8F6" : "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: m.status === "On Duty" ? 8 : 0 }}>
                    <Avatar initials={initials} size={34} bg={m.status === "On Duty" ? "#E8623A" : "#9CA3AF"} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", display: "flex", alignItems: "center", gap: 6 }}>
                        {m.name}
                        {m.me && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: "#FFF4F0", color: "#E8623A" }}>You</span>}
                      </div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.role}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: m.status === "On Duty" ? "#22C55E" : "#9CA3AF" }}>{m.status}</div>
                      {m.status === "On Duty" && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.completed}/{total} done</div>}
                    </div>
                  </div>
                  {m.status === "On Duty" && total > 0 && (
                    <div style={{ height: 4, borderRadius: 2, background: "#F0F0F0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#22C55E" : "#E8623A", borderRadius: 2, transition: "width 0.6s ease" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
      <BottomNav active="home" navigate={navigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TASKS LIST SCREEN
// ═══════════════════════════════════════════════════════════════════
function TasksListScreen({ tasks, navigate, onTaskSelect }) {
  const [filter, setFilter] = useState("All");

  const filtered = tasks.filter(t => {
    if (filter === "All")        return true;
    if (filter === "New Task")   return !t.assignee || t.assignee === "";
    if (filter === "Complaints") return t.category === "Complaint";
    if (filter === "My Tasks")   return t.assignee === TIM.fullName;
    return t.status === filter;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div style={{ padding: "52px 20px 16px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: "0 0 2px" }}>Tasks</h1>
        <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Concierge Department · {tasks.length} total</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 20px", scrollbarWidth: "none" }}>
          {["All","New Task","In Progress","Completed","Complaints","My Tasks"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                background: filter === f ? "#E8623A" : "#F5F5F5",
                color: filter === f ? "#fff" : "#6B7280" }}>
              {f}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(t => (
            <button key={t.id} onClick={() => onTaskSelect(t)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, border: "1px solid #F0F0F0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", background: "#fff", cursor: "pointer", textAlign: "left", width: "100%" }}>
              <TaskIcon name={t.icon} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", flex: 1, lineHeight: 1.3 }}>{t.title}</div>
                  <StatusBadge status={t.status} />
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>Room {t.room}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <MobileSla task={t} compact />
                  {t.assignee
                    ? <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 4 }}>· {t.assignee}</span>
                    : <span style={{ fontSize: 12, fontWeight: 600, color: "#E8623A", marginLeft: 4 }}>· Unassigned</span>
                  }
                </div>
              </div>
              <Icon name="ChevronRight" size={16} color="#9CA3AF" />
            </button>
          ))}
        </div>
      </div>
      <BottomNav active="tasks" navigate={navigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TASK DETAIL SCREEN
// ═══════════════════════════════════════════════════════════════════
function TaskDetailScreen({ task, onBack, onClaim, onOpenChat, onComplete, isClaimed }) {
  const isCompleted = task.status === "Completed";
  const claimed = isClaimed || task.assignee === TIM.fullName;

  const rows = [
    { icon: "User",          label: "Guest",       value: task.guest,                     highlight: false },
    { icon: "DoorOpen",      label: "Room",        value: task.room,                       highlight: false },
    { icon: "Bell",          label: "Department",  value: task.department,                 highlight: false },
    { icon: "UserCheck",     label: "Assigned To", value: task.assignee || "Unassigned",   highlight: !task.assignee },
    { icon: "Timer",         label: "SLA",         value: null,    slaComponent: true,      highlight: false },
  ];

  const btnBase = { width: "100%", padding: "15px 0", borderRadius: 18, fontWeight: 700, fontSize: 14, fontFamily: "Sora,sans-serif", border: "none", cursor: "pointer", marginBottom: 10 };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "52px 16px 16px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="ChevronLeft" size={20} color="#1A1A1A" />
        </button>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>Task Detail</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px", minHeight: 0 }}>
        {/* Task header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "#FFF4F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name={task.icon || "ClipboardList"} size={22} color="#E8623A" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: "0 0 8px", lineHeight: 1.25 }}>{task.title}</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <StatusBadge status={claimed && !isCompleted ? "In Progress" : task.status} />
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #F0F0F0", marginBottom: 16 }}>
          {rows.map((r, i) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < rows.length - 1 ? "1px solid #F0F0F0" : "none" }}>
              <Icon name={r.icon} size={14} color="#9CA3AF" />
              <span style={{ fontSize: 12, color: "#6B7280", width: 88, flexShrink: 0 }}>{r.label}</span>
              {r.slaComponent
                ? <span style={{ flex: 1 }}><MobileSla task={task} /></span>
                : <span style={{ fontSize: 14, fontWeight: 500, color: r.highlight ? "#E8623A" : "#1A1A1A", flex: 1 }}>{r.value}</span>
              }
            </div>
          ))}
        </div>

        {/* Notes */}
        {task.notes && (
          <div style={{ borderRadius: 16, padding: 16, background: "#FAFAFA", border: "1px solid #F0F0F0", marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Notes</div>
            <p style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 1.6, margin: 0 }}>{task.notes}</p>
          </div>
        )}

        {/* CTAs */}
        {!isCompleted && !claimed && (
          <button onClick={onClaim} style={{ ...btnBase, background: "#FFF4F0", color: "#E8623A", border: "1.5px solid rgba(232,98,58,0.35)" }}>
            Claim This Task
          </button>
        )}

        {claimed && !isCompleted && task.hasChat && (
          <button onClick={onOpenChat} style={{ ...btnBase, background: "linear-gradient(135deg,#E8623A,#D4522D)", color: "#fff", boxShadow: "0 8px 24px rgba(232,98,58,0.32)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="MessageSquare" size={16} color="#fff" />
            Open Guest Chat
          </button>
        )}

        {claimed && !isCompleted && (
          <button onClick={onComplete} style={{ ...btnBase, background: "#F0FDF4", color: "#16A34A", border: "1.5px solid #BBF7D0" }}>
            Mark as Complete
          </button>
        )}

        {isCompleted && (
          <div style={{ ...btnBase, background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 0, cursor: "default" }}>
            <Icon name="CheckCircle2" size={16} color="#16A34A" />
            Task Completed
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CHAT SCREEN
// ═══════════════════════════════════════════════════════════════════
function ChatScreen({ task, messages: initMsgs, onBack, onTaskComplete }) {
  const [messages,   setMessages]   = useState(initMsgs);
  const [input,      setInput]      = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [confirmMsg, setConfirmMsg] = useState(
    "Dear Ms. Davis, your Business Class SUV transfer to Krabi Airport has been confirmed for tomorrow at 7:00 AM. Your driver will be waiting at the hotel entrance and the charge of THB 3,500 will be added to your final bill at checkout. Please do not hesitate to reach out should you need anything else."
  );
  const [taskDone, setTaskDone] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMsg = (content, isStaff) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages(ms => [...ms, { id: Date.now(), sender: isStaff ? "staff" : "guest", content, time: `Today, ${now}` }]);
    setInput("");
  };

  const handleComplete = () => {
    sendMsg(confirmMsg, true);
    setShowModal(false);
    setTaskDone(true);
    onTaskComplete();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden", background: "#FAFAFA" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "52px 16px 12px", background: "#fff", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="ChevronLeft" size={20} color="#1A1A1A" />
        </button>
        <Avatar initials="ED" size={36} bg="#E8623A" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>Emma Davis</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Room 1608  ·  Private Transfer</div>
        </div>
        {task && !taskDone && (
          <button onClick={() => setShowModal(true)}
            style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 99, background: "#E8623A", color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
            Complete
          </button>
        )}
        {taskDone && (
          <span style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 99, background: "#F0FDF4", color: "#16A34A", fontSize: 12, fontWeight: 700 }}>✓ Done</span>
        )}
      </div>

      {/* Task banner */}
      {task && !taskDone && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#FFF4F0", borderBottom: "1px solid rgba(232,98,58,0.12)", flexShrink: 0 }}>
          <Icon name="ClipboardList" size={13} color="#E8623A" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#E8623A", flex: 1 }}>{task.title}</span>
          <MobileSla task={task} compact />
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} style={{ display: "flex", justifyContent: msg.sender === "guest" ? "flex-start" : "flex-end", alignItems: "flex-end", gap: 8 }}>
            {msg.sender === "guest" && <Avatar initials="ED" size={28} bg="#6B7280" />}
            <div style={{
              maxWidth: "78%", padding: "12px 14px",
              borderRadius: msg.sender === "guest" ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
              background: msg.sender === "guest" ? "#F0F0F0" : msg.sender === "ai" ? "linear-gradient(135deg,#FFF8F4,#FFF0E8)" : "#E8623A",
              border: msg.sender === "ai" ? "1px solid rgba(232,98,58,0.12)" : "none",
            }}>
              {msg.sender === "ai" && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#E8623A", marginBottom: 5 }}>
                  <Icon name="Sparkles" size={10} color="#E8623A" /> Alfon AI
                </div>
              )}
              {msg.sender === "staff" && (
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: 5 }}>{TIM.fullName} · Concierge</div>
              )}
              <p style={{ fontSize: 14, color: msg.sender === "staff" ? "#fff" : "#1A1A1A", margin: 0, whiteSpace: "pre-line", lineHeight: 1.5 }}>{msg.content}</p>
              <div style={{ fontSize: 10, color: msg.sender === "staff" ? "rgba(255,255,255,0.5)" : "#9CA3AF", marginTop: 5 }}>{msg.time}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      {!taskDone && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#fff", borderTop: "1px solid #F0F0F0", flexShrink: 0 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && input.trim()) { sendMsg(input.trim(), true); } }}
            placeholder="Type a message…"
            style={{ flex: 1, padding: "10px 16px", borderRadius: 99, fontSize: 14, background: "#F5F5F5", border: "none", outline: "none", color: "#1A1A1A" }}
          />
          <button onClick={() => input.trim() && sendMsg(input.trim(), true)}
            style={{ width: 40, height: 40, borderRadius: 20, background: input.trim() ? "#E8623A" : "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <Icon name="Send" size={15} color="#fff" />
          </button>
        </div>
      )}
      {taskDone && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 16px", background: "#F0FDF4", borderTop: "1px solid #BBF7D0", flexShrink: 0 }}>
          <Icon name="CheckCircle2" size={16} color="#16A34A" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#16A34A" }}>Task completed · Guest notified</span>
        </div>
      )}

      {/* Completion bottom sheet */}
      {showModal && (
        <div onClick={e => e.target === e.currentTarget && setShowModal(false)}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "16px 20px 32px" }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E5E7EB", margin: "0 auto 20px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="CheckCircle2" size={16} color="#16A34A" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: 0 }}>Complete Task</h3>
            </div>
            <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 16, marginLeft: 42 }}>Send a confirmation message to the guest and mark this task as complete.</p>

            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Message to Guest</div>
            <textarea
              value={confirmMsg}
              onChange={e => setConfirmMsg(e.target.value)}
              rows={5}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 14, fontSize: 14, background: "#F5F5F5", border: "1px solid #F0F0F0", outline: "none", color: "#1A1A1A", lineHeight: 1.5, resize: "none", marginBottom: 14, boxSizing: "border-box" }}
            />

            <button onClick={handleComplete}
              style={{ width: "100%", padding: "15px 0", borderRadius: 16, background: "linear-gradient(135deg,#E8623A,#D4522D)", color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Sora,sans-serif", border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(232,98,58,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
              <Icon name="Send" size={15} color="#fff" />
              Send &amp; Complete Task
            </button>
            <button onClick={() => setShowModal(false)}
              style={{ width: "100%", padding: "13px 0", borderRadius: 16, background: "#F5F5F5", color: "#6B7280", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CHATS LIST SCREEN
// ═══════════════════════════════════════════════════════════════════
function ChatsScreen({ navigate, onOpenTransferChat }) {
  const [filter, setFilter] = React.useState("All");
  const chats = [
    { guest: "Emma Davis",      initials: "ED", room: "1608", last: "✦ Your transfer is confirmed for 7:00 AM. Please do not hesitate to reach out if you need anything else.",         time: "9:17 PM",   unread: 0, status: "Active",      photo: "https://i.pravatar.cc/150?img=47", action: onOpenTransferChat },
    { guest: "Liam Anderson",   initials: "LA", room: "2104", last: "✦ Happy anniversary to you and Mrs. Anderson. We hope this evening is truly special.",                             time: "8:41 AM",   unread: 0, status: "Active",      photo: "https://i.pravatar.cc/150?img=11", action: null },
    { guest: "Olivia Brown",    initials: "OB", room: "1203", last: "✦ Your late checkout until 2:00 PM has been noted and passed to the Front Desk team for confirmation.",            time: "8:23 AM",   unread: 0, status: "Pending",     photo: "https://i.pravatar.cc/150?img=45", action: null },
    { guest: "James Wilson",    initials: "JW", room: "2205", last: "✦ The fitness centre opens at 6:00 AM daily. A towel and water will be ready for you at the entrance.",            time: "9:47 AM",   unread: 0, status: "Active",      photo: "https://i.pravatar.cc/150?img=53", action: null },
    { guest: "Ava Thompson",    initials: "AT", room: "1904", last: "✦ Your personal shopper appointment at Bergdorf Goodman is confirmed for 11:00 AM tomorrow.",                      time: "7:59 AM",   unread: 0, status: "Active",      photo: "https://i.pravatar.cc/150?img=48", action: null },
    { guest: "خالد المنصوري",   initials: "خم", room: "1710", last: "✦ تم تأكيد حجز العشاء في المطعم الرئيسي للساعة الثامنة مساءً. نتمنى لكم أمسية ممتعة.",                           time: "9:05 AM",   unread: 0, status: "Active",      photo: "https://i.pravatar.cc/150?img=33", action: null },
    { guest: "Sarah Mitchell",  initials: "SM", room: "TBC",  last: "✦ Your preferences have been noted and shared with our team. We look forward to welcoming you tomorrow.",          time: "7:31 AM",   unread: 0, status: "Pre-Arrival", photo: "https://i.pravatar.cc/150?img=44", action: null },
    { guest: "William Taylor",  initials: "WT", room: "1502", last: "✦ Extra towels have been sent to your room. Please let us know if there is anything else we can arrange.",         time: "Yesterday", unread: 0, status: "Resolved",    photo: "https://i.pravatar.cc/150?img=60", action: null },
    { guest: "Isabella Rossi",  initials: "IR", room: "2104", last: "✦ È stato un piacere averla con noi. Speriamo di rivederla presto all'Layana Resort & Spa.",                             time: "Yesterday", unread: 0, status: "Resolved",    photo: "https://i.pravatar.cc/150?img=41", action: null },
  ];

  const STATUS_COLORS = {
    "Active":      { bg: "#FFF4F0", color: "#E8623A" },
    "Pending":     { bg: "#FFFBEB", color: "#D97706" },
    "Pre-Arrival": { bg: "#EFF6FF", color: "#2563EB" },
    "Resolved":    { bg: "#F5F5F5", color: "#9CA3AF" },
  };

  const filters = ["All", "Active", "Pending", "Pre-Arrival", "Resolved"];
  const filtered = filter === "All" ? chats : chats.filter(c => c.status === filter);
  const unreadTotal = chats.reduce((s, c) => s + c.unread, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 12px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: 0 }}>Guest Chats</h1>
          {unreadTotal > 0 && (
            <span style={{ background: "#E8623A", color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99 }}>{unreadTotal} unread</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 12px" }}>Conversations assigned to you</p>
        {/* Filter pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ flexShrink: 0, padding: "5px 13px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                background: filter === f ? "#E8623A" : "#F5F5F5",
                color: filter === f ? "#fff" : "#6B7280" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {filtered.map((c) => {
          const sc = STATUS_COLORS[c.status] || { bg: "#F5F5F5", color: "#9CA3AF" };
          return (
            <button key={c.guest + c.room} onClick={() => c.action && c.action()}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 20px",
                background: c.unread ? "#FFFBF9" : "#fff",
                borderBottom: "1px solid #F0F0F0", border: "none",
                cursor: c.action ? "pointer" : "default", textAlign: "left" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {c.photo
                  ? <img src={c.photo} alt={c.initials} style={{ width: 46, height: 46, borderRadius: 23, objectFit: "cover", display: "block" }} />
                  : <Avatar initials={c.initials} size={46} bg={c.unread ? "#E8623A" : "#9CA3AF"} />
                }
                {c.unread > 0 && (
                  <span style={{ position: "absolute", top: -2, right: -2, width: 17, height: 17, borderRadius: 9, background: "#E8623A", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>{c.unread}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: c.unread ? 700 : 600, color: "#1A1A1A" }}>{c.guest}</span>
                  <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0, marginLeft: 8 }}>{c.time}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 13, color: c.unread ? "#1A1A1A" : "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontWeight: c.unread ? 500 : 400 }}>{c.last}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>Room {c.room}</span>
                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 99, background: sc.bg, color: sc.color, fontWeight: 600 }}>{c.status}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <BottomNav active="chats" navigate={navigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TEAM SCREEN
// ═══════════════════════════════════════════════════════════════════
function TeamScreen({ navigate }) {
  const team = [
    { name: "John S.",   role: "Senior Concierge", status: "On Duty",  tasks: 3, me: false },
    { name: "Maria L.",  role: "Concierge Agent",  status: "On Duty",  tasks: 2, me: false },
    { name: "David K.",  role: "Concierge Agent",  status: "Off Duty", tasks: 0, me: false },
    { name: "Kenji Mori", role: "Chief Concierge", status: "On Duty",  tasks: 2, me: true  },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div style={{ padding: "52px 20px 16px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: "0 0 2px" }}>Team</h1>
        <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Concierge Department</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
        {team.map(m => {
          const initials = m.name.split(" ").map(p => p[0]).join("");
          return (
            <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, border: m.me ? "1.5px solid rgba(232,98,58,0.3)" : "1px solid #F0F0F0", background: m.me ? "#FFF8F6" : "#fff" }}>
              <Avatar initials={initials} size={42} bg={m.status === "On Duty" ? "#E8623A" : "#9CA3AF"} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A", display: "flex", alignItems: "center", gap: 6 }}>
                  {m.name}
                  {m.me && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: "#FFF4F0", color: "#E8623A" }}>You</span>}
                </div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>{m.role}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: m.status === "On Duty" ? "#22C55E" : "#9CA3AF" }}>{m.status}</div>
                {m.tasks > 0 && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.tasks} tasks</div>}
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav active="team" navigate={navigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOUSEKEEPING CHECKLIST DATA
// ═══════════════════════════════════════════════════════════════════
const HK_ROOMS = [
  { number: "1201", type: "Deluxe Room",      guest: "Mr. Oliver Bennett",  status: "Needs Inspection" },
  { number: "1408", type: "Junior Suite",     guest: "Ms. Clara Fontaine",  status: "Needs Inspection" },
  { number: "1608", type: "Deluxe Room",      guest: "Ms. Emma Davis",      status: "Needs Inspection" },
  { number: "1710", type: "Classic Room",     guest: "Mr. Khalid Al-Mansouri", status: "Needs Inspection" },
  { number: "2104", type: "Signature Suite",  guest: "Mr. Liam Anderson",   status: "In Progress" },
];

const HK_CHECKLIST = [
  { section: "Bedroom", items: [
    "Carpet / floors clean and free of stains and dust",
    "Walls, doors and baseboards clean and free of marks",
    "Bed neatly made with fresh, stain-free linen",
    "Headboard and pillows clean and in excellent condition",
    "All upholstered furniture clean and free of stains",
    "All surfaces dusted and smear-free",
    "Mirrors and glass surfaces clean and streak-free",
    "Curtains and blinds clean and properly fitted",
    "Minibar restocked and inventory checked",
    "Television clean and correctly functioning",
    "All light fixtures working and dust-free",
    "Wastepaper bin clean and emptied",
    "Notepad and pen available by telephone",
    "Wardrobe and drawers clean and free of debris",
    "In-room collateral clean and neatly arranged",
    "Pre-arrival preferences in place (pillows, amenities, etc.)",
    "Water provided in glass bottles or eco-friendly containers",
    "Balcony clean and furniture neatly set (if applicable)",
  ]},
  { section: "Bathroom", items: [
    "Bathroom completely mould-free",
    "Floor, walls, doors and ceiling clean",
    "Shower, bath, sink and toilet clean and sanitised",
    "Showerhead and taps polished and free of lime scale",
    "Shower screen or door clean and streak-free",
    "All counters, shelves and soap dishes clean and dry",
    "Full set of unused amenities present and complete",
    "Tissues, toilet roll and spare roll available",
    "Two clean drinking glasses present",
    "Towels clean, unstained and in excellent repair",
    "Bathrobes and slippers clean and in excellent condition",
    "Wastepaper bin clean and emptied",
  ]},
];

// ═══════════════════════════════════════════════════════════════════
// HOUSEKEEPING ROOM LIST SCREEN
// ═══════════════════════════════════════════════════════════════════
function HousekeepingRoomListScreen({ navigate, rooms, onSelectRoom }) {

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div style={{ padding: "52px 20px 16px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: "0 0 2px" }}>Housekeeping</h1>
        <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>Room inspection checklist</p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
        {rooms.map((r) => (
          <button key={r.number} onClick={() => !r.done && onSelectRoom(r)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 18,
              border: r.done ? "1.5px solid #BBF7D0" : "1px solid #F0F0F0",
              background: r.done ? "#F0FDF4" : "#fff",
              cursor: r.done ? "default" : "pointer", textAlign: "left", width: "100%" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: r.done ? "#DCFCE7" : "#FFF4F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={r.done ? "CheckCircle2" : "BedDouble"} size={22} color={r.done ? "#16A34A" : "#E8623A"} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "Sora,sans-serif", color: r.done ? "#16A34A" : "#1A1A1A" }}>Room {r.number}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                  background: r.done ? "#DCFCE7" : r.status === "Needs Inspection" ? "#FFF4F0" : "#FFFBEB",
                  color: r.done ? "#16A34A" : r.status === "Needs Inspection" ? "#E8623A" : "#D97706" }}>
                  {r.done ? "Approved" : r.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 1 }}>{r.type}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF" }}>{r.guest}</div>
            </div>
            {!r.done && <Icon name="ChevronRight" size={16} color="#9CA3AF" />}
          </button>
        ))}
      </div>
      <BottomNav active="more" navigate={navigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// HOUSEKEEPING INSPECTION SCREEN
// ═══════════════════════════════════════════════════════════════════
function HousekeepingInspectionScreen({ room, onBack, onSubmit }) {
  const totalItems = HK_CHECKLIST.reduce((s, sec) => s + sec.items.length, 0);
  const [checked, setChecked] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((checkedCount / totalItems) * 100);

  const toggle = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = (flag) => {
    setFlagged(flag);
    setSubmitted(true);
    setTimeout(() => onSubmit(room, flag), 1200);
  };

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: flagged ? "#FEF2F2" : "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Icon name={flagged ? "AlertTriangle" : "CheckCircle2"} size={36} color={flagged ? "#DC2626" : "#16A34A"} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", marginBottom: 8, textAlign: "center" }}>
          {flagged ? "Flagged for Recleaning" : "Room Approved"}
        </div>
        <div style={{ fontSize: 14, color: "#6B7280", textAlign: "center" }}>
          {flagged ? "A recleaning task has been created and assigned to Housekeeping." : `Room ${room.number} has been marked as clean and ready.`}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "52px 16px 14px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
            <Icon name="ChevronLeft" size={20} color="#1A1A1A" />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A" }}>Room {room.number} · Housekeeping Checklist</div>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{room.type} · {room.guest}</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#F0F0F0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#16A34A" : "#E8623A", borderRadius: 3, transition: "width 0.3s ease" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? "#16A34A" : "#E8623A", minWidth: 36, textAlign: "right" }}>{checkedCount}/{totalItems}</span>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {HK_CHECKLIST.map((section) => (
          <div key={section.section}>
            {/* Section header */}
            <div style={{ padding: "14px 20px 8px", background: "#FAFAFA", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={section.section === "Bedroom" ? "BedDouble" : "Bath"} size={14} color="#E8623A" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#E8623A", textTransform: "uppercase", letterSpacing: "0.08em" }}>{section.section}</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>
                {section.items.filter((_, i) => checked[`${section.section}-${i}`]).length}/{section.items.length}
              </span>
            </div>
            {/* Items */}
            {section.items.map((item, i) => {
              const key = `${section.section}-${i}`;
              const isChecked = !!checked[key];
              return (
                <button key={key} onClick={() => toggle(key)}
                  style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 20px",
                    background: isChecked ? "#FAFFFE" : "#fff",
                    borderBottom: "1px solid #F5F5F5", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: isChecked ? "none" : "2px solid #D1D5DB",
                    background: isChecked ? "#16A34A" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    {isChecked && <Icon name="Check" size={13} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: isChecked ? "#6B7280" : "#1A1A1A",
                    textDecoration: isChecked ? "line-through" : "none", flex: 1 }}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        <div style={{ height: 16 }} />
      </div>

      {/* Action buttons */}
      <div style={{ padding: "12px 20px 28px", borderTop: "1px solid #F0F0F0", background: "#fff", flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => handleSubmit(false)}
          style={{ width: "100%", padding: "14px 0", borderRadius: 16, background: pct === 100 ? "linear-gradient(135deg,#16A34A,#15803D)" : "#F5F5F5",
            color: pct === 100 ? "#fff" : "#9CA3AF", fontWeight: 700, fontSize: 15, fontFamily: "Sora,sans-serif",
            border: "none", cursor: pct === 100 ? "pointer" : "default",
            boxShadow: pct === 100 ? "0 8px 24px rgba(22,163,74,0.28)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="CheckCircle2" size={16} color={pct === 100 ? "#fff" : "#9CA3AF"} />
          Approve Room
        </button>
        <button onClick={() => handleSubmit(true)}
          style={{ width: "100%", padding: "13px 0", borderRadius: 16, background: "#FEF2F2", color: "#DC2626",
            fontWeight: 600, fontSize: 14, border: "1.5px solid #FECACA", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Sora,sans-serif" }}>
          <Icon name="AlertTriangle" size={15} color="#DC2626" />
          Flag for Recleaning
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MORE SCREEN
// ═══════════════════════════════════════════════════════════════════
function MoreScreen({ navigate }) {
  const items = [
    { icon: "BedDouble",   label: "Housekeeping Checklist", sub: "Room inspection",  danger: false, action: () => navigate("housekeeping") },
    { icon: "Bell",        label: "Notifications",          sub: "2 new alerts",     danger: false, action: null },
    { icon: "Settings",    label: "Settings",               sub: "App preferences",  danger: false, action: null },
    { icon: "HelpCircle",  label: "Help & Support",         sub: "Get assistance",   danger: false, action: null },
    { icon: "LogOut",      label: "Sign Out",               sub: "",                 danger: true,  action: null },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      <div style={{ padding: "52px 20px 16px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: 0 }}>More</h1>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, background: "#FFF4F0", marginBottom: 6 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: "#E8623A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, fontFamily: "Sora,sans-serif" }}>{TIM.initials}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A" }}>{TIM.fullName}</div>
            <div style={{ fontSize: 12, color: "#E8623A" }}>{TIM.role} · {TIM.department}</div>
          </div>
        </div>
        {items.map(item => (
          <button key={item.label} onClick={() => item.action && item.action()}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 18,
              border: item.action && !item.danger ? "1px solid rgba(232,98,58,0.2)" : "1px solid #F0F0F0",
              background: item.action && !item.danger ? "#FFF8F6" : "#fff",
              cursor: "pointer", textAlign: "left", width: "100%" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10,
              background: item.danger ? "#FEF2F2" : item.action ? "#FFF4F0" : "#F5F5F5",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={item.icon} size={16} color={item.danger ? "#EF4444" : item.action ? "#E8623A" : "#6B7280"} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: item.action ? 600 : 500, color: item.danger ? "#EF4444" : "#1A1A1A" }}>{item.label}</div>
              {item.sub && <div style={{ fontSize: 12, color: "#9CA3AF" }}>{item.sub}</div>}
            </div>
            {!item.danger && <Icon name="ChevronRight" size={15} color={item.action ? "#E8623A" : "#9CA3AF"} />}
          </button>
        ))}
      </div>
      <BottomNav active="more" navigate={navigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GUEST DATA
// ═══════════════════════════════════════════════════════════════════
const MOBILE_GUESTS = [
  {
    id: 1, name: "Emma Davis", initials: "ED", photo: "https://i.pravatar.cc/150?img=47",
    room: "1608", roomType: "Deluxe Suite", status: "In-House", flag: "🇬🇧", nationality: "United Kingdom",
    phone: "+1 (555) 123-4567", email: "emma.davis@email.com",
    checkIn: "May 20, 2025", checkOut: "May 27, 2025", nights: 7,
    aiSummary: "Emma is a returning guest from London. She prefers high floors, values punctual and discreet service, and has previously requested private transfers. This is her 3rd stay at the property.",
    anticipatedNeeds: null,
    preferences: { room: "High floor, Firm pillow, Blackout curtains", dietary: "No shellfish, No nuts", language: "English", temperature: "Cool (20°C)", wakeup: "7:00 AM", minibar: "Sparkling water, Dark chocolate" },
    actions: null,
  },
  {
    id: 2, name: "James Wilson", initials: "JW", photo: "https://i.pravatar.cc/150?img=12",
    room: "2205", roomType: "Executive Room", status: "In-House", flag: "🇺🇸", nationality: "United States",
    phone: "+1 (555) 234-5678", email: "james.wilson@email.com",
    checkIn: "May 22, 2025", checkOut: "May 26, 2025", nights: 4,
    aiSummary: "James enquired about the fitness centre and confirmed he will be using it during his stay. Fitness is a clear priority for this guest.",
    anticipatedNeeds: "Wellness-focused guest. You may offer post-workout smoothies from Room Service and introduce the spa.",
    preferences: { room: "Quiet, away from elevator", dietary: "Vegetarian", language: "English", temperature: "Standard (22°C)", wakeup: "8:00 AM", minibar: "Standard inventory" },
    actions: null,
  },
  {
    id: 3, name: "Olivia Brown", initials: "OB", photo: "https://i.pravatar.cc/150?img=44",
    room: "1203", roomType: "Premium Room", status: "In-House", flag: "🇦🇺", nationality: "Australia",
    phone: "+1 (555) 345-6789", email: "olivia.brown@email.com",
    checkIn: "May 21, 2025", checkOut: "May 25, 2025", nights: 4,
    aiSummary: "Olivia has requested a late checkout until 4:00 PM. Request has been passed to Front Desk for confirmation. Ensure the team follows up with her promptly.",
    anticipatedNeeds: null,
    preferences: { room: "Mid floor", dietary: "None", language: "English", temperature: "Standard (22°C)", wakeup: "8:00 AM", minibar: "Sugar-free amenities" },
    actions: null,
  },
  {
    id: 4, name: "Liam Anderson", initials: "LA", photo: "https://i.pravatar.cc/150?img=13",
    room: "2104", roomType: "Corner Suite", status: "In-House", flag: "🇬🇧", nationality: "United Kingdom",
    phone: "+1 (555) 456-7890", email: "liam.anderson@email.com",
    checkIn: "May 20, 2025", checkOut: "May 24, 2025", nights: 4,
    aiSummary: "Liam is staying with his wife for their anniversary. Service recovery was handled swiftly after a noise disturbance. The GM arranged a complimentary rooftop dinner as an anniversary gesture.",
    anticipatedNeeds: null,
    preferences: { room: "High floor, corner suite, quiet", dietary: "None", language: "English", temperature: "Standard (22°C)", wakeup: "8:00 AM", minibar: "Standard inventory" },
    actions: null,
  },
  {
    id: 5, name: "Sarah Mitchell", initials: "SM", photo: "https://i.pravatar.cc/150?img=45",
    room: "2501", roomType: "Presidential Suite", status: "Pre-Arrival", flag: "🇫🇷", nationality: "France",
    phone: "+1 (555) 567-8901", email: "sarah.mitchell@email.com",
    checkIn: "May 25, 2025", checkOut: "Jun 2, 2025", nights: 5,
    aiSummary: "Sarah is arriving tomorrow for a restorative stay. She has requested rest and quiet above all else. A relaxation amenity and herbal tea have been arranged. Spa team to follow up gently only.",
    anticipatedNeeds: null,
    preferences: { room: "Quiet, high floor", dietary: "To be confirmed on arrival", language: "French, English", temperature: "Cool (20°C)", wakeup: "8:00 AM", minibar: "Herbal tea, relaxation amenity" },
    actions: null,
  },
  {
    id: 10, name: "Khalid Al-Mansouri", initials: "KA", photo: "https://i.pravatar.cc/150?img=59",
    room: "1710", roomType: "Deluxe Suite", status: "In-House", flag: "🇸🇦", nationality: "Saudi Arabia",
    phone: "+966 50 123 4567", email: "k.almansouri@email.com",
    checkIn: "May 24, 2025", checkOut: "May 27, 2025", nights: 3,
    aiSummary: "Khalid is travelling from Saudi Arabia with his family, including his 4-year-old daughter Mira. He prefers Arabic-language communication.",
    anticipatedNeeds: "Consider anticipating babysitting needs and have childcare options ready to offer upon arrival. Family-friendly activities and curated experiences can also be offered. Proactively offer a cot and bottle warmer, and show the family how to use the blackout curtains and place the room on DND.",
    preferences: { room: "High floor, King bed, City view", dietary: "Halal food only, No pork, No alcohol", language: "Arabic", temperature: "Warm (23°C)", wakeup: "7:30 AM", minibar: "Dates, Arabic coffee, Still water" },
    actions: [
      { reason: "An Arabic-speaking Front Desk team member must be present at the entrance to greet the guest.", department: "Front Desk", assignedTo: "Sarah Kim", status: "Pending" },
      { reason: "Please set the television language to Arabic before the guest checks in.", department: "Housekeeping", assignedTo: "Maria Santos", status: "Pending" },
    ],
  },
  {
    id: 6, name: "Ava Thompson", initials: "AT", photo: "https://i.pravatar.cc/150?img=49",
    room: "2501", roomType: "Junior Suite", status: "Checked Out", flag: "🇨🇦", nationality: "Canada",
    phone: "+1 (555) 678-9012", email: "ava.thompson@email.com",
    checkIn: "May 18, 2025", checkOut: "May 23, 2025", nights: 5,
    aiSummary: "Ava expressed genuine satisfaction with her room and overall experience. She is a content and relaxed guest who appreciates warm and attentive service.",
    anticipatedNeeds: null,
    preferences: { room: "Standard", dietary: "None", language: "English", temperature: "Standard (22°C)", wakeup: "8:00 AM", minibar: "Standard inventory" },
    actions: null,
  },
  {
    id: 11, name: "Philip Johnson", initials: "PJ", photo: "https://i.pravatar.cc/150?img=67",
    room: "Villa 4", roomType: "Beachfront Villa", status: "In-House", flag: "🇬🇧", nationality: "United Kingdom",
    phone: "+44 7700 900123", email: "philip.johnson@email.com",
    checkIn: "May 25, 2025", checkOut: "Jun 1, 2025", nights: 5,
    aiSummary: "Philip is travelling with his wife to celebrate their wedding anniversary. His wife follows a vegetarian diet. The couple has booked a couples spa treatment and a dinner reservation at the resort's signature restaurant Sarn.",
    anticipatedNeeds: "Look for opportunities to surprise the couple with thoughtful anniversary gestures throughout their stay.",
    preferences: { room: null, dietary: "Vegetarian (wife). Please ensure all menus clearly indicate vegetarian options.", language: null, temperature: null, wakeup: null, minibar: null },
    actions: null,
    itinerary: [
      { day: "Arrival Day", time: "2:00 PM",    label: "Airport Transfer",       detail: "Toyota Alphard Royal Lounge from Krabi Airport, tracking flight PG212 from Bangkok" },
      { day: "Arrival Day", time: "On Arrival", label: "Villa Welcome Setup",    detail: "Flowers, champagne, and personalised anniversary card in Villa 4" },
      { day: "Day 1",       time: "3:00 PM",    label: "Couples Journey Spa",    detail: "90-minute treatment at the resort spa" },
      { day: "Day 1",       time: "8:00 PM",    label: "Romantic Room Turndown", detail: "Rose petals, candles, champagne, fruit platter, and anniversary card" },
      { day: "Day 2",       time: "8:00 AM",    label: "Kayaking",               detail: "Double kayak from the beach pavilion" },
      { day: "Day 2",       time: "7:30 PM",    label: "Private Beach Dinner",   detail: "Candlelit dinner, vegetarian tasting menu, sommelier pairing" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// GUEST PROFILE SCREEN
// ═══════════════════════════════════════════════════════════════════
function GuestProfileScreen({ guest, onBack }) {
  const statusColor = guest.status === "In-House" ? "#22C55E" : guest.status === "Pre-Arrival" ? "#D97706" : "#9CA3AF";
  const statusBg    = guest.status === "In-House" ? "#F0FDF4"  : guest.status === "Pre-Arrival" ? "#FFFBEB"  : "#F5F5F5";
  const dotColor = (s) => ({ Pending: "#F59E0B", Resolved: "#22C55E", Completed: "#22C55E", "In Progress": "#3B82F6" }[s] || "#9CA3AF");

  const prefRows = [
    { icon: "BedDouble",       label: "Room",        value: guest.preferences.room },
    { icon: "UtensilsCrossed", label: "Dietary",     value: guest.preferences.dietary },
    { icon: "MessageCircle",   label: "Language",    value: guest.preferences.language },
    { icon: "Thermometer",     label: "Temperature", value: guest.preferences.temperature },
    { icon: "AlarmClock",      label: "Wake Up",     value: guest.preferences.wakeup },
    { icon: "Wine",            label: "Minibar",     value: guest.preferences.minibar },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "52px 16px 14px", borderBottom: "1px solid #F0F0F0", flexShrink: 0, background: "#fff" }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="ChevronLeft" size={20} color="#1A1A1A" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A" }}>{guest.name}</div>
          <div style={{ fontSize: 12, color: "#6B7280" }}>Room {guest.room} · {guest.roomType}</div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: statusBg, color: statusColor }}>{guest.status}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, WebkitOverflowScrolling: "touch" }}>
        {/* Photo + key info */}
        <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 16 }}>
          {guest.photo
            ? <img src={guest.photo} alt="" style={{ width: 72, height: 72, borderRadius: 36, objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ width: 72, height: 72, borderRadius: 36, background: "#FFF4F0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24, color: "#E8623A", fontFamily: "Sora,sans-serif", flexShrink: 0 }}>{guest.initials}</div>
          }
          <div>
            <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 6 }}>{guest.flag} {guest.nationality}</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 3 }}>Check-in: <span style={{ color: "#1A1A1A", fontWeight: 600 }}>{guest.checkIn}</span></div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 3 }}>Check-out: <span style={{ color: "#1A1A1A", fontWeight: 600 }}>{guest.checkOut}</span></div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{guest.nights} nights</div>
          </div>
        </div>

        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Guest Profile card */}
          <div style={{ borderRadius: 16, padding: "14px 16px", background: "#fff", border: "1px solid #F0F0F0", borderLeft: "3px solid #93C5FD" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: "#2E86AB", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              <Icon name="User" size={12} color="#2E86AB" /> Guest Profile
            </div>
            <p style={{ fontSize: 13, color: "#1A1A1A", lineHeight: 1.6, margin: 0 }}>{guest.aiSummary}</p>
          </div>

          {/* Anticipated Needs card */}
          {guest.anticipatedNeeds && (
            <div style={{ borderRadius: 16, padding: "14px 16px", background: "#fff", border: "1px solid #F0F0F0", borderLeft: "3px solid #F59E0B" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                <Icon name="Lightbulb" size={12} color="#B45309" /> Anticipated Needs
              </div>
              <p style={{ fontSize: 13, color: "#1A1A1A", lineHeight: 1.6, margin: 0 }}>{guest.anticipatedNeeds}</p>
            </div>
          )}

          {/* Itinerary */}
          {guest.itinerary && guest.itinerary.length > 0 && (
            <div style={{ borderRadius: 16, border: "1px solid #F0F0F0", borderLeft: "3px solid #6366F1", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="CalendarDays" size={12} color="#6366F1" />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.1em" }}>Stay Itinerary</span>
              </div>
              <div style={{ padding: "12px 16px", position: "relative" }}>
                <div style={{ position: "absolute", left: 25, top: 16, bottom: 16, width: 1, background: "#E5E7EB" }} />
                {guest.itinerary.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: idx < guest.itinerary.length - 1 ? 16 : 0 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 7, border: "2px solid #6366F1", background: "#EEF2FF", flexShrink: 0, marginTop: 3, zIndex: 1 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.day}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#6366F1" }}>{item.time}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", marginTop: 1 }}>{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {guest.actions && (
            <div style={{ borderRadius: 16, border: "1px solid #F0F0F0", borderLeft: "3px solid #E8623A", overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="Bell" size={12} color="#E8623A" />
                <span style={{ fontSize: 10, fontWeight: 700, color: "#E8623A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Actions</span>
              </div>
              {guest.actions.map((a, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderBottom: idx < guest.actions.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, background: "#FFF4F0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, color: "#E8623A", flexShrink: 0, marginTop: 1 }}>{idx + 1}</div>
                  <p style={{ fontSize: 13, color: "#1A1A1A", lineHeight: 1.5, flex: 1, margin: 0 }}>{a.reason}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "#F3F4F6", color: "#6B7280" }}>{a.department}</span>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: dotColor(a.status), flexShrink: 0 }} title={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preferences */}
          <div style={{ borderRadius: 16, border: "1px solid #F0F0F0", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F0F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Preferences</span>
            </div>
            {prefRows.filter(r => r.value).map((r, i, arr) => (
              <div key={r.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                <Icon name={r.icon} size={14} color="#9CA3AF" />
                <span style={{ fontSize: 12, color: "#6B7280", width: 82, flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontSize: 13, color: "#1A1A1A", flex: 1, lineHeight: 1.4 }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ borderRadius: 16, border: "1px solid #F0F0F0", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #F0F0F0" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Contact</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: "1px solid #F5F5F5" }}>
              <Icon name="Phone" size={14} color="#9CA3AF" />
              <span style={{ fontSize: 13, color: "#1A1A1A" }}>{guest.phone}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px" }}>
              <Icon name="Mail" size={14} color="#9CA3AF" />
              <span style={{ fontSize: 13, color: "#1A1A1A" }}>{guest.email}</span>
            </div>
          </div>

          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GUESTS LIST SCREEN
// ═══════════════════════════════════════════════════════════════════
function GuestsListScreen({ navigate, onSelectGuest }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "In-House", "Pre-Arrival", "Checked Out"];

  const filtered = filter === "All" ? MOBILE_GUESTS : MOBILE_GUESTS.filter(g => g.status === filter);

  const statusColor = (s) => s === "In-House" ? "#22C55E" : s === "Pre-Arrival" ? "#D97706" : "#9CA3AF";
  const statusBg    = (s) => s === "In-House" ? "#F0FDF4"  : s === "Pre-Arrival" ? "#FFFBEB"  : "#F5F5F5";

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 12px", borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Sora,sans-serif", color: "#1A1A1A", margin: 0 }}>Guests</h1>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{MOBILE_GUESTS.filter(g => g.status === "In-House").length} in-house</span>
        </div>
        <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 12px" }}>Today's guest overview</p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ flexShrink: 0, padding: "5px 13px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                background: filter === f ? "#E8623A" : "#F5F5F5",
                color: filter === f ? "#fff" : "#6B7280" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {filtered.map(g => (
          <button key={g.id} onClick={() => onSelectGuest(g)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 20px",
              background: "#fff", borderBottom: "1px solid #F0F0F0", border: "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              {g.photo
                ? <img src={g.photo} alt="" style={{ width: 46, height: 46, borderRadius: 23, objectFit: "cover", display: "block" }} />
                : <div style={{ width: 46, height: 46, borderRadius: 23, background: "#FFF4F0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#E8623A", fontFamily: "Sora,sans-serif" }}>{g.initials}</div>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{g.name}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: statusBg(g.status), color: statusColor(g.status), flexShrink: 0, marginLeft: 8 }}>{g.status}</span>
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 2 }}>Room {g.room} · {g.roomType}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{g.flag} {g.nationality}</div>
            </div>
            <Icon name="ChevronRight" size={16} color="#9CA3AF" />
          </button>
        ))}
      </div>
      <BottomNav active="guests" navigate={navigate} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TASK NOTIFICATION BANNER
// ═══════════════════════════════════════════════════════════════════
function TaskNotification({ task, visible, onOpen, onDismiss }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      display: "flex", justifyContent: "center",
      padding: "52px 16px 0",
      pointerEvents: visible ? "auto" : "none",
      transition: "opacity 0.4s ease, transform 0.4s ease",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-24px)",
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "#1A1A1A", borderRadius: 20,
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#E8623A,#D4522D)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={task.icon || "Car"} size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#E8623A", letterSpacing: "0.5px", marginBottom: 2 }}>NEW TASK · CONCIERGE</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "Sora,sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>Room {task.room} · <MobileSla task={task} compact /></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          <button onClick={onOpen} style={{ background: "#E8623A", color: "#fff", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Sora,sans-serif" }}>Open</button>
          <button onClick={onDismiss} style={{ background: "rgba(255,255,255,0.1)", color: "#9CA3AF", border: "none", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════
function App() {
  const [screen,     setScreen]     = useState("login");
  const [prevScreen, setPrevScreen] = useState("home");
  const [tasks,      setTasks]      = useState(INITIAL_TASKS);
  const [selected,   setSelected]   = useState(null);
  const [claimed,    setClaimed]    = useState(new Set());
  const [notification, setNotification] = useState({ visible: false, dismissed: false, task: null });
  const [liveMessages, setLiveMessages] = useState([]);
  const [hkRoom,     setHkRoom]     = useState(null);
  const [hkRooms,    setHkRooms]    = useState(HK_ROOMS.map(r => ({ ...r, done: false })));
  const [selectedGuest, setSelectedGuest] = useState(null);
  const screenRef = useRef(screen);
  useEffect(() => { screenRef.current = screen; }, [screen]);

  // ── Listen for guest messages from guest.html via localStorage ──
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "alfon_guest_msg") return;
      try {
        const msg = JSON.parse(e.newValue);
        if (!msg || !msg.content) return;

        // Add to Emma's live chat
        setLiveMessages(prev => [...prev, {
          id: msg.id, sender: "guest", content: msg.content, time: `Today, ${msg.timestamp}`
        }]);

        // Detect task and fire notification
        const taskDef = detectTask(msg.content);
        const newTask = {
          id: "LIVE_" + msg.id,
          ...taskDef,
          guest: "Emma Davis", guestInitials: "ED", room: "1608",
          department: "Concierge", status: "Open", assignee: null,
          hasChat: true, elapsedSeconds: 0,
        };
        setTasks(prev => [newTask, ...prev]);
        setNotification({ visible: true, dismissed: false, task: newTask });

        // Auto-hide after 8s
        setTimeout(() => setNotification(n => n.task?.id === newTask.id ? { ...n, visible: false } : n), 8000);
      } catch(err) {}
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const navigate = (s) => { setPrevScreen(screen); setScreen(s); };

  const handleSelectTask = t => { setSelected(t); navigate("task-detail"); };

  const handleLogin = () => {
    navigate("home");
    setTimeout(() => setNotification({ visible: true, dismissed: false, task: null }), 1500);
  };

  const notifTask = notification.task || tasks.find(t => t.id === "M001") || tasks[0];

  const handleNotifOpen = () => {
    const t = notification.task || tasks.find(t => t.id === "M001");
    setNotification(n => ({ ...n, visible: false, dismissed: true }));
    if (t) { setSelected(t); navigate("task-detail"); }
  };

  const handleNotifDismiss = () => setNotification(n => ({ ...n, visible: false, dismissed: true }));

  const handleClaim = () => {
    setClaimed(prev => new Set([...prev, selected.id]));
    const u = { ...selected, assignee: TIM.fullName, status: "In Progress" };
    setTasks(ts => ts.map(t => t.id === selected.id ? u : t));
    setSelected(u);
  };

  const handleTaskComplete = () => {
    const u = { ...selected, status: "Completed" };
    setTasks(ts => ts.map(t => t.id === selected?.id ? u : t));
    setSelected(u);
  };

  const openTransferChat = () => {
    const t = tasks.find(t => t.id === "M001");
    if (t) setSelected(t);
    navigate("chat");
  };

  if (screen === "login") return <LoginScreen onLogin={handleLogin} />;

  return (
    <>
      {screen === "home"        && <HomeScreen tasks={tasks} navigate={navigate} onTaskSelect={handleSelectTask} />}
      {screen === "tasks"       && <TasksListScreen tasks={tasks} navigate={navigate} onTaskSelect={handleSelectTask} />}
      {screen === "task-detail" && selected && (
        <TaskDetailScreen
          task={selected}
          onBack={() => navigate(prevScreen === "tasks" ? "tasks" : "home")}
          onClaim={handleClaim}
          onOpenChat={() => navigate("chat")}
          onComplete={() => navigate("chat")}
          isClaimed={claimed.has(selected?.id)}
        />
      )}
      {screen === "chat" && (
        <ChatScreen
          task={selected?.id === "M001" || selected?.id?.startsWith("LIVE_") ? selected : null}
          messages={[...TRANSFER_CHAT_INIT, ...liveMessages]}
          onBack={() => navigate(prevScreen)}
          onTaskComplete={handleTaskComplete}
        />
      )}
      {screen === "chats"        && <ChatsScreen navigate={navigate} onOpenTransferChat={openTransferChat} />}
      {screen === "guests"       && <GuestsListScreen navigate={navigate} onSelectGuest={(g) => { setSelectedGuest(g); navigate("guest-profile"); }} />}
      {screen === "guest-profile" && selectedGuest && <GuestProfileScreen guest={selectedGuest} onBack={() => navigate("guests")} />}
      {screen === "team"         && <TeamScreen navigate={navigate} />}
      {screen === "more"         && <MoreScreen navigate={navigate} />}
      {screen === "housekeeping" && (
        <HousekeepingRoomListScreen
          navigate={navigate}
          rooms={hkRooms}
          onSelectRoom={(r) => { setHkRoom(r); navigate("inspection"); }}
        />
      )}
      {screen === "inspection" && hkRoom && (
        <HousekeepingInspectionScreen
          room={hkRoom}
          onBack={() => navigate("housekeeping")}
          onSubmit={(room, flagged) => {
            setHkRooms(rs => rs.map(r => r.number === room.number ? { ...r, done: !flagged } : r));
            navigate("housekeeping");
          }}
        />
      )}
      {notifTask && (
        <TaskNotification
          task={notifTask}
          visible={notification.visible}
          onOpen={handleNotifOpen}
          onDismiss={handleNotifDismiss}
        />
      )}
    </>
  );
}

ReactDOM.render(
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <App />
  </div>,
  document.getElementById("root")
);
