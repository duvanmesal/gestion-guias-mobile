import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as buquesApi from "../data/buques.api";

export function useBuque(id?: number) {
  return useQuery({
    queryKey: catalogsKeys.buques.detail(id ?? 0),
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async ({ signal }) => {
      const res = await buquesApi.getBuqueById(id as number, signal);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar el buque"));
      }

      return res.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}