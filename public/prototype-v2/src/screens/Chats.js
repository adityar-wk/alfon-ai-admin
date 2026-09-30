function ConversationListItem({ convo, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex gap-3"
      style={{
        borderBottom: "1px solid #F0F0F0",
        background: active ? "#F5F5F5" : "transparent",
        borderLeft: active ? "3px solid #D1D5DB" : "3px solid transparent",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#FAFAFA"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <Avatar photo={convo.photo} initials={convo.initials} size={9} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-sm truncate" style={{ color: "#1A1A1A" }}>{convo.guest}</span>
          <span className="text-[11px] shrink-0 ml-2" style={{ color: "#9CA3AF" }}>{convo.time}</span>
        </div>
        <div className="text-xs" style={{ color: "#E8623A" }}>Room {convo.room}</div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-xs truncate" style={{ color: "#6B7280" }}>{convo.lastMessage}</span>
          {(convo.status === "Resolved" || convo.status === "Pending" || convo.status === "Pre-Arrival") && (
            <StatusBadge status={convo.status} />
          )}
        </div>
      </div>
    </button>
  );
}

function AttributionTooltip({ lines }) {
  return (
    <div
      className="absolute right-0 bottom-full mb-1 hidden group-hover:block whitespace-pre-line z-10 pointer-events-none"
      style={{ background: "#1A1A1A", color: "#FFFFFF", fontSize: 11, padding: "6px 10px", borderRadius: 6, maxWidth: 200 }}
    >
      {lines.join("\n")}
    </div>
  );
}

function AttributionTag({ msg }) {
  if (msg.sender === "ai") {
    return (
      <div className="relative group" style={{ marginTop: 3 }}>
        <div
          className="flex items-center justify-end gap-1"
          style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#9CA3AF", textAlign: "right" }}
        >
          <span style={{ color: "#E8623A" }}>✦</span> Alfon AI
        </div>
        <AttributionTooltip lines={["Sent by Alfon AI", "Automated response", msg.timestamp]} />
      </div>
    );
  }
  if (msg.sender === "human") {
    return (
      <div className="relative group" style={{ marginTop: 3 }}>
        <div
          className="flex items-center justify-end gap-1"
          style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#9CA3AF", textAlign: "right" }}
        >
          <Icon name="UserCircle2" size={10} color="#6B7280" /> {msg.staffName} · {msg.staffRole}
        </div>
        <AttributionTooltip lines={[`Sent by ${msg.staffName}`, msg.staffRole, `Staff ID: ${msg.staffId}`, msg.timestamp]} />
      </div>
    );
  }
  return null;
}

function SystemMessage({ msg }) {
  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ margin: "8px 0" }}
    >
      <div
        className="text-center"
        style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic" }}
      >
        {`─── ${msg.content}${msg.timestamp ? " · " + msg.timestamp : ""} ───`}
      </div>
      {msg.taskId != null && (
        <button
          onClick={() => window.navigateToTask(msg.taskId)}
          className="alfon-btn flex items-center gap-1 text-xs font-medium"
          style={{ color: "#E8623A" }}
        >
          <Icon name="ListChecks" size={12} /> View Task
        </button>
      )}
    </div>
  );
}

