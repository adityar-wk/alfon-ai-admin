function useCountUp(target, duration = 1500) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const HEALTH_ORB_FILTERS = {
  green: "none",
  orange: "url(#orbDuotoneOrange)",
  red: "url(#orbDuotoneRed)",
};

const HEALTH_ORB_GLOWS = {
  green: "rgba(22, 163, 74, 0.5)",
  orange: "rgba(234, 88, 12, 0.5)",
  red: "rgba(220, 38, 38, 0.5)",
};

window.HEALTH_TIER_COLORS = { red: "#DC2626", orange: "#EA580C", green: "#16A34A" };

function tierForScore(score) {
  if (score >= 80) return "green";
  if (score >= 50) return "orange";
  return "red";
}

function HealthOrb({ score }) {
  const animated = useCountUp(score);
  const tier = tierForScore(animated);
  return (
    <div className="flex flex-col items-center py-8">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="orbDuotoneRed">
            <feColorMatrix
              type="matrix"
              values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.50 0.86 1.0" />
              <feFuncG type="table" tableValues="0.07 0.15 1.0" />
              <feFuncB type="table" tableValues="0.07 0.15 1.0" />
            </feComponentTransfer>
          </filter>
          <filter id="orbDuotoneOrange">
            <feColorMatrix
              type="matrix"
              values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.49 0.92 1.0" />
              <feFuncG type="table" tableValues="0.18 0.35 1.0" />
              <feFuncB type="table" tableValues="0.07 0.05 1.0" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <div className="health-orb-wrap">
        <div className="health-orb" style={{ "--glow": HEALTH_ORB_GLOWS[tier] }}>
          <div className="health-orb__halo" />
          <div className="health-orb__halo health-orb__halo--soft" />
          <img
            src="./public/assets/bubble.png"
            alt=""
            className="health-orb__image"
            style={{ filter: HEALTH_ORB_FILTERS[tier] }}
          />
          <div className="health-orb__score-wrap">
            <div className="health-orb__score">{animated}%</div>
          </div>
        </div>
        <div className="health-orb__ground-shadow" />
      </div>
      <div className="health-orb-label-below">Hotel Health Score</div>

      <div className="w-full max-w-md mt-6">
        <div className="flex justify-between text-xs font-medium mb-1" style={{ color: "#6B7280" }}>
          <span>● Needs Attention</span>
          <span>Thriving 🏵</span>
        </div>
        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{
            background: `linear-gradient(90deg, ${window.HEALTH_TIER_COLORS.red} 0%, ${window.HEALTH_TIER_COLORS.red} 50%, ${window.HEALTH_TIER_COLORS.orange} 50%, ${window.HEALTH_TIER_COLORS.orange} 80%, ${window.HEALTH_TIER_COLORS.green} 80%, ${window.HEALTH_TIER_COLORS.green} 100%)`,
          }}
        >
          <div className="absolute inset-y-0 right-0" style={{ left: `${score}%`, background: "#F5F5F5" }} />
        </div>
        <div className="flex justify-between text-[11px] mt-1" style={{ color: "#9CA3AF" }}>
          <span>0%</span>
          <span>50%</span>
          <span>{window.healthScore.multiplier}</span>
          <span>100%</span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm px-4 py-2 rounded-full" style={{ color: "#1A1A1A", background: "#F0FDF4" }}>
        <Icon name="TrendingUp" size={15} color="#22C55E" />
        Your hotel is performing strong. Keep up the great work.
      </div>
    </div>
  );
}

const BREAKDOWN_ICONS = {
  "Guest Satisfaction": "Smile",
  "Response Time": "Clock",
  "Task Completion": "CheckCircle2",
  "Service Quality": "Heart",
  "Team Performance": "Users",
};

function ScoreBreakdownCard({ item }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FFFFFF", border: "1px solid rgba(232,98,58,0.25)" }}>
          <Icon name={BREAKDOWN_ICONS[item.label] || "Activity"} size={14} color="#E8623A" />
        </div>
        <TrendArrow trend={item.trend} />
      </div>
      <div className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>{item.label}</div>
      <div className="font-display font-bold text-xl" style={{ color: "#1A1A1A" }}>{item.value}</div>
      <div className="text-xs font-medium mb-2" style={{ color: item.status === "Excellent" ? "#22C55E" : "#D97706" }}>{item.status}</div>
      <Sparkline data={item.data} color="#E8623A" />
    </Card>
  );
}

const PILLAR_ICONS = {
  "Guest Pulse": "HeartPulse",
  "Operations Heartbeat": "Activity",
  "Housekeeping Rhythm": "Home",
  "Team Energy": "Users",
  "Recovery Rate": "Zap",
};

function PillarRow({ pillar }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "#FFFFFF", border: "1px solid rgba(232,98,58,0.25)" }}
      >
        <Icon name={PILLAR_ICONS[pillar.name] || "Activity"} size={14} color="#E8623A" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{pillar.name}</span>
          <span className="text-sm font-semibold" style={{ color: "#E8623A" }}>{pillar.weight}%</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{pillar.desc}</p>
      </div>
    </div>
  );
}

