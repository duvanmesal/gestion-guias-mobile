import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import * as adminUsersApi from "../data/adminUsers.api";
import { adminUsersKeys } from "../data/adminUsers.keys";
import type { ListAdminUsersParams } from "../types/adminUsers.types";

export function useAdminUsersList(params: ListAdminUsersParams) {
  return useQuery({
    queryKey: adminUsersKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await adminUsersApi.getAdminUsers(params, signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar la gestión de usuarios")
        );
      }

      return {
        items: res.data ?? [],
        meta: res.meta,
      };
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}