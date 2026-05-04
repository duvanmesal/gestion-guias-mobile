import { useState } from "react";
import { useSessions } from "../hooks/useSessions";
import type { UserSessionItem } from "../types/users.types";

const P = {
  primary: "var(--color-primary)",
  danger: "var(--color-danger)",
  fg: "var(--color-fg-primary)",
  fgSec: "var(--color-fg-secondary)",
  muted: "var(--color-fg-muted)",
  surface: "var(--color-bg-elevated)",
};

function formatDate(value?: string | null): string {
  if (!value) return "Sin actividad registrada";
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getSessionLabel(session: UserSessionItem): string {
  if (session.deviceId) return session.deviceId;
  if (session.userAgent) return session.userAgent;
  return session.platform === "MOBILE" ? "Dispositivo movil" : "Navegador web";
}

const SessionsPanel: React.FC = () => {
  const {
    sessions,
    isLoading,
    error,
    refetch,
    revokeSession,
    isRevokingSession,
  } = useSessions();
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRevoke = async (session: UserSessionItem) => {
    if (session.isCurrent) return;
    const ok = window.confirm("Cerrar esta sesion en el otro dispositivo?");
    if (!ok) return;

    setLocalError(null);
    setBusySessionId(session.id);
    try {
      await revokeSession(session.id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "No pude cerrar esa sesion.");
    } finally {
      setBusySessionId(null);
    }
  };

  return (
    <div className="animate-fade-up" style={{
      borderRadius: 20,
      marginBottom: 14,
      background: P.surface,
      border: "1px solid var(--color-glass-medium)",
      overflow: "hidden",
    }}>
      <div style={{ padding: "0.9rem 1.25rem 0.7rem", borderBottom: "1px solid var(--color-glass-soft)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 13, borderRadius: 2, background: P.primary, opacity: 0.9 }} />
          <span style={{ fontSize: "0.565rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: P.primary }}>
            Sesiones activas
          </span>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isLoading || isRevokingSession}
          style={{
            border: "none",
            background: "transparent",
            color: P.primary,
            fontSize: "0.7rem",
            fontWeight: 800,
            cursor: "pointer",
            opacity: isLoading || isRevokingSession ? 0.5 : 1,
          }}
        >
          Actualizar
        </button>
      </div>

      <div style={{ padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: 10 }}>
        {(error || localError) && (
          <div style={{
            borderRadius: 14,
            padding: "10px 12px",
            background: "var(--color-danger-soft)",
            border: "1px solid var(--color-danger-border)",
            color: P.danger,
            fontSize: "0.75rem",
            lineHeight: 1.45,
          }}>
            {localError ?? (error instanceof Error ? error.message : "No pude cargar tus sesiones.")}
          </div>
        )}

        {isLoading ? (
          <div style={{ color: P.muted, fontSize: "0.8125rem", padding: "10px 2px" }}>
            Cargando sesiones...
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ color: P.muted, fontSize: "0.8125rem", padding: "10px 2px" }}>
            No hay sesiones activas para mostrar.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              style={{
                borderRadius: 16,
                padding: "12px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid var(--color-glass-soft)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: P.fg }}>
                      {session.platform === "MOBILE" ? "Mobile" : "Web"}
                    </span>
                    {session.isCurrent && (
                      <span style={{
                        borderRadius: 999,
                        padding: "2px 8px",
                        background: "var(--color-success-soft)",
                        color: "var(--color-success)",
                        fontSize: "0.58rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}>
                        Actual
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "5px 0 0", color: P.fgSec, fontSize: "0.75rem", lineHeight: 1.35 }}>
                    {getSessionLabel(session)}
                  </p>
                  <p style={{ margin: "5px 0 0", color: P.muted, fontSize: "0.67rem", lineHeight: 1.35 }}>
                    Ultima actividad: {formatDate(session.lastActivityAt ?? session.lastRotatedAt ?? session.createdAt)}
                  </p>
                </div>

                {!session.isCurrent && (
                  <button
                    type="button"
                    onClick={() => void handleRevoke(session)}
                    disabled={isRevokingSession}
                    style={{
                      flexShrink: 0,
                      borderRadius: 12,
                      border: "1px solid var(--color-danger-border)",
                      background: "var(--color-danger-soft)",
                      color: P.danger,
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      padding: "8px 10px",
                      cursor: isRevokingSession ? "not-allowed" : "pointer",
                      opacity: isRevokingSession ? 0.55 : 1,
                    }}
                  >
                    {busySessionId === session.id ? "Cerrando..." : "Cerrar"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionsPanel;

