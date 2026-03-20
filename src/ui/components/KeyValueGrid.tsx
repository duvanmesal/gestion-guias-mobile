import SurfaceCard from "./SurfaceCard";

export interface KeyValueGridItem {
  accent?: boolean;
  label: string;
  mono?: boolean;
  value: React.ReactNode;
}

export interface KeyValueGridProps {
  className?: string;
  columns?: 2 | 3 | 4;
  items: KeyValueGridItem[];
}

const columnClassMap: Record<NonNullable<KeyValueGridProps["columns"]>, string> =
  {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

const KeyValueGrid: React.FC<KeyValueGridProps> = ({
  className = "",
  columns = 2,
  items,
}) => (
  <div className={`grid ${columnClassMap[columns]} gap-2.5 ${className}`.trim()}>
    {items.map((item) => (
      <SurfaceCard
        key={item.label}
        className="px-3 py-2.5"
        radius="lg"
        variant="inset"
      >
        <p className="text-[0.625rem] font-medium uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
          {item.label}
        </p>
        <div
          className={`mt-1 text-xs font-semibold ${
            item.mono ? "font-mono" : ""
          } ${
            item.accent
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-fg-secondary)]"
          }`}
        >
          {item.value}
        </div>
      </SurfaceCard>
    ))}
  </div>
);

export default KeyValueGrid;
