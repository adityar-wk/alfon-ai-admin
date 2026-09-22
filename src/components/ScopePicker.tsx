import { Building2 } from "lucide-react";
import { usePersona } from "../persona";

/** Only shown to a Mid Manager who has been assigned more than one department. */
export function ScopePicker() {
  const { manager, me, scope, setScope } = usePersona();
  if (!manager || me.depts.length < 2) return null;
  return (
    <label className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-[13px] text-ink-secondary">
      <Building2 className="h-4 w-4 text-ink-tertiary" />
      <select
        value={scope}
        onChange={(e) => setScope(e.target.value)}
        aria-label="Department scope"
        className="bg-transparent font-medium text-ink outline-none"
      >
        <option value="all">All my departments</option>
        {me.depts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </label>
  );
}
