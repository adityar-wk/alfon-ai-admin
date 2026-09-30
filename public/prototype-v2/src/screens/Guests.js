function GuestListItem({ guest, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex items-center gap-3"
      style={{
        borderBottom: "1px solid #F0F0F0",
        background: active ? "#FFF4F0" : "transparent",
        borderLeft: active ? "3px solid #E8623A" : "3px solid transparent",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#FAFAFA"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Avatar photo={guest.photo} initials={guest.initials} size={9} />
      <div className="flex-1 min-w-0">
        <div className="font-display font-semibold text-sm truncate" style={{ color: "#1A1A1A" }}>{guest.name}</div>
        <div className="text-xs" style={{ color: "#6B7280" }}>Room {guest.room} · {guest.status}</div>
      </div>
      <span className="text-base shrink-0">{guest.flag}</span>
    </button>
  );
}

function GuestHeaderCard({ guest }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start gap-5">
        {guest.photo ? (
          <img
            src={guest.photo}
            alt=""
            className="rounded-full object-cover shrink-0"
            style={{ width: 80, height: 80 }}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center font-display font-bold shrink-0"
            style={{ width: 80, height: 80, fontSize: 28, background: "#FFF4F0", color: "#E8623A" }}
          >
            {guest.initials}
          </div>
        )}
        <div className="flex-1 min-w-[220px]">
          <div className="flex justify-end gap-2 mb-1">
            <button className="alfon-btn flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
              <Icon name="Pencil" size={13} color="#9CA3AF" /> Edit Profile
            </button>
            <button className="alfon-btn p-1.5 rounded-lg hover:bg-lightgray"><Icon name="MoreVertical" size={16} color="#9CA3AF" /></button>
          </div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className="font-display font-bold" style={{ fontSize: 24, color: "#1A1A1A" }}>{guest.name}</h2>
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{
                background: guest.status === "In-House" ? "#F0FDF4" : guest.status === "Pre-Arrival" ? "#FFF9EC" : "#F5F5F5",
                color: guest.status === "In-House" ? "#22C55E" : guest.status === "Pre-Arrival" ? "#D97706" : "#6B7280",
              }}
            >
              {guest.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "#6B7280" }}>
            <span>{guest.flag}</span> {guest.nationality} &nbsp;·&nbsp; Room {guest.room} &nbsp;·&nbsp; {guest.roomType}
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-center gap-2"><Icon name="Calendar" size={14} color="#9CA3AF" /> <span style={{ color: "#9CA3AF" }}>Check-in</span> <span className="font-medium" style={{ color: "#1A1A1A" }}>{guest.checkIn}</span></div>
            <div className="flex items-center gap-2"><Icon name="Calendar" size={14} color="#9CA3AF" /> <span style={{ color: "#9CA3AF" }}>Check-out</span> <span className="font-medium" style={{ color: "#1A1A1A" }}>{guest.checkOut}</span></div>
            <div className="flex items-center gap-2"><Icon name="Moon" size={14} color="#9CA3AF" /> <span style={{ color: "#9CA3AF" }}>Length of Stay</span> <span className="font-medium" style={{ color: "#1A1A1A" }}>{guest.nights} nights</span></div>
            <div className="flex items-center gap-2"><Icon name="History" size={14} color="#9CA3AF" /> <span style={{ color: "#9CA3AF" }}>Previous Stays</span> <span className="font-medium" style={{ color: "#1A1A1A" }}>{guest.history.length}</span></div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PreferenceCard({ icon, label, value }) {
  if (!value) return null;
  const tags = String(value).split(",").map((t) => t.trim()).filter(Boolean);
  return (
    <div className="rounded-xl p-4" style={{ background: "#FAFAFA" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon name={icon} size={13} color="#9CA3AF" />
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex text-sm px-2.5 py-1 rounded-full" style={{ background: "#F5F5F5", color: "#1A1A1A" }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

function GuestProfileBody({ guest }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
      {/* Left column 60% */}
      <div className="lg:col-span-3 space-y-6">
        <Card style={{ borderLeft: "3px solid #93C5FD" }}>
          <div className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: "#2E86AB" }}>
            <Icon name="User" size={13} /> GUEST PROFILE
          </div>
          <p className="text-sm" style={{ color: "#1A1A1A" }}>{guest.aiSummary}</p>
        </Card>

        {guest.anticipatedNeeds && (
          <Card style={{ borderLeft: "3px solid #F59E0B" }}>
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: "#B45309" }}>
              <Icon name="Lightbulb" size={13} /> ANTICIPATED NEEDS
            </div>
            <p className="text-sm" style={{ color: "#1A1A1A" }}>{guest.anticipatedNeeds}</p>
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Preferences</span>
            <button className="text-sm font-medium" style={{ color: "#E8623A" }}>Edit</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PreferenceCard icon="BedDouble" label="Room Preferences" value={guest.preferences.room} />
            <PreferenceCard icon="UtensilsCrossed" label="Dietary Requirements" value={guest.preferences.dietary} />
            <PreferenceCard icon="Target" label="Purpose of Visit" value={guest.preferences.purpose} />
            <PreferenceCard icon="MessageCircle" label="Communication Language" value={guest.preferences.language} />
            <PreferenceCard icon="AlarmClock" label="Wake Up Call Preference" value={guest.preferences.wakeup} />
            <PreferenceCard icon="Thermometer" label="Temperature Preference" value={guest.preferences.temperature} />
            <PreferenceCard icon="Wine" label="Minibar Preference" value={guest.preferences.minibar} />
            <PreferenceCard icon="Newspaper" label="Newspaper Preference" value={guest.preferences.newspaper} />
          </div>
        </Card>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9CA3AF" }}>Stay History</div>
          {guest.history.length === 0 ? (
            <p className="text-sm" style={{ color: "#6B7280" }}>No previous stays on record. This is {guest.name.split(" ")[0]}'s first visit.</p>
          ) : (
            <div className="space-y-1.5">
              {guest.history.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm rounded-lg px-3 py-2" style={{ background: "#FAFAFA" }}>
                  <span style={{ color: "#1A1A1A" }}>{h.date} · Room {h.room} · {h.nights} nights</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Right column 40% */}
      <div className="lg:col-span-2 space-y-6">
        {(guest.actions || (guest.handover && guest.handover.active)) && (() => {
          const rows = guest.actions
            ? guest.actions.map((a) => ({ text: a.reason, dept: a.department, assignee: a.assignedTo, status: a.status === "Open" ? "Pending" : a.status }))
            : [{ text: guest.handover.reason, dept: guest.handover.role, assignee: guest.handover.to, status: guest.handover.status === "Open" ? "Pending" : guest.handover.status }];
          const statusStyle = (s) => {
            if (s === "Completed" || s === "Resolved") return { bg: "#DCFCE7", color: "#16A34A", label: "Completed" };
            if (s === "In Progress") return { bg: "#DBEAFE", color: "#2563EB", label: "In Progress" };
            return { bg: "#FEF3C7", color: "#D97706", label: "Pending" };
          };
          return (
            <Card style={{ borderLeft: "3px solid #E8623A", padding: "16px 20px" }}>
              <div className="flex items-center gap-1.5 mb-3">
                <Icon name="Bell" size={12} color="#E8623A" />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#E8623A" }}>Actions</span>
              </div>
              {rows.map((row, idx) => {
                const ss = statusStyle(row.status);
                return (
                <div key={idx} className="flex items-start gap-3 py-2.5" style={{ borderTop: idx > 0 ? "1px solid #F3F4F6" : "none" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5" style={{ background: "#FFF4F0", color: "#E8623A", fontSize: 10 }}>
                    {idx + 1}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed" style={{ color: "#374151" }}>{row.text}</p>
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "#F3F4F6", color: "#6B7280" }}>{row.dept}</span>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0" style={{ background: "#FFF4F0", color: "#E8623A", fontSize: 9 }} title={row.assignee}>
                      {row.assignee.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: ss.bg, color: ss.color }}>{ss.label}</span>
                  </div>
                </div>
                );
              })}
            </Card>
          );
        })()}

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Notes</span>
            <button className="flex items-center gap-1 text-sm font-medium" style={{ color: "#E8623A" }}><Icon name="Plus" size={13} /> Add Note</button>
          </div>
          {guest.notes.length === 0 ? (
            <p className="text-sm mb-3" style={{ color: "#6B7280" }}>No internal notes yet.</p>
          ) : (
            <div className="space-y-2 mb-3">
              {guest.notes.map((n, i) => (
                <div key={i} className="text-sm rounded-lg px-3 py-2" style={{ background: "#FAFAFA" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-display font-semibold text-[10px]" style={{ background: "#FFF4F0", color: "#E8623A" }}>
                      {n.author[0]}
                    </div>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>{n.author} · {n.time}</span>
                  </div>
                  <div style={{ color: "#1A1A1A" }}>{n.text}</div>
                </div>
              ))}
            </div>
          )}
          <textarea
            placeholder="Add an internal note..."
            rows={2}
            className="w-full px-3 py-2 text-sm focus:outline-none mb-2"
            style={{ background: "#F5F5F5", border: "none", borderRadius: 10, color: "#1A1A1A" }}
          />
          <button
            className="alfon-btn text-sm font-display font-semibold text-white px-4 py-2 rounded-lg"
            style={{ background: "#E8623A" }}
          >
            Add Note
          </button>
        </Card>
      </div>
    </div>
  );
}

function GuestsScreen() {
  const [activeId, setActiveId] = React.useState(() => {
    const pending = window.pendingGuestId;
    if (pending) { window.pendingGuestId = null; return pending; }
    return window.guests[0].id;
  });
  const [filter, setFilter] = React.useState("All");

  const filters = ["All", "In-House", "Pre-Arrival", "Checked Out"];
  const filtered = window.guests.filter((g) => {
    if (filter === "All") return true;
    return g.status === filter;
  });

  const activeGuest = window.guests.find((g) => g.id === activeId);
  const [mobileView, setMobileView] = React.useState("list"); // "list" | "profile"

  const handleSelectGuest = (id) => {
    setActiveId(id);
    setMobileView("profile");
  };

  // On mobile: show list or profile fullscreen; on desktop: side-by-side
  return (
    <div>
      <Header title={mobileView === "profile" && activeGuest ? (
        <div className="flex items-center gap-2 md:hidden">
          <button onClick={() => setMobileView("list")} className="p-1 -ml-1 rounded-lg hover:bg-lightgray">
            <Icon name="ChevronLeft" size={20} color="#1A1A1A" />
          </button>
          <span>{activeGuest.name}</span>
        </div>
      ) : "Guests"} />

      {/* Mobile list view */}
      <div className={`md:hidden ${mobileView === "list" ? "block" : "hidden"}`}>
        <div className="bg-card mx-4 mt-4 rounded-2xl overflow-hidden" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="p-4" style={{ borderBottom: "1px solid #F0F0F0" }}>
            <div className="relative mb-3">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
              <input
                placeholder="Search guests..."
                className="w-full pl-8 pr-3 py-2 text-sm focus:outline-none"
                style={{ background: "#F5F5F5", border: "none", borderRadius: 10, color: "#1A1A1A" }}
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  style={{ background: filter === f ? "#E8623A" : "#F5F5F5", color: filter === f ? "#FFFFFF" : "#6B7280" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            {filtered.map((g) => (
              <GuestListItem key={g.id} guest={g} active={g.id === activeId} onClick={() => handleSelectGuest(g.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile profile view */}
      <div className={`md:hidden ${mobileView === "profile" ? "block" : "hidden"} px-4 pb-8`}>
        {activeGuest && (
          <>
            <GuestHeaderCard guest={activeGuest} />
            <GuestProfileBody guest={activeGuest} />
          </>
        )}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex p-6 gap-5" style={{ minHeight: 600 }}>
        <div className="w-72 shrink-0 bg-card rounded-2xl flex flex-col overflow-hidden" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
          <div className="p-4" style={{ borderBottom: "1px solid #F0F0F0" }}>
            <div className="relative mb-3">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
              <input
                placeholder="Search guests..."
                className="w-full pl-8 pr-3 py-2 text-sm focus:outline-none"
                style={{ background: "#F5F5F5", border: "none", borderRadius: 10, color: "#1A1A1A" }}
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)} className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  style={{ background: filter === f ? "#E8623A" : "#F5F5F5", color: filter === f ? "#FFFFFF" : "#6B7280" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((g) => (
              <GuestListItem key={g.id} guest={g} active={g.id === activeId} onClick={() => setActiveId(g.id)} />
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeGuest ? (
            <>
              <GuestHeaderCard guest={activeGuest} />
              <GuestProfileBody guest={activeGuest} />
            </>
          ) : (
            <Card><EmptyState title="Select a guest" desc="Choose a guest from the list to view their full profile." /></Card>
          )}
        </div>
      </div>
    </div>
  );
}
window.GuestsScreen = GuestsScreen;
