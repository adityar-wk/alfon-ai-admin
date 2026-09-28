import { useState } from "react";
import { ShieldCheck, Ban, UserCheck, Save } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Button } from "../../components/ui";

const NEVER_DECIDE = [
  "Late check-out, a room reservation, a rate change, or an exception to hotel policy — always referred to hotel staff.",
  "The AI never searches the internet or looks anywhere outside the hotel's own approved files and the guest's own chat history.",
  "The AI never asks a guest, on its own, for feedback, a rating, a review or a survey. It may say thank you if a guest offers feedback itself.",
];

const NEEDS_A_PERSON = [
  "The guest sounds upset or distressed.",
  "The guest asks to speak with a person.",
  "The matter is sensitive, medical, a safety issue or a complaint.",
  "The AI does not have enough information in the hotel's own files.",
  "The AI is not sure enough of its own answer.",
];

export default function AiControls() {
  const [confidence, setConfidence] = useState(82);
  const [draft, setDraft] = useState(82);
  const dirty = confidence !== draft;

  return (
    <>
      <Topbar title="AI Controls" hideQuickActions />
      <Page>
        <h2 className="font-display text-[26px] font-bold leading-tight text-ink">Controlling what the AI may do</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-secondary">
          Alfon's Founders own the AI's training, tone and behaviour. This is where that authority is carried out — the one number that decides when the AI must stop and let a person answer instead.
        </p>

        <Card className="mt-5 p-6">
          <div className="flex items-center gap-2 text-[15px] font-semibold text-ink"><ShieldCheck className="h-4 w-4 text-brand" /> How sure is sure enough</div>
          <p className="mt-1 text-[13px] text-ink-secondary">
            Every AI answer is checked against this number before it reaches a guest. An answer at or above it is sent to the guest; an answer below it is stopped, and a person checks or answers instead. This applies network-wide, across every hotel.
          </p>
          <div className="mt-6 flex items-center gap-5">
            <input
              type="range"
              min={50}
              max={99}
              value={draft}
              onChange={(e) => setDraft(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-subtle accent-brand"
            />
            <span className="w-16 shrink-0 text-right text-[26px] font-bold text-ink">{draft}%</span>
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-ink-tertiary"><span>More answers handled by the AI</span><span>More answers handed to a person</span></div>
          <div className="mt-5 flex items-center gap-3">
            <Button disabled={!dirty} className="disabled:opacity-40" onClick={() => setConfidence(draft)}><Save className="h-4 w-4" /> Save Setting</Button>
            {!dirty && <span className="text-[12px] text-ink-tertiary">Currently live at {confidence}%.</span>}
            {dirty && <span className="text-[12px] font-medium text-brand">Unsaved change</span>}
          </div>
        </Card>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-ink"><Ban className="h-4 w-4 text-red-500" /> Topics the AI may never decide on its own</div>
            <ul className="mt-3 space-y-2.5">
              {NEVER_DECIDE.map((t) => (
                <li key={t} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-secondary"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />{t}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-ink"><UserCheck className="h-4 w-4 text-brand" /> A person is needed when</div>
            <ul className="mt-3 space-y-2.5">
              {NEEDS_A_PERSON.map((t) => (
                <li key={t} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-secondary"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />{t}</li>
              ))}
            </ul>
          </Card>
        </div>

        <p className="mt-5 text-[12px] text-ink-tertiary">Only Alfon sets this number. It is not a setting a hotel's own Hotel Admin can change.</p>
      </Page>
    </>
  );
}
