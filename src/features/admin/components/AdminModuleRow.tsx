type ModuleTone = "cyan" | "amber" | "teal" | "violet";

interface AdminModuleRowProps {
  title: string;
  description: string;
  onOpen: () => void;
  badge?: string;
  helperText?: string;
  disabled?: boolean;
  tone?: ModuleTone;
  icon?: React.ReactNode;
}

const TONE: Record<ModuleTone, { color: string; faint: string; border: string }> = {
  cyan:   { color: "var(--color-info)",    faint: "var(--color-info-soft)",    border: "var(--color-info-border)"    },
  amber:  { color: "var(--color-accent)",  faint: "var(--color-accent-soft)",  border: "var(--color-accent-border)"  },
  teal:   { color: "var(--color-success)", faint: "var(--color-success-soft)", border: "var(--color-success-border)" },
  violet: { color: "var(--color-primary)", faint: "var(--color-primary-soft)", border: "var(--color-border-glow)"    },
};

const LockIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ChevronIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const DefaultIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const AdminModuleRow: React.FC<AdminModuleRowProps> = ({
  title,
  description,
  onOpen,
  badge,
  helperText,
  disabled = false,
  tone = "violet",
  icon,
}) => {
  const t = TONE[tone];

  return (
    <button
      type="button"
      onClick={() => { if (!disabled) onOpen(); }}
      disabled={disabled}
      aria-disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: "14px 0",
        background: "transparent",
        border: "none",
        textAlign: "left",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.48 : 1,
        transition: "opacity 0.15s",
        WebkitTapHighlightColor: "transparent",
      }}
      className="active:opacity-60"
    >
      {/* Icon */}
      <div
        style={{
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          background: disabled ? "var(--color-glass-soft)" : t.faint,
          border: `1px solid ${disabled ? "var(--color-glass-medium)" : t.border}`,
          color: disabled ? "var(--color-fg-disabled)" : t.color,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {icon ?? DefaultIcon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
          <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-fg-primary)", lineHeight: 1.2 }}>
            {title}
          </span>
          {badge && (
            <span style={{
              fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              background: disabled ? "var(--color-glass-soft)" : t.faint,
              color: disabled ? "var(--color-fg-muted)" : t.color,
              border: `1px solid ${disabled ? "var(--color-glass-medium)" : t.border}`,
              borderRadius: 999, padding: "2px 6px", flexShrink: 0,
            }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{
          fontSize: "0.78rem", color: "var(--color-fg-muted)",
          marginTop: 2, lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {helperText ?? description}
        </p>
      </div>

      {/* Trailing icon */}
      <div style={{ color: disabled ? "var(--color-fg-disabled)" : "var(--color-fg-muted)", flexShrink: 0, opacity: disabled ? 1 : 0.5 }}>
        {disabled ? LockIcon : ChevronIcon}
      </div>
    </button>
  );
};

export default AdminModuleRow;
