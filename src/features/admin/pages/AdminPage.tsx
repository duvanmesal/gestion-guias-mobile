import { IonContent, IonPage } from "@ionic/react";
import { useEffect, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import { adminDebug } from "../../../core/debug/adminDebug";
import AdminEntryCard from "../components/AdminEntryCard";
import AdminModuleList from "../components/AdminModuleList";

const AdminPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const user = useSessionStore((state) => state.user);

  const roleLabel = user?.role === "SUPER_ADMIN" ? "Super Admin" : "Supervisor";

  const adminItems = useMemo(
    () => [
      {
        key: "catalogos",
        title: "Catálogos",
        description:
          "Centro administrativo para países y los próximos catálogos maestros del sistema.",
        onOpen: () => history.push("/admin/catalogos"),
      },
      {
        key: "users",
        title: "Gestión de usuarios",
        description:
          "Módulo reservado para altas, seguimiento y administración avanzada de usuarios.",
        onOpen: () => {},
      },
      {
        key: "profile",
        title: "Mi cuenta",
        description:
          "Atajo para revisar datos del perfil, seguridad y estado de la sesión actual.",
        onOpen: () => history.push("/profile"),
      },
    ],
    [history]
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
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-36 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-5">
            <AdminEntryCard
              title="Centro administrativo"
              description="Aquí vive todo lo que no debe ir en el bottom nav operativo. El primer bloque que abrimos es Catálogos, empezando por Países."
              roleLabel={roleLabel}
            />

            <AdminModuleList
              title="Módulos administrativos"
              items={adminItems}
            />

            <section
              className="rounded-[24px] border px-4 py-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--color-fg-primary)" }}
              >
                Ruta administrativa escalable
              </p>
              <p
                className="mt-2 text-sm leading-6"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Admin queda como hub y sus submódulos viven bajo{" "}
                <code>/admin/*</code>, así evitamos meter catálogos y gestión de
                usuarios en la barra inferior.
              </p>
            </section>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;