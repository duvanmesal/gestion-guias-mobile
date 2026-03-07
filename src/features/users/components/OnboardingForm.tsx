import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IonInput,
  IonButton,
  IonText,
  IonItem,
  IonList,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import type { DocumentType } from "../types/users.types";

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,72}$/;

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

const OnboardingForm: React.FC<OnboardingFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const {
    handleSubmit,
    setValue,
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
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <IonList>
        <IonItem>
          <IonInput
            label="Nombres"
            labelPlacement="stacked"
            placeholder="Tus nombres"
            onIonInput={(e) =>
              setValue("nombres", e.detail.value ?? "", { shouldValidate: true })
            }
          />
        </IonItem>
        {errors.nombres && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>{errors.nombres.message}</p>
          </IonText>
        )}

        <IonItem>
          <IonInput
            label="Apellidos"
            labelPlacement="stacked"
            placeholder="Tus apellidos"
            onIonInput={(e) =>
              setValue("apellidos", e.detail.value ?? "", { shouldValidate: true })
            }
          />
        </IonItem>
        {errors.apellidos && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>{errors.apellidos.message}</p>
          </IonText>
        )}

        <IonItem>
          <IonInput
            label="Teléfono"
            labelPlacement="stacked"
            type="tel"
            placeholder="3001234567"
            onIonInput={(e) =>
              setValue("telefono", e.detail.value ?? "", { shouldValidate: true })
            }
          />
        </IonItem>
        {errors.telefono && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>{errors.telefono.message}</p>
          </IonText>
        )}

        <IonItem>
          <IonSelect
            label="Tipo de documento"
            labelPlacement="stacked"
            value="CC"
            onIonChange={(e) =>
              setValue("documentType", e.detail.value as DocumentType, {
                shouldValidate: true,
              })
            }
          >
            <IonSelectOption value="CC">Cédula de ciudadanía</IonSelectOption>
            <IonSelectOption value="CE">Cédula de extranjería</IonSelectOption>
            <IonSelectOption value="TI">Tarjeta de identidad</IonSelectOption>
            <IonSelectOption value="PASSPORT">Pasaporte</IonSelectOption>
          </IonSelect>
        </IonItem>
        {errors.documentType && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>
              {errors.documentType.message}
            </p>
          </IonText>
        )}

        <IonItem>
          <IonInput
            label="Número de documento"
            labelPlacement="stacked"
            placeholder="123456789"
            onIonInput={(e) =>
              setValue("documentNumber", e.detail.value ?? "", {
                shouldValidate: true,
              })
            }
          />
        </IonItem>
        {errors.documentNumber && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>
              {errors.documentNumber.message}
            </p>
          </IonText>
        )}

        <IonItem>
          <IonInput
            label="Contraseña actual"
            labelPlacement="stacked"
            type="password"
            placeholder="La contraseña temporal enviada al correo"
            onIonInput={(e) =>
              setValue("currentPassword", e.detail.value ?? "", {
                shouldValidate: true,
              })
            }
          />
        </IonItem>
        {errors.currentPassword && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>
              {errors.currentPassword.message}
            </p>
          </IonText>
        )}

        <IonItem>
          <IonInput
            label="Nueva contraseña"
            labelPlacement="stacked"
            type="password"
            placeholder="Nueva contraseña"
            onIonInput={(e) =>
              setValue("newPassword", e.detail.value ?? "", {
                shouldValidate: true,
              })
            }
          />
        </IonItem>
        {errors.newPassword && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>{errors.newPassword.message}</p>
          </IonText>
        )}

        <IonItem>
          <IonInput
            label="Confirmar nueva contraseña"
            labelPlacement="stacked"
            type="password"
            placeholder="Repite la nueva contraseña"
            onIonInput={(e) =>
              setValue("confirmPassword", e.detail.value ?? "", {
                shouldValidate: true,
              })
            }
          />
        </IonItem>
        {errors.confirmPassword && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>
              {errors.confirmPassword.message}
            </p>
          </IonText>
        )}
      </IonList>

      {error && (
        <IonText color="danger">
          <p style={{ textAlign: "center", fontSize: 14 }}>{error}</p>
        </IonText>
      )}

      <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 16 }}>
        {isLoading ? "Guardando..." : "Completar perfil y cambiar contraseña"}
      </IonButton>
    </form>
  );
};

export default OnboardingForm;