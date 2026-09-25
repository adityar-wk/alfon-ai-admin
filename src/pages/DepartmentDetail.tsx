import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Button, Field, Input, Select } from "../components/ui";
import { getDepartment, type DeptMember, type DeptService } from "../data/departments";
import { deptIcon } from "../data/deptIcons";

export default function DepartmentDetail() {
  const { slug = "" } = useParams();
  const [search] = useSearchParams();
  const listPath = search.get("from") === "onboarding" ? "/onboarding/departments" : "/departments";
  const dept = getDepartment(slug);

  const [members, setMembers] = useState<DeptMember[]>(dept?.members ?? []);
  const [services, setServices] = useState<DeptService[]>(dept?.services ?? []);
  const [addingService, setAddingService] = useState(false);
  const [newService, setNewService] = useState({ name: "", description: "" });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!dept) return;
    setMembers(dept.members);
    setServices(dept.services);
  }, [dept]);

  useEffect(() => {
    if (search.get("created")) setToast("Department created");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!dept) return <Navigate to={listPath} replace />;

  const head = members.find((m) => m.role === "Department Head");
  const Icon = deptIcon(dept.name);

  const addService = () => {
    if (!newService.name.trim()) return;
    setServices((s) => [
      ...s,
      { name: newService.name.trim(), description: newService.description.trim() || undefined, active: true },
    ]);
    setNewService({ name: "", description: "" });
    setAddingService(false);
  };

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="Department"
          backTo={listPath}
          actions={
            <Button onClick={() => setToast("Changes saved")}>
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          }
        />
        <Page>
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand">
              <Icon className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <div className="text-[20px] font-semibold leading-tight text-ink">{dept.name}</div>
              <div className="mt-0.5 text-[13px] text-ink-secondary">Department Head · {head?.name ?? "—"}</div>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-ink-tertiary">{dept.description}</p>

          <div className="mt-6 max-w-2xl">
            <Card className="p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[16px] font-semibold text-ink">Services Covered</h3>
                <button onClick={() => setAddingService((v) => !v)} className="flex items-center gap-1.5 text-[13px] font-medium text-brand">
                  <Plus className="h-4 w-4" /> Add Service
                </button>
              </div>

              <div className="mt-3 divide-y divide-line/70">
                {services.map((sv) => (
                  <div key={sv.name} className="py-3 text-[14px] text-ink">{sv.name}</div>
                ))}
                {!services.length && <p className="py-6 text-center text-[13px] text-ink-tertiary">No services added yet.</p>}
              </div>

              {addingService && (
                <div className="mt-3 space-y-3 rounded-lg border border-line bg-subtle p-4">
                  <Field label="Service Name" required>
                    <Input autoFocus placeholder="e.g. Pillow Menu" value={newService.name} onChange={(e) => setNewService((sv) => ({ ...sv, name: e.target.value }))} />
                  </Field>
                  <div className="flex gap-2">
                    <Button onClick={addService}>Add</Button>
                    <Button variant="outline" onClick={() => setAddingService(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </Page>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toast}
          </span>
        </div>
      )}
    </div>
  );
}
