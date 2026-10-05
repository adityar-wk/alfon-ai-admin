import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader,
  AlertCircle,
  CircleSlash,
  Timer,
  Filter,
  Check,
  Wrench,
  ChevronLeft,
  ChevronRight,
  User,
  DoorClosed,
  ClipboardCheck,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, Field, Select, Input, Modal } from "../components/ui";
import { getDepartment } from "../data/departments";
import { CLEANING_CHECKLIST, INSPECTION_CHECKLIST, TAG_TONE } from "../data/housekeepingChecklists";

type RoomStatus = "inspected" | "progress" | "inspection" | "oos" | "ooo";

type Room = {
  no: number;
  floor: number;
  guest?: string;
  type: string;
  status: RoomStatus;
  mins?: number;
  assignedTo?: string;
  /** cleaning task left open for any line staff member to pick up (never used for inspections) */
  open?: boolean;
};

const TYPES = ["Deluxe Suite", "Executive Room", "Premium Room", "Junior Suite", "Deluxe Room"];
const GUESTS = [
  "James Wilson",
  "Olivia Brown",
  "Liam Anderson",
  "Sarah Mitchell",
  "Ava Thompson",
  "William Taylor",
  "Isabella Rossi",
  "Emma Davis",
];

const PLAN: Record<number, [RoomStatus, number?][]> = {
  10: [["inspected"], ["ooo"], ["inspected"], ["oos"], ["inspected"]],
  11: [["inspection", 14], ["progress", 17], ["inspected"], ["oos"], ["inspected"]],
  12: [["inspected"], ["ooo"], ["progress", 23], ["progress", 24], ["inspected"]],
  13: [["inspected"], ["inspected"], ["oos"], ["progress", 29], ["inspected"]],
  14: [["progress", 12], ["inspected"], ["inspected"], ["inspection", 10], ["inspected"]],
  15: [["inspected"], ["progress", 8], ["inspected"], ["inspected"], ["inspection", 22]],
  16: [["inspected"], ["inspected"], ["progress", 19], ["inspected"], ["inspected"]],
};

const SEED_ROOMS: Room[] = Object.entries(PLAN).flatMap(([floor, rooms]) =>
  rooms.map(([status, mins], i) => {
    const no = Number(floor) * 100 + (i + 1);
    return {
      no,
      floor: Number(floor),
      type: TYPES[(no + i) % TYPES.length],
      guest: (status === "oos" && i % 2 === 0) || no % 3 === 0 ? undefined : GUESTS[no % GUESTS.length],
      status,
      mins,
      assignedTo: status === "progress" ? "Maria Santos" : undefined,
    };
  }),
);

// plain, uncoloured labels: rooms are not colour-coded
const STATUS_LABEL: Record<RoomStatus, string> = {
  inspected: "Inspected",
  progress: "In Progress",
  inspection: "Needs Inspection",
  oos: "Out of Service",
  ooo: "Out of Order",
};

const STATUS_ICON: Record<RoomStatus, React.ComponentType<{ className?: string }>> = {
  inspected: CheckCircle2,
  progress: Loader,
  inspection: AlertCircle,
  oos: CircleSlash,
  ooo: Wrench,
};

const STATUS_ICON_TONE: Record<RoomStatus, string> = {
  inspected: "bg-green-50 text-green-600",
  progress: "bg-blue-50 text-blue-600",
  inspection: "bg-amber-50 text-amber-600",
  oos: "bg-red-50 text-red-600",
  ooo: "bg-gray-100 text-gray-500",
};

const STATUS_TEXT_TONE: Record<RoomStatus, string> = {
  inspected: "text-green-600",
  progress: "text-blue-600",
  inspection: "text-amber-600",
  oos: "text-red-600",
  ooo: "text-gray-500",
};

/** only the two statuses awaiting action (In Progress, Needs Inspection) get a highlighted border */
const STATUS_BORDER: Record<RoomStatus, string> = {
  inspected: "border-line",
  progress: "border-blue-300",
  inspection: "border-amber-300",
  oos: "border-line",
  ooo: "border-line",
};

