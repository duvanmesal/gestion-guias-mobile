import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import type { ProfileStatus, Role } from "../../../../core/auth/types";
import Button from "../../../../ui/components/Button";
import EmptyStateCard from "../../../../ui/components/EmptyStateCard";
import ErrorState from "../../../../ui/components/ErrorState";
import PageSectionHeader from "../../../../ui/components/PageSectionHeader";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import AdminUserFilters from "../components/AdminUserFilters";
import AdminUserListItemRow from "../components/AdminUserListItem";
import { useAdminUsersList } from "../hooks/useAdminUsersList";

const PAGE_SIZE = 10;

const AdminUsersPage: React.FC = () => {
  const history = useHistory();

  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [rol, setRol] = useState<Role | "">("");
  const [activo, setActivo] = useState<"" | "true" | "false">("");
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | "">("");

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: search.trim() || undefined,
      rol: rol || undefined,
      activo:
        activo === ""
          ? undefined
          : activo === "true"
            ? true
            : false,
      profileStatus: profileStatus || undefined,
    }),
    [activo, page, profileStatus, rol, search]
  );

  const { data, isLoading, isFetching, error, refetch } =
    useAdminUsersList(queryParams);

  const items = data?.items ?? [];
  const meta = data?.meta ?? null;

  const total = meta?.total ?? items.length;
  const activeCount = items.filter((item) => item.activo).length;
  const inactiveCount = items.filter((item) => !item.activo).length;
  const completeProfiles = items.filter(
    (item) => item.profileStatus === "COMPLETE"
  ).length;
  const hasFilters = Boolean(search || rol || activo || profileStatus);

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-32 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin / Usuarios
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Gestión de usuarios
                </h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => {
                  history.push("/admin");
                }}
              >
                Volver
              </Button>
            </div>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="accent">
              <PageSectionHeader
                title="Control posterior al alta"
                description="Aquí administras los usuarios ya existentes: búsqueda, revisión, edición y desactivación segura."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onClick={() => {
                      history.push("/admin/usuarios/nuevo");
                    }}
                  >
                    Nuevo
                  </Button>
                }
              />

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total", value: total },
                  { label: "Activos", value: activeCount },
                  { label: "Inactivos", value: inactiveCount },
                  { label: "Perfil completo", value: completeProfiles },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border px-3 py-3 text-center"
                    style={{
                      borderColor: "var(--color-border-glass)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <p className="text-lg font-bold text-[var(--color-fg-primary)]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <AdminUserFilters
              draftSearch={draftSearch}
              rol={rol}
              activo={activo}
              profileStatus={profileStatus}
              isFetching={isFetching}
              onDraftSearchChange={setDraftSearch}
              onRolChange={(value) => {
                setRol(value);
                setPage(1);
              }}
              onActivoChange={(value) => {
                setActivo(value);
                setPage(1);
              }}
              onProfileStatusChange={(value) => {
                setProfileStatus(value);
                setPage(1);
              }}
              onSubmit={() => {
                setSearch(draftSearch.trim());
                setPage(1);
              }}
              onClear={() => {
                setDraftSearch("");
                setSearch("");
                setRol("");
                setActivo("");
                setProfileStatus("");
                setPage(1);
              }}
            />

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Listado"
                description="Toca un usuario para abrir el detalle y editarlo."
              />

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SurfaceCard
                      key={index}
                      className="h-[84px] animate-pulse"
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
                  title="No pude cargar los usuarios"
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
                      ? "No encontré usuarios con esos filtros"
                      : "Aún no hay usuarios para mostrar"
                  }
                  description={
                    hasFilters
                      ? "Prueba otra combinación de filtros o limpia la búsqueda para ver más resultados."
                      : "Cuando existan usuarios registrados, aquí podrás administrarlos."
                  }
                  action={
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        history.push("/admin/usuarios/nuevo");
                      }}
                    >
                      Crear usuario
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <AdminUserListItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {meta ? (
                <div
                  className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm"
                  style={{
                    borderColor: "var(--color-border-glass)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div>
                    <p className="font-semibold text-[var(--color-fg-primary)]">
                      Página {meta.page} de {meta.totalPages}
                    </p>
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      {meta.total} registros totales
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      disabled={meta.page <= 1 || isFetching}
                      onClick={() => {
                        setPage((current) => Math.max(1, current - 1));
                      }}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      disabled={meta.page >= meta.totalPages || isFetching}
                      onClick={() => {
                        setPage((current) => current + 1);
                      }}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              ) : null}
            </SurfaceCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminUsersPage;