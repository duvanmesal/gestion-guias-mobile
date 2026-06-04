import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../../core/auth/sessionStore";
import Button from "../../../../ui/components/Button";
import EmptyStateCard from "../../../../ui/components/EmptyStateCard";
import ErrorState from "../../../../ui/components/ErrorState";
import StatusChip from "../../../../ui/components/StatusChip";
import { useDeleteMuelle } from "../hooks/useDeleteMuelle";
import { useMuellesList } from "../hooks/useMuellesList";
import { usePuertosLookup } from "../hooks/usePuertosLookup";
import type { CatalogStatus } from "../types/catalogs.types";

const PAGE_SIZE = 10;
type StatusFilter = CatalogStatus | "";

const inputClassName =
  "w-full rounded-[10px] border px-3.5 py-2.5 outline-none transition placeholder:text-[var(--color-fg-muted)]";

const inputStyle = {
  background: "var(--color-bg-elevated)",
  borderColor: "var(--color-border-hairline)",
  color: "var(--color-fg-primary)",
  fontSize: "var(--text-body)",
} as const;

const MuellesPage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [puertoId, setPuertoId] = useState("");
  const [page, setPage] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const puertosQuery = usePuertosLookup();
  const queryParams = useMemo(
    () => ({
      q: search.trim() || undefined,
      puertoId: puertoId ? Number(puertoId) : undefined,
      status: status || undefined,
      page,
      pageSize: PAGE_SIZE,
    }),
    [page, puertoId, search, status]
  );

  const { data, isLoading, isFetching, error, refetch } =
    useMuellesList(queryParams);
  const deleteMuelle = useDeleteMuelle();

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(search.trim() || status || puertoId);

  async function handleDelete(id: number, nombre: string) {
    const confirmed = window.confirm(
      `¿Seguro que deseas desactivar el muelle "${nombre}"?`
    );
    if (!confirmed) return;

    setFeedbackMessage(null);
    try {
      await deleteMuelle.mutateAsync(id);
      setFeedbackMessage(`El muelle ${nombre} fue desactivado correctamente.`);
      if (items.length === 1 && page > 1) {
        setPage((current) => Math.max(1, current - 1));
      }
    } catch (deleteError) {
      setFeedbackMessage(
        deleteError instanceof Error
          ? deleteError.message
          : "No pude desactivar el muelle"
      );
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-6 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <PageHeader title="Muelles" onBack={() => history.push("/admin/catalogos")} />

            <section className="rounded-2xl border border-[var(--color-border-hairline)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)]">
              <SectionHeader
                eyebrow="Filtros"
                title="Búsqueda"
                description="Busca por código o nombre. Filtra por puerto y estado."
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
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
                  placeholder="Buscar muelle"
                  className={inputClassName}
                  style={inputStyle}
                />
                <select
                  value={puertoId}
                  onChange={(event) => {
                    setPuertoId(event.target.value);
                    setPage(1);
                  }}
                  className={inputClassName}
                  style={inputStyle}
                >
                  <option value="">Todos los puertos</option>
                  {(puertosQuery.data ?? []).map((puerto) => (
                    <option key={puerto.id} value={String(puerto.id)}>
                      {puerto.codigo} · {puerto.nombre}
                    </option>
                  ))}
                </select>
                <StatusSelect
                  value={status}
                  onChange={(value) => {
                    setStatus(value);
                    setPage(1);
                  }}
                />
                <FilterActions
                  onClear={() => {
                    setDraftSearch("");
                    setSearch("");
                    setPuertoId("");
                    setStatus("");
                    setPage(1);
                  }}
                />
              </form>
            </section>

            <section className="rounded-2xl border border-[var(--color-border-hairline)] bg-[var(--color-bg-elevated)] p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between gap-3">
                <SectionHeader
                  eyebrow="Listado"
                  title="Catálogo de muelles"
                  description={
                    data?.meta
                      ? `Página ${data.meta.page} de ${totalPages} · ${data.meta.total} registros`
                      : "Listado administrativo del catálogo"
                  }
                />
                {isSuperAdmin ? (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onClick={() => history.push("/admin/catalogos/muelles/nuevo")}
                  >
                    Nuevo
                  </Button>
                ) : null}
              </div>

              {feedbackMessage ? <FeedbackBanner message={feedbackMessage} /> : null}

              <div className="mt-4">
                {isLoading ? (
                  <SkeletonList count={4} />
                ) : error ? (
                  <ErrorState
                    compact
                    title="No pude cargar los muelles"
                    message={
                      error instanceof Error
                        ? error.message
                        : "Ocurrió un problema inesperado."
                    }
                    onRetry={() => void refetch()}
                  />
                ) : items.length === 0 ? (
                  <EmptyStateCard
                    title={hasFilters ? "Sin resultados" : "Aún no hay muelles"}
                    description={
                      hasFilters
                        ? "Prueba con otros filtros."
                        : "Cuando crees el primer muelle, aparecerá aquí."
                    }
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {items.map((muelle) => (
                      <CatalogRow
                        key={muelle.id}
                        title={muelle.nombre}
                        code={muelle.codigo}
                        status={muelle.status}
                        details={[
                          ["Puerto", muelle.puerto ? `${muelle.puerto.codigo} · ${muelle.puerto.nombre}` : "—"],
                          ["Capacidad", muelle.capacidadCruceros != null ? String(muelle.capacidadCruceros) : "—"],
                          ["Recaladas", String(muelle._count?.recaladas ?? 0)],
                        ]}
                        isSuperAdmin={isSuperAdmin}
                        isDeleting={
                          deleteMuelle.isPending &&
                          deleteMuelle.variables === muelle.id
                        }
                        onEdit={() => history.push(`/admin/catalogos/muelles/${muelle.id}`)}
                        onDelete={() => void handleDelete(muelle.id, muelle.nombre)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {!isLoading && !error && items.length > 0 ? (
                <Pager
                  page={page}
                  totalPages={totalPages}
                  disabled={isFetching}
                  onPrev={() => setPage((current) => Math.max(1, current - 1))}
                  onNext={() => setPage((current) => current + 1)}
                />
              ) : null}
            </section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const PageHeader: React.FC<{ title: string; onBack: () => void }> = ({
  title,
  onBack,
}) => (
  <div className="flex items-center justify-between gap-3">
    <div>
      <p className="m-0 text-[var(--text-eyebrow)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-fg-muted)]">
        Admin · Catálogos
      </p>
      <h1 className="m-0 mt-1 text-[var(--text-display)] font-bold leading-[var(--leading-tight)] text-[var(--color-fg-primary)]">
        {title}
      </h1>
    </div>
    <Button variant="ghost" size="sm" fullWidth={false} onClick={onBack}>
      Volver
    </Button>
  </div>
);

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
}> = ({ eyebrow, title, description }) => (
  <div className="min-w-0">
    <p className="m-0 text-[var(--text-eyebrow)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-fg-muted)]">
      {eyebrow}
    </p>
    <h2 className="m-0 mt-1 text-[var(--text-subhead)] font-bold leading-[var(--leading-tight)] text-[var(--color-fg-primary)]">
      {title}
    </h2>
    {description ? (
      <p className="m-0 mt-1 text-[var(--text-caption)] leading-[var(--leading-base)] text-[var(--color-fg-muted)]">
        {description}
      </p>
    ) : null}
  </div>
);

const StatusSelect: React.FC<{
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value as StatusFilter)}
    className={inputClassName}
    style={inputStyle}
  >
    <option value="">Todos los estados</option>
    <option value="ACTIVO">Activos</option>
    <option value="INACTIVO">Inactivos</option>
  </select>
);

const FilterActions: React.FC<{ onClear: () => void }> = ({ onClear }) => (
  <div className="grid grid-cols-2 gap-2.5">
    <Button type="submit" variant="primary" size="md">
      Aplicar
    </Button>
    <Button type="button" variant="secondary" size="md" onClick={onClear}>
      Limpiar
    </Button>
  </div>
);

const CatalogRow: React.FC<{
  title: string;
  code: string;
  status: CatalogStatus;
  details: Array<[string, string]>;
  isSuperAdmin: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ title, code, status, details, isSuperAdmin, isDeleting, onEdit, onDelete }) => {
  const isActive = status === "ACTIVO";

  return (
    <article className="rounded-[14px] border border-[var(--color-border-hairline)] bg-[var(--color-bg-elevated)] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[var(--text-eyebrow)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-fg-muted)]">
            {code}
          </p>
          <h3 className="m-0 mt-0.5 break-words text-[var(--text-subhead)] font-bold leading-[var(--leading-tight)] text-[var(--color-fg-primary)]">
            {title}
          </h3>
        </div>
        <StatusChip tone={isActive ? "success" : "warning"} dot>
          {isActive ? "Activo" : "Inactivo"}
        </StatusChip>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-[var(--text-eyebrow)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-[var(--color-fg-muted)]">
              {label}
            </dt>
            <dd className="m-0 mt-0.5 break-words text-[var(--text-caption)] font-semibold text-[var(--color-fg-primary)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className={`mt-3 grid gap-2 ${isSuperAdmin ? "grid-cols-2" : "grid-cols-1"}`}>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Editar
        </Button>
        {isSuperAdmin ? (
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={onDelete}>
            Desactivar
          </Button>
        ) : null}
      </div>
    </article>
  );
};

const Pager: React.FC<{
  page: number;
  totalPages: number;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
}> = ({ page, totalPages, disabled, onPrev, onNext }) => (
  <div className="mt-4 grid grid-cols-2 gap-2.5">
    <Button
      variant="secondary"
      size="md"
      disabled={page <= 1 || disabled}
      onClick={onPrev}
    >
      Anterior
    </Button>
    <Button
      variant="secondary"
      size="md"
      disabled={page >= totalPages || disabled}
      onClick={onNext}
    >
      Siguiente
    </Button>
  </div>
);

const SkeletonList: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="h-28 animate-pulse rounded-[14px] border border-[var(--color-border-hairline)] bg-[var(--color-bg-subtle)]"
      />
    ))}
  </div>
);

const FeedbackBanner: React.FC<{ message: string }> = ({ message }) => {
  const isSuccess = message.includes("correctamente");
  return (
    <div
      className="mt-3 rounded-[10px] border px-3 py-2 text-[var(--text-caption)] font-medium"
      style={{
        background: isSuccess
          ? "var(--color-success-soft)"
          : "var(--color-danger-soft)",
        borderColor: isSuccess
          ? "var(--color-success-border)"
          : "var(--color-danger-border)",
        color: isSuccess ? "var(--color-success)" : "var(--color-danger)",
      }}
    >
      {message}
    </div>
  );
};

export default MuellesPage;
