import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import * as adminUsersApi from "../data/adminUsers.api";
import { adminUsersKeys } from "../data/adminUsers.keys";
import type { UpdateAdminUserPayload } from "../types/adminUsers.types";

interface UpdateAdminUserVariables {
  id: string;
  payload: UpdateAdminUserPayload;
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateAdminUserVariables) => {
      const res = await adminUsersApi.updateAdminUser(id, payload);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude actualizar el usuario")
        );
      }

      return res.data;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.detail(variables.id),
      });
    },
  });
}