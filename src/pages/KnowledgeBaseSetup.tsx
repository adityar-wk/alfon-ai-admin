import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, Clock, Trash2 } from "lucide-react";
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

export default function KnowledgeBaseSetup() {
  const goNext = useGoNextStep(3);
  const [items, setItems] = useState<Item[]>(SEED);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setItems((it) => [
      ...Array.from(files).map((f) => ({
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
            className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E5E5E5] px-6 py-10 text-center hover:border-brand/40"
          >
            <UploadCloud className="h-8 w-8 text-ink-tertiary" />
            <div className="mt-2 font-display text-[16px] font-semibold text-ink">Upload hotel documents</div>
            <div className="mt-1 text-[14px] text-ink-secondary">PDF, Word, or paste a website URL</div>
          </button>

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

          <div className="flex items-center gap-3">
            <Button onClick={goNext}>Continue →</Button>
            <Button variant="outline">Save as Draft</Button>
          </div>
        </div>
      </Page>
    </>
  );
}
