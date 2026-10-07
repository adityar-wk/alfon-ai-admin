import { useState, type ReactNode } from "react";
import {
  Bell, Building2, LayoutTemplate, Settings, AlertTriangle, CheckCircle2, Activity,
  MessageSquare, Server, Languages, LogOut, Power, Check, Clock, X, Pencil, Send,
} from "lucide-react";
import { Button } from "../components/ui";
import { Logo } from "../components/Logo";
import { HOTELS, REGIONS, type Hotel, type HotelStatus } from "../data/hotels";
import { STORE } from "../data/deptTemplates";
import { deptIcon } from "../data/deptIcons";
import { PERSONAS } from "../persona";
import {
  PhoneFrame, HomeStat, Chips, SearchField, ScreenHeader, FloatingNav, ICON_BTN,
  CARD_SHADOW, Sheet, NotifRow, Avatar, useNav, useToast, TextField, SelectField, Label,
} from "./mobile";

const ME = PERSONAS.superadmin;
const FILTERS = ["All", "Active", "Inactive", "Pending", "New"] as const;
type Filter = (typeof FILTERS)[number];
type ConnMark = "clock" | "tick" | "cross";

const STATUS_TONE: Record<HotelStatus, string> = {
  Active: "text-green-600",
  Inactive: "text-red-600",
  Pending: "text-amber-600",
  New: "text-blue-600",
};
const PMS_PROVIDERS = ["Opera (Oracle)", "Mews"];

const ALERTS = [
  { key: "health", label: "Hotel Health Score drops", hint: "A hotel's score falls sharply against its own average" },
  { key: "pms", label: "A PMS or WhatsApp connection breaks", hint: "Catch a broken connection before a hotel does" },
  { key: "onboarding", label: "A new hotel finishes onboarding", hint: "Departments and connections are all set" },
] as const;

type Screen =
  | { name: "hotels" | "templates" | "settings" | "notifications" }
  | { name: "hotel" | "edit"; id: number }
  | { name: "template"; slug: string };

const needsAttention = (h: Hotel) => h.status !== "Active";

function connMark(h: Hotel, which: "whatsapp" | "pms"): ConnMark {
  if (h.status === "New") return "clock";
  const status = h[which];
  if (status === "Connected") return "tick";
  if (status === "Disconnected") return "cross";
  return "clock";
}

function markWord(mark: ConnMark) {
  if (mark === "tick") return "Connected";
  if (mark === "cross") return "Disconnected";
  return "Waiting";
}

function ConnGlyph({ mark }: { mark: ConnMark }) {
  if (mark === "tick") return <Check className="h-3.5 w-3.5 text-green-600" />;
  if (mark === "cross") return <X className="h-3.5 w-3.5 text-red-500" />;
  return <Clock className="h-3.5 w-3.5 text-amber-500" />;
}

function statusLabel(h: Hotel) {
  return h.disabled ? "Disabled" : h.status;
}

function statusTone(h: Hotel) {
  return h.disabled ? "text-ink-tertiary" : STATUS_TONE[h.status];
}

