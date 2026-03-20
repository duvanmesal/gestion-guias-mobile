interface AdminModuleRowProps {
  title: string;
  description: string;
  onOpen: () => void;
}

const AdminModuleRow: React.FC<AdminModuleRowProps> = ({
  title,
  description,
  onOpen,
}) => (
  <button
    type="button"
    onClick={onOpen}
    className="flex w-full items-center justify-between gap-4 rounded-[22px] border px-4 py-4 text-left transition-transform duration-200 active:scale-[0.99]"
    style={{
      background:
        "linear-gradient(145deg, rgba(22,29,36,1) 0%, rgba(18,25,32,1) 100%)",
      borderColor: "rgba(255,255,255,0.06)",
      boxShadow:
        "6px 6px 16px rgba(0,0,0,0.24), -3px -3px 10px rgba(255,255,255,0.02)",
    }}
  >
    <div className="min-w-0">
      <p
        className="text-sm font-semibold"
        style={{ color: "var(--color-fg-primary)" }}
      >
        {title}
      </p>
      <p
        className="mt-1 text-xs leading-5"
        style={{ color: "var(--color-fg-secondary)" }}
      >
        {description}
      </p>
    </div>

    <span
      className="shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold"
      style={{
        background: "rgba(34,139,84,0.12)",
        color: "var(--color-primary)",
      }}
    >
      Abrir
    </span>
  </button>
);

export default AdminModuleRow;
