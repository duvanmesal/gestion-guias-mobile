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
  <section
    className="rounded-[24px] border p-4"
    style={{
      background: "var(--color-bg-elevated)",
      borderColor: "var(--color-glass-soft)",
      boxShadow:
        "inset 1px 1px 0 rgba(255,255,255,0.03), inset -1px -1px 0 rgba(0,0,0,0.18)",
    }}
  >
    <div className="mb-3 flex items-center gap-2">
      <span
        aria-hidden
        style={{
          width: 3, height: 13, borderRadius: 2,
          background: "var(--color-primary)", opacity: 0.9,
          flexShrink: 0,
        }}
      />
      <h2
        className="text-[11px] font-bold uppercase tracking-[0.18em]"
        style={{ color: "var(--color-primary)" }}
      >
        {title}
      </h2>
      <span
        className="ml-auto text-[11px] font-medium"
        style={{ color: "var(--color-fg-muted)" }}
      >
        {items.length} accesos
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3 auto-rows-fr">
      {items.map((item) => (
        <AdminModuleRow
          key={item.key}
          title={item.title}
          description={item.description}
          onOpen={item.onOpen}
          badge={item.badge}
          helperText={item.helperText}
          disabled={item.disabled}
          tone={item.tone}
          icon={item.icon}
        />
      ))}
    </div>
  </section>
);

export default AdminModuleList;
