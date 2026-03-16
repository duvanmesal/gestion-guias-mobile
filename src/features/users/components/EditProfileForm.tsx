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
    .min(7, "Telefono invalido")
    .max(20, "El telefono es demasiado largo")
    .regex(/^[0-9+\-\s()]+$/, "Formato de telefono invalido"),
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Form Fields Card */}
      <NeuCard className="p-6 animate-fade-up">
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <svg
              className="h-4 w-4"
              style={{ color: "var(--color-primary)" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
              Datos basicos
            </h2>
          </div>
          <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
            Solo editas nombre y contacto. Documento y verificacion tienen su propio flujo.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <NeuCard className="mb-4 p-3 animate-shake" inset>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--color-danger)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs font-medium text-[var(--color-danger)]">{error}</span>
            </div>
          </NeuCard>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <FormField
            id="nombres"
            label="Nombres"
            placeholder="Tus nombres"
            error={errors.nombres?.message}
            disabled={isLoading}
            {...register("nombres")}
          />

          <FormField
            id="apellidos"
            label="Apellidos"
            placeholder="Tus apellidos"
            error={errors.apellidos?.message}
            disabled={isLoading}
            {...register("apellidos")}
          />

          <FormField
            id="telefono"
            label="Telefono"
            type="tel"
            inputMode="tel"
            placeholder="Ej. +57 300 123 4567"
            error={errors.telefono?.message}
            disabled={isLoading}
            {...register("telefono")}
          />
        </div>
      </NeuCard>

      {/* Actions Card */}
      <NeuCard className="p-6 animate-fade-up" style={{ animationDelay: "50ms" }}>
        <div className="space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            disabled={isLoading || !isDirty}
            leftIcon={
              !isLoading ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : undefined
            }
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isLoading}
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            }
          >
            Cancelar
          </Button>
        </div>

        {!isDirty && (
          <p className="mt-4 text-center text-xs text-[var(--color-fg-muted)]">
            Modifica algun campo para guardar cambios
          </p>
        )}
      </NeuCard>
    </form>
  );
};

/* ================================
   NEUMORPHIC COMPONENTS
   ================================ */

const NeuCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  style?: React.CSSProperties;
}> = ({ children, className = "", inset = false, style }) => {
  const neuStyles = inset
    ? {
        background: "var(--color-bg-base)",
        boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.02)",
      }
    : {
        background: "linear-gradient(145deg, #161d24, #121920)",
        boxShadow: "4px 4px 10px rgba(0,0,0,0.4), -2px -2px 8px rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.03)",
      };

  return (
    <div className={`rounded-xl ${className}`} style={{ ...neuStyles, ...style }}>
      {children}
    </div>
  );
};

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = ({
  id,
  label,
  error,
  ...inputProps
}: FormFieldProps & { ref?: React.Ref<HTMLInputElement> }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-xs font-medium text-[var(--color-fg-secondary)] mb-2"
    >
      {label}
    </label>
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--color-bg-base)",
        boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.03)",
        border: error ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255,255,255,0.02)",
      }}
    >
      <input
        id={id}
        className="w-full bg-transparent px-4 py-3.5 text-sm outline-none"
        style={{ color: "var(--color-fg-primary)" }}
        {...inputProps}
      />
    </div>
    {error && (
      <p className="mt-1.5 text-xs text-[var(--color-danger)] flex items-center gap-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {error}
      </p>
    )}
  </div>
);

export default EditProfileForm;
