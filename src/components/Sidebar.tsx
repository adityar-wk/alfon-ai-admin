import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  CheckSquare,
  Plane,
  Users,
  BedDouble,
  UserRound,
  Building2,
  BarChart3,
  FileText,
  Settings,
  Smartphone,
  Shapes,
  LayoutDashboard,
  Check,
  ChevronsUpDown,
  MessageSquare,
  Building2 as HotelIcon,
  LayoutTemplate,
  FlaskConical,
} from "lucide-react";
import { Logo } from "./Logo";
import { PERSONAS, usePersona, type PersonaKey } from "../persona";
import { useImpersonation } from "../impersonation";
import { TASKS } from "../data/tasks";

type Item = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  /** also highlight when the current path starts with this */
  match?: string | string[];
};

const GM_NAV: Item[] = [
  { label: "Home", to: "/home", icon: LayoutGrid },
  { label: "Tasks", to: "/tasks", icon: CheckSquare, badge: 15 },
  { label: "Guest Chats", to: "/guest-chats", icon: MessageSquare },
  { label: "Guests", to: "/guests", icon: UserRound },
  { label: "Pre-Arrival", to: "/pre-arrival", icon: Plane, badge: 2 },
  { label: "Housekeeping", to: "/housekeeping", icon: BedDouble },
  { label: "Team", to: "/team", icon: Users, match: "/team" },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Settings", to: "/onboarding", icon: Settings, match: ["/settings", "/departments"] },
  { label: "Mobile App", to: "/line-staff", icon: Smartphone },
  { label: "Component Design", to: "/components", icon: Shapes },
];

const MID_NAV: Item[] = [
  { label: "Home", to: "/department", icon: LayoutDashboard },
  { label: "Tasks", to: "/tasks", icon: CheckSquare },
  { label: "Guest Chats", to: "/guest-chats", icon: MessageSquare },
  { label: "Guests", to: "/guests", icon: UserRound },
  { label: "Housekeeping", to: "/housekeeping", icon: BedDouble },
  { label: "Team", to: "/team", icon: Users },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Mobile App", to: "/line-staff", icon: Smartphone },
];

/** Super Admin's own app: adds and watches hotels, never does hotel work itself */
const SUPERADMIN_NAV: Item[] = [
  { label: "Hotels", to: "/admin/hotels", icon: HotelIcon, match: "/admin/hotels" },
  { label: "Department Templates", to: "/admin/department-templates", icon: LayoutTemplate, match: "/admin/department-templates" },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

/** Alt Prototype's own app: just the one reference page */
const ALT_PROTOTYPE_NAV: Item[] = [
  { label: "Alt Prototype", to: "/alt-prototype", icon: FlaskConical },
];

export function Sidebar() {
  const { persona, setPersona, me, manager, inScope } = usePersona();
  const { hotel: steppedInto } = useImpersonation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav =
    persona === "superadmin"
      ? SUPERADMIN_NAV
      : persona === "altprototype"
        ? ALT_PROTOTYPE_NAV
        : manager
          ? MID_NAV.filter((i) => i.label !== "Housekeeping" || me.depts.includes("Housekeeping"))
          : GM_NAV;
  const escalated = TASKS.filter((t) => t.status === "Escalated" && inScope(t.dept)).length;

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const choose = (k: PersonaKey) => {
    setOpen(false);
    if (k === persona) return;
    setPersona(k);
    navigate(PERSONAS[k].home);
  };

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-line bg-white">
      <div className="flex items-center justify-center border-b border-subtle px-4 pb-6 pt-7">
        <div className="flex h-[42px] w-[176px] items-center overflow-hidden">
          <Logo className="-ml-[1.5px] h-5 w-auto shrink-0 -translate-y-0.5" />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 no-scrollbar">
        {nav.map(({ label, to, icon: Icon, badge, match }) => {
          const forced = !!match && (Array.isArray(match) ? match : [match]).some((m) => pathname.startsWith(m));
          const count = manager && label === "Tasks" ? escalated : badge;
          return (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-left transition-all duration-200 hover:-translate-y-px",
                  isActive || forced ? "bg-brand-tint" : "bg-transparent hover:bg-brand-tint",
                ].join(" ")
              }
            >
              {({ isActive }) => {
                const on = isActive || forced;
                return (
                  <>
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${on ? "text-brand" : "text-ink-tertiary"}`} />
                    <span className={`flex-1 text-sm ${on ? "font-semibold text-brand" : "font-medium text-ink-secondary"}`}>{label}</span>
                    {count != null && (
                      <span
                        className={`min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-4 ${
                          on ? "bg-brand text-white" : "bg-subtle text-ink-secondary"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </nav>

      <div ref={ref} className="relative border-t border-line px-2.5 py-2.5">
        {open && (
          <div className="absolute bottom-[calc(100%-4px)] left-3 right-3 z-40 rounded-xl border border-line bg-white p-1.5 shadow-lg">
            <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Switch persona</div>
            {(Object.keys(PERSONAS) as PersonaKey[]).map((k) => {
              const p = PERSONAS[k];
              return (
                <button
                  key={k}
                  onClick={() => choose(k)}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-subtle"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-semibold text-brand">
                    {p.initials}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[13px] font-semibold text-ink">{p.role}</span>
                    <span className="block text-[11px] text-ink-secondary">{p.name}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-tertiary">{p.blurb}</span>
                  </span>
                  {k === persona && <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />}
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => !steppedInto && setOpen((o) => !o)}
          disabled={!!steppedInto}
          title={steppedInto ? "Leave the hotel first to switch persona" : undefined}
          aria-label="Switch persona"
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint font-display text-xs font-semibold text-brand">
            {me.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{me.name}</div>
            <div className="truncate text-xs text-ink-secondary">{me.role}</div>
          </div>
          {!steppedInto && <ChevronsUpDown className="h-4 w-4 text-ink-tertiary" />}
        </button>
      </div>
    </aside>
  );
}
