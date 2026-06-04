import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as puertosApi from "../data/puertos.api";

export function usePuertosLookup() {
  return useQuery({
    queryKey: catalogsKeys.puertos.lookup(),
    queryFn: async ({ signal }) => {
      const res = await puertosApi.getPuertosLookup(signal);

      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar el lookup de puertos")
        );
      }

      return res.data ?? [];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
