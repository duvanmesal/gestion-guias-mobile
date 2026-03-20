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
    className="rounded-[28px] border px-5 py-5"
    style={{
      background:
        "linear-gradient(160deg, rgba(25,32,40,0.98) 0%, rgba(15,20,25,0.98) 100%)",
      borderColor: "rgba(255,255,255,0.08)",
      boxShadow:
        "10px 10px 28px rgba(0,0,0,0.28), -4px -4px 16px rgba(255,255,255,0.02)",
    }}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.24em]"
          style={{ color: "var(--color-accent)" }}
        >
          Acceso administrativo
        </p>
        <h1
          className="mt-2 text-2xl font-bold leading-tight"
          style={{ color: "var(--color-fg-primary)" }}
        >
          {title}
        </h1>
      </div>

      <span
        className="rounded-full border px-3 py-1 text-[11px] font-semibold"
        style={{
          color: "var(--color-primary)",
          borderColor: "rgba(34,139,84,0.22)",
          background: "rgba(34,139,84,0.1)",
        }}
      >
        {roleLabel}
      </span>
    </div>

    <p
      className="mt-3 text-sm leading-6"
      style={{ color: "var(--color-fg-secondary)" }}
    >
      {description}
    </p>
  </section>
);

export default AdminEntryCard;
