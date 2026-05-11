import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Error banner */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--color-danger-soft)",
            border: "1px solid var(--color-danger-border)",
            borderRadius: 14,
            padding: "12px 16px",
          }}
        >
          <svg style={{ width: 16, height: 16, color: "var(--color-danger)", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-danger)", fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* Fields card */}
      <div
        style={{
          background: "var(--color-bg-elevated)",
          borderRadius: 20,
          border: "1px solid var(--color-glass-medium)",
          boxShadow: "var(--shadow-neu-raised)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: "var(--color-fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          Datos personales
        </p>

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

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
        <SaveButton isDirty={isDirty} isLoading={isLoading} />

        {!isDirty && !isLoading && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.75rem",
              color: "var(--color-fg-muted)",
              margin: 0,
            }}
          >
            Modifica algun campo para guardar
          </p>
        )}

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          style={{
            background: "none",
            border: "none",
            padding: "10px",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--color-fg-secondary)",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.5 : 1,
            borderRadius: 12,
            transition: "opacity 0.15s",
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

/* ── Form field ── */

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormField = ({
  id,
  label,
  error,
  ...inputProps
}: FormFieldProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "var(--color-fg-secondary)",
        }}
      >
        {label}
      </label>

      <input
        id={id}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: error ? "var(--color-danger-soft)" : "var(--color-bg-base)",
          border: `1.5px solid ${
            error
              ? "var(--color-danger)"
              : focused
              ? "var(--color-primary)"
              : "var(--color-input-border)"
          }`,
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: "0.9375rem",
          color: "var(--color-fg-primary)",
          outline: "none",
          transition: "border-color 0.15s",
          boxSizing: "border-box",
        }}
        {...inputProps}
      />

      {error && (
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-danger)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/* ── Save button ── */

const SaveButton: React.FC<{ isDirty: boolean; isLoading: boolean }> = ({ isDirty, isLoading }) => (
  <button
    type="submit"
    disabled={isLoading || !isDirty}
    style={{
      width: "100%",
      background: isDirty && !isLoading ? "var(--color-primary)" : "var(--color-primary-glow)",
      color: "white",
      border: "none",
      borderRadius: 14,
      padding: "15px 20px",
      fontSize: "0.9375rem",
      fontWeight: 600,
      cursor: isDirty && !isLoading ? "pointer" : "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "background 0.2s, transform 0.1s",
      letterSpacing: "0.01em",
    }}
    onMouseDown={(e) => {
      if (isDirty && !isLoading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)";
    }}
    onMouseUp={(e) => {
      (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
    }}
  >
    {isLoading ? (
      <>
        <Spinner />
        Guardando...
      </>
    ) : (
      <>
        <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Guardar cambios
      </>
    )}
  </button>
);

const Spinner = () => (
  <svg
    style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path
      className="opacity-80"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default EditProfileForm;
