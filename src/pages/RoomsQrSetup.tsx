import { useState } from "react";
import {
  Plus,
  Upload,
  QrCode,
  BedDouble,
  Crown,
  CheckCircle2,
  Clock,
  MinusCircle,
  MoreVertical,
  SlidersHorizontal,
  Search,
  Download,
  RefreshCw,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Drawer } from "../components/Drawer";
import { Page, Card, Badge, Button, Field, Input, Select } from "../components/ui";
import { FakeQR } from "../components/FakeQR";

type QR = "Generated" | "Pending" | "None";

const ROOMS: {
  no: string;
  floor: number;
  type: string;
  status: "Active" | "Out of Service";
  qr: QR;
}[] = [
  { no: "1001", floor: 10, type: "Deluxe Room", status: "Active", qr: "Generated" },
  { no: "1002", floor: 10, type: "Deluxe Room", status: "Active", qr: "Pending" },
  { no: "1003", floor: 10, type: "Suite", status: "Active", qr: "Generated" },
  { no: "1101", floor: 11, type: "Deluxe Room", status: "Active", qr: "Generated" },
  { no: "1102", floor: 11, type: "Deluxe Room", status: "Out of Service", qr: "None" },
  { no: "1201", floor: 12, type: "Suite", status: "Active", qr: "Generated" },
  { no: "1202", floor: 12, type: "Deluxe Room", status: "Active", qr: "Generated" },
  { no: "1203", floor: 12, type: "Deluxe Room", status: "Active", qr: "Pending" },
  { no: "1301", floor: 13, type: "Suite", status: "Active", qr: "Generated" },
  { no: "1302", floor: 13, type: "Deluxe Room", status: "Active", qr: "Generated" },
];

function QrCell({ qr }: { qr: QR }) {
  if (qr === "Generated")
    return (
      <span className="flex items-center gap-1.5 text-[13px] text-emerald-600">
        <CheckCircle2 className="h-4 w-4" /> QR Generated
      </span>
    );
  if (qr === "Pending")
    return (
      <span className="flex items-center gap-1.5 text-[13px] text-amber-600">
        <Clock className="h-4 w-4" /> QR Pending
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-ink-tertiary">
      <MinusCircle className="h-4 w-4" /> QR Not Generated
    </span>
  );
}

type Room = (typeof ROOMS)[number];

export default function RoomsQrSetup({ onboarding = false }: { onboarding?: boolean }) {
  const [drawer, setDrawer] = useState<Room | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [floor, setFloor] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [qr, setQr] = useState("all");
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
      (status === "all" || r.status === status) &&
      (qr === "all" || r.qr === qr),
  );
  const activeFilters = [floor, type, status, qr].filter((v) => v !== "all").length;
  const clear = () => { setFloor("all"); setType("all"); setStatus("all"); setQr("all"); };

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Rooms &amp; QR Setup" backTo={onboarding ? "/onboarding" : undefined} />
        <Page>
          {onboarding && <SetupTabs />}

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setDrawer("new")}>
              <Plus className="h-4 w-4" /> Add Room
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4" /> Upload Room List
            </Button>
            <Button variant="outline" onClick={() => flash("QR codes generated for all rooms")}>
              <QrCode className="h-4 w-4" /> Generate All QR Codes
            </Button>
          </div>

          <Card table className="mt-5 overflow-hidden">
            <div className="relative flex flex-wrap items-center gap-3 p-5">
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
                    <Field label="QR status">
                      <Select value={qr} onChange={(e) => setQr(e.target.value)}>
                        <option value="all">All</option>
                        <option value="Generated">QR Generated</option>
                        <option value="Pending">QR Pending</option>
                        <option value="None">QR Not Generated</option>
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

            <table className="w-full table-fixed text-left">
              <colgroup><col /><col /><col /><col /><col /><col className="w-16" /></colgroup>
              <thead>
                <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                  <th className="py-3.5 pl-6 font-medium">Room Number</th>
                  <th className="py-3.5 pl-6 font-medium">Floor</th>
                  <th className="py-3.5 pl-6 font-medium">Room Type</th>
                  <th className="py-3.5 pl-6 font-medium">Status</th>
                  <th className="py-3.5 pl-6 font-medium">QR Status</th>
                  <th className="py-3.5 pr-6" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.no} onClick={() => setDrawer(r)} className="cursor-pointer border-b border-line/50 hover:bg-subtle/50">
                    <td className="text-[14px] font-medium text-ink py-3.5 pl-6 pr-3">{r.no}</td>
                    <td className="text-[14px] text-ink-secondary py-3.5 pl-6 pr-3">{r.floor}</td>
                    <td className="py-3.5 pl-6 pr-3">
                      <span className="flex items-center gap-2 text-[13px] text-ink">
                        {r.type === "Suite" ? (
                          <Crown className="h-4 w-4 text-amber-500" />
                        ) : (
                          <BedDouble className="h-4 w-4 text-ink-secondary" />
                        )}
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3.5 pl-6 pr-3">
                      <Badge tone={r.status === "Active" ? "success" : "neutral"}>{r.status}</Badge>
                    </td>
                    <td className="py-3.5 pl-6 pr-3"><QrCell qr={r.qr} /></td>
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
                          <button onClick={() => { setDrawer(r); setMenuFor(null); }} className="block w-full rounded-md px-3 py-2 text-left text-[13px] text-ink hover:bg-subtle">{r.qr === "Generated" ? "View QR" : "Generate QR"}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={6} className="text-center text-[14px] text-ink-tertiary py-3.5 pl-6 pr-3">No rooms match these filters.</td></tr>
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
  const [version, setVersion] = useState(1);

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

      <h4 className="mt-6 text-[13px] font-semibold text-ink">QR code</h4>
      <Card className="mt-2 p-4">
        <div className="flex gap-4">
          <FakeQR seed={`room-${no || "new"}-${version}`} size={104} className="rounded-md" />
          <div className="text-[12px]">
            <div className="text-[14px] font-semibold text-ink">Prime Hotel</div>
            <div className="text-ink-secondary">{no ? `Room ${no}` : "Room —"}</div>
            <div className="text-ink-secondary">{type || "Room type"}</div>
            <p className="mt-2 text-[11px] text-ink-tertiary">
              Guest scans this QR to open WhatsApp and start a room-linked conversation.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button disabled={!no.trim()} onClick={() => onDone(`QR saved for room ${no}`)} className="disabled:opacity-40">
          <Download className="h-4 w-4" /> Save QR
        </Button>
        <Button variant="outline" onClick={() => setVersion((v) => v + 1)}>
          <RefreshCw className="h-4 w-4" /> Regenerate
        </Button>
      </div>
    </Drawer>
  );
}
