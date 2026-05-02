interface AdminEntryCardProps {
  title: string;
  description: string;
  roleLabel: string;
}

const AdminEntryCard: React.FC<AdminEntryCardProps> = ({ title, roleLabel }) => (
  <div
    style={{
      background: "linear-gradient(140deg, #2563EB 0%, #1D4ED8 60%, #1E40AF 100%)",
      borderRadius: 24,
      padding: "24px 22px 22px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Decorative circles */}
    <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: -30, left: -30, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: 20, right: 80, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

    <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Administración
        </p>
        <span style={{
          fontSize: 11, fontWeight: 700, color: "white",
          background: "rgba(255,255,255,0.18)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 999, padding: "3px 10px",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {roleLabel}
        </span>
      </div>

      <h1 style={{
        fontSize: 26, fontWeight: 800, color: "white",
        marginTop: 10, letterSpacing: "-0.02em", lineHeight: 1.18,
      }}>
        {title}
      </h1>

      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", marginTop: 6, lineHeight: 1.5 }}>
        Gestiona catálogos, usuarios y accesos desde aquí.
      </p>
    </div>
  </div>
);

export default AdminEntryCard;
