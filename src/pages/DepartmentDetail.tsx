import { useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  Circle,
  ChevronRight,
  Info,
  Check,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Drawer } from "../components/Drawer";
import { Page, Card, Button, Field, Input, Select } from "../components/ui";
import { getDepartment, initials, type DeptMember, type DeptService } from "../data/departments";
import { deptIcon } from "../data/deptIcons";
import { TASKS, shortName } from "../data/tasks";

export default function DepartmentDetail() {
  const { slug = "" } = useParams();
  const [search] = useSearchParams();
  const listPath = search.get("from") === "onboarding" ? "/onboarding/departments" : "/departments";
  const dept = getDepartment(slug);

  const [members, setMembers] = useState<DeptMember[]>(dept?.members ?? []);
  const [services, setServices] = useState<DeptService[]>(dept?.services ?? []);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [staffQuery, setStaffQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
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
  const shownMembers = members.filter((m) => `${m.name} ${m.role}`.toLowerCase().includes(staffQuery.trim().toLowerCase()));
  const Icon = deptIcon(dept.name);
  const selected = members.find((m) => m.name === selectedMember) ?? null;

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
    setSelectedMember(null);
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
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand">
              <Icon className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h1 className="text-[28px] font-bold leading-tight tracking-tight text-ink">{dept.name}</h1>
              <div className="mt-1 text-[15px] text-ink-secondary">
                <span className="text-ink-tertiary">Head of Department</span>{" "}
                <span className="font-semibold text-ink">{head?.name ?? "—"}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-ink-tertiary">{dept.description}</p>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
            <Card className="p-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[16px] font-semibold text-ink">Staff</h3>
                <span className="text-[12px] text-ink-tertiary">{members.length} {members.length === 1 ? "member" : "members"}</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                  <Input value={staffQuery} onChange={(e) => setStaffQuery(e.target.value)} placeholder="Search staff" className="pl-9" />
                </div>
                <Button onClick={() => setAddStaffOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Staff
                </Button>
              </div>
              <div className="mt-3 divide-y divide-line/70">
                {shownMembers.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => setSelectedMember(m.name)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-subtle/70 ${selectedMember === m.name ? "bg-subtle/70" : ""}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-[12px] font-semibold text-ink-secondary">
                      {initials(m.name)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{m.name}</span>
                    <span className={`shrink-0 text-[12px] ${m.role === "Department Head" ? "font-semibold text-brand" : "text-ink-secondary"}`}>{m.role}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
                  </button>
                ))}
                {!shownMembers.length && <p className="py-8 text-center text-[13px] text-ink-tertiary">No staff match your search.</p>}
              </div>
            </Card>

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

      {selected && !addStaffOpen && <StaffDetailDrawer member={selected} deptName={dept.name} onClose={() => setSelectedMember(null)} />}

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

function StaffDetailDrawer({ member, deptName, onClose }: { member: DeptMember; deptName: string; onClose: () => void }) {
  const short = shortName(member.name);
  const mine = TASKS.filter((t) => t.owner === short);
  const open = mine.filter((t) => !["Completed", "Void", "Unable to Complete"].includes(t.status)).length;
  const email = `${member.name.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, ".")}@primehotel.com`;
  return (
    <Drawer title="Staff Details" onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-tint text-[20px] font-semibold text-brand">{initials(member.name)}</span>
        <div className="mt-3 text-[17px] font-bold text-ink">{member.name}</div>
        <div className="text-[13px] text-ink-secondary">{member.role} · {deptName}</div>
        <span className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {member.status}</span>
      </div>
      <div className="mt-6 space-y-3 text-[13px] text-ink">
        <div className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-ink-tertiary" /> {email}</div>
        <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-ink-tertiary" /> +1 (555) 010-{String(1000 + (member.name.length * 137) % 9000)}</div>
      </div>
      <div className="mt-6 divide-y divide-line/70 border-t border-line/70 text-[13px]">
        <div className="flex items-center justify-between py-3"><span className="text-ink-secondary">Reports to</span><span className="font-medium text-ink">{member.reports}</span></div>
        <div className="flex items-center justify-between py-3"><span className="text-ink-secondary">Open tasks</span><span className="font-medium text-ink">{open}</span></div>
        <div className="flex items-center justify-between py-3"><span className="text-ink-secondary">Tasks handled</span><span className="font-medium text-ink">{mine.length}</span></div>
      </div>
    </Drawer>
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
