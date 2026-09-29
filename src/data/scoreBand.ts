export function scoreBand(score: number) {
  if (score >= 80) return { key: "excellent", label: "Excellent", color: "#5FD3A9", text: "text-emerald-600", pill: "bg-emerald-50 text-emerald-700" };
  if (score >= 65) return { key: "good", label: "Good", color: "#F3C56B", text: "text-amber-600", pill: "bg-amber-50 text-amber-700" };
  if (score >= 50) return { key: "attention", label: "Needs attention", color: "#F5A27A", text: "text-orange-600", pill: "bg-orange-50 text-orange-700" };
  return { key: "critical", label: "Critical", color: "#F08A9B", text: "text-red-600", pill: "bg-red-50 text-red-700" };
}
