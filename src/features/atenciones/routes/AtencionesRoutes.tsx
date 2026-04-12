import { Route, Switch } from "react-router-dom";
import RoleGuard from "../../../app/routes/guards/RoleGuard";
import AtencionCreatePage from "../pages/AtencionCreatePage";
import AtencionDetailPage from "../pages/AtencionDetailPage";
import AtencionEditPage from "../pages/AtencionEditPage";
import AtencionesListPage from "../pages/AtencionesListPage";

const supervisorRoles = ["SUPERVISOR", "SUPER_ADMIN"] as const;

const AtencionesRoutes: React.FC = () => (
  <Switch>
    <Route path="/atenciones/nueva" exact>
      <RoleGuard allowed={[...supervisorRoles]}>
        <AtencionCreatePage />
      </RoleGuard>
    </Route>

    <Route path="/atenciones/:id(\d+)/editar" exact>
      <RoleGuard allowed={[...supervisorRoles]}>
        <AtencionEditPage />
      </RoleGuard>
    </Route>

    <Route path="/atenciones/:id(\d+)" exact>
      <AtencionDetailPage />
    </Route>

    <Route path="/atenciones" exact>
      <AtencionesListPage />
    </Route>
  </Switch>
);

export default AtencionesRoutes;
