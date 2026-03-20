import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as buquesApi from "../data/buques.api";
import type { ListBuquesParams } from "../types/catalogs.types";

export function useBuquesList(params: ListBuquesParams) {
  return useQuery({
    queryKey: catalogsKeys.buques.list(params),
    queryFn: async ({ signal }) => {
      const res = await buquesApi.getBuques(params, signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar los buques")
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