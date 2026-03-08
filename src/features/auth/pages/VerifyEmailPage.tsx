import { useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonInput,
  IonItem,
  IonButton,
  IonText,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import * as authApi from "../data/auth.api";
import * as userApi from "../../users/data/users.api";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import { mapUserMeToSessionUser } from "../../users/data/users.mappers";

const VerifyEmailPage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((s) => s.user);
  const accessToken = useSessionStore((s) => s.accessToken);

  const [code, setCode] = useState("");
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const email = user?.email ?? "";

  const handleResend = async () => {
    if (!email) {
      setError("No encontré el email del usuario autenticado.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoadingResend(true);

    try {
      const res = await authApi.requestEmailVerification({ email });

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude reenviar el código"));
      }

      setSuccess("Te enviamos un nuevo código al correo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reenviar código");
    } finally {
      setLoadingResend(false);
    }
  };

  const handleConfirm = async () => {
    if (!email) {
      setError("No encontré el email del usuario autenticado.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoadingConfirm(true);

    try {
      const res = await authApi.confirmEmailVerification({
        email,
        code: code.trim(),
      });

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "Código inválido o vencido"));
      }

      const meRes = await userApi.getMe();
      if (!meRes.ok) {
        throw new Error(getErrorMessage(meRes.error, "No pude refrescar tu sesión"));
      }

      const mapped = mapUserMeToSessionUser(meRes.data);

      useSessionStore.getState().setAuthedSession({
        user: mapped,
        accessToken: accessToken ?? "",
      });

      if (mapped.profileStatus === "INCOMPLETE") {
        history.replace("/onboarding");
        return;
      }

      history.replace("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar email");
    } finally {
      setLoadingConfirm(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Verificar correo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ maxWidth: 420, margin: "0 auto", paddingTop: 32 }}>
          <IonCard>
            <IonCardContent>
              <p>Ingresa el código de 6 dígitos enviado a:</p>
              <strong>{email || "correo no disponible"}</strong>

              <IonItem style={{ marginTop: 16 }}>
                <IonInput
                  label="Código"
                  labelPlacement="stacked"
                  inputmode="numeric"
                  maxlength={6}
                  value={code}
                  onIonInput={(e) =>
                    setCode((e.detail.value ?? "").replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                />
              </IonItem>

              {error && (
                <IonText color="danger">
                  <p style={{ marginTop: 12 }}>{error}</p>
                </IonText>
              )}

              {success && (
                <IonText color="success">
                  <p style={{ marginTop: 12 }}>{success}</p>
                </IonText>
              )}

              <IonButton
                expand="block"
                style={{ marginTop: 20 }}
                onClick={handleConfirm}
                disabled={loadingConfirm || code.trim().length !== 6}
              >
                {loadingConfirm ? "Verificando..." : "Verificar correo"}
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                style={{ marginTop: 12 }}
                onClick={handleResend}
                disabled={loadingResend}
              >
                {loadingResend ? "Reenviando..." : "Reenviar código"}
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VerifyEmailPage;