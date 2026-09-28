import { createContext, useContext, useState, type ReactNode } from "react";

/** the fixed "today" this prototype's demo data is built around */
export const APP_TODAY = new Date(2026, 8, 23);

const KEY = "alfon.selectedDate";

type Ctx = { date: Date; setDate: (d: Date) => void };
const DateCtx = createContext<Ctx>({ date: APP_TODAY, setDate: () => {} });

/** which day's data the top bar's date picker is showing — persists across screens and reloads */
export function DateProvider({ children }: { children: ReactNode }) {
  const [date, setDateState] = useState<Date>(() => {
    try {
      const v = localStorage.getItem(KEY);
      const d = v ? new Date(v) : null;
      return d && !isNaN(d.getTime()) ? d : APP_TODAY;
    } catch {
      return APP_TODAY;
    }
  });

  const setDate = (d: Date) => {
    setDateState(d);
    try {
      localStorage.setItem(KEY, d.toISOString());
    } catch {
      /* storage unavailable */
    }
  };

  return <DateCtx.Provider value={{ date, setDate }}>{children}</DateCtx.Provider>;
}

export function useSelectedDate() {
  return useContext(DateCtx);
}
