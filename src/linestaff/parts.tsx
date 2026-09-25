import { Button } from "../components/ui";
import { useState, type ReactNode } from "react";
import { Phone, MessageSquare, AlertTriangle, Sparkles, User, Clock, Lock } from "lucide-react";
import { STAFF, PRESENCE_DOT, type MTask, type Presence, type Staffer } from "./data";
import { Avatar, PriorityPill, SlaClockChip, Sheet, SelectField, TextField, Label, slaTone, fmtMins, CARD_SHADOW } from "./mobile";

export const activeCount = (tasks: MTask[], name: string) =>
  tasks.filter((t) => (t.owner === name || t.support.includes(name)) && (t.status === "progress" || t.status === "assigned")).length;
export const atRiskCount = (tasks: MTask[], name: string) =>
  tasks.filter((t) => t.owner === name && t.status !== "completed" && t.slaLeft >= 0 && t.slaLeft / t.slaTotal < 0.35).length;
export const overdueCount = (tasks: MTask[], name: string) =>
  tasks.filter((t) => t.owner === name && t.status !== "completed" && t.status !== "unable" && t.slaLeft < 0).length;

export const isOpen = (t: MTask) => t.status !== "completed" && t.status !== "unable";
export const isAtRisk = (t: MTask) => isOpen(t) && t.slaLeft >= 0 && t.slaLeft / t.slaTotal < 0.35;
export const isOverdue = (t: MTask) => isOpen(t) && t.slaLeft < 0;

export const STATUS_LABEL: Record<MTask["status"], string> = {
  unassigned: "Unassigned",
  assigned: "",
  progress: "",
  completed: "Completed",
  unable: "Unable to complete",
};
export const STATUS_TONE: Record<MTask["status"], string> = {
  unassigned: "text-red-600",
  assigned: "text-amber-600",
  progress: "text-sky-600",
  completed: "text-emerald-600",
  unable: "text-slate-500",
};

export function StatusTag({ s }: { s: MTask["status"] }) {
  if (!STATUS_LABEL[s]) return null;
  return <span className={`text-[12px] font-medium ${STATUS_TONE[s]}`}>{STATUS_LABEL[s]}</span>;
}

/* ---------- staff picker ---------- */

