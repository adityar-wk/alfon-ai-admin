/** soft categorical palette for charts */
export const PASTEL = ["#F7B7A3", "#B5D3F3", "#BDE3C6", "#F3DC9B", "#D2C4F0", "#F4B8D4", "#A9DBD7", "#CBD5E1"];
export const pastel = (n: number) => Array.from({ length: n }, (_, i) => PASTEL[i % PASTEL.length]);
