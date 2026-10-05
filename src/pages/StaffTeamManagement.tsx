import { useMemo, useRef, useState } from "react";
import { Upload, UserPlus, Download, MoreVertical, Search, Send, Users } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Drawer } from "../components/Drawer";
import { Page, Button, Field, Input, Select, Modal } from "../components/ui";
import { useGoNextStep } from "../data/onboarding";
import RolesPermissions from "./RolesPermissions";

type Member = {
  id: number;
  fresh?: boolean;
  first: string;
  last: string;
  email: string;
  dept: string;
};

const DEPTS = ["Unassigned", "Housekeeping", "Front Desk", "Engineering", "Guest Services", "F&B", "Concierge", "Operator"];

const SEED: Member[] = [
  { id: 1, first: "Sophia", last: "Carter", email: "sophia.carter@alfonhotel.com", dept: "Unassigned" },
  { id: 2, first: "David", last: "Ross", email: "david.ross@alfonhotel.com", dept: "Unassigned" },
  { id: 3, first: "Priya", last: "Sharma", email: "priya.sharma@alfonhotel.com", dept: "Unassigned" },
  { id: 4, first: "James", last: "Chen", email: "james.chen@alfonhotel.com", dept: "Housekeeping" },
  { id: 5, first: "Maria", last: "Santos", email: "maria.santos@alfonhotel.com", dept: "Housekeeping" },
  { id: 6, first: "Liam", last: "Anderson", email: "liam.anderson@alfonhotel.com", dept: "Housekeeping" },
  { id: 7, first: "Rahul", last: "Verma", email: "rahul.verma@alfonhotel.com", dept: "Operator" },
];

const IMPORTED: Omit<Member, "id">[] = [
  { first: "Anita", last: "Desai", email: "", dept: "Front Desk" },
  { first: "Carlos", last: "Mendez", email: "", dept: "Engineering" },
  { first: "Fatima", last: "Khan", email: "", dept: "Guest Services" },
  { first: "Tom", last: "Hughes", email: "", dept: "F&B" },
  { first: "Nisha", last: "Rao", email: "", dept: "Concierge" },
];

type DrawerState = { mode: "add" } | { mode: "edit"; member: Member } | null;

