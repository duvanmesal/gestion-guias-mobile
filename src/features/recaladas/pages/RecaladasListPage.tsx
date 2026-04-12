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
import { useRecaladasList } from "../hooks/useRecaladasList";
import type {
  ListRecaladasParams,
  RecaladaOperationalStatus,
} from "../types/recaladas.types";

const PAGE_SIZE = 20;

type StatusFilter = RecaladaOperationalStatus | "";

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
  background: "rgba(255,255,255,0.03)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow:
    "inset 2px 2px 5px rgba(0,0,0,0.35), inset -2px -2px 5px rgba(255,255,255,0.03)",
} as const;

const RecaladasListPage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  const isSupervisor =
    user?.role === "SUPERVISOR" || user?.role === "SUPER_ADMIN";

  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo<ListRecaladasParams>(
    () => ({
      q: search.trim() || undefined,
      operationalStatus: statusFilter || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [page, search, statusFilter]
  );

  const { data, isLoading, isFetching, error, refetch } =
    useRecaladasList(queryParams);

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  const hasFilters = Boolean(search.trim() || statusFilter);

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-32 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Operaciones
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Recaladas
                </h1>
              </div>

              {isSupervisor ? (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth={false}
                  onClick={() => {
                    history.push("/recaladas/nueva");
                  }}
                >
                  Nueva
                </Button>
              ) : null}
            </div>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Búsqueda y filtros"
                description="Busca por código, nombre de buque u observaciones y filtra por estado operativo."
              />

              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  setSearch(draftSearch);
                }}
              >
                <input
                  type="text"
                  value={draftSearch}
                  onChange={(e) => {
                    setDraftSearch(e.target.value);
                  }}
                  placeholder="Buscar por código, buque u observaciones"
                  className={inputClassName}
                  style={inputStyle}
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
                  <option value="SCHEDULED">Programadas</option>
                  <option value="ARRIVED">Llegadas</option>
                  <option value="DEPARTED">Partidas</option>
                  <option value="CANCELED">Canceladas</option>
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <Button type="submit" variant="primary" size="md">
                    Aplicar
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setDraftSearch("");
                      setSearch("");
                      setStatusFilter("");
                      setPage(1);
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              </form>
            </SurfaceCard>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Agenda operativa"
                description={
                  data?.meta
                    ? `Página ${data.meta.page} de ${Math.max(1, totalPages)} · ${data.meta.total} recaladas`
                    : "Listado de recaladas registradas"
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
                  title="No pude cargar las recaladas"
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
                  title={
                    hasFilters
                      ? "No hay resultados para esos filtros"
                      : "Aún no hay recaladas registradas"
                  }
                  description={
                    hasFilters
                      ? "Prueba con otro texto o limpia los filtros."
                      : "Cuando crees la primera recalada, aparecerá aquí con su estado operativo."
                  }
                  action={
                    isSupervisor ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          history.push("/recaladas/nueva");
                        }}
                      >
                        Crear recalada
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="space-y-3">
                  {items.map((recalada) => (
                    <EntityListRow
                      key={recalada.id}
                      title={`${recalada.buque.nombre} · ${recalada.codigoRecalada}`}
                      subtitle={`Llegada: ${formatDateShort(recalada.fechaLlegada)}`}
                      metadata={
                        <StatusChip
                          tone={getOpStatusTone(recalada.operationalStatus)}
                          dot
                        >
                          {getOpStatusLabel(recalada.operationalStatus)}
                        </StatusChip>
                      }
                      action={
                        <Button
                          variant="ghost"
                          size="sm"
                          fullWidth={false}
                          onClick={() => {
                            history.push(`/recaladas/${recalada.id}`);
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

export default RecaladasListPage;
