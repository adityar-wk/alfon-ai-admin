import { useState, type ReactNode } from "react";
import { ChevronRight, Lock } from "lucide-react";
import { Button } from "../components/ui";
import { FakeQR } from "../components/FakeQR";
import { DEPARTMENTS } from "../data/departments";
import { deptIcon } from "../data/deptIcons";
import { ONBOARDING_STEPS, nextStep, useOnboardingProgress } from "../data/onboarding";
import { MODULES, STORE } from "../data/roles";
import {
  CARD_SHADOW,
  Label,
  PhoneFrame,
  ScreenHeader,
  SearchField,
  Segmented,
  SelectField,
  Sheet,
  TextField,
  useNav,
  useToast,
} from "./mobile";

type Screen = { name: "steps" } | { name: "step"; id: number } | { name: "dept"; slug: string } | { name: "role"; id: string } | { name: "doc"; id: number };

type Doc = { id: number; name: string; date: string; status: "Completed" | "Pending"; body: string };

const DOCS: Doc[] = [
  { id: 1, name: "Hotel Facilities Guide.pdf", date: "May 20", status: "Completed", body: "Pool is open 7am–8pm. The gym is on level 2, and spa bookings go through guest services. Beach towels are at the pool desk." },
  { id: 2, name: "Restaurant Menus 2025.pdf", date: "May 18", status: "Completed", body: "Breakfast 7–10:30. Lunch 12–3. Dinner 6–10:30. Room service runs until midnight. Halal and vegetarian options are marked on each menu." },
  { id: 3, name: "Spa Services Brochure.pdf", date: "May 15", status: "Completed", body: "Massages from 60 minutes. The couples suite needs a day's notice. Treatments stop at 8pm." },
  { id: 4, name: "Local Attractions Guide.pdf", date: "May 24", status: "Pending", body: "This document is still in review. It covers the old town, the marina, and airport transfer times." },
];

const ROOMS = [
  { no: "1001", floor: 10, type: "Deluxe Room" },
  { no: "1002", floor: 10, type: "Deluxe Room" },
  { no: "1003", floor: 10, type: "Suite" },
  { no: "1101", floor: 11, type: "Deluxe Room" },
  { no: "1102", floor: 11, type: "Deluxe Room" },
  { no: "1201", floor: 12, type: "Suite" },
];

const LANGUAGES = ["English", "Arabic", "Spanish", "French", "Hindi", "Mandarin"];

function ContinueBar({ label = "Continue", onClick }: { label?: string; onClick: () => void }) {
  return (
    <div className="shrink-0 border-t border-[#F0F0F0] bg-white px-6 py-3">
      <Button className="w-full" onClick={onClick}>{label}</Button>
    </div>
  );
}

function LockedValue({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Label>{label}</Label>
      <div className="flex h-14 items-center justify-between rounded-2xl border border-[#F0F0F0] bg-[#F6F4EF] px-4 text-[15px] text-ink-secondary">
        <span className="truncate">{value}</span>
        <Lock className="h-4 w-4 shrink-0 text-ink-tertiary" />
      </div>
    </>
  );
}

function StepFrame({ title, onBack, onContinue, continueLabel, children }: { title: string; onBack: () => void; onContinue: () => void; continueLabel?: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title={title} onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">{children}</div>
      <ContinueBar label={continueLabel} onClick={onContinue} />
    </div>
  );
}

