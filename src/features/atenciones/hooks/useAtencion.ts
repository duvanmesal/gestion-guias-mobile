import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";

export function useAtencion(id: number | undefined) {
  return useQuery({
    queryKey: id ? atencionesKeys.detail(id) : ["atenciones", "detail", "none"],
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async ({ signal }) => {
      const res = await atencionesApi.getAtencionById(id as number, signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar la atención")
        );
      }
      return res.data;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
