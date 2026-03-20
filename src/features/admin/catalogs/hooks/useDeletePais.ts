import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as paisesApi from "../data/paises.api";

export function useDeletePais() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await paisesApi.deletePais(id);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude eliminar el país"));
      }

      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.paises.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.paises.lookup(),
      });
    },
  });
}