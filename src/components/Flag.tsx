/** Small rounded flag glyphs for the countries used in demo data. */
export function Flag({ country, className = "" }: { country: string; className?: string }) {
  const box = `inline-block h-3.5 w-5 overflow-hidden rounded-[3px] ring-1 ring-black/5 ${className}`;
  switch (country) {
    case "India":
      return (
        <svg viewBox="0 0 30 20" className={box} xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="20" fill="#fff" />
          <rect width="30" height="6.67" fill="#FF9933" />
          <rect y="13.33" width="30" height="6.67" fill="#138808" />
          <circle cx="15" cy="10" r="2.2" fill="none" stroke="#000080" strokeWidth="0.6" />
        </svg>
      );
    case "United Kingdom":
      return (
        <svg viewBox="0 0 30 20" className={box} xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#fff" strokeWidth="4" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" strokeWidth="2" />
          <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
          <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.5" />
        </svg>
      );
    case "United States":
      return (
        <svg viewBox="0 0 30 20" className={box} xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="20" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={i * (20 / 13)} width="30" height={20 / 13} fill="#B22234" />
          ))}
          <rect width="13" height="10.77" fill="#3C3B6E" />
        </svg>
      );
    case "Singapore":
      return (
        <svg viewBox="0 0 30 20" className={box} xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="10" fill="#EF3340" />
          <rect y="10" width="30" height="10" fill="#fff" />
          <circle cx="7" cy="5" r="3.2" fill="#fff" />
          <circle cx="8.2" cy="5" r="3.2" fill="#EF3340" />
        </svg>
      );
    case "Australia":
      return (
        <svg viewBox="0 0 30 20" className={box} xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="20" fill="#00008B" />
          <rect width="15" height="10" fill="#012169" />
          <path d="M0 0l15 10M15 0L0 10" stroke="#fff" strokeWidth="2" />
          <path d="M7.5 0v10M0 5h15" stroke="#fff" strokeWidth="3" />
          <path d="M7.5 0v10M0 5h15" stroke="#C8102E" strokeWidth="1.5" />
          <circle cx="22" cy="13" r="1.3" fill="#fff" />
          <circle cx="8" cy="16" r="1" fill="#fff" />
        </svg>
      );
    case "France":
      return (
        <svg viewBox="0 0 30 20" className={box} xmlns="http://www.w3.org/2000/svg">
          <rect width="10" height="20" fill="#0055A4" />
          <rect x="10" width="10" height="20" fill="#fff" />
          <rect x="20" width="10" height="20" fill="#EF4135" />
        </svg>
      );
    case "UAE":
      return (
        <svg viewBox="0 0 30 20" className={box} xmlns="http://www.w3.org/2000/svg">
          <rect width="30" height="6.67" y="0" fill="#00732F" />
          <rect width="30" height="6.67" y="6.67" fill="#fff" />
          <rect width="30" height="6.67" y="13.33" fill="#000" />
          <rect width="8" height="20" fill="#FF0000" />
        </svg>
      );
    default:
      return <span className={box} style={{ background: "#E5E7EB" }} />;
  }
}
