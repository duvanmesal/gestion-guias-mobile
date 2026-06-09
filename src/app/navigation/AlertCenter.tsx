import { useState } from "react";
import { IonModal, IonIcon } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  notificationsOutline,
  notificationsOffOutline,
  checkmarkOutline,
  checkmarkDoneOutline,
  trashOutline,
  timeOutline,
} from "ionicons/icons";

import {
  useAlertStore,
  useUnreadAlertCount,
  type OperationalAlertSeverity,
} from "../stores/alertStore";

const SEVERITY_DOT: Record<OperationalAlertSeverity, string> = {
  info: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
};

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

/**
 * Campana global de alertas operativas (mobile). Reemplaza la bandeja del
 * Topbar web: botón flotante con contador de no leídas que abre una hoja
 * (IonModal) con las últimas alertas de la sesión.
 */
const AlertCenter: React.FC = () => {
  const history = useHistory();
  const [open, setOpen] = useState(false);

  const alerts = useAlertStore((s) => s.alerts);
  const markRead = useAlertStore((s) => s.markRead);
  const markAllRead = useAlertStore((s) => s.markAllRead);
  const remove = useAlertStore((s) => s.remove);
  const clear = useAlertStore((s) => s.clear);
  const unread = useUnreadAlertCount();

  const handleVer = (id: string, route?: string | null) => {
    markRead(id);
    setOpen(false);
    if (route) history.push(route);
  };

  return (
    <>
      {/* Botón flotante (campana) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          unread > 0 ? `Alertas operativas, ${unread} sin leer` : "Alertas operativas"
        }
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 10px)",
          right: 12,
          zIndex: 30,
          width: 42,
          height: 42,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-hairline)",
          boxShadow: "var(--shadow-card)",
          color: "var(--color-fg-primary)",
        }}
      >
        <IonIcon icon={notificationsOutline} style={{ fontSize: 20 }} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 9999,
              background: "var(--color-danger)",
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      <IonModal
        isOpen={open}
        onDidDismiss={() => setOpen(false)}
        initialBreakpoint={0.85}
        breakpoints={[0, 0.85]}
        handle={true}
        style={{ "--border-radius": "24px 24px 0 0" } as React.CSSProperties}
      >
        <div
          style={{
            background: "var(--color-bg-elevated)",
            borderRadius: "24px 24px 0 0",
            display: "flex",
            flexDirection: "column",
            maxHeight: "85vh",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "20px 20px 14px",
              borderBottom: "1px solid var(--color-border-hairline)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1.0625rem",
                fontWeight: 700,
                color: "var(--color-fg-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              Alertas
              {unread > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-fg-muted)",
                  }}
                >
                  {unread} sin leer
                </span>
              )}
            </h2>
            {alerts.length > 0 && (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 10px",
                    borderRadius: 10,
                    border: "1px solid var(--color-border-hairline)",
                    background: "var(--color-bg-base)",
                    color: "var(--color-primary)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  <IonIcon icon={checkmarkDoneOutline} style={{ fontSize: 15 }} />
                  Leídas
                </button>
                <button
                  type="button"
                  onClick={clear}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 10,
                    border: "1px solid var(--color-border-hairline)",
                    background: "var(--color-bg-base)",
                    color: "var(--color-fg-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          {/* Lista */}
          <div style={{ overflowY: "auto", padding: "8px 0 24px" }}>
            {alerts.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: "48px 24px",
                  textAlign: "center",
                }}
              >
                <IonIcon
                  icon={notificationsOffOutline}
                  style={{ fontSize: 36, color: "var(--color-fg-muted)" }}
                />
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-fg-muted)" }}>
                  No hay alertas recientes.
                </p>
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 20px",
                    borderBottom: "1px solid var(--color-border-hairline)",
                    background: a.read ? "transparent" : "var(--color-primary-soft)",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      marginTop: 6,
                      width: 8,
                      height: 8,
                      flexShrink: 0,
                      borderRadius: 9999,
                      background: SEVERITY_DOT[a.severity],
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <p
                        className="truncate"
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--color-fg-primary)",
                        }}
                      >
                        {a.title}
                      </p>
                      {a.count > 1 && (
                        <span
                          style={{
                            flexShrink: 0,
                            padding: "1px 6px",
                            borderRadius: 9999,
                            background: "var(--color-glass-medium)",
                            color: "var(--color-fg-muted)",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          ×{a.count}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.8125rem",
                        color: "var(--color-fg-secondary)",
                        lineHeight: 1.45,
                      }}
                    >
                      {a.body}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.6875rem",
                          color: "var(--color-fg-muted)",
                        }}
                      >
                        <IonIcon icon={timeOutline} style={{ fontSize: 13 }} />
                        {formatRelative(a.lastReceivedAt)}
                      </span>
                      {a.route && (
                        <button
                          type="button"
                          onClick={() => handleVer(a.id, a.route)}
                          style={{
                            padding: 0,
                            border: "none",
                            background: "none",
                            color: "var(--color-primary)",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                          }}
                        >
                          Ver
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    {!a.read && (
                      <button
                        type="button"
                        onClick={() => markRead(a.id)}
                        aria-label="Marcar como leída"
                        style={{
                          padding: 4,
                          border: "none",
                          background: "none",
                          color: "var(--color-fg-muted)",
                        }}
                      >
                        <IonIcon icon={checkmarkOutline} style={{ fontSize: 16 }} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      aria-label="Eliminar alerta"
                      style={{
                        padding: 4,
                        border: "none",
                        background: "none",
                        color: "var(--color-fg-muted)",
                      }}
                    >
                      <IonIcon icon={trashOutline} style={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </IonModal>
    </>
  );
};

export default AlertCenter;
