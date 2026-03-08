import React from "react";
import { Redirect } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { resolveAppEntry } from "../access";

interface GuestOnlyGuardProps {
  children: React.ReactNode;
}

const GuestOnlyGuard: React.FC<GuestOnlyGuardProps> = ({ children }) => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);

  if (status === "loading") return <LoadingScreen />;

  if (status === "guest") {
    return <>{children}</>;
  }

  return <Redirect to={resolveAppEntry({ status, user })} />;
};

export default GuestOnlyGuard;