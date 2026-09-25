import { useState } from "react";
import { ChevronRight, LogOut, SlidersHorizontal } from "lucide-react";
import { Avatar, ScreenHeader, PrimaryButton, CARD_SHADOW } from "./mobile";

const Toggle = ({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) => (
  <button onClick={onChange} aria-pressed={on} aria-label={label} className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${on ? "bg-emerald-500" : "bg-[#C8C8C8]"}`}>
    <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
  </button>
);

/** The hamburger menu ("More"): who you are, notification settings, sign out. */
export function ProfileScreen({
  name, role, onNotifSettings, onSignOut, onBack,
}: {
  name: string; role: string; dept?: string; onNotifSettings: () => void; onSignOut: () => void; onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="More" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        <div className="-mx-6 bg-[#F6F6F8] px-6 py-6">
          <div className="flex items-center gap-4">
            <Avatar name={name} size={64} tone="bg-brand text-white" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[18px] font-bold text-ink">{name}</div>
              <div className="mt-1 text-[13px] text-ink-secondary">{role}</div>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <button onClick={onNotifSettings} className="flex w-full items-center gap-4 border-b border-[#EEEEF1] py-4 text-left">
            <SlidersHorizontal className="h-[22px] w-[22px] shrink-0 text-ink" />
            <span className="min-w-0 flex-1 text-[15px] font-semibold text-ink">Notification settings</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
          </button>
          <button onClick={onSignOut} className="flex w-full items-center gap-4 py-4 text-left">
            <LogOut className="h-[22px] w-[22px] shrink-0 text-red-600" />
            <span className="text-[15px] font-semibold text-red-600">Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const NOTIF_OPTIONS: { key: string; label: string; sub: string }[] = [
  { key: "assigned", label: "New task assigned", sub: "When a task is assigned or reassigned to you" },
  { key: "sla", label: "SLA at risk", sub: "Before a task is about to breach its SLA" },
  { key: "guest", label: "Guest messages", sub: "New messages from guests you are helping" },
  { key: "escalation", label: "Escalation updates", sub: "When an escalation is picked up or resolved" },
  { key: "team", label: "Team updates", sub: "Support requests and shift changes" },
];
const DEFAULT_PREFS: Record<string, boolean> = { assigned: true, sla: true, guest: true, escalation: true, team: false };
// kept at module level so settings survive leaving the screen
const savedPrefs: Record<string, Record<string, boolean>> = {};

export function NotificationSettingsScreen({ persona, onBack }: { persona: string; onBack: () => void }) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(savedPrefs[persona] ?? DEFAULT_PREFS);
  const flip = (k: string) => setPrefs((p) => { const n = { ...p, [k]: !p[k] }; savedPrefs[persona] = n; return n; });
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Notification settings" onBack={onBack} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {NOTIF_OPTIONS.map((o) => (
          <div key={o.key} className={`flex items-center gap-3 rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[14px] font-semibold text-ink">{o.label}</div>
              <div className="mt-0.5 text-[12px] text-ink-tertiary">{o.sub}</div>
            </div>
            <Toggle on={!!prefs[o.key]} onChange={() => flip(o.key)} label={o.label} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SignedOutScreen({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint text-brand"><SlidersHorizontal className="h-7 w-7" /></span>
      <h2 className="mt-5 text-[20px] font-bold text-ink">You&apos;re signed out</h2>
      <p className="mt-1.5 text-[13px] text-ink-secondary">Sign in again to see your tasks and guest messages.</p>
      <PrimaryButton className="mt-6 w-full" onClick={onSignIn}>Sign in</PrimaryButton>
    </div>
  );
}
