import { useState, type ReactNode } from "react";
import { Bell, Filter, Plus, Search, Menu as MenuIcon, ChevronRight, ChevronLeft, SlidersHorizontal, LogOut, ListChecks, MessageCircle, Home as HomeIcon, Wrench, Trash2, Download } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Badge, Button, Field, Input, Select, Textarea, PhoneInput, Toggle, Stars, Modal, Tabs, Avatar as UiAvatar } from "../components/ui";
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
  ScreenHeader, ChatRow, Chips, StatCard, SlaRing, Avatar, Segmented, FloatingNav, TaskCard,
} from "../linestaff/mobile";

/* ------------------------------------------------------------------ inventory */

type Item = { id: string; name: string; group: string; note: string };

const INVENTORY: Item[] = [
  { id: "colors", name: "Colour", group: "Foundations", note: "Warm Orange accent, neutrals, teal, purple and semantic colours" },
  { id: "type", name: "Typography", group: "Foundations", note: "Sora for headings and key numbers, Inter for everything else" },
  { id: "surface", name: "Surfaces & spacing", group: "Foundations", note: "Radii, hairline border, double shadow, sidebar width" },
  { id: "button", name: "Button", group: "Actions", note: "Primary, outline, ghost, disabled, with icon" },
  { id: "icon-button", name: "Icon button", group: "Actions", note: "Plain, filled and funnel-with-count buttons" },
  { id: "input", name: "Input, Select, Textarea", group: "Forms", note: "Field wrapper with label, hint and required mark" },
  { id: "phone", name: "Phone number field", group: "Forms", note: "Country code plus number, digits only" },
  { id: "search", name: "Search field", group: "Forms", note: "Search with the single funnel filter beside it" },
  { id: "toggle", name: "Toggle, checkbox, stars", group: "Forms", note: "Small selection controls" },
  { id: "calendar", name: "Date picker", group: "Forms", note: "Arrival-date calendar with arrival dots" },
  { id: "badge", name: "Badges", group: "Status", note: "Priority badges with a dot, plain status badges" },
  { id: "status", name: "Task status", group: "Status", note: "Coloured text only, one rule for every list" },
  { id: "sla", name: "SLA clock", group: "Status", note: "Live countdown, counts up once breached" },
  { id: "toast", name: "Toast", group: "Feedback", note: "Short confirmation at the bottom of the screen" },
  { id: "card", name: "Card & stat card", group: "Data display", note: "Standard card and the KPI card" },
  { id: "table", name: "Data table", group: "Data display", note: "The Pre-Arrival table style used everywhere" },
  { id: "avatar", name: "Avatar, flag, QR", group: "Data display", note: "44px orange-tint avatar in Sora, flag, QR" },
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

function Swatch({ name, hex, cls }: { name: string; hex: string; cls: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { try { navigator.clipboard.writeText(hex); } catch { /* clipboard unavailable */ } setCopied(true); window.setTimeout(() => setCopied(false), 1200); }}
      className="w-[176px] overflow-hidden rounded-[14px] border border-line bg-white text-left"
    >
      <span className={`block h-[72px] border-b border-line ${cls}`} />
      <span className="block px-3.5 py-3">
        <span className="block text-[13px] font-semibold text-ink">{name}</span>
        <span className={`mt-0.5 block font-mono text-[12px] ${copied ? "font-semibold text-success" : "text-ink-tertiary"}`}>{copied ? "Copied" : hex}</span>
      </span>
    </button>
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
          <Section id="colors" title="Colour" note="Warm off-white surfaces with one accent doing the work: Warm Orange carries every call to action, active state and key number. Teal and purple are reserved accents. Click a swatch to copy its hex.">
            <div className="space-y-7">
              <div><Label>Neutrals</Label><div className="flex flex-wrap gap-3.5">
                <Swatch name="Surface / Card" hex="#FFFFFF" cls="bg-white" />
                <Swatch name="Page" hex="#FBFAF7" cls="bg-page" />
                <Swatch name="Text — primary" hex="#1A1A1A" cls="bg-ink" />
                <Swatch name="Text — secondary" hex="#6B7280" cls="bg-ink-secondary" />
                <Swatch name="Text — tertiary" hex="#9CA3AF" cls="bg-ink-tertiary" />
                <Swatch name="Border / hairline" hex="#F0F0F0" cls="bg-line" />
                <Swatch name="Subtle fill" hex="#F5F5F5" cls="bg-subtle" />
              </div></div>
              <div><Label>Brand accent</Label><div className="flex flex-wrap gap-3.5">
                <Swatch name="Warm Orange — primary" hex="#E8623A" cls="bg-brand" />
                <Swatch name="Orange — hover / pressed" hex="#D4522D" cls="bg-brand-hover" />
                <Swatch name="Orange — tint fill" hex="#FFF4F0" cls="bg-brand-tint" />
              </div></div>
              <div><Label>Secondary accents</Label><div className="flex flex-wrap gap-3.5">
                <Swatch name="Intelligent Teal" hex="#2E86AB" cls="bg-teal" />
                <Swatch name="Purple" hex="#7C3AED" cls="bg-purple" />
              </div></div>
              <div><Label>Semantic</Label><div className="flex flex-wrap gap-3.5">
                <Swatch name="Success" hex="#16A34A" cls="bg-success" />
                <Swatch name="Warning" hex="#D97706" cls="bg-warning" />
                <Swatch name="Error / critical" hex="#DC2626" cls="bg-danger" />
              </div></div>
            </div>
          </Section>

          <Section id="type" title="Typography" note="Sora carries headings and key numbers, geometric and a little architectural. Inter runs everything else: labels, body copy, table data.">
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-card border border-line p-6"><div className="font-display text-[44px] font-bold leading-none">Sg</div><div className="mt-3 text-[14px] font-semibold">Sora — display</div><div className="text-[13px] text-ink-secondary">Headings, score numbers, stat values · weights 600 / 700</div></div>
              <div className="rounded-card border border-line p-6"><div className="text-[44px] font-semibold leading-none">Sg</div><div className="mt-3 text-[14px] font-semibold">Inter — body &amp; UI</div><div className="text-[13px] text-ink-secondary">Copy, labels, table cells, buttons · weights 400–700</div></div>
            </div>
            <div className="divide-y divide-line">
              {[
                ["font-display text-[34px] font-bold", "Hotel Health Score", "Sora 700 / 34px"],
                ["font-display text-[22px] font-semibold", "Guest Chats", "Sora 600 / 22px"],
                ["text-[16px] font-semibold", "Emma Davis · Room 1608", "Inter 600 / 16px"],
                ["text-[14px] text-ink-secondary", "Guest sentiment, satisfaction trends, complaints and feedback.", "Inter 400 / 14px"],
                ["text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary", "Hotel Health Score", "Inter 600 / 11px · +0.14em"],
              ].map(([c, t, m]) => (
                <div key={t + m} className="flex flex-wrap items-baseline justify-between gap-4 py-4"><span className={c}>{t}</span><span className="font-mono text-[12px] text-ink-tertiary">{m}</span></div>
              ))}
            </div>
          </Section>

          <Section id="surface" title="Surfaces & spacing" note="One card system used everywhere. Elevation comes from a soft double shadow.">
            <div className="mb-6 flex flex-wrap gap-6">
              <div className="h-24 w-[200px] rounded-card border border-line bg-white shadow-card" />
              <div className="h-24 w-[200px] rounded-card border border-line bg-white shadow-lift" />
              <div className="h-24 w-[200px] rounded-card border border-line bg-page" />
            </div>
            <table className="w-full text-left text-[14px]">
              <thead><tr className="text-[12px] uppercase tracking-[0.08em] text-ink-tertiary"><th className="pb-2.5 font-semibold">Token</th><th className="pb-2.5 font-semibold">Value</th><th className="pb-2.5 font-semibold">Used for</th></tr></thead>
              <tbody>
                {[["Card radius", "16px", "Cards, panels, modals"], ["Control radius", "10px", "Nav items, buttons, inputs"], ["Pill radius", "999px", "Badges, avatars, chips"], ["Card border", "1px solid #F0F0F0", "Every card edge"], ["Card shadow", "0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)", "Resting elevation"], ["Hover shadow", "0 8px 24px rgba(0,0,0,.08), lift −2px", "Interactive cards on hover"], ["Sidebar width", "220px", "Desktop nav rail"]].map(([t, v, u]) => (
                  <tr key={t} className="border-t border-line align-top"><td className="py-3.5 pr-4">{t}</td><td className="py-3.5 pr-4 font-mono text-[13px] text-brand-hover">{v}</td><td className="py-3.5 text-ink-secondary">{u}</td></tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* ------------------------------------------------ actions */}
          <Section id="button" title="Button" note="Inter 600 / 14px, 10px radius, 10px 18px padding. Primary is Warm Orange; secondary is transparent with a hairline border. Labels never carry tick marks.">
            <div className="flex flex-wrap items-center gap-3">
              <Button>New Chat</Button>
              <Button variant="outline">Cancel</Button>
              <Button variant="ghost">Ghost</Button>
              <Button disabled className="disabled:opacity-40">Disabled</Button>
              <Button><Plus className="h-4 w-4" /> With icon</Button>
              <Button variant="outline"><Download className="h-4 w-4" /> Secondary icon</Button>
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
          <Section id="badge" title="Badges" note="Pill, Inter 500 / 12px, 5px 11px. Priority badges carry a 6px dot; status badges are plain.">
            <div className="space-y-5">
              <div><Label>Priority</Label><div className="flex flex-wrap gap-3"><Badge tone="brand" dot>High</Badge><Badge tone="warning" dot>Medium</Badge><Badge tone="success" dot>Low</Badge></div></div>
              <div><Label>Status</Label><div className="flex flex-wrap gap-3"><Badge tone="brand">Open</Badge><Badge tone="warning">In Progress</Badge><Badge tone="neutral">Pending</Badge><Badge tone="success">Completed</Badge></div></div>
              <div><Label>Other tones</Label><div className="flex flex-wrap gap-3"><Badge tone="danger">Critical</Badge><Badge tone="info">Info</Badge><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${COMPLAINT_PILL}`}>Complaint</span></div></div>
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

          <Section id="avatar" title="Avatar, flag, QR" note="44px circle on the orange tint, initials in Sora 600 / 15px. Flags and the room QR code sit alongside.">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-4"><UiAvatar name="Emma Davis" /><UiAvatar name="James Wilson" /><UiAvatar name="Rohan Sharma" size={36} /><UiAvatar name="Sophia Carter" size={64} tone="bg-brand text-white" /></div>
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

          <Section id="sidebar" title="Sidebar item & top bar" note="220px rail. Items are 10px 12px, 14px / 500; the active item sits on the orange tint at 600.">
            <div className="flex flex-wrap items-start gap-10">
              <div className="w-[200px] rounded-[14px] border border-line bg-white p-2.5">
                <div className="mb-0.5 flex items-center gap-3 rounded-control bg-brand-tint px-3 py-2.5 text-[14px] font-semibold text-brand"><MessageCircle className="h-[18px] w-[18px]" /> Guest Chats</div>
                <div className="mb-0.5 flex items-center gap-3 rounded-control px-3 py-2.5 text-[14px] font-medium text-ink-secondary"><ListChecks className="h-[18px] w-[18px]" /> Tasks <span className="ml-auto text-[12px] text-ink-tertiary">15</span></div>
                <div className="flex items-center gap-3 rounded-control px-3 py-2.5 text-[14px] font-medium text-ink-secondary"><HomeIcon className="h-[18px] w-[18px]" /> Housekeeping</div>
              </div>
              <div className="flex h-16 w-[420px] items-center border-b border-line bg-white px-4"><h1 className="text-[19px] font-semibold text-ink">Pre-Arrival</h1><span className="ml-auto text-ink-secondary"><Bell className="h-[18px] w-[18px]" /></span></div>
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
