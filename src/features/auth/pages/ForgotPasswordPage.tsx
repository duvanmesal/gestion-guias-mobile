import { useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { Button } from "../../../ui/components";
import * as authApi from "../data/auth.api";

/* ── Icons ── */
const BackArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: "var(--color-fg-primary)" }}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const MailOpenIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
    <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
  </svg>
);

const MailIcon = ({ active }: { active: boolean }) => (
  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
    style={{ color: active ? "var(--color-primary)" : "var(--color-fg-muted)", transition: "color 150ms" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CheckSuccessIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const SendIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
);

const ForgotPasswordPage: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) return;
    setError(null);
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setIsSubmitted(true);
    } catch {
      setError("No pudimos enviar la solicitud. Intenta de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent scrollY={false} fullscreen>
        <div className="relative min-h-screen w-full overflow-hidden flex flex-col"
          style={{ background: "var(--color-bg-base)" }}>

          {/* Background orb */}
          <div className="orb orb-primary animate-float-orb"
            style={{ width: 340, height: 340, top: "-12%", left: "50%", transform: "translateX(-50%)", opacity: 0.45 }} />

          <div className="relative z-10 flex flex-1 flex-col items-center px-5 pt-14 pb-8 safe-area-inset">

            {/* Back button */}
            <div className="w-full max-w-[380px] flex items-center gap-2.5 mb-8 animate-fade-up">
              <button
                onClick={() => history.replace("/login")}
                className="flex h-10 w-10 items-center justify-center rounded-[14px] transition-all active:scale-95"
                style={{ background: "var(--color-bg-glass)", border: "1px solid var(--color-border-glow)" }}
              >
                <BackArrow />
              </button>
              <span className="text-[13px] font-semibold" style={{ color: "var(--color-fg-muted)" }}>
                Volver al inicio de sesión
              </span>
            </div>

            {isSubmitted ? (
              /* ── Success state ── */
              <div className="w-full max-w-[380px] animate-fade-up">
                <div className="auth-card px-6 pt-8 pb-7 flex flex-col items-center text-center gap-6">
                  <div className="relative">
                    <div className="logo-glow-ring" style={{ inset: "-10px" }} />
                    <div className="relative flex h-[84px] w-[84px] items-center justify-center rounded-[26px]"
                      style={{
                        background: "var(--gradient-primary)",
                        boxShadow: "0 10px 30px var(--color-primary-glow)",
                      }}>
                      <CheckSuccessIcon />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold" style={{ color: "var(--color-fg-primary)" }}>
                      ¡Enlace enviado!
                    </h2>
                    <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--color-fg-muted)" }}>
                      Si el correo existe en nuestro sistema, recibirás las instrucciones en los próximos minutos. Revisa también tu carpeta de spam.
                    </p>
                  </div>
                  <Button variant="primary" size="lg" onClick={() => history.replace("/login")}>
                    Volver al inicio de sesión
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                {/* Icon + heading */}
                <div className="flex flex-col items-center text-center gap-4 mb-8 animate-fade-up">
                  <div className="relative">
                    <div className="logo-glow-ring" />
                    <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[24px]"
                      style={{
                        background: "var(--gradient-primary)",
                        boxShadow: "0 8px 28px var(--color-primary-glow), inset 0 1px 0 rgba(255,255,255,0.2)",
                      }}>
                      <MailOpenIcon />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-[26px] font-extrabold leading-tight"
                      style={{ color: "var(--color-fg-primary)" }}>
                      ¿Olvidaste tu contraseña?
                    </h1>
                    <p className="mt-2 text-[13px] leading-relaxed max-w-[300px]"
                      style={{ color: "var(--color-fg-muted)" }}>
                      Ingresa tu correo y te enviaremos un enlace para restablecerla.
                    </p>
                  </div>
                </div>

                {/* Form card */}
                <div className="auth-card w-full max-w-[380px] px-6 pt-6 pb-6 animate-fade-up delay-100">
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {error && (
                      <div className="alert-base alert-error animate-shake">
                        <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
                          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="form-label" style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <div className="input-icon-left">
                          <MailIcon active={!!email} />
                        </div>
                        <input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          autoComplete="email"
                          autoFocus
                          className="premium-input with-icon-left"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <p className="form-hint">Recibirás el enlace en los próximos minutos.</p>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      disabled={!isValidEmail}
                      loadingText="Enviando enlace..."
                      rightIcon={!isLoading ? <SendIcon /> : undefined}
                    >
                      Enviar enlace de recuperación
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ForgotPasswordPage;
