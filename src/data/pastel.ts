/** pastel fills with a vivid same-hue text colour, like the department tags */
export const TAGS = [
  { name: "purple", mid: "#C99AF0", pill: "bg-purple-100 text-purple-700" },
  { name: "blue", mid: "#8DC3F0", pill: "bg-sky-100 text-sky-700" },
  { name: "mint", mid: "#6FDDB7", pill: "bg-emerald-100 text-emerald-700" },
  { name: "orange", mid: "#F7BC7A", pill: "bg-orange-100 text-orange-700" },
  { name: "red", mid: "#F595A5", pill: "bg-rose-100 text-rose-600" },
  { name: "lavender", mid: "#B3A0F0", pill: "bg-violet-100 text-violet-700" },
  { name: "cyan", mid: "#7FD6DE", pill: "bg-cyan-100 text-cyan-700" },
  { name: "pink", mid: "#F4A9CE", pill: "bg-pink-100 text-pink-700" },
];

/** soft categorical palette for charts */
export const PASTEL = TAGS.map((t) => t.mid);
export const pastel = (n: number) => Array.from({ length: n }, (_, i) => PASTEL[i % PASTEL.length]);
