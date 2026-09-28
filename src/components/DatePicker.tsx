import { useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { APP_TODAY } from "../dateContext";

export const fmtShortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const sameDay = (a: Date, y: number, m: number, day: number) => a.getFullYear() === y && a.getMonth() === m && a.getDate() === day;

/** the top bar's date pill: pick which day's data you're looking at */
export function DatePicker({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(date.getMonth());
  const [year, setYear] = useState(date.getFullYear());
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isToday = sameDay(date, APP_TODAY.getFullYear(), APP_TODAY.getMonth(), APP_TODAY.getDate());

  const stepMonth = (dir: 1 | -1) =>
    setMonth((m) => {
      if (dir === -1 && m === 0) { setYear((y) => y - 1); return 11; }
      if (dir === 1 && m === 11) { setYear((y) => y + 1); return 0; }
      return m + dir;
    });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Pick a date"
        aria-expanded={open}
        className={`flex h-9 items-center gap-2 rounded-control border bg-white px-3 text-[13px] font-medium ${open ? "border-brand text-ink" : "border-line text-ink-secondary"}`}
      >
        <Calendar className="h-4 w-4 text-ink-tertiary" /> {fmtShortDate(date)}
        <ChevronDown className={`h-3.5 w-3.5 text-ink-tertiary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <button aria-label="Close" className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-20 w-[280px] rounded-xl border border-line bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <button aria-label="Previous month" onClick={() => stepMonth(-1)} className="rounded-md p-1 text-ink-secondary hover:bg-subtle"><ChevronLeft className="h-4 w-4" /></button>
              <span className="text-[13px] font-semibold text-ink">{first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              <button aria-label="Next month" onClick={() => stepMonth(1)} className="rounded-md p-1 text-ink-secondary hover:bg-subtle"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-7 text-center text-[11px] text-ink-tertiary">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d} className="py-1">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {cells.map((d, i) => {
                if (d === null) return <span key={`b${i}`} />;
                const selected = sameDay(date, year, month, d);
                const today = sameDay(APP_TODAY, year, month, d);
                return (
                  <button
                    key={d}
                    onClick={() => { onChange(new Date(year, month, d)); setOpen(false); }}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] ${
                      selected ? "bg-brand font-semibold text-white" : today ? "font-semibold text-brand ring-1 ring-brand/40 hover:bg-brand-tint" : "font-medium text-ink hover:bg-subtle"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            {!isToday && (
              <button
                onClick={() => { onChange(APP_TODAY); setMonth(APP_TODAY.getMonth()); setYear(APP_TODAY.getFullYear()); setOpen(false); }}
                className="mt-2.5 w-full rounded-lg border border-line py-1.5 text-[12px] font-medium text-brand hover:bg-brand-tint"
              >
                Jump to today
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
