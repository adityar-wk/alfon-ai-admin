import { Calendar, ChevronDown } from "lucide-react";

export const fmtShortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** the top bar's date — shows which day's data you're viewing; informational only, not a control */
export function DatePicker({ date }: { date: Date }) {
  return (
    <span className="hidden items-center gap-1.5 text-sm font-medium text-ink sm:flex">
      <Calendar className="h-3.5 w-3.5 text-ink-tertiary" /> {fmtShortDate(date)}
      <ChevronDown className="h-3.5 w-3.5 text-ink-tertiary" />
    </span>
  );
}
