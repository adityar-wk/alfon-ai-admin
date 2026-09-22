import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MID_BLOCKED, PERSONAS, PersonaProvider, usePersona } from "../persona";

function Shell() {
  const { manager, me } = usePersona();
  const { pathname } = useLocation();

  // keep each persona inside the screens it actually has
  if (manager && MID_BLOCKED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return <Navigate to={PERSONAS.mid.home} replace />;
  }
  if (manager && pathname.startsWith("/housekeeping") && !me.depts.includes("Housekeeping")) {
    return <Navigate to={PERSONAS.mid.home} replace />;
  }
  if (!manager && pathname === "/team") {
    return <Navigate to="/team/roles" replace />;
  }
  if (!manager && pathname === "/department") {
    return <Navigate to={PERSONAS.gm.home} replace />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <PersonaProvider>
      <Shell />
    </PersonaProvider>
  );
}
