import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../../ui/components/Button";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import type { CatalogStatus } from "../types/catalogs.types";

const paisFormSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(10, "El código no puede superar 10 caracteres"),
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

export type PaisFormValues = z.infer<typeof paisFormSchema>;

interface PaisFormProps {
  initialValues?: Partial<PaisFormValues> | null;
  isLoading?: boolean;
  isEdit?: boolean;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (values: PaisFormValues) => void | Promise<void>;
}

const STATUS_OPTIONS: Array<{ value: CatalogStatus; label: string }> = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
];

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "rgba(255,255,255,0.03)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow:
    "inset 2px 2px 5px rgba(0,0,0,0.35), inset -2px -2px 5px rgba(255,255,255,0.03)",
} as const;

const PaisForm: React.FC<PaisFormProps> = ({
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
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PaisFormValues>({
    resolver: zodResolver(paisFormSchema),
    defaultValues: {
      codigo: initialValues?.codigo ?? "",
      nombre: initialValues?.nombre ?? "",
      status: initialValues?.status ?? "ACTIVO",
    },
  });

  useEffect(() => {
    reset({
      codigo: initialValues?.codigo ?? "",
      nombre: initialValues?.nombre ?? "",
      status: initialValues?.status ?? "ACTIVO",
    });
  }, [
    initialValues?.codigo,
    initialValues?.nombre,
    initialValues?.status,
    reset,
  ]);

  const statusValue = watch("status");

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit({
          codigo: values.codigo.trim().toUpperCase(),
          nombre: values.nombre.trim(),
          status: values.status,
        });
      })}
      className="space-y-4"
    >
      <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
            {isEdit ? "Datos del país" : "Nuevo país"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-fg-muted)]">
            Administra el código, el nombre visible y el estado operativo del
            catálogo.
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
            maxLength={10}
            placeholder="Ej. CO"
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
              Usa el código ISO o el código interno definido por negocio.
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
            placeholder="Ej. Colombia"
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
            Estado
          </label>
          <select
            value={statusValue}
            onChange={(event) => {
              setValue("status", event.target.value as CatalogStatus, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
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
          {isEdit ? "Guardar cambios" : "Crear país"}
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

export default PaisForm;