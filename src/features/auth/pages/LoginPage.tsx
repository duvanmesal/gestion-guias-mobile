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
    <IonPage>
      <IonContent scrollY={false}>
        {/* Full-screen premium container */}
        <div className="relative min-h-screen w-full overflow-hidden bg-[#0F1419]">
          {/* Animated floating orbs */}
          <div
            className="pointer-events-none absolute top-[-10%] left-[-15%] h-[340px] w-[340px] rounded-full opacity-50 blur-[100px]"
            style={{
              background: "radial-gradient(circle, #228B54 0%, transparent 70%)",
              animation: "floatOrb1 12s ease-in-out infinite",
            }}
          />
          <div
            className="pointer-events-none absolute right-[-10%] bottom-[10%] h-[280px] w-[280px] rounded-full opacity-40 blur-[90px]"
            style={{
              background: "radial-gradient(circle, #BF9B30 0%, transparent 70%)",
              animation: "floatOrb2 14s ease-in-out infinite",
            }}
          />
          <div
            className="pointer-events-none absolute top-[40%] left-[60%] h-[200px] w-[200px] rounded-full opacity-30 blur-[80px]"
            style={{
              background: "radial-gradient(circle, #228B54 0%, transparent 70%)",
              animation: "floatOrb3 10s ease-in-out infinite",
            }}
          />

          {/* Main content */}
          <div
            className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12"
            style={{ animation: "fadeSlideUp 0.6s ease-out" }}
          >
            {/* Hero Section */}
            <div className="mb-8 text-center">
              {/* Logo/Icon */}
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
                style={{
                  background: "linear-gradient(135deg, #228B54 0%, #1a6b42 100%)",
                  boxShadow: "0 8px 32px rgba(34, 139, 84, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h1
                className="mb-2 text-3xl font-bold tracking-tight"
                style={{ color: "#F5F7FA" }}
              >
                Bienvenido
              </h1>
              <p className="text-base" style={{ color: "#8A939D" }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Glass Card Form Container */}
            <div
              className="w-full max-w-[380px] rounded-3xl p-6"
              style={{
                background: "linear-gradient(145deg, rgba(25, 32, 40, 0.95) 0%, rgba(15, 20, 25, 0.9) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              <LoginForm
                onSubmit={handleSubmit}
                isLoading={login.isPending}
                error={login.error?.message ?? null}
                notice={authNotice}
              />
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm" style={{ color: "#5A6570" }}>
              Gestión de Guías
            </p>
          </div>
        </div>

        {/* Keyframe animations */}
        <style>{`
          @keyframes floatOrb1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -20px) scale(1.05); }
            66% { transform: translate(-20px, 20px) scale(0.95); }
          }
          @keyframes floatOrb2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-25px, 15px) scale(1.1); }
            66% { transform: translate(15px, -25px) scale(0.9); }
          }
          @keyframes floatOrb3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, 30px) scale(1.08); }
          }
          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
