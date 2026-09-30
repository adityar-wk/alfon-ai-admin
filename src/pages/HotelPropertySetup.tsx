import { useState } from "react";
import { Lock, Instagram, Facebook, Search, X } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Button, Field, Input, Select } from "../components/ui";
import { useGoNextStep } from "../data/onboarding";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-4 text-[15px] font-semibold text-ink">{title}</h3>
      {children}
    </section>
  );
}

/** set by Super Admin when the hotel was added — Hotel Admin can see it, not change it here */
function Locked({ value }: { value: string }) {
  return (
    <div className="flex h-10 items-center justify-between rounded-control border border-line bg-subtle px-3 text-[13px] text-ink-secondary">
      <span className="truncate">{value}</span>
      <Lock className="h-3.5 w-3.5 shrink-0 text-ink-tertiary" />
    </div>
  );
}

const LANGUAGES = [
  "English", "Arabic", "Spanish", "French", "Hindi", "Mandarin", "German", "Russian",
  "Portuguese", "Italian", "Japanese", "Korean", "Turkish", "Urdu", "Tagalog", "Bengali",
];

export default function HotelPropertySetup() {
  const goNext = useGoNextStep(1);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [langQuery, setLangQuery] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const toggleLang = (l: string) => setLanguages((ls) => (ls.includes(l) ? ls.filter((x) => x !== l) : [...ls, l]));
  const langMatches = LANGUAGES.filter((l) => l.toLowerCase().includes(langQuery.trim().toLowerCase()));

  return (
    <>
      <Topbar title="Hotel Property Setup" backTo="/onboarding" />
      <Page>
        <SetupTabs />
        <div className="max-w-3xl">
          <div className="space-y-8">
            <Section title="Basic Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Hotel Name" required hint="Set by Alfon when this hotel was added.">
                  <Locked value="Sea View Hotel" />
                </Field>
                <Field label="Total Rooms" required>
                  <Input defaultValue="245" />
                </Field>
              </div>
              <Field className="mt-4" label="Languages Spoken" required hint="Select every language your team can support guests in.">
                <div className="relative">
                  {!!languages.length && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {languages.map((l) => (
                        <span key={l} className="flex items-center gap-1 rounded-full bg-brand-tint py-1 pl-3 pr-1.5 text-[12px] font-medium text-brand">
                          {l}
                          <button type="button" onClick={() => toggleLang(l)} aria-label={`Remove ${l}`} className="rounded-full p-0.5 hover:bg-brand/15">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                    <Input
                      className="pl-9"
                      value={langQuery}
                      onChange={(e) => setLangQuery(e.target.value)}
                      onFocus={() => setLangOpen(true)}
                      placeholder="Search languages…"
                    />
                  </div>
                  {langOpen && (
                    <>
                      <button aria-label="Close" className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                      <div className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-56 w-full overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-lg">
                        {langMatches.map((l) => {
                          const on = languages.includes(l);
                          return (
                            <label key={l} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-ink hover:bg-subtle">
                              <input type="checkbox" className="h-4 w-4 accent-brand" checked={on} onChange={() => toggleLang(l)} />
                              {l}
                            </label>
                          );
                        })}
                        {!langMatches.length && (
                          <p className="px-2.5 py-3 text-center text-[12px] text-ink-tertiary">No language matches "{langQuery.trim()}".</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Field>
            </Section>

            <Section title="Address">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Address Line 1" required>
                  <Input defaultValue="123 Ocean Drive" />
                </Field>
                <Field label="Address Line 2">
                  <Input defaultValue="Marine Beach" />
                </Field>
                <Field label="City" required>
                  <Input defaultValue="Miami" />
                </Field>
                <Field label="State / Province">
                  <Input defaultValue="Florida" />
                </Field>
                <Field label="Country" required>
                  <Select defaultValue="United States">
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>India</option>
                  </Select>
                </Field>
                <Field label="ZIP / Postal Code">
                  <Input defaultValue="33139" />
                </Field>
                <Field className="sm:col-span-2" label="Google Maps Location (Optional)" hint="Paste a Google Maps link so guests and staff can find the hotel.">
                  <Input placeholder="https://maps.google.com/…" />
                </Field>
              </div>
            </Section>

            <Section title="Contact Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Phone Number" required>
                  <Input defaultValue="+1 (305) 555-0123" />
                </Field>
                <Field label="Email Address" required>
                  <Input defaultValue="info@seaviewhotel.com" />
                </Field>
                <Field label="Website">
                  <Input defaultValue="www.seaviewhotel.com" />
                </Field>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Instagram (Optional)">
                  <div className="relative">
                    <Instagram className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                    <Input className="pl-9" placeholder="instagram.com/seaviewhotel" />
                  </div>
                </Field>
                <Field label="Facebook (Optional)">
                  <div className="relative">
                    <Facebook className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                    <Input className="pl-9" placeholder="facebook.com/seaviewhotel" />
                  </div>
                </Field>
              </div>
            </Section>

            <Section title="Preferences">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Time Zone" required hint="Set by Alfon when this hotel was added.">
                  <Locked value="(GMT-05:00) Eastern Time (US & Canada)" />
                </Field>
                <Field label="Date Format" required hint="Set by Alfon when this hotel was added.">
                  <Locked value="May 24, 2025 (MMM DD, YYYY)" />
                </Field>
              </div>
            </Section>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={goNext}>Continue →</Button>
            <Button variant="outline">Save Draft</Button>
          </div>
        </div>
      </Page>
    </>
  );
}
