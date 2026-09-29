import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Building2, Plug, FileText, Users, ShieldCheck, LayoutGrid, Timer, QrCode } from "lucide-react";

export type OnboardingStep = {
  id: number;
  title: string;
  desc: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  time: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 1, title: "Hotel Property", desc: "Hotel details, address, time zone and preferences.", to: "/onboarding/property", icon: Building2, time: "5 min" },
  { id: 2, title: "WhatsApp & PMS", desc: "Connect WhatsApp Business and your PMS.", to: "/onboarding/whatsapp-pms", icon: Plug, time: "10 min" },
  { id: 3, title: "Knowledge Base", desc: "Upload documents and reference links for the AI.", to: "/onboarding/knowledge-base", icon: FileText, time: "10 min" },
  { id: 4, title: "Users", desc: "Import your staff with their name, email and phone number.", to: "/onboarding/staff", icon: Users, time: "8 min" },
  { id: 5, title: "Departments", desc: "Review your departments and the services they cover.", to: "/onboarding/departments", icon: LayoutGrid, time: "15 min" },
  { id: 6, title: "Roles & Permissions", desc: "Create roles and set what each one can access.", to: "/onboarding/roles", icon: ShieldCheck, time: "10 min" },
  { id: 7, title: "SLA & Escalation", desc: "Response times, service SLAs and escalation paths.", to: "/onboarding/sla", icon: Timer, time: "10 min" },
  { id: 8, title: "Rooms & QR", desc: "Create rooms and generate guest QR codes.", to: "/onboarding/rooms-qr", icon: QrCode, time: "6 min" },
  { id: 9, title: "Notifications", desc: "Choose which alerts reach the notification bell.", to: "/onboarding/notifications", icon: Bell, time: "2 min" },
];

const KEY = "alfon.onboardingProgress";

function readCompleted(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage unavailable */
  }
  return [1]; // Hotel Property was completed when the hotel was first added
}

function writeCompleted(ids: number[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Shared, persisted onboarding progress — every screen that reads this sees the same "where they left off" state.
 * `markDone` writes to storage synchronously (inside the state updater) rather than via an effect, because a
 * "Continue" click immediately navigates away and unmounts this hook's owner before an effect would get to run.
 */
export function useOnboardingProgress() {
  const [completed, setCompleted] = useState<number[]>(readCompleted);

  const isDone = (id: number) => completed.includes(id);
  const markDone = (id: number) =>
    setCompleted((c) => {
      if (c.includes(id)) return c;
      const next = [...c, id];
      writeCompleted(next);
      return next;
    });
  const currentStep = ONBOARDING_STEPS.find((s) => !completed.includes(s.id)) ?? ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
  const allDone = completed.length >= ONBOARDING_STEPS.length;
  const percent = Math.round((completed.length / ONBOARDING_STEPS.length) * 100);

  return { steps: ONBOARDING_STEPS, completed, isDone, markDone, currentStep, allDone, percent };
}

/** Step after `id`, or null once it was the last one. */
export function nextStep(id: number): OnboardingStep | null {
  const i = ONBOARDING_STEPS.findIndex((s) => s.id === id);
  return i >= 0 && i < ONBOARDING_STEPS.length - 1 ? ONBOARDING_STEPS[i + 1] : null;
}

/** Marks step `id` complete and moves on to the next step (or back to the overview once it was the last). */
export function useGoNextStep(id: number) {
  const navigate = useNavigate();
  const { markDone } = useOnboardingProgress();
  return () => {
    markDone(id);
    const next = nextStep(id);
    navigate(next ? next.to : "/onboarding");
  };
}
