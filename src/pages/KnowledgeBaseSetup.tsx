import { useRef, useState } from "react";
import { UploadCloud, Link2, FileText, Plus, Trash2, Globe } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card, Button, Input } from "../components/ui";

type Item = { id: number; kind: "file" | "link"; name: string; detail: string };

let nextId = 100;

const SEED: Item[] = [
  { id: 1, kind: "file", name: "Hotel Policies & Procedures.pdf", detail: "Added May 23, 2025 · 2.4 MB" },
  { id: 2, kind: "file", name: "Housekeeping SOP.docx", detail: "Added May 22, 2025 · 850 KB" },
  { id: 3, kind: "link", name: "Local Attractions Guide", detail: "https://primehotel.com/guide/attractions" },
  { id: 4, kind: "file", name: "Hotel Facilities Guide.docx", detail: "Added May 20, 2025 · 1.1 MB" },
];

export default function KnowledgeBaseSetup() {
  const [items, setItems] = useState<Item[]>(SEED);
  const [links, setLinks] = useState([{ name: "", url: "" }]);
  const fileRef = useRef<HTMLInputElement>(null);

  const addLinkRow = () => setLinks((l) => [...l, { name: "", url: "" }]);
  const updateLink = (i: number, key: "name" | "url", v: string) =>
    setLinks((l) => l.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)));

  const saveLinks = () => {
    const valid = links.filter((l) => l.url.trim());
    if (!valid.length) return;
    setItems((it) => [
      ...valid.map((l) => ({
        id: nextId++,
        kind: "link" as const,
        name: l.name.trim() || l.url.trim(),
        detail: l.url.trim(),
      })),
      ...it,
    ]);
    setLinks([{ name: "", url: "" }]);
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setItems((it) => [
      ...Array.from(files).map((f) => ({
        id: nextId++,
        kind: "file" as const,
        name: f.name,
        detail: `Added just now · ${(f.size / 1024).toFixed(0)} KB`,
      })),
      ...it,
    ]);
  };

  const remove = (id: number) => setItems((it) => it.filter((x) => x.id !== id));

  return (
    <>
      <Topbar title="Knowledge Base Setup" backTo="/onboarding" />
      <Page>
        <SetupTabs />

        <div className="max-w-3xl space-y-5">
          {/* Drag & drop */}
          <Card className="p-6">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">Upload documents</h3>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFiles(e.dataTransfer.files);
              }}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-subtle px-6 py-10 text-center hover:border-brand/50"
            >
              <UploadCloud className="h-8 w-8 text-brand" />
              <p className="mt-3 text-[13px] font-medium text-ink">
                Drag and drop files here, or click to browse
              </p>
              <p className="mt-1 text-[12px] text-ink-tertiary">
                PDF, DOCX, TXT — you can select multiple files
              </p>
            </button>
          </Card>

          {/* Add links */}
          <Card className="p-6">
            <h3 className="mb-1 text-[15px] font-semibold text-ink">Add reference links</h3>
            <p className="mb-4 text-[12px] text-ink-secondary">
              Give each link a name so it&apos;s easy to recognise later.
            </p>

            <div className="space-y-3">
              {links.map((row, i) => (
                <div key={i} className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.6fr]">
                  <Input
                    placeholder="Link name (e.g. Spa Menu)"
                    value={row.name}
                    onChange={(e) => updateLink(i, "name", e.target.value)}
                  />
                  <Input
                    placeholder="https://..."
                    value={row.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={addLinkRow}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand"
              >
                <Plus className="h-4 w-4" /> Add another link
              </button>
              <Button onClick={saveLinks}>
                <Link2 className="h-4 w-4" /> Save links
              </Button>
            </div>
          </Card>

          {/* Uploaded list */}
          <Card className="p-6">
            <h3 className="mb-3 text-[15px] font-semibold text-ink">
              Added to knowledge base{" "}
              <span className="font-normal text-ink-tertiary">({items.length})</span>
            </h3>
            <div className="divide-y divide-line">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-subtle text-ink-secondary">
                    {it.kind === "file" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <Globe className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-ink">{it.name}</div>
                    <div className="truncate text-[12px] text-ink-tertiary">{it.detail}</div>
                  </div>
                  <button
                    onClick={() => remove(it.id)}
                    className="rounded-md p-1.5 text-ink-tertiary hover:bg-subtle hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {!items.length && (
                <p className="py-6 text-center text-[13px] text-ink-tertiary">
                  Nothing added yet.
                </p>
              )}
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button>Continue →</Button>
            <Button variant="outline">Save as Draft</Button>
          </div>
        </div>
      </Page>
    </>
  );
}
