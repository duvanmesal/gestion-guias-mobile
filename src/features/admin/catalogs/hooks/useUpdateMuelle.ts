import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as muellesApi from "../data/muelles.api";
import type { UpsertMuellePayload } from "../types/catalogs.types";

interface UpdateMuelleInput {
  id: number;
  payload: Partial<UpsertMuellePayload>;
}

export function useUpdateMuelle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateMuelleInput) => {
      const res = await muellesApi.updateMuelle(id, payload);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude actualizar el muelle")
        );
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
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.muelles.detail(data.id),
      });
    },
  });
}
