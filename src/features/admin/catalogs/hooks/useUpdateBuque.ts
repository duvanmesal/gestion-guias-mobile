import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as buquesApi from "../data/buques.api";
import type { UpsertBuquePayload } from "../types/catalogs.types";

interface UpdateBuqueInput {
  id: number;
  payload: Partial<UpsertBuquePayload>;
}

export function useUpdateBuque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateBuqueInput) => {
      const res = await buquesApi.updateBuque(id, payload);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude actualizar el buque")
        );
      }

      return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.buques.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.buques.lookup(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.buques.detail(data.id),
      });
    },
  });
}