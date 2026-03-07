import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from "@ionic/react";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ProfileCard from "../components/ProfileCard";

const ProfilePage: React.FC = () => {
  const user = useSessionStore((s) => s.user);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user ? <ProfileCard user={user} /> : null}
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
