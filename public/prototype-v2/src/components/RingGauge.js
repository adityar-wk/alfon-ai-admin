// Apple Health-style circular gauge using a solid orange stroke arc.
function RingGauge({ value, size = 88, stroke = 9, label, suffix = "" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F5F5F5" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E8623A"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 800ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold" style={{ fontSize: size * 0.24, color: "#1A1A1A" }}>{value}{suffix}</span>
        </div>
      </div>
      {label && <div className="text-xs font-medium text-center max-w-[100px]" style={{ color: "#6B7280" }}>{label}</div>}
    </div>
  );
}
window.RingGauge = RingGauge;
