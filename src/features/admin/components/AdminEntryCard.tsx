interface AdminEntryCardProps {
  title: string;
  description: string;
  roleLabel: string;
}

const AdminEntryCard: React.FC<AdminEntryCardProps> = ({ title, roleLabel }) => (
  <div
    style={{
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-glass-medium)",
      borderRadius: 16,
      padding: "20px",
      boxShadow: "0 1px 3px var(--color-shadow-sm)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Administración
          </p>
          <h1 style={{ margin: "2px 0 0", fontSize: "1.125rem", fontWeight: 700, color: "var(--color-fg-primary)", letterSpacing: "-0.01em" }}>
            {title}
          </h1>
        </div>
      </div>

      <span
        style={{
          flexShrink: 0,
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: "var(--color-primary)",
          background: "var(--color-primary-soft)",
          borderRadius: 999,
          padding: "4px 10px",
          whiteSpace: "nowrap",
        }}
      >
        {roleLabel}
      </span>
    </div>
  </div>
);

export default AdminEntryCard;
