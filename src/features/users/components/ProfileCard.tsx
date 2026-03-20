import { useState } from "react";
import { IonAlert } from "@ionic/react";
import { useHistory } from "react-router-dom";
import type { SessionUser } from "../../../core/auth/types";
import {
  logoutCurrentSession,
  logoutAllSessions,
} from "../../../core/auth/sessionLifecycle";
import {
  buildFullName,
  getDocumentTypeLabel,
  getProfileStatusLabel,
  getRoleLabel,
  getVerificationLabel,
  maskDocumentNumber,
} from "../utils/accountFormatters";
import {
  Button,
  InfoBanner,
  PageSectionHeader,
  StatusChip as SharedStatusChip,
  SurfaceCard,
  WarningBanner,
} from "../../../ui/components";

interface ProfileCardProps {
  user: SessionUser;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  isRefreshing = false,
  onRefresh,
}) => {
  const history = useHistory();

  const [busy, setBusy] = useState<null | "logout" | "logoutAll">(null);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fullName = buildFullName(user);
  const roleLabel = getRoleLabel(user.role);
  const verificationLabel = getVerificationLabel(user);
  const profileStatusLabel = getProfileStatusLabel(user.profileStatus);
  const documentTypeLabel = getDocumentTypeLabel(user.documentType);
  const documentNumberMasked = maskDocumentNumber(user.documentNumber);

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

  const handleConfirmLogoutAll = async (password: string) => {
    setLocalError(null);
    setBusy("logoutAll");

    try {
      if (!password.trim()) {
        setLocalError("Debes ingresar tu contrasena actual.");
        return;
      }

      await logoutAllSessions({ password: password.trim() });
      history.replace("/login");
    } catch (error) {
      setLocalError(
        error instanceof Error
          ? error.message
          : "No pude cerrar todas las sesiones."
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <NeuCard className="mb-3 p-4 animate-fade-up">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold"
            style={{
              background: "var(--color-primary)",
              color: "white",
              boxShadow: "0 4px 12px rgba(34,139,84,0.3)",
            }}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-[var(--color-fg-primary)] truncate">
              {fullName}
            </h2>
            <p className="text-sm text-[var(--color-fg-secondary)] truncate">
              {user.email || "Sin correo registrado"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <SharedStatusChip tone="primary">{roleLabel}</SharedStatusChip>
          <SharedStatusChip tone={user.emailVerifiedAt ? "success" : "neutral"}>
            {verificationLabel}
          </SharedStatusChip>
          <SharedStatusChip
            tone={user.profileStatus === "COMPLETE" ? "success" : "neutral"}
          >
            {profileStatusLabel}
          </SharedStatusChip>
          {typeof user.activo === "boolean" ? (
            <SharedStatusChip tone={user.activo ? "success" : "neutral"}>
              {user.activo ? "Activo" : "Inactivo"}
            </SharedStatusChip>
          ) : null}
        </div>
      </NeuCard>

      {isRefreshing ? (
        <InfoBanner
          className="mb-3 animate-fade-up"
          description="Estamos trayendo los cambios mas recientes de tu cuenta."
          eyebrow="Perfil"
          title="Actualizando informacion"
        />
      ) : null}

      <NeuCard className="mb-3 p-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
        <PageSectionHeader
          title="Informacion Personal"
          action={
            <span style={{ color: "var(--color-primary)" }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
          }
        />

        <div className="mt-3 space-y-2">
          <InfoRow label="Nombres" value={user.nombres || "No registrado"} />
          <InfoRow label="Apellidos" value={user.apellidos || "No registrado"} />
          <InfoRow label="Documento" value={documentTypeLabel} />
          <InfoRow label="Numero" value={documentNumberMasked} />
        </div>
      </NeuCard>

      <NeuCard className="mb-3 p-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <PageSectionHeader
          title="Contacto"
          action={
            <span style={{ color: "var(--color-primary)" }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
          }
        />

        <div className="mt-3 space-y-2">
          <InfoRow label="Correo" value={user.email || "No registrado"} />
          <InfoRow label="Telefono" value={user.telefono || "No registrado"} />
        </div>
      </NeuCard>

      <NeuCard className="mb-3 p-4 animate-fade-up" style={{ animationDelay: "150ms" }}>
        <PageSectionHeader
          title="Estado de Cuenta"
          action={
            <span style={{ color: "var(--color-primary)" }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </span>
          }
        />

        <div className="mt-3 space-y-2">
          <InfoRow label="Rol" value={roleLabel} />
          <InfoRow label="Verificacion" value={verificationLabel} />
          <InfoRow label="Perfil" value={profileStatusLabel} />
        </div>
      </NeuCard>

      {localError ? (
        <WarningBanner
          className="mb-3 animate-shake"
          description={localError}
          eyebrow="Cuenta"
          title="No pude completar la accion"
        />
      ) : null}

      <NeuCard className="p-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <PageSectionHeader
          title="Acciones"
          action={
            <span style={{ color: "var(--color-primary)" }}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </span>
          }
        />

        <div className="mt-3 space-y-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => history.push("/profile/edit")}
            disabled={busy !== null || isRefreshing}
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            }
          >
            Editar mis datos
          </Button>

          {onRefresh ? (
            <Button
              variant="secondary"
              size="md"
              onClick={onRefresh}
              disabled={isRefreshing || busy !== null}
              isLoading={isRefreshing}
              leftIcon={
                !isRefreshing ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                ) : undefined
              }
            >
              {isRefreshing ? "Recargando..." : "Recargar informacion"}
            </Button>
          ) : null}

          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            disabled={busy !== null || isRefreshing}
            isLoading={busy === "logout"}
            leftIcon={
              busy !== "logout" ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              ) : undefined
            }
          >
            {busy === "logout" ? "Cerrando sesion..." : "Cerrar sesion"}
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={() => setLogoutAllOpen(true)}
            disabled={busy !== null || isRefreshing}
            isLoading={busy === "logoutAll"}
            leftIcon={
              busy !== "logoutAll" ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : undefined
            }
          >
            {busy === "logoutAll" ? "Cerrando todas..." : "Cerrar todas las sesiones"}
          </Button>
        </div>
      </NeuCard>

      <IonAlert
        isOpen={logoutAllOpen}
        onDidDismiss={() => setLogoutAllOpen(false)}
        header="Cerrar todas las sesiones"
        message="Ingresa tu contrasena actual para cerrar sesion en todos tus dispositivos."
        inputs={[
          {
            name: "password",
            type: "password",
            placeholder: "Contrasena actual",
          },
        ]}
        buttons={[
          {
            text: "Cancelar",
            role: "cancel",
          },
          {
            text: "Confirmar",
            handler: (values) => {
              void handleConfirmLogoutAll(values.password ?? "");
              return false;
            },
          },
        ]}
      />
    </>
  );
};

const NeuCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  style?: React.CSSProperties;
}> = ({ children, className = "", inset = false, style }) => {
  const neuStyles = inset
    ? {
        background: "var(--color-bg-base)",
        boxShadow:
          "inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.02)",
      }
    : {
        background: "linear-gradient(145deg, #161d24, #121920)",
        boxShadow:
          "4px 4px 10px rgba(0,0,0,0.4), -2px -2px 8px rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.03)",
      };

  return (
    <SurfaceCard
      className={`rounded-xl ${className}`.trim()}
      radius="lg"
      style={{ ...neuStyles, ...style }}
      variant="raised"
    >
      {children}
    </SurfaceCard>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <NeuCard className="flex items-center justify-between gap-3 px-3 py-2.5" inset>
    <p className="min-w-0 flex-1 break-words text-xs text-[var(--color-fg-muted)]">
      {label}
    </p>
    <p className="max-w-[60%] break-words text-right text-sm font-medium text-[var(--color-fg-primary)]">
      {value}
    </p>
  </NeuCard>
);

export default ProfileCard;
