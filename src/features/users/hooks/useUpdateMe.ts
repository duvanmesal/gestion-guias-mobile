import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../data/users.api";
import { mapUserMeToSessionUser } from "../data/users.mappers";
import { usersKeys } from "../data/users.keys";
import { useSessionStore } from "../../../core/auth/sessionStore";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import type { SessionUser } from "../../../core/auth/types";
import type { UpdateMeRequest } from "../types/users.types";

export function useUpdateMe() {
  const qc = useQueryClient();

  return useMutation<SessionUser, Error, UpdateMeRequest>({
    mutationFn: async (data) => {
      const updateRes = await usersApi.updateMe(data);

      if (!updateRes.ok) {
        throw new Error(
          getErrorMessage(updateRes.error, "No pude actualizar tus datos")
        );
      }

      const meRes = await usersApi.getMe();

      if (!meRes.ok) {
        throw new Error(
          getErrorMessage(
            meRes.error,
            "Actualicé tus datos, pero no pude refrescar tu perfil"
          )
        );
      }

      const canonicalUser = mapUserMeToSessionUser(meRes.data);
      const accessToken = useSessionStore.getState().accessToken ?? "";

      useSessionStore.getState().setAuthedSession({
        user: canonicalUser,
        accessToken,
      });

      qc.setQueryData(usersKeys.me(), canonicalUser);

      return canonicalUser;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.me() });
    },
  });
}