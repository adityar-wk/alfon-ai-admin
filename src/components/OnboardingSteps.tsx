import { Link } from "react-router-dom";
import { Rocket, Lock, Check, ArrowRight } from "lucide-react";
import { useOnboardingProgress, type OnboardingStep } from "../data/onboarding";

type StepStatus = "done" | "current" | "todo";

function StepCard({ s, status }: { s: OnboardingStep; status: StepStatus }) {
  const Icon = s.icon;
  const current = status === "current";
  const progress = status === "done" ? 100 : status === "current" ? 50 : 0;
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
            status === "done" ? "bg-emerald-50 text-emerald-600" : current ? "bg-brand-tint text-brand" : "bg-subtle text-ink-secondary"
          }`}
        >
          {status === "done" ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-tertiary">Step {s.id}</span>
      </div>

      <h3 className="mt-4 text-[15px] font-semibold text-ink">{s.title}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-snug text-ink-secondary">{s.desc}</p>

      <div className="mt-5">
        <div className="h-1 overflow-hidden rounded-full bg-subtle">
          <div
            className={`h-full rounded-full ${status === "done" ? "bg-emerald-500" : "bg-brand"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[12px]">
          <span className={status === "done" ? "font-medium text-emerald-600" : current ? "font-medium text-brand" : "text-ink-tertiary"}>
            {status === "done" ? "Completed" : current ? "In progress" : `~${s.time}`}
          </span>
          <span className="flex items-center gap-1 font-medium text-ink-secondary group-hover:text-brand">
            {status === "done" ? "Review" : current ? "Continue" : "Start"} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The full setup-steps grid (every step's card + the locked Review & Launch card), reused on both the Onboarding Overview screen and the Hotel Admin home page. */
export function OnboardingStepsGrid() {
  const { steps, isDone, currentStep, completed, allDone } = useOnboardingProgress();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((s) => (
        <StepCard key={s.id} s={s} status={isDone(s.id) ? "done" : s.id === currentStep.id ? "current" : "todo"} />
      ))}

      <div className={`flex flex-col rounded-card border p-5 ${allDone ? "border-brand bg-brand-tint/20" : "border-dashed border-line bg-subtle/40"}`}>
        <div className="flex items-start justify-between">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${allDone ? "bg-brand-tint text-brand" : "bg-white text-ink-tertiary"}`}>
            <Rocket className="h-5 w-5" />
          </span>
          {!allDone && <Lock className="h-4 w-4 text-ink-tertiary" />}
        </div>
        <h3 className="mt-4 text-[15px] font-semibold text-ink">Review &amp; Launch</h3>
        <p className="mt-1 flex-1 text-[13px] leading-snug text-ink-secondary">
          Go live once all setup steps are complete.
        </p>
        <div className="mt-5 text-[12px] text-ink-tertiary">
          {allDone ? "Ready to go live" : `${steps.length - completed.length} steps remaining`}
        </div>
      </div>
    </div>
  );
}
