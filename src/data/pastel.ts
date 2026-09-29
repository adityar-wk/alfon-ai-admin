/**
 * Single-hue (warm gold/tan) shades, light to dark — every Analytics chart draws from this
 * one ramp instead of a rainbow of pastel colours, so multi-series charts still read as one
 * coherent, elegant palette.
 */
const HUE = 40;
const SAT = 46;

/** t in [0,1]; 0 = lightest, 1 = darkest */
export function shade(t: number): string {
  const lightness = 82 - t * 50; // 82% (lightest) down to 32% (darkest)
  return `hsl(${HUE}, ${SAT}%, ${lightness}%)`;
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
