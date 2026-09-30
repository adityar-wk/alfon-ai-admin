function MemberProfilePanel({ member, onClose }) {
  if (!member) return null;
  const weekly = window.weeklyTasksByMember[member.id] || [
    { day: "Mon", tasks: 10 }, { day: "Tue", tasks: 12 }, { day: "Wed", tasks: 9 },
    { day: "Thu", tasks: 14 }, { day: "Fri", tasks: 11 }, { day: "Sat", tasks: 8 }, { day: "Sun", tasks: 7 },
  ];
  const taskTypes = window.taskTypesByMember[member.id] || [
    { type: "Guest request", count: 8 }, { type: "Maintenance", count: 5 }, { type: "Inspection", count: 3 },
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <div className="bg-card w-full max-w-md h-full overflow-y-auto shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-1 rounded hover:bg-lightgray"><Icon name="X" size={18} className="text-slate" /></button>
        </div>
        <div className="flex items-center gap-3 mb-5">
          <Avatar initials={member.initials} size={14} />
          <div>
            <div className="font-bold text-darktext text-lg">{member.name}</div>
            <div className="text-sm text-slate">{member.role}</div>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Today's Activity</div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Card className="p-3"><div className="text-xs text-slate">Tasks Completed</div><div className="text-xl font-bold text-darktext">{member.tasksToday}</div></Card>
          <Card className="p-3"><div className="text-xs text-slate">Avg Completion Time</div><div className="text-xl font-bold text-darktext">{member.avgTime}</div></Card>
        </div>

        <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">This Week</div>
        <Card className="p-3 mb-5">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#E8623A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Top Task Types</div>
        <div className="space-y-1.5">
          {taskTypes.map((t, i) => (
            <div key={t.type} className="flex justify-between text-sm bg-lightgray rounded-lg px-3 py-2">
              <span className="text-darktext">{i + 1}. {t.type}</span>
              <span className="text-slate">({t.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamScreen() {
  const [dept, setDept] = React.useState("All Departments");
  const [selected, setSelected] = React.useState(null);

  const depts = ["All Departments", ...window.DEPARTMENT_NAMES];
  const filtered = dept === "All Departments" ? window.teamMembers : window.teamMembers.filter((m) => m.department === dept);

  const tasksToday = window.teamMembers.reduce((a, m) => a + m.tasksToday, 0);

  return (
    <div>
      <Header title="Team" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon="Users" label="Team Members" value={window.teamMembers.length} />
          <StatCard icon="CheckCircle2" label="Tasks Completed Today" value={tasksToday} />
          <StatCard icon="Clock" label="Avg Response Time" value="2m 45s" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {depts.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                dept === d ? "bg-orange text-white" : "bg-white border border-border text-slate hover:bg-lightgray"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-lightgray text-slate text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Department</th>
                  <th className="text-left px-4 py-3 font-medium">Tasks Done</th>
                  <th className="text-left px-4 py-3 font-medium">Avg Time</th>
                  <th className="text-left px-4 py-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} onClick={() => setSelected(m)} className="border-b border-border/60 cursor-pointer hover:bg-lightgray/60 transition-colors duration-200">
                    <td className="px-4 py-3 flex items-center gap-2 font-medium text-darktext">
                      <Avatar initials={m.initials} size={7} /> {m.name}
                    </td>
                    <td className="px-4 py-3 text-slate">{m.department}</td>
                    <td className="px-4 py-3 text-slate">{m.tasksToday} tasks</td>
                    <td className="px-4 py-3 text-slate">{m.avgTime}</td>
                    <td className={`px-4 py-3 font-medium ${m.trend > 0 ? "text-success" : m.trend < 0 ? "text-orange" : "text-slate"}`}>
                      {m.trend > 0 ? "↑" : m.trend < 0 ? "↓" : "→"} {m.trend > 0 ? "+" : ""}{m.trend}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <MemberProfilePanel member={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
window.TeamScreen = TeamScreen;
