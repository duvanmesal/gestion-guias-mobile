import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../../ui/components/Button";
import SearchSelect from "../../../../ui/components/SearchSelect";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import type { CatalogStatus, PaisLookupItem } from "../types/catalogs.types";

const STATUS_OPTIONS = [
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
];

const puertoFormSchema = z.object({
  codigo: z.string().trim().min(2).max(20),
  nombre: z.string().trim().min(2).max(120),
  ciudad: z.string().trim().min(2).max(80),
  paisId: z.string().min(1, "Selecciona un país"),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

export type PuertoFormValues = z.infer<typeof puertoFormSchema>;

interface PuertoFormProps {
  countries: PaisLookupItem[];
  initialValues?: {
    codigo?: string;
    nombre?: string;
    ciudad?: string;
    paisId?: number;
    status?: CatalogStatus;
  } | null;
  isLoading?: boolean;
  isEdit?: boolean;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (values: {
    codigo: string;
    nombre: string;
    ciudad: string;
    paisId: number;
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

const PuertoForm: React.FC<PuertoFormProps> = ({
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
    control,
    formState: { errors, isDirty },
  } = useForm<PuertoFormValues>({
    resolver: zodResolver(puertoFormSchema),
    defaultValues: {
      codigo: initialValues?.codigo ?? "",
      nombre: initialValues?.nombre ?? "",
      ciudad: initialValues?.ciudad ?? "",
      paisId: initialValues?.paisId ? String(initialValues.paisId) : "",
      status: initialValues?.status ?? "ACTIVO",
    },
  });

  useEffect(() => {
    reset({
      codigo: initialValues?.codigo ?? "",
      nombre: initialValues?.nombre ?? "",
      ciudad: initialValues?.ciudad ?? "",
      paisId: initialValues?.paisId ? String(initialValues.paisId) : "",
      status: initialValues?.status ?? "ACTIVO",
    });
  }, [
    initialValues?.ciudad,
    initialValues?.codigo,
    initialValues?.nombre,
    initialValues?.paisId,
    initialValues?.status,
    reset,
  ]);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit({
          codigo: values.codigo.trim().toUpperCase(),
          nombre: values.nombre.trim(),
          ciudad: values.ciudad.trim(),
          paisId: Number(values.paisId),
          status: values.status,
        });
      })}
      className="space-y-4"
    >
      <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
            {isEdit ? "Datos del puerto" : "Nuevo puerto"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-fg-muted)]">
            Define el puerto usado como referencia logística en recaladas.
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
            placeholder="Ej. CTG"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
        </Field>

        <Field label="Nombre" error={errors.nombre?.message}>
          <input
            {...register("nombre")}
            maxLength={120}
            placeholder="Puerto de Cartagena"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
        </Field>

        <Field label="Ciudad" error={errors.ciudad?.message}>
          <input
            {...register("ciudad")}
            maxLength={80}
            placeholder="Cartagena"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
        </Field>

        <Field label="País" error={errors.paisId?.message}>
          <Controller
            control={control}
            name="paisId"
            render={({ field }) => (
              <SearchSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                options={countries}
                getOptionValue={(c) => String(c.id)}
                getOptionLabel={(c) => `${c.codigo} · ${c.nombre}`}
                placeholder="Selecciona un país"
                searchPlaceholder="Buscar país…"
                label="País"
                disabled={isLoading}
                error={errors.paisId?.message}
              />
            )}
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
          {isEdit ? "Guardar cambios" : "Crear puerto"}
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

export default PuertoForm;
