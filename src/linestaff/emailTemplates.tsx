import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { PhoneFrame } from "./mobile";
import logoSrc from "../assets/alfon-logo.png";
// built by `node emails/build.mjs` from the same source as the production HTML in emails/templates/
import manifest from "../../emails/templates/manifest.json";

type Email = (typeof manifest.emails)[number];
type Mode = "sample" | "raw";

const SAMPLE: Record<string, string> = manifest.sample;
const TIMES = ["9:30", "9:12", "Yesterday", "Mon"];

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** swap {{merge fields}} for sample values (or leave them visible), always resolving the logo */
function fill(text: string, mode: Mode, html: boolean) {
  return text
    .replace(/\{\{Logo URL\}\}/g, logoSrc)
    .replace(/\{\{([^}]+)\}\}/g, (m, key: string) => {
      if (mode === "raw" || SAMPLE[key] == null) return m;
      return html ? escapeHtml(SAMPLE[key]) : SAMPLE[key];
    });
}

/** the transactional emails, read in a phone mail app: inbox → message */
export function EmailTemplatesPrototype() {
  const [mode, setMode] = useState<Mode>("sample");
  const [open, setOpen] = useState<number | null>(null);

  return (
    <PhoneFrame white>
      {open === null ? (
        <Inbox mode={mode} setMode={setMode} onOpen={setOpen} />
      ) : (
        <Message email={manifest.emails[open]} time={TIMES[open]} mode={mode} onBack={() => setOpen(null)} />
      )}
    </PhoneFrame>
  );
}

function Inbox({ mode, setMode, onOpen }: { mode: Mode; setMode: (m: Mode) => void; onOpen: (i: number) => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-3 pt-2">
        <h2 className="font-display text-[28px] font-semibold text-ink">Inbox</h2>
        <p className="mt-0.5 text-[13px] text-ink-secondary">{manifest.emails.length} emails from ALFON</p>
        <div className="mt-4 inline-flex rounded-control bg-subtle p-1" role="group" aria-label="Email content">
          {(["sample", "raw"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${mode === m ? "bg-white text-ink shadow-card" : "text-ink-secondary hover:text-ink"}`}
            >
              {m === "sample" ? "Sample data" : "Placeholders"}
            </button>
          ))}
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto border-t border-line">
        {manifest.emails.map((e, i) => (
          <li key={e.id} className="border-b border-line">
            <button onClick={() => onOpen(i)} className="flex w-full gap-3 px-5 py-4 text-left transition-colors hover:bg-subtle/60">
              <Avatar />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-semibold text-ink">Team ALFON</span>
                  <span className={`shrink-0 text-[12px] ${i < 2 ? "font-semibold text-brand" : "text-ink-tertiary"}`}>{TIMES[i]}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">{fill(e.subject, mode, false)}</p>
                  {i < 2 && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[13px] leading-[18px] text-ink-secondary">{fill(e.preheader, mode, false)}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Message({ email, time, mode, onBack }: { email: Email; time: string; mode: Mode; onBack: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  // size the iframe to the email so the phone scrolls as one page (re-measure once web fonts settle)
  const measure = () => {
    const doc = frame.current?.contentDocument;
    // body, not documentElement: the root never reports less than the iframe's current height
    if (doc?.body) setHeight(doc.body.scrollHeight);
  };
  const onLoad = () => {
    measure();
    frame.current?.contentDocument?.fonts?.ready.then(measure);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center border-b border-line px-3">
        <button onClick={onBack} className="flex items-center gap-0.5 rounded-control px-1.5 py-1 text-[15px] font-medium text-brand hover:bg-brand-tint">
          <ChevronLeft className="h-5 w-5" />
          Inbox
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 pb-4 pt-4">
          <h2 className="font-display text-[19px] font-semibold leading-[26px] text-ink">{fill(email.subject, mode, false)}</h2>
          <div className="mt-3 flex items-center gap-3">
            <Avatar />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-ink">Team ALFON</p>
              <p className="text-[12px] text-ink-tertiary">to {mode === "sample" ? SAMPLE["First Name"] : "{{First Name}}"}</p>
            </div>
            <span className="text-[12px] text-ink-tertiary">{time}</span>
          </div>
        </div>
        <iframe
          ref={frame}
          key={`${email.id}-${mode}`}
          title={`${email.name} email`}
          srcDoc={fill(email.html, mode, true)}
          onLoad={onLoad}
          scrolling="no"
          className="block w-full border-0"
          style={{ height }}
        />
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint font-display text-[15px] font-bold text-brand" aria-hidden="true">
      A
    </span>
  );
}
