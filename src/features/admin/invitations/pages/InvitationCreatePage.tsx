import { IonContent, IonPage } from "@ionic/react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../../../ui/components/Button";
import InvitationForm, {
  type InvitationFormValues,
} from "../components/InvitationForm";
import { useCreateInvitation } from "../hooks/useCreateInvitation";

const InvitationCreatePage: React.FC = () => {
  const history = useHistory();
  const createInvitation = useCreateInvitation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [helperMessage, setHelperMessage] = useState<string | null>(null);

  async function handleSubmit(values: InvitationFormValues) {
    setSubmitError(null);
    setHelperMessage(null);

    try {
      const result = await createInvitation.mutateAsync(values);

      const actionLabel =
        result?.action === "RESENT"
          ? "La invitación existente fue regenerada y reenviada."
          : "La invitación fue creada correctamente.";

      const tempPasswordLabel = result?.tempPassword
        ? ` Contraseña temporal dev: ${result.tempPassword}`
        : "";

      history.replace({
        pathname: "/admin/invitaciones",
        state: {
          feedbackMessage: `${actionLabel}${tempPasswordLabel}`,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pude crear la invitación";

      setSubmitError(message);
      setHelperMessage(null);
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-28 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => {
                  history.goBack();
                }}
              >
                Volver
              </Button>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin / Invitaciones
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Nueva invitación
                </h1>
              </div>
            </div>

            <InvitationForm
              isLoading={createInvitation.isPending}
              error={submitError}
              helperMessage={helperMessage}
              onCancel={() => {
                history.goBack();
              }}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InvitationCreatePage;