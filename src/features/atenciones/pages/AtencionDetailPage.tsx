import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import Button from "../../../ui/components/Button";
import EmptyStateCard from "../../../ui/components/EmptyStateCard";
import ErrorState from "../../../ui/components/ErrorState";
import KeyValueGrid from "../../../ui/components/KeyValueGrid";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import OperationalAlertBanner from "../../../ui/components/OperationalAlertBanner";
import PageSectionHeader from "../../../ui/components/PageSectionHeader";
import StatusChip from "../../../ui/components/StatusChip";
import SurfaceCard from "../../../ui/components/SurfaceCard";
import { useAtencion } from "../hooks/useAtencion";
import { useAtencionSummary } from "../hooks/useAtencionSummary";
import { useAtencionTurnos } from "../hooks/useAtencionTurnos";
import { useCancelAtencion } from "../hooks/useCancelAtencion";
import { useClaimAtencionTurno } from "../hooks/useClaimAtencionTurno";
import { useCloseAtencion } from "../hooks/useCloseAtencion";
import { useTurnoSocket } from "../../turnos/hooks/useTurnoSocket";
import { useAssignTurno } from "../../turnos/hooks/useTurnoActions";
import { useGuidesLookup } from "../../users/hooks/useGuidesLookup";
import type {
  AtencionOperationalStatus,
  TurnoStatus,
} from "../types/atenciones.types";

interface RouteParams {
  id: string;
}

function getOpTone(
  status: AtencionOperationalStatus
): "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "PLANNED":
    case "OPEN":
      return "info";
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
    case "CLOSED":
      return "success";
    case "CANCELED":
      return "danger";
    default:
      return "info";
  }
}

function getOpLabel(status: AtencionOperationalStatus): string {
  switch (status) {
    case "PLANNED":
      return "Planeada";
    case "OPEN":
      return "Abierta";
    case "IN_PROGRESS":
      return "En curso";
    case "COMPLETED":
      return "Completada";
    case "CLOSED":
      return "Cerrada";
    case "CANCELED":
      return "Cancelada";
    default:
      return status;
  }
}

function getTurnoTone(
  status: TurnoStatus
): "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "AVAILABLE":
      return "info";
    case "ASSIGNED":
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELED":
    case "NO_SHOW":
      return "danger";
    default:
      return "info";
  }
}

