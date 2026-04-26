import { IonContent, IonPage } from "@ionic/react";
import { useState, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Button from "../../../ui/components/Button";
import PageSectionHeader from "../../../ui/components/PageSectionHeader";
import SurfaceCard from "../../../ui/components/SurfaceCard";
import { useCreateAtencion } from "../hooks/useCreateAtencion";

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "var(--color-glass-subtle)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow: "var(--shadow-neu-inset)",
} as const;

const AtencionCreatePage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const createAtencion = useCreateAtencion();

  const initialRecaladaId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("recaladaId");
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : "";
  }, [location.search]);

  const [recaladaId, setRecaladaId] = useState<string>(initialRecaladaId);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [turnosTotal, setTurnosTotal] = useState<string>("1");
  const [descripcion, setDescripcion] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const recaladaIdNum = Number(recaladaId);
    const turnosTotalNum = Number(turnosTotal);

    if (!Number.isFinite(recaladaIdNum) || recaladaIdNum <= 0) {
      setSubmitError("Recalada inválida.");
      return;
    }
    if (!fechaInicio || !fechaFin) {
      setSubmitError("Debes indicar inicio y fin.");
      return;
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setSubmitError("La fecha fin debe ser mayor o igual al inicio.");
      return;
    }
    if (!Number.isFinite(turnosTotalNum) || turnosTotalNum < 1) {
      setSubmitError("El cupo de turnos debe ser al menos 1.");
      return;
    }

    try {
      const created = await createAtencion.mutateAsync({
        recaladaId: recaladaIdNum,
        fechaInicio: new Date(fechaInicio).toISOString(),
        fechaFin: new Date(fechaFin).toISOString(),
        turnosTotal: turnosTotalNum,
        descripcion: descripcion.trim() || undefined,
      });
      history.replace(`/atenciones/${created?.id ?? ""}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No pude crear la atención"
      );
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-28 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => history.goBack()}
              >
                Volver
              </Button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Atenciones
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Nueva atención
                </h1>
              </div>
            </div>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Datos de la atención"
                description="La atención define la ventana y el cupo de turnos a materializar."
              />

              <form className="space-y-3" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
                    Recalada ID
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={recaladaId}
                    onChange={(e) => setRecaladaId(e.target.value)}
                    className={inputClassName}
                    style={inputStyle}
                    placeholder="ID de la recalada"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
                    Inicio
                  </span>
                  <input
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className={inputClassName}
                    style={inputStyle}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
                    Fin
                  </span>
                  <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className={inputClassName}
                    style={inputStyle}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
                    Cupo de turnos
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={turnosTotal}
                    onChange={(e) => setTurnosTotal(e.target.value)}
                    className={inputClassName}
                    style={inputStyle}
                    required
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-fg-muted)]">
                    Descripción (opcional)
                  </span>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className={`${inputClassName} resize-none`}
                    style={inputStyle}
                  />
                </label>

                {submitError ? (
                  <div
                    className="rounded-2xl border px-3 py-3 text-sm"
                    style={{
                      background: "var(--color-danger-soft)",
                      borderColor: "var(--color-danger-border)",
                      color: "var(--color-danger)",
                    }}
                  >
                    {submitError}
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={createAtencion.isPending}
                  >
                    Crear
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={createAtencion.isPending}
                    onClick={() => history.goBack()}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </SurfaceCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AtencionCreatePage;
