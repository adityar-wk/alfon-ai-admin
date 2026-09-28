/** Every hotel Super Admin has added to ALFON. One row here is one hotel's own private space. */

export type ConnStatus = "Connected" | "Pending" | "Disconnected";
export type HotelStatus = "Active" | "Inactive" | "New";

export type Hotel = {
  id: number;
  name: string;
  location: string;
  region: string;
  propertyType: string;
  rooms: number;
  currency: string;
  timeZone: string;
  status: HotelStatus;
  whatsapp: ConnStatus;
  pms: ConnStatus;
  pmsProvider?: string;
  departments: number;
  staff: number;
  /** null once a hotel has no data yet (just onboarded, or disconnected) */
  healthScore: number | null;
  healthNote: string;
  lastSync: string;
  onboarded: string;
  /** AI usage this period — 0 for a hotel with no live traffic yet */
  aiQueries: number;
  aiResolvedPct: number;
  avgConfidence: number;
  aiCostUsd: number;
};

export const HOTELS: Hotel[] = [
  { id: 1, name: "The Shoreline Hotel", location: "Dubai, UAE", region: "Middle East", propertyType: "Luxury Hotel", rooms: 245, currency: "AED", timeZone: "Asia/Dubai", status: "Active", whatsapp: "Connected", pms: "Connected", pmsProvider: "Opera (Oracle)", departments: 8, staff: 32, healthScore: 88, healthNote: "Steady across every pillar this week.", lastSync: "Today, 10:45 AM", onboarded: "Jan 2026", aiQueries: 3120, aiResolvedPct: 92, avgConfidence: 91, aiCostUsd: 184 },
  { id: 2, name: "Bayview Hotel", location: "Abu Dhabi, UAE", region: "Middle East", propertyType: "Business Hotel", rooms: 180, currency: "AED", timeZone: "Asia/Dubai", status: "Active", whatsapp: "Connected", pms: "Connected", pmsProvider: "Cloudbeds", departments: 6, staff: 24, healthScore: 76, healthNote: "Response times slipped in Room Service.", lastSync: "Today, 9:10 AM", onboarded: "Feb 2026", aiQueries: 2140, aiResolvedPct: 85, avgConfidence: 84, aiCostUsd: 126 },
  { id: 3, name: "City Suites", location: "Riyadh, KSA", region: "Middle East", propertyType: "Extended Stay", rooms: 320, currency: "SAR", timeZone: "Asia/Riyadh", status: "Active", whatsapp: "Connected", pms: "Pending", pmsProvider: "Mews", departments: 7, staff: 28, healthScore: 84, healthNote: "PMS sync still pending — housekeeping unaffected.", lastSync: "3 days ago", onboarded: "Mar 2026", aiQueries: 3860, aiResolvedPct: 89, avgConfidence: 88, aiCostUsd: 228 },
  { id: 4, name: "Palm Retreat", location: "Doha, Qatar", region: "Middle East", propertyType: "Resort", rooms: 210, currency: "QAR", timeZone: "Asia/Qatar", status: "Active", whatsapp: "Connected", pms: "Connected", pmsProvider: "Opera (Oracle)", departments: 6, staff: 18, healthScore: 72, healthNote: "SLA breaches went up in Engineering.", lastSync: "Today, 6:20 AM", onboarded: "Mar 2026", aiQueries: 2380, aiResolvedPct: 81, avgConfidence: 80, aiCostUsd: 141 },
  { id: 5, name: "Desert Pearl", location: "Muscat, Oman", region: "Middle East", propertyType: "Boutique Hotel", rooms: 150, currency: "OMR", timeZone: "Asia/Muscat", status: "Inactive", whatsapp: "Disconnected", pms: "Disconnected", departments: 4, staff: 12, healthScore: null, healthNote: "Deactivated — WhatsApp and PMS disconnected.", lastSync: "18 days ago", onboarded: "Nov 2025", aiQueries: 0, aiResolvedPct: 0, avgConfidence: 0, aiCostUsd: 0 },
  { id: 6, name: "Lagoon Hotel", location: "Manama, Bahrain", region: "Middle East", propertyType: "Resort", rooms: 190, currency: "BHD", timeZone: "Asia/Bahrain", status: "Active", whatsapp: "Connected", pms: "Connected", pmsProvider: "Guestline", departments: 6, staff: 20, healthScore: 80, healthNote: "Guest Pulse trending up this month.", lastSync: "Today, 8:05 AM", onboarded: "Apr 2026", aiQueries: 2260, aiResolvedPct: 87, avgConfidence: 86, aiCostUsd: 134 },
  { id: 7, name: "The Grand Vista", location: "Kuwait City, Kuwait", region: "Middle East", propertyType: "Luxury Hotel", rooms: 280, currency: "KWD", timeZone: "Asia/Kuwait", status: "New", whatsapp: "Connected", pms: "Pending", pmsProvider: "Protel", departments: 8, staff: 26, healthScore: 68, healthNote: "Still in the Training Lab — not live yet.", lastSync: "Not yet synced", onboarded: "This week", aiQueries: 512, aiResolvedPct: 91, avgConfidence: 89, aiCostUsd: 30 },
  { id: 8, name: "Sands Hotel", location: "Jeddah, KSA", region: "Middle East", propertyType: "Business Hotel", rooms: 140, currency: "SAR", timeZone: "Asia/Riyadh", status: "Active", whatsapp: "Connected", pms: "Connected", pmsProvider: "Opera (Oracle)", departments: 6, staff: 16, healthScore: 90, healthNote: "Best-performing hotel in the network.", lastSync: "Today, 11:02 AM", onboarded: "Dec 2025", aiQueries: 1780, aiResolvedPct: 95, avgConfidence: 93, aiCostUsd: 105 },
  { id: 9, name: "Marina Heights", location: "Manila, Philippines", region: "Asia Pacific", propertyType: "Business Hotel", rooms: 260, currency: "PHP", timeZone: "Asia/Manila", status: "Active", whatsapp: "Connected", pms: "Connected", pmsProvider: "Cloudbeds", departments: 7, staff: 30, healthScore: 79, healthNote: "Housekeeping turnover slower than usual.", lastSync: "Today, 7:40 AM", onboarded: "May 2026", aiQueries: 3210, aiResolvedPct: 86, avgConfidence: 85, aiCostUsd: 190 },
  { id: 10, name: "Coral Bay Resort", location: "Bali, Indonesia", region: "Asia Pacific", propertyType: "Resort", rooms: 175, currency: "IDR", timeZone: "Asia/Makassar", status: "Active", whatsapp: "Connected", pms: "Connected", pmsProvider: "Mews", departments: 7, staff: 22, healthScore: 85, healthNote: "Recovery rate improved after last month's fix.", lastSync: "Today, 5:55 AM", onboarded: "Jun 2026", aiQueries: 2050, aiResolvedPct: 90, avgConfidence: 89, aiCostUsd: 121 },
  { id: 11, name: "Alpine Lodge", location: "Zurich, Switzerland", region: "Europe", propertyType: "Boutique Hotel", rooms: 90, currency: "CHF", timeZone: "Europe/Zurich", status: "Active", whatsapp: "Connected", pms: "Connected", pmsProvider: "Opera (Oracle)", departments: 5, staff: 14, healthScore: 91, healthNote: "Consistently the quietest inbox in the network.", lastSync: "Today, 4:30 AM", onboarded: "Jul 2026", aiQueries: 980, aiResolvedPct: 96, avgConfidence: 95, aiCostUsd: 58 },
  { id: 12, name: "Harborview Inn", location: "Liverpool, UK", region: "Europe", propertyType: "Business Hotel", rooms: 130, currency: "GBP", timeZone: "Europe/London", status: "New", whatsapp: "Pending", pms: "Pending", departments: 5, staff: 0, healthScore: null, healthNote: "Awaiting WhatsApp and PMS connection.", lastSync: "Not yet synced", onboarded: "This week", aiQueries: 0, aiResolvedPct: 0, avgConfidence: 0, aiCostUsd: 0 },
];

export const REGIONS = Array.from(new Set(HOTELS.map((h) => h.region)));

export const hotelStats = () => ({
  total: HOTELS.length,
  active: HOTELS.filter((h) => h.status === "Active").length,
  inactive: HOTELS.filter((h) => h.status === "Inactive").length,
  connections: HOTELS.reduce((n, h) => n + (h.whatsapp === "Connected" ? 1 : 0) + (h.pms === "Connected" ? 1 : 0), 0),
});

/** network-wide AI usage, weighted by how many queries each hotel actually had */
export const aiNetworkStats = () => {
  const live = HOTELS.filter((h) => h.aiQueries > 0);
  const queries = live.reduce((n, h) => n + h.aiQueries, 0);
  const cost = live.reduce((n, h) => n + h.aiCostUsd, 0);
  const weighted = (pick: (h: Hotel) => number) => (queries ? live.reduce((n, h) => n + pick(h) * h.aiQueries, 0) / queries : 0);
  return {
    queries,
    cost,
    resolvedPct: Math.round(weighted((h) => h.aiResolvedPct)),
    confidence: Math.round(weighted((h) => h.avgConfidence)),
    hotelsLive: live.length,
  };
};
