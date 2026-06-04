import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../../core/http/getErrorMessage";
import { catalogsKeys } from "../data/catalogs.keys";
import * as muellesApi from "../data/muelles.api";

export function useMuelle(id?: number) {
  return useQuery({
    queryKey: catalogsKeys.muelles.detail(id ?? 0),
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async ({ signal }) => {
      const res = await muellesApi.getMuelleById(id as number, signal);

      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar el muelle"));
      }

      return res.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
