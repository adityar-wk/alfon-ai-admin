import { useMemo, useRef, useState } from "react";
import {
  Plus,
  MoreVertical,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Drawer } from "../components/Drawer";
import { Page, Card, Badge, Button, Field, Input, Select, Modal } from "../components/ui";
import { FakeQR } from "../components/FakeQR";
import { useGoNextStep } from "../data/onboarding";

const ROOMS: {
  no: string;
  floor: number;
  type: string;
  status: "Active" | "Out of Service";
}[] = [
  { no: "1001", floor: 10, type: "Deluxe Room", status: "Active" },
  { no: "1002", floor: 10, type: "Deluxe Room", status: "Active" },
  { no: "1003", floor: 10, type: "Suite", status: "Active" },
  { no: "1101", floor: 11, type: "Deluxe Room", status: "Active" },
  { no: "1102", floor: 11, type: "Deluxe Room", status: "Out of Service" },
  { no: "1201", floor: 12, type: "Suite", status: "Active" },
  { no: "1202", floor: 12, type: "Deluxe Room", status: "Active" },
  { no: "1203", floor: 12, type: "Deluxe Room", status: "Active" },
  { no: "1301", floor: 13, type: "Suite", status: "Active" },
  { no: "1302", floor: 13, type: "Deluxe Room", status: "Active" },
];

type Room = (typeof ROOMS)[number] & { fresh?: boolean };

const SEED_TYPES = Array.from(new Set(ROOMS.map((r) => r.type)));

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === "," && !quoted) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseRooms(text: string): Room[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].toLowerCase();
  const start = header.includes("room") ? 1 : 0;
  return lines.slice(start).flatMap((line) => {
    const [no, floor, type, status] = splitCsv(line);
    if (!no) return [];
    return [{
      no,
      floor: Number(floor) || 0,
      type: type || "Standard",
      status: /out/i.test(status || "") ? "Out of Service" as const : "Active" as const,
    }];
  });
}

