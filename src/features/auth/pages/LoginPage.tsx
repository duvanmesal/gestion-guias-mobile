import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import LoginForm from "../components/LoginForm";
import { useSessionStore } from "../../../core/auth/sessionStore";

const AnchorIcon = () => (
  <svg
    viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: "46%", height: "46%" }}
  >
    <circle cx="12" cy="5" r="3" />
    <line x1="12" y1="8" x2="12" y2="22" />
    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: "var(--color-primary)", flexShrink: 0 }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
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
          className="relative min-h-screen w-full flex flex-col"
          style={{ background: "var(--color-bg-base)" }}
        >

          {/* ── Decorative aurora backgrounds ── */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 100% 55% at 50% -5%, var(--color-primary-glow) 0%, transparent 65%)",
          }} />
          {/* Subtle amber glow at bottom */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 80% 40% at 50% 105%, var(--color-accent-glow) 0%, transparent 65%)",
          }} />
          {/* Dot grid */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "radial-gradient(circle, var(--color-primary-glow) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }} />
          {/* Floating orbs */}
          <div className="orb animate-float-orb-delayed" style={{
            width: 260, height: 260, bottom: "2%", right: "-8%",
            background: "var(--color-accent-glow)", opacity: 0.22,
          }} />
          <div className="orb animate-float-orb" style={{
            width: 180, height: 180, top: "2%", left: "-8%",
            background: "var(--color-primary-glow)", opacity: 0.18,
          }} />

          {/* ══════════════════════════════════════
              Main content column
          ══════════════════════════════════════ */}
          <div className="relative z-10 login-layout">

            {/* ── Brand identity ── */}
            <div className="login-brand animate-fade-up">

              {/* Logo */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: "var(--login-logo-size)",
                  height: "var(--login-logo-size)",
                }}
              >
                {/* Outermost pulse ring */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  border: "1px solid var(--color-primary-soft)",
                  animation: "pulse-glow 3.5s ease-in-out infinite",
                }} />

                {/* Mid amber accent ring */}
                <div style={{
                  position: "absolute",
                  inset: "var(--login-mid-ring)",
                  borderRadius: "calc(var(--login-icon-radius) + 4px)",
                  border: "1px solid var(--color-accent-glow)",
                }} />

                {/* Blur glow */}
                <div style={{
                  position: "absolute",
                  inset: "var(--login-blur-inset)",
                  borderRadius: "var(--login-icon-radius)",
                  background: "var(--color-primary-glow)",
                  filter: "blur(14px)",
                }} />

                {/* Icon box — violet gradient */}
                <div style={{
                  position: "relative",
                  width: "var(--login-icon-size)",
                  height: "var(--login-icon-size)",
                  borderRadius: "var(--login-icon-radius)",
                  background: "linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 60%, var(--color-primary-dark) 100%)",
                  boxShadow:
                    "0 12px 36px var(--color-primary-glow), inset 0 1px 0 rgba(255,255,255,0.26), inset 0 -1px 0 rgba(0,0,0,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <AnchorIcon />
                </div>
              </div>

              {/* App name */}
              <div className="flex flex-col items-center gap-0.5 text-center">
                <h1
                  className="font-black leading-none"
                  style={{
                    fontSize: "clamp(0.975rem, 3.8vw, 1.375rem)",
                    letterSpacing: "0.02em",
                    color: "var(--color-fg-primary)",
                  }}
                >
                  Gestión de Guías
                </h1>

                <p
                  className="login-tagline"
                  style={{
                    fontSize: "0.575rem",
                    fontWeight: 800,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginTop: 2,
                  }}
                >
                  Operaciones Portuarias
                </p>
              </div>
            </div>

            {/* Divider — only on tall screens */}
            <div
              className="login-divider items-center gap-3 animate-fade-up delay-100"
              style={{ width: "100%", maxWidth: 280 }}
            >
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, var(--color-primary-glow))" }} />
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--color-accent-glow)" }} />
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-primary-glow)" }} />
                <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--color-accent-glow)" }} />
              </div>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, var(--color-primary-glow), transparent)" }} />
            </div>

            {/* ── Login card ── */}
            <div
              className="login-card-wrap animate-fade-up delay-200"
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-primary-glow)",
                borderTopColor: "var(--color-primary-glow)",
                borderRadius: "1.375rem",
                boxShadow:
                  "0 24px 52px rgba(0,0,0,0.05), 0 0 0 1px var(--color-primary-glow), inset 0 1px 0 var(--color-glass-soft)",
              }}
            >
              {/* Card header */}
              <div className="login-card-header">
                <p style={{
                  fontSize: "0.565rem",
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--color-primary)",
                  marginBottom: 5,
                }}>
                  Acceso al sistema
                </p>
                <h2
                  className="font-extrabold leading-tight"
                  style={{
                    fontSize: "clamp(1.25rem, 4.8vw, 1.65rem)",
                    color: "var(--color-fg-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Bienvenido
                </h2>

                <p
                  className="login-card-desc"
                  style={{
                    marginTop: 4,
                    fontSize: "0.78rem",
                    color: "var(--color-fg-muted)",
                    lineHeight: 1.55,
                  }}
                >
                  Ingresa tus credenciales para continuar.
                </p>
              </div>

              {/* Form */}
              <LoginForm
                onSubmit={handleSubmit}
                isLoading={login.isPending}
                error={login.error?.message ?? null}
                notice={authNotice}
              />

              {/* Separator */}
              <div style={{ margin: "14px 0 10px", height: 1, background: "var(--color-primary-glow)" }} />

              {/* Trust row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <ShieldIcon />
                <span style={{ fontSize: "0.65rem", color: "var(--color-fg-disabled)" }}>
                  Conexión segura · Solo por invitación
                </span>
              </div>
            </div>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
