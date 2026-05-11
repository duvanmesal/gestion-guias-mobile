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
    className={`flex-row items-center justify-between gap-3 px-3.5 py-3 ${className}`.trim()}
    radius="lg"
    variant="raised"
  >
    <div className="min-w-0 flex-1">
      <div
        className="truncate"
        style={{
          fontSize: "var(--text-body)",
          fontWeight: 600,
          letterSpacing: "var(--tracking-tight)",
          color: "var(--color-fg-primary)",
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          className="mt-0.5 truncate"
          style={{
            fontSize: "var(--text-caption)",
            color: "var(--color-fg-muted)",
          }}
        >
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