function getTurnoLabel(status: TurnoStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "Disponible";
    case "ASSIGNED":
      return "Asignado";
    case "IN_PROGRESS":
      return "En curso";
    case "COMPLETED":
      return "Completado";
    case "CANCELED":
      return "Cancelado";
    case "NO_SHOW":
      return "No se presentó";
    default:
      return status;
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

const AtencionDetailPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { id: paramId } = useParams<RouteParams>();
  const user = useSessionStore((state) => state.user);

  const id = paramId || location.pathname.match(/\/atenciones\/(\d+)/)?.[1];

  const atencionId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [id]);

  const isSupervisor =
    user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  const isGuia = user?.role === "GUIA";
  useTurnoSocket(atencionId);

  const atencionQuery = useAtencion(atencionId);
  const summaryQuery = useAtencionSummary(atencionId);
  const turnosQuery = useAtencionTurnos(atencionId);

  const claim = useClaimAtencionTurno();
  const cancel = useCancelAtencion();
  const close = useCloseAtencion();
  const assign = useAssignTurno();
  const guidesQuery = useGuidesLookup();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [assigningTurnoId, setAssigningTurnoId] = useState<number | null>(null);

  const atencion = atencionQuery.data;
  const summary = summaryQuery.data;
  const turnos = turnosQuery.data ?? [];

  if (!atencionId) return null;

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

  const opStatus = atencion.operationalStatus;
  const isActive =
    opStatus !== "CANCELED" && opStatus !== "CLOSED" && opStatus !== "COMPLETED";

  const alreadyClaimed = turnos.some((t) => t.guiaId === user?.id);
  const hasAvailable = turnos.some((t) => t.status === "AVAILABLE");

  const canClaim = isGuia && isActive && !alreadyClaimed && hasAvailable;
  const canEdit = isSupervisor && isActive;
  const canCancel = isSupervisor && opStatus !== "CANCELED" && opStatus !== "CLOSED";
  const canClose = isSupervisor && isActive;

  const isBusy = claim.isPending || cancel.isPending || close.isPending || assign.isPending;

  async function handleAssign(turnoId: number, guiaId: string) {
    setActionError(null);
    try {
      await assign.mutateAsync({ id: turnoId, guiaId });
      setAssigningTurnoId(null);
      setActionMessage(`Turno #${turnoId} asignado.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "No pude asignar el turno");
    }
  }

  async function handleClaim() {
    setActionError(null);
    setActionMessage(null);
    try {
      const turno = await claim.mutateAsync(atencionId!);
      setActionMessage(
        turno ? `Turno #${turno.numero} asignado correctamente.` : "Turno asignado."
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No pude tomar un turno disponible"
      );
    }
  }

  async function handleCancel() {
    if (cancelReason.trim().length < 3) {
      setActionError("Debes indicar un motivo (mínimo 3 caracteres).");
      return;
    }
    setActionError(null);
    try {
      await cancel.mutateAsync({
        id: atencionId!,
        reason: cancelReason.trim(),
      });
      setShowCancelForm(false);
      setCancelReason("");
      setActionMessage("Atención cancelada.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No pude cancelar la atención"
      );
    }
  }

  async function handleClose() {
    const ok = window.confirm(
      "¿Confirmas el cierre de esta atención? No debe quedar ningún turno activo."
    );
    if (!ok) return;
    setActionError(null);
    try {
      await close.mutateAsync(atencionId!);
      setActionMessage("Atención cerrada.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "No pude cerrar la atención"
      );
    }
  }

  const supervisorName =
    [
      atencion.supervisor?.usuario?.nombres,
      atencion.supervisor?.usuario?.apellidos,
    ]
      .filter(Boolean)
      .join(" ") ||
    atencion.supervisor?.usuario?.email ||
    "—";

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-6 pt-8">
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
                <h1 className="mt-1 font-mono text-xl font-bold text-[var(--color-fg-primary)]">
                  Atención #{atencion.id}
                </h1>
              </div>
            </div>

            <OperationalAlertBanner
              title={
                atencion.recalada
                  ? `Recalada ${atencion.recalada.codigoRecalada}`
                  : `Recalada #${atencion.recaladaId}`
              }
              description={
                atencion.recalada?.buque?.nombre ??
                `${atencion.turnosTotal} turnos materializados`
              }
              statusLabel={getOpLabel(opStatus)}
              statusTone={getOpTone(opStatus)}
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

            {actionMessage ? (
              <div
                className="rounded-2xl border px-3 py-3 text-sm"
                style={{
                  background: "var(--color-success-soft)",
                  borderColor: "var(--color-success-border)",
                  color: "var(--color-success)",
                }}
              >
                {actionMessage}
              </div>
            ) : null}

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader title="Detalle" />
              <KeyValueGrid
                columns={2}
                items={[
                  {
                    label: "Estado",
                    value: (
                      <StatusChip tone={getOpTone(opStatus)} dot>
                        {getOpLabel(opStatus)}
                      </StatusChip>
                    ),
                  },
                  { label: "Cupo", value: atencion.turnosTotal },
                  { label: "Inicio", value: formatDate(atencion.fechaInicio) },
                  { label: "Fin", value: formatDate(atencion.fechaFin) },
                  { label: "Supervisor", value: supervisorName },
                  {
                    label: "Recalada",
                    value:
                      atencion.recalada?.codigoRecalada ??
                      `#${atencion.recaladaId}`,
                  },
                ]}
              />
              {atencion.descripcion ? (
                <p className="text-sm leading-6 text-[var(--color-fg-secondary)]">
                  {atencion.descripcion}
                </p>
              ) : null}
              {atencion.cancelReason ? (
                <div
                  className="rounded-xl px-3 py-2 text-sm"
                  style={{
                    background: "var(--color-danger-soft)",
                    color: "var(--color-danger)",
                  }}
                >
                  <span className="font-semibold">Motivo cancelación: </span>
                  {atencion.cancelReason}
                </div>
              ) : null}
            </SurfaceCard>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Resumen de cupos"
                description={
                  summaryQuery.isLoading ? "Cargando..." : undefined
                }
              />
              {summary ? (
                <KeyValueGrid
                  columns={2}
                  items={[
                    { label: "Total", value: summary.turnosTotal },
                    { label: "Disponibles", value: summary.availableCount },
                    { label: "Asignados", value: summary.assignedCount },
                    { label: "En curso", value: summary.inProgressCount },
                    { label: "Completados", value: summary.completedCount },
                    { label: "Cancelados", value: summary.canceledCount },
                    { label: "No show", value: summary.noShowCount },
                  ]}
                />
              ) : summaryQuery.error ? (
                <ErrorState
                  compact
                  title="No pude cargar el resumen"
                  message={
                    summaryQuery.error instanceof Error
                      ? summaryQuery.error.message
                      : "Error inesperado"
                  }
                  onRetry={() => void summaryQuery.refetch()}
                />
              ) : null}
            </SurfaceCard>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Turnos"
                description={
                  turnosQuery.isLoading
                    ? "Cargando..."
                    : `${turnos.length} turno${turnos.length !== 1 ? "s" : ""}`
                }
              />
              {turnosQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SurfaceCard
                      key={i}
                      className="h-12 animate-pulse"
                      radius="lg"
                      variant="inset"
                    >
                      <div />
                    </SurfaceCard>
                  ))}
                </div>
              ) : turnos.length === 0 ? (
                <EmptyStateCard
                  title="Sin turnos"
                  description="Esta atención no tiene turnos materializados."
                />
              ) : (
                <div className="space-y-2">
                  {turnos.map((turno) => {
                    const guiaName =
                      [
                        turno.guia?.usuario?.nombres,
                        turno.guia?.usuario?.apellidos,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      turno.guia?.usuario?.email ||
                      (turno.guiaId ? "Asignado" : "Sin asignar");
                    const isAssigning = assigningTurnoId === turno.id;
                    const canAssignThis = isSupervisor && isActive && turno.status === "AVAILABLE";
                    return (
                      <SurfaceCard
                        key={turno.id}
                        className="gap-2 px-3 py-3"
                        radius="lg"
                        variant="inset"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
                            Turno #{turno.numero}
                          </p>
                          <StatusChip tone={getTurnoTone(turno.status)}>
                            {getTurnoLabel(turno.status)}
                          </StatusChip>
                        </div>
                        <p className="text-[0.6875rem] text-[var(--color-fg-secondary)]">
                          {guiaName}
                        </p>
                        {canAssignThis && !isAssigning && (
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth={false}
                            disabled={isBusy}
                            onClick={() => setAssigningTurnoId(turno.id)}
                          >
                            Asignar guía
                          </Button>
                        )}
                        {isAssigning && (
                          <div className="flex flex-col gap-2 pt-1">
                            {guidesQuery.isLoading ? (
                              <p className="text-xs text-[var(--color-fg-muted)]">Cargando guías...</p>
                            ) : (guidesQuery.data ?? []).length === 0 ? (
                              <p className="text-xs text-[var(--color-fg-muted)]">No hay guías disponibles.</p>
                            ) : (
                              (guidesQuery.data ?? []).map((g) => (
                                <button
                                  key={g.id}
                                  disabled={assign.isPending}
                                  onClick={() => void handleAssign(turno.id, g.id)}
                                  className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors"
                                  style={{
                                    background: "var(--color-bg-elevated)",
                                    border: "1px solid var(--color-border-glass)",
                                    color: "var(--color-fg-primary)",
                                  }}
                                >
                                  {g.nombre || g.email}
                                </button>
                              ))
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              fullWidth={false}
                              onClick={() => setAssigningTurnoId(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </SurfaceCard>
                    );
                  })}
                </div>
              )}
            </SurfaceCard>
            {(canClaim || canEdit || canCancel || canClose) && (
              <div className="flex flex-col gap-2">
                {canClaim && (
                  <Button
                    variant="primary"
                    size="md"
                    isLoading={claim.isPending}
                    disabled={isBusy}
                    onClick={() => void handleClaim()}
                  >
                    Tomar turno disponible
                  </Button>
                )}
                {canEdit && (
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={isBusy}
                    onClick={() => history.push(`/atenciones/${atencionId}/editar`)}
                  >
                    Editar
                  </Button>
                )}
                {canClose && (
                  <Button
                    variant="secondary"
                    size="md"
                    isLoading={close.isPending}
                    disabled={isBusy}
                    onClick={() => void handleClose()}
                  >
                    Cerrar atención
                  </Button>
                )}
                {canCancel && !showCancelForm && (
                  <Button
                    variant="danger"
                    size="md"
                    disabled={isBusy}
                    onClick={() => setShowCancelForm(true)}
                  >
                    Cancelar atención
                  </Button>
                )}
                {showCancelForm && (
                  <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
                    <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
                      Cancelar atención
                    </p>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      rows={3}
                      placeholder="Motivo de cancelación (mín. 3 caracteres)..."
                      maxLength={500}
                      className="w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none"
                      style={{
                        background: "var(--color-glass-subtle)",
                        borderColor: "var(--color-border-glass)",
                        color: "var(--color-fg-primary)",
                        boxShadow: "var(--shadow-neu-inset)",
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
                )}
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AtencionDetailPage;
