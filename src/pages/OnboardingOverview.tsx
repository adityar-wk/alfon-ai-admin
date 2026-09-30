import { Topbar } from "../components/Topbar";
import { Button } from "../components/ui";
import { OnboardingStepsGrid } from "../components/OnboardingSteps";

export default function OnboardingOverview() {
  return (
    <>
      <Topbar title="Settings" actions={<Button variant="outline">Save Draft</Button>} />
      <main className="flex-1 overflow-y-auto bg-page">
        <div className="p-6">
          <h3 className="mb-3 text-[15px] font-semibold text-ink">Setup steps</h3>
          <OnboardingStepsGrid />
        </div>
      </main>
    </>
  );
}
