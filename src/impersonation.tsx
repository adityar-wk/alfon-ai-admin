import { createContext, useContext, useState, type ReactNode } from "react";

const KEY = "alfon.steppedIntoHotel";

type Ctx = { hotel: string | null; stepInto: (hotel: string) => void; leave: () => void };
const ImpersonationCtx = createContext<Ctx>({ hotel: null, stepInto: () => {}, leave: () => {} });

/**
 * Super Admin can step into a hotel's own view to help it directly (never to do hotel work).
 * ALFON records both names — the real Super Admin, and the hotel it acted in — for as long as this is set.
 */
export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [hotel, setHotel] = useState<string | null>(() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  });

  const stepInto = (h: string) => {
    setHotel(h);
    try { localStorage.setItem(KEY, h); } catch { /* storage unavailable */ }
  };
  const leave = () => {
    setHotel(null);
    try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
  };

  return <ImpersonationCtx.Provider value={{ hotel, stepInto, leave }}>{children}</ImpersonationCtx.Provider>;
}

export const useImpersonation = () => useContext(ImpersonationCtx);
