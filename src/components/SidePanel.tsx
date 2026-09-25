import type { ReactNode } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

/** the list panel that sits flush against the sidebar (Guests, Guest Chats): one look for both */
export const SIDE_PANEL = "flex shrink-0 flex-col border-r border-line bg-white";
export const SIDE_ROW = "flex border-b border-line/60 px-4 py-3";
export const sideRowTone = (on: boolean) => (on ? "bg-brand-tint/50" : "hover:bg-subtle");

export function SideSearch({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder: string; children?: ReactNode }) {
  return (
    <div className="shrink-0 border-b border-line p-3">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-control border border-line bg-subtle pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand focus:bg-white"
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export function SideFilterButton({ label, active, open, count, onClick }: { label: string; active: boolean; open: boolean; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active || open ? "bg-brand text-white" : "border border-line bg-white text-ink-secondary hover:bg-subtle"}`}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {active && count !== undefined && count > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">{count}</span>}
    </button>
  );
}
