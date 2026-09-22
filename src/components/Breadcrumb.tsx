import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="mb-1 flex items-center gap-1.5 text-[13px] text-ink-tertiary">
      {items.map((it, i) => (
        <Fragment key={it}>
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          <span className={i === items.length - 1 ? "text-ink-secondary" : ""}>{it}</span>
        </Fragment>
      ))}
    </nav>
  );
}
