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
  ClipboardList,
  Settings,
  Smartphone,
  LayoutDashboard,
  Check,
  ChevronsUpDown,
  MessageSquare,
} from "lucide-react";
import { Logo } from "./Logo";
import { PERSONAS, usePersona, type PersonaKey } from "../persona";
import { TASKS } from "../data/tasks";

type Item = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  /** also highlight when the current path starts with this */
  match?: string;
};

const GM_NAV: Item[] = [
  { label: "Home", to: "/home", icon: LayoutGrid },
  { label: "Tasks", to: "/tasks", icon: CheckSquare, badge: 15 },
  { label: "Pre-Arrival", to: "/pre-arrival", icon: Plane, badge: 2 },
  { label: "Team", to: "/team/roles", icon: Users, match: "/team" },
  { label: "Housekeeping", to: "/housekeeping", icon: BedDouble },
  { label: "Guests", to: "/guests", icon: UserRound },
  { label: "Departments", to: "/departments", icon: Building2 },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Onboarding", to: "/onboarding", icon: ClipboardList },
  { label: "Mobile App", to: "/line-staff", icon: Smartphone },
  { label: "Settings", to: "/settings/rooms-qr", icon: Settings },
];

const MID_NAV: Item[] = [
  { label: "Dashboard", to: "/department", icon: LayoutDashboard },
  { label: "Tasks", to: "/tasks", icon: CheckSquare },
  { label: "Pre-Arrival", to: "/pre-arrival", icon: Plane },
  { label: "Team", to: "/team", icon: Users },
  { label: "Housekeeping", to: "/housekeeping", icon: BedDouble },
  { label: "Guests", to: "/guests", icon: UserRound },
  { label: "Guest Communication", to: "/guest-communication", icon: MessageSquare },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Reports", to: "/reports", icon: FileText },
];

export function Sidebar() {
  const { persona, setPersona, me, manager, inScope } = usePersona();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nav = manager
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
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-line bg-white">
      <div className="px-6 pb-6 pt-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 no-scrollbar">
        {nav.map(({ label, to, icon: Icon, badge, match }) => {
          const forced = !!match && pathname.startsWith(match);
          const count = manager && label === "Tasks" ? escalated : badge;
          return (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive || forced ? "bg-brand-tint text-brand" : "text-ink-secondary hover:bg-subtle hover:text-ink",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="flex-1">{label}</span>
                  {count != null && (
                    <span className={["text-xs", isActive || forced ? "text-brand" : "text-ink-tertiary"].join(" ")}>{count}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div ref={ref} className="relative border-t border-line px-3 py-3">
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
          onClick={() => setOpen((o) => !o)}
          aria-label="Switch persona"
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left hover:bg-subtle"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-brand">
            {me.initials}
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-[13px] font-semibold text-ink">{me.name}</div>
            <div className="text-xs text-ink-secondary">{me.role}</div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-ink-tertiary" />
        </button>
      </div>
    </aside>
  );
}
