import { useState, type ReactNode } from "react";
import {
  Bell, Building2, LayoutTemplate, Settings, AlertTriangle, CheckCircle2, Activity,
  MessageSquare, Server, Languages, LogOut, Power,
} from "lucide-react";
import { Button } from "../components/ui";
import { Logo } from "../components/Logo";
import { HOTELS, REGIONS, type Hotel, type HotelStatus } from "../data/hotels";
import { STORE } from "../data/deptTemplates";
import { deptIcon } from "../data/deptIcons";
import { PERSONAS } from "../persona";
import {
  PhoneFrame, HomeStat, Chips, SearchField, ScreenHeader, FloatingNav, ICON_BTN,
  CARD_SHADOW, Sheet, NotifRow, Avatar, useNav, useToast,
} from "./mobile";

const ME = PERSONAS.superadmin;
const FILTERS = ["All", "Active", "Inactive", "New"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_TONE: Record<HotelStatus, string> = {
  Active: "text-green-600",
  Inactive: "text-red-600",
  New: "text-blue-600",
};
const CONN_TONE = { Connected: "text-green-600", Pending: "text-amber-600", Disconnected: "text-red-500" } as const;

const ALERTS = [
  { key: "health", label: "Hotel Health Score drops", hint: "A hotel's score falls sharply against its own average" },
  { key: "pms", label: "A PMS or WhatsApp connection breaks", hint: "Catch a broken connection before a hotel does" },
  { key: "onboarding", label: "A new hotel finishes onboarding", hint: "Departments and connections are all set" },
] as const;

type Screen =
  | { name: "hotels" | "templates" | "settings" | "notifications" }
  | { name: "hotel"; id: number }
  | { name: "template"; slug: string };

const needsAttention = (h: Hotel) => h.status === "Inactive" || (h.status !== "Inactive" && (h.whatsapp !== "Connected" || h.pms !== "Connected"));

export function SuperAdminPrototype({ onReset }: { onReset?: () => void }) {
  const nav = useNav<Screen>({ name: "hotels" });
  const { flash, node: toast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>(() => HOTELS.map((h) => ({ ...h })));
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const [confidence, setConfidence] = useState(82);
  const [draftConfidence, setDraftConfidence] = useState(82);
  const [confirmConfidence, setConfirmConfidence] = useState(false);
  const [alerts, setAlerts] = useState<string[]>(["health", "pms", "onboarding"]);

  const cur = nav.cur;
  const active = hotels.filter((h) => h.status === "Active").length;
  const inactive = hotels.filter((h) => h.status === "Inactive").length;
  const attention = hotels.filter(needsAttention).length;
  const scored = hotels.filter((h) => h.healthScore !== null);
  const avgHealth = scored.length ? Math.round(scored.reduce((n, h) => n + (h.healthScore ?? 0), 0) / scored.length) : 0;
  const counts: Record<Filter, number> = {
    All: hotels.length,
    Active: active,
    Inactive: inactive,
    New: hotels.filter((h) => h.status === "New").length,
  };
  const shown = hotels.filter((h) => {
    if (filter !== "All" && h.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${h.name} ${h.location}`.toLowerCase().includes(q);
  });
  const hotel = cur.name === "hotel" ? hotels.find((h) => h.id === cur.id) : undefined;
  const template = cur.name === "template" ? STORE.depts.find((d) => d.slug === cur.slug) : undefined;

  const reset = () => {
    setHotels(HOTELS.map((h) => ({ ...h })));
    setFilter("All");
    setQuery("");
    setSignedOut(false);
    setConfidence(82);
    setDraftConfidence(82);
    setConfirmConfidence(false);
    setAlerts(["health", "pms", "onboarding"]);
    nav.reset();
    onReset?.();
  };

  const proposeConfidence = (n: number) => {
    setDraftConfidence(n);
    setConfirmConfidence(n !== confidence);
  };

  const toggleActive = (h: Hotel) => {
    const status: HotelStatus = h.status === "Inactive" ? "Active" : "Inactive";
    setHotels((list) => list.map((x) => (x.id === h.id ? { ...x, status } : x)));
    flash(status === "Inactive" ? `${h.name} deactivated` : `${h.name} activated`);
  };

  const shell = (key: "hotels" | "templates" | "settings", body: ReactNode) => (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-24 no-scrollbar">{body}</div>
      <FloatingNav
        active={key}
        onChange={(k) => nav.go({ name: k })}
        items={[
          { key: "hotels", label: "Hotels", icon: Building2 },
          { key: "templates", label: "Templates", icon: LayoutTemplate },
          { key: "settings", label: "Settings", icon: Settings },
        ]}
      />
    </div>
  );

  const bell = (
    <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className={`relative ${ICON_BTN}`}>
      <Bell className="h-[22px] w-[22px]" />
      {attention > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />}
    </button>
  );

  const Hotels = shell("hotels", (
    <>
      <div className="px-6 py-2">
        <div className="flex items-center justify-between gap-3">
          <Logo />
          {bell}
        </div>
        <div className="mt-3 min-w-0">
          <div className="truncate font-display text-[18px] font-bold leading-tight text-ink">Good morning, {ME.name.split(" ")[0]}</div>
          <p className="mt-0.5 text-[12px] font-normal text-ink-secondary">Every hotel on ALFON</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 px-6">
        <HomeStat icon={Building2} label="Total Hotels" value={hotels.length} sub={`${REGIONS.length} regions`} onClick={() => setFilter("All")} />
        <HomeStat icon={AlertTriangle} label="Needs Attention" value={attention} sub={attention ? "Inactive or disconnected" : "All clear"} subTone={attention ? "text-[#EF4444]" : "text-[#22C55E]"} onClick={() => setFilter("Inactive")} />
        <HomeStat icon={CheckCircle2} label="Active Hotels" value={active} sub={`${Math.round((active / Math.max(hotels.length, 1)) * 100)}% of the network`} subTone="text-[#22C55E]" onClick={() => setFilter("Active")} />
        <HomeStat icon={Activity} label="Avg Health" value={`${avgHealth}%`} sub={`${scored.length} scored hotels`} />
      </div>
      <div className="mt-7 px-6">
        <div className="font-display text-[19px] font-bold text-ink">Hotels</div>
      </div>
      <div className="mt-3"><Chips items={FILTERS} active={filter} onChange={setFilter} counts={counts} /></div>
      <div className="mt-3 px-6">
        <SearchField value={query} onChange={setQuery} placeholder="Search hotels" />
      </div>
      <div className="mt-3 space-y-3 px-6">
        {shown.map((h) => (
          <button key={h.id} onClick={() => nav.push({ name: "hotel", id: h.id })} className="flex w-full items-center gap-3 rounded-[18px] border border-[#F0F0F0] bg-white px-3.5 py-3 text-left shadow-card active:scale-[0.99]">
            <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"><Building2 className="h-[18px] w-[18px]" /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className="truncate text-[14px] font-semibold text-ink">{h.name}</span>
                <span className={`shrink-0 text-[11px] font-bold ${STATUS_TONE[h.status]}`}>{h.status}</span>
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-ink-tertiary">{h.location}</span>
              <span className="mt-1 block text-[12px] text-ink-secondary">
                {h.healthScore === null ? "No score yet" : `${h.healthScore}% health`} · {h.departments} departments
              </span>
            </span>
          </button>
        ))}
        {!shown.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No hotels match.</p>}
      </div>
    </>
  ));

  const HotelView = hotel && (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Hotel" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-8 pt-4 no-scrollbar">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand"><Building2 className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h2 className="font-display text-[18px] font-bold leading-tight text-ink">{hotel.name}</h2>
            <div className={`mt-1 text-[12px] font-bold ${STATUS_TONE[hotel.status]}`}>{hotel.status}</div>
            <p className="mt-1 text-[12px] text-ink-secondary">{hotel.location} · {hotel.rooms || "—"} rooms · {hotel.propertyType}</p>
          </div>
        </div>
        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-ink">Health score</div>
            <div className="font-display text-[22px] font-bold text-ink">{hotel.healthScore === null ? "—" : `${hotel.healthScore}%`}</div>
          </div>
          <p className="mt-1 text-[12px] text-ink-secondary">{hotel.healthNote}</p>
        </div>
        <div className={`divide-y divide-[#E8E8EC] rounded-2xl bg-white px-4 ${CARD_SHADOW}`}>
          <div className="flex items-center justify-between py-3 text-[13px]">
            <span className="flex items-center gap-2 text-ink-secondary"><MessageSquare className="h-4 w-4" /> WhatsApp</span>
            <span className={`font-semibold ${CONN_TONE[hotel.whatsapp]}`}>{hotel.whatsapp}</span>
          </div>
          <div className="flex items-center justify-between gap-3 py-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2 text-ink-secondary"><Server className="h-4 w-4 shrink-0" /> <span className="truncate">PMS{hotel.pmsProvider ? ` · ${hotel.pmsProvider}` : ""}</span></span>
            <span className={`shrink-0 font-semibold ${CONN_TONE[hotel.pms]}`}>{hotel.pms}</span>
          </div>
          <div className="flex items-center justify-between py-3 text-[13px]">
            <span className="text-ink-secondary">Last sync</span>
            <span className="font-medium text-ink">{hotel.lastSync}</span>
          </div>
        </div>
        <div>
          <div className="mb-2 text-[12px] font-semibold text-ink-secondary">Languages</div>
          <div className="flex flex-wrap gap-2">
            {hotel.languages.map((l) => (
              <span key={l} className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-[12px] font-semibold text-brand">
                <Languages className="h-3.5 w-3.5" /> {l}
              </span>
            ))}
          </div>
        </div>
        <Button variant="outline" className="w-full !font-bold" onClick={() => toggleActive(hotel)}>
          <Power className="h-4 w-4" /> {hotel.status === "Inactive" ? "Activate" : "Deactivate"}
        </Button>
      </div>
    </div>
  );

  const Templates = shell("templates", (
    <>
      <div className="sticky top-0 z-10 border-b border-[#F0F0F0] bg-white px-6 pb-3 pt-4">
        <div className="font-display text-[20px] font-bold text-ink">Templates</div>
        <p className="mt-0.5 text-[12px] text-ink-secondary">Defaults every new hotel starts from</p>
      </div>
      <div className="space-y-3 px-6 pt-4">
        {STORE.depts.map((d) => {
          const Icon = deptIcon(d.name);
          return (
            <button key={d.slug} onClick={() => nav.push({ name: "template", slug: d.slug })} className={`flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left ${CARD_SHADOW} active:scale-[0.99]`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"><Icon className="h-[18px] w-[18px]" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink">{d.name}</span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-tertiary">{d.services.length} services</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  ));

  const TemplateView = template && (
    <div className="flex h-full flex-col">
      <ScreenHeader title={template.name} onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-4 no-scrollbar">
        <div className="rounded-2xl bg-[#F6F6F8] px-4 py-3.5">
          <p className="text-[13px] leading-snug text-ink-secondary">{template.description}</p>
          <div className="mt-2 text-[12px] font-semibold text-ink">{template.services.length} services</div>
        </div>
        <div className="mt-4 space-y-3">
          {template.services.map((s, i) => (
            <div key={s.name} className={`overflow-hidden rounded-2xl bg-white ${CARD_SHADOW}`}>
              <div className="flex items-start gap-2.5 px-4 pb-3 pt-3.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-bold text-brand">{i + 1}</span>
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-ink">{s.name}</div>
                  <p className="mt-1 text-[12px] leading-snug text-ink-secondary">{s.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 border-t border-[#E8E8EC] bg-[#FAFAFA]">
                <div className="px-4 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-tertiary">Respond</div>
                  <div className="mt-0.5 text-[13px] font-semibold text-ink">{s.response}</div>
                </div>
                <div className="border-l border-[#E8E8EC] px-4 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-tertiary">Resolve</div>
                  <div className="mt-0.5 text-[13px] font-semibold text-ink">{s.resolve}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const notifs = hotels.filter(needsAttention).slice(0, 6);
  const Notifications = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Notifications" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {notifs.map((h) => (
          <NotifRow
            key={h.id}
            label={h.status === "Inactive" ? "Inactive" : h.pms !== "Connected" || h.whatsapp !== "Connected" ? "Connection" : "Health"}
            tone={h.status === "Inactive" ? "text-red-600" : "text-amber-600"}
            time={h.lastSync}
            task={h.name}
            sub={h.healthNote}
            unread
            onOpen={() => nav.push({ name: "hotel", id: h.id })}
          />
        ))}
        {!notifs.length && <p className="py-10 text-center text-[13px] text-ink-tertiary">Nothing needs attention.</p>}
      </div>
    </div>
  );

  const confPct = ((draftConfidence - 50) / (99 - 50)) * 100;
  const SettingsView = shell("settings", (
    <>
      <div className="border-b border-[#F0F0F0] bg-white px-6 pb-3 pt-4 font-display text-[20px] font-bold text-ink">Settings</div>
      <div className="flex flex-col items-center px-6 pb-6 pt-8 text-center">
        <Avatar name={ME.name} size={88} tone="bg-brand text-white" />
        <div className="mt-5 font-display text-[20px] font-bold text-ink">{ME.name}</div>
        <div className="mt-1.5 font-display text-[14px] font-semibold text-ink-secondary">{ME.role}</div>
      </div>
      <div className="space-y-3 px-6">
        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="flex items-center justify-between">
            <div className="text-[14px] font-semibold text-ink">AI confidence</div>
            <div className="font-display text-[20px] font-bold text-brand">{draftConfidence}%</div>
          </div>
          <p className="mt-1 text-[12px] text-ink-secondary">When the AI answers a guest itself, and when it hands off. A change is saved only after you confirm it.</p>
          <input
            type="range"
            min={50}
            max={99}
            value={draftConfidence}
            onChange={(e) => setDraftConfidence(Number(e.target.value))}
            onPointerUp={(e) => proposeConfidence(Number(e.currentTarget.value))}
            onKeyUp={(e) => proposeConfidence(Number(e.currentTarget.value))}
            className="range-fancy mt-4 w-full"
            style={{ background: `linear-gradient(to right, #E8623A ${confPct}%, #F0F0F0 ${confPct}%)` }}
            aria-label="AI confidence"
          />
        </div>
        {ALERTS.map((a) => {
          const on = alerts.includes(a.key);
          return (
            <button key={a.key} onClick={() => setAlerts((list) => (on ? list.filter((k) => k !== a.key) : [...list, a.key]))} className={`flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left ${CARD_SHADOW}`}>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">{a.label}</span>
                <span className="mt-0.5 block text-[12px] text-ink-tertiary">{a.hint}</span>
              </span>
              <span className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 ${on ? "bg-brand" : "bg-[#C8C8C8]"}`}>
                <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
              </span>
            </button>
          );
        })}
        <button onClick={() => setSignedOut(true)} className="flex w-full items-center gap-4 py-4 text-left">
          <LogOut className="h-[19px] w-[19px] shrink-0 text-red-600" />
          <span className="text-[15px] font-medium text-red-600">Sign out</span>
        </button>
      </div>
    </>
  ));

  const view = signedOut ? (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint text-brand"><LogOut className="h-7 w-7" /></span>
      <h2 className="mt-5 font-display text-[20px] font-bold text-ink">You&apos;re signed out</h2>
      <p className="mt-1.5 text-[13px] text-ink-secondary">This only ends the Super Admin session. No hotel is affected.</p>
      <Button className="mt-6" onClick={() => { setSignedOut(false); nav.go({ name: "settings" }); }}>Sign in</Button>
    </div>
  ) : cur.name === "hotels" ? Hotels
    : cur.name === "templates" ? Templates
    : cur.name === "settings" ? SettingsView
    : cur.name === "hotel" ? HotelView
    : cur.name === "template" ? TemplateView
    : Notifications;

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame white={cur.name === "settings" || cur.name === "templates" || cur.name === "notifications"}>
        {view}
        {confirmConfidence && (
          <Sheet title="Change AI confidence?" onClose={() => { setDraftConfidence(confidence); setConfirmConfidence(false); }}>
            <p className="text-[13px] leading-snug text-ink-secondary">
              This changes when the AI answers a guest itself, across every hotel. The threshold moves from {confidence}% to {draftConfidence}%.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setDraftConfidence(confidence); setConfirmConfidence(false); }}>Cancel</Button>
              <Button className="flex-1" onClick={() => { setConfidence(draftConfidence); setConfirmConfidence(false); flash(`AI confidence is now ${draftConfidence}%`); }}>Confirm</Button>
            </div>
          </Sheet>
        )}
        {toast}
      </PhoneFrame>
      <button
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary"
        onClick={reset}
      >
        Reset
      </button>
      <p className="text-center text-[12px] text-ink-tertiary">
        Current screen: <span className="font-medium text-ink-secondary">{cur.name}</span>
        {cur.name === "hotel" && hotel ? ` · ${hotel.name}` : ""}
      </p>
    </div>
  );
}
