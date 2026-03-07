import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../data/users.api";
import * as userApi from "../data/users.api";
import { mapUserMeToSessionUser } from "../data/users.mappers";
import { usersKeys } from "../data/users.keys";
import { useSessionStore } from "../../../core/auth/sessionStore";
import type { UpdateProfileRequest } from "../types/users.types";
import type { ProfileStatus } from "../../../core/auth/types";

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation<{ profileStatus: ProfileStatus }, Error, UpdateProfileRequest>({
    mutationFn: async (data) => {
      const res = await usersApi.updateProfile(data);
      if (!res.ok) throw new Error(res.error.message || "Update failed");

      const meRes = await userApi.getMe();
      if (meRes.ok) {
        const user = mapUserMeToSessionUser(meRes.data);
        const token = useSessionStore.getState().accessToken ?? "";
        useSessionStore.getState().setAuthedSession({ user, accessToken: token });
        return { profileStatus: user.profileStatus };
      }

      return { profileStatus: res.data.profileStatus };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.me() });
    },
  });
}