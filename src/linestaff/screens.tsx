import { useState } from "react";
import { Bell, Building2, Send, Check, Plus, BedDouble, Layers, User, Clock, StickyNote } from "lucide-react";
import { DEPARTMENTS } from "../data/departments";
import {
  PhoneFrame,
  ScreenHeader,
  TextHeader,
  SectionTitle,
  SlaRing,
  Fab,
  PrimaryButton,
  GhostButton,
  SelectField,
  TextField,
  Segmented,
  Label,
  useNav,
  useToast,
  CARD_SHADOW,
  slaTone,
  fmtMins,
  type Priority,
} from "./mobile";

type Screen = { name: "home" | "notifications" | "taskDetail" | "needHelp" | "create"; id?: string };
type Status = "pending" | "progress" | "completed";
type Task = {
  id: string;
  title: string;
  room: string;
  note: string;
  status: Status;
  left: number;
  total: number;
  time?: string;
  // room + request details
  guest: string;
  roomType: string;
  floor: number;
  stay: string;
  prefs: string[];
  source: string;
  created: string;
  staffNote?: string;
};

const INITIAL: Task[] = [
  {
    id: "t1", title: "Full towel change & hypoallergenic linens", room: "Room 501", note: "Guest requested a full towel change and hypoallergenic linens before check-in.",
    status: "progress", left: 18, total: 45, guest: "Emma Davis", roomType: "Deluxe King", floor: 5, stay: "Arriving today · 7 nights", prefs: ["Hypoallergenic bedding", "Firm pillow", "Quiet room"],
    source: "Guest chat", created: "9:48 AM", staffNote: "Use the green-tagged linen set from storage. Tell the front desk if anything is missing.",
  },
  {
    id: "t10", title: "Extra pillows", room: "Room 908", note: "Two extra pillows requested. Guest is waiting in the room.",
    status: "progress", left: -8, total: 30, guest: "Ananya Kapoor", roomType: "Executive King", floor: 9, stay: "In house · 4 nights", prefs: ["Extra pillows"],
    source: "Guest chat", created: "9:55 AM",
  },
  {
    id: "t2", title: "Carpet vacuum & spot clean", room: "Room 623", note: "Carpet vacuum and spot clean requested by the guest.",
    status: "pending", left: 52, total: 60, guest: "Liam Anderson", roomType: "Deluxe Twin", floor: 6, stay: "In house · 3 nights", prefs: ["Non-smoking"],
    source: "Guest chat", created: "10:22 AM", staffNote: "Small stain near the window. Guest is out until 2 PM.",
  },
  {
    id: "t3", title: "Rollaway bed & extra pillows", room: "Room 812", note: "Extra pillows and a rollaway bed for an arriving family of four.",
    status: "pending", left: 26, total: 40, guest: "Patel family", roomType: "Family Suite", floor: 8, stay: "Arriving 12:30 PM · 2 nights", prefs: ["High floor", "Extra pillows"],
    source: "PMS pre-arrival", created: "10:29 AM",
  },
  {
    id: "t7", title: "Baby cot setup", room: "Room 704", note: "Baby cot to be set up before the guest returns.",
    status: "pending", left: 12, total: 30, guest: "Sarah Chen", roomType: "Deluxe King", floor: 7, stay: "In house · 2 nights", prefs: ["Baby cot", "Quiet room"],
    source: "Guest chat", created: "10:26 AM",
  },
  {
    id: "t8", title: "Fresh linen change", room: "Room 410", note: "Fresh linen change requested by the guest.", status: "completed", left: 12, total: 45, time: "Done at 8:10 AM",
    guest: "Ethan Ross", roomType: "Deluxe King", floor: 4, stay: "In house", prefs: [], source: "Guest chat", created: "7:50 AM",
  },
  {
    id: "t9", title: "Towels replenished", room: "Room 227", note: "Bath towels replenished and amenities restocked.", status: "completed", left: 20, total: 45, time: "Done at 8:45 AM",
    guest: "Grace Kim", roomType: "Standard Twin", floor: 2, stay: "In house", prefs: [], source: "Staff", created: "8:20 AM",
  },
  {
    id: "t11", title: "Turndown service", room: "Room 118", note: "Turndown service completed with extra water bottles.", status: "completed", left: 30, total: 60, time: "Done at 9:05 AM",
    guest: "Noah Martinez", roomType: "Deluxe King", floor: 1, stay: "In house", prefs: [], source: "Staff", created: "8:50 AM",
  },
];

