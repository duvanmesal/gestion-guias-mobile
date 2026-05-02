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
    background:
      "linear-gradient(145deg, var(--color-bg-elevated) 0%, var(--color-bg-glass) 100%)",
    border: "1px solid var(--color-border-glass)",
    boxShadow:
      "10px 10px 24px rgba(0,0,0,0.05), -6px -6px 18px var(--color-glass-subtle)",
  },
  inset: {
    background: "var(--color-bg-base)",
    border: "1px solid var(--color-border-glass)",
    boxShadow:
      "inset 2px 2px 5px rgba(0,0,0,0.05), inset -2px -2px 5px var(--color-glass-subtle)",
  },
  accent: {
    background:
      "linear-gradient(145deg, var(--color-primary-soft) 0%, var(--color-bg-elevated) 100%)",
    border: "1px solid var(--color-border-glow)",
    boxShadow:
      "0 10px 24px var(--color-primary-glow), 10px 10px 24px rgba(0,0,0,0.05), -6px -6px 18px var(--color-glass-subtle)",
  },
};

const radiusClasses: Record<SurfaceCardRadius, string> = {
  lg: "rounded-[18px]",
  xl: "rounded-3xl",
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