export function HotelOnboardingPrototype() {
  const nav = useNav<Screen>({ name: "steps" });
  const { flash, node: toast } = useToast();
  const { markDone } = useOnboardingProgress();
  const [section, setSection] = useState<"Users" | "Roles">("Users");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [roomQuery, setRoomQuery] = useState("");
  const [rooms, setRooms] = useState("245");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [address, setAddress] = useState("123 Ocean Drive");
  const [city, setCity] = useState("Miami");
  const [phone, setPhone] = useState("+1 305 555 0123");
  const [mail, setMail] = useState("info@seaviewhotel.com");

  const backToSteps = () => nav.go({ name: "steps" });

  const finish = (id: number) => {
    markDone(id);
    const next = nextStep(id);
    flash("Saved");
    if (next) nav.go({ name: "step", id: next.id });
    else nav.go({ name: "steps" });
  };

  const steps = (
    <div className="flex h-full flex-col bg-white">
      <div className="px-6 pb-2 pt-3">
        <h1 className="font-display text-[20px] font-bold text-ink">Hotel setup</h1>
        <p className="mt-1 text-[13px] leading-snug text-ink-secondary">Open a step to set up the hotel.</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 no-scrollbar">
        {ONBOARDING_STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => nav.push({ name: "step", id: s.id })}
            className="flex w-full items-center gap-4 border-b border-[#EEEEF1] py-4 text-left last:border-b-0"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-subtle text-ink">
              <s.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-ink">{s.title}</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-ink-secondary">{s.desc}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
          </button>
        ))}
      </div>
    </div>
  );

  const property = (
    <StepFrame title="Hotel Property" onBack={backToSteps} onContinue={() => finish(1)}>
      <LockedValue label="Hotel name" value="Sea View Hotel" />
      <Label>Total rooms</Label>
      <TextField value={rooms} onChange={setRooms} placeholder="245" />
      <Label>Languages spoken</Label>
      <div className="flex flex-wrap gap-2">
        {languages.map((l) => (
          <button key={l} onClick={() => setLanguages((ls) => ls.filter((x) => x !== l))} className="rounded-full bg-brand-tint px-3 py-1 text-[12px] font-medium text-brand">
            {l}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <SelectField
          value=""
          onChange={(v) => v && setLanguages((ls) => (ls.includes(v) ? ls : [...ls, v]))}
          placeholder="Add a language"
          options={LANGUAGES.filter((l) => !languages.includes(l))}
        />
      </div>
      <Label>Address</Label>
      <TextField value={address} onChange={setAddress} placeholder="Street address" />
      <Label>City</Label>
      <TextField value={city} onChange={setCity} placeholder="City" />
      <Label>Phone</Label>
      <TextField value={phone} onChange={setPhone} placeholder="Phone number" />
      <Label>Email</Label>
      <TextField value={mail} onChange={setMail} placeholder="Email" />
      <LockedValue label="Time zone" value="(GMT-05:00) Eastern Time" />
    </StepFrame>
  );

  const knowledge = (
    <StepFrame title="Knowledge Base" onBack={backToSteps} onContinue={() => finish(3)}>
      <div className="pt-2">
        {DOCS.map((d) => (
          <button key={d.id} onClick={() => nav.push({ name: "doc", id: d.id })} className="flex w-full items-center gap-3 border-b border-[#EEEEF1] py-4 text-left">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-medium text-ink">{d.name}</span>
              <span className="mt-0.5 block text-[13px] text-ink-secondary">{d.date}</span>
            </span>
            <span className={`shrink-0 text-[12px] font-medium ${d.status === "Completed" ? "text-green-600" : "text-ink-tertiary"}`}>{d.status}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
          </button>
        ))}
      </div>
    </StepFrame>
  );

  const openDoc = DOCS.find((d) => nav.cur.name === "doc" && d.id === nav.cur.id);
  const docView = openDoc && (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title={openDoc.name} onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 no-scrollbar">
        <p className="pt-4 text-[13px] text-ink-secondary">{openDoc.date} · {openDoc.status}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink">{openDoc.body}</p>
      </div>
    </div>
  );

  const shownUsers = STORE.users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(query.trim().toLowerCase()));
  const staff = (
    <StepFrame
      title="Users and Roles"
      onBack={backToSteps}
      continueLabel="Continue"
      onContinue={() => {
        if (section === "Users") setSection("Roles");
        else setInviteOpen(true);
      }}
    >
      <div className="pt-4">
        <Segmented items={["Users", "Roles"] as const} active={section} onChange={setSection} />
      </div>
      {section === "Users" ? (
        <>
          <div className="mt-4">
            <SearchField value={query} onChange={setQuery} placeholder="Search name or email" />
          </div>
          <div className="mt-2">
            {shownUsers.map((u) => (
              <div key={u.id} className="border-b border-[#EEEEF1] py-4">
                <div className="text-[15px] font-medium text-ink">{u.name}</div>
                <div className="mt-0.5 truncate text-[13px] text-ink-secondary">{u.email || "No email"}</div>
              </div>
            ))}
            {!shownUsers.length && <p className="py-8 text-center text-[13px] text-ink-tertiary">No users match.</p>}
          </div>
        </>
      ) : (
        <div className="mt-2">
          {STORE.roles.map((r) => {
            const count = STORE.users.filter((u) => u.roleId === r.id).length;
            return (
              <button key={r.id} onClick={() => nav.push({ name: "role", id: r.id })} className="flex w-full items-center gap-3 border-b border-[#EEEEF1] py-4 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">{r.name}</span>
                  <span className="mt-0.5 block text-[13px] text-ink-secondary">{count} {count === 1 ? "member" : "members"}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
              </button>
            );
          })}
        </div>
      )}
    </StepFrame>
  );

  const role = STORE.roles.find((r) => nav.cur.name === "role" && r.id === nav.cur.id);
  const roleView = role && (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title={role.name} onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 no-scrollbar">
        <p className="pt-4 text-[13px] text-ink-secondary">{role.desc}</p>
        <h2 className="mt-6 font-display text-[17px] font-bold text-ink">Members</h2>
        {STORE.users.filter((u) => u.roleId === role.id).map((u) => (
          <div key={u.id} className="border-b border-[#EEEEF1] py-4">
            <div className="text-[15px] font-medium text-ink">{u.name}</div>
            <div className="mt-0.5 truncate text-[13px] text-ink-secondary">{u.email}</div>
          </div>
        ))}
        {!STORE.users.some((u) => u.roleId === role.id) && <p className="py-6 text-[13px] text-ink-tertiary">No members in this role.</p>}
        <h2 className="mt-6 font-display text-[17px] font-bold text-ink">Access</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-[#F0F0F0]">
          <div className="grid grid-cols-[1fr_72px] border-b border-[#F0F0F0] bg-[#FAFAFA] px-3 py-2 text-[11px] font-medium text-ink-secondary">
            <span>Module</span>
            <span className="text-center">Access</span>
          </div>
          {MODULES.map((m) => (
            <div key={m.key} className="grid grid-cols-[1fr_72px] items-center border-b border-[#EEEEF1] px-3 py-3 last:border-0">
              <span className="text-[14px] font-medium text-ink">{m.label}</span>
              <span className="flex justify-center">
                <input type="checkbox" aria-label={`${m.label} access`} className="h-4 w-4 accent-ink-tertiary" checked={role.modules[m.key]} disabled readOnly />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const departments = (
    <StepFrame title="Departments & SLA" onBack={backToSteps} onContinue={() => finish(5)}>
      <p className="pt-4 text-[13px] leading-snug text-ink-secondary">Each department lists the services guests can ask for.</p>
      <div className="mt-2">
        {DEPARTMENTS.map((d) => {
          const Icon = deptIcon(d.name);
          return (
            <button key={d.slug} onClick={() => nav.push({ name: "dept", slug: d.slug })} className="flex w-full items-center gap-4 border-b border-[#EEEEF1] py-4 text-left">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-ink">{d.name}</span>
                <span className="mt-0.5 block text-[13px] text-ink-secondary">{d.services.length} services</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
            </button>
          );
        })}
      </div>
    </StepFrame>
  );

  const dept = DEPARTMENTS.find((d) => nav.cur.name === "dept" && d.slug === nav.cur.slug);
  const deptView = dept && (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title={dept.name} onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">
        <p className="pt-4 text-[13px] leading-snug text-ink-secondary">{dept.description}</p>
        <h2 className="mt-6 font-display text-[17px] font-bold text-ink">Services</h2>
        {dept.services.map((sv) => (
          <div key={sv.name} className="border-b border-[#EEEEF1] py-4">
            <div className="text-[15px] font-medium text-ink">{sv.name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const roomRows = ROOMS.filter((r) => r.no.includes(roomQuery.trim()));
  const roomsView = (
    <StepFrame title="Rooms & QR" onBack={backToSteps} onContinue={() => finish(7)}>
      <div className={`mt-4 flex items-center gap-4 rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
        <FakeQR seed="hotel-qr" size={72} />
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-ink">Hotel QR code</div>
          <p className="mt-0.5 text-[13px] text-ink-secondary">Guests scan this to reach the AI concierge.</p>
        </div>
      </div>
      <div className="mt-4">
        <SearchField value={roomQuery} onChange={setRoomQuery} placeholder="Search room number" />
      </div>
      <div className="mt-2">
        {roomRows.map((r) => (
          <div key={r.no} className="flex items-center justify-between border-b border-[#EEEEF1] py-4">
            <div>
              <div className="text-[15px] font-medium text-ink">{r.no}</div>
              <div className="mt-0.5 text-[13px] text-ink-secondary">{r.type} · Floor {r.floor}</div>
            </div>
          </div>
        ))}
        {!roomRows.length && <p className="py-8 text-center text-[13px] text-ink-tertiary">No rooms match.</p>}
      </div>
    </StepFrame>
  );

  const connections = (
    <StepFrame title="WhatsApp & PMS" onBack={backToSteps} onContinue={() => finish(2)}>
      {[
        { title: "WhatsApp Business", sub: "Layana Resort & Spa", rows: [["Number", "+91 98765 43210"], ["Status", "Active"]] },
        { title: "PMS / Reservations", sub: "Opera Cloud · Production", rows: [["Provider", "Opera Cloud"], ["Last synced", "2 minutes ago"], ["Status", "Active"]] },
      ].map((card) => (
        <div key={card.title} className={`mt-4 rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold text-ink">{card.title}</div>
              <div className="mt-0.5 text-[12px] text-ink-secondary">{card.sub}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[12px] font-medium text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Connected
            </span>
          </div>
          <div className="mt-3 divide-y divide-[#F0F0F0]">
            {card.rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3 text-[14px]">
                <span className="text-ink-secondary">{label}</span>
                <span className="font-medium text-ink">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </StepFrame>
  );

  const stepId = nav.cur.name === "step" ? nav.cur.id : null;
  const view = nav.cur.name === "steps" ? steps
    : nav.cur.name === "doc" ? docView
    : nav.cur.name === "dept" ? deptView
    : nav.cur.name === "role" ? roleView
    : stepId === 1 ? property
    : stepId === 3 ? knowledge
    : stepId === 4 ? staff
    : stepId === 5 ? departments
    : stepId === 7 ? roomsView
    : connections;

  const reset = () => {
    nav.reset();
    setSection("Users");
    setInviteOpen(false);
    setQuery("");
    setRoomQuery("");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame white>
        {view}
        {inviteOpen && (
          <Sheet title="Send email invites" onClose={() => setInviteOpen(false)}>
            <p className="text-[13px] leading-snug text-ink-secondary">An email invite will be sent to all users.</p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setInviteOpen(false)}>Back to edit</Button>
              <Button className="flex-1" onClick={() => {
                STORE.users = STORE.users.map((u) => (u.status === "Invite pending" ? { ...u, status: "Invited" } : u));
                setInviteOpen(false);
                finish(4);
              }}>Confirm</Button>
            </div>
          </Sheet>
        )}
        {toast}
      </PhoneFrame>
      <button className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary" onClick={reset}>
        Reset prototype
      </button>
    </div>
  );
}
