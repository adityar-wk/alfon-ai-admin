export function scoreBand(score: number) {
  // hue: rotation (degrees) applied to the Orb's purple/cyan palette so it reads green / amber / orange / rose
  if (score >= 80) return { key: "excellent", label: "Excellent", color: "#5FD3A9", hue: 110, text: "text-emerald-600", pill: "bg-emerald-50 text-emerald-700" };
  if (score >= 65) return { key: "good", label: "Good", color: "#F3C56B", hue: 230, text: "text-amber-600", pill: "bg-amber-50 text-amber-700" };
  if (score >= 50) return { key: "attention", label: "Needs attention", color: "#F5A27A", hue: 260, text: "text-orange-600", pill: "bg-orange-50 text-orange-700" };
  return { key: "critical", label: "Critical", color: "#F08A9B", hue: 290, text: "text-red-600", pill: "bg-red-50 text-red-700" };
}
