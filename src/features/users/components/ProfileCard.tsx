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
import Button from "../../../ui/components/Button";

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
        setLocalError("Debes ingresar tu contraseña actual.");
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

  const StatusChip = ({
    label,
    variant,
  }: {
    label: string;
    variant: "success" | "warning" | "primary" | "neutral";
  }) => {
    const chipClass = `status-chip status-chip-${variant}`;
    return <span className={chipClass}>{label}</span>;
  };

  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon: React.ReactNode;
  }) => (
    <div className="info-row">
      <div className="info-row-icon">{icon}</div>
      <div className="info-row-content">
        <p className="info-row-label">{label}</p>
        <p className="info-row-value">{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="glass-card p-4 mb-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="profile-avatar">{fullName.charAt(0).toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <h2 className="profile-name">{fullName}</h2>
            <p className="profile-email">{user.email || "Sin correo registrado"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusChip label={roleLabel} variant="primary" />
          <StatusChip
            label={verificationLabel}
            variant={user.emailVerifiedAt ? "success" : "warning"}
          />
          <StatusChip
            label={`Perfil ${profileStatusLabel}`}
            variant={user.profileStatus === "COMPLETE" ? "success" : "warning"}
          />
          {typeof user.activo === "boolean" && (
            <StatusChip
              label={user.activo ? "Activo" : "Inactivo"}
              variant={user.activo ? "success" : "neutral"}
            />
          )}
        </div>
      </div>

      <div className="glass-card p-4 mb-3">
        <h3 className="section-title">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Información Personal
        </h3>

        <div className="space-y-2">
          <InfoRow
            label="Nombres"
            value={user.nombres || "No registrado"}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <InfoRow
            label="Apellidos"
            value={user.apellidos || "No registrado"}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <InfoRow
            label="Tipo de Documento"
            value={documentTypeLabel}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            }
          />
          <InfoRow
            label="Número de Documento"
            value={documentNumberMasked}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
            }
          />
        </div>
      </div>

      <div className="glass-card p-4 mb-3">
        <h3 className="section-title">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Información de Contacto
        </h3>

        <div className="space-y-2">
          <InfoRow
            label="Correo Electrónico"
            value={user.email || "No registrado"}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />
          <InfoRow
            label="Teléfono"
            value={user.telefono || "No registrado"}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            }
          />
        </div>
      </div>

      <div className="glass-card p-4 mb-3">
        <h3 className="section-title">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Estado de la Cuenta
        </h3>

        <div className="space-y-2">
          <InfoRow
            label="Rol"
            value={roleLabel}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            }
          />
          <InfoRow
            label="Estado de Verificación"
            value={verificationLabel}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <InfoRow
            label="Estado del Perfil"
            value={profileStatusLabel}
            icon={
              <svg
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            }
          />
        </div>
      </div>

      {localError && (
        <div className="alert-error mb-3 flex items-center gap-2 animate-shake">
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium">{localError}</span>
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="section-title">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          Acciones
        </h3>

        <div className="space-y-2">
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

          {onRefresh && (
            <Button
              variant="secondary"
              size="md"
              onClick={onRefresh}
              disabled={isRefreshing || busy !== null}
              isLoading={isRefreshing}
              leftIcon={
                !isRefreshing && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                )
              }
            >
              {isRefreshing ? "Recargando..." : "Recargar información"}
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={handleLogout}
            disabled={busy !== null || isRefreshing}
            isLoading={busy === "logout"}
            leftIcon={
              busy !== "logout" && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              )
            }
          >
            {busy === "logout" ? "Cerrando sesión..." : "Cerrar sesión"}
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={() => setLogoutAllOpen(true)}
            disabled={busy !== null || isRefreshing}
            isLoading={busy === "logoutAll"}
            leftIcon={
              busy !== "logoutAll" && (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )
            }
          >
            {busy === "logoutAll" ? "Cerrando todas..." : "Cerrar todas las sesiones"}
          </Button>
        </div>
      </div>

      <IonAlert
        isOpen={logoutAllOpen}
        onDidDismiss={() => setLogoutAllOpen(false)}
        header="Cerrar todas las sesiones"
        message="Ingresa tu contraseña actual para cerrar sesión en todos tus dispositivos."
        inputs={[
          {
            name: "password",
            type: "password",
            placeholder: "Contraseña actual",
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

export default ProfileCard;
