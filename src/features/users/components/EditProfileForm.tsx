import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../../../ui/components/Button";
import type { SessionUser } from "../../../core/auth/types";

const schema = z.object({
  nombres: z
    .string()
    .trim()
    .min(1, "Los nombres son requeridos")
    .max(100, "Los nombres son demasiado largos"),
  apellidos: z
    .string()
    .trim()
    .min(1, "Los apellidos son requeridos")
    .max(100, "Los apellidos son demasiado largos"),
  telefono: z
    .string()
    .trim()
    .min(7, "Teléfono inválido")
    .max(20, "El teléfono es demasiado largo")
    .regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido"),
});

export type EditProfileFormValues = z.infer<typeof schema>;

interface EditProfileFormProps {
  initialValues?: Pick<SessionUser, "nombres" | "apellidos" | "telefono"> | null;
  onSubmit: (values: EditProfileFormValues) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombres: initialValues?.nombres ?? "",
      apellidos: initialValues?.apellidos ?? "",
      telefono: initialValues?.telefono ?? "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    reset({
      nombres: initialValues?.nombres ?? "",
      apellidos: initialValues?.apellidos ?? "",
      telefono: initialValues?.telefono ?? "",
    });
  }, [
    initialValues?.nombres,
    initialValues?.apellidos,
    initialValues?.telefono,
    reset,
  ]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="glass-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--color-fg-primary)" }}>
            Editar mis datos
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-fg-muted)" }}>
            Aquí solo editas datos básicos. Documento, verificación y onboarding
            viven en su propio flujo.
          </p>
        </div>

        {error && (
          <div
            className="mb-5 rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              background: "rgba(185, 55, 55, 0.15)",
              border: "1px solid rgba(185, 55, 55, 0.4)",
              color: "#F87171",
            }}
          >
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="nombres" className="form-label">
              Nombres
            </label>
            <input
              id="nombres"
              type="text"
              placeholder="Tus nombres"
              className={`premium-input ${errors.nombres ? "error" : ""}`}
              disabled={isLoading}
              {...register("nombres")}
            />
            {errors.nombres && (
              <p className="form-error">{errors.nombres.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="apellidos" className="form-label">
              Apellidos
            </label>
            <input
              id="apellidos"
              type="text"
              placeholder="Tus apellidos"
              className={`premium-input ${errors.apellidos ? "error" : ""}`}
              disabled={isLoading}
              {...register("apellidos")}
            />
            {errors.apellidos && (
              <p className="form-error">{errors.apellidos.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="telefono" className="form-label">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              inputMode="tel"
              placeholder="Ej. +57 300 123 4567"
              className={`premium-input ${errors.telefono ? "error" : ""}`}
              disabled={isLoading}
              {...register("telefono")}
            />
            {errors.telefono && (
              <p className="form-error">{errors.telefono.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading || !isDirty}
          >
            {isLoading ? "Guardando cambios..." : "Guardar cambios"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditProfileForm;