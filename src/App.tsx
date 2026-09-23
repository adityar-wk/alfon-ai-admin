import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import OnboardingOverview from "./pages/OnboardingOverview";
import HotelPropertySetup from "./pages/HotelPropertySetup";
import WhatsAppPmsSetup from "./pages/WhatsAppPmsSetup";
import KnowledgeBaseSetup from "./pages/KnowledgeBaseSetup";
import StaffTeamManagement from "./pages/StaffTeamManagement";
import SlaSetup from "./pages/SlaSetup";
import DepartmentsSetup from "./pages/DepartmentsSetup";
import DepartmentDetail from "./pages/DepartmentDetail";
import NewDepartment from "./pages/NewDepartment";
import RoomsQrSetup from "./pages/RoomsQrSetup";
import Guests from "./pages/Guests";
import PreArrival from "./pages/PreArrival";
import GuestProfile from "./pages/GuestProfile";
import LineStaff from "./pages/LineStaff";
import Team from "./pages/Team";
import RolesPermissions from "./pages/RolesPermissions";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import Tasks from "./pages/Tasks";
import Home from "./pages/Home";
import HousekeepingBoard from "./pages/HousekeepingBoard";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="/home" replace /> },
      { path: "/home", element: <Home /> },
      { path: "/onboarding", element: <OnboardingOverview /> },
      { path: "/onboarding/property", element: <HotelPropertySetup /> },
      { path: "/onboarding/whatsapp-pms", element: <WhatsAppPmsSetup /> },
      { path: "/onboarding/knowledge-base", element: <KnowledgeBaseSetup /> },
      { path: "/onboarding/staff", element: <StaffTeamManagement /> },
      { path: "/onboarding/sla", element: <SlaSetup /> },
      { path: "/onboarding/departments", element: <DepartmentsSetup onboarding /> },
      { path: "/onboarding/rooms-qr", element: <RoomsQrSetup onboarding /> },
      { path: "/tasks", element: <Tasks /> },
      { path: "/team", element: <Team /> },
      { path: "/team/roles", element: <RolesPermissions /> },
      { path: "/housekeeping", element: <HousekeepingBoard /> },
      { path: "/pre-arrival", element: <PreArrival /> },
      { path: "/guests", element: <Guests /> },
      { path: "/guests/:id", element: <GuestProfile /> },
      { path: "/departments", element: <DepartmentsSetup /> },
      { path: "/departments/new", element: <NewDepartment /> },
      { path: "/departments/:slug", element: <DepartmentDetail /> },
      { path: "/settings/rooms-qr", element: <RoomsQrSetup /> },
      { path: "/analytics", element: <Analytics /> },
      { path: "/reports", element: <Reports /> },
      { path: "/department", element: <DepartmentDashboard /> },
      { path: "/line-staff", element: <LineStaff /> },
      { path: "*", element: <Navigate to="/onboarding" replace /> },
    ],
  },
], { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });
