import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from "@ionic/react";
import { useHistory } from "react-router-dom";
import OnboardingForm, {
  type OnboardingFormValues,
} from "../components/OnboardingForm";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useChangePassword } from "../../auth/hooks/useChangePassword";

const OnboardingPage: React.FC = () => {
  const history = useHistory();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const isLoading = updateProfile.isPending || changePassword.isPending;
  const error =
    updateProfile.error?.message ??
    changePassword.error?.message ??
    null;

  const handleSubmit = async (values: OnboardingFormValues) => {
    try {
      await updateProfile.mutateAsync({
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
      // Los errores ya los exponen los hooks
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Completar Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ maxWidth: 420, margin: "0 auto", paddingTop: 32 }}>
          <OnboardingForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;