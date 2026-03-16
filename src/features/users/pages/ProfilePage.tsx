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
        <div className="min-h-screen w-full bg-[var(--color-bg-base)]">
          {/* Main content */}
          <div className="px-5 pb-10 pt-8 animate-fade-up">
            {/* Header */}
            <header className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <NeuIconBox>
                  <svg
                    className="h-4 w-4"
                    style={{ color: "var(--color-primary)" }}
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
                </NeuIconBox>
                <h1 className="text-xl font-bold text-[var(--color-fg-primary)]">
                  Mi Cuenta
                </h1>
              </div>
              <p className="text-xs text-[var(--color-fg-muted)] ml-11">
                Perfil y configuracion
              </p>
            </header>

            {/* Error state */}
            {error && (
              <NeuCard className="mb-4 p-3 animate-fade-up" inset>
                <div className="flex items-center gap-2.5">
                  <svg
                    className="h-4 w-4 shrink-0"
                    style={{ color: "var(--color-danger)" }}
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
                  <span className="text-xs font-medium text-[var(--color-danger)]">
                    {error instanceof Error
                      ? error.message
                      : "No pude cargar tu cuenta."}
                  </span>
                </div>
              </NeuCard>
            )}

            {/* Loading state */}
            {showInitialLoading && (
              <NeuCard className="mb-4 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                  <div className="flex-1">
                    <div
                      className="h-4 w-32 rounded"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                    <div
                      className="mt-2 h-3 w-48 rounded"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    />
                  </div>
                </div>
                <p className="mt-4 text-sm text-[var(--color-fg-muted)]">
                  Cargando tu perfil...
                </p>
              </NeuCard>
            )}

            {/* Profile content */}
            {!showInitialLoading && user && (
              <ProfileCard
                user={user}
                isRefreshing={isFetching}
                onRefresh={() => {
                  void refetch();
                }}
              />
            )}

            {/* Empty state */}
            {!showInitialLoading && !user && !error && (
              <NeuCard className="p-6 text-center">
                <svg
                  className="mx-auto h-10 w-10 mb-3"
                  style={{ color: "var(--color-fg-muted)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-sm text-[var(--color-fg-secondary)]">
                  No hay datos de perfil disponibles
                </p>
              </NeuCard>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

/* ================================
   NEUMORPHIC COMPONENTS
   ================================ */

const NeuCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}> = ({ children, className = "", inset = false }) => {
  const neuStyles = inset
    ? {
        background: "var(--color-bg-base)",
        boxShadow: "inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.02)",
      }
    : {
        background: "linear-gradient(145deg, #161d24, #121920)",
        boxShadow: "4px 4px 10px rgba(0,0,0,0.4), -2px -2px 8px rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.03)",
      };

  return (
    <div className={`rounded-xl ${className}`} style={neuStyles}>
      {children}
    </div>
  );
};

const NeuIconBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="flex h-8 w-8 items-center justify-center rounded-lg"
    style={{
      background: "linear-gradient(145deg, #161d24, #121920)",
      boxShadow: "3px 3px 6px rgba(0,0,0,0.35), -2px -2px 5px rgba(255,255,255,0.03)",
      border: "1px solid rgba(34,139,84,0.15)",
    }}
  >
    {children}
  </div>
);

export default ProfilePage;
