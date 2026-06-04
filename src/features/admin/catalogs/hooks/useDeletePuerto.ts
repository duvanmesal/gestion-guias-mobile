import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as puertosApi from "../data/puertos.api";

export function useDeletePuerto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await puertosApi.deletePuerto(id);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude desactivar el puerto")
        );
      }

      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.puertos.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.puertos.lookup(),
      });
    },
  });
}
