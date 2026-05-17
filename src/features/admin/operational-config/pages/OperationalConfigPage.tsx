import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import type { TurnoAssignmentMode } from "../../../../core/auth/types";
import Button from "../../../../ui/components/Button";
import ErrorState from "../../../../ui/components/ErrorState";
import LoadingScreen from "../../../../ui/components/LoadingScreen";
import { useOperationalConfig } from "../hooks/useOperationalConfig";

type ModeMeta = {
  value: TurnoAssignmentMode;
  label: string;
  shortLabel: string;
  helper: string;
  detail: string;
};

const MODES: ModeMeta[] = [
  {
    value: "MANUAL_RECLAMO",
    shortLabel: "Manual",
    label: "Reclamo manual",
    helper: "El guía reclama el cupo cuando puede.",
    detail:
      "Los guías disponibles toman turnos desde la app. El sistema no asigna automáticamente.",
  },
  {
    value: "FIFO_GLOBAL",
    shortLabel: "FIFO",
    label: "FIFO automático",
    helper: "El sistema asigna por orden de disponibilidad.",
    detail:
      "Los turnos se reparten automáticamente entre guías disponibles, en orden de quien marcó disponibilidad primero.",
  },
];

function formatDateTime(value?: string | null) {
  if (!value) return "Sin registro";
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const ArrowLeft = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const HandIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const ListIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
);

const CheckIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InfoIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

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
  const activeMeta = MODES.find((m) => m.value === currentMode) ?? MODES[0];

  async function handleUpdate(mode: TurnoAssignmentMode) {
    if (mode === currentMode) return;
    setMessage(null);
    setLocalError(null);
    try {
      await updateModeAsync(mode);
      setMessage("Modo actualizado correctamente.");
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "No pude actualizar el modo");
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-bg-base)",
            paddingBottom: "1.5rem",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "44px 20px 20px",
              background: "var(--color-bg-elevated)",
              borderBottom: "1px solid var(--color-border-hairline)",
            }}
          >
            <button
              type="button"
              onClick={() => history.goBack()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                color: "var(--color-fg-muted)",
                fontSize: "var(--text-caption)",
                fontWeight: 600,
                padding: "4px 0 12px",
                cursor: "pointer",
              }}
            >
              {ArrowLeft}
              Atrás
            </button>

            <p
              style={{
                margin: 0,
                fontSize: "var(--text-eyebrow)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-eyebrow)",
                color: "var(--color-fg-muted)",
              }}
            >
              Administración
            </p>
            <h1
              style={{
                margin: "4px 0 0",
                fontSize: "var(--text-display)",
                fontWeight: 700,
                color: "var(--color-fg-primary)",
                letterSpacing: "var(--tracking-tight)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              Configuración operativa
            </h1>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "var(--text-caption)",
                color: "var(--color-fg-muted)",
                lineHeight: "var(--leading-base)",
              }}
            >
              Define cómo se reparten los turnos entre los guías disponibles.
            </p>

            {/* Active mode chip */}
            <div
              style={{
                marginTop: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 9999,
                background: "var(--color-primary-soft)",
                border: "1px solid var(--color-primary-glow)",
              }}
            >
              <span
                className="live-pulse-dot"
                style={{ background: "var(--color-primary)" }}
              />
              <span
                style={{
                  fontSize: "var(--text-caption)",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  letterSpacing: "var(--tracking-tight)",
                }}
              >
                Modo activo: {activeMeta.shortLabel}
              </span>
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              padding: "16px 16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Status banners */}
            {message && (
              <div className="alert-base alert-success">
                <span style={{ flexShrink: 0, marginTop: 1 }}>{CheckIcon}</span>
                <span>{message}</span>
              </div>
            )}
            {localError && (
              <div className="alert-base alert-error">
                <span style={{ flexShrink: 0, marginTop: 1 }}>{InfoIcon}</span>
                <span>{localError}</span>
              </div>
            )}

            {/* Mode selector card */}
            <div
              style={{
                borderRadius: 16,
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-hairline)",
                boxShadow: "var(--shadow-card)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 16px 10px",
                  borderBottom: "1px solid var(--color-border-hairline)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-eyebrow)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "var(--tracking-eyebrow)",
                    color: "var(--color-fg-muted)",
                  }}
                >
                  Modo de asignación
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: "var(--text-body)",
                    fontWeight: 600,
                    color: "var(--color-fg-primary)",
                    letterSpacing: "var(--tracking-tight)",
                  }}
                >
                  ¿Cómo se reparten los turnos?
                </p>
              </div>

              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {MODES.map((mode) => {
                  const active = mode.value === currentMode;
                  return (
                    <button
                      key={mode.value}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void handleUpdate(mode.value)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: active
                          ? "var(--color-primary-soft)"
                          : "var(--color-bg-subtle)",
                        border: active
                          ? "1.5px solid var(--color-primary)"
                          : "1px solid var(--color-border-hairline)",
                        cursor: isUpdating ? "not-allowed" : "pointer",
                        opacity: isUpdating ? 0.7 : 1,
                        transition: "all 140ms ease",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: active
                            ? "var(--color-primary)"
                            : "var(--color-bg-elevated)",
                          border: active
                            ? "1px solid var(--color-primary)"
                            : "1px solid var(--color-border-hairline)",
                          color: active ? "white" : "var(--color-fg-secondary)",
                        }}
                      >
                        {mode.value === "MANUAL_RECLAMO" ? HandIcon : ListIcon}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              fontWeight: 700,
                              color: "var(--color-fg-primary)",
                              letterSpacing: "var(--tracking-tight)",
                            }}
                          >
                            {mode.label}
                          </span>
                          {active && (
                            <span
                              style={{
                                fontSize: 9.5,
                                fontWeight: 700,
                                color: "var(--color-primary)",
                                background: "var(--color-bg-elevated)",
                                border: "1px solid var(--color-primary-glow)",
                                padding: "2px 6px",
                                borderRadius: 6,
                                letterSpacing: "0.05em",
                              }}
                            >
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "var(--text-caption)",
                            color: "var(--color-fg-muted)",
                            lineHeight: "var(--leading-base)",
                          }}
                        >
                          {mode.helper}
                        </p>
                      </div>

                      {active && (
                        <span
                          style={{
                            flexShrink: 0,
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            background: "var(--color-primary)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 6,
                          }}
                        >
                          {CheckIcon}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail card for current mode */}
            <div
              style={{
                borderRadius: 14,
                padding: "12px 14px",
                background: "var(--color-info-soft)",
                border: "1px solid var(--color-info-border)",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  color: "var(--color-info)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {InfoIcon}
              </span>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-caption)",
                    fontWeight: 700,
                    color: "var(--color-fg-primary)",
                  }}
                >
                  {activeMeta.label}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "var(--text-caption)",
                    color: "var(--color-fg-secondary)",
                    lineHeight: "var(--leading-base)",
                  }}
                >
                  {activeMeta.detail}
                </p>
              </div>
            </div>

            {/* Meta footer */}
            <p
              style={{
                margin: "4px 4px 0",
                fontSize: "var(--text-eyebrow)",
                color: "var(--color-fg-muted)",
                fontWeight: 500,
              }}
            >
              Última actualización: {formatDateTime(config?.updatedAt)}
            </p>

            {/* Back button as fallback */}
            <div style={{ marginTop: 12 }}>
              <Button variant="ghost" size="md" onClick={() => history.goBack()}>
                Volver
              </Button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OperationalConfigPage;
