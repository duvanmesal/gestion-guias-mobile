import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as muellesApi from "../data/muelles.api";

export function useDeleteMuelle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await muellesApi.deleteMuelle(id);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude desactivar el muelle")
        );
      }

      return id;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.muelles.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.muelles.lookup(),
      });
    },
  });
}
