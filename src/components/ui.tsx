import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Page({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-white">
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
  /** the shared data-table surface: larger radius, hairline border, soft shadow */
  table?: boolean;
}) {
  return (
    <div
      id={id}
      className={`${table ? "rounded-[20px] border border-line/40 shadow-[0_1px_3px_rgba(16,24,40,0.05)]" : "rounded-card border border-line"} bg-white ${className}`}
    >
      {children}
    </div>
  );
}

type Tone = "success" | "warning" | "danger" | "neutral" | "brand" | "info";

const TONE: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  danger: "bg-red-50 text-red-600",
  neutral: "bg-gray-100 text-ink-secondary",
  brand: "bg-brand-tint text-brand",
  info: "bg-blue-50 text-blue-600",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...rest
}: {
  variant?: "primary" | "outline" | "ghost";
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-hover",
    outline: "border border-line bg-white text-ink hover:bg-subtle",
    ghost: "text-ink-secondary hover:bg-subtle",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors ${styles} ${className}`}
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
      className={`h-10 w-full rounded-lg border border-line bg-white px-3 text-[13px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full appearance-none rounded-lg border border-line bg-white bg-[length:16px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-[13px] text-ink outline-none focus:border-brand ${props.className ?? ""}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-line bg-white p-3 text-[13px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand ${props.className ?? ""}`}
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
        className="absolute inset-0 bg-black/40"
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
