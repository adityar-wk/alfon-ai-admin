import {
  BedDouble, Building2, CalendarCheck, ConciergeBell, HandPlatter, Headset, KeyRound, Monitor, PhoneCall, ShieldCheck, Shirt, UtensilsCrossed, Wrench,
} from "lucide-react";

type Icon = React.ComponentType<{ className?: string }>;

const ICONS: Record<string, Icon> = {
  "front desk": KeyRound,
  "guest services": Headset,
  concierge: ConciergeBell,
  "food and beverage": UtensilsCrossed,
  housekeeping: BedDouble,
  laundry: Shirt,
  engineering: Wrench,
  "room service": HandPlatter,
  security: ShieldCheck,
  it: Monitor,
  operator: PhoneCall,
  reservations: CalendarCheck,
};

/** icon for a department (matches "Food & Beverage" and "Food and Beverage" alike) */
export const deptIcon = (name: string): Icon => ICONS[name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim()] ?? Building2;