function downloadTemplate() {
  const blob = new Blob(["First name,Last name,Email\n"], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "users-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function MemberDrawer({
  member,
  onClose,
  onSave,
}: {
  member: Member | null;
  onClose: () => void;
  onSave: (m: Omit<Member, "id">) => void;
}) {
  const [first, setFirst] = useState(member?.first ?? "");
  const [last, setLast] = useState(member?.last ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [dept, setDept] = useState(member?.dept ?? "Unassigned");
  const ready = first.trim() && last.trim();

  return (
    <Drawer
      title={member ? "Edit user" : "Add user"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!ready} onClick={() => onSave({ first: first.trim(), last: last.trim(), email: email.trim(), dept })}>
            {member ? "Save" : "Add user"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="First name" required><Input autoFocus value={first} onChange={(e) => setFirst(e.target.value)} /></Field>
        <Field label="Last name" required><Input value={last} onChange={(e) => setLast(e.target.value)} /></Field>
        <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Department">
          <Select value={dept} onChange={(e) => setDept(e.target.value)}>
            {DEPTS.map((d) => <option key={d}>{d}</option>)}
          </Select>
        </Field>
      </div>
    </Drawer>
  );
}

export default function StaffTeamManagement() {
  const goNext = useGoNextStep(4);
  const [members, setMembers] = useState<Member[]>(SEED);
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [usersOpen, setUsersOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [invited, setInvited] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => `${m.first} ${m.last} ${m.email} ${m.dept}`.toLowerCase().includes(q));
  }, [query, members]);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  const importFile = (f: File) => {
    setFileName(f.name);
    setMembers((ms) => {
      let id = Math.max(0, ...ms.map((x) => x.id));
      return [...ms.map((x) => ({ ...x, fresh: false })), ...IMPORTED.map((m) => ({ ...m, id: ++id, fresh: true }))];
    });
    setInvited(false);
    flash(`${IMPORTED.length} users imported from ${f.name}`);
  };

  const editing = drawer?.mode === "edit" ? drawer.member : null;

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Users and Roles" backTo="/onboarding" />
        <Page>
          <SetupTabs />

          <div className="max-w-6xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-semibold text-ink">Add your team</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">Upload a CSV or add people one by one. First name, last name and email is all we need.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUsersOpen(true)}>
                  <Users className="h-4 w-4" /> View users
                </Button>
                <Button onClick={() => setDrawer({ mode: "add" })}><UserPlus className="h-4 w-4" /> Add User</Button>
              </div>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) importFile(f);
              }}
              className={`mt-5 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center ${dragging ? "border-brand bg-brand-tint/40" : "border-[#E5E5E5]"}`}
            >
              <Upload className="h-6 w-6 text-ink-tertiary" />
              <p className="mt-3 text-[14px] font-medium text-ink">Drop your CSV here</p>
              <p className="mt-1 text-[12px] text-ink-tertiary">Columns: First name, Last name, Email · up to 10MB</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-9 items-center rounded-control border border-line bg-white px-3 text-[13px] font-medium text-ink hover:bg-subtle"
                >
                  Choose file
                </button>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-[13px] font-medium text-ink hover:bg-subtle"
                >
                  <Download className="h-3.5 w-3.5" /> Download template
                </button>
              </div>
              {fileName && <p className="mt-3 text-[12px] text-ink-secondary">{fileName}</p>}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="mt-10">
            <RolesPermissions embedded />
          </div>

          <div className="mt-6">
            <Button onClick={goNext}>Continue →</Button>
          </div>
        </Page>
      </div>

      {usersOpen && (
        <Modal
          title={`Users (${members.length})`}
          size="xl"
          onClose={() => { setUsersOpen(false); setMenuFor(null); }}
          footer={
            <>
              <Button variant="outline" disabled={invited || !members.length} onClick={() => { setInvited(true); flash("Invites sent"); }}>
                <Send className="h-4 w-4" /> {invited ? "Invited" : "Invite All"}
              </Button>
              <Button onClick={() => setUsersOpen(false)}>Done</Button>
            </>
          }
        >
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="pl-9" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-line bg-[#FAFAFA] text-[11px] uppercase tracking-wide text-ink-secondary">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} className={`border-b border-line/70 last:border-0 ${m.fresh ? "bg-brand-tint/30" : ""}`}>
                    <td className="px-4 py-3 text-[14px] font-medium text-ink">{m.first} {m.last}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-secondary">{m.email || "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-secondary">{m.dept}</td>
                    <td className="relative px-4 py-3 text-right">
                      <button aria-label={`Actions for ${m.first} ${m.last}`} onClick={() => setMenuFor(menuFor === m.id ? null : m.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:bg-subtle">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuFor === m.id && (
                        <>
                          <button className="fixed inset-0 z-10 cursor-default" aria-label="Close menu" onClick={() => setMenuFor(null)} />
                          <div className="absolute right-4 top-10 z-20 w-36 rounded-lg border border-line bg-white p-1 shadow-lg">
                            <button onClick={() => { setDrawer({ mode: "edit", member: m }); setMenuFor(null); setUsersOpen(false); }} className="block w-full rounded-md px-3 py-2 text-left text-[13px] text-ink hover:bg-subtle">Edit</button>
                            <button onClick={() => { setMembers((ms) => ms.filter((x) => x.id !== m.id)); setMenuFor(null); flash("User removed"); }} className="block w-full rounded-md px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50">Remove</button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="py-8 text-center text-[13px] text-ink-tertiary">No users match.</p>}
          </div>
        </Modal>
      )}

      {drawer && (
        <MemberDrawer
          key={editing?.id ?? "new"}
          member={editing}
          onClose={() => setDrawer(null)}
          onSave={(m) => {
            if (editing) {
              setMembers((ms) => ms.map((x) => (x.id === editing.id ? { ...m, id: editing.id } : x)));
              flash("User updated");
            } else {
              setMembers((ms) => [...ms, { ...m, id: Math.max(0, ...ms.map((x) => x.id)) + 1 }]);
              flash("User added");
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
