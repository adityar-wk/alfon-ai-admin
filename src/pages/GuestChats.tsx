import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search, Phone, Mail, Calendar, Hourglass, BedDouble, Users, UtensilsCrossed, Wine, SlidersHorizontal, PanelLeftClose, PanelLeftOpen, Check,
  FileText, ChevronRight, CalendarDays, X, DoorOpen, AlertCircle, Pencil, UserPlus, MoreVertical,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { GuestChat, type ChatMsg, type ChatMode } from "../components/GuestChat";
import { Flag } from "../components/Flag";
import { SIDE_PANEL, SIDE_ROW, sideRowTone, SideSearch } from "../components/SidePanel";
import { Modal, Field, Input, PhoneInput, Button } from "../components/ui";
import { GUESTS as BASE_GUESTS, type Guest } from "../data/guests";
import { buildProfile, seedChat } from "./GuestProfile";
import { AI_DRAFTS, TASKS } from "../data/tasks";
import { sampleUnread } from "../linestaff/mobile";

const CARD = "rounded-card border border-line/60 bg-white shadow-card";

const chip = (status: string) =>
  status === "Checked Out"
    ? { text: "Resolved", cls: "bg-emerald-50 text-emerald-600" }
    : status === "Arriving"
      ? { text: "Pre-Arrival", cls: "bg-blue-50 text-blue-600" }
      : null;

const ORPHAN_ID = 1000;
const hasComplaint = (name: string) => TASKS.some((t) => t.guest === name && t.tag === "Complaint" && t.status !== "Completed" && t.status !== "Void");
const CHAT_FILTERS = ["All", "Active", "Resolved", "Pre-Arrival"] as const;
const chatFilterOf = (status: string) => (status === "Checked Out" ? "Resolved" : status === "Arriving" ? "Pre-Arrival" : "Active");

const TEMPLATES = [
  { label: "Request confirmed", text: "Hi {name}, your request has been confirmed and our team is taking care of it. Let us know if there is anything else we can arrange." },
  { label: "Room ready", text: "Hi {name}, your room is ready whenever you are. Please stop by the front desk if you need anything at all." },
  { label: "Late check-out offer", text: "Hi {name}, we would be happy to offer a late check-out. Would you like us to arrange it for you?" },
  { label: "Service recovery", text: "Hi {name}, we are sorry for the inconvenience. Our manager is looking into this right now and will update you shortly." },
  { label: "Thank you", text: "Hi {name}, thank you for staying with us. We hope to welcome you back soon!" },
];

const clock = (mins: number) => `${Math.floor(mins / 60) % 12 || 12}:${String(mins % 60).padStart(2, "0")} ${mins < 720 ? "AM" : "PM"}`;

const NEW_GUEST_ID = 2000;

