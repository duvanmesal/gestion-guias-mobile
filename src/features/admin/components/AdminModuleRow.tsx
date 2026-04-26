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
  cyan:   { color: "#38BDF8", faint: "rgba(56,189,248,0.13)",  border: "rgba(56,189,248,0.30)"  },
  amber:  { color: "#F59E0B", faint: "rgba(245,158,11,0.13)",  border: "rgba(245,158,11,0.30)"  },
  teal:   { color: "#2DD4BF", faint: "rgba(45,212,191,0.13)",  border: "rgba(45,212,191,0.30)"  },
  violet: { color: "#8B5CF6", faint: "rgba(139,92,246,0.13)",  border: "rgba(139,92,246,0.30)"  },
};

const DefaultIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
      className="group relative flex h-full w-full flex-col items-start gap-3 overflow-hidden rounded-[20px] border p-4 text-left transition-transform duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.02)"
          : "linear-gradient(150deg, rgba(12,14,42,0.99) 0%, rgba(7,8,22,0.98) 100%)",
        borderColor: disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.07)",
        boxShadow: disabled
          ? "none"
          : `0 8px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 1px ${t.border} inset`,
        opacity: disabled ? 0.62 : 1,
      }}
    >
      {/* Subtle accent glow */}
      {!disabled && (
        <div
          aria-hidden
          style={{
            position: "absolute", right: -28, bottom: -28, width: 120, height: 120,
            background: `radial-gradient(circle, ${t.color}1F 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Icon container */}
      <div
        style={{
          width: 48, height: 48, borderRadius: 14,
          background: t.faint,
          border: `1px solid ${t.border}`,
          color: t.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: disabled ? "none" : `0 4px 14px ${t.color}22`,
        }}
      >
        {icon ?? DefaultIcon}
      </div>

      {/* Title row + badge */}
      <div className="relative z-10 min-w-0 w-full">
        <div className="flex items-center gap-2 min-w-0">
          <p className="truncate" style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-fg-primary)" }}>
            {title}
          </p>
          {badge && (
            <span
              className="ml-auto shrink-0 rounded-full border px-2 py-0.5"
              style={{
                fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                background: disabled ? "rgba(255,255,255,0.04)" : `${t.color}22`,
                color: disabled ? "var(--color-fg-secondary)" : t.color,
                borderColor: disabled ? "rgba(255,255,255,0.08)" : `${t.color}55`,
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <p
          className="mt-1 leading-snug"
          style={{
            fontSize: "0.75rem",
            color: "var(--color-fg-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>

        {helperText && (
          <p
            className="mt-2 leading-snug"
            style={{
              fontSize: "0.6875rem",
              color: disabled ? "#FCA5A5" : "var(--color-fg-muted)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {helperText}
          </p>
        )}
      </div>

      {/* Footer status / chevron */}
      <div className="relative z-10 mt-auto flex w-full items-center justify-between">
        <span
          className="rounded-full px-2.5 py-1"
          style={{
            fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.04em",
            background: disabled ? "rgba(244,63,94,0.12)" : `${t.color}1A`,
            color: disabled ? "#F87171" : t.color,
            border: `1px solid ${disabled ? "rgba(244,63,94,0.28)" : `${t.color}33`}`,
          }}
        >
          {disabled ? "Bloqueado" : "Abrir"}
        </span>
        {!disabled && (
          <span style={{ color: t.color, opacity: 0.7, display: "flex" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
};

export default AdminModuleRow;
