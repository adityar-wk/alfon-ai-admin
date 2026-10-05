import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, AlertTriangle, Bell, Clock, Info, Plane } from "lucide-react";
import { usePersona } from "../persona";

export type Kind = "Escalations" | "SLA breaches" | "Complaints" | "Guest requests" | "Pre-arrival" | "Staff & system";

export const NOTIF_KINDS: { key: Kind; hint: string; dot: string }[] = [
  { key: "Escalations", hint: "Tasks escalated to you", dot: "bg-red-400" },
  { key: "SLA breaches", hint: "Overdue or about to breach", dot: "bg-amber-400" },
  { key: "Complaints", hint: "Guest complaints and compensation", dot: "bg-cyan-400" },
  { key: "Guest requests", hint: "New requests and unassigned tasks", dot: "bg-blue-400" },
  { key: "Pre-arrival", hint: "Arrivals needing action", dot: "bg-violet-400" },
  { key: "Staff & system", hint: "Help requests, shifts, PMS sync", dot: "bg-green-400" },
];

type Note = { id: number; kind: Kind; label: string; task: string; sub: string; detail: string; time: string; to: string; dept?: string };

const NOTES: Note[] = [
  { id: 1, kind: "Escalations", label: "Escalation", task: "AC Not Working", sub: "Room 1204", detail: "This task missed its Level 1 window and has moved up to you. It is already past its SLA with no update from the assignee.", time: "2 min ago", to: "/tasks?view=escalated", dept: "Engineering" },
  { id: 2, kind: "SLA breaches", label: "SLA breach", task: "Extra towels", sub: "Room 812", detail: "The 20-minute SLA ran out 8 minutes ago and the task is still open. Consider reassigning or adding support.", time: "8 min ago", to: "/tasks?view=overdue", dept: "Housekeeping" },
  { id: 3, kind: "Complaints", label: "Complaint", task: "Noise from the neighbouring room", sub: "Room 906", detail: "Alfon AI logged this as a guest complaint. It counts against the Guest Pulse and Recovery Rate pillars until it is resolved.", time: "15 min ago", to: "/tasks?view=complaints", dept: "Guest Services" },
  { id: 4, kind: "Guest requests", label: "Unassigned", task: "3 tasks need an owner", sub: "Front Desk, Concierge", detail: "Three new requests have no assignee yet. The oldest has been waiting for 22 minutes.", time: "22 min ago", to: "/tasks?view=unassigned", dept: "Front Desk" },
  { id: 5, kind: "Pre-arrival", label: "Pre-arrival", task: "2 arrivals need action", sub: "Airport pickup unconfirmed", detail: "Two arriving guests have not confirmed their airport pickup. A WhatsApp reminder can be sent from Pre-Arrival.", time: "35 min ago", to: "/pre-arrival" },
  { id: 6, kind: "Staff & system", label: "Help request", task: "Extra support needed", sub: "Room 2101 · Sarah Ali", detail: "Sarah Ali asked for an extra pair of hands to finish the deep clean before the 3:00 PM arrival.", time: "48 min ago", to: "/tasks", dept: "Housekeeping" },
  { id: 7, kind: "SLA breaches", label: "SLA at risk", task: "Airport transfer", sub: "Room 1501", detail: "Less than 5 minutes are left on this task's SLA and the driver has not been confirmed.", time: "1 hr ago", to: "/tasks?view=risk", dept: "Concierge" },
  { id: 8, kind: "Guest requests", label: "New request", task: "Late checkout request", sub: "Room 1102", detail: "The guest asked for a 2:00 PM checkout. The Front Desk needs to confirm availability.", time: "1 hr ago", to: "/tasks", dept: "Front Desk" },
  { id: 9, kind: "Staff & system", label: "System", task: "PMS synced", sub: "Reservations updated", detail: "The latest reservation changes were pulled in from the PMS. No conflicts were found.", time: "2 hr ago", to: "/onboarding/whatsapp-pms" },
  { id: 10, kind: "Escalations", label: "Escalation", task: "Room service order", sub: "Room 1010", detail: "The order was escalated after two missed follow-ups. The guest has been told to expect a delay.", time: "3 hr ago", to: "/tasks?view=escalated", dept: "Room Service" },
];

