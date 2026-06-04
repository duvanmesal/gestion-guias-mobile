import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as muellesApi from "../data/muelles.api";

export function useMuellesLookup(puertoId?: number) {
  return useQuery({
    queryKey: catalogsKeys.muelles.lookup(puertoId),
    queryFn: async ({ signal }) => {
      const res = await muellesApi.getMuellesLookup(puertoId, signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar el lookup de muelles")
        );
      }

      return res.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
