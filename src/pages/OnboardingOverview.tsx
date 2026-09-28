import { Topbar } from "../components/Topbar";
import { Page, Button } from "../components/ui";
import { OnboardingStepsGrid } from "../components/OnboardingSteps";

export default function OnboardingOverview() {
  return (
    <>
      <Topbar title="Settings" actions={<Button variant="outline">Save Draft</Button>} />
      <Page>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-[15px] font-semibold text-ink">Setup steps</h3>
          <span className="text-[12px] text-ink-tertiary">About 1 hour in total</span>
        </div>
        <OnboardingStepsGrid />
      </Page>
    </>
  );
}
