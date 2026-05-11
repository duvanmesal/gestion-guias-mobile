import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { RecaladaOperationalStatus, RecaladaSource } from "../types/recaladas.types";

/* ─────────────────────────────────────────────
   SCHEMA
───────────────────────────────────────────── */
const recaladaFormSchema = z
  .object({
    buqueId:             z.string().min(1, "Selecciona un buque"),
    paisOrigenId:        z.string().min(1, "Selecciona un país de origen"),
    fechaLlegada:        z.string().min(1, "La fecha de llegada es obligatoria"),
    fechaSalida:         z.string().optional(),
    terminal:            z.string().trim().max(80).optional().or(z.literal("")),
    muelle:              z.string().trim().max(80).optional().or(z.literal("")),
    pasajerosEstimados:  z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(1).max(300000).optional()),
    tripulacionEstimada: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().nonnegative().max(300000).optional()),
    observaciones:       z.string().trim().max(2000).optional().or(z.literal("")),
    fuente:              z.enum(["MANUAL", "IMPORT"]).default("MANUAL"),
  })
  .refine(
    (d) => !d.fechaSalida || !d.fechaLlegada || new Date(d.fechaSalida) >= new Date(d.fechaLlegada),
    { message: "La fecha de salida debe ser ≥ la de llegada", path: ["fechaSalida"] }
  );

export type RecaladaFormValues = z.infer<typeof recaladaFormSchema>;

export interface BuqueLookupOption  { id: number; nombre: string; }
export interface PaisLookupOption   { id: number; codigo: string; nombre: string; }

interface RecaladaFormProps {
  buques:          BuqueLookupOption[];
  paises:          PaisLookupOption[];
  initialValues?: {
    buqueId?: number; paisOrigenId?: number;
    fechaLlegada?: string; fechaSalida?: string | null;
    terminal?: string | null; muelle?: string | null;
    pasajerosEstimados?: number | null; tripulacionEstimada?: number | null;
    observaciones?: string | null; fuente?: RecaladaSource;
  } | null;
  isEdit?:            boolean;
  operationalStatus?: RecaladaOperationalStatus;
  isLoading?:         boolean;
  error?:             string | null;
  onCancel?:          () => void;
  onSubmit:           (values: RecaladaFormValues) => void | Promise<void>;
}

