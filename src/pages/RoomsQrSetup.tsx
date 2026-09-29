import { useState } from "react";
import {
  Plus,
  Upload,
  MoreVertical,
  SlidersHorizontal,
  Search,
  Download,
  RefreshCw,
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

type Room = (typeof ROOMS)[number];

/** every guest scans the same code, regardless of room — it opens WhatsApp and the guest gives their room number there */
function HotelQrCard({ flash }: { flash: (m: string) => void }) {
  const [version, setVersion] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <Card className="p-6">
      <h3 className="text-[15px] font-semibold text-ink">Hotel QR Code</h3>
      <p className="mt-1 max-w-md text-[13px] text-ink-secondary">
        One QR code for the whole property — guests scan it anywhere to start a WhatsApp conversation. It is not tied to a specific room.
      </p>
      <div className="mt-4 flex items-center gap-4">
        <FakeQR seed={`hotel-${version}`} size={104} className="rounded-md" />
        <div className="flex gap-2">
          <Button onClick={() => flash("QR code downloaded")}>
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </Button>
        </div>
      </div>

      {confirmOpen && (
        <Modal
          title="Regenerate QR code?"
          onClose={() => setConfirmOpen(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button
                tone="bg-red-600"
                onClick={() => {
                  setVersion((v) => v + 1);
                  setConfirmOpen(false);
                  flash("QR code regenerated");
                }}
              >
                Regenerate
              </Button>
            </>
          }
        >
          <p className="text-[13px] text-ink-secondary">
            Any printed copies of the current QR code — in rooms, at the desk, on table tents — will stop working immediately. You'll need to print and place the new code everywhere the old one was used.
          </p>
        </Modal>
      )}
    </Card>
  );
}

export default function RoomsQrSetup({ onboarding = false }: { onboarding?: boolean }) {
  const goNext = useGoNextStep(8);
  const [drawer, setDrawer] = useState<Room | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  const floors = Array.from(new Set(ROOMS.map((r) => r.floor)));
  const types = Array.from(new Set(ROOMS.map((r) => r.type)));
  const rows = ROOMS.filter(
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

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => setDrawer("new")}>
              <Plus className="h-4 w-4" /> Add Room
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4" /> Upload Room List
            </Button>
          </div>

          <div className="relative mt-5 flex flex-wrap items-center gap-3">
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
                      {floors.map((f) => <option key={f} value={f}>Floor {f}</option>)}
                    </Select>
                  </Field>
                  <Field label="Room type">
                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="all">All room types</option>
                      {types.map((t) => <option key={t}>{t}</option>)}
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
            <span className="ml-auto text-[12px] text-ink-tertiary">{rows.length} of 152 rooms</span>
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
                  <tr key={r.no} onClick={() => setDrawer(r)} className="cursor-pointer border-b border-line/50 hover:bg-subtle/50">
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
              <span>Showing {rows.length} of 152 rooms</span>
              <span className="flex items-center gap-1">
                <button className="rounded border border-line px-2 py-0.5">‹</button>
                <button className="rounded border border-brand px-2 py-0.5 text-brand">1</button>
                <button className="rounded border border-line px-2 py-0.5">2</button>
                <button className="rounded border border-line px-2 py-0.5">3</button>
                <span className="px-1">…</span>
                <button className="rounded border border-line px-2 py-0.5">16</button>
                <button className="rounded border border-line px-2 py-0.5">›</button>
              </span>
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
          onClose={() => setDrawer(null)}
          onDone={(m) => { flash(m); setDrawer(null); }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </div>
  );
}

function RoomDrawer({ room, onClose, onDone }: { room: Room | null; onClose: () => void; onDone: (msg: string) => void }) {
  const [no, setNo] = useState(room?.no ?? "");
  const [floor, setFloor] = useState(room ? String(room.floor) : "");
  const [type, setType] = useState(room?.type ?? "");
  const [status, setStatus] = useState<Room["status"]>(room?.status ?? "Active");

  return (
    <Drawer title={room ? `Room ${room.no}` : "Add Room"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Room number" required>
          <Input value={no} onChange={(e) => setNo(e.target.value)} placeholder="e.g. 1401" />
        </Field>
        <Field label="Floor" required>
          <Input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="e.g. 14" />
        </Field>
        <Field label="Room type" required>
          <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Deluxe Room" />
        </Field>
        <Field label="Status" required>
          <Select value={status} onChange={(e) => setStatus(e.target.value as Room["status"])}>
            <option>Active</option>
            <option>Out of Service</option>
          </Select>
        </Field>
      </div>

      <div className="mt-6">
        <Button disabled={!no.trim()} onClick={() => onDone(room ? `Room ${no} updated` : `Room ${no} added`)} className="w-full disabled:opacity-40">
          {room ? "Save changes" : "Add room"}
        </Button>
      </div>
    </Drawer>
  );
}
