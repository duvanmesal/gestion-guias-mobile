import { IonContent, IonPage } from "@ionic/react";
import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { adminDebug } from "../../../../core/debug/adminDebug";
import Button from "../../../../ui/components/Button";
import SurfaceCard from "../../../../ui/components/SurfaceCard";

const CatalogsPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    adminDebug("CatalogsPage.mounted", {
      pathname: location.pathname,
    });

    return () => {
      adminDebug("CatalogsPage.unmounted", {
        pathname: location.pathname,
      });
    };
  }, [location.pathname]);

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="min-h-screen bg-[var(--color-bg-base)] px-5 pb-28 pt-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
                  Admin
                </p>
                <h1 className="mt-1 text-xl font-bold text-[var(--color-fg-primary)]">
                  Catálogos
                </h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => {
                  history.push("/admin");
                }}
              >
                Volver
              </Button>
            </div>

            <SurfaceCard className="gap-3 p-5" radius="xl" variant="accent">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
                Catálogos maestros
              </p>
              <h2 className="text-xl font-bold text-[var(--color-fg-primary)]">
                Base administrativa del sistema
              </h2>
              <p className="text-sm leading-6 text-[var(--color-fg-secondary)]">
                Desde aquí administras los datos maestros del producto. Países y
                Buques ya quedan conectados como submódulos reales dentro de
                Admin.
              </p>
            </SurfaceCard>

            <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-fg-primary)]">
                  Países
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--color-fg-muted)]">
                  Catálogo base para banderas, relaciones operativas y filtros
                  administrativos.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  history.push("/admin/catalogos/paises");
                }}
              >
                Abrir catálogo de países
              </Button>
            </SurfaceCard>

            <SurfaceCard className="gap-3 p-4" radius="xl" variant="raised">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-fg-primary)]">
                  Buques
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--color-fg-muted)]">
                  Catálogo de cruceros con país de bandera, naviera, capacidad y
                  estado operativo.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  history.push("/admin/catalogos/buques");
                }}
              >
                Abrir catálogo de buques
              </Button>
            </SurfaceCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CatalogsPage;