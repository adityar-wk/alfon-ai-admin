import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { useOnboardingProgress, type OnboardingStep } from "../data/onboarding";

type StepStatus = "done" | "current" | "todo";

function StepCard({ s, status }: { s: OnboardingStep; status: StepStatus }) {
  const Icon = s.icon;
  const current = status === "current";
  const progress = status === "done" ? 100 : status === "current" ? 50 : 0;
  return (
    <Link
      to={s.to}
      className={`group flex flex-col rounded-card border bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lift ${
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
          {status !== "todo" && (
            <span className={status === "done" ? "font-medium text-emerald-600" : "font-medium text-brand"}>
              {status === "done" ? "Completed" : "In progress"}
            </span>
          )}
          <span className={`flex items-center gap-1 font-medium text-ink-secondary group-hover:text-brand ${status === "todo" ? "ml-auto" : ""}`}>
            {status === "done" ? "Review" : current ? "Continue" : "Start"} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The setup-steps grid, reused on the Settings screen and the Hotel Admin home page. */
export function OnboardingStepsGrid() {
  const { steps, isDone, currentStep } = useOnboardingProgress();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {steps.map((s) => (
        <StepCard key={s.id} s={s} status={isDone(s.id) ? "done" : s.id === currentStep.id ? "current" : "todo"} />
      ))}
    </div>
  );
}
