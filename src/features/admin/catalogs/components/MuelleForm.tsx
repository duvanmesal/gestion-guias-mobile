import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../../ui/components/Button";
import SearchSelect from "../../../../ui/components/SearchSelect";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import type { CatalogStatus, PuertoLookupItem } from "../types/catalogs.types";

const STATUS_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
];

const muelleFormSchema = z.object({
  codigo: z.string().trim().min(2).max(20),
  nombre: z.string().trim().min(2).max(120),
  puertoId: z.string().min(1, "Selecciona un puerto"),
  capacidadCruceros: z.preprocess(
    (value) => {
      if (value === "" || value == null) return undefined;
      return Number(value);
    },
    z.number().int().positive().max(50).optional()
  ),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

export type MuelleFormValues = z.infer<typeof muelleFormSchema>;

interface MuelleFormProps {
  puertos: PuertoLookupItem[];
  initialValues?: {
    codigo?: string;
    nombre?: string;
    puertoId?: number;
    capacidadCruceros?: number | null;
    status?: CatalogStatus;
  } | null;
  isLoading?: boolean;
  isEdit?: boolean;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (values: {
    codigo: string;
    nombre: string;
    puertoId: number;
    capacidadCruceros?: number | null;
    status: CatalogStatus;
  }) => void | Promise<void>;
}

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "var(--color-glass-subtle)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow: "var(--shadow-neu-inset)",
} as const;

const MuelleForm: React.FC<MuelleFormProps> = ({
  puertos,
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
    control,
    formState: { errors, isDirty },
  } = useForm<MuelleFormValues>({
    resolver: zodResolver(muelleFormSchema),
    defaultValues: {
      codigo: initialValues?.codigo ?? "",
      nombre: initialValues?.nombre ?? "",
      puertoId: initialValues?.puertoId ? String(initialValues.puertoId) : "",
      capacidadCruceros:
        typeof initialValues?.capacidadCruceros === "number"
          ? initialValues.capacidadCruceros
          : undefined,
      status: initialValues?.status ?? "ACTIVO",
    },
  });

  useEffect(() => {
    reset({
      codigo: initialValues?.codigo ?? "",
      nombre: initialValues?.nombre ?? "",
      puertoId: initialValues?.puertoId ? String(initialValues.puertoId) : "",
      capacidadCruceros:
        typeof initialValues?.capacidadCruceros === "number"
          ? initialValues.capacidadCruceros
          : undefined,
      status: initialValues?.status ?? "ACTIVO",
    });
  }, [
    initialValues?.capacidadCruceros,
    initialValues?.codigo,
    initialValues?.nombre,
    initialValues?.puertoId,
    initialValues?.status,
    reset,
  ]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit({
          codigo: values.codigo.trim().toUpperCase(),
          nombre: values.nombre.trim(),
          puertoId: Number(values.puertoId),
          capacidadCruceros:
            typeof values.capacidadCruceros === "number"
              ? values.capacidadCruceros
              : undefined,
          status: values.status,
        });
      })}
      className="space-y-4"
    >
      <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
            {isEdit ? "Datos del muelle" : "Nuevo muelle"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-fg-muted)]">
            Asocia el muelle a un puerto para usarlo en recaladas.
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

        <Field label="Código" error={errors.codigo?.message}>
          <input
            {...register("codigo")}
            autoCapitalize="characters"
            maxLength={20}
            placeholder="Ej. M-1"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
        </Field>

        <Field label="Nombre" error={errors.nombre?.message}>
          <input
            {...register("nombre")}
            maxLength={120}
            placeholder="Muelle principal"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
        </Field>

        <Field label="Puerto" error={errors.puertoId?.message}>
          <Controller
            control={control}
            name="puertoId"
            render={({ field }) => (
              <SearchSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                options={puertos}
                getOptionValue={(p) => String(p.id)}
                getOptionLabel={(p) => `${p.codigo} · ${p.nombre}`}
                placeholder="Selecciona un puerto"
                searchPlaceholder="Buscar puerto…"
                label="Puerto"
                disabled={isLoading}
                error={errors.puertoId?.message}
              />
            )}
          />
        </Field>

        <Field label="Capacidad cruceros" error={errors.capacidadCruceros?.message}>
          <input
            {...register("capacidadCruceros")}
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            placeholder="Ej. 2"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
        </Field>

        <Field label="Estado" error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SearchSelect
                value={field.value ?? "ACTIVO"}
                onChange={field.onChange}
                options={STATUS_OPTIONS}
                getOptionValue={(o) => o.value}
                getOptionLabel={(o) => o.label}
                label="Estado"
                searchable={false}
                disabled={isLoading}
              />
            )}
          />
        </Field>
      </SurfaceCard>

      <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading || (isEdit && !isDirty)}
        >
          {isEdit ? "Guardar cambios" : "Crear muelle"}
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
      </SurfaceCard>
    </form>
  );
};

const Field: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div className="space-y-2">
    <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
      {label}
    </label>
    {children}
    {error ? <p className="text-xs text-[var(--color-danger)]">{error}</p> : null}
  </div>
);

export default MuelleForm;
