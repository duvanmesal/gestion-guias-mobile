import type { CSSProperties, ReactNode } from "react";

type SurfaceCardVariant = "raised" | "inset" | "accent";
type SurfaceCardRadius = "lg" | "xl";

export interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
  variant?: SurfaceCardVariant;
  radius?: SurfaceCardRadius;
  style?: CSSProperties;
}

const surfaceStyles: Record<SurfaceCardVariant, CSSProperties> = {
  raised: {
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border-hairline)",
    boxShadow: "var(--shadow-card)",
  },
  inset: {
    background: "var(--color-bg-subtle)",
    border: "1px solid var(--color-border-hairline)",
  },
  accent: {
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border-glow)",
    boxShadow: "var(--shadow-card)",
  },
};

const radiusClasses: Record<SurfaceCardRadius, string> = {
  lg: "rounded-[12px]",
  xl: "rounded-[16px]",
};

const SurfaceCard: React.FC<SurfaceCardProps> = ({
  children,
  className = "",
  variant = "raised",
  radius = "xl",
  style,
}) => (
  <div
    className={`flex flex-col ${radiusClasses[radius]} ${className}`.trim()}
    style={{ ...surfaceStyles[variant], ...style }}
  >
    {children}
  </div>
);

export default SurfaceCard;
export type { SurfaceCardVariant, SurfaceCardRadius };
