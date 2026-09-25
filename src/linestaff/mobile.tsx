import { Button } from "../components/ui";
import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, DoorClosed, Signal, Wifi, BatteryFull, ChevronLeft, ChevronRight, ChevronDown, X, Clock } from "lucide-react";

/* ============================================================
   Shared mobile kit — used by the Line Staff, Supervisor and
   Mid Manager prototypes.
   ============================================================ */

export type Priority = "Low" | "Medium" | "High" | "Critical";

export const PRIORITY_STYLE: Record<Priority, { dot: string; pill: string }> = {
  Low: { dot: "bg-slate-400", pill: "bg-slate-100 text-slate-600" },
  Medium: { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-700" },
  High: { dot: "bg-orange-500", pill: "bg-orange-50 text-orange-700" },
  Critical: { dot: "bg-red-500", pill: "bg-red-50 text-red-700" },
};

export const CARD_SHADOW = "shadow-[0_2px_10px_rgba(17,17,17,0.08)]";

/* ---------- phone ---------- */

export function PhoneFrame({ children, white = false }: { children: ReactNode; white?: boolean }) {
  return (
    <div className="relative h-[820px] w-[400px] shrink-0 rounded-[52px] border-[10px] border-[#2B2E35] bg-[#2B2E35] shadow-2xl">
      <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-[42px] ${white ? "bg-white" : "bg-[#F6F6F8]"}`}>
        <StatusBar />
        <div className="relative min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-7 pt-2 text-[15px] font-semibold text-ink">
      <span>9:30</span>
      <span className="flex items-center gap-1.5">
        <Signal className="h-4 w-4" />
        <Wifi className="h-4 w-4" />
        <BatteryFull className="h-[18px] w-[18px]" />
      </span>
    </div>
  );
}

/* ---------- navigation stack + toast ---------- */

export function useNav<T extends { name: string }>(root: T) {
  const [stack, setStack] = useState<T[]>([root]);
  return {
    cur: stack[stack.length - 1],
    push: (s: T) => setStack((st) => [...st, s]),
    back: () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)),
    go: (s: T) => setStack([s]),
    reset: () => setStack([root]),
    depth: stack.length,
  };
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 1900);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-[60] flex justify-center px-6">
      <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{msg}</span>
    </div>
  ) : null;
  return { flash: setMsg, node };
}

/* ---------- headers ---------- */

export function ScreenHeader({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className={`flex items-center gap-1 pb-1 pt-3 pr-4 ${onBack ? "pl-4" : "pl-6"}`}>
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-ink/5">
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <div className="min-w-0 flex-1 leading-tight">
        {title && <h1 className="text-[20px] font-semibold text-ink">{title}</h1>}
      </div>
      {right}
    </div>
  );
}

/** "‹ Back" text link + centred title (Create Manual Task style) */
export function TextHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="px-6 pt-2">
      <button onClick={onBack} className="flex items-center gap-1.5 py-2 text-[15px] font-medium text-ink">
        <ChevronLeft className="h-5 w-5" /> Back
      </button>
      <h1 className="mt-1 text-center text-[17px] font-semibold text-ink">{title}</h1>
    </div>
  );
}

export function SectionTitle({ children, action, tone = "bg-ink/70", dot = true, small = false }: { children: ReactNode; action?: ReactNode; tone?: string; dot?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center justify-between px-6">
      <div className="flex items-center gap-2.5">
        {dot && <span className={`h-2 w-2 rounded-full ${tone}`} />}
        <h2 className={`${small ? "text-[15px]" : "text-[19px]"} font-semibold text-ink`}>{children}</h2>
      </div>
      {action}
    </div>
  );
}

/* ---------- SLA timer ring ---------- */

export const fmtMins = (m: number) => {
  const a = Math.abs(m);
  const s = a >= 60 ? `${Math.floor(a / 60)}h${a % 60 ? ` ${a % 60}m` : ""}` : `${a}m`;
  return m < 0 ? `-${s}` : s;
};

export function slaTone(left: number, total: number) {
  if (left < 0) return { color: "#DC2626", label: "over", text: "text-red-600" };
  const f = left / total;
  if (f < 0.25) return { color: "#F15A24", label: "left", text: "text-orange-600" };
  if (f < 0.55) return { color: "#F59E0B", label: "left", text: "text-amber-600" };
  return { color: "#16A34A", label: "left", text: "text-emerald-600" };
}

export function SlaRing({ left, total, size = 54 }: { left: number; total: number; size?: number }) {
  const tone = slaTone(left, total);
  const r = (size - 7) / 2;
  const c = 2 * Math.PI * r;
  const frac = left < 0 ? 1 : Math.max(0.04, Math.min(1, left / total));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title="SLA timer">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E7E7EA" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone.color} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${frac * c} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12px] font-bold text-ink">{fmtMins(left)}</span>
      </div>
    </div>
  );
}

export function SlaCountdown({ left, total }: { left: number; total: number }) {
  const [secs, setSecs] = useState(() => Math.round(left * 60));
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, []);
  const over = secs < 0;
  const tone = slaTone(secs / 60, total);
  const abs = Math.abs(secs);
  const mm = Math.floor(abs / 60);
  const ss = abs % 60;
  return (
    <div className="flex items-center gap-1.5 text-[17px] font-semibold tabular-nums" style={{ color: tone.color, fontFamily: '"Poppins", "Sora", "Inter", sans-serif' }}>
      <Clock className="h-4 w-4" />
      {over ? "-" : ""}{mm}:{String(ss).padStart(2, "0")}
      {over && <span className="text-[10px] font-bold uppercase tracking-wide">breached</span>}
    </div>
  );
}

export function PriorityPill({ p }: { p: Priority }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLE[p].pill}`}>{p}</span>;
}

/* ---------- cards ---------- */

export function TaskCard({
  room,
  note,
  priority,
  left,
  total,
  meta,
  tag,
  onClick,
  done,
}: {
  room: string;
  note: string;
  priority?: Priority;
  left?: number;
  total?: number;
  meta?: ReactNode;
  tag?: ReactNode;
  onClick?: () => void;
  done?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={`relative rounded-2xl bg-white p-4 ${CARD_SHADOW} ${onClick ? "cursor-pointer active:scale-[0.99]" : ""} ${done ? "opacity-55 grayscale-[0.5]" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold leading-snug text-ink">{note}</div>
          <div className="mt-1 text-[12px] font-medium text-ink-secondary">{room}</div>
          {(priority || tag) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {priority && <PriorityPill p={priority} />}
              {tag}
            </div>
          )}
          {meta && <div className="mt-2 text-[12px] text-ink-tertiary">{meta}</div>}
        </div>
        {!done && left !== undefined && total !== undefined && <SlaRing left={left} total={total} />}
      </div>
    </div>
  );
}

export function StatCard({ label, value, tone = "text-ink", onClick, hint }: { label: string; value: number | string; tone?: string; onClick?: () => void; hint?: string }) {
  return (
    <button onClick={onClick} className={`rounded-2xl bg-white p-3.5 text-left ${CARD_SHADOW} ${onClick ? "active:scale-[0.98]" : "cursor-default"}`}>
      <div className={`text-[26px] font-bold leading-none ${tone}`}>{value}</div>
      <div className="mt-1.5 text-[12px] font-medium text-ink-secondary">{label}</div>
      {hint && <div className="text-[11px] text-ink-tertiary">{hint}</div>}
    </button>
  );
}

export function Avatar({ name, size = 40, tone = "bg-brand-tint text-brand" }: { name: string; size?: number; tone?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${tone}`} style={{ width: size, height: size }}>
      {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
    </span>
  );
}

/* ---------- flat chat list row: no card, no elevation ---------- */

const CHAT_TIMES = ["19:45", "19:12", "18:30", "17:05", "15:48", "Yesterday", "Mon"];
/** demo unread counts so the badge shows on a few chats */
export const sampleUnread = (name: string) => [2, 0, 1, 0, 0, 3][name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 6];
export const chatTime = (name: string) => CHAT_TIMES[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % CHAT_TIMES.length];

export function ChatRow({
  name, room, preview, unread = 0, tone, complaint = false, plain = false, onOpen, onAvatar,
}: {
  name: string; room: string; preview: string; unread?: number; tone?: string; complaint?: boolean; plain?: boolean; onOpen: () => void; onAvatar?: () => void;
}) {
  const body = (
    <>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[15px] font-semibold text-ink">{name}</span>
        <span className="mt-1 flex items-center gap-1 text-[12px] text-ink-tertiary">
          {/^Room\s/i.test(room) ? <><DoorClosed className="h-3.5 w-3.5" />{room.replace(/^Room\s+/i, "")}</> : room}
        </span>
        <span className="mt-1.5 block truncate text-[13px] text-ink-secondary">{preview}</span>
      </span>
      {!plain && (
        <span className="flex shrink-0 flex-col items-end justify-between gap-1.5 self-stretch py-0.5">
          <span className={`text-[12px] ${unread > 0 ? "font-bold text-brand" : "text-ink-tertiary"}`}>{chatTime(name)}</span>
          <span className="flex h-2.5 items-center">
            {unread > 0 && <span aria-label="Unread" className="h-2.5 w-2.5 rounded-full bg-brand" />}
          </span>
        </span>
      )}
    </>
  );
  // complaint marker sits on the avatar's top-left corner
  const avatar = (
    <span className="relative block">
      <Avatar name={name} size={52} tone={tone} />
      {complaint && (
        <span className="absolute -left-1 -top-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white">
          <AlertCircle aria-label="Complaint" className="h-[20px] w-[20px] text-amber-500" />
        </span>
      )}
    </span>
  );
  return (
    <div className="flex items-center gap-3.5 border-b border-[#EEEEF1] py-5 last:border-b-0">
      {onAvatar ? (
        <button onClick={onAvatar} aria-label={`View ${name} profile`} className="shrink-0">{avatar}</button>
      ) : (
        <span className="shrink-0">{avatar}</span>
      )}
      <button onClick={onOpen} className="flex min-w-0 flex-1 items-stretch gap-3 text-left">{body}</button>
    </div>
  );
}

/* ---------- controls ---------- */

export function Chips<T extends string>({ items, active, onChange, counts, flat = false }: { items: readonly T[]; active: T; onChange: (v: T) => void; counts?: Partial<Record<T, number>>; flat?: boolean }) {
  return (
    <div className="no-scrollbar -mx-0 flex gap-2 overflow-x-auto px-6 pb-1">
      {items.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold ${flat ? (active === c ? "bg-brand text-white" : "bg-[#F4F4F6] text-ink-secondary") : active === c ? "bg-brand text-white shadow-sm" : "bg-white text-ink-secondary shadow-sm"}`}
        >
          {c}
          {counts?.[c] !== undefined && <span className={`ml-1.5 ${active === c ? "text-white/80" : "text-ink-tertiary"}`}>{counts[c]}</span>}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string>({ items, active, onChange, colors }: { items: readonly T[]; active: T; onChange: (v: T) => void; colors?: Partial<Record<T, string>> }) {
  return (
    <div className="flex rounded-2xl bg-white p-1 shadow-sm">
      {items.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`flex-1 rounded-xl py-2.5 text-[13px] font-semibold ${active === c ? `${colors?.[c] ?? "bg-brand"} text-white shadow` : "text-ink-secondary"}`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function SelectField({ value, onChange, placeholder, options, disabled }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[]; disabled?: boolean }) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-14 w-full appearance-none rounded-2xl border px-4 pr-11 text-[15px] outline-none transition-colors disabled:opacity-50 ${
          value ? "border-brand/40 bg-brand-tint/50 font-medium text-ink" : "border-line bg-white text-ink-secondary"
        } focus:border-brand`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-secondary" />
    </div>
  );
}

export function TextField({ value, onChange, placeholder, rows }: { value: string; onChange: (v: string) => void; placeholder: string; rows?: number }) {
  const cls = "w-full rounded-2xl border border-line bg-white px-4 text-[15px] outline-none placeholder:text-ink-tertiary focus:border-brand";
  return rows ? (
    <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} py-3.5`} />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} h-14`} />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-2 mt-5 px-1 text-[12px] font-semibold text-ink-secondary">{children}</div>;
}

/* ---------- sheet ---------- */

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-40">
      <button className="absolute inset-0 bg-ink/45" onClick={onClose} aria-label="Dismiss" />
      <div className="absolute inset-x-0 bottom-0 max-h-[86%] overflow-y-auto rounded-t-[28px] bg-white p-6 pb-7 shadow-2xl no-scrollbar">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#DADADA]" />
        <div className="flex items-center justify-between">
          <h3 className="text-[22px] font-semibold text-ink">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F1F3] text-ink-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

/* ---------- floating nav ---------- */

export type NavItem<K extends string> = { key: K; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };

export function FloatingNav<K extends string>({
  items,
  active,
  onChange,
  fab,
}: {
  items: NavItem<K>[];
  active: K;
  onChange: (k: K) => void;
  fab?: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; label: string };
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
      <div className="pointer-events-auto flex items-center border-t border-line bg-white px-4 pb-4 pt-1.5">
        {items.map((it) => {
          const on = it.key === active;
          return (
            <button
              key={it.key}
              aria-label={it.label}
              aria-current={on ? "page" : undefined}
              onClick={() => onChange(it.key)}
              className={`relative flex h-12 flex-1 flex-col items-center justify-center gap-1 ${on ? "text-brand" : "text-ink-tertiary"}`}
            >
              <it.icon className="h-[22px] w-[22px]" />
              <span className={`h-[3px] w-6 rounded-full transition-colors ${on ? "bg-brand" : "bg-transparent"}`} />
              {!!it.badge && !on && (
                <span className="absolute right-[calc(50%-20px)] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{it.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      {fab && (
        <button
          onClick={fab.onClick}
          aria-label={fab.label}
          className="pointer-events-auto absolute bottom-[84px] right-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_3px_10px_rgba(241,90,36,0.22)] active:scale-95"
        >
          <fab.icon className="h-7 w-7" />
        </button>
      )}
    </div>
  );
}

/** just the floating "+" button, bottom-right */
export function Fab({ onClick, label, icon: Icon }: { onClick: () => void; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="absolute bottom-5 right-5 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_3px_10px_rgba(241,90,36,0.22)] active:scale-95"
    >
      <Icon className="h-7 w-7" />
    </button>
  );
}


export const COMP_TYPES = [
  "Chocolate Cake — $10", "Fruit Platter — $10", "Date Box — $10", "Non-Alcoholic Sparkling Beverage — $10",
  "Prosecco — $20", "Champagne — $50", "Resort Credit — $500", "Resort Credit — $1,000",
  "Other",
];

export function CompensationSheet({ subtitle, approvers, onClose, onSubmit }: { subtitle: string; approvers: string[]; onClose: () => void; onSubmit: (type: string, reason: string, by: string) => void }) {
  const [type, setType] = useState("");
  const [reason, setReason] = useState("");
  const [by, setBy] = useState("");
  const [other, setOther] = useState("");
  return (
    <Sheet title="Guest compensation" onClose={onClose}>
      <p className="mb-3 text-[13px] text-ink-secondary">{subtitle}</p>
      <SelectField value={type} onChange={setType} placeholder="Compensation type" options={COMP_TYPES} />
      {type === "Other" && (
        <>
          <Label>What is the compensation?</Label>
          <TextField value={other} onChange={setOther} placeholder="e.g. Late check-out, spa voucher" />
        </>
      )}
      <Label>Reason</Label>
      <TextField rows={3} value={reason} onChange={setReason} placeholder="Why is this compensation being given?" />
      <Label>Approved by</Label>
      <SelectField value={by} onChange={setBy} placeholder="Select approver" options={approvers} />
      <Button className="mt-5 w-full" disabled={!type || (type === "Other" && !other.trim()) || !reason.trim() || !by} onClick={() => onSubmit(type === "Other" ? `Other — ${other.trim()}` : type, reason.trim(), by)}>
        Submit compensation
      </Button>
    </Sheet>
  );
}