const PAGE_SIZE = 50;

const OPEN_TASK = "__open__";
const STATUS_OPTIONS: RoomStatus[] = ["inspected", "progress", "inspection", "oos", "ooo"];
const STAFF = getDepartment("housekeeping")?.members.map((m) => m.name) ?? [];
const FLOORS = [10, 11, 12, 13, 14, 15, 16];

export default function HousekeepingBoard() {
  const [rooms, setRooms] = useState<Room[]>(SEED_ROOMS);
  const [floor, setFloor] = useState<number | "all">("all");
  const [occ, setOcc] = useState<"all" | "occupied" | "vacant">("all");
  const [statuses, setStatuses] = useState<RoomStatus[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<Room | null>(null);
  const [checklistFor, setChecklistFor] = useState<{ room: Room; kind: "cleaning" | "inspection" } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const toastTimer = useRef<number>();

  const visible = useMemo(() => {
    return rooms.filter(
      (r) =>
        (floor === "all" || r.floor === floor) &&
        (occ === "all" || (occ === "occupied" ? !!r.guest : !r.guest)) &&
        (!statuses.length || statuses.includes(r.status)) &&
        true,
    );
  }, [rooms, floor, occ, statuses]);
  const activeFilters = (floor !== "all" ? 1 : 0) + (occ !== "all" ? 1 : 0) + (statuses.length ? 1 : 0);
  const clearFilters = () => { setFloor("all"); setOcc("all"); setStatuses([]); };
  const toggleStatus = (st: RoomStatus) => setStatuses((cur) => (cur.includes(st) ? cur.filter((x) => x !== st) : [...cur, st]));

  useEffect(() => setPage(1), [floor, occ, statuses]);
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = visible.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const count = (st: RoomStatus) => rooms.filter((r) => r.status === st).length;
  const HEAD: { status: RoomStatus; icon: React.ComponentType<{ className?: string }> }[] = [
    { status: "inspected", icon: CheckCircle2 },
    { status: "progress", icon: Loader },
    { status: "inspection", icon: AlertCircle },
    { status: "oos", icon: CircleSlash },
    { status: "ooo", icon: Wrench },
  ];

  const flash = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  };

  const saveRoom = (no: number, status: RoomStatus, staff: string | null, note: string) => {
    setRooms((rs) =>
      rs.map((r) =>
        r.no === no
          ? {
              ...r,
              status,
              assignedTo: staff && staff !== OPEN_TASK ? staff : undefined,
              open: status === "progress" && staff === OPEN_TASK,
              mins: status === "progress" || status === "inspection" ? r.mins ?? 20 : undefined,
            }
          : r,
      ),
    );
    setAssignFor(null);
    flash(
      status === "progress" && staff === OPEN_TASK
        ? `Room ${no} → ${STATUS_LABEL[status]}, open for line staff to pick up`
        : (status === "inspection" || status === "progress") && staff
        ? `Room ${no} → ${STATUS_LABEL[status]}, assigned to ${staff}${note ? " (note added)" : ""}`
        : `Room ${no} → ${STATUS_LABEL[status]}`,
    );
  };

  return (
    <>
      <Topbar title="Housekeeping" />
      <main className="flex-1 overflow-y-auto bg-page">
        <div className="px-8 pb-8 pt-7">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {HEAD.map((h) => (
            <button
              key={h.status}
              onClick={() => setStatuses((cur) => (cur.length === 1 && cur[0] === h.status ? [] : [h.status]))}
              className={`rounded-card border bg-white px-6 py-5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift ${statuses.length === 1 && statuses[0] === h.status ? "border-brand" : "border-line"}`}
            >
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-brand/25 bg-white text-brand">
                <h.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="text-sm text-ink-secondary">{STATUS_LABEL[h.status]}</div>
              <div className="mt-0.5 font-display text-[28px] font-bold leading-tight text-ink">{count(h.status)}</div>
            </button>
          ))}
        </div>

        <div className="relative mt-6 flex items-center gap-2">
          <div className="relative shrink-0">
            <button
              aria-label="Filters"
              onClick={() => setFilterOpen((o) => !o)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${filterOpen || activeFilters ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"}`}
            >
              <Filter className="h-4 w-4" />
              {activeFilters > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">{activeFilters}</span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute left-0 top-12 z-20 w-[300px] space-y-4 rounded-xl border border-line bg-white p-4 shadow-lg">
                <div>
                  <div className="mb-1.5 text-[13px] font-medium text-ink">Status</div>
                  <div className="space-y-0.5">
                    {STATUS_OPTIONS.map((st) => (
                      <label key={st} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] text-ink hover:bg-subtle">
                        <input type="checkbox" className="h-4 w-4 accent-brand" checked={statuses.includes(st)} onChange={() => toggleStatus(st)} />
                        {STATUS_LABEL[st]}
                      </label>
                    ))}
                  </div>
                </div>
                <Field label="Occupancy">
                  <Select value={occ} onChange={(e) => setOcc(e.target.value as "all" | "occupied" | "vacant")}>
                    <option value="all">All rooms</option>
                    <option value="occupied">Occupied</option>
                    <option value="vacant">Vacant</option>
                  </Select>
                </Field>
                <div className="flex items-center justify-between text-[12px] text-ink-secondary">
                  <span>{visible.length} rooms match</span>
                  <button onClick={() => setFilterOpen(false)} className="font-semibold text-brand">Done</button>
                </div>
              </div>
            )}
          </div>
          {activeFilters > 0 && <button onClick={clearFilters} className="shrink-0 text-[13px] font-medium text-brand">Clear filters</button>}
          <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto">
          {(["all", ...FLOORS] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFloor(f)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 hover:-translate-y-px ${
                floor === f ? "bg-brand text-white" : "border border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              {f === "all" ? "All floors" : `Floor ${f}`}
            </button>
          ))}
          </div>
        </div>

        <div className="mt-3 text-[12px] text-ink-tertiary">
          Showing {visible.length ? (pageSafe - 1) * PAGE_SIZE + 1 : 0}–{Math.min(pageSafe * PAGE_SIZE, visible.length)} of {visible.length} rooms
        </div>

        <Card className="mt-3 p-5">
        <div className="grid grid-cols-5 gap-3">
          {paged.map((r) => {
            const occupied = !!r.guest;
            const dulled = r.status === "ooo";
            const progressPct = r.mins != null ? Math.max(10, Math.min(95, 100 - r.mins)) : 0;
            return (
              <div
                key={r.no}
                role="button"
                tabIndex={0}
                aria-label={`Open room ${r.no}`}
                onClick={() => setAssignFor(r)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setAssignFor(r)}
                className={`flex cursor-pointer flex-col rounded-2xl border p-3 ${
                  dulled ? "bg-subtle" : "bg-white"
                } ${STATUS_BORDER[r.status]}`}
              >
                <div className="flex items-start justify-between">
                  {(() => { const Icon = STATUS_ICON[r.status]; return <span title={STATUS_LABEL[r.status]} aria-label={STATUS_LABEL[r.status]} role="img" className={`flex h-7 w-7 items-center justify-center rounded-full ${STATUS_ICON_TONE[r.status]}`}><Icon className="h-3.5 w-3.5" /></span>; })()}
                  <span className="flex items-center gap-1.5">
                    {(r.status === "inspected" || r.status === "progress" || r.status === "inspection") && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${r.status === "inspected" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {r.status === "inspected" ? "Clean" : "Dirty"}
                      </span>
                    )}
                    <span
                      title={occupied ? "Occupied" : "Vacant"}
                      aria-label={occupied ? "Occupied" : "Vacant"}
                      className="flex h-6 w-6 items-center justify-center text-ink"
                    >
                      {occupied ? <User className="h-3.5 w-3.5" /> : <DoorClosed className="h-3.5 w-3.5" />}
                    </span>
                  </span>
                </div>
                <div className={`mt-2 text-[13px] font-bold ${dulled ? "text-ink-tertiary" : "text-ink"}`}>Room {r.no}</div>
                <div className="truncate text-[11px] text-ink-secondary">{r.type} · Floor {r.floor}</div>
                <div className={`mt-1.5 text-[12px] font-semibold ${STATUS_TEXT_TONE[r.status]}`}>{STATUS_LABEL[r.status]}</div>
                {r.mins != null && (
                  <div className="mt-2">
                    <div className="h-1 overflow-hidden rounded-full bg-subtle">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-green-600">
                        <Timer className="h-3 w-3" /> {r.mins} mins left
                      </span>
                      {(r.status === "progress" || r.status === "inspection") && (
                        <span className="truncate text-[10px] font-medium text-ink-secondary">{r.assignedTo ?? "Unassigned"}</span>
                      )}
                    </div>
                  </div>
                )}
                {r.mins == null && (r.status === "progress" || r.status === "inspection") && (
                  <div className="mt-1 truncate text-[10px] font-medium text-ink-secondary">{r.assignedTo ?? "Unassigned"}</div>
                )}
              </div>
            );
          })}
          {!visible.length && (
            <div className="col-span-full rounded-xl border border-dashed border-line py-12 text-center text-[13px] text-ink-tertiary">
              No rooms match these filters.
            </div>
          )}
        </div>
        </Card>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] text-ink-tertiary">Page {pageSafe} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 min-w-8 rounded-lg border px-2.5 text-[13px] font-medium ${
                    p === pageSafe ? "border-brand bg-brand-tint text-brand" : "border-line text-ink-secondary hover:bg-subtle"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        </div>
      </main>

      {assignFor && (
        <EditRoomModal
          room={assignFor}
          onClose={() => setAssignFor(null)}
          onSave={saveRoom}
          onRequestChecklist={(kind) => { setChecklistFor({ room: assignFor, kind }); setAssignFor(null); }}
        />
      )}

      {checklistFor?.kind === "cleaning" && (
        <CleaningChecklistModal
          room={checklistFor.room}
          onClose={() => setChecklistFor(null)}
          onSubmit={() => { saveRoom(checklistFor.room.no, "inspection", null, ""); setChecklistFor(null); }}
        />
      )}

      {checklistFor?.kind === "inspection" && (
        <InspectionChecklistModal
          room={checklistFor.room}
          onClose={() => setChecklistFor(null)}
          onApprove={() => { saveRoom(checklistFor.room.no, "inspected", null, ""); setChecklistFor(null); }}
          onFlag={() => { saveRoom(checklistFor.room.no, "progress", checklistFor.room.assignedTo ?? null, "Flagged for re-cleaning after inspection"); setChecklistFor(null); }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            {toast}
          </span>
        </div>
      )}
    </>
  );
}

