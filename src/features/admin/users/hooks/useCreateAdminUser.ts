import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import * as adminUsersApi from "../data/adminUsers.api";
import { adminUsersKeys } from "../data/adminUsers.keys";
import type { CreateAdminUserPayload } from "../types/adminUsers.types";

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAdminUserPayload) => {
      const res = await adminUsersApi.createAdminUser(payload);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude crear el usuario")
        );
      }

      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminUsersKeys.lists(),
      });
    },
  });
}