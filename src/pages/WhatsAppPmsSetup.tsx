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

export default function WhatsAppPmsSetup() {
  return (
    <>
      <Topbar title="WhatsApp and PMS Setup" backTo="/onboarding" />
      <Page>
        <SetupTabs />
        <p className="mb-6 text-[13px] text-ink-secondary">
          Connect the channel guests message you on and the system your reservations come from.
        </p>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* WhatsApp */}
          <Card className="flex flex-col p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <MessageCircle className="h-5 w-5" style={{ color: WA }} />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">WhatsApp</h3>
                  <p className="text-[12px] text-ink-secondary">Primary channel for guest communication</p>
                </div>
              </div>
              <Connected />
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Business number">
                <div className="grid grid-cols-[92px_1fr] gap-2">
                  <Select defaultValue="+91">
                    <option>+91</option>
                    <option>+1</option>
                    <option>+44</option>
                  </Select>
                  <Input defaultValue="98765 43210" />
                </div>
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Display name">
                  <Input defaultValue="Prime Hotel Concierge" />
                </Field>
                <Field label="Provider">
                  <Select defaultValue="twilio">
                    <option value="twilio">Twilio WhatsApp Business</option>
                    <option value="meta">Meta Cloud API</option>
                    <option value="360">360dialog</option>
                  </Select>
                </Field>
              </div>
              <Field label="Greeting message" hint="Sent to guests when they start a chat.">
                <Textarea rows={3} defaultValue={"Hello! 👋 Welcome to Prime Hotel.\nHow can we assist you today?"} />
              </Field>
            </div>

            <div className="mt-auto flex gap-3 pt-6">
              <Button variant="outline">Send test message</Button>
            </div>
          </Card>

          {/* PMS */}
          <Card className="flex flex-col p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-tint text-brand">
                  <Database className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[16px] font-semibold text-ink">PMS / Reservations</h3>
                  <p className="text-[12px] text-ink-secondary">Syncs reservations and guest data in real time</p>
                </div>
              </div>
              <Connected />
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Provider">
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
              <div className="flex items-center justify-between rounded-xl bg-subtle/70 px-4 py-3 text-[13px]">
                <span className="text-ink-secondary">Last synced</span>
                <span className="font-medium text-ink">2 minutes ago</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button>Reconnect</Button>
              <Button variant="outline">Test connection</Button>
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-5">
              <div className="flex items-start gap-2.5">
                <UploadCloud className="mt-0.5 h-4 w-4 text-ink-tertiary" />
                <p className="text-[12px] leading-snug text-ink-secondary">
                  <span className="font-medium text-ink">No PMS?</span> Upload reservation files manually instead.
                </p>
              </div>
              <Button variant="outline">Upload file</Button>
            </div>
          </Card>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline">Save as draft</Button>
          <Button>Continue →</Button>
        </div>
      </Page>
    </>
  );
}