// icon tile per kind, using the Alt Prototype's iconBg / iconColor pairs
const TILE: Record<Kind, { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; bg: string; color: string }> = {
  Escalations: { icon: AlertTriangle, bg: "#FEF2F2", color: "#EF4444" },
  "SLA breaches": { icon: Clock, bg: "#FFFBEB", color: "#F59E0B" },
  Complaints: { icon: AlertCircle, bg: "#FEF2F2", color: "#EF4444" },
  "Guest requests": { icon: Bell, bg: "#FFF4F0", color: "#E8623A" },
  "Pre-arrival": { icon: Plane, bg: "#EFF6FF", color: "#2563EB" },
  "Staff & system": { icon: Info, bg: "#F5F5F5", color: "#6B7280" },
};

export const LS_KINDS = "alfon.notifKinds";
const LS_READ = "alfon.notifRead";

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function save(key: string, v: unknown) {
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
  const [expanded, setExpanded] = useState<number | null>(null);
  const [enabled] = useState<Kind[]>(() => load(LS_KINDS, NOTIF_KINDS.map((k) => k.key)));
  const [read, setRead] = useState<number[]>(() => load(LS_READ, []));

  useEffect(() => save(LS_READ, read), [read]);

  const visible = NOTES.filter((n) => enabled.includes(n.kind) && (!manager || !n.dept || inScope(n.dept)));
  const unread = visible.filter((n) => !read.includes(n.id));
  const close = () => {
    setOpen(false);
    setExpanded(null);
  };

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
          <div className="absolute right-0 top-full z-50 mt-2 flex max-h-[80vh] w-[380px] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <span className="font-display text-sm font-bold text-ink">Notifications</span>
                {unread.length > 0 && (
                  <span className="ml-2 rounded-full bg-[#EF4444] px-2 py-0.5 text-xs font-bold text-white">{unread.length} new</span>
                )}
              </div>
              {unread.length > 0 && (
                <button
                  onClick={() => setRead((r) => [...new Set([...r, ...visible.map((n) => n.id)])])}
                  className="text-xs font-medium text-brand"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto">
              {visible.map((n, i) => {
                const isRead = read.includes(n.id);
                const tile = TILE[n.kind];
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      setRead((r) => [...new Set([...r, n.id])]);
                      setExpanded(expanded === n.id ? null : n.id);
                    }}
                    className="cursor-pointer px-5 py-3.5"
                    style={{ borderBottom: i < visible.length - 1 ? "1px solid #F9F9F9" : "none", background: isRead ? "#fff" : "#FAFAFA" }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-px flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]" style={{ background: tile.bg }}>
                        <tile.icon className="h-[15px] w-[15px]" style={{ color: tile.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-ink">{n.task}</span>
                          {!isRead && <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-brand" />}
                        </div>
                        <div className="text-xs text-ink-secondary">{n.label} · {n.sub}</div>
                        {expanded === n.id && (
                          <div className="mt-2 rounded-lg bg-subtle p-2 text-xs leading-relaxed text-[#4B5563]">
                            {n.detail}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                close();
                                navigate(n.to);
                              }}
                              className="mt-1.5 block text-xs font-semibold text-brand"
                            >
                              View details →
                            </button>
                          </div>
                        )}
                        <div className="mt-1.5 text-xs text-ink-tertiary">{n.time}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!visible.length && (
                <p className="px-5 py-12 text-center text-[13px] text-ink-tertiary">
                  {enabled.length ? "You are all caught up." : "All notification types are switched off in Settings."}
                </p>
              )}
            </div>

            <div className="border-t border-line px-5 py-3 text-center">
              <span className="text-xs text-ink-tertiary">Only alerts relevant to Layana Resort &amp; Spa are shown</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
