import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import EditProfileForm, {
  type EditProfileFormValues,
} from "../components/EditProfileForm";
import { useMyAccount } from "../hooks/useMyAccount";
import { useUpdateMe } from "../hooks/useUpdateMe";

const EditProfilePage: React.FC = () => {
  const history = useHistory();
  const storeUser = useSessionStore((s) => s.user);
  const { data, error } = useMyAccount();
  const updateMe = useUpdateMe();

  const user = data ?? storeUser;

  const goToProfile = () => {
    history.replace("/profile");
  };

  const handleSubmit = async (values: EditProfileFormValues) => {
    try {
      await updateMe.mutateAsync({
        nombres: values.nombres,
        apellidos: values.apellidos,
        telefono: values.telefono,
      });

      goToProfile();
    } catch {
      // El error ya se muestra desde el hook
    }
  };

  return (
    <IonPage className="premium-page">
      <IonContent scrollY={true}>
        <div
          className="relative min-h-screen overflow-hidden"
          style={{ background: "var(--color-bg-base)" }}
        >
          <div
            className="orb orb-primary animate-float-orb"
            style={{ width: 260, height: 260, top: "-8%", right: "-12%" }}
          />
          <div
            className="orb orb-accent animate-float-orb-delayed"
            style={{ width: 180, height: 180, bottom: "8%", left: "-8%" }}
          />

          <div className="relative z-10 flex min-h-screen flex-col px-6 py-8 safe-area-inset">
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={goToProfile}
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "var(--color-fg-primary)",
                }}
                aria-label="Volver al perfil"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-fg-primary)" }}
                >
                  Editar perfil
                </h1>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  Actualiza tus datos básicos
                </p>
              </div>
            </div>

            {user ? (
              <EditProfileForm
                initialValues={{
                  nombres: user.nombres,
                  apellidos: user.apellidos,
                  telefono: user.telefono,
                }}
                onSubmit={handleSubmit}
                onCancel={goToProfile}
                isLoading={updateMe.isPending}
                error={
                  updateMe.error?.message ??
                  (error instanceof Error ? error.message : null)
                }
              />
            ) : (
              <div
                className="glass-card p-6 text-sm"
                style={{ color: "var(--color-fg-muted)" }}
              >
                No pude cargar la información del perfil.
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EditProfilePage;