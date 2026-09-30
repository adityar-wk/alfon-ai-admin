const PRE_ARRIVAL_STATUS_STYLE = {
  "Message Sent": { bg: "#EFF6FF", color: "#1D4ED8" },
  Responded: { bg: "#F0FDF4", color: "#16A34A" },
  "Preferences Collected": { bg: "#F3F0FF", color: "#7C3AED" },
  Pending: { bg: "#F5F5F5", color: "#6B7280" },
  "No WhatsApp": { bg: "#FEF2F2", color: "#DC2626" },
};

function PreArrivalStatusBadge({ status }) {
  const s = PRE_ARRIVAL_STATUS_STYLE[status] || PRE_ARRIVAL_STATUS_STYLE.Pending;
  const dot = status === "Pending" ? "⚪" : status === "No WhatsApp" ? "⚪" : "●";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
      {dot} {status}
    </span>
  );
}

function PreArrivalHeader({ onUpload, onSendAll }) {
  return (
    <div
      className="sticky top-0 z-20 bg-white flex items-center justify-between gap-4 flex-wrap"
      style={{ borderBottom: "1px solid #F0F0F0", padding: "16px 32px 16px 44px", minHeight: 64 }}
    >
      <div className="shrink-0">
        <h1 className="font-display font-medium" style={{ fontSize: 16, color: "#1A1A1A" }}>Pre-Arrival</h1>
        <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Manage arriving guests and initiate personalised WhatsApp conversations before check-in</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSendAll}
          className="alfon-btn font-display font-semibold text-sm px-4 py-2 rounded-lg"
          style={{ border: "1.5px solid #E8623A", color: "#E8623A" }}
        >
          Send All Pre-Arrival Messages
        </button>
        <button
          onClick={onUpload}
          className="alfon-btn flex items-center gap-1.5 font-display font-semibold text-sm text-white px-4 py-2 rounded-lg"
          style={{ background: "#E8623A" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#D4522D")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#E8623A")}
        >
          <Icon name="Plus" size={16} /> Upload Arrival Report
        </button>
      </div>
    </div>
  );
}

function UploadArrivalReportModal({ open, onClose }) {
  const [processing, setProcessing] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => { if (open) { setProcessing(false); setDone(false); } }, [open]);

  const process = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); setDone(true); }, 900);
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload Arrival Report" width="max-w-lg">
      <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
        Export your daily arrival report from your PMS as CSV or Excel and upload it here. Alfon AI will identify
        guests with WhatsApp numbers and begin the pre-arrival sequence automatically.
      </p>

      <div
        className="rounded-xl flex flex-col items-center justify-center text-center py-10 px-6 mb-3"
        style={{ border: "1.5px dashed #F0B8A6", background: "#FFF8F4" }}
      >
        <Icon name="UploadCloud" size={32} color="#E8623A" />
        <div className="font-display font-medium mt-3" style={{ color: "#1A1A1A" }}>Drag and drop your arrival report here</div>
        <div className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Supports CSV and Excel (.xlsx) files</div>
        <button className="alfon-btn mt-4 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: "1.5px solid #E8623A", color: "#E8623A" }}>
          Browse Files
        </button>
      </div>

      <div className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
        {done ? "Last uploaded: Just now — 42 guests imported" : "Last uploaded: Today at 08:45 AM — 42 guests imported"}
      </div>

      <div className="rounded-lg px-3 py-2.5 mb-5 text-xs" style={{ background: "#F5F5F5", color: "#6B7280" }}>
        Expected columns: Guest Name, Room Number, Check-in Date, Check-out Date, Phone Number, Email, Room Type, Adults, Booking Source
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="alfon-btn px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-lightgray">Cancel</button>
        <button onClick={process} className="alfon-btn px-4 py-2 text-sm font-display font-semibold rounded-lg bg-orange text-white hover:bg-orangeHover">
          {processing ? "Processing..." : done ? "Processed ✓" : "Upload & Process"}
        </button>
      </div>
    </Modal>
  );
}

