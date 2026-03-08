import React from "react";
import { Redirect } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import type { Role } from "../../../core/auth/types";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { canAccessRole, resolveAppEntry } from "../access";

interface RoleGuardProps {
  allowed: Role[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowed, children }) => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);

  if (status === "loading") return <LoadingScreen />;

  const snapshot = { status, user };

  if (!canAccessRole(snapshot, allowed)) {
    return <Redirect to={resolveAppEntry(snapshot)} />;
  }

  return <>{children}</>;
};

export default RoleGuard;