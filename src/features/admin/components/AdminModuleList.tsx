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
        fontSize: "0.6875rem", fontWeight: 700, color: "var(--color-fg-muted)",
        textTransform: "uppercase", letterSpacing: "0.1em",
      }}>
        {title}
      </h2>
      <span style={{ fontSize: "0.6875rem", color: "var(--color-fg-muted)" }}>
        {items.length} módulos
      </span>
    </div>

    {/* List card */}
    <div style={{
      background: "var(--color-bg-elevated)",
      borderRadius: 20,
      border: "1px solid var(--color-glass-medium)",
      boxShadow: "0 1px 3px var(--color-shadow-sm)",
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
            <div style={{ height: 1, background: "var(--color-glass-soft)", marginLeft: 60 }} />
          )}
        </div>
      ))}
    </div>
  </section>
);

export default AdminModuleList;
