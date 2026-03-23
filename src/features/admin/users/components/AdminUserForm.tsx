import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Role } from "../../../../core/auth/types";
import Button from "../../../../ui/components/Button";
import SurfaceCard from "../../../../ui/components/SurfaceCard";

const createSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Debe incluir mayúscula, minúscula, número y símbolo"
    ),
  nombres: z
    .string()
    .trim()
    .min(1, "Los nombres son obligatorios")
    .max(100, "Los nombres son demasiado largos"),
  apellidos: z
    .string()
    .trim()
    .min(1, "Los apellidos son obligatorios")
    .max(100, "Los apellidos son demasiado largos"),
  rol: z.enum(["GUIA", "SUPERVISOR", "SUPER_ADMIN"]),
});

const editSchema = z.object({
  nombres: z
    .string()
    .trim()
    .min(1, "Los nombres son obligatorios")
    .max(100, "Los nombres son demasiado largos"),
  apellidos: z
    .string()
    .trim()
    .min(1, "Los apellidos son obligatorios")
    .max(100, "Los apellidos son demasiado largos"),
  rol: z.enum(["GUIA", "SUPERVISOR", "SUPER_ADMIN"]),
  activo: z.boolean(),
});

export type AdminUserCreateFormValues = z.infer<typeof createSchema>;
export type AdminUserEditFormValues = z.infer<typeof editSchema>;

interface AdminUserFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<AdminUserCreateFormValues & AdminUserEditFormValues> | null;
  isLoading?: boolean;
  error?: string | null;
  helperMessage?: string | null;
  onCancel?: () => void;
  onSubmit:
    | ((values: AdminUserCreateFormValues) => void | Promise<void>)
    | ((values: AdminUserEditFormValues) => void | Promise<void>);
}

const ROLE_OPTIONS: Array<{ value: Role; label: string; help: string }> = [
  {
    value: "GUIA",
    label: "Guía",
    help: "Operación diaria, turnos y flujo en campo.",
  },
  {
    value: "SUPERVISOR",
    label: "Supervisor",
    help: "Coordinación y supervisión operativa.",
  },
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    help: "Control total de administración y configuración.",
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

const AdminUserForm: React.FC<AdminUserFormProps> = ({
  mode,
  initialValues,
  isLoading = false,
  error,
  helperMessage,
  onCancel,
  onSubmit,
}) => {
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: isEdit
      ? {
          nombres: initialValues?.nombres ?? "",
          apellidos: initialValues?.apellidos ?? "",
          rol: initialValues?.rol ?? "GUIA",
          activo: initialValues?.activo ?? true,
        }
      : {
          email: initialValues?.email ?? "",
          password: "",
          nombres: initialValues?.nombres ?? "",
          apellidos: initialValues?.apellidos ?? "",
          rol: initialValues?.rol ?? "GUIA",
        },
  });

  useEffect(() => {
    if (isEdit) {
      reset({
        nombres: initialValues?.nombres ?? "",
        apellidos: initialValues?.apellidos ?? "",
        rol: initialValues?.rol ?? "GUIA",
        activo: initialValues?.activo ?? true,
      });
      return;
    }

    reset({
      email: initialValues?.email ?? "",
      password: "",
      nombres: initialValues?.nombres ?? "",
      apellidos: initialValues?.apellidos ?? "",
      rol: initialValues?.rol ?? "GUIA",
    });
  }, [
    initialValues?.activo,
    initialValues?.apellidos,
    initialValues?.email,
    initialValues?.nombres,
    initialValues?.rol,
    isEdit,
    reset,
  ]);

  const roleValue = watch("rol") as Role;
  const activeValue = isEdit ? Boolean(watch("activo")) : true;

  return (
    <form
      onSubmit={handleSubmit((values: any) => {
        if (isEdit) {
          const payload: AdminUserEditFormValues = {
            nombres: String(values.nombres ?? "").trim(),
            apellidos: String(values.apellidos ?? "").trim(),
            rol: values.rol,
            activo: Boolean(values.activo),
          };

          return (onSubmit as (values: AdminUserEditFormValues) => void | Promise<void>)(payload);
        }

        const payload: AdminUserCreateFormValues = {
          email: String(values.email ?? "").trim().toLowerCase(),
          password: String(values.password ?? ""),
          nombres: String(values.nombres ?? "").trim(),
          apellidos: String(values.apellidos ?? "").trim(),
          rol: values.rol,
        };

        return (onSubmit as (values: AdminUserCreateFormValues) => void | Promise<void>)(payload);
      })}
      className="space-y-4"
    >
      <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
            {isEdit ? "Datos del usuario" : "Nuevo usuario"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-fg-muted)]">
            {isEdit
              ? "Aquí puedes ajustar nombres, rol y estado activo del usuario creado."
              : "Este flujo crea el usuario directamente en el backend. A diferencia de invitaciones, aquí debes definir contraseña inicial."}
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

        {!isEdit ? (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Correo
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="Ej. guia@empresa.com"
              disabled={isLoading}
              className={inputClassName}
              style={inputStyle}
            />
            {errors.email?.message ? (
              <p className="text-xs text-[var(--color-danger)]">
                {String(errors.email.message)}
              </p>
            ) : null}
          </div>
        ) : null}

        {!isEdit ? (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Contraseña inicial
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="Ej. Temporal#2026"
              disabled={isLoading}
              className={inputClassName}
              style={inputStyle}
            />
            {errors.password?.message ? (
              <p className="text-xs text-[var(--color-danger)]">
                {String(errors.password.message)}
              </p>
            ) : (
              <p className="text-xs text-[var(--color-fg-muted)]">
                Debe incluir mayúscula, minúscula, número y símbolo.
              </p>
            )}
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Nombres
          </label>
          <input
            {...register("nombres")}
            type="text"
            placeholder="Nombres del usuario"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
          {errors.nombres?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {String(errors.nombres.message)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Apellidos
          </label>
          <input
            {...register("apellidos")}
            type="text"
            placeholder="Apellidos del usuario"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
          {errors.apellidos?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {String(errors.apellidos.message)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Rol
          </label>
          <select
            value={roleValue}
            disabled={isLoading}
            onChange={(event) => {
              setValue("rol", event.target.value as Role, {
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
          <p className="text-xs text-[var(--color-fg-muted)]">
            {ROLE_OPTIONS.find((option) => option.value === roleValue)?.help}
          </p>
        </div>

        {isEdit ? (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Estado activo
            </label>
            <select
              value={String(activeValue)}
              disabled={isLoading}
              onChange={(event) => {
                setValue("activo", event.target.value === "true", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              className={inputClassName}
              style={inputStyle}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
            {errors.activo?.message ? (
              <p className="text-xs text-[var(--color-danger)]">
                {String(errors.activo.message)}
              </p>
            ) : null}
          </div>
        ) : null}
      </SurfaceCard>

      <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          disabled={isLoading || (isEdit && !isDirty)}
        >
          {isEdit ? "Guardar cambios" : "Crear usuario"}
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

export default AdminUserForm;