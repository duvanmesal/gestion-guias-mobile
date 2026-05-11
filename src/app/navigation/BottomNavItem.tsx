import type { AppNavigationItem } from "./navigation.config";

interface BottomNavItemProps {
  item: AppNavigationItem;
  isActive: boolean;
  onNavigate: (href: string) => void;
}

/* ── SVG icons (stroke-only, react to active state) ── */
const NavIcon: React.FC<{ navKey: string; active: boolean }> = ({ navKey, active }) => {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? "2" : "1.6",
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
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth={active ? "2.4" : "2"} />
          <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth={active ? "2.4" : "2"} />
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

const BottomNavItem: React.FC<BottomNavItemProps> = ({ item, isActive, onNavigate }) => {
  const color = isActive ? "var(--color-primary)" : "var(--color-fg-muted)";

  return (
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
        gap: 3,
        flex: 1,
        minWidth: 0,
        padding: "8px 4px 6px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        transition: "background 120ms ease",
      }}
    >
      {/* Top indicator: 3px primary bar that spans the inner column */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 12,
          right: 12,
          height: 3,
          borderRadius: "0 0 3px 3px",
          background: isActive ? "var(--color-primary)" : "transparent",
          transition: "background 160ms ease",
        }}
      />

      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          color,
          transition: "color 160ms ease",
        }}
      >
        <NavIcon navKey={item.key} active={isActive} />
      </span>

      <span
        style={{
          fontSize: "var(--text-eyebrow)",
          fontWeight: isActive ? 700 : 500,
          letterSpacing: "0.02em",
          color,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          lineHeight: 1.1,
          transition: "color 160ms ease, font-weight 160ms ease",
        }}
      >
        {item.label}
      </span>
    </button>
  );
};

export default BottomNavItem;
