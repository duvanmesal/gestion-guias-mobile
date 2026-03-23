import { Route, Switch } from "react-router-dom";
import RoleGuard from "../../../app/routes/guards/RoleGuard";
import { adminDebug } from "../../../core/debug/adminDebug";
import BuquesPage from "../catalogs/pages/BuquesPage";
import BuqueUpsertPage from "../catalogs/pages/BuqueUpsertPage";
import CatalogsPage from "../catalogs/pages/CatalogsPage";
import PaisesPage from "../catalogs/pages/PaisesPage";
import PaisUpsertPage from "../catalogs/pages/PaisUpsertPage";
import InvitationCreatePage from "../invitations/pages/InvitationCreatePage";
import InvitationsPage from "../invitations/pages/InvitationsPage";
import AdminPage from "../pages/AdminPage";
import AdminUserCreatePage from "../users/pages/AdminUserCreatePage";
import AdminUsersPage from "../users/pages/AdminUsersPage";
import AdminUserUpsertPage from "../users/pages/AdminUserUpsertPage";

const adminAllowedRoles = ["SUPERVISOR", "SUPER_ADMIN"] as const;

const AdminRoutes: React.FC = () => {
  adminDebug("AdminRoutes.render");

  return (
    <Switch>
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

      <Route path="/admin/catalogos/paises" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <PaisesPage />
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

      <Route path="/admin/catalogos/buques" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <BuquesPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/catalogos" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <CatalogsPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/usuarios/nuevo" exact>
        <RoleGuard allowed={["SUPER_ADMIN"]}>
          <AdminUserCreatePage />
        </RoleGuard>
      </Route>

      <Route path="/admin/usuarios/:id" exact>
        <RoleGuard allowed={["SUPER_ADMIN"]}>
          <AdminUserUpsertPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/usuarios" exact>
        <RoleGuard allowed={["SUPER_ADMIN"]}>
          <AdminUsersPage />
        </RoleGuard>
      </Route>

      <Route path="/admin/invitaciones/nueva" exact>
        <RoleGuard allowed={["SUPER_ADMIN"]}>
          <InvitationCreatePage />
        </RoleGuard>
      </Route>

      <Route path="/admin/invitaciones" exact>
        <RoleGuard allowed={["SUPER_ADMIN"]}>
          <InvitationsPage />
        </RoleGuard>
      </Route>

      <Route path="/admin" exact>
        <RoleGuard allowed={[...adminAllowedRoles]}>
          <AdminPage />
        </RoleGuard>
      </Route>
    </Switch>
  );
};

export default AdminRoutes;