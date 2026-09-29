import { Navigate, useParams } from "react-router-dom";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Badge } from "../../components/ui";
import { getDeptTemplate, SLA_BY_PRIORITY, type Priority } from "../../data/deptTemplates";
import { deptIcon } from "../../data/deptIcons";

const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "info" | "neutral"> = {
  Urgent: "danger",
  High: "warning",
  Medium: "info",
  Low: "neutral",
};

export default function DeptTemplateDetail() {
  const { slug = "" } = useParams();
  const dept = getDeptTemplate(slug);
  if (!dept) return <Navigate to="/admin/department-templates" replace />;
  const Icon = deptIcon(dept.name);

  return (
    <>
      <Topbar title="Department Template" hideQuickActions backTo="/admin/department-templates" />
      <Page>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand"><Icon className="h-7 w-7" /></span>
            <div>
              <h2 className="text-[20px] font-semibold text-ink">{dept.name}</h2>
              <p className="mt-1 max-w-2xl text-[13px] text-ink-secondary">{dept.description}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-ink">Services &amp; SLA</h3>
              <span className="text-[12px] text-ink-tertiary">{dept.services.length} services</span>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                    <th className="py-3 pl-4 pr-3 font-medium">Service</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Description</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Priority</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Response</th>
                    <th className="py-3 pl-4 pr-4 font-medium">Resolve</th>
                  </tr>
                </thead>
                <tbody>
                  {dept.services.map((s) => {
                    const sla = SLA_BY_PRIORITY[s.priority];
                    return (
                      <tr key={s.name} className="border-t border-line/60">
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] font-medium text-ink">{s.name}</td>
                        <td className="py-3 pl-4 pr-3 text-[13px] leading-relaxed text-ink-secondary">{s.description}</td>
                        <td className="whitespace-nowrap py-3 pl-4 pr-3"><Badge tone={PRIORITY_TONE[s.priority]}>{s.priority}</Badge></td>
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{sla.response}</td>
                        <td className="whitespace-nowrap py-3 pl-4 pr-4 text-[13px] text-ink-secondary">{sla.resolve}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </Page>
    </>
  );
}
