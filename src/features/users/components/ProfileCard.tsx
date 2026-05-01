import { useState } from "react";
import { IonAlert } from "@ionic/react";
import { useHistory } from "react-router-dom";
import type { SessionUser } from "../../../core/auth/types";
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

/* ── Palette ── */
const P = {
  violet:       "var(--color-primary)",
  violetLight:  "var(--color-primary-light)",
  violetGlow:   "var(--color-primary-glow)",
  violetFaint:  "var(--color-primary-glow)",
  violetBorder: "var(--color-primary-glow)",
  amber:        "var(--color-accent)",
  amberFaint:   "var(--color-accent-glow)",
  amberBorder:  "var(--color-accent-glow)",
  danger:       "var(--color-danger)",
  dangerFaint:  "var(--color-danger-soft)",
  dangerBorder: "var(--color-danger-border)",
  teal:         "var(--color-success)",
  tealFaint:    "var(--color-success-soft)",
  tealBorder:   "var(--color-success-soft)",
  fg:           "var(--color-fg-primary)",
  fgSec:        "var(--color-fg-secondary)",
  fgMuted:      "var(--color-fg-muted)",
  surface: "var(--color-bg-elevated)",
};

/* ── Icons ── */
const Ico = {
  user:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  mail:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  phone:   (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  id:      (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  shield:  (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  edit:    (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  refresh: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>,
  logout:  (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  warning: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  check:   (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  spinner: () => <svg style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path style={{ opacity: 0.9 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>,
};

/* ── Role label map ── */
const ROLE_COLOR: Record<string, { color: string; faint: string; border: string }> = {
  SUPER_ADMIN: { color: P.amber,  faint: P.amberFaint,  border: P.amberBorder },
  SUPERVISOR:  { color: P.violet, faint: P.violetFaint, border: P.violetBorder },
  GUIA:        { color: P.teal,   faint: P.tealFaint,   border: P.tealBorder },
};

interface ProfileCardProps {
  user: SessionUser;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, isRefreshing = false, onRefresh }) => {
  const history = useHistory();
  const [busy, setBusy] = useState<null | "logout" | "logoutAll">(null);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fullName   = buildFullName(user);
  const roleLabel  = getRoleLabel(user.role);
  const verLabel   = getVerificationLabel(user);
  const profLabel  = getProfileStatusLabel(user.profileStatus);
  const docLabel   = getDocumentTypeLabel(user.documentType);
  const docMasked  = maskDocumentNumber(user.documentNumber);
  const roleStyle  = ROLE_COLOR[user.role] ?? ROLE_COLOR.GUIA;

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
    setLocalError(null);
    setBusy("logoutAll");
    try {
      const cleanCode = code.trim();
      if (!/^\d{6}$/.test(cleanCode)) {
        setLocalError("Debes ingresar el código de 6 dígitos.");
        return;
      }
      await logoutAllSessions({ code: cleanCode });
      history.replace("/login");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "No pude cerrar todas las sesiones.");
    } finally {
      setBusy(null);
    }
  };

  const disabled = busy !== null || isRefreshing;

  return (
    <>
      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden" style={{
        background: "var(--gradient-hero-main) 0%, var(--color-bg-base) 55%, var(--color-bg-base) 100%)",
        borderBottom: "1px solid var(--color-primary-glow)",
      }}>
        {/* Ambient orbs */}
        <div style={{ position: "absolute", top: -80, left: -50, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, var(--color-primary-glow) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 10, right: -30, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 65%)", pointerEvents: "none" }} />
        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, var(--color-primary-glow) 1px, transparent 1px)", backgroundSize: "22px 22px", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 480, margin: "0 auto", padding: "2.5rem 1.25rem 1.75rem" }}>
          {/* Page label */}
          <p style={{ fontSize: "0.565rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.24em", color: P.violet, marginBottom: 18 }}>
            Mi cuenta
          </p>

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 70, height: 70, borderRadius: 22, flexShrink: 0,
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              boxShadow: `0 8px 28px ${P.violetGlow}, 0 2px 6px rgba(0,0,0,0.05)`,
              border: "2px solid var(--color-primary-glow)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.65rem", fontWeight: 800, color: "white", letterSpacing: "-0.01em",
            }}>
              {fullName.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="truncate font-extrabold" style={{ fontSize: "1.45rem", color: P.fg, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {fullName}
              </h1>
              <p className="truncate" style={{ fontSize: "0.72rem", color: P.fgSec, marginTop: 4 }}>
                {user.email || "Sin correo registrado"}
              </p>

              {/* Role pill */}
              <span style={{
                display: "inline-flex", alignItems: "center",
                marginTop: 8, borderRadius: 9999, padding: "3px 10px",
                background: roleStyle.faint, border: `1px solid ${roleStyle.border}`,
                fontSize: "0.575rem", fontWeight: 800, textTransform: "uppercase",
                letterSpacing: "0.14em", color: roleStyle.color,
              }}>
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Status pills row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 18 }}>
            <StatusPill
              label={user.emailVerifiedAt ? "Verificado" : "No verificado"}
              tone={user.emailVerifiedAt ? "teal" : "muted"}
            />
            <StatusPill
              label={profLabel}
              tone={user.profileStatus === "COMPLETE" ? "teal" : "muted"}
            />
            {typeof user.activo === "boolean" && (
              <StatusPill label={user.activo ? "Activo" : "Inactivo"} tone={user.activo ? "teal" : "danger"} />
            )}
          </div>

          {isRefreshing && (
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="animate-spin" style={{ color: P.violet, display: "flex" }}>{Ico.refresh()}</span>
              <span style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.08em", color: P.violet }}>Actualizando perfil…</span>
            </div>
          )}

          <div style={{ height: 1, background: "linear-gradient(90deg, var(--color-primary-glow), transparent)", marginTop: 20 }} />
        </div>
      </div>

      {/* ══ CONTENT CARDS ══ */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.25rem 1.25rem 0" }}>

        {/* Error banner */}
        {localError && (
          <div className="animate-shake" style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            borderRadius: 16, padding: "12px 14px", marginBottom: 14,
            background: P.dangerFaint, border: `1px solid ${P.dangerBorder}`,
          }}>
            <span style={{ color: P.danger, flexShrink: 0, marginTop: 1 }}>{Ico.warning()}</span>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-danger)", lineHeight: 1.5 }}>{localError}</p>
          </div>
        )}

        {/* Personal info */}
        <InfoSection
          title="Información Personal"
          icon={Ico.user()}
          color={P.violet}
          items={[
            { label: "Nombres",   value: user.nombres   || "No registrado" },
            { label: "Apellidos", value: user.apellidos || "No registrado" },
            { label: "Documento", value: docLabel },
            { label: "Número",    value: docMasked },
          ]}
        />

        {/* Contact */}
        <InfoSection
          title="Contacto"
          icon={Ico.mail()}
          color="var(--color-info)"
          items={[
            { label: "Correo",    value: user.email    || "No registrado" },
            { label: "Teléfono",  value: user.telefono || "No registrado" },
          ]}
        />

        {/* Account status */}
        <InfoSection
          title="Estado de Cuenta"
          icon={Ico.shield()}
          color={P.amber}
          items={[
            { label: "Rol",          value: roleLabel },
            { label: "Verificación", value: verLabel },
            { label: "Perfil",       value: profLabel },
          ]}
        />

        {/* Actions */}
        <div className="animate-fade-up" style={{
          borderRadius: 20, marginBottom: 14,
          background: P.surface,
          border: "1px solid var(--color-glass-medium)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "0.9rem 1.25rem 0.7rem", borderBottom: "1px solid var(--color-glass-soft)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 3, height: 13, borderRadius: 2, background: P.violet, opacity: 0.9 }} />
            <span style={{ fontSize: "0.565rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: P.violet }}>Acciones</span>
          </div>

          <div style={{ padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: 10 }}>
            <ActionBtn
              label="Editar mis datos"
              icon={Ico.edit()}
              color={P.violet}
              faint={P.violetFaint}
              border={P.violetBorder}
              shadow={`0 6px 20px ${P.violetGlow}`}
              gradient="linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary) 100%)"
              primary
              disabled={disabled}
              onClick={() => history.push("/profile/edit")}
            />

            {onRefresh && (
              <ActionBtn
                label={isRefreshing ? "Recargando…" : "Recargar información"}
                icon={isRefreshing ? Ico.spinner() : Ico.refresh()}
                color="var(--color-fg-secondary)"
                faint="var(--color-glass-soft)"
                border="var(--color-glass-medium)"
                disabled={disabled}
                onClick={onRefresh}
              />
            )}

            <ActionBtn
              label={busy === "logout" ? "Cerrando sesión…" : "Cerrar sesión"}
              icon={busy === "logout" ? Ico.spinner() : Ico.logout()}
              color="var(--color-fg-secondary)"
              faint="var(--color-glass-soft)"
              border="var(--color-glass-medium)"
              disabled={disabled}
              onClick={() => void handleLogout()}
            />

            <ActionBtn
              label={busy === "logoutAll" ? "Cerrando todas…" : "Cerrar todas las sesiones"}
              icon={busy === "logoutAll" ? Ico.spinner() : Ico.warning()}
              color={P.danger}
              faint={P.dangerFaint}
              border={P.dangerBorder}
              disabled={disabled}
              onClick={() => void handleOpenLogoutAll()}
            />
          </div>
        </div>
      </div>

      <IonAlert
        isOpen={logoutAllOpen}
        onDidDismiss={() => setLogoutAllOpen(false)}
        header="Cerrar todas las sesiones"
        message="Ingresa el código de 6 dígitos que enviamos a tu correo para cerrar sesión en todos tus dispositivos."
        inputs={[{ name: "code", type: "tel", placeholder: "Código de 6 dígitos", attributes: { maxlength: 6, inputmode: "numeric" } }]}
        buttons={[
          { text: "Cancelar", role: "cancel" },
          {
            text: "Confirmar",
            handler: (values) => {
              void handleConfirmLogoutAll(values.code ?? "");
              return false;
            },
          },
        ]}
      />
    </>
  );
};

/* ── Shared atoms ── */
const StatusPill: React.FC<{ label: string; tone: "teal" | "muted" | "danger" }> = ({ label, tone }) => {
  const styles = {
    teal:   { color: "var(--color-success)", faint: "var(--color-success-soft)",  border: "var(--color-success-soft)" },
    danger: { color: "var(--color-danger)", faint: "var(--color-danger-soft)",   border: "var(--color-danger-border)" },
    muted:  { color: "var(--color-fg-muted)", faint: "var(--color-glass-soft)", border: "var(--color-glass-medium)" },
  }[tone];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      borderRadius: 9999, padding: "3px 9px",
      background: styles.faint, border: `1px solid ${styles.border}`,
      fontSize: "0.6rem", fontWeight: 700, color: styles.color,
    }}>
      {label}
    </span>
  );
};

