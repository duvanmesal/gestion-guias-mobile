import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import OnboardingForm, { type OnboardingFormValues } from "../components/OnboardingForm";
import { useCompleteProfile } from "../hooks/useCompleteProfile";
import { finalizeClientLogout } from "../../../core/auth/sessionLifecycle";

const OnboardingPage: React.FC = () => {
  const history = useHistory();
  const completeProfile = useCompleteProfile();

  const isLoading = completeProfile.isPending;
  const error = completeProfile.error?.message ?? null;

  const handleSubmit = async (values: OnboardingFormValues) => {
    try {
      await completeProfile.mutateAsync({
        nombres: values.nombres,
        apellidos: values.apellidos,
        telefono: values.telefono,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      await finalizeClientLogout({
        notice: {
          kind: "success",
          message: "Perfil activado. Inicia sesión con tu nueva contraseña.",
        },
      });
      history.replace("/login");
    } catch {
      // Errors are exposed by hooks
    }
  };

  return (
    <IonPage className="premium-page">
      <IonContent scrollY={true}>
        <div className="min-h-screen" style={{ background: "var(--color-bg-base)" }}>
          <div className="flex flex-col items-center justify-center min-h-screen px-5 py-10 safe-area-inset">
            <OnboardingForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;
