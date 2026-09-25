import { useMemo, useRef, useState } from "react";
import {
  LayoutGrid,
  CheckCircle2,
  Loader,
  AlertCircle,
  CircleSlash,
  Timer,
  ArrowRight,
  SlidersHorizontal,
  Check,
  Wrench,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Badge, Button, Field, Select, Input, Modal } from "../components/ui";
import { getDepartment } from "../data/departments";

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
  inspected: "bg-emerald-50 text-emerald-600",
  progress: "bg-blue-50 text-blue-600",
  inspection: "bg-amber-50 text-amber-600",
  oos: "bg-gray-100 text-gray-500",
  ooo: "bg-red-50 text-red-600",
};

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
  const [toast, setToast] = useState<string | null>(null);
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
      <Page>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {HEAD.map((h) => (
            <button
              key={h.status}
              onClick={() => setStatuses((cur) => (cur.length === 1 && cur[0] === h.status ? [] : [h.status]))}
              className={`rounded-card border bg-white p-4 text-left transition-colors hover:border-brand/40 ${statuses.length === 1 && statuses[0] === h.status ? "border-brand" : "border-line"}`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${STATUS_ICON_TONE[h.status]}`}>
                <h.icon className="h-4 w-4" />
              </span>
              <div className="mt-3 text-[12px] font-medium text-ink-secondary">{STATUS_LABEL[h.status]}</div>
              <div className="mt-1 text-[26px] font-bold text-ink">{count(h.status)}</div>
            </button>
          ))}
        </div>

        <div className="relative mt-6 flex items-center gap-3">
          <div className="relative shrink-0">
            <button
              aria-label="Filters"
              onClick={() => setFilterOpen((o) => !o)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${filterOpen || activeFilters ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
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
                <Field label="Floor">
                  <Select value={String(floor)} onChange={(e) => setFloor(e.target.value === "all" ? "all" : Number(e.target.value))}>
                    <option value="all">All floors</option>
                    {FLOORS.map((f) => <option key={f} value={f}>Floor {f}</option>)}
                  </Select>
                </Field>
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
          {activeFilters > 0 && <button onClick={clearFilters} className="text-[13px] font-medium text-brand">Clear filters</button>}
        </div>

        <div className="mt-3 text-[12px] text-ink-tertiary">
          Showing {visible.length} of {rooms.length} rooms
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visible.map((r) => {
            const occupied = !!r.guest;
            return (
              <div
                key={r.no}
                role="button"
                tabIndex={0}
                aria-label={`Open room ${r.no}`}
                onClick={() => setAssignFor(r)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setAssignFor(r)}
                className="flex h-[156px] cursor-pointer flex-col rounded-xl border border-brand/25 bg-white p-4 transition-colors hover:border-brand/50"
              >
                {(() => { const Icon = STATUS_ICON[r.status]; return <span title={STATUS_LABEL[r.status]} aria-label={STATUS_LABEL[r.status]} role="img" className={`flex h-8 w-8 items-center justify-center rounded-lg ${STATUS_ICON_TONE[r.status]}`}><Icon className="h-[18px] w-[18px]" /></span>; })()}
                <div className="mt-3 text-[14px] font-bold text-ink">Room {r.no}</div>
                <div className="mt-0.5 truncate text-[12px] text-ink-secondary">{r.type}</div>
                <div className="truncate text-[12px] text-ink-tertiary">{occupied ? "Occupied" : "Vacant"}</div>
                <div className="mt-auto flex items-center justify-between">
                  {r.mins != null ? (
                    <span className="flex items-center gap-1 text-[12px] font-medium text-ink-secondary">
                      <Timer className="h-3 w-3" /> {r.mins} mins
                    </span>
                  ) : <span />}
                  <ArrowRight className="h-4 w-4 text-ink-tertiary" />
                </div>
              </div>
            );
          })}
          {!visible.length && (
            <div className="col-span-full rounded-xl border border-dashed border-line py-12 text-center text-[13px] text-ink-tertiary">
              No rooms match these filters.
            </div>
          )}
        </div>
      </Page>

      {assignFor && (
        <EditRoomModal
          room={assignFor}
          onClose={() => setAssignFor(null)}
          onSave={saveRoom}
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
}: {
  room: Room;
  onClose: () => void;
  onSave: (no: number, status: RoomStatus, staff: string | null, note: string) => void;
}) {
  const [status, setStatus] = useState<RoomStatus>(room.status);
  const initialStaff = (st: RoomStatus) => (st !== room.status ? "" : st === "progress" && room.open ? OPEN_TASK : room.assignedTo ?? "");
  const [staff, setStaff] = useState(room.status === "inspection" || room.status === "progress" ? initialStaff(room.status) : "");
  const [note, setNote] = useState("");
  const occupied = !!room.guest;
  const cleaner = status === "progress" && room.status === "progress" ? room.assignedTo : undefined;
  const canAssign = status === "inspection" || (status === "progress" && !cleaner);
  const pickStatus = (s: RoomStatus) => {
    setStatus(s);
    setStaff(initialStaff(s));
  };

  const unchanged = status === room.status;
  const showAssignment = unchanged && (room.status === "progress" || room.status === "inspection");
  const sectionLabel = "mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary";

  return (
    <Modal
      title={`Room ${room.no}`}
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
              return (
                <button
                  key={st}
                  onClick={() => pickStatus(st)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium ${
                    active ? "border-brand bg-brand-tint/40 text-ink" : "border-line bg-white text-ink-secondary hover:bg-subtle"
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${STATUS_ICON_TONE[st]}`}><Icon className="h-4 w-4" /></span>
                  {STATUS_LABEL[st]}
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
