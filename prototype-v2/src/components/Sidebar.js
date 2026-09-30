function AlfonLogo() {
  const [hasImage, setHasImage] = React.useState(null);

  React.useEffect(() => {
    const candidates = ["./public/assets/logo.png", "./public/assets/logo.svg"];
    let cancelled = false;
    (async () => {
      for (const src of candidates) {
        try {
          const res = await fetch(src, { method: "HEAD", cache: "no-store" });
          if (res.ok && !cancelled) {
            setHasImage(src);
            return;
          }
        } catch (e) {
          // ignore, fall through to text logo
        }
      }
      if (!cancelled) setHasImage(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (hasImage) {
    return (
      <div style={{ width: 176, height: 42, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          src={hasImage}
          alt="Alfon AI"
          style={{ height: 210, width: 210, objectFit: "cover", flexShrink: 0 }}
        />
      </div>
    );
  }

  return <span className="font-display font-bold text-xl text-darktext">ALFON</span>;
}

function Sidebar() {
  const path = window.useHashRoute();
  const navigate = window.navigateTo;

  const navItems = [
    { to: "/", label: "Home", icon: "Home" },
    { to: "/tasks", label: "Tasks", icon: "CheckSquare", badge: () => window.tasks.filter((t) => t.status !== "Completed").length },
    { to: "/chats", label: "Guest Chats", icon: "MessageCircle", badge: () => window.conversations.length },
    { to: "/guests", label: "Guest Profiles", icon: "Users" },
    { to: "/pre-arrival", label: "Pre-Arrival", icon: "Plane", badge: () => window.preArrivalGuests.filter((g) => g.arrivalDay === "today" && g.status === "Pending").length },
    { to: "/team", label: "Team", icon: "UserCheck" },
    { to: "/housekeeping", label: "Housekeeping", icon: "BedDouble" },
    { to: "/analytics", label: "Analytics", icon: "BarChart2" },
    { to: "/reports", label: "Reports", icon: "FileText" },
    { to: "/settings", label: "Settings", icon: "Settings" },
  ];

  return (
    <div
      className="hidden md:flex flex-col bg-white h-screen sticky top-0 shrink-0"
      style={{ width: 220, borderRight: "1px solid #F0F0F0" }}
    >
      <div className="flex items-center justify-center" style={{ padding: "28px 16px 24px", borderBottom: "1px solid #F5F5F5" }}>
        <AlfonLogo />
      </div>

      <nav className="flex-1 overflow-y-auto" style={{ padding: "0 16px" }}>
        {navItems.map((item) => {
          const active = path === item.to;
          const count = item.badge ? item.badge() : 0;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className="alfon-btn w-full flex items-center gap-3 text-left mb-1"
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                background: active ? "#FFF4F0" : "transparent",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#FFF4F0"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon name={item.icon} size={18} className="" color={active ? "#E8623A" : "#9CA3AF"} />
              <span
                className="text-sm flex-1"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: active ? 600 : 500,
                  color: active ? "#E8623A" : "#6B7280",
                }}
              >
                {item.label}
              </span>
              {count > 0 && (
                <span
                  className="text-[11px] font-semibold rounded-full px-1.5 min-w-[20px] text-center"
                  style={{
                    background: active ? "#E8623A" : "#F5F5F5",
                    color: active ? "#FFFFFF" : "#6B7280",
                    lineHeight: "16px",
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-3" style={{ padding: "16px", borderTop: "1px solid #F0F0F0" }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold font-display shrink-0"
          style={{ background: "#F0F0F0", color: "#1A1A1A" }}
        >
          SC
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate" style={{ color: "#1A1A1A" }}>Franck Delen</div>
          <div className="text-xs truncate" style={{ color: "#6B7280" }}>General Manager</div>
        </div>
        <Icon name="ChevronRight" size={16} color="#9CA3AF" />
      </div>
    </div>
  );
}
window.Sidebar = Sidebar;
