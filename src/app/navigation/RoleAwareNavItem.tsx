import { useHistory, useLocation } from "react-router-dom";
import { useSessionStore } from "../../core/auth/sessionStore";
import BottomNavItem from "./BottomNavItem";
import type { AppNavigationItem } from "./navigation.config";

interface RoleAwareNavItemProps {
  item: AppNavigationItem;
}

const RoleAwareNavItem: React.FC<RoleAwareNavItemProps> = ({ item }) => {
  const history = useHistory();
  const user = useSessionStore((state) => state.user);
  const location = useLocation();

  if (item.roles?.length && (!user?.role || !item.roles.includes(user.role))) {
    return null;
  }

  const isActive =
    location.pathname === item.href ||
    (item.href !== "/home" && location.pathname.startsWith(`${item.href}/`));

  return (
    <BottomNavItem
      item={item}
      isActive={isActive}
      onNavigate={(href) => {
        if (location.pathname !== href) {
          history.push(href);
        }
      }}
    />
  );
};

export default RoleAwareNavItem;
