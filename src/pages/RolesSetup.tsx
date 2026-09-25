import { Topbar } from "../components/Topbar";
import { SetupTabs } from "../components/SetupTabs";
import { Page } from "../components/ui";
import RolesPermissions from "./RolesPermissions";

/** Setup step: create roles and configure what each role can access. */
export default function RolesSetup() {
  return (
    <>
      <Topbar title="Roles & Permissions" backTo="/onboarding" />
      <Page>
        <SetupTabs />
        <p className="mb-6 text-[13px] text-ink-secondary">Create roles and choose what each one can access and do.</p>
        <RolesPermissions embedded />
      </Page>
    </>
  );
}
