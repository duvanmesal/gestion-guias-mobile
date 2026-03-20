import SurfaceCard from "./SurfaceCard";

export interface EntityListRowProps {
  action?: React.ReactNode;
  className?: string;
  metadata?: React.ReactNode;
  subtitle?: React.ReactNode;
  title: React.ReactNode;
}

const EntityListRow: React.FC<EntityListRowProps> = ({
  action,
  className = "",
  metadata,
  subtitle,
  title,
}) => (
  <SurfaceCard
    className={`flex-row items-center justify-between gap-3 px-3 py-3 ${className}`.trim()}
    radius="lg"
    variant="inset"
  >
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-semibold text-[var(--color-fg-primary)]">
        {title}
      </div>
      {subtitle ? (
        <div className="mt-0.5 truncate text-[0.6875rem] font-medium text-[var(--color-fg-secondary)]">
          {subtitle}
        </div>
      ) : null}
    </div>
    {(metadata ?? action) ? (
      <div className="flex shrink-0 items-center gap-2">
        {metadata ? <div>{metadata}</div> : null}
        {action ? <div>{action}</div> : null}
      </div>
    ) : null}
  </SurfaceCard>
);

export default EntityListRow;
