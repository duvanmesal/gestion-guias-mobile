import { IonPage, IonContent } from "@ionic/react";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ProfileCard from "../components/ProfileCard";
import { useMyAccount } from "../hooks/useMyAccount";

const ProfilePage: React.FC = () => {
  const storeUser = useSessionStore((s) => s.user);
  const { data, isFetching, refetch, error } = useMyAccount();

  const user = data ?? storeUser;

  return (
    <IonPage>
      <IonContent scrollY={true}>
        {/* Full-screen premium container */}
        <div className="relative min-h-screen w-full bg-[#0F1419]">
          {/* Animated floating orbs */}
          <div
            className="pointer-events-none absolute top-[-5%] right-[-10%] h-[300px] w-[300px] rounded-full opacity-40 blur-[100px]"
            style={{
              background: "radial-gradient(circle, #228B54 0%, transparent 70%)",
              animation: "floatOrb1 12s ease-in-out infinite",
            }}
          />
          <div
            className="pointer-events-none absolute left-[-15%] bottom-[20%] h-[250px] w-[250px] rounded-full opacity-35 blur-[90px]"
            style={{
              background: "radial-gradient(circle, #BF9B30 0%, transparent 70%)",
              animation: "floatOrb2 14s ease-in-out infinite",
            }}
          />
          <div
            className="pointer-events-none absolute top-[50%] left-[70%] h-[180px] w-[180px] rounded-full opacity-25 blur-[80px]"
            style={{
              background: "radial-gradient(circle, #228B54 0%, transparent 70%)",
              animation: "floatOrb3 10s ease-in-out infinite",
            }}
          />

          {/* Main content */}
          <div
            className="relative z-10 px-5 pb-12 pt-8"
            style={{ animation: "fadeSlideUp 0.6s ease-out" }}
          >
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(34, 139, 84, 0.2) 0%, rgba(34, 139, 84, 0.1) 100%)",
                    border: "1px solid rgba(34, 139, 84, 0.3)",
                  }}
                >
                  <svg
                    className="h-5 w-5"
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
                  <h1 className="text-2xl font-bold" style={{ color: "#F5F7FA" }}>
                    Mi Cuenta
                  </h1>
                </div>
              </div>
              <p className="text-sm" style={{ color: "#8A939D" }}>
                Gestiona tu perfil y configuración de cuenta
              </p>
            </div>

            {/* Error State */}
            {error && (
              <div
                className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(185, 55, 55, 0.15)",
                  border: "1px solid rgba(185, 55, 55, 0.4)",
                  animation: "shake 0.4s ease-out",
                }}
              >
                <svg
                  className="h-5 w-5 shrink-0"
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
                <span className="text-sm font-medium" style={{ color: "#F87171" }}>
                  {error instanceof Error ? error.message : "No pude cargar tu cuenta."}
                </span>
              </div>
            )}

            {/* Profile Card */}
            {user && (
              <ProfileCard
                user={user}
                isRefreshing={isFetching}
                onRefresh={() => {
                  void refetch();
                }}
              />
            )}
          </div>
        </div>

        {/* Keyframe animations */}
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
