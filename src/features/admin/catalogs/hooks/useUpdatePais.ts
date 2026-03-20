import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as paisesApi from "../data/paises.api";
import type { UpsertPaisPayload } from "../types/catalogs.types";

interface UpdatePaisInput {
  id: number;
  payload: Partial<UpsertPaisPayload>;
}

export function useUpdatePais() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdatePaisInput) => {
      const res = await paisesApi.updatePais(id, payload);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude actualizar el país")
        );
      }

      return res.data;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.paises.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.paises.lookup(),
      });
      await queryClient.invalidateQueries({
        queryKey: catalogsKeys.paises.detail(data.id),
      });
    },
  });
}