import type { ProfileStatus, Role } from "../../../../core/auth/types";
import Button from "../../../../ui/components/Button";
import PageSectionHeader from "../../../../ui/components/PageSectionHeader";
import SurfaceCard from "../../../../ui/components/SurfaceCard";

interface AdminUserFiltersProps {
  draftSearch: string;
  rol: Role | "";
  activo: "" | "true" | "false";
  profileStatus: ProfileStatus | "";
  isFetching?: boolean;
  onDraftSearchChange: (value: string) => void;
  onRolChange: (value: Role | "") => void;
  onActivoChange: (value: "" | "true" | "false") => void;
  onProfileStatusChange: (value: ProfileStatus | "") => void;
  onSubmit: () => void;
  onClear: () => void;
}

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "var(--color-glass-subtle)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow: "var(--shadow-neu-inset)",
} as const;

const ROLE_OPTIONS: Array<{ value: Role | ""; label: string }> = [
  { value: "", label: "Todos los roles" },
  { value: "GUIA", label: "Guía" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

const ACTIVE_OPTIONS: Array<{
  value: "" | "true" | "false";
  label: string;
}> = [
  { value: "", label: "Todos los estados" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
];

const PROFILE_OPTIONS: Array<{ value: ProfileStatus | ""; label: string }> = [
  { value: "", label: "Todos los perfiles" },
  { value: "COMPLETE", label: "Perfil completo" },
  { value: "INCOMPLETE", label: "Perfil incompleto" },
];

const AdminUserFilters: React.FC<AdminUserFiltersProps> = ({
  draftSearch,
  rol,
  activo,
  profileStatus,
  isFetching = false,
  onDraftSearchChange,
  onRolChange,
  onActivoChange,
  onProfileStatusChange,
  onSubmit,
  onClear,
}) => (
  <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
    <PageSectionHeader
      title="Búsqueda y filtros"
      description="Filtra por nombre, correo, rol, estado activo y avance del perfil para encontrar rápido al usuario correcto."
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
          Buscar usuario
        </label>
        <input
          type="text"
          value={draftSearch}
          placeholder="Nombre, apellido o correo"
          disabled={isFetching}
          onChange={(event) => {
            onDraftSearchChange(event.target.value);
          }}
          className={inputClassName}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Rol
          </label>
          <select
            value={rol}
            disabled={isFetching}
            onChange={(event) => {
              onRolChange(event.target.value as Role | "");
            }}
            className={inputClassName}
            style={inputStyle}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value || "all-roles"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Estado
          </label>
          <select
            value={activo}
            disabled={isFetching}
            onChange={(event) => {
              onActivoChange(event.target.value as "" | "true" | "false");
            }}
            className={inputClassName}
            style={inputStyle}
          >
            {ACTIVE_OPTIONS.map((option) => (
              <option key={option.value || "all-status"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
          Perfil
        </label>
        <select
          value={profileStatus}
          disabled={isFetching}
          onChange={(event) => {
            onProfileStatusChange(event.target.value as ProfileStatus | "");
          }}
          className={inputClassName}
          style={inputStyle}
        >
          {PROFILE_OPTIONS.map((option) => (
            <option key={option.value || "all-profile"} value={option.value}>
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

export default AdminUserFilters;