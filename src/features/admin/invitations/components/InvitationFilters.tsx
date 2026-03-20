import Button from "../../../../ui/components/Button";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import PageSectionHeader from "../../../../ui/components/PageSectionHeader";
import type { InvitationStatus } from "../types/invitations.types";

interface InvitationFiltersProps {
  draftEmail: string;
  status: InvitationStatus | "";
  isFetching?: boolean;
  onDraftEmailChange: (value: string) => void;
  onStatusChange: (value: InvitationStatus | "") => void;
  onSubmit: () => void;
  onClear: () => void;
}

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "rgba(255,255,255,0.03)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow:
    "inset 2px 2px 5px rgba(0,0,0,0.35), inset -2px -2px 5px rgba(255,255,255,0.03)",
} as const;

const STATUS_OPTIONS: Array<{
  value: InvitationStatus | "";
  label: string;
}> = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "USED", label: "Usadas" },
  { value: "EXPIRED", label: "Expiradas" },
];

const InvitationFilters: React.FC<InvitationFiltersProps> = ({
  draftEmail,
  status,
  isFetching = false,
  onDraftEmailChange,
  onStatusChange,
  onSubmit,
  onClear,
}) => (
  <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
    <PageSectionHeader
      title="Búsqueda y filtros"
      description="Busca por correo exacto o filtra por estado para revisar invitaciones recientes."
    />

    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
          Correo del invitado
        </label>
        <input
          type="email"
          value={draftEmail}
          placeholder="Ej. guia@dominio.com"
          disabled={isFetching}
          onChange={(event) => {
            onDraftEmailChange(event.target.value);
          }}
          className={inputClassName}
          style={inputStyle}
        />
        <p className="text-xs text-[var(--color-fg-muted)]">
          La búsqueda por email se envía exacta al backend para evitar ruido.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
          Estado
        </label>
        <select
          value={status}
          disabled={isFetching}
          onChange={(event) => {
            onStatusChange(event.target.value as InvitationStatus | "");
          }}
          className={inputClassName}
          style={inputStyle}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button type="submit" variant="primary" size="md" isLoading={isFetching}>
          Aplicar
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isFetching}
          onClick={onClear}
        >
          Limpiar
        </Button>
      </div>
    </form>
  </SurfaceCard>
);

export default InvitationFilters;