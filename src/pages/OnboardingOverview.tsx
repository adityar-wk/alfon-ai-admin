import { Link } from "react-router-dom";
import { Building2, Plug, FileText, Users, LayoutGrid, Timer, QrCode, Rocket, Lock, Check, ArrowRight } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Page, Card, Button } from "../components/ui";

type StepStatus = "done" | "current" | "todo";

const STEPS: {
  id: number;
  title: string;
  desc: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  status: StepStatus;
  progress: number;
  time: string;
}[] = [
  { id: 1, title: "Hotel Property", desc: "Hotel details, address, time zone and preferences.", to: "/onboarding/property", icon: Building2, status: "done", progress: 100, time: "5 min" },
  { id: 2, title: "WhatsApp & PMS", desc: "Connect WhatsApp Business and your PMS.", to: "/onboarding/whatsapp-pms", icon: Plug, status: "current", progress: 50, time: "10 min" },
  { id: 3, title: "Knowledge Base", desc: "Upload documents and reference links for the AI.", to: "/onboarding/knowledge-base", icon: FileText, status: "todo", progress: 0, time: "10 min" },
  { id: 4, title: "Departments", desc: "Create departments, members and services.", to: "/onboarding/departments", icon: LayoutGrid, status: "todo", progress: 0, time: "15 min" },
  { id: 5, title: "Team Members", desc: "Import your staff. Roles are assigned later.", to: "/onboarding/staff", icon: Users, status: "todo", progress: 0, time: "8 min" },
  { id: 6, title: "SLA & Escalation", desc: "Response times, service SLAs and escalation paths.", to: "/onboarding/sla", icon: Timer, status: "todo", progress: 0, time: "10 min" },
  { id: 7, title: "Rooms & QR", desc: "Create rooms and generate guest QR codes.", to: "/onboarding/rooms-qr", icon: QrCode, status: "todo", progress: 0, time: "6 min" },
];

const STATS = [
  { label: "Departments", value: "3", of: "12" },
  { label: "Staff imported", value: "24", of: "80" },
  { label: "Knowledge docs", value: "4", of: "25" },
  { label: "Rooms mapped", value: "120", of: "245" },
];

const done = STEPS.filter((s) => s.status === "done").length;
const pct = Math.round((STEPS.reduce((n, s) => n + s.progress, 0) / (STEPS.length * 100)) * 100);
const next = STEPS.find((s) => s.status === "current") ?? STEPS.find((s) => s.status === "todo")!;

function Ring({ value }: { value: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <svg viewBox="0 0 116 116" className="h-full w-full -rotate-90">
        <circle cx="58" cy="58" r={r} fill="none" strokeWidth="9" className="stroke-subtle" />
        <circle
          cx="58" cy="58" r={r} fill="none" strokeWidth="9" strokeLinecap="round"
          className="stroke-brand"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-bold leading-none text-ink">{value}%</span>
        <span className="mt-1 text-[11px] text-ink-tertiary">complete</span>
      </div>
    </div>
  );
}

function StepCard({ s }: { s: (typeof STEPS)[number] }) {
  const Icon = s.icon;
  const current = s.status === "current";
  return (
    <Link
      to={s.to}
      className={`group flex flex-col rounded-card border bg-white p-5 transition-colors hover:border-brand/50 ${
        current ? "border-brand" : "border-line"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            s.status === "done" ? "bg-emerald-50 text-emerald-600" : current ? "bg-brand-tint text-brand" : "bg-subtle text-ink-secondary"
          }`}
        >
          {s.status === "done" ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Step {s.id}</span>
      </div>

      <h3 className="mt-4 text-[15px] font-semibold text-ink">{s.title}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-snug text-ink-secondary">{s.desc}</p>

      <div className="mt-5">
        <div className="h-1 overflow-hidden rounded-full bg-subtle">
          <div
            className={`h-full rounded-full ${s.status === "done" ? "bg-emerald-500" : "bg-brand"}`}
            style={{ width: `${s.progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px]">
          <span className={s.status === "done" ? "font-medium text-emerald-600" : current ? "font-medium text-brand" : "text-ink-tertiary"}>
            {s.status === "done" ? "Completed" : current ? "In progress" : `~${s.time}`}
          </span>
          <span className="flex items-center gap-1 font-medium text-ink-secondary group-hover:text-brand">
            {s.status === "done" ? "Review" : current ? "Continue" : "Start"} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function OnboardingOverview() {
  return (
    <>
      <Topbar title="Settings" actions={<Button variant="outline">Save Draft</Button>} />
      <Page>
        <Card className="flex flex-wrap items-center gap-x-8 gap-y-6 p-6">
          <Ring value={pct} />
          <div className="min-w-[260px] flex-1">
            <h2 className="text-[20px] font-semibold leading-tight text-ink">Set up your hotel operations workspace</h2>
            <p className="mt-1.5 text-[13px] text-ink-secondary">
              {done} of {STEPS.length} steps completed. Pick up where you left off — your progress is saved automatically.
            </p>
            <Link
              to={next.to}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-brand-hover"
            >
              Continue: {next.title} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-6 border-l border-line pl-8 max-xl:hidden">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold leading-none text-ink">{s.value}</span>
                  <span className="text-[12px] text-ink-tertiary">/ {s.of}</span>
                </div>
                <div className="mt-1.5 text-[12px] text-ink-secondary">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mb-3 mt-7 flex items-baseline justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Setup steps</h3>
          <span className="text-[12px] text-ink-tertiary">About 1 hour in total</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s) => (
            <StepCard key={s.id} s={s} />
          ))}

          <div className="flex flex-col rounded-card border border-dashed border-line bg-subtle/40 p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ink-tertiary">
                <Rocket className="h-5 w-5" />
              </span>
              <Lock className="h-4 w-4 text-ink-tertiary" />
            </div>
            <h3 className="mt-4 text-[15px] font-semibold text-ink">Review &amp; Launch</h3>
            <p className="mt-1 flex-1 text-[13px] leading-snug text-ink-secondary">
              Go live once all setup steps are complete.
            </p>
            <div className="mt-5 text-[12px] text-ink-tertiary">{STEPS.length - done} steps remaining</div>
          </div>
        </div>
      </Page>
    </>
  );
}
