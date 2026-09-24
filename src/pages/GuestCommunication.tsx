import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { GuestChat, type ChatMsg, type ChatMode } from "../components/GuestChat";
import { Card } from "../components/ui";
import { ScopePicker } from "../components/ScopePicker";
import { TASKS } from "../data/tasks";
import { usePersona } from "../persona";

type Convo = { guest: string; room: string; last: string; open: number; complaint: boolean };

const seedThread = (guest: string, title: string, complaint: boolean, dept: string): ChatMsg[] => [
  { from: "guest", text: `Hi, I need help with this: ${title.toLowerCase()}.`, time: "Earlier" },
  { from: "ai", text: `Sorry about that${complaint ? "" : " — happy to help"}. I've passed it to ${dept} and they're on it.`, time: "Earlier" },
];

export default function GuestCommunication() {
  const { scopeDepts, inScope } = usePersona();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [chats, setChats] = useState<Record<string, ChatMsg[]>>({});
  const [modes, setModes] = useState<Record<string, ChatMode>>({});

  const convos = useMemo<Convo[]>(() => {
    const map = new Map<string, Convo>();
    for (const t of TASKS.filter((x) => inScope(x.dept) && x.source === "Guest Chat")) {
      const c = map.get(t.guest) ?? { guest: t.guest, room: t.room, last: t.title, open: 0, complaint: false };
      c.room = t.room;
      c.last = t.title;
      c.complaint = c.complaint || t.tag === "Complaint";
      if (t.status !== "Completed" && t.status !== "Unable to Complete") c.open += 1;
      map.set(t.guest, c);
    }
    const q = query.trim().toLowerCase();
    return [...map.values()]
      .filter((c) => !q || `${c.guest} ${c.room}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b.complaint) - Number(a.complaint) || b.open - a.open);
  }, [query, scopeDepts]);

  const active = convos.find((c) => c.guest === selected) ?? convos[0];
  const task = active ? TASKS.find((t) => t.guest === active.guest && t.source === "Guest Chat") : undefined;
  const thread = active ? chats[active.guest] ?? seedThread(active.guest, active.last, active.complaint, task?.dept ?? "the team") : [];
  const mode = active ? modes[active.guest] ?? "auto" : "auto";

  return (
    <>
      <Topbar title="Guest Communication" subtitle={scopeDepts.join(" · ")} showSearch={false} actions={<ScopePicker />} />
      <div className="flex min-h-0 flex-1 gap-4 bg-subtle/40 p-6">
        <Card className="flex w-[340px] shrink-0 flex-col overflow-hidden">
          <div className="border-b border-line p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guest or room"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-[13px] outline-none placeholder:text-ink-tertiary focus:border-brand"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 divide-y divide-line/70 overflow-y-auto">
            {convos.map((c) => (
              <button
                key={c.guest}
                onClick={() => setSelected(c.guest)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-subtle/60 ${active?.guest === c.guest ? "bg-brand-tint/40" : ""}`}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[12px] font-semibold text-brand">
                  {c.guest.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <span className="truncate">{c.guest}</span>
                    {c.complaint && <span className="text-[11px] font-medium text-red-600">Complaint</span>}
                  </span>
                  <span className="block text-[12px] text-ink-tertiary">Room {c.room}</span>
                  <span className="block truncate text-[12px] text-ink-secondary">{c.last}</span>
                </span>
                {c.open > 0 && <span className="mt-1 text-[11px] font-semibold text-brand">{c.open} open</span>}
              </button>
            ))}
            {!convos.length && <p className="px-4 py-8 text-center text-[13px] text-ink-tertiary">No conversations.</p>}
          </div>
        </Card>

        <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {active ? (
            <>
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <div>
                  <div className="text-[15px] font-semibold text-ink">{active.guest}</div>
                  <div className="text-[12px] text-ink-tertiary">Room {active.room}</div>
                </div>
                <Link to="/guests" className="text-[12px] font-medium text-brand">Guest management</Link>
              </div>
              <GuestChat
                className="min-h-0 flex-1"
                name={active.guest}
                msgs={thread}
                mode={mode}
                setMode={(m) => setModes((x) => ({ ...x, [active.guest]: m }))}
                onSend={(text) => setChats((c) => ({ ...c, [active.guest]: [...thread, { from: "staff", text, time: "Now" }] }))}
              />
            </>
          ) : (
            <p className="m-auto text-[13px] text-ink-tertiary">Select a conversation.</p>
          )}
        </Card>
      </div>
    </>
  );
}
