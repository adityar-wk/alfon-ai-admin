import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, MessageSquare, Server, Check, Lightbulb, ArrowLeft, ArrowRight, KeyRound, Send,
} from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Button, Field, Input, Select, Textarea, PhoneInput } from "../../components/ui";

const STEPS = ["Hotel Details", "System Connections", "Review & Add"] as const;
type Step = 0 | 1 | 2;

const PMS_PROVIDERS = ["Opera (Oracle)", "Mews"];

const COUNTRIES = ["United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Bahrain", "Kuwait", "United Kingdom", "Philippines", "Indonesia", "Switzerland"];

type Details = {
  name: string; country: string; city: string; currency: string; timeZone: string; description: string;
  region: string; propertyType: string; rooms: string; address: string; adminEmail: string;
};

export default function AddHotel() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [details, setDetails] = useState<Details>({
    name: "", country: "United Arab Emirates", city: "", currency: "AED (UAE Dirham)", timeZone: "Asia/Dubai (GMT+4)", description: "",
    region: "Middle East", propertyType: "Resort", rooms: "", address: "", adminEmail: "",
  });

  const [wa, setWa] = useState({ code: "+971", number: "", displayName: "", apiKey: "", businessId: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [waConnected, setWaConnected] = useState(false);

  const [pms, setPms] = useState({ provider: "", webhook: "", mewsToken: "" });
  const [pmsConnected, setPmsConnected] = useState(false);

  const set = <K extends keyof Details>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  const detailsValid = details.name.trim() && details.country.trim() && details.city.trim();
  const pmsValid = !!pms.provider && (pms.provider !== "Mews" || pms.mewsToken.trim());
  const canNext = step === 0 ? !!detailsValid : true;

  const stepStatus = (i: Step) => (i < step ? "done" : i === step ? "current" : "pending");

  const goNext = () => setStep((s) => (Math.min(2, s + 1) as Step));
  const goBack = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const create = (sendLink: boolean) => {
    const q = new URLSearchParams({ created: details.name });
    if (sendLink && details.adminEmail.trim()) q.set("email", details.adminEmail.trim());
    navigate(`/admin/hotels?${q.toString()}`);
  };

  return (
    <>
      <Topbar title="Add Hotel" hideQuickActions backTo="/admin/hotels" />
      <Page>
        <p className="text-[13px] text-ink-secondary">
          <button onClick={() => navigate("/admin/hotels")} className="inline-flex items-center gap-1 text-ink-secondary hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" /> Back to Hotels</button>
        </p>
        <h2 className="mt-2 font-display text-[26px] font-bold leading-tight text-ink">Add New Hotel</h2>
        <p className="mt-1 text-[13px] text-ink-secondary">
          {step === 0 && "Create a new hotel and connect its systems to get started."}
          {step === 1 && "Connect WhatsApp and PMS to enable guest communication and booking information."}
          {step === 2 && "Review the details and create the hotel."}
        </p>

        {/* stepper */}
        <div className="mt-6 flex items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold ${
                  stepStatus(i as Step) === "done" ? "bg-brand text-white" : stepStatus(i as Step) === "current" ? "bg-brand text-white" : "bg-subtle text-ink-tertiary"
                }`}>
                  {stepStatus(i as Step) === "done" ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={`whitespace-nowrap text-[12px] font-medium ${stepStatus(i as Step) === "pending" ? "text-ink-tertiary" : "text-ink"}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <span className={`mx-2 mb-5 h-[2px] flex-1 ${i < step ? "bg-brand" : "bg-line"}`} />}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="min-w-0 space-y-5">
            {step === 0 && (
              <>
                <Card className="p-6">
                  <h3 className="text-[16px] font-semibold text-ink">Basic Details</h3>
                  <p className="mt-1 text-[13px] text-ink-secondary">Add the core information for this hotel.</p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Hotel Name" required><Input value={details.name} onChange={set("name")} placeholder="e.g. The Palm Retreat" /></Field>
                    <Field label="Country" required>
                      <Select value={details.country} onChange={set("country")}>
                        {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </Select>
                    </Field>
                    <Field label="City" required><Input value={details.city} onChange={set("city")} placeholder="e.g. Dubai" /></Field>
                    <Field label="Currency" required>
                      <Select value={details.currency} onChange={set("currency")}>
                        {["AED (UAE Dirham)", "SAR (Saudi Riyal)", "USD (US Dollar)", "GBP (British Pound)", "QAR (Qatari Riyal)"].map((c) => <option key={c}>{c}</option>)}
                      </Select>
                    </Field>
                    <Field label="Time Zone" required>
                      <Select value={details.timeZone} onChange={set("timeZone")}>
                        {["Asia/Dubai (GMT+4)", "Asia/Riyadh (GMT+3)", "Europe/London (GMT+0)", "Asia/Manila (GMT+8)"].map((c) => <option key={c}>{c}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <Field className="mt-4" label="Description (Optional)">
                    <Textarea rows={3} maxLength={250} value={details.description} onChange={set("description")} placeholder="A short description of the property…" />
                    <div className="mt-1 text-right text-[11px] text-ink-tertiary">{details.description.length}/250</div>
                  </Field>
                  <Field className="mt-4" label="Admin Email ID" hint="Once you've reviewed everything, the hotel's setup link is sent to this address.">
                    <Input type="email" value={details.adminEmail} onChange={set("adminEmail")} placeholder="admin@thepalmretreat.com" />
                  </Field>
                </Card>

                <Card className="p-6">
                  <h3 className="text-[16px] font-semibold text-ink">Additional Information</h3>
                  <p className="mt-1 text-[13px] text-ink-secondary">This helps with organization and management.</p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Region (Optional)">
                      <Select value={details.region} onChange={set("region")}>
                        {["Middle East", "Asia Pacific", "Europe", "North America"].map((r) => <option key={r}>{r}</option>)}
                      </Select>
                    </Field>
                    <Field label="Property Type (Optional)">
                      <Select value={details.propertyType} onChange={set("propertyType")}>
                        {["Resort", "Luxury Hotel", "Business Hotel", "Boutique Hotel", "Extended Stay"].map((r) => <option key={r}>{r}</option>)}
                      </Select>
                    </Field>
                    <Field label="No. of Rooms (Optional)"><Input inputMode="numeric" value={details.rooms} onChange={set("rooms")} placeholder="e.g. 245" /></Field>
                    <Field label="Address (Optional)"><Input value={details.address} onChange={set("address")} placeholder="e.g. Palm Jumeirah" /></Field>
                  </div>
                </Card>
              </>
            )}

            {step === 1 && (
              <>
                <Card className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600"><MessageSquare className="h-5 w-5" /></span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-ink">Connect WhatsApp</h3>
                        <p className="text-[13px] text-ink-secondary">Link the hotel's WhatsApp number to send and receive guest messages.</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${waConnected ? "bg-green-50 text-green-600" : "bg-subtle text-ink-tertiary"}`}>{waConnected ? "Connected" : "Not Connected"}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
                    <div className="space-y-3">
                      <Field label="Phone Number" required>
                        <PhoneInput code={wa.code} number={wa.number} onChange={(c, n) => setWa((x) => ({ ...x, code: c, number: n }))} placeholder="50 123 4567" />
                      </Field>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Display Name"><Input value={wa.displayName} onChange={(e) => setWa((x) => ({ ...x, displayName: e.target.value }))} placeholder={details.name || "Hotel name"} /></Field>
                        <Field label="API Key" required><Input type="password" value={wa.apiKey} onChange={(e) => setWa((x) => ({ ...x, apiKey: e.target.value }))} placeholder="Enter WhatsApp API key" /></Field>
                        <Field label="Business Account ID (Optional)"><Input value={wa.businessId} onChange={(e) => setWa((x) => ({ ...x, businessId: e.target.value }))} placeholder="Enter Business Account ID" /></Field>
                      </div>

                      {waConnected ? (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-green-600"><Check className="h-4 w-4" /> Number verified and connected</span>
                      ) : otpSent ? (
                        <div className="flex flex-wrap items-end gap-2">
                          <div className="w-40">
                            <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Enter OTP</span>
                            <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="6-digit code" maxLength={6} />
                          </div>
                          <Button disabled={otp.trim().length < 4} className="disabled:opacity-40" onClick={() => setWaConnected(true)}>
                            <KeyRound className="h-4 w-4" /> Verify OTP
                          </Button>
                          <button onClick={() => { setOtp(""); setOtpSent(false); }} className="h-10 px-2 text-[12px] font-medium text-brand">Resend code</button>
                        </div>
                      ) : (
                        <Button disabled={!wa.number.trim() || !wa.apiKey.trim()} className="disabled:opacity-40" onClick={() => setOtpSent(true)}>
                          <MessageSquare className="h-4 w-4" /> Send OTP
                        </Button>
                      )}
                    </div>
                    <div className="rounded-xl bg-green-50/60 p-3.5 text-[12px] text-green-800">
                      <div className="mb-1.5 font-semibold">What happens next?</div>
                      <ul className="space-y-1.5 text-green-700">
                        <li>We'll text a one-time code to verify the number.</li>
                        <li>ALFON will send and receive guest messages through this number.</li>
                        <li>Only this hotel can use this WhatsApp number.</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Server className="h-5 w-5" /></span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-ink">Connect PMS</h3>
                        <p className="text-[13px] text-ink-secondary">Link the hotel's booking system to read reservation information.</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${pmsConnected ? "bg-green-50 text-green-600" : "bg-subtle text-ink-tertiary"}`}>{pmsConnected ? "Connected" : "Not Connected"}</span>
                  </div>
                  <div className="mt-4 max-w-md space-y-3">
                    <Field label="PMS Provider" required>
                      <Select value={pms.provider} onChange={(e) => setPms((x) => ({ ...x, provider: e.target.value }))}>
                        <option value="">Select PMS provider</option>
                        {PMS_PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                      </Select>
                    </Field>
                    <Field label="Webhook URL (Optional)" hint="ALFON will send booking update events to this URL.">
                      <Input value={pms.webhook} onChange={(e) => setPms((x) => ({ ...x, webhook: e.target.value }))} placeholder="https://yourpms.com/webhooks/alfon" />
                    </Field>
                    {pms.provider === "Mews" && (
                      <Field label="Mews Access Token" required>
                        <Input type="password" value={pms.mewsToken} onChange={(e) => setPms((x) => ({ ...x, mewsToken: e.target.value }))} placeholder="Enter your Mews access token" />
                      </Field>
                    )}
                    <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-[12px] text-blue-700">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                      ALFON only reads reservation information such as bookings, check-in/check-out dates, guest details and room status, and only if the hotel has a PMS.
                    </div>
                    <Button disabled={!pmsValid} className="disabled:opacity-40" onClick={() => setPmsConnected(true)}>
                      <Server className="h-4 w-4" /> Connect PMS
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {step === 2 && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-ink">Review Hotel Setup</h3>
                  <button onClick={() => setStep(0)} className="text-[13px] font-semibold text-brand">Edit Details</button>
                </div>
                <p className="mt-1 text-[13px] text-ink-secondary">Please review all the information before creating the hotel.</p>

                <div className="mt-4 rounded-xl border border-line p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary"><Building2 className="h-3.5 w-3.5" /> Hotel Overview</div>
                  <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                    {[["Hotel Name", details.name || "—"], ["Country", details.country], ["City", details.city || "—"], ["Currency", details.currency], ["Time Zone", details.timeZone], ["Property Type", details.propertyType], ["No. of Rooms", details.rooms || "—"], ["Admin Email ID", details.adminEmail || "—"]].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-line/60 py-1.5"><dt className="text-ink-secondary">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>
                    ))}
                  </dl>
                  {details.description && <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{details.description}</p>}
                </div>

                <div className="mt-4 rounded-xl border border-line p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary"><Server className="h-3.5 w-3.5" /> System Connections</div>
                    <button onClick={() => setStep(1)} className="text-[12px] font-semibold text-brand">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between text-[13px] font-semibold text-ink">WhatsApp <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${waConnected ? "bg-green-50 text-green-600" : "bg-subtle text-ink-tertiary"}`}>{waConnected ? "Configured" : "Not set up"}</span></div>
                      {waConnected && <div className="mt-1 text-[12px] text-ink-secondary">{wa.code} {wa.number}</div>}
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[13px] font-semibold text-ink">PMS <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${pmsConnected ? "bg-green-50 text-green-600" : "bg-subtle text-ink-tertiary"}`}>{pmsConnected ? "Configured" : "Not set up"}</span></div>
                      {pmsConnected && <div className="mt-1 text-[12px] text-ink-secondary">{pms.provider}</div>}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex items-center justify-between">
              {step > 0 ? <Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4" /> Back</Button> : <Button variant="outline" onClick={() => navigate("/admin/hotels")}>Cancel</Button>}
              {step < 2 ? (
                <Button disabled={!canNext} className="disabled:opacity-40" onClick={goNext}>Next: {STEPS[step + 1]} <ArrowRight className="h-4 w-4" /></Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => create(false)}>Create Hotel</Button>
                  <Button disabled={!details.adminEmail.trim()} className="disabled:opacity-40" onClick={() => create(true)}>
                    <Send className="h-4 w-4" /> Create &amp; Send Setup Link
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Page>
    </>
  );
}
