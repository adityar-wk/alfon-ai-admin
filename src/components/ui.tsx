import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

export function Page({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-page">
      <div className="mx-auto max-w-[1240px] p-6">{children}</div>
    </main>
  );
}

export function Card({
  children,
  className = "",
  id,
  table = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  /** kept for callers; every card now shares one surface */
  table?: boolean;
}) {
  return (
    <div
      id={id}
      className={`rounded-card border border-line bg-white shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

type Tone = "success" | "warning" | "danger" | "neutral" | "brand" | "info";

const TONE: Record<Tone, { pill: string; dot: string }> = {
  brand: { pill: "bg-brand-tint text-brand", dot: "bg-brand" },
  warning: { pill: "bg-[#FFF9EC] text-warning", dot: "bg-warning" },
  success: { pill: "bg-[#F0FDF4] text-success", dot: "bg-success" },
  neutral: { pill: "bg-surface2 text-ink-secondary", dot: "bg-ink-tertiary" },
  danger: { pill: "bg-[#FEF2F2] text-danger", dot: "bg-danger" },
  info: { pill: "bg-[#EEF6FA] text-teal", dot: "bg-teal" },
};

export function Badge({
  tone = "neutral",
  dot = false,
  children,
  className = "",
}: {
  tone?: Tone;
  /** leading 6px dot, used on priority badges */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-[11px] py-[5px] text-[12px] font-medium ${TONE[tone].pill} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${TONE[tone].dot}`} />}
      {children}
    </span>
  );
}

export function Button({
  variant = "primary",
  tone,
  children,
  className = "",
  ...rest
}: {
  variant?: "primary" | "outline" | "ghost";
  /** custom fill for a coloured primary action, e.g. "bg-emerald-600" */
  tone?: string;
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: tone ? `${tone} text-white hover:opacity-90` : "bg-brand text-white hover:bg-brand-hover",
    outline: "border border-line bg-transparent text-ink hover:bg-subtle",
    ghost: "text-ink-secondary hover:bg-subtle",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-control px-[18px] py-2.5 text-[14px] font-semibold transition-colors duration-200 ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-ink-secondary">
        {label} {required && <span className="text-brand">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-tertiary">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-control border border-line bg-white px-3 text-[13px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full appearance-none rounded-control border border-line bg-white bg-[length:16px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-[13px] text-ink outline-none focus:border-brand ${props.className ?? ""}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

const DIAL_CODES = ["+91", "+1", "+44", "+61", "+65", "+971", "+49", "+33"];

/** country code + number, side by side; the number keeps digits and spaces only */
export function PhoneInput({
  code = "+91",
  number = "",
  onChange,
  placeholder = "98765 43210",
  disabled = false,
}: {
  code?: string;
  number?: string;
  onChange?: (code: string, number: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [c, setC] = useState(code);
  const [n, setN] = useState(number);
  return (
    <div className="grid grid-cols-[92px_1fr] gap-2">
      <Select
        aria-label="Country code"
        value={c}
        disabled={disabled}
        onChange={(e) => {
          setC(e.target.value);
          onChange?.(e.target.value, n);
        }}
      >
        {DIAL_CODES.map((d) => <option key={d}>{d}</option>)}
      </Select>
      <Input
        type="tel"
        inputMode="tel"
        aria-label="Phone number"
        value={n}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value.replace(/[^\d ]/g, "");
          setN(v);
          onChange?.(c, v);
        }}
      />
    </div>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-control border border-line bg-white p-3 text-[13px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Toggle({ checked = true }: { checked?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
        checked ? "bg-brand" : "bg-gray-300"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </span>
  );
}

/** 44px circle on the brand tint, initials in Sora 600 */
export function Avatar({ name, size = 44, tone = "bg-brand-tint text-brand", className = "" }: { name: string; size?: number; tone?: string; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold ${tone} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size / 3)) }}
    >
      {name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
    </span>
  );
}

export function Stars({ value = 5 }: { value?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-brand">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" fill={i < value ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 15l-5.3 2.8 1-5.8L1.5 7.7l5.9-.9L10 1.5z" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function Tabs({
  tabs,
  active,
}: {
  tabs: string[];
  active: string;
}) {
  return (
    <div className="flex items-center gap-6 border-b border-line">
      {tabs.map((t) => (
        <button
          key={t}
          className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-[13px] font-medium ${
            t === active
              ? "border-brand text-brand"
              : "border-transparent text-ink-secondary hover:text-ink"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
