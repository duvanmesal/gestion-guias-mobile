import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import Button from "../../../../ui/components/Button";
import ErrorState from "../../../../ui/components/ErrorState";
import KeyValueGrid from "../../../../ui/components/KeyValueGrid";
import RoleBadge from "../../../../ui/components/RoleBadge";
import StatusChip from "../../../../ui/components/StatusChip";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import { formatDateTime } from "../../../dashboard/utils/dashboardFormatters";
import AdminUserForm, {
  type AdminUserEditFormValues,
} from "../components/AdminUserForm";
import { useAdminUser } from "../hooks/useAdminUser";
import { useDeactivateAdminUser } from "../hooks/useDeactivateAdminUser";
import { useUpdateAdminUser } from "../hooks/useUpdateAdminUser";

interface RouteParams {
  id: string;
}

interface LocationState {
  feedbackMessage?: string;
}

const AdminUserUpsertPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState | undefined>();
  const { id } = useParams<RouteParams>();

  const { data, isLoading, error, refetch } = useAdminUser(id);
  const updateUser = useUpdateAdminUser();
  const deactivateUser = useDeactivateAdminUser();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.feedbackMessage) {
      setFeedbackMessage(location.state.feedbackMessage);
      history.replace({
        pathname: location.pathname,
        search: location.search,
        state: undefined,
      });
    }
  }, [history, location.pathname, location.search, location.state]);

  async function handleSubmit(values: AdminUserEditFormValues) {
    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      await updateUser.mutateAsync({
        id,
        payload: values,
      });
      setFeedbackMessage("Los cambios del usuario fueron guardados correctamente.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No pude actualizar el usuario"
      );
    }
  }

  async function handleDeactivate() {
    if (!data?.activo) return;

    const confirmed = window.confirm(
      `¿Deseas desactivar a ${data.email}? El backend también revocará sus sesiones activas.`
    );

    if (!confirmed) return;

    setErrorMessage(null);
    setFeedbackMessage(null);

    try {
      await deactivateUser.mutateAsync(id);
      setFeedbackMessage(`El usuario ${data.email} fue desactivado correctamente.`);
      await refetch();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No pude desactivar el usuario"
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
                  Admin / Usuarios
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Detalle del usuario
                </h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => {
                  history.push("/admin/usuarios");
                }}
              >
                Volver
              </Button>
            </div>

            {isLoading ? (
              <SurfaceCard className="h-[240px] animate-pulse" radius="xl" variant="raised">
                <div />
              </SurfaceCard>
            ) : error || !data ? (
              <ErrorState
                title="No pude cargar el usuario"
                message={
                  error instanceof Error
                    ? error.message
                    : "No encontré el usuario solicitado."
                }
                onRetry={() => {
                  void refetch();
                }}
              />
            ) : (
              <>
                <SurfaceCard className="gap-4 p-4" radius="xl" variant="accent">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-fg-primary)]">
                        {`${data.nombres} ${data.apellidos}`.trim()}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--color-fg-secondary)]">
                        {data.email}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <RoleBadge role={data.rol} />
                      <StatusChip tone={data.activo ? "success" : "danger"}>
                        {data.activo ? "Activo" : "Inactivo"}
                      </StatusChip>
                    </div>
                  </div>

                  <KeyValueGrid
                    items={[
                      { label: "Creado", value: formatDateTime(data.createdAt) },
                      { label: "Actualizado", value: formatDateTime(data.updatedAt) },
                      { label: "Guía", value: data.guia?.id ?? "No aplica" },
                      { label: "Supervisor", value: data.supervisor?.id ?? "No aplica" },
                    ]}
                  />
                </SurfaceCard>

                {feedbackMessage ? (
                  <div
                    className="rounded-2xl border px-4 py-3 text-sm"
                    style={{
                      background: "rgba(34,139,84,0.12)",
                      borderColor: "rgba(34,139,84,0.22)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {feedbackMessage}
                  </div>
                ) : null}

                <AdminUserForm
                  mode="edit"
                  initialValues={{
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    rol: data.rol,
                    activo: data.activo,
                  }}
                  isLoading={updateUser.isPending}
                  error={errorMessage}
                  helperMessage={
                    !data.activo
                      ? "Este usuario ya está inactivo. El backend actual aún no expone la reactivación por ruta."
                      : null
                  }
                  onCancel={() => {
                    history.push("/admin/usuarios");
                  }}
                  onSubmit={(values: AdminUserEditFormValues) => {
                    void handleSubmit(values);
                  }}
                />

                <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
                  <Button
                    variant="danger"
                    size="md"
                    isLoading={deactivateUser.isPending}
                    disabled={!data.activo || deactivateUser.isPending}
                    onClick={() => {
                      void handleDeactivate();
                    }}
                  >
                    Desactivar usuario
                  </Button>

                  {!data.activo ? (
                    <p className="text-center text-xs text-[var(--color-fg-muted)]">
                      La reactivación requiere exponer la ruta en la API.
                    </p>
                  ) : (
                    <p className="text-center text-xs text-[var(--color-fg-muted)]">
                      Esta acción revoca sesiones activas y evita nuevo acceso del usuario.
                    </p>
                  )}
                </SurfaceCard>
              </>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminUserUpsertPage;
