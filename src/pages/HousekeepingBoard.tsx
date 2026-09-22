import { useMemo, useRef, useState } from "react";
import {
  LayoutGrid,
  CheckCircle2,
  Loader,
  AlertCircle,
  CircleSlash,
  Timer,
  Pencil,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Badge, Button, Field, Select, Input, Modal } from "../components/ui";
import { getDepartment } from "../data/departments";

type RoomStatus = "clean" | "progress" | "inspection" | "oos";

type Room = {
  no: number;
  floor: number;
  guest?: string;
  type: string;
  status: RoomStatus;
  mins?: number;
  assignedTo?: string;
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
  10: [["clean"], ["oos"], ["clean"], ["oos"], ["clean"]],
  11: [["inspection"], ["progress", 17], ["clean"], ["oos"], ["clean"]],
  12: [["clean"], ["oos"], ["progress", 23], ["progress", 24], ["clean"]],
  13: [["clean"], ["clean"], ["oos"], ["progress", 29], ["clean"]],
  14: [["progress", 12], ["clean"], ["clean"], ["inspection"], ["clean"]],
  15: [["clean"], ["progress", 8], ["clean"], ["clean"], ["inspection"]],
  16: [["clean"], ["clean"], ["progress", 19], ["clean"], ["clean"]],
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

const STATUS_META: Record<RoomStatus, { label: string; card: string; dot: string; text: string }> = {
  clean: { label: "Clean & Ready", card: "bg-emerald-50/70 border-emerald-100", dot: "bg-emerald-500", text: "text-emerald-700" },
  progress: { label: "In Progress", card: "bg-amber-50/70 border-amber-100", dot: "bg-amber-500", text: "text-amber-700" },
  inspection: { label: "Needs Inspection", card: "bg-red-50/70 border-red-100", dot: "bg-red-500", text: "text-red-700" },
  oos: { label: "Out of Service", card: "bg-gray-50 border-gray-200", dot: "bg-gray-800", text: "text-ink-secondary" },
};

const STATUS_OPTIONS: RoomStatus[] = ["clean", "progress", "inspection", "oos"];
const STAFF = getDepartment("housekeeping")?.members.map((m) => m.name) ?? [];
const FLOORS = [10, 11, 12, 13, 14, 15, 16];

export default function HousekeepingBoard() {
  const [rooms, setRooms] = useState<Room[]>(SEED_ROOMS);
  const [floor, setFloor] = useState<number | "all">("all");
  const [occ, setOcc] = useState<"all" | "occupied" | "vacant">("all");
  const [assignFor, setAssignFor] = useState<Room | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>();

  const onFloor = useMemo(
    () => (floor === "all" ? rooms : rooms.filter((r) => r.floor === floor)),
    [rooms, floor],
  );
  const visible = useMemo(
    () =>
      onFloor.filter((r) => occ === "all" || (occ === "occupied" ? !!r.guest : !r.guest)),
    [onFloor, occ],
  );
  const filtersActive = occ !== "all";

  const count = (s: RoomStatus) => rooms.filter((r) => r.status === s).length;
  const HEAD = [
    { label: "Total Rooms", value: rooms.length, sub: null as string | null, icon: LayoutGrid, chip: "bg-gray-100 text-ink-secondary" },
    { label: "Clean & Ready", value: count("clean"), sub: `${Math.round((count("clean") / rooms.length) * 100)}%`, icon: CheckCircle2, chip: "bg-emerald-50 text-emerald-600" },
    { label: "In Progress", value: count("progress"), sub: null, icon: Loader, chip: "bg-amber-50 text-amber-600" },
    { label: "Needs Inspection", value: count("inspection"), sub: null, icon: AlertCircle, chip: "bg-orange-50 text-orange-600" },
    { label: "Out of Service", value: count("oos"), sub: null, icon: CircleSlash, chip: "bg-gray-100 text-ink-secondary" },
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
              assignedTo: status === "clean" ? undefined : staff ?? undefined,
              mins: status === "clean" ? undefined : r.mins,
            }
          : r,
      ),
    );
    setAssignFor(null);
    flash(
      status !== "clean" && staff
        ? `Room ${no} → ${STATUS_META[status].label}, assigned to ${staff}${note ? " (note added)" : ""}`
        : `Room ${no} → ${STATUS_META[status].label}`,
    );
  };

  return (
    <>
      <Topbar title="Housekeeping" />
      <Page>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {HEAD.map((s) => (
            <Card key={s.label} className="p-4">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.chip}`}>
                <s.icon className="h-4 w-4" />
              </span>
              <div className="mt-3 text-[12px] font-medium text-ink-secondary">{s.label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[26px] font-bold text-ink">{s.value}</span>
                {s.sub && <span className="text-[12px] font-medium text-emerald-600">{s.sub}</span>}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFloor("all")}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
              floor === "all"
                ? "bg-brand text-white"
                : "border border-line bg-white text-ink-secondary hover:bg-subtle"
            }`}
          >
            All Floors
          </button>
          {FLOORS.map((f) => (
            <button
              key={f}
              onClick={() => setFloor(f)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                floor === f
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              Floor {f}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-subtle p-1 text-[12px] font-medium">
              {(["all", "occupied", "vacant"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOcc(o)}
                  className={`rounded-md px-3 py-1 capitalize ${
                    occ === o ? "bg-white text-ink shadow-sm" : "text-ink-secondary"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            {filtersActive && (
              <button
                onClick={() => setOcc("all")}
                className="text-[13px] font-medium text-brand"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 text-[12px] text-ink-tertiary">
          Showing {visible.length} of {onFloor.length} rooms
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visible.map((r) => {
            const m = STATUS_META[r.status];
            const occupied = !!r.guest;
            return (
              <div key={r.no} className={`flex h-[156px] flex-col rounded-xl border p-4 ${m.card}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[14px] font-bold text-ink">Room {r.no}</div>
                  {occupied && <Badge tone="info">Occupied</Badge>}
                </div>
                <div className="mt-1 truncate text-[12px] font-medium text-ink">
                  {occupied ? r.guest : <span className="font-normal text-ink-tertiary">Vacant</span>}
                </div>
                <div className="truncate text-[12px] text-ink-tertiary">{r.type}</div>
                <div className={`mt-2 flex items-center gap-1.5 text-[12px] font-medium ${m.text}`}>
                  <span className={`h-2 w-2 rounded-full ${m.dot}`} /> {m.label}
                </div>
                <div className="mt-auto flex items-end justify-between gap-2">
                  <div className="min-w-0 text-[11px] leading-tight text-ink-secondary">
                    {r.mins != null && (
                      <div className="flex items-center gap-1 font-medium text-amber-600">
                        <Timer className="h-3 w-3" /> {r.mins} mins
                      </div>
                    )}
                    {r.assignedTo && <div className="truncate">{r.assignedTo}</div>}
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
  const [staff, setStaff] = useState(room.assignedTo ?? "");
  const [note, setNote] = useState("");
  const occupied = !!room.guest;
  const needsWork = status !== "clean";

  return (
    <Modal
      title={`Edit Room ${room.no}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(room.no, status, staff || null, note)}>Save</Button>
        </>
      }
    >
      <div className="mb-4 flex items-center justify-between text-[12px] text-ink-secondary">
        <span>
          {room.type} · {occupied ? `Occupied by ${room.guest}` : "Vacant"}
        </span>
      </div>

      {occupied && needsWork && (
        <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2.5 text-[12px] text-blue-700">
          <span className="font-semibold">Room is occupied.</span> Coordinate timing with the guest
          before entering.
        </div>
      )}

      <div className="mb-1.5 text-xs font-medium text-ink-secondary">Status</div>
      <div className="grid grid-cols-2 gap-2">
        {STATUS_OPTIONS.map((s) => {
          const m = STATUS_META[s];
          const active = s === status;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] font-medium ${
                active ? "border-brand bg-brand-tint/40 text-ink" : "border-line bg-white text-ink-secondary hover:bg-subtle"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${m.dot}`} /> {m.label}
            </button>
          );
        })}
      </div>

      {needsWork && (
        <div className="mt-5 border-t border-line pt-4">
          <Field label="Assign to">
            <Select value={staff} onChange={(e) => setStaff(e.target.value)}>
              <option value="">Unassigned</option>
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
