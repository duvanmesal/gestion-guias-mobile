import React, { useEffect } from "react";
import { Redirect, Route, useLocation } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import { useSessionStore } from "../../core/auth/sessionStore";
import { adminDebug, describeSession } from "../../core/debug/adminDebug";

import LoginPage from "../../features/auth/pages/LoginPage";
import VerifyEmailPage from "../../features/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import OnboardingPage from "../../features/users/pages/OnboardingPage";
import EditProfilePage from "../../features/users/pages/EditProfilePage";

import GuestOnlyGuard from "./guards/GuestOnlyGuard";
import VerifyEmailGuard from "./guards/VerifyEmailGuard";
import OnboardingGuard from "./guards/OnboardingGuard";
import AppReadyGuard from "./guards/AppReadyGuard";
import { resolveAppEntry } from "./access";
import AppTabsShell from "../navigation/AppTabsShell";

const AppRoutes: React.FC = () => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);
  const location = useLocation();

  const entry = resolveAppEntry({ status, user });

  useEffect(() => {
    adminDebug("AppRoutes.render", {
      pathname: location.pathname,
      entry,
      ...describeSession({ status, user }),
    });
  }, [entry, location.pathname, status, user]);

  return (
    <IonRouterOutlet>
      <Route path="/login" exact>
        <GuestOnlyGuard>
          <LoginPage />
        </GuestOnlyGuard>
      </Route>

      <Route path="/forgot-password" exact>
        <GuestOnlyGuard>
          <ForgotPasswordPage />
        </GuestOnlyGuard>
      </Route>

      <Route path="/reset-password" exact>
        <GuestOnlyGuard>
          <ResetPasswordPage />
        </GuestOnlyGuard>
      </Route>

      <Route path="/verify-email" exact>
        <VerifyEmailGuard>
          <VerifyEmailPage />
        </VerifyEmailGuard>
      </Route>

      <Route path="/onboarding" exact>
        <OnboardingGuard>
          <OnboardingPage />
        </OnboardingGuard>
      </Route>

      <Route path="/profile/edit" exact>
        <AppReadyGuard>
          <EditProfilePage />
        </AppReadyGuard>
      </Route>

      <Route
        path={[
          "/home",
          "/turnos",
          "/atenciones",
          "/recaladas",
          "/profile",
          "/admin",
        ]}
      >
        <AppReadyGuard>
          <AppTabsShell />
        </AppReadyGuard>
      </Route>

      <Route path="/" exact>
        <Redirect to={entry} />
      </Route>

      <Route>
        <Redirect to={entry} />
      </Route>
    </IonRouterOutlet>
  );
};

export default AppRoutes;