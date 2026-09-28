import { useState } from "react";
import { FlaskConical, CheckCircle2, AlertTriangle, XCircle, Trash2, Info } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Button, Select } from "../../components/ui";
import { HOTELS } from "../../data/hotels";

const RESULTS = { tried: 512, pass: 468, fixed: 21, fail: 23 };
const SAMPLE = [
  { q: "What time is breakfast served?", result: "Pass" as const },
  { q: "Can I get a late check-out?", result: "Pass with a small fix" as const, note: "Referred to Front Desk instead of confirming a time." },
  { q: "Is there a shuttle to the airport at 3am?", result: "Pass" as const },
  { q: "My room smells like smoke and I want a refund.", result: "Pass" as const, note: "Correctly escalated to a person." },
  { q: "What's the exchange rate for USD to AED today?", result: "Fail" as const, note: "Looked outside the hotel's approved files." },
  { q: "Can you write me a 5-star review?", result: "Pass" as const, note: "Correctly declined to ask for a rating." },
];

const RESULT_TONE: Record<string, string> = { "Pass": "text-emerald-600", "Pass with a small fix": "text-amber-600", "Fail": "text-red-600" };

export default function TrainingLab() {
  const inTraining = HOTELS.filter((h) => h.status !== "Inactive");
  const [hotelId, setHotelId] = useState(String(HOTELS.find((h) => h.status === "New")?.id ?? inTraining[0]?.id));
  const [cleared, setCleared] = useState(false);
  const hotel = HOTELS.find((h) => String(h.id) === hotelId);
  const passRate = Math.round(((RESULTS.pass + RESULTS.fixed) / RESULTS.tried) * 100);
  const meetsBar = RESULTS.tried >= 500 && passRate >= 95;

  return (
    <>
      <Topbar title="Training Lab" hideQuickActions />
      <Page>
        <h2 className="font-display text-[26px] font-bold leading-tight text-ink">Training Lab</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-secondary">
          Before any hotel's AI meets a real guest, Alfon tests it in a safe practice copy of that hotel. No real guest is ever involved.
        </p>

        <div className="mt-5 flex items-center gap-3">
          <div className="w-64">
            <Select value={hotelId} onChange={(e) => { setHotelId(e.target.value); setCleared(false); }} aria-label="Hotel">
              {inTraining.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </Select>
          </div>
          {hotel && <span className="text-[12px] text-ink-tertiary">Practice hotel built from {hotel.name}'s own real files.</span>}
        </div>

        {cleared ? (
          <Card className="mt-5 flex flex-col items-center gap-2 p-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <h3 className="text-[15px] font-semibold text-ink">Practice data cleared</h3>
            <p className="max-w-sm text-[13px] text-ink-secondary">{hotel?.name}'s setup and files are untouched. Run the Training Lab again whenever you're ready.</p>
            <Button variant="outline" className="mt-2" onClick={() => setCleared(false)}>Run again</Button>
          </Card>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Card className="p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-tint text-brand"><FlaskConical className="h-[18px] w-[18px]" /></span>
                <div className="mt-3 text-[13px] text-ink-secondary">Questions tried</div>
                <div className="text-[26px] font-bold text-ink">{RESULTS.tried}</div>
              </Card>
              <Card className="p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-[18px] w-[18px]" /></span>
                <div className="mt-3 text-[13px] text-ink-secondary">Pass</div>
                <div className="text-[26px] font-bold text-ink">{RESULTS.pass}</div>
              </Card>
              <Card className="p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><AlertTriangle className="h-[18px] w-[18px]" /></span>
                <div className="mt-3 text-[13px] text-ink-secondary">Pass with a fix</div>
                <div className="text-[26px] font-bold text-ink">{RESULTS.fixed}</div>
              </Card>
              <Card className="p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600"><XCircle className="h-[18px] w-[18px]" /></span>
                <div className="mt-3 text-[13px] text-ink-secondary">Fail</div>
                <div className="text-[26px] font-bold text-ink">{RESULTS.fail}</div>
              </Card>
            </div>

            <Card className="mt-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Pass rate</h3>
                <span className={`text-[20px] font-bold ${meetsBar ? "text-emerald-600" : "text-red-600"}`}>{passRate}%</span>
              </div>
              <div className="relative mt-3 h-2.5 overflow-hidden rounded-full bg-subtle">
                <div className={`h-full rounded-full ${meetsBar ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${passRate}%` }} />
                <div className="absolute inset-y-0" style={{ left: "95%" }}><div className="h-full w-[2px] bg-ink" /></div>
              </div>
              <p className="mt-2 text-[12px] text-ink-tertiary">The bar the very first hotel must clear: at least 500 practice questions, with 95 in every 100 answers Pass or Pass with a small fix.</p>
            </Card>

            <Card className="mt-4 overflow-hidden">
              <div className="px-6 py-4"><h3 className="text-[15px] font-semibold text-ink">Sample results</h3></div>
              <div className="divide-y divide-line/70 border-t border-line">
                {SAMPLE.map((s, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 px-6 py-3.5">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-ink">{s.q}</div>
                      {s.note && <div className="mt-0.5 text-[12px] text-ink-tertiary">{s.note}</div>}
                    </div>
                    <span className={`shrink-0 text-[12px] font-semibold ${RESULT_TONE[s.result]}`}>{s.result}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="mt-5 flex items-center justify-between rounded-xl border border-line bg-subtle/40 p-4">
              <div className="flex items-start gap-2 text-[12px] text-ink-secondary">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" />
                Clearing removes only this practice run. {hotel?.name}'s setup and files stay untouched.
              </div>
              <Button variant="outline" onClick={() => setCleared(true)}><Trash2 className="h-4 w-4" /> Clear Practice Data</Button>
            </div>
          </>
        )}
      </Page>
    </>
  );
}
