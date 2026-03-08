import React from "react";
import { Redirect } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { getAccessRedirect } from "../access";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);

  if (status === "loading") return <LoadingScreen />;

  const redirectTo = getAccessRedirect("/onboarding", { status, user });

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
};

export default OnboardingGuard;