function ChatBubble({ msg }) {
  const isGuest = msg.sender === "guest";
  return (
    <div className={`flex ${isGuest ? "justify-start" : "justify-end"} msg-in`}>
      <div className={`flex flex-col max-w-[75%] ${isGuest ? "items-start" : "items-end"}`}>
        <div
          className="text-sm whitespace-pre-line"
          style={
            isGuest
              ? {
                  background: "#FFFFFF",
                  borderRadius: "20px 20px 20px 4px",
                  border: "1px solid #F0F0F0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  padding: "12px 16px",
                  color: "#1A1A1A",
                }
              : {
                  background: "linear-gradient(135deg, #FFF8F4, #FFF0E8)",
                  borderRadius: "20px 20px 4px 20px",
                  border: "1px solid rgba(232,98,58,0.1)",
                  padding: "12px 16px",
                  color: "#1A1A1A",
                }
          }
        >
          {msg.content}
          <div className="text-[10px] mt-1 flex items-center gap-1 justify-end" style={{ color: "#9CA3AF" }}>
            {msg.timestamp} {!isGuest && <span style={{ color: "#E8623A" }}>✓✓</span>}
          </div>
        </div>
        {!isGuest && <AttributionTag msg={msg} />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-end">
      <div
        className="flex gap-1.5"
        style={{ background: "linear-gradient(135deg, #FFF8F4, #FFF0E8)", borderRadius: "20px 20px 4px 20px", border: "1px solid rgba(232,98,58,0.1)", padding: "14px 18px" }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-orange typing-dot" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function GuestInfoPanel({ guest, convo }) {
  return (
    <div className="w-72 shrink-0 bg-card rounded-2xl overflow-y-auto p-5 hidden xl:block" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-display font-semibold text-sm" style={{ color: "#1A1A1A" }}>Guest Information</span>
        <button onClick={() => window.navigateToGuest(guest.id)} className="text-xs font-medium" style={{ color: "#E8623A" }}>View Profile</button>
      </div>

      <div className="flex flex-col items-center text-center mb-5">
        <Avatar photo={guest.photo} initials={guest.initials} size={12} />
        <div className="font-display font-bold mt-2" style={{ color: "#1A1A1A" }}>{guest.name}</div>
        <div className="text-xs" style={{ color: "#6B7280" }}>Room {guest.room}</div>
      </div>

      <div className="space-y-1.5 text-sm mb-4" style={{ color: "#1A1A1A" }}>
        <div className="flex items-center gap-2"><Icon name="Phone" size={14} color="#9CA3AF" /> {guest.phone}</div>
        <div className="flex items-center gap-2"><Icon name="Mail" size={14} color="#9CA3AF" /> {guest.email}</div>
        <div className="flex items-center gap-2"><span>{guest.flag}</span> {guest.nationality}</div>
        <div className="flex items-center gap-2"><Icon name="Calendar" size={14} color="#9CA3AF" /> Check-in: {guest.checkIn}</div>
        <div className="flex items-center gap-2"><Icon name="Calendar" size={14} color="#9CA3AF" /> Check-out: {guest.checkOut}</div>
        <div className="flex items-center gap-2"><Icon name="Moon" size={14} color="#9CA3AF" /> {guest.nights} Nights</div>
        <div className="flex items-center gap-2"><Icon name="BedDouble" size={14} color="#9CA3AF" /> {guest.roomType}</div>
        <div className="flex items-center gap-2"><Icon name="Users" size={14} color="#9CA3AF" /> {guest.adults} Adults</div>
        <div className="flex items-center gap-2"><Icon name="Tag" size={14} color="#9CA3AF" /> {guest.source}</div>
      </div>

      <div className="pt-4 mb-4" style={{ borderTop: "1px solid #F0F0F0" }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9CA3AF" }}>Guest Preferences</div>
        <div className="space-y-1.5 text-sm">
          {guest.preferences && guest.preferences.dietary && guest.preferences.dietary !== "None" && (
            <div className="flex items-start gap-2"><Icon name="UtensilsCrossed" size={13} color="#9CA3AF" /><span style={{ color: "#1A1A1A" }}>{guest.preferences.dietary}</span></div>
          )}
          {guest.preferences && guest.preferences.room && guest.preferences.room !== "Standard" && (
            <div className="flex items-start gap-2"><Icon name="BedDouble" size={13} color="#9CA3AF" /><span style={{ color: "#1A1A1A" }}>{guest.preferences.room}</span></div>
          )}
          {guest.preferences && guest.preferences.minibar && guest.preferences.minibar !== "Standard inventory" && (
            <div className="flex items-start gap-2"><Icon name="Wine" size={13} color="#9CA3AF" /><span style={{ color: "#1A1A1A" }}>{guest.preferences.minibar}</span></div>
          )}
          {(!guest.preferences || ((!guest.preferences.dietary || guest.preferences.dietary === "None") && (!guest.preferences.room || guest.preferences.room === "Standard") && (!guest.preferences.minibar || guest.preferences.minibar === "Standard inventory"))) && (
            <div className="text-xs" style={{ color: "#9CA3AF" }}>No preferences recorded yet.</div>
          )}
        </div>
      </div>

      <div className="pt-4 mb-4" style={{ borderTop: "1px solid #F0F0F0" }}>
        <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9CA3AF" }}>Quick Actions</div>
        <button className="alfon-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-lightgray" style={{ border: "1px solid #F0F0F0", color: "#1A1A1A" }}>
          <span className="flex items-center gap-2"><Icon name="ClipboardList" size={14} color="#9CA3AF" /> Send Template</span>
          <Icon name="ChevronRight" size={14} color="#9CA3AF" />
        </button>
      </div>

      {(window.guestItineraries || {})[guest.id] && (window.guestItineraries[guest.id].length > 0) && (
        <div className="pt-4" style={{ borderTop: "1px solid #F0F0F0" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="CalendarDays" size={13} color="#E8623A" />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>Itinerary</span>
          </div>
          <div className="space-y-2">
            {window.guestItineraries[guest.id].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#FFF8F4", border: "1px solid rgba(232,98,58,0.12)" }}>
                <span className="text-xs font-bold shrink-0" style={{ color: "#E8623A", minWidth: 52 }}>{item.time}</span>
                <span className="text-xs" style={{ color: "#1A1A1A" }}>{item.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AiTrainedPanel() {
  const items = [
    { n: 1, icon: "Target", t: "Anticipation", d: "AI recognizes guest needs before they are explicitly requested." },
    { n: 2, icon: "Heart", t: "Empathy", d: "Every response is written with warmth, care, and emotional intelligence." },
    { n: 3, icon: "MessageCircle", t: "Never Transactional", d: "Conversations feel human, personal, and service-driven." },
    { n: 4, icon: "User", t: "Guest-First Always", d: "The guest experience remains the priority in every interaction." },
    { n: 5, icon: "Star", t: "Preference Intelligence", d: "Every conversation becomes knowledge that improves future stays." },
  ];
  return (
    <div className="w-72 shrink-0 bg-card rounded-2xl overflow-y-auto p-5 hidden 2xl:block" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon name="Sparkles" size={14} color="#E8623A" className="ai-pulse" />
        <span className="font-display font-bold text-sm" style={{ color: "#E8623A" }}>AI Trained on the Highest Standards of Hospitality</span>
      </div>
      <p className="text-xs mb-4" style={{ color: "#6B7280" }}>
        Our AI is trained on LQA and Forbes Travel Guide standards — the highest benchmarks in luxury hospitality.
      </p>
      {items.map((item) => (
        <div key={item.n} className="flex gap-2.5 mb-3.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#FFFFFF", border: "1px solid rgba(232,98,58,0.25)" }}
          >
            <Icon name={item.icon} size={14} color="#E8623A" />
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: "#1A1A1A" }}>{item.t}</div>
            <div className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>{item.d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatsScreen() {
  const [activeId, setActiveId] = React.useState(() => {
    const pending = window.__pendingChatId;
    window.__pendingChatId = null;
    return pending || (window.conversations[0] && window.conversations[0].id) || 1;
  });
  const [messagesMap, setMessagesMap] = React.useState(() => JSON.parse(JSON.stringify(window.chatMessages)));
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState("");
  const [error, setError] = React.useState("");
  const [sendAsGuest, setSendAsGuest] = React.useState(false);
  const scrollRef = React.useRef(null);

  const convo = window.conversations.find((c) => c.id === activeId);
  const guest = window.guests.find((g) => g.id === convo.guestId);
  const messages = messagesMap[activeId] || [];

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, streamingText]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setError("");
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (sendAsGuest) {
      // Demo mode — simulate a guest message and trigger AI reply
      const guestMsg = { id: Date.now(), sender: "guest", content: text, timestamp: now };
      const updated = [...messages, guestMsg];
      setMessagesMap((m) => ({ ...m, [activeId]: updated }));
      setInput("");
      setTyping(true);
      setStreamingText("");
      let acc = "";
      await window.AlfonAPI.streamClaudeReply({
        guest,
        history: updated,
        onToken: (chunk) => { acc += chunk; setStreamingText(acc); },
        onDone: () => {
          setTyping(false);
          const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setMessagesMap((m) => ({
            ...m,
            [activeId]: [...m[activeId], { id: Date.now() + 1, sender: "ai", content: acc, timestamp: t, staffName: null, staffRole: null, staffId: null }],
          }));
          setStreamingText("");
        },
        onError: (err) => {
          setTyping(false);
          setStreamingText("");
          setError("Unable to connect. Please try again.");
        },
      });
    } else {
      // Staff mode — send as hotel staff, AI resumes after
      const staff = window.currentStaffUser;
      const handoverMsg = { id: Date.now(), sender: "system", content: `Conversation taken over by ${staff.name} · ${staff.role}`, timestamp: now };
      const humanMsg = { id: Date.now() + 1, sender: "human", content: text, timestamp: now, staffName: staff.name, staffRole: staff.role, staffId: staff.id };
      const updated = [...messages, handoverMsg, humanMsg];
      setMessagesMap((m) => ({ ...m, [activeId]: updated }));
      setInput("");
    }
  };

  return (
    <div>
      <Header title="Guest Chats" subtitle="Manage all guest conversations in one place" />
      <div className="flex pt-7 px-6 pb-6 gap-5" style={{ minHeight: 600, height: "calc(100vh - 90px)" }}>
        {/* Column 1: Conversation list */}
        <div className="w-72 shrink-0 bg-card rounded-2xl flex flex-col overflow-hidden" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
          <div className="p-4" style={{ borderBottom: "1px solid #F0F0F0" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold" style={{ color: "#1A1A1A" }}>All Conversations</h2>
              <Icon name="SlidersHorizontal" size={15} color="#9CA3AF" />
            </div>
            <p className="text-xs mb-3" style={{ color: "#9CA3AF" }}>{window.conversations.length} conversations</p>
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
              <input
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-2 text-sm focus:outline-none"
                style={{ background: "#F5F5F5", border: "none", borderRadius: 10, color: "#1A1A1A" }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {window.conversations.map((c) => {
              const convoGuest = window.guests.find((g) => g.id === c.guestId);
              return (
                <ConversationListItem
                  key={c.id}
                  convo={{ ...c, photo: convoGuest && convoGuest.photo }}
                  active={c.id === activeId}
                  onClick={() => setActiveId(c.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Column 2: Active conversation */}
        <div className="flex-1 bg-card rounded-2xl flex flex-col overflow-hidden min-w-0" style={{ border: "1px solid #F0F0F0", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}>
          <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid #F0F0F0" }}>
            <Avatar photo={guest.photo} initials={guest.initials} size={10} />
            <div className="flex-1">
              <div className="font-display font-semibold flex items-center gap-2" style={{ color: "#1A1A1A" }}>{guest.name}</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>Room {guest.room} · {guest.nights} Nights Stay</div>
            </div>
            <button className="alfon-btn p-2 rounded-lg hover:bg-lightgray"><Icon name="Pencil" size={16} color="#9CA3AF" /></button>
            <button className="alfon-btn p-2 rounded-lg hover:bg-lightgray"><Icon name="UserPlus" size={16} color="#9CA3AF" /></button>
            <button className="alfon-btn p-2 rounded-lg hover:bg-lightgray"><Icon name="MoreVertical" size={16} color="#9CA3AF" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m) => {
              if (m.sender === "divider") {
                return <div key={m.id} className="text-center text-xs" style={{ color: "#9CA3AF" }}>{m.content}</div>;
              }
              if (m.sender === "system") {
                return <SystemMessage key={m.id} msg={m} />;
              }
              return <ChatBubble key={m.id} msg={m} />;
            })}
            {typing && streamingText && (
              <ChatBubble msg={{ sender: "ai", content: streamingText, timestamp: "", staffName: null, staffRole: null, staffId: null }} />
            )}
            {typing && !streamingText && <TypingIndicator />}
            {error && (
              <div className="text-center text-xs rounded-lg py-2 px-3 max-w-sm mx-auto" style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)" }}>{error}</div>
            )}
          </div>

          <div className="px-5 py-3" style={{ borderTop: "1px solid #F0F0F0", background: "#F0F7FF" }}>
            <div className="flex items-center gap-2 text-xs font-semibold mb-1" style={{ color: "#2E86AB" }}>
              <Icon name="Sparkles" size={13} className="ai-pulse" /> Guest Summary
            </div>
            <div className="text-xs space-y-0.5" style={{ color: "#6B7280" }}>
              {(window.CHAT_QUICK_SUMMARY[guest.id] || [guest.aiSummary]).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>

          <div className="px-4 pt-2 flex items-center justify-between" style={{ borderTop: "1px solid #F0F0F0" }}>
            <button
              onClick={() => setSendAsGuest((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
              style={sendAsGuest
                ? { background: "#FFF4F0", color: "#E8623A", border: "1px solid rgba(232,98,58,0.3)" }
                : { background: "#F5F5F5", color: "#6B7280", border: "1px solid #E5E5E5" }}
            >
              <Icon name={sendAsGuest ? "User" : "UserCircle2"} size={11} color={sendAsGuest ? "#E8623A" : "#9CA3AF"} />
              {sendAsGuest ? "Guest mode (demo)" : "Staff mode"}
            </button>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "#9CA3AF" }}>
              {sendAsGuest ? "AI will reply automatically" : `Sending as ${window.currentStaffUser.name} · ${window.currentStaffUser.role}`}
            </div>
          </div>
          <div className="p-4 pt-2 flex items-center gap-2">
            <button className="alfon-btn p-2 rounded-lg hover:bg-lightgray"><Icon name="Paperclip" size={17} color="#9CA3AF" /></button>
            <button className="alfon-btn p-2 rounded-lg hover:bg-lightgray"><Icon name="Smile" size={17} color="#9CA3AF" /></button>
            <button className="alfon-btn p-2 rounded-lg hover:bg-lightgray"><Icon name="CalendarDays" size={17} color="#9CA3AF" /></button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 text-sm focus:outline-none"
              style={{ background: "#F5F5F5", border: "none", borderRadius: 12, color: "#1A1A1A" }}
            />
            <button
              onClick={send}
              disabled={typing}
              className="alfon-btn w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50"
              style={{ background: "#E8623A" }}
            >
              <Icon name="Send" size={16} />
            </button>
          </div>
        </div>

        {/* Column 3: Guest Information panel */}
        <GuestInfoPanel guest={guest} convo={convo} />

      </div>
    </div>
  );
}
window.ChatsScreen = ChatsScreen;
