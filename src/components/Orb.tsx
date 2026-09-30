import { useEffect, useId, useState, type CSSProperties } from "react";

/** The Alt Prototype health orb: the glass bubble, tinted by score, with the number in the centre. */
type Tier = "green" | "orange" | "red";

function tierForScore(score: number): Tier {
  if (score >= 80) return "green";
  if (score >= 50) return "orange";
  return "red";
}

const GLOWS: Record<Tier, string> = {
  green: "rgba(22, 163, 74, 0.5)",
  orange: "rgba(234, 88, 12, 0.5)",
  red: "rgba(220, 38, 38, 0.5)",
};

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const BUBBLE = `${import.meta.env.BASE_URL}prototype-v2/public/assets/bubble.png`;

export default function Orb({ score }: { score: number }) {
  const animated = useCountUp(score);
  const tier = tierForScore(animated);
  const uid = useId().replace(/:/g, "");
  const redId = `orbDuotoneRed-${uid}`;
  const orangeId = `orbDuotoneOrange-${uid}`;
  const filter = tier === "red" ? `url(#${redId})` : tier === "orange" ? `url(#${orangeId})` : "none";

  return (
    <div className="health-orb-wrap">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id={redId}>
            <feColorMatrix
              type="matrix"
              values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.50 0.86 1.0" />
              <feFuncG type="table" tableValues="0.07 0.15 1.0" />
              <feFuncB type="table" tableValues="0.07 0.15 1.0" />
            </feComponentTransfer>
          </filter>
          <filter id={orangeId}>
            <feColorMatrix
              type="matrix"
              values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
            />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.49 0.92 1.0" />
              <feFuncG type="table" tableValues="0.18 0.35 1.0" />
              <feFuncB type="table" tableValues="0.07 0.05 1.0" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <div className="health-orb" style={{ "--glow": GLOWS[tier] } as CSSProperties}>
        <div className="health-orb__halo" />
        <div className="health-orb__halo health-orb__halo--soft" />
        <img src={BUBBLE} alt="" className="health-orb__image" style={{ filter }} />
        <div className="health-orb__score-wrap">
          <div className="health-orb__score">{animated}%</div>
        </div>
      </div>
      <div className="health-orb__ground-shadow" />
    </div>
  );
}
