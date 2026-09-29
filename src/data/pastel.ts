/**
 * Single-hue (brand orange) shades, light to dark — every Analytics chart draws from this
 * one ramp instead of a rainbow of pastel colours, so multi-series charts still read as one
 * coherent, on-brand palette.
 */
const HUE = 14;
const SAT = 72;

function orangeShade(t: number): string {
  const lightness = 80 - t * 48; // 80% (lightest) down to 32% (darkest)
  return `hsl(${HUE}, ${SAT}%, ${lightness}%)`;
}

/** n evenly spaced shades of the brand hue, light to dark */
export const pastel = (n: number) => Array.from({ length: n }, (_, i) => orangeShade(n <= 1 ? 0.4 : i / (n - 1)));

export const TAGS = Array.from({ length: 12 }, (_, i) => ({
  name: `shade-${i}`,
  mid: orangeShade(i / 11),
  pill: "bg-orange-100 text-orange-700",
}));

/** the same ramp, flattened — for callers that just want a fixed-size colour list */
export const PASTEL = TAGS.map((t) => t.mid);
