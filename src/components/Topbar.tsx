import { Search, Bell, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function SearchBar({ placeholder = "Search anything..." }: { placeholder?: string }) {
  return (
    <div className="relative hidden max-w-[440px] flex-1 md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
      <input
        readOnly
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-line bg-subtle pl-9 pr-12 text-[13px] text-ink-secondary outline-none placeholder:text-ink-tertiary focus:border-brand"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-line bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink-tertiary">
        ⌘K
      </kbd>
    </div>
  );
}

export function DefaultTopbarActions() {
  return (
    <div className="flex items-center gap-3">
      <button className="relative rounded-lg p-2 text-ink-secondary hover:bg-subtle">
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" />
      </button>
    </div>
  );
}

export function Topbar({
  title,
  subtitle,
  showSearch = true,
  searchPlaceholder,
  actions,
  backTo,
}: {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  actions?: ReactNode;
  backTo?: string;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-6 border-b border-line bg-white px-6">
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
          <h1 className="truncate text-[19px] font-semibold text-ink">{title}</h1>
          {subtitle && (
            <p className="truncate text-[13px] text-ink-secondary">{subtitle}</p>
          )}
        </div>
      )}
      {showSearch && (
        <div className="flex flex-1 justify-center">
          <SearchBar placeholder={searchPlaceholder} />
        </div>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {actions}
        <DefaultTopbarActions />
      </div>
    </header>
  );
}
