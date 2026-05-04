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
import { useAtencionesList } from "../hooks/useAtencionesList";
import { useTurnoSocket } from "../../turnos/hooks/useTurnoSocket";
import type {
  AtencionOperationalStatus,
  ListAtencionesParams,
} from "../types/atenciones.types";

const PAGE_SIZE = 20;

type OpStatusFilter = AtencionOperationalStatus | "";

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

function formatDateShort(iso: string | null | undefined): string {
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
  background: "var(--color-glass-subtle)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow: "var(--shadow-neu-inset)",
} as const;

const AtencionesListPage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  const isSupervisor =
    user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";
  useTurnoSocket();

  const [statusFilter, setStatusFilter] = useState<OpStatusFilter>("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo<ListAtencionesParams>(
    () => ({
      operationalStatus: statusFilter || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [page, statusFilter]
  );

  const { data, isLoading, isFetching, error, refetch } =
    useAtencionesList(queryParams);

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-6 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Operaciones
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Atenciones
                </h1>
              </div>
            </div>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Filtros"
                description="Filtra por estado operativo de la atención."
              />

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as OpStatusFilter);
                  setPage(1);
                }}
                className={inputClassName}
                style={inputStyle}
              >
                <option value="">Todos los estados</option>
                <option value="PLANNED">Planeadas</option>
                <option value="OPEN">Abiertas</option>
                <option value="IN_PROGRESS">En curso</option>
                <option value="COMPLETED">Completadas</option>
                <option value="CLOSED">Cerradas</option>
                <option value="CANCELED">Canceladas</option>
              </select>
            </SurfaceCard>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title={isSupervisor ? "Agenda de atenciones" : "Atenciones disponibles"}
                description={
                  data?.meta
                    ? `Página ${data.meta.page} de ${Math.max(1, totalPages)} · ${data.meta.total} atenciones`
                    : "Listado de atenciones"
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
                  title="No pude cargar las atenciones"
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
                  title="No hay atenciones"
                  description="Cuando haya atenciones registradas aparecerán aquí."
                />
              ) : (
                <div className="space-y-3">
                  {items.map((atencion) => (
                    <EntityListRow
                      key={atencion.id}
                      title={`Atención #${atencion.id}`}
                      subtitle={`${formatDateShort(atencion.fechaInicio)} → ${formatDateShort(atencion.fechaFin)} · ${atencion.turnosTotal} turnos`}
                      metadata={
                        <StatusChip
                          tone={getOpTone(atencion.operationalStatus)}
                          dot
                        >
                          {getOpLabel(atencion.operationalStatus)}
                        </StatusChip>
                      }
                      action={
                        <Button
                          variant="ghost"
                          size="sm"
                          fullWidth={false}
                          onClick={() => {
                            history.push(`/atenciones/${atencion.id}`);
                          }}
                        >
                          Ver
                        </Button>
                      }
                    />
                  ))}
                </div>
              )}

              {!isLoading && !error && items.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!canGoPrev || isFetching}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  >
                    Anterior
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!canGoNext || isFetching}
                    onClick={() => {
                      setPage((p) => p + 1);
                    }}
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

export default AtencionesListPage;
