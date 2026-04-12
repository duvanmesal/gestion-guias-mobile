import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import Button from "../../../ui/components/Button";
import EmptyStateCard from "../../../ui/components/EmptyStateCard";
import EntityListRow from "../../../ui/components/EntityListRow";
import ErrorState from "../../../ui/components/ErrorState";
import PageSectionHeader from "../../../ui/components/PageSectionHeader";
import StatusChip from "../../../ui/components/StatusChip";
import SurfaceCard from "../../../ui/components/SurfaceCard";
import { useMyActiveTurno } from "../hooks/useMyActiveTurno";
import { useMyNextTurno } from "../hooks/useMyNextTurno";
import { useMyTurnos } from "../hooks/useMyTurnos";
import { useTurnosList } from "../hooks/useTurnosList";
import {
  formatTurnoDate,
  getTurnoLabel,
  getTurnoTone,
} from "../lib/turnoStatus";
import type { TurnoItem, TurnoStatus } from "../types/turnos.types";

const PAGE_SIZE = 20;

type StatusFilter = TurnoStatus | "";

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "rgba(255,255,255,0.03)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow:
    "inset 2px 2px 5px rgba(0,0,0,0.35), inset -2px -2px 5px rgba(255,255,255,0.03)",
} as const;

const TurnosListPage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  const isSupervisor =
    user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  const isGuia = user?.role === "GUIA";

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      status: statusFilter || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [page, statusFilter]
  );

  const supervisorQuery = useTurnosList(isSupervisor ? queryParams : {});
  const guiaQuery = useMyTurnos(queryParams);

  const active = useMyActiveTurno(isGuia);
  const next = useMyNextTurno(isGuia);

  const activeItem = isGuia ? active.data ?? null : null;
  const nextItem = isGuia ? next.data ?? null : null;

  const data = isSupervisor ? supervisorQuery.data : guiaQuery.data;
  const isLoading = isSupervisor ? supervisorQuery.isLoading : guiaQuery.isLoading;
  const isFetching = isSupervisor
    ? supervisorQuery.isFetching
    : guiaQuery.isFetching;
  const error = isSupervisor ? supervisorQuery.error : guiaQuery.error;
  const refetch = isSupervisor ? supervisorQuery.refetch : guiaQuery.refetch;

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  function renderTurnoRow(turno: TurnoItem) {
    const atencionCode =
      turno.atencion?.recalada?.codigoRecalada ??
      (turno.atencion ? `Atención #${turno.atencionId}` : `#${turno.atencionId}`);
    return (
      <EntityListRow
        key={turno.id}
        title={`Turno #${turno.numero} · ${atencionCode}`}
        subtitle={`${formatTurnoDate(turno.fechaInicio)} → ${formatTurnoDate(turno.fechaFin)}`}
        metadata={
          <StatusChip tone={getTurnoTone(turno.status)} dot>
            {getTurnoLabel(turno.status)}
          </StatusChip>
        }
        action={
          <Button
            variant="ghost"
            size="sm"
            fullWidth={false}
            onClick={() => history.push(`/turnos/${turno.id}`)}
          >
            Ver
          </Button>
        }
      />
    );
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-32 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                Operaciones
              </p>
              <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                Turnos
              </h1>
            </div>

            {isGuia && activeItem ? (
              <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
                <PageSectionHeader
                  title="Turno en curso"
                  description="Este es el turno que tienes activo ahora mismo."
                />
                {renderTurnoRow(activeItem)}
              </SurfaceCard>
            ) : null}

            {isGuia && !activeItem && nextItem ? (
              <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
                <PageSectionHeader
                  title="Próximo turno"
                  description="Tu siguiente turno agendado."
                />
                {renderTurnoRow(nextItem)}
              </SurfaceCard>
            ) : null}

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Filtros"
                description="Filtra por estado del turno."
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setPage(1);
                }}
                className={inputClassName}
                style={inputStyle}
              >
                <option value="">Todos los estados</option>
                <option value="AVAILABLE">Disponibles</option>
                <option value="ASSIGNED">Asignados</option>
                <option value="IN_PROGRESS">En curso</option>
                <option value="COMPLETED">Completados</option>
                <option value="CANCELED">Cancelados</option>
                <option value="NO_SHOW">No se presentó</option>
              </select>
            </SurfaceCard>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title={isSupervisor ? "Agenda de turnos" : "Mis turnos"}
                description={
                  data?.meta
                    ? `Página ${data.meta.page} de ${Math.max(1, totalPages)} · ${data.meta.total} turnos`
                    : "Listado de turnos"
                }
              />

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SurfaceCard
                      key={i}
                      className="h-[72px] animate-pulse"
                      radius="lg"
                      variant="inset"
                    >
                      <div />
                    </SurfaceCard>
                  ))}
                </div>
              ) : error ? (
                <ErrorState
                  compact
                  title="No pude cargar los turnos"
                  message={
                    error instanceof Error
                      ? error.message
                      : "Ocurrió un problema inesperado."
                  }
                  onRetry={() => {
                    void refetch();
                  }}
                />
              ) : items.length === 0 ? (
                <EmptyStateCard
                  title="No hay turnos"
                  description="Cuando existan turnos aparecerán aquí."
                />
              ) : (
                <div className="space-y-3">{items.map(renderTurnoRow)}</div>
              )}

              {!isLoading && !error && items.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!canGoPrev || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!canGoNext || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              ) : null}
            </SurfaceCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TurnosListPage;
