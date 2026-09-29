/** A hollow glass-bubble visual: a pale glassy centre ringed by a thick glossy coloured rim, like a soap bubble. */
interface OrbProps {
  color?: string;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function mix(hex: string, target: number, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const m = (c: number) => Math.round(c + (target - c) * amount);
  return `rgb(${m(r)}, ${m(g)}, ${m(b)})`;
}

const lighten = (hex: string, amount: number) => mix(hex, 255, amount);
const darken = (hex: string, amount: number) => mix(hex, 0, amount);

export default function Orb({ color = "#5FD3A9" }: OrbProps) {
  const centerPale = lighten(color, 0.94);
  const mint = lighten(color, 0.8);
  const rimBright = lighten(color, 0.42);
  const shade = darken(color, 0.22);
  const rimOuter = lighten(color, 0.5);
  const edge = darken(color, 0.08);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* soft colour-matched ambient glow so the bubble feels grounded */}
      <div className="orb-glow absolute inset-[6%] rounded-full blur-3xl" style={{ background: color }} />

      <div
        className="relative h-[92%] w-[92%] rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${centerPale} 0%, ${centerPale} 46%, ${mint} 56%, ${rimBright} 65%, ${color} 73%, ${shade} 84%, ${rimOuter} 93%, ${edge} 100%)`,
          boxShadow: `0 24px 46px -16px ${color}77, 0 10px 22px -10px rgba(0,0,0,0.12)`,
        }}
      >
        {/* directional gloss: bright highlight up top, a shaded patch and a bright streak lower down, like light on curved glass */}
        <div className="orb-shimmer pointer-events-none absolute left-[8%] top-[4%] h-[32%] w-[48%] rounded-full bg-white/75 blur-[14px]" />
        <div className="pointer-events-none absolute bottom-[6%] right-[8%] h-[26%] w-[36%] rounded-full blur-[16px]" style={{ background: shade, opacity: 0.5 }} />
        <div className="pointer-events-none absolute bottom-[9%] left-[14%] h-[9%] w-[18%] rounded-full bg-white/85 blur-[6px]" />
      </div>
    </div>
  );
}
