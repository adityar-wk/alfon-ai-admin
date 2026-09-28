import { useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card } from "../../components/ui";
import { usePersona } from "../../persona";

const ALERTS = [
  { key: "health", label: "Hotel Health Score drops", hint: "A hotel's score falls sharply against its own average" },
  { key: "pms", label: "A PMS or WhatsApp connection breaks", hint: "Catch a broken connection before a hotel does" },
  { key: "onboarding", label: "A new hotel finishes onboarding", hint: "Departments and connections are all set" },
] as const;

export default function SuperAdminSettings() {
  const { me } = usePersona();
  const [enabled, setEnabled] = useState<string[]>(["health", "pms", "onboarding"]);
  const toggle = (k: string) => setEnabled((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));

  return (
    <>
      <Topbar title="Settings" hideQuickActions />
      <Page>
        <h2 className="font-display text-[26px] font-bold leading-tight text-ink">Settings</h2>
        <p className="mt-1 text-[13px] text-ink-secondary">Your own account and personal alerts. This never changes a setting inside any hotel.</p>

        <div className="mt-5 max-w-2xl space-y-5">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint font-display text-[18px] font-semibold text-brand">{me.initials}</span>
              <div>
                <div className="text-[16px] font-semibold text-ink">{me.name}</div>
                <div className="text-[13px] text-ink-secondary">{me.role}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Bell className="h-4 w-4 text-brand" /> My personal alerts</div>
            <p className="mt-1 text-[13px] text-ink-secondary">Separate from the alerts every Super Admin gets by default.</p>
            <div className="mt-3 divide-y divide-line">
              {ALERTS.map((a) => {
                const on = enabled.includes(a.key);
                return (
                  <button key={a.key} onClick={() => toggle(a.key)} aria-pressed={on} className="flex w-full items-center gap-4 py-4 text-left">
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[14px] font-medium text-ink">{a.label}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-tertiary">{a.hint}</span>
                    </span>
                    <span className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${on ? "bg-brand" : "bg-gray-300"}`}>
                      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-ink">Sign out of the Super Admin app</div>
                <p className="mt-0.5 text-[12px] text-ink-tertiary">This only ever ends this session — it never affects a hotel.</p>
              </div>
              <button className="flex items-center gap-2 rounded-control border border-line px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-subtle"><LogOut className="h-4 w-4" /> Sign Out</button>
            </div>
          </Card>
        </div>
      </Page>
    </>
  );
}
