import { Redirect, Route } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import { useSessionStore } from "../../core/auth/sessionStore";

import LoginPage from "../../features/auth/pages/LoginPage";
import VerifyEmailPage from "../../features/auth/pages/VerifyEmailPage";
import OnboardingPage from "../../features/users/pages/OnboardingPage";
import ProfilePage from "../../features/users/pages/ProfilePage";
import LoadingScreen from "../../ui/components/LoadingScreen";

const ProtectedRoute: React.FC<{
  path: string;
  exact?: boolean;
  children: React.ReactNode;
}> = ({ path, exact, children }) => {
  const status = useSessionStore((s) => s.status);

  return (
    <Route
      path={path}
      exact={exact}
      render={({ location }) => {
        if (status === "loading") return <LoadingScreen />;
        if (status !== "authed") {
          return <Redirect to={{ pathname: "/login", state: { from: location } }} />;
        }
        return <>{children}</>;
      }}
    />
  );
};

const AppRoutes: React.FC = () => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);

  const emailVerified = !!user?.emailVerifiedAt;
  const profileStatus = user?.profileStatus;

  return (
    <IonRouterOutlet>
      <Route path="/login" exact>
        {status === "authed" ? <Redirect to="/" /> : <LoginPage />}
      </Route>

      <ProtectedRoute path="/verify-email" exact>
        {emailVerified ? (
          profileStatus === "INCOMPLETE" ? <Redirect to="/onboarding" /> : <Redirect to="/" />
        ) : (
          <VerifyEmailPage />
        )}
      </ProtectedRoute>

      <ProtectedRoute path="/onboarding" exact>
        {!emailVerified ? (
          <Redirect to="/verify-email" />
        ) : profileStatus === "COMPLETE" ? (
          <Redirect to="/" />
        ) : (
          <OnboardingPage />
        )}
      </ProtectedRoute>

      <ProtectedRoute path="/profile" exact>
        {!emailVerified ? (
          <Redirect to="/verify-email" />
        ) : profileStatus === "INCOMPLETE" ? (
          <Redirect to="/onboarding" />
        ) : (
          <ProfilePage />
        )}
      </ProtectedRoute>

      <ProtectedRoute path="/" exact>
        {!emailVerified ? (
          <Redirect to="/verify-email" />
        ) : profileStatus === "INCOMPLETE" ? (
          <Redirect to="/onboarding" />
        ) : (
          <Redirect to="/profile" />
        )}
      </ProtectedRoute>
    </IonRouterOutlet>
  );
};

export default AppRoutes;