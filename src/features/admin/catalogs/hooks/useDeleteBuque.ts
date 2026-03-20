import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as buquesApi from "../data/buques.api";

export function useDeleteBuque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await buquesApi.deleteBuque(id);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude desactivar el buque")
        );
      }

      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.buques.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.buques.lookup(),
      });
    },
  });
}