import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Hierarchy: Line Staff → Supervisor → Mid Manager (department head) → High Management / GM.
 * A Mid Manager is scoped to the department(s) they are explicitly assigned to;
 * hotel-wide oversight belongs to the General Manager.
 */
export type PersonaKey = "gm" | "mid" | "mid2";

export type Persona = {
  key: PersonaKey;
  name: string;
  initials: string;
  role: string;
  blurb: string;
  home: string;
  /** departments this person is assigned to (canonical task-department names); empty = whole hotel */
  depts: string[];
};

export const PERSONAS: Record<PersonaKey, Persona> = {
  gm: {
    key: "gm",
    name: "Sophia Carter",
    initials: "SC",
    role: "General Manager",
    blurb: "Hotel-wide — setup, teams, access and reports",
    home: "/home",
    depts: [],
  },
  mid: {
    key: "mid",
    name: "Daniel Reyes",
    initials: "DR",
    role: "Housekeeping Manager",
    blurb: "Mid Manager · one department",
    home: "/department",
    depts: ["Housekeeping"],
  },
  mid2: {
    key: "mid2",
    name: "Omar Haddad",
    initials: "OH",
    role: "Engineering & Front Desk Manager",
    blurb: "Mid Manager · two assigned departments",
    home: "/department",
    depts: ["Engineering", "Front Desk"],
  },
};

/** Routes a Mid Manager does not have (setup, configuration, hotel-wide directories, other personas). */
export const MID_BLOCKED = ["/onboarding", "/departments", "/settings", "/pre-arrival", "/team/roles", "/home"];

/** Normalise the different spellings of a department used across the mock data. */
export const canonDept = (d: string) => (d === "F&B" || d === "Food and Beverage" ? "Food & Beverage" : d);

const KEY = "alfon.persona";

type Ctx = {
  persona: PersonaKey;
  setPersona: (p: PersonaKey) => void;
  me: Persona;
  /** true for any Mid Manager persona */
  manager: boolean;
  /** departments this person may see right now (respects the scope picker) — undefined-length means hotel-wide */
  scopeDepts: string[];
  /** "all" or one of me.depts */
  scope: string;
  setScope: (s: string) => void;
  /** is a department inside the current scope (always true for GM) */
  inScope: (dept: string) => boolean;
};

const PersonaCtx = createContext<Ctx>({
  persona: "gm",
  setPersona: () => {},
  me: PERSONAS.gm,
  manager: false,
  scopeDepts: [],
  scope: "all",
  setScope: () => {},
  inScope: () => true,
});

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaKey>(() => {
    try {
      const v = localStorage.getItem(KEY);
      return v === "mid" || v === "mid2" ? v : "gm";
    } catch {
      return "gm";
    }
  });
  const [scope, setScope] = useState("all");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, persona);
    } catch {
      /* storage unavailable */
    }
  }, [persona]);

  const value = useMemo<Ctx>(() => {
    const me = PERSONAS[persona];
    const manager = persona !== "gm";
    const scopeDepts = !manager ? [] : scope !== "all" && me.depts.includes(scope) ? [scope] : me.depts;
    return {
      persona,
      setPersona: (p) => {
        setScope("all");
        setPersonaState(p);
      },
      me,
      manager,
      scopeDepts,
      scope,
      setScope,
      inScope: (dept) => !manager || scopeDepts.includes(canonDept(dept)),
    };
  }, [persona, scope]);

  return <PersonaCtx.Provider value={value}>{children}</PersonaCtx.Provider>;
}

export const usePersona = () => useContext(PersonaCtx);
