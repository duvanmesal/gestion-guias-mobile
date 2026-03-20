import type { CSSProperties, ReactNode } from "react";
import SurfaceCard from "./SurfaceCard";

export interface SuccessBannerProps {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
}

const iconWrapStyle: CSSProperties = {
  background: "var(--color-success-soft)",
  border: "1px solid var(--color-success-border)",
  boxShadow:
    "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 8px 18px rgba(52, 211, 153, 0.12)",
};

const SuccessBanner: React.FC<SuccessBannerProps> = ({
  action,
  className = "",
  description,
  eyebrow,
  title,
}) => (
  <SurfaceCard
    className={`gap-3 overflow-hidden p-4 ${className}`.trim()}
    variant="raised"
  >
    <div className="flex min-w-0 items-start gap-3">
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[var(--color-success)]"
        style={iconWrapStyle}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12.75l2.25 2.25L15.75 9m5.25 3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="break-words text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-success)]">
            {eyebrow}
          </p>
        ) : null}
        <p className="break-words text-sm font-semibold leading-6 text-[var(--color-fg-primary)]">
          {title}
        </p>
        {description ? (
          <div className="mt-1 break-words text-sm leading-6 text-[var(--color-fg-secondary)]">
            {description}
          </div>
        ) : null}
      </div>
    </div>

    {action ? <div className="min-w-0">{action}</div> : null}
  </SurfaceCard>
);

export default SuccessBanner;
