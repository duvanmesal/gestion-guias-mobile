import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import LoginForm from "../components/LoginForm";
import { useSessionStore } from "../../../core/auth/sessionStore";

const LoginPage: React.FC = () => {
  const history = useHistory();
  const login = useLogin();

  const authNotice = useSessionStore((s) => s.authNotice);
  const clearAuthNotice = useSessionStore((s) => s.clearAuthNotice);

  const handleSubmit = (values: { email: string; password: string }) => {
    clearAuthNotice();

    login.mutate(values, {
      onSuccess: ({ emailVerified, profileStatus }) => {
        if (!emailVerified) {
          history.replace("/verify-email");
          return;
        }

        if (profileStatus === "INCOMPLETE") {
          history.replace("/onboarding");
          return;
        }

        history.replace("/");
      },
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar Sesión</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: 40 }}>
          <LoginForm
            onSubmit={handleSubmit}
            isLoading={login.isPending}
            error={login.error?.message ?? null}
            notice={authNotice}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;