const InfoSection: React.FC<{
  title: string;
  icon: React.ReactElement;
  color: string;
  items: { label: string; value: string }[];
}> = ({ title, icon, color, items }) => (
  <div className="animate-fade-up" style={{
    borderRadius: 20, marginBottom: 14,
    background: P.surface,
    border: "1px solid var(--color-glass-medium)",
    overflow: "hidden",
  }}>
    {/* Header */}
    <div style={{ padding: "0.9rem 1.25rem 0.7rem", borderBottom: "1px solid var(--color-glass-soft)", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 13, borderRadius: 2, background: color, opacity: 0.9 }} />
      <span style={{ color, display: "flex", opacity: 0.85 }}>{icon}</span>
      <span style={{ fontSize: "0.565rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color }}>
        {title}
      </span>
    </div>

    {/* Rows */}
    <div style={{ padding: "0.75rem 1rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(({ label, value }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
            borderRadius: 12, padding: "9px 12px",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid var(--color-glass-soft)",
          }}>
            <span style={{ fontSize: "0.72rem", color: P.fgMuted, fontWeight: 500, flexShrink: 0 }}>{label}</span>
            <span className="truncate" style={{ fontSize: "0.8125rem", color: P.fg, fontWeight: 600, textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ActionBtn: React.FC<{
  label: string;
  icon: React.ReactElement;
  color: string;
  faint: string;
  border: string;
  shadow?: string;
  gradient?: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}> = ({ label, icon, color, faint, border, shadow, gradient, primary = false, disabled = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full transition-all active:scale-[0.97]"
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "13px 16px", borderRadius: 16,
      background: primary && gradient ? gradient : faint,
      border: `1px solid ${primary ? "rgba(255,255,255,0.12)" : border}`,
      boxShadow: shadow ?? "none",
      color: primary ? "white" : color,
      fontSize: "0.875rem", fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.55 : 1,
      textAlign: "left",
    }}
  >
    <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
    <span>{label}</span>
  </button>
);

export default ProfileCard;
