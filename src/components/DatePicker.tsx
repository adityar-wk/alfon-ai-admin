import { Calendar } from "lucide-react";

export const fmtShortDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** the top bar's date pill — shows which day's data you're viewing; informational only, not a control */
export function DatePicker({ date }: { date: Date }) {
  return (
    <span className="flex h-9 items-center gap-2 rounded-control border border-line bg-white px-3 text-[13px] font-medium text-ink-secondary">
      <Calendar className="h-4 w-4 text-ink-tertiary" /> {fmtShortDate(date)}
    </span>
  );
}
