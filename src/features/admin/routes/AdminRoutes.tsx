import { Route } from "react-router-dom";
import RoleGuard from "../../../app/routes/guards/RoleGuard";
import { adminDebug } from "../../../core/debug/adminDebug";
import CatalogsPage from "../catalogs/pages/CatalogsPage";
import BuquesPage from "../catalogs/pages/BuquesPage";
import BuqueUpsertPage from "../catalogs/pages/BuqueUpsertPage";
import PaisesPage from "../catalogs/pages/PaisesPage";
import PaisUpsertPage from "../catalogs/pages/PaisUpsertPage";
import AdminPage from "../pages/AdminPage";

const adminAllowedRoles = ["SUPERVISOR", "SUPER_ADMIN"] as const;

const AdminRoutes: React.FC = () => {
  adminDebug("AdminRoutes.render");

  return (
    <>
      <Route path="/admin" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <AdminPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/catalogos" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <CatalogsPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/catalogos/paises" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <PaisesPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/catalogos/paises/nuevo" exact>
        <RoleGuard allowed={["SUPER_ADMIN"]}>
          <PaisUpsertPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/catalogos/paises/:id" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <PaisUpsertPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/catalogos/buques" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <BuquesPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/catalogos/buques/nuevo" exact>
        <RoleGuard allowed={["SUPER_ADMIN"]}>
          <BuqueUpsertPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/catalogos/buques/:id" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <BuqueUpsertPage />
        </RoleGuard>
      </Route>
    </>
  );
};

export default AdminRoutes;