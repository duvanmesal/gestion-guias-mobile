import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import OnboardingForm, { type OnboardingFormValues } from "../components/OnboardingForm";
import { useCompleteProfile } from "../hooks/useCompleteProfile";
import { useChangePassword } from "../../auth/hooks/useChangePassword";

const OnboardingPage: React.FC = () => {
  const history = useHistory();
  const completeProfile = useCompleteProfile();
  const changePassword = useChangePassword();

  const isLoading = completeProfile.isPending || changePassword.isPending;
  const error = completeProfile.error?.message ?? changePassword.error?.message ?? null;

  const handleSubmit = async (values: OnboardingFormValues) => {
    try {
      await completeProfile.mutateAsync({
        nombres: values.nombres,
        apellidos: values.apellidos,
        telefono: values.telefono,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
      });

      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      history.replace("/");
    } catch {
      // Errors are exposed by hooks
    }
  };

  return (
    <IonPage className="premium-page">
      <IonContent scrollY={true}>
        <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--color-bg-base)" }}>
          {/* Subtle floating orbs */}
          <div
            className="orb orb-primary animate-float-orb"
            style={{ width: 220, height: 220, top: "-5%", right: "-8%", opacity: 0.4 }}
          />
          <div
            className="orb orb-accent animate-float-orb-delayed"
            style={{ width: 160, height: 160, bottom: "10%", left: "-6%", opacity: 0.3 }}
          />

          {/* Main content - centered both ways */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-10 safe-area-inset">
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
