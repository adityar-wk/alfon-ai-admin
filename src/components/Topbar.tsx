import { ArrowLeft, MessageSquare, Plus } from "lucide-react";
import { NotificationBell } from "./Notifications";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui";
import { DatePicker } from "./DatePicker";
import { useSelectedDate } from "../dateContext";
import { GlobalSearch } from "./GlobalSearch";
import { usePersona } from "../persona";

/** shows which day's data you're viewing (informational only) + a shortcut to start a guest chat; shown on every screen except where told not to. "New Task" only joins it on the Tasks page. */
function QuickActions({ newTask = false }: { newTask?: boolean }) {
  const navigate = useNavigate();
  const { date } = useSelectedDate();
  return (
    <div className="flex items-center gap-3">
      <DatePicker date={date} />
      <Button onClick={() => navigate("/guest-chats?new=1")}>
        <MessageSquare className="h-4 w-4" /> New Chat
      </Button>
      {newTask && (
        <Button onClick={() => navigate("/tasks?new=1")}>
          <Plus className="h-4 w-4" /> Create task
        </Button>
      )}
    </div>
  );
}

export function DefaultTopbarActions() {
  return (
    <div className="flex items-center gap-3">
      <NotificationBell />
    </div>
  );
}

export function Topbar({
  title,
  subtitle,
  showSearch = true,
  actions,
  backTo,
  hideQuickActions = false,
  newTask = false,
}: {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  actions?: ReactNode;
  backTo?: string;
  /** hide the date + New Chat shortcut (Pre-Arrival has its own date-driven filter instead) */
  hideQuickActions?: boolean;
  /** also show "New Task" next to New Chat — the Tasks page only */
  newTask?: boolean;
}) {
  const { persona } = usePersona();
  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b border-line bg-white px-8">
      {backTo && (
        <Link
          to={backTo}
          aria-label="Back"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-subtle hover:text-ink"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
      )}
      {title && (
        <div className="min-w-0 leading-tight">
          <h1 className={`truncate font-display font-medium text-ink ${subtitle ? "text-[16px]" : "text-[15px]"}`}>{title}</h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-ink-tertiary">{subtitle}</p>
          )}
        </div>
      )}
      {showSearch && persona !== "altprototype" ? (
        <div className="flex flex-1 justify-center">
          <GlobalSearch />
        </div>
      ) : null}
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {actions}
        {!hideQuickActions && <QuickActions newTask={newTask} />}
        <DefaultTopbarActions />
      </div>
    </header>
  );
}
