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
  Filter,
  Download,
  Printer,
  RefreshCw,
  Save,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Drawer } from "../components/Drawer";
import { Page, Card, Badge, Button, Tabs, Field, Input, Select } from "../components/ui";
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

export default function RoomsQrSetup({ onboarding = false }: { onboarding?: boolean }) {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Rooms &amp; QR Setup" backTo={onboarding ? "/onboarding" : undefined} />
        <Page>
          {onboarding && <SetupTabs />}
          <p className="mb-6 text-[13px] text-ink-secondary">
            Create rooms, manage room inventory, and generate guest QR codes.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add Room
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4" /> Upload Room List
            </Button>
            <Button variant="outline">
              <QrCode className="h-4 w-4" /> Generate All QR Codes
            </Button>
          </div>

          <Card className="mt-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tabs tabs={["All Rooms  152", "By Floor", "By Room Type"]} active="All Rooms  152" />
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-ink-secondary">
                  <Filter className="h-3.5 w-3.5" />
                </button>
                <div className="w-36">
                  <Select className="h-9" defaultValue="all">
                    <option value="all">All Floors</option>
                  </Select>
                </div>
                <div className="w-40">
                  <Select className="h-9" defaultValue="all">
                    <option value="all">All Room Types</option>
                  </Select>
                </div>
              </div>
            </div>

            <table className="mt-4 w-full text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                  <th className="pb-2 font-medium">Room Number</th>
                  <th className="pb-2 font-medium">Floor</th>
                  <th className="pb-2 font-medium">Room Type</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">QR Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ROOMS.map((r) => (
                  <tr key={r.no} className="border-b border-line/70">
                    <td className="py-3 text-[13px] font-medium text-ink">{r.no}</td>
                    <td className="py-3 text-[13px] text-ink-secondary">{r.floor}</td>
                    <td className="py-3">
                      <span className="flex items-center gap-2 text-[13px] text-ink">
                        {r.type === "Suite" ? (
                          <Crown className="h-4 w-4 text-amber-500" />
                        ) : (
                          <BedDouble className="h-4 w-4 text-ink-secondary" />
                        )}
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge tone={r.status === "Active" ? "success" : "neutral"}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <QrCell qr={r.qr} />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3 text-[13px] font-medium text-brand">
                        <button onClick={() => setAddOpen(true)}>Edit</button>
                        <button onClick={() => setAddOpen(true)}>
                          {r.qr === "Generated" ? "View QR" : "Generate QR"}
                        </button>
                        <MoreVertical className="h-4 w-4 text-ink-tertiary" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 flex items-center justify-between text-[12px] text-ink-tertiary">
              <span>Showing 1 to 10 of 152 rooms</span>
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

      {addOpen && (
      <Drawer title="Add Room & Generate QR" onClose={() => setAddOpen(false)}>
        <h4 className="text-[13px] font-semibold text-ink">Room Details</h4>
        <Field className="mt-3" label="Room Number" required>
          <Input defaultValue="1401" />
        </Field>
        <Field className="mt-3" label="Floor" required>
          <Select defaultValue="14">
            <option>14</option>
            <option>13</option>
            <option>12</option>
          </Select>
        </Field>
        <Field className="mt-3" label="Room Type" required>
          <Select defaultValue="Executive Suite">
            <option>Executive Suite</option>
            <option>Deluxe Room</option>
            <option>Suite</option>
          </Select>
        </Field>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Status" required>
            <Select defaultValue="Active">
              <option>Active</option>
              <option>Out of Service</option>
            </Select>
          </Field>
          <Field label="QR Access Status" required>
            <Select defaultValue="QR Generated">
              <option>QR Generated</option>
              <option>QR Pending</option>
            </Select>
          </Field>
        </div>

        <h4 className="mt-5 text-[13px] font-semibold text-ink">QR Preview</h4>
        <Card className="mt-2 p-4">
          <div className="flex gap-4">
            <FakeQR seed="room-1401" size={104} className="rounded-md" />
            <div className="text-[12px]">
              <div className="text-[14px] font-semibold text-ink">Prime Hotel</div>
              <div className="text-ink-secondary">Room 1401</div>
              <div className="text-ink-secondary">Executive Suite</div>
              <p className="mt-2 text-[11px] text-ink-tertiary">
                Guest scans this QR to open WhatsApp and start a room-linked conversation.
              </p>
            </div>
          </div>
        </Card>

        <Button className="mt-4 w-full">
          <Save className="h-4 w-4" /> Save Room
        </Button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4" /> Download QR
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4" /> Print QR Card
          </Button>
        </div>
        <Button variant="outline" className="mt-2 w-full">
          <RefreshCw className="h-4 w-4" /> Regenerate QR
        </Button>
        <p className="mt-3 text-[11px] text-ink-tertiary">
          QR will link to the hotel&apos;s WhatsApp number and room context.
        </p>
      </Drawer>
      )}
    </div>
  );
}
