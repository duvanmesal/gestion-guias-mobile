import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import Button from "../../../ui/components/Button";
import EmptyStateCard from "../../../ui/components/EmptyStateCard";
import ErrorState from "../../../ui/components/ErrorState";
import KeyValueGrid from "../../../ui/components/KeyValueGrid";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import OperationalAlertBanner from "../../../ui/components/OperationalAlertBanner";
import PageSectionHeader from "../../../ui/components/PageSectionHeader";
import StatusChip from "../../../ui/components/StatusChip";
import StickyBottomActions from "../../../ui/components/StickyBottomActions";
import SurfaceCard from "../../../ui/components/SurfaceCard";
import { useArriveRecalada } from "../hooks/useArriveRecalada";
import { useCancelRecalada } from "../hooks/useCancelRecalada";
import { useDeleteRecalada } from "../hooks/useDeleteRecalada";
import { useDepartRecalada } from "../hooks/useDepartRecalada";
import { useRecalada } from "../hooks/useRecalada";
import { useRecaladaAtenciones } from "../hooks/useRecaladaAtenciones";
import type { RecaladaOperationalStatus } from "../types/recaladas.types";

interface RouteParams {
  id: string;
}

function getOpStatusTone(
  status: RecaladaOperationalStatus
): "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "SCHEDULED":
      return "info";
    case "ARRIVED":
      return "warning";
    case "DEPARTED":
      return "success";
    case "CANCELED":
      return "danger";
  }
}

