import logoSrc from "../assets/alfon-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="ALFON"
      className={`h-[18px] w-auto select-none object-contain ${className}`}
      draggable={false}
    />
  );
}
