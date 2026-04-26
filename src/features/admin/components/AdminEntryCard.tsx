interface AdminEntryCardProps {
  title: string;
  description: string;
  roleLabel: string;
}

const AdminEntryCard: React.FC<AdminEntryCardProps> = ({
  title,
  description,
  roleLabel,
}) => (
  <section
    className="relative overflow-hidden rounded-[24px] border px-5 py-5"
    style={{
      background:
        "linear-gradient(150deg, rgba(20,16,52,0.99) 0%, rgba(8,7,24,0.98) 100%)",
      borderColor: "rgba(139,92,246,0.18)",
      borderTopColor: "rgba(139,92,246,0.35)",
      boxShadow:
        "0 18px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(139,92,246,0.10)",
    }}
  >
    {/* Aurora accent */}
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: -60,
        right: -40,
        width: 200,
        height: 200,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 65%)",
        pointerEvents: "none",
      }}
    />
    <div
      aria-hidden
      style={{
        position: "absolute",
        bottom: -50,
        left: -30,
        width: 180,
        height: 180,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)",
        pointerEvents: "none",
      }}
    />

    <div className="relative z-10 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.24em]"
          style={{ color: "var(--color-accent)" }}
        >
          Acceso administrativo
        </p>
        <h1
          className="mt-2 text-2xl font-extrabold leading-tight"
          style={{ color: "var(--color-fg-primary)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h1>
      </div>

      <span
        className="shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold"
        style={{
          color: "var(--color-primary-light)",
          borderColor: "var(--color-border-glow)",
          background: "var(--color-primary-soft)",
          boxShadow: "0 0 12px var(--color-primary-glow)",
        }}
      >
        {roleLabel}
      </span>
    </div>

    <p
      className="relative z-10 mt-3 text-sm leading-6"
      style={{ color: "var(--color-fg-secondary)" }}
    >
      {description}
    </p>
  </section>
);

export default AdminEntryCard;
