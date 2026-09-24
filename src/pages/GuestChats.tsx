import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Phone, Mail, Calendar, Hourglass, BedDouble, Users, UtensilsCrossed, Wine, Filter, PanelLeftClose, PanelLeftOpen, Check } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { GuestChat, type ChatMsg, type ChatMode } from "../components/GuestChat";
import { Card } from "../components/ui";
import { Flag } from "../components/Flag";
import { GUESTS as BASE_GUESTS, type Guest } from "../data/guests";
import { buildProfile, seedChat } from "./GuestProfile";
import { AI_DRAFTS } from "../data/tasks";

const chip = (status: string) =>
  status === "Checked Out"
    ? { text: "Resolved", cls: "bg-emerald-50 text-emerald-600" }
    : status === "Arriving"
      ? { text: "Pre-Arrival", cls: "bg-blue-50 text-blue-600" }
      : null;

const ORPHAN_ID = 1000;
const CHAT_FILTERS = ["All", "Active", "Resolved", "Pre-Arrival"] as const;
const chatFilterOf = (status: string) => (status === "Checked Out" ? "Resolved" : status === "Arriving" ? "Pre-Arrival" : "Active");

export default function GuestChats() {
  const [params] = useSearchParams();
  const orphanName = params.get("name");
  const GUESTS: Guest[] = [
    ...(orphanName && !BASE_GUESTS.some((g) => g.name === orphanName)
      ? [{
          id: ORPHAN_ID, name: orphanName, initials: orphanName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(), contact: "+1 (555) 123-4567",
          room: params.get("room") ?? "—", roomType: "Standard Room", from: "May 22", to: "May 26", nights: 4, country: "United Kingdom",
          status: "In House" as const, type: "Leisure" as const, last: null, tint: "bg-orange-100 text-orange-700",
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

  const list = GUESTS.filter((g) => {
    const q = query.trim().toLowerCase();
    return (filter === "All" || chatFilterOf(g.status) === filter) && (!q || `${g.name} ${g.room}`.toLowerCase().includes(q));
  });
  const guest = GUESTS.find((g) => g.id === selectedId) ?? GUESTS[0];
  const p = buildProfile(guest);
  const msgs = chats[guest.id] ?? seedChat(guest);
  const mode = modes[guest.id] ?? "auto";
  const last = (id: number) => {
    const g = GUESTS.find((x) => x.id === id)!;
    const m = chats[id] ?? seedChat(g);
    return m.length ? m[m.length - 1].text : "No messages yet";
  };

  return (
    <>
      <Topbar title="Guest Chats" subtitle="Manage all guest conversations in one place" />
      <div className="flex min-h-0 flex-1 gap-5 bg-[#F2F3F7] p-6">
        <Card className={`flex shrink-0 flex-col overflow-hidden transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-[330px]"}`}>
          {collapsed ? (
            <>
              <div className="flex justify-center border-b border-line p-4">
                <button onClick={() => setCollapsed(false)} aria-label="Expand conversations" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-subtle hover:text-ink">
                  <PanelLeftOpen className="h-[18px] w-[18px]" />
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4">
                {list.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedId(g.id)}
                    title={`${g.name} · Room ${g.room}`}
                    aria-label={g.name}
                    className="flex w-full justify-center"
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-semibold ${g.tint} ${g.id === guest.id ? "ring-2 ring-ink/20 ring-offset-2" : ""}`}>{g.initials}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="border-b border-line p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[16px] font-bold text-ink">All Conversations</div>
                    <div className="mt-0.5 text-[12px] text-ink-tertiary">{list.length} of {GUESTS.length} conversations</div>
                  </div>
                  <button onClick={() => setCollapsed(true)} aria-label="Collapse conversations" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-subtle hover:text-ink">
                    <PanelLeftClose className="h-[18px] w-[18px]" />
                  </button>
                </div>
                <div className="relative mt-4 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search conversations…"
                      className="h-10 w-full rounded-lg bg-subtle pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <button
                    onClick={() => setFilterOpen((o) => !o)}
                    aria-label="Filter conversations"
                    aria-expanded={filterOpen}
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${filter !== "All" || filterOpen ? "bg-brand text-white" : "bg-subtle text-ink-secondary hover:bg-line/60"}`}
                  >
                    <Filter className="h-4 w-4" />
                    {filter !== "All" && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">1</span>}
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-line bg-white p-1.5 shadow-lg">
                      <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Show</div>
                      {CHAT_FILTERS.map((x) => (
                        <button key={x} onClick={() => { setFilter(x); setFilterOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-ink hover:bg-subtle">
                          {x}
                          {filter === x && <Check className="h-4 w-4 text-brand" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="min-h-0 flex-1 divide-y divide-line/60 overflow-y-auto">
                {list.map((g) => {
                  const c = chip(g.status);
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedId(g.id)}
                      className={`flex w-full items-start gap-3 px-5 py-3.5 text-left hover:bg-subtle/70 ${g.id === guest.id ? "bg-subtle" : ""}`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${g.tint}`}>{g.initials}</span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-[14px] font-semibold text-ink">{g.name}</span>
                        <span className="mt-0.5 block text-[12px] text-ink-tertiary">Room {g.room}</span>
                        <span className="mt-1 flex items-center gap-2">
                          <span className="min-w-0 flex-1 truncate text-[12px] text-ink-secondary">{last(g.id)}</span>
                          {c && <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.cls}`}>{c.text}</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
                {!list.length && <p className="px-5 py-10 text-center text-[13px] text-ink-tertiary">No conversations match.</p>}
              </div>
            </>
          )}
        </Card>

        <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line px-6 py-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-semibold ${guest.tint}`}>{guest.initials}</span>
            <div>
              <div className="text-[15px] font-semibold text-ink">{guest.name}</div>
              <div className="text-[12px] text-ink-tertiary">Room {guest.room} · {guest.nights} Nights Stay</div>
            </div>
          </div>
          <GuestChat
            className="min-h-0 flex-1"
            name={guest.name}
            msgs={msgs}
            mode={mode}
            setMode={(m) => setModes((x) => ({ ...x, [guest.id]: m }))}
            onSend={(text) => setChats((c) => ({ ...c, [guest.id]: [...msgs, { from: "staff", text, time: "Now" }] }))}
            emptyText="No messages yet. This guest has not been contacted."
            aiDraft={AI_DRAFTS[guest.name]}
            onDraftChange={(text) => { AI_DRAFTS[guest.name] = text; refreshDrafts((n) => n + 1); }}
            onApproveDraft={() => {
              const text = AI_DRAFTS[guest.name]?.trim();
              if (!text) return;
              delete AI_DRAFTS[guest.name];
              setChats((c) => ({ ...c, [guest.id]: [...msgs, { from: "staff", text, time: "Now" }] }));
            }}
          />
        </Card>

        <Card className="w-[310px] shrink-0 overflow-y-auto p-6">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-ink">Guest Information</span>
            <Link to={`/guests/${guest.id}`} className="text-[12px] font-medium text-brand">View Profile</Link>
          </div>
          <div className="mt-4 flex flex-col items-center text-center">
            <span className={`flex h-14 w-14 items-center justify-center rounded-full text-[18px] font-semibold ${guest.tint}`}>{guest.initials}</span>
            <div className="mt-2 text-[16px] font-bold text-ink">{guest.name}</div>
          </div>
          <div className="mt-5 space-y-3.5 text-[13px] text-ink">
            <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-ink-tertiary" /> {guest.contact.startsWith("+") ? guest.contact : "+1 (555) 123-4567"}</div>
            <div className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-ink-tertiary" /> {guest.contact.includes("@") ? guest.contact : `${guest.name.split(" ")[0].toLowerCase()}@email.com`}</div>
            <div className="flex items-center gap-2.5"><Flag country={guest.country} /> {guest.country}</div>
            <div className="flex items-center gap-2.5"><Calendar className="h-4 w-4 text-ink-tertiary" /> Check-in: {guest.from}, 2025</div>
            <div className="flex items-center gap-2.5"><Calendar className="h-4 w-4 text-ink-tertiary" /> Check-out: {guest.to}, 2025</div>
            <div className="flex items-center gap-2.5"><Hourglass className="h-4 w-4 text-ink-tertiary" /> {guest.nights} Nights</div>
            <div className="flex items-center gap-2.5"><BedDouble className="h-4 w-4 text-ink-tertiary" /> {guest.roomType}</div>
            <div className="flex items-center gap-2.5"><Users className="h-4 w-4 text-ink-tertiary" /> 2 Adults</div>
          </div>
          <div className="mt-6 border-t border-line pt-5">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary">Guest preferences</div>
            <div className="space-y-3.5 text-[13px] text-ink">
              {([
                [UtensilsCrossed, "Dietary", p.prefs.dietary.join(". ")],
                [BedDouble, "Room", p.prefs.room.join(", ")],
                [Wine, "Minibar", p.prefs.minibar.join(", ")],
              ] as const).map(([Icon, label, text]) => (
                <div key={label} className="flex items-start gap-2.5" title={label}>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" aria-label={label} />
                  <span className="leading-snug">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
