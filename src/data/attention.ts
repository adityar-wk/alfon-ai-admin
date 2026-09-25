import { useEffect, useState } from "react";
import type { Task } from "./tasks";

/**
 * The single status a task reads as, on every list (General Manager and Mid Manager alike):
 * escalation first, then SLA breach, then SLA at risk, then where the work stands.
 * Tags such as "Complaint" are not statuses; they sit next to the task name.
 */
export type TaskStatusLabel =
  | "Escalated"
  | "SLA breached"
  | "SLA at risk"
  | "In Progress"
  | "Assigned"
  | "Pending"
  | "Completed"
  | "Unable to Complete"
  | "Void";

export function taskStatus(t: Pick<Task, "status" | "owner" | "sla">): TaskStatusLabel {
  if (t.status === "Completed" || t.status === "Unable to Complete" || t.status === "Void") return t.status;
  if (t.status === "Escalated") return "Escalated";
  const secs = slaSecs(t.sla);
  if (t.sla.kind === "overdue" || (secs !== null && secs < 0)) return "SLA breached";
  if (t.sla.kind === "due") return "SLA at risk";
  if (t.status === "In Progress") return "In Progress";
  return t.owner ? "Assigned" : "Pending";
}

/** text colour only, no chip */
export const STATUS_PILL: Record<TaskStatusLabel, string> = {
  Escalated: "text-red-600",
  "SLA breached": "text-orange-600",
  "SLA at risk": "text-amber-600",
  "In Progress": "text-sky-600",
  Assigned: "text-cyan-600",
  Pending: "text-slate-500",
  Completed: "text-emerald-600",
  "Unable to Complete": "text-gray-500",
  Void: "text-gray-400",
};

export const COMPLAINT_PILL = "bg-violet-50 text-violet-600";

/* ---------- live SLA clock ---------- */

const EPOCH = Date.now(); // every list and the task window count from the same moment

const minutesIn = (text: string) => {
  const h = text.match(/(\d+)\s*hr/);
  const m = text.match(/(\d+)\s*min/);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
};

/** seconds left on the SLA right now; negative once breached (and growing). null when no timer is running */
export function slaSecs(sla: Task["sla"]): number | null {
  if (sla.kind === "met") return null;
  const elapsed = Math.floor((Date.now() - EPOCH) / 1000);
  const base = minutesIn(sla.text) * 60;
  return sla.kind === "overdue" ? -(base + elapsed) : base - elapsed;
}

/** live seconds for a task that has `left` minutes on its SLA (negative when already over) */
export function secsFromMinutes(left: number): number {
  const elapsed = Math.floor((Date.now() - EPOCH) / 1000);
  return Math.round(left * 60) - elapsed;
}

/** 4:05, 1:04:05, or -12:34 once breached */
export function formatClock(secs: number): string {
  const abs = Math.abs(secs);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const ss = String(abs % 60).padStart(2, "0");
  const body = h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${String(m).padStart(2, "0")}:${ss}`;
  return secs < 0 ? `-${body}` : body;
}

export function slaLabel(sla: Task["sla"]): string {
  const secs = slaSecs(sla);
  return secs === null ? sla.text : formatClock(secs);
}

/** re-renders the caller every second so SLA clocks tick */
export function useClock() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
}
