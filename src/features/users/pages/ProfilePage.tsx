import { IonPage, IonContent } from "@ionic/react";
import { useSessionStore } from "../../../core/auth/sessionStore";
import ProfileCard from "../components/ProfileCard";
import { useMyAccount } from "../hooks/useMyAccount";

const ProfilePage: React.FC = () => {
  const storeUser = useSessionStore((s) => s.user);
  const { data, isFetching, isLoading, refetch, error } = useMyAccount();

  const user = data ?? storeUser;
  const showLoading = (isLoading || isFetching) && !user;

  return (
    <IonPage>
      <IonContent scrollY={true}>
        <div style={{ minHeight: "100vh", background: "var(--color-bg-base)", paddingBottom: "1.5rem" }}>

          {showLoading && <LoadingSkeleton />}

          {error && !user && (
            <div style={{ padding: "3rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: "var(--color-danger-soft)", border: "1px solid var(--color-danger-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-fg-primary)" }}>No pude cargar tu cuenta</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-fg-muted)", textAlign: "center" }}>
                {error instanceof Error ? error.message : "Ocurrió un problema inesperado."}
              </p>
            </div>
          )}

          {!showLoading && user && (
            <ProfileCard user={user} isRefreshing={isFetching} onRefresh={() => void refetch()} />
          )}

          {!showLoading && !user && !error && (
            <div style={{ padding: "3rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: "var(--color-primary-glow)", border: "1px solid var(--color-primary-glow)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-fg-primary)" }}>Sin datos de perfil</p>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div>
    {/* Hero skeleton */}
    <div style={{
      background: "var(--gradient-hero-main) 0%, var(--color-bg-base) 55%, var(--color-bg-base) 100%)",
      borderBottom: "1px solid var(--color-primary-glow)",
      padding: "2.5rem 1.25rem 1.75rem",
    }}>
      <div className="animate-pulse" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 70, height: 70, borderRadius: 22, background: "var(--color-primary-glow)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 22, width: "55%", borderRadius: 8, background: "var(--color-glass-medium)", marginBottom: 10 }} />
          <div style={{ height: 13, width: "75%", borderRadius: 6, background: "var(--color-glass-soft)" }} />
          <div style={{ height: 20, width: 80, borderRadius: 9999, background: "var(--color-primary-glow)", marginTop: 10 }} />
        </div>
      </div>
    </div>
    {/* Card skeletons */}
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.25rem" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse" style={{
          height: 130, borderRadius: 20, marginBottom: 14,
          background: "var(--color-glass-subtle)", border: "1px solid var(--color-glass-soft)",
          animationDelay: `${i * 80}ms`,
        }} />
      ))}
    </div>
  </div>
);

export default ProfilePage;
