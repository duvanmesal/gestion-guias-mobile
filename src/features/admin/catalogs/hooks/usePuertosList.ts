import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as puertosApi from "../data/puertos.api";
import type { ListPuertosParams } from "../types/catalogs.types";

export function usePuertosList(params: ListPuertosParams) {
  return useQuery({
    queryKey: catalogsKeys.puertos.list(params),
    queryFn: async ({ signal }) => {
      const res = await puertosApi.getPuertos(params, signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar los puertos")
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
