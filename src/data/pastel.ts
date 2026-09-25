/** bright pastel fills with a vivid same-hue text colour, like the department tags */
export const TAGS = [
  { name: "sky", mid: "#6DB8FF", pill: "bg-sky-100 text-sky-700" },
  { name: "apricot", mid: "#FFB25E", pill: "bg-orange-100 text-orange-700" },
  { name: "mint", mid: "#6FE3B0", pill: "bg-emerald-100 text-emerald-700" },
  { name: "rose", mid: "#FF8DA1", pill: "bg-rose-100 text-rose-600" },
  { name: "violet", mid: "#B497FF", pill: "bg-violet-100 text-violet-700" },
  { name: "aqua", mid: "#57D3E6", pill: "bg-cyan-100 text-cyan-700" },
  { name: "butter", mid: "#FFD65C", pill: "bg-amber-100 text-amber-700" },
  { name: "pink", mid: "#F7A0D3", pill: "bg-pink-100 text-pink-700" },
  { name: "lime", mid: "#A6E36E", pill: "bg-lime-100 text-lime-700" },
  { name: "indigo", mid: "#8CA2FF", pill: "bg-indigo-100 text-indigo-700" },
  { name: "coral", mid: "#FF9877", pill: "bg-red-100 text-red-600" },
  { name: "lilac", mid: "#D6A2F5", pill: "bg-purple-100 text-purple-700" },
];

/** soft categorical palette for charts */
export const PASTEL = TAGS.map((t) => t.mid);
export const pastel = (n: number) => Array.from({ length: n }, (_, i) => PASTEL[i % PASTEL.length]);
