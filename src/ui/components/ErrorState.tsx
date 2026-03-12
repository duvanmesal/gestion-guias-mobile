import Button from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Algo no salió bien",
  message = "Ocurrió un problema inesperado. Por favor, intenta nuevamente.",
  onRetry,
  retryLabel = "Intentar de nuevo",
  compact = false,
}) => (
  <div
    className={`flex flex-col items-center text-center ${compact ? "py-6 px-4" : "py-12 px-6"}`}
    role="alert"
    aria-live="polite"
  >
    {/* Error icon with subtle glow */}
    <div
      className={`relative mb-4 flex items-center justify-center rounded-full ${compact ? "h-12 w-12" : "h-16 w-16"}`}
      style={{
        background: "var(--color-danger-soft)",
        boxShadow: "0 0 24px rgba(239, 68, 68, 0.2)",
      }}
    >
      <svg
        className={compact ? "h-6 w-6" : "h-8 w-8"}
        style={{ color: "#F87171" }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>

    {/* Title */}
    <h3
      className={`font-semibold ${compact ? "text-base mb-1" : "text-lg mb-2"}`}
      style={{ color: "var(--color-fg-primary)" }}
    >
      {title}
    </h3>

    {/* Message */}
    <p
      className={`max-w-xs ${compact ? "text-sm" : "text-base"}`}
      style={{ color: "var(--color-fg-secondary)", lineHeight: 1.5 }}
    >
      {message}
    </p>

    {/* Retry button */}
    {onRetry && (
      <div className={compact ? "mt-4 w-full max-w-[200px]" : "mt-6 w-full max-w-[240px]"}>
        <Button
          variant="secondary"
          size={compact ? "sm" : "md"}
          onClick={onRetry}
          leftIcon={
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
        >
          {retryLabel}
        </Button>
      </div>
    )}
  </div>
);

export default ErrorState;
