import React, { useEffect } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import {
  adminDebug,
  adminWarn,
  describeSession,
} from "../../../core/debug/adminDebug";
import LoadingScreen from "../../../ui/components/LoadingScreen";
import { getAccessRedirect } from "../access";

interface AppReadyGuardProps {
  children: React.ReactNode;
}

const AppReadyGuard: React.FC<AppReadyGuardProps> = ({ children }) => {
  const status = useSessionStore((s) => s.status);
  const user = useSessionStore((s) => s.user);
  const location = useLocation();

  useEffect(() => {
    adminDebug("AppReadyGuard.check", {
      pathname: location.pathname,
      ...describeSession({ status, user }),
    });
  }, [location.pathname, status, user]);

  if (status === "loading") {
    adminWarn("AppReadyGuard.loading", {
      pathname: location.pathname,
      ...describeSession({ status, user }),
    });

    return <LoadingScreen message="Validando acceso al módulo..." />;
  }

  const redirectTo = getAccessRedirect("/internal", { status, user });

  if (redirectTo) {
    adminWarn("AppReadyGuard.redirect", {
      pathname: location.pathname,
      redirectTo,
      ...describeSession({ status, user }),
    });

    return <Redirect to={redirectTo} />;
  }

  adminDebug("AppReadyGuard.allow", {
    pathname: location.pathname,
    ...describeSession({ status, user }),
  });

  return <>{children}</>;
};

export default AppReadyGuard;