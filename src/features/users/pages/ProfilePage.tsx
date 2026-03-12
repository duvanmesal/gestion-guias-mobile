import { IonPage, IonContent } from "@ionic/react";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ProfileCard from "../components/ProfileCard";
import { useMyAccount } from "../hooks/useMyAccount";

const ProfilePage: React.FC = () => {
  const storeUser = useSessionStore((s) => s.user);
  const { data, isFetching, isLoading, refetch, error } = useMyAccount();

  const user = data ?? storeUser;
  const showInitialLoading = (isLoading || isFetching) && !user;

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div className="relative min-h-screen w-full bg-[#0F1419]">
          <div
            className="pointer-events-none absolute top-[-5%] right-[-10%] h-[300px] w-[300px] rounded-full opacity-40 blur-[100px]"
            style={{
              background:
                "radial-gradient(circle, #228B54 0%, transparent 70%)",
              animation: "floatOrb1 12s ease-in-out infinite",
            }}
          />
          <div
            className="pointer-events-none absolute left-[-15%] bottom-[20%] h-[250px] w-[250px] rounded-full opacity-35 blur-[90px]"
            style={{
              background:
                "radial-gradient(circle, #BF9B30 0%, transparent 70%)",
              animation: "floatOrb2 14s ease-in-out infinite",
            }}
          />
          <div
            className="pointer-events-none absolute top-[50%] left-[70%] h-[180px] w-[180px] rounded-full opacity-25 blur-[80px]"
            style={{
              background:
                "radial-gradient(circle, #228B54 0%, transparent 70%)",
              animation: "floatOrb3 10s ease-in-out infinite",
            }}
          />

          <div
            className="relative z-10 px-5 pb-10 pt-6"
            style={{ animation: "fadeSlideUp 0.5s ease-out" }}
          >
            <div className="mb-5">
              <div className="mb-1.5 flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34, 139, 84, 0.15) 0%, rgba(34, 139, 84, 0.08) 100%)",
                    border: "1px solid rgba(34, 139, 84, 0.2)",
                  }}
                >
                  <svg
                    className="h-4 w-4"
                    style={{ color: "#228B54" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h1
                    className="text-xl font-bold"
                    style={{ color: "#F5F7FA" }}
                  >
                    Mi Cuenta
                  </h1>
                </div>
              </div>
              <p className="text-xs" style={{ color: "#8A939D" }}>
                Gestiona tu perfil y configuración de cuenta
              </p>
            </div>

            {error && (
              <div
                className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{
                  background: "rgba(185, 55, 55, 0.12)",
                  border: "1px solid rgba(185, 55, 55, 0.3)",
                  animation: "shake 0.4s ease-out",
                }}
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  style={{ color: "#F87171" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span
                  className="text-xs font-medium"
                  style={{ color: "#F87171" }}
                >
                  {error instanceof Error
                    ? error.message
                    : "No pude cargar tu cuenta."}
                </span>
              </div>
            )}

            {showInitialLoading && (
              <div
                className="mb-4 rounded-xl px-3 py-4 text-sm"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  color: "#CBD5E1",
                }}
              >
                Cargando tu perfil...
              </div>
            )}

            {!showInitialLoading && user && (
              <ProfileCard
                user={user}
                isRefreshing={isFetching}
                onRefresh={() => {
                  void refetch();
                }}
              />
            )}

            {!showInitialLoading && !user && !error && (
              <div
                className="rounded-xl px-3 py-4 text-sm"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  color: "#CBD5E1",
                }}
              >
                No hay datos de perfil disponibles en este momento.
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes floatOrb1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -20px) scale(1.05); }
            66% { transform: translate(-20px, 20px) scale(0.95); }
          }
          @keyframes floatOrb2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-25px, 15px) scale(1.1); }
            66% { transform: translate(15px, -25px) scale(0.9); }
          }
          @keyframes floatOrb3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(20px, 30px) scale(1.08); }
          }
          @keyframes fadeSlideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default ProfilePage;
