import { useState } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonText,
  IonItem,
  IonLabel,
  IonAlert,
  IonChip,
  IonList,
} from "@ionic/react";
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

interface ProfileCardProps {
  user: SessionUser;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--ion-color-medium)",
  marginBottom: 4,
};

const valueStyle: React.CSSProperties = {
  fontSize: 15,
  color: "var(--ion-color-dark)",
};

const chipWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
};

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

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>{fullName}</IonCardTitle>

          <div style={chipWrapStyle}>
            <IonChip color="primary">{roleLabel}</IonChip>
            <IonChip color={user.emailVerifiedAt ? "success" : "warning"}>
              {verificationLabel}
            </IonChip>
            <IonChip
              color={user.profileStatus === "COMPLETE" ? "success" : "warning"}
            >
              Perfil {profileStatusLabel}
            </IonChip>
            {typeof user.activo === "boolean" && (
              <IonChip color={user.activo ? "success" : "medium"}>
                {user.activo ? "Activo" : "Inactivo"}
              </IonChip>
            )}
          </div>
        </IonCardHeader>

        <IonCardContent>
          <IonList inset={false} lines="full">
            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Nombres</div>
                <div style={valueStyle}>{user.nombres || "No registrado"}</div>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Apellidos</div>
                <div style={valueStyle}>{user.apellidos || "No registrado"}</div>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Email</div>
                <div style={valueStyle}>{user.email || "No registrado"}</div>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Teléfono</div>
                <div style={valueStyle}>{user.telefono || "No registrado"}</div>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Tipo de documento</div>
                <div style={valueStyle}>{documentTypeLabel}</div>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Número de documento</div>
                <div style={valueStyle}>{documentNumberMasked}</div>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Rol</div>
                <div style={valueStyle}>{roleLabel}</div>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Estado de verificación</div>
                <div style={valueStyle}>{verificationLabel}</div>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel>
                <div style={labelStyle}>Estado del perfil</div>
                <div style={valueStyle}>{profileStatusLabel}</div>
              </IonLabel>
            </IonItem>
          </IonList>

          {localError && (
            <IonText color="danger">
              <p style={{ marginTop: 12 }}>{localError}</p>
            </IonText>
          )}

          {onRefresh && (
            <IonButton
              expand="block"
              fill="outline"
              onClick={onRefresh}
              disabled={isRefreshing || busy !== null}
              style={{ marginTop: 16 }}
            >
              {isRefreshing ? "Actualizando..." : "Actualizar datos"}
            </IonButton>
          )}

          <IonButton
            expand="block"
            color="medium"
            onClick={handleLogout}
            disabled={busy !== null || isRefreshing}
            style={{ marginTop: 16 }}
          >
            {busy === "logout" ? "Cerrando sesión..." : "Cerrar sesión"}
          </IonButton>

          <IonButton
            expand="block"
            color="danger"
            onClick={() => setLogoutAllOpen(true)}
            disabled={busy !== null || isRefreshing}
            style={{ marginTop: 8 }}
          >
            {busy === "logoutAll"
              ? "Cerrando todas las sesiones..."
              : "Cerrar todas las sesiones"}
          </IonButton>
        </IonCardContent>
      </IonCard>

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