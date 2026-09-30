function HotelProfileTab() {
  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <label className="text-xs font-medium text-slate">Hotel Name</label>
        <input defaultValue={window.hotelData.name} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm" />
      </div>
      <div>
        <label className="text-xs font-medium text-slate">Location</label>
        <input defaultValue={window.hotelData.location} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate">Total Rooms</label>
          <input defaultValue={window.hotelData.rooms} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate">Star Rating</label>
          <input defaultValue={`${window.hotelData.rating} Stars`} className="w-full mt-1 px-3 py-2 rounded-lg border border-border text-sm" />
        </div>
      </div>
      <button className="px-4 py-2 text-sm font-medium rounded-lg bg-orange text-white hover:bg-orangeHover transition-colors duration-200">Save Changes</button>
    </div>
  );
}

function DepartmentsTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {window.departments.map((d) => (
        <Card key={d.name} className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-semibold text-darktext">{d.name}</span>
            <button className="alfon-btn text-xs font-medium text-orange hover:text-orangeHover">Edit</button>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate">Staff Count</span><span className="text-darktext font-medium">{d.staffCount}</span></div>
            <div className="flex justify-between"><span className="text-slate">Head of Department</span><span className="text-darktext font-medium">{d.head}</span></div>
          </div>
        </Card>
      ))}
      <button className="alfon-card alfon-card-hover flex items-center justify-center gap-1.5 text-sm font-medium text-orange p-6 border-dashed border-2 border-border">
        <Icon name="Plus" size={14} /> Add Department
      </button>
    </div>
  );
}
window.DepartmentsTab = DepartmentsTab;

function DepartmentsScreen() {
  return (
    <div>
      <Header title="Departments" />
      <div className="px-8 pt-7 pb-8">
        <DepartmentsTab />
      </div>
    </div>
  );
}
window.DepartmentsScreen = DepartmentsScreen;

function SlaTab() {
  return (
    <Card className="overflow-hidden p-0" hover={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-lightgray text-slate text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Department</th>
              <th className="text-left px-4 py-3 font-medium">Task Type</th>
              <th className="text-left px-4 py-3 font-medium">SLA</th>
              <th className="text-left px-4 py-3 font-medium">Escalate After</th>
              <th className="text-left px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {window.slaConfig.map((s, i) => (
              <tr key={i} className="border-b border-border/60">
                <td className="px-4 py-3 text-darktext font-medium">{s.department}</td>
                <td className="px-4 py-3 text-slate">{s.taskType}</td>
                <td className="px-4 py-3 text-slate">{s.expected}</td>
                <td className="px-4 py-3 text-orange font-medium">{s.escalate}</td>
                <td className="px-4 py-3 text-right"><button className="alfon-btn text-xs font-medium text-orange hover:text-orangeHover">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TeamMembersTab() {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-lightgray text-slate text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Department</th>
              <th className="text-left px-4 py-3 font-medium">Role</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {window.teamMembers.map((m) => (
              <tr key={m.id} className="border-b border-border/60">
                <td className="px-4 py-3 flex items-center gap-2 font-medium text-darktext"><Avatar initials={m.initials} size={7} /> {m.name}</td>
                <td className="px-4 py-3 text-slate">{m.department}</td>
                <td className="px-4 py-3 text-slate">{m.role}</td>
                <td className="px-4 py-3">{m.onDuty ? <StatusBadge status="In Progress" /> : <StatusBadge status="Open" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function WhatsAppTab() {
  const w = window.whatsappConfig;
  return (
    <div className="max-w-lg space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><Icon name="MessageCircle" size={20} className="text-success" /></div>
          <div className="flex-1">
            <div className="font-display font-semibold text-darktext">WhatsApp Business Integration</div>
            <div className="text-xs text-slate">{w.displayName}</div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success breathe-dot" /> Connected
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate">Connected Number</span><span className="text-darktext font-medium">{w.number}</span></div>
          <div className="flex justify-between"><span className="text-slate">Hotel Display Name</span><span className="text-darktext font-medium">{w.displayName}</span></div>
          <div className="flex justify-between"><span className="text-slate">Status</span><span className="text-success font-medium">{w.status}</span></div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <StatCard icon="ArrowUpRight" label="Messages Sent Today" value={w.sentToday} />
        <StatCard icon="ArrowDownLeft" label="Messages Received Today" value={w.receivedToday} />
      </div>
    </div>
  );
}

function KnowledgeBaseTab() {
  return (
    <div className="max-w-2xl space-y-5">
      <Card className="p-8 border-dashed border-2 border-border text-center" hover={false}>
        <Icon name="UploadCloud" size={32} className="text-slate mx-auto mb-2" />
        <div className="font-display font-semibold text-darktext">Upload hotel documents</div>
        <div className="text-sm text-slate">PDF, Word, or paste a website URL</div>
      </Card>
      <div>
        <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-2">Uploaded Documents</div>
        <div className="space-y-2">
          {window.knowledgeDocs.map((doc) => (
            <div key={doc.name} className="flex items-center justify-between bg-lightgray rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-darktext">
                <Icon name={doc.status === "Published" ? "CheckCircle2" : "Clock"} size={15} className={doc.status === "Published" ? "text-success" : "text-warning"} />
                {doc.name}
                <span className="text-xs text-slate">— {doc.date}</span>
              </div>
              <StatusBadge status={doc.status === "Published" ? "Completed" : "Pending"} />
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate">Admin reviews content before it goes live to the AI.</p>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = React.useState({ tasks: true, escalations: true, reports: false });
  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const items = [
    { k: "tasks", label: "Urgent task alerts" },
    { k: "escalations", label: "SLA escalations" },
    { k: "reports", label: "Weekly performance reports" },
  ];
  return (
    <div className="max-w-lg space-y-2">
      {items.map((item) => (
        <div key={item.k} className="flex items-center justify-between bg-lightgray rounded-lg px-4 py-3">
          <span className="text-sm text-darktext">{item.label}</span>
          <button
            onClick={() => toggle(item.k)}
            className={`w-10 h-5.5 rounded-full relative transition-colors duration-200 ${prefs[item.k] ? "bg-orange" : "bg-border"}`}
            style={{ height: 22 }}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${prefs[item.k] ? "translate-x-4" : ""}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SettingsScreen() {
  const tabs = ["Hotel Profile", "Departments", "SLA Configuration", "Team Members", "WhatsApp", "Knowledge Base", "Notifications"];
  const [active, setActive] = React.useState(tabs[0]);

  const renderTab = () => {
    switch (active) {
      case "Hotel Profile": return <HotelProfileTab />;
      case "Departments": return <DepartmentsTab />;
      case "SLA Configuration": return <SlaTab />;
      case "Team Members": return <TeamMembersTab />;
      case "WhatsApp": return <WhatsAppTab />;
      case "Knowledge Base": return <KnowledgeBaseTab />;
      case "Notifications": return <NotificationsTab />;
      default: return null;
    }
  };

  return (
    <div>
      <Header title="Settings" />
      <div className="p-6">
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-200 ${
                active === t ? "border-orange text-darktext" : "border-transparent text-slate hover:text-darktext"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {renderTab()}
      </div>
    </div>
  );
}
window.SettingsScreen = SettingsScreen;
