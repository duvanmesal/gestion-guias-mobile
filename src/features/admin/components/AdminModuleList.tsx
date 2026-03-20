import AdminModuleRow from "./AdminModuleRow";

export interface AdminModuleListItem {
  key: string;
  title: string;
  description: string;
  onOpen: () => void;
  badge?: string;
  helperText?: string;
  disabled?: boolean;
}

interface AdminModuleListProps {
  title: string;
  items: AdminModuleListItem[];
}

const AdminModuleList: React.FC<AdminModuleListProps> = ({ title, items }) => (
  <section
    className="rounded-[26px] border p-4"
    style={{
      background: "rgba(20,26,33,0.76)",
      borderColor: "rgba(255,255,255,0.06)",
      boxShadow:
        "inset 1px 1px 0 rgba(255,255,255,0.03), inset -1px -1px 0 rgba(0,0,0,0.18)",
    }}
  >
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2
        className="text-sm font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--color-fg-muted)" }}
      >
        {title}
      </h2>
      <span
        className="text-[11px] font-medium"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        {items.length} accesos
      </span>
    </div>

    <div className="space-y-3">
      {items.map((item) => (
        <AdminModuleRow
          key={item.key}
          title={item.title}
          description={item.description}
          onOpen={item.onOpen}
          badge={item.badge}
          helperText={item.helperText}
          disabled={item.disabled}
        />
      ))}
    </div>
  </section>
);

export default AdminModuleList;