import { useEffect, useRef, useState, type ReactNode } from "react";
import { Send, Sparkles, Hand, MessageCircle } from "lucide-react";

export type ChatMsg = { from: "guest" | "ai" | "staff"; text: string; time: string };
export type ChatMode = "auto" | "manual";

/** WhatsApp-style conversation with an Auto (ALFON AI) / Manual (staff) reply toggle. */
export function GuestChat({
  name,
  msgs,
  mode,
  setMode,
  onSend,
  title,
  className = "",
  emptyText = "No messages yet.",
  aiDraft,
  onDraftChange,
  onApproveDraft,
}: {
  name: string;
  msgs: ChatMsg[];
  mode: ChatMode;
  setMode: (m: ChatMode) => void;
  onSend: (text: string) => void;
  title?: ReactNode;
  className?: string;
  emptyText?: string;
  /** AI-drafted reply awaiting manager approval. */
  aiDraft?: string;
  onDraftChange?: (text: string) => void;
  onApproveDraft?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs.length, name, aiDraft !== undefined]);

  const send = () => {
    if (!draft.trim() || mode !== "manual") return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          {title ?? (
            <>
              <MessageCircle className="h-4 w-4 text-emerald-500" />
              <span className="text-[14px] font-semibold text-ink">WhatsApp</span>
            </>
          )}
        </div>
        <div className="flex rounded-lg bg-subtle p-1 text-[12px] font-semibold">
          <button
            onClick={() => setMode("auto")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${
              mode === "auto" ? "bg-white text-violet-600 shadow-sm" : "text-ink-secondary"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Auto
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${
              mode === "manual" ? "bg-white text-brand shadow-sm" : "text-ink-secondary"
            }`}
          >
            <Hand className="h-3.5 w-3.5" /> Manual
          </button>
        </div>
      </div>

      <div
        className={`flex items-center justify-between gap-3 px-4 py-2 text-[12px] ${
          mode === "auto" ? "bg-violet-50/60 text-violet-700" : "bg-brand-tint/50 text-brand"
        }`}
      >
        <span>
          {mode === "auto"
            ? "ALFON AI is replying to this guest automatically."
            : "You're replying manually. ALFON is paused for this guest."}
        </span>
        {mode === "auto" && (
          <button onClick={() => setMode("manual")} className="font-semibold hover:underline">
            Take over
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {msgs.length === 0 && <p className="pt-12 text-center text-[13px] text-ink-tertiary">{emptyText}</p>}
        {msgs.map((m, i) => {
          const mine = m.from !== "guest";
          return (
            <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed text-ink ${
                  m.from === "guest" ? "bg-subtle" : m.from === "ai" ? "bg-violet-50" : "bg-brand-tint"
                }`}
              >
                {m.text}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-tertiary">
                  {m.from === "ai" && <span className="font-semibold text-violet-500">ALFON AI</span>}
                  {m.from === "staff" && <span className="font-semibold text-brand">You</span>}
                  {m.time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {aiDraft !== undefined && (
        <div className="mx-3 mb-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3.5">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" /> ALFON AI drafted a reply to {name.split(" ")[0]} — review before it's sent
          </div>
          {editing ? (
            <textarea
              value={aiDraft}
              onChange={(e) => onDraftChange?.(e.target.value)}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-lg border border-line bg-white p-2.5 text-[13px] leading-relaxed text-ink outline-none focus:border-brand"
            />
          ) : (
            <p className="text-[13px] leading-relaxed text-ink">{aiDraft}</p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button onClick={() => setEditing((v) => !v)} className="rounded-lg border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-ink hover:bg-subtle">
              {editing ? "Done" : "Edit"}
            </button>
            <button
              onClick={() => { setEditing(false); onApproveDraft?.(); }}
              disabled={!aiDraft.trim()}
              className="rounded-lg bg-brand px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-brand-hover disabled:opacity-40"
            >
              Approve &amp; send
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-line p-3">
        <input
          value={draft}
          disabled={mode !== "manual"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={mode === "manual" ? `Message ${name.split(" ")[0]}…` : "Switch to Manual to reply yourself"}
          className="h-10 flex-1 rounded-full border border-line bg-subtle px-4 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          onClick={send}
          disabled={mode !== "manual" || !draft.trim()}
          aria-label="Send"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-hover disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
