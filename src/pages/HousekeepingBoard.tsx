import { useMemo, useRef, useState } from "react";
import {
  LayoutGrid,
  CheckCircle2,
  Loader,
  AlertCircle,
  CircleSlash,
  Timer,
  Pencil,
  Search,
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
  11: [["inspection"], ["progress", 17], ["inspected"], ["oos"], ["inspected"]],
  12: [["inspected"], ["ooo"], ["progress", 23], ["progress", 24], ["inspected"]],
  13: [["inspected"], ["inspected"], ["oos"], ["progress", 29], ["inspected"]],
  14: [["progress", 12], ["inspected"], ["inspected"], ["inspection"], ["inspected"]],
  15: [["inspected"], ["progress", 8], ["inspected"], ["inspected"], ["inspection"]],
  16: [["inspected"], ["inspected"], ["progress", 19], ["inspected"], ["inspected"]],
};

const SEED_ROOMS: Room[] = Object.entries(PLAN).flatMap(([floor, rooms]) =>
  rooms.map(([status, mins], i) => {
    const no = Number(floor) * 100 + (i + 1);
    return {
      no,
      floor: Number(floor),
      type: TYPES[(no + i) % TYPES.length],
      guest: status === "oos" && i % 2 === 0 ? undefined : GUESTS[no % GUESTS.length],
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

const OPEN_TASK = "__open__";
const STATUS_OPTIONS: RoomStatus[] = ["inspected", "progress", "inspection", "oos", "ooo"];
const STAFF = getDepartment("housekeeping")?.members.map((m) => m.name) ?? [];
const FLOORS = [10, 11, 12, 13, 14, 15, 16];

export default function HousekeepingBoard() {
  const [rooms, setRooms] = useState<Room[]>(SEED_ROOMS);
  const [floor, setFloor] = useState<number | "all">("all");
  const [occ, setOcc] = useState<"all" | "occupied" | "vacant">("all");
  const [statuses, setStatuses] = useState<RoomStatus[]>([]);
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [assignFor, setAssignFor] = useState<Room | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter(
      (r) =>
        (floor === "all" || r.floor === floor) &&
        (occ === "all" || (occ === "occupied" ? !!r.guest : !r.guest)) &&
        (!statuses.length || statuses.includes(r.status)) &&
        (!q || `${r.no} ${r.guest ?? ""}`.toLowerCase().includes(q)),
    );
  }, [rooms, floor, occ, statuses, query]);
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
              mins: status === "progress" ? r.mins : undefined,
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
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-subtle text-ink-secondary">
                <h.icon className="h-4 w-4" />
              </span>
              <div className="mt-3 text-[12px] font-medium text-ink-secondary">{STATUS_LABEL[h.status]}</div>
              <div className="mt-1 text-[26px] font-bold text-ink">{count(h.status)}</div>
            </button>
          ))}
        </div>

        <div className="relative mt-6 flex items-center gap-3">
          <div className="relative min-w-0 max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search room or guest…"
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
            />
          </div>
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
              <div key={r.no} className="flex h-[156px] flex-col rounded-xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[14px] font-bold text-ink">Room {r.no}</div>
                </div>
                <div className="mt-1 truncate text-[12px] font-medium text-ink">
                  {occupied ? r.guest : <span className="font-normal text-ink-tertiary">Vacant</span>}
                </div>
                <div className="truncate text-[12px] text-ink-tertiary">{r.type}</div>
                <div className="mt-2 flex items-center justify-between gap-2 text-[12px] font-medium text-ink-secondary">
                  <span>{STATUS_LABEL[r.status]}</span>
                  {r.mins != null && (
                    <span className="flex items-center gap-1 font-medium text-amber-600">
                      <Timer className="h-3 w-3" /> {r.mins} mins
                    </span>
                  )}
                </div>
                <div className="mt-auto flex items-end justify-between gap-2">
                  <div className="min-w-0 text-[11px] leading-tight text-ink-secondary">
                    {r.assignedTo ? <div className="truncate">{r.assignedTo}</div> : r.open && r.status === "progress" ? <div className="font-medium text-amber-600">Open task</div> : null}
                  </div>
                  <button
                    onClick={() => setAssignFor(r)}
                    aria-label={`Edit room ${r.no}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-secondary hover:bg-white hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
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

  return (
    <Modal
      title={`Edit Room ${room.no}`}
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
      <div className="mb-4 flex items-center justify-between text-[12px] text-ink-secondary">
        <span>
          {room.type} · {occupied ? `Occupied by ${room.guest}` : "Vacant"}
        </span>
      </div>

      {occupied && status !== "inspected" && (
        <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2.5 text-[12px] text-blue-700">
          <span className="font-semibold">Room is occupied.</span> Coordinate timing with the guest
          before entering.
        </div>
      )}

      <div className="mb-1.5 text-xs font-medium text-ink-secondary">Status</div>
      <div className="grid grid-cols-2 gap-2">
        {STATUS_OPTIONS.map((s) => {
          const active = s === status;
          return (
            <button
              key={s}
              onClick={() => pickStatus(s)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] font-medium ${
                active ? "border-brand bg-brand-tint/40 text-ink" : "border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          );
        })}
      </div>

      {status === "progress" && cleaner && (
        <p className="mt-5 rounded-lg bg-subtle px-3 py-2.5 text-[13px] text-ink-secondary">
          Cleaning in progress by {cleaner}. Change the status to Needs Inspection to assign someone to inspect it.
        </p>
      )}

      {canAssign && (
        <div className="mt-5 border-t border-line pt-4">
          <Field label={status === "progress" ? "Assign cleaner" : "Assign inspector"}>
            <Select value={staff} onChange={(e) => setStaff(e.target.value)}>
              <option value="">Unassigned</option>
              {status === "progress" && <option value={OPEN_TASK}>Open task — anyone can pick it up</option>}
              {STAFF.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field className="mt-3" label="Notes (optional)">
            <Input
              placeholder="e.g. Guest requested extra pillows"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
        </div>
      )}
    </Modal>
  );
}
