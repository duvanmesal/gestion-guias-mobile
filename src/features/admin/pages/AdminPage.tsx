import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import { adminDebug } from "../../../core/debug/adminDebug";
import AdminEntryCard from "../components/AdminEntryCard";
import AdminModuleList from "../components/AdminModuleList";

/* ── Module icons (Feather-style strokes) ── */
const Icons = {
  catalog: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  mail: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  users: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  user: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

const AdminPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const user = useSessionStore((state) => state.user);

  const roleLabel =
    user?.role === "SUPER_ADMIN" ? "Super Admin" : "Supervisor";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const adminItems = useMemo(
    () => [
      {
        key: "catalogos",
        title: "Catálogos",
        description: "Países, buques y catálogos maestros.",
        onOpen: () => history.push("/admin/catalogos"),
        tone: "cyan" as const,
        icon: Icons.catalog,
      },
      {
        key: "invitaciones",
        title: "Invitaciones",
        description: "Alta de usuarios por correo y accesos.",
        onOpen: () => history.push("/admin/invitaciones"),
        badge: isSuperAdmin ? "S. Admin" : undefined,
        helperText: !isSuperAdmin ? "Requiere rol Super Admin." : undefined,
        disabled: !isSuperAdmin,
        tone: "teal" as const,
        icon: Icons.mail,
      },
      {
        key: "users",
        title: "Usuarios",
        description: "Gestión global de usuarios y roles.",
        onOpen: () => history.push("/admin/usuarios"),
        badge: isSuperAdmin ? "S. Admin" : undefined,
        helperText: !isSuperAdmin ? "Requiere rol Super Admin." : undefined,
        disabled: !isSuperAdmin,
        tone: "amber" as const,
        icon: Icons.users,
      },
      {
        key: "profile",
        title: "Mi cuenta",
        description: "Perfil, seguridad y sesión actual.",
        onOpen: () => history.push("/profile"),
        tone: "violet" as const,
        icon: Icons.user,
      },
    ],
    [history, isSuperAdmin]
  );

  useEffect(() => {
    adminDebug("AdminPage.mounted", {
      pathname: location.pathname,
      userRole: user?.role ?? null,
      itemKeys: adminItems.map((item) => item.key),
    });

    return () => {
      adminDebug("AdminPage.unmounted", {
        pathname: location.pathname,
      });
    };
  }, [adminItems, location.pathname, user]);

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-4 pb-6 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <AdminEntryCard
              title="Centro administrativo"
              description=""
              roleLabel={roleLabel}
            />

            <AdminModuleList
              title="Módulos administrativos"
              items={adminItems}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;
