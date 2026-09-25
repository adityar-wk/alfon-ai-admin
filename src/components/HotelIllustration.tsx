export function HotelIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="120" cy="74" r="66" fill="#FFF4F0" />
      {/* palm left */}
      <path d="M46 150c-2-26 4-44 12-58" stroke="#E8895F" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 92c-10-8-24-8-30-2 8 2 14 6 18 12M58 92c-2-12 4-24 14-28-4 8-6 16-6 24M58 92c8-8 22-10 30-4-8 2-16 6-22 12M58 92c-4-10-2-22 6-30-2 8-2 16 0 24" fill="#F2A17E" />
      {/* building */}
      <rect x="86" y="46" width="70" height="96" rx="6" fill="#F6B48F" />
      <rect x="100" y="30" width="42" height="112" rx="6" fill="#F5A623" />
      <rect x="112" y="18" width="18" height="124" rx="4" fill="#E8623A" />
      {[36, 54, 72, 90, 108].map((y) => (
        <g key={y}>
          <rect x="106" y={y} width="7" height="9" rx="1.5" fill="#FFF1EA" />
          <rect x="118" y={y} width="6" height="9" rx="1.5" fill="#FFF3EC" />
          <rect x="129" y={y} width="7" height="9" rx="1.5" fill="#FFF1EA" />
        </g>
      ))}
      <rect x="90" y="60" width="9" height="10" rx="1.5" fill="#FFE3D2" />
      <rect x="90" y="80" width="9" height="10" rx="1.5" fill="#FFE3D2" />
      <rect x="90" y="100" width="9" height="10" rx="1.5" fill="#FFE3D2" />
      <rect x="143" y="60" width="9" height="10" rx="1.5" fill="#FFE3D2" />
      <rect x="143" y="80" width="9" height="10" rx="1.5" fill="#FFE3D2" />
      <rect x="143" y="100" width="9" height="10" rx="1.5" fill="#FFE3D2" />
      {/* palm right */}
      <path d="M182 150c3-30-3-50-12-66" stroke="#E8895F" strokeWidth="4" strokeLinecap="round" />
      <path d="M170 84c10-8 26-8 32-1-9 1-16 5-21 11M170 84c-2-13 5-25 16-29-5 8-7 17-7 25M170 84c9-9 24-11 33-4-9 1-18 5-25 12M170 84c-5-11-3-24 6-32-2 9-2 17 0 25" fill="#F2A17E" />
      {/* ground */}
      <ellipse cx="120" cy="146" rx="86" ry="8" fill="#FADFD0" />
    </svg>
  );
}
