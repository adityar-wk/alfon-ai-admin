import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, SlidersHorizontal, Check } from "lucide-react";
import { usePersona } from "../persona";

type Kind = "Escalations" | "SLA breaches" | "Complaints" | "Guest requests" | "Pre-arrival" | "Staff & system";

const KINDS: { key: Kind; hint: string; dot: string }[] = [
  { key: "Escalations", hint: "Tasks escalated to you", dot: "bg-red-400" },
  { key: "SLA breaches", hint: "Overdue or about to breach", dot: "bg-amber-400" },
  { key: "Complaints", hint: "Guest complaints and compensation", dot: "bg-rose-400" },
  { key: "Guest requests", hint: "New requests and unassigned tasks", dot: "bg-sky-400" },
  { key: "Pre-arrival", hint: "Arrivals needing action", dot: "bg-violet-400" },
  { key: "Staff & system", hint: "Help requests, shifts, PMS sync", dot: "bg-emerald-400" },
];

type Note = { id: number; kind: Kind; label: string; task: string; sub: string; time: string; to: string; dept?: string };

const NOTES: Note[] = [
  { id: 1, kind: "Escalations", label: "Escalation", task: "AC Not Working", sub: "Room 1204", time: "2 min ago", to: "/tasks?view=escalated", dept: "Engineering" },
  { id: 2, kind: "SLA breaches", label: "SLA breach", task: "Extra towels", sub: "Room 812", time: "8 min ago", to: "/tasks?view=overdue", dept: "Housekeeping" },
  { id: 3, kind: "Complaints", label: "Complaint", task: "Noise from the neighbouring room", sub: "Room 906", time: "15 min ago", to: "/tasks?view=complaints", dept: "Guest Services" },
  { id: 4, kind: "Guest requests", label: "Unassigned", task: "3 tasks need an owner", sub: "Front Desk, Concierge", time: "22 min ago", to: "/tasks?view=unassigned", dept: "Front Desk" },
  { id: 5, kind: "Pre-arrival", label: "Pre-arrival", task: "2 arrivals need action", sub: "Airport pickup unconfirmed", time: "35 min ago", to: "/pre-arrival" },
  { id: 6, kind: "Staff & system", label: "Help request", task: "Extra support needed", sub: "Room 2101 · Sarah Ali", time: "48 min ago", to: "/tasks", dept: "Housekeeping" },
  { id: 7, kind: "SLA breaches", label: "SLA at risk", task: "Airport transfer", sub: "Room 1501", time: "1 hr ago", to: "/tasks?view=risk", dept: "Concierge" },
  { id: 8, kind: "Guest requests", label: "New request", task: "Late checkout request", sub: "Room 1102", time: "1 hr ago", to: "/tasks", dept: "Front Desk" },
  { id: 9, kind: "Staff & system", label: "System", task: "PMS synced", sub: "Reservations updated", time: "2 hr ago", to: "/onboarding/whatsapp-pms" },
  { id: 10, kind: "Escalations", label: "Escalation", task: "Room service order", sub: "Room 1010", time: "3 hr ago", to: "/tasks?view=escalated", dept: "Room Service" },
];

// label colour per kind (text only)
const LABEL_TONE: Record<Kind, string> = {
  Escalations: "text-red-600",
  "SLA breaches": "text-orange-600",
  Complaints: "text-violet-600",
  "Guest requests": "text-sky-600",
  "Pre-arrival": "text-purple",
  "Staff & system": "text-emerald-600",
};

const LS_KINDS = "alfon.notifKinds";
const LS_READ = "alfon.notifRead";

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { manager, inScope } = usePersona();
  const [open, setOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [enabled, setEnabled] = useState<Kind[]>(() => load(LS_KINDS, KINDS.map((k) => k.key)));
  const [read, setRead] = useState<number[]>(() => load(LS_READ, []));

  useEffect(() => save(LS_KINDS, enabled), [enabled]);
  useEffect(() => save(LS_READ, read), [read]);

  const visible = NOTES.filter((n) => enabled.includes(n.kind) && (!manager || !n.dept || inScope(n.dept)));
  const unread = visible.filter((n) => !read.includes(n.id));
  const toggle = (k: Kind) => setEnabled((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));
  const close = () => {
    setOpen(false);
    setFilterOpen(false);
  };
  const filtered = enabled.length < KINDS.length;

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => (open ? close() : setOpen(true))}
        className={`relative rounded-lg p-2 hover:bg-subtle ${open ? "bg-subtle text-ink" : "text-ink-secondary"}`}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread.length > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" aria-label="Close notifications" onClick={close} />
          <div className="absolute right-0 top-12 z-50 w-[400px] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_40px_rgba(16,24,40,0.14)]">
            <div className="flex items-center gap-2 px-5 py-4">
              <h3 className="text-[16px] font-semibold text-ink">Notifications</h3>
              <div className="ml-auto flex items-center gap-2">
                {unread.length > 0 && (
                  <button
                    onClick={() => setRead((r) => [...new Set([...r, ...visible.map((n) => n.id)])])}
                    className="rounded-md px-2 py-1 text-[12px] font-medium text-brand hover:bg-brand-tint"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  aria-label="Filter notifications"
                  onClick={() => setFilterOpen((f) => !f)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg border ${
                    filterOpen || filtered ? "border-brand bg-brand-tint text-brand" : "border-line text-ink-secondary hover:bg-subtle"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {filtered && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">
                      {enabled.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {filterOpen && (
              <div className="border-y border-line bg-subtle/50 px-5 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Show me</span>
                  <span className="flex gap-3 text-[12px] font-medium text-brand">
                    <button onClick={() => setEnabled(KINDS.map((k) => k.key))}>All</button>
                    <button onClick={() => setEnabled([])}>None</button>
                  </span>
                </div>
                <div className="space-y-1">
                  {KINDS.map((k) => {
                    const on = enabled.includes(k.key);
                    return (
                      <button key={k.key} onClick={() => toggle(k.key)} className="flex w-full items-center gap-3 rounded-control px-2 py-2 text-left hover:bg-white">
                        <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${on ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>
                          {on && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block text-[13px] font-medium text-ink">{k.key}</span>
                          <span className="block text-[11px] text-ink-tertiary">{k.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="max-h-[420px] divide-y divide-line/70 overflow-y-auto">
              {visible.map((n) => {
                const isRead = read.includes(n.id);
                                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setRead((r) => [...new Set([...r, n.id])]);
                      close();
                      navigate(n.to);
                    }}
                    className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-subtle/60 ${isRead ? "" : "bg-brand-tint/30"}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px]">
                        <span className={`font-semibold ${LABEL_TONE[n.kind]}`}>{n.label}</span>
                        <span className="text-ink-tertiary"> · {n.time}</span>
                      </span>
                      <span className={`mt-1 block text-[14px] text-ink ${isRead ? "font-medium" : "font-semibold"}`}>{n.task}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-secondary">{n.sub}</span>
                    </span>
                    {!isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  </button>
                );
              })}
              {!visible.length && (
                <p className="px-5 py-12 text-center text-[13px] text-ink-tertiary">
                  {enabled.length ? "You are all caught up." : "All notification types are switched off."}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
