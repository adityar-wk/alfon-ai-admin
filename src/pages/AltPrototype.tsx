import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card } from "../components/ui";

type Tab = "desktop" | "mobile" | "guest";

const TABS: { key: Tab; label: string; file: string; blurb: string }[] = [
  { key: "desktop", label: "Desktop App", file: "index.html", blurb: "The full hotel-admin dashboard — Home, Tasks, Team, Analytics, Housekeeping, Chats, Guests, Pre-Arrival, Reports and Settings." },
  { key: "mobile", label: "Mobile App", file: "mobile.html", blurb: "The line-staff phone app for on-the-floor tasks and guest chats." },
  { key: "guest", label: "Guest QR Landing", file: "guest.html", blurb: "What a guest sees after scanning the hotel's QR code." },
];

const base = `${import.meta.env.BASE_URL}prototype-v2/`;

export default function AltPrototype() {
  const [tab, setTab] = useState<Tab>("desktop");
  const info = TABS.find((t) => t.key === tab)!;
  const phone = tab !== "desktop";

  return (
    <>
      <Topbar title="Alt Prototype" hideQuickActions />
      <Page>
        <h2 className="font-display text-[26px] font-bold leading-tight text-ink">Alt Prototype</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-secondary">
          A separate, self-contained build of Alfon AI — plain React with no bundler, kept here for side-by-side reference against the main app.
        </p>

        <div className="mt-6 flex gap-6 border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 pb-3 text-[14px] font-medium ${tab === t.key ? "border-brand text-brand" : "border-transparent text-ink-secondary hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-[13px] text-ink-secondary">{info.blurb}</p>
          <a
            href={`${base}${info.file}`}
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline"
          >
            Open in new tab <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <Card className={`mt-4 overflow-hidden p-0 ${phone ? "" : ""}`}>
          <div className={phone ? "flex justify-center bg-subtle/60 py-8" : ""}>
            <iframe
              key={tab}
              src={`${base}${info.file}`}
              title={info.label}
              className={phone ? "h-[900px] w-[520px] border-0" : "h-[900px] w-full border-0"}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </Card>
      </Page>
    </>
  );
}
