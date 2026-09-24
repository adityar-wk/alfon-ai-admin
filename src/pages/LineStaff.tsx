import { useState } from "react";
import { Check, X } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { LineStaffPrototype } from "../linestaff/screens";
import { ManagerPrototype } from "../linestaff/manager";

type Tab = "line" | "manager";

const TABS: { key: Tab; label: string }[] = [
  { key: "line", label: "Line Staff" },
  { key: "manager", label: "Mid Manager" },
];

const INFO: Record<Tab, { title: string; blurb: string; flows: string[]; included: string[]; excluded: string[] }> = {
  line: {
    title: "Line Staff",
    blurb: "On-the-floor app for housekeeping and other line staff — do the next task, ask for help, create a manual task.",
    flows: [
      "Home is the whole app: In progress, Pending and Completed tasks in one list",
      "Each card shows the task name first, the room second and the SLA timer",
      "Pending cards have ✕ Reject and Accept inside the card",
      "Tap a card → Task details (task, room and guest details)",
      "Task details → Need help (escalate to your supervisor) or Mark complete",
      "Bell → Notifications",
      "Orange + button (bottom right) → Create Manual Task (department, service, room, optional details)",
      "Availability toggle: Available / Off work",
    ],
    included: ["SLA timer on every task", "Room, guest and preference details", "Escalate to supervisor when blocked", "Manual task creation"],
    excluded: ["Team and analytics views", "Reassigning work to others"],
  },
  manager: {
    title: "Mid Manager · Department Head",
    blurb: "Handles department exceptions, escalations and operational control — scoped to one department by default.",
    flows: [
      "Home: department operations, escalations, complaints, unassigned critical, supervisor attention",
      "Escalations: filter by SLA breach, SLA at risk, complaint, unable to complete, staffing, supervisor escalation, high priority — sorted by urgency (SLA risk lives here, with where each task is stuck)",
      "Escalated Task: reason, previous actions, SLA history, related requests, notes",
      "Intervene: reassign, add support, change status, unable, close / override, management note",
      "Escalation review: send back with instruction, take ownership, route to another department, escalate to the Duty Manager",
      "+ button → Create Manual Task for the department (service, room, optional details)",
      "Team: staff workload and overloaded flags, unassigned tasks, supervisor availability",
      "Complaint: sentiment / risk, take over the chat (pause AI, reply, hand back)",
    ],
    included: ["Department-only scope", "Reasons required for unable / override / GM escalation"],
    excluded: ["Department analytics and SLA trend charts", "Staff performance and Hotel Health Score drill-down", "Reports, SLA / department / role / knowledge-base configuration"],
  },
};

export default function LineStaff() {
  const [tab, setTab] = useState<Tab>("line");
  const info = INFO[tab];

  return (
    <>
      <Topbar title="Mobile App" />
      <main className="flex-1 overflow-y-auto bg-subtle/40">
        <div className="mx-auto max-w-[1180px] px-6 py-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-ink">Mobile Experience</h1>
            <span className="rounded-full bg-brand-tint px-2.5 py-1 text-[11px] font-semibold text-brand">Interactive prototype</span>
          </div>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-secondary">Each role has its own mobile screens. Everything in the phone is clickable.</p>

          <div className="mt-5 flex gap-6 border-b border-line">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px border-b-2 pb-3 text-[14px] font-medium ${tab === t.key ? "border-brand text-brand" : "border-transparent text-ink-secondary hover:text-ink"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[auto_1fr] lg:items-start">
            {/* remount on tab change so each phone starts fresh */}
            {tab === "line" && <LineStaffPrototype />}
            {tab === "manager" && <ManagerPrototype />}

            <div className="space-y-5">
              <div className="rounded-card border border-line bg-white p-5">
                <h3 className="text-[16px] font-semibold text-ink">{info.title}</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">{info.blurb}</p>
              </div>

              <div className="rounded-card border border-line bg-white p-5">
                <h3 className="text-[14px] font-semibold text-ink">Screens &amp; flows</h3>
                <ul className="mt-3 space-y-2.5">
                  {info.flows.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <span className="text-ink-secondary">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-card border border-line bg-white p-5">
                  <h3 className="text-[14px] font-semibold text-ink">Also included</h3>
                  <ul className="mt-3 space-y-2">
                    {info.included.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[12px] text-ink-secondary"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-card border border-line bg-white p-5">
                  <h3 className="text-[14px] font-semibold text-ink">Not on mobile</h3>
                  <ul className="mt-3 space-y-2">
                    {info.excluded.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[12px] text-ink-secondary"><X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-tertiary" />{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
