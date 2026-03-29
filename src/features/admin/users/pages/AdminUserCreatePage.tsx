import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../../../ui/components/Button";
import AdminUserForm, {
  type AdminUserCreateFormValues,
} from "../components/AdminUserForm";
import { useCreateAdminUser } from "../hooks/useCreateAdminUser";

const AdminUserCreatePage: React.FC = () => {
  const history = useHistory();
  const createUser = useCreateAdminUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(values: AdminUserCreateFormValues) {
    setErrorMessage(null);

    try {
      const created = await createUser.mutateAsync(values);
      history.replace(`/admin/usuarios/${created.id}`, {
        feedbackMessage: `El usuario ${created.email} fue creado correctamente.`,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No pude crear el usuario"
      );
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-32 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin / Usuarios
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Nuevo usuario
                </h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => {
                  history.push("/admin/usuarios");
                }}
              >
                Volver
              </Button>
            </div>

            <AdminUserForm
              mode="create"
              isLoading={createUser.isPending}
              error={errorMessage}
              onCancel={() => {
                history.push("/admin/usuarios");
              }}
              onSubmit={(values: AdminUserCreateFormValues) => {
                void handleSubmit(values);
              }}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminUserCreatePage;
