import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as paisesApi from "../data/paises.api";

export function usePais(id?: number) {
  return useQuery({
    queryKey: catalogsKeys.paises.detail(id ?? 0),
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async ({ signal }) => {
      const res = await paisesApi.getPaisById(id as number, signal);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar el país"));
      }

      return res.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}