import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Upload, ChevronRight, MessageSquare, Server, Check, Lightbulb, Users2, ArrowLeft, ArrowRight,
} from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Button, Field, Input, Select, Textarea, PhoneInput } from "../../components/ui";
import { deptIcon } from "../../data/deptIcons";

const STEPS = ["Hotel Details", "Departments", "System Connections", "Review & Add"] as const;
type Step = 0 | 1 | 2 | 3;

const DEPT_OPTIONS = [
  { name: "Housekeeping", desc: "Room cleaning and maintenance" },
  { name: "Room Service", desc: "In-room dining and guest requests" },
  { name: "Food and Beverage", desc: "Restaurants, bars and dining outlets" },
  { name: "Front Desk", desc: "Guest check-in, check-out and general support" },
  { name: "Concierge", desc: "Guest services and local assistance" },
  { name: "Engineering", desc: "Facility maintenance and technical support" },
  { name: "Security", desc: "Property security and safety" },
  { name: "Human Resources", desc: "Staff management and training" },
];

const PMS_PROVIDERS = ["Opera (Oracle)", "Cloudbeds", "Mews", "Guestline", "Protel", "Other (Custom Integration)"];

type Details = {
  name: string; location: string; currency: string; timeZone: string; description: string;
  region: string; propertyType: string; rooms: string; address: string;
};

