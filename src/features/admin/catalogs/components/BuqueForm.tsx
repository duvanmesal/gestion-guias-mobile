import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../../ui/components/Button";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import type { CatalogStatus, PaisLookupItem } from "../types/catalogs.types";

const buqueFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede superar 20 caracteres"),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(120, "El nombre no puede superar 120 caracteres"),
  paisId: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || Number(value) > 0, "Selecciona un país válido"),
  capacidad: z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      return Number(value);
    },
    z
      .number({
        invalid_type_error: "La capacidad debe ser numérica",
      })
      .int("La capacidad debe ser un número entero")
      .positive("La capacidad debe ser mayor a 0")
      .max(200000, "La capacidad no puede superar 200000")
      .optional()
  ),
  naviera: z.preprocess(
    (value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    },
    z
      .string()
      .min(2, "La naviera debe tener al menos 2 caracteres")
      .max(80, "La naviera no puede superar 80 caracteres")
      .optional()
  ),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

export type BuqueFormValues = z.infer<typeof buqueFormSchema>;

interface BuqueFormProps {
  countries: PaisLookupItem[];
  initialValues?: {
    codigo?: string;
    nombre?: string;
    paisId?: number;
    capacidad?: number | null;
    naviera?: string | null;
    status?: CatalogStatus;
  } | null;
  isLoading?: boolean;
  isEdit?: boolean;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (values: {
    codigo: string;
    nombre: string;
    paisId?: number;
    capacidad?: number | null;
    naviera?: string | null;
    status: CatalogStatus;
  }) => void | Promise<void>;
}

const STATUS_OPTIONS: Array<{ value: CatalogStatus; label: string }> = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
];

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "var(--color-glass-subtle)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow: "var(--shadow-neu-inset)",
} as const;

const BuqueForm: React.FC<BuqueFormProps> = ({
  countries,
  initialValues,
  isLoading = false,
  isEdit = false,
  error,
  onCancel,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<BuqueFormValues>({
    resolver: zodResolver(buqueFormSchema),
    defaultValues: {
      codigo: initialValues?.codigo ?? "",
      nombre: initialValues?.nombre ?? "",
      paisId: initialValues?.paisId ? String(initialValues.paisId) : "",
      capacidad:
        typeof initialValues?.capacidad === "number"
          ? initialValues.capacidad
          : undefined,
      naviera: initialValues?.naviera ?? "",
      status: initialValues?.status ?? "ACTIVO",
    },
  });

  useEffect(() => {
    reset({
      codigo: initialValues?.codigo ?? "",
      nombre: initialValues?.nombre ?? "",
      paisId: initialValues?.paisId ? String(initialValues.paisId) : "",
      capacidad:
        typeof initialValues?.capacidad === "number"
          ? initialValues.capacidad
          : undefined,
      naviera: initialValues?.naviera ?? "",
      status: initialValues?.status ?? "ACTIVO",
    });
  }, [
    initialValues?.codigo,
    initialValues?.nombre,
    initialValues?.paisId,
    initialValues?.capacidad,
    initialValues?.naviera,
    initialValues?.status,
    reset,
  ]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit({
          codigo: values.codigo.trim().toUpperCase(),
          nombre: values.nombre.trim(),
          paisId: values.paisId ? Number(values.paisId) : undefined,
          capacidad:
            typeof values.capacidad === "number" ? values.capacidad : undefined,
          naviera: values.naviera?.trim() || undefined,
          status: values.status,
        });
      })}
      className="space-y-4"
    >
      <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
            {isEdit ? "Datos del buque" : "Nuevo buque"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-fg-muted)]">
            Define código, nombre, país de bandera, capacidad, naviera y estado
            operativo.
          </p>
        </div>

        {error ? (
          <div
            className="rounded-2xl border px-3 py-3 text-sm"
            style={{
              background: "var(--color-danger-soft)",
              borderColor: "var(--color-danger-border)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Código
          </label>
          <input
            {...register("codigo")}
            type="text"
            autoCapitalize="characters"
            maxLength={20}
            placeholder="Ej. MSC-SEAVIEW"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
          {errors.codigo?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.codigo.message}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-fg-muted)]">
              Campo obligatorio. Debe ser único en el catálogo.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Nombre
          </label>
          <input
            {...register("nombre")}
            type="text"
            placeholder="Ej. MSC Seaview"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
          {errors.nombre?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.nombre.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            País de bandera
          </label>
          <select
            {...register("paisId")}
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          >
            <option value="">Sin país asociado</option>
            {countries.map((country) => (
              <option key={country.id} value={String(country.id)}>
                {country.codigo} · {country.nombre}
              </option>
            ))}
          </select>
          {errors.paisId?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.paisId.message}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-fg-muted)]">
              Opcional según el backend actual, pero útil para reportes y filtros.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Capacidad
          </label>
          <input
            {...register("capacidad")}
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="Ej. 5200"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
          {errors.capacidad?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.capacidad.message}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-fg-muted)]">
              Campo opcional. Úsalo para fichas operativas o filtros futuros.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Naviera
          </label>
          <input
            {...register("naviera")}
            type="text"
            placeholder="Ej. MSC Cruises"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
          {errors.naviera?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.naviera.message}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-fg-muted)]">
              Campo opcional.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Estado
          </label>
          <select
            {...register("status")}
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.status?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.status.message}
            </p>
          ) : null}
        </div>
      </SurfaceCard>

      <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading || (isEdit && !isDirty)}
        >
          {isEdit ? "Guardar cambios" : "Crear buque"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={isLoading}
          onClick={onCancel}
        >
          Cancelar
        </Button>

        {isEdit && !isDirty ? (
          <p className="text-center text-xs text-[var(--color-fg-muted)]">
            Modifica un campo para habilitar el guardado.
          </p>
        ) : null}
      </SurfaceCard>
    </form>
  );
};

export default BuqueForm;