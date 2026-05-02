import SurfaceCard from "./SurfaceCard";

export interface CardSkeletonProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = "",
  lines = 3,
  showHeader = true,
}) => (
  <SurfaceCard
    aria-hidden="true"
    className={`gap-3 overflow-hidden p-4 ${className}`.trim()}
    variant="raised"
  >
    {showHeader ? (
      <div className="flex items-center justify-between gap-3">
        <div className="animate-shimmer h-4 w-28 rounded-full bg-[var(--color-glass-medium)]" />
        <div className="animate-shimmer h-7 w-20 rounded-full bg-[var(--color-glass-soft)]" />
      </div>
    ) : null}

    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`animate-shimmer h-3 rounded-full bg-[var(--color-glass-soft)] ${
            index === lines - 1 ? "w-2/3" : "w-full"
          }`}
        />
      ))}
    </div>

    <div className="grid grid-cols-2 gap-2.5">
      <div className="animate-shimmer h-16 rounded-[18px] bg-[var(--color-glass-soft)]" />
      <div className="animate-shimmer h-16 rounded-[18px] bg-[var(--color-glass-soft)]" />
    </div>
  </SurfaceCard>
);

export default CardSkeleton;
