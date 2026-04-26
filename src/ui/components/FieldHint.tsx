type HintVariant = "default" | "success" | "warning" | "error";

interface FieldHintProps {
  children: React.ReactNode;
  variant?: HintVariant;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<HintVariant, string> = {
  default: "color: var(--color-fg-muted)",
  success: "color: var(--color-success)",
  warning: "color: var(--color-warning)",
  error: "color: var(--color-error-text)",
};

const FieldHint: React.FC<FieldHintProps> = ({
  children,
  variant = "default",
  icon,
  className = "",
}) => {
  return (
    <p
      className={`mt-1.5 flex items-center gap-1.5 text-[0.8125rem] leading-snug ${className}`}
      style={{ [variantStyles[variant].split(":")[0]]: variantStyles[variant].split(":")[1].trim() }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </p>
  );
};

export default FieldHint;
export type { FieldHintProps, HintVariant };
