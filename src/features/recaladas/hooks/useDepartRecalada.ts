import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as recaladasApi from "../data/recaladas.api";
import { recaladasKeys } from "../data/recaladas.keys";

export function useDepartRecalada() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      departedAt,
    }: {
      id: number;
      departedAt?: string;
    }) => {
      const res = await recaladasApi.departRecalada(id, { departedAt });
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude registrar la salida")
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
