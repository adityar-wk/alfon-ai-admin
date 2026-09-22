import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  Building2,
  Pencil,
  Plus,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  Info,
  Check,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Drawer } from "../components/Drawer";
import { Page, Card, Badge, Button, Field, Input, Select } from "../components/ui";
import { getDepartment, initials, type DeptMember, type DeptService } from "../data/departments";

export default function DepartmentDetail() {
  const { slug = "" } = useParams();
  const [search] = useSearchParams();
  const listPath = search.get("from") === "onboarding" ? "/onboarding/departments" : "/departments";
  const dept = getDepartment(slug);

  const [members, setMembers] = useState<DeptMember[]>(dept?.members ?? []);
  const [services, setServices] = useState<DeptService[]>(dept?.services ?? []);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
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
  const supervisors = members.filter((m) => m.role === "Supervisor").length;

  const addService = () => {
    if (!newService.name.trim()) return;
    setServices((s) => [
      ...s,
      { name: newService.name.trim(), description: newService.description.trim() || undefined, active: true },
    ]);
    setNewService({ name: "", description: "" });
    setAddingService(false);
  };

  const addStaff = (form: { name: string; role: DeptMember["role"]; reports: string }) => {
    setMembers((m) => [...m, { name: form.name, role: form.role, reports: form.reports, status: "Active" }]);
    setAddStaffOpen(false);
  };

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={dept.name}
          backTo={listPath}
          actions={
            <Button onClick={() => setToast("Changes saved")}>
              <Check className="h-4 w-4" /> Save Changes
            </Button>
          }
        />
        <Page>
          <Breadcrumb items={["Departments", dept.name]} />
          <p className="mb-6 mt-1 text-[13px] text-ink-secondary">
            Manage department details, members, and services.
          </p>

          <Card className="p-6">
            <div className="flex flex-wrap items-start gap-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-brand">
                <Building2 className="h-6 w-6" />
              </span>
              <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
                <div>
                  <div className="text-xs text-ink-secondary">Department Name</div>
                  <div className="text-[14px] font-semibold text-ink">{dept.name}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-secondary">Status</div>
                  <div className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
                  </div>
                </div>
                <div>
                  <div className="text-xs text-ink-secondary">Department Head</div>
                  <div className="text-[14px] font-semibold text-ink">{head?.name ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-secondary">Supervisors</div>
                  <div className="text-[14px] font-semibold text-ink">{supervisors} assigned</div>
                </div>
              </div>
              <Button variant="outline">
                <Pencil className="h-4 w-4" /> Edit Department
              </Button>
            </div>
            <div className="mt-4">
              <div className="text-xs text-ink-secondary">Description</div>
              <p className="mt-1 max-w-3xl text-[13px] text-ink-secondary">{dept.description}</p>
            </div>
          </Card>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Department Members</h3>
                <Button onClick={() => setAddStaffOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Staff
                </Button>
              </div>
              <table className="mt-4 w-full text-left">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                    <th className="pb-2 font-medium">Member</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Reports To</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.name} className="border-b border-line/70">
                      <td className="py-3">
                        <span className="flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-subtle text-[11px] font-semibold text-ink-secondary">
                            {initials(m.name)}
                          </span>
                          <span className="text-[13px] font-medium text-ink">{m.name}</span>
                        </span>
                      </td>
                      <td className="py-3">
                        {m.role === "Department Head" ? (
                          <Badge tone="brand">Department Head</Badge>
                        ) : (
                          <span className="text-[12px] text-ink-secondary">{m.role}</span>
                        )}
                      </td>
                      <td className="py-3 text-[13px] text-ink-secondary">{m.reports}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {m.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <MoreHorizontal className="h-4 w-4 text-ink-tertiary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-[12px] text-ink-tertiary">
                Showing 1 to {members.length} of {members.length} members
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ink">Services Covered</h3>
                <button
                  onClick={() => setAddingService((v) => !v)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-brand"
                >
                  <Plus className="h-4 w-4" /> Add Service
                </button>
              </div>

              <div className="mt-2 divide-y divide-line">
                {services.map((s) => (
                  <div key={s.name} className="flex items-start gap-3 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[13px] font-medium text-ink">{s.name}</span>
                      {s.description && (
                        <p className="mt-0.5 text-[12px] text-ink-secondary">{s.description}</p>
                      )}
                    </div>
                    <Badge tone={s.active ? "success" : "neutral"}>
                      {s.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                {!services.length && (
                  <p className="py-6 text-center text-[13px] text-ink-tertiary">
                    No services added yet.
                  </p>
                )}
              </div>

              {addingService && (
                <div className="mt-3 space-y-3 rounded-lg border border-line bg-subtle p-4">
                  <Field label="Service Name" required>
                    <Input
                      autoFocus
                      placeholder="e.g. Pillow Menu"
                      value={newService.name}
                      onChange={(e) => setNewService((s) => ({ ...s, name: e.target.value }))}
                    />
                  </Field>
                  <Field label="Description (optional)">
                    <Input
                      placeholder="Short description"
                      value={newService.description}
                      onChange={(e) => setNewService((s) => ({ ...s, description: e.target.value }))}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button onClick={addService}>Add</Button>
                    <Button variant="outline" onClick={() => setAddingService(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={() => setToast("Changes saved")}>Save Changes</Button>
            <Link
              to="/departments"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink hover:bg-subtle"
            >
              ← Back to Departments
            </Link>
          </div>
        </Page>
      </div>

      {addStaffOpen && (
        <AddStaffDrawer
          deptName={dept.name}
          members={members}
          onClose={() => setAddStaffOpen(false)}
          onAdd={addStaff}
        />
      )}

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

function AddStaffDrawer({
  deptName,
  members,
  onClose,
  onAdd,
}: {
  deptName: string;
  members: DeptMember[];
  onClose: () => void;
  onAdd: (form: { name: string; role: DeptMember["role"]; reports: string }) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<DeptMember["role"]>("Line Staff");
  const reportsOptions = members.filter((m) => m.role !== "Line Staff");
  const [reports, setReports] = useState(reportsOptions[0]?.name ?? "—");

  return (
    <Drawer title={`Add Staff to ${deptName}`} onClose={onClose}>
      <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-[12px] text-blue-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Profile photos are not required. We&apos;ll use initials generated from the name.
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-[18px] font-semibold text-indigo-500">
          {name ? initials(name) : <Circle className="h-5 w-5 opacity-30" />}
        </div>
        <div className="mt-1.5 text-[11px] text-ink-tertiary">Initials Preview</div>
      </div>

      <Field className="mt-4" label="Full Name" required>
        <Input
          placeholder="e.g. Aanya Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Field>
      <Field className="mt-3" label="Email">
        <Input placeholder="name@primehotel.com" />
      </Field>
      <Field className="mt-3" label="Mobile Number">
        <Input placeholder="+91 98765 43210" />
      </Field>
      <Field className="mt-3" label="Role in Department">
        <Select value={role} onChange={(e) => setRole(e.target.value as DeptMember["role"])}>
          <option>Line Staff</option>
          <option>Supervisor</option>
          <option>Department Head</option>
        </Select>
      </Field>
      <Field className="mt-3" label="Reports To">
        <Select value={reports} onChange={(e) => setReports(e.target.value)}>
          {reportsOptions.length ? (
            reportsOptions.map((m) => <option key={m.name}>{m.name}</option>)
          ) : (
            <option>—</option>
          )}
        </Select>
      </Field>
      <Field className="mt-3" label="Status">
        <Select defaultValue="active">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </Field>

      <Button
        className="mt-5 w-full"
        disabled={!name.trim()}
        onClick={() => onAdd({ name: name.trim(), role, reports })}
      >
        Add to Department
      </Button>
      <Button variant="outline" className="mt-2 w-full" onClick={onClose}>
        Cancel
      </Button>
    </Drawer>
  );
}
