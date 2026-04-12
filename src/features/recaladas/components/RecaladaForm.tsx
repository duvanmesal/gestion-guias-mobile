import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../../../ui/components/Button";
import SurfaceCard from "../../../ui/components/SurfaceCard";
import type {
  RecaladaOperationalStatus,
  RecaladaSource,
} from "../types/recaladas.types";

const recaladaFormSchema = z
  .object({
    buqueId: z.string().min(1, "Selecciona un buque"),
    paisOrigenId: z.string().min(1, "Selecciona un país de origen"),
    fechaLlegada: z.string().min(1, "La fecha de llegada es obligatoria"),
    fechaSalida: z.string().optional(),
    terminal: z
      .string()
      .trim()
      .max(80, "Máximo 80 caracteres")
      .optional()
      .or(z.literal("")),
    muelle: z
      .string()
      .trim()
      .max(80, "Máximo 80 caracteres")
      .optional()
      .or(z.literal("")),
    pasajerosEstimados: z.preprocess(
      (v) => (v === "" || v == null ? undefined : Number(v)),
      z
        .number()
        .int()
        .min(1, "Mínimo 1 pasajero")
        .max(300000)
        .optional()
    ),
    tripulacionEstimada: z.preprocess(
      (v) => (v === "" || v == null ? undefined : Number(v)),
      z.number().int().nonnegative().max(300000).optional()
    ),
    observaciones: z
      .string()
      .trim()
      .max(2000, "Máximo 2000 caracteres")
      .optional()
      .or(z.literal("")),
    fuente: z.enum(["MANUAL", "IMPORT"]).default("MANUAL"),
  })
  .refine(
    (data) =>
      !data.fechaSalida ||
      !data.fechaLlegada ||
      new Date(data.fechaSalida) >= new Date(data.fechaLlegada),
    {
      message: "La fecha de salida debe ser mayor o igual a la de llegada",
      path: ["fechaSalida"],
    }
  );

export type RecaladaFormValues = z.infer<typeof recaladaFormSchema>;

export interface BuqueLookupOption {
  id: number;
  nombre: string;
}

export interface PaisLookupOption {
  id: number;
  codigo: string;
  nombre: string;
}

interface RecaladaFormProps {
  buques: BuqueLookupOption[];
  paises: PaisLookupOption[];
  initialValues?: {
    buqueId?: number;
    paisOrigenId?: number;
    fechaLlegada?: string;
    fechaSalida?: string | null;
    terminal?: string | null;
    muelle?: string | null;
    pasajerosEstimados?: number | null;
    tripulacionEstimada?: number | null;
    observaciones?: string | null;
    fuente?: RecaladaSource;
  } | null;
  isEdit?: boolean;
  operationalStatus?: RecaladaOperationalStatus;
  isLoading?: boolean;
  error?: string | null;
  onCancel?: () => void;
  onSubmit: (values: RecaladaFormValues) => void | Promise<void>;
}

function toInputDatetime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "rgba(255,255,255,0.03)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow:
    "inset 2px 2px 5px rgba(0,0,0,0.35), inset -2px -2px 5px rgba(255,255,255,0.03)",
} as const;

const disabledStyle = {
  ...inputStyle,
  opacity: 0.45,
  cursor: "not-allowed",
} as const;