function downloadTemplate() {
  const blob = new Blob(["Room number,Floor,Room type\n101,1,Deluxe Room\n"], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rooms-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** every guest scans the same code, regardless of room — it opens WhatsApp and the guest gives their room number there */
function HotelQrCard({ flash }: { flash: (m: string) => void }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-ink">Hotel QR Code</h3>
      <button
        type="button"
        aria-label="Download QR code"
        onClick={() => flash("QR code downloaded")}
        className="group relative mt-2 block overflow-hidden rounded-md"
      >
        <FakeQR seed="hotel" size={104} className="rounded-md" />
        <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-[13px] font-semibold text-ink opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          Download
        </span>
      </button>
    </div>
  );
}

export default function RoomsQrSetup({ onboarding = false }: { onboarding?: boolean }) {
  const goNext = useGoNextStep(7);
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [types, setTypes] = useState<string[]>(SEED_TYPES);
  const [floorStart, setFloorStart] = useState("10");
  const [floorCount, setFloorCount] = useState("4");
  const [typeDraft, setTypeDraft] = useState("");
  const [drawer, setDrawer] = useState<Room | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [csvOpen, setCsvOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  const createType = () => {
    const name = typeDraft.trim();
    if (!name) return;
    if (types.some((t) => t.toLowerCase() === name.toLowerCase())) {
      setTypeDraft("");
      flash("That room type already exists");
      return;
    }
    setTypes((list) => [...list, name]);
    setTypeDraft("");
  };

  const floors = useMemo(() => {
    const start = Number(floorStart);
    const count = Number(floorCount);
    if (!Number.isInteger(start) || start < 0 || !Number.isInteger(count) || count < 1 || count > 150) return [];
    return Array.from({ length: count }, (_, i) => start + i);
  }, [floorStart, floorCount]);

  const importFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseRooms(String(reader.result ?? ""));
      if (!parsed.length) {
        flash("No rooms found in that file");
        return;
      }
      const have = new Set(rooms.map((r) => r.no));
      const fresh = parsed.filter((r) => r.no && !have.has(r.no));
      const added = floors.length ? fresh.filter((r) => floors.includes(r.floor)) : fresh;
      const skipped = fresh.length - added.length;
      if (!added.length) {
        flash(skipped ? "Those floors are outside the range" : "Those rooms are already in the list");
        return;
      }
      setRooms((current) => [...current.map((r) => ({ ...r, fresh: false })), ...added.map((r) => ({ ...r, fresh: true }))]);
      setTypes((list) => {
        const next = [...list];
        for (const r of added) {
          if (r.type && !next.some((t) => t.toLowerCase() === r.type.toLowerCase())) next.push(r.type);
        }
        return next;
      });
      setCsvOpen(false);
      flash(skipped ? `${added.length} rooms added. ${skipped} outside the floor range` : `${added.length} rooms added`);
    };
    reader.readAsText(f);
  };

  const floorOptions = floors;
  const typeOptions = useMemo(
    () => Array.from(new Set([...types, ...rooms.map((r) => r.type)])),
    [types, rooms],
  );
  const rows = rooms.filter(
    (r) =>
      (!query.trim() || r.no.includes(query.trim())) &&
      (floor === "all" || String(r.floor) === floor) &&
      (type === "all" || r.type === type) &&
      (status === "all" || r.status === status),
  );
  const activeFilters = [floor, type, status].filter((v) => v !== "all").length;
  const clear = () => { setFloor("all"); setType("all"); setStatus("all"); };

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Rooms &amp; QR Setup" backTo={onboarding ? "/onboarding" : undefined} />
        <Page>
          {onboarding && <SetupTabs />}

          <HotelQrCard flash={flash} />

          <div className="mt-8 grid max-w-3xl items-start gap-x-16 gap-y-6 sm:grid-cols-2">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Room types</h3>
              <div className="mt-2 flex gap-2">
                <Input
                  value={typeDraft}
                  onChange={(e) => setTypeDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") createType(); }}
                  placeholder="e.g. Ocean Suite"
                />
                <Button variant="outline" className="h-10 shrink-0 px-3" disabled={!typeDraft.trim()} onClick={createType}>Add</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {types.map((t) => (
                  <span key={t} className="rounded-full bg-subtle px-2.5 py-1 text-[12px] text-ink">{t}</span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-ink">Floors</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Field label="Start">
                  <Input
                    inputMode="numeric"
                    aria-label="Starting floor"
                    value={floorStart}
                    onChange={(e) => setFloorStart(e.target.value.replace(/\D/g, ""))}
                    placeholder="10"
                  />
                </Field>
                <Field label="How many">
                  <Input
                    inputMode="numeric"
                    aria-label="Number of floors"
                    value={floorCount}
                    onChange={(e) => setFloorCount(e.target.value.replace(/\D/g, ""))}
                    placeholder="4"
                  />
                </Field>
              </div>
              {floors.length > 0 && (
                <p className="mt-2 text-[13px] text-ink-secondary">
                  {floors.length === 1 ? `Floor ${floors[0]}` : `Floors ${floors[0]}–${floors[floors.length - 1]}`}
                </p>
              )}
            </div>
          </div>

          <div className="relative mt-8 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search room number…"
                className="h-10 w-full rounded-control border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
              />
            </div>
            <div className="relative shrink-0">
              <button
                aria-label="Filters"
                onClick={() => setFilterOpen((o) => !o)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg border ${filterOpen || activeFilters ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"}`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilters > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">{activeFilters}</span>}
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-12 z-20 w-[280px] space-y-3 rounded-xl border border-line bg-white p-4 shadow-lg">
                  <Field label="Floor">
                    <Select value={floor} onChange={(e) => setFloor(e.target.value)}>
                      <option value="all">All floors</option>
                      {floorOptions.map((f) => <option key={f} value={f}>Floor {f}</option>)}
                    </Select>
                  </Field>
                  <Field label="Room type">
                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="all">All room types</option>
                      {typeOptions.map((t) => <option key={t}>{t}</option>)}
                    </Select>
                  </Field>
                  <Field label="Status">
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="all">All</option>
                      <option>Active</option>
                      <option>Out of Service</option>
                    </Select>
                  </Field>
                  <div className="flex items-center justify-between text-[12px] text-ink-secondary">
                    <span>{rows.length} rooms match</span>
                    <button onClick={() => setFilterOpen(false)} className="font-semibold text-brand">Done</button>
                  </div>
                </div>
              )}
            </div>
            {activeFilters > 0 && <button onClick={clear} className="text-[13px] font-medium text-brand">Clear filters</button>}
            <span className="text-[12px] text-ink-tertiary">{rows.length} of {rooms.length} rooms</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setCsvOpen(true)}>Add room through CSV</Button>
              <Button onClick={() => setDrawer("new")}>
                <Plus className="h-4 w-4" /> Add room
              </Button>
            </div>
          </div>

          <Card table className="mt-4 overflow-hidden">
            <table className="w-full table-fixed text-left">
              <colgroup><col /><col /><col /><col /><col className="w-16" /></colgroup>
              <thead>
                <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                  <th className="py-3.5 pl-6 font-medium">Room Number</th>
                  <th className="py-3.5 pl-6 font-medium">Floor</th>
                  <th className="py-3.5 pl-6 font-medium">Room Type</th>
                  <th className="py-3.5 pl-6 font-medium">Status</th>
                  <th className="py-3.5 pr-6" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.no} onClick={() => setDrawer(r)} className={`cursor-pointer border-b border-line/50 hover:bg-subtle/50 ${r.fresh ? "bg-brand-tint/30" : ""}`}>
                    <td className="text-[14px] font-medium text-ink py-3.5 pl-6 pr-3">{r.no}</td>
                    <td className="text-[14px] text-ink-secondary py-3.5 pl-6 pr-3">{r.floor}</td>
                    <td className="text-[13px] text-ink py-3.5 pl-6 pr-3">{r.type}</td>
                    <td className="py-3.5 pl-6 pr-3">
                      <Badge tone={r.status === "Active" ? "success" : "neutral"}>{r.status}</Badge>
                    </td>
                    <td className="relative text-right py-3.5 pr-6" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setMenuFor((m) => (m === r.no ? null : r.no))}
                        aria-label={`Actions for room ${r.no}`}
                        className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuFor === r.no && (
                        <div className="absolute right-0 top-10 z-20 w-36 rounded-lg border border-line bg-white p-1 text-left shadow-lg">
                          <button onClick={() => { setDrawer(r); setMenuFor(null); }} className="block w-full rounded-md px-3 py-2 text-left text-[13px] text-ink hover:bg-subtle">Edit</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={5} className="text-center text-[14px] text-ink-tertiary py-3.5 pl-6 pr-3">No rooms match these filters.</td></tr>
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-3 text-[12px] text-ink-tertiary">
              <span>Showing {rows.length} of {rooms.length} rooms</span>
            </div>
          </Card>

          {onboarding && (
            <div className="mt-6">
              <Button onClick={goNext}>Continue →</Button>
            </div>
          )}
        </Page>
      </div>

      {drawer && (
        <RoomDrawer
          key={drawer === "new" ? "new" : drawer.no}
          room={drawer === "new" ? null : drawer}
          types={typeOptions}
          floors={floorOptions}
          onClose={() => setDrawer(null)}
          onDone={(next) => {
            const originalNo = drawer === "new" ? null : drawer.no;
            if (rooms.some((r) => r.no === next.no && r.no !== originalNo)) {
              flash("That room number already exists");
              return;
            }
            setRooms((list) => (originalNo ? list.map((r) => (r.no === originalNo ? next : r)) : [...list, next]));
            if (!types.some((t) => t.toLowerCase() === next.type.toLowerCase())) setTypes((list) => [...list, next.type]);
            flash(originalNo ? `Room ${next.no} updated` : `Room ${next.no} added`);
            setDrawer(null);
          }}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importFile(f);
          e.target.value = "";
        }}
      />

      {csvOpen && (
        <Modal title="Add room through CSV" onClose={() => setCsvOpen(false)}>
          <p className="text-[13px] text-ink-secondary">Room number, floor, and room type.</p>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={() => fileRef.current?.click()}>Choose file</Button>
            <Button variant="outline" className="flex-1" onClick={downloadTemplate}>Template</Button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </div>
  );
}

function RoomDrawer({
  room,
  types,
  floors,
  onClose,
  onDone,
}: {
  room: Room | null;
  types: string[];
  floors: number[];
  onClose: () => void;
  onDone: (room: Room) => void;
}) {
  const [no, setNo] = useState(room?.no ?? "");
  const [floor, setFloor] = useState(room ? String(room.floor) : floors[0] ? String(floors[0]) : "");
  const [type, setType] = useState(room?.type ?? types[0] ?? "");
  const [status, setStatus] = useState<Room["status"]>(room?.status ?? "Active");
  const ready = no.trim() && floor && type;

  return (
    <Drawer title={room ? `Room ${room.no}` : "Add Room"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Room number" required>
          <Input value={no} onChange={(e) => setNo(e.target.value)} placeholder="e.g. 1401" />
        </Field>
        <Field label="Floor" required>
          <Select value={floor} onChange={(e) => setFloor(e.target.value)}>
            {!floors.length && <option value="">Set a floor range first</option>}
            {floors.map((f) => <option key={f} value={f}>{f}</option>)}
          </Select>
        </Field>
        <Field label="Room type" required>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {!types.length && <option value="">Create a room type first</option>}
            {types.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Status" required>
          <Select value={status} onChange={(e) => setStatus(e.target.value as Room["status"])}>
            <option>Active</option>
            <option>Out of Service</option>
          </Select>
        </Field>
      </div>

      <div className="mt-6">
        <Button
          disabled={!ready}
          onClick={() => onDone({ no: no.trim(), floor: Number(floor), type, status })}
          className="w-full disabled:opacity-40"
        >
          {room ? "Save changes" : "Add room"}
        </Button>
      </div>
    </Drawer>
  );
}