export function StaffPicker({
  tasks,
  onPick,
  exclude = [],
  lineStaffOnly = true,
  cta = "Select",
}: {
  tasks: MTask[];
  onPick: (s: Staffer) => void;
  exclude?: string[];
  lineStaffOnly?: boolean;
  cta?: string;
}) {
  const order: Presence[] = ["Available", "Busy", "On Break", "Off work"];
  const list = STAFF.filter((s) => (!lineStaffOnly || s.role === "Line Staff") && !exclude.includes(s.name)).sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
  return (
    <div className="space-y-2">
      {list.map((s) => {
        const off = s.status === "Off work";
        const n = activeCount(tasks, s.name);
        return (
          <button
            key={s.name}
            disabled={off}
            onClick={() => onPick(s)}
            className={`flex w-full items-center gap-3 rounded-2xl border border-line p-3 text-left ${off ? "opacity-45" : "active:bg-brand-tint/40"}`}
          >
            <Avatar name={s.name} size={40} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[14px] font-semibold text-ink">{s.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-secondary">
                <span className={`h-2 w-2 rounded-full ${PRESENCE_DOT[s.status]}`} /> {s.status} · {n} active
              </div>
            </div>
            <span className="text-[12px] font-semibold text-brand">{off ? "Unavailable" : cta}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- reason / note sheet ---------- */

export function ReasonSheet({
  title,
  reasons,
  reasonLabel = "Reason",
  placeholder,
  cta,
  requireNote = false,
  noteLabel,
  tone,
  onClose,
  onSubmit,
}: {
  title: string;
  reasons?: readonly string[];
  reasonLabel?: string;
  placeholder: string;
  cta: string;
  requireNote?: boolean;
  noteLabel?: string;
  tone?: string;
  onClose: () => void;
  onSubmit: (reason: string, note: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const ok = (!reasons || reason) && (!requireNote || note.trim());
  return (
    <Sheet title={title} onClose={onClose}>
      {reasons && (
        <>
          <Label>{reasonLabel}</Label>
          <SelectField value={reason} onChange={setReason} placeholder="Select a reason" options={[...reasons]} />
        </>
      )}
      <Label>{noteLabel ?? (requireNote ? "Note (required)" : "Note")}</Label>
      <TextField rows={4} value={note} onChange={setNote} placeholder={placeholder} />
      <Button className="mt-5 w-full" tone={tone} disabled={!ok} onClick={() => onSubmit(reason, note.trim())}>{cta}</Button>
    </Sheet>
  );
}

/* ---------- contact sheet ---------- */

export function ContactSheet({ name, phone, onClose, onDone }: { name: string; phone: string; onClose: () => void; onDone: (m: string) => void }) {
  return (
    <Sheet title={`Contact ${name.split(" ")[0]}`} onClose={onClose}>
      <div className="flex items-center gap-3 rounded-2xl bg-[#F6F6F8] p-4">
        <Avatar name={name} />
        <div><div className="text-[15px] font-semibold text-ink">{name}</div><div className="text-[13px] text-ink-secondary">{phone}</div></div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button tone="bg-emerald-600" onClick={() => onDone(`Calling ${name}…`)}><Phone className="h-4 w-4" /> Call</Button>
        <Button variant="outline" onClick={() => onDone(`Message sent to ${name}`)}><MessageSquare className="h-4 w-4" /> Message</Button>
      </div>
    </Sheet>
  );
}

/* ---------- task detail body (shared) ---------- */

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
      <div className="text-[11px] font-semibold text-ink-secondary">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function DetailBody({ task, viewer }: { task: MTask; viewer: "supervisor" | "manager" }) {
  const tone = slaTone(task.slaLeft, task.slaTotal);
  const elapsed = task.slaTotal - task.slaLeft;
  return (
    <div className="space-y-3.5">
      {/* header */}
      <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[18px] font-semibold text-ink">{task.room}</span>
              <PriorityPill p={task.priority} />
            </div>
            <div className="mt-1 text-[14px] font-medium text-ink">{task.title}</div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusTag s={task.status} />
              {task.escType && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">{task.escType}</span>}
            </div>
          </div>
          {task.status !== "completed" && <SlaClockChip left={task.slaLeft} total={task.slaTotal} />}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3 text-[12px]">
          <div><div className="text-ink-tertiary">Owner</div><div className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink"><User className="h-3.5 w-3.5 text-ink-tertiary" />{task.owner ?? <span className="text-red-600">Unassigned</span>}</div></div>
          <div><div className="text-ink-tertiary">Support</div><div className="mt-0.5 text-[13px] font-semibold text-ink">{task.support.length ? task.support.join(", ") : "—"}</div></div>
          <div><div className="text-ink-tertiary">Pickup SLA</div><div className="mt-0.5 text-[13px] font-semibold text-ink">{task.pickup}</div></div>
          <div>
            <div className="text-ink-tertiary">Resolution SLA</div>
            <div className={`mt-0.5 text-[13px] font-semibold ${tone.text}`}>
              {task.status === "completed" ? "Met" : task.slaLeft < 0 ? `Breached by ${fmtMins(-task.slaLeft)}` : `${fmtMins(task.slaLeft)} left of ${task.slaTotal}m`}
            </div>
          </div>
        </div>
      </div>

      {task.escReason && (
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-red-700"><AlertTriangle className="h-4 w-4" /> Escalated by {task.escBy ?? "system"}</div>
          <p className="mt-1.5 text-[13px] leading-snug text-ink">{task.escReason}</p>
        </div>
      )}

      <Block title="AI request summary">
        <div className="flex gap-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
          <p className="text-[13px] leading-relaxed text-ink">{task.summary}</p>
        </div>
      </Block>

      <Block title="Guest context">
        <div className="text-[14px] font-semibold text-ink">{task.guest} <span className="font-normal text-ink-secondary">· {task.room}</span></div>
        {task.prefs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {task.prefs.map((p) => <span key={p} className="rounded-full bg-[#F1F1F3] px-2.5 py-1 text-[12px] text-ink-secondary">{p}</span>)}
          </div>
        )}
        {task.complaint && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-semibold text-red-600">Sentiment: {task.sentiment}</span>
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[12px] font-semibold text-orange-700">Risk: {task.risk}</span>
          </div>
        )}
      </Block>

      <Block title={viewer === "supervisor" ? "Conversation (summary)" : "Conversation"}>
        <p className="text-[13px] leading-relaxed text-ink-secondary">{task.convo}</p>
        {viewer === "supervisor" && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#F6F6F8] px-3 py-2 text-[12px] text-ink-secondary">
            <Lock className="h-3.5 w-3.5" /> Replying to the guest isn&apos;t enabled for your role.
          </div>
        )}
      </Block>

      {task.related && task.related.length > 0 && (
        <Block title="Related guest requests">
          <ul className="space-y-1.5 text-[13px] text-ink">{task.related.map((r) => <li key={r} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ink-tertiary" />{r}</li>)}</ul>
        </Block>
      )}

      <Block title={viewer === "manager" ? "SLA history & previous actions" : "Activity"}>
        {viewer === "manager" && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#F6F6F8] px-3 py-2 text-[12px] text-ink-secondary">
            <Clock className="h-3.5 w-3.5" /> Elapsed {fmtMins(Math.max(elapsed, 0))} of {task.slaTotal}m · created {task.createdAt}
          </div>
        )}
        <ol className="relative space-y-3 border-l border-line pl-4">
          {task.timeline.map((e, i) => (
            <li key={i} className="relative text-[13px]">
              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand" />
              <span className="mr-2 text-[12px] text-ink-tertiary">{e.t}</span>
              <span className="text-ink">{e.text}</span>
            </li>
          ))}
        </ol>
      </Block>

      <Block title={viewer === "manager" ? "Internal & management notes" : "Internal notes"}>
        {task.notes.length ? (
          <div className="space-y-2">
            {task.notes.map((n, i) => (
              <div key={i} className="rounded-xl bg-amber-50 p-3">
                <p className="text-[13px] leading-snug text-ink">{n.text}</p>
                <p className="mt-1 text-[11px] text-ink-tertiary">{n.by} · {n.t}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-ink-tertiary">No notes yet.</p>
        )}
      </Block>
    </div>
  );
}

/** grid of action tiles */
export function ActionGrid({ actions }: { actions: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; tone?: string; disabled?: boolean }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          disabled={a.disabled}
          className={`flex flex-col items-center gap-1.5 rounded-2xl bg-white px-1 py-3 text-center text-[12px] font-semibold text-ink ${CARD_SHADOW} disabled:opacity-40 active:scale-[0.98]`}
        >
          <span className={`flex h-9 w-9 items-center justify-center rounded-full ${a.tone ?? "bg-brand-tint text-brand"}`}><a.icon className="h-[18px] w-[18px]" /></span>
          {a.label}
        </button>
      ))}
    </div>
  );
}
