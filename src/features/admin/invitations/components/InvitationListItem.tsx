import Button from "../../../../ui/components/Button";
import SurfaceCard from "../../../../ui/components/SurfaceCard";
import StatusChip from "../../../../ui/components/StatusChip";
import InvitationStatusChip from "./InvitationStatusChip";
import type { InvitationItem } from "../types/invitations.types";

interface InvitationListItemProps {
  item: InvitationItem;
  canResend?: boolean;
  resendLoading?: boolean;
  onResend: (item: InvitationItem) => void;
}

function roleLabel(role: InvitationItem["role"]) {
  switch (role) {
    case "GUIA":
      return "Guía";
    case "SUPERVISOR":
      return "Supervisor";
    case "SUPER_ADMIN":
      return "Super Admin";
    default:
      return role;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Sin dato";

  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildInviterName(item: InvitationItem) {
  if (!item.inviter) return "Sistema";

  const fullName = `${item.inviter.nombres} ${item.inviter.apellidos}`.trim();
  return fullName.length > 0 ? fullName : item.inviter.email;
}

const InvitationListItem: React.FC<InvitationListItemProps> = ({
  item,
  canResend = false,
  resendLoading = false,
  onResend,
}) => (
  <SurfaceCard className="gap-4 p-4" radius="lg" variant="inset">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-[var(--color-fg-primary)]">
          {item.email}
        </h3>
        <p className="mt-1 text-xs leading-5 text-[var(--color-fg-secondary)]">
          Invitó: {buildInviterName(item)}
        </p>
      </div>

      <InvitationStatusChip status={item.status} />
    </div>

    <div className="flex flex-wrap gap-2">
      <StatusChip tone="primary">Rol: {roleLabel(item.role)}</StatusChip>

      {item.user ? (
        <StatusChip
          tone={item.user.profileStatus === "COMPLETE" ? "success" : "info"}
        >
          Perfil:{" "}
          {item.user.profileStatus === "COMPLETE"
            ? "Completo"
            : "Incompleto"}
        </StatusChip>
      ) : (
        <StatusChip tone="neutral">Sin usuario enlazado</StatusChip>
      )}
    </div>

    <div className="grid grid-cols-1 gap-2 text-xs text-[var(--color-fg-secondary)]">
      <p>
        <span className="font-semibold text-[var(--color-fg-primary)]">
          Creada:
        </span>{" "}
        {formatDate(item.createdAt)}
      </p>
      <p>
        <span className="font-semibold text-[var(--color-fg-primary)]">
          Expira:
        </span>{" "}
        {formatDate(item.expiresAt)}
      </p>
      <p>
        <span className="font-semibold text-[var(--color-fg-primary)]">
          Usada:
        </span>{" "}
        {item.usedAt ? formatDate(item.usedAt) : "Aún no"}
      </p>
    </div>

    <div className="flex items-center justify-end gap-2">
      <Button
        variant="secondary"
        size="sm"
        fullWidth={false}
        disabled={!canResend}
        isLoading={resendLoading}
        onClick={() => {
          onResend(item);
        }}
      >
        Reenviar
      </Button>
    </div>
  </SurfaceCard>
);

export default InvitationListItem;