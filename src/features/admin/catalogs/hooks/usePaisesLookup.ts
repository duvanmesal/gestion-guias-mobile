import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as paisesApi from "../data/paises.api";

export function usePaisesLookup() {
  return useQuery({
    queryKey: catalogsKeys.paises.lookup(),
    queryFn: async ({ signal }) => {
      const res = await paisesApi.getPaisesLookup(signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar el lookup de países")
        );
      }

      return res.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}