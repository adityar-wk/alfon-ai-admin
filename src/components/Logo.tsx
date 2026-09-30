import logoSrc from "../assets/alfon-logo.png";

export function Logo({ className = "h-[18px] w-auto" }: { className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="ALFON"
      className={`select-none object-contain ${className}`}
      draggable={false}
    />
  );
}
