import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Topbar } from "../../components/Topbar";
import { Page, Card, Button, Field, Input, Textarea, Modal } from "../../components/ui";
import { getDeptTemplate, type TemplateService } from "../../data/deptTemplates";
import { deptIcon } from "../../data/deptIcons";

type ModalState = { mode: "add" } | { mode: "edit"; service: TemplateService } | null;

export default function DeptTemplateDetail() {
  const { slug = "" } = useParams();
  const dept = getDeptTemplate(slug);
  const [services, setServices] = useState<TemplateService[]>(dept?.services ?? []);
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<TemplateService | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (dept) setServices(dept.services);
  }, [dept]);

  useEffect(() => {
    if (dept) dept.services = services;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 1800);
  };

  if (!dept) return <Navigate to="/admin/department-templates" replace />;
  const Icon = deptIcon(dept.name);

  const saveService = (s: TemplateService, editingName?: string) => {
    if (editingName) {
      setServices((ss) => ss.map((x) => (x.name === editingName ? s : x)));
      flash(`"${s.name}" updated`);
    } else {
      setServices((ss) => [...ss, s]);
      flash(`"${s.name}" added`);
    }
    setModal(null);
  };

  const deleteService = () => {
    if (!deleteTarget) return;
    setServices((ss) => ss.filter((x) => x.name !== deleteTarget.name));
    flash(`"${deleteTarget.name}" removed`);
    setDeleteTarget(null);
  };

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
              <div>
                <h3 className="text-[15px] font-semibold text-ink">Services &amp; SLA</h3>
                <p className="mt-0.5 text-[12px] text-ink-tertiary">{services.length} service{services.length === 1 ? "" : "s"}</p>
              </div>
              <Button onClick={() => setModal({ mode: "add" })}><Plus className="h-4 w-4" /> Add Service</Button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="bg-[#F4F4F5] text-[12px] uppercase tracking-wide text-[#6B7280]">
                    <th className="py-3 pl-4 pr-3 font-medium">Service</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Description</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Response</th>
                    <th className="py-3 pl-4 pr-3 font-medium">Resolve</th>
                    <th className="py-3 pl-4 pr-4" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.name} className="border-t border-line/60">
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] font-medium text-ink">{s.name}</td>
                      <td className="py-3 pl-4 pr-3 text-[13px] leading-relaxed text-ink-secondary">{s.description}</td>
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{s.response}</td>
                      <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[13px] text-ink-secondary">{s.resolve}</td>
                      <td className="whitespace-nowrap py-3 pl-4 pr-4 text-right">
                        <button
                          onClick={() => setModal({ mode: "edit", service: s })}
                          aria-label={`Edit ${s.name}`}
                          className="rounded-md p-1.5 text-ink-tertiary hover:bg-subtle hover:text-ink"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          aria-label={`Delete ${s.name}`}
                          className="rounded-md p-1.5 text-ink-tertiary hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!services.length && (
                    <tr><td colSpan={5} className="py-8 text-center text-[13px] text-ink-tertiary">No services yet — add the first one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </Page>

      {modal && (
        <ServiceModal
          key={modal.mode === "edit" ? modal.service.name : "new"}
          initial={modal.mode === "edit" ? modal.service : null}
          existingNames={services.map((s) => s.name)}
          onClose={() => setModal(null)}
          onSave={(s) => saveService(s, modal.mode === "edit" ? modal.service.name : undefined)}
        />
      )}

      {deleteTarget && (
        <Modal
          title="Delete service"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button tone="bg-red-600" onClick={deleteService}>Delete service</Button>
            </>
          }
        >
          <p className="text-[13px] text-ink-secondary">
            Remove "{deleteTarget.name}" from the {dept.name} template? Hotels that already onboarded keep their own copy of this department.
          </p>
        </Modal>
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
          <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-white shadow-lg">{toast}</span>
        </div>
      )}
    </>
  );
}

function ServiceModal({
  initial, existingNames, onClose, onSave,
}: {
  initial: TemplateService | null;
  existingNames: string[];
  onClose: () => void;
  onSave: (s: TemplateService) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [response, setResponse] = useState(initial?.response ?? "20 min");
  const [resolve, setResolve] = useState(initial?.resolve ?? "90 min");

  const trimmedName = name.trim();
  const duplicate = trimmedName.toLowerCase() !== (initial?.name ?? "").toLowerCase() && existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase());
  const ok = trimmedName && description.trim() && response.trim() && resolve.trim() && !duplicate;

  return (
    <Modal
      title={initial ? "Edit Service" : "Add Service"}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!ok}
            className="disabled:opacity-40"
            onClick={() => onSave({ name: trimmedName, description: description.trim(), response: response.trim(), resolve: resolve.trim() })}
          >
            {initial ? "Save Changes" : "Add Service"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Service Name" required hint={duplicate ? "A service with this name already exists." : undefined}>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Express Checkout" />
        </Field>
        <Field label="Description" required>
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this service covers…" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Response Target" required><Input value={response} onChange={(e) => setResponse(e.target.value)} placeholder="e.g. 10 min" /></Field>
          <Field label="Resolve Target" required><Input value={resolve} onChange={(e) => setResolve(e.target.value)} placeholder="e.g. 45 min" /></Field>
        </div>
      </div>
    </Modal>
  );
}
