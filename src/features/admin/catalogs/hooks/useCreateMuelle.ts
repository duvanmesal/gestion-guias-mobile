import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as muellesApi from "../data/muelles.api";
import type { UpsertMuellePayload } from "../types/catalogs.types";

export function useCreateMuelle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertMuellePayload) => {
      const res = await muellesApi.createMuelle(payload);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude crear el muelle"));
      }

      return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.muelles.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.muelles.lookup(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.muelles.lookup(data.puertoId),
      });
    },
  });
}
