import { NavLink } from "react-router-dom";

const STEPS = [
  { label: "Hotel Profile", to: "/onboarding/property" },
  { label: "WhatsApp & PMS", to: "/onboarding/whatsapp-pms" },
  { label: "Knowledge Base", to: "/onboarding/knowledge-base" },
  { label: "Team Members", to: "/onboarding/staff" },
  { label: "Departments", to: "/onboarding/departments" },
  { label: "Roles & Permissions", to: "/onboarding/roles" },
  { label: "SLA & Escalation", to: "/onboarding/sla" },
  { label: "Rooms & QR", to: "/onboarding/rooms-qr" },
  { label: "Notifications", to: "/onboarding/notifications" },
];

/** Horizontal tab strip so any onboarding-step screen can jump directly to another step. */
export function SetupTabs({ className = "" }: { className?: string }) {
  return (
    <div className={`mb-6 flex items-center gap-6 overflow-x-auto border-b border-line no-scrollbar ${className}`}>
      {STEPS.map((s) => (
        <NavLink
          key={s.to}
          to={s.to}
          end
          className={({ isActive }) =>
            [
              "-mb-px shrink-0 whitespace-nowrap border-b-2 pb-3 text-[13px] font-medium transition-colors",
              isActive
                ? "border-brand text-ink font-semibold"
                : "border-transparent text-ink-secondary hover:text-ink",
            ].join(" ")
          }
        >
          {s.label}
        </NavLink>
      ))}
    </div>
  );
}
