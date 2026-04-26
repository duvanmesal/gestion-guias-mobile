import { IonContent, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";

interface ModulePlaceholderPageProps {
  title: string;
  description: string;
}

const ModulePlaceholderPage: React.FC<ModulePlaceholderPageProps> = ({
  title,
  description,
}) => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div
          className="relative min-h-screen overflow-hidden px-5 py-8"
          style={{ background: "var(--color-bg-base)" }}
        >
          <div
            className="pointer-events-none absolute right-[-10%] top-[-5%] h-[220px] w-[220px] rounded-full opacity-35 blur-[90px]"
            style={{ background: "radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute bottom-[5%] left-[-10%] h-[180px] w-[180px] rounded-full opacity-20 blur-[80px]"
            style={{ background: "radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)" }}
          />

          <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-xl flex-col justify-center">
            <div
              className="rounded-[28px] border px-6 py-7"
              style={{
                background: "var(--gradient-card)",
                borderColor: "var(--color-border-glass)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div
                className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, var(--color-primary-soft) 0%, var(--color-accent-soft) 100%)",
                  border: "1px solid var(--color-border-glass)",
                }}
              >
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  style={{ color: "var(--color-fg-primary)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <p
                className="mb-2 text-sm uppercase tracking-[0.24em]"
                style={{ color: "var(--color-accent)" }}
              >
                Módulo en preparación
              </p>

              <h1 className="text-3xl font-bold" style={{ color: "var(--color-fg-primary)" }}>
                {title}
              </h1>

              <p className="mt-3 text-sm leading-6" style={{ color: "var(--color-fg-secondary)" }}>
                {description}
              </p>

              <div
                className="mt-6 rounded-2xl border px-4 py-4"
                style={{
                  background: "var(--color-glass-subtle)",
                  borderColor: "var(--color-border-glass)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--color-fg-primary)" }}>
                  Ya está listo el cascarón de navegación ✨
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-fg-muted)" }}>
                  Esto evita rutas muertas mientras el módulo operativo termina de construirse.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => history.push("/home")}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98]"
                  style={{
                    background: "var(--gradient-primary)",
                    color: "var(--color-fg-primary)",
                  }}
                >
                  Volver al dashboard
                </button>

                <button
                  type="button"
                  onClick={() => history.push("/profile")}
                  className="rounded-2xl border px-4 py-3 text-sm font-semibold transition active:scale-[0.98]"
                  style={{
                    background: "var(--color-glass-subtle)",
                    borderColor: "var(--color-border-glass)",
                    color: "var(--color-fg-secondary)",
                  }}
                >
                  Ir a mi cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ModulePlaceholderPage;
