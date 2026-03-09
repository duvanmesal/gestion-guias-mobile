import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DocumentType } from "../types/users.types";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,72}$/;

const schema = z
  .object({
    nombres: z.string().min(1, "Nombres es requerido"),
    apellidos: z.string().min(1, "Apellidos es requerido"),
    telefono: z.string().min(7, "Teléfono inválido"),
    documentType: z.enum(["CC", "CE", "PASSPORT", "TI"]),
    documentNumber: z.string().min(6, "Número de documento inválido"),
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .max(72, "La nueva contraseña es demasiado larga")
      .regex(
        passwordRule,
        "La nueva contraseña debe tener mayúscula, minúscula, número y carácter especial"
      ),
    confirmPassword: z.string().min(1, "Debes confirmar la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "La nueva contraseña debe ser diferente a la actual",
    path: ["newPassword"],
  });

export type OnboardingFormValues = z.infer<typeof schema>;

interface OnboardingFormProps {
  onSubmit: (values: OnboardingFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

const STEPS = [
  { id: 1, title: "Perfil", subtitle: "Información básica" },
  { id: 2, title: "Contacto", subtitle: "Documento e identificación" },
  { id: 3, title: "Seguridad", subtitle: "Configura tu contraseña" },
];

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "PASSPORT", label: "Pasaporte" },
];

const OnboardingForm: React.FC<OnboardingFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      telefono: "",
      documentType: "CC",
      documentNumber: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const watchedValues = watch();
  const newPassword = watchedValues.newPassword || "";
  const confirmPassword = watchedValues.confirmPassword || "";

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { level: "none", label: "" };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[@$!%*?&]/.test(newPassword)) score++;

    if (score <= 2) return { level: "weak", label: "Débil" };
    if (score === 3) return { level: "fair", label: "Regular" };
    if (score === 4) return { level: "good", label: "Buena" };
    return { level: "strong", label: "Fuerte" };
  }, [newPassword]);

  // Password rules validation
  const passwordRules = useMemo(
    () => [
      { label: "8+ caracteres", valid: newPassword.length >= 8 },
      { label: "Mayúscula", valid: /[A-Z]/.test(newPassword) },
      { label: "Minúscula", valid: /[a-z]/.test(newPassword) },
      { label: "Número", valid: /\d/.test(newPassword) },
      { label: "Especial (@$!%*?&)", valid: /[@$!%*?&]/.test(newPassword) },
    ],
    [newPassword]
  );

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return await trigger(["nombres", "apellidos"]);
      case 2:
        return await trigger(["telefono", "documentType", "documentNumber"]);
      case 3:
        return await trigger(["currentPassword", "newPassword", "confirmPassword"]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  const onFinalSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      handleFormSubmit();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5 animate-slide-right" key="step1">
            <FormField label="Nombres" error={errors.nombres?.message}>
              <input
                type="text"
                className={`premium-input ${errors.nombres ? "error" : ""}`}
                placeholder="Ingresa tus nombres"
                value={watchedValues.nombres}
                onChange={(e) =>
                  setValue("nombres", e.target.value, { shouldValidate: true })
                }
              />
            </FormField>

            <FormField label="Apellidos" error={errors.apellidos?.message}>
              <input
                type="text"
                className={`premium-input ${errors.apellidos ? "error" : ""}`}
                placeholder="Ingresa tus apellidos"
                value={watchedValues.apellidos}
                onChange={(e) =>
                  setValue("apellidos", e.target.value, { shouldValidate: true })
                }
              />
            </FormField>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5 animate-slide-right" key="step2">
            <FormField label="Teléfono" error={errors.telefono?.message}>
              <input
                type="tel"
                className={`premium-input ${errors.telefono ? "error" : ""}`}
                placeholder="3001234567"
                value={watchedValues.telefono}
                onChange={(e) =>
                  setValue("telefono", e.target.value, { shouldValidate: true })
                }
              />
            </FormField>

            <FormField
              label="Tipo de documento"
              error={errors.documentType?.message}
            >
              <select
                className="premium-select"
                value={watchedValues.documentType}
                onChange={(e) =>
                  setValue("documentType", e.target.value as DocumentType, {
                    shouldValidate: true,
                  })
                }
              >
                {DOCUMENT_TYPES.map((doc) => (
                  <option key={doc.value} value={doc.value}>
                    {doc.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Número de documento"
              error={errors.documentNumber?.message}
            >
              <input
                type="text"
                className={`premium-input ${errors.documentNumber ? "error" : ""}`}
                placeholder="123456789"
                value={watchedValues.documentNumber}
                onChange={(e) =>
                  setValue("documentNumber", e.target.value, {
                    shouldValidate: true,
                  })
                }
              />
            </FormField>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5 animate-slide-right" key="step3">
            <FormField
              label="Contraseña actual"
              error={errors.currentPassword?.message}
              hint="La contraseña temporal enviada a tu correo"
            >
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className={`premium-input pr-12 ${
                    errors.currentPassword ? "error" : ""
                  }`}
                  placeholder="Contraseña temporal"
                  value={watchedValues.currentPassword}
                  onChange={(e) =>
                    setValue("currentPassword", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
                <PasswordToggle
                  show={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              </div>
            </FormField>

            <FormField
              label="Nueva contraseña"
              error={errors.newPassword?.message}
            >
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className={`premium-input pr-12 ${
                    errors.newPassword ? "error" : ""
                  }`}
                  placeholder="Tu nueva contraseña"
                  value={watchedValues.newPassword}
                  onChange={(e) =>
                    setValue("newPassword", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
                <PasswordToggle
                  show={showNewPassword}
                  onToggle={() => setShowNewPassword(!showNewPassword)}
                />
              </div>

              {/* Password Strength Bar */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-fg-muted)" }}
                    >
                      Fortaleza
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          passwordStrength.level === "strong"
                            ? "var(--color-primary)"
                            : passwordStrength.level === "good"
                            ? "#4ade80"
                            : passwordStrength.level === "fair"
                            ? "var(--color-accent)"
                            : "var(--color-danger)",
                      }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="strength-bar">
                    <div
                      className={`strength-fill ${passwordStrength.level}`}
                    />
                  </div>
                </div>
              )}

              {/* Password Rules */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {passwordRules.map((rule) => (
                  <div
                    key={rule.label}
                    className={`rule-item ${rule.valid ? "valid" : ""}`}
                  >
                    <div
                      className={`rule-icon ${rule.valid ? "valid" : "pending"}`}
                    >
                      {rule.valid && (
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                ))}
              </div>
            </FormField>

            <FormField
              label="Confirmar contraseña"
              error={errors.confirmPassword?.message}
            >
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`premium-input pr-12 ${
                    errors.confirmPassword ? "error" : ""
                  }`}
                  placeholder="Repite la nueva contraseña"
                  value={watchedValues.confirmPassword}
                  onChange={(e) =>
                    setValue("confirmPassword", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                />
                <PasswordToggle
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>

              {/* Match Indicator */}
              {confirmPassword && (
                <div
                  className="mt-2 flex items-center gap-2 text-xs"
                  style={{
                    color: passwordsMatch
                      ? "var(--color-primary)"
                      : "var(--color-danger)",
                  }}
                >
                  {passwordsMatch ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
              )}
            </FormField>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="text-center mb-6 animate-fade-up">
        <div
          className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: "var(--color-primary-soft)",
            boxShadow: "0 0 30px var(--color-primary-glow)",
          }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: "var(--color-primary)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--color-fg-primary)" }}
        >
          Completar Perfil
        </h1>
        <p className="text-sm" style={{ color: "var(--color-fg-secondary)" }}>
          Configura tu cuenta para comenzar
        </p>
      </div>

      {/* Stepper */}
      <div className="stepper-container mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {STEPS.map((step, index) => (
          <div key={step.id} className="contents">
            <div
              className={`stepper-step ${
                currentStep > step.id
                  ? "completed"
                  : currentStep === step.id
                  ? "active"
                  : "pending"
              }`}
            >
              {currentStep > step.id ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.id
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div className="stepper-line">
                <div
                  className="stepper-line-fill"
                  style={{ width: currentStep > step.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center mb-6">
        <h2
          className="text-lg font-semibold mb-1"
          style={{ color: "var(--color-fg-primary)" }}
        >
          {STEPS[currentStep - 1].title}
        </h2>
        <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>
          {STEPS[currentStep - 1].subtitle}
        </p>
      </div>

      {/* Glass Card with Form */}
      <div className="glass-card p-6 mb-6 flex-1">
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}

          {/* Global Error */}
          {error && (
            <div className="alert-error mt-5 flex items-start gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-auto animate-fade-up" style={{ animationDelay: "0.2s" }}>
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            disabled={isLoading}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Anterior</span>
          </button>
        )}

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <span>Siguiente</span>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinalSubmit}
            disabled={isLoading}
            className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
              !isLoading ? "animate-pulse-glow" : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Finalizar</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Step Indicator Text */}
      <p
        className="text-center text-xs mt-4"
        style={{ color: "var(--color-fg-muted)" }}
      >
        Paso {currentStep} de {STEPS.length}
      </p>
    </div>
  );
};

// Helper Components
interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, hint, children }) => (
  <div>
    <label
      className="block text-sm font-medium mb-2"
      style={{ color: "var(--color-fg-primary)" }}
    >
      {label}
    </label>
    {children}
    {hint && !error && (
      <p className="mt-1.5 text-xs" style={{ color: "var(--color-fg-muted)" }}>
        {hint}
      </p>
    )}
    {error && (
      <p
        className="mt-1.5 text-xs flex items-center gap-1"
        style={{ color: "var(--color-danger)" }}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {error}
      </p>
    )}
  </div>
);

interface PasswordToggleProps {
  show: boolean;
  onToggle: () => void;
}

const PasswordToggle: React.FC<PasswordToggleProps> = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
    style={{ color: "var(--color-fg-muted)" }}
  >
    {show ? (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    )}
  </button>
);

export default OnboardingForm;
