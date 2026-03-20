import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../../core/auth/sessionStore";
import Button from "../../../../ui/components/Button";
import EmptyStateCard from "../../../../ui/components/EmptyStateCard";
import EntityListRow from "../../../../ui/components/EntityListRow";
import ErrorState from "../../../../ui/components/ErrorState";
import PageSectionHeader from "../../../../ui/components/PageSectionHeader";
import StatusChip from "../../../../ui/components/StatusChip";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import { useDeletePais } from "../hooks/useDeletePais";
import { usePaisesList } from "../hooks/usePaisesList";
import type { CatalogStatus } from "../types/catalogs.types";

const PAGE_SIZE = 10;

type StatusFilter = CatalogStatus | "";

const inputClassName =
  "w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "rgba(255,255,255,0.03)",
  borderColor: "var(--color-border-glass)",
  color: "var(--color-fg-primary)",
  boxShadow:
    "inset 2px 2px 5px rgba(0,0,0,0.35), inset -2px -2px 5px rgba(255,255,255,0.03)",
} as const;

const PaisesPage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      q: search.trim() || undefined,
      status: status || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [page, search, status]
  );

  const { data, isLoading, isFetching, error, refetch } =
    usePaisesList(queryParams);
  const deletePais = useDeletePais();

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  const hasFilters = Boolean(search.trim() || status);

  async function handleDelete(id: number, nombre: string) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el país "${nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setFeedbackMessage(null);

    try {
      await deletePais.mutateAsync(id);

      setFeedbackMessage(`El país ${nombre} fue eliminado correctamente.`);

      if (items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      }
    } catch (deleteError) {
      setFeedbackMessage(
        deleteError instanceof Error
          ? deleteError.message
          : "No pude eliminar el país"
      );
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-32 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin / Catálogos
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Países
                </h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => {
                  history.push("/admin/catalogos");
                }}
              >
                Volver
              </Button>
            </div>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Búsqueda y filtros"
                description="Puedes buscar por código o nombre y combinarlo con el estado del catálogo."
              />

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPage(1);
                  setSearch(draftSearch);
                }}
              >
                <input
                  type="text"
                  value={draftSearch}
                  onChange={(event) => {
                    setDraftSearch(event.target.value);
                  }}
                  placeholder="Buscar por código o nombre"
                  className={inputClassName}
                  style={inputStyle}
                />

                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as StatusFilter);
                    setPage(1);
                  }}
                  className={inputClassName}
                  style={inputStyle}
                >
                  <option value="">Todos los estados</option>
                  <option value="ACTIVO">Activos</option>
                  <option value="INACTIVO">Inactivos</option>
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
                      setStatus("");
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
                title="Listado"
                description={
                  data?.meta
                    ? `Página ${data.meta.page} de ${Math.max(
                        1,
                        totalPages
                      )} · ${data.meta.total} registros`
                    : "Listado administrativo del catálogo de países"
                }
                action={
                  isSuperAdmin ? (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth={false}
                      onClick={() => {
                        history.push("/admin/catalogos/paises/nuevo");
                      }}
                    >
                      Nuevo
                    </Button>
                  ) : null
                }
              />

              {feedbackMessage ? (
                <div
                  className="rounded-2xl border px-3 py-3 text-sm"
                  style={{
                    background: feedbackMessage.includes("correctamente")
                      ? "var(--color-primary-soft)"
                      : "var(--color-danger-soft)",
                    borderColor: feedbackMessage.includes("correctamente")
                      ? "var(--color-border-glow)"
                      : "var(--color-danger-border)",
                    color: feedbackMessage.includes("correctamente")
                      ? "var(--color-primary)"
                      : "var(--color-danger)",
                  }}
                >
                  {feedbackMessage}
                </div>
              ) : null}

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index}>
                      <SurfaceCard
                        className="h-[72px] animate-pulse"
                        radius="lg"
                        variant="inset"
                      >
                        <div />
                      </SurfaceCard>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <ErrorState
                  compact
                  title="No pude cargar los países"
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
                      : "Aún no hay países cargados"
                  }
                  description={
                    hasFilters
                      ? "Prueba con otro texto o limpia los filtros para volver a explorar el catálogo."
                      : "Cuando crees el primer país, este listado mostrará sus datos operativos."
                  }
                  action={
                    isSuperAdmin ? (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          history.push("/admin/catalogos/paises/nuevo");
                        }}
                      >
                        Crear país
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <div className="space-y-3">
                  {items.map((pais) => (
                    <EntityListRow
                      key={pais.id}
                      title={pais.nombre}
                      subtitle={`${pais.codigo} · actualizado ${new Date(
                        pais.updatedAt
                      ).toLocaleDateString("es-CO")}`}
                      metadata={
                        <StatusChip
                          tone={pais.status === "ACTIVO" ? "success" : "warning"}
                          dot
                        >
                          {pais.status === "ACTIVO" ? "Activo" : "Inactivo"}
                        </StatusChip>
                      }
                      action={
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            fullWidth={false}
                            onClick={() => {
                              history.push(
                                `/admin/catalogos/paises/${pais.id}`
                              );
                            }}
                          >
                            Editar
                          </Button>

                          {isSuperAdmin ? (
                            <Button
                              variant="danger"
                              size="sm"
                              fullWidth={false}
                              isLoading={
                                deletePais.isPending &&
                                deletePais.variables === pais.id
                              }
                              onClick={() => {
                                void handleDelete(pais.id, pais.nombre);
                              }}
                            >
                              Eliminar
                            </Button>
                          ) : null}
                        </div>
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
                      setPage((current) => Math.max(1, current - 1));
                    }}
                  >
                    Anterior
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!canGoNext || isFetching}
                    onClick={() => {
                      setPage((current) => current + 1);
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

export default PaisesPage;