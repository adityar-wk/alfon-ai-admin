import { useState, type ReactNode } from "react";
import { Bell, Filter, Plus, Search, Menu as MenuIcon, ChevronRight, ChevronLeft, SlidersHorizontal, LogOut, ListChecks, MessageCircle, Home as HomeIcon, Wrench, Trash2, Download } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Badge, Button, Field, Input, Select, Textarea, PhoneInput, Toggle, Stars, Modal, Tabs } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { Donut } from "../components/Donut";
import Orb from "../components/Orb";
import { Flag } from "../components/Flag";
import { FakeQR } from "../components/FakeQR";
import { NotificationBell } from "../components/Notifications";
import { SlaClock } from "../components/SlaClock";
import { ArrivalCalendar } from "./PreArrival";
import { STATUS_PILL, COMPLAINT_PILL, useClock, type TaskStatusLabel } from "../data/attention";
import {
  ScreenHeader, ChatRow, Chips, StatCard, SlaRing, Avatar, PrimaryButton, GhostButton, Segmented, FloatingNav, TaskCard,
} from "../linestaff/mobile";

/* ------------------------------------------------------------------ inventory */

type Item = { id: string; name: string; group: string; note: string };

const INVENTORY: Item[] = [
  { id: "colors", name: "Colours", group: "Foundations", note: "Brand orange, charcoal ink, greys and the status palette" },
  { id: "type", name: "Typography", group: "Foundations", note: "Inter for text, Sora for digits, Poppins for the SLA clock" },
  { id: "surface", name: "Surfaces & elevation", group: "Foundations", note: "Card, table surface, popover, phone card shadow" },
  { id: "button", name: "Button", group: "Actions", note: "Primary, outline, ghost, disabled, with icon" },
  { id: "icon-button", name: "Icon button", group: "Actions", note: "Plain, filled and funnel-with-count buttons" },
  { id: "input", name: "Input, Select, Textarea", group: "Forms", note: "Field wrapper with label, hint and required mark" },
  { id: "phone", name: "Phone number field", group: "Forms", note: "Country code plus number, digits only" },
  { id: "search", name: "Search field", group: "Forms", note: "Search with the single funnel filter beside it" },
  { id: "toggle", name: "Toggle, checkbox, stars", group: "Forms", note: "Small selection controls" },
  { id: "calendar", name: "Date picker", group: "Forms", note: "Arrival-date calendar with arrival dots" },
  { id: "badge", name: "Badge & tags", group: "Status", note: "Tinted tones and the Complaint tag" },
  { id: "status", name: "Task status", group: "Status", note: "Coloured text only, one rule for every list" },
  { id: "sla", name: "SLA clock", group: "Status", note: "Live countdown, counts up once breached" },
  { id: "toast", name: "Toast", group: "Feedback", note: "Short confirmation at the bottom of the screen" },
  { id: "card", name: "Card & stat card", group: "Data display", note: "Standard card and the KPI card" },
  { id: "table", name: "Data table", group: "Data display", note: "The Pre-Arrival table style used everywhere" },
  { id: "avatar", name: "Avatar, flag, QR", group: "Data display", note: "Initials, country flag and QR code" },
  { id: "charts", name: "Donut & health orb", group: "Data display", note: "Pastel donut and the health-score orb" },
  { id: "tabs", name: "Tabs", group: "Navigation", note: "Underline tabs" },
  { id: "sidebar", name: "Sidebar item & top bar", group: "Navigation", note: "Nav item states and the title-only top bar" },
  { id: "notifications", name: "Notification centre", group: "Navigation", note: "Bell with unread count, filter by kind" },
  { id: "modal", name: "Modal", group: "Overlays", note: "Centred dialog with footer buttons" },
  { id: "drawer", name: "Drawer", group: "Overlays", note: "Right-hand detail panel" },
  { id: "m-header", name: "Mobile header", group: "Mobile app", note: "Back arrow, 20px semibold title, plain icon buttons" },
  { id: "m-chat", name: "Chat row", group: "Mobile app", note: "Name, room, message; time, unread dot, complaint marker" },
  { id: "m-chips", name: "Chips & segmented", group: "Mobile app", note: "Filter chips under the search bar" },
  { id: "m-cards", name: "Task card, stat card, SLA ring", group: "Mobile app", note: "Cards with the soft shadow" },
  { id: "m-buttons", name: "Mobile buttons", group: "Mobile app", note: "Primary and ghost full-width buttons" },
  { id: "m-list", name: "Menu line item", group: "Mobile app", note: "Flat row with hairline divider (More screen)" },
  { id: "m-nav", name: "Bottom navigation", group: "Mobile app", note: "Floating nav with active underline" },
];

