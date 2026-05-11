import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSessionStore } from "../../../../core/auth/sessionStore";
import { adminDebug } from "../../../../core/debug/adminDebug";
import Button from "../../../../ui/components/Button";
import EmptyStateCard from "../../../../ui/components/EmptyStateCard";
import ErrorState from "../../../../ui/components/ErrorState";
import StatusChip from "../../../../ui/components/StatusChip";
import { useBuquesList } from "../hooks/useBuquesList";
import { useDeleteBuque } from "../hooks/useDeleteBuque";
import { usePaisesLookup } from "../hooks/usePaisesLookup";
import type { CatalogStatus } from "../types/catalogs.types";

const PAGE_SIZE = 10;

type StatusFilter = CatalogStatus | "";

type BuqueItem = ReturnType<typeof useBuquesList>["data"] extends infer D
  ? D extends { items: Array<infer I> } ? I : never
  : never;

const inputClassName =
  "w-full rounded-[10px] border px-3.5 py-2.5 outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "var(--color-bg-elevated)",
  borderColor: "var(--color-border-hairline)",
  color: "var(--color-fg-primary)",
  fontSize: "var(--text-body)",
} as const;

const BuquesPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const user = useSessionStore((state) => state.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [paisId, setPaisId] = useState("");
  const [page, setPage] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    adminDebug("BuquesPage.mounted", {
      pathname: location.pathname,
      userRole: user?.role ?? null,
    });

    return () => {
      adminDebug("BuquesPage.unmounted", {
        pathname: location.pathname,
      });
    };
  }, [location.pathname, user]);

  const countriesQuery = usePaisesLookup();

  const countriesMap = useMemo(() => {
    const map = new Map<number, { codigo: string; nombre: string }>();

    for (const country of countriesQuery.data ?? []) {
      map.set(country.id, { codigo: country.codigo, nombre: country.nombre });
    }

    return map;
  }, [countriesQuery.data]);

  const queryParams = useMemo(
    () => ({
      q: search.trim() || undefined,
      paisId: paisId ? Number(paisId) : undefined,
      status: status || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [page, paisId, search, status]
  );

  const { data, isLoading, isFetching, error, refetch } =
    useBuquesList(queryParams);
  const deleteBuque = useDeleteBuque();

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  const hasFilters = Boolean(search.trim() || status || paisId);

  async function handleDelete(id: number, nombre: string) {
    const confirmed = window.confirm(
      `¿Seguro que deseas desactivar el buque "${nombre}"? Esta acción lo dejará en estado INACTIVO.`
    );

    if (!confirmed) return;

    setFeedbackMessage(null);

    try {
      await deleteBuque.mutateAsync(id);
      setFeedbackMessage(`El buque ${nombre} fue desactivado correctamente.`);

      if (items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      }
    } catch (deleteError) {
      setFeedbackMessage(
        deleteError instanceof Error
          ? deleteError.message
          : "No pude desactivar el buque"
      );
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-6 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">

            {/* Page header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-eyebrow)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "var(--tracking-eyebrow)",
                    color: "var(--color-fg-muted)",
                  }}
                >
                  Admin · Catálogos
                </p>
                <h1
                  style={{
                    margin: "4px 0 0",
                    fontSize: "var(--text-display)",
                    fontWeight: 700,
                    color: "var(--color-fg-primary)",
                    letterSpacing: "var(--tracking-tight)",
                    lineHeight: "var(--leading-tight)",
                  }}
                >
                  Buques
                </h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => history.push("/admin/catalogos")}
              >
                Volver
              </Button>
            </div>

            {/* Filters card */}
            <section
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-hairline)",
                borderRadius: 16,
                boxShadow: "var(--shadow-card)",
                padding: "1rem 1.125rem",
              }}
            >
              <SectionHeader
                eyebrow="Filtros"
                title="Búsqueda"
                description="Busca por código, nombre o naviera. Filtra por país de bandera y estado."
              />

              <form
                className="mt-4 flex flex-col gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setPage(1);
                  setSearch(draftSearch);
                }}
              >
                <input
                  type="text"
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder="Buscar por código, nombre o naviera"
                  className={inputClassName}
                  style={inputStyle}
                />

                <select
                  value={paisId}
                  onChange={(event) => {
                    setPaisId(event.target.value);
                    setPage(1);
                  }}
                  className={inputClassName}
                  style={inputStyle}
                >
                  <option value="">Todos los países</option>
                  {(countriesQuery.data ?? []).map((country) => (
                    <option key={country.id} value={String(country.id)}>
                      {country.codigo} · {country.nombre}
                    </option>
                  ))}
                </select>

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

                <div className="grid grid-cols-2 gap-2.5">
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
                      setPaisId("");
                      setStatus("");
                      setPage(1);
                    }}
                  >
                    Limpiar
                  </Button>
                </div>
              </form>
            </section>

            {/* Listing card */}
            <section
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-hairline)",
                borderRadius: 16,
                boxShadow: "var(--shadow-card)",
                padding: "1rem 1.125rem",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <SectionHeader
                  eyebrow="Listado"
                  title="Catálogo de buques"
                  description={
                    data?.meta
                      ? `Página ${data.meta.page} de ${Math.max(1, totalPages)} · ${data.meta.total} ${data.meta.total === 1 ? "registro" : "registros"}`
                      : "Listado administrativo del catálogo"
                  }
                />

                {isSuperAdmin ? (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onClick={() => history.push("/admin/catalogos/buques/nuevo")}
                  >
                    Nuevo
                  </Button>
                ) : null}
              </div>

              {feedbackMessage ? (
                <FeedbackBanner message={feedbackMessage} className="mt-3" />
              ) : null}

              <div className="mt-4">
                {isLoading ? (
                  <SkeletonList count={4} />
                ) : error ? (
                  <ErrorState
                    compact
                    title="No pude cargar los buques"
                    message={
                      error instanceof Error
                        ? error.message
                        : "Ocurrió un problema inesperado."
                    }
                    onRetry={() => void refetch()}
                  />
                ) : items.length === 0 ? (
                  <EmptyStateCard
                    title={
                      hasFilters
                        ? "No hay resultados para esos filtros"
                        : "Aún no hay buques cargados"
                    }
                    description={
                      hasFilters
                        ? "Prueba con otro texto o limpia los filtros para volver a explorar el catálogo."
                        : "Cuando crees el primer buque, este listado mostrará su código, país, naviera y estado operativo."
                    }
                    action={
                      isSuperAdmin ? (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => history.push("/admin/catalogos/buques/nuevo")}
                        >
                          Crear buque
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((buque) => {
                      const country = buque.pais?.id
                        ? countriesMap.get(buque.pais.id) ?? {
                            codigo: buque.pais.codigo,
                            nombre: buque.pais.nombre ?? "",
                          }
                        : null;

                      return (
                        <BuqueRow
                          key={buque.id}
                          buque={buque as BuqueItem}
                          country={country}
                          isSuperAdmin={isSuperAdmin}
                          isDeleting={
                            deleteBuque.isPending &&
                            deleteBuque.variables === buque.id
                          }
                          onEdit={() =>
                            history.push(`/admin/catalogos/buques/${buque.id}`)
                          }
                          onDelete={() => void handleDelete(buque.id, buque.nombre)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {!isLoading && !error && items.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!canGoPrev || isFetching}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Anterior
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    disabled={!canGoNext || isFetching}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

/* ──────────────────────────────────────────────
   BuqueRow — fila de catálogo expandida
   Sin truncate. Info en pares label/value.
────────────────────────────────────────────── */
interface BuqueRowProps {
  buque: BuqueItem;
  country: { codigo: string; nombre: string } | null;
  isSuperAdmin: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const BuqueRow: React.FC<BuqueRowProps> = ({
  buque,
  country,
  isSuperAdmin,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  const isActive = buque.status === "ACTIVO";
  const capacidad =
    typeof buque.capacidad === "number" && Number.isFinite(buque.capacidad)
      ? buque.capacidad.toLocaleString("es-CO")
      : "—";

  return (
    <article
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-hairline)",
        borderLeft: `3px solid ${isActive ? "var(--color-success)" : "var(--color-fg-disabled)"}`,
        borderRadius: 14,
        padding: "0.875rem 1rem 0.75rem",
      }}
    >
      {/* Header: name + status */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            style={{
              fontSize: "var(--text-eyebrow)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "var(--tracking-eyebrow)",
              color: "var(--color-fg-muted)",
              margin: 0,
            }}
          >
            {buque.codigo}
          </p>
          <h3
            style={{
              margin: "2px 0 0",
              fontSize: "var(--text-subhead)",
              fontWeight: 700,
              color: "var(--color-fg-primary)",
              letterSpacing: "var(--tracking-tight)",
              lineHeight: "var(--leading-tight)",
              wordBreak: "break-word",
            }}
          >
            {buque.nombre}
          </h3>
        </div>

        <div className="shrink-0">
          <StatusChip tone={isActive ? "success" : "warning"} dot>
            {isActive ? "Activo" : "Inactivo"}
          </StatusChip>
        </div>
      </header>

      {/* Detail grid */}
      <dl
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          rowGap: 10,
          columnGap: 12,
        }}
      >
        <DetailField label="País" value={country ? `${country.codigo} · ${country.nombre}` : "Sin país"} />
        <DetailField label="Capacidad" value={capacidad} mono />
        <DetailField
          label="Naviera"
          value={buque.naviera || "Sin naviera"}
          full
        />
      </dl>

      {/* Actions */}
      <footer
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: "1px solid var(--color-border-hairline)",
          display: "grid",
          gridTemplateColumns: isSuperAdmin ? "1fr 1fr" : "1fr",
          gap: 8,
        }}
      >
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Editar
        </Button>
        {isSuperAdmin ? (
          <Button
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            onClick={onDelete}
          >
            Desactivar
          </Button>
        ) : null}
      </footer>
    </article>
  );
};

/* ──────────────────────────────────────────────
   Atoms
────────────────────────────────────────────── */
const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
}> = ({ eyebrow, title, description }) => (
  <div className="min-w-0">
    <p
      style={{
        margin: 0,
        fontSize: "var(--text-eyebrow)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-eyebrow)",
        color: "var(--color-fg-muted)",
      }}
    >
      {eyebrow}
    </p>
    <h2
      style={{
        margin: "4px 0 0",
        fontSize: "var(--text-subhead)",
        fontWeight: 700,
        color: "var(--color-fg-primary)",
        letterSpacing: "var(--tracking-tight)",
        lineHeight: "var(--leading-tight)",
      }}
    >
      {title}
    </h2>
    {description ? (
      <p
        style={{
          margin: "4px 0 0",
          fontSize: "var(--text-caption)",
          color: "var(--color-fg-muted)",
          lineHeight: "var(--leading-base)",
        }}
      >
        {description}
      </p>
    ) : null}
  </div>
);

const DetailField: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
  full?: boolean;
}> = ({ label, value, mono = false, full = false }) => (
  <div style={full ? { gridColumn: "1 / -1" } : undefined}>
    <dt
      style={{
        fontSize: "var(--text-eyebrow)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-eyebrow)",
        color: "var(--color-fg-muted)",
      }}
    >
      {label}
    </dt>
    <dd
      className={mono ? "t-mono" : undefined}
      style={{
        margin: "2px 0 0",
        fontSize: "var(--text-caption)",
        fontWeight: 600,
        color: "var(--color-fg-primary)",
        wordBreak: "break-word",
        lineHeight: "var(--leading-base)",
      }}
    >
      {value}
    </dd>
  </div>
);

const SkeletonList: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="animate-pulse"
        style={{
          height: 132,
          borderRadius: 14,
          background: "var(--color-bg-subtle)",
          border: "1px solid var(--color-border-hairline)",
          animationDelay: `${index * 60}ms`,
        }}
      />
    ))}
  </div>
);

const FeedbackBanner: React.FC<{ message: string; className?: string }> = ({
  message,
  className = "",
}) => {
  const isSuccess = message.includes("correctamente");
  return (
    <div
      className={className}
      style={{
        borderRadius: 10,
        padding: "10px 12px",
        background: isSuccess ? "var(--color-success-soft)" : "var(--color-danger-soft)",
        border: `1px solid ${isSuccess ? "var(--color-success-border)" : "var(--color-danger-border)"}`,
        color: isSuccess ? "#047857" : "var(--color-danger)",
        fontSize: "var(--text-caption)",
        fontWeight: 500,
        lineHeight: "var(--leading-base)",
      }}
    >
      {message}
    </div>
  );
};

export default BuquesPage;
