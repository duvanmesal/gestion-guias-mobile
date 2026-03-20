import StatusChip from "./StatusChip";

export interface LastUpdatedRowProps {
  className?: string;
  label?: string;
  statusLabel: string;
  statusTone?: "success" | "warning" | "info";
}

const LastUpdatedRow: React.FC<LastUpdatedRowProps> = ({
  className = "",
  label = "Estado de sincronización",
  statusLabel,
  statusTone = "success",
}) => (
  <div
    className={`flex items-center justify-between gap-3 ${className}`.trim()}
  >
    <span className="text-xs font-medium text-[var(--color-fg-muted)]">
      {label}
    </span>
    <StatusChip dot={statusTone === "success"} tone={statusTone}>
      {statusLabel}
    </StatusChip>
  </div>
);

export default LastUpdatedRow;
