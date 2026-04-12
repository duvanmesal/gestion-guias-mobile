import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";

export function useAtencionSummary(id: number | undefined) {
  return useQuery({
    queryKey: id
      ? atencionesKeys.summary(id)
      : ["atenciones", "summary", "none"],
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async ({ signal }) => {
      const res = await atencionesApi.getAtencionSummary(id as number, signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar el resumen")
        );
      }
      return res.data;
    },
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}
