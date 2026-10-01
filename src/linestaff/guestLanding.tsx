import { useState } from "react";
import { MessageCircle, ArrowRight, Lock, ShieldCheck, Zap, User, KeyRound } from "lucide-react";
import { PhoneFrame } from "./mobile";
import logoSrc from "../assets/alfon-logo.png";
import heroBg from "../assets/guest-landing-bg.webp";

const COUNTRIES = [
  { flag: "🇦🇪", code: "+971" },
  { flag: "🇬🇧", code: "+44" },
  { flag: "🇺🇸", code: "+1" },
  { flag: "🇮🇳", code: "+91" },
];

/** the ALFON wordmark, recoloured brand-orange via a CSS mask of the logo PNG */
function LogoMark({ className = "" }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="ALFON"
      className={className}
      style={{
        backgroundColor: "#E8623A",
        WebkitMaskImage: `url(${logoSrc})`,
        maskImage: `url(${logoSrc})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function GuestLandingPrototype() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0].code);
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const valid = name.trim() && phone.trim() && room.trim() && consent;
  const firstName = name.trim().split(" ")[0] || "there";

  return (
    <PhoneFrame white>
      <div className="flex h-full flex-col overflow-y-auto no-scrollbar">
        <div
          className="relative shrink-0 bg-cover bg-no-repeat px-6 pb-9 pt-7"
          style={{ backgroundImage: `url(${heroBg})`, backgroundPosition: "25% 35%" }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.45) 45%, rgba(255,255,255,0.08) 75%)" }} />
          <div className="relative">
            <LogoMark className="mx-auto h-8 w-[170px]" />
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.35em] text-ink-tertiary">
              <span className="h-px w-5 bg-ink-tertiary/40" /> GUEST VERIFICATION <span className="h-px w-5 bg-ink-tertiary/40" />
            </div>
            <h1 className="mt-7 font-display text-[24px] font-bold leading-tight text-ink">
              Explore. Connect.
              <br />
              Experience.
            </h1>
            <p className="mt-2 max-w-[250px] text-[13px] leading-relaxed text-ink-secondary">
              Verify your stay to unlock instant guest assistance on WhatsApp with our AI Concierge.
            </p>
            <div className="mt-3 h-[3px] w-10 rounded-full bg-brand" />
          </div>
        </div>

        <div className="relative z-10 min-h-0 flex-1 rounded-t-[28px] bg-white px-6 pb-8 pt-6 shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle className="h-7 w-7" />
              </span>
              <div>
                <div className="text-[17px] font-bold text-ink">You're verified, {firstName}!</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
                  Opening WhatsApp so you can start chatting with our AI Concierge about Room {room}.
                </p>
              </div>
              <button onClick={() => setSent(false)} className="text-[12.5px] font-medium text-brand hover:underline">
                ← Back to form
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-[10.5px] font-semibold tracking-[0.15em] text-ink-tertiary">FULL NAME</label>
                <div className="relative">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alexander Wright"
                    className="h-12 w-full rounded-xl border border-line bg-white pl-4 pr-10 text-[14px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
                  />
                  <User className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[10.5px] font-semibold tracking-[0.15em] text-ink-tertiary">TELEPHONE NUMBER</label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <select
                      aria-label="Country code"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-12 appearance-none rounded-xl border border-line bg-white pl-3 pr-7 text-[14px] text-ink outline-none focus:border-brand"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, ""))}
                    placeholder="50 123 4567"
                    inputMode="tel"
                    className="h-12 min-w-0 flex-1 rounded-xl border border-line bg-white px-4 text-[14px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[10.5px] font-semibold tracking-[0.15em] text-ink-tertiary">ROOM NUMBER</label>
                <div className="relative">
                  <input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. Suite 1402"
                    className="h-12 w-full rounded-xl border border-line bg-white pl-4 pr-10 text-[14px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
                  />
                  <KeyRound className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                </div>
              </div>

              <label className="mt-4 flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-secondary">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
                <span>
                  I agree to the hotel processing my phone number and details to provide AI concierge and guest services via WhatsApp, as described in the{" "}
                  <span className="font-medium text-brand underline">Privacy Policy.</span>
                </span>
              </label>

              <button
                disabled={!valid}
                onClick={() => setSent(true)}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <MessageCircle className="h-5 w-5" /> Connect on WhatsApp <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-[11.5px] text-ink-tertiary">Verify your stay to unlock instant guest assistance.</p>

              <div className="mt-5 border-t border-line pt-4">
                <div className="flex items-center justify-around">
                  {[
                    { icon: Lock, label: "Secure" },
                    { icon: ShieldCheck, label: "Verified" },
                    { icon: Zap, label: "Instant Access" },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="flex items-center gap-1.5 text-[11px] font-medium text-ink-secondary">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-tint text-brand"><Icon className="h-3.5 w-3.5" /></span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PhoneFrame>
  );
}
