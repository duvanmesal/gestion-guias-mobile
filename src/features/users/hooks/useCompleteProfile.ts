import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../data/users.api";
import { usersKeys } from "../data/users.keys";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import type {
  CompleteProfileRequest,
  CompleteProfileResponse,
} from "../types/users.types";

export function useCompleteProfile() {
  const qc = useQueryClient();

  return useMutation<CompleteProfileResponse, Error, CompleteProfileRequest>({
    mutationFn: async (data) => {
      const res = await usersApi.completeProfile(data);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude completar tu perfil")
        );
      }

      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.me() });
    },
  });
}
