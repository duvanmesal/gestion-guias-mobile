import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as recaladasApi from "../data/recaladas.api";
import { recaladasKeys } from "../data/recaladas.keys";

export function useRecaladaAtenciones(id: number | undefined) {
  return useQuery({
    queryKey: recaladasKeys.atenciones(id!),
    queryFn: async ({ signal }) => {
      const res = await recaladasApi.getRecaladaAtenciones(id!, signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar las atenciones")
        );
      }
      return res.data ?? [];
    },
    enabled: typeof id === "number",
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });
}
