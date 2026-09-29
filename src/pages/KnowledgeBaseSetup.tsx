import { useRef, useState } from "react";
import { UploadCloud, FileText, Trash2 } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Card, Button } from "../components/ui";
import { useGoNextStep } from "../data/onboarding";

type Item = { id: number; name: string; detail: string };

let nextId = 100;

const SEED: Item[] = [
  { id: 1, name: "Hotel Policies & Procedures.pdf", detail: "Added May 23, 2025 · 2.4 MB" },
  { id: 2, name: "Housekeeping SOP.docx", detail: "Added May 22, 2025 · 850 KB" },
  { id: 4, name: "Hotel Facilities Guide.docx", detail: "Added May 20, 2025 · 1.1 MB" },
];

export default function KnowledgeBaseSetup() {
  const goNext = useGoNextStep(3);
  const [items, setItems] = useState<Item[]>(SEED);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setItems((it) => [
      ...Array.from(files).map((f) => ({
        id: nextId++,
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
                    <FileText className="h-4 w-4" />
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
            <Button onClick={goNext}>Continue →</Button>
            <Button variant="outline">Save as Draft</Button>
          </div>
        </div>
      </Page>
    </>
  );
}
