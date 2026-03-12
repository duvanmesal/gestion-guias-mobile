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
          {/* Floating orbs */}
          <div
            className="orb orb-primary animate-float-orb"
            style={{ width: 260, height: 260, top: "-6%", right: "-12%" }}
          />
          <div
            className="orb orb-accent animate-float-orb-delayed"
            style={{ width: 200, height: 200, bottom: "8%", left: "-8%" }}
          />
          <div
            className="orb orb-primary"
            style={{
              width: 120,
              height: 120,
              top: "45%",
              left: "8%",
              opacity: 0.35,
              animation: "float-orb 14s ease-in-out infinite",
              animationDelay: "-4s",
            }}
          />

          {/* Main content */}
          <div className="relative z-10 flex flex-col min-h-screen px-6 py-8 safe-area-inset">
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
