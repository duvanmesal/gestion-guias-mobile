import { Route, Switch } from "react-router-dom";
import RoleGuard from "../../../app/routes/guards/RoleGuard";
import RecaladaCreatePage from "../pages/RecaladaCreatePage";
import RecaladaDetailPage from "../pages/RecaladaDetailPage";
import RecaladaEditPage from "../pages/RecaladaEditPage";
import RecaladasListPage from "../pages/RecaladasListPage";

const supervisorRoles = ["SUPERVISOR", "SUPER_ADMIN"] as const;

const RecaladasRoutes: React.FC = () => (
  <Switch>
    <Route path="/recaladas/nueva" exact>
      <RoleGuard allowed={[...supervisorRoles]}>
        <RecaladaCreatePage />
      </RoleGuard>
    </Route>

    <Route path="/recaladas/:id/editar" exact>
      <RoleGuard allowed={[...supervisorRoles]}>
        <RecaladaEditPage />
      </RoleGuard>
    </Route>

    <Route path="/recaladas/:id" exact>
      <RecaladaDetailPage />
    </Route>

    <Route path="/recaladas" exact>
      <RecaladasListPage />
    </Route>
  </Switch>
);

export default RecaladasRoutes;
