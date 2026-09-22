import { useMemo, useState } from "react";
import { Upload, UserPlus, Download, MoreVertical, Info, Search } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Drawer } from "../components/Drawer";
import { Page, Card, Button, Field, Input, Select } from "../components/ui";

type Member = {
  id: number;
  first: string;
  last: string;
  email: string;
  phone: string;
  dept: string;
};

const DEPTS = ["Unassigned", "Housekeeping", "Front Desk", "Engineering", "Guest Services", "F&B", "Concierge", "Operator"];

const SEED: Member[] = [
  { id: 1, first: "Sophia", last: "Carter", email: "sophia.carter@alfonhotel.com", phone: "+91 98765 43210", dept: "Unassigned" },
  { id: 2, first: "David", last: "Ross", email: "david.ross@alfonhotel.com", phone: "+91 98765 11002", dept: "Unassigned" },
  { id: 3, first: "Priya", last: "Sharma", email: "priya.sharma@alfonhotel.com", phone: "+91 98765 11003", dept: "Unassigned" },
  { id: 4, first: "James", last: "Chen", email: "james.chen@alfonhotel.com", phone: "+91 98765 11004", dept: "Housekeeping" },
  { id: 5, first: "Maria", last: "Santos", email: "maria.santos@alfonhotel.com", phone: "+91 98765 11005", dept: "Housekeeping" },
  { id: 6, first: "Liam", last: "Anderson", email: "liam.anderson@alfonhotel.com", phone: "+91 98765 11006", dept: "Housekeeping" },
  { id: 7, first: "Rahul", last: "Verma", email: "rahul.verma@alfonhotel.com", phone: "+91 98765 11007", dept: "Operator" },
];

type DrawerState = { mode: "add" } | { mode: "edit"; member: Member } | null;

export default function StaffTeamManagement() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => `${m.first} ${m.last} ${m.email} ${m.dept}`.toLowerCase().includes(q));
  }, [query, members]);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  const editing = drawer?.mode === "edit" ? drawer.member : null;

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Team Members" backTo="/onboarding" />
        <Page>
          <SetupTabs />
          <p className="mb-6 text-[13px] text-ink-secondary">
            Import your hotel staff. Roles and access are assigned later from the Team page.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button>
              <Upload className="h-4 w-4" /> Upload CSV
            </Button>
            <Button variant="outline" onClick={() => setDrawer({ mode: "add" })}>
              <UserPlus className="h-4 w-4" /> Add Team Member
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4" /> Download Template
            </Button>
          </div>

          <Card className="mt-5 p-6">
            <h3 className="text-[15px] font-semibold text-ink">Upload staff data</h3>
            <p className="mt-1 text-[12px] text-ink-secondary">Import everyone who works at the hotel via CSV — name, email, mobile number and department.</p>
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-subtle px-6 py-9 text-center">
              <Upload className="h-7 w-7 text-brand" />
              <p className="mt-2 text-[13px] font-medium text-ink">Drag and drop your CSV file here, or click to browse</p>
              <p className="mt-1 text-[12px] text-ink-tertiary">Supports CSV format up to 10MB</p>
            </div>
          </Card>

          <Card className="mt-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-ink">
                Team members <span className="ml-1 font-normal text-ink-tertiary">{members.length}</span>
              </h3>
              <div className="relative w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email, department"
                  className="h-9 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-ink-tertiary focus:border-brand"
                />
              </div>
            </div>

            <table className="mt-4 w-full text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-secondary">
                  <th className="pb-2 font-medium">Team Member</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Mobile</th>
                  <th className="pb-2 font-medium">Department</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} onClick={() => setDrawer({ mode: "edit", member: m })} className="cursor-pointer border-b border-line/70 hover:bg-subtle/60">
                    <td className="py-3">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-subtle text-[11px] font-semibold text-ink-secondary">
                          {m.first[0]}{m.last[0]}
                        </span>
                        <span className="text-[13px] font-medium text-ink">{m.first} {m.last}</span>
                      </span>
                    </td>
                    <td className="py-3 text-[13px] text-ink-secondary">{m.email}</td>
                    <td className="py-3 text-[13px] text-ink-secondary">{m.phone}</td>
                    <td className="py-3 text-[13px] text-ink-secondary">{m.dept === "Unassigned" ? <span className="text-ink-tertiary">Unassigned</span> : m.dept}</td>
                    <td className="py-3">
                      <MoreVertical className="h-4 w-4 text-ink-tertiary" />
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[13px] text-ink-tertiary">
                      No team members match “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className="mt-3 text-[12px] text-ink-tertiary">Showing {rows.length} of {members.length} members</p>
          </Card>
        </Page>
      </div>

      {drawer && (
        <MemberDrawer
          key={editing?.id ?? "new"}
          member={editing}
          onClose={() => setDrawer(null)}
          onSave={(m) => {
            if (editing) {
              setMembers((ms) => ms.map((x) => (x.id === editing.id ? { ...m, id: editing.id } : x)));
              flash("Team member updated");
            } else {
              setMembers((ms) => [...ms, { ...m, id: Math.max(0, ...ms.map((x) => x.id)) + 1 }]);
              flash("Team member added");
            }
            setDrawer(null);
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </div>
  );
}

function MemberDrawer({ member, onClose, onSave }: { member: Member | null; onClose: () => void; onSave: (m: Omit<Member, "id">) => void }) {
  const [first, setFirst] = useState(member?.first ?? "");
  const [last, setLast] = useState(member?.last ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone.replace(/^\+\d+\s/, "") ?? "");
  const [code, setCode] = useState(member?.phone.match(/^\+\d+/)?.[0] ?? "+91");
  const [dept, setDept] = useState(member?.dept ?? "Unassigned");
  const ok = first.trim() && last.trim() && /\S+@\S+\.\S+/.test(email) && phone.trim();

  return (
    <Drawer title={member ? "Edit Team Member" : "Add Team Member"} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" required>
          <Input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Sophia" />
        </Field>
        <Field label="Last Name" required>
          <Input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Carter" />
        </Field>
      </div>
      <Field className="mt-3" label="Email" required>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@alfonhotel.com" />
      </Field>
      <Field className="mt-3" label="Mobile Number" required>
        <div className="grid grid-cols-[92px_1fr] gap-2">
          <Select value={code} onChange={(e) => setCode(e.target.value)}>
            <option>+91</option>
            <option>+1</option>
            <option>+44</option>
            <option>+971</option>
          </Select>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" />
        </div>
      </Field>
      <Field className="mt-3" label="Department (Optional)">
        <Select value={dept} onChange={(e) => setDept(e.target.value)}>
          {DEPTS.map((d) => <option key={d}>{d}</option>)}
        </Select>
      </Field>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-[12px] text-blue-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Roles and access are assigned later from the Team page.
      </div>

      <Button className="mt-5 w-full" disabled={!ok} onClick={() => onSave({ first: first.trim(), last: last.trim(), email: email.trim(), phone: `${code} ${phone.trim()}`, dept })}>
        {member ? "Save Changes" : "Add Member"}
      </Button>
      <Button variant="outline" className="mt-2 w-full" onClick={onClose}>
        Cancel
      </Button>
    </Drawer>
  );
}
