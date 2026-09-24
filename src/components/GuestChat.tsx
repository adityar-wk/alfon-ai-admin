import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Hand, FileText, Paperclip, Smile, CheckCheck } from "lucide-react";
import { usePersona } from "../persona";

export type MessageTemplate = { label: string; text: string };

export type ChatMsg = { from: "guest" | "ai" | "staff"; text: string; time: string };
export type ChatMode = "auto" | "manual";

/** WhatsApp-style conversation with an Auto (ALFON AI) / Manual (staff) reply toggle. */
export function GuestChat({
  name,
  msgs,
  mode,
  setMode,
  onSend,
  className = "",
  emptyText = "No messages yet.",
  templates,
  insert,
  aiDraft,
  onDraftChange,
  onApproveDraft,
}: {
  name: string;
  msgs: ChatMsg[];
  mode: ChatMode;
  setMode: (m: ChatMode) => void;
  onSend: (text: string) => void;
  className?: string;
  emptyText?: string;
  /** ready-made messages the staff member can insert (use {name} for the guest's first name) */
  templates?: MessageTemplate[];
  /** text pushed into the composer from outside (bump `nonce` to insert again) */
  insert?: { text: string; nonce: number };
  /** AI-drafted reply awaiting manager approval. */
  aiDraft?: string;
  onDraftChange?: (text: string) => void;
  onApproveDraft?: () => void;
}) {
  const { me } = usePersona();
  const [editing, setEditing] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs.length, name, aiDraft !== undefined]);

  useEffect(() => {
    if (!insert?.nonce) return;
    setDraft(insert.text);
    setMode("manual");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insert?.nonce]);

  const send = () => {
    if (!draft.trim() || mode !== "manual") return;
    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-8 py-6">
        {msgs.length === 0 && <p className="pt-12 text-center text-[14px] text-ink-tertiary">{emptyText}</p>}
        {msgs.map((m, i) => {
          const mine = m.from !== "guest";
          return (
            <div key={i} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[82%] rounded-[20px] px-5 py-3.5 text-[14px] leading-[1.5] text-ink ${
                  mine ? "bg-[#FDEEE6]" : "border border-line/70 bg-white shadow-[0_1px_4px_rgba(16,24,40,0.06)]"
                }`}
              >
                {m.text}
                <div className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-ink-tertiary">
                  {m.time}
                  {mine && <CheckCheck className="h-3.5 w-3.5 text-brand" />}
                </div>
              </div>
              {m.from === "ai" && (
                <div className="mt-1.5 flex items-center gap-1 pr-1 text-[11px] text-ink-tertiary">
                  <Sparkles className="h-3 w-3 text-brand" /> Alfon AI
                </div>
              )}
              {m.from === "staff" && <div className="mt-1.5 pr-1 text-[11px] text-ink-tertiary">You</div>}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {aiDraft !== undefined && (
        <div className="mx-6 mb-3 rounded-2xl border border-brand/25 bg-brand-tint/60 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-brand">
            <Sparkles className="h-3.5 w-3.5" /> ALFON AI drafted a reply to {name.split(" ")[0]} — review before it's sent
          </div>
          {editing ? (
            <textarea
              value={aiDraft}
              onChange={(e) => onDraftChange?.(e.target.value)}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-lg border border-line bg-white p-2.5 text-[14px] leading-relaxed text-ink outline-none focus:border-brand"
            />
          ) : (
            <p className="text-[14px] leading-relaxed text-ink">{aiDraft}</p>
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

      <div className="relative px-6 pb-5 pt-3">
        {tplOpen && templates && (
          <div className="absolute inset-x-6 bottom-[calc(100%-8px)] z-10 max-h-64 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-lg">
            <div className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Message templates</div>
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => { setDraft(t.text.replace("{name}", name.split(" ")[0])); setMode("manual"); setTplOpen(false); }}
                className="block w-full rounded-lg px-2.5 py-2 text-left hover:bg-subtle"
              >
                <span className="block text-[13px] font-semibold text-ink">{t.label}</span>
                <span className="line-clamp-2 block text-[12px] text-ink-secondary">{t.text.replace("{name}", name.split(" ")[0])}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex shrink-0 rounded-full bg-subtle p-1 text-[12px] font-semibold">
            <button
              onClick={() => setMode("auto")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${mode === "auto" ? "bg-white text-brand shadow-sm" : "text-ink-secondary"}`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Auto
            </button>
            <button
              onClick={() => setMode("manual")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${mode === "manual" ? "bg-white text-brand shadow-sm" : "text-ink-secondary"}`}
            >
              <Hand className="h-3.5 w-3.5" /> Manual
            </button>
          </div>
          <span className="truncate text-[11px] text-ink-tertiary">
            {mode === "auto" ? "ALFON AI is replying automatically" : `Sending as ${me.name} · ${me.role}`}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button aria-label="Attach file" disabled={mode !== "manual"} className="shrink-0 text-ink-tertiary hover:text-ink disabled:opacity-40">
            <Paperclip className="h-5 w-5" />
          </button>
          <button aria-label="Emoji" disabled={mode !== "manual"} className="shrink-0 text-ink-tertiary hover:text-ink disabled:opacity-40">
            <Smile className="h-5 w-5" />
          </button>
          {templates && (
            <button
              onClick={() => setTplOpen((o) => !o)}
              aria-label="Message templates"
              aria-expanded={tplOpen}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold ${tplOpen ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink-secondary hover:bg-subtle"}`}
            >
              <FileText className="h-3.5 w-3.5" /> Templates
            </button>
          )}
          <input
            value={draft}
            disabled={mode !== "manual"}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={mode === "manual" ? `Message ${name.split(" ")[0]}…` : "Switch to Manual to reply yourself"}
            className="h-11 min-w-0 flex-1 rounded-full bg-subtle px-5 text-[14px] outline-none placeholder:text-ink-tertiary focus:bg-white focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            onClick={send}
            disabled={mode !== "manual" || !draft.trim()}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-[0_4px_12px_rgba(241,90,36,0.35)] hover:bg-brand-hover disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
