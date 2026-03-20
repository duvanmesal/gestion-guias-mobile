import type { Role } from "../../core/auth/types";
import { getRoleLabel } from "../../features/dashboard/utils/dashboardFormatters";
import StatusChip from "./StatusChip";

export interface RoleBadgeProps {
  className?: string;
  role?: Role | null;
}

function getRoleTone(role?: Role | null) {
  switch (role) {
    case "SUPER_ADMIN":
      return "warning";
    case "SUPERVISOR":
      return "primary";
    case "GUIA":
    default:
      return "info";
  }
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ className = "", role }) => (
  <StatusChip className={className} tone={getRoleTone(role)}>
    {getRoleLabel(role ?? "GUIA")}
  </StatusChip>
);

export default RoleBadge;
