import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useSessionStore } from "../../../../core/auth/sessionStore";
import Button from "../../../../ui/components/Button";
import ErrorState from "../../../../ui/components/ErrorState";
import LoadingScreen from "../../../../ui/components/LoadingScreen";
import PuertoForm from "../components/PuertoForm";
import { useCreatePuerto } from "../hooks/useCreatePuerto";
import { usePaisesLookup } from "../hooks/usePaisesLookup";
import { usePuerto } from "../hooks/usePuerto";
import { useUpdatePuerto } from "../hooks/useUpdatePuerto";
import type { CatalogStatus } from "../types/catalogs.types";

interface RouteParams {
  id?: string;
}

const PuertoUpsertPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const user = useSessionStore((state) => state.user);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const puertoId = useMemo(() => {
    if (!id) return undefined;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [id]);

  const isEdit = typeof puertoId === "number";
  const puertoQuery = usePuerto(puertoId);
  const countriesQuery = usePaisesLookup();
  const createPuerto = useCreatePuerto();
  const updatePuerto = useUpdatePuerto();

  if (!isEdit && user?.role !== "SUPER_ADMIN") {
    return <Redirect to="/admin/catalogos/puertos" />;
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

  if (isEdit && puertoQuery.isLoading && !puertoQuery.data) {
    return <LoadingScreen message="Cargando el puerto..." />;
  }

  const initialValues = puertoQuery.data
    ? {
        codigo: puertoQuery.data.codigo,
        nombre: puertoQuery.data.nombre,
        ciudad: puertoQuery.data.ciudad,
        paisId: puertoQuery.data.paisId,
        status: puertoQuery.data.status,
      }
    : null;

  const submitting = createPuerto.isPending || updatePuerto.isPending;

  async function handleSubmit(values: {
    codigo: string;
    nombre: string;
    ciudad: string;
    paisId: number;
    status: CatalogStatus;
  }) {
    setSubmitError(null);
    try {
      if (isEdit && puertoId) {
        await updatePuerto.mutateAsync({ id: puertoId, payload: values });
      } else {
        await createPuerto.mutateAsync(values);
      }
      history.replace("/admin/catalogos/puertos");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No pude guardar el puerto"
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
                onClick={() => history.goBack()}
              >
                Volver
              </Button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin / Catálogos / Puertos
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  {isEdit ? "Editar puerto" : "Crear puerto"}
                </h1>
              </div>
            </div>

            {isEdit && puertoQuery.error ? (
              <ErrorState
                compact
                title="No pude abrir el puerto"
                message={
                  puertoQuery.error instanceof Error
                    ? puertoQuery.error.message
                    : "Ocurrió un problema al consultar el detalle."
                }
                onRetry={() => {
                  void puertoQuery.refetch();
                }}
              />
            ) : (
              <PuertoForm
                countries={countriesQuery.data ?? []}
                initialValues={initialValues}
                isEdit={isEdit}
                isLoading={submitting}
                error={submitError}
                onCancel={() => history.goBack()}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PuertoUpsertPage;
