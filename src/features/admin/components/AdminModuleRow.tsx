interface AdminModuleRowProps {
  title: string;
  description: string;
  onOpen: () => void;
  badge?: string;
  helperText?: string;
  disabled?: boolean;
}

const AdminModuleRow: React.FC<AdminModuleRowProps> = ({
  title,
  description,
  onOpen,
  badge,
  helperText,
  disabled = false,
}) => (
  <button
    type="button"
    onClick={() => {
      if (!disabled) onOpen();
    }}
    disabled={disabled}
    aria-disabled={disabled}
    className="flex w-full items-center justify-between gap-4 rounded-[22px] border px-4 py-4 text-left transition-transform duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:active:scale-100"
    style={{
      background: disabled
        ? "linear-gradient(145deg, rgba(20,24,29,0.94) 0%, rgba(16,20,24,0.94) 100%)"
        : "linear-gradient(145deg, rgba(22,29,36,1) 0%, rgba(18,25,32,1) 100%)",
      borderColor: "rgba(255,255,255,0.06)",
      boxShadow: disabled
        ? "inset 1px 1px 0 rgba(255,255,255,0.02), inset -1px -1px 0 rgba(0,0,0,0.24)"
        : "6px 6px 16px rgba(0,0,0,0.24), -3px -3px 10px rgba(255,255,255,0.02)",
      opacity: disabled ? 0.86 : 1,
    }}
  >
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--color-fg-primary)" }}
        >
          {title}
        </p>

        {badge ? (
          <span
            className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{
              background: disabled
                ? "rgba(255,255,255,0.04)"
                : "rgba(34,139,84,0.1)",
              color: disabled
                ? "var(--color-fg-secondary)"
                : "var(--color-primary)",
              borderColor: disabled
                ? "rgba(255,255,255,0.08)"
                : "rgba(34,139,84,0.22)",
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <p
        className="mt-1 text-xs leading-5"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        {description}
      </p>

      {helperText ? (
        <p
          className="mt-2 text-[11px] leading-5"
          style={{ color: "var(--color-fg-muted)" }}
        >
          {helperText}
        </p>
      ) : null}
    </div>

    <span
      className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.05)"
          : "rgba(34,139,84,0.12)",
        color: disabled
          ? "var(--color-fg-secondary)"
          : "var(--color-primary)",
      }}
    >
      {disabled ? "Bloqueado" : "Abrir"}
    </span>
  </button>
);

export default AdminModuleRow;