export default function AddHotel() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [details, setDetails] = useState<Details>({
    name: "", location: "", currency: "AED (UAE Dirham)", timeZone: "Asia/Dubai (GMT+4)", description: "",
    region: "Middle East", propertyType: "Resort", rooms: "", address: "",
  });
  const [depts, setDepts] = useState<Record<string, boolean>>({ Housekeeping: true, "Room Service": true });
  const [supervisors, setSupervisors] = useState<Record<string, string>>({});
  const [wa, setWa] = useState({ code: "+971", number: "", displayName: "", businessId: "" });
  const [waConnected, setWaConnected] = useState(false);
  const [pms, setPms] = useState({ provider: "" });
  const [pmsConnected, setPmsConnected] = useState(false);

  const set = <K extends keyof Details>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  const detailsValid = details.name.trim() && details.location.trim();
  const deptCount = Object.values(depts).filter(Boolean).length;
  const canNext = step === 0 ? !!detailsValid : step === 1 ? deptCount > 0 : true;

  const stepStatus = (i: Step) => (i < step ? "done" : i === step ? "current" : "pending");

  const goNext = () => setStep((s) => (Math.min(3, s + 1) as Step));
  const goBack = () => setStep((s) => (Math.max(0, s - 1) as Step));

  const create = () => {
    navigate(`/admin/hotels?created=${encodeURIComponent(details.name)}`);
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
          {step === 1 && "Select the departments available at this hotel and assign initial supervisors."}
          {step === 2 && "Connect WhatsApp and PMS to enable guest communication and booking information."}
          {step === 3 && "Review the details and create the hotel."}
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

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            {step === 0 && (
              <>
                <Card className="p-6">
                  <h3 className="text-[16px] font-semibold text-ink">Basic Details</h3>
                  <p className="mt-1 text-[13px] text-ink-secondary">Add the core information for this hotel.</p>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Hotel Name" required><Input value={details.name} onChange={set("name")} placeholder="e.g. The Palm Retreat" /></Field>
                    <Field label="Location" required><Input value={details.location} onChange={set("location")} placeholder="e.g. Dubai, UAE" /></Field>
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
                    <Field label="Address (Optional)"><Input value={details.address} onChange={set("address")} placeholder="e.g. Palm Jumeirah, Dubai, UAE" /></Field>
                  </div>
                </Card>
              </>
            )}

            {step === 1 && (
              <Card className="p-6">
                <h3 className="text-[16px] font-semibold text-ink">Configure Departments</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">Select the departments available at this hotel and assign initial supervisors. You can add or modify these later.</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {DEPT_OPTIONS.map((d) => {
                    const Icon = deptIcon(d.name);
                    const on = !!depts[d.name];
                    return (
                      <label key={d.name} className={`flex items-start gap-3 rounded-xl border p-3.5 ${on ? "border-brand bg-brand-tint/30" : "border-line"}`}>
                        <input type="checkbox" className="mt-1 h-4 w-4 accent-brand" checked={on} onChange={(e) => setDepts((x) => ({ ...x, [d.name]: e.target.checked }))} />
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-secondary"><Icon className="h-4 w-4" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-semibold text-ink">{d.name}</span>
                          <span className="block text-[12px] text-ink-tertiary">{d.desc}</span>
                          {on && (
                            <span className="mt-2 block">
                              <Select
                                className="h-9 text-[12px]"
                                aria-label={`Supervisor for ${d.name}`}
                                value={supervisors[d.name] ?? ""}
                                onChange={(e) => setSupervisors((s) => ({ ...s, [d.name]: e.target.value }))}
                              >
                                <option value="">Select supervisor (optional)</option>
                                {["Aisha Khan", "Diego Alvarez", "Priya Nair", "Tom Hughes"].map((n) => <option key={n}>{n}</option>)}
                              </Select>
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Card>
            )}

            {step === 2 && (
              <>
                <Card className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><MessageSquare className="h-5 w-5" /></span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-ink">Connect WhatsApp</h3>
                        <p className="text-[13px] text-ink-secondary">Link the hotel's WhatsApp number to send and receive guest messages.</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${waConnected ? "bg-emerald-50 text-emerald-600" : "bg-subtle text-ink-tertiary"}`}>{waConnected ? "Connected" : "Not Connected"}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
                    <div className="space-y-3">
                      <Field label="Phone Number" required>
                        <PhoneInput code={wa.code} number={wa.number} onChange={(c, n) => setWa((x) => ({ ...x, code: c, number: n }))} placeholder="50 123 4567" />
                      </Field>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Display Name"><Input value={wa.displayName} onChange={(e) => setWa((x) => ({ ...x, displayName: e.target.value }))} placeholder={details.name || "Hotel name"} /></Field>
                        <Field label="Business Account ID (Optional)"><Input value={wa.businessId} onChange={(e) => setWa((x) => ({ ...x, businessId: e.target.value }))} placeholder="Enter Business Account ID" /></Field>
                      </div>
                      <Button disabled={!wa.number.trim()} className="disabled:opacity-40" onClick={() => setWaConnected(true)}>
                        <MessageSquare className="h-4 w-4" /> Connect WhatsApp
                      </Button>
                    </div>
                    <div className="rounded-xl bg-emerald-50/60 p-3.5 text-[12px] text-emerald-800">
                      <div className="mb-1.5 font-semibold">What happens next?</div>
                      <ul className="space-y-1.5 text-emerald-700">
                        <li>We will verify the number and connect it to your hotel.</li>
                        <li>ALFON will send and receive guest messages through this number.</li>
                        <li>Only this hotel can use this WhatsApp number.</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600"><Server className="h-5 w-5" /></span>
                      <div>
                        <h3 className="text-[15px] font-semibold text-ink">Connect PMS</h3>
                        <p className="text-[13px] text-ink-secondary">Link the hotel's booking system to read reservation information.</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${pmsConnected ? "bg-emerald-50 text-emerald-600" : "bg-subtle text-ink-tertiary"}`}>{pmsConnected ? "Connected" : "Not Connected"}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
                    <div className="space-y-3">
                      <Field label="PMS Provider" required>
                        <Select value={pms.provider} onChange={(e) => setPms({ provider: e.target.value })}>
                          <option value="">Select PMS provider</option>
                          {PMS_PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                        </Select>
                      </Field>
                      <div className="flex items-start gap-2 rounded-lg bg-sky-50 px-3 py-2.5 text-[12px] text-sky-700">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                        ALFON only reads reservation information such as bookings, check-in/check-out dates, guest details and room status, and only if the hotel has a PMS.
                      </div>
                      <Button disabled={!pms.provider} className="disabled:opacity-40" onClick={() => setPmsConnected(true)}>
                        <Server className="h-4 w-4" /> Connect PMS
                      </Button>
                    </div>
                    <div className="rounded-xl border border-line p-3.5 text-[12px]">
                      <div className="mb-1.5 font-semibold text-ink">Supported PMS Providers</div>
                      <ul className="space-y-1.5 text-ink-secondary">
                        {PMS_PROVIDERS.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {step === 3 && (
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-semibold text-ink">Review Hotel Setup</h3>
                  <button onClick={() => setStep(0)} className="text-[13px] font-semibold text-brand">Edit Details</button>
                </div>
                <p className="mt-1 text-[13px] text-ink-secondary">Please review all the information before creating the hotel.</p>

                <div className="mt-4 rounded-xl border border-line p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary"><Building2 className="h-3.5 w-3.5" /> Hotel Overview</div>
                  <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
                    {[["Hotel Name", details.name || "—"], ["Location", details.location || "—"], ["Currency", details.currency], ["Time Zone", details.timeZone], ["Property Type", details.propertyType], ["No. of Rooms", details.rooms || "—"]].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between border-b border-line/60 py-1.5"><dt className="text-ink-secondary">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>
                    ))}
                  </dl>
                  {details.description && <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{details.description}</p>}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-line p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary"><Users2 className="h-3.5 w-3.5" /> Departments ({deptCount})</div>
                  <button onClick={() => setStep(1)} className="text-[12px] font-semibold text-brand">Edit</button>
                </div>
                <div className="flex flex-wrap gap-2 rounded-b-xl border border-t-0 border-line p-4 pt-0">
                  {Object.entries(depts).filter(([, v]) => v).map(([name]) => (
                    <span key={name} className="rounded-full bg-subtle px-3 py-1 text-[12px] font-medium text-ink-secondary">{name}</span>
                  ))}
                  {!deptCount && <span className="text-[13px] text-ink-tertiary">No departments selected.</span>}
                </div>

                <div className="mt-4 rounded-xl border border-line p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-tertiary"><Server className="h-3.5 w-3.5" /> System Connections</div>
                    <button onClick={() => setStep(2)} className="text-[12px] font-semibold text-brand">Edit</button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between text-[13px] font-semibold text-ink">WhatsApp <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${waConnected ? "bg-emerald-50 text-emerald-600" : "bg-subtle text-ink-tertiary"}`}>{waConnected ? "Configured" : "Not set up"}</span></div>
                      {waConnected && <div className="mt-1 text-[12px] text-ink-secondary">{wa.code} {wa.number}</div>}
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-[13px] font-semibold text-ink">PMS <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${pmsConnected ? "bg-emerald-50 text-emerald-600" : "bg-subtle text-ink-tertiary"}`}>{pmsConnected ? "Configured" : "Not set up"}</span></div>
                      {pmsConnected && <div className="mt-1 text-[12px] text-ink-secondary">{pms.provider}</div>}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex items-center justify-between">
              {step > 0 ? <Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4" /> Back</Button> : <Button variant="outline" onClick={() => navigate("/admin/hotels")}>Cancel</Button>}
              {step < 3 ? (
                <Button disabled={!canNext} className="disabled:opacity-40" onClick={goNext}>Next: {STEPS[step + 1]} <ArrowRight className="h-4 w-4" /></Button>
              ) : (
                <Button onClick={create}>Create Hotel <ChevronRight className="h-4 w-4" /></Button>
              )}
            </div>
          </div>

          {/* progress rail */}
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand"><Building2 className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-bold text-ink">{details.name || "New Hotel"}</span>
                    <span className="shrink-0 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-semibold text-brand">New Hotel</span>
                  </div>
                  <div className="truncate text-[12px] text-ink-tertiary">{details.location || "Location"} · {details.propertyType}</div>
                </div>
              </div>
              <div className="mt-4 space-y-0 divide-y divide-line">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${stepStatus(i as Step) === "done" ? "bg-emerald-500 text-white" : stepStatus(i as Step) === "current" ? "bg-brand text-white" : "bg-subtle text-ink-tertiary"}`}>
                      {stepStatus(i as Step) === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-ink">{label}</span>
                        <span className={`shrink-0 text-[11px] font-medium ${stepStatus(i as Step) === "done" ? "text-emerald-600" : stepStatus(i as Step) === "current" ? "text-brand" : "text-ink-tertiary"}`}>
                          {stepStatus(i as Step) === "done" ? "Completed" : stepStatus(i as Step) === "current" ? "In Progress" : "Pending"}
                        </span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"><Lightbulb className="h-4 w-4 text-brand" /> What happens next?</div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                After adding the hotel, you'll set up departments, connect WhatsApp and PMS, and test the connections before the hotel becomes active.
              </p>
            </Card>
          </div>
        </div>
      </Page>
    </>
  );
}
