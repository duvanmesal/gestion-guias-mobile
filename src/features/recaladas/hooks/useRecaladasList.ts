import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as recaladasApi from "../data/recaladas.api";
import { recaladasKeys } from "../data/recaladas.keys";
import type { ListRecaladasParams } from "../types/recaladas.types";

export function useRecaladasList(params: ListRecaladasParams) {
  return useQuery({
    queryKey: recaladasKeys.list(params),
    queryFn: async ({ signal }) => {
      const res = await recaladasApi.getRecaladas(params, signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar las recaladas")
        );
      }
      return { items: res.data ?? [], meta: res.meta };
    },
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}
