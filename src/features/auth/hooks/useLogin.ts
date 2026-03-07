import { useMutation } from "@tanstack/react-query";
import * as authApi from "../data/auth.api";
import * as userApi from "../../users/data/users.api";
import { mapUserMeToSessionUser } from "../../users/data/users.mappers";
import { tokenService } from "../../../core/auth/tokenService";
import { useSessionStore } from "../../../core/auth/sessionStore";
import type { ProfileStatus } from "../../../core/auth/types";
import { getErrorMessage } from "../../../core/http/getErrorMessage";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  profileStatus: ProfileStatus;
  emailVerified: boolean;
}

export function useLogin() {
  return useMutation<LoginResult, Error, LoginInput>({
    mutationFn: async ({ email, password }) => {
      const deviceId = await tokenService.getDeviceId();

      const loginRes = await authApi.login({ email, password, deviceId });
      if (!loginRes.ok) {
        throw new Error(getErrorMessage(loginRes.error, "Login falló"));
      }

      const { accessToken, refreshToken } = loginRes.data.tokens;

      await tokenService.setRefreshToken(refreshToken);
      useSessionStore.getState().setAccessToken(accessToken);

      const meRes = await userApi.getMe();
      if (!meRes.ok) {
        await tokenService.clearRefreshToken();
        useSessionStore.getState().hardLogout();
        throw new Error(getErrorMessage(meRes.error, "No pude cargar los datos del usuario"));
      }

      const user = mapUserMeToSessionUser(meRes.data);

      useSessionStore.getState().setAuthedSession({
        user,
        accessToken,
      });

      return {
        profileStatus: user.profileStatus,
        emailVerified: !!user.emailVerifiedAt,
      };
    },
  });
}