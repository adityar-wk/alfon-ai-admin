import { Link } from "react-router-dom";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card, Button } from "../components/ui";
import { DEPARTMENTS } from "../data/departments";
import { deptIcon } from "../data/deptIcons";
import { useGoNextStep } from "../data/onboarding";

function DeptCard({ d, onboarding }: { d: (typeof DEPARTMENTS)[number]; onboarding: boolean }) {
  return (
    <Link to={`/departments/${d.slug}${onboarding ? "?from=onboarding" : ""}`} className="block">
      <Card className="h-full p-5 transition-colors hover:border-brand/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-tint text-brand">
              {(() => { const Icon = deptIcon(d.name); return <Icon className="h-[18px] w-[18px]" />; })()}
            </span>
            <span className="text-[15px] font-semibold text-ink">{d.name}</span>
          </div>
          <span className="text-[13px] font-medium text-brand">Edit</span>
        </div>
        <div className="mt-4 space-y-2.5 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-ink-secondary">Staff Members</span>
            <span className="font-semibold text-ink">{d.members.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-secondary">Services Offered</span>
            <span className="font-semibold text-ink">{d.services.length}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function DepartmentsSetup({ onboarding = false }: { onboarding?: boolean }) {
  const goNext = useGoNextStep(5);
  return (
    <>
      <Topbar
        title={onboarding ? "Departments Setup" : "Departments"}
        backTo={onboarding ? "/onboarding" : undefined}
      />
      <Page>
        {onboarding && <SetupTabs />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DEPARTMENTS.map((d) => (
            <DeptCard key={d.slug} d={d} onboarding={onboarding} />
          ))}
        </div>

        {onboarding && (
          <div className="mt-6 flex justify-end">
            <Button onClick={goNext}>Continue →</Button>
          </div>
        )}
      </Page>
    </>
  );
}
