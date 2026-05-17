import { useState } from "react";
import { useThemeStore } from "../../../app/stores/themeStore";
import { useHistory } from "react-router-dom";
import LogoutAllModal from "./LogoutAllModal";
import SessionsPanel from "./SessionsPanel";
import type { SessionUser } from "../../../core/auth/types";
import { useGuideAvailability } from "../hooks/useGuideAvailability";
import {
  logoutCurrentSession,
  logoutAllSessions,
  requestLogoutAllCode,
} from "../../../core/auth/sessionLifecycle";
import {
  buildFullName,
  getDocumentTypeLabel,
  getProfileStatusLabel,
  getRoleLabel,
  getVerificationLabel,
  maskDocumentNumber,
} from "../utils/accountFormatters";

const Ico = {
  user:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  mail:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  shield:  (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  edit:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  refresh: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>,
  logout:  (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  warning: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  spinner: () => <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path style={{ opacity: 0.9 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>,
};

const ROLE_STYLE: Record<string, { color: string; bg: string }> = {
  SUPER_ADMIN: { color: "var(--color-accent)",  bg: "var(--color-accent-soft)"  },
  SUPERVISOR:  { color: "var(--color-primary)", bg: "var(--color-primary-soft)" },
  GUIA:        { color: "var(--color-success)", bg: "var(--color-success-soft)" },
};

interface ProfileCardProps {
  user: SessionUser;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, isRefreshing = false, onRefresh }) => {
  const history = useHistory();
  const { mode, toggle } = useThemeStore();
  const isDark = mode === "dark";
  const [busy, setBusy] = useState<null | "logout" | "logoutAll">(null);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const isGuia = user.role === "GUIA";
  const {
    availability,
    setAvailabilityAsync,
    isUpdating: availabilityBusy,
  } = useGuideAvailability(isGuia);

  const fullName  = buildFullName(user);
  const roleLabel = getRoleLabel(user.role);
  const verLabel  = getVerificationLabel(user);
  const profLabel = getProfileStatusLabel(user.profileStatus);
  const docLabel  = getDocumentTypeLabel(user.documentType);
  const docMasked = maskDocumentNumber(user.documentNumber);
  const roleStyle = ROLE_STYLE[user.role] ?? ROLE_STYLE.GUIA;
  const initials  = `${user.nombres?.[0] ?? ""}${user.apellidos?.[0] ?? ""}`.toUpperCase() || fullName.charAt(0).toUpperCase();
  const disabled  = busy !== null || isRefreshing;
  const disponibleParaTurnos =
    availability?.disponibleParaTurnos ?? user.disponibleParaTurnos ?? false;
  const pendingPenalty = availability?.pendingPenalty ?? user.pendingPenalty ?? false;
  const assignmentMode =
    availability?.turnoAssignmentMode ?? user.turnoAssignmentMode ?? "MANUAL_RECLAMO";

  const handleLogout = async () => {
    setLocalError(null);
    setBusy("logout");
    try {
      await logoutCurrentSession();
      history.replace("/login");
    } finally {
      setBusy(null);
    }
  };

  const handleOpenLogoutAll = async () => {
    setLocalError(null);
    setModalError(null);
    setBusy("logoutAll");
    try {
      await requestLogoutAllCode();
      setLogoutAllOpen(true);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "No pude enviar el código de confirmación.");
    } finally {
      setBusy(null);
    }
  };

  const handleConfirmLogoutAll = async (code: string) => {
    setModalError(null);
    setBusy("logoutAll");
    try {
      await logoutAllSessions({ code });
      history.replace("/login");
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "No pude cerrar todas las sesiones.");
    } finally {
      setBusy(null);
    }
  };

  const handleAvailability = async (disponible: boolean) => {
    setLocalError(null);
    try {
      await setAvailabilityAsync(disponible);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "No pude actualizar tu disponibilidad.");
    }
  };

  return (
    <>
      {/* ══ HEADER ══ */}
      <div
        style={{
          background: "var(--color-bg-elevated)",
          borderBottom: "1px solid var(--color-border-hairline)",
          padding: "52px 20px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Avatar */}
          <div
            style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              background: "var(--color-primary)",
              border: "1px solid var(--color-primary-active)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.25rem", fontWeight: 700, color: "white",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            {initials}
          </div>

          {/* Name + email + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              className="truncate"
              style={{
                margin: 0,
                fontSize: "var(--text-subhead)",
                fontWeight: 700,
                color: "var(--color-fg-primary)",
                letterSpacing: "var(--tracking-tight)",
                lineHeight: "var(--leading-tight)",
              }}
            >
              {fullName}
            </h1>
            <p
              className="truncate"
              style={{
                margin: "3px 0 0",
                fontSize: "var(--text-caption)",
                color: "var(--color-fg-muted)",
              }}
            >
              {user.email || "Sin correo registrado"}
            </p>
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: 8,
                borderRadius: 9999, padding: "3px 9px 3px 7px",
                background: roleStyle.bg,
                border: `1px solid ${roleStyle.color}33`,
                fontSize: "var(--text-eyebrow)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: roleStyle.color,
              }}
            >
              <span
                style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: roleStyle.color,
                }}
              />
              {roleLabel}
            </span>
          </div>

          {/* Refresh button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={disabled}
              style={{
                flexShrink: 0, width: 36, height: 36,
                borderRadius: 10, border: "1px solid var(--color-border-hairline)",
                background: "var(--color-bg-elevated)", cursor: disabled ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--color-fg-muted)", opacity: disabled ? 0.5 : 1,
                transition: "background 140ms ease",
              }}
            >
              {isRefreshing ? Ico.spinner() : Ico.refresh()}
            </button>
          )}
        </div>

        {/* Status pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          <StatusPill
            label={user.emailVerifiedAt ? "Verificado" : "No verificado"}
            tone={user.emailVerifiedAt ? "success" : "neutral"}
          />
          <StatusPill
            label={profLabel}
            tone={user.profileStatus === "COMPLETE" ? "success" : "neutral"}
          />
          {typeof user.activo === "boolean" && (
            <StatusPill label={user.activo ? "Activo" : "Inactivo"} tone={user.activo ? "success" : "danger"} />
          )}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ padding: "16px 16px 24px" }}>

        {/* Error banner */}
        {localError && (
          <div
            style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              borderRadius: 12, padding: "12px 14px", marginBottom: 12,
              background: "var(--color-danger-soft)", border: "1px solid var(--color-danger-border)",
            }}
          >
            <span style={{ color: "var(--color-danger)", flexShrink: 0, marginTop: 1 }}>{Ico.warning()}</span>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--color-danger)", lineHeight: 1.5 }}>{localError}</p>
          </div>
        )}

        <InfoSection
          title="Información Personal"
          icon={Ico.user()}
          items={[
            { label: "Nombres",   value: user.nombres   || "No registrado" },
            { label: "Apellidos", value: user.apellidos || "No registrado" },
            { label: "Documento", value: docLabel },
            { label: "Número",    value: docMasked },
          ]}
        />

        <InfoSection
          title="Contacto"
          icon={Ico.mail()}
          items={[
            { label: "Correo",   value: user.email    || "No registrado" },
            { label: "Teléfono", value: user.telefono || "No registrado" },
          ]}
        />

        {isGuia && (() => {
          const statusColor = pendingPenalty
            ? "var(--color-danger)"
            : disponibleParaTurnos
              ? "var(--color-success)"
              : "var(--color-fg-muted)";
          const statusBg = pendingPenalty
            ? "var(--color-danger-soft)"
            : disponibleParaTurnos
              ? "var(--color-success-soft)"
              : "var(--color-bg-subtle)";
          const statusBorder = pendingPenalty
            ? "var(--color-danger-border)"
            : disponibleParaTurnos
              ? "var(--color-success-border)"
              : "var(--color-border-hairline)";

          return (
          <SectionCard>
            <SectionHeader title="Disponibilidad operativa" icon={Ico.shield()} />
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  borderRadius: 12,
                  padding: "12px 14px",
                  background: statusBg,
                  border: `1px solid ${statusBorder}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className="live-pulse-dot"
                    style={{ background: statusColor }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--text-eyebrow)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "var(--tracking-eyebrow)",
                      color: statusColor,
                    }}
                  >
                    {pendingPenalty
                      ? "Penalización pendiente"
                      : disponibleParaTurnos
                        ? "En disponibilidad"
                        : "Fuera de disponibilidad"}
                  </p>
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "var(--text-body)",
                    fontWeight: 600,
                    color: "var(--color-fg-primary)",
                    letterSpacing: "var(--tracking-tight)",
                  }}
                >
                  {pendingPenalty
                    ? "No puedes tomar turnos"
                    : disponibleParaTurnos
                      ? "Disponible para turnos"
                      : "No disponible"}
                </p>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "var(--text-caption)",
                    color: "var(--color-fg-muted)",
                    lineHeight: "var(--leading-base)",
                  }}
                >
                  {assignmentMode === "FIFO_GLOBAL"
                    ? "FIFO automático activo: el sistema te asignará por orden de disponibilidad."
                    : "Reclamo manual activo: debes estar disponible para reclamar cupos desde la app."}
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <ActionBtn
                  label="Disponible"
                  icon={Ico.shield()}
                  primary={disponibleParaTurnos && !pendingPenalty}
                  disabled={disabled || availabilityBusy || pendingPenalty}
                  onClick={() => void handleAvailability(true)}
                />
                <ActionBtn
                  label="No disponible"
                  icon={Ico.warning()}
                  primary={!disponibleParaTurnos && !pendingPenalty}
                  disabled={disabled || availabilityBusy}
                  onClick={() => void handleAvailability(false)}
                />
              </div>
            </div>
          </SectionCard>
          );
        })()}

        <InfoSection
          title="Estado de cuenta"
          icon={Ico.shield()}
          items={[
            { label: "Rol",          value: roleLabel },
            { label: "Verificación", value: verLabel },
            { label: "Perfil",       value: profLabel },
          ]}
        />

        <SessionsPanel />

        {/* Appearance */}
        <SectionCard>
          <SectionHeader icon={isDark ? <MoonIcon /> : <SunIcon />} title="Apariencia" />
          <div style={{ padding: "12px 16px" }}>
            <ThemeToggleRow isDark={isDark} onToggle={toggle} />
          </div>
        </SectionCard>

        {/* Actions — main */}
        <SectionCard>
          <SectionHeader title="Cuenta" />
          <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <ActionBtn
              label="Editar mis datos"
              icon={Ico.edit()}
              primary
              disabled={disabled}
              onClick={() => history.push("/profile/edit")}
            />
            {onRefresh && (
              <ActionBtn
                label={isRefreshing ? "Recargando…" : "Recargar información"}
                icon={isRefreshing ? Ico.spinner() : Ico.refresh()}
                disabled={disabled}
                onClick={onRefresh}
              />
            )}
          </div>
        </SectionCard>

        {/* Actions — session */}
        <SectionCard>
          <SectionHeader title="Sesión" />
          <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
            <ActionBtn
              label={busy === "logout" ? "Cerrando sesión…" : "Cerrar sesión"}
              icon={busy === "logout" ? Ico.spinner() : Ico.logout()}
              disabled={disabled}
              onClick={() => void handleLogout()}
            />
            <ActionBtn
              label={busy === "logoutAll" ? "Cerrando todas…" : "Cerrar todas las sesiones"}
              icon={busy === "logoutAll" ? Ico.spinner() : Ico.warning()}
              danger
              disabled={disabled}
              onClick={() => void handleOpenLogoutAll()}
            />
          </div>
        </SectionCard>
      </div>

      <LogoutAllModal
        isOpen={logoutAllOpen}
        isLoading={busy === "logoutAll"}
        error={modalError}
        onConfirm={(code) => void handleConfirmLogoutAll(code)}
        onCancel={() => { setLogoutAllOpen(false); setModalError(null); }}
      />
    </>
  );
};

/* ── Shared atoms ── */

const StatusPill: React.FC<{ label: string; tone: "success" | "neutral" | "danger" }> = ({ label, tone }) => {
  const s = {
    success: { color: "#047857", bg: "var(--color-success-soft)", border: "var(--color-success-border)" },
    danger:  { color: "var(--color-danger)",  bg: "var(--color-danger-soft)", border: "var(--color-danger-border)" },
    neutral: { color: "var(--color-fg-secondary)", bg: "var(--color-bg-subtle)", border: "var(--color-border-hairline)" },
  }[tone];
  return (
    <span
      style={{
        borderRadius: 9999, padding: "2px 8px",
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontSize: "var(--text-eyebrow)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: s.color,
      }}
    >
      {label}
    </span>
  );
};

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      borderRadius: 16,
      marginBottom: 12,
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
      boxShadow: "var(--shadow-card)",
      overflow: "hidden",
    }}
  >
    {children}
  </div>
);

const SectionHeader: React.FC<{ title: string; icon?: React.ReactElement }> = ({ title, icon }) => (
  <div
    style={{
      padding: "12px 16px",
      borderBottom: "1px solid var(--color-border-hairline)",
      display: "flex", alignItems: "center", gap: 8,
    }}
  >
    {icon && <span style={{ color: "var(--color-fg-muted)", display: "flex" }}>{icon}</span>}
    <span
      style={{
        fontSize: "var(--text-eyebrow)",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-eyebrow)",
        color: "var(--color-fg-secondary)",
      }}
    >
      {title}
    </span>
  </div>
);

const InfoSection: React.FC<{
  title: string;
  icon: React.ReactElement;
  items: { label: string; value: string }[];
}> = ({ title, icon, items }) => (
  <SectionCard>
    <SectionHeader title={title} icon={icon} />
    <div>
      {items.map(({ label, value }, i) => (
        <div
          key={label}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            padding: "11px 16px",
            borderBottom: i < items.length - 1 ? "1px solid var(--color-border-hairline)" : "none",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-fg-muted)",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <span
            className="truncate"
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-fg-primary)",
              fontWeight: 600,
              textAlign: "right",
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  </SectionCard>
);

const ActionBtn: React.FC<{
  label: string;
  icon: React.ReactElement;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ label, icon, primary = false, danger = false, disabled = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "11px 14px", borderRadius: 10, width: "100%", textAlign: "left",
      background: primary
        ? "var(--color-primary)"
        : danger
        ? "var(--color-bg-elevated)"
        : "var(--color-bg-elevated)",
      border: primary
        ? "1px solid var(--color-primary)"
        : danger
        ? "1px solid var(--color-danger-border)"
        : "1px solid var(--color-border-hairline)",
      color: primary ? "white" : danger ? "var(--color-danger)" : "var(--color-fg-primary)",
      fontSize: "var(--text-body)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-tight)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      transition: "background 140ms ease, border-color 140ms ease",
    }}
  >
    <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
    <span>{label}</span>
  </button>
);

const SunIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ThemeToggleRow: React.FC<{ isDark: boolean; onToggle: () => void }> = ({ isDark, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 12px", borderRadius: 10, width: "100%",
      background: "var(--color-bg-subtle)",
      border: "1px solid var(--color-border-hairline)",
      cursor: "pointer",
      transition: "background 140ms ease",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-hairline)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {isDark
          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-fg-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
        }
      </div>
      <div style={{ textAlign: "left" }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--text-body)",
            fontWeight: 600,
            color: "var(--color-fg-primary)",
            letterSpacing: "var(--tracking-tight)",
          }}
        >
          {isDark ? "Modo oscuro" : "Modo claro"}
        </p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "var(--text-caption)",
            color: "var(--color-fg-muted)",
          }}
        >
          Toca para {isDark ? "activar modo claro" : "activar modo oscuro"}
        </p>
      </div>
    </div>

    {/* Toggle pill */}
    <div
      style={{
        width: 40, height: 22, borderRadius: 11, flexShrink: 0, position: "relative",
        background: isDark ? "var(--color-primary)" : "var(--color-border-hairline-strong)",
        transition: "background 0.2s ease",
      }}
    >
      <div
        style={{
          position: "absolute", top: 3,
          left: isDark ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%",
          background: "#FFFFFF",
          transition: "left 0.2s ease",
        }}
      />
    </div>
  </button>
);

export default ProfileCard;
