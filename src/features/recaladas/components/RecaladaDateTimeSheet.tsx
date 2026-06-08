import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IonDatetime } from "@ionic/react";

/* ─────────────────────────────────────────────
   Selector operativo de fecha/hora para recaladas (mobile).
   Bottom sheet Ionic con calendario + hora (minutos cada 15).
   Maneja strings locales "YYYY-MM-DDTHH:mm"; el padre sigue
   enviando new Date(valor).toISOString() sin cambios de negocio.
───────────────────────────────────────────── */

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS_LARGO = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MINUTOS = ["00", "15", "30", "45"];
const HORAS_COMUNES = ["06:00", "08:00", "12:00", "18:00"];

function parseLocal(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Formatea hora a 12h con A.M./P.M. -> "08:00 A.M." */
function fmtTime12(h24: number, m: number): string {
  const period = h24 >= 12 ? "P.M." : "A.M.";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${pad(h)}:${pad(m)} ${period}`;
}

function summary(value: string): { fecha: string; hora: string } | null {
  const d = parseLocal(value);
  if (!d) return null;
  const dia = DIAS_LARGO[d.getDay()];
  const fecha = `${dia.charAt(0).toUpperCase() + dia.slice(1)} ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  const hora = fmtTime12(d.getHours(), d.getMinutes());
  return { fecha, hora };
}

/** "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00" (formato IonDatetime). */
const toIon = (v: string) => (v ? `${v}:00` : undefined);
/** Cualquier valor IonDatetime -> "YYYY-MM-DDTHH:mm". */
const fromIon = (v: string | null | undefined) => (v ? v.slice(0, 16) : "");

interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  optional?: boolean;
  error?: string;
  disabled?: boolean;
  variant?: "arrival" | "departure";
  /** Valor mínimo "YYYY-MM-DDTHH:mm" (ej. la llegada) para la salida. */
  minValue?: string;
}

