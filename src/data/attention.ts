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
  | "Unassigned"
  | "Completed"
  | "Unable to Complete"
  | "Void";

export function taskStatus(t: Pick<Task, "status" | "owner" | "sla">): TaskStatusLabel {
  if (t.status === "Completed" || t.status === "Unable to Complete" || t.status === "Void") return t.status;
  if (t.status === "Escalated") return "Escalated";
  if (t.sla.kind === "overdue") return "SLA breached";
  if (t.sla.kind === "due") return "SLA at risk";
  if (t.status === "In Progress") return "In Progress";
  return t.owner ? "Assigned" : "Unassigned";
}

export const STATUS_PILL: Record<TaskStatusLabel, string> = {
  Escalated: "bg-red-100 text-red-700",
  "SLA breached": "bg-orange-100 text-orange-700",
  "SLA at risk": "bg-amber-100 text-amber-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Assigned: "bg-cyan-100 text-cyan-700",
  Unassigned: "bg-slate-100 text-slate-600",
  Completed: "bg-emerald-100 text-emerald-700",
  "Unable to Complete": "bg-gray-100 text-gray-600",
  Void: "bg-gray-100 text-gray-500",
};

export const COMPLAINT_PILL = "bg-violet-100 text-violet-700";

/** "Overdue 12 min" reads "-12 min"; "Due in 4 min" and "22 min left" read "4 min" and "22 min" */
export const slaShort = (text: string) => text.replace(/^Overdue\s+/, "-").replace(/^Due in\s+/, "").replace(/\s+left$/, "");
