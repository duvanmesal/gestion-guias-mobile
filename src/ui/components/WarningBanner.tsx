import type { CSSProperties, ReactNode } from "react";
import SurfaceCard from "./SurfaceCard";

export interface WarningBannerProps {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
  title: ReactNode;
}

const iconWrapStyle: CSSProperties = {
  background: "var(--color-warning-soft)",
  border: "1px solid var(--color-warning-border)",
  boxShadow:
    "inset 0 1px 0 var(--color-glass-medium), 0 8px 18px var(--color-warning-soft)",
};

const WarningBanner: React.FC<WarningBannerProps> = ({
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
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[var(--color-warning)]"
        style={iconWrapStyle}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 9v3.75m0 3h.008v.008H12v-.008zm8.624 2.376-7.5-13a1.3 1.3 0 00-2.248 0l-7.5 13A1.3 1.3 0 004.5 20h15a1.3 1.3 0 001.124-1.874z"
          />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="break-words text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-warning)]">
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

export default WarningBanner;
