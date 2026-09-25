import { useEffect, useState } from "react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card } from "../components/ui";
import { NOTIF_KINDS, LS_KINDS, load, save, type Kind } from "../components/Notifications";

/** Setup step: choose which kinds of notification reach the bell. */
export default function NotificationSettings() {
  const [enabled, setEnabled] = useState<Kind[]>(() => load(LS_KINDS, NOTIF_KINDS.map((k) => k.key)));
  useEffect(() => save(LS_KINDS, enabled), [enabled]);
  const toggle = (k: Kind) => setEnabled((e) => (e.includes(k) ? e.filter((x) => x !== k) : [...e, k]));

  return (
    <>
      <Topbar title="Notification Settings" backTo="/onboarding" />
      <Page>
        <SetupTabs />
        <div className="max-w-2xl">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-ink">Show me notifications for</h3>
              <span className="flex gap-4 text-[13px] font-medium text-brand">
                <button onClick={() => setEnabled(NOTIF_KINDS.map((k) => k.key))}>All</button>
                <button onClick={() => setEnabled([])}>None</button>
              </span>
            </div>
            <div className="mt-2 divide-y divide-line">
              {NOTIF_KINDS.map((k) => {
                const on = enabled.includes(k.key);
                return (
                  <button key={k.key} onClick={() => toggle(k.key)} aria-pressed={on} className="flex w-full items-center gap-4 py-4 text-left">
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[14px] font-medium text-ink">{k.key}</span>
                      <span className="mt-0.5 block text-[12px] text-ink-tertiary">{k.hint}</span>
                    </span>
                    <span className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${on ? "bg-brand" : "bg-gray-300"}`}>
                      <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </Page>
    </>
  );
}
