import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as recaladasApi from "../data/recaladas.api";
import { recaladasKeys } from "../data/recaladas.keys";
import type { UpdateRecaladaPayload } from "../types/recaladas.types";

export function useUpdateRecalada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateRecaladaPayload;
    }) => {
      const res = await recaladasApi.updateRecalada(id, payload);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude actualizar la recalada")
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