const RecaladaForm: React.FC<RecaladaFormProps> = ({
  buques,
  paises,
  initialValues,
  isEdit = false,
  operationalStatus,
  isLoading = false,
  error,
  onCancel,
  onSubmit,
}) => {
  const isArrivedEdit = isEdit && operationalStatus === "ARRIVED";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RecaladaFormValues>({
    resolver: zodResolver(recaladaFormSchema),
    defaultValues: {
      buqueId: initialValues?.buqueId ? String(initialValues.buqueId) : "",
      paisOrigenId: initialValues?.paisOrigenId
        ? String(initialValues.paisOrigenId)
        : "",
      fechaLlegada: toInputDatetime(initialValues?.fechaLlegada),
      fechaSalida: toInputDatetime(initialValues?.fechaSalida),
      terminal: initialValues?.terminal ?? "",
      muelle: initialValues?.muelle ?? "",
      pasajerosEstimados:
        typeof initialValues?.pasajerosEstimados === "number"
          ? initialValues.pasajerosEstimados
          : undefined,
      tripulacionEstimada:
        typeof initialValues?.tripulacionEstimada === "number"
          ? initialValues.tripulacionEstimada
          : undefined,
      observaciones: initialValues?.observaciones ?? "",
      fuente: initialValues?.fuente ?? "MANUAL",
    },
  });

  useEffect(() => {
    reset({
      buqueId: initialValues?.buqueId ? String(initialValues.buqueId) : "",
      paisOrigenId: initialValues?.paisOrigenId
        ? String(initialValues.paisOrigenId)
        : "",
      fechaLlegada: toInputDatetime(initialValues?.fechaLlegada),
      fechaSalida: toInputDatetime(initialValues?.fechaSalida),
      terminal: initialValues?.terminal ?? "",
      muelle: initialValues?.muelle ?? "",
      pasajerosEstimados:
        typeof initialValues?.pasajerosEstimados === "number"
          ? initialValues.pasajerosEstimados
          : undefined,
      tripulacionEstimada:
        typeof initialValues?.tripulacionEstimada === "number"
          ? initialValues.tripulacionEstimada
          : undefined,
      observaciones: initialValues?.observaciones ?? "",
      fuente: initialValues?.fuente ?? "MANUAL",
    });
  }, [
    initialValues?.buqueId,
    initialValues?.paisOrigenId,
    initialValues?.fechaLlegada,
    initialValues?.fechaSalida,
    initialValues?.terminal,
    initialValues?.muelle,
    initialValues?.pasajerosEstimados,
    initialValues?.tripulacionEstimada,
    initialValues?.observaciones,
    initialValues?.fuente,
    reset,
  ]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
        <div>
          <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
            {isEdit ? "Datos de la recalada" : "Nueva recalada"}
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-fg-muted)]">
            {isArrivedEdit
              ? "La recalada ya llegó. Solo puedes editar fechas operativas, terminal, muelle, pasajeros y observaciones."
              : "Completa los datos de la agenda madre operativa."}
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
            Buque
          </label>
          <select
            {...register("buqueId")}
            disabled={isLoading || isArrivedEdit}
            className={inputClassName}
            style={isArrivedEdit ? disabledStyle : inputStyle}
          >
            <option value="">Selecciona un buque</option>
            {buques.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.nombre}
              </option>
            ))}
          </select>
          {errors.buqueId?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.buqueId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            País de origen
          </label>
          <select
            {...register("paisOrigenId")}
            disabled={isLoading || isArrivedEdit}
            className={inputClassName}
            style={isArrivedEdit ? disabledStyle : inputStyle}
          >
            <option value="">Selecciona un país</option>
            {paises.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.codigo} · {p.nombre}
              </option>
            ))}
          </select>
          {errors.paisOrigenId?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.paisOrigenId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Fecha de llegada
          </label>
          <input
            {...register("fechaLlegada")}
            type="datetime-local"
            disabled={isLoading || isArrivedEdit}
            className={inputClassName}
            style={isArrivedEdit ? disabledStyle : inputStyle}
          />
          {errors.fechaLlegada?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.fechaLlegada.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Fecha de salida{" "}
            <span className="normal-case font-normal">(opcional)</span>
          </label>
          <input
            {...register("fechaSalida")}
            type="datetime-local"
            disabled={isLoading}
            className={inputClassName}
            style={inputStyle}
          />
          {errors.fechaSalida?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.fechaSalida.message}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Terminal
            </label>
            <input
              {...register("terminal")}
              type="text"
              placeholder="Terminal Sur"
              maxLength={80}
              disabled={isLoading}
              className={inputClassName}
              style={inputStyle}
            />
            {errors.terminal?.message ? (
              <p className="text-xs text-[var(--color-danger)]">
                {errors.terminal.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Muelle
            </label>
            <input
              {...register("muelle")}
              type="text"
              placeholder="M-3"
              maxLength={80}
              disabled={isLoading}
              className={inputClassName}
              style={inputStyle}
            />
            {errors.muelle?.message ? (
              <p className="text-xs text-[var(--color-danger)]">
                {errors.muelle.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Pasajeros est.
            </label>
            <input
              {...register("pasajerosEstimados")}
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="500"
              disabled={isLoading}
              className={inputClassName}
              style={inputStyle}
            />
            {errors.pasajerosEstimados?.message ? (
              <p className="text-xs text-[var(--color-danger)]">
                {errors.pasajerosEstimados.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
              Tripulación est.
            </label>
            <input
              {...register("tripulacionEstimada")}
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="20"
              disabled={isLoading}
              className={inputClassName}
              style={inputStyle}
            />
            {errors.tripulacionEstimada?.message ? (
              <p className="text-xs text-[var(--color-danger)]">
                {errors.tripulacionEstimada.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Fuente
          </label>
          <select
            {...register("fuente")}
            disabled={isLoading || isArrivedEdit}
            className={inputClassName}
            style={isArrivedEdit ? disabledStyle : inputStyle}
          >
            <option value="MANUAL">Manual</option>
            <option value="IMPORT">Importación</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-fg-muted)]">
            Observaciones
          </label>
          <textarea
            {...register("observaciones")}
            rows={3}
            placeholder="Notas operativas adicionales..."
            maxLength={2000}
            disabled={isLoading}
            className={`${inputClassName} resize-none`}
            style={inputStyle}
          />
          {errors.observaciones?.message ? (
            <p className="text-xs text-[var(--color-danger)]">
              {errors.observaciones.message}
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
          {isEdit ? "Guardar cambios" : "Crear recalada"}
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

export default RecaladaForm;
