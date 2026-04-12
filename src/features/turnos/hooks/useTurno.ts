import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as turnosApi from "../data/turnos.api";
import { turnosKeys } from "../data/turnos.keys";

export function useTurno(id: number | undefined) {
  return useQuery({
    queryKey: id ? turnosKeys.detail(id) : ["turnos", "detail", "none"],
    enabled: typeof id === "number" && Number.isFinite(id),
    queryFn: async ({ signal }) => {
      const res = await turnosApi.getTurnoById(id as number, signal);
      if (!res.ok) {
        throw new Error(getErrorMessage(res.error, "No pude cargar el turno"));
      }
      return res.data;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
