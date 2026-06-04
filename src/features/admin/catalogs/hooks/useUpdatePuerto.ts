import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as puertosApi from "../data/puertos.api";
import type { UpsertPuertoPayload } from "../types/catalogs.types";

interface UpdatePuertoInput {
  id: number;
  payload: Partial<UpsertPuertoPayload>;
}

export function useUpdatePuerto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdatePuertoInput) => {
      const res = await puertosApi.updatePuerto(id, payload);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude actualizar el puerto")
        );
      }

      return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.puertos.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.puertos.lookup(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.puertos.detail(data.id),
      });
    },
  });
}
