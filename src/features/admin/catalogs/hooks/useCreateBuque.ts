import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as buquesApi from "../data/buques.api";
import type { UpsertBuquePayload } from "../types/catalogs.types";

export function useCreateBuque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertBuquePayload) => {
      const res = await buquesApi.createBuque(payload);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude crear el buque"));
      }

      return res.data;
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