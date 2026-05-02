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
  cyan:   { color: "#0284C7", faint: "rgba(2,132,199,0.10)",   border: "rgba(2,132,199,0.20)"   },
  amber:  { color: "#D97706", faint: "rgba(217,119,6,0.10)",   border: "rgba(217,119,6,0.20)"   },
  teal:   { color: "#059669", faint: "rgba(5,150,105,0.10)",   border: "rgba(5,150,105,0.20)"   },
  violet: { color: "#2563EB", faint: "rgba(37,99,235,0.10)",   border: "rgba(37,99,235,0.20)"   },
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
          background: disabled ? "rgba(0,0,0,0.05)" : t.faint,
          border: `1px solid ${disabled ? "rgba(0,0,0,0.08)" : t.border}`,
          color: disabled ? "var(--color-fg-disabled)" : t.color,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {icon ?? DefaultIcon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-fg-primary)", lineHeight: 1.2 }}>
            {title}
          </span>
          {badge && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              background: disabled ? "rgba(0,0,0,0.05)" : `${t.color}18`,
              color: disabled ? "var(--color-fg-muted)" : t.color,
              border: `1px solid ${disabled ? "rgba(0,0,0,0.08)" : `${t.color}30`}`,
              borderRadius: 999, padding: "2px 6px", flexShrink: 0,
            }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{
          fontSize: 12.5, color: "var(--color-fg-muted)",
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
