import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import LoginForm from "../components/LoginForm";
import { useSessionStore } from "../../../core/auth/sessionStore";

const AnchorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 26, height: 26 }}
  >
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="8" x2="12" y2="22" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 12, height: 12 }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LoginPage: React.FC = () => {
  const history = useHistory();
  const login = useLogin();
  const authNotice = useSessionStore((s) => s.authNotice);
  const clearAuthNotice = useSessionStore((s) => s.clearAuthNotice);

  const handleSubmit = (values: { email: string; password: string }) => {
    clearAuthNotice();
    login.mutate(values, {
      onSuccess: ({ emailVerified, profileStatus }) => {
        if (!emailVerified) { history.replace("/verify-email"); return; }
        if (profileStatus === "INCOMPLETE") { history.replace("/onboarding"); return; }
        history.replace("/");
      },
    });
  };

  return (
    <IonPage>
      <IonContent scrollY={true} fullscreen>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            background: "var(--color-bg-base)",
          }}
        >
          {/* Brand block */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "0 24px 32px",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnchorIcon />
            </div>

            <div style={{ textAlign: "center" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "var(--text-display)",
                  fontWeight: 700,
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--color-fg-primary)",
                  lineHeight: "var(--leading-tight)",
                }}
              >
                Gestión de Guías
              </h1>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "var(--text-eyebrow)",
                  fontWeight: 600,
                  color: "var(--color-fg-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-eyebrow)",
                }}
              >
                Operaciones Portuarias · Cartagena
              </p>
            </div>
          </div>

          {/* Form card */}
          <div style={{ padding: "0 20px 32px" }}>
            <div
              className="surface-card"
              style={{
                padding: "24px 20px 20px",
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "var(--text-subhead)",
                    fontWeight: 600,
                    letterSpacing: "var(--tracking-tight)",
                    color: "var(--color-fg-primary)",
                  }}
                >
                  Iniciar sesión
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "var(--text-caption)",
                    color: "var(--color-fg-muted)",
                    lineHeight: "var(--leading-base)",
                  }}
                >
                  Ingresa tus credenciales para continuar.
                </p>
              </div>

              <LoginForm
                onSubmit={handleSubmit}
                isLoading={login.isPending}
                error={login.error?.message ?? null}
                notice={authNotice}
              />
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                color: "var(--color-fg-muted)",
              }}
            >
              <ShieldIcon />
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--text-eyebrow)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                Conexión segura · Acceso por invitación
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
