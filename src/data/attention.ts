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
  if (t.sla.kind === "overdue") return "SLA breached";
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

/** "Overdue 12 min" reads "-12 min"; "Due in 4 min" and "22 min left" read "4 min" and "22 min" */
export const slaShort = (text: string) => text.replace(/^Overdue\s+/, "-").replace(/^Due in\s+/, "").replace(/\s+left$/, "");
