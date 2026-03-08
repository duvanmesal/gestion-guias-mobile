import React from "react";
import { Redirect } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { getAccessRedirect } from "../access";

interface VerifyEmailGuardProps {
  children: React.ReactNode;
}

const VerifyEmailGuard: React.FC<VerifyEmailGuardProps> = ({ children }) => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);

  if (status === "loading") return <LoadingScreen />;

  const redirectTo = getAccessRedirect("/verify-email", { status, user });

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  return <>{children}</>;
};

export default VerifyEmailGuard;