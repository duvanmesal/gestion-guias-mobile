import { IonContent, IonPage } from "@ionic/react";
import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { adminDebug } from "../../../../core/debug/adminDebug";
import Button from "../../../../ui/components/Button";

const FlagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const ShipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1" />
    <path d="M4 18l-1-5h18l-2 5M12 2v3M8 7h8M6 11V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

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

            {/* Page header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-eyebrow)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "var(--tracking-eyebrow)",
                    color: "var(--color-fg-muted)",
                  }}
                >
                  Admin
                </p>
                <h1
                  style={{
                    margin: "4px 0 0",
                    fontSize: "var(--text-display)",
                    fontWeight: 700,
                    color: "var(--color-fg-primary)",
                    letterSpacing: "var(--tracking-tight)",
                    lineHeight: "var(--leading-tight)",
                  }}
                >
                  Catálogos
                </h1>
              </div>

              <Button
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => history.push("/admin")}
              >
                Volver
              </Button>
            </div>

            {/* Intro card */}
            <section
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-hairline)",
                borderRadius: 16,
                boxShadow: "var(--shadow-card)",
                padding: "1rem 1.125rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--text-eyebrow)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-eyebrow)",
                  color: "var(--color-fg-muted)",
                }}
              >
                Catálogos maestros
              </p>
              <h2
                style={{
                  margin: "4px 0 0",
                  fontSize: "var(--text-subhead)",
                  fontWeight: 700,
                  color: "var(--color-fg-primary)",
                  letterSpacing: "var(--tracking-tight)",
                  lineHeight: "var(--leading-tight)",
                }}
              >
                Base administrativa del sistema
              </h2>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "var(--text-caption)",
                  color: "var(--color-fg-muted)",
                  lineHeight: "var(--leading-base)",
                }}
              >
                Desde aquí administras los datos maestros del producto. Países y
                Buques son los submódulos disponibles dentro de Admin.
              </p>
            </section>

            {/* Catalog tiles */}
            <CatalogTile
              eyebrow="Catálogo · Geografía"
              title="Países"
              description="Catálogo base para banderas, relaciones operativas y filtros administrativos."
              icon={<FlagIcon />}
              onClick={() => history.push("/admin/catalogos/paises")}
            />

            <CatalogTile
              eyebrow="Catálogo · Flota"
              title="Buques"
              description="Cruceros con país de bandera, naviera, capacidad y estado operativo."
              icon={<ShipIcon />}
              onClick={() => history.push("/admin/catalogos/buques")}
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const CatalogTile: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ eyebrow, title, description, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-left transition-colors active:translate-y-px"
    style={{
      background: "var(--color-bg-elevated)",
      border: "1px solid var(--color-border-hairline)",
      borderRadius: 16,
      boxShadow: "var(--shadow-card)",
      padding: "1rem 1.125rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}
  >
    <div
      style={{
        flexShrink: 0,
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "var(--color-primary-soft)",
        border: "1px solid var(--color-primary-soft)",
        color: "var(--color-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>

    <div className="min-w-0 flex-1">
      <p
        style={{
          margin: 0,
          fontSize: "var(--text-eyebrow)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-eyebrow)",
          color: "var(--color-fg-muted)",
        }}
      >
        {eyebrow}
      </p>
      <h3
        style={{
          margin: "2px 0 0",
          fontSize: "var(--text-subhead)",
          fontWeight: 700,
          color: "var(--color-fg-primary)",
          letterSpacing: "var(--tracking-tight)",
          lineHeight: "var(--leading-tight)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: "var(--text-caption)",
          color: "var(--color-fg-muted)",
          lineHeight: "var(--leading-base)",
        }}
      >
        {description}
      </p>
    </div>

    <span style={{ flexShrink: 0, color: "var(--color-fg-muted)" }}>
      <ChevronRight />
    </span>
  </button>
);

export default CatalogsPage;
