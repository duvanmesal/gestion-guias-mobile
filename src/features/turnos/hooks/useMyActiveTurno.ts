import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../../../core/http/getErrorMessage";
import * as turnosApi from "../data/turnos.api";
import { turnosKeys } from "../data/turnos.keys";

export function useMyActiveTurno(enabled = true) {
  return useQuery({
    queryKey: turnosKeys.meActive(),
    enabled,
    queryFn: async ({ signal }) => {
      const res = await turnosApi.getMyActiveTurno(signal);
      if (!res.ok) {
        throw new Error(
          getErrorMessage(res.error, "No pude cargar tu turno activo")
        );
      }
      return res.data ?? null;
    },
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}
