import { useMemo } from "react";

interface PasswordRulesCardProps {
  password: string;
  showStrength?: boolean;
  className?: string;
}

interface PasswordRule {
  key: string;
  label: string;
  validator: (pwd: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { key: "length", label: "8+ caracteres", validator: (pwd) => pwd.length >= 8 },
  { key: "uppercase", label: "Una mayúscula", validator: (pwd) => /[A-Z]/.test(pwd) },
  { key: "lowercase", label: "Una minúscula", validator: (pwd) => /[a-z]/.test(pwd) },
  { key: "number", label: "Un número", validator: (pwd) => /\d/.test(pwd) },
  { key: "special", label: "Un especial (@$!%*?&)", validator: (pwd) => /[@$!%*?&]/.test(pwd) },
];

type StrengthLevel = "none" | "weak" | "fair" | "good" | "strong";

const strengthLabels: Record<StrengthLevel, string> = {
  none: "",
  weak: "Débil",
  fair: "Regular",
  good: "Buena",
  strong: "Fuerte",
};

const strengthColors: Record<StrengthLevel, string> = {
  none: "var(--color-fg-muted)",
  weak: "var(--color-danger)",
  fair: "var(--color-warning)",
  good: "var(--color-success)",
  strong: "var(--color-primary)",
};

const PasswordRulesCard: React.FC<PasswordRulesCardProps> = ({
  password,
  showStrength = true,
  className = "",
}) => {
  const ruleStatus = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      valid: rule.validator(password),
    }));
  }, [password]);

  const strength: StrengthLevel = useMemo(() => {
    if (!password) return "none";
    const validCount = ruleStatus.filter((r) => r.valid).length;
    if (validCount <= 2) return "weak";
    if (validCount === 3) return "fair";
    if (validCount === 4) return "good";
    return "strong";
  }, [password, ruleStatus]);

  const hasStartedTyping = password.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength indicator */}
      {showStrength && hasStartedTyping && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: "var(--color-fg-muted)" }}>
              Fortaleza
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: strengthColors[strength] }}
            >
              {strengthLabels[strength]}
            </span>
          </div>
          <div className="strength-bar">
            <div className={`strength-fill ${strength}`} />
          </div>
        </div>
      )}

      {/* Rules grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {ruleStatus.map((rule) => {
          const isValid = rule.valid;
          const isPending = !hasStartedTyping;

          return (
            <div
              key={rule.key}
              className={`rule-item ${isValid ? "valid" : isPending ? "pending" : ""}`}
            >
              <div className={`rule-icon ${isValid ? "valid" : "pending"}`}>
                {isValid && (
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <span>{rule.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordRulesCard;
export type { PasswordRulesCardProps };
