import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../data/users.api";
import { mapUserMeToSessionUser } from "../data/users.mappers";
import { usersKeys } from "../data/users.keys";
import { useSessionStore } from "../../../core/auth/sessionStore";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import type {
  CompleteProfileRequest,
  CompleteProfileResponse,
} from "../types/users.types";

export function useCompleteProfile() {
  const qc = useQueryClient();

  return useMutation<CompleteProfileResponse, Error, CompleteProfileRequest>({
    mutationFn: async (data) => {
      const res = await usersApi.completeProfile(data);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude completar tu perfil")
        );
      }

      const meRes = await usersApi.getMe();

      if (meRes.ok) {
        const user = mapUserMeToSessionUser(meRes.data);
        const token = useSessionStore.getState().accessToken ?? "";

        useSessionStore.getState().setAuthedSession({
          user,
          accessToken: token,
        });
      }

      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.me() });
    },
  });
}