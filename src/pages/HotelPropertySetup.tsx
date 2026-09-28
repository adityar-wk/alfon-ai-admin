import { Lock } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card, Button, Field, Input, Select } from "../components/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-[15px] font-semibold text-ink">{title}</h3>
      {children}
    </Card>
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

export default function HotelPropertySetup() {
  return (
    <>
      <Topbar title="Hotel Property Setup" backTo="/onboarding" />
      <Page>
        <SetupTabs />
        <div className="max-w-3xl">
          <div className="space-y-5">
            <Section title="Basic Information">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Hotel Name" required hint="Set by Alfon when this hotel was added.">
                  <Locked value="Sea View Hotel" />
                </Field>
                <Field
                  label="Hotel Code (Internal)"
                  required
                  hint="This code will be used internally in the system."
                >
                  <Input defaultValue="SVH001" />
                </Field>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Property Type" required>
                  <Select defaultValue="Luxury Hotel">
                    <option>Luxury Hotel</option>
                    <option>Boutique Hotel</option>
                    <option>Resort</option>
                  </Select>
                </Field>
                <Field label="Total Rooms" required>
                  <Input defaultValue="245" />
                </Field>
                <Field label="Primary Language" required>
                  <Select defaultValue="English">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </Select>
                </Field>
              </div>
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
            <Button>Continue →</Button>
            <Button variant="outline">Save Draft</Button>
          </div>
        </div>
      </Page>
    </>
  );
}
