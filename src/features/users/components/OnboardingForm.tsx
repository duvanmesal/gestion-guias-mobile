import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DocumentType } from "../types/users.types";
import Button from "../../../ui/components/Button";
import FormMessage from "../../../ui/components/FormMessage";
import PasswordRulesCard from "../../../ui/components/passwordRulesCard";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,72}$/;

const schema = z
  .object({
    nombres: z.string().min(1, "Ingresa tus nombres"),
    apellidos: z.string().min(1, "Ingresa tus apellidos"),
    telefono: z.string().min(7, "Ingresa un teléfono válido"),
    documentType: z.enum(["CC", "CE", "PASSPORT", "TI"]),
    documentNumber: z.string().min(6, "Ingresa un número de documento válido"),
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(72, "Máximo 72 caracteres")
      .regex(passwordRule, "La contraseña no cumple los requisitos"),
    confirmPassword: z.string().min(1, "Confirma tu nueva contraseña"),
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
  { id: 1, title: "Tu perfil", icon: UserIcon },
  { id: 2, title: "Identificación", icon: IdCardIcon },
  { id: 3, title: "Seguridad", icon: ShieldIcon },
];

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "PASSPORT", label: "Pasaporte" },
];

const OnboardingForm: React.FC<OnboardingFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nombresRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);

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

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  // Autofocus first field of each step
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep === 1) nombresRef.current?.focus();
      else if (currentStep === 2) telefonoRef.current?.focus();
      else if (currentStep === 3) currentPasswordRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, [currentStep]);

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

  const handleFormSubmit = handleSubmit((values) => {
    if (submittingRef.current || isLoading) return;
    submittingRef.current = true;
    onSubmit(values);
    setTimeout(() => {
      submittingRef.current = false;
    }, 500);
  });

  const onFinalSubmit = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      handleFormSubmit();
    }
  };

  const CurrentStepIcon = STEPS[currentStep - 1].icon;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-slide-right" key="step1">
            <FormField label="Nombres" error={errors.nombres?.message}>
              <input
                ref={nombresRef}
                type="text"
                className={`premium-input ${errors.nombres ? "error" : ""}`}
                placeholder="Ingresa tus nombres"
                value={watchedValues.nombres}
                disabled={isLoading}
                onChange={(e) => setValue("nombres", e.target.value, { shouldValidate: true })}
              />
            </FormField>

            <FormField label="Apellidos" error={errors.apellidos?.message}>
              <input
                type="text"
                className={`premium-input ${errors.apellidos ? "error" : ""}`}
                placeholder="Ingresa tus apellidos"
                value={watchedValues.apellidos}
                disabled={isLoading}
                onChange={(e) => setValue("apellidos", e.target.value, { shouldValidate: true })}
              />
            </FormField>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-slide-right" key="step2">
            <FormField 
              label="Teléfono" 
              error={errors.telefono?.message}
              hint="Tu número de contacto principal"
            >
              <input
                ref={telefonoRef}
                type="tel"
                className={`premium-input ${errors.telefono ? "error" : ""}`}
                placeholder="3001234567"
                value={watchedValues.telefono}
                disabled={isLoading}
                onChange={(e) => setValue("telefono", e.target.value, { shouldValidate: true })}
              />
            </FormField>

            <FormField label="Tipo de documento" error={errors.documentType?.message}>
              <select
                className="premium-select"
                value={watchedValues.documentType}
                disabled={isLoading}
                onChange={(e) =>
                  setValue("documentType", e.target.value as DocumentType, { shouldValidate: true })
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
              hint="Sin puntos ni espacios"
            >
              <input
                type="text"
                className={`premium-input ${errors.documentNumber ? "error" : ""}`}
                placeholder="123456789"
                value={watchedValues.documentNumber}
                disabled={isLoading}
                onChange={(e) => setValue("documentNumber", e.target.value, { shouldValidate: true })}
              />
            </FormField>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-slide-right" key="step3">
            {/* Security guidance - compact */}
            <div
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ 
                background: "var(--color-primary-muted)", 
                border: "1px solid var(--color-border-glow)" 
              }}
            >
              <div
                className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: "var(--color-primary-soft)" }}
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-fg-secondary)" }}>
                Usa la contraseña temporal que recibiste por correo como contraseña actual.
              </p>
            </div>

            <FormField
              label="Contraseña actual"
              error={errors.currentPassword?.message}
            >
              <div className="relative">
                <input
                  ref={currentPasswordRef}
                  type={showCurrentPassword ? "text" : "password"}
                  className={`premium-input pr-11 ${errors.currentPassword ? "error" : ""}`}
                  placeholder="Contraseña temporal"
                  value={watchedValues.currentPassword}
                  disabled={isLoading}
                  onChange={(e) => setValue("currentPassword", e.target.value, { shouldValidate: true })}
                />
                <PasswordToggle
                  show={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              </div>
            </FormField>

            <FormField label="Nueva contraseña" error={errors.newPassword?.message}>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className={`premium-input pr-11 ${errors.newPassword ? "error" : ""}`}
                  placeholder="Tu nueva contraseña"
                  value={watchedValues.newPassword}
                  disabled={isLoading}
                  onChange={(e) => setValue("newPassword", e.target.value, { shouldValidate: true })}
                />
                <PasswordToggle
                  show={showNewPassword}
                  onToggle={() => setShowNewPassword(!showNewPassword)}
                />
              </div>

              {/* Password rules */}
              <div className="mt-3">
                <PasswordRulesCard password={newPassword} showStrength />
              </div>
            </FormField>

            <FormField label="Confirmar contraseña" error={errors.confirmPassword?.message}>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`premium-input pr-11 ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="Repite la nueva contraseña"
                  value={watchedValues.confirmPassword}
                  disabled={isLoading}
                  onChange={(e) => setValue("confirmPassword", e.target.value, { shouldValidate: true })}
                />
                <PasswordToggle
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </div>

              {confirmPassword && (
                <div
                  className="mt-1.5 flex items-center gap-1.5 text-xs"
                  style={{ color: passwordsMatch ? "var(--color-success)" : "var(--color-danger)" }}
                >
                  {passwordsMatch ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
    <div className="flex flex-col w-full max-w-[360px]">
      {/* Compact Header */}
      <div className="text-center mb-5 animate-fade-up">
        <div
          className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{
            background: "var(--gradient-primary)",
            boxShadow: "0 4px 16px var(--color-primary-glow), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <CurrentStepIcon />
        </div>
        <h1 className="text-xl font-bold" style={{ color: "var(--color-fg-primary)" }}>
          Completa tu perfil
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-fg-secondary)" }}>
          Paso {currentStep} de {STEPS.length} — {STEPS[currentStep - 1].title}
        </p>
      </div>

      {/* Stepper - Compact inline dots */}
      <div className="flex items-center justify-center gap-1.5 mb-5">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
              `}
              style={{
                background: currentStep >= step.id 
                  ? "var(--color-primary)" 
                  : "var(--color-bg-glass)",
                border: currentStep >= step.id 
                  ? "none" 
                  : "1.5px solid var(--color-border-glass)",
                color: currentStep >= step.id 
                  ? "white" 
                  : "var(--color-fg-muted)",
                boxShadow: currentStep === step.id 
                  ? "0 0 12px var(--color-primary-glow)" 
                  : "none",
              }}
            >
              {currentStep > step.id ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div 
                className="w-6 h-0.5 mx-1"
                style={{ 
                  background: currentStep > step.id 
                    ? "var(--color-primary)" 
                    : "var(--color-border-glass)",
                  borderRadius: "1px",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Glass Card Form */}
      <div className="glass-card-elevated p-5 animate-fade-up">
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent()}

          {error && (
            <div className="mt-4">
              <FormMessage variant="error">{error}</FormMessage>
            </div>
          )}
        </form>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-5 animate-fade-up">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={isLoading}
            leftIcon={<ChevronLeftIcon />}
            className="flex-1"
          >
            Anterior
          </Button>
        )}

        {currentStep < 3 ? (
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            rightIcon={<ChevronRightIcon />}
            className="flex-1"
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={onFinalSubmit}
            isLoading={isLoading}
            leftIcon={!isLoading ? <CheckIcon /> : undefined}
            className={`flex-1 ${!isLoading ? "animate-pulse-glow" : ""}`}
          >
            {isLoading ? "Guardando..." : "Activar cuenta"}
          </Button>
        )}
      </div>
    </div>
  );
};

/* ===== Sub-components ===== */

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-fg-primary)" }}>
      {label}
    </label>
    {children}
    {hint && !error && (
      <p className="form-hint mt-1">{hint}</p>
    )}
    {error && (
      <p className="form-error mt-1" role="alert">
        <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
    style={{ color: "var(--color-fg-muted)" }}
    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
    tabIndex={-1}
  >
    {show ? (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

/* ===== Icons ===== */

function UserIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IdCardIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

const ChevronLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default OnboardingForm;
