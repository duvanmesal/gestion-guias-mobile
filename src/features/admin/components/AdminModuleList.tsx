import AdminModuleRow from "./AdminModuleRow";

type ModuleTone = "cyan" | "amber" | "teal" | "violet";

export interface AdminModuleListItem {
  key: string;
  title: string;
  description: string;
  onOpen: () => void;
  badge?: string;
  helperText?: string;
  disabled?: boolean;
  tone?: ModuleTone;
  icon?: React.ReactNode;
}

interface AdminModuleListProps {
  title: string;
  items: AdminModuleListItem[];
}

const AdminModuleList: React.FC<AdminModuleListProps> = ({ title, items }) => (
  <section>
    {/* Section header */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, padding: "0 2px" }}>
      <h2 style={{
        fontSize: 11, fontWeight: 700, color: "var(--color-fg-muted)",
        textTransform: "uppercase", letterSpacing: "0.13em",
      }}>
        {title}
      </h2>
      <span style={{ fontSize: 11, color: "var(--color-fg-muted)" }}>
        {items.length} módulos
      </span>
    </div>

    {/* List card */}
    <div style={{
      background: "#FFFFFF",
      borderRadius: 20,
      border: "1px solid rgba(0,0,0,0.07)",
      boxShadow: "0 2px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03)",
      overflow: "hidden",
      padding: "0 18px",
    }}>
      {items.map((item, i) => (
        <div key={item.key}>
          <AdminModuleRow
            title={item.title}
            description={item.description}
            onOpen={item.onOpen}
            badge={item.badge}
            helperText={item.helperText}
            disabled={item.disabled}
            tone={item.tone}
            icon={item.icon}
          />
          {i < items.length - 1 && (
            <div style={{ height: 1, background: "rgba(0,0,0,0.05)", marginLeft: 60 }} />
          )}
        </div>
      ))}
    </div>
  </section>
);

export default AdminModuleList;
