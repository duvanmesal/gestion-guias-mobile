import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as recaladasApi from "../data/recaladas.api";
import { recaladasKeys } from "../data/recaladas.keys";

export function useCancelRecalada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: number;
      reason?: string;
    }) => {
      const res = await recaladasApi.cancelRecalada(id, { reason });
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cancelar la recalada")
        );
      }
      return res.data;
    },
    onSuccess: async (data) => {
      if (data) {
        queryClient.setQueryData(recaladasKeys.detail(data.id), data);
      }
      await queryClient.invalidateQueries({ queryKey: recaladasKeys.lists() });
    },
  });
}
