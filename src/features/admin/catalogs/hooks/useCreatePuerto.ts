import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as puertosApi from "../data/puertos.api";
import type { UpsertPuertoPayload } from "../types/catalogs.types";

export function useCreatePuerto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertPuertoPayload) => {
      const res = await puertosApi.createPuerto(payload);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude crear el puerto"));
      }

      return res.data;
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
