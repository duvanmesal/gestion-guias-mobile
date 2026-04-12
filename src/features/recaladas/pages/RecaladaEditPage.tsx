import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useBuquesLookup } from "../../admin/catalogs/hooks/useBuquesLookup";
import { usePaisesLookup } from "../../admin/catalogs/hooks/usePaisesLookup";
import Button from "../../../ui/components/Button";
import ErrorState from "../../../ui/components/ErrorState";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import RecaladaForm, {
  type BuqueLookupOption,
  type RecaladaFormValues,
} from "../components/RecaladaForm";
import { useRecalada } from "../hooks/useRecalada";
import { useUpdateRecalada } from "../hooks/useUpdateRecalada";

interface RouteParams {
  id: string;
}

const RecaladaEditPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const recaladaId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [id]);

  const recaladaQuery = useRecalada(recaladaId);
  const buquesQuery = useBuquesLookup();
  const paisesQuery = usePaisesLookup();
  const updateRecalada = useUpdateRecalada();

  const isLoadingInitial =
    (recaladaQuery.isLoading && !recaladaQuery.data) ||
    buquesQuery.isLoading ||
    paisesQuery.isLoading;

  if (!recaladaId) {
    return (
      <ErrorState
        title="ID inválido"
        message="El identificador de la recalada no es válido."
        onRetry={() => history.push("/recaladas")}
        retryLabel="Volver al listado"
      />
    );
  }

  if (isLoadingInitial) {
    return <LoadingScreen message="Cargando recalada..." />;
  }

  if (recaladaQuery.error && !recaladaQuery.data) {
    return (
      <ErrorState
        title="No pude cargar la recalada"
        message={
          recaladaQuery.error instanceof Error
            ? recaladaQuery.error.message
            : "Ocurrió un problema al consultar el detalle."
        }
        onRetry={() => void recaladaQuery.refetch()}
      />
    );
  }

  const recalada = recaladaQuery.data;

  if (!recalada) return null;

  const opStatus = recalada.operationalStatus;

  if (opStatus === "DEPARTED" || opStatus === "CANCELED") {
    return (
      <ErrorState
        title="No se puede editar"
        message="Esta recalada ya fue finalizada o cancelada y no admite modificaciones."
        onRetry={() => history.replace(`/recaladas/${recaladaId}`)}
        retryLabel="Ver detalle"
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

    const isArrived = opStatus === "ARRIVED";

    const payload = isArrived
      ? {
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
        }
      : {
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
        };

    try {
      await updateRecalada.mutateAsync({ id: recaladaId!, payload });
      history.replace(`/recaladas/${recaladaId}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "No pude actualizar la recalada"
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
                  Recaladas / Editar
                </p>
                <h1 className="mt-1 font-mono text-xl font-bold text-[var(--color-fg-primary)]">
                  {recalada.codigoRecalada}
                </h1>
              </div>
            </div>

            <RecaladaForm
              buques={buques}
              paises={paises}
              initialValues={{
                buqueId: recalada.buque.id,
                paisOrigenId: recalada.paisOrigen.id,
                fechaLlegada: recalada.fechaLlegada,
                fechaSalida: recalada.fechaSalida,
                terminal: recalada.terminal,
                muelle: recalada.muelle,
                pasajerosEstimados: recalada.pasajerosEstimados,
                tripulacionEstimada: recalada.tripulacionEstimada,
                observaciones: recalada.observaciones,
                fuente: recalada.fuente,
              }}
              isEdit
              operationalStatus={opStatus}
              isLoading={updateRecalada.isPending}
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

export default RecaladaEditPage;
