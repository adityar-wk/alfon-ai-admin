import { useRef, useState } from "react";
import { Upload, Download, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Button } from "../components/ui";
import { useGoNextStep } from "../data/onboarding";

type Item = { id: number; name: string; date: string; status: "Completed" | "Pending" };

let nextId = 100;

const SEED: Item[] = [
  { id: 1, name: "Hotel Facilities Guide.pdf", date: "May 20", status: "Completed" },
  { id: 2, name: "Restaurant Menus 2025.pdf", date: "May 18", status: "Completed" },
  { id: 3, name: "Spa Services Brochure.pdf", date: "May 15", status: "Completed" },
  { id: 4, name: "Local Attractions Guide.pdf", date: "May 24", status: "Pending" },
];

const isDoc = (f: File) => /\.(pdf|csv)$/i.test(f.name) || f.type === "application/pdf" || f.type === "text/csv";

function downloadTemplate() {
  const blob = new Blob(["Title,Content\nFacilities,Pool hours and gym access\n"], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "knowledge-base-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function KnowledgeBaseSetup() {
  const goNext = useGoNextStep(3);
  const [items, setItems] = useState<Item[]>(SEED);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | File[] | null) => {
    const picked = Array.from(files ?? []).filter(isDoc);
    if (!picked.length) return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setFileName(picked.map((f) => f.name).join(", "));
    setItems((it) => [
      ...picked.map((f) => ({
        id: nextId++,
        name: f.name,
        date,
        status: "Pending" as const,
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

        <div className="max-w-2xl space-y-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFiles(e.dataTransfer.files);
            }}
            className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center ${dragging ? "border-brand bg-brand-tint/40" : "border-[#E5E5E5]"}`}
          >
            <Upload className="h-6 w-6 text-ink-tertiary" />
            <p className="mt-3 text-[14px] font-medium text-ink">Drop your file here</p>
            <p className="mt-1 text-[12px] text-ink-tertiary">PDF or CSV · up to 10MB</p>
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
              multiple
              accept=".pdf,.csv,application/pdf,text/csv"
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-secondary">Uploaded Documents</div>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between gap-3 rounded-lg bg-[#FAFAFA] px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2 text-[14px] text-ink">
                    {it.status === "Completed" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                    )}
                    <span className="truncate">{it.name}</span>
                    <span className="shrink-0 text-[12px] text-ink-secondary">— {it.date}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`text-[13px] font-medium ${it.status === "Completed" ? "text-green-500" : "text-ink-tertiary"}`}>{it.status}</span>
                    <button
                      onClick={() => remove(it.id)}
                      aria-label={`Remove ${it.name}`}
                      className="rounded-md p-1 text-ink-tertiary hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {!items.length && <p className="py-6 text-center text-[13px] text-ink-tertiary">Nothing added yet.</p>}
            </div>
          </div>

          <p className="text-[12px] text-ink-secondary">Admin reviews content before it goes live to the AI.</p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={goNext}>Continue →</Button>
        </div>
      </Page>
    </>
  );
}
