import { Link } from "react-router-dom";
import { Topbar } from "../../components/Topbar";
import { Page, Card } from "../../components/ui";
import { DEPT_TEMPLATES } from "../../data/deptTemplates";
import { deptIcon } from "../../data/deptIcons";

export default function DeptTemplates() {
  return (
    <>
      <Topbar title="Department Templates" hideQuickActions />
      <Page>
        <h2 className="font-display text-[26px] font-bold leading-tight text-ink">Department Templates</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-secondary">
          The default departments, services and SLAs every new hotel starts from. Select a department to see its services and response/resolve targets.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {DEPT_TEMPLATES.map((d) => {
            const Icon = deptIcon(d.name);
            return (
              <Link key={d.slug} to={`/admin/department-templates/${d.slug}`} className="block">
                <Card className="h-full p-5 transition-colors hover:border-brand/40">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-brand"><Icon className="h-[18px] w-[18px]" /></span>
                    <span className="text-[15px] font-semibold text-ink">{d.name}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-ink-secondary">{d.description}</p>
                  <div className="mt-3 text-[12px] font-medium text-ink-tertiary">{d.services.length} services</div>
                </Card>
              </Link>
            );
          })}
        </div>
      </Page>
    </>
  );
}
