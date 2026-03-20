import React, { useEffect } from "react";
import { useSessionStore } from "../../core/auth/sessionStore";
import { tokenService } from "../../core/auth/tokenService";
import { refreshAccessToken } from "../../core/http/refresh";
import { expireSessionAndRedirect } from "../../core/auth/sessionLifecycle";
import { adminDebug, adminError } from "../../core/debug/adminDebug";
import * as userApi from "../../features/users/data/users.api";
import { mapUserMeToSessionUser } from "../../features/users/data/users.mappers";
import LoadingScreen from "../../ui/components/LoadingScreen";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const status = useSessionStore((s) => s.status);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      adminDebug("AuthProvider.bootstrap.start");

      useSessionStore.getState().setLoading();

      try {
        const rt = await tokenService.getRefreshToken();

        adminDebug("AuthProvider.bootstrap.refreshToken.checked", {
          hasRefreshToken: Boolean(rt),
        });

        if (!rt) {
          if (!cancelled) {
            adminDebug("AuthProvider.bootstrap.noRefreshToken.setGuest");
            useSessionStore.getState().setGuest();
          }
          return;
        }

        const newAccessToken = await refreshAccessToken();

        adminDebug("AuthProvider.bootstrap.refresh.completed", {
          hasNewAccessToken: Boolean(newAccessToken),
        });

        if (!newAccessToken) {
          if (!cancelled) {
            adminWarnExpired("AuthProvider.bootstrap.refresh.failed.expireSession");
            await expireSessionAndRedirect();
          }
          return;
        }

        const meRes = await userApi.getMe();

        adminDebug("AuthProvider.bootstrap.me.response", {
          ok: meRes.ok,
          errorStatus: !meRes.ok ? meRes.error.status : null,
          errorCode: !meRes.ok ? meRes.error.code : null,
        });

        if (!meRes.ok) {
          if (!cancelled) {
            adminWarnExpired("AuthProvider.bootstrap.me.failed.expireSession");
            await expireSessionAndRedirect();
          }
          return;
        }

        if (cancelled) {
          adminDebug("AuthProvider.bootstrap.cancelled.beforeSetAuthed");
          return;
        }

        const user = mapUserMeToSessionUser(meRes.data);

        adminDebug("AuthProvider.bootstrap.user.mapped", {
          id: user.id,
          role: user.role,
          profileStatus: user.profileStatus,
          emailVerifiedAt: user.emailVerifiedAt ?? null,
        });

        useSessionStore.getState().setAuthedSession({
          user,
          accessToken: newAccessToken,
        });
      } catch (error) {
        adminError("AuthProvider.bootstrap.catch", {
          message: error instanceof Error ? error.message : "Unknown error",
        });

        if (!cancelled) {
          await expireSessionAndRedirect();
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
      adminDebug("AuthProvider.bootstrap.cleanup");
    };
  }, []);

  useEffect(() => {
    adminDebug("AuthProvider.status.changed", { status });
  }, [status]);

  if (status === "loading") return <LoadingScreen />;
  return <>{children}</>;
};

function adminWarnExpired(scope: string) {
  adminDebug(scope);
}

export default AuthProvider;