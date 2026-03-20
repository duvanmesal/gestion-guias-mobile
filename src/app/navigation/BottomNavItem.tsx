import { IonIcon } from "@ionic/react";
import type { AppNavigationItem } from "./navigation.config";

interface BottomNavItemProps {
  item: AppNavigationItem;
  isActive: boolean;
  onNavigate: (href: string) => void;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({
  item,
  isActive,
  onNavigate,
}) => (
  <button
    type="button"
    className={`app-bottom-nav__item${isActive ? " app-bottom-nav__item--active" : ""}`}
    onClick={() => onNavigate(item.href)}
    aria-current={isActive ? "page" : undefined}
  >
    <span className="app-bottom-nav__icon-shell" aria-hidden="true">
      <IonIcon icon={item.icon} />
    </span>
    <span className="app-bottom-nav__label">{item.label}</span>
  </button>
);

export default BottomNavItem;