const NOTIFS = [
  { title: "Full towel change & linens", room: "Room 501", state: "Completed", tone: "text-emerald-600", time: "10:31 AM", id: "t1" },
  { title: "Extra pillows", room: "Room 908", state: "Overdue by 8 mins", tone: "text-red-600", time: "10:28 AM", id: "t10" },
  { title: "Baby cot setup", room: "Room 704", state: "New task", tone: "text-brand", time: "10:26 AM", id: "t7" },
  { title: "Rollaway bed & pillows", room: "Room 812", state: "New task", tone: "text-brand", time: "10:22 AM", id: "t3" },
];

const SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;
const SEV_COLOR: Record<(typeof SEVERITIES)[number], string> = { Low: "bg-slate-500", Medium: "bg-amber-500", High: "bg-orange-500", Critical: "bg-red-500" };
const SEV_SLA: Record<Priority, number> = { Low: 60, Medium: 40, High: 20, Critical: 10 };

/** task card: task name first, room second, SLA timer on the right, actions inside the card */
function LsCard({ t, onOpen, onAccept, onReject }: { t: Task; onOpen?: () => void; onAccept?: () => void; onReject?: () => void }) {
  const done = t.status === "completed";
  return (
    <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
      <div onClick={onOpen} role={onOpen ? "button" : undefined} className={`flex items-start gap-3 ${onOpen ? "cursor-pointer" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold leading-snug text-ink">{t.title}</div>
          <div className="mt-0.5 text-[12px] font-medium text-ink-secondary">{t.room}</div>
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-ink-tertiary">{t.note}</p>
          {done && t.time && <div className="mt-1.5 text-[11px] font-medium text-emerald-600">✓ {t.time}</div>}
        </div>
        {!done && <SlaRing left={t.left} total={t.total} size={50} />}
      </div>
      {onAccept && onReject && (
        <div className="mt-3.5 flex gap-2.5 border-t border-line pt-3.5">
          <button onClick={onReject} className="flex h-10 flex-1 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-[13px] font-semibold text-red-600">Void</button>
          <button onClick={onAccept} className="flex h-10 flex-1 items-center justify-center rounded-xl bg-brand text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(241,90,36,0.28)]">
            Accept
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-tertiary" />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-ink-tertiary">{label}</div>
        <div className="mt-0.5 text-[13px] font-medium text-ink">{children}</div>
      </div>
    </div>
  );
}

export function LineStaffPrototype() {
  const nav = useNav<Screen>({ name: "home" });
  const { flash, node: toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(INITIAL);
  const [available, setAvailable] = useState(true);
  const [incoming, setIncoming] = useState(false);
  const [helpNote, setHelpNote] = useState("");

  // create manual task
  const [dept, setDept] = useState("");
  const [service, setService] = useState("");
  const [sev, setSev] = useState<Priority>("Medium");
  const [room, setRoom] = useState("");
  const [details, setDetails] = useState("");

  const cur = nav.cur;
  const setStatus = (id: string, status: Status, time?: string) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, status, time } : t)));
  const openTask = (id: string) => nav.push({ name: "taskDetail", id });
  const accept = (id: string) => { setStatus(id, "progress"); flash("Task accepted"); };
  const reject = (id: string) => { setTasks((ts) => ts.filter((t) => t.id !== id)); flash("Task rejected"); if (cur.name === "taskDetail") nav.back(); };

  const pending = tasks.filter((t) => t.status === "pending");
  const inProgress = tasks.filter((t) => t.status === "progress");
  const completed = tasks.filter((t) => t.status === "completed");
  const active = tasks.find((t) => t.id === cur.id) ?? tasks[0];
  const services = DEPARTMENTS.find((d) => d.name === dept)?.services.filter((s) => s.active).map((s) => s.name) ?? [];

  const openCreate = () => {
    setDept(""); setService(""); setSev("Medium"); setRoom(""); setDetails("");
    nav.push({ name: "create" });
  };

  const createTask = () => {
    const id = "n" + Date.now();
    const r = room.trim() ? `Room ${room.trim().replace(/^room\s*/i, "")}` : dept;
    setTasks((ts) => [
      {
        id, title: service, room: r, note: details.trim() || service, status: "progress", left: SEV_SLA[sev], total: SEV_SLA[sev],
        guest: "—", roomType: "—", floor: 0, stay: "—", prefs: [], source: "Created by you", created: "Just now",
      },
      ...ts,
    ]);
    nav.go({ name: "home" });
    flash("Task created and assigned to you");
  };

  /* ---------------- screens ---------------- */

  const Home = (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto pb-28 no-scrollbar">
        <div className="flex items-center justify-between px-6 py-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-[13px] font-semibold text-white">AK</span>
          <button
            onClick={() => { setAvailable((a) => !a); flash(available ? "You're now off work" : "You're available"); }}
            aria-pressed={available}
            className="flex items-center gap-3 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink shadow-[0_3px_12px_rgba(0,0,0,0.12)]"
          >
            {available ? "Available" : "Off work"}
            <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${available ? "bg-emerald-500" : "bg-[#C8C8C8]"}`}>
              <span className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${available ? "translate-x-5" : ""}`} />
            </span>
          </button>
          <button onClick={() => nav.push({ name: "notifications" })} aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Bell className="h-[18px] w-[18px] text-ink" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>
        </div>

        <div className="mt-5"><SectionTitle dot={false} small action={<span className="text-[12px] text-ink-tertiary">{inProgress.length}</span>}>In progress</SectionTitle></div>
        <div className="mt-2.5 space-y-3 px-6">
          {inProgress.map((t) => <LsCard key={t.id} t={t} onOpen={() => openTask(t.id)} />)}
          {!inProgress.length && <p className="rounded-2xl bg-white p-4 text-center text-[12px] text-ink-tertiary">Nothing in progress. Accept a pending task.</p>}
        </div>

        <div className="mt-6"><SectionTitle dot={false} small action={<span className="text-[12px] text-ink-tertiary">{pending.length}</span>}>Pending</SectionTitle></div>
        <div className="mt-2.5 space-y-3 px-6">
          {pending.map((t) => <LsCard key={t.id} t={t} onOpen={() => openTask(t.id)} onAccept={() => accept(t.id)} onReject={() => reject(t.id)} />)}
          {!pending.length && <p className="rounded-2xl bg-white p-4 text-center text-[12px] text-ink-tertiary">You&apos;re all caught up.</p>}
        </div>

        <div className="mt-6"><SectionTitle dot={false} small action={<span className="text-[12px] text-ink-tertiary">{completed.length}</span>}>Completed</SectionTitle></div>
        <div className="mt-2.5 space-y-3 px-6">
          {completed.map((t) => <LsCard key={t.id} t={t} onOpen={() => openTask(t.id)} />)}
        </div>
      </div>
      <Fab icon={Plus} label="Create task" onClick={openCreate} />
    </div>
  );

  const Notifications = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Notifications" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 no-scrollbar">
        {NOTIFS.map((n, i) => (
          <button key={i} onClick={() => openTask(n.id)} className="relative block w-full border-b border-dashed border-ink/20 py-3.5 pr-16 text-left last:border-0">
            <div className="text-[14px] font-semibold text-ink">{n.title}</div>
            <div className="mt-0.5 text-[12px]"><span className="text-ink-secondary">{n.room}</span> <span className="text-ink-tertiary">·</span> <span className={`font-semibold ${n.tone}`}>{n.state}</span></div>
            <span className="absolute bottom-3.5 right-0 text-[11px] text-ink-tertiary">{n.time}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const TaskDetail = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Task details" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-6 pb-4 pt-1 no-scrollbar">
        {/* task */}
        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[11px] font-semibold text-ink-secondary">Task</div>
          <div className="mt-2 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-semibold leading-snug text-ink">{active.title}</div>
              <p className="mt-1.5 text-[13px] leading-snug text-ink-secondary">{active.note}</p>
            </div>
            {active.status !== "completed" && <SlaRing left={active.left} total={active.total} size={62} />}
          </div>
          <div className="mt-2 divide-y divide-line border-t border-line">
            <Row icon={Clock} label="Resolution SLA">
              {active.status === "completed" ? "Completed" : <span className={slaTone(active.left, active.total).text}>{active.left < 0 ? `Overdue by ${fmtMins(-active.left)}` : `${fmtMins(active.left)} left of ${active.total}m`}</span>}
            </Row>
            <Row icon={Layers} label="Status & source">
              {active.status === "completed" ? "Completed" : active.status === "progress" ? "In progress" : "Pending"} · {active.source} · {active.created}
            </Row>
          </div>
        </div>

        {/* room */}
        <div className={`rounded-2xl bg-white p-4 ${CARD_SHADOW}`}>
          <div className="text-[11px] font-semibold text-ink-secondary">Room</div>
          <div className="mt-2 divide-y divide-line">
            <Row icon={BedDouble} label="Room">{active.room}{active.roomType !== "—" && ` · ${active.roomType}`}{active.floor > 0 && ` · Floor ${active.floor}`}</Row>
            <Row icon={User} label="Guest">{active.guest}<div className="mt-0.5 text-[12px] font-normal text-ink-secondary">{active.stay}</div></Row>
          </div>
          {active.prefs.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 border-t border-line pt-3">
              {active.prefs.map((p) => <span key={p} className="rounded-full bg-[#F1F1F3] px-2.5 py-1 text-[12px] text-ink-secondary">{p}</span>)}
            </div>
          )}
        </div>

        {active.staffNote && (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div>
              <div className="text-[12px] font-semibold text-amber-800">Staff notes</div>
              <p className="mt-1 text-[13px] leading-snug text-amber-800/90">{active.staffNote}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-3 px-6 pb-6 pt-3">
        {active.status === "pending" ? (
          <>
            <GhostButton className="flex-1" onClick={() => reject(active.id)}>Void</GhostButton>
            <PrimaryButton className="flex-[1.3]" onClick={() => accept(active.id)}>Accept</PrimaryButton>
          </>
        ) : (
          <>
            <GhostButton className="flex-1" disabled={active.status === "completed"} onClick={() => nav.push({ name: "needHelp", id: active.id })}>Need help</GhostButton>
            <PrimaryButton
              className="flex-[1.3]"
              disabled={active.status === "completed"}
              onClick={() => { setStatus(active.id, "completed", "Done just now"); flash(`${active.room} marked complete`); nav.back(); }}
            >
              {active.status === "completed" ? "Completed" : "Mark complete"} <Check className="h-4 w-4" />
            </PrimaryButton>
          </>
        )}
      </div>
    </div>
  );

  const NeedHelp = (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Need help?" onBack={nav.back} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-4 pt-2 no-scrollbar">
        <div className={`flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand-tint/50 p-4`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white"><Building2 className="h-5 w-5" /></span>
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-ink">Escalate this task</div>
            <div className="text-[12px] text-ink-secondary">{active.title} · {active.room}</div>
            <div className="mt-0.5 text-[12px] text-ink-secondary">Your supervisor will be notified right away.</div>
          </div>
        </div>
        <Label>Add details (optional)</Label>
        <TextField rows={4} value={helpNote} onChange={setHelpNote} placeholder="Tell your supervisor what's blocking you…" />
      </div>
      <div className="shrink-0 px-6 pb-6">
        <PrimaryButton className="w-full" onClick={() => { flash("Escalated to your supervisor"); setHelpNote(""); nav.back(); }}><Send className="h-4 w-4" /> Escalate</PrimaryButton>
      </div>
    </div>
  );

  const Create = (
    <div className="flex h-full flex-col">
      <TextHeader title="Create Manual Task" onBack={nav.back} />
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4 pt-4 no-scrollbar">
        <div className="space-y-3">
          <SelectField value={dept} onChange={(v) => { setDept(v); setService(""); }} placeholder="Select department" options={DEPARTMENTS.map((d) => d.name)} />
          <SelectField value={service} onChange={setService} placeholder="Select service" options={services} disabled={!dept} />
        </div>

        <Label>How severe is it?</Label>
        <Segmented items={SEVERITIES} active={sev as (typeof SEVERITIES)[number]} onChange={(v) => setSev(v)} colors={SEV_COLOR} />
        <p className="mt-2 px-1 text-[12px] text-ink-tertiary">Resolution SLA: <span className="font-semibold text-ink-secondary">{SEV_SLA[sev]} min</span></p>

        <Label>Room (optional)</Label>
        <TextField value={room} onChange={setRoom} placeholder="e.g. 501" />

        <Label>Details</Label>
        <TextField rows={5} value={details} onChange={setDetails} placeholder="Enter more details" />
      </div>
      <div className="shrink-0 px-6 pb-6 pt-2">
        <PrimaryButton className="w-full" disabled={!dept || !service} onClick={createTask}>Create Task</PrimaryButton>
      </div>
    </div>
  );

  const VIEWS: Record<Screen["name"], JSX.Element> = { home: Home, notifications: Notifications, taskDetail: TaskDetail, needHelp: NeedHelp, create: Create };

  return (
    <div className="flex flex-col items-center gap-4">
      <PhoneFrame>
        {VIEWS[cur.name]}

        {incoming && (
          <div className="absolute inset-0 z-40">
            <button className="absolute inset-0 bg-black/45" onClick={() => setIncoming(false)} aria-label="Dismiss" />
            <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white p-6 shadow-2xl">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#DADADA]" />
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint text-brand"><Bell className="h-5 w-5" /></span>
                <div>
                  <div className="text-[15px] font-semibold text-ink">New task assigned</div>
                  <div className="text-[12px] text-ink-secondary">by your supervisor</div>
                </div>
              </div>
              <div className="mt-4">
                <LsCard t={{ id: "x", title: "Duvet & pillow set replacement", room: "Room 907", note: "Replace the duvet and add a hypoallergenic pillow set.", status: "pending", left: 20, total: 30, guest: "", roomType: "", floor: 0, stay: "", prefs: [], source: "", created: "" }} />
              </div>
              <PrimaryButton
                className="mt-4 w-full"
                onClick={() => {
                  const id = "n" + Date.now();
                  setTasks((ts) => [{ id, title: "Duvet & pillow set replacement", room: "Room 907", note: "Replace the duvet and add a hypoallergenic pillow set.", status: "progress", left: 20, total: 30, guest: "Marco Bianchi", roomType: "Deluxe King", floor: 9, stay: "Arriving today · 3 nights", prefs: ["Hypoallergenic bedding"], source: "Supervisor", created: "Just now" }, ...ts]);
                  setIncoming(false);
                  openTask(id);
                }}
              >
                Accept
              </PrimaryButton>
            </div>
          </div>
        )}
        {toast}
      </PhoneFrame>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button className="rounded-lg bg-brand px-3 py-1.5 text-[12px] font-semibold text-white" onClick={() => setIncoming(true)}>Simulate new task assignment</button>
        <button
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink-secondary"
          onClick={() => { nav.reset(); setIncoming(false); setTasks(INITIAL); setAvailable(true); }}
        >
          Reset
        </button>
      </div>
      <p className="text-center text-[12px] text-ink-tertiary">
        Current screen: <span className="font-medium text-ink-secondary">{cur.name}</span> · tap a task, the bell or the orange “+” button.
      </p>
    </div>
  );
}
