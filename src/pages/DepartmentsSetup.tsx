import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card } from "../components/ui";
import { DEPARTMENTS, initials } from "../data/departments";
import { deptIcon } from "../data/deptIcons";

function DeptCard({ d, onboarding }: { d: (typeof DEPARTMENTS)[number]; onboarding: boolean }) {
  const head = d.members.find((m) => m.role === "Department Head");
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
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-secondary">Staff Count</span>
            <span className="font-semibold text-ink">{d.members.length}</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-secondary">Head of Department</span>
            {head ? (
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-subtle text-[10px] font-semibold text-ink-secondary">
                  {initials(head.name)}
                </span>
                <span className="font-medium text-ink">{head.name}</span>
              </span>
            ) : (
              <span className="text-ink-tertiary">—</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function DepartmentsSetup({ onboarding = false }: { onboarding?: boolean }) {
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
          {onboarding && (
            <Link
              to={`/departments/new${onboarding ? "?from=onboarding" : ""}`}
              className="flex min-h-[150px] flex-col items-center justify-center rounded-card border-2 border-dashed border-line text-center hover:border-brand/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-tint text-brand">
                <Plus className="h-5 w-5" />
              </span>
              <span className="mt-2 text-[14px] font-semibold text-ink">Add Department</span>
              <span className="mt-0.5 text-[12px] text-ink-secondary">
                Create a new department for your hotel
              </span>
            </Link>
          )}
        </div>
      </Page>
    </>
  );
}
