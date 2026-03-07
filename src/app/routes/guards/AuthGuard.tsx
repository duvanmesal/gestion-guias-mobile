import React from "react";
import { Redirect, Route, type RouteProps, type RouteComponentProps } from "react-router-dom";
import { useSessionStore } from "../../../core/auth/sessionStore";
import LoadingScreen from "../../../ui/components/LoadingScreen";

type AuthGuardProps = RouteProps & {
  children: React.ReactNode;
};

const AuthGuard = ({ children, ...rest }: AuthGuardProps) => {
  const status = useSessionStore((s) => s.status);

  if (status === "loading") return <LoadingScreen />;

  return (
    <Route
      {...rest}
      render={({ location }: RouteComponentProps) =>
        status === "authed" ? (
          <>{children}</>
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: location } }} />
        )
      }
    />
  );
};

export default AuthGuard;