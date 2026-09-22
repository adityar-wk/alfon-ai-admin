import { useState } from "react";
import { Info, Check, MessageCircle, Database, UploadCloud } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card, Badge, Button, Field, Input, Select, Textarea } from "../components/ui";

const WA = "#25D366";

function InfoBanner({ tone, children }: { tone: "green" | "blue"; children: React.ReactNode }) {
  const cls = tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700";
  return (
    <div className={`flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-[12px] ${cls}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Connected() {
  return (
    <Badge tone="success">
      <Check className="h-3.5 w-3.5" /> Connected
    </Badge>
  );
}

const TABS = ["WhatsApp", "PMS / Reservation"] as const;

export default function WhatsAppPmsSetup() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("WhatsApp");

  return (
    <>
      <Topbar title="WhatsApp and PMS Setup" backTo="/onboarding" />
      <Page>
        <SetupTabs />
        <p className="mb-6 text-[13px] text-ink-secondary">
          Configure guest communication and reservation data source.
        </p>

        <div className="max-w-3xl space-y-5">
          <div className="flex items-center gap-6 border-b border-line">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-[13px] font-medium ${
                  t === tab
                    ? "border-brand text-brand"
                    : "border-transparent text-ink-secondary hover:text-ink"
                }`}
              >
                {t === "WhatsApp" ? (
                  <MessageCircle className="h-4 w-4" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {t}
              </button>
            ))}
          </div>

          {tab === "WhatsApp" && (
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <MessageCircle className="h-4 w-4" style={{ color: WA }} />
                </span>
                <h3 className="text-[15px] font-semibold text-ink">WhatsApp Guest Communication</h3>
              </div>

              <InfoBanner tone="green">
                WhatsApp is the primary channel for guest communication. Connect your WhatsApp
                Business number to get started.
              </InfoBanner>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="WhatsApp Business Number">
                  <div className="grid grid-cols-[92px_1fr] gap-2">
                    <Select defaultValue="+91">
                      <option>+91</option>
                      <option>+1</option>
                      <option>+44</option>
                    </Select>
                    <Input defaultValue="98765 43210" />
                  </div>
                </Field>
                <Field label="Display Name">
                  <Input defaultValue="Prime Hotel Concierge" />
                </Field>
                <Field label="WhatsApp Provider / BSP">
                  <Select defaultValue="twilio">
                    <option value="twilio">Twilio WhatsApp Business</option>
                    <option value="meta">Meta Cloud API</option>
                    <option value="360">360dialog</option>
                  </Select>
                </Field>
                <Field label="Connection Status">
                  <div className="flex h-10 items-center">
                    <Connected />
                  </div>
                </Field>
              </div>

              <Field
                className="mt-4"
                label="Default Guest Greeting Message"
                hint="This message will be sent to guests when they start a chat."
              >
                <Textarea
                  rows={3}
                  defaultValue={"Hello! 👋 Welcome to Prime Hotel.\nHow can we assist you today?"}
                />
              </Field>
            </Card>
          )}

          {tab === "PMS / Reservation" && (
            <div className="space-y-4">
              <InfoBanner tone="blue">
                Choose how reservation and stay data will flow into Alfon AI.
              </InfoBanner>

              {/* Primary: Connect PMS */}
              <Card className="border-brand/30 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-tint text-brand">
                      <Database className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-ink">Connect your PMS</h3>
                      <p className="text-[12px] text-ink-secondary">
                        Recommended — automatically syncs reservations and guest data in real time.
                      </p>
                    </div>
                  </div>
                  <Connected />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="PMS Provider">
                    <Select defaultValue="opera">
                      <option value="opera">Opera Cloud</option>
                      <option value="cloudbeds">Cloudbeds</option>
                      <option value="mews">Mews</option>
                    </Select>
                  </Field>
                  <Field label="Environment">
                    <Select defaultValue="prod">
                      <option value="prod">Production</option>
                      <option value="sandbox">Sandbox</option>
                    </Select>
                  </Field>
                </div>

                <div className="mt-4 flex gap-3">
                  <Button>Reconnect</Button>
                  <Button variant="outline">Test Connection</Button>
                </div>
              </Card>

              {/* Secondary: Manual upload */}
              <div className="rounded-card border border-dashed border-line bg-subtle/60 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <UploadCloud className="mt-0.5 h-4 w-4 text-ink-tertiary" />
                    <div>
                      <div className="text-[13px] font-medium text-ink">Manual Reservation Upload</div>
                      <p className="text-[12px] text-ink-secondary">
                        No PMS? Upload reservation files manually on a regular basis instead.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Upload File</Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button>Continue →</Button>
            <Button variant="outline">Save as Draft</Button>
          </div>
        </div>
      </Page>
    </>
  );
}
