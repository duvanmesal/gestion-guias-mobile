import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as paisesApi from "../data/paises.api";
import type { ListPaisesParams } from "../types/catalogs.types";

export function usePaisesList(params: ListPaisesParams) {
  return useQuery({
    queryKey: catalogsKeys.paises.list(params),
    queryFn: async ({ signal }) => {
      const res = await paisesApi.getPaises(params, signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar los países")
        );
      }

      return {
        items: res.data ?? [],
        meta: res.meta,
      };
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}