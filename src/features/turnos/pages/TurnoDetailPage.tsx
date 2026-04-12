import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import Button from "../../../ui/components/Button";
import ErrorState from "../../../ui/components/ErrorState";
import KeyValueGrid from "../../../ui/components/KeyValueGrid";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import OperationalAlertBanner from "../../../ui/components/OperationalAlertBanner";
import PageSectionHeader from "../../../ui/components/PageSectionHeader";
import StatusChip from "../../../ui/components/StatusChip";
import StickyBottomActions from "../../../ui/components/StickyBottomActions";
import SurfaceCard from "../../../ui/components/SurfaceCard";
import { useTurno } from "../hooks/useTurno";
import {
  useCancelTurno,
  useCheckInTurno,
  useCheckOutTurno,
  useClaimTurno,
  useNoShowTurno,
  useUnassignTurno,
} from "../hooks/useTurnoActions";
import {
  formatTurnoDate,
  getTurnoLabel,
  getTurnoTone,
} from "../lib/turnoStatus";

interface RouteParams {
  id: string;
}

const TurnoDetailPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const user = useSessionStore((s) => s.user);

  const turnoId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [id]);

  const isSupervisor =
    user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  const isGuia = user?.role === "GUIA";

  const turnoQuery = useTurno(turnoId);

  const claim = useClaimTurno();
  const checkIn = useCheckInTurno();
  const checkOut = useCheckOutTurno();
  const cancel = useCancelTurno();
  const unassign = useUnassignTurno();
  const noShow = useNoShowTurno();

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const turno = turnoQuery.data;

  if (!turnoId) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex min-h-screen items-center justify-center px-5">
            <ErrorState
              title="ID inválido"
              message="El identificador del turno no es válido."
              onRetry={() => history.push("/turnos")}
              retryLabel="Volver al listado"
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (turnoQuery.isLoading && !turno) {
    return <LoadingScreen message="Cargando turno..." />;
  }

  if (turnoQuery.error && !turno) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex min-h-screen items-center justify-center px-5">
            <ErrorState
              title="No pude cargar el turno"
              message={
                turnoQuery.error instanceof Error
                  ? turnoQuery.error.message
                  : "Ocurrió un problema al consultar el detalle."
              }
              onRetry={() => void turnoQuery.refetch()}
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!turno) return null;

  const isMine = isGuia && !!user && turno.guia?.usuario?.id === user.id;
  const canClaim =
    isGuia && turno.status === "AVAILABLE" && !turno.guiaId;
  const canCheckIn = isMine && turno.status === "ASSIGNED";
  const canCheckOut = isMine && turno.status === "IN_PROGRESS";
  const canUnassign =
    isSupervisor && (turno.status === "ASSIGNED" || turno.status === "IN_PROGRESS");
  const canNoShow =
    isSupervisor && (turno.status === "ASSIGNED" || turno.status === "IN_PROGRESS");
  const canCancel =
    isSupervisor &&
    turno.status !== "CANCELED" &&
    turno.status !== "COMPLETED" &&
    turno.status !== "NO_SHOW";

  const isBusy =
    claim.isPending ||
    checkIn.isPending ||
    checkOut.isPending ||
    cancel.isPending ||
    unassign.isPending ||
    noShow.isPending;

  function runAction<T>(fn: () => Promise<T>, successMessage: string, fallback: string) {
    setActionError(null);
    setActionMessage(null);
    return fn()
      .then(() => {
        setActionMessage(successMessage);
      })
      .catch((err: unknown) => {
        setActionError(err instanceof Error ? err.message : fallback);
      });
  }

  async function handleCancel() {
    if (cancelReason.trim().length < 3) {
      setActionError("Debes indicar un motivo (mínimo 3 caracteres).");
      return;
    }
    await runAction(
      () =>
        cancel.mutateAsync({
          id: turnoId!,
          cancelReason: cancelReason.trim(),
        }),
      "Turno cancelado.",
      "No pude cancelar el turno"
    );
    setShowCancelForm(false);
    setCancelReason("");
  }

  const guiaName =
    [turno.guia?.usuario?.nombres, turno.guia?.usuario?.apellidos]
      .filter(Boolean)
      .join(" ") ||
    turno.guia?.usuario?.email ||
    (turno.guiaId ? "Asignado" : "Sin asignar");

  const recaladaCode =
    turno.atencion?.recalada?.codigoRecalada ??
    (turno.atencion ? `#${turno.atencion.recaladaId}` : "—");

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
                  Turnos
                </p>
                <h1 className="mt-1 font-mono text-xl font-bold text-[var(--color-fg-primary)]">
                  Turno #{turno.numero}
                </h1>
              </div>
            </div>

            <OperationalAlertBanner
              title={`Atención #${turno.atencionId}`}
              description={`Recalada ${recaladaCode}`}
              statusLabel={getTurnoLabel(turno.status)}
              statusTone={getTurnoTone(turno.status)}
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
                      <StatusChip tone={getTurnoTone(turno.status)} dot>
                        {getTurnoLabel(turno.status)}
                      </StatusChip>
                    ),
                  },
                  { label: "Número", value: `#${turno.numero}` },
                  { label: "Inicio", value: formatTurnoDate(turno.fechaInicio) },
                  { label: "Fin", value: formatTurnoDate(turno.fechaFin) },
                  { label: "Guía", value: guiaName },
                  { label: "Recalada", value: recaladaCode },
                  {
                    label: "Check-in",
                    value: formatTurnoDate(turno.checkInAt),
                  },
                  {
                    label: "Check-out",
                    value: formatTurnoDate(turno.checkOutAt),
                  },
                ]}
              />
              {turno.observaciones ? (
                <p className="text-sm leading-6 text-[var(--color-fg-secondary)]">
                  {turno.observaciones}
                </p>
              ) : null}
              {turno.cancelReason ? (
                <div
                  className="rounded-xl px-3 py-2 text-sm"
                  style={{
                    background: "var(--color-danger-soft)",
                    color: "var(--color-danger)",
                  }}
                >
                  <span className="font-semibold">Motivo cancelación: </span>
                  {turno.cancelReason}
                </div>
              ) : null}
            </SurfaceCard>
          </div>
        </div>

        {showCancelForm ? (
          <StickyBottomActions>
            <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
              <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
                Cancelar turno
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Motivo de cancelación (mín. 3 caracteres)..."
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
        ) : canClaim ||
          canCheckIn ||
          canCheckOut ||
          canCancel ||
          canUnassign ||
          canNoShow ? (
          <StickyBottomActions>
            <div className="flex flex-col gap-2">
              {canClaim ? (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={claim.isPending}
                  disabled={isBusy}
                  onClick={() =>
                    void runAction(
                      () => claim.mutateAsync(turnoId!),
                      "Turno tomado.",
                      "No pude tomar el turno"
                    )
                  }
                >
                  Tomar turno
                </Button>
              ) : null}

              {canCheckIn ? (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={checkIn.isPending}
                  disabled={isBusy}
                  onClick={() =>
                    void runAction(
                      () => checkIn.mutateAsync(turnoId!),
                      "Check-in registrado.",
                      "No pude hacer check-in"
                    )
                  }
                >
                  Check-in
                </Button>
              ) : null}

              {canCheckOut ? (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={checkOut.isPending}
                  disabled={isBusy}
                  onClick={() =>
                    void runAction(
                      () => checkOut.mutateAsync(turnoId!),
                      "Check-out registrado.",
                      "No pude hacer check-out"
                    )
                  }
                >
                  Check-out
                </Button>
              ) : null}

              {canUnassign ? (
                <Button
                  variant="secondary"
                  size="md"
                  isLoading={unassign.isPending}
                  disabled={isBusy}
                  onClick={() =>
                    void runAction(
                      () => unassign.mutateAsync({ id: turnoId! }),
                      "Turno desasignado.",
                      "No pude desasignar el turno"
                    )
                  }
                >
                  Desasignar
                </Button>
              ) : null}

              {canNoShow ? (
                <Button
                  variant="secondary"
                  size="md"
                  isLoading={noShow.isPending}
                  disabled={isBusy}
                  onClick={() =>
                    void runAction(
                      () => noShow.mutateAsync({ id: turnoId! }),
                      "Marcado como no-show.",
                      "No pude marcar no-show"
                    )
                  }
                >
                  Marcar no-show
                </Button>
              ) : null}

              {canCancel ? (
                <Button
                  variant="danger"
                  size="md"
                  disabled={isBusy}
                  onClick={() => setShowCancelForm(true)}
                >
                  Cancelar turno
                </Button>
              ) : null}
            </div>
          </StickyBottomActions>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default TurnoDetailPage;
