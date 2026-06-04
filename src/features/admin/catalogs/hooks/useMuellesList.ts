import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as muellesApi from "../data/muelles.api";
import type { ListMuellesParams } from "../types/catalogs.types";

export function useMuellesList(params: ListMuellesParams) {
  return useQuery({
    queryKey: catalogsKeys.muelles.list(params),
    queryFn: async ({ signal }) => {
      const res = await muellesApi.getMuelles(params, signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar los muelles")
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
