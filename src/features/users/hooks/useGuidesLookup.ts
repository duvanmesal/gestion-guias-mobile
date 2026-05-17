import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "../../../core/auth/sessionStore";
import * as usersApi from "../data/users.api";
import { usersKeys } from "../data/users.keys";
import type { GuideLookupItem } from "../types/users.types";

export function useGuidesLookup() {
  const role = useSessionStore((s) => s.user?.role);
  const enabled = role === "SUPERVISOR" || role === "SUPER_ADMIN";

  return useQuery<GuideLookupItem[], Error>({
    queryKey: usersKeys.guidesLookup(),
    queryFn: async () => {
      const res = await usersApi.getGuides({
        activo: true,
        disponible: true,
        penalizado: false,
      });
      if (!res.ok) throw new Error(res.error.message || "Guides lookup failed");
      return res.data;
    },
    enabled,
  });
}
