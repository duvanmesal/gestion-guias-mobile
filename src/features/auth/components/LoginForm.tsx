import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AuthNotice } from "../../../core/auth/types";
import { InfoBanner, SuccessBanner, WarningBanner } from "../../../ui/components";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type FormValues = z.infer<typeof schema>;

interface LoginFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
  error?: string | null;
  notice?: AuthNotice | null;
}

const MailIcon = ({ active }: { active: boolean }) => (
  <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
    style={{ color: active ? "var(--color-primary)" : "var(--color-fg-muted)", transition: "color 150ms" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = ({ active }: { active: boolean }) => (
  <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
    style={{ color: active ? "var(--color-primary)" : "var(--color-fg-muted)", transition: "color 150ms" }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    style={{ width: 18, height: 18, animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    fill="none" viewBox="0 0 24 24"
  >
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-90" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg style={{ width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
    <polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
  </svg>
);

/* ── Shared field styles ── */
const fieldWrap: React.CSSProperties = {
  position: "relative",
};

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem 0.75rem 2.75rem",
  background: "var(--color-input-bg)",
  border: "1px solid var(--color-input-border)",
  borderRadius: "0.875rem",
  color: "var(--color-fg-primary)",
  fontSize: "0.9375rem",
  lineHeight: 1.5,
  outline: "none",
  transition: "border-color 150ms, box-shadow 150ms, background 150ms",
};

const inputBaseError: React.CSSProperties = {
  ...inputBase,
  borderColor: "var(--color-danger)",
  boxShadow: "0 0 0 3px var(--color-danger-soft)",
};

const iconLeft: React.CSSProperties = {
  position: "absolute",
  left: "0.875rem",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
};

const iconRight: React.CSSProperties = {
  position: "absolute",
  right: "0.875rem",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--color-fg-muted)",
  padding: "4px",
  borderRadius: "4px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--color-fg-secondary)",
  marginBottom: "0.5rem",
};

const errorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.75rem",
  color: "var(--color-error-text)",
  marginTop: "0.375rem",
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error, notice }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const renderNotice = () => {
    if (!notice || error) return null;
    if (notice.kind === "success")
      return <SuccessBanner className="animate-fade-up mb-5" description={notice.message} eyebrow="Acceso" title="Operación completada" />;
    if (notice.kind === "warning")
      return <WarningBanner className="animate-fade-up mb-5" description={notice.message} eyebrow="Aviso" title="Revisa esta información" />;
    return <InfoBanner className="animate-fade-up mb-5" description={notice.message} eyebrow="Información" title="Antes de continuar" />;
  };

  /* Focused border style */
  const emailInputStyle: React.CSSProperties = {
    ...( errors.email ? inputBaseError : inputBase ),
    paddingRight: "1rem",
    borderColor: errors.email
      ? "var(--color-danger)"
      : emailFocus
        ? "var(--color-primary)"
        : "var(--color-input-border)",
    boxShadow: errors.email
      ? "0 0 0 3px var(--color-danger-soft)"
      : emailFocus
        ? "0 0 0 3px var(--color-primary-soft)"
        : "none",
    background: emailFocus ? "var(--color-input-bg-focus)" : "var(--color-input-bg)",
  };

  const passwordInputStyle: React.CSSProperties = {
    ...inputBase,
    paddingRight: "3rem",
    borderColor: errors.password
      ? "var(--color-danger)"
      : passwordFocus
        ? "var(--color-primary)"
        : "var(--color-input-border)",
    boxShadow: errors.password
      ? "0 0 0 3px var(--color-danger-soft)"
      : passwordFocus
        ? "0 0 0 3px var(--color-primary-soft)"
        : "none",
    background: passwordFocus ? "var(--color-input-bg-focus)" : "var(--color-input-bg)",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "var(--login-form-gap)" }} noValidate>

      {renderNotice()}

      {error && (
        <WarningBanner
          className="animate-shake"
          description={error}
          eyebrow="Error de acceso"
          title="No pude iniciar sesión"
        />
      )}

      {/* ── Email ── */}
      <div>
        <label style={labelStyle}>Correo electrónico</label>
        <div style={fieldWrap}>
          <span style={iconLeft}>
            <MailIcon active={emailFocus || !!emailValue} />
          </span>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            style={emailInputStyle}
            onFocus={() => setEmailFocus(true)}
            onBlur={() => setEmailFocus(false)}
            onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
          />
        </div>
        {errors.email && (
          <p style={errorStyle}>{errors.email.message}</p>
        )}
      </div>

      {/* ── Password ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Contraseña</label>
          <Link
            to="/forgot-password"
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-primary)",
              textDecoration: "none",
              opacity: 0.9,
              transition: "opacity 150ms",
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div style={fieldWrap}>
          <span style={iconLeft}>
            <LockIcon active={passwordFocus || !!passwordValue} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            style={passwordInputStyle}
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
            onChange={(e) => setValue("password", e.target.value, { shouldValidate: true })}
          />
          <button
            type="button"
            style={iconRight}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {errors.password && (
          <p style={errorStyle}>{errors.password.message}</p>
        )}
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={isLoading}
        aria-disabled={isLoading}
        aria-busy={isLoading}
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          padding: "0.8125rem 1.5rem",
          marginTop: 4,
          borderRadius: "0.9375rem",
          border: "1px solid rgba(255,255,255,0.12)",
          background: isLoading
            ? "linear-gradient(145deg, var(--color-primary-dark) 0%, var(--color-bg-elevated) 100%)"
            : "linear-gradient(145deg, var(--color-primary-light) 0%, var(--color-primary) 50%, var(--color-primary-dark) 100%)",
          boxShadow: isLoading
            ? "none"
            : "0 6px 24px var(--color-primary-glow), inset 0 1px 0 rgba(255,255,255,0.2)",
          color: "white",
          fontSize: "0.9375rem",
          fontWeight: 700,
          letterSpacing: "0.01em",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "transform 150ms, box-shadow 200ms, opacity 150ms",
        }}
      >
        {isLoading ? (
          <>
            <SpinnerIcon />
            <span>Iniciando sesión…</span>
          </>
        ) : (
          <>
            <span>Iniciar sesión</span>
            <ArrowRightIcon />
          </>
        )}
      </button>

    </form>
  );
};

export default LoginForm;