const DEPT_ICONS = {
  "Front Desk": "DoorOpen", "Guest Services": "Users", Concierge: "Car",
  "Food and Beverage": "UtensilsCrossed", Housekeeping: "Home", Laundry: "Shirt",
  Engineering: "Wrench", "Room Service": "UtensilsCrossed", Security: "Shield",
  IT: "Wifi", Operator: "Phone", Reservation: "CalendarCheck",
};

function PendingTasksTable({ tasks, onSelect }) {
  const pending = tasks.filter((t) => t.status !== "Completed").slice(0, 6);
  return (
    <Card className="p-0 overflow-hidden" hover={false}>
      <div className="flex items-center justify-between px-6 py-4 flex-wrap gap-2" style={{ borderBottom: "1px solid #F0F0F0" }}>
        <div className="flex items-center gap-2">
          <Icon name="ListChecks" size={16} color="#E8623A" />
          <h3 className="font-display font-semibold" style={{ fontSize: 16, color: "#1A1A1A" }}>Pending Tasks</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#F5F5F5", color: "#6B7280" }}>All Departments</span>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#F5F5F5", color: "#6B7280" }}>All Priority</span>
          <button onClick={() => window.navigateTo("/tasks")} className="text-sm font-medium ml-1" style={{ color: "#E8623A" }}>View all</button>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: "#9CA3AF" }} className="text-xs uppercase tracking-wide">
            <th className="text-left px-6 py-2 font-medium"></th>
            <th className="text-left px-3 py-2 font-medium">Task</th>
            <th className="text-left px-3 py-2 font-medium">Department</th>
            <th className="text-left px-3 py-2 font-medium">Assigned To</th>
            <th className="text-left px-3 py-2 font-medium">Priority</th>
            <th className="text-left px-3 py-2 font-medium">Status</th>
            <th className="text-left px-3 py-2 font-medium">Due</th>
            <th className="text-left px-3 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {pending.map((t) => {
            const initials = (t.assignee || "?").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
            return (
            <tr key={t.id} onClick={() => onSelect && onSelect(t)} className="cursor-pointer" style={{ borderTop: "1px solid #F0F0F0" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td className="px-6 py-3"><input type="checkbox" className="accent-orange" onClick={(e) => e.stopPropagation()} /></td>
              <td className="px-3 py-3">
                <div className="font-medium flex items-center gap-1.5" style={{ color: "#1A1A1A" }}>
                  {t.title}
                  {t.compensation && (
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "#F0FDF4", color: "#22C55E" }} title="Compensation logged">$</span>
                  )}
                  {t.category === "Complaint" && <ComplaintBadge />}
                </div>
                <div className="text-xs" style={{ color: "#9CA3AF" }}>{t.guest} · Room {t.room}</div>
              </td>
              <td className="px-3 py-3">
                <span className="flex items-center gap-1.5" style={{ color: "#6B7280" }}>
                  <Icon name={DEPT_ICONS[t.department] || "Building2"} size={13} color="#9CA3AF" /> {t.department}
                </span>
              </td>
              <td className="px-3 py-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display font-semibold" style={{ background: "#FFF4F0", color: "#E8623A" }}>{initials}</span>
                  <span style={{ color: "#1A1A1A" }}>{t.assignee}</span>
                </span>
              </td>
              <td className="px-3 py-3"><PriorityBadge priority={t.priority} /></td>
              <td className="px-3 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-3 py-3" style={{ color: "#1A1A1A" }}>{t.due}</td>
              <td className="px-3 py-3"><Icon name="MoreVertical" size={15} color="#9CA3AF" /></td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function HotelSnapshotCard() {
  const h = window.hotelData;
  return (
    <Card>
      <h3 className="font-display font-semibold mb-4" style={{ fontSize: 16, color: "#1A1A1A" }}>{h.name}</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between"><span style={{ color: "#6B7280" }}>Occupancy</span><span className="font-display font-semibold" style={{ color: "#1A1A1A" }}>{h.occupancy}%</span></div>
        <div className="flex justify-between"><span style={{ color: "#6B7280" }}>Check-ins Today</span><span style={{ color: "#1A1A1A" }}>{h.checkInToday}</span></div>
        <div className="flex justify-between"><span style={{ color: "#6B7280" }}>Check-outs Today</span><span style={{ color: "#1A1A1A" }}>{h.checkOutToday}</span></div>
        <div className="flex justify-between"><span style={{ color: "#6B7280" }}>Total Rooms</span><span style={{ color: "#1A1A1A" }}>{h.rooms}</span></div>
      </div>
    </Card>
  );
}

function GuestChatsPreview() {
  const recent = window.conversations.slice(0, 3);
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold" style={{ fontSize: 16, color: "#1A1A1A" }}>Guest Chats</h3>
        <button onClick={() => window.navigateTo("/chats")} className="text-sm font-medium" style={{ color: "#E8623A" }}>View all</button>
      </div>
      <div className="space-y-3">
        {recent.map((c) => (
          <button key={c.id} onClick={() => window.navigateTo("/chats")} className="alfon-btn w-full flex items-center gap-3 text-left p-2 rounded-lg hover:bg-lightgray">
            <Avatar initials={c.initials} size={8} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-sm truncate" style={{ color: "#1A1A1A" }}>{c.guest}</span>
                <span className="text-[11px] shrink-0 ml-2" style={{ color: "#9CA3AF" }}>{c.time}</span>
              </div>
              <div className="text-xs truncate" style={{ color: "#6B7280" }}>{c.lastMessage}</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function AnalyticsOverview({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const overdue = tasks.filter((t) => t.slaMinutes && t.status !== "Completed" && t.elapsedSeconds > t.slaMinutes * 60).length;
  const data = window.analyticsData.healthHistory.filter((_, i) => i % 4 === 0);

  return (
    <Card className="h-full">
      <h3 className="font-display font-semibold mb-3" style={{ fontSize: 16, color: "#1A1A1A" }}>Analytics Overview</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke="#F5F5F5" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#E8623A" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <div><div className="font-display font-bold text-lg" style={{ color: "#1A1A1A" }}>{total}</div><div className="text-[11px]" style={{ color: "#9CA3AF" }}>Total Tasks</div></div>
        <div><div className="font-display font-bold text-lg" style={{ color: "#22C55E" }}>{completed}</div><div className="text-[11px]" style={{ color: "#9CA3AF" }}>Completed</div></div>
        <div><div className="font-display font-bold text-lg" style={{ color: "#EF4444" }}>{overdue}</div><div className="text-[11px]" style={{ color: "#9CA3AF" }}>Overdue</div></div>
      </div>
    </Card>
  );
}

function TeamPerformancePreview() {
  const top = window.teamMembers.slice(0, 5);
  const maxTasks = Math.max(...top.map((m) => m.tasksToday), 1);
  return (
    <Card className="h-full">
      <h3 className="font-display font-semibold mb-3" style={{ fontSize: 16, color: "#1A1A1A" }}>Team Performance</h3>
      <div className="space-y-3.5">
        {top.map((m) => {
          const pct = Math.round((m.tasksToday / maxTasks) * 100);
          return (
            <div key={m.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: "#1A1A1A" }}>{m.name}</div>
                  <div className="text-[11px]" style={{ color: "#9CA3AF" }}>{m.role}</div>
                </div>
                <span className="text-xs font-display font-semibold shrink-0 ml-2" style={{ color: "#1A1A1A" }}>{m.tasksToday} tasks</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F5F5F5" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#E8623A" }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function HomeScreen() {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const id = setInterval(forceUpdate, 2000);
    return () => clearInterval(id);
  }, []);

  const liveTasks = window.tasks;
  const openCount = liveTasks.filter((t) => t.status !== "Completed" && t.status !== "Void").length;

  return (
    <div>
      <Header title="Good morning, Franck 👋" subtitle={`Here's what's happening at ${window.hotelData.name}`} />
      <div className="px-8 pt-7 pb-8 space-y-7">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatCard icon="ListChecks" label="Open Tasks" value={openCount} sub={`${liveTasks.filter((t) => t.status === "In Progress").length} in progress`} subColor="text-orange" />
          <StatCard icon="MessageCircle" label="Guest Chats" value={window.conversations.length} sub="Active conversations" />
          <StatCard icon="Clock" label="Avg Response" value="2m 45s" sub="↓ 18%" subColor="text-success" />
          <StatCard icon="Activity" label="Hotel Health Score" value={`${window.healthScore.overall}%`} sub="Excellent" subColor="text-success" />
          <StatCard icon="BedDouble" label="Occupancy" value={`${window.hotelData.occupancy}%`} sub={`${window.hotelData.checkInToday} arriving today`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <HealthOrb score={window.healthScore.overall} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
              {window.scoreBreakdown.map((item) => (
                <ScoreBreakdownCard key={item.label} item={item} />
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display font-semibold mb-1" style={{ fontSize: 16, color: "#1A1A1A" }}>How Your Score Is Calculated</h3>
            <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
              Alfon monitors your hotel's live operations around the clock and distils everything into one score. Five pillars are weighted by their impact on the guest experience and recalculated every night at midnight.
            </p>
            <div>
              {Object.values(window.healthScore.pillars).map((p) => (
                <PillarRow key={p.name} pillar={p} />
              ))}
            </div>
            <div className="mt-4 space-y-1.5">
              {[
                "Recalculates automatically every midnight",
                "Benchmarks against your previous day's performance",
                "Surfaces the exact pillar pulling your score down",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs" style={{ color: "#6B7280" }}>
                  <Icon name="Check" size={13} color="#22C55E" />
                  {t}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PendingTasksTable tasks={liveTasks} onSelect={() => window.navigateTo("/tasks")} />
          </div>
          <div className="lg:col-span-2">
            <HotelSnapshotCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-3"><GuestChatsPreview /></div>
          <div className="lg:col-span-4"><AnalyticsOverview tasks={liveTasks} /></div>
          <div className="lg:col-span-3"><TeamPerformancePreview /></div>
        </div>
      </div>
    </div>
  );
}
window.HomeScreen = HomeScreen;