/* ─────────────────────────────────────────────
   PALETTE
───────────────────────────────────────────── */
const C = {
  violet:       "var(--color-primary)",
  violetFaint:  "var(--color-primary-glow)",
  violetBorder: "var(--color-primary-glow)",
  violetGlow:   "var(--color-primary-glow)",
  amber:        "var(--color-accent)",
  amberFaint:   "var(--color-accent-glow)",
  amberBorder:  "var(--color-accent-glow)",
  cyan:         "var(--color-info)",
  cyanFaint:    "var(--color-info-soft)",
  cyanBorder:   "var(--color-info-border)",
  danger:       "var(--color-danger)",
  dangerFaint:  "var(--color-danger-soft)",
  dangerBorder: "var(--color-danger-border)",
  teal:         "var(--color-success)",
  fg:           "var(--color-fg-primary)",
  fgSec:        "var(--color-fg-secondary)",
  fgMuted:      "var(--color-fg-muted)",
  surface: "var(--color-bg-elevated)",
};

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Ico = {
  warning: (s = 13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  info:    (s = 13) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  save:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
};

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function toInputDatetime(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
const RecaladaForm: React.FC<RecaladaFormProps> = ({
  buques, paises, initialValues, isEdit = false,
  operationalStatus, isLoading = false, error, onCancel, onSubmit,
}) => {
  const isArrivedEdit = isEdit && operationalStatus === "ARRIVED";

  const {
    register, handleSubmit, reset,
    formState: { errors, isDirty },
  } = useForm<RecaladaFormValues>({
    resolver: zodResolver(recaladaFormSchema),
    defaultValues: buildDefaults(initialValues),
  });

  useEffect(() => { reset(buildDefaults(initialValues)); }, [
    initialValues?.buqueId, initialValues?.paisOrigenId,
    initialValues?.fechaLlegada, initialValues?.fechaSalida,
    initialValues?.terminal, initialValues?.muelle,
    initialValues?.pasajerosEstimados, initialValues?.tripulacionEstimada,
    initialValues?.observaciones, initialValues?.fuente, reset,
  ]);

  const inputBase: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    borderRadius: 13, padding: "11px 14px",
    background: "var(--color-glass-soft)",
    border: `1px solid var(--color-primary-glow)`,
    color: C.fg, fontSize: "0.875rem", outline: "none",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  };

  const disabledBase: React.CSSProperties = { ...inputBase, opacity: 0.4, cursor: "not-allowed" };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Info notice for arrived edits */}
      {isArrivedEdit && (
        <div style={{ borderRadius: 14, padding: "11px 14px", background: C.amberFaint, border: `1px solid ${C.amberBorder}`, display: "flex", gap: 8 }}>
          <span style={{ color: C.amber, flexShrink: 0, marginTop: 1 }}>{Ico.info()}</span>
          <p style={{ fontSize: "0.78rem", color: C.amber, lineHeight: 1.5 }}>
            La recalada ya llegó. Solo puedes editar fechas operativas, terminal, muelle, pasajeros y observaciones.
          </p>
        </div>
      )}

      {/* API error */}
      {error && (
        <div style={{ borderRadius: 14, padding: "11px 14px", background: C.dangerFaint, border: `1px solid ${C.dangerBorder}`, display: "flex", gap: 8 }}>
          <span style={{ color: C.danger, flexShrink: 0, marginTop: 1 }}>{Ico.warning()}</span>
          <p style={{ fontSize: "0.8125rem", color: C.danger, fontWeight: 500 }}>{error}</p>
        </div>
      )}

      {/* ── Section: Identificación ── */}
      <FormSection title="Identificación" color={C.cyan}>
        <Field label="Buque" error={errors.buqueId?.message}>
          <select {...register("buqueId")} disabled={isLoading || isArrivedEdit} style={isArrivedEdit ? disabledBase : inputBase}>
            <option value="">Selecciona un buque</option>
            {buques.map((b) => <option key={b.id} value={String(b.id)}>{b.nombre}</option>)}
          </select>
        </Field>

        <Field label="País de origen" error={errors.paisOrigenId?.message}>
          <select {...register("paisOrigenId")} disabled={isLoading || isArrivedEdit} style={isArrivedEdit ? disabledBase : inputBase}>
            <option value="">Selecciona un país</option>
            {paises.map((p) => <option key={p.id} value={String(p.id)}>{p.codigo} · {p.nombre}</option>)}
          </select>
        </Field>

        <Field label="Fuente" error={undefined}>
          <select {...register("fuente")} disabled={isLoading || isArrivedEdit} style={isArrivedEdit ? disabledBase : inputBase}>
            <option value="MANUAL">Manual</option>
            <option value="IMPORT">Importación</option>
          </select>
        </Field>
      </FormSection>

      {/* ── Section: Fechas ── */}
      <FormSection title="Fechas" color={C.violet}>
        <Field label="Fecha de llegada" error={errors.fechaLlegada?.message}>
          <input {...register("fechaLlegada")} type="datetime-local" disabled={isLoading || isArrivedEdit} style={isArrivedEdit ? disabledBase : inputBase} />
        </Field>

        <Field label="Fecha de salida (opcional)" error={errors.fechaSalida?.message}>
          <input {...register("fechaSalida")} type="datetime-local" disabled={isLoading} style={inputBase} />
        </Field>
      </FormSection>

      {/* ── Section: Logística ── */}
      <FormSection title="Logística" color={C.amber}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Terminal" error={errors.terminal?.message}>
            <input {...register("terminal")} type="text" placeholder="Terminal Sur" maxLength={80} disabled={isLoading} style={inputBase} />
          </Field>
          <Field label="Muelle" error={errors.muelle?.message}>
            <input {...register("muelle")} type="text" placeholder="M-3" maxLength={80} disabled={isLoading} style={inputBase} />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Pasajeros est." error={errors.pasajerosEstimados?.message}>
            <input {...register("pasajerosEstimados")} type="number" inputMode="numeric" min={1} placeholder="500" disabled={isLoading} style={inputBase} />
          </Field>
          <Field label="Tripulación est." error={errors.tripulacionEstimada?.message}>
            <input {...register("tripulacionEstimada")} type="number" inputMode="numeric" min={0} placeholder="20" disabled={isLoading} style={inputBase} />
          </Field>
        </div>
      </FormSection>

      {/* ── Section: Notas ── */}
      <FormSection title="Notas" color={C.fgMuted}>
        <Field label="Observaciones" error={errors.observaciones?.message}>
          <textarea
            {...register("observaciones")}
            rows={3} maxLength={2000}
            placeholder="Notas operativas adicionales…"
            disabled={isLoading}
            style={{ ...inputBase, resize: "none" }}
          />
        </Field>
      </FormSection>

      {/* ── Actions ── */}
      <div style={{ borderRadius: 18, background: C.surface, border: "1px solid var(--color-glass-medium)", padding: "1rem", display: "flex", flexDirection: "column", gap: 9 }}>
        <button
          type="submit"
          disabled={isLoading || (isEdit && !isDirty)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "15px 20px", borderRadius: 16, width: "100%",
            background: (isLoading || (isEdit && !isDirty))
              ? "var(--color-primary-soft)"
              : "var(--color-primary)",
            border: "none",
            boxShadow: "none",
            color: "white", fontSize: "0.9rem", fontWeight: 800,
            cursor: (isLoading || (isEdit && !isDirty)) ? "not-allowed" : "pointer",
          }}
        >
          {isLoading
            ? <><span className="loading-spinner" style={{ borderTopColor: "white" }} /> Guardando…</>
            : <>{Ico.save()} {isEdit ? "Guardar cambios" : "Crear recalada"}</>
          }
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={onCancel}
          style={{
            padding: "13px 20px", borderRadius: 14, width: "100%",
            background: "var(--color-glass-soft)", border: "1px solid var(--color-glass-medium)",
            color: C.fgSec, fontSize: "0.875rem", fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          Cancelar
        </button>

        {isEdit && !isDirty && (
          <p style={{ textAlign: "center", fontSize: "0.72rem", color: C.fgMuted }}>
            Modifica un campo para habilitar el guardado.
          </p>
        )}
      </div>
    </form>
  );
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */
const FormSection: React.FC<{ title: string; color: string; children: React.ReactNode }> = ({ title, color, children }) => (
  <div style={{ borderRadius: 18, background: "var(--color-bg-elevated)", border: "1px solid var(--color-glass-medium)", padding: "1.125rem 1.125rem" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.875rem" }}>
      <div style={{ width: 3, height: 13, borderRadius: 2, background: color, opacity: 0.9, flexShrink: 0 }} />
      <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${color}28, transparent)` }} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {children}
    </div>
  </div>
);

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-fg-muted)" }}>
      {label}
    </label>
    {children}
    {error && (
      <p style={{ fontSize: "0.72rem", color: "var(--color-danger)", fontWeight: 500 }}>{error}</p>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function buildDefaults(iv: RecaladaFormProps["initialValues"]) {
  return {
    buqueId:             iv?.buqueId ? String(iv.buqueId) : "",
    paisOrigenId:        iv?.paisOrigenId ? String(iv.paisOrigenId) : "",
    fechaLlegada:        toInputDatetime(iv?.fechaLlegada),
    fechaSalida:         toInputDatetime(iv?.fechaSalida),
    terminal:            iv?.terminal ?? "",
    muelle:              iv?.muelle ?? "",
    pasajerosEstimados:  typeof iv?.pasajerosEstimados === "number" ? iv.pasajerosEstimados : undefined,
    tripulacionEstimada: typeof iv?.tripulacionEstimada === "number" ? iv.tripulacionEstimada : undefined,
    observaciones:       iv?.observaciones ?? "",
    fuente:              (iv?.fuente ?? "MANUAL") as "MANUAL" | "IMPORT",
  };
}

export default RecaladaForm;