/** A dropped connection makes the hotel inactive. A disabled hotel stays inactive. */
function settle(h: Hotel): Hotel {
  if (h.disabled) return { ...h, status: "Inactive" };
  const dropped = h.whatsapp === "Disconnected" || h.pms === "Disconnected";
  if (dropped) return { ...h, status: "Inactive" };
  if (h.status === "Inactive" && h.whatsapp === "Connected" && h.pms === "Connected") return { ...h, status: "Active" };
  return h;
}

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
  const [connect, setConnect] = useState<null | "whatsapp" | "pms">(null);

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
    Pending: hotels.filter((h) => h.status === "Pending").length,
    New: hotels.filter((h) => h.status === "New").length,
  };
  const shown = hotels.filter((h) => {
    if (filter !== "All" && h.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${h.name} ${h.location}`.toLowerCase().includes(q);
  });
  const hotel = cur.name === "hotel" || cur.name === "edit" ? hotels.find((h) => h.id === cur.id) : undefined;
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
    setConnect(null);
    nav.reset();
    onReset?.();
  };

  const proposeConfidence = (n: number) => {
    setDraftConfidence(n);
    setConfirmConfidence(n !== confidence);
  };

  const patchHotel = (id: number, next: Hotel, message: string) => {
    setHotels((list) => list.map((x) => (x.id === id ? next : x)));
    flash(message);
  };

  const disableHotel = (h: Hotel) => {
    patchHotel(h.id, { ...h, status: "Inactive", disabled: true, healthNote: "Disabled. The hotel is switched off." }, `${h.name} disabled`);
  };

  const activateHotel = (h: Hotel) => {
    const next = settle({ ...h, disabled: false, status: "Inactive" });
    patchHotel(h.id, next, next.status === "Active" ? `${h.name} is active again` : `${h.name} enabled`);
  };

  const sendLink = (h: Hotel) => {
    patchHotel(
      h.id,
      { ...h, status: "Active", disabled: false, healthNote: "Live. The setup link was sent to the hotel admin." },
      `Setup link sent to ${h.adminEmail}. ${h.name} is now active`,
    );
  };

  const applyConnection = (h: Hotel, kind: "whatsapp" | "pms", provider?: string) => {
    const next = settle({
      ...h,
      [kind]: "Connected",
      ...(kind === "pms" && provider ? { pmsProvider: provider } : {}),
      ...(h.status === "New" ? { status: "Pending" as HotelStatus } : {}),
    });
    const both = next.whatsapp === "Connected" && next.pms === "Connected";
    patchHotel(h.id, next, both && next.status === "Active" ? `${kind === "pms" ? "PMS" : "WhatsApp"} reconnected. ${h.name} is active again` : `${kind === "pms" ? "PMS" : "WhatsApp"} connected`);
    setConnect(null);
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
        <HomeStat icon={AlertTriangle} label="Needs Attention" value={inactive} sub={inactive ? "Disabled or disconnected" : "All clear"} subTone={inactive ? "text-[#EF4444]" : "text-[#22C55E]"} onClick={() => setFilter("Inactive")} />
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
          <button key={h.id} onClick={() => nav.push({ name: "hotel", id: h.id })} className={`flex w-full items-center gap-3 rounded-[18px] border border-[#F0F0F0] px-3.5 py-3 text-left shadow-card active:scale-[0.99] ${h.disabled ? "bg-[#F3F3F5]" : "bg-white"}`}>
            <span className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${h.disabled ? "bg-[#E6E6EA] text-ink-tertiary" : "bg-brand-tint text-brand"}`}><Building2 className="h-[18px] w-[18px]" /></span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span className={`truncate text-[14px] font-semibold ${h.disabled ? "text-ink-tertiary" : "text-ink"}`}>{h.name}</span>
                <span className={`shrink-0 text-[11px] font-bold ${statusTone(h)}`}>{statusLabel(h)}</span>
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-ink-tertiary">{h.location}</span>
              {h.disabled ? (
                <span className="mt-1 block text-[12px] font-medium text-ink-tertiary">Disabled</span>
              ) : (
                <>
                  <span className="mt-1 block text-[12px] text-ink-secondary">
                    {h.healthScore === null ? "No score yet" : `${h.healthScore}% health`}
                  </span>
                  <span className="mt-1.5 flex items-center gap-3">
                    {(["whatsapp", "pms"] as const).map((which) => {
                      const mark = connMark(h, which);
                      return (
                        <span key={which} className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-secondary" aria-label={`${which === "whatsapp" ? "WhatsApp" : "PMS"} ${markWord(mark)}`}>
                          <ConnGlyph mark={mark} />
                          {which === "whatsapp" ? "WhatsApp" : "PMS"}
                        </span>
                      );
                    })}
                  </span>
                </>
              )}
            </span>
          </button>
        ))}
        {!shown.length && <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-tertiary">No hotels match.</p>}
      </div>
    </>
  ));

  const readyToSend = !!hotel && hotel.status === "Pending" && hotel.whatsapp === "Connected" && hotel.pms === "Connected";

  const HotelView = hotel && cur.name === "hotel" && (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Hotel" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-8 pt-4 no-scrollbar">
        <div className="flex items-start gap-3">
          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${hotel.disabled ? "bg-[#E6E6EA] text-ink-tertiary" : "bg-brand-tint text-brand"}`}><Building2 className="h-6 w-6" /></span>
          <div className="min-w-0">
            <h2 className="font-display text-[18px] font-bold leading-tight text-ink">{hotel.name}</h2>
            <div className={`mt-1 text-[12px] font-bold ${statusTone(hotel)}`}>{statusLabel(hotel)}</div>
            <p className="mt-1 text-[12px] text-ink-secondary">{hotel.location} · {hotel.rooms || "—"} rooms · {hotel.propertyType}</p>
            <p className="mt-0.5 text-[12px] text-ink-tertiary">{hotel.currency} · {hotel.timeZone}</p>
            {hotel.adminEmail && <p className="mt-0.5 text-[12px] text-ink-tertiary">{hotel.adminEmail}</p>}
          </div>
        </div>
        {hotel.disabled && (
          <div className="rounded-2xl bg-[#F3F3F5] px-4 py-3 text-[13px] font-medium text-ink-secondary">This hotel is disabled.</div>
        )}
        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-ink">Health score</div>
            <div className="font-display text-[22px] font-bold text-ink">{hotel.healthScore === null ? "—" : `${hotel.healthScore}%`}</div>
          </div>
          <p className="mt-1 text-[12px] text-ink-secondary">{hotel.healthNote}</p>
        </div>
        <div className={`divide-y divide-[#E8E8EC] rounded-2xl bg-white px-4 ${CARD_SHADOW}`}>
          {(["whatsapp", "pms"] as const).map((which) => {
            const mark = connMark(hotel, which);
            const label = which === "whatsapp" ? "WhatsApp" : `PMS${which === "pms" && hotel.pms === "Connected" && hotel.pmsProvider ? ` · ${hotel.pmsProvider}` : ""}`;
            const canConnect = !hotel.disabled && mark !== "tick";
            return (
              <div key={which} className="flex items-center justify-between gap-3 py-3 text-[13px]">
                <span className="flex min-w-0 items-center gap-2 text-ink-secondary">
                  {which === "whatsapp" ? <MessageSquare className="h-4 w-4 shrink-0" /> : <Server className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`inline-flex items-center gap-1 font-semibold ${mark === "tick" ? "text-green-600" : mark === "cross" ? "text-red-500" : "text-amber-600"}`} aria-label={`${which === "whatsapp" ? "WhatsApp" : "PMS"} ${markWord(mark)}`}>
                    <ConnGlyph mark={mark} /> {markWord(mark)}
                  </span>
                  {canConnect && (
                    <button onClick={() => setConnect(which)} className="text-[12px] font-semibold text-brand">
                      {mark === "cross" ? "Reconnect" : "Connect"}
                    </button>
                  )}
                </span>
              </div>
            );
          })}
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
        <Button variant="outline" className="w-full !font-bold" onClick={() => nav.push({ name: "edit", id: hotel.id })}>
          <Pencil className="h-4 w-4" /> Edit hotel data
        </Button>
        {readyToSend && (
          <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
            <p className="text-[12px] leading-snug text-ink-secondary">Both connections are ready. Confirming sends the setup link to the hotel admin and makes this hotel active.</p>
            <Button className="mt-3 w-full disabled:opacity-40" disabled={!hotel.adminEmail?.trim()} onClick={() => sendLink(hotel)}>
              <Send className="h-4 w-4" /> Confirm and send link
            </Button>
            {!hotel.adminEmail?.trim() && <p className="mt-2 text-[12px] text-ink-tertiary">Add an admin email in Edit hotel data first.</p>}
          </div>
        )}
        {hotel.status === "Active" && (
          <Button variant="outline" className="w-full !font-bold" onClick={() => disableHotel(hotel)}>
            <Power className="h-4 w-4" /> Disable hotel
          </Button>
        )}
        {hotel.disabled && (
          <Button className="w-full" onClick={() => activateHotel(hotel)}>
            <Power className="h-4 w-4" /> Activate hotel
          </Button>
        )}
      </div>
    </div>
  );

  const EditView = hotel && cur.name === "edit" && (
    <HotelEditor
      hotel={hotel}
      onBack={nav.back}
      onSave={(next) => {
        const started = hotel.status === "New";
        patchHotel(hotel.id, next, started ? `${next.name} moved to pending` : "Hotel data saved");
        nav.back();
      }}
    />
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
            label={h.disabled ? "Disabled" : h.status === "Inactive" ? "Inactive" : h.status}
            tone={h.disabled || h.status === "Inactive" ? "text-red-600" : "text-amber-600"}
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
    : cur.name === "edit" ? EditView
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
        {cur.name === "hotel" && hotel && connect && (
          <ConnectSheet
            kind={connect}
            providers={connect === "pms" ? (hotel.pmsProvider && !PMS_PROVIDERS.includes(hotel.pmsProvider) ? [hotel.pmsProvider, ...PMS_PROVIDERS] : PMS_PROVIDERS) : []}
            onClose={() => setConnect(null)}
            onConnect={(provider) => applyConnection(hotel, connect, provider)}
          />
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
        {(cur.name === "hotel" || cur.name === "edit") && hotel ? ` · ${hotel.name}` : ""}
      </p>
    </div>
  );
}

const COUNTRIES = ["United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Bahrain", "Kuwait", "United Kingdom", "Philippines", "Indonesia", "Switzerland"];
const COUNTRY_SHORT: Record<string, string> = {
  "United Arab Emirates": "UAE", "Saudi Arabia": "KSA", Qatar: "Qatar", Oman: "Oman", Bahrain: "Bahrain",
  Kuwait: "Kuwait", "United Kingdom": "UK", Philippines: "Philippines", Indonesia: "Indonesia", Switzerland: "Switzerland",
};
const PLACE_COUNTRY: Record<string, string> = Object.fromEntries(Object.entries(COUNTRY_SHORT).map(([country, short]) => [short, country]));
const CURRENCIES = ["AED (UAE Dirham)", "SAR (Saudi Riyal)", "QAR (Qatari Riyal)", "OMR (Omani Rial)", "BHD (Bahraini Dinar)", "KWD (Kuwaiti Dinar)", "PHP (Philippine Peso)", "IDR (Indonesian Rupiah)", "CHF (Swiss Franc)", "GBP (British Pound)", "USD (US Dollar)"];
const CURRENCY_FROM_CODE: Record<string, string> = {
  AED: "AED (UAE Dirham)", SAR: "SAR (Saudi Riyal)", QAR: "QAR (Qatari Riyal)", OMR: "OMR (Omani Rial)", BHD: "BHD (Bahraini Dinar)",
  KWD: "KWD (Kuwaiti Dinar)", PHP: "PHP (Philippine Peso)", IDR: "IDR (Indonesian Rupiah)", CHF: "CHF (Swiss Franc)", GBP: "GBP (British Pound)", USD: "USD (US Dollar)",
};
const TIME_ZONES = ["Asia/Dubai (GMT+4)", "Asia/Riyadh (GMT+3)", "Asia/Qatar (GMT+3)", "Asia/Muscat (GMT+4)", "Asia/Bahrain (GMT+3)", "Asia/Kuwait (GMT+3)", "Asia/Manila (GMT+8)", "Asia/Makassar (GMT+8)", "Europe/Zurich (GMT+1)", "Europe/London (GMT+0)"];
const SETUP_REGIONS = ["Middle East", "Asia Pacific", "Europe", "North America"];
const PROPERTY_TYPES = ["Resort", "Luxury Hotel", "Business Hotel", "Boutique Hotel", "Extended Stay"];

type Draft = {
  name: string; country: string; city: string; currency: string; timeZone: string; description: string;
  adminEmail: string; region: string; propertyType: string; rooms: string; address: string;
};

function draftFrom(h: Hotel): Draft {
  const [cityPart, place] = h.location.split(",").map((s) => s.trim());
  return {
    name: h.name,
    country: h.country ?? PLACE_COUNTRY[place] ?? COUNTRIES[0],
    city: h.city ?? cityPart ?? "",
    currency: CURRENCIES.includes(h.currency) ? h.currency : (CURRENCY_FROM_CODE[h.currency] ?? CURRENCIES[0]),
    timeZone: TIME_ZONES.find((z) => z.startsWith(h.timeZone)) ?? TIME_ZONES[0],
    description: h.description ?? "",
    adminEmail: h.adminEmail ?? "",
    region: SETUP_REGIONS.includes(h.region) ? h.region : SETUP_REGIONS[0],
    propertyType: PROPERTY_TYPES.includes(h.propertyType) ? h.propertyType : PROPERTY_TYPES[0],
    rooms: h.rooms ? String(h.rooms) : "",
    address: h.address ?? "",
  };
}

function detailsFrom(h: Hotel, d: Draft): Hotel {
  const short = COUNTRY_SHORT[d.country] ?? d.country;
  const started = h.status === "New";
  return {
    ...h,
    name: d.name.trim() || h.name,
    country: d.country,
    city: d.city.trim(),
    location: `${d.city.trim()}, ${short}`,
    currency: d.currency,
    timeZone: d.timeZone,
    description: d.description.trim(),
    adminEmail: d.adminEmail.trim(),
    region: d.region,
    propertyType: d.propertyType,
    rooms: Number(d.rooms.replace(/\D/g, "")) || 0,
    address: d.address.trim(),
    status: started ? "Pending" : h.status,
    healthNote: started ? "Setup started. Connect WhatsApp and PMS, then send the link." : h.healthNote,
  };
}

function HotelEditor({ hotel, onBack, onSave }: { hotel: Hotel; onBack: () => void; onSave: (next: Hotel) => void }) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(hotel));
  const set = (key: keyof Draft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));
  const canSave = draft.name.trim().length > 0 && draft.city.trim().length > 0;
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Edit hotel" onBack={onBack} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 no-scrollbar">
        <Label>Hotel name</Label>
        <TextField value={draft.name} onChange={set("name")} placeholder="Hotel name" />
        <Label>Country</Label>
        <SelectField value={draft.country} onChange={(v) => v && set("country")(v)} placeholder="Country" options={COUNTRIES} />
        <Label>City</Label>
        <TextField value={draft.city} onChange={set("city")} placeholder="City" />
        <Label>Currency</Label>
        <SelectField value={draft.currency} onChange={(v) => v && set("currency")(v)} placeholder="Currency" options={CURRENCIES} />
        <Label>Time zone</Label>
        <SelectField value={draft.timeZone} onChange={(v) => v && set("timeZone")(v)} placeholder="Time zone" options={TIME_ZONES} />
        <Label>Description</Label>
        <TextField rows={3} value={draft.description} onChange={set("description")} placeholder="A short description of the property" />
        <Label>Admin email</Label>
        <TextField value={draft.adminEmail} onChange={set("adminEmail")} placeholder="admin@hotel.com" />
        <Label>Region</Label>
        <SelectField value={draft.region} onChange={(v) => v && set("region")(v)} placeholder="Region" options={SETUP_REGIONS} />
        <Label>Property type</Label>
        <SelectField value={draft.propertyType} onChange={(v) => v && set("propertyType")(v)} placeholder="Property type" options={PROPERTY_TYPES} />
        <Label>Rooms</Label>
        <TextField value={draft.rooms} onChange={set("rooms")} placeholder="Number of rooms" />
        <Label>Address</Label>
        <TextField value={draft.address} onChange={set("address")} placeholder="Street address" />
        <Button className="mt-6 w-full disabled:opacity-40" disabled={!canSave} onClick={() => onSave(detailsFrom(hotel, draft))}>Save hotel data</Button>
      </div>
    </div>
  );
}

