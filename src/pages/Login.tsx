import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button, Field, Input } from "../components/ui";
import logoSrc from "../assets/alfon-logo.png";
import heroBg from "../assets/login-hero.jpg";

const STATS = [
  ["Higher", "Guest satisfaction"],
  ["Smarter", "Operations"],
  ["More", "Memorable stays"],
];

export function LogoMark({ className = "mx-auto h-9 w-[168px]", color = "#1A1A1A" }: { className?: string; color?: string }) {
  return (
    <div
      role="img"
      aria-label="ALFON"
      className={className}
      style={{
        backgroundColor: color,
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

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** email first, then set a password. */
export function AccountSetup({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const continueEmail = () => {
    if (!validEmail(email)) {
      setError("Enter a valid work email.");
      return;
    }
    setError("");
    setStep("password");
  };

  const setAccountPassword = () => {
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    onDone();
  };

  const copy = step === "password" ? "Set a password for this account." : "";

  const fields = (
    <>
      {step === "email" ? (
        <Field label="Work email" className="mt-5">
          <Input
            type="email"
            autoComplete="username"
            value={email}
            placeholder="you@company.com"
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
          />
        </Field>
      ) : (
        <>
          <Field label="Password" className="mt-5">
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              placeholder="At least 8 characters"
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
            />
          </Field>
          <Field label="Confirm password" className="mt-4">
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              placeholder="Re-enter your password"
              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
            />
          </Field>
        </>
      )}

      {error && <p className="mt-3 text-center text-[12.5px] font-medium text-danger">{error}</p>}

      <Button type="submit" className="mt-5 w-full">
        {step === "email" ? "Continue" : "Set password"} <ArrowRight className="h-4 w-4" />
      </Button>

      {step === "password" && (
        <Button
          type="button"
          variant="ghost"
          className="mt-2 w-full"
          onClick={() => { setStep("email"); setPassword(""); setConfirm(""); setError(""); }}
        >
          Use a different email
        </Button>
      )}
    </>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (step === "email") continueEmail();
        else setAccountPassword();
      }}
    >
      {copy && <p className="text-center text-[14px] leading-relaxed text-ink-secondary">{copy}</p>}
      {fields}
    </form>
  );
}

const MOBILE_FIELD = "h-10 w-full rounded-control border border-line bg-white text-[13px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand";

function idOk(value: string) {
  return validEmail(value) || value.replace(/\D/g, "").length >= 8;
}

/** phone sign-in on the hotel photo */
export function MobileSignIn({ onDone }: { onDone: () => void }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keep, setKeep] = useState(true);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState("");

  const signIn = () => {
    if (!idOk(id)) {
      setError("Enter your email or phone number.");
      return;
    }
    if (!password.trim()) {
      setError("Enter your password.");
      return;
    }
    onDone();
  };

  return (
    <>
      <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
      <div className="relative flex h-full flex-col items-center justify-center overflow-y-auto no-scrollbar px-5 py-8">
        <LogoMark color="#FFFFFF" className="h-9 w-[176px]" />
        <div className="mt-4 h-[3px] w-10 rounded-full bg-brand" />

        <div className="mt-8 w-full rounded-control bg-white px-5 py-7 shadow-card">
          <h1 className="mb-6 text-center font-sans text-[22px] font-medium text-ink">Sign in</h1>
          {forgot ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!idOk(id)) {
                  setError("Enter your email or phone number.");
                  return;
                }
                setError("");
                setForgot(false);
              }}
            >
              <p className="text-center text-[14px] leading-relaxed text-ink-secondary">We will send a reset link to this email or number.</p>
              <div className="relative mt-4">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                <input value={id} onChange={(e) => { setId(e.target.value); setError(""); }} placeholder="Email or phone number" className={`${MOBILE_FIELD} pl-10 pr-3`} />
              </div>
              {error && <p className="mt-3 text-center text-[12.5px] font-medium text-danger">{error}</p>}
              <Button type="submit" className="mt-4 w-full">
                Send reset link <ArrowRight className="h-4 w-4" />
              </Button>
              <button type="button" onClick={() => { setForgot(false); setError(""); }} className="mt-3 w-full text-center text-[13px] font-medium text-ink-secondary">
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); signIn(); }}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                <input value={id} onChange={(e) => { setId(e.target.value); setError(""); }} placeholder="Email or phone number" autoComplete="username" className={`${MOBILE_FIELD} pl-10 pr-3`} />
              </div>
              <div className="relative mt-4">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={`${MOBILE_FIELD} pl-10 pr-11`}
                />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <button type="button" onClick={() => setKeep((v) => !v)} className="flex items-center gap-2 text-[12.5px] text-ink">
                  <span className={`flex h-[18px] w-[18px] items-center justify-center rounded-[4px] ${keep ? "bg-brand" : "border border-[#D4D4D4] bg-white"}`}>
                    {keep && (
                      <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" aria-hidden="true">
                        <path d="M2.2 6.2 4.7 8.7 9.8 3.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  Keep me signed in
                </button>
                <button type="button" onClick={() => { setForgot(true); setError(""); }} className="text-[12.5px] font-medium text-brand">
                  Forgot password?
                </button>
              </div>
              {error && <p className="mt-3 text-center text-[12.5px] font-medium text-danger">{error}</p>}
              <Button type="submit" className="mt-6 w-full">
                Sign In <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const done = () => navigate("/home");
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="h-full bg-[#F6F4F0]">
      {!wide && (
      <div className="relative h-full">
        <MobileSignIn onDone={done} />
      </div>
      )}

      {wide && (
      <div className="flex h-full">
        <section className="relative h-full w-[46%] overflow-hidden">
          <img src={heroBg} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
          <div className="relative flex h-full flex-col justify-between px-12 py-10 font-sans font-thin text-white xl:px-16 xl:py-14">
            <div className="max-w-[440px] pt-2">
              <p className="text-[15px] font-thin leading-relaxed text-white/90">
                Hospitality intelligence
                <br />
                for a more human tomorrow
              </p>
              <div className="mt-7 h-px w-10 bg-white/70" />
              <h1 className="mt-6 font-sans text-[42px] font-thin leading-[1.12] xl:text-[52px]">
                AI that elevates
                <br />
                every stay.
              </h1>
            </div>
            <div className="flex max-w-[480px] pb-2">
              {STATS.map(([title, detail], i) => (
                <div key={title} className={`min-w-0 flex-1 ${i > 0 ? "border-l border-white/50 pl-5" : ""} ${i < STATS.length - 1 ? "pr-5" : ""}`}>
                  <div className="text-[13px] font-thin leading-snug">{title}</div>
                  <div className="mt-1 text-[13px] font-thin leading-snug text-white/80">{detail}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-white px-5 py-6">
          <div className="relative w-full max-w-[320px]">
            <LogoMark className="mx-auto h-14 w-[240px]" />
            <p className="mx-auto mt-4 max-w-[300px] text-center text-[14px] leading-relaxed text-ink-secondary">
              Hospitality intelligence to create extraordinary guest experiences.
            </p>
            <div className="mt-6">
              <AccountSetup onDone={done} />
            </div>
            <p className="mt-5 text-balance text-center text-[12.5px] text-ink-tertiary">
              By continuing, you agree to our <span className="font-medium text-ink underline">Terms of Service</span> and <span className="font-medium text-ink underline">Privacy Policy</span>.
            </p>
          </div>
        </section>
      </div>
      )}
    </div>
  );
}
