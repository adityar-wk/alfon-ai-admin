/**
 * Single-hue (warm gold/tan) shades, light to dark — every Analytics chart draws from this
 * one ramp instead of a rainbow of pastel colours, so multi-series charts still read as one
 * coherent, elegant palette. These are the exact stops used by the Alt Prototype's own
 * Analytics charts, so both apps render the same gradient.
 */
const STOPS = ["#FAF3E8", "#F5E8CC", "#EDD9B4", "#DBBE8E", "#C9A96E", "#B8924F", "#9E7C3F"]; // lightest -> darkest

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const STOP_RGB = STOPS.map(hexToRgb);

/** t in [0,1]; 0 = lightest, 1 = darkest */
export function shade(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const scaled = clamped * (STOP_RGB.length - 1);
  const i = Math.min(STOP_RGB.length - 2, Math.floor(scaled));
  const f = scaled - i;
  const [r1, g1, b1] = STOP_RGB[i];
  const [r2, g2, b2] = STOP_RGB[i + 1];
  const r = Math.round(r1 + (r2 - r1) * f);
  const g = Math.round(g1 + (g2 - g1) * f);
  const b = Math.round(b1 + (b2 - b1) * f);
  return `rgb(${r}, ${g}, ${b})`;
}

/** n evenly spaced shades of the hue, light to dark */
export const pastel = (n: number) => Array.from({ length: n }, (_, i) => shade(n <= 1 ? 0.45 : i / (n - 1)));

export const TAGS = Array.from({ length: 12 }, (_, i) => ({
  name: `shade-${i}`,
  mid: shade(i / 11),
  pill: "bg-amber-100 text-amber-800",
}));

/** the same ramp, flattened — for callers that just want a fixed-size colour list */
export const PASTEL = TAGS.map((t) => t.mid);
