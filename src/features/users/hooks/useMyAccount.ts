import { useQuery } from "@tanstack/react-query";
import { usersKeys } from "../data/users.keys";
import * as usersApi from "../data/users.api";
import { mapUserMeToSessionUser } from "../data/users.mappers";
import { useSessionStore } from "../../../core/auth/sessionStore";
import { getErrorMessage } from "../../../core/http/getErrorMessage";

export function useMyAccount() {
  return useQuery({
    queryKey: usersKeys.me(),
    queryFn: async () => {
      const res = await usersApi.getMe();

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar tu cuenta"));
      }

      const user = mapUserMeToSessionUser(res.data);
      const accessToken = useSessionStore.getState().accessToken ?? "";

      useSessionStore.getState().setAuthedSession({
        user,
        accessToken,
      });

      return user;
    },
    staleTime: 60_000,
  });
}