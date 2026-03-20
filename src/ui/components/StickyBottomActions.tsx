import type { ReactNode } from "react";

export interface StickyBottomActionsProps {
  children: ReactNode;
  className?: string;
}

const StickyBottomActions: React.FC<StickyBottomActionsProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`sticky bottom-0 z-10 -mx-4 mt-1 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] pt-2 ${className}`.trim()}
    style={{
      background:
        "linear-gradient(180deg, rgba(15, 20, 25, 0) 0%, rgba(15, 20, 25, 0.9) 32%, rgba(15, 20, 25, 0.98) 100%)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}
  >
    <div className="mx-auto w-full max-w-md min-w-0">{children}</div>
  </div>
);

export default StickyBottomActions;
