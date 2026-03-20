type StatusChipTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "danger";

export interface StatusChipProps {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  tone?: StatusChipTone;
}

const toneClassMap: Record<StatusChipTone, string> = {
  neutral: "status-chip-neutral",
  primary: "status-chip-primary",
  success: "status-chip-success",
  warning: "status-chip-warning",
  info: "status-chip-info",
  danger:
    "border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
};

const dotClassMap: Record<StatusChipTone, string> = {
  neutral: "bg-[var(--color-fg-secondary)]",
  primary: "bg-[var(--color-primary)]",
  success: "bg-[var(--color-primary)]",
  warning: "bg-[var(--color-warning)]",
  info: "bg-[var(--color-info)]",
  danger: "bg-[var(--color-danger)]",
};

const StatusChip: React.FC<StatusChipProps> = ({
  children,
  className = "",
  dot = false,
  tone = "neutral",
}) => (
  <span className={`status-chip ${toneClassMap[tone]} ${className}`.trim()}>
    {dot ? (
      <span className={`h-2 w-2 rounded-full ${dotClassMap[tone]}`} />
    ) : null}
    {children}
  </span>
);

export default StatusChip;
export type { StatusChipTone };
