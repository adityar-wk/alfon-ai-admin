const COUNTRY_CODES = [
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+33", label: "🇫🇷 +33" },
  { code: "+39", label: "🇮🇹 +39" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+86", label: "🇨🇳 +86" },
];

function NewChatModal({ open, onClose }) {
  const [name, setName] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+971");
  const [phone, setPhone] = React.useState("");
  const [room, setRoom] = React.useState("");
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (open) {
      setName(""); setCountryCode("+971"); setPhone(""); setRoom(""); setErrors({});
    }
  }, [open]);

  const onNameChange = (e) => setName(e.target.value);

  const start = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "This field is required";
    if (!phone.trim()) nextErrors.phone = "This field is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const fullPhone = `${countryCode} ${phone.trim()}`;
    const initials = name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
    const newGuestId = Math.max(0, ...window.guests.map((g) => g.id)) + 1;
    const newConvoId = Math.max(0, ...window.conversations.map((c) => c.id)) + 1;
    const now = new Date();
    const nowTimeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const nowDateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const newGuest = {
      id: newGuestId, name: name.trim(), initials, room: room.trim() || "", roomType: room.trim() ? "Standard Room" : "",
      vip: false, status: room.trim() ? "In-House" : "Pre-Arrival", nationality: "", flag: "🌍", phone: fullPhone, email: "",
      checkIn: "", checkOut: "", nights: 0, adults: 1, source: "Manual Entry",
      aiSummary: "New guest — no prior history on file yet.",
      preferences: { room: "", dietary: "", language: "", transport: "", temperature: "", newspaper: "", purpose: "", wakeup: "", minibar: "" },
      history: [], notes: [], handover: null,
    };
    window.guests.push(newGuest);

    const newConvo = {
      id: newConvoId, guestId: newGuestId, guest: newGuest.name, initials, room: room.trim() || "—",
      time: "Just now", lastMessage: "", status: "Open", priority: "Low",
      department: "Front Desk", assignedTo: "Unassigned", channel: "WhatsApp", language: "English",
      created: `${nowDateStr} at ${nowTimeStr}`,
    };
    window.conversations.unshift(newConvo);

    window.chatMessages[newConvoId] = [];

    window.__pendingChatId = newConvoId;
    onClose();
    window.navigateTo("/chats");
  };

  return (
    <Modal open={open} onClose={onClose} title="Start New Guest Conversation">
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium" style={{ color: "#6B7280" }}>
            Guest Name <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <input
            value={name}
            onChange={onNameChange}
            placeholder="Enter guest full name"
            className="w-full mt-1 px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ border: errors.name ? "1px solid #DC2626" : "1px solid #F0F0F0", color: "#1A1A1A" }}
          />
          {errors.name && <div className="text-xs mt-1" style={{ color: "#DC2626" }}>{errors.name}</div>}
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: "#6B7280" }}>
            WhatsApp Number <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <div className="flex gap-2 mt-1">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="px-2 py-2 text-sm rounded-lg focus:outline-none"
              style={{ border: "1px solid #F0F0F0", color: "#1A1A1A", width: 110 }}
            >
              {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="50 000 0000"
              className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none"
              style={{ border: errors.phone ? "1px solid #DC2626" : "1px solid #F0F0F0", color: "#1A1A1A" }}
            />
          </div>
          {errors.phone && <div className="text-xs mt-1" style={{ color: "#DC2626" }}>{errors.phone}</div>}
        </div>

        <div>
          <label className="text-xs font-medium" style={{ color: "#6B7280" }}>Room Number</label>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g. 1608 (optional)"
            className="w-full mt-1 px-3 py-2 text-sm rounded-lg focus:outline-none"
            style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}
          />
          <div className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Can be assigned later</div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="alfon-btn px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-lightgray">Cancel</button>
          <button
            onClick={start}
            className="alfon-btn px-4 py-2 font-display font-bold text-sm text-white rounded-lg"
            style={{ background: "#E8623A" }}
          >
            Start Chat
          </button>
        </div>
      </div>
    </Modal>
  );
}
window.NewChatModal = NewChatModal;

const NOTIFICATIONS = [
  {
    id: 1,
    type: "alert",
    icon: "TrendingDown",
    iconColor: "#EF4444",
    iconBg: "#FEF2F2",
    title: "Health Score dropped 14 points",
    body: "Layana Resort & Spa: 92% → 78%",
    detail: "Cause: Response Time fell to 61% — 3 SLA breaches in Housekeeping in the last 4 hours.",
    time: "12 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "warning",
    icon: "Clock",
    iconColor: "#F59E0B",
    iconBg: "#FFFBEB",
    title: "2 tasks approaching SLA breach",
    body: "AC Maintenance (James Wilson) · Minibar Restock (Olivia Brown)",
    detail: "Both tasks have been open for over 45 minutes with no update.",
    time: "28 min ago",
    unread: true,
  },
  {
    id: 3,
    type: "alert",
    icon: "Target",
    iconColor: "#F59E0B",
    iconBg: "#FFFBEB",
    title: "Guest satisfaction below target",
    body: "Current score: 76% — monthly KPI target is 85%",
    detail: "Score has been below target for 3 consecutive days. Primary driver: delayed responses in Food and Beverage and unresolved room complaints.",
    time: "Today, 8:00 AM",
    unread: false,
  },
];

