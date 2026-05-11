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
              <div
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--color-danger-soft)", border: "1px solid var(--color-danger-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p
                style={{
                  fontSize: "var(--text-body)",
                  fontWeight: 600,
                  color: "var(--color-fg-primary)",
                  letterSpacing: "var(--tracking-tight)",
                }}
              >
                No pude cargar tu cuenta
              </p>
              <p
                style={{
                  fontSize: "var(--text-caption)",
                  color: "var(--color-fg-muted)",
                  textAlign: "center",
                  maxWidth: 280,
                  lineHeight: "var(--leading-base)",
                }}
              >
                {error instanceof Error ? error.message : "Ocurrió un problema inesperado."}
              </p>
            </div>
          )}

          {!showLoading && user && (
            <ProfileCard user={user} isRefreshing={isFetching} onRefresh={() => void refetch()} />
          )}

          {!showLoading && !user && !error && (
            <div style={{ padding: "3rem 1.25rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "var(--color-primary-soft)", border: "1px solid var(--color-border-hairline)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p
                style={{
                  fontSize: "var(--text-body)",
                  fontWeight: 600,
                  color: "var(--color-fg-primary)",
                  letterSpacing: "var(--tracking-tight)",
                }}
              >
                Sin datos de perfil
              </p>
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
    <div
      style={{
        background: "var(--color-bg-elevated)",
        borderBottom: "1px solid var(--color-border-hairline)",
        padding: "52px 20px 20px",
      }}
    >
      <div className="animate-pulse" style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--color-bg-subtle)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 18, width: "55%", borderRadius: 6, background: "var(--color-bg-subtle)", marginBottom: 8 }} />
          <div style={{ height: 12, width: "75%", borderRadius: 4, background: "var(--color-bg-subtle)" }} />
          <div style={{ height: 18, width: 70, borderRadius: 9999, background: "var(--color-bg-subtle)", marginTop: 10 }} />
        </div>
      </div>
    </div>
    {/* Card skeletons */}
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 16px 24px" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            height: 120, borderRadius: 16, marginBottom: 12,
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-hairline)",
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  </div>
);

export default ProfilePage;
