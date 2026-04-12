import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as recaladasApi from "../data/recaladas.api";
import { recaladasKeys } from "../data/recaladas.keys";

export function useDeleteRecalada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await recaladasApi.deleteRecalada(id);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude eliminar la recalada")
        );
      }
      return id;
    },
    onSuccess: async (id) => {
      queryClient.removeQueries({ queryKey: recaladasKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: recaladasKeys.lists() });
    },
  });
}
