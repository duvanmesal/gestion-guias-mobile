import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import type { TurnoAssignmentMode } from "../../../../core/auth/types";
import Button from "../../../../ui/components/Button";
import ErrorState from "../../../../ui/components/ErrorState";
import LoadingScreen from "../../../../ui/components/LoadingScreen";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import { useOperationalConfig } from "../hooks/useOperationalConfig";

const modes: Array<{ value: TurnoAssignmentMode; label: string; helper: string }> = [
  {
    value: "MANUAL_RECLAMO",
    label: "Reclamo manual",
    helper: "El guía disponible toma cupos desde la UI.",
  },
  {
    value: "FIFO_GLOBAL",
    label: "FIFO automático",
    helper: "El sistema asigna por disponibilidad global.",
  },
];

const OperationalConfigPage: React.FC = () => {
  const history = useHistory();
  const { config, isLoading, error, updateModeAsync, isUpdating } = useOperationalConfig();
  const [message, setMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  if (isLoading && !config) {
    return <LoadingScreen message="Cargando configuración..." />;
  }

  if (error && !config) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex min-h-screen items-center justify-center px-5">
            <ErrorState
              title="No pude cargar configuración"
              message={error instanceof Error ? error.message : "Error inesperado"}
              onRetry={() => window.location.reload()}
            />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const currentMode = config?.turnoAssignmentMode ?? "MANUAL_RECLAMO";

  async function handleUpdate(mode: TurnoAssignmentMode) {
    if (mode === currentMode) return;
    setMessage(null);
    setLocalError(null);
    try {
      await updateModeAsync(mode);
      setMessage("Modo actualizado.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "No pude actualizar el modo");
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-6 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" fullWidth={false} onClick={() => history.goBack()}>
                Volver
              </Button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Configuración operativa
                </h1>
              </div>
            </div>

            {message && (
              <div className="rounded-2xl border px-3 py-3 text-sm"
                style={{ background: "var(--color-success-soft)", borderColor: "var(--color-success-border)", color: "var(--color-success)" }}>
                {message}
              </div>
            )}
            {localError && (
              <div className="rounded-2xl border px-3 py-3 text-sm"
                style={{ background: "var(--color-danger-soft)", borderColor: "var(--color-danger-border)", color: "var(--color-danger)" }}>
                {localError}
              </div>
            )}

            <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
              <p className="text-sm font-semibold text-[var(--color-fg-primary)]">
                Modo global de turnos
              </p>
              {modes.map((mode) => {
                const active = mode.value === currentMode;
                return (
                  <button
                    key={mode.value}
                    disabled={isUpdating}
                    onClick={() => void handleUpdate(mode.value)}
                    className="w-full rounded-2xl px-4 py-3 text-left"
                    style={{
                      background: active ? "var(--color-primary-soft)" : "var(--color-bg-subtle)",
                      border: active ? "1px solid var(--color-primary)" : "1px solid var(--color-border-hairline)",
                      color: "var(--color-fg-primary)",
                    }}
                  >
                    <span className="block text-sm font-bold">{mode.label}</span>
                    <span className="mt-1 block text-xs text-[var(--color-fg-muted)]">{mode.helper}</span>
                  </button>
                );
              })}
            </SurfaceCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OperationalConfigPage;
