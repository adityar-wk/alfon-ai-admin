import { NavLink } from "react-router-dom";
import { ONBOARDING_STEPS } from "../data/onboarding";

/** Horizontal tab strip so any onboarding-step screen can jump directly to another step. */
export function SetupTabs({ className = "" }: { className?: string }) {
  return (
    <div className={`mb-6 flex items-center gap-6 overflow-x-auto border-b border-line no-scrollbar ${className}`}>
      {ONBOARDING_STEPS.map((s) => (
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
          {s.title}
        </NavLink>
      ))}
    </div>
  );
}
