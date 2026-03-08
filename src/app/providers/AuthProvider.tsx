import React, { useEffect } from "react";
import { useSessionStore } from "../../core/auth/sessionStore";
import { tokenService } from "../../core/auth/tokenService";
import { refreshAccessToken } from "../../core/http/refresh";
import { expireSessionAndRedirect } from "../../core/auth/sessionLifecycle";
import * as userApi from "../../features/users/data/users.api";
import { mapUserMeToSessionUser } from "../../features/users/data/users.mappers";
import LoadingScreen from "../../ui/components/LoadingScreen";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const status = useSessionStore((s) => s.status);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      useSessionStore.getState().setLoading();

      try {
        const rt = await tokenService.getRefreshToken();

        if (!rt) {
          if (!cancelled) {
            useSessionStore.getState().setGuest();
          }
          return;
        }

        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          if (!cancelled) {
            await expireSessionAndRedirect();
          }
          return;
        }

        const meRes = await userApi.getMe();

        if (!meRes.ok) {
          if (!cancelled) {
            await expireSessionAndRedirect();
          }
          return;
        }

        if (cancelled) return;

        const user = mapUserMeToSessionUser(meRes.data);

        useSessionStore.getState().setAuthedSession({
          user,
          accessToken: newAccessToken,
        });
      } catch {
        if (!cancelled) {
          await expireSessionAndRedirect();
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") return <LoadingScreen />;
  return <>{children}</>;
};

export default AuthProvider;