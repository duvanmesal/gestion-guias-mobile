import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as recaladasApi from "../data/recaladas.api";
import { recaladasKeys } from "../data/recaladas.keys";
import type { CreateRecaladaPayload } from "../types/recaladas.types";

export function useCreateRecalada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRecaladaPayload) => {
      const res = await recaladasApi.createRecalada(payload);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude crear la recalada")
        );
      }
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: recaladasKeys.lists(),
      });
    },
  });
}
