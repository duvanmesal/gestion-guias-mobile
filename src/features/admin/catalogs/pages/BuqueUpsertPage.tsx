import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useSessionStore } from "../../../../core/auth/sessionStore";
import Button from "../../../../ui/components/Button";
import ErrorState from "../../../../ui/components/ErrorState";
import LoadingScreen from "../../../../ui/components/LoadingScreen";
import BuqueForm from "../components/BuqueForm";
import { useBuque } from "../hooks/useBuque";
import { useCreateBuque } from "../hooks/useCreateBuque";
import { usePaisesLookup } from "../hooks/usePaisesLookup";
import { useUpdateBuque } from "../hooks/useUpdateBuque";

interface RouteParams {
  id?: string;
}

const BuqueUpsertPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const user = useSessionStore((state) => state.user);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const buqueId = useMemo(() => {
    if (!id) return undefined;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [id]);

  const isEdit = typeof buqueId === "number";

  const buqueQuery = useBuque(buqueId);
  const countriesQuery = usePaisesLookup();
  const createBuque = useCreateBuque();
  const updateBuque = useUpdateBuque();

  if (!isEdit && user?.role !== "SUPER_ADMIN") {
    return <Redirect to="/admin/catalogos/buques" />;
  }

  if (countriesQuery.isLoading) {
    return <LoadingScreen message="Cargando países..." />;
  }

  if (countriesQuery.error) {
    return (
      <ErrorState
        title="No pude cargar los países"
        message={
          countriesQuery.error instanceof Error
            ? countriesQuery.error.message
            : "Ocurrió un problema al cargar el lookup de países."
        }
        onRetry={() => {
          void countriesQuery.refetch();
        }}
      />
    );
  }

  const isLoadingInitial = isEdit && buqueQuery.isLoading && !buqueQuery.data;

  if (isLoadingInitial) {
    return <LoadingScreen message="Cargando el buque..." />;
  }

  const initialValues = buqueQuery.data
    ? {
        codigo: buqueQuery.data.codigo,
        nombre: buqueQuery.data.nombre,
        paisId: buqueQuery.data.pais?.id,
        capacidad: buqueQuery.data.capacidad,
        naviera: buqueQuery.data.naviera,
        status: buqueQuery.data.status,
      }
    : null;

  const submitting = createBuque.isPending || updateBuque.isPending;

  async function handleSubmit(values: {
    codigo: string;
    nombre: string;
    paisId?: number;
    capacidad?: number | null;
    naviera?: string | null;
    status: "ACTIVO" | "INACTIVO";
  }) {
    setSubmitError(null);

    try {
      if (isEdit && buqueId) {
        await updateBuque.mutateAsync({
          id: buqueId,
          payload: values,
        });
      } else {
        await createBuque.mutateAsync(values);
      }

      history.replace("/admin/catalogos/buques");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No pude guardar el buque"
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
                  Admin / Catálogos / Buques
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  {isEdit ? "Editar buque" : "Crear buque"}
                </h1>
              </div>
            </div>

            {isEdit && buqueQuery.error ? (
              <ErrorState
                compact
                title="No pude abrir el buque"
                message={
                  buqueQuery.error instanceof Error
                    ? buqueQuery.error.message
                    : "Ocurrió un problema al consultar el detalle."
                }
                onRetry={() => {
                  void buqueQuery.refetch();
                }}
              />
            ) : (
              <BuqueForm
                countries={countriesQuery.data ?? []}
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

export default BuqueUpsertPage;