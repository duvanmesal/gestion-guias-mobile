import { useCallback } from "react";
import { useSessionStore } from "../../../core/auth/sessionStore";
import * as authApi from "../../auth/data/auth.api";
import { mapMeToSessionUser } from "../../auth/data/auth.mappers";

export function useMe() {
  const user = useSessionStore((s) => s.user);
  const accessToken = useSessionStore((s) => s.accessToken);

  const refetchMe = useCallback(async () => {
    const res = await authApi.me();
    if (res.ok) {
      const mapped = mapMeToSessionUser(res.data);
      useSessionStore.getState().setAuthedSession({
        user: mapped,
        accessToken: accessToken ?? "",
      });
      return mapped;
    }
    return null;
  }, [accessToken]);

  return { user, refetchMe };
}
