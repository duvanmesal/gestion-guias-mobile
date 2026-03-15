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
        <div className="relative min-h-screen overflow-hidden bg-[#0F1419] px-5 py-8">
          <div
            className="pointer-events-none absolute right-[-10%] top-[-5%] h-[220px] w-[220px] rounded-full opacity-35 blur-[90px]"
            style={{
              background:
                "radial-gradient(circle, rgba(34,139,84,0.85) 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute bottom-[5%] left-[-10%] h-[180px] w-[180px] rounded-full opacity-20 blur-[80px]"
            style={{
              background:
                "radial-gradient(circle, rgba(191,155,48,0.85) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-xl flex-col justify-center">
            <div
              className="rounded-[28px] border px-6 py-7"
              style={{
                background:
                  "linear-gradient(180deg, rgba(17,24,39,0.88) 0%, rgba(15,20,25,0.96) 100%)",
                borderColor: "rgba(255,255,255,0.09)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
              }}
            >
              <div
                className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(34,139,84,0.28) 0%, rgba(191,155,48,0.16) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  style={{ color: "#F5F7FA" }}
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
                style={{ color: "#BF9B30" }}
              >
                Módulo en preparación
              </p>

              <h1 className="text-3xl font-bold" style={{ color: "#F5F7FA" }}>
                {title}
              </h1>

              <p
                className="mt-3 text-sm leading-6"
                style={{ color: "#AAB4BE" }}
              >
                {description}
              </p>

              <div
                className="mt-6 rounded-2xl border px-4 py-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "#F5F7FA" }}
                >
                  Ya está listo el cascarón de navegación ✨
                </p>
                <p className="mt-1 text-sm" style={{ color: "#8A939D" }}>
                  Esto evita rutas muertas mientras el módulo operativo termina
                  de construirse.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => history.push("/home")}
                  className="rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, #228B54 0%, #1A6E43 100%)",
                    color: "#F5F7FA",
                  }}
                >
                  Volver al dashboard
                </button>

                <button
                  type="button"
                  onClick={() => history.push("/profile")}
                  className="rounded-2xl border px-4 py-3 text-sm font-semibold transition active:scale-[0.98]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "#E5E7EB",
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