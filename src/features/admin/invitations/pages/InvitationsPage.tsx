import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Button from "../../../../ui/components/Button";
import EmptyStateCard from "../../../../ui/components/EmptyStateCard";
import ErrorState from "../../../../ui/components/ErrorState";
import PageSectionHeader from "../../../../ui/components/PageSectionHeader";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import InvitationFilters from "../components/InvitationFilters";
import InvitationListItem from "../components/InvitationListItem";
import { useInvitationsList } from "../hooks/useInvitationsList";
import { useResendInvitation } from "../hooks/useResendInvitation";
import type {
  InvitationItem,
  InvitationStatus,
} from "../types/invitations.types";

interface InvitationsLocationState {
  feedbackMessage?: string;
}

const InvitationsPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<InvitationsLocationState>();
  const [draftEmail, setDraftEmail] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<InvitationStatus | "">("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const queryParams = useMemo(
    () => ({
      email: email.trim() || undefined,
      status: status || undefined,
    }),
    [email, status]
  );

  const { data, isLoading, isFetching, error, refetch } =
    useInvitationsList(queryParams);
  const resendInvitation = useResendInvitation();

  const items = data ?? [];
  const total = items.length;
  const pendingCount = items.filter((item) => item.status === "PENDING").length;
  const usedCount = items.filter((item) => item.status === "USED").length;
  const expiredCount = items.filter(
    (item) => item.status === "EXPIRED"
  ).length;
  const hasFilters = Boolean(email.trim() || status);

  useEffect(() => {
    if (location.state?.feedbackMessage) {
      setFeedbackMessage(location.state.feedbackMessage);
      history.replace({
        pathname: location.pathname,
        search: location.search,
        state: undefined,
      });
    }
  }, [history, location.pathname, location.search, location.state]);

  async function handleResend(item: InvitationItem) {
    if (item.status === "USED") return;

    const confirmed = window.confirm(
      `¿Deseas reenviar la invitación a ${item.email}? Se regenerará la credencial temporal.`
    );

    if (!confirmed) return;

    setFeedbackMessage(null);

    try {
      await resendInvitation.mutateAsync(item.id);
      setFeedbackMessage(
        `La invitación para ${item.email} fue reenviada correctamente.`
      );
    } catch (resendError) {
      setFeedbackMessage(
        resendError instanceof Error
          ? resendError.message
          : "No pude reenviar la invitación"
      );
    }
  }

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-6 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin / Invitaciones
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Invitaciones
                </h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => {
                  history.push("/admin");
                }}
              >
                Volver
              </Button>
            </div>

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="accent">
              <PageSectionHeader
                title="Alta controlada de usuarios"
                description="Desde aquí puedes crear accesos temporales, revisar su estado y reenviar credenciales cuando sea necesario."
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    onClick={() => {
                      history.push("/admin/invitaciones/nueva");
                    }}
                  >
                    Nueva
                  </Button>
                }
              />

              <div className="grid grid-cols-3 gap-3 text-center">
                <div
                  className="rounded-2xl border px-3 py-3"
                  style={{
                    borderColor: "var(--color-border-glass)",
                    background: "var(--color-input-bg)",
                  }}
                >
                  <p className="text-lg font-bold text-[var(--color-fg-primary)]">
                    {total}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
                    Total
                  </p>
                </div>

                <div
                  className="rounded-2xl border px-3 py-3"
                  style={{
                    borderColor: "var(--color-border-glass)",
                    background: "var(--color-input-bg)",
                  }}
                >
                  <p className="text-lg font-bold text-[var(--color-fg-primary)]">
                    {pendingCount}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
                    Pendientes
                  </p>
                </div>

                <div
                  className="rounded-2xl border px-3 py-3"
                  style={{
                    borderColor: "var(--color-border-glass)",
                    background: "var(--color-input-bg)",
                  }}
                >
                  <p className="text-lg font-bold text-[var(--color-fg-primary)]">
                    {usedCount + expiredCount}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--color-fg-muted)]">
                    Cerradas
                  </p>
                </div>
              </div>
            </SurfaceCard>

            <InvitationFilters
              draftEmail={draftEmail}
              status={status}
              isFetching={isFetching}
              onDraftEmailChange={setDraftEmail}
              onStatusChange={(value) => {
                setStatus(value);
              }}
              onSubmit={() => {
                setFeedbackMessage(null);
                setEmail(draftEmail.trim().toLowerCase());
              }}
              onClear={() => {
                setDraftEmail("");
                setEmail("");
                setStatus("");
                setFeedbackMessage(null);
              }}
            />

            {feedbackMessage ? (
              <div
                className="rounded-2xl border px-4 py-3 text-sm"
                style={{
                  background: feedbackMessage.toLowerCase().includes("no pude")
                    ? "var(--color-danger-soft)"
                    : "var(--color-primary-soft)",
                  borderColor: feedbackMessage.toLowerCase().includes("no pude")
                    ? "var(--color-danger-border)"
                    : "var(--color-border-glow)",
                  color: feedbackMessage.toLowerCase().includes("no pude")
                    ? "var(--color-danger)"
                    : "var(--color-primary)",
                }}
              >
                {feedbackMessage}
              </div>
            ) : null}

            <SurfaceCard className="gap-4 p-4" radius="xl" variant="raised">
              <PageSectionHeader
                title="Listado"
                description="Se muestran las últimas invitaciones creadas, con tope actual de 100 registros desde la API."
              />

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SurfaceCard
                      key={index}
                      className="h-[140px] animate-pulse"
                      radius="lg"
                      variant="inset"
                    >
                      <div />
                    </SurfaceCard>
                  ))}
                </div>
              ) : error ? (
                <ErrorState
                  compact
                  title="No pude cargar las invitaciones"
                  message={
                    error instanceof Error
                      ? error.message
                      : "Ocurrió un problema inesperado."
                  }
                  onRetry={() => {
                    void refetch();
                  }}
                />
              ) : items.length === 0 ? (
                <EmptyStateCard
                  title={
                    hasFilters
                      ? "No encontré invitaciones con esos filtros"
                      : "Aún no hay invitaciones registradas"
                  }
                  description={
                    hasFilters
                      ? "Prueba con otro correo o limpia los filtros para ver el histórico reciente."
                      : "Cuando crees la primera invitación, aquí aparecerá su estado y los datos de seguimiento."
                  }
                  action={
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        history.push("/admin/invitaciones/nueva");
                      }}
                    >
                      Crear invitación
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <InvitationListItem
                      key={item.id}
                      item={item}
                      canResend={item.status !== "USED"}
                      resendLoading={
                        resendInvitation.isPending &&
                        resendInvitation.variables === item.id
                      }
                      onResend={(selected) => {
                        void handleResend(selected);
                      }}
                    />
                  ))}
                </div>
              )}
            </SurfaceCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default InvitationsPage;