import { IonPage, IonContent } from "@ionic/react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Preparando todo para ti…",
}) => (
  <IonPage className="premium-page">
    <IonContent scrollY={false}>
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6"
        style={{ background: "var(--color-bg-base)" }}
      >
        <div className="flex flex-col items-center" role="status" aria-label="Cargando">
          <div
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-[16px]"
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-hairline)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <svg
              className="h-6 w-6 animate-spin"
              style={{ animationDuration: "0.85s", color: "var(--color-primary)" }}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeOpacity="0.18"
                strokeWidth="2.25"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p
            className="text-center"
            style={{
              fontSize: "var(--text-body)",
              fontWeight: 600,
              color: "var(--color-fg-primary)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            {message}
          </p>
          <p
            className="mt-1 text-center"
            style={{
              fontSize: "var(--text-caption)",
              color: "var(--color-fg-muted)",
            }}
          >
            Un momento, por favor
          </p>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default LoadingScreen;
