import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IonInput, IonButton, IonText, IonItem, IonList } from "@ionic/react";
import type { AuthNotice } from "../../../core/auth/types";

const schema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

interface LoginFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
  error?: string | null;
  notice?: AuthNotice | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  error,
  notice,
}) => {
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const noticeColor =
    notice?.kind === "success"
      ? "success"
      : notice?.kind === "warning"
      ? "warning"
      : notice?.kind === "danger"
      ? "danger"
      : "medium";

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <IonList>
        <IonItem>
          <IonInput
            label="Email"
            labelPlacement="stacked"
            type="email"
            placeholder="correo@ejemplo.com"
            onIonInput={(e) => setValue("email", e.detail.value ?? "")}
          />
        </IonItem>
        {errors.email && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>{errors.email.message}</p>
          </IonText>
        )}

        <IonItem>
          <IonInput
            label="Password"
            labelPlacement="stacked"
            type="password"
            placeholder="********"
            onIonInput={(e) => setValue("password", e.detail.value ?? "")}
          />
        </IonItem>
        {errors.password && (
          <IonText color="danger">
            <p style={{ paddingLeft: 16, fontSize: 12 }}>{errors.password.message}</p>
          </IonText>
        )}
      </IonList>

      {notice && !error && (
        <IonText color={noticeColor}>
          <p style={{ textAlign: "center", fontSize: 14 }}>{notice.message}</p>
        </IonText>
      )}

      {error && (
        <IonText color="danger">
          <p style={{ textAlign: "center", fontSize: 14 }}>{error}</p>
        </IonText>
      )}

      <IonButton expand="block" type="submit" disabled={isLoading} style={{ marginTop: 16 }}>
        {isLoading ? "Ingresando..." : "Ingresar"}
      </IonButton>
    </form>
  );
};

export default LoginForm;