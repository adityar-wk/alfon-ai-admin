import { useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { PhoneFrame } from "./mobile";

const HOTEL_NAME = "LAYANA";
const HOTEL_LOCATION = "RESORT & SPA";

function HeroArt() {
  return (
    <svg viewBox="0 0 400 320" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="gl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10131f" />
          <stop offset="42%" stopColor="#262a40" />
          <stop offset="72%" stopColor="#7a4a42" />
          <stop offset="100%" stopColor="#e8623a" />
        </linearGradient>
        <linearGradient id="gl-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0c0f18" />
          <stop offset="55%" stopColor="#1c2133" />
          <stop offset="100%" stopColor="#0c0f18" />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill="url(#gl-sky)" />
      <g opacity="0.9" fill="#0b0e16">
        <rect x="14" y="210" width="26" height="110" />
        <rect x="46" y="175" width="20" height="145" />
        <rect x="330" y="195" width="24" height="125" />
        <rect x="360" y="150" width="22" height="170" />
      </g>
      <rect x="158" y="40" width="58" height="280" rx="3" fill="url(#gl-tower)" />
      <g fill="#fff" opacity="0.18">
        {Array.from({ length: 9 }, (_, row) =>
          Array.from({ length: 4 }, (_, col) => (
            <rect key={`${row}-${col}`} x={166 + col * 12} y={54 + row * 26} width="7" height="14" />
          )),
        )}
      </g>
      <rect x="158" y="40" width="58" height="280" fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="1" />
    </svg>
  );
}

export function GuestLandingPrototype() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [room, setRoom] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = first.trim() && last.trim() && room.trim() && consent;

  return (
    <PhoneFrame white>
      <div className="flex h-full flex-col">
        <div className="relative flex h-[280px] shrink-0 items-end justify-center overflow-hidden px-6 pb-9 text-center">
          <HeroArt />
          <div className="relative">
            <div className="font-display text-[32px] font-bold leading-none tracking-[0.3em] text-white">
              {HOTEL_NAME.split("").join(" ")}
            </div>
            <div className="mt-2.5 text-[10.5px] font-semibold tracking-[0.35em] text-white/75">{HOTEL_LOCATION}</div>
          </div>
        </div>

        <div className="relative z-10 -mt-6 min-h-0 flex-1 overflow-y-auto rounded-t-[28px] bg-white px-6 pb-8 pt-7 no-scrollbar">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle className="h-7 w-7" />
              </span>
              <div>
                <div className="text-[17px] font-bold text-ink">You're all set, {first}!</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
                  Opening WhatsApp so you can start chatting with our AI concierge about Room {room}.
                </p>
              </div>
              <button onClick={() => setSent(false)} className="text-[12.5px] font-medium text-brand hover:underline">
                ← Back to form
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-center font-display text-[20px] font-bold leading-snug text-ink">
                Explore. Connect.
                <br />
                Experience.
              </h2>
              <p className="mx-auto mt-2 max-w-[260px] text-center text-[12.5px] leading-relaxed text-ink-secondary">
                Tell us a little about your stay to start chatting with our AI concierge on WhatsApp.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">First Name</label>
                  <input
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                    placeholder="First name"
                    className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">Surname</label>
                  <input
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                    placeholder="Last name"
                    className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-ink-secondary">Room Number</label>
                  <input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. 1204"
                    className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-secondary">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
                  <span>
                    I consent to the hotel and Alfon AI processing my details and messages to provide AI guest service during my stay, as described in the{" "}
                    <span className="font-medium text-brand">Privacy Notice</span>.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-secondary">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
                  <span><span className="text-ink-tertiary">(Optional)</span> I agree to receive occasional offers and updates from the hotel via WhatsApp. I can opt out at any time.</span>
                </label>
              </div>

              <button
                disabled={!valid}
                onClick={() => setSent(true)}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <MessageCircle className="h-5 w-5" /> Connect on WhatsApp
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-ink-tertiary">
                <ShieldCheck className="h-3.5 w-3.5" /> Secured by Alfon AI
              </p>
            </>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}
