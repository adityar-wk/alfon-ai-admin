import { Button } from "../components/ui";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Pencil, Plus, X, ChevronLeft, User, BedDouble, UtensilsCrossed, Languages, Thermometer, AlarmClock, Wine, Phone, Mail, MessageSquare, ArrowUp, ClipboardList } from "lucide-react";
import { Avatar, CARD_SHADOW, SlaCountdown } from "./mobile";
import { GUEST_PROFILES, PRE_ARRIVAL_GUESTS, CHECKED_OUT_GUESTS } from "./data";

export const DetailRow = ({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 py-3.5">
    <Icon className="h-4 w-4 shrink-0 text-ink-tertiary" />
    <span className="w-24 shrink-0 text-[12px] font-normal text-ink-secondary">{label}</span>
    <span className="min-w-0 flex-1 text-[14px] font-medium text-ink">{children}</span>
  </div>
);

const PROFILE_SECTION_TONE = {
  plain: { bg: `bg-white ${CARD_SHADOW}`, icon: "text-brand", label: "text-brand" },
  blue: { bg: "bg-[#EEF3FF]", icon: "text-blue-600", label: "text-blue-700" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", label: "text-amber-700" },
  red: { bg: "bg-red-50", icon: "text-red-600", label: "text-red-700" },
} as const;
export const ProfileSection = ({
  icon: Icon, label, tone, children,
}: {
  icon: React.ComponentType<{ className?: string }>; label: string; tone: keyof typeof PROFILE_SECTION_TONE; children: React.ReactNode;
}) => {
  const t = PROFILE_SECTION_TONE[tone];
  return (
    <div className={`rounded-2xl p-4 ${t.bg}`}>
      <div className={`flex items-center gap-1.5 text-[11px] font-bold ${t.label}`}>
        <Icon className={`h-3.5 w-3.5 ${t.icon}`} /> {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
};

type PrefKey = "room" | "dietary" | "language" | "temperature" | "wakeUp" | "minibar";
const PREF_ROWS: { key: PrefKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "room", label: "Room", icon: BedDouble },
  { key: "dietary", label: "Dietary", icon: UtensilsCrossed },
  { key: "language", label: "Language", icon: Languages },
  { key: "temperature", label: "Temperature", icon: Thermometer },
  { key: "wakeUp", label: "Wake up", icon: AlarmClock },
  { key: "minibar", label: "Minibar", icon: Wine },
];

type GuestNote = { by: string; text: string; time: string };
type ProfileEdits = { prefs: Partial<Record<PrefKey, string>>; extra: string[]; notes: GuestNote[] };
// staff edits are kept at module level so both apps and every visit see them
const PROFILE_EDITS: Record<string, ProfileEdits> = {};
const editsOf = (name: string): ProfileEdits => PROFILE_EDITS[name] ?? { prefs: {}, extra: [], notes: [] };

/** Guest profile shared by the Mid Manager and Line Staff apps. Staff can add notes and edit preferences. */
export function GuestProfileScreen({ name, onBack, onMessage, author = "Staff" }: { name: string; onBack: () => void; onMessage?: () => void; author?: string }) {
  const profileName = name;
  const profileInfo = GUEST_PROFILES[profileName];
  const profileStage = PRE_ARRIVAL_GUESTS.some((g) => g.name === profileName) ? "Pre-arrival" : CHECKED_OUT_GUESTS.some((g) => g.name === profileName) ? "Checked out" : "In-house";
  const profileTone = profileStage === "Pre-arrival" ? "text-blue-600" : profileStage === "Checked out" ? "text-gray-500" : "text-green-600";
  const preEntry = PRE_ARRIVAL_GUESTS.find((g) => g.name === profileName);
  const nav = { back: onBack };

  const [, refresh] = useState(0);
  const [editing, setEditing] = useState(false);
  const [prefDraft, setPrefDraft] = useState<Partial<Record<PrefKey, string>>>({});
  const [extraDraft, setExtraDraft] = useState<string[]>([]);
  const [newPref, setNewPref] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const edits = editsOf(profileName);
  const prefValue = (k: PrefKey) => edits.prefs[k] ?? profileInfo?.prefs[k] ?? "";

  const startEdit = () => {
    setPrefDraft(Object.fromEntries(PREF_ROWS.map((r) => [r.key, prefValue(r.key)])) as Record<PrefKey, string>);
    setExtraDraft(edits.extra);
    setNewPref("");
    setEditing(true);
  };
  const addNote = () => {
    const text = noteDraft.trim();
    if (!text) return;
    const cur = editsOf(profileName);
    PROFILE_EDITS[profileName] = { ...cur, notes: [{ by: author, text, time: "Just now" }, ...cur.notes] };
    setNoteDraft("");
    refresh((n) => n + 1);
  };
  const save = () => {
    const extra = newPref.trim() ? [...extraDraft, newPref.trim()] : extraDraft;
    PROFILE_EDITS[profileName] = { ...editsOf(profileName), prefs: prefDraft, extra };
    addNote();
    setEditing(false);
    refresh((n) => n + 1);
  };

  const notesCard = edits.notes.length > 0 && (
    <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
      <div className="text-[12px] font-semibold text-ink-tertiary">Notes</div>
      <ul className="mt-2 space-y-2.5">
        {edits.notes.map((n, i) => (
          <li key={i} className="rounded-xl bg-[#F6F6F8] p-3">
            <p className="text-[13px] leading-snug text-ink">{n.text}</p>
            <p className="mt-1 text-[11px] text-ink-tertiary">{n.by} · {n.time}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  const extraCard = edits.extra.length > 0 && (
    <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
      <div className="text-[12px] font-semibold text-ink-tertiary">More preferences</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {edits.extra.map((x, i) => (
          <span key={i} className="rounded-full bg-brand-tint px-3 py-1 text-[12px] font-medium text-brand">{x}</span>
        ))}
      </div>
    </div>
  );

  if (editing) {
    const addExtra = () => { if (!newPref.trim()) return; setExtraDraft((d) => [...d, newPref.trim()]); setNewPref(""); };
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 pb-3 pt-4">
          <button onClick={() => { setEditing(false); setNoteDraft(""); }} className="h-9 text-[14px] font-medium text-ink-secondary">Cancel</button>
          <div className="text-[15px] font-semibold text-ink">Edit preferences</div>
          <button onClick={save} aria-label="Save changes" className="h-9 rounded-full bg-brand px-4 text-[13px] font-semibold text-white active:bg-brand-hover">Save</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-5 no-scrollbar">
          <div className="flex items-center gap-3">
            <Avatar name={profileName} size={40} tone="bg-subtle text-ink-secondary" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[15px] font-semibold text-ink">{profileName}</div>
              {profileInfo && <div className="mt-0.5 text-[12px] text-ink-tertiary">{profileInfo.room} · {profileInfo.roomType}</div>}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {PREF_ROWS.map((r) => (
              <label key={r.key} className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-secondary">
                  <r.icon className="h-3.5 w-3.5 text-ink-tertiary" /> {r.label}
                </span>
                <input
                  value={prefDraft[r.key] ?? ""}
                  onChange={(e) => setPrefDraft((d) => ({ ...d, [r.key]: e.target.value }))}
                  placeholder={`Add ${r.label.toLowerCase()} preference`}
                  className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
                />
              </label>
            ))}
          </div>

          <div className="mt-7">
            <div className="mb-1.5 text-[12px] font-medium text-ink-secondary">More preferences</div>
            {extraDraft.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-2">
                {extraDraft.map((x, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-[12px] font-medium text-brand">
                    {x}
                    <button aria-label={`Remove ${x}`} onClick={() => setExtraDraft((d) => d.filter((_, j) => j !== i))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newPref}
                onChange={(e) => setNewPref(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addExtra()}
                placeholder="e.g. Feather-free pillows"
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
              />
              <button aria-label="Add preference" disabled={!newPref.trim()} onClick={addExtra} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand disabled:opacity-40">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-1.5 text-[12px] font-medium text-ink-secondary">Note (optional)</div>
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={3}
              placeholder="Anything the team should know about this guest…"
              className="w-full resize-none rounded-xl border border-line bg-white p-3.5 text-[14px] leading-snug text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-4">
        <button onClick={nav.back} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F0F0F0] bg-white text-ink">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={startEdit} aria-label="Edit profile" className="flex h-9 items-center gap-1.5 rounded-full border border-[#F0F0F0] bg-white px-3.5 text-[13px] font-semibold text-ink">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-6 pb-24 pt-1 no-scrollbar">
        {!profileInfo && (
          <>
            <h1 className="font-display text-[22px] font-bold text-ink">{profileName}</h1>
            <p className={`-mt-2 text-[13px] font-medium ${profileTone}`}>{profileStage}</p>
            <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No profile details available.</p>
            {extraCard}
            {notesCard}
          </>
        )}
        {profileInfo && (
          <>
            <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
              <div className="flex items-center gap-3.5">
                <Avatar name={profileName} size={56} tone="bg-subtle text-ink-secondary" />
                <div className="min-w-0 leading-tight">
                  <div className="truncate font-display text-[19px] font-bold text-ink">{profileName}</div>
                  <div className="mt-1 text-[13px] text-ink-secondary">{profileInfo.room} · {profileInfo.roomType}</div>
                  <div className="mt-0.5 text-[12px] text-ink-tertiary">{profileInfo.country} · <span className={`font-medium ${profileTone}`}>{profileStage}</span></div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 divide-x divide-line rounded-xl bg-[#F6F6F8] py-2.5 text-center">
                <div><div className="text-[11px] text-ink-tertiary">Check-in</div><div className="mt-0.5 text-[13px] font-semibold text-ink">{profileInfo.checkIn.replace(/, \d{4}/, "")}</div></div>
                <div><div className="text-[11px] text-ink-tertiary">Check-out</div><div className="mt-0.5 text-[13px] font-semibold text-ink">{profileInfo.checkOut.replace(/, \d{4}/, "")}</div></div>
                <div><div className="text-[11px] text-ink-tertiary">Nights</div><div className="mt-0.5 text-[13px] font-semibold text-ink">{profileInfo.nights}</div></div>
              </div>
            </div>

            <ProfileSection icon={User} label="Guest profile" tone="plain">
              <p className="text-[13px] leading-relaxed text-ink">{profileInfo.profile}</p>
            </ProfileSection>

            {preEntry && (
              <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
                <div className="text-[12px] font-semibold text-ink-tertiary">Requests from the guest</div>
                <ul className="mt-2 space-y-2">
                  {[preEntry.notes, ...preEntry.actions.map((a) => a.text)].map((r) => (
                    <li key={r} className="flex gap-2 text-[13px] leading-snug text-ink"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`rounded-2xl bg-white ${CARD_SHADOW}`}>
              <div className="flex items-center justify-between px-4 pt-3.5">
                <span className="text-[12px] font-semibold text-ink-tertiary">Preferences</span>
                <button onClick={startEdit} className="text-[12px] font-semibold text-brand">Edit</button>
              </div>
              <div className="divide-y divide-line px-4">
                {PREF_ROWS.map((r) => (
                  <DetailRow key={r.key} icon={r.icon} label={r.label}>
                    {prefValue(r.key) || <span className="text-ink-tertiary">—</span>}
                  </DetailRow>
                ))}
              </div>
            </div>

            {extraCard}
            {notesCard}

            <div className={`rounded-2xl bg-white ${CARD_SHADOW}`}>
              <div className="px-4 pt-3.5 text-[12px] font-semibold text-ink-tertiary">Contact</div>
              <div className="divide-y divide-line px-4">
                <div className="flex items-center gap-3 py-3.5 text-[14px] font-medium text-ink"><Phone className="h-4 w-4 shrink-0 text-ink-tertiary" />{profileInfo.phone}</div>
                <div className="flex items-center gap-3 py-3.5 text-[14px] font-medium text-ink"><Mail className="h-4 w-4 shrink-0 text-ink-tertiary" /><span className="min-w-0 break-all">{profileInfo.email}</span></div>
              </div>
            </div>
          </>
        )}
      </div>
      {onMessage && <MessageGuestButton onClick={onMessage} />}
    </div>
  );
}

/** The floating "message this guest" button, shared by the profile and the task screens. */
export function MessageGuestButton({ onClick, raised }: { onClick: () => void; raised?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label="Message guest"
      className={`absolute right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-[0_1px_4px_rgba(26,26,26,0.14)] active:bg-brand-hover ${raised ? "bottom-24" : "bottom-6"}`}
    >
      <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}

export type ChatMsg = { from: "guest" | "ai" | "me"; text: string };

/** AI-drafted reply the staff member can edit and approve before it goes to the guest. */
export function AiDraftCard({ draft, onChange, onApprove }: { draft: string; onChange: (t: string) => void; onApprove: () => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="mx-6 mb-3 shrink-0 rounded-2xl border border-brand/25 bg-brand-tint/60 p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-brand"><Sparkles className="h-3.5 w-3.5" /> ALFON AI drafted a reply</div>
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          autoFocus
          className="w-full resize-none rounded-xl border border-line bg-white p-2.5 text-[13px] leading-snug text-ink outline-none focus:border-brand"
        />
      ) : (
        <p className="text-[13px] leading-snug text-ink">{draft}</p>
      )}
      <div className="mt-3 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setEditing((v) => !v)}>{editing ? "Done" : "Edit"}</Button>
        <Button className="flex-[1.4]" disabled={!draft.trim()} onClick={() => { setEditing(false); onApprove(); }}>Approve &amp; send</Button>
      </div>
    </div>
  );
}

/** Guest conversation with the ALFON AI / take-over toggle. */
/** The guest's open task, pinned to the top of the chat with its SLA and the next action. */
export type ChatTask = { id: string; title: string; left: number; total: number; action: "Accept" | "Complete"; onAction: () => void };

export function GuestChatScreen({
  name, room, roomType, thread, manual, onToggle, onSend, onBack, onProfile, aiDraft, onDraftChange, onApproveDraft, complaint, task,
}: {
  aiDraft?: string; onDraftChange?: (t: string) => void; onApproveDraft?: () => void; complaint?: boolean; task?: ChatTask;
  name: string; room: string; roomType?: string; thread: ChatMsg[]; manual: boolean; onToggle: () => void; onSend: (text: string) => void; onBack: () => void; onProfile: () => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [thread.length, aiDraft !== undefined]);
  const send = () => { if (!manual || !draft.trim()) return; onSend(draft.trim()); setDraft(""); };
  const taskName = task?.title.split(" — ")[0];
  const avatarTone = task ? "bg-brand text-white" : complaint ? "bg-red-50 text-red-600" : "bg-subtle text-ink-secondary";
  return (
    <div className="flex h-full flex-col bg-white">
      <div className={`flex shrink-0 items-center gap-3 bg-white px-6 pb-3 pt-4 ${task ? "" : "border-b border-line"}`}>
        <button onClick={onBack} aria-label="Back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F0F0F0] bg-white text-ink">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={onProfile} aria-label="View profile" className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <Avatar name={name} size={36} tone={avatarTone} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[14px] font-semibold text-ink">{name}</div>
            <div className="mt-0.5 truncate text-[12px] font-normal text-ink-tertiary">{room}{task ? ` · ${taskName}` : roomType ? ` · ${roomType}` : ""}</div>
          </div>
        </button>
        {task && (
          <button onClick={task.onAction} className="h-9 shrink-0 rounded-full bg-brand px-4 text-[13px] font-semibold text-white active:bg-brand-hover">
            {task.action}
          </button>
        )}
      </div>
      {task && (
        <div className="flex shrink-0 items-center gap-2 border-y border-brand/10 bg-brand-tint/70 px-6 py-2.5">
          <ClipboardList className="h-4 w-4 shrink-0 text-brand" />
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-brand">{taskName} — {name}</span>
          <SlaCountdown key={task.id} left={task.left} total={task.total} compact />
        </div>
      )}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-white px-5 py-5">
        {!thread.length && <p className="py-6 text-center text-[12px] text-ink-tertiary">No messages yet.</p>}
        {thread.map((m, i) => {
          const mine = m.from !== "guest";
          return (
            <div key={i} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
              {!mine && <Avatar name={name} size={28} tone="bg-[#6B7280] text-white" />}
              <div
                className={`max-w-[78%] px-3.5 py-3 text-[14px] font-normal leading-[1.5] ${
                  m.from === "guest"
                    ? "rounded-[18px_18px_18px_4px] bg-[#F0F0F0] text-ink"
                    : m.from === "ai"
                      ? "rounded-[18px_18px_4px_18px] border border-brand/10 bg-gradient-to-br from-[#FFF8F4] to-[#FFF0E8] text-ink"
                      : "rounded-[18px_18px_4px_18px] bg-brand text-white"
                }`}
              >
                {m.from === "ai" && (
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-brand">
                    <Sparkles className="h-2.5 w-2.5" /> Alfon AI
                  </div>
                )}
                {m.text}
              </div>
              {m.from === "me" && (
                <span aria-label="You" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                  <User className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {aiDraft !== undefined && <AiDraftCard draft={aiDraft} onChange={(t) => onDraftChange?.(t)} onApprove={() => onApproveDraft?.()} />}
      <div className={`flex shrink-0 items-center justify-between gap-3 border-t border-line px-6 py-2.5 text-[12px] ${manual ? "bg-[#FBDCCB]/60 text-brand" : "bg-brand-tint text-brand"}`}>
        <span className="font-medium">{manual ? "You're replying — AI is paused" : "ALFON AI is replying automatically"}</span>
        <button onClick={onToggle} aria-pressed={manual} aria-label="Take over" className="flex items-center gap-2">
          <span className="text-[11px] font-semibold">Take over</span>
          <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${manual ? "bg-brand" : "bg-[#D8D8DC]"}`}>
            <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${manual ? "translate-x-5" : ""}`} />
          </span>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2 bg-white px-6 py-3">
        <input
          value={draft}
          disabled={!manual}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={manual ? "Reply as hotel staff…" : "Take over to reply"}
          className="h-11 flex-1 rounded-full border border-[#DAD7CF] px-4 text-[14px] outline-none focus:border-brand disabled:bg-[#F6F6F8]"
        />
        <button
          onClick={send}
          disabled={!manual || !draft.trim()}
          aria-label="Send"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-colors ${manual && draft.trim() ? "bg-brand" : "bg-brand/25"}`}
        >
          <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
