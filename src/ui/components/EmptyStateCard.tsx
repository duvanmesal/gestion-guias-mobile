import type { ReactNode } from "react";
import SurfaceCard from "./SurfaceCard";

export interface EmptyStateCardProps {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

const defaultIcon = (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      d="M4.5 6.75h15m-15 5.25h15m-15 5.25h9"
    />
  </svg>
);

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  action,
  className = "",
  description,
  icon = defaultIcon,
  title,
}) => (
  <SurfaceCard
    className={`items-center overflow-hidden px-4 py-5 text-center ${className}`.trim()}
    radius="lg"
    variant="inset"
  >
    <div
      aria-hidden="true"
      className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-[var(--color-fg-secondary)]"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid var(--color-border-glass)",
        boxShadow:
          "inset 2px 2px 5px rgba(0, 0, 0, 0.35), inset -2px -2px 5px rgba(255, 255, 255, 0.03)",
      }}
    >
      {icon}
    </div>
    <p className="w-full break-words text-sm font-semibold leading-6 text-[var(--color-fg-primary)]">
      {title}
    </p>
    {description ? (
      <div className="mt-1 w-full break-words text-sm leading-6 text-[var(--color-fg-muted)]">
        {description}
      </div>
    ) : null}
    {action ? <div className="mt-4 w-full min-w-0">{action}</div> : null}
  </SurfaceCard>
);

export default EmptyStateCard;
