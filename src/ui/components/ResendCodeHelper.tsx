interface ResendCodeHelperProps {
  secondsRemaining: number;
  canResend: boolean;
  isSending: boolean;
  onResend: () => void;
  className?: string;
}

const ResendCodeHelper: React.FC<ResendCodeHelperProps> = ({
  secondsRemaining,
  canResend,
  isSending,
  onResend,
  className = "",
}) => {
  if (isSending) {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <span
          className="loading-spinner"
          style={{ width: "1rem", height: "1rem", borderWidth: "2px" }}
          aria-hidden="true"
        />
        <span className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
          Enviando nuevo código...
        </span>
      </div>
    );
  }

  if (!canResend && secondsRemaining > 0) {
    return (
      <div className={`text-center ${className}`}>
        <p className="countdown-text">
          Podrás solicitar otro código en{" "}
          <span className="countdown-number">{secondsRemaining}</span>s
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <button
        type="button"
        onClick={onResend}
        disabled={!canResend || isSending}
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus-ring rounded-md px-2 py-1"
        style={{
          color: canResend ? "var(--color-primary)" : "var(--color-fg-muted)",
          cursor: canResend ? "pointer" : "not-allowed",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Reenviar código
      </button>
    </div>
  );
};

export default ResendCodeHelper;
export type { ResendCodeHelperProps };