function EditRoomModal({
  room,
  onClose,
  onSave,
  onRequestChecklist,
}: {
  room: Room;
  onClose: () => void;
  onSave: (no: number, status: RoomStatus, staff: string | null, note: string) => void;
  onRequestChecklist: (kind: "cleaning" | "inspection") => void;
}) {
  const [status, setStatus] = useState<RoomStatus>(room.status);
  const initialStaff = (st: RoomStatus) => (st !== room.status ? "" : st === "progress" && room.open ? OPEN_TASK : room.assignedTo ?? "");
  const [staff, setStaff] = useState(room.status === "inspection" || room.status === "progress" ? initialStaff(room.status) : "");
  const [note, setNote] = useState("");
  const occupied = !!room.guest;
  const cleaner = status === "progress" && room.status === "progress" ? room.assignedTo : undefined;
  const canAssign = status === "inspection" || (status === "progress" && !cleaner);
  const pickStatus = (s: RoomStatus) => {
    if (room.status === "progress" && s === "inspection") return onRequestChecklist("cleaning");
    if (room.status === "inspection" && s === "inspected") return onRequestChecklist("inspection");
    setStatus(s);
    setStaff(initialStaff(s));
  };

  const unchanged = status === room.status;
  const showAssignment = unchanged && (room.status === "progress" || room.status === "inspection");
  const sectionLabel = "mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary";

  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          Room {room.no}
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${room.status === "inspected" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            {room.status === "inspected" ? "Clean" : "Dirty"}
          </span>
        </span>
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(room.no, status, cleaner ?? (canAssign ? staff || null : null), note)}>Save</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 divide-x divide-line rounded-xl bg-subtle/70 py-3 text-center">
          <div><div className="text-[11px] text-ink-tertiary">Room type</div><div className="mt-0.5 px-1 text-[13px] font-medium text-ink">{room.type}</div></div>
          <div><div className="text-[11px] text-ink-tertiary">Occupancy</div><div className="mt-0.5 text-[13px] font-medium text-ink">{occupied ? "Occupied" : "Vacant"}</div></div>
          <div><div className="text-[11px] text-ink-tertiary">Floor</div><div className="mt-0.5 text-[13px] font-medium text-ink">{room.floor}</div></div>
        </div>

        {occupied && status !== "inspected" && (
          <p className="text-[12px] text-ink-secondary">A guest is in this room. Coordinate timing with them before entering.</p>
        )}

        {showAssignment && (
          <div>
            <div className={sectionLabel}>{room.status === "progress" ? "Cleaning" : "Inspection"}</div>
            <div className="divide-y divide-line rounded-xl border border-line">
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-ink-secondary">Assigned to</span>
                <span className="font-medium text-ink">
                  {room.assignedTo ?? (room.open ? "Open task — anyone can pick it up" : "Not assigned")}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[13px]">
                <span className="text-ink-secondary">SLA</span>
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <Timer className="h-3.5 w-3.5 text-ink-tertiary" /> {room.mins != null ? `${room.mins} mins left` : "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className={sectionLabel}>Status</div>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((st) => {
              const active = st === status;
              const Icon = STATUS_ICON[st];
              const gated = (room.status === "progress" && st === "inspection") || (room.status === "inspection" && st === "inspected");
              return (
                <button
                  key={st}
                  onClick={() => pickStatus(st)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium ${
                    active ? "border-brand bg-brand-tint/40 text-ink" : "border-line bg-white text-ink-secondary hover:bg-subtle"
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${STATUS_ICON_TONE[st]}`}><Icon className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span>{STATUS_LABEL[st]}</span>
                    {gated && <span className="mt-0.5 flex items-center gap-1 text-[11px] font-normal text-ink-tertiary"><ClipboardCheck className="h-3 w-3" /> Requires checklist</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {status === "progress" && cleaner && (
          <p className="text-[12px] text-ink-secondary">Cleaning in progress. Change the status to Needs Inspection to assign someone to inspect it.</p>
        )}

        {canAssign && (
          <div>
            <div className={sectionLabel}>{status === "progress" ? "Assign cleaner" : "Assign inspector"}</div>
            <Select value={staff} onChange={(e) => setStaff(e.target.value)}>
              <option value="">Unassigned</option>
              {status === "progress" && <option value={OPEN_TASK}>Open task — anyone can pick it up</option>}
              {STAFF.map((st) => (
                <option key={st}>{st}</option>
              ))}
            </Select>
            <div className="mt-3">
              <Input
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function CleaningChecklistModal({
  room,
  onClose,
  onSubmit,
}: {
  room: Room;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => CLEANING_CHECKLIST.map(() => false));
  const allDone = checked.every(Boolean);
  const toggle = (i: number) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));

  const doneCount = checked.filter(Boolean).length;

  return (
    <Modal
      size="lg"
      title={`Room ${room.no} — ${room.guest ? "Occupied" : "Vacant"} Room Cleaning`}
      onClose={onClose}
      footer={
        <Button className="w-full disabled:opacity-40" disabled={!allDone} onClick={onSubmit}>
          Submit for Inspection
        </Button>
      }
    >
      <div className="flex items-center justify-between rounded-xl bg-subtle/70 px-4 py-3 text-[13px]">
        <span className="text-ink-secondary">
          Housekeeper: <span className="font-medium text-ink">{room.assignedTo ?? "Unassigned"}</span>
          {room.mins != null && <> · Timer: <span className="font-medium text-ink">{room.mins} min left</span></>}
        </span>
        <span className="flex items-center gap-3">
          <span className="text-ink-tertiary">{doneCount} / {CLEANING_CHECKLIST.length} done</span>
          <button
            type="button"
            onClick={() => setChecked(CLEANING_CHECKLIST.map(() => !allDone))}
            className="text-[12px] font-semibold text-brand hover:underline"
          >
            {allDone ? "Clear all" : "Select all"}
          </button>
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {CLEANING_CHECKLIST.map((item, i) => (
          <label
            key={item}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-[13px] transition-colors ${
              checked[i] ? "border-green-200 bg-green-50/50" : "border-line hover:bg-subtle/50"
            }`}
          >
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-brand" checked={checked[i]} onChange={() => toggle(i)} />
            <span className={checked[i] ? "text-ink" : "text-ink-secondary"}>{item}</span>
          </label>
        ))}
      </div>
      {!allDone && (
        <p className="mt-4 text-center text-[12px] text-ink-tertiary">Complete every item before submitting this room for inspection.</p>
      )}
    </Modal>
  );
}

function InspectionChecklistModal({
  room,
  onClose,
  onApprove,
  onFlag,
}: {
  room: Room;
  onClose: () => void;
  onApprove: () => void;
  onFlag: () => void;
}) {
  const [checked, setChecked] = useState<boolean[]>(() => INSPECTION_CHECKLIST.map(() => false));
  const doneCount = checked.filter(Boolean).length;
  const allDone = doneCount === INSPECTION_CHECKLIST.length;
  const pct = Math.round((doneCount / INSPECTION_CHECKLIST.length) * 100);
  const toggle = (i: number) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)));
  const sections = Array.from(new Set(INSPECTION_CHECKLIST.map((it) => it.section)));

  return (
    <Modal
      size="xl"
      title={`Room ${room.no} — LQA Room Inspection`}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={onFlag}>
            Flag for Re-cleaning
          </Button>
          <Button className="flex-1 disabled:opacity-40" disabled={!allDone} onClick={onApprove}>
            Approve & Clear Room
          </Button>
        </>
      }
    >
      <div className="flex items-center justify-between rounded-xl bg-subtle/70 px-4 py-3">
        <div className="text-[13px] text-ink-secondary">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-wide text-ink-tertiary">LQA Standard</span>
          <div>Housekeeper: <span className="font-medium text-ink">{room.assignedTo ?? "Unassigned"}</span></div>
        </div>
        <div className="w-56 shrink-0">
          <div className="flex items-center justify-between gap-2 text-[12px] text-ink-tertiary">
            <span>{doneCount} / {INSPECTION_CHECKLIST.length} verified</span>
            <button
              type="button"
              onClick={() => setChecked(INSPECTION_CHECKLIST.map(() => !allDone))}
              className="font-semibold text-brand hover:underline"
            >
              {allDone ? "Clear all" : "Select all"}
            </button>
            <span className="font-semibold text-ink">{pct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line/60">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 max-h-[460px] space-y-6 overflow-y-auto pr-1">
        {sections.map((sec) => (
          <div key={sec}>
            <div className="mb-3 text-[12px] font-bold uppercase tracking-wide text-ink-tertiary">{sec}</div>
            <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
              {INSPECTION_CHECKLIST.filter((it) => it.section === sec).map((it) => (
                <label
                  key={it.n}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-[13px] transition-colors ${
                    checked[it.n - 1] ? "border-green-200 bg-green-50/40" : "border-line hover:bg-subtle/50"
                  }`}
                >
                  <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-brand" checked={checked[it.n - 1]} onChange={() => toggle(it.n - 1)} />
                  <span className="min-w-0 flex-1">
                    <span className={checked[it.n - 1] ? "text-ink" : "text-ink-secondary"}><span className="mr-1 text-ink-tertiary">{it.n}.</span>{it.text}</span>
                    <span className={`ml-2 inline-block rounded px-1.5 py-0.5 align-middle text-[10px] font-medium ${TAG_TONE[it.tag]}`}>{it.tag}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
