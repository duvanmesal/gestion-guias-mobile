import { IonPage, IonContent } from "@ionic/react";
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
    <IonPage className="premium-page">
      <IonContent scrollY={false}>
        <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "var(--color-bg-base)" }}>
          {/* Animated floating orbs */}
          <div
            className="orb orb-primary animate-float-orb"
            style={{
              width: 320,
              height: 320,
              top: "-8%",
              left: "-12%",
              opacity: 0.5,
            }}
          />
          <div
            className="orb orb-accent animate-float-orb-delayed"
            style={{
              width: 260,
              height: 260,
              bottom: "8%",
              right: "-8%",
              opacity: 0.4,
            }}
          />
          <div
            className="orb orb-primary"
            style={{
              width: 180,
              height: 180,
              top: "45%",
              left: "65%",
              opacity: 0.25,
              animation: "float-orb 18s ease-in-out infinite",
              animationDelay: "-5s",
            }}
          />

          {/* Main content */}
          <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-10 safe-area-inset animate-fade-up">
            {/* Hero Section */}
            <div className="mb-6 text-center">
              {/* Logo/Icon */}
              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, #1a6b42 100%)",
                  boxShadow: "0 4px 16px var(--color-primary-glow), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <svg
                  className="h-7 w-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h1 className="mb-1 text-2xl font-bold tracking-tight text-balance" style={{ color: "var(--color-fg-primary)" }}>
                Bienvenido
              </h1>
              <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
                Accede a tu cuenta de forma segura
              </p>
            </div>

            {/* Glass Card Form Container */}
            <div className="glass-card-elevated w-full max-w-[360px] p-5">
              <LoginForm
                onSubmit={handleSubmit}
                isLoading={login.isPending}
                error={login.error?.message ?? null}
                notice={authNotice}
              />
            </div>

            {/* Trust badge */}
            <div className="mt-5 flex items-center gap-1.5 trust-badge">
              <svg
                className="trust-badge-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Conexión segura</span>
            </div>

            {/* Footer */}
            <p className="mt-3 text-center text-xs" style={{ color: "var(--color-fg-muted)" }}>
              Gestión de Guías
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
