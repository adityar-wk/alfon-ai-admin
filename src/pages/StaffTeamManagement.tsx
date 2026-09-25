import { useMemo, useRef, useState } from "react";
import { Upload, UserPlus, Download, MoreVertical, Info, Search, Copy, Send, Smartphone } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Drawer } from "../components/Drawer";
import { Page, Card, Button, Field, Input, Select } from "../components/ui";
import { FakeQR } from "../components/FakeQR";

type Member = {
  id: number;
  fresh?: boolean;
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

const APP_LINK = "https://alfon.app/join/prime-hotel";

// what a CSV upload adds in this prototype
const IMPORTED: Omit<Member, "id">[] = [
  { first: "Anita", last: "Desai", email: "", phone: "", dept: "Front Desk" },
  { first: "Carlos", last: "Mendez", email: "", phone: "", dept: "Engineering" },
  { first: "Fatima", last: "Khan", email: "", phone: "", dept: "Guest Services" },
  { first: "Tom", last: "Hughes", email: "", phone: "", dept: "F&B" },
  { first: "Nisha", last: "Rao", email: "", phone: "", dept: "Concierge" },
];

type DrawerState = { mode: "add" } | { mode: "edit"; member: Member } | null;

export default function StaffTeamManagement() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<DrawerState>(null);
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
    flash(`${IMPORTED.length} team members imported from ${f.name}`);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_LINK);
    } catch {
      /* clipboard unavailable */
    }
    flash("App link copied");
  };

  const editing = drawer?.mode === "edit" ? drawer.member : null;

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Team Members" backTo="/onboarding" />
        <Page>
          <SetupTabs />
          <div className="max-w-3xl space-y-5">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-semibold text-ink">Add your team</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">Upload a CSV or add people one by one. Name and department is all we need.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary hover:text-ink">
                  <Download className="h-4 w-4" /> Download template
                </button>
                <Button variant="outline" onClick={() => setDrawer({ mode: "add" })}>
                  <UserPlus className="h-4 w-4" /> Add Team Member
                </Button>
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importFile(f);
                e.target.value = "";
              }}
            />
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) importFile(f);
              }}
              className={`mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors ${dragging ? "border-brand bg-brand-tint/50" : "border-line bg-subtle/60"}`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint text-brand">
                <Upload className="h-5 w-5" />
              </span>
              {fileName ? (
                <>
                  <p className="mt-3 text-[14px] font-medium text-ink">{fileName}</p>
                  <p className="mt-0.5 text-[12px] text-ink-tertiary">Imported {IMPORTED.length} team members</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-[14px] font-medium text-ink">Drop your CSV here</p>
                  <p className="mt-0.5 text-[12px] text-ink-tertiary">Columns: Name, Department · up to 10MB</p>
                </>
              )}
              <Button className="mt-4" onClick={() => fileRef.current?.click()}>{fileName ? "Choose another file" : "Choose file"}</Button>
            </div>
          </Card>

          {/* imported team */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[16px] font-semibold text-ink">
                Team members <span className="font-normal text-ink-tertiary">({members.length})</span>
              </h3>
              <div className="relative w-full sm:w-60">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or department"
                  className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
                />
              </div>
            </div>
            <div className="mt-3 divide-y divide-line/70">
              {rows.map((m) => (
                <div key={m.id} className="relative flex items-center gap-4 py-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[13px] font-semibold text-brand">
                    {m.first[0]}{m.last[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-ink">
                      {m.first} {m.last}
                      {m.fresh && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">Just imported</span>}
                    </div>
                    <div className="text-[12px] text-ink-tertiary">{m.dept}</div>
                  </div>
                  <button
                    aria-label={`Actions for ${m.first} ${m.last}`}
                    onClick={() => setMenuFor((x) => (x === m.id ? null : m.id))}
                    className="rounded-md p-1.5 text-ink-tertiary hover:bg-subtle hover:text-ink"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuFor === m.id && (
                    <>
                      <button className="fixed inset-0 z-10 cursor-default" aria-label="Close menu" onClick={() => setMenuFor(null)} />
                      <div className="absolute right-0 top-12 z-20 w-36 rounded-lg border border-line bg-white p-1 shadow-lg">
                        <button onClick={() => { setDrawer({ mode: "edit", member: m }); setMenuFor(null); }} className="block w-full rounded-md px-3 py-2 text-left text-[13px] text-ink hover:bg-subtle">Edit</button>
                        <button onClick={() => { setMembers((ms) => ms.filter((x) => x.id !== m.id)); setMenuFor(null); flash("Team member removed"); }} className="block w-full rounded-md px-3 py-2 text-left text-[13px] text-red-600 hover:bg-red-50">Remove</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {!rows.length && <p className="py-8 text-center text-[13px] text-ink-tertiary">No team members match.</p>}
            </div>
          </Card>

          {/* invite to the app */}
          <Card className="p-6">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-tint text-brand">
                <Smartphone className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-[16px] font-semibold text-ink">Invite your team to the Alfon app</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">
                  Share one link so every team member can download the app and sign in.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
              <FakeQR seed="alfon-app-invite" size={112} className="shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium text-ink-secondary">App download link</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="min-w-0 flex-1 truncate rounded-lg border border-line bg-subtle/60 px-3 py-2.5 text-[13px] text-ink">{APP_LINK}</div>
                  <Button variant="outline" onClick={copyLink}>
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                </div>
                <p className="mt-2 text-[12px] text-ink-tertiary">Staff can also scan the QR code to open the link on their phone.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
              <Button
                onClick={() => {
                  setInvited(true);
                  flash(`App link sent to ${members.length} team members`);
                }}
              >
                <Send className="h-4 w-4" /> {invited ? "Send again" : `Send link to all ${members.length} staff`}
              </Button>
              {invited && <span className="text-[13px] text-emerald-600">Link sent to {members.length} team members</span>}
            </div>
          </Card>
          </div>
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
  const [dept, setDept] = useState(member?.dept ?? "Unassigned");
  const ok = first.trim() && last.trim();

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
      <Field className="mt-3" label="Department (Optional)">
        <Select value={dept} onChange={(e) => setDept(e.target.value)}>
          {DEPTS.map((d) => <option key={d}>{d}</option>)}
        </Select>
      </Field>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-[12px] text-blue-700">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        Roles and access are assigned later from the Team page.
      </div>

      <Button className="mt-5 w-full" disabled={!ok} onClick={() => onSave({ first: first.trim(), last: last.trim(), email: member?.email ?? "", phone: member?.phone ?? "", dept })}>
        {member ? "Save Changes" : "Add Member"}
      </Button>
      <Button variant="outline" className="mt-2 w-full" onClick={onClose}>
        Cancel
      </Button>
    </Drawer>
  );
}
