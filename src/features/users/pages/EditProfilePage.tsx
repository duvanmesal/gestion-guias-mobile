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

  const initials = user
    ? `${user.nombres?.[0] ?? ""}${user.apellidos?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div
          style={{
            minHeight: "100vh",
            background: "var(--color-bg-base)",
            paddingBottom: 40,
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              padding: "52px 20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            {/* Back button */}
            <button
              type="button"
              onClick={goToProfile}
              aria-label="Volver al perfil"
              style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "1px solid var(--color-glass-medium)",
                background: "var(--color-bg-elevated)",
                boxShadow: "var(--shadow-neu-raised)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-fg-primary)",
                cursor: "pointer",
                transition: "transform 0.1s",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.93)"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Avatar circle */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "var(--shadow-glow-primary)",
              }}
            >
              <span
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.03em",
                }}
              >
                {initials}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--color-fg-primary)",
                  lineHeight: 1.2,
                }}
              >
                Editar perfil
              </h1>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.75rem",
                  color: "var(--color-fg-muted)",
                }}
              >
                {user ? `${user.nombres} ${user.apellidos}` : "Actualiza tus datos"}
              </p>
            </div>
          </div>

          {/* ── Content ── */}
          <div style={{ padding: "0 16px" }}>
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
                style={{
                  background: "var(--color-bg-elevated)",
                  borderRadius: 20,
                  border: "1px solid var(--color-glass-medium)",
                  boxShadow: "var(--shadow-neu-raised)",
                  padding: "32px 20px",
                  textAlign: "center",
                }}
              >
                <svg
                  style={{ width: 40, height: 40, color: "var(--color-fg-muted)", margin: "0 auto 12px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p style={{ fontSize: "0.875rem", color: "var(--color-fg-secondary)", margin: "0 0 16px" }}>
                  No pude cargar la informacion del perfil.
                </p>
                <button
                  type="button"
                  onClick={goToProfile}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    cursor: "pointer",
                  }}
                >
                  Volver al perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EditProfilePage;
