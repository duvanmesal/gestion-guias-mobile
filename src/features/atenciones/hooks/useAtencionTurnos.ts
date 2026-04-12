import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as atencionesApi from "../data/atenciones.api";
import { atencionesKeys } from "../data/atenciones.keys";

export function useAtencionTurnos(id: number | undefined) {
  return useQuery({
    queryKey: id ? atencionesKeys.turnos(id) : ["atenciones", "turnos", "none"],
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async ({ signal }) => {
      const res = await atencionesApi.getAtencionTurnos(id as number, signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar los turnos")
        );
      }
      return res.data ?? [];
    },
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}
