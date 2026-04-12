import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as buquesApi from "../data/buques.api";

export function useBuquesLookup() {
  return useQuery({
    queryKey: catalogsKeys.buques.lookup(),
    queryFn: async ({ signal }) => {
      const res = await buquesApi.getBuquesLookup(signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar el lookup de buques")
        );
      }

      return res.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
