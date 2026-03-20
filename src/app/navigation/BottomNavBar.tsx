import RoleAwareNavItem from "./RoleAwareNavItem";
import type { AppNavigationItem } from "./navigation.config";

interface BottomNavBarProps {
  items: AppNavigationItem[];
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ items }) => (
  <nav className="app-bottom-nav" aria-label="Navegacion principal">
    <div className="app-bottom-nav__inner">
      {items.map((item) => (
        <RoleAwareNavItem key={item.key} item={item} />
      ))}
    </div>
  </nav>
);

export default BottomNavBar;