function getOpStatusLabel(status: RecaladaOperationalStatus): string {
  switch (status) {
    case "SCHEDULED":
      return "Programada";
    case "ARRIVED":
      return "Llegada";
    case "DEPARTED":
      return "Partida";
    case "CANCELED":
      return "Cancelada";
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

const RecaladaDetailPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const user = useSessionStore((state) => state.user);

  const recaladaId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [id]);

  const isSupervisor =
    user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const recaladaQuery = useRecalada(recaladaId);
  const atencionesQuery = useRecaladaAtenciones(recaladaId);

  const arrive = useArriveRecalada();
  const depart = useDepartRecalada();
  const cancel = useCancelRecalada();
  const deleteRec = useDeleteRecalada();

  const [actionError, setActionError] = useState<string | null>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const recalada = recaladaQuery.data;

  if (!recaladaId) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex min-h-screen items-center justify-center px-5">
            <ErrorState
              title="ID inválido"
              message="El identificador de la recalada no es válido."
              onRetry={() => history.push("/recaladas")}
              retryLabel="Volver al listado"
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (recaladaQuery.isLoading && !recalada) {
    return <LoadingScreen message="Cargando recalada..." />;
  }

  if (recaladaQuery.error && !recalada) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex min-h-screen items-center justify-center px-5">
            <ErrorState
              title="No pude cargar la recalada"
              message={
                recaladaQuery.error instanceof Error
                  ? recaladaQuery.error.message
                  : "Ocurrió un problema al consultar el detalle."
              }
              onRetry={() => void recaladaQuery.refetch()}
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!recalada) return null;

  const opStatus = recalada.operationalStatus;
  const canEdit =
    isSupervisor &&
    (opStatus === "SCHEDULED" || opStatus === "ARRIVED");
  const canArrive = isSupervisor && opStatus === "SCHEDULED";
  const canDepart = isSupervisor && opStatus === "ARRIVED";
  const canCancel =
    isSupervisor &&
    opStatus !== "DEPARTED" &&
    opStatus !== "CANCELED" &&
    (opStatus === "SCHEDULED" || isSuperAdmin);
  const canDelete = isSupervisor && opStatus === "SCHEDULED";

  const isBusy =
    arrive.isPending ||
    depart.isPending ||
    cancel.isPending ||
    deleteRec.isPending;

  async function handleArrive() {
    const ok = window.confirm(
      `¿Confirmas la llegada de ${recalada!.buque.nombre} (${recalada!.codigoRecalada})?`
    );
    if (!ok) return;
    setActionError(null);
    try {
      await arrive.mutateAsync({ id: recaladaId! });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No pude registrar la llegada"
      );
    }
  }

  async function handleDepart() {
    const ok = window.confirm(
      `¿Confirmas la salida de ${recalada!.buque.nombre} (${recalada!.codigoRecalada})?`
    );
    if (!ok) return;
    setActionError(null);
    try {
      await depart.mutateAsync({ id: recaladaId! });
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No pude registrar la salida"
      );
    }
  }

  async function handleCancel() {
    setActionError(null);
    try {
      await cancel.mutateAsync({
        id: recaladaId!,
        reason: cancelReason.trim() || undefined,
      });
      setShowCancelForm(false);
      setCancelReason("");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No pude cancelar la recalada"
      );
    }
  }

  async function handleDelete() {
    const ok = window.confirm(
      `¿Eliminar permanentemente ${recalada!.codigoRecalada}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    setActionError(null);
    try {
      await deleteRec.mutateAsync(recaladaId!);
      history.replace("/recaladas");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No pude eliminar la recalada"
      );
    }
  }

  const supervisorName = [
    recalada.supervisor?.usuario?.nombres,
    recalada.supervisor?.usuario?.apellidos,
  ]
    .filter(Boolean)
    .join(" ") || recalada.supervisor?.usuario?.email || "—";

  const atenciones = atencionesQuery.data ?? [];

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-40 pt-8">
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
                  Recaladas
                </p>
                <h1 className="mt-1 font-mono text-xl font-bold text-[var(--color-fg-primary)]">
                  {recalada.codigoRecalada}
                </h1>
              </div>
            </div>

            <OperationalAlertBanner
              title={recalada.buque.nombre}
              description={`${recalada.paisOrigen.codigo} · ${recalada.paisOrigen.nombre}`}
              statusLabel={getOpStatusLabel(opStatus)}
              statusTone={getOpStatusTone(opStatus)}
            />

            {actionError ? (
              <div
                className="rounded-2xl border px-3 py-3 text-sm"
                style={{
                  background: "var(--color-danger-soft)",
                  borderColor: "var(--color-danger-border)",
                  color: "var(--color-danger)",
                }}
              >
                {actionError}
              </div>
            ) : null}

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader title="Detalle operativo" />
              <KeyValueGrid
                columns={2}
                items={[
                  {
                    label: "Código",
                    value: recalada.codigoRecalada,
                    mono: true,
                    accent: true,
                  },
                  {
                    label: "Estado",
                    value: (
                      <StatusChip
                        tone={getOpStatusTone(opStatus)}
                        dot
                      >
                        {getOpStatusLabel(opStatus)}
                      </StatusChip>
                    ),
                  },
                  {
                    label: "Terminal",
                    value: recalada.terminal ?? "—",
                  },
                  {
                    label: "Muelle",
                    value: recalada.muelle ?? "—",
                  },
                  {
                    label: "Pasajeros est.",
                    value: recalada.pasajerosEstimados ?? "—",
                  },
                  {
                    label: "Tripulación est.",
                    value: recalada.tripulacionEstimada ?? "—",
                  },
                  {
                    label: "Fuente",
                    value: recalada.fuente,
                  },
                  {
                    label: "Supervisor",
                    value: supervisorName,
                  },
                ]}
              />
            </SurfaceCard>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader title="Fechas" />
              <KeyValueGrid
                columns={2}
                items={[
                  {
                    label: "Llegada prog.",
                    value: formatDate(recalada.fechaLlegada),
                  },
                  {
                    label: "Salida prog.",
                    value: formatDate(recalada.fechaSalida),
                  },
                  {
                    label: "Llegada real",
                    value: formatDate(recalada.arrivedAt),
                  },
                  {
                    label: "Salida real",
                    value: formatDate(recalada.departedAt),
                  },
                  ...(recalada.canceledAt
                    ? [
                        {
                          label: "Cancelado",
                          value: formatDate(recalada.canceledAt),
                        },
                      ]
                    : []),
                ]}
              />
              {recalada.cancelReason ? (
                <div
                  className="rounded-xl px-3 py-2 text-sm"
                  style={{
                    background: "var(--color-danger-soft)",
                    color: "var(--color-danger)",
                  }}
                >
                  <span className="font-semibold">Motivo: </span>
                  {recalada.cancelReason}
                </div>
              ) : null}
            </SurfaceCard>

            {recalada.observaciones ? (
              <SurfaceCard className="gap-2 p-4" radius="xl" variant="raised">
                <PageSectionHeader title="Observaciones" />
                <p className="text-sm leading-6 text-[var(--color-fg-secondary)]">
                  {recalada.observaciones}
                </p>
              </SurfaceCard>
            ) : null}

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Atenciones"
                description={
                  atencionesQuery.isLoading
                    ? "Cargando..."
                    : `${atenciones.length} atención${atenciones.length !== 1 ? "es" : ""} asociada${atenciones.length !== 1 ? "s" : ""}`
                }
              />

              {atencionesQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <SurfaceCard
                      key={i}
                      className="h-14 animate-pulse"
                      radius="lg"
                      variant="inset"
                    >
                      <div />
                    </SurfaceCard>
                  ))}
                </div>
              ) : atenciones.length === 0 ? (
                <EmptyStateCard
                  title="Sin atenciones"
                  description="Esta recalada aún no tiene atenciones asignadas."
                />
              ) : (
                <div className="space-y-2">
                  {atenciones.map((atencion) => {
                    const turnosOcupados = atencion.turnos.filter(
                      (t) =>
                        t.status !== "AVAILABLE" && t.status !== "CANCELED"
                    ).length;
                    return (
                      <SurfaceCard
                        key={atencion.id}
                        className="gap-1 px-3 py-3"
                        radius="lg"
                        variant="inset"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-[var(--color-fg-primary)]">
                            Atención #{atencion.id}
                          </p>
                          <StatusChip
                            tone={
                              atencion.operationalStatus === "CANCELED"
                                ? "danger"
                                : atencion.operationalStatus === "COMPLETED"
                                  ? "success"
                                  : "info"
                            }
                          >
                            {atencion.operationalStatus}
                          </StatusChip>
                        </div>
                        <p className="text-[0.6875rem] text-[var(--color-fg-muted)]">
                          {formatDate(atencion.fechaInicio)} →{" "}
                          {formatDate(atencion.fechaFin)}
                        </p>
                        <p className="text-[0.6875rem] text-[var(--color-fg-secondary)]">
                          Turnos: {turnosOcupados} / {atencion.turnosTotal}
                        </p>
                      </SurfaceCard>
                    );
                  })}
                </div>
              )}
            </SurfaceCard>
          </div>
        </div>

        {showCancelForm ? (
          <StickyBottomActions>
            <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
              <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
                Cancelar recalada
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Motivo de cancelación (opcional)..."
                maxLength={500}
                className="w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--color-border-glass)",
                  color: "var(--color-fg-primary)",
                  boxShadow:
                    "inset 2px 2px 5px rgba(0,0,0,0.35), inset -2px -2px 5px rgba(255,255,255,0.03)",
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="danger"
                  size="md"
                  isLoading={cancel.isPending}
                  onClick={() => void handleCancel()}
                >
                  Confirmar
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={cancel.isPending}
                  onClick={() => {
                    setShowCancelForm(false);
                    setCancelReason("");
                    setActionError(null);
                  }}
                >
                  Volver
                </Button>
              </div>
            </SurfaceCard>
          </StickyBottomActions>
        ) : (
          (canArrive || canDepart || canEdit || canCancel || canDelete) ? (
            <StickyBottomActions>
              <div className="flex flex-col gap-2">
                {canArrive ? (
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={arrive.isPending}
                    disabled={isBusy}
                    onClick={() => void handleArrive()}
                  >
                    Marcar llegada
                  </Button>
                ) : null}

                {canDepart ? (
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={depart.isPending}
                    disabled={isBusy}
                    onClick={() => void handleDepart()}
                  >
                    Marcar salida
                  </Button>
                ) : null}

                {canEdit ? (
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={isBusy}
                    onClick={() =>
                      history.push(`/recaladas/${recaladaId}/editar`)
                    }
                  >
                    Editar
                  </Button>
                ) : null}

                {canCancel ? (
                  <Button
                    variant="danger"
                    size="md"
                    disabled={isBusy}
                    onClick={() => setShowCancelForm(true)}
                  >
                    Cancelar recalada
                  </Button>
                ) : null}

                {canDelete ? (
                  <Button
                    variant="ghost"
                    size="md"
                    isLoading={deleteRec.isPending}
                    disabled={isBusy}
                    onClick={() => void handleDelete()}
                  >
                    Eliminar
                  </Button>
                ) : null}
              </div>
            </StickyBottomActions>
          ) : null
        )}
      </IonContent>
    </IonPage>
  );
};

export default RecaladaDetailPage;
