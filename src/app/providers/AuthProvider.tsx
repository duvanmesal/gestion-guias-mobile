import React, { useEffect } from "react";
import { useSessionStore } from "../../core/auth/sessionStore";
import { tokenService } from "../../core/auth/tokenService";
import { refreshAccessToken } from "../../core/http/refresh";
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
          if (!cancelled) useSessionStore.getState().setGuest();
          return;
        }

        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          await tokenService.clearRefreshToken();
          useSessionStore.getState().hardLogout();

          if (!cancelled) {
            useSessionStore.getState().setGuest();
          }
          return;
        }

        const meRes = await userApi.getMe();

        if (!meRes.ok) {
          await tokenService.clearRefreshToken();
          useSessionStore.getState().hardLogout();

          if (!cancelled) {
            useSessionStore.getState().setGuest();
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
        await tokenService.clearRefreshToken();
        useSessionStore.getState().hardLogout();

        if (!cancelled) {
          useSessionStore.getState().setGuest();
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