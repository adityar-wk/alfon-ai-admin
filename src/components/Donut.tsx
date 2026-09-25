export type DonutSegment = { label: string; value: number; color: string };

export function Donut({
  segments,
  size = 128,
  thickness = 18,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#F1F1F2"
          strokeWidth={thickness}
        />
        {segments.map((seg) => {
          const len = (seg.value / total) * c;
          const gap = segments.length > 1 ? 2 : 0; // thin white gap between slices
          const el = (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${Math.max(len - gap, 0)} ${c - Math.max(len - gap, 0)}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </g>
    </svg>
  );
}
