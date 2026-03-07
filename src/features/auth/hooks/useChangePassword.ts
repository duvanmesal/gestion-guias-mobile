import { useMutation } from "@tanstack/react-query";
import * as authApi from "../data/auth.api";
import { getErrorMessage } from "../../../core/http/getErrorMessage";

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordInput>({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cambiar la contraseña")
        );
      }
    },
  });
}