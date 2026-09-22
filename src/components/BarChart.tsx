export function BarChart({
  data,
  max,
  ticks = [0, 4, 8, 12, 16],
  height = 150,
}: {
  data: { label: string; value: number }[];
  max?: number;
  ticks?: number[];
  height?: number;
}) {
  const top = max ?? Math.max(...ticks, ...data.map((d) => d.value));
  return (
    <div className="flex gap-2" style={{ height }}>
      <div className="flex flex-col justify-between py-1 text-[10px] text-ink-tertiary">
        {[...ticks].reverse().map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="relative flex flex-1 items-end justify-between gap-1.5">
        {[...ticks].reverse().map((t) => (
          <span
            key={t}
            className="absolute inset-x-0 border-t border-line/70"
            style={{ bottom: `${(t / top) * 100}%` }}
          />
        ))}
        {data.map((d) => (
          <div key={d.label} className="relative z-10 flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full max-w-[16px] rounded-t bg-brand"
              style={{ height: `${(d.value / top) * (height - 20)}px` }}
            />
            <span className="text-[10px] text-ink-tertiary">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
