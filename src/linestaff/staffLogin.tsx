import { useState } from "react";
import { PhoneFrame, useToast } from "./mobile";
import { MobileSignIn } from "../pages/Login";

/** phone sign-in: password or OTP, matching the mobile reference */
export function StaffLoginPrototype() {
  const { flash, node } = useToast();
  const [done, setDone] = useState(0);

  return (
    <PhoneFrame white>
      <MobileSignIn key={done} onDone={() => { flash("Signed in"); setDone((n) => n + 1); }} />
      {node}
    </PhoneFrame>
  );
}