const RecaladaDateTimeSheet: React.FC<Props> = ({
  value,
  onChange,
  label,
  optional = false,
  error,
  disabled = false,
  variant = "arrival",
  minValue,
}) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [draft, setDraft] = useState<string>(value);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const h = () => setReduce(mq.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  const DURATION = reduce ? 0 : 220;

  const openSheet = () => {
    if (disabled) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDraft(value);
    setMounted(true);
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };

  const closeSheet = () => {
    setShown(false);
    setOpen(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMounted(false), DURATION);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const accent = variant === "departure" ? "var(--color-accent)" : "var(--color-primary)";
  const accentSoft = variant === "departure" ? "var(--color-accent-soft)" : "var(--color-primary-soft)";

  const sum = summary(value);

  // ── Estado de hora derivado del borrador (default 08:00 si aún no hay fecha) ──
  const draftDate = parseLocal(draft);
  const curH24 = draftDate ? draftDate.getHours() : 8;
  const curMin = draftDate ? draftDate.getMinutes() : 0;
  const period: "AM" | "PM" = curH24 >= 12 ? "PM" : "AM";
  const hour12 = curH24 % 12 === 0 ? 12 : curH24 % 12;

  const setDraftTime = (h24: number, m: number) => {
    const base = draftDate ?? new Date();
    setDraft(`${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(h24)}:${pad(m)}`);
  };
  const setHour12 = (h: number, p: "AM" | "PM" = period) => {
    const next = p === "PM" ? (h % 12) + 12 : h % 12;
    setDraftTime(next, curMin);
  };
  const setPeriod = (p: "AM" | "PM") => setHour12(hour12, p);

  const confirm = () => {
    if (draft) onChange(fromIon(toIon(draft)));
    closeSheet();
  };

  const clear = () => {
    setDraft("");
    onChange("");
    closeSheet();
  };

  const draftSum = summary(draft);

  return (
    <>
      {/* Tarjeta-control */}
      <button
        type="button"
        disabled={disabled}
        onClick={openSheet}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          textAlign: "left",
          padding: "11px 13px",
          borderRadius: 13,
          background: "var(--color-bg-elevated)",
          border: error
            ? "1.5px solid var(--color-danger)"
            : `1px solid var(--color-glass-medium)`,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 38,
            height: 38,
            borderRadius: 11,
            background: accentSoft,
            color: accent,
            flexShrink: 0,
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          {sum ? (
            <>
              <span style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "var(--color-fg-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {sum.fecha}
              </span>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: accent, marginTop: 2 }}>
                {sum.hora}
              </span>
            </>
          ) : (
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-fg-muted)" }}>
              Seleccionar fecha y hora
            </span>
          )}
        </span>
        {value && !disabled && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 9, flexShrink: 0, color: "var(--color-fg-muted)" }}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </span>
        )}
      </button>

      {/* Bottom sheet propio (sin gesto de Ionic): header fijo · body scroll · footer fijo */}
      {mounted && typeof document !== "undefined"
        ? createPortal(
          <div style={{ position: "fixed", inset: 0, zIndex: 1000 }}>
            {/* Backdrop */}
            <div
              onClick={closeSheet}
              style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
                opacity: shown ? 1 : 0,
                transition: `opacity ${DURATION}ms ease`,
              }}
            />
            {/* Panel */}
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "absolute", left: 0, right: 0, bottom: 0,
                display: "flex", flexDirection: "column",
                maxHeight: "90dvh",
                background: "var(--color-bg-elevated)",
                borderRadius: "24px 24px 0 0",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
                transform: shown ? "translateY(0)" : "translateY(100%)",
                transition: `transform ${DURATION}ms cubic-bezier(0.32, 0.72, 0, 1)`,
                willChange: "transform",
              }}
            >
              {/* Header fijo */}
              <div style={{ flexShrink: 0, padding: "10px 20px 12px", borderBottom: "1px solid var(--color-glass-medium)" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--color-glass-medium)", margin: "0 auto 10px" }} />
                <h2 style={{ margin: 0, fontSize: "1.0625rem", fontWeight: 700, color: "var(--color-fg-primary)", letterSpacing: "-0.01em" }}>
                  {label}{optional && <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--color-fg-muted)" }}>  · opcional</span>}
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: draftSum ? accent : "var(--color-fg-muted)", fontWeight: draftSum ? 600 : 400 }}>
                  {draftSum ? `${draftSum.fecha} · ${draftSum.hora}` : "Sin fecha seleccionada"}
                </p>
              </div>

              {/* Body scrolleable (único que scrollea) */}
              <div
                style={{
                  flex: 1, minHeight: 0,
                  overflowY: "auto", overscrollBehavior: "contain",
                  WebkitOverflowScrolling: "touch", touchAction: "pan-y",
                  padding: "14px 20px 18px",
                  display: "flex", flexDirection: "column", gap: 14,
                  boxSizing: "border-box",
                }}
              >

          {/* Calendario (solo fecha; la hora se maneja con el selector custom) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <IonDatetime
              presentation="date"
              locale="es-ES"
              showDefaultButtons={false}
              value={toIon(draft)}
              min={toIon(minValue ?? "")}
              onIonChange={(e) => {
                const v = e.detail.value;
                if (typeof v !== "string") return;
                const datePart = v.slice(0, 10);
                setDraft(`${datePart}T${pad(curH24)}:${pad(curMin)}`);
              }}
              style={{ "--background": "transparent", borderRadius: 16, width: "100%", maxWidth: 360, margin: "0 auto" } as React.CSSProperties}
            />
          </div>

          {/* ── Selector de hora custom (12h, tema oscuro) ── */}
          <div style={{ borderRadius: 16, background: "var(--color-glass-soft)", border: "1px solid var(--color-glass-medium)", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-fg-muted)" }}>Hora</span>
              <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: accent }}>{fmtTime12(curH24, curMin)}</span>
            </div>

            {/* Toggle A.M. / P.M. */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 4, borderRadius: 12, background: "var(--color-glass-medium)" }}>
              {(["AM", "PM"] as const).map((p) => {
                const active = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    style={{
                      padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
                      fontSize: "0.8125rem", fontWeight: 700,
                      background: active ? accent : "transparent",
                      color: active ? "white" : "var(--color-fg-muted)",
                    }}
                  >
                    {p === "AM" ? "A.M." : "P.M."}
                  </button>
                );
              })}
            </div>

            {/* Grilla de horas 1–12 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 5 }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                const active = h === hour12;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHour12(h)}
                    style={{
                      padding: "9px 0", borderRadius: 10, cursor: "pointer",
                      fontSize: "0.875rem", fontWeight: 600, fontVariantNumeric: "tabular-nums",
                      background: active ? accent : "var(--color-bg-elevated)",
                      color: active ? "white" : "var(--color-fg-primary)",
                      border: `1px solid ${active ? accent : "var(--color-glass-medium)"}`,
                    }}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minutos 00 / 15 / 30 / 45 */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-fg-muted)", flexShrink: 0 }}>Min</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, flex: 1 }}>
                {MINUTOS.map((m) => {
                  const active = pad(curMin) === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDraftTime(curH24, parseInt(m, 10))}
                      style={{
                        padding: "9px 0", borderRadius: 10, cursor: "pointer",
                        fontSize: "0.875rem", fontWeight: 600, fontVariantNumeric: "tabular-nums",
                        background: active ? accent : "var(--color-bg-elevated)",
                        color: active ? "white" : "var(--color-fg-primary)",
                        border: `1px solid ${active ? accent : "var(--color-glass-medium)"}`,
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Horas comunes (solo fijan la hora) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {HORAS_COMUNES.map((hc) => {
              const [h, m] = hc.split(":");
              const active = curH24 === parseInt(h, 10) && curMin === parseInt(m, 10);
              return (
                <button
                  key={hc}
                  type="button"
                  onClick={() => setDraftTime(parseInt(h, 10), parseInt(m, 10))}
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    padding: "7px 14px",
                    borderRadius: 999,
                    background: active ? accentSoft : "var(--color-glass-soft)",
                    color: active ? accent : "var(--color-fg-secondary)",
                    border: `1px solid ${active ? accent : "var(--color-glass-medium)"}`,
                    cursor: "pointer",
                  }}
                >
                  {fmtTime12(parseInt(h, 10), parseInt(m, 10))}
                </button>
              );
            })}
          </div>

              </div>

              {/* Footer fijo: Limpiar / Listo siempre visibles */}
              <div style={{ flexShrink: 0, borderTop: "1px solid var(--color-glass-medium)", display: "flex", gap: 10, padding: "12px 20px calc(12px + env(safe-area-inset-bottom, 0px))", boxSizing: "border-box" }}>
                <button
                  type="button"
                  onClick={clear}
                  style={{
                    flex: "0 0 auto",
                    padding: "13px 18px",
                    borderRadius: 14,
                    background: "var(--color-glass-soft)",
                    border: "1px solid var(--color-glass-medium)",
                    color: "var(--color-fg-secondary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  style={{
                    flex: 1,
                    padding: "13px 18px",
                    borderRadius: 14,
                    background: accent,
                    border: "none",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Listo
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}

      {error && (
        <p style={{ fontSize: "0.72rem", color: "var(--color-danger)", fontWeight: 500, marginTop: 5 }}>{error}</p>
      )}
    </>
  );
};

export default RecaladaDateTimeSheet;
