import { IonContent, IonPage } from "@ionic/react";
import { useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorState from "../../../ui/components/ErrorState";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { useBuquesLookup } from "../../admin/catalogs/hooks/useBuquesLookup";
import { usePaisesLookup } from "../../admin/catalogs/hooks/usePaisesLookup";
import RecaladaForm, {
  type BuqueLookupOption,
  type RecaladaFormValues,
} from "../components/RecaladaForm";
import { useRecalada } from "../hooks/useRecalada";
import { useUpdateRecalada } from "../hooks/useUpdateRecalada";

interface RouteParams { id: string; }

const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const RecaladaEditPage: React.FC = () => {
  const history = useHistory();
  const { id }  = useParams<RouteParams>();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const recaladaId = useMemo(() => { const n = Number(id); return Number.isFinite(n) ? n : undefined; }, [id]);

  const recaladaQuery  = useRecalada(recaladaId);
  const buquesQuery    = useBuquesLookup();
  const paisesQuery    = usePaisesLookup();
  const updateRecalada = useUpdateRecalada();

  const isLoadingInitial = (recaladaQuery.isLoading && !recaladaQuery.data) || buquesQuery.isLoading || paisesQuery.isLoading;

  if (!recaladaId) return <ErrorState title="ID inválido" message="El identificador de la recalada no es válido." onRetry={() => history.push("/recaladas")} retryLabel="Volver" />;
  if (isLoadingInitial) return <LoadingScreen message="Cargando recalada..." />;
  if (recaladaQuery.error && !recaladaQuery.data) return <ErrorState title="No pude cargar la recalada" message={recaladaQuery.error instanceof Error ? recaladaQuery.error.message : "Problema inesperado."} onRetry={() => void recaladaQuery.refetch()} />;

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

  const buques: BuqueLookupOption[] = (buquesQuery.data ?? []).map((b) => ({ id: b.id, nombre: b.nombre }));
  const paises = (paisesQuery.data ?? []).map((p) => ({ id: p.id, codigo: p.codigo, nombre: p.nombre }));

  async function handleSubmit(values: RecaladaFormValues) {
    setSubmitError(null);
    const isArrived = opStatus === "ARRIVED";
    const payload = isArrived
      ? {
          fechaSalida:         values.fechaSalida ? new Date(values.fechaSalida).toISOString() : undefined,
          terminal:            values.terminal?.trim() || undefined,
          muelle:              values.muelle?.trim() || undefined,
          pasajerosEstimados:  typeof values.pasajerosEstimados === "number" ? values.pasajerosEstimados : undefined,
          tripulacionEstimada: typeof values.tripulacionEstimada === "number" ? values.tripulacionEstimada : undefined,
          observaciones:       values.observaciones?.trim() || undefined,
        }
      : {
          buqueId:             Number(values.buqueId),
          paisOrigenId:        Number(values.paisOrigenId),
          fechaLlegada:        new Date(values.fechaLlegada).toISOString(),
          fechaSalida:         values.fechaSalida ? new Date(values.fechaSalida).toISOString() : undefined,
          terminal:            values.terminal?.trim() || undefined,
          muelle:              values.muelle?.trim() || undefined,
          pasajerosEstimados:  typeof values.pasajerosEstimados === "number" ? values.pasajerosEstimados : undefined,
          tripulacionEstimada: typeof values.tripulacionEstimada === "number" ? values.tripulacionEstimada : undefined,
          observaciones:       values.observaciones?.trim() || undefined,
          fuente:              values.fuente,
        };
    try {
      await updateRecalada.mutateAsync({ id: recaladaId!, payload });
      history.replace(`/recaladas/${recaladaId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No pude actualizar la recalada");
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div style={{ minHeight: "100vh", background: "var(--color-bg-base)", paddingBottom: "2rem" }}>

          {/* ── Hero header ── */}
          <div className="relative overflow-hidden" style={{
            background: "var(--gradient-hero-main) 0%, var(--color-bg-base) 60%, var(--color-bg-base) 100%)",
            borderBottom: "1px solid var(--color-accent-glow)",
          }}>
            <div style={{ position: "absolute", top: -60, left: -40, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, var(--color-primary-glow) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />

            <div style={{ position: "relative", maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem 1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.125rem" }}>
                <button type="button" onClick={() => history.goBack()} style={{ width: 34, height: 34, borderRadius: 11, background: "var(--color-glass-medium)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <BackIcon />
                </button>
                <span style={{ fontSize: "0.555rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "rgba(255,255,255,0.32)" }}>Recaladas / Editar</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 15, background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent) 100%)", boxShadow: "0 6px 18px var(--color-accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                  <EditIcon />
                </div>
                <div>
                  <p style={{ fontSize: "0.555rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--color-accent-glow)" }}>Editar recalada</p>
                  <h1 style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 900, color: "var(--color-fg-primary)", letterSpacing: "-0.01em", lineHeight: 1.1 }}>{recalada.codigoRecalada}</h1>
                </div>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>
            <RecaladaForm
              buques={buques}
              paises={paises}
              initialValues={{
                buqueId:             recalada.buque.id,
                paisOrigenId:        recalada.paisOrigen.id,
                fechaLlegada:        recalada.fechaLlegada,
                fechaSalida:         recalada.fechaSalida,
                terminal:            recalada.terminal,
                muelle:              recalada.muelle,
                pasajerosEstimados:  recalada.pasajerosEstimados,
                tripulacionEstimada: recalada.tripulacionEstimada,
                observaciones:       recalada.observaciones,
                fuente:              recalada.fuente,
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