function SendPreArrivalMessageModal({ guest, onClose, onSent }) {
  if (!guest) return null;
  const [sent, setSent] = React.useState(false);
  const message = window.preArrivalMessageTemplate(guest);

  const send = () => {
    setSent(true);
    setTimeout(() => { onSent(guest.id); onClose(); }, 600);
  };

  return (
    <Modal open={!!guest} onClose={onClose} title="Send Pre-Arrival Message" width="max-w-lg">
      <div className="flex items-center gap-3 mb-4">
        <Avatar initials={guest.initials} size={9} vip={guest.vip} />
        <div>
          <div className="font-display font-semibold" style={{ color: "#1A1A1A" }}>{guest.name}</div>
          <div className="text-xs" style={{ color: "#6B7280" }}>Room {guest.room} · {guest.roomType}</div>
        </div>
      </div>

      <div className="rounded-lg px-4 py-3 mb-3 text-sm whitespace-pre-line" style={{ background: "#FAFAFA", color: "#1A1A1A", maxHeight: 260, overflowY: "auto" }}>
        {message}
      </div>

      <div className="text-xs mb-5" style={{ color: "#9CA3AF" }}>
        This message will be sent via WhatsApp to {guest.phone}
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="alfon-btn px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-lightgray">Cancel</button>
        <button onClick={send} className="alfon-btn px-4 py-2 text-sm font-display font-semibold rounded-lg bg-orange text-white hover:bg-orangeHover">
          {sent ? "Sent ✓" : "Send Pre-Arrival Message"}
        </button>
      </div>
    </Modal>
  );
}

function ManualContactModal({ guest, onClose }) {
  if (!guest) return null;
  return (
    <Modal open={!!guest} onClose={onClose} title="Manual Contact" width="max-w-sm">
      <div className="flex items-center gap-3 mb-4">
        <Avatar initials={guest.initials} size={9} vip={guest.vip} />
        <div>
          <div className="font-display font-semibold" style={{ color: "#1A1A1A" }}>{guest.name}</div>
          <div className="text-xs" style={{ color: "#6B7280" }}>No WhatsApp number on file</div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#F5F5F5" }}>
          <Icon name="Phone" size={14} color="#9CA3AF" /> <span style={{ color: "#1A1A1A" }}>{guest.phone}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#F5F5F5" }}>
          <Icon name="Mail" size={14} color="#9CA3AF" /> <span style={{ color: "#1A1A1A" }}>{guest.email}</span>
        </div>
      </div>
    </Modal>
  );
}

function PreArrivalTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-sm" style={{ color: "#9CA3AF" }}>No journey events recorded yet.</p>;
  }
  return (
    <div className="space-y-4">
      {timeline.map((step, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center pt-0.5">
            <span style={{ color: step.done ? "#E8623A" : "#D1D5DB" }}>
              <Icon name={step.done ? "CheckCircle2" : "Circle"} size={16} />
            </span>
            {i < timeline.length - 1 && <span className="w-px flex-1 mt-1" style={{ minHeight: 18, background: step.done ? "#E8623A" : "#E5E7EB" }} />}
          </div>
          <div className="pb-1">
            <div className="text-sm font-medium" style={{ color: step.done ? "#1A1A1A" : "#9CA3AF" }}>{step.label}</div>
            <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{step.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreArrivalDetailPanel({ guest, onClose, onSendMessage, onTransfer }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (guest) requestAnimationFrame(() => setVisible(true));
    else setVisible(false);
  }, [guest && guest.id]);

  if (!guest) return null;
  const canTransfer = guest.status === "Responded" || guest.status === "Preferences Collected";

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={onClose}>
      <div
        className="bg-card h-full overflow-y-auto shadow-xl p-6"
        style={{ width: 380, maxWidth: "100%", transform: visible ? "translateX(0)" : "translateX(100%)", transition: "transform 300ms ease" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar initials={guest.initials} size={12} vip={guest.vip} />
            <div>
              <div className="font-display font-bold" style={{ fontSize: 18, color: "#1A1A1A" }}>{guest.name}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Room {guest.room} · {guest.roomType}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-lightgray shrink-0"><Icon name="X" size={18} color="#9CA3AF" /></button>
        </div>

        <div className="text-sm mb-5" style={{ color: "#6B7280" }}>
          {guest.checkIn} → {guest.checkOut} <span style={{ color: "#9CA3AF" }}>· {guest.nights} nights</span>
        </div>

        <div className="border-t border-border/60 pt-4 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9CA3AF" }}>Pre-Arrival Journey</div>
          <PreArrivalTimeline timeline={guest.timeline} />
        </div>

        <div className="border-t border-border/60 pt-4 mb-5">
          <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9CA3AF" }}>Preferences Collected</div>
          {guest.preferences ? (
            <div className="flex flex-wrap gap-1.5">
              {guest.preferences.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-sm px-2.5 py-1 rounded-full" style={{ background: "#F5F5F5", color: "#1A1A1A" }}>
                  <span>{p.icon}</span> {p.label}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm" style={{ color: "#9CA3AF" }}>
              <span className="w-2 h-2 rounded-full bg-orange breathe-dot" /> Awaiting guest response
            </div>
          )}
        </div>

        {guest.messages && guest.messages.length > 0 && (
          <div className="border-t border-border/60 pt-4 mb-5">
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#9CA3AF" }}>Pre-Arrival Conversation</div>
            <div className="space-y-2 mb-2">
              {guest.messages.slice(-3).map((m, i) => (
                <div
                  key={i}
                  className="text-sm rounded-lg px-3 py-2"
                  style={{ background: m.from === "guest" ? "#FFF4F0" : "#F5F5F5", color: "#1A1A1A" }}
                >
                  {m.text}
                  <div className="text-[11px] mt-1" style={{ color: "#9CA3AF" }}>{m.time}</div>
                </div>
              ))}
            </div>
            <button onClick={() => window.navigateTo("/chats")} className="text-sm font-medium" style={{ color: "#E8623A" }}>
              View full conversation →
            </button>
          </div>
        )}

        {!guest.hasWhatsApp && (
          <div className="rounded-lg px-3 py-2.5 mb-5 text-sm" style={{ background: "#FEF2F2", color: "#991B1B" }}>
            No WhatsApp number on file for this guest — contact manually using their phone or email.
          </div>
        )}

        {guest.status === "Pending" && guest.hasWhatsApp && (
          <button
            onClick={() => onSendMessage(guest)}
            className="alfon-btn w-full font-display font-semibold text-white py-2.5 rounded-lg mb-5"
            style={{ background: "#E8623A", fontSize: 14 }}
          >
            Send Pre-Arrival Message
          </button>
        )}

        {canTransfer && (
          <>
            <button
              onClick={() => onTransfer(guest)}
              className="alfon-btn w-full font-display font-semibold text-white py-2.5 rounded-lg"
              style={{ background: "#E8623A", fontSize: 14 }}
            >
              Transfer to In-House Chat
            </button>
            <div className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
              This will move the guest to the active In-House guest list. Only perform this action after the guest has physically checked in at front desk.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PreArrivalEmptyState({ onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#FFF4F0" }}>
        <Icon name="Plane" size={30} color="#E8623A" />
      </div>
      <div className="font-display font-semibold mb-1" style={{ fontSize: 16, color: "#1A1A1A" }}>No arrivals today</div>
      <div className="text-sm mb-5 max-w-sm" style={{ color: "#6B7280" }}>
        Upload your arrival report to see today's guests and begin pre-arrival conversations.
      </div>
      <button onClick={onUpload} className="alfon-btn flex items-center gap-1.5 font-display font-semibold text-sm text-white px-4 py-2 rounded-lg" style={{ background: "#E8623A" }}>
        <Icon name="Plus" size={16} /> Upload Arrival Report
      </button>
    </div>
  );
}

function PreArrivalGuestRow({ guest, onSelect, onSendMessage, onManualContact }) {
  return (
    <tr onClick={() => onSelect(guest)} className="border-b border-border/60 cursor-pointer hover:bg-lightgray/60 transition-colors duration-200">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar initials={guest.initials} size={8} vip={guest.vip} />
          <span className="font-medium" style={{ color: "#1A1A1A" }}>{guest.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate">{guest.room}</td>
      <td className="px-4 py-3 text-slate">{guest.checkIn}</td>
      <td className="px-4 py-3 text-slate">{guest.nights}</td>
      <td className="px-4 py-3"><PreArrivalStatusBadge status={guest.status} /></td>
      <td className="px-4 py-3">
        {guest.hasWhatsApp ? <Icon name="Check" size={15} color="#22C55E" /> : <Icon name="X" size={15} color="#DC2626" />}
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {guest.status === "No WhatsApp" ? (
          <button onClick={() => onManualContact(guest)} className="text-sm font-medium" style={{ color: "#DC2626" }}>Manual Contact</button>
        ) : guest.status === "Pending" ? (
          <button onClick={() => onSendMessage(guest)} className="text-sm font-medium" style={{ color: "#E8623A" }}>Send Message</button>
        ) : (
          <button onClick={() => window.navigateTo("/chats")} className="text-sm font-medium" style={{ color: "#E8623A" }}>View Chat</button>
        )}
      </td>
    </tr>
  );
}

function PreArrivalGuestTable({ guests, onSelect, onSendMessage, onManualContact }) {
  return (
    <Card className="overflow-hidden p-0" hover={false}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-lightgray text-slate text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Guest</th>
              <th className="text-left px-4 py-3 font-medium">Room</th>
              <th className="text-left px-4 py-3 font-medium">Check-in</th>
              <th className="text-left px-4 py-3 font-medium">Nights</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">WhatsApp</th>
              <th className="text-left px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <PreArrivalGuestRow key={g.id} guest={g} onSelect={onSelect} onSendMessage={onSendMessage} onManualContact={onManualContact} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PreArrivalScreen() {
  const [guests, setGuests] = React.useState(window.preArrivalGuests);
  const [tab, setTab] = React.useState("today");
  const [filter, setFilter] = React.useState("All");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [messageGuest, setMessageGuest] = React.useState(null);
  const [contactGuest, setContactGuest] = React.useState(null);

  const stats = window.preArrivalStats;

  const tabGuests = guests.filter((g) => g.arrivalDay === tab);
  const filters = ["All", "Message Pending", "Message Sent", "Responded", "Preferences Collected"];

  const filtered = tabGuests.filter((g) => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "All") return true;
    if (filter === "Message Pending") return g.status === "Pending" || g.status === "No WhatsApp";
    return g.status === filter;
  });

  const markSent = (id) => {
    setGuests((gs) => gs.map((g) => (g.id === id ? { ...g, status: "Message Sent" } : g)));
  };

  const sendAll = () => {
    setGuests((gs) => gs.map((g) => (g.arrivalDay === tab && g.status === "Pending" && g.hasWhatsApp ? { ...g, status: "Message Sent" } : g)));
  };

  const transferToInHouse = (guest) => {
    setSelected(null);
    window.navigateTo("/guests");
  };

  return (
    <div>
      <PreArrivalHeader onUpload={() => setUploadOpen(true)} onSendAll={sendAll} />

      <div className="pt-7 px-6 pb-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon="Plane" label="Arriving Today" value={stats.arrivingToday.value} sub={stats.arrivingToday.sub} subColor="text-orange" />
          <StatCard icon="CalendarClock" label="Arriving Tomorrow" value={stats.arrivingTomorrow.value} />
          <StatCard icon="Send" label="Pre-Arrival Sent" value={stats.preArrivalSent.value} sub={stats.preArrivalSent.sub} subColor="text-success" />
          <StatCard icon="ClipboardCheck" label="Preferences Collected" value={stats.preferencesCollected.value} sub={stats.preferencesCollected.sub} subColor="text-success" />
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: "today", label: "Arriving Today" },
            { id: "tomorrow", label: "Arriving Tomorrow" },
            { id: "upcoming", label: "Upcoming (7 days)" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setFilter("All"); setSearch(""); }}
              className={`alfon-btn px-4 py-2 text-sm font-medium rounded-lg ${tab === t.id ? "bg-orange text-white" : "bg-white border border-border text-slate hover:bg-lightgray"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "tomorrow" && (
          <div className="flex items-center justify-between gap-3 rounded-lg px-4 py-3 flex-wrap" style={{ background: "#FFF8F4", border: "1px solid #FFE4D6" }}>
            <span className="text-sm" style={{ color: "#991B1B" }}>
              Pre-arrival messages for tomorrow's guests will be sent automatically at 10:00 AM tomorrow morning, or you can send them manually now.
            </span>
            <button onClick={sendAll} className="alfon-btn shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-lg" style={{ border: "1.5px solid #E8623A", color: "#E8623A" }}>
              Send All Now
            </button>
          </div>
        )}

        {tab !== "upcoming" && (
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
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guests..."
                className="pl-8 pr-3 py-2 text-sm rounded-lg focus:outline-none"
                style={{ background: "#F5F5F5", border: "none", width: 220, color: "#1A1A1A" }}
              />
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          tab === "today" ? (
            <Card><PreArrivalEmptyState onUpload={() => setUploadOpen(true)} /></Card>
          ) : (
            <Card><EmptyState icon="Plane" title="No guests in this view" desc="Try a different tab or adjust your filters." /></Card>
          )
        ) : (
          <PreArrivalGuestTable
            guests={filtered}
            onSelect={setSelected}
            onSendMessage={setMessageGuest}
            onManualContact={setContactGuest}
          />
        )}
      </div>

      <PreArrivalDetailPanel
        guest={selected}
        onClose={() => setSelected(null)}
        onSendMessage={(g) => setMessageGuest(g)}
        onTransfer={transferToInHouse}
      />
      <UploadArrivalReportModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <SendPreArrivalMessageModal guest={messageGuest} onClose={() => setMessageGuest(null)} onSent={markSent} />
      <ManualContactModal guest={contactGuest} onClose={() => setContactGuest(null)} />
    </div>
  );
}
window.PreArrivalScreen = PreArrivalScreen;
