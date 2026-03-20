import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useSessionStore } from "../../../../core/auth/sessionStore";
import Button from "../../../../ui/components/Button";
import ErrorState from "../../../../ui/components/ErrorState";
import LoadingScreen from "../../../../ui/components/LoadingScreen";
import PaisForm, { type PaisFormValues } from "../components/PaisForm";
import { useCreatePais } from "../hooks/useCreatepais";
import { usePais } from "../hooks/usePais";
import { useUpdatePais } from "../hooks/useUpdatePais";

interface RouteParams {
  id?: string;
}

const PaisUpsertPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const user = useSessionStore((state) => state.user);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const paisId = useMemo(() => {
    if (!id) return undefined;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [id]);

  const isEdit = typeof paisId === "number";

  const paisQuery = usePais(paisId);
  const createPais = useCreatePais();
  const updatePais = useUpdatePais();

  if (!isEdit && user?.role !== "SUPER_ADMIN") {
    return <Redirect to="/admin/catalogos/paises" />;
  }

  const isLoadingInitial = isEdit && paisQuery.isLoading && !paisQuery.data;

  if (isLoadingInitial) {
    return <LoadingScreen message="Cargando el país..." />;
  }

  const initialValues = paisQuery.data
    ? {
        codigo: paisQuery.data.codigo,
        nombre: paisQuery.data.nombre,
        status: paisQuery.data.status,
      }
    : null;

  const submitting = createPais.isPending || updatePais.isPending;

  async function handleSubmit(values: PaisFormValues) {
    setSubmitError(null);

    try {
      if (isEdit && paisId) {
        await updatePais.mutateAsync({ id: paisId, payload: values });
      } else {
        await createPais.mutateAsync(values);
      }

      history.replace("/admin/catalogos/paises");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No pude guardar el país"
      );
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-28 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => {
                  history.goBack();
                }}
              >
                Volver
              </Button>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin / Catálogos / Países
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  {isEdit ? "Editar país" : "Crear país"}
                </h1>
              </div>
            </div>

            {isEdit && paisQuery.error ? (
              <ErrorState
                compact
                title="No pude abrir el país"
                message={
                  paisQuery.error instanceof Error
                    ? paisQuery.error.message
                    : "Ocurrió un problema al consultar el detalle."
                }
                onRetry={() => {
                  void paisQuery.refetch();
                }}
              />
            ) : (
              <PaisForm
                initialValues={initialValues}
                isEdit={isEdit}
                isLoading={submitting}
                error={submitError}
                onCancel={() => {
                  history.goBack();
                }}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaisUpsertPage;