import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      disabled,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const widthClass = fullWidth ? "btn-full" : "";
    const loadingClass = isLoading ? "btn-loading" : "";

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        className={`${baseClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`.trim()}
        {...props}
      >
        <span className="btn-content">
          {isLoading ? (
            <>
              <LoadingSpinner />
              {loadingText && <span>{loadingText}</span>}
              {!loadingText && children && <span>{children}</span>}
            </>
          ) : (
            <>
              {leftIcon && <span className="btn-icon">{leftIcon}</span>}
              <span>{children}</span>
              {rightIcon && <span className="btn-icon">{rightIcon}</span>}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

const LoadingSpinner = () => (
  <svg
    className="btn-spinner"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default Button;
export type { ButtonProps, ButtonVariant, ButtonSize };
