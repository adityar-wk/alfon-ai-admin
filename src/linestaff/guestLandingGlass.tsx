import { useRef, useState } from "react";
import { MessageCircle, ArrowRight, ShieldCheck, User, KeyRound, ChevronLeft, RefreshCw } from "lucide-react";
import { PhoneFrame, Label } from "./mobile";
import logoSrc from "../assets/alfon-logo.png";
import heroBg from "../assets/guest-landing-bg.webp";

const COUNTRIES = [
  { flag: "🇦🇪", code: "+971" },
  { flag: "🇬🇧", code: "+44" },
  { flag: "🇺🇸", code: "+1" },
  { flag: "🇮🇳", code: "+91" },
];

/** frosted-glass input: translucent fill, soft border, blurs whatever sits behind it */
const FIELD =
  "h-14 w-full rounded-2xl border border-white/60 bg-white/35 text-[15px] text-ink outline-none backdrop-blur-md placeholder:text-ink-secondary/70 focus:border-white/90 focus:bg-white/45";

/** glassmorphic gradient CTA: translucent brand gradient, frosted border, tinted glow */
const GLASS_CTA =
  "relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/50 bg-gradient-to-r from-[#F07A52] to-[#D4522D] font-display text-[15px] font-semibold text-white shadow-[0_8px_28px_rgba(212,82,45,0.5)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_10px_32px_rgba(212,82,45,0.6)] disabled:opacity-40 disabled:hover:translate-y-0 before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/25 before:to-transparent before:content-['']";

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

type Step = "form" | "otp" | "sent";

export function GuestLandingGlassPrototype() {
  const [step, setStep] = useState<Step>("form");
  const [verified, setVerified] = useState(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0].code);
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [consent, setConsent] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formValid = name.trim() && phone.trim() && room.trim() && consent;
  const otpValid = otp.every((d) => d !== "");
  const firstName = name.trim().split(" ")[0] || "there";

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setOtp((o) => o.map((x, idx) => (idx === i ? d : x)));
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const onOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  return (
    <PhoneFrame white>
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover" style={{ objectPosition: "25% 30%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 35%, rgba(0,0,0,0.05) 100%)" }} />
      </div>

      <div className="relative flex h-full flex-col overflow-y-auto no-scrollbar">
        <div className="shrink-0 px-6 pt-6">
          <LogoMark className="mx-auto h-7 w-[150px]" />
          <div className="mt-2.5 flex items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.35em] text-ink-secondary">
            <span className="h-px w-5 bg-ink-secondary/50" /> GUEST VERIFICATION <span className="h-px w-5 bg-ink-secondary/50" />
          </div>
          <h1 className="mt-4 text-center font-display text-[21px] font-bold leading-tight text-ink">
            Meet Alfon,
            <br />
            Your AI Concierge.
          </h1>
          <p className="mx-auto mt-1.5 max-w-[260px] text-center text-[13px] leading-relaxed text-ink-secondary">
            Verify your stay to unlock instant assistance on WhatsApp, day or night.
          </p>
        </div>

        <div className="relative mx-4 mb-4 mt-5 overflow-hidden rounded-[32px] border border-white/40 bg-white/10 px-5 pb-7 pt-5 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent" />
          <div className="relative">
            {step === "sent" ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] backdrop-blur-sm">
                  <MessageCircle className="h-7 w-7" />
                </span>
                <div>
                  <div className="text-[17px] font-bold text-ink">You're verified, {firstName}!</div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
                    Opening WhatsApp so you can start chatting with our AI Concierge about Room {room}.
                  </p>
                </div>
                <button
                  onClick={() => { setStep("form"); setVerified(false); setOtp(["", "", "", "", "", ""]); setConsent(false); }}
                  className="text-[12.5px] font-medium text-brand hover:underline"
                >
                  ← Back to form
                </button>
              </div>
            ) : step === "otp" ? (
              verified ? (
                <div className="flex flex-col items-center gap-4 py-6 text-center">
                  <span className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50/70 text-emerald-600 backdrop-blur-sm">
                    <ShieldCheck className="h-8 w-8" />
                  </span>
                  <div>
                    <div className="text-[17px] font-bold text-ink">Number verified!</div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
                      Room {room} · {country} {phone}
                    </p>
                  </div>
                  <button onClick={() => setStep("sent")} className={GLASS_CTA}>
                    <MessageCircle className="h-5 w-5" /> Connect on WhatsApp
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => setStep("form")} className="flex items-center gap-1 text-[12.5px] font-medium text-ink-secondary hover:text-ink">
                    <ChevronLeft className="h-4 w-4" /> Edit details
                  </button>
                  <div className="mt-3 text-[16px] font-bold text-ink">Verify your number</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
                    Enter the 6-digit code sent to {country} {phone}
                  </p>
                  <div className="mt-5 flex justify-between gap-2">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        value={d}
                        onChange={(e) => setDigit(i, e.target.value)}
                        onKeyDown={(e) => onOtpKeyDown(i, e)}
                        inputMode="numeric"
                        maxLength={1}
                        className="h-14 w-full rounded-2xl border border-white/60 bg-white/35 text-center text-[18px] font-semibold text-ink outline-none backdrop-blur-md focus:border-white/90"
                      />
                    ))}
                  </div>
                  <button disabled={!otpValid} onClick={() => setVerified(true)} className={`mt-5 ${GLASS_CTA}`}>
                    Verify Code <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="mt-3 flex w-full items-center justify-center gap-1.5 text-[12.5px] font-medium text-brand hover:underline">
                    <RefreshCw className="h-3.5 w-3.5" /> Resend code
                  </button>
                </>
              )
            ) : (
              <>
                <div>
                  <Label>Full name</Label>
                  <div className="relative">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alexander Wright"
                      className={`${FIELD} pl-4 pr-10`}
                    />
                    <User className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
                  </div>
                </div>

                <div>
                  <Label>Phone number</Label>
                  <div className="flex gap-2">
                    <div className="relative shrink-0">
                      <select
                        aria-label="Country code"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={`${FIELD} appearance-none pl-3 pr-7`}
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
                      className={`${FIELD} min-w-0 flex-1 px-4`}
                    />
                  </div>
                </div>

                <div>
                  <Label>Room number</Label>
                  <div className="relative">
                    <input
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="e.g. Suite 1402"
                      className={`${FIELD} pl-4 pr-10`}
                    />
                    <KeyRound className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary" />
                  </div>
                </div>

                <label className="mt-4 flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-secondary">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand" />
                  <span>
                    I agree to the Terms &amp; Conditions and to the hotel processing my details to provide AI concierge and guest services via WhatsApp, as described in the{" "}
                    <span className="font-medium text-brand underline">Privacy Policy.</span>
                  </span>
                </label>

                <button disabled={!formValid} onClick={() => setStep("otp")} className={`mt-5 ${GLASS_CTA}`}>
                  Send Verification Code <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-center text-[11.5px] text-ink-secondary">Verify your stay to unlock instant guest assistance.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
