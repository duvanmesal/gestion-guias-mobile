import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../../ui/components/Button";
import ErrorState from "../../../ui/components/ErrorState";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { useBuquesLookup } from "../../admin/catalogs/hooks/useBuquesLookup";
import { usePaisesLookup } from "../../admin/catalogs/hooks/usePaisesLookup";
import RecaladaForm, {
  type BuqueLookupOption,
  type RecaladaFormValues,
} from "../components/RecaladaForm";
import { useCreateRecalada } from "../hooks/useCreateRecalada";

const RecaladaCreatePage: React.FC = () => {
  const history = useHistory();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const buquesQuery = useBuquesLookup();
  const paisesQuery = usePaisesLookup();
  const createRecalada = useCreateRecalada();

  const isLoadingLookups = buquesQuery.isLoading || paisesQuery.isLoading;

  if (isLoadingLookups) {
    return <LoadingScreen message="Cargando catálogos..." />;
  }

  if (buquesQuery.error || paisesQuery.error) {
    const err = buquesQuery.error ?? paisesQuery.error;
    return (
      <ErrorState
        title="No pude cargar los catálogos"
        message={
          err instanceof Error
            ? err.message
            : "Ocurrió un problema al cargar buques o países."
        }
        onRetry={() => {
          void buquesQuery.refetch();
          void paisesQuery.refetch();
        }}
      />
    );
  }

  const buques: BuqueLookupOption[] = (buquesQuery.data ?? []).map((b) => ({
    id: b.id,
    nombre: b.nombre,
  }));

  const paises = (paisesQuery.data ?? []).map((p) => ({
    id: p.id,
    codigo: p.codigo,
    nombre: p.nombre,
  }));

  async function handleSubmit(values: RecaladaFormValues) {
    setSubmitError(null);
    try {
      const created = await createRecalada.mutateAsync({
        buqueId: Number(values.buqueId),
        paisOrigenId: Number(values.paisOrigenId),
        fechaLlegada: new Date(values.fechaLlegada).toISOString(),
        fechaSalida: values.fechaSalida
          ? new Date(values.fechaSalida).toISOString()
          : undefined,
        terminal: values.terminal?.trim() || undefined,
        muelle: values.muelle?.trim() || undefined,
        pasajerosEstimados:
          typeof values.pasajerosEstimados === "number"
            ? values.pasajerosEstimados
            : undefined,
        tripulacionEstimada:
          typeof values.tripulacionEstimada === "number"
            ? values.tripulacionEstimada
            : undefined,
        observaciones: values.observaciones?.trim() || undefined,
        fuente: values.fuente,
      });
      history.replace(`/recaladas/${created?.id ?? ""}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No pude crear la recalada"
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
                  Recaladas
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Nueva recalada
                </h1>
              </div>
            </div>

            <RecaladaForm
              buques={buques}
              paises={paises}
              isLoading={createRecalada.isPending}
              error={submitError}
              onCancel={() => history.goBack()}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RecaladaCreatePage;
