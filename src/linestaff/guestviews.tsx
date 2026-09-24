import { useEffect, useRef, useState } from "react";
import { ChevronLeft, User, BedDouble, UtensilsCrossed, Languages, Thermometer, AlarmClock, Wine, Phone, Mail, MessageCircle, Send } from "lucide-react";
import { Avatar, CARD_SHADOW } from "./mobile";
import { GUEST_PROFILES, PRE_ARRIVAL_GUESTS, CHECKED_OUT_GUESTS } from "./data";

export const DetailRow = ({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 py-3.5">
    <Icon className="h-4 w-4 shrink-0 text-ink-tertiary" />
    <span className="w-24 shrink-0 text-[13px] text-ink-tertiary">{label}</span>
    <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{children}</span>
  </div>
);

const PROFILE_SECTION_TONE = {
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

/** Read-only guest profile shared by the Mid Manager and Line Staff apps. */
export function GuestProfileScreen({ name, onBack, onMessage }: { name: string; onBack: () => void; onMessage?: () => void }) {
  const profileName = name;
  const profileInfo = GUEST_PROFILES[profileName];
  const profileStage = PRE_ARRIVAL_GUESTS.some((g) => g.name === profileName) ? "Pre-arrival" : CHECKED_OUT_GUESTS.some((g) => g.name === profileName) ? "Checked out" : "In-house";
  const profileTone = profileStage === "Pre-arrival" ? "bg-blue-50 text-blue-700" : profileStage === "Checked out" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700";
  const preEntry = PRE_ARRIVAL_GUESTS.find((g) => g.name === profileName);
  const nav = { back: onBack };
  return (
    <div className="relative flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-4">
        <button onClick={nav.back} aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${profileTone}`}>{profileStage}</span>
      </div>
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-6 pb-6 pt-1 no-scrollbar">
        {!profileInfo && (
          <>
            <h1 className="text-[22px] font-bold text-ink">{profileName}</h1>
            <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No profile details available.</p>
          </>
        )}
        {profileInfo && (
          <>
            <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
              <div className="flex items-center gap-3.5">
                <Avatar name={profileName} size={56} />
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[19px] font-bold text-ink">{profileName}</div>
                  <div className="mt-1 text-[13px] text-ink-secondary">{profileInfo.room} · {profileInfo.roomType}</div>
                  <div className="mt-0.5 text-[12px] text-ink-tertiary">{profileInfo.country}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 divide-x divide-line rounded-xl bg-[#F6F6F8] py-2.5 text-center">
                <div><div className="text-[11px] text-ink-tertiary">Check-in</div><div className="mt-0.5 text-[13px] font-semibold text-ink">{profileInfo.checkIn.replace(/, \d{4}/, "")}</div></div>
                <div><div className="text-[11px] text-ink-tertiary">Check-out</div><div className="mt-0.5 text-[13px] font-semibold text-ink">{profileInfo.checkOut.replace(/, \d{4}/, "")}</div></div>
                <div><div className="text-[11px] text-ink-tertiary">Nights</div><div className="mt-0.5 text-[13px] font-semibold text-ink">{profileInfo.nights}</div></div>
              </div>
            </div>

            <ProfileSection icon={User} label="Guest profile" tone="blue">
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
              <div className="px-4 pt-3.5 text-[12px] font-semibold text-ink-tertiary">Preferences</div>
              <div className="divide-y divide-line px-4">
                <DetailRow icon={BedDouble} label="Room">{profileInfo.prefs.room}</DetailRow>
                <DetailRow icon={UtensilsCrossed} label="Dietary">{profileInfo.prefs.dietary}</DetailRow>
                <DetailRow icon={Languages} label="Language">{profileInfo.prefs.language}</DetailRow>
                <DetailRow icon={Thermometer} label="Temperature">{profileInfo.prefs.temperature}</DetailRow>
                <DetailRow icon={AlarmClock} label="Wake up">{profileInfo.prefs.wakeUp}</DetailRow>
                <DetailRow icon={Wine} label="Minibar">{profileInfo.prefs.minibar}</DetailRow>
              </div>
            </div>

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
      {onMessage && (
        <button
          onClick={onMessage}
          aria-label="Message guest"
          className="absolute bottom-6 right-5 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_6px_18px_rgba(241,90,36,0.4)]"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

export type ChatMsg = { from: "guest" | "ai" | "me"; text: string };

/** Guest conversation with the ALFON AI / take-over toggle. */
export function GuestChatScreen({
  name, room, thread, manual, onToggle, onSend, onBack, onProfile,
}: {
  name: string; room: string; thread: ChatMsg[]; manual: boolean; onToggle: () => void; onSend: (text: string) => void; onBack: () => void; onProfile: () => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [thread.length]);
  const send = () => { if (!manual || !draft.trim()) return; onSend(draft.trim()); setDraft(""); };
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex shrink-0 items-center gap-3 px-6 pb-3 pt-4">
        <button onClick={onBack} aria-label="Back" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={onProfile} aria-label="View profile" className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <Avatar name={name} size={34} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[18px] font-bold text-ink">{name}</div>
            <div className="text-[12px] text-ink-secondary">{room}</div>
          </div>
        </button>
      </div>
      <div className={`flex shrink-0 items-center justify-between gap-3 border-y border-line px-6 py-2.5 text-[12px] ${manual ? "bg-brand-tint/50 text-brand" : "bg-violet-50 text-violet-700"}`}>
        <span className="font-medium">{manual ? "You're replying — AI is paused" : "ALFON AI is replying automatically"}</span>
        <button onClick={onToggle} aria-pressed={manual} aria-label="Take over" className="flex items-center gap-2">
          <span className="text-[11px] font-semibold">Take over</span>
          <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${manual ? "bg-brand" : "bg-[#D8D8DC]"}`}>
            <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${manual ? "translate-x-5" : ""}`} />
          </span>
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-6 py-4">
        {!thread.length && <p className="py-6 text-center text-[12px] text-ink-tertiary">No messages yet.</p>}
        {thread.map((m, i) => (
          <div key={i} className={`flex ${m.from === "guest" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${m.from === "guest" ? "bg-[#F1F1F3] text-ink" : m.from === "ai" ? "bg-violet-50 text-ink" : "bg-brand-tint text-ink"}`}>
              {m.text}
              <div className="mt-1 text-[10px] font-semibold text-ink-tertiary">{m.from === "ai" ? "ALFON AI" : m.from === "me" ? "You" : "Guest"}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex shrink-0 items-center gap-2 border-t border-line px-6 py-3">
        <input
          value={draft}
          disabled={!manual}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={manual ? "Reply as hotel staff…" : "Take over to reply"}
          className="h-11 flex-1 rounded-2xl border border-line px-4 text-[14px] outline-none focus:border-brand disabled:bg-[#F6F6F8]"
        />
        <button onClick={send} disabled={!manual || !draft.trim()} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
