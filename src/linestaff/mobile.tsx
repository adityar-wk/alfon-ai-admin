import { Button } from "../components/ui";
import { deptIcon } from "../data/deptIcons";
import { useClock, secsFromMinutes, formatClock } from "../data/attention";
import { TASK_DEPTS } from "../data/tasks";
import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle, Search, DoorOpen, Signal, Wifi, BatteryFull, ChevronLeft, ChevronDown, X, Clock } from "lucide-react";

/* ============================================================
   Shared mobile kit — used by the Line Staff, Supervisor and
   Mid Manager prototypes.
   ============================================================ */

export type Priority = "Low" | "Medium" | "High" | "Critical";

export const PRIORITY_STYLE: Record<Priority, { dot: string; pill: string }> = {
  Low: { dot: "bg-gray-400", pill: "bg-gray-100 text-gray-600" },
  Medium: { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-700" },
  High: { dot: "bg-orange-500", pill: "bg-orange-50 text-orange-700" },
  Critical: { dot: "bg-red-500", pill: "bg-red-50 text-red-700" },
};

/** every phone card shares one flat style: hairline border, no elevation */
export const CARD_SHADOW = "border border-[#F0F0F0]";

/** plain 44px circle for back, bell, settings, and an inactive filter */
export const ICON_BTN = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink active:bg-ink/5";

/* ---------- phone ---------- */

export function PhoneFrame({ children, white = false }: { children: ReactNode; white?: boolean }) {
  return (
    <div className="relative h-[820px] w-[400px] shrink-0 rounded-[52px] border-[10px] border-[#1A1A1A] bg-[#1A1A1A] shadow-2xl">
      <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-[42px] ${white ? "bg-white" : "bg-page"}`}>
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

export function ScreenHeader({ title, onBack, right, divider = true }: { title?: string; onBack?: () => void; right?: ReactNode; divider?: boolean }) {
  return (
    <div className={`sticky top-0 z-10 flex items-center gap-1 bg-white pb-2 pt-3 pr-4 ${divider ? "border-b border-[#F0F0F0]" : ""} ${onBack ? "pl-4" : "pl-6"}`}>
      {onBack && (
        <button onClick={onBack} aria-label="Back" className={ICON_BTN}>
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <div className="min-w-0 flex-1 leading-tight">
        {title && <h1 className="font-display text-[20px] font-bold text-ink">{title}</h1>}
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
      <h1 className="mt-1 text-center font-display text-[17px] font-bold text-ink">{title}</h1>
    </div>
  );
}

export function SectionTitle({ children, action, tone = "bg-ink/70", dot = false, small = false }: { children: ReactNode; action?: ReactNode; tone?: string; dot?: boolean; small?: boolean }) {
  return (
    <div className="flex items-center justify-between px-6">
      <div className="flex items-center gap-2.5">
        {dot && <span className={`h-2 w-2 rounded-full ${tone}`} />}
        <h2 className={`${small ? "text-[15px]" : "text-[19px]"} font-display font-bold text-ink`}>{children}</h2>
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
  // breached / last two minutes: danger red; at risk: brand orange; otherwise on time: success green
  if (left <= 2) return { color: "#EF4444", label: left < 0 ? "over" : "left", text: "text-danger" };
  if (left / total < 0.35) return { color: "#F59E0B", label: "left", text: "text-warning" };
  return { color: "#22C55E", label: "left", text: "text-success" };
}

/** live SLA clock for task cards: counts down, turns red and counts up once breached */
export function SlaClockChip({ left, total }: { left: number; total: number }) {
  useClock();
  const secs = secsFromMinutes(left);
  const tone = slaTone(secs / 60, total);
  return (
    <span className="inline-flex shrink-0 whitespace-nowrap text-[12px] font-bold tabular-nums" style={{ color: tone.color }}>
      {formatClock(secs)}
    </span>
  );
}

export function SlaCountdown({ left, total, compact }: { left: number; total: number; compact?: boolean }) {
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
  if (compact) {
    return (
      <span className="shrink-0 text-[13px] font-semibold tabular-nums" style={{ color: tone.color }}>
        {over ? "-" : ""}{String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-[17px] font-semibold tabular-nums" style={{ color: tone.color }}>
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

/** borderless status / label text shown beside the room */
export type CardFlag = { label: string; tone: string };

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  Open: { bg: "#EFF6FF", color: "#3B82F6" },
  "In Progress": { bg: "#FFF7ED", color: "#EA580C" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  Completed: { bg: "#F0FDF4", color: "#16A34A" },
};

/**
 * Task card: department icon on the left; task name with its status badge on top, the room
 * (and any flags) beneath, then the live SLA timer and assignee. Completed cards are greyed out.
 */
export function TaskCard({
  room,
  dept,
  note,
  staff,
  by,
  left,
  total,
  badge,
  flags = [],
  footer,
  meta,
  onClick,
  done,
}: {
  room: string;
  /** department the task belongs to — drives the icon on the left */
  dept?: string;
  note: string;
  /** assignee: a name, or null for "Unassigned"; leave undefined to hide the slot */
  staff?: string | null;
  /** "Assigned by …" shown in the assignee slot when there is no assignee (Line Staff) */
  by?: string;
  left?: number;
  total?: number;
  /** status pill at the top right: Open, In Progress, Pending, Completed */
  badge?: string;
  flags?: CardFlag[];
  footer?: ReactNode;
  meta?: ReactNode;
  onClick?: () => void;
  done?: boolean;
}) {
  const DeptIcon = deptIcon(dept ?? "Housekeeping");
  const pill = badge ? BADGE_STYLE[badge] ?? { bg: "#F5F5F5", color: "#6B7280" } : undefined;
  const showSla = done || (left !== undefined && total !== undefined);
  const showWho = staff !== undefined || !!by;
  return (
    <div className={`relative rounded-[18px] border border-[#F0F0F0] px-3.5 py-3 ${done ? "bg-[#FAFAFA]" : "bg-white shadow-card"}`}>
      <div onClick={onClick} role={onClick ? "button" : undefined} className={`flex items-center gap-3 ${onClick ? "cursor-pointer active:scale-[0.99]" : ""}`}>
        <span className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${done ? "bg-subtle text-ink-tertiary" : "bg-brand-tint text-brand"}`}>
          <DeptIcon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className={`text-[14px] font-semibold leading-snug ${done ? "text-ink-secondary" : "text-ink"}`}>{note}</div>
            {done ? (
              <span className="mt-[3px] shrink-0 text-[11px] font-bold text-ink-tertiary">Completed</span>
            ) : (
              pill && <span className="mt-px shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-bold" style={{ background: pill.bg, color: pill.color }}>{badge}</span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px]">
            <span className="flex items-center gap-1 text-ink-tertiary">
              {/^Room\s/i.test(room) ? <><DoorOpen className="h-3.5 w-3.5" />{room.replace(/^Room\s+/i, "")}</> : room}
            </span>
            {flags.map((f) => <span key={f.label} className={f.tone}>{f.label}</span>)}
          </div>
          {meta && <div className="mt-1 text-[12px] text-ink-tertiary">{meta}</div>}
          {(showSla || showWho) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[12px]">
              {done ? <span className="font-bold text-ink-tertiary">SLA met</span> : left !== undefined && total !== undefined ? <SlaClockChip left={left} total={total} /> : null}
              {staff !== undefined ? (
                staff ? <span className="text-ink-tertiary">· {staff.split(" ")[0]}</span> : <span className="font-semibold text-brand">· Unassigned</span>
              ) : by ? (
                <span className="text-ink-tertiary">· {by}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {footer && <div className="mt-2.5 border-t border-line pt-2.5">{footer}</div>}
    </div>
  );
}

/** the four home cards: icon tile, label, big value and a coloured one-line detail */
export function HomeStat({
  icon: Icon, label, value, sub, subTone = "text-brand", onClick,
}: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: number | string; sub: string; subTone?: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className={`flex h-full flex-col items-start rounded-[18px] border border-[#F0F0F0] bg-white p-4 text-left shadow-card ${onClick ? "active:scale-[0.98]" : "cursor-default"}`}>
      <span className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-tint text-brand">
        <Icon className="h-[15px] w-[15px]" />
      </span>
      <span className="mb-1 text-[12px] font-medium text-ink-secondary">{label}</span>
      <span className="font-display text-[22px] font-bold leading-none text-ink">{value}</span>
      <span className={`mt-1 text-[12px] font-semibold ${subTone}`}>{sub}</span>
    </button>
  );
}

export function StatCard({ label, value, tone = "text-ink", onClick, hint, hintTone = "text-ink-tertiary", calm = false }: { label: string; value: number | string; tone?: string; onClick?: () => void; hint?: string; hintTone?: string; /** lighter weights for manager home */ calm?: boolean }) {
  return (
    <button onClick={onClick} className={`flex h-full flex-col items-start justify-start rounded-2xl border border-line bg-white p-3.5 text-left shadow-card ${calm ? "min-h-[95px]" : ""} ${onClick ? "active:scale-[0.98]" : "cursor-default"}`}>
      <div className={`font-display text-[26px] leading-none ${calm ? "font-semibold" : "font-bold"} ${tone}`}>{value}</div>
      <div className={`mt-1.5 text-ink-secondary ${calm ? "text-[11px] font-normal" : "text-[12px] font-medium"}`}>{label}</div>
      {hint && <div className={`mt-0.5 text-[11px] font-medium ${hintTone}`}>{hint}</div>}
    </button>
  );
}

export function Avatar({ name, size = 40, tone = "bg-brand-tint text-brand" }: { name: string; size?: number; tone?: string }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full font-display text-[12px] font-semibold ${tone}`} style={{ width: size, height: size }}>
      {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
    </span>
  );
}

/* ---------- flat chat list row: no card, no elevation ---------- */

const CHAT_TIMES = ["19:45", "19:12", "18:30", "17:05", "15:48", "Yesterday", "Mon"];
/** demo unread counts so the badge shows on a few chats */
export const sampleUnread = (name: string) => [2, 0, 1, 0, 0, 3][name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 6];
export const chatTime = (name: string) => CHAT_TIMES[name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % CHAT_TIMES.length];

export type ChatStatus = "Active" | "Pending" | "Pre-Arrival" | "Resolved";
const CHAT_STATUS_STYLE: Record<ChatStatus, { bg: string; color: string }> = {
  Active: { bg: "#FFF4F0", color: "#E8623A" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  "Pre-Arrival": { bg: "#EFF6FF", color: "#2563EB" },
  Resolved: { bg: "#F5F5F5", color: "#9CA3AF" },
};

export function ChatRow({
  name, room, roomType, preview, unread = 0, tone = "bg-subtle text-ink-secondary", complaint = false, plain = false, status, onOpen, onAvatar,
}: {
  name: string; room: string; roomType?: string; preview: string; unread?: number; tone?: string; complaint?: boolean; plain?: boolean; status?: ChatStatus; onOpen: () => void; onAvatar?: () => void;
}) {
  const body = (
    <>
      <span className="min-w-0 flex-1 leading-tight">
        <span className={`block truncate text-[14px] text-ink ${unread > 0 ? "font-bold" : "font-semibold"}`}>{name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-normal text-ink-tertiary">
          <span className="flex items-center gap-1">
            {/^Room\s/i.test(room) ? <><DoorOpen className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{room.replace(/^Room\s+/i, "")}{roomType ? ` · ${roomType}` : ""}</span></> : room}
          </span>
          {status && (
            <span className="rounded-full px-[7px] py-px text-[10px] font-semibold" style={{ background: CHAT_STATUS_STYLE[status].bg, color: CHAT_STATUS_STYLE[status].color }}>{status}</span>
          )}
        </span>
        <span className={`mt-0.5 block truncate text-[13px] ${unread > 0 ? "font-medium text-ink" : "font-normal text-ink-secondary"}`}>{preview}</span>
      </span>
      {!plain && (
        <span className="flex shrink-0 flex-col items-end justify-between gap-1.5 self-stretch py-0.5">
          <span className="text-[11px] font-normal text-ink-tertiary">{chatTime(name)}</span>
          <span className="flex h-2.5 items-center">
            {unread > 0 && <span aria-label="Unread" className="h-2.5 w-2.5 rounded-full bg-brand" />}
          </span>
        </span>
      )}
    </>
  );
  // complaint marker sits on the avatar's bottom-right corner
  const avatar = (
    <span className="relative block">
      <Avatar name={name} size={52} tone={tone} />
      {complaint && (
        <span className="absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white">
          <AlertCircle aria-label="Complaint" className="h-[20px] w-[20px] text-red-500" />
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

/** flat list row for people (team, guests): avatar, name, a detail line and a small right-hand label */
export function PersonRow({
  name, sub, detail, right, tone, onOpen,
}: {
  name: string; sub?: ReactNode; detail?: string; right?: ReactNode; tone?: string; onOpen: () => void;
}) {
  return (
    <button onClick={onOpen} className="flex w-full items-center gap-3.5 border-b border-[#EEEEF1] py-5 text-left last:border-b-0">
      <Avatar name={name} size={52} tone={tone} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block truncate text-[14px] font-semibold text-ink">{name}</span>
        {sub && <span className="mt-0.5 flex items-center gap-1 text-[11px] font-normal text-ink-tertiary">{sub}</span>}
        {detail && <span className="mt-0.5 block truncate text-[13px] font-normal text-ink-secondary">{detail}</span>}
      </span>
      {right && <span className="shrink-0 self-start pt-0.5 text-[12px] font-medium">{right}</span>}
    </button>
  );
}

/** the one search bar used on every phone screen */
export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-[#DAD7CF] bg-white pl-10 pr-3 text-[14px] outline-none placeholder:text-ink-tertiary focus:border-brand"
      />
    </div>
  );
}

/** notification row, same format as the web bell: coloured label + time, task name, then the room / context */
export function NotifRow({ label, tone, time, task, sub, unread, onOpen }: { label: string; tone: string; time: string; task: string; sub: string; unread?: boolean; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex w-full items-start gap-3 border-b border-[#EEEEF1] py-4 text-left last:border-b-0">
      <span className="min-w-0 flex-1">
        <span className="block text-[12px]">
          <span className={`font-semibold ${tone}`}>{label}</span>
          <span className="text-ink-tertiary"> · {time}</span>
        </span>
        <span className={`mt-1 block text-[15px] text-ink ${unread ? "font-semibold" : "font-medium"}`}>{task}</span>
        <span className="mt-0.5 block text-[13px] text-ink-secondary">{sub}</span>
      </span>
      {unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />}
    </button>
  );
}

/* ---------- controls ---------- */

export function Chips<T extends string>({ items, active, onChange, counts, flat: _flat = false }: { items: readonly T[]; active: T; onChange: (v: T) => void; counts?: Partial<Record<T, number>>; flat?: boolean }) {
  return (
    <div className="no-scrollbar -mx-0 flex gap-2 overflow-x-auto px-6 pb-1">
      {items.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold ${active === c ? "bg-brand text-white" : "bg-subtle text-ink-secondary"}`}
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
    <div className="flex rounded-2xl border border-[#F0F0F0] bg-white p-1">
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

/** the manual task form, same fields and rules as the web New task dialog */
export function ManualTaskFields({
  guest, onGuest, room, onRoom, title, onTitle, dept, onDept, details, onDetails,
}: {
  guest: string; onGuest: (v: string) => void;
  room: string; onRoom: (v: string) => void;
  title: string; onTitle: (v: string) => void;
  dept: string; onDept: (v: string) => void;
  details: string; onDetails: (v: string) => void;
}) {
  return (
    <>
      <Label>Guest (optional)</Label>
      <TextField value={guest} onChange={onGuest} placeholder="Guest name" />
      <Label>Room (optional)</Label>
      <TextField value={room} onChange={onRoom} placeholder="e.g. 1608" />
      <Label>What needs to be done? *</Label>
      <TextField value={title} onChange={onTitle} placeholder="e.g. Extra pillows, AC check, airport pickup" />
      <Label>Department</Label>
      <SelectField value={dept} onChange={(v) => v && onDept(v)} placeholder="Select department" options={TASK_DEPTS} />
      <Label>Details (optional)</Label>
      <TextField rows={4} value={details} onChange={onDetails} placeholder="Anything the team should know…" />
    </>
  );
}

/* ---------- sheet ---------- */

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-40">
      <button className="absolute inset-0 bg-ink/45" onClick={onClose} aria-label="Dismiss" />
      <div className="absolute inset-x-0 bottom-0 max-h-[86%] overflow-y-auto rounded-t-[28px] bg-white p-6 pb-7 shadow-2xl no-scrollbar">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#DADADA]" />
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[22px] font-bold text-ink">{title}</h3>
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
  showLabels = true,
}: {
  items: NavItem<K>[];
  active: K;
  onChange: (k: K) => void;
  fab?: { icon: React.ComponentType<{ className?: string }>; onClick: () => void; label: string };
  /** When false, the active item is only a highlighted icon. */
  showLabels?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
      <div className="pointer-events-auto flex items-end justify-around border-t border-line bg-white px-2 pb-3.5 pt-2">
        {items.map((it) => {
          const on = it.key === active;
          return (
            <button
              key={it.key}
              aria-label={it.label}
              aria-current={on ? "page" : undefined}
              onClick={() => onChange(it.key)}
              className={`relative flex flex-col items-center justify-center transition-colors duration-200 ${
                showLabels ? "min-h-11 flex-1 gap-0.5 px-1 py-1" : "h-11 w-11"
              } ${on ? "text-brand" : "text-ink-tertiary"}`}
            >
              <it.icon className="h-[22px] w-[22px]" />
              {showLabels && <span className="text-[10px] font-semibold leading-none">{it.label}</span>}
              {on && <span aria-hidden className="mt-0.5 h-1 w-1 rounded-full bg-brand" />}
              {!!it.badge && !on && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{it.badge}</span>
              )}
            </button>
          );
        })}
      </div>
      {fab && (
        <button
          onClick={fab.onClick}
          aria-label={fab.label}
          className="pointer-events-auto absolute bottom-[84px] right-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_3px_10px_rgba(232,98,58,0.22)] active:scale-95"
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
      className="absolute bottom-5 right-5 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_3px_10px_rgba(232,98,58,0.22)] active:scale-95"
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
