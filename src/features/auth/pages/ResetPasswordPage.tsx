import { useState, useEffect } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { Button } from "../../../ui/components";
import * as authApi from "../data/auth.api";

/* ── Password rules ── */
const RULES = [
  { key: "minLength",  label: "Mínimo 8 caracteres",          test: (p: string) => p.length >= 8 },
  { key: "hasUpper",   label: "Una letra mayúscula",           test: (p: string) => /[A-Z]/.test(p) },
  { key: "hasLower",   label: "Una letra minúscula",           test: (p: string) => /[a-z]/.test(p) },
  { key: "hasNumber",  label: "Al menos un número",            test: (p: string) => /[0-9]/.test(p) },
  { key: "hasSpecial", label: "Un carácter especial (!@#$…)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

/* ── Icons ── */
const BackArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ color: "var(--color-fg-primary)" }}>
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const KeyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const LockIcon = ({ active }: { active: boolean }) => (
  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
    style={{ color: active ? "var(--color-primary)" : "var(--color-fg-muted)", transition: "color 150ms" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="9 11 12 14 22 4" />
  </svg>
);

const CircleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

/* ── Strength label ── */
const strengthLabel = (met: number) => {
  if (met <= 1) return { label: "Muy débil", color: "var(--color-danger)" };
  if (met === 2) return { label: "Débil", color: "var(--color-warning)" };
  if (met === 3) return { label: "Aceptable", color: "var(--color-accent)" };
  if (met === 4) return { label: "Buena", color: "var(--color-success)" };
  return { label: "Fuerte", color: "var(--color-primary)" };
};

const ResetPasswordPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validation = RULES.map((r) => ({ ...r, met: r.test(newPassword) }));
  const metCount = validation.filter((r) => r.met).length;
  const isPasswordValid = validation.every((r) => r.met);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const strength = newPassword.length > 0 ? strengthLabel(metCount) : null;

  useEffect(() => {
    if (!token) setError("Enlace inválido. No se encontró el token de recuperación.");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isPasswordValid || !passwordsMatch) return;
    setError(null);
    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setIsSuccess(true);
    } catch {
      setError("Token inválido o expirado. Por favor, solicita un nuevo enlace.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Invalid token ── */
  if (!token && !isSuccess) {
    return (
      <IonPage>
        <IonContent scrollY={false} fullscreen>
          <div className="relative min-h-screen flex flex-col items-center justify-center px-5"
            style={{ background: "var(--color-bg-base)" }}>
            <div className="auth-card w-full max-w-[380px] px-6 py-10 flex flex-col items-center text-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-[22px]"
                style={{ background: "var(--color-danger-soft)", border: "1px solid var(--color-danger-border)" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: "var(--color-danger)" }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--color-fg-primary)" }}>Enlace Inválido</h2>
                <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--color-fg-muted)" }}>
                  El enlace de recuperación no es válido o ha expirado.
                </p>
              </div>
              <Button variant="primary" size="lg" onClick={() => history.replace("/forgot-password")}>
                Solicitar nuevo enlace
              </Button>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent scrollY fullscreen>
        <div className="relative min-w-full overflow-hidden flex flex-col"
          style={{ background: "var(--color-bg-base)", minHeight: "100%" }}>

          {/* Background orb */}
          <div className="orb orb-primary animate-float-orb"
            style={{ width: 340, height: 340, top: "-12%", left: "50%", transform: "translateX(-50%)", opacity: 0.45 }} />

          <div className="relative z-10 flex flex-1 flex-col items-center px-5 pt-14 pb-10 safe-area-inset">

            {/* Back */}
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

            {isSuccess ? (
              /* ── Success ── */
              <div className="w-full max-w-[380px] animate-fade-up">
                <div className="auth-card px-6 pt-8 pb-7 flex flex-col items-center text-center gap-6">
                  <div className="relative">
                    <div className="logo-glow-ring" style={{ inset: "-10px" }} />
                    <div className="relative flex h-[84px] w-[84px] items-center justify-center rounded-[26px]"
                      style={{ background: "var(--gradient-primary)", boxShadow: "0 10px 30px var(--color-primary-glow)" }}>
                      <ShieldCheckIcon />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold" style={{ color: "var(--color-fg-primary)" }}>
                      ¡Contraseña actualizada!
                    </h2>
                    <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--color-fg-muted)" }}>
                      Tu contraseña ha sido restablecida. Ya puedes iniciar sesión con tu nueva contraseña.
                    </p>
                  </div>
                  <Button variant="primary" size="lg" onClick={() => history.replace("/login")}>
                    Iniciar sesión
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Form ── */
              <>
                {/* Icon + heading */}
                <div className="flex flex-col items-center text-center gap-4 mb-7 animate-fade-up">
                  <div className="relative">
                    <div className="logo-glow-ring" />
                    <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[24px]"
                      style={{ background: "var(--gradient-primary)", boxShadow: "0 8px 28px var(--color-primary-glow), inset 0 1px 0 rgba(255,255,255,0.2)" }}>
                      <KeyIcon />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-[26px] font-extrabold leading-tight" style={{ color: "var(--color-fg-primary)" }}>
                      Nueva contraseña
                    </h1>
                    <p className="mt-2 text-[13px] leading-relaxed max-w-[290px]" style={{ color: "var(--color-fg-muted)" }}>
                      Crea una contraseña segura de al menos 8 caracteres.
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
                        <div className="flex flex-col gap-1">
                          <span>{error}</span>
                          <button type="button" onClick={() => history.replace("/forgot-password")}
                            className="self-start text-[11px] underline underline-offset-2 opacity-80 hover:opacity-100">
                            Solicitar nuevo enlace
                          </button>
                        </div>
                      </div>
                    )}

                    {/* New password */}
                    <div className="space-y-2">
                      <label className="form-label" style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <div className="input-icon-left"><LockIcon active={!!newPassword} /></div>
                        <input
                          type={showNew ? "text" : "password"}
                          placeholder="••••••••"
                          className="premium-input with-icon-left with-icon-right"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="button" className="input-icon-right" onClick={() => setShowNew(!showNew)}>
                          {showNew ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>

                      {/* Strength bar */}
                      {newPassword.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                                style={{ background: i < metCount ? strength!.color : "var(--color-bg-glass-hover)" }} />
                            ))}
                          </div>
                          <p className="text-[11px] font-semibold" style={{ color: strength!.color }}>
                            {strength!.label}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-2">
                      <label className="form-label" style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                        Confirmar contraseña
                      </label>
                      <div className="relative">
                        <div className="input-icon-left"><LockIcon active={!!confirmPassword} /></div>
                        <input
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          className={`premium-input with-icon-left with-icon-right ${confirmPassword.length > 0 && !passwordsMatch ? "error" : ""}`}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}>
                          {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="form-error">Las contraseñas no coinciden</p>
                      )}
                    </div>

                    {/* Rules checklist */}
                    <div className="rounded-xl px-4 py-3.5 space-y-2.5"
                      style={{ background: "var(--color-primary-muted)", border: "1px solid var(--color-primary-soft)" }}>
                      {validation.map((r) => (
                        <div key={r.key} className={`rule-row ${r.met ? "met" : "unmet"}`}>
                          {r.met ? <CheckIcon /> : <CircleIcon />}
                          <span>{r.label}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isLoading}
                      disabled={!isPasswordValid || !passwordsMatch}
                      loadingText="Actualizando..."
                      rightIcon={!isLoading
                        ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 12 2 2 4-4" />
                          </svg>
                        : undefined}
                    >
                      Actualizar contraseña
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

export default ResetPasswordPage;
