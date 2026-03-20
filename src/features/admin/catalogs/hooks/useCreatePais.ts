import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as paisesApi from "../data/paises.api";
import type { UpsertPaisPayload } from "../types/catalogs.types";

export function useCreatePais() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertPaisPayload) => {
      const res = await paisesApi.createPais(payload);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude crear el país"));
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