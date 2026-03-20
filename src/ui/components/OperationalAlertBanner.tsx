import SurfaceCard from "./SurfaceCard";
import StatusChip, { type StatusChipTone } from "./StatusChip";

export interface OperationalAlertBannerProps {
  action?: React.ReactNode;
  className?: string;
  description?: string;
  statusLabel?: string;
  statusTone?: StatusChipTone;
  title: string;
}

const OperationalAlertBanner: React.FC<OperationalAlertBannerProps> = ({
  action,
  className = "",
  description,
  statusLabel,
  statusTone = "warning",
  title,
}) => (
  <SurfaceCard
    className={`gap-3 p-4 ${className}`.trim()}
    variant="raised"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
          {title}
        </p>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[var(--color-fg-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {statusLabel ? (
        <StatusChip className="shrink-0" tone={statusTone}>
          {statusLabel}
        </StatusChip>
      ) : null}
    </div>
    {action ? <div>{action}</div> : null}
  </SurfaceCard>
);

export default OperationalAlertBanner;