const GROUPS = Array.from(new Set(INVENTORY.map((i) => i.group)));

/* ------------------------------------------------------------------ helpers */

function Section({ id, title, note, children }: { id: string; title: string; note: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h3 className="text-[18px] font-semibold text-ink">{title}</h3>
      <p className="mt-1 text-[13px] text-ink-secondary">{note}</p>
      <Card className="mt-4 p-6">{children}</Card>
    </section>
  );
}

const Label = ({ children }: { children: ReactNode }) => (
  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">{children}</div>
);

/** a phone-width surface for the mobile components */
function Phone({ children, grey = false }: { children: ReactNode; grey?: boolean }) {
  return <div className={`relative w-[360px] max-w-full overflow-hidden rounded-[28px] border border-line p-4 ${grey ? "bg-[#F6F6F8]" : "bg-white"}`}>{children}</div>;
}

function Swatch({ name, hex, cls, dark = false }: { name: string; hex: string; cls: string; dark?: boolean }) {
  return (
    <div className="w-[132px]">
      <div className={`h-14 rounded-xl border border-line/60 ${cls}`} />
      <div className="mt-2 text-[12px] font-medium text-ink">{name}</div>
      <div className={`text-[11px] ${dark ? "text-ink-tertiary" : "text-ink-tertiary"}`}>{hex}</div>
    </div>
  );
}

const STATUSES: TaskStatusLabel[] = ["Escalated", "SLA breached", "SLA at risk", "In Progress", "Assigned", "Pending", "Completed"];

/* ------------------------------------------------------------------ page */

