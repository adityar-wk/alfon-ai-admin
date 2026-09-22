import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Drawer({
  title,
  children,
  onClose,
  footer,
  width = 380,
}: {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  footer?: ReactNode;
  width?: number;
}) {
  return (
    <aside
      className="flex shrink-0 flex-col border-l border-line bg-white"
      style={{ width }}
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-ink-tertiary hover:bg-subtle hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      {footer && <div className="shrink-0 border-t border-line p-4">{footer}</div>}
    </aside>
  );
}
