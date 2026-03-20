import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../../ui/components/Button";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import type { Role } from "../../../../core/auth/types";

const invitationFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
  role: z.enum(["GUIA", "SUPERVISOR", "SUPER_ADMIN"]),
});

export type InvitationFormValues = z.infer<typeof invitationFormSchema>;

interface InvitationFormProps {
  initialValues?: Partial<InvitationFormValues> | null;
  isLoading?: boolean;
  error?: string | null;
  helperMessage?: string | null;
  onCancel?: () => void;
  onSubmit: (values: InvitationFormValues) => void | Promise<void>;
}

const ROLE_OPTIONS: Array<{ value: Role; label: string; help: string }> = [
  {
    value: "GUIA",
    label: "Guía",
    help: "Acceso operativo para turnos, tareas y flujo de atención.",
  },
  {
    value: "SUPERVISOR",
    label: "Supervisor",
    help: "Acceso de coordinación y supervisión operativa del día a día.",
  },
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    help: "Acceso total para configuración, invitaciones y administración avanzada.",
  },
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

const InvitationForm: React.FC<InvitationFormProps> = ({
  initialValues,
  isLoading = false,
  error,
  helperMessage,
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
  } = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: {
      email: initialValues?.email ?? "",
      role: initialValues?.role ?? "GUIA",
    },
  });

  useEffect(() => {
    reset({
      email: initialValues?.email ?? "",
      role: initialValues?.role ?? "GUIA",
    });
  }, [initialValues?.email, initialValues?.role, reset]);

  const roleValue = watch("role");

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit({
          email: values.email.trim().toLowerCase(),
          role: values.role,
        });
      })}
      className="space-y-4"
    >
      <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
            Nueva invitación administrativa
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-fg-muted)]">
            Crea un acceso temporal para que el usuario reciba credenciales y
            complete su incorporación.
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

        {helperMessage ? (
          <div
            className="rounded-2xl border px-3 py-3 text-sm"
            style={{
              background: "rgba(34,139,84,0.12)",
              borderColor: "rgba(34,139,84,0.22)",
              color: "var(--color-primary)",
            }}
          >
            {helperMessage}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Correo
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="Ej. supervisor@corp.com"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
          {errors.email?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.email.message}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-fg-muted)]">
              Usa el correo real del usuario. La invitación queda asociada
              exactamente a ese email.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Rol inicial
          </label>
          <select
            value={roleValue}
            disabled={isLoading}
            onChange={(event) => {
              setValue("role", event.target.value as Role, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            className={inputClassName}
            style={inputStyle}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.role.message}
            </p>
          ) : (
            <p className="text-xs text-[var(--color-fg-muted)]">
              {ROLE_OPTIONS.find((option) => option.value === roleValue)?.help}
            </p>
          )}
        </div>
      </SurfaceCard>

      <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
        <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
          Crear invitación
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

        {!isDirty ? (
          <p className="text-center text-xs text-[var(--color-fg-muted)]">
            Completa los datos para generar el acceso temporal.
          </p>
        ) : null}
      </SurfaceCard>
    </form>
  );
};

export default InvitationForm;