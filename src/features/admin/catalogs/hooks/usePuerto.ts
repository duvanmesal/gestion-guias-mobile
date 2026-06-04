import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as puertosApi from "../data/puertos.api";

export function usePuerto(id?: number) {
  return useQuery({
    queryKey: catalogsKeys.puertos.detail(id ?? 0),
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async ({ signal }) => {
      const res = await puertosApi.getPuertoById(id as number, signal);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar el puerto"));
      }

      return res.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
