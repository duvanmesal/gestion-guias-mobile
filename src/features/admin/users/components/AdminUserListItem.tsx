import { useHistory } from "react-router-dom";
import EntityListRow from "../../../../ui/components/EntityListRow";
import RoleBadge from "../../../../ui/components/RoleBadge";
import StatusChip from "../../../../ui/components/StatusChip";
import type { AdminUserListItem } from "../types/adminUsers.types";

interface AdminUserListItemProps {
  item: AdminUserListItem;
}

function getActiveTone(activo: boolean) {
  return activo ? "success" : "danger";
}

function getProfileTone(profileStatus: AdminUserListItem["profileStatus"]) {
  return profileStatus === "COMPLETE" ? "primary" : "warning";
}

function getProfileLabel(profileStatus: AdminUserListItem["profileStatus"]) {
  return profileStatus === "COMPLETE" ? "Perfil completo" : "Perfil incompleto";
}

const AdminUserListItemRow: React.FC<AdminUserListItemProps> = ({ item }) => {
  const history = useHistory();

  return (
    <button
      type="button"
      className="block w-full text-left"
      onClick={() => {
        history.push(`/admin/usuarios/${item.id}`);
      }}
    >
      <EntityListRow
        title={`${item.nombres} ${item.apellidos}`.trim() || item.email}
        subtitle={item.email}
        metadata={
          <div className="flex flex-col items-end gap-2">
            <RoleBadge role={item.rol} />
            <StatusChip tone={getActiveTone(item.activo)}>
              {item.activo ? "Activo" : "Inactivo"}
            </StatusChip>
          </div>
        }
        action={
          <StatusChip tone={getProfileTone(item.profileStatus)}>
            {getProfileLabel(item.profileStatus)}
          </StatusChip>
        }
      />
    </button>
  );
};

export default AdminUserListItemRow;