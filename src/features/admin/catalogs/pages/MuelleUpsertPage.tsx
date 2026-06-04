import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useSessionStore } from "../../../../core/auth/sessionStore";
import Button from "../../../../ui/components/Button";
import ErrorState from "../../../../ui/components/ErrorState";
import LoadingScreen from "../../../../ui/components/LoadingScreen";
import MuelleForm from "../components/MuelleForm";
import { useCreateMuelle } from "../hooks/useCreateMuelle";
import { useMuelle } from "../hooks/useMuelle";
import { usePuertosLookup } from "../hooks/usePuertosLookup";
import { useUpdateMuelle } from "../hooks/useUpdateMuelle";
import type { CatalogStatus } from "../types/catalogs.types";

interface RouteParams {
  id?: string;
}

const MuelleUpsertPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const user = useSessionStore((state) => state.user);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const muelleId = useMemo(() => {
    if (!id) return undefined;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [id]);

  const isEdit = typeof muelleId === "number";
  const muelleQuery = useMuelle(muelleId);
  const puertosQuery = usePuertosLookup();
  const createMuelle = useCreateMuelle();
  const updateMuelle = useUpdateMuelle();

  if (!isEdit && user?.role !== "SUPER_ADMIN") {
    return <Redirect to="/admin/catalogos/muelles" />;
  }

  if (puertosQuery.isLoading) {
    return <LoadingScreen message="Cargando puertos..." />;
  }

  if (puertosQuery.error) {
    return (
      <ErrorState
        title="No pude cargar los puertos"
        message={
          puertosQuery.error instanceof Error
            ? puertosQuery.error.message
            : "Ocurrió un problema al cargar el lookup de puertos."
        }
        onRetry={() => {
          void puertosQuery.refetch();
        }}
      />
    );
  }

  if (isEdit && muelleQuery.isLoading && !muelleQuery.data) {
    return <LoadingScreen message="Cargando el muelle..." />;
  }

  const initialValues = muelleQuery.data
    ? {
        codigo: muelleQuery.data.codigo,
        nombre: muelleQuery.data.nombre,
        puertoId: muelleQuery.data.puertoId,
        capacidadCruceros: muelleQuery.data.capacidadCruceros,
        status: muelleQuery.data.status,
      }
    : null;

  const submitting = createMuelle.isPending || updateMuelle.isPending;

  async function handleSubmit(values: {
    codigo: string;
    nombre: string;
    puertoId: number;
    capacidadCruceros?: number | null;
    status: CatalogStatus;
  }) {
    setSubmitError(null);
    try {
      if (isEdit && muelleId) {
        await updateMuelle.mutateAsync({ id: muelleId, payload: values });
      } else {
        await createMuelle.mutateAsync(values);
      }
      history.replace("/admin/catalogos/muelles");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No pude guardar el muelle"
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
                  Admin / Catálogos / Muelles
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  {isEdit ? "Editar muelle" : "Crear muelle"}
                </h1>
              </div>
            </div>

            {isEdit && muelleQuery.error ? (
              <ErrorState
                compact
                title="No pude abrir el muelle"
                message={
                  muelleQuery.error instanceof Error
                    ? muelleQuery.error.message
                    : "Ocurrió un problema al consultar el detalle."
                }
                onRetry={() => {
                  void muelleQuery.refetch();
                }}
              />
            ) : (
              <MuelleForm
                puertos={puertosQuery.data ?? []}
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

export default MuelleUpsertPage;
