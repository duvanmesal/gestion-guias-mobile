import React, { useEffect } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import type { Role } from "../../../core/auth/types";
import {
  adminDebug,
  adminWarn,
  describeRoleCheck,
} from "../../../core/debug/adminDebug";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { canAccessRole, resolveAppEntry } from "../access";

interface RoleGuardProps {
  allowed: Role[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowed, children }) => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);
  const location = useLocation();

  useEffect(() => {
    adminDebug("RoleGuard.check", {
      pathname: location.pathname,
      allowed,
      status,
      userRole: user?.role ?? null,
      profileStatus: user?.profileStatus ?? null,
      emailVerifiedAt: user?.emailVerifiedAt ?? null,
    });
  }, [allowed, location.pathname, status, user]);

  if (status === "loading") {
    adminWarn("RoleGuard.loading", {
      pathname: location.pathname,
      allowed,
      status,
      userRole: user?.role ?? null,
    });

    return <LoadingScreen message="Validando permisos administrativos..." />;
  }

  const snapshot = { status, user };
  const granted = canAccessRole(snapshot, allowed);

  if (!granted) {
    const redirectTo = resolveAppEntry(snapshot);

    adminWarn("RoleGuard.redirect", {
      pathname: location.pathname,
      redirectTo,
      ...describeRoleCheck(snapshot, allowed, granted),
    });

    return <Redirect to={redirectTo} />;
  }

  adminDebug("RoleGuard.allow", {
    pathname: location.pathname,
    ...describeRoleCheck(snapshot, allowed, granted),
  });

  return <>{children}</>;
};

export default RoleGuard;