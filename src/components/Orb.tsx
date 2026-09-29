/** A glossy glass-sphere visual: a solid-colour ball with drifting internal light and a specular glass shell. */
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
  const veryLight = lighten(color, 0.85);
  const light = lighten(color, 0.55);
  const dark = darken(color, 0.35);

  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          background: `radial-gradient(circle at 42% 36%, ${veryLight} 0%, ${light} 32%, ${color} 64%, ${dark} 100%)`,
          boxShadow: "0 30px 54px -18px rgba(0,0,0,0.28), 0 10px 22px -10px rgba(0,0,0,0.14)",
        }}
      >
        <div className="orb-blob orb-blob-a" style={{ background: veryLight }} />
        <div className="orb-blob orb-blob-b" style={{ background: light }} />
        <div className="orb-blob orb-blob-c" style={{ background: dark }} />
      </div>

      {/* glass shell: volumetric shading + specular highlights so it reads as a glass ball, not a flat disc */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: "inset -20px -26px 54px rgba(0,0,0,0.22), inset 16px 20px 40px rgba(255,255,255,0.55), inset 0 0 0 1px rgba(255,255,255,0.35)" }}
      />
      <div className="pointer-events-none absolute left-[12%] top-[8%] h-[34%] w-[40%] rounded-full bg-white/80 blur-[10px]" />
      <div className="pointer-events-none absolute left-[58%] top-[60%] h-[9%] w-[11%] rounded-full bg-white/55 blur-[4px]" />
    </div>
  );
}
