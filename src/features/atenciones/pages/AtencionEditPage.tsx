import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Button from "../../../ui/components/Button";
import ErrorState from "../../../ui/components/ErrorState";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import PageSectionHeader from "../../../ui/components/PageSectionHeader";
import SurfaceCard from "../../../ui/components/SurfaceCard";
import { useAtencion } from "../hooks/useAtencion";
import { useUpdateAtencion } from "../hooks/useUpdateAtencion";

interface RouteParams {
  id: string;
}

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "var(--color-glass-subtle)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow: "var(--shadow-neu-inset)",
} as const;

function toLocalInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const AtencionEditPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();

  const atencionId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [id]);

  const atencionQuery = useAtencion(atencionId);
  const updateAtencion = useUpdateAtencion();

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [turnosTotal, setTurnosTotal] = useState<string>("");
  const [descripcion, setDescripcion] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const atencion = atencionQuery.data;

  useEffect(() => {
    if (!hydrated && atencion) {
      setFechaInicio(toLocalInputValue(atencion.fechaInicio));
      setFechaFin(toLocalInputValue(atencion.fechaFin));
      setTurnosTotal(String(atencion.turnosTotal));
      setDescripcion(atencion.descripcion ?? "");
      setHydrated(true);
    }
  }, [atencion, hydrated]);

  if (!atencionId) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex min-h-screen items-center justify-center px-5">
            <ErrorState
              title="ID inválido"
              message="El identificador de la atención no es válido."
              onRetry={() => history.push("/atenciones")}
              retryLabel="Volver al listado"
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (atencionQuery.isLoading && !atencion) {
    return <LoadingScreen message="Cargando atención..." />;
  }

  if (atencionQuery.error && !atencion) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex min-h-screen items-center justify-center px-5">
            <ErrorState
              title="No pude cargar la atención"
              message={
                atencionQuery.error instanceof Error
                  ? atencionQuery.error.message
                  : "Ocurrió un problema al consultar el detalle."
              }
              onRetry={() => void atencionQuery.refetch()}
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!atencion) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const turnosTotalNum = Number(turnosTotal);

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
      await updateAtencion.mutateAsync({
        id: atencionId!,
        body: {
          fechaInicio: new Date(fechaInicio).toISOString(),
          fechaFin: new Date(fechaFin).toISOString(),
          turnosTotal: turnosTotalNum,
          descripcion: descripcion.trim() ? descripcion.trim() : null,
        },
      });
      history.replace(`/atenciones/${atencionId}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No pude actualizar la atención"
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
                  Editar atención #{atencion.id}
                </h1>
              </div>
            </div>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Planificación"
                description="Cambiar ventana o cupo afecta directamente los turnos materializados."
              />

              <form className="space-y-3" onSubmit={handleSubmit}>
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
                    Descripción
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
                    isLoading={updateAtencion.isPending}
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={updateAtencion.isPending}
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

export default AtencionEditPage;
