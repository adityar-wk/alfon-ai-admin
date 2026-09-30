// Analytics accent — warmer golden beige
const A = "#C9A96E";          // primary — warm golden beige
const A_MID = "#DBBE8E";      // mid
const A_LIGHT = "#EDD9B4";    // light
const A_BG = "#FAF3E8";       // tint
const DONUT_COLORS = ["#9E7C3F", "#B8924F", A, A_MID, A_LIGHT, "#F5E8CC", "#FAF3E8"];

function MetricCard({ icon, label, value, trend, change }) {
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#FFF4F0" }}>
        <Icon name={icon} size={18} color="#E8623A" />
      </div>
      <div className="text-sm" style={{ color: "#6B7280" }}>{label}</div>
      <div className="font-display font-bold leading-tight mt-0.5" style={{ fontSize: 28, color: "#1A1A1A" }}>{value}</div>
      <div className="flex items-center gap-1 text-xs font-medium mt-1" style={{ color: "#E8623A" }}>
        <Icon name={trend === "down" ? "ArrowDown" : "ArrowUp"} size={13} color="#E8623A" /> {change} vs last period
      </div>
    </Card>
  );
}

function DepartmentCard({ dept, onClick }) {
  const max = 1281;
  const pct = Math.round((dept.total / max) * 100);
  return (
    <button onClick={onClick} className="alfon-card alfon-card-hover text-left p-5 w-full" style={{ background: "#FFFFFF" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-display font-semibold text-sm" style={{ color: "#1A1A1A" }}>{dept.department}</span>
        <Icon name="ChevronRight" size={15} color="#9CA3AF" />
      </div>
      <div className="font-display font-bold mb-2" style={{ fontSize: 22, color: "#1A1A1A" }}>{dept.total.toLocaleString()}</div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#F5F5F5" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${A}, ${A_MID})` }} />
      </div>
      <div className="text-xs mt-1.5" style={{ color: "#9CA3AF" }}>tasks this period</div>
    </button>
  );
}

function DepartmentDetailModal({ dept, onClose }) {
  if (!dept) return null;
  return (
    <Modal open={!!dept} onClose={onClose} title={`${dept.department} — Task Breakdown`} width="max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="h-56 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={dept.categories} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {dept.categories.map((entry, i) => (
                  <Cell key={entry.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5">
          {dept.categories.map((c, i) => (
            <div key={c.name} className="flex items-center justify-between text-sm py-1.5" style={{ borderBottom: "1px solid #F5F5F5" }}>
              <span className="flex items-center gap-2" style={{ color: "#1A1A1A" }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                {c.name}
              </span>
              <span className="font-medium" style={{ color: "#1A1A1A" }}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function PeakHoursHeatmap() {
  const data = window.peakHoursHeatmap;
  const HOURS = Array.from({ length: 24 }, (_, h) => h);
  const LABELS = { 0:"12a", 6:"6a", 9:"9a", 12:"12p", 15:"3p", 18:"6p", 21:"9p", 23:"11p" };

  const cellColor = (v) => {
    if (v < 10) return "rgba(0,0,0,0.03)";
    const a = 0.08 + (v / 100) * 0.82;
    return `rgba(201,169,110,${a.toFixed(2)})`; // warm golden beige #C9A96E
  };

  return (
    <Card style={{ padding: "20px 24px" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-semibold" style={{ color: "#1A1A1A" }}>Peak Hours by Department</h3>
          <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Request volume per hour — darker = higher demand</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 640 }}>
          {/* Hour labels */}
          <div className="flex mb-2" style={{ paddingLeft: 100 }}>
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center" style={{ fontSize: 9, color: LABELS[h] ? "#6B7280" : "transparent", fontWeight: LABELS[h] ? 500 : 400 }}>
                {LABELS[h] || "."}
              </div>
            ))}
          </div>
          {/* Department rows */}
          <div className="space-y-1.5">
            {data.map((dept) => (
              <div key={dept.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2 shrink-0" style={{ width: 96 }}>
                  <span style={{ fontSize: 11, color: "#374151", fontWeight: 500 }}>{dept.label}</span>
                </div>
                <div className="flex flex-1 gap-px">
                  {dept.hours.map((v, h) => (
                    <div
                      key={h}
                      title={`${dept.label} · ${h}:00 — ${v} requests`}
                      style={{
                        flex: 1,
                        height: 26,
                        borderRadius: 3,
                        background: cellColor(v),
                        transition: "opacity 150ms",
                        cursor: "default",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Scale */}
          <div className="flex items-center justify-end gap-1.5 mt-4">
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>Low</span>
            {[0.1, 0.25, 0.45, 0.65, 0.9].map((a) => (
              <span key={a} className="rounded-sm" style={{ width: 14, height: 14, display: "inline-block", background: `rgba(201,169,110,${a})` }} />
            ))}
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>High</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function AnalyticsScreen() {
  const [range, setRange] = React.useState("This Week");
  const [activeDept, setActiveDept] = React.useState(null);
  const m = window.analyticsMetrics;

  return (
    <div>
      <Header title="Analytics" subtitle="Operational performance across all departments" />
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-border text-sm font-medium text-darktext">May 3 – May 9, 2026</span>
            {["This Week", "Last Week", "This Month", "Custom"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors duration-200"
                style={range === r ? { background: "#E8623A", color: "#FFFFFF" } : { background: "#FFFFFF", border: "1px solid #F0F0F0", color: "#6B7280" }}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={() => window.print()}
            className="alfon-btn flex items-center gap-1.5 font-display font-semibold text-sm px-4 py-2 rounded-lg"
            style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}
          >
            <Icon name="Download" size={15} color="#9CA3AF" /> Export Data
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard icon="ListChecks" label="Total Tasks" value={m.totalTasks.value.toLocaleString()} trend={m.totalTasks.trend} change={m.totalTasks.change} />
          <MetricCard icon="CheckCircle2" label="Completed" value={m.completed.value.toLocaleString()} trend={m.completed.trend} change={m.completed.change} />
          <MetricCard icon="AlertTriangle" label="Overdue" value={m.overdue.value} trend={m.overdue.trend} change={m.overdue.change} />
          <MetricCard icon="Timer" label="Avg Response" value={m.avgResponse.value} trend={m.avgResponse.trend} change={m.avgResponse.change} />
        </div>

        <div>
          <h3 className="font-display font-semibold mb-3" style={{ color: "#1A1A1A" }}>Tasks by Department</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {window.departmentTaskBreakdown.map((dept) => (
              <DepartmentCard key={dept.department} dept={dept} onClick={() => setActiveDept(dept)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Complaint Insights */}
          <Card style={{ padding: "24px" }}>
            <h3 className="font-display font-semibold mb-5" style={{ color: "#1A1A1A" }}>Complaint Insights</h3>
            <div className="space-y-4">
              {[{ name: "Room Move", value: 67 }, { name: "AC Not Working", value: 31 }, { name: "Elevator Issues", value: 18 }, { name: "Restaurant Unavailability", value: 14 }, { name: "Noise Disturbance", value: 11 }, { name: "Housekeeping Delay", value: 9 }].map((item, i) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm" style={{ color: "#374151" }}>{item.name}</span>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: "#1A1A1A" }}>{item.value}</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: "#F3F4F6" }}>
                    <div className="h-full rounded-full" style={{ width: `${(item.value / 67) * 100}%`, background: i === 0 ? A : i === 1 ? A_MID : A_LIGHT }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Department Comparison */}
          <Card style={{ padding: "24px" }}>
            <h3 className="font-display font-semibold mb-3" style={{ color: "#1A1A1A" }}>Department Comparison</h3>
            {(() => {
              const sorted = [...window.departmentTaskBreakdown].sort((a, b) => b.total - a.total);
              const PIE_COLORS = ["#9E7C3F", "#B8924F", "#C9A96E", "#DBBE8E", "#EDD9B4", "#F5E8CC", "#FAF3E8"];
              return (
                <div>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sorted} dataKey="total" nameKey="department" innerRadius={60} outerRadius={105} paddingAngle={2}>
                          {sorted.map((entry, i) => <Cell key={entry.department} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2" style={{ marginTop: 12 }}>
                    {sorted.map((dept, i) => (
                      <div key={dept.department} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span style={{ color: "#374151" }}>{dept.department}</span>
                        <span className="font-semibold tabular-nums" style={{ color: "#1A1A1A" }}>{dept.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Guest Satisfaction Trend */}
          <Card style={{ padding: "24px" }}>
            <h3 className="font-display font-semibold mb-4" style={{ color: "#1A1A1A" }}>Guest Satisfaction Trend</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={window.satisfactionTrend}>
                  <defs>
                    <linearGradient id="satGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={A} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={A} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#F5F5F5" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[3.5, 5]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke={A} strokeWidth={2.5} fill="url(#satGrad)" />
                  <Line type="monotone" dataKey={() => 4.5} stroke="#9CA3AF" strokeDasharray="4 4" strokeWidth={1.5} dot={false} legendType="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Requests */}
          <Card style={{ padding: "24px" }}>
            <h3 className="font-display font-semibold mb-4" style={{ color: "#1A1A1A" }}>Top Requests</h3>
            <div className="space-y-2.5">
              {window.topRequestsBreakdown.map((r, i) => (
                <div key={r.name} className="flex items-center gap-3">
                  <span style={{ width: 16, fontSize: 10, color: "#9CA3AF", fontWeight: 600, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                  <span className="text-sm flex-1 truncate" style={{ color: "#374151" }}>{r.name}</span>
                  <div className="flex items-center gap-2" style={{ width: 160 }}>
                    <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "#F3F4F6" }}>
                      <div className="h-full rounded-full" style={{ width: `${(r.count / window.topRequestsBreakdown[0].count) * 100}%`, background: i === 0 ? A : i === 1 ? A_MID : A_LIGHT }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#1A1A1A", fontVariantNumeric: "tabular-nums", minWidth: 28, textAlign: "right" }}>{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        <PeakHoursHeatmap />

        <div>
          <h3 className="font-display font-semibold mb-3" style={{ color: "#1A1A1A" }}>Guest Insights</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: "#1A1A1A" }}>By Nationality</h4>
              <div className="space-y-2.5">
                {window.guestNationality.map((n) => (
                  <div key={n.name} className="flex items-center gap-3">
                    <span className="text-base w-5">{n.flag}</span>
                    <span className="text-sm w-16" style={{ color: "#1A1A1A" }}>{n.name}</span>
                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "#F5F5F5" }}>
                      <div className="h-full rounded-full" style={{ width: `${n.value}%`, background: A }} />
                    </div>
                    <span className="text-sm font-medium w-10 text-right" style={{ color: "#6B7280" }}>{n.value}%</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h4 className="text-sm font-semibold mb-3" style={{ color: "#1A1A1A" }}>Communication Language</h4>
              <div className="h-48 flex items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={window.guestLanguage} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {window.guestLanguage.map((entry, i) => (
                        <Cell key={entry.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 text-xs justify-center -mt-2" style={{ color: "#6B7280" }}>
                {window.guestLanguage.map((l, i) => (
                  <span key={l.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    {l.name} {l.value}%
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <DepartmentDetailModal dept={activeDept} onClose={() => setActiveDept(null)} />
    </div>
  );
}
window.AnalyticsScreen = AnalyticsScreen;
