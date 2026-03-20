export interface PageSectionHeaderProps {
  action?: React.ReactNode;
  className?: string;
  description?: string;
  title: string;
}

const PageSectionHeader: React.FC<PageSectionHeaderProps> = ({
  action,
  className = "",
  description,
  title,
}) => (
  <div
    className={`flex items-start justify-between gap-3 ${className}`.trim()}
  >
    <div className="min-w-0">
      <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm leading-5 text-[var(--color-fg-muted)]">
          {description}
        </p>
      ) : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);

export default PageSectionHeader;
