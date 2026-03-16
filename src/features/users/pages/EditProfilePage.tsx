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
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)]">
          <div className="px-6 py-10 animate-fade-up">
            {/* Header with back button */}
            <header className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={goToProfile}
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95"
                style={{
                  background: "linear-gradient(145deg, #161d24, #121920)",
                  boxShadow: "3px 3px 6px rgba(0,0,0,0.35), -2px -2px 5px rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.03)",
                  color: "var(--color-fg-primary)",
                }}
                aria-label="Volver al perfil"
              >
                <svg
                  className="h-4 w-4"
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
                <h1 className="text-xl font-bold text-[var(--color-fg-primary)]">
                  Editar perfil
                </h1>
                <p className="text-xs text-[var(--color-fg-muted)]">
                  Actualiza tus datos basicos
                </p>
              </div>
            </header>

            {/* Form content */}
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
              <NeuCard className="p-5 text-center">
                <svg
                  className="mx-auto h-10 w-10 mb-3"
                  style={{ color: "var(--color-fg-muted)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-[var(--color-fg-secondary)]">
                  No pude cargar la informacion del perfil.
                </p>
                <button
                  type="button"
                  onClick={goToProfile}
                  className="mt-4 text-sm font-medium text-[var(--color-primary)]"
                >
                  Volver al perfil
                </button>
              </NeuCard>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

/* ================================
   NEUMORPHIC COMPONENTS
   ================================ */

const NeuCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`rounded-xl ${className}`}
    style={{
      background: "linear-gradient(145deg, #161d24, #121920)",
      boxShadow: "4px 4px 10px rgba(0,0,0,0.4), -2px -2px 8px rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.03)",
    }}
  >
    {children}
  </div>
);

export default EditProfilePage;
