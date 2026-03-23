import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import * as adminUsersApi from "../data/adminUsers.api";
import { adminUsersKeys } from "../data/adminUsers.keys";

export function useAdminUser(id?: string) {
  return useQuery({
    queryKey: adminUsersKeys.detail(id ?? "pending"),
    enabled: Boolean(id),
    queryFn: async ({ signal }) => {
      const res = await adminUsersApi.getAdminUserById(id!, signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar el detalle del usuario")
        );
      }

      return res.data;
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}