function NotificationPanel({ open, onClose }) {
  const [notifications, setNotifications] = React.useState(NOTIFICATIONS);
  const [expanded, setExpanded] = React.useState(null);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, unread: false })));
  const unreadCount = notifications.filter(n => n.unread).length;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="absolute right-0 top-full mt-2 z-40 bg-white rounded-2xl shadow-xl overflow-hidden"
        style={{ width: 380, border: "1px solid #F0F0F0", maxHeight: "80vh", display: "flex", flexDirection: "column" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #F0F0F0" }}>
          <div>
            <span className="font-display font-bold text-sm" style={{ color: "#1A1A1A" }}>Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#EF4444", color: "#fff" }}>{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium" style={{ color: "#E8623A", background: "none", border: "none", cursor: "pointer" }}>Mark all read</button>
          )}
        </div>

        <div className="overflow-y-auto">
          {notifications.map((n, i) => (
            <div
              key={n.id}
              onClick={() => setExpanded(expanded === n.id ? null : n.id)}
              className="cursor-pointer"
              style={{ padding: "14px 20px", borderBottom: i < notifications.length - 1 ? "1px solid #F9F9F9" : "none", background: n.unread ? "#FAFAFA" : "#fff", transition: "background 0.15s" }}
            >
              <div className="flex items-start gap-3">
                <div style={{ width: 34, height: 34, borderRadius: 10, background: n.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                  <Icon name={n.icon} size={15} color={n.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{n.title}</span>
                    {n.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8623A", flexShrink: 0 }} />}
                  </div>
                  <div className="text-xs" style={{ color: "#6B7280" }}>{n.body}</div>
                  {expanded === n.id && (
                    <div className="text-xs mt-2 p-2 rounded-lg" style={{ background: "#F5F5F5", color: "#4B5563", lineHeight: 1.6 }}>{n.detail}</div>
                  )}
                  <div className="text-xs mt-1.5" style={{ color: "#9CA3AF" }}>{n.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid #F0F0F0" }}>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>Only alerts relevant to Layana Resort & Spa are shown</span>
        </div>
      </div>
    </>
  );
}

function Header({ title, subtitle, onNewTask, newTaskLabel = "New Task" }) {
  const today = new Date("2025-05-26");
  const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <div
      className="sticky top-0 z-20 bg-white flex items-center justify-between gap-4"
      style={{ borderBottom: "1px solid #F0F0F0", padding: "16px 32px 16px 44px", height: 64 }}
    >
      <div className="shrink-0">
        <h1 className="font-display font-medium" style={{ fontSize: subtitle ? 16 : 15, color: "#1A1A1A" }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{subtitle}</p>}
      </div>

      <div className="flex-1 max-w-md relative hidden lg:block">
        <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-9 pr-12 text-sm focus:outline-none"
          style={{ background: "#F5F5F5", border: "none", borderRadius: 10, padding: "10px 16px 10px 36px", color: "#1A1A1A" }}
        />
        <span
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium px-1.5 py-0.5 rounded"
          style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", color: "#9CA3AF" }}
        >
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <button onClick={() => setNotifOpen(o => !o)} className="alfon-btn relative p-2 rounded-lg hover:bg-lightgray">
            <Icon name="Bell" size={18} color={notifOpen ? "#E8623A" : "#9CA3AF"} />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange breathe-dot"></span>}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-sm font-medium" style={{ color: "#1A1A1A" }}>
          <Icon name="Calendar" size={14} color="#9CA3AF" /> {dateStr}
          <Icon name="ChevronDown" size={14} color="#9CA3AF" />
        </span>
        <button
          onClick={() => setNewChatOpen(true)}
          className="alfon-btn flex items-center gap-1.5 font-display font-semibold text-sm text-white"
          style={{ background: "#E8623A", borderRadius: 10, padding: "10px 20px" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#D4522D")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#E8623A")}
        >
          <Icon name="MessageCircle" size={16} />
          New Chat
        </button>
        {onNewTask && (
          <button
            onClick={onNewTask}
            className="alfon-btn flex items-center gap-1.5 font-display font-semibold text-sm text-white"
            style={{ background: "#E8623A", borderRadius: 10, padding: "10px 20px" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#D4522D")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#E8623A")}
          >
            <Icon name="Plus" size={16} />
            {newTaskLabel}
          </button>
        )}
      </div>
      <NewChatModal open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </div>
  );
}
window.Header = Header;
