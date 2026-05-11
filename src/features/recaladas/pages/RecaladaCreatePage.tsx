import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorState from "../../../ui/components/ErrorState";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { useBuquesLookup } from "../../admin/catalogs/hooks/useBuquesLookup";
import { usePaisesLookup } from "../../admin/catalogs/hooks/usePaisesLookup";
import RecaladaForm, {
  type BuqueLookupOption,
  type RecaladaFormValues,
} from "../components/RecaladaForm";
import { useCreateRecalada } from "../hooks/useCreateRecalada";

const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ShipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" />
    <path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
  </svg>
);

const RecaladaCreatePage: React.FC = () => {
  const history        = useHistory();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const buquesQuery    = useBuquesLookup();
  const paisesQuery    = usePaisesLookup();
  const createRecalada = useCreateRecalada();

  if (buquesQuery.isLoading || paisesQuery.isLoading) return <LoadingScreen message="Cargando catálogos..." />;

  if (buquesQuery.error || paisesQuery.error) {
    const err = buquesQuery.error ?? paisesQuery.error;
    return (
      <ErrorState
        title="No pude cargar los catálogos"
        message={err instanceof Error ? err.message : "Ocurrió un problema al cargar buques o países."}
        onRetry={() => { void buquesQuery.refetch(); void paisesQuery.refetch(); }}
      />
    );
  }

  const buques: BuqueLookupOption[] = (buquesQuery.data ?? []).map((b) => ({ id: b.id, nombre: b.nombre }));
  const paises = (paisesQuery.data ?? []).map((p) => ({ id: p.id, codigo: p.codigo, nombre: p.nombre }));

  async function handleSubmit(values: RecaladaFormValues) {
    setSubmitError(null);
    try {
      const created = await createRecalada.mutateAsync({
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
      });
      history.replace(`/recaladas/${created?.id ?? ""}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "No pude crear la recalada");
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div style={{ minHeight: "100vh", background: "var(--color-bg-base)", paddingBottom: "2rem" }}>

          {/* ── Page Header ── */}
          <div style={{ background: "var(--color-bg-elevated)", borderBottom: "1px solid var(--color-glass-medium)" }}>
            <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.125rem" }}>
                <button type="button" onClick={() => history.goBack()} style={{ width: 34, height: 34, borderRadius: 11, background: "var(--color-glass-subtle)", border: "1px solid var(--color-glass-medium)", color: "var(--color-fg-primary)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <BackIcon />
                </button>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-fg-muted)" }}>Recaladas</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 13, background: "var(--color-info)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                  <ShipIcon />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.6875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-fg-muted)" }}>Nueva</p>
                  <h1 style={{ margin: "2px 0 0", fontSize: "1.375rem", fontWeight: 800, color: "var(--color-fg-primary)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Recalada</h1>
                </div>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>
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
