import { LogOut } from "lucide-react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ADMIN_PREFIX, MID_BLOCKED, PERSONAS, PersonaProvider, usePersona } from "../persona";
import { DateProvider } from "../dateContext";
import { ImpersonationProvider, useImpersonation } from "../impersonation";

/** stays on screen the whole time Super Admin is stepped into a hotel, so it always knows which hotel it's in */
function ImpersonationBanner() {
  const { hotel, leave } = useImpersonation();
  const { setPersona } = usePersona();
  const navigate = useNavigate();
  if (!hotel) return null;
  return (
    <div className="flex h-9 shrink-0 items-center justify-center gap-3 bg-ink px-4 text-[12px] font-medium text-white">
      <span>You're viewing as Super Admin, inside <b>{hotel}</b>.</span>
      <button
        onClick={() => { leave(); setPersona("superadmin"); navigate("/admin/hotels"); }}
        className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/25"
      >
        <LogOut className="h-3 w-3" /> Leave
      </button>
    </div>
  );
}

function Shell() {
  const { persona, manager, me } = usePersona();
  const { pathname } = useLocation();
  const inAdminApp = pathname === ADMIN_PREFIX || pathname.startsWith(ADMIN_PREFIX + "/");

  // Super Admin lives entirely under /admin — it has no hotel of its own to see
  if (persona === "superadmin" && !inAdminApp) {
    return <Navigate to={PERSONAS.superadmin.home} replace />;
  }
  if (persona !== "superadmin" && inAdminApp) {
    return <Navigate to={me.home} replace />;
  }
  // keep each persona inside the screens it actually has
  if (manager && MID_BLOCKED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return <Navigate to={PERSONAS.mid.home} replace />;
  }
  if (manager && pathname.startsWith("/housekeeping") && !me.depts.includes("Housekeeping")) {
    return <Navigate to={PERSONAS.mid.home} replace />;
  }
  if (persona === "gm" && pathname === "/department") {
    return <Navigate to={PERSONAS.gm.home} replace />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      <ImpersonationBanner />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <PersonaProvider>
      <DateProvider>
        <ImpersonationProvider>
          <Shell />
        </ImpersonationProvider>
      </DateProvider>
    </PersonaProvider>
  );
}
