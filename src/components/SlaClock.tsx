import { Clock } from "lucide-react";
import type { Task } from "../data/tasks";
import { slaSecs, formatClock } from "../data/attention";

/** live SLA countdown; once breached it turns red and counts up. Callers should run useClock(). */
export function SlaClock({ sla, className = "" }: { sla: Task["sla"]; className?: string }) {
  const secs = slaSecs(sla);
  if (secs === null)
    return <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[12px] text-ink-secondary ${className}`}><Clock className="h-3.5 w-3.5" /> {sla.text}</span>;
  const tone = secs < 0 ? "text-red-600" : sla.kind === "due" ? "text-brand" : "text-ink-secondary";
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[13px] font-medium tabular-nums ${tone} ${className}`}>
      <Clock className="h-3.5 w-3.5" />
      <span style={{ fontFamily: '"Poppins", "Sora", "Inter", sans-serif' }}>{formatClock(secs)}</span>
    </span>
  );
}
