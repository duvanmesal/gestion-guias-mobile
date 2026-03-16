import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonRouterOutlet } from "@ionic/react";
import { useSessionStore } from "../../core/auth/sessionStore";

import LoginPage from "../../features/auth/pages/LoginPage";
import VerifyEmailPage from "../../features/auth/pages/VerifyEmailPage";
import OnboardingPage from "../../features/users/pages/OnboardingPage";
import ProfilePage from "../../features/users/pages/ProfilePage";
import EditProfilePage from "../../features/users/pages/EditProfilePage";
import HomePage from "../../features/dashboard/pages/HomePage";
import ModulePlaceholderPage from "../../features/dashboard/pages/ModulePlaceholderPage";

import GuestOnlyGuard from "./guards/GuestOnlyGuard";
import VerifyEmailGuard from "./guards/VerifyEmailGuard";
import OnboardingGuard from "./guards/OnboardingGuard";
import AppReadyGuard from "./guards/AppReadyGuard";
import { resolveAppEntry } from "./access";

const AppRoutes: React.FC = () => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);

  const entry = resolveAppEntry({ status, user });

  return (
    <IonRouterOutlet>
      <Route path="/login" exact>
        <GuestOnlyGuard>
          <LoginPage />
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

      <Route path="/home" exact>
        <AppReadyGuard>
          <HomePage />
        </AppReadyGuard>
      </Route>

      <Route path="/profile" exact>
        <AppReadyGuard>
          <ProfilePage />
        </AppReadyGuard>
      </Route>

      <Route path="/profile/edit" exact>
        <AppReadyGuard>
          <EditProfilePage />
        </AppReadyGuard>
      </Route>

      <Route path="/turnos" exact>
        <AppReadyGuard>
          <ModulePlaceholderPage
            title="Turnos"
            description="Aquí puedes conectar el listado real de turnos, detalle, check-in y check-out sin romper la navegación desde el dashboard."
          />
        </AppReadyGuard>
      </Route>

      <Route path="/atenciones" exact>
        <AppReadyGuard>
          <ModulePlaceholderPage
            title="Atenciones"
            description="Esta ruta queda sembrada para enlazar la toma de turnos disponibles y el resumen operativo de atenciones."
          />
        </AppReadyGuard>
      </Route>

      <Route path="/recaladas" exact>
        <AppReadyGuard>
          <ModulePlaceholderPage
            title="Recaladas"
            description="Este espacio te deja anclar la agenda madre de recaladas y sus próximos hitos sin dejar huecos en la experiencia."
          />
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
