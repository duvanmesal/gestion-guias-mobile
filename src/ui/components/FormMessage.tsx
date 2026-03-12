type MessageVariant = "error" | "success" | "warning" | "info";

interface FormMessageProps {
  variant: MessageVariant;
  children: React.ReactNode;
  className?: string;
}

const variantConfig: Record<MessageVariant, { alertClass: string; icon: JSX.Element }> = {
  error: {
    alertClass: "alert-error",
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  success: {
    alertClass: "alert-success",
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    alertClass: "alert-warning",
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  info: {
    alertClass: "alert-info",
    icon: (
      <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const FormMessage: React.FC<FormMessageProps> = ({ variant, children, className = "" }) => {
  const config = variantConfig[variant];
  const animationClass = variant === "error" ? "animate-shake" : "animate-fade-up";

  return (
    <div
      className={`${config.alertClass} flex items-start gap-3 ${animationClass} ${className}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {config.icon}
      <span className="text-sm font-medium leading-snug">{children}</span>
    </div>
  );
};

export default FormMessage;
export type { FormMessageProps, MessageVariant };
