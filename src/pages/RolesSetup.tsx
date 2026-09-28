import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page, Button } from "../components/ui";
import RolesPermissions from "./RolesPermissions";
import { useGoNextStep } from "../data/onboarding";

/** Setup step: create roles and configure what each role can access. */
export default function RolesSetup() {
  const goNext = useGoNextStep(6);
  return (
    <>
      <Topbar title="Roles & Permissions" backTo="/onboarding" />
      <Page>
        <SetupTabs />
        <RolesPermissions embedded />
        <div className="mt-6">
          <Button onClick={goNext}>Continue →</Button>
        </div>
      </Page>
    </>
  );
}
