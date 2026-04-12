import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as recaladasApi from "../data/recaladas.api";
import { recaladasKeys } from "../data/recaladas.keys";

export function useRecalada(id: number | undefined) {
  return useQuery({
    queryKey: recaladasKeys.detail(id!),
    queryFn: async ({ signal }) => {
      const res = await recaladasApi.getRecaladaById(id!, signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar la recalada")
        );
      }
      return res.data;
    },
    enabled: typeof id === "number",
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
