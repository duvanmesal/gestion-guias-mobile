import { Route, Switch } from "react-router-dom";
import TurnoDetailPage from "../pages/TurnoDetailPage";
import TurnosListPage from "../pages/TurnosListPage";

const TurnosRoutes: React.FC = () => (
  <Switch>
    <Route path="/turnos/:id(\d+)" exact>
      <TurnoDetailPage />
    </Route>
    <Route path="/turnos" exact>
      <TurnosListPage />
    </Route>
  </Switch>
);

export default TurnosRoutes;
