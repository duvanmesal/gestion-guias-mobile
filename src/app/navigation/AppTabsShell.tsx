import React, { useEffect } from "react";
import { IonRouterOutlet } from "@ionic/react";
import { Redirect, Route, useLocation } from "react-router-dom";
import { useSessionStore } from "../../core/auth/sessionStore";
import { adminDebug } from "../../core/debug/adminDebug";
import AdminRoutes from "../../features/admin/routes/AdminRoutes";
import HomePage from "../../features/dashboard/pages/HomePage";
import ModulePlaceholderPage from "../../features/dashboard/pages/ModulePlaceholderPage";
import ProfilePage from "../../features/users/pages/ProfilePage";
import { filterNavigationItems } from "../routes/access";
import BottomNavBar from "./BottomNavBar";
import { APP_NAVIGATION_ITEMS } from "./navigation.config";

const AppTabsShell: React.FC = () => {
  const status = useSessionStore((state) => state.status);
  const user = useSessionStore((state) => state.user);
  const location = useLocation();

  const items = filterNavigationItems(APP_NAVIGATION_ITEMS, { status, user });
  const defaultTab = items[0]?.href ?? "/home";

  useEffect(() => {
    adminDebug("AppTabsShell.render", {
      pathname: location.pathname,
      status,
      userRole: user?.role ?? null,
      navItems: items.map((item) => item.href),
      defaultTab,
    });
  }, [defaultTab, items, location.pathname, status, user]);

  return (
    <div className="app-shell app-shell-with-bottom-nav">
      <IonRouterOutlet>
        <Route path="/home" exact>
          <HomePage />
        </Route>

        <Route path="/profile" exact>
          <ProfilePage />
        </Route>

        <Route path="/turnos" exact>
          <ModulePlaceholderPage
            title="Turnos"
            description="Aquí puedes conectar el listado real de turnos, detalle, check-in y check-out sin romper la navegación desde el dashboard."
          />
        </Route>

        <Route path="/atenciones" exact>
          <ModulePlaceholderPage
            title="Atenciones"
            description="Esta ruta queda sembrada para enlazar la toma de turnos disponibles y el resumen operativo de atenciones."
          />
        </Route>

        <Route path="/recaladas" exact>
          <ModulePlaceholderPage
            title="Recaladas"
            description="Este espacio te deja anclar la agenda madre de recaladas y sus próximos hitos sin dejar huecos en la experiencia."
          />
        </Route>

        <AdminRoutes />

        <Route exact path="/">
          <Redirect to={defaultTab} />
        </Route>
      </IonRouterOutlet>

      <BottomNavBar items={items} />
    </div>
  );
};

export default AppTabsShell;