import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonText,
} from "@ionic/react";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ProfileCard from "../components/ProfileCard";
import { useMyAccount } from "../hooks/useMyAccount";

const ProfilePage: React.FC = () => {
  const storeUser = useSessionStore((s) => s.user);
  const { data, isFetching, refetch, error } = useMyAccount();

  const user = data ?? storeUser;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mi cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ maxWidth: 520, margin: "0 auto", paddingTop: 16 }}>
          <IonText color="medium">
            <p style={{ marginBottom: 16 }}>
              Aquí ves la información actual que la app toma de <strong>user/me</strong>.
            </p>
          </IonText>

          {error && (
            <IonText color="danger">
              <p style={{ marginBottom: 16 }}>
                {error instanceof Error ? error.message : "No pude cargar tu cuenta."}
              </p>
            </IonText>
          )}

          {user ? (
            <ProfileCard
              user={user}
              isRefreshing={isFetching}
              onRefresh={() => {
                void refetch();
              }}
            />
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;