function ConnectSheet({ kind, providers, onClose, onConnect }: { kind: "whatsapp" | "pms"; providers: string[]; onClose: () => void; onConnect: (provider?: string) => void }) {
  const [number, setNumber] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState(providers[0] ?? "");
  const ready = kind === "whatsapp" ? number.trim().length > 0 && apiKey.trim().length > 0 : provider.length > 0;
  return (
    <Sheet title={kind === "whatsapp" ? "Connect WhatsApp" : "Connect PMS"} onClose={onClose}>
      <p className="text-[13px] leading-snug text-ink-secondary">
        {kind === "whatsapp" ? "The same details collected when a hotel is added." : "Link the hotel's booking system. ALFON only reads reservation information."}
      </p>
      {kind === "whatsapp" ? (
        <>
          <Label>Phone number</Label>
          <TextField value={number} onChange={setNumber} placeholder="50 123 4567" />
          <Label>API key</Label>
          <TextField value={apiKey} onChange={setApiKey} placeholder="WhatsApp API key" />
        </>
      ) : (
        <>
          <Label>PMS provider</Label>
          <SelectField value={provider} onChange={setProvider} placeholder="Select PMS provider" options={providers} />
        </>
      )}
      <Button className="mt-5 w-full disabled:opacity-40" disabled={!ready} onClick={() => onConnect(kind === "pms" ? provider : undefined)}>
        {kind === "whatsapp" ? "Connect WhatsApp" : "Connect PMS"}
      </Button>
    </Sheet>
  );
}
