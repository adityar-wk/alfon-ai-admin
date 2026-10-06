import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, CheckSquare, UserRound, Users, Building2 } from "lucide-react";
import { usePersona } from "../persona";
import { TASKS } from "../data/tasks";
import { GUESTS } from "../data/guests";
import { INITIAL } from "../data/staff";
import { HOTELS } from "../data/hotels";

type Group = "Pages" | "Tasks" | "Guests" | "Team" | "Hotels";
type Hit = { key: string; group: Group; title: string; sub?: string; to: string; icon: ComponentType<{ className?: string }> };

const GM_PAGES: [string, string][] = [
  ["Home", "/home"], ["Tasks", "/tasks"], ["Guest Chats", "/guest-chats"], ["Guests", "/guests"], ["Pre-Arrival", "/pre-arrival"],
  ["Housekeeping", "/housekeeping"], ["Team", "/team"], ["Analytics", "/analytics"], ["Reports", "/reports"], ["Settings", "/onboarding"],
];
const MID_PAGES: [string, string][] = [
  ["Home", "/department"], ["Tasks", "/tasks"], ["Guest Chats", "/guest-chats"], ["Guests", "/guests"], ["Housekeeping", "/housekeeping"],
  ["Team", "/team"], ["Analytics", "/analytics"], ["Reports", "/reports"],
];
const ADMIN_PAGES: [string, string][] = [["Hotels", "/admin/hotels"], ["Department Templates", "/admin/department-templates"], ["Settings", "/admin/settings"], ["Mobile App", "/admin/mobile"]];

const GROUP_ORDER: Group[] = ["Pages", "Tasks", "Guests", "Team", "Hotels"];

/** the top bar's "Search anything…" box: jumps to pages, tasks, guests and team members (⌘K / Ctrl+K focuses it) */
export function GlobalSearch() {
  const navigate = useNavigate();
  const { persona, manager, inScope } = usePersona();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const has = (...v: (string | number | undefined | null)[]) => v.some((x) => String(x ?? "").toLowerCase().includes(s));
    const out: Hit[] = [];
    const pages = persona === "superadmin" ? ADMIN_PAGES : manager ? MID_PAGES : GM_PAGES;
    pages.filter(([label]) => has(label)).forEach(([label, to]) => out.push({ key: `p-${to}`, group: "Pages", title: label, to, icon: LayoutGrid }));
    if (persona === "superadmin") {
      HOTELS.filter((h) => has(h.name, h.location, h.region)).slice(0, 5).forEach((h) =>
        out.push({ key: `h-${h.id}`, group: "Hotels", title: h.name, sub: h.location, to: `/admin/hotels/${h.id}`, icon: Building2 }),
      );
      return out;
    }
    TASKS.filter((t) => inScope(t.dept) && has(t.title, t.guest, t.room, t.dept, t.owner)).slice(0, 5).forEach((t) =>
      out.push({ key: `t-${t.id}`, group: "Tasks", title: t.title, sub: `${t.guest} · Room ${t.room} · ${t.dept}`, to: `/tasks?open=${t.id}`, icon: CheckSquare }),
    );
    GUESTS.filter((g) => has(g.name, g.room, g.roomType)).slice(0, 5).forEach((g) =>
      out.push({ key: `g-${g.id}`, group: "Guests", title: g.name, sub: `Room ${g.room} · ${g.roomType}`, to: `/guests/${g.id}`, icon: UserRound }),
    );
    INITIAL.filter((m) => inScope(m.dept) && has(m.name, m.role, m.dept)).slice(0, 4).forEach((m) =>
      out.push({ key: `s-${m.id}`, group: "Team", title: m.name, sub: `${m.role} · ${m.dept}`, to: "/team", icon: Users }),
    );
    return out;
  }, [q, persona, manager, inScope]);

  const grouped = GROUP_ORDER.map((g) => ({ g, items: hits.filter((h) => h.group === g) })).filter((x) => x.items.length);
  const flat = grouped.flatMap((x) => x.items);

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const go = (h: Hit) => {
    setOpen(false);
    setQ("");
    input.current?.blur();
    navigate(h.to);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, Math.max(flat.length - 1, 0))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && flat[active]) go(flat[active]);
    else if (e.key === "Escape") { setOpen(false); input.current?.blur(); }
  };

  return (
    <div ref={wrap} className="relative hidden w-full max-w-md md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
      <input
        ref={input}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search anything..."
        aria-label="Search"
        className="h-10 w-full rounded-control bg-subtle py-2.5 pl-9 pr-12 text-sm text-ink outline-none placeholder:text-ink-tertiary focus:ring-1 focus:ring-brand/40"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-[#E5E5E5] bg-white px-1.5 py-0.5 text-[11px] font-medium text-ink-tertiary">⌘K</kbd>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[420px] overflow-y-auto rounded-2xl border border-line bg-white py-2 shadow-xl">
          {flat.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-tertiary">No results for “{q.trim()}”.</p>
          ) : (
            grouped.map(({ g, items }) => (
              <div key={g}>
                <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">{g}</div>
                {items.map((h) => {
                  const idx = flat.indexOf(h);
                  return (
                    <button
                      key={h.key}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(h)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left ${idx === active ? "bg-brand-tint" : ""}`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${idx === active ? "bg-white text-brand" : "bg-subtle text-ink-secondary"}`}>
                        <h.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{h.title}</span>
                        {h.sub && <span className="block truncate text-xs text-ink-secondary">{h.sub}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
