import { Check } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { SuperAdminPrototype } from "../../linestaff/superadmin";

const FLOWS = [
  "Bottom nav: Hotels, Templates, and Settings — Super Admin only, never hotel work",
  "Hotels: the same stat cards, filter chips, and search as the other phone apps, then one card per hotel",
  "Tap a hotel for status, health score, WhatsApp and PMS, languages, and Activate or Deactivate",
  "Bell lists hotels that are inactive or have a broken connection",
  "Templates: each service is its own card, with respond and resolve set apart underneath",
  "Settings: account, AI confidence (confirmed before it saves), personal alerts, and sign out of this session only",
];

export default function SuperAdminMobile() {
  return (
    <>
      <Topbar title="Mobile App" hideQuickActions />
      <main className="flex-1 overflow-y-auto bg-subtle/40">
        <div className="mx-auto max-w-[1180px] px-6 py-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[auto_1fr] lg:items-start">
            <SuperAdminPrototype />
            <div className="space-y-5">
              <div className="rounded-card border border-line bg-white p-5">
                <h3 className="text-[16px] font-semibold text-ink">Super Admin</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">The same phone as Line Staff and Mid Manager, for watching the network. New hotels are added on the web. It never opens a hotel&apos;s own work.</p>
              </div>
              <div className="rounded-card border border-line bg-white p-5">
                <h3 className="text-[14px] font-semibold text-ink">Screens &amp; flows</h3>
                <ul className="mt-3 space-y-2.5">
                  {FLOWS.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <span className="text-ink-secondary">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-card border border-line bg-white p-5">
                <h3 className="text-[14px] font-semibold text-ink">Also included</h3>
                <ul className="mt-3 space-y-2">
                  {["Hotel list filters match the web: All, Active, Inactive, New", "AI confidence asks for confirmation before it changes", "Sign out does not touch any hotel"].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[12px] text-ink-secondary"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
