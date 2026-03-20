import StatusChip from "../../../../ui/components/StatusChip";
import type { InvitationStatus } from "../types/invitations.types";

interface InvitationStatusChipProps {
  status: InvitationStatus;
}

const statusCopy: Record<InvitationStatus, string> = {
  PENDING: "Pendiente",
  USED: "Usada",
  EXPIRED: "Expirada",
};

const statusTone: Record<
  InvitationStatus,
  "warning" | "success" | "danger"
> = {
  PENDING: "warning",
  USED: "success",
  EXPIRED: "danger",
};

const InvitationStatusChip: React.FC<InvitationStatusChipProps> = ({
  status,
}) => (
  <StatusChip tone={statusTone[status]} dot>
    {statusCopy[status]}
  </StatusChip>
);

export default InvitationStatusChip;