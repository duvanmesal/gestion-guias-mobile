import { useEffect, useRef, useState } from "react";
import { IonModal } from "@ionic/react";

interface LogoutAllModalProps {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onConfirm: (code: string) => void;
  onCancel: () => void;
}

const DIGITS = 6;

const LogoutAllModal: React.FC<LogoutAllModalProps> = ({
  isOpen,
  isLoading,
  error,
  onConfirm,
  onCancel,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(DIGITS).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* Reset state each time modal opens */
  useEffect(() => {
    if (isOpen) {
      setDigits(Array(DIGITS).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
    if (!pasted) return;
    const next = Array(DIGITS).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, DIGITS - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const code = digits.join("");
  const isComplete = code.length === DIGITS;

  const handleSubmit = () => {
    if (!isComplete || isLoading) return;
    onConfirm(code);
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onCancel}
      initialBreakpoint={0.72}
      breakpoints={[0, 0.72]}
      handle={true}
      style={{ "--border-radius": "24px 24px 0 0" } as React.CSSProperties}
    >
      <div
        style={{
          background: "var(--color-bg-elevated)",
          borderRadius: "24px 24px 0 0",
          padding: "12px 24px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          minHeight: 380,
        }}
      >
        {/* Handle indicator */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "var(--color-glass-medium)",
            marginBottom: 24,
          }}
        />

        {/* Warning icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "var(--color-danger-soft)",
            border: "1.5px solid var(--color-danger-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <svg
            style={{ width: 28, height: 28, color: "var(--color-danger)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--color-fg-primary)",
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          Cerrar todas las sesiones
        </h2>

        {/* Description */}
        <p
          style={{
            margin: "8px 0 0",
            fontSize: "0.8125rem",
            color: "var(--color-fg-muted)",
            textAlign: "center",
            lineHeight: 1.55,
            maxWidth: 280,
          }}
        >
          Ingresa el código de 6 dígitos enviado a tu correo. Esto cerrará sesión en todos tus dispositivos.
        </p>

        {/* OTP inputs */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 28,
          }}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isLoading}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              style={{
                width: 46,
                height: 56,
                borderRadius: 14,
                border: `2px solid ${
                  digit
                    ? "var(--color-primary)"
                    : "var(--color-input-border)"
                }`,
                background: digit ? "var(--color-primary-muted)" : "var(--color-bg-base)",
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "var(--color-fg-primary)",
                textAlign: "center",
                outline: "none",
                transition: "border-color 0.15s, background 0.15s",
                caretColor: "transparent",
                opacity: isLoading ? 0.5 : 1,
              }}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--color-danger-soft)",
              border: "1px solid var(--color-danger-border)",
              borderRadius: 12,
              padding: "10px 14px",
              width: "100%",
            }}
          >
            <svg
              style={{ width: 15, height: 15, color: "var(--color-danger)", flexShrink: 0 }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span style={{ fontSize: "0.8125rem", color: "var(--color-danger)", fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 24,
          }}
        >
          {/* Confirm */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            style={{
              width: "100%",
              background: isComplete && !isLoading
                ? "var(--gradient-danger)"
                : "var(--color-danger-soft)",
              color: "white",
              border: "none",
              borderRadius: 14,
              padding: "15px 20px",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: isComplete && !isLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s",
              letterSpacing: "0.01em",
            }}
          >
            {isLoading ? (
              <>
                <Spinner />
                Cerrando sesiones...
              </>
            ) : (
              <>
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Confirmar cierre
              </>
            )}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              background: "none",
              border: "none",
              padding: "10px",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-fg-secondary)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.5 : 1,
              borderRadius: 12,
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </IonModal>
  );
};

const Spinner = () => (
  <svg
    style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path
      style={{ opacity: 0.85 }}
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default LogoutAllModal;
