import { MessageCircle, Database } from "lucide-react";
import type { ReactNode } from "react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card } from "../components/ui";

const WA = "#25D366";

function ConnectedPill() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-600">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
    </span>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 text-[14px]">
      <span className="text-ink-secondary">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  );
}

function ConnectionCard({
  icon,
  iconBg,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
          <div>
            <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
            <p className="text-[12px] text-ink-secondary">{subtitle}</p>
          </div>
        </div>
        <ConnectedPill />
      </div>
      <div className="mt-5 divide-y divide-line/70">{children}</div>
    </Card>
  );
}

export default function WhatsAppPmsSetup() {
  return (
    <>
      <Topbar title="WhatsApp and PMS Setup" backTo="/onboarding" />
      <Page>
        <SetupTabs />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <ConnectionCard
            icon={<MessageCircle className="h-5 w-5" style={{ color: WA }} />}
            iconBg="bg-emerald-50"
            title="WhatsApp Business Integration"
            subtitle="Layana Resort & Spa"
          >
            <Row label="Connected Number">+91 98765 43210</Row>
            <Row label="Hotel Display Name">Layana Resort &amp; Spa</Row>
            <Row label="Status">
              <span className="text-emerald-600">Active</span>
            </Row>
          </ConnectionCard>

          <ConnectionCard
            icon={<Database className="h-5 w-5" />}
            iconBg="bg-brand-tint text-brand"
            title="PMS / Reservations"
            subtitle="Opera Cloud · Production"
          >
            <Row label="Provider">Opera Cloud</Row>
            <Row label="Last Synced">2 minutes ago</Row>
            <Row label="Status">
              <span className="text-emerald-600">Active</span>
            </Row>
          </ConnectionCard>
        </div>
      </Page>
    </>
  );
}
