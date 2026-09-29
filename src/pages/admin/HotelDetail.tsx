import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  Building2, MessageSquare, Server, HeartPulse, Activity, Home as HomeIcon, Users2, Zap, Power, Pencil, AlertTriangle, Languages,
} from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Button, Badge } from "../../components/ui";
import { HOTELS } from "../../data/hotels";

const SCORE_PILLARS = [
  { title: "Guest Pulse", weight: 30, icon: HeartPulse },
  { title: "Operations Heartbeat", weight: 25, icon: Activity },
  { title: "Housekeeping Rhythm", weight: 20, icon: HomeIcon },
  { title: "Team Energy", weight: 15, icon: Users2 },
  { title: "Recovery Rate", weight: 10, icon: Zap },
];

export default function HotelDetail() {
  const { id } = useParams();
  const [active, setActive] = useState(true);
  const hotel = HOTELS.find((h) => String(h.id) === id);
  if (!hotel) return <Navigate to="/admin/hotels" replace />;

  return (
    <>
      <Topbar title="Hotel" hideQuickActions backTo="/admin/hotels" />
      <Page>
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand"><Building2 className="h-7 w-7" /></span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-[22px] font-bold text-ink">{hotel.name}</h2>
                  <Badge tone={hotel.status === "Active" ? "success" : hotel.status === "New" ? "info" : "neutral"}>{hotel.status}</Badge>
                </div>
                <div className="mt-1 text-[13px] text-ink-secondary">{hotel.location} · {hotel.rooms} Rooms · {hotel.propertyType}</div>
                <div className="mt-1 text-[12px] text-ink-tertiary">{hotel.currency} · {hotel.timeZone} · Onboarded {hotel.onboarded}</div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline"><Pencil className="h-4 w-4" /> Edit Details</Button>
              <Button variant="outline" onClick={() => setActive((v) => !v)}>
                <Power className="h-4 w-4" /> {active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-ink">Health Score</h3>
              {hotel.healthScore !== null && <span className="text-[26px] font-bold text-ink">{hotel.healthScore}%</span>}
            </div>
            <p className="mt-1 text-[13px] text-ink-secondary">{hotel.healthNote}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {SCORE_PILLARS.map((p) => (
                <div key={p.title} className="rounded-xl border border-line p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-brand"><p.icon className="h-4 w-4" /></span>
                  <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">{p.weight}%</div>
                  <div className="text-[12px] font-medium leading-snug text-ink">{p.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h3 className="text-[15px] font-semibold text-ink">System Connections</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-ink"><MessageSquare className="h-4 w-4 text-ink-tertiary" /> WhatsApp</span>
                  <span className={`text-[12px] font-medium ${hotel.whatsapp === "Connected" ? "text-emerald-600" : hotel.whatsapp === "Pending" ? "text-amber-600" : "text-red-500"}`}>{hotel.whatsapp}</span>
                </div>
              </div>
              <div className="rounded-xl border border-line p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-ink"><Server className="h-4 w-4 text-ink-tertiary" /> PMS{hotel.pmsProvider ? ` · ${hotel.pmsProvider}` : ""}</span>
                  <span className={`text-[12px] font-medium ${hotel.pms === "Connected" ? "text-emerald-600" : hotel.pms === "Pending" ? "text-amber-600" : "text-red-500"}`}>{hotel.pms}</span>
                </div>
                <div className="mt-2 text-[12px] text-ink-tertiary">Last good sync: {hotel.lastSync}</div>
                {hotel.pms === "Disconnected" && (
                  <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-red-50 px-2.5 py-2 text-[11px] text-red-600">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Connection lost — reconnect from the hotel's own setup.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h3 className="text-[15px] font-semibold text-ink">Languages Spoken</h3>
            <p className="mt-1 text-[13px] text-ink-secondary">Languages the AI concierge and on-site team can support guests in.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {hotel.languages.map((l) => (
                <span key={l} className="flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-[12px] font-medium text-brand">
                  <Languages className="h-3.5 w-3.5" /> {l}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Page>
    </>
  );
}
