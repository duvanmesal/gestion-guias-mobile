import { IonPage, IonContent } from "@ionic/react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Preparando todo para ti...",
}) => (
  <IonPage className="premium-page">
    <IonContent scrollY={false}>
      <div
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
        style={{ background: "var(--color-bg-base)" }}
      >
        {/* Subtle animated orbs */}
        <div
          className="orb orb-primary animate-float-orb"
          style={{
            width: 200,
            height: 200,
            top: "10%",
            left: "-10%",
            opacity: 0.4,
          }}
        />
        <div
          className="orb orb-accent animate-float-orb-delayed"
          style={{
            width: 150,
            height: 150,
            bottom: "15%",
            right: "-5%",
            opacity: 0.3,
          }}
        />

        {/* Main loading content */}
        <div className="relative z-10 flex flex-col items-center animate-fade-up">
          {/* Premium loading indicator */}
          <div
            className="relative mb-8"
            role="status"
            aria-label="Cargando"
          >
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full animate-pulse-subtle"
              style={{
                background: "var(--color-primary-glow)",
                filter: "blur(20px)",
                transform: "scale(1.5)",
              }}
            />

            {/* Main spinner container */}
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(145deg, rgba(25, 32, 40, 0.9), rgba(15, 20, 25, 0.95))",
                border: "1px solid var(--color-border-glass)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Spinning arc */}
              <svg
                className="absolute h-full w-full animate-spin"
                style={{ animationDuration: "1.5s" }}
                viewBox="0 0 80 80"
                fill="none"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="var(--color-border-glass)"
                  strokeWidth="3"
                />
                <path
                  d="M40 4 A36 36 0 0 1 76 40"
                  stroke="url(#loadingGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-accent)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center icon */}
              <svg
                className="relative h-8 w-8"
                style={{ color: "var(--color-primary)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>

          {/* Loading message */}
          <p
            className="text-center text-base font-medium"
            style={{ color: "var(--color-fg-secondary)" }}
          >
            {message}
          </p>

          {/* Subtle helper text */}
          <p
            className="mt-2 text-center text-sm"
            style={{ color: "var(--color-fg-muted)" }}
          >
            Un momento, por favor
          </p>
        </div>
      </div>
    </IonContent>
  </IonPage>
);

export default LoadingScreen;