export default function ComponentDesign() {
  useClock();
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [chip, setChip] = useState("All");
  const [seg, setSeg] = useState("Tasks");
  const [navKey, setNavKey] = useState("tasks");
  const [day, setDay] = useState<number | null>(26);
  const [on, setOn] = useState(true);

  return (
    <>
      <Topbar title="Component Design" />
      <Page>
        {/* ---------------------------------------------------- inventory */}
        <h2 className="text-[20px] font-semibold text-ink">Component inventory</h2>
        <p className="mt-1 text-[13px] text-ink-secondary">Every reusable piece of the prototype. Click a name to jump to its design.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {GROUPS.map((g) => (
            <Card key={g} className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">{g}</div>
              <ul className="mt-3 space-y-2">
                {INVENTORY.filter((i) => i.group === g).map((i) => (
                  <li key={i.id}>
                    <a href={`#${i.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(i.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="block text-[14px] font-medium text-ink hover:text-brand">
                      {i.name}
                    </a>
                    <span className="block text-[12px] text-ink-tertiary">{i.note}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-12 space-y-12">
          {/* ------------------------------------------------ foundations */}
          <Section id="colors" title="Colours" note="Never pure black: the darkest colour is a soft charcoal.">
            <Label>Brand and neutrals</Label>
            <div className="flex flex-wrap gap-5">
              <Swatch name="Brand" hex="#F15A24" cls="bg-brand" />
              <Swatch name="Brand tint" hex="#FEEFE6" cls="bg-brand-tint" />
              <Swatch name="Brand hover" hex="#D94E1C" cls="bg-brand-hover" />
              <Swatch name="Ink" hex="#2B2E35" cls="bg-ink" />
              <Swatch name="Ink secondary" hex="#6B7280" cls="bg-ink-secondary" />
              <Swatch name="Ink tertiary" hex="#A0A4AB" cls="bg-ink-tertiary" />
              <Swatch name="Line" hex="#EDEDED" cls="bg-line" />
              <Swatch name="Subtle" hex="#FAFAFA" cls="bg-subtle" />
            </div>
            <div className="mt-8"><Label>Status text colours</Label></div>
            <div className="flex flex-wrap gap-6">
              {[["Escalated", "text-red-600", "#DC2626"], ["SLA breached", "text-orange-600", "#EA580C"], ["SLA at risk", "text-amber-600", "#D97706"], ["In Progress", "text-sky-600", "#0284C7"], ["Assigned", "text-cyan-600", "#0891B2"], ["Pending", "text-slate-500", "#64748B"], ["Completed", "text-emerald-600", "#059669"], ["Complaint tag", "text-violet-600", "#7C3AED"]].map(([n, c, h]) => (
                <div key={n}><div className={`text-[14px] font-semibold ${c}`}>{n}</div><div className="text-[11px] text-ink-tertiary">{h}</div></div>
              ))}
            </div>
            <div className="mt-8"><Label>Pastel chart palette</Label></div>
            <div className="flex gap-2">{["#C99AF0", "#8DC3F0", "#6FDDB7", "#F7BC7A", "#F595A5", "#B3A0F0", "#7FD6DE", "#F4A9CE"].map((c) => <span key={c} className="h-8 w-8 rounded-full" style={{ background: c }} />)}</div>
          </Section>

          <Section id="type" title="Typography" note="Inter for all text. Digits render in Sora; the SLA clock uses Poppins digits.">
            <div className="space-y-4">
              <div className="flex items-baseline gap-6"><span className="w-40 text-[11px] text-ink-tertiary">Page title · 19 / 600</span><span className="text-[19px] font-semibold text-ink">Pre-Arrival</span></div>
              <div className="flex items-baseline gap-6"><span className="w-40 text-[11px] text-ink-tertiary">Section · 16–18 / 600</span><span className="text-[17px] font-semibold text-ink">Needs Your Attention</span></div>
              <div className="flex items-baseline gap-6"><span className="w-40 text-[11px] text-ink-tertiary">Body · 14 / 400</span><span className="text-[14px] text-ink">Guests who have not been messaged yet</span></div>
              <div className="flex items-baseline gap-6"><span className="w-40 text-[11px] text-ink-tertiary">Secondary · 13 / 400</span><span className="text-[13px] text-ink-secondary">Upload a CSV or add people one by one</span></div>
              <div className="flex items-baseline gap-6"><span className="w-40 text-[11px] text-ink-tertiary">Caption · 12 / 400</span><span className="text-[12px] text-ink-tertiary">Showing 10 of 152 rooms</span></div>
              <div className="flex items-baseline gap-6"><span className="w-40 text-[11px] text-ink-tertiary">Table head · 12 / 500 caps</span><span className="text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">Assigned to</span></div>
              <div className="flex items-baseline gap-6"><span className="w-40 text-[11px] text-ink-tertiary">Digits · Sora</span><span className="text-[28px] font-bold text-ink">0123456789</span></div>
              <div className="flex items-baseline gap-6"><span className="w-40 text-[11px] text-ink-tertiary">SLA clock · Poppins</span><span className="text-[28px] font-semibold tabular-nums text-red-600" style={{ fontFamily: '"Poppins", "Sora", "Inter", sans-serif' }}>-13:20</span></div>
            </div>
          </Section>

          <Section id="surface" title="Surfaces & elevation" note="Flat by default; only cards, popovers and phone cards carry a shadow.">
            <div className="flex flex-wrap gap-6">
              {[["Card", "rounded-card border border-line bg-white"], ["Table surface", "rounded-[20px] border border-line/40 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]"], ["Popover", "rounded-xl border border-line bg-white shadow-lg"], ["Phone card", "rounded-2xl bg-white shadow-[0_2px_10px_rgba(43,46,53,0.08)]"]].map(([n, c]) => (
                <div key={n} className="w-[190px]"><div className={`h-20 ${c}`} /><div className="mt-2 text-[12px] font-medium text-ink">{n}</div></div>
              ))}
            </div>
          </Section>

          {/* ------------------------------------------------ actions */}
          <Section id="button" title="Button" note="Three variants. Labels never carry tick marks.">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button disabled className="disabled:opacity-40">Disabled</Button>
              <Button><Plus className="h-4 w-4" /> With icon</Button>
              <Button variant="outline"><Download className="h-4 w-4" /> Outline icon</Button>
            </div>
          </Section>

          <Section id="icon-button" title="Icon button" note="Plain icons with a 44px hit area; the filter funnel carries a count.">
            <div className="flex flex-wrap items-center gap-6">
              <button className="rounded-lg p-2 text-ink-secondary hover:bg-subtle"><Bell className="h-[18px] w-[18px]" /></button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full text-ink"><Plus className="h-6 w-6" strokeWidth={2.25} /></button>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white"><Plus className="h-6 w-6" strokeWidth={2.25} /></button>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink-secondary"><Filter className="h-4 w-4" /></button>
              <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-brand bg-brand-tint text-brand">
                <Filter className="h-4 w-4" />
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white">2</span>
              </button>
              <button className="rounded-md p-1.5 text-ink-tertiary hover:bg-subtle hover:text-ink"><Trash2 className="h-4 w-4" /></button>
            </div>
          </Section>

          {/* ------------------------------------------------ forms */}
          <Section id="input" title="Input, Select, Textarea" note="40px fields with a brand focus border. Field adds label, hint and required mark.">
            <div className="grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Full name" required><Input placeholder="Sophia Carter" /></Field>
              <Field label="Department" hint="Where this person works"><Select defaultValue="Housekeeping"><option>Housekeeping</option><option>Front Desk</option></Select></Field>
              <div className="md:col-span-2"><Field label="Notes"><Textarea rows={3} placeholder="Add an internal note…" /></Field></div>
            </div>
          </Section>

          <Section id="phone" title="Phone number field" note="Country-code select beside a number input. Numbers accept digits and spaces only.">
            <div className="grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Mobile number" required hint="Used for WhatsApp and app invites"><PhoneInput /></Field>
              <Field label="Business number"><PhoneInput code="+44" number="7700 900123" /></Field>
              <Field label="Disabled"><PhoneInput number="98765 43210" disabled /></Field>
            </div>
          </Section>

          <Section id="search" title="Search field" note="One search box and a single funnel icon beside it; no duplicate filter rows.">
            <div className="flex max-w-lg items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                <input placeholder="Search guest, room…" className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand" />
              </div>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink-secondary"><Filter className="h-4 w-4" /></button>
            </div>
          </Section>

          <Section id="toggle" title="Toggle, checkbox, stars" note="Compact selection controls.">
            <div className="flex flex-wrap items-center gap-8">
              <button onClick={() => setOn((v) => !v)}><Toggle checked={on} /></button>
              <Toggle checked={false} />
              <label className="flex items-center gap-2 text-[13px] text-ink"><input type="checkbox" defaultChecked className="h-4 w-4 accent-brand" /> Loyalty members</label>
              <label className="flex items-center gap-2 text-[13px] text-ink"><input type="checkbox" className="h-4 w-4 accent-brand" /> Returning guest</label>
              <Stars value={4} />
            </div>
          </Section>

          <Section id="calendar" title="Date picker" note="Opens from the arrival-date filter; dots mark days with arrivals.">
            <div className="w-[300px]"><ArrivalCalendar selDay={day} perDay={{ 24: 18, 25: 6, 26: 2, 27: 1, 28: 2 }} onPick={setDay} /></div>
          </Section>

          {/* ------------------------------------------------ status */}
          <Section id="badge" title="Badge & tags" note="Light tints; the Complaint tag sits beside a task name.">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="success">Success</Badge><Badge tone="warning">Warning</Badge><Badge tone="danger">Danger</Badge>
              <Badge tone="info">Info</Badge><Badge tone="brand">Brand</Badge><Badge tone="neutral">Neutral</Badge>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${COMPLAINT_PILL}`}>Complaint</span>
            </div>
          </Section>

          <Section id="status" title="Task status" note="Escalation, then SLA breach, then SLA at risk, then where the work stands. Coloured text, no chip.">
            <div className="flex flex-wrap gap-8">{STATUSES.map((s) => <span key={s} className={`text-[13px] font-medium ${STATUS_PILL[s]}`}>{s}</span>)}</div>
          </Section>

          <Section id="sla" title="SLA clock" note="Counts down while on time, turns red and counts up once breached.">
            <div className="flex flex-wrap items-center gap-10">
              <div><Label>Breached</Label><SlaClock sla={{ kind: "overdue", text: "Overdue 12 min" }} /></div>
              <div><Label>At risk</Label><SlaClock sla={{ kind: "due", text: "Due in 4 min" }} /></div>
              <div><Label>On time</Label><SlaClock sla={{ kind: "left", text: "22 min left" }} /></div>
              <div><Label>Met</Label><SlaClock sla={{ kind: "met", text: "On time" }} /></div>
            </div>
          </Section>

          <Section id="toast" title="Toast" note="Dark pill at the bottom centre, gone after two seconds.">
            <span className="inline-flex items-center rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">App link sent to 12 team members</span>
          </Section>

          {/* ------------------------------------------------ data display */}
          <Section id="card" title="Card & stat card" note="Cards are white with a hairline border; stat cards show a number and a label.">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[["Escalated", "7", "text-red-600"], ["Complaints", "8", "text-violet-600"], ["SLA at risk", "24", "text-ink"], ["Unassigned", "8", "text-ink"]].map(([l, v, c]) => (
                <Card key={l} className="p-4"><div className="text-[13px] text-ink-secondary">{l}</div><div className={`mt-1 text-[26px] font-bold leading-tight ${c}`}>{v}</div></Card>
              ))}
            </div>
          </Section>

          <Section id="table" title="Data table" note="Grey header band, 14px rows, equal left inset, faint dividers, live SLA clock first.">
            <Card table className="overflow-hidden">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                    <th className="w-[120px] py-3.5 pl-6 font-medium">SLA</th><th className="py-3.5 pl-6 font-medium">Task</th><th className="w-[150px] py-3.5 pl-6 font-medium">Status</th><th className="w-[160px] py-3.5 pl-6 font-medium">Department</th><th className="w-[150px] py-3.5 pl-6 font-medium">Assigned to</th>
                  </tr>
                </thead>
                <tbody>
                  {[["overdue", "Overdue 12 min", "AC Not Working", "#001", "Escalated", "Engineering", "Mike R."], ["due", "Due in 4 min", "Airport Pickup", "#002", "SLA at risk", "Concierge", "John S."], ["left", "22 min left", "Late Checkout Request", "#003", "Assigned", "Front Desk", "Sarah K."]].map(([k, t, n, id, st, d, o]) => (
                    <tr key={id} className="border-b border-line/50 last:border-0">
                      <td className="py-3.5 pl-6"><SlaClock sla={{ kind: k as "overdue" | "due" | "left", text: t }} /></td>
                      <td className="py-3.5 pl-6"><div className="text-[13px] font-semibold text-ink">{n}</div><div className="text-[12px] text-ink-tertiary">{id}</div></td>
                      <td className="py-3.5 pl-6"><span className={`text-[13px] font-medium ${STATUS_PILL[st as TaskStatusLabel]}`}>{st}</span></td>
                      <td className="py-3.5 pl-6 text-[14px] text-ink-secondary"><span className="flex items-center gap-2"><Wrench className="h-4 w-4 text-ink-tertiary" />{d}</span></td>
                      <td className="py-3.5 pl-6 text-[14px] text-ink">{o}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </Section>

          <Section id="avatar" title="Avatar, flag, QR" note="Initials on a tint, country flags and the room QR code.">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3"><Avatar name="Emma Davis" size={36} /><Avatar name="Rohan Sharma" size={48} tone="bg-sky-100 text-sky-700" /><Avatar name="Sophia Carter" size={64} tone="bg-brand text-white" /></div>
              <div className="flex items-center gap-3"><Flag country="India" /><Flag country="United Kingdom" /><Flag country="Australia" /></div>
              <FakeQR seed="component-design" size={96} />
            </div>
          </Section>

          <Section id="charts" title="Donut & health orb" note="Pastel donut for breakdowns; the orb's hue follows the health score band.">
            <div className="flex flex-wrap items-center gap-12">
              <Donut size={140} thickness={22} segments={[{ label: "Done", value: 52, color: "#6FDDB7" }, { label: "Open", value: 30, color: "#8DC3F0" }, { label: "Late", value: 18, color: "#F595A5" }]} />
              <div className="relative h-[220px] w-[220px]">
                <Orb hue={110} backgroundColor="#ffffff" />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[36px] font-bold text-emerald-600">88%</div>
              </div>
            </div>
          </Section>

          {/* ------------------------------------------------ navigation */}
          <Section id="tabs" title="Tabs" note="Underline tabs; the active one is brand orange.">
            <div className="max-w-md" onClick={(e) => { const t = (e.target as HTMLElement).closest("button"); if (t) setTab(t.textContent ?? "Overview"); }}>
              <Tabs tabs={["Overview", "Preferences", "Stay history", "Notes"]} active={tab} />
            </div>
          </Section>

          <Section id="sidebar" title="Sidebar item & top bar" note="Active item is a soft orange tint; the top bar holds only the page title and the bell.">
            <div className="flex flex-wrap items-start gap-10">
              <div className="w-[220px] space-y-1">
                <div className="flex items-center gap-3 rounded-lg bg-brand-tint px-3 py-2.5 text-[14px] font-medium text-brand"><HomeIcon className="h-[18px] w-[18px]" /> Home</div>
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-ink-secondary hover:bg-subtle"><ListChecks className="h-[18px] w-[18px]" /> Tasks <span className="ml-auto text-[12px] text-ink-tertiary">15</span></div>
              </div>
              <div className="flex h-16 w-[420px] items-center border-b border-line px-4"><h1 className="text-[19px] font-semibold text-ink">Pre-Arrival</h1><span className="ml-auto text-ink-secondary"><Bell className="h-[18px] w-[18px]" /></span></div>
            </div>
          </Section>

          <Section id="notifications" title="Notification centre" note="Bell with an unread count; the funnel inside chooses which kinds you receive.">
            <div className="flex min-h-[120px] justify-end"><NotificationBell /></div>
          </Section>

          {/* ------------------------------------------------ overlays */}
          <Section id="modal" title="Modal" note="Centred dialog; footer holds the buttons.">
            <Button variant="outline" onClick={() => setModal(true)}>Open modal</Button>
            {modal && (
              <Modal title="Send pre-arrival message?" onClose={() => setModal(false)} footer={<><Button variant="outline" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => setModal(false)}>Send to 6</Button></>}>
                <p className="text-[13px] leading-relaxed text-ink-secondary">6 guests have not been messaged yet. The standard pre-arrival message will be sent to all of them now.</p>
              </Modal>
            )}
          </Section>

          <Section id="drawer" title="Drawer" note="Right-hand panel for details and quick edits.">
            <Button variant="outline" onClick={() => setDrawer(true)}>Open drawer</Button>
            {drawer && (
              <Drawer title="Room 1401" onClose={() => setDrawer(false)}>
                <div className="space-y-4"><Field label="Room number"><Input defaultValue="1401" /></Field><Field label="Status"><Select><option>Active</option></Select></Field></div>
              </Drawer>
            )}
          </Section>

          {/* ------------------------------------------------ mobile */}
          <Section id="m-header" title="Mobile header" note="Back arrow beside a 20px semibold title, no sub text, plain icon buttons.">
            <div className="flex flex-wrap gap-6">
              <Phone><ScreenHeader title="More" onBack={() => {}} /></Phone>
              <Phone>
                <div className="flex items-center justify-between">
                  <button className="flex h-11 w-11 items-center justify-center rounded-full text-ink"><MenuIcon className="h-[22px] w-[22px]" /></button>
                  <span className="text-[20px] font-semibold text-ink">Chats</span>
                  <span className="flex"><button className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink"><Bell className="h-[22px] w-[22px]" /><span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" /></button><button className="flex h-11 w-11 items-center justify-center rounded-full text-ink"><Plus className="h-6 w-6" strokeWidth={2.25} /></button></span>
                </div>
              </Phone>
            </div>
          </Section>

          <Section id="m-chat" title="Chat row" note="Flat rows with a hairline divider. Complaint marker on the avatar, orange dot and bold time when unread.">
            <Phone>
              <ChatRow name="Michael Johnson" room="Room 1103" preview="“This is not what I expect from a five-star…" complaint unread={1} onOpen={() => {}} />
              <ChatRow name="Ananya Kapoor" room="Room 908" preview="Guest followed up once asking for a late checkout" onOpen={() => {}} />
              <ChatRow name="James Whitfield" room="Pre-arrival" preview="Requested early check-in" unread={2} onOpen={() => {}} />
            </Phone>
          </Section>

          <Section id="m-chips" title="Chips & segmented" note="Grey pills under the search bar; the active chip is brand orange.">
            <div className="space-y-6">
              <Phone><div className="-mx-6 py-1"><Chips flat items={["All", "Unread", "Complaints", "Open requests", "Pre-arrival"] as const} active={chip as "All"} onChange={setChip} /></div></Phone>
              <Phone grey><Segmented items={["Tasks", "Team", "Rooms"] as const} active={seg as "Tasks"} onChange={setSeg} /></Phone>
            </div>
          </Section>

          <Section id="m-cards" title="Task card, stat card, SLA ring" note="White cards with the soft phone shadow; the ring shows time left.">
            <Phone grey>
              <div className="mb-3 grid grid-cols-3 gap-3"><StatCard label="Open" value={9} /><StatCard label="At risk" value={2} tone="text-amber-600" /><StatCard label="Overdue" value={2} tone="text-red-600" /></div>
              <TaskCard room="Room 1108" note="Dirty bathroom complaint" priority="High" left={24} total={45} />
              <div className="mt-3 flex items-center gap-4"><SlaRing left={40} total={45} /><SlaRing left={12} total={45} /><SlaRing left={-8} total={45} /></div>
            </Phone>
          </Section>

          <Section id="m-buttons" title="Mobile buttons" note="Full-width primary and ghost buttons.">
            <Phone><div className="space-y-3"><PrimaryButton className="w-full">Accept</PrimaryButton><GhostButton className="w-full">Reject</GhostButton></div></Phone>
          </Section>

          <Section id="m-list" title="Menu line item" note="Icon, label and chevron on a flat row with a hairline divider.">
            <Phone>
              {[["Notification settings", SlidersHorizontal], ["Team Management", ListChecks]].map(([l, I]) => {
                const Icon = I as typeof SlidersHorizontal;
                return <div key={l as string} className="flex items-center gap-4 border-b border-[#EEEEF1] py-4"><Icon className="h-[22px] w-[22px] text-ink" /><span className="flex-1 text-[15px] font-semibold text-ink">{l as string}</span><ChevronRight className="h-4 w-4 text-ink-tertiary" /></div>;
              })}
              <div className="flex items-center gap-4 py-4"><LogOut className="h-[22px] w-[22px] text-red-600" /><span className="text-[15px] font-semibold text-red-600">Sign out</span></div>
            </Phone>
          </Section>

          <Section id="m-nav" title="Bottom navigation" note="Icon tabs with an orange underline on the active one.">
            <Phone grey>
              <div className="relative h-20">
                <FloatingNav items={[{ key: "home", label: "Home", icon: HomeIcon }, { key: "tasks", label: "Tasks", icon: ListChecks }, { key: "chats", label: "Chats", icon: MessageCircle }]} active={navKey} onChange={setNavKey} />
              </div>
            </Phone>
          </Section>
        </div>
        <div className="h-10" />
        <span className="hidden"><ChevronLeft /></span>
      </Page>
    </>
  );
}
