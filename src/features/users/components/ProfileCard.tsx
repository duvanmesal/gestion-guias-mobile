import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButton, IonText, IonItem, IonLabel } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import { tokenService } from "../../../core/auth/tokenService";
import * as authApi from "../../auth/data/auth.api";
import type { SessionUser } from "../../../core/auth/types";

interface ProfileCardProps {
  user: SessionUser;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const history = useHistory();
  const hardLogout = useSessionStore((s) => s.hardLogout);

  const handleLogout = async () => {
    await authApi.logout();
    hardLogout();
    await tokenService.clearRefreshToken();
    history.replace("/login");
  };

  const handleLogoutAll = async () => {
    await authApi.logoutAll();
    hardLogout();
    await tokenService.clearRefreshToken();
    history.replace("/login");
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{user.nombre || "Sin nombre"}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonItem lines="none">
          <IonLabel>
            <IonText><p><strong>Email:</strong> {user.email || "N/A"}</p></IonText>
            <IonText><p><strong>Rol:</strong> {user.role}</p></IonText>
            <IonText><p><strong>Estado perfil:</strong> {user.profileStatus}</p></IonText>
          </IonLabel>
        </IonItem>

        <IonButton expand="block" color="medium" onClick={handleLogout} style={{ marginTop: 16 }}>
          Cerrar Sesion
        </IonButton>
        <IonButton expand="block" color="danger" onClick={handleLogoutAll} style={{ marginTop: 8 }}>
          Cerrar Todas las Sesiones
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
};

export default ProfileCard;
