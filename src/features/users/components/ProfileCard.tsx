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
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import type { SessionUser } from "../../../core/auth/types";
import {
  logoutCurrentSession,
  logoutAllSessions,
} from "../../../core/auth/sessionLifecycle";

interface ProfileCardProps {
  user: SessionUser;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const history = useHistory();

  const [busy, setBusy] = useState<null | "logout" | "logoutAll">(null);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
          <IonCardTitle>{user.nombre || "Sin nombre"}</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          <IonItem lines="none">
            <IonLabel>
              <IonText>
                <p><strong>Email:</strong> {user.email || "N/A"}</p>
              </IonText>
              <IonText>
                <p><strong>Rol:</strong> {user.role}</p>
              </IonText>
              <IonText>
                <p><strong>Estado perfil:</strong> {user.profileStatus}</p>
              </IonText>
            </IonLabel>
          </IonItem>

          {localError && (
            <IonText color="danger">
              <p style={{ marginTop: 12 }}>{localError}</p>
            </IonText>
          )}

          <IonButton
            expand="block"
            color="medium"
            onClick={handleLogout}
            disabled={busy !== null}
            style={{ marginTop: 16 }}
          >
            {busy === "logout" ? "Cerrando sesión..." : "Cerrar sesión"}
          </IonButton>

          <IonButton
            expand="block"
            color="danger"
            onClick={() => setLogoutAllOpen(true)}
            disabled={busy !== null}
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