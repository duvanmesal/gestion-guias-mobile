import { useState, useRef, useEffect, useCallback } from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import * as authApi from "../data/auth.api";
import * as userApi from "../../users/data/users.api";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import { mapUserMeToSessionUser } from "../../users/data/users.mappers";
import Button from "../../../ui/components/Button";
import FormMessage from "../../../ui/components/FormMessage";

const RESEND_COOLDOWN = 60;

const VerifyEmailPage: React.FC = () => {
  const history = useHistory();
  const user = useSessionStore((s) => s.user);
  const accessToken = useSessionStore((s) => s.accessToken);

  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmingRef = useRef(false);
  const resendingRef = useRef(false);

  const email = user?.email ?? "";
  const code = otpValues.join("");
  const isCodeComplete = code.length === 6;
  const isLoading = loadingConfirm || loadingResend;

  // Autofocus first OTP input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    const sanitized = value.replace(/\D/g, "");

    // Handle paste of multiple digits
    if (sanitized.length > 1) {
      const chars = sanitized.slice(0, 6).split("");
      const newValues = ["", "", "", "", "", ""];

      chars.forEach((char, i) => {
        if (i < 6) newValues[i] = char;
      });

      setOtpValues(newValues);
      focusInput(Math.min(chars.length, 5));
      return;
    }

    const newValues = [...otpValues];
    newValues[index] = sanitized;
    setOtpValues(newValues);

    if (sanitized && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const chars = pasted.split("");
    const newValues = ["", "", "", "", "", ""];

    chars.forEach((char, i) => {
      if (i < 6) newValues[i] = char;
    });

    setOtpValues(newValues);
    focusInput(Math.min(chars.length, 5));
  };

  const handleResend = useCallback(async () => {
    if (!email || cooldown > 0 || resendingRef.current) return;

    resendingRef.current = true;
    setError(null);
    setSuccess(null);
    setLoadingResend(true);

    try {
      const res = await authApi.requestEmailVerification({ email });

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pudimos reenviar el código. Intenta de nuevo."));
      }

      setSuccess("Te enviamos un nuevo código. Revisa tu bandeja de entrada.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al reenviar el código.");
    } finally {
      setLoadingResend(false);
      resendingRef.current = false;
    }
  }, [email, cooldown]);

  const handleConfirm = useCallback(async () => {
    if (!email || code.length !== 6 || confirmingRef.current) return;

    confirmingRef.current = true;
    setError(null);
    setSuccess(null);
    setLoadingConfirm(true);

    try {
      const res = await authApi.confirmEmailVerification({ email, code });

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "El código no es válido. Revísalo e intenta de nuevo."));
      }

      const meRes = await userApi.getMe();

      if (!meRes.ok) {
        throw new Error(getErrorMessage(meRes.error, "No pudimos actualizar tu sesión. Intenta de nuevo."));
      }

      const mapped = mapUserMeToSessionUser(meRes.data);

      useSessionStore.getState().setAuthedSession({
        user: mapped,
        accessToken: accessToken ?? "",
      });

      if (mapped.profileStatus === "INCOMPLETE") {
        history.replace("/onboarding");
        return;
      }

      history.replace("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar. Intenta nuevamente.");
      setOtpValues(["", "", "", "", "", ""]);
      focusInput(0);
    } finally {
      setLoadingConfirm(false);
      confirmingRef.current = false;
    }
  }, [email, code, accessToken, history]);

  return (
    <IonPage className="premium-page">
      <IonContent scrollY={true}>
        <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--color-bg-base)" }}>
          {/* Background orbs */}
          <div
            className="orb orb-primary animate-float-orb"
            style={{ width: 280, height: 280, top: "-8%", left: "-15%" }}
          />
          <div
            className="orb orb-accent animate-float-orb-delayed"
            style={{ width: 220, height: 220, bottom: "12%", right: "-10%" }}
          />
          <div
            className="orb orb-primary"
            style={{
              width: 140,
              height: 140,
              top: "35%",
              right: "8%",
              opacity: 0.4,
              animation: "float-orb 16s ease-in-out infinite",
              animationDelay: "-8s",
            }}
          />

          {/* Main content */}
          <div className="relative z-10 flex flex-col min-h-screen px-5 py-10 safe-area-inset">
            {/* Header */}
            <div className="text-center mb-6 animate-fade-up">
              <div
                className="mx-auto mb-4 w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: "var(--color-primary-soft)",
                  boxShadow: "0 0 20px var(--color-primary-glow)",
                }}
              >
                <svg
                  className="w-7 h-7"
                  style={{ color: "var(--color-primary)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h1 className="text-xl font-bold mb-1 text-balance" style={{ color: "var(--color-fg-primary)" }}>
                Verifica tu correo
              </h1>

              <p className="text-sm mb-3" style={{ color: "var(--color-fg-secondary)" }}>
                Ingresa el código de 6 dígitos que enviamos a
              </p>

              {/* Email badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: "var(--color-bg-glass)",
                  border: "1px solid var(--color-border-glass)",
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--color-primary)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
                <span className="text-xs font-medium" style={{ color: "var(--color-fg-primary)" }}>
                  {email || "correo no disponible"}
                </span>
              </div>
            </div>

            {/* OTP Card */}
            <div className="glass-card p-5 mb-5 animate-fade-up delay-100">
              {/* OTP inputs */}
              <div className="otp-container mb-5" onPaste={handlePaste}>
                {otpValues.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`otp-input ${value ? "filled" : ""} ${error ? "error" : ""}`}
                    autoComplete="one-time-code"
                    disabled={isLoading}
                    aria-label={`Dígito ${index + 1} del código`}
                  />
                ))}
              </div>

              {/* Status messages */}
              {error && (
                <div className="mb-4">
                  <FormMessage variant="error">{error}</FormMessage>
                </div>
              )}

              {success && (
                <div className="mb-4">
                  <FormMessage variant="success">{success}</FormMessage>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2.5">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleConfirm}
                  disabled={!isCodeComplete || isLoading}
                  isLoading={loadingConfirm}
                  leftIcon={!loadingConfirm ? <CheckCircleIcon /> : undefined}
                  className={isCodeComplete && !isLoading ? "animate-pulse-glow" : ""}
                >
                  {loadingConfirm ? "Verificando..." : "Verificar correo"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleResend}
                  disabled={isLoading || cooldown > 0}
                  isLoading={loadingResend}
                  leftIcon={
                    !loadingResend ? (
                      cooldown > 0 ? <ClockIcon /> : <RefreshIcon />
                    ) : undefined
                  }
                >
                  {loadingResend
                    ? "Enviando..."
                    : cooldown > 0
                    ? `Reenviar en ${cooldown}s`
                    : "Reenviar código"}
                </Button>
              </div>
            </div>

            {/* Helper text */}
            <div className="text-center space-y-2 animate-fade-up delay-200">
              <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>
                El código puede tardar unos segundos en llegar.
              </p>
              <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>
                Revisa también tu carpeta de spam o no deseados.
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default VerifyEmailPage;
