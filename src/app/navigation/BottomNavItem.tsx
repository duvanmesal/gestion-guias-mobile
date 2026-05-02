import type { AppNavigationItem } from "./navigation.config";

interface BottomNavItemProps {
  item: AppNavigationItem;
  isActive: boolean;
  onNavigate: (href: string) => void;
}

/* ── Colors ── */
const INACTIVE_ICON  = "#94A3B8";
const INACTIVE_LABEL = "#94A3B8";
const ACTIVE_COLOR   = "#2563EB";
const ACTIVE_GLOW    = "rgba(37,99,235,0.20)";

/* ── SVG icons ── */
const NavIcon: React.FC<{ navKey: string; active: boolean }> = ({ navKey, active }) => {
  const props = {
    width: 20, height: 20, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: active ? "2.2" : "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (navKey) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "turnos":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8"  y1="2" x2="8"  y2="6" />
          <line x1="3"  y1="10" x2="21" y2="10" />
          <line x1="8"  y1="14" x2="8.01" y2="14" strokeWidth={active ? "2.6" : "2.2"} />
          <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth={active ? "2.6" : "2.2"} />
        </svg>
      );
    case "atenciones":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "recaladas":
      return (
        <svg {...props}>
          <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" />
          <path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
        </svg>
      );
    case "admin":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          {active && <polyline points="9 12 11 14 15 10" />}
        </svg>
      );
    case "profile":
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
  }
};

/* ── Component ── */
const BottomNavItem: React.FC<BottomNavItemProps> = ({ item, isActive, onNavigate }) => (
  <button
    type="button"
    onClick={() => onNavigate(item.href)}
    aria-current={isActive ? "page" : undefined}
    aria-label={item.label}
    style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      flex: 1,
      minWidth: 0,
      padding: "4px 2px 2px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      WebkitTapHighlightColor: "transparent",
      transition: "transform 120ms cubic-bezier(0.34,1.56,0.64,1)",
    }}
    onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.86)"; }}
    onMouseUp={(e)   => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    onTouchStart={(e)=> { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.86)"; }}
    onTouchEnd={(e)  => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
  >
    {/* Active top accent bar */}
    {isActive && (
      <span style={{
        position: "absolute",
        top: -1,
        left: "50%",
        transform: "translateX(-50%)",
        width: 28,
        height: 2,
        borderRadius: 9999,
        background: `linear-gradient(90deg, #2563EB, #3B82F6)`,
        boxShadow: `0 0 10px ${ACTIVE_GLOW}`,
      }} />
    )}

    {/* Icon container */}
    <span style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 44,
      height: 32,
      borderRadius: isActive ? 14 : 12,
      background: isActive
        ? "rgba(37,99,235,0.10)"
        : "transparent",
      border: isActive
        ? "1px solid rgba(37,99,235,0.25)"
        : "1px solid transparent",
      boxShadow: isActive
        ? `0 2px 8px ${ACTIVE_GLOW}`
        : "none",
      color: isActive ? ACTIVE_COLOR : INACTIVE_ICON,
      transition: "all 220ms cubic-bezier(0.34,1.56,0.64,1)",
      flexShrink: 0,
    }}>
      <NavIcon navKey={item.key} active={isActive} />

      {/* Active glow behind icon */}
      {isActive && (
        <span style={{
          position: "absolute",
          inset: 0,
          borderRadius: 14,
          background: `radial-gradient(circle at 50% 60%, rgba(37,99,235,0.12) 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
      )}
    </span>

    {/* Label */}
    <span style={{
      fontSize: "0.585rem",
      fontWeight: isActive ? 800 : 500,
      letterSpacing: isActive ? "0.04em" : "0.01em",
      color: isActive ? ACTIVE_COLOR : INACTIVE_LABEL,
      textTransform: isActive ? "uppercase" : "none",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "100%",
      transition: "color 180ms ease, font-weight 180ms ease",
      lineHeight: 1,
    }}>
      {item.label}
    </span>
  </button>
);

export default BottomNavItem;
