import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Plus, X } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Button, Field, Input, Textarea } from "../components/ui";
import { DEPARTMENTS, addDepartment, initials, slugify, type Department } from "../data/departments";

const STEPS = ["Details", "Leadership", "Services", "Review"];
const SUGGESTED = ["Guest Requests", "Scheduled Tasks", "Emergency Response", "Inspections"];

function autoCode(name: string) {
  const words = name.trim().split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (!words.length) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.map((w) => w[0]).join("").slice(0, 3).toUpperCase();
}

export default function NewDepartment() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const fromOnboarding = search.get("from") === "onboarding";
  const listPath = fromOnboarding ? "/onboarding/departments" : "/departments";
  const qs = fromOnboarding ? "from=onboarding&" : "";

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeEdited, setCodeEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [head, setHead] = useState("");
  const [sups, setSups] = useState<string[]>([]);
  const [supDraft, setSupDraft] = useState("");
  const [services, setServices] = useState<{ name: string; description: string }[]>([]);
  const [svcName, setSvcName] = useState("");
  const [svcDesc, setSvcDesc] = useState("");

  const staffNames = useMemo(
    () => [...new Set(DEPARTMENTS.flatMap((d) => d.members.map((m) => m.name)))].sort(),
    [],
  );

  const slug = slugify(name);
  const duplicate = !!slug && DEPARTMENTS.some((d) => d.slug === slug || d.name.toLowerCase() === name.trim().toLowerCase());
  const codeValue = codeEdited ? code : autoCode(name);

  const canNext =
    step === 0 ? name.trim().length > 1 && !duplicate : step === 1 ? head.trim().length > 1 : true;

  const addSup = () => {
    const v = supDraft.trim();
    if (v && !sups.includes(v) && v !== head.trim()) setSups((s) => [...s, v]);
    setSupDraft("");
  };

  const addService = (n = svcName, d = svcDesc) => {
    const v = n.trim();
    if (!v || services.some((s) => s.name.toLowerCase() === v.toLowerCase())) return;
    setServices((s) => [...s, { name: v, description: d.trim() }]);
    setSvcName("");
    setSvcDesc("");
  };

  const create = () => {
    const dept: Department = {
      slug,
      code: codeValue || autoCode(name),
      name: name.trim(),
      description: description.trim() || `${name.trim()} department.`,
      members: [
        { name: head.trim(), role: "Department Head", reports: "—", status: "Active" },
        ...sups.map((s) => ({ name: s, role: "Supervisor" as const, reports: head.trim(), status: "Active" as const })),
      ],
      services: services.map((s) => ({ name: s.name, description: s.description || undefined, active: true })),
    };
    addDepartment(dept);
    navigate(`/departments/${slug}?${qs}created=1`);
  };

  return (
    <>
      <Topbar title="Add Department" backTo={listPath} />
      <Page>
        {/* stepper */}
        <div className="mx-auto mb-6 flex max-w-3xl items-center">
          {STEPS.map((label, i) => {
            const done = i < step;
            const on = i === step;
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <button
                  disabled={i > step}
                  onClick={() => setStep(i)}
                  className="flex items-center gap-2.5 disabled:cursor-default"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold ${
                      done
                        ? "bg-brand text-white"
                        : on
                          ? "border-2 border-brand bg-white text-brand"
                          : "border border-line bg-white text-ink-tertiary"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`text-[13px] font-medium ${on ? "text-ink" : "text-ink-secondary"}`}>{label}</span>
                </button>
                {i < STEPS.length - 1 && <span className={`mx-3 h-0.5 flex-1 rounded ${done ? "bg-brand/40" : "bg-line"}`} />}
              </div>
            );
          })}
        </div>

        <Card className="mx-auto max-w-3xl p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">Department details</h2>
                <p className="text-[12px] text-ink-secondary">Give the department a name and a short description.</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
                <Field label="Department name" required>
                  <Input
                    autoFocus
                    placeholder="e.g. Spa & Wellness"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field label="Short code" hint="Shown on the card">
                  <Input
                    maxLength={3}
                    value={codeValue}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setCodeEdited(true);
                    }}
                  />
                </Field>
              </div>
              {duplicate && (
                <p className="-mt-2 text-[12px] text-red-600">A department with this name already exists.</p>
              )}
              <Field label="Description (optional)">
                <Textarea
                  rows={3}
                  placeholder="What does this department take care of?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">Leadership</h2>
                <p className="text-[12px] text-ink-secondary">
                  Choose who leads the department. Pick an existing team member or type a new name.
                </p>
              </div>
              <Field label="Head of department" required>
                <Input list="staff-names" placeholder="Search or type a name" value={head} onChange={(e) => setHead(e.target.value)} />
              </Field>
              <datalist id="staff-names">
                {staffNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>

              <div>
                <div className="mb-1.5 text-xs font-medium text-ink-secondary">Supervisors (optional)</div>
                <div className="flex gap-2">
                  <Input
                    list="staff-names"
                    placeholder="Add a supervisor"
                    value={supDraft}
                    onChange={(e) => setSupDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSup())}
                  />
                  <Button variant="outline" onClick={addSup} disabled={!supDraft.trim()}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
                {sups.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sups.map((s) => (
                      <span key={s} className="flex items-center gap-2 rounded-full bg-subtle py-1 pl-1 pr-2.5 text-[13px] text-ink">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-ink-secondary">
                          {initials(s)}
                        </span>
                        {s}
                        <button onClick={() => setSups((x) => x.filter((v) => v !== s))} className="text-ink-tertiary hover:text-ink">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">Services covered</h2>
                <p className="text-[12px] text-ink-secondary">
                  Add what this department handles. You can add more later from the department page.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
                <Input placeholder="Service name" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
                <Input
                  placeholder="Description (optional)"
                  value={svcDesc}
                  onChange={(e) => setSvcDesc(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                />
                <Button variant="outline" onClick={() => addService()} disabled={!svcName.trim()}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-ink-tertiary">Quick add:</span>
                {SUGGESTED.filter((s) => !services.some((x) => x.name === s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => addService(s, "")}
                    className="rounded-full border border-line px-3 py-1 text-[12px] text-ink-secondary hover:bg-subtle"
                  >
                    + {s}
                  </button>
                ))}
              </div>

              {services.length > 0 ? (
                <div className="divide-y divide-line rounded-lg border border-line">
                  {services.map((s) => (
                    <div key={s.name} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-ink">{s.name}</div>
                        {s.description && <div className="text-[12px] text-ink-secondary">{s.description}</div>}
                      </div>
                      <button onClick={() => setServices((x) => x.filter((v) => v.name !== s.name))} className="text-ink-tertiary hover:text-danger">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-line py-6 text-center text-[13px] text-ink-tertiary">
                  No services added yet.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-[16px] font-semibold text-ink">Review &amp; create</h2>
                <p className="text-[12px] text-ink-secondary">Check the details before creating the department.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint text-[13px] font-semibold text-brand">
                  {codeValue}
                </span>
                <div>
                  <div className="text-[16px] font-bold text-ink">{name.trim()}</div>
                  <div className="text-[12px] text-ink-secondary">{description.trim() || "No description"}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-subtle p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">Leadership</div>
                  <div className="mt-2 text-[13px] font-medium text-ink">{head.trim()} <span className="font-normal text-ink-tertiary">· Head</span></div>
                  {sups.map((s) => (
                    <div key={s} className="text-[13px] text-ink-secondary">{s} · Supervisor</div>
                  ))}
                </div>
                <div className="rounded-lg bg-subtle p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-secondary">
                    Services ({services.length})
                  </div>
                  <div className="mt-2 space-y-0.5 text-[13px] text-ink">
                    {services.length ? services.map((s) => <div key={s.name}>{s.name}</div>) : <span className="text-ink-tertiary">None yet</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
            <Button variant="outline" onClick={() => (step === 0 ? navigate(listPath) : setStep(step - 1))}>
              {step === 0 ? "Cancel" : "← Back"}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button disabled={!canNext} onClick={() => setStep(step + 1)}>
                Continue →
              </Button>
            ) : (
              <Button onClick={create}>
                <Check className="h-4 w-4" /> Create Department
              </Button>
            )}
          </div>
        </Card>
      </Page>
    </>
  );
}
