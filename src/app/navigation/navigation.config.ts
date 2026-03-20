import {
  calendarOutline,
  compassOutline,
  homeOutline,
  personOutline,
  shieldOutline,
} from "ionicons/icons";
import type { Role } from "../../core/auth/types";

export interface AppNavigationItem {
  key: string;
  label: string;
  href: string;
  icon: string;
  roles?: Role[];
}

export const APP_NAVIGATION_ITEMS: AppNavigationItem[] = [
  {
    key: "home",
    label: "Inicio",
    href: "/home",
    icon: homeOutline,
  },
  {
    key: "turnos",
    label: "Turnos",
    href: "/turnos",
    icon: calendarOutline,
  },
  {
    key: "atenciones",
    label: "Atenciones",
    href: "/atenciones",
    icon: compassOutline,
    roles: ["GUIA"],
  },
  {
    key: "recaladas",
    label: "Recaladas",
    href: "/recaladas",
    icon: compassOutline,
    roles: ["SUPERVISOR", "SUPER_ADMIN"],
  },
  {
    key: "admin",
    label: "Admin",
    href: "/admin",
    icon: shieldOutline,
    roles: ["SUPERVISOR", "SUPER_ADMIN"],
  },
  {
    key: "profile",
    label: "Mi cuenta",
    href: "/profile",
    icon: personOutline,
  },
];
