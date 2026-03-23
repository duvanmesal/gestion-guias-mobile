import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import * as adminUsersApi from "../data/adminUsers.api";
import { adminUsersKeys } from "../data/adminUsers.keys";

export function useDeactivateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await adminUsersApi.deactivateAdminUser(id);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude desactivar el usuario")
        );
      }

      return true;
    },
    onSuccess: async (_, id) => {
      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(id),
      });
    },
  });
}