export default function GuestChats() {
  const [params, setParams] = useSearchParams();
  const orphanName = params.get("name");
  const [extra, setExtra] = useState<Guest | null>(null);
  const GUESTS: Guest[] = [
    ...(extra ? [extra] : []),
    ...(orphanName && !BASE_GUESTS.some((g) => g.name === orphanName)
      ? [{
          id: ORPHAN_ID, name: orphanName, initials: orphanName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(), contact: "+1 (555) 123-4567",
          room: params.get("room") ?? "—", roomType: "Standard Room", from: "May 22", to: "May 26", nights: 4, country: "United Kingdom",
          status: "In House" as const, type: "Leisure" as const, last: null, tint: "bg-subtle text-ink-secondary",
        }]
      : []),
    ...BASE_GUESTS,
  ];
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof CHAT_FILTERS)[number]>("All");
  const [selectedId, setSelectedId] = useState<number>(Number(params.get("guest")) || (orphanName && !BASE_GUESTS.some((g) => g.name === orphanName) ? ORPHAN_ID : 2));
  const [chats, setChats] = useState<Record<number, ChatMsg[]>>({});
  const [modes, setModes] = useState<Record<number, ChatMode>>({});
  const [, refreshDrafts] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [insert, setInsert] = useState<{ text: string; nonce: number }>({ text: "", nonce: 0 });
  const [newChatOpen, setNewChatOpen] = useState(() => !!params.get("new"));

  // the top bar's "New Chat" arrives as ?new=1 — reopens the dialog even when already on this page, then drops it from the URL
  useEffect(() => {
    if (!params.get("new")) return;
    setNewChatOpen(true);
    const next = new URLSearchParams(params);
    next.delete("new");
    setParams(next, { replace: true });
  }, [params, setParams]);

  const startChat = (name: string, code: string, number: string, room: string) => {
    const id = NEW_GUEST_ID + Math.floor(Math.random() * 1000);
    setExtra({
      id,
      name,
      initials: name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      contact: `${code} ${number}`.trim(),
      room: room.trim() || "—",
      roomType: "—",
      from: "—",
      to: "—",
      nights: 0,
      country: "",
      status: "In House",
      type: "Leisure",
      last: null,
      tint: "bg-subtle text-ink-secondary",
    });
    setSelectedId(id);
    setNewChatOpen(false);
  };

  const list = GUESTS.filter((g) => {
    const q = query.trim().toLowerCase();
    return (filter === "All" || chatFilterOf(g.status) === filter) && (!q || `${g.name} ${g.room}`.toLowerCase().includes(q));
  });
  const guest = GUESTS.find((g) => g.id === selectedId) ?? GUESTS[0];
  const p = buildProfile(guest);
  const msgs = chats[guest.id] ?? seedChat(guest);
  const mode = modes[guest.id] ?? "auto";
  const lastMsg = (id: number) => {
    const g = GUESTS.find((x) => x.id === id)!;
    const m = chats[id] ?? seedChat(g);
    return m.length ? m[m.length - 1] : null;
  };

  // guest's requests: summary strip + itinerary
  const guestTasks = TASKS.filter((t) => t.guest === guest.name && t.status !== "Void");
  const itinerary = guestTasks.filter((t) => t.status !== "Completed").slice(0, 4);

  return (
    <>
      <Topbar title="Guest Chats" />
      <div className="flex min-h-0 flex-1 gap-5 bg-page p-6">
        {/* ---------------- conversations ---------------- */}
        <div className={`${SIDE_PANEL} transition-[width] duration-200 ${collapsed ? "w-[80px]" : "w-72"}`}>
          {collapsed ? (
            <>
              <div className="flex justify-center border-b border-line/60 p-4">
                <button onClick={() => setCollapsed(false)} aria-label="Expand conversations" className="flex h-9 w-9 items-center justify-center rounded-control text-ink-secondary hover:bg-subtle hover:text-ink">
                  <PanelLeftOpen className="h-[18px] w-[18px]" />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4">
                {list.map((g) => (
                  <button key={g.id} onClick={() => setSelectedId(g.id)} title={`${g.name} · Room ${g.room}`} aria-label={g.name} className="flex w-full justify-center">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full font-display text-[13px] font-semibold ${g.tint} ${g.id === guest.id ? "ring-2 ring-ink/20 ring-offset-2" : ""}`}>{g.initials}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="relative shrink-0 px-4 pb-1 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-[16px] font-bold text-ink">All Conversations</h2>
                  <button onClick={() => setFilterOpen((o) => !o)} aria-label="Filter conversations" aria-expanded={filterOpen} className={`shrink-0 ${filter !== "All" ? "text-brand" : "text-ink-tertiary hover:text-ink"}`}>
                    <SlidersHorizontal className="h-[15px] w-[15px]" />
                  </button>
                </div>
                <p className="mt-0.5 text-[12px] text-ink-tertiary">{list.length} {list.length === 1 ? "conversation" : "conversations"}</p>
                {filterOpen && (
                  <div className="absolute right-4 top-11 z-20 w-48 rounded-xl border border-line bg-white p-1.5 shadow-lg">
                    <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Show</div>
                    {CHAT_FILTERS.map((x) => (
                      <button key={x} onClick={() => { setFilter(x); setFilterOpen(false); }} className="flex w-full items-center justify-between rounded-control px-2.5 py-2 text-left text-[13px] text-ink hover:bg-subtle">
                        {x}
                        {filter === x && <Check className="h-4 w-4 text-brand" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <SideSearch value={query} onChange={setQuery} placeholder="Search conversations…">
                <button onClick={() => setCollapsed(true)} aria-label="Collapse conversations" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink-secondary hover:bg-subtle">
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </SideSearch>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {list.map((g) => {
                  const c = chip(g.status);
                  const lm = lastMsg(g.id);
                  const unread = sampleUnread(g.name) > 0;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedId(g.id)}
                      className={`${SIDE_ROW} w-full items-start gap-3 text-left ${sideRowTone(g.id === guest.id)}`}
                    >
                      <span className="relative block shrink-0">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-[12px] font-semibold ${g.tint}`}>{g.initials}</span>
                        {hasComplaint(g.name) && (
                          <span className="absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white">
                            <AlertCircle aria-label="Complaint" className="h-4 w-4 text-red-500" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">{g.name}</span>
                        <span className="mt-0.5 block text-[12px] text-brand">Room {g.room}</span>
                        <span className="mt-1 flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-[12px] text-ink-secondary">{lm ? lm.text : "No messages yet"}</span>
                          {c && <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium ${c.cls}`}>{c.text}</span>}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end justify-between gap-1.5 self-stretch py-0.5">
                        <span className={`text-[11px] ${unread ? "font-bold text-brand" : "text-ink-tertiary"}`}>{lm?.time ?? ""}</span>
                        <span className="flex h-2.5 items-center">{unread && <span aria-label="Unread" className="h-2.5 w-2.5 rounded-full bg-brand" />}</span>
                      </span>
                    </button>
                  );
                })}
                {!list.length && <p className="px-6 py-10 text-center text-[13px] text-ink-tertiary">No conversations match.</p>}
              </div>
            </>
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 gap-5">
        {/* ---------------- chat ---------------- */}
        <div className={`flex min-w-0 flex-1 flex-col overflow-hidden ${CARD}`}>
          <div className="flex items-center gap-3.5 border-b border-line/60 px-7 py-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-[13px] font-semibold ${guest.tint}`}>{guest.initials}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[17px] font-bold leading-tight text-ink">{guest.name}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[13px] text-ink-tertiary">
                <DoorOpen className="h-3.5 w-3.5" />{guest.room}
                {guest.nights > 0 && <><span>·</span> {guest.nights} Nights Stay</>}
              </div>
            </div>
            <button aria-label="Edit conversation" className="rounded-lg p-2 text-ink-tertiary hover:bg-subtle"><Pencil className="h-4 w-4" /></button>
            <button aria-label="Assign staff" className="rounded-lg p-2 text-ink-tertiary hover:bg-subtle"><UserPlus className="h-4 w-4" /></button>
            <button aria-label="More options" className="rounded-lg p-2 text-ink-tertiary hover:bg-subtle"><MoreVertical className="h-4 w-4" /></button>
          </div>
          <GuestChat
            className="min-h-0 flex-1"
            name={guest.name}
            msgs={msgs}
            mode={mode}
            setMode={(m) => setModes((x) => ({ ...x, [guest.id]: m }))}
            onSend={(text) => setChats((c) => ({ ...c, [guest.id]: [...msgs, { from: "staff", text, time: "Now" }] }))}
            emptyText="No messages yet. This guest has not been contacted."
            summary={p.actions.filter((a) => a.status === "Completed").map((a) => a.text)}
            insert={insert}
            aiDraft={AI_DRAFTS[guest.name]}
            onDraftChange={(text) => { AI_DRAFTS[guest.name] = text; refreshDrafts((n) => n + 1); }}
            onApproveDraft={() => {
              const text = AI_DRAFTS[guest.name]?.trim();
              if (!text) return;
              delete AI_DRAFTS[guest.name];
              setChats((c) => ({ ...c, [guest.id]: [...msgs, { from: "staff", text, time: "Now" }] }));
            }}
          />
        </div>

        {/* ---------------- guest information ---------------- */}
        <div className={`w-[320px] shrink-0 overflow-y-auto p-7 ${CARD}`}>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-ink">Guest Information</span>
            <Link to={`/guests/${guest.id}`} className="text-[13px] font-medium text-brand">View Profile</Link>
          </div>
          <div className="mt-5 flex flex-col items-center text-center">
            <span className={`flex h-12 w-12 items-center justify-center rounded-full font-display text-[16px] font-semibold ${guest.tint}`}>{guest.initials}</span>
            <div className="mt-3 text-[16px] font-bold text-ink">{guest.name}</div>
          </div>
          <div className="mt-6 space-y-3.5 text-[14px] text-ink">
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-ink-tertiary" /> {guest.contact.startsWith("+") ? guest.contact : "+1 (555) 123-4567"}</div>
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-ink-tertiary" /> {guest.contact.includes("@") ? guest.contact : `${guest.name.split(" ")[0].toLowerCase()}@email.com`}</div>
            {guest.country && <div className="flex items-center gap-3"><Flag country={guest.country} /> {guest.country}</div>}
            {guest.nights > 0 && (
              <>
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-ink-tertiary" /> Check-in: {guest.from}, 2025</div>
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-ink-tertiary" /> Check-out: {guest.to}, 2025</div>
                <div className="flex items-center gap-3"><Hourglass className="h-4 w-4 text-ink-tertiary" /> {guest.nights} Nights</div>
                <div className="flex items-center gap-3"><BedDouble className="h-4 w-4 text-ink-tertiary" /> {guest.roomType}</div>
                <div className="flex items-center gap-3"><Users className="h-4 w-4 text-ink-tertiary" /> 2 Adults</div>
              </>
            )}
          </div>

          <div className="mt-7 border-t border-line/60 pt-6">
            <div className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-ink-tertiary">Guest preferences</div>
            <div className="space-y-3.5 text-[14px] text-ink">
              {([
                [UtensilsCrossed, "Dietary", p.prefs.dietary.join(". ")],
                [BedDouble, "Room", p.prefs.room.join(", ")],
                [Wine, "Minibar", p.prefs.minibar.join(", ")],
              ] as const).map(([Icon, label, text]) => (
                <div key={label} className="flex items-start gap-3" title={label}>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" aria-label={label} />
                  <span className="leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 border-t border-line/60 pt-6">
            <div className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-ink-tertiary">Quick actions</div>
            <button onClick={() => setTplOpen(true)} className="flex w-full items-center gap-3 rounded-xl border border-line px-4 py-3 text-left text-[14px] font-medium text-ink hover:bg-subtle">
              <FileText className="h-4 w-4 text-ink-tertiary" />
              <span className="flex-1">Send Template</span>
              <ChevronRight className="h-4 w-4 text-ink-tertiary" />
            </button>
          </div>

          {itinerary.length > 0 && (
            <div className="mt-7 border-t border-line/60 pt-6">
              <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-brand">
                <CalendarDays className="h-4 w-4" /> Itinerary
              </div>
              <div className="space-y-2.5">
                {itinerary.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-brand/15 bg-brand-tint/50 px-4 py-3">
                    <span className="w-[68px] shrink-0 text-[13px] font-bold text-brand">{clock(9 * 60 + 30 + ((t.id * 7) % 40))}</span>
                    <span className="text-[13px] font-medium leading-snug text-ink">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {tplOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 p-4" onMouseDown={(e) => e.target === e.currentTarget && setTplOpen(false)}>
          <div role="dialog" aria-label="Send template" className="w-full max-w-[460px] rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[17px] font-bold text-ink">Send template</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">Pick a message for {guest.name}. You can edit it before sending.</p>
              </div>
              <button onClick={() => setTplOpen(false)} aria-label="Close" className="shrink-0 rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 space-y-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => { setInsert((i) => ({ text: t.text.replace("{name}", guest.name.split(" ")[0]), nonce: i.nonce + 1 })); setTplOpen(false); }}
                  className="block w-full rounded-xl border border-line px-4 py-3 text-left hover:border-brand hover:bg-brand-tint/30"
                >
                  <span className="block text-[14px] font-semibold text-ink">{t.label}</span>
                  <span className="line-clamp-2 block text-[12px] text-ink-secondary">{t.text.replace("{name}", guest.name.split(" ")[0])}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {newChatOpen && <NewChatModal onClose={() => setNewChatOpen(false)} onStart={startChat} />}
    </>
  );
}

function NewChatModal({ onClose, onStart }: { onClose: () => void; onStart: (name: string, code: string, number: string, room: string) => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("+971");
  const [number, setNumber] = useState("");
  const [room, setRoom] = useState("");
  const valid = name.trim().length > 1 && number.replace(/\D/g, "").length >= 6;

  return (
    <Modal
      title="Start New Guest Conversation"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} className="disabled:opacity-40" onClick={() => onStart(name.trim(), code, number.trim(), room)}>
            Start Chat
          </Button>
        </>
      }
    >
      <Field label="Guest Name" required>
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter guest full name" />
      </Field>
      <Field className="mt-3" label="WhatsApp Number" required>
        <PhoneInput code={code} number={number} onChange={(c, n) => { setCode(c); setNumber(n); }} placeholder="50 000 0000" />
      </Field>
      <Field className="mt-3" label="Room Number" hint="Can be assigned later">
        <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. 1608 (optional)" />
      </Field>
    </Modal>